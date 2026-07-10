"""
Gemini Decision Engine — Vertex AI Gemini 2.5 Flash with function-calling.

Architecture:
- Receives ONLY guardrail-filtered candidate routes (never raw routes).
- Uses Gemini function-calling so the output is always a fixed JSON shape.
- Falls back to the best guardrail-filtered route + generic message on failure/timeout.
"""
import json
import logging
from typing import List, Dict, Any, Optional

from app.models.schemas import FanContext, NavigationResponse, MobilityNeeds
from app.config import settings

logger = logging.getLogger(__name__)

# ── Gemini function schema ─────────────────────────────────────────────────────
# This constrains the LLM output to our NavigationResponse shape.
NAVIGATE_FUNCTION_DECLARATION = {
    "name": "submit_navigation_decision",
    "description": (
        "Submit the final navigation recommendation for the fan. "
        "All fields are required. Reasoning must be warm, clear, and fan-facing."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "route_steps": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Step-by-step navigation instructions in English. Will be translated downstream.",
            },
            "eta": {
                "type": "integer",
                "description": "Estimated walking time in minutes to reach the gate.",
            },
            "reasoning": {
                "type": "string",
                "description": (
                    "A friendly 1-2 sentence explanation of why this route was chosen, "
                    "mentioning crowd conditions if relevant. Fan-facing tone."
                ),
            },
            "alerts": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Any active alerts the fan should know about (can be empty).",
            },
        },
        "required": ["route_steps", "eta", "reasoning", "alerts"],
    },
}

# ── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are StadiumSense AI, the crowd navigation assistant for the FIFA World Cup 2026.
Your sole job is to choose the best route from the pre-filtered safe candidates and explain it clearly to the fan.

Safety constraints have ALREADY been applied. You must ONLY choose from the provided candidate routes.
Never invent routes, zones, or gates not listed.

Be warm, concise, and helpful. Prioritise lower crowd density and shorter estimated walk time.
Always call submit_navigation_decision with your answer — never respond in plain text."""


def _build_fan_prompt(context: FanContext, candidates: List[Dict[str, Any]]) -> str:
    mobility_note = (
        f"Fan has mobility needs: {context.mobility_needs.value}. All candidates are already accessibility-filtered."
        if context.mobility_needs != MobilityNeeds.NONE
        else "No special mobility requirements."
    )

    candidates_text = json.dumps(candidates, indent=2)

    return f"""
Fan Context:
- Current Zone: {context.current_zone}
- Destination Gate: {context.destination_gate}
- Ticket Category: {context.ticket_category}
- Time to Kickoff: {context.time_to_kickoff_minutes} minutes
- {mobility_note}

Safe Candidate Routes (pre-filtered, guardrails applied):
{candidates_text}

Please select the best route and call submit_navigation_decision with your recommendation.
""".strip()


def _fallback_response(candidates: List[Dict[str, Any]], context: FanContext) -> NavigationResponse:
    """Return best guardrail-filtered route with a generic message on Gemini failure."""
    if not candidates:
        return NavigationResponse(
            route_steps=["Please proceed to the nearest steward for assistance."],
            eta=10,
            reasoning="Live route guidance is temporarily unavailable. Please approach a stadium steward.",
            audio_url=None,
            alerts=["Navigation service temporarily unavailable — please seek staff assistance."],
        )

    # Pick the shortest walking-time route
    best = min(candidates, key=lambda r: r.get("estimated_walk_minutes", 99))
    steps = []
    for i, zone in enumerate(best.get("via_zones", [])):
        if i == 0:
            steps.append(f"Start from {zone}.")
        else:
            steps.append(f"Continue to {zone}.")
    steps.append(f"Arrive at {context.destination_gate}.")

    return NavigationResponse(
        route_steps=steps,
        eta=best.get("estimated_walk_minutes", 10),
        reasoning="Route selected based on availability. Please follow signs and steward directions.",
        audio_url=None,
        alerts=[],
    )


class GeminiClient:
    def __init__(self):
        self._client = None
        if not settings.USE_MOCKS:
            self._init_client()

    def _init_client(self):
        try:
            import google.genai as genai
            self._client = genai.Client(project=settings.PROJECT_ID)
        except Exception as e:
            logger.error(f"Failed to initialise Gemini client: {e}")
            self._client = None

    async def get_navigation_decision(
        self,
        context: FanContext,
        eligible_routes: List[Dict[str, Any]],
    ) -> NavigationResponse:
        """
        Ask Gemini to pick and explain the best route from the guardrail-filtered candidates.
        Falls back gracefully to the deterministic best route if Gemini is unavailable.
        """
        if settings.USE_MOCKS or self._client is None:
            logger.info("Mock mode or no Gemini client — returning mock navigation decision.")
            return self._mock_decision(context, eligible_routes)

        try:
            return await self._call_gemini(context, eligible_routes)
        except Exception as e:
            logger.warning(f"Gemini call failed ({e}), falling back to deterministic response.")
            return _fallback_response(eligible_routes, context)

    async def _call_gemini(
        self,
        context: FanContext,
        eligible_routes: List[Dict[str, Any]],
    ) -> NavigationResponse:
        """Make the actual Vertex AI call with function-calling."""
        import google.genai as genai
        import google.genai.types as genai_types

        contents = [
            genai_types.Content(
                role="user",
                parts=[genai_types.Part(text=_build_fan_prompt(context, eligible_routes))],
            )
        ]

        response = self._client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=genai_types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=[
                    genai_types.Tool(
                        function_declarations=[NAVIGATE_FUNCTION_DECLARATION]
                    )
                ],
                tool_config=genai_types.ToolConfig(
                    function_calling_config=genai_types.FunctionCallingConfig(
                        mode="ANY",
                        allowed_function_names=["submit_navigation_decision"],
                    )
                ),
                temperature=0.3,
            ),
        )

        # Extract the function call arguments
        for part in response.candidates[0].content.parts:
            if part.function_call and part.function_call.name == "submit_navigation_decision":
                args = dict(part.function_call.args)
                return NavigationResponse(
                    route_steps=list(args.get("route_steps", [])),
                    eta=int(args.get("eta", 10)),
                    reasoning=str(args.get("reasoning", "")),
                    audio_url=None,
                    alerts=list(args.get("alerts", [])),
                )

        # If Gemini didn't call the function, fall back
        logger.warning("Gemini did not return a function call — falling back.")
        return _fallback_response(eligible_routes, context)

    def _mock_decision(
        self,
        context: FanContext,
        eligible_routes: List[Dict[str, Any]],
    ) -> NavigationResponse:
        """Deterministic mock response for local dev / testing."""
        if not eligible_routes:
            return _fallback_response([], context)

        best = min(eligible_routes, key=lambda r: r.get("estimated_walk_minutes", 99))
        steps = []
        via = best.get("via_zones", [])
        for i, zone in enumerate(via):
            if i == 0:
                steps.append(f"Start at {zone} — follow the green directional signs.")
            else:
                steps.append(f"Continue through {zone}.")
        steps.append(f"You have arrived at {context.destination_gate}. Enjoy the match!")

        eta = best.get("estimated_walk_minutes", 5)
        crowd_note = (
            " Crowd levels are currently low — great time to move!"
            if eta <= 3
            else " We've selected a clear corridor to keep you moving smoothly."
        )

        return NavigationResponse(
            route_steps=steps,
            eta=eta,
            reasoning=(
                f"We recommend route {best['route_id']} via {', '.join(via)} "
                f"({eta} min walk).{crowd_note}"
            ),
            audio_url=None,
            alerts=[],
        )


gemini_client = GeminiClient()

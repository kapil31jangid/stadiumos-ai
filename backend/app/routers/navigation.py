import time
import logging
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import FanContext, NavigationResponse
from app.core.guardrails import apply_guardrails, STATIC_ROUTE_GRAPH
from app.core.gemini_client import gemini_client
from app.core.translation import translation_service
from app.core.tts import tts_service
from app.services.firestore_service import firestore_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

# ── Simple in-memory rate limiter (token bucket, per fan_id) ──────────────────
_rate_bucket: dict = defaultdict(lambda: {"tokens": 5, "last_refill": time.time()})
_RATE_LIMIT = 5        # max requests
_REFILL_SECONDS = 60   # per minute


def _check_rate_limit(fan_id: str) -> bool:
    """
    Returns True if the request is within rate limits.
    Simple token-bucket: 5 requests per 60 seconds per fan_id.
    """
    now = time.time()
    bucket = _rate_bucket[fan_id]
    elapsed = now - bucket["last_refill"]
    if elapsed >= _REFILL_SECONDS:
        bucket["tokens"] = _RATE_LIMIT
        bucket["last_refill"] = now
    if bucket["tokens"] > 0:
        bucket["tokens"] -= 1
        return True
    return False


@router.post("/navigate", response_model=NavigationResponse)
async def navigate(context: FanContext, request: Request):
    """
    Core fan navigation endpoint.

    Flow:
    1. Rate-limit check (per fan_id).
    2. Fetch live crowd snapshots from Firestore.
    3. Apply deterministic guardrails (incident exclusion, density, accessibility).
    4. Pass filtered candidates to Gemini for reasoning + natural language response.
    5. Translate route_steps and reasoning into fan's preferred_language.
    6. Generate TTS audio if mobility_needs requires it.
    """
    # 1. Rate limiting
    if not _check_rate_limit(context.fan_id):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment before trying again.",
        )

    # 2. Fetch live crowd snapshots
    try:
        zone_snapshots = await firestore_service.get_all_zone_snapshots()
    except Exception as e:
        logger.error(f"Failed to fetch crowd snapshots: {e}")
        zone_snapshots = {}

    # 3. Apply deterministic guardrails
    eligible_routes = apply_guardrails(
        context=context,
        zone_snapshots=zone_snapshots,
        all_routes=STATIC_ROUTE_GRAPH,
    )

    logger.info(
        f"fan_id={context.fan_id} zone={context.current_zone} gate={context.destination_gate} "
        f"eligible_routes={len(eligible_routes)}"
    )

    # 4. Call Gemini (or mock in dev)
    response = await gemini_client.get_navigation_decision(context, eligible_routes)

    # 5. Translate output if preferred_language is not English
    lang = context.preferred_language
    if lang and lang != "en":
        try:
            response.route_steps = await translation_service.translate_list(
                response.route_steps, lang
            )
            response.reasoning = await translation_service.translate_text(
                response.reasoning, lang
            )
            response.alerts = await translation_service.translate_list(
                response.alerts, lang
            )
        except Exception as e:
            logger.warning(f"Translation pipeline failed ({e}) — keeping English output.")

    # 6. Generate TTS audio if mobility needs require it
    try:
        spoken_text = " ".join(response.route_steps) + " " + response.reasoning
        response.audio_url = await tts_service.generate_speech(
            text=spoken_text,
            preferred_language=lang or "en",
            mobility_needs=context.mobility_needs,
        )
    except Exception as e:
        logger.warning(f"TTS generation failed ({e}) — skipping audio.")
        response.audio_url = None

    return response

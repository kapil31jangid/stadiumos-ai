from fastapi import APIRouter, HTTPException
from app.models.schemas import FanContext, NavigationResponse

router = APIRouter(prefix="/api")

@router.post("/navigate", response_model=NavigationResponse)
async def navigate(context: FanContext):
    # Dummy placeholder response for scaffolding
    return NavigationResponse(
        route_steps=[
            f"Start from your current zone: {context.current_zone}.",
            "Follow the marked safety corridor towards your gate.",
            f"Arrive at destination gate: {context.destination_gate}."
        ],
        eta=12,
        reasoning="This is a scaffolded route recommendation. Real-time reasoning will be implemented in Phase 3.",
        audio_url=None,
        alerts=[]
    )

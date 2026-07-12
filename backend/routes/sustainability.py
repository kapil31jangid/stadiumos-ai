from fastapi import APIRouter
from services.ai.operations_engine import AIOperationsEngine

router = APIRouter()

@router.get("/api/sustainability/recommendations", tags=["Sustainability"])
async def get_sustainability_recommendations():
    return await AIOperationsEngine.get_sustainability_recommendations()

@router.get("/api/venue/maintenance", tags=["Facility Management"])
async def get_maintenance_suggestions():
    return await AIOperationsEngine.get_maintenance_suggestions()

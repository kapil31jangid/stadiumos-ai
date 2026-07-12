from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from repositories.crowd_repository import CrowdRepository
from services.ai.operations_engine import AIOperationsEngine
import logging

logger = logging.getLogger("stadiumos-api")
router = APIRouter()

class RecommendationRequest(BaseModel):
    user_location: str = Field(..., min_length=2, max_length=100, description="Current location of the attendee")
    destination: str = Field(..., min_length=2, max_length=100, description="Desired destination")
    role: str | None = Field(None, description="Current user role context")

def log_api_usage(endpoint: str, details: str):
    logger.info(f"API Engagement | Endpoint: {endpoint} | Details: {details}")

@router.get("/api/metrics", tags=["Crowd Data"])
async def get_metrics(background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(log_api_usage, "/metrics", "Snapshot requested")
        zones = CrowdRepository.get_zones()
        if not zones:
            raise HTTPException(status_code=503, detail="Database service unavailable")
        
        total_density = 0
        zone_count = len(zones)
        high_density_zones = []
        
        for z in zones:
            density = z["current_density"]
            total_density += density
            if density > 0.8:
                high_density_zones.append(z["name"])
        
        avg_occupancy = total_density / zone_count if zone_count > 0 else 0
        
        return {
            "overall_occupancy": round(avg_occupancy, 2),
            "zone_count": zone_count,
            "high_density_alerts": high_density_zones,
            "status": "Critical" if avg_occupancy > 0.8 else "Normal"
        }
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        raise HTTPException(status_code=550, detail=f"Internal database operations error: {e}")

@router.post("/api/recommend", tags=["AI Assistance"])
async def get_recommendation(request: RecommendationRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(log_api_usage, "/recommend", f"Route: {request.user_location} -> {request.destination}")
    zones_list = CrowdRepository.get_zones()
    recommendation = await AIOperationsEngine.generate_route_recommendation(
        request.user_location,
        request.destination,
        request.role,
        zones_list
    )
    return recommendation

from fastapi import APIRouter
from pydantic import BaseModel, Field
from repositories.incident_repository import IncidentRepository
from services.ai.operations_engine import AIOperationsEngine
import logging

logger = logging.getLogger("stadiumos-api")
router = APIRouter()

class AnnouncementCreate(BaseModel):
    incident: str = Field(..., description="Describe the incident")
    location: str = Field(..., description="Location of incident")
    severity: str = Field(..., description="Low, Medium, or High")

class IncidentCreate(BaseModel):
    type: str = Field(..., description="Type of incident")
    location: str = Field(..., description="Location details")
    severity: str = Field(..., description="Severity level")
    description: str = Field(..., description="Full description")

@router.post("/api/announcements/generate", tags=["AI Assistance"])
async def generate_announcement(request: AnnouncementCreate):
    return await AIOperationsEngine.generate_announcement(
        request.incident,
        request.location,
        request.severity
    )

@router.post("/api/incidents", tags=["Incidents"])
async def create_incident(request: IncidentCreate):
    ai_analysis = await AIOperationsEngine.analyze_incident(
        request.type,
        request.location,
        request.severity,
        request.description
    )
    incident_data = {
        "type": request.type,
        "location": request.location,
        "severity": request.severity,
        "description": request.description,
        "aiSummary": ai_analysis.get("summary"),
        "aiPriority": ai_analysis.get("priority"),
        "aiResponse": ai_analysis.get("suggested_response")
    }
    try:
        IncidentRepository.create_incident(incident_data)
    except Exception as e:
        logger.warning(f"Failed to save incident to Postgres: {e}")
    return ai_analysis

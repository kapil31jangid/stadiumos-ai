from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class MobilityNeeds(str, Enum):
    NONE = "none"
    WHEELCHAIR = "wheelchair"
    LIMITED_MOBILITY = "limited_mobility"
    SENSORY_SENSITIVE = "sensory_sensitive"

class FanContext(BaseModel):
    fan_id: str = Field(..., description="Unique session-scoped identifier for the fan")
    current_zone: str = Field(..., description="Current stadium zone the fan is in or near")
    destination_gate: str = Field(..., description="The target gate matching the fan's ticket")
    ticket_category: str = Field(..., description="Category of the ticket (e.g. Cat 1, Cat 2, suite)")
    mobility_needs: MobilityNeeds = Field(MobilityNeeds.NONE, description="Mobility or sensory accommodation requirements")
    preferred_language: str = Field("en", description="Preferred language (ISO 639-1 code)")
    time_to_kickoff_minutes: int = Field(..., description="Minutes left before match kickoff")

class CrowdSnapshot(BaseModel):
    zone_id: str = Field(..., description="Identifier for the stadium zone")
    density_pct: float = Field(..., description="Simulated real-time crowd density percentage (0.0 to 100.0)")
    incident_flags: List[str] = Field(default_factory=list, description="Active safety or security incident flags for the zone")
    gate_wait_minutes: int = Field(..., description="Estimated wait time in minutes at the gate of this zone")

class NavigationResponse(BaseModel):
    route_steps: List[str] = Field(..., description="Step-by-step navigation instructions")
    eta: int = Field(..., description="Estimated time of arrival in minutes")
    reasoning: str = Field(..., description="Gemini explanation of the routing decision")
    audio_url: Optional[str] = Field(None, description="URL of generated Text-to-Speech audio file for accessible fans")
    alerts: List[str] = Field(default_factory=list, description="Safety or crowd alerts applicable to the route")

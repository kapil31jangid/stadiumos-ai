from typing import List, Dict, Any
from app.models.schemas import FanContext

def apply_guardrails(context: FanContext, candidate_routes: List[Dict[str, Any]], zone_snapshots: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Applies deterministic safety/operational guardrails to candidate routes before passing them to the LLM.
    
    1. Incident check: Never route through a zone with a safety/security incident.
    2. Accessibility check: If mobility_needs requires it, only allow accessible-tagged routes.
    3. Density check: If density is high (>85%) on a route segment, drop or flag it.
    """
    # For now, return candidate routes unchanged (scaffold)
    return candidate_routes

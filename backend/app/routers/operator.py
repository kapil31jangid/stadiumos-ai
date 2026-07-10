from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/operator")

@router.get("/crowd-summary", response_model=List[Dict[str, Any]])
async def get_crowd_summary():
    # Dummy placeholder response for scaffolding
    return [
        {
            "zone_id": f"Zone_{i}",
            "density_pct": 30.0 + i * 5.0,
            "incident_flags": ["High density warning"] if i == 5 else [],
            "gate_wait_minutes": 5 + i * 2
        } for i in range(1, 9)
    ]

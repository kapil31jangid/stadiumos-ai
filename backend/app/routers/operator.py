from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/operator")


@router.get("/crowd-summary", response_model=List[Dict[str, Any]])
async def get_crowd_summary():
    """
    Operator dashboard endpoint — returns real-time crowd density for all zones.
    """
    snapshots = await firestore_service.get_all_zone_snapshots()
    zones_meta = await firestore_service.get_all_zones_metadata()

    result = []
    for zone in zones_meta:
        snap = snapshots.get(zone["zone_id"])
        result.append({
            "zone_id": zone["zone_id"],
            "name": zone["name"],
            "accessible": zone["accessible"],
            "capacity": zone["capacity"],
            "density_pct": snap.density_pct if snap else 0.0,
            "incident_flags": snap.incident_flags if snap else [],
            "gate_wait_minutes": snap.gate_wait_minutes if snap else 0,
        })

    return result

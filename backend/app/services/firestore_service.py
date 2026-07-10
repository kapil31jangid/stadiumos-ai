from typing import Dict, List, Optional, Any
from app.models.schemas import CrowdSnapshot
from app.config import settings

# ── Seed data — 8 stadium zones and gates ─────────────────────────────────────
ZONE_SEED_DATA: List[Dict[str, Any]] = [
    {
        "zone_id": "Zone_1",
        "name": "North Entrance Plaza",
        "accessible": True,
        "gates": ["Gate_A", "Gate_B"],
        "capacity": 2000,
    },
    {
        "zone_id": "Zone_2",
        "name": "East Concourse Lower",
        "accessible": True,
        "gates": ["Gate_B", "Gate_C"],
        "capacity": 3000,
    },
    {
        "zone_id": "Zone_3",
        "name": "South Entrance Plaza",
        "accessible": True,
        "gates": ["Gate_C", "Gate_D"],
        "capacity": 2500,
    },
    {
        "zone_id": "Zone_4",
        "name": "West Concourse Lower",
        "accessible": True,
        "gates": ["Gate_D", "Gate_E"],
        "capacity": 3000,
    },
    {
        "zone_id": "Zone_5",
        "name": "North Concourse Upper",
        "accessible": False,
        "gates": ["Gate_E", "Gate_F"],
        "capacity": 1800,
    },
    {
        "zone_id": "Zone_6",
        "name": "East Concourse Upper",
        "accessible": False,
        "gates": ["Gate_F", "Gate_A"],
        "capacity": 1800,
    },
    {
        "zone_id": "Zone_7",
        "name": "VIP Hospitality Suite",
        "accessible": True,
        "gates": ["Gate_A", "Gate_D"],
        "capacity": 500,
    },
    {
        "zone_id": "Zone_8",
        "name": "Family Fan Zone",
        "accessible": True,
        "gates": ["Gate_C", "Gate_F"],
        "capacity": 1200,
    },
]

# Default crowd snapshots (simulated baseline)
DEFAULT_SNAPSHOTS: Dict[str, CrowdSnapshot] = {
    zone["zone_id"]: CrowdSnapshot(
        zone_id=zone["zone_id"],
        density_pct=30.0,
        incident_flags=[],
        gate_wait_minutes=5,
    )
    for zone in ZONE_SEED_DATA
}


class FirestoreService:
    """
    Service for reading and writing crowd snapshots and zone metadata.
    In mock mode (USE_MOCKS=true), operates from in-memory seed data.
    In production, connects to Cloud Firestore.
    """

    def __init__(self):
        self._mock_snapshots: Dict[str, CrowdSnapshot] = {
            k: v.model_copy() for k, v in DEFAULT_SNAPSHOTS.items()
        }
        self._db = None
        if not settings.USE_MOCKS:
            self._init_firestore()

    def _init_firestore(self):
        """Initialise real Firestore client when not in mock mode."""
        from google.cloud import firestore as gfs
        self._db = gfs.AsyncClient(project=settings.PROJECT_ID)

    # ── Public API ────────────────────────────────────────────────────────────

    async def get_zone_snapshot(self, zone_id: str) -> Optional[CrowdSnapshot]:
        """Return the latest CrowdSnapshot for the given zone."""
        if settings.USE_MOCKS:
            return self._mock_snapshots.get(zone_id)

        doc = await self._db.collection("crowd_snapshots").document(zone_id).get()
        if doc.exists:
            return CrowdSnapshot(**doc.to_dict())
        return None

    async def get_all_zone_snapshots(self) -> Dict[str, CrowdSnapshot]:
        """Return a dict of zone_id → CrowdSnapshot for all zones."""
        if settings.USE_MOCKS:
            return dict(self._mock_snapshots)

        docs = await self._db.collection("crowd_snapshots").get()
        return {
            doc.id: CrowdSnapshot(**doc.to_dict())
            for doc in docs
        }

    async def update_zone_snapshot(self, snapshot: CrowdSnapshot) -> None:
        """Upsert a CrowdSnapshot (used by the Pub/Sub consumer)."""
        if settings.USE_MOCKS:
            self._mock_snapshots[snapshot.zone_id] = snapshot
            return

        await self._db.collection("crowd_snapshots").document(snapshot.zone_id).set(
            snapshot.model_dump()
        )

    async def get_all_zones_metadata(self) -> List[Dict[str, Any]]:
        """Return static zone metadata (name, capacity, gates, accessibility)."""
        return list(ZONE_SEED_DATA)


firestore_service = FirestoreService()

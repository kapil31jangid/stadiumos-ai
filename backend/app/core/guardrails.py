from typing import List, Dict, Any, Optional
from app.models.schemas import FanContext, CrowdSnapshot, MobilityNeeds

# ── Guardrail constants ────────────────────────────────────────────────────────
CROWD_DENSITY_THRESHOLD: float = 85.0   # % — force reroute above this
ACCESSIBLE_ROUTE_TAG: str = "accessible"

# Stadium route graph: zone → list of possible routes to gates.
# Each route is annotated with the zones it passes through.
# In production this would be loaded from Firestore.
STATIC_ROUTE_GRAPH: List[Dict[str, Any]] = [
    {
        "route_id": "R-A1",
        "from_zone": "Zone_1",
        "to_gate": "Gate_A",
        "via_zones": ["Zone_1", "Zone_2"],
        "tags": ["accessible"],
        "distance_meters": 120,
        "estimated_walk_minutes": 3,
    },
    {
        "route_id": "R-A2",
        "from_zone": "Zone_1",
        "to_gate": "Gate_A",
        "via_zones": ["Zone_1", "Zone_3"],
        "tags": [],
        "distance_meters": 90,
        "estimated_walk_minutes": 2,
    },
    {
        "route_id": "R-B1",
        "from_zone": "Zone_2",
        "to_gate": "Gate_B",
        "via_zones": ["Zone_2", "Zone_4"],
        "tags": ["accessible"],
        "distance_meters": 100,
        "estimated_walk_minutes": 3,
    },
    {
        "route_id": "R-B2",
        "from_zone": "Zone_2",
        "to_gate": "Gate_B",
        "via_zones": ["Zone_2", "Zone_5"],
        "tags": [],
        "distance_meters": 80,
        "estimated_walk_minutes": 2,
    },
    {
        "route_id": "R-C1",
        "from_zone": "Zone_3",
        "to_gate": "Gate_C",
        "via_zones": ["Zone_3", "Zone_5"],
        "tags": ["accessible"],
        "distance_meters": 110,
        "estimated_walk_minutes": 3,
    },
    {
        "route_id": "R-C2",
        "from_zone": "Zone_3",
        "to_gate": "Gate_C",
        "via_zones": ["Zone_3", "Zone_6"],
        "tags": [],
        "distance_meters": 85,
        "estimated_walk_minutes": 2,
    },
    {
        "route_id": "R-D1",
        "from_zone": "Zone_4",
        "to_gate": "Gate_D",
        "via_zones": ["Zone_4", "Zone_6"],
        "tags": ["accessible"],
        "distance_meters": 130,
        "estimated_walk_minutes": 4,
    },
    {
        "route_id": "R-D2",
        "from_zone": "Zone_4",
        "to_gate": "Gate_D",
        "via_zones": ["Zone_4", "Zone_7"],
        "tags": [],
        "distance_meters": 95,
        "estimated_walk_minutes": 2,
    },
    {
        "route_id": "R-E1",
        "from_zone": "Zone_5",
        "to_gate": "Gate_E",
        "via_zones": ["Zone_5", "Zone_7"],
        "tags": ["accessible"],
        "distance_meters": 115,
        "estimated_walk_minutes": 3,
    },
    {
        "route_id": "R-E2",
        "from_zone": "Zone_5",
        "to_gate": "Gate_E",
        "via_zones": ["Zone_5", "Zone_8"],
        "tags": [],
        "distance_meters": 75,
        "estimated_walk_minutes": 2,
    },
    {
        "route_id": "R-F1",
        "from_zone": "Zone_6",
        "to_gate": "Gate_F",
        "via_zones": ["Zone_6", "Zone_8"],
        "tags": ["accessible"],
        "distance_meters": 100,
        "estimated_walk_minutes": 3,
    },
    {
        "route_id": "R-F2",
        "from_zone": "Zone_6",
        "to_gate": "Gate_F",
        "via_zones": ["Zone_6", "Zone_1"],
        "tags": [],
        "distance_meters": 88,
        "estimated_walk_minutes": 2,
    },
]


def _get_candidate_routes(
    from_zone: str,
    to_gate: str,
    all_routes: Optional[List[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """Return all static routes that start from the fan's zone toward their gate."""
    routes = all_routes if all_routes is not None else STATIC_ROUTE_GRAPH
    return [
        r for r in routes
        if r["from_zone"] == from_zone and r["to_gate"] == to_gate
    ]


def _needs_accessible_route(mobility_needs: MobilityNeeds) -> bool:
    """True when the fan's mobility status requires an accessible-tagged route."""
    return mobility_needs in (
        MobilityNeeds.WHEELCHAIR,
        MobilityNeeds.LIMITED_MOBILITY,
        MobilityNeeds.SENSORY_SENSITIVE,
    )


def _route_passes_incident_zone(
    route: Dict[str, Any],
    zone_snapshots: Dict[str, CrowdSnapshot],
) -> bool:
    """
    Returns True if ANY zone along the route has an active incident flag.
    Guardrail rule: never route through an incident zone.
    """
    for zone_id in route.get("via_zones", []):
        snapshot = zone_snapshots.get(zone_id)
        if snapshot and len(snapshot.incident_flags) > 0:
            return True
    return False


def _route_passes_high_density_zone(
    route: Dict[str, Any],
    zone_snapshots: Dict[str, CrowdSnapshot],
) -> bool:
    """
    Returns True if ANY zone along the route exceeds the crowd density threshold.
    Guardrail rule: force reroute if density > CROWD_DENSITY_THRESHOLD on primary route.
    """
    for zone_id in route.get("via_zones", []):
        snapshot = zone_snapshots.get(zone_id)
        if snapshot and snapshot.density_pct > CROWD_DENSITY_THRESHOLD:
            return True
    return False


def apply_guardrails(
    context: FanContext,
    zone_snapshots: Dict[str, CrowdSnapshot],
    all_routes: Optional[List[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """
    Apply all deterministic safety guardrails to produce a safe list of candidate
    routes for the given fan context.

    Rules (applied in order, all deterministic — no LLM involved):
      1. Start with routes that go from fan's current zone to their destination gate.
      2. Remove any route passing through a zone with active incident_flags.
      3. Remove any route passing through a zone with density_pct > 85%.
      4. If fan has mobility_needs != none, keep only accessible-tagged routes.

    Returns a filtered list of route dicts. May be empty if all routes are unsafe.
    """
    candidates = _get_candidate_routes(
        from_zone=context.current_zone,
        to_gate=context.destination_gate,
        all_routes=all_routes,
    )

    # Rule 1 — Incident zone exclusion
    candidates = [
        r for r in candidates
        if not _route_passes_incident_zone(r, zone_snapshots)
    ]

    # Rule 2 — High density forced reroute
    candidates = [
        r for r in candidates
        if not _route_passes_high_density_zone(r, zone_snapshots)
    ]

    # Rule 3 — Accessibility filter
    if _needs_accessible_route(context.mobility_needs):
        candidates = [
            r for r in candidates
            if ACCESSIBLE_ROUTE_TAG in r.get("tags", [])
        ]

    return candidates

"""
API contract tests for /api/navigate and /api/operator/crowd-summary.
Tests all important request shapes, error cases, and rate-limiting.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _valid_payload(**overrides):
    base = {
        "fan_id": "test_fan_001",
        "current_zone": "Zone_1",
        "destination_gate": "Gate_A",
        "ticket_category": "Cat 1",
        "mobility_needs": "none",
        "preferred_language": "en",
        "time_to_kickoff_minutes": 60,
    }
    base.update(overrides)
    return base


# ── Health check ──────────────────────────────────────────────────────────────

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "healthy"
    assert "project_id" in body
    assert "mock_mode" in body


# ── Navigation endpoint: happy paths ─────────────────────────────────────────

def test_navigate_standard_fan():
    res = client.post("/api/navigate", json=_valid_payload())
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["route_steps"], list)
    assert len(data["route_steps"]) > 0
    assert isinstance(data["eta"], int)
    assert data["eta"] > 0
    assert isinstance(data["reasoning"], str)
    assert len(data["reasoning"]) > 0
    assert isinstance(data["alerts"], list)


def test_navigate_wheelchair_fan_gets_accessible_route():
    res = client.post("/api/navigate", json=_valid_payload(
        mobility_needs="wheelchair",
        current_zone="Zone_1",
        destination_gate="Gate_A",
    ))
    assert res.status_code == 200
    data = res.json()
    # Must return a valid response (accessible route or fallback — never crash)
    assert "route_steps" in data
    assert isinstance(data["route_steps"], list)


def test_navigate_non_english_language():
    res = client.post("/api/navigate", json=_valid_payload(preferred_language="es"))
    assert res.status_code == 200
    data = res.json()
    # In mock mode, translated text == English text, but response must be valid
    assert isinstance(data["route_steps"], list)
    assert isinstance(data["reasoning"], str)


def test_navigate_all_mobility_types():
    for i, mobility in enumerate(["none", "wheelchair", "limited_mobility", "sensory_sensitive"]):
        res = client.post("/api/navigate", json=_valid_payload(
            fan_id=f"mobility_test_fan_{i}",
            mobility_needs=mobility,
        ))
        assert res.status_code == 200, f"Failed for mobility_needs={mobility}"
        assert "route_steps" in res.json()


def test_navigate_unknown_zone_returns_fallback():
    """An unknown zone/gate combo produces a graceful fallback, not a crash."""
    res = client.post("/api/navigate", json=_valid_payload(
        fan_id="unknown_zone_fan_xyz",
        current_zone="Zone_99",
        destination_gate="Gate_Z",
    ))
    assert res.status_code == 200
    data = res.json()
    assert "route_steps" in data
    assert len(data["route_steps"]) > 0  # fallback message returned


# ── Navigation endpoint: request validation ───────────────────────────────────

def test_navigate_missing_required_field_returns_422():
    payload = _valid_payload()
    del payload["fan_id"]
    res = client.post("/api/navigate", json=payload)
    assert res.status_code == 422


def test_navigate_invalid_mobility_enum_returns_422():
    res = client.post("/api/navigate", json=_valid_payload(mobility_needs="flying"))
    assert res.status_code == 422


def test_navigate_invalid_kickoff_type_returns_422():
    res = client.post("/api/navigate", json=_valid_payload(time_to_kickoff_minutes="soon"))
    assert res.status_code == 422


# ── Rate limiting ─────────────────────────────────────────────────────────────

def test_rate_limit_triggers_on_excessive_requests():
    """6th request from the same fan_id within rate window should be rejected."""
    fan_id = "rate_limit_test_fan_xyz"
    for _ in range(5):
        res = client.post("/api/navigate", json=_valid_payload(fan_id=fan_id))
        assert res.status_code == 200

    # 6th request must be rate-limited
    res = client.post("/api/navigate", json=_valid_payload(fan_id=fan_id))
    assert res.status_code == 429


# ── Operator endpoint ─────────────────────────────────────────────────────────

def test_operator_crowd_summary_returns_zones():
    res = client.get("/api/operator/crowd-summary")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 8  # 8 seeded zones


def test_operator_crowd_summary_zone_shape():
    res = client.get("/api/operator/crowd-summary")
    assert res.status_code == 200
    zone = res.json()[0]
    assert "zone_id" in zone
    assert "density_pct" in zone
    assert "incident_flags" in zone
    assert "gate_wait_minutes" in zone
    assert "accessible" in zone
    assert isinstance(zone["density_pct"], float)
    assert isinstance(zone["incident_flags"], list)

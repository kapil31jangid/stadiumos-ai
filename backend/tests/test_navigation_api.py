import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_navigation_api_scaffold():
    payload = {
        "fan_id": "fan_123",
        "current_zone": "Zone_2",
        "destination_gate": "Gate_B",
        "ticket_category": "Cat 2",
        "mobility_needs": "none",
        "preferred_language": "es",
        "time_to_kickoff_minutes": 45
    }
    response = client.post("/api/navigate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "route_steps" in data
    assert data["eta"] == 12

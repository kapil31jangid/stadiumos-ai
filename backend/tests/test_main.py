import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, AsyncMock
from main import app

client = TestClient(app)

@pytest.fixture
def mock_crowd_repo():
    with patch('routes.crowd.CrowdRepository') as mock:
        yield mock

@pytest.fixture
def mock_incident_repo():
    with patch('routes.incidents.IncidentRepository') as mock:
        yield mock

@pytest.fixture
def mock_ai_engine():
    unified_mock = MagicMock()
    with patch('routes.crowd.AIOperationsEngine', new=unified_mock), \
         patch('routes.incidents.AIOperationsEngine', new=unified_mock), \
         patch('routes.sustainability.AIOperationsEngine', new=unified_mock):
        yield unified_mock

def test_root():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "db" in response.json()

def test_metrics_no_db(mock_crowd_repo):
    mock_crowd_repo.get_zones.return_value = []
    response = client.get("/api/metrics")
    assert response.status_code == 550  # Matches custom 550 raise in main.py for database errors/empty lists

def test_metrics_success(mock_crowd_repo):
    mock_crowd_repo.get_zones.return_value = [
        {"id": "gate_a", "name": "East Gate A", "current_density": 0.5, "max_capacity": 5000, "status": "Normal"}
    ]
    response = client.get("/api/metrics")
    assert response.status_code == 200
    assert response.json()["zone_count"] == 1
    assert response.json()["overall_occupancy"] == 0.5

def test_recommend_validation():
    response = client.post("/api/recommend", json={
        "user_location": "a" * 200, 
        "destination": "Target"
    })
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_recommend_success(mock_crowd_repo, mock_ai_engine):
    mock_crowd_repo.get_zones.return_value = [
        {"id": "gate_a", "name": "East Gate A", "current_density": 0.2, "max_capacity": 5000, "status": "Normal"}
    ]
    mock_ai_engine.generate_route_recommendation = AsyncMock(return_value={
        "recommendation": "Suggested route is via Zone B.",
        "status": "Success"
    })

    response = client.post("/api/recommend", json={
        "user_location": "Gate A",
        "destination": "Food Court",
        "role": "fan"
    })
    
    assert response.status_code == 200
    assert response.json()["status"] == "Success"
    assert "Zone B" in response.json()["recommendation"]

@pytest.mark.asyncio
async def test_generate_announcement(mock_ai_engine):
    mock_ai_engine.generate_announcement = AsyncMock(return_value={
        "public_announcement": "ALERT: Crowd bottleneck at Gate C. Proceed to other exits.",
        "volunteer_instructions": "Direct attendees away from Gate C.",
        "security_brief": "Secure Gate C parameters.",
        "translations": {
            "en": "ALERT: Crowd bottleneck at Gate C. Proceed to other exits.",
            "es": "ALERTA: Embotellamiento de gente en la Puerta C. Vaya a otras salidas."
        }
    })

    response = client.post("/api/announcements/generate", json={
        "incident": "Crowd Bottleneck",
        "location": "Gate C",
        "severity": "High"
    })
    assert response.status_code == 200
    assert "public_announcement" in response.json()
    assert "translations" in response.json()

@pytest.mark.asyncio
async def test_create_incident(mock_incident_repo, mock_ai_engine):
    mock_ai_engine.analyze_incident = AsyncMock(return_value={
        "summary": "Medical emergency at Concourse B",
        "priority": "HIGH",
        "suggested_response": "Deploy medics."
    })
    mock_incident_repo.create_incident.return_value = {
        "id": "mock-uuid",
        "type": "Medical Emergency",
        "location": "Concourse B",
        "severity": "Critical",
        "description": "Attendee heat exhaustion."
    }

    response = client.post("/api/incidents", json={
        "type": "Medical Emergency",
        "location": "Concourse B",
        "severity": "Critical",
        "description": "Attendee experiencing heat stroke"
    })
    assert response.status_code == 200
    assert "summary" in response.json()
    assert response.json()["priority"] == "HIGH"

@pytest.mark.asyncio
async def test_sustainability_recommendations(mock_ai_engine):
    mock_ai_engine.get_sustainability_recommendations = AsyncMock(return_value={
        "recommendations": [
            "Reduce concourse overhead lighting during high daylight hours.",
            "Stagger HVAC startup cycles to avoid power demand spikes."
        ]
    })
    response = client.get("/api/sustainability/recommendations")
    assert response.status_code == 200
    assert "recommendations" in response.json()
    assert len(response.json()["recommendations"]) > 0

@pytest.mark.asyncio
async def test_venue_maintenance_suggestions(mock_ai_engine):
    mock_ai_engine.get_maintenance_suggestions = AsyncMock(return_value={
        "suggestions": [
            "Monitor elevator cabin vibration levels in Section 102.",
            "Service entrance Gate B turnstile bearings before halftime surge."
        ]
    })
    response = client.get("/api/venue/maintenance")
    assert response.status_code == 200
    assert "suggestions" in response.json()
    assert len(response.json()["suggestions"]) > 0

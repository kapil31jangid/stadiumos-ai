import os
import pytest
from unittest.mock import patch, MagicMock
from repositories.crowd_repository import CrowdRepository
from repositories.announcement_repository import AnnouncementRepository
from repositories.incident_repository import IncidentRepository
from repositories.notification_repository import NotificationRepository
from repositories.task_repository import TaskRepository
from repositories.transport_repository import TransportRepository
from repositories.users_repository import UsersRepository

def test_crowd_repository_fallback():
    # Verify fallback mode when DATABASE_URL is not set
    with patch.dict(os.environ, {}, clear=True):
        zones = CrowdRepository.get_zones()
        assert len(zones) > 0
        assert zones[0]["id"] == "gate_a"

        updated = CrowdRepository.update_zone("gate_a", {"name": "New Gate"})
        assert updated is None

def test_announcement_repository_fallback():
    with patch.dict(os.environ, {}, clear=True):
        announcements = AnnouncementRepository.get_announcements()
        assert announcements == []

        created = AnnouncementRepository.create_announcement({
            "message": "Public notice",
            "incident_type": "Info",
            "severity": "Low"
        })
        assert created is None

def test_incident_repository_fallback():
    with patch.dict(os.environ, {}, clear=True):
        incidents = IncidentRepository.get_incidents()
        assert len(incidents) == 2
        assert incidents[0]["type"] == "HVAC Outage"

        data = {
            "type": "Lost Property",
            "location": "Concourse A",
            "severity": "Low",
            "description": "Lost wallet"
        }
        created = IncidentRepository.create_incident(data)
        assert created == data

def test_notification_repository_fallback():
    with patch.dict(os.environ, {}, clear=True):
        notifications = NotificationRepository.get_notifications()
        assert notifications == []

        created = NotificationRepository.create_notification({
            "message": "System check",
            "role": "all",
            "type": "info"
        })
        assert created is None

def test_task_repository_fallback():
    with patch.dict(os.environ, {}, clear=True):
        tasks = TaskRepository.get_tasks()
        assert tasks == []

        created = TaskRepository.create_task({
            "assigned_to": "volunteer_1",
            "incident_id": "incident_123",
            "priority": "HIGH",
            "status": "Assigned",
            "estimated_completion": "30m"
        })
        assert created is None

        updated = TaskRepository.update_task("task_123", {"status": "Completed"})
        assert updated is None

def test_transport_repository_fallback():
    with patch.dict(os.environ, {}, clear=True):
        metrics = TransportRepository.get_transport_metrics()
        assert metrics["id"] == "main_station"
        assert metrics["metro_wait"] == 18

        updated = TransportRepository.update_transport_metrics({"metro_wait": 25})
        assert updated is None

def test_users_repository_fallback():
    with patch.dict(os.environ, {}, clear=True):
        profile = UsersRepository.get_profile("mock_user_123")
        assert profile is None

        created = UsersRepository.update_profile("mock_user_123", {
            "name": "Test User",
            "role": "fan"
        })
        assert created is None

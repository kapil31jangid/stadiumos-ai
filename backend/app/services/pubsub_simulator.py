"""
Pub/Sub Crowd Simulator.

Publishes synthetic CrowdSnapshot events at regular intervals for demo purposes.
In mock mode, directly updates the FirestoreService in-memory state.
In production, publishes to a Cloud Pub/Sub topic consumed by a subscriber.
"""
import asyncio
import random
import logging
import json
from typing import Optional
from app.config import settings
from app.models.schemas import CrowdSnapshot

logger = logging.getLogger(__name__)

ZONE_IDS = [f"Zone_{i}" for i in range(1, 9)]
GATES = ["Gate_A", "Gate_B", "Gate_C", "Gate_D", "Gate_E", "Gate_F"]

# Simulate "surge events" on occasional zones
INCIDENT_SCENARIOS = [
    ["Security Alert"],
    ["Medical Response"],
    ["Crowd Surge Warning"],
    [],
    [],
    [],  # 50% chance of no incident
]


def _generate_snapshot(zone_id: str, elapsed_minutes: float = 0) -> CrowdSnapshot:
    """
    Generates a simulated crowd snapshot.
    Density increases as kickoff approaches (time-based simulation).
    """
    base_density = min(30.0 + elapsed_minutes * 2.5, 90.0)
    noise = random.uniform(-10.0, 10.0)
    density = max(5.0, min(99.0, base_density + noise))

    incident_flags = random.choice(INCIDENT_SCENARIOS)
    gate_wait = int(density / 10) + random.randint(0, 3)

    return CrowdSnapshot(
        zone_id=zone_id,
        density_pct=round(density, 1),
        incident_flags=incident_flags,
        gate_wait_minutes=gate_wait,
    )


class PubSubSimulator:
    """
    Background simulator that continuously publishes crowd density updates.
    In mock mode, writes directly to the FirestoreService in-memory store.
    In production, publishes JSON messages to a Pub/Sub topic.
    """

    def __init__(self, interval_seconds: float = 5.0):
        self._interval = interval_seconds
        self._task: Optional[asyncio.Task] = None
        self._running = False
        self._elapsed_minutes = 0.0
        self._publisher = None
        self._topic_path = None

        if not settings.USE_MOCKS:
            self._init_pubsub()

    def _init_pubsub(self):
        try:
            from google.cloud import pubsub_v1
            self._publisher = pubsub_v1.PublisherClient()
            self._topic_path = self._publisher.topic_path(
                settings.PROJECT_ID, "crowd-density-updates"
            )
        except Exception as e:
            logger.error(f"Failed to initialise Pub/Sub publisher: {e}")

    async def start(self) -> None:
        """Start the background crowd simulation loop."""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("PubSub crowd simulator started.")

    async def stop(self) -> None:
        """Stop the background loop gracefully."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("PubSub crowd simulator stopped.")

    async def _run_loop(self) -> None:
        while self._running:
            try:
                await self._publish_all_zones()
                self._elapsed_minutes += self._interval / 60.0
            except Exception as e:
                logger.warning(f"Crowd simulation tick error: {e}")
            await asyncio.sleep(self._interval)

    async def _publish_all_zones(self) -> None:
        """Publish or update crowd snapshots for all zones."""
        from app.services.firestore_service import firestore_service
        from app.services.bigquery_service import bigquery_service

        for zone_id in ZONE_IDS:
            snapshot = _generate_snapshot(zone_id, self._elapsed_minutes)

            if settings.USE_MOCKS:
                # Write directly to in-memory Firestore mock
                await firestore_service.update_zone_snapshot(snapshot)
            else:
                # Publish to Pub/Sub topic
                self._publish_to_pubsub(snapshot)

            # Log density to BigQuery for operator analytics
            if snapshot.incident_flags:
                await bigquery_service.log_reroute_event(
                    fan_id="simulator",
                    zone_id=zone_id,
                    density_pct=snapshot.density_pct,
                    incident_flags=snapshot.incident_flags,
                )

    def _publish_to_pubsub(self, snapshot: CrowdSnapshot) -> None:
        """Publish snapshot as JSON message to Pub/Sub."""
        if not self._publisher or not self._topic_path:
            return
        data = json.dumps(snapshot.model_dump()).encode("utf-8")
        self._publisher.publish(self._topic_path, data)


pubsub_simulator = PubSubSimulator(interval_seconds=5.0)

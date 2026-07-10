"""
BigQuery analytics sink.

Logs reroute events and crowd density observations for the operator dashboard.
In mock mode, logs to the standard Python logger. In production, streams to BigQuery.
"""
import logging
from typing import List
from app.config import settings

logger = logging.getLogger(__name__)

BQ_DATASET = "stadiumsense"
BQ_TABLE = "crowd_events"


class BigQueryService:
    def __init__(self):
        self._client = None
        self._table_ref = None
        if not settings.USE_MOCKS:
            self._init_client()

    def _init_client(self):
        try:
            from google.cloud import bigquery
            self._client = bigquery.Client(project=settings.PROJECT_ID)
            self._table_ref = f"{settings.PROJECT_ID}.{BQ_DATASET}.{BQ_TABLE}"
        except Exception as e:
            logger.error(f"Failed to initialise BigQuery client: {e}")

    async def log_reroute_event(
        self,
        fan_id: str,
        zone_id: str,
        density_pct: float,
        incident_flags: List[str],
    ) -> None:
        """
        Streams a crowd event row to BigQuery.
        In mock mode, logs to stdout instead.
        """
        row = {
            "fan_id": fan_id,
            "zone_id": zone_id,
            "density_pct": density_pct,
            "incident_flags": ",".join(incident_flags),
        }

        if settings.USE_MOCKS or self._client is None:
            logger.debug(f"[BigQuery Mock] crowd event: {row}")
            return

        try:
            errors = self._client.insert_rows_json(self._table_ref, [row])
            if errors:
                logger.warning(f"BigQuery insert errors: {errors}")
        except Exception as e:
            logger.warning(f"BigQuery log_reroute_event failed: {e}")


bigquery_service = BigQueryService()

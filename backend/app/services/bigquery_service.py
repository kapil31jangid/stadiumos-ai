from typing import Dict, Any

class BigQueryService:
    def __init__(self):
        pass

    async def log_reroute_event(self, fan_id: str, original_route: str, rerouted_route: str, reason: str) -> None:
        """
        Logs reroute event to BigQuery for operator dashboard analytics.
        """
        pass

bigquery_service = BigQueryService()

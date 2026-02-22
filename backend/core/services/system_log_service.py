import requests
import logging
from django.utils import timezone
from ..models import LogEntry, IngestionLog

logger = logging.getLogger(__name__)


class SystemLogService:
    """
    Service to handle system log ingestion from the external Go API.
    """

    API_URL = "http://localhost:8282/api/v1/system/log"

    @classmethod
    def poll_logs(cls):
        """
        Fetches logs from the external API and saves them to the database.
        """
        try:
            response = requests.get(cls.API_URL, timeout=10)
            response.raise_for_status()
            logs = response.json()

            if not isinstance(logs, list):
                # If the API returns a single log object instead of a list
                logs = [logs]

            new_logs_count = 0
            for log_data in logs:
                # Basic check to avoid duplicates if possible
                # Note: The provided format doesn't have a unique ID,
                # so we might want to check for identical logs in a short window
                # or just ingest everything if the API is a stream/queue.
                # For now, we'll just create the entries.

                LogEntry.objects.create(
                    level=log_data.get("level", "INFO"),
                    timestamp=log_data.get("timestamp"),
                    caller=log_data.get("caller", ""),
                    message=log_data.get("message", ""),
                    source=log_data.get("source", "system"),
                    metadata=log_data.get("metadata", {}),
                )
                new_logs_count += 1

            # Update ingestion log
            ingestion_log, _ = IngestionLog.objects.get_or_create(source="system_log")
            ingestion_log.save()  # Updates last_polled_at

            return new_logs_count

        except requests.RequestException as e:
            logger.error(f"Error fetching system logs: {e}")
            return 0
        except Exception as e:
            logger.error(f"Unexpected error in system log ingestion: {e}")
            return 0

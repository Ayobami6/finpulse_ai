import os
import django
import sys
from unittest.mock import patch, MagicMock

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.services.system_log_service import SystemLogService
from core.models import LogEntry


def test_system_log_ingestion():
    print("Starting verification for system log ingestion...")

    mock_response = [
        {
            "level": "FATAL",
            "timestamp": "2026-02-22T05:35:43.114+0100",
            "caller": "api/api.go:78",
            "message": "Listen and serve error",
            "source": "api-service",
            "metadata": {
                "duration_ms": 0,
                "environment": "production",
                "request_id": "req-123",
                "status_code": 0,
            },
        },
        {
            "level": "ERROR",
            "timestamp": "2026-02-22T05:36:12.456+0100",
            "caller": "db/db.go:45",
            "message": "Connection refused",
            "source": "db-service",
            "metadata": {
                "duration_ms": 1500,
                "environment": "production",
                "request_id": "req-456",
                "status_code": 500,
            },
        },
    ]

    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response

        # Count existing logs
        initial_count = LogEntry.objects.count()
        print(f"Initial log count: {initial_count}")

        # Run polling
        ingested_count = SystemLogService.poll_logs()
        print(f"Ingested logs count (from service): {ingested_count}")

        # Verify
        final_count = LogEntry.objects.count()
        print(f"Final log count: {final_count}")

        if ingested_count == 2 and final_count == initial_count + 2:
            print("✅ Verification SUCCESS: Logs ingested correctly.")

            # Check the last log
            last_log = LogEntry.objects.order_by("-id").first()
            print(f"Last log level: {last_log.level}")
            print(f"Last log message: {last_log.message}")
            print(f"Last log caller: {last_log.caller}")

            if last_log.caller == "db/db.go:45":
                print("✅ Caller field correctly saved.")
            else:
                print("❌ Caller field mismatch!")
        else:
            print("❌ Verification FAILED!")


if __name__ == "__main__":
    test_system_log_ingestion()

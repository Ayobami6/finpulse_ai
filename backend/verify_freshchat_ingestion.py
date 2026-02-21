import os
import django
from unittest.mock import patch, MagicMock

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.services.ingestion_service import IngestionService
from core.models import ChatEntry, IngestionLog


def test_freshchat_ingestion():
    print("Starting Freshchat Ingestion Test...")

    # Mock Freshchat API response
    mock_conversations = [{"conversation_id": "conv_1"}]
    mock_messages = [
        {
            "id": "msg_1",
            "actor_id": "user_1",
            "actor_type": "user",
            "created_time": "2024-02-20T12:00:00.000Z",
            "conversation_id": "conv_1",
            "channel_id": "chan_1",
            "message_parts": [
                {"text": {"content": "Hello, I have an issue with my transfer."}}
            ],
        }
    ]

    with patch("requests.get") as mock_get:
        # Mocking 1. list_conversations 2. get_messages
        mock_get.side_effect = [
            MagicMock(
                status_code=200, json=lambda: {"conversations": mock_conversations}
            ),
            MagicMock(status_code=200, json=lambda: {"messages": mock_messages}),
        ]

        print("Polling sources...")
        results = IngestionService.poll_sources()
        print(f"Results: {results}")

        # Check Results
        assert (
            results.get("freshchat", 0) > 0
        ), "Freshchat should have ingested messages"

        # Check Database
        chat = ChatEntry.objects.filter(external_id="msg_1").first()
        assert chat is not None, "Message should be saved in database"
        assert chat.message == "Hello, I have an issue with my transfer."
        print(f"Successfully ingested message: {chat.message}")

    print("Freshchat Ingestion Test Passed!")


if __name__ == "__main__":
    test_freshchat_ingestion()

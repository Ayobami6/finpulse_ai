import os
import django
from unittest.mock import patch, MagicMock

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import IntegrationConfig, ChatEntry
from core.services.freshchat_service import FreshchatService
from core.services.ingestion_service import IngestionService


def test_e2e_integration_settings():
    print("Starting E2E Integration Settings Test...")

    # 1. Clear existing config
    IntegrationConfig.objects.filter(source_type="freshchat").delete()

    # 2. Add config via model (simulating API)
    IntegrationConfig.objects.create(
        source_type="freshchat",
        api_key="db_api_key",
        account_url="https://db-account.freshchat.com",
        is_active=True,
    )
    print("Saved Freshchat config to database.")

    # 3. Verify FreshchatService picks it up
    service = FreshchatService()
    assert service.api_key == "db_api_key"
    assert service.account_url == "https://db-account.freshchat.com"
    print("FreshchatService correctly picked up DB settings.")

    # 4. Verify Ingestion with mocks but checking headers
    mock_conversations = [{"conversation_id": "conv_db"}]
    mock_messages = [
        {
            "id": "msg_db",
            "actor_id": "user_db",
            "actor_type": "user",
            "created_time": "2024-02-20T14:00:00.000Z",
            "conversation_id": "conv_db",
            "message_parts": [{"text": {"content": "E2E Test Message"}}],
        }
    ]

    with patch("requests.get") as mock_get:
        mock_get.side_effect = [
            MagicMock(
                status_code=200, json=lambda: {"conversations": mock_conversations}
            ),
            MagicMock(status_code=200, json=lambda: {"messages": mock_messages}),
        ]

        IngestionService.poll_sources()

        # Check if requested URL matches DB config
        args, kwargs = mock_get.call_args_list[0]
        assert "https://db-account.freshchat.com" in args[0]
        assert kwargs["headers"]["Authorization"] == "Bearer db_api_key"
        print("IngestionService used correct URL and API Key from DB.")

        # Check Database
        chat = ChatEntry.objects.filter(external_id="msg_db").first()
        assert chat is not None
        assert chat.message == "E2E Test Message"
        print("Message successfully ingested using DB settings.")

    print("E2E Integration Settings Test Passed!")


if __name__ == "__main__":
    test_e2e_integration_settings()

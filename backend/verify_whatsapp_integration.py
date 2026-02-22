import os
import django
import sys
import json
from unittest.mock import patch, MagicMock

# Setup Django environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import ChatEntry, IntegrationConfig
from core.services.whatsapp_service import WhatsAppService
from rest_framework.test import APIClient


def verify_whatsapp_integration():
    print("Starting WhatsApp Integration Verification...")

    # 1. Setup Mock Integration Config
    print("\n[Step 1] Setting up IntegrationConfig...")
    config, _ = IntegrationConfig.objects.get_or_create(
        source_type="whatsapp",
        defaults={
            "api_key": "mock_api_key",
            "account_url": "https://graph.facebook.com/v17.0/123456789",
            "webhook_secret": "verify_token_123",
            "is_active": True,
        },
    )

    client = APIClient()

    # 2. Verify Webhook (GET)
    print("\n[Step 2] Testing Webhook Verification (GET)...")
    url = "/api/integrations/whatsapp/webhook/"
    params = {
        "hub.mode": "subscribe",
        "hub.verify_token": "verify_token_123",
        "hub.challenge": "123456789",
    }
    response = client.get(url, params)
    if response.status_code == 200 and int(response.content) == 123456789:
        print("✅ Webhook Verification Success.")
    else:
        print(
            f"❌ Webhook Verification Failed. Status: {response.status_code}, Content: {response.content}"
        )

    # 3. Simulate Incoming Message (POST)
    print("\n[Step 3] Simulating Incoming WhatsApp Message (POST)...")
    payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "844444444",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "16505551111",
                                "phone_number_id": "123456789",
                            },
                            "contacts": [
                                {
                                    "profile": {"name": "Test User"},
                                    "wa_id": "16505551234",
                                }
                            ],
                            "messages": [
                                {
                                    "from": "16505551234",
                                    "id": "wamid.HBgLMTY1MDU1NTEyMzQfQkdBRU9BQT09",
                                    "timestamp": "1698404400",
                                    "text": {"body": "My transfer is stuck!"},
                                    "type": "text",
                                }
                            ],
                        },
                        "field": "messages",
                    }
                ],
            }
        ],
    }

    # We mock the AIService.run_smart_reply to avoid real LLM calls during this test
    with patch("core.tasks.process_new_chat_entry.delay") as mock_task:
        response = client.post(url, data=payload, format="json")
        if response.status_code == 200:
            print("✅ Webhook POST Success.")

            # Verify ChatEntry was created
            chat = ChatEntry.objects.filter(
                external_id="wamid.HBgLMTY1MDU1NTEyMzQfQkdBRU9BQT09"
            ).first()
            if chat:
                print(f"✅ ChatEntry created: {chat.message} from {chat.sender_id}")
                if mock_task.called:
                    print(
                        f"✅ Celery task 'process_new_chat_entry' was triggered with ID: {chat.id}"
                    )
                else:
                    print("❌ FAILED: Celery task was not triggered.")
            else:
                print("❌ FAILED: ChatEntry was not created.")
        else:
            print(
                f"❌ Webhook POST Failed. Status: {response.status_code}, Content: {response.text}"
            )

    print("\nWhatsApp Integration Verification Complete.")


if __name__ == "__main__":
    verify_whatsapp_integration()

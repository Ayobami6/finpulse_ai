import requests
import logging
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timezone as dt_timezone
from core.models import IntegrationConfig

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    Service to interact with the WhatsApp Business API (via Meta Graph API).
    """

    def __init__(self):
        config = IntegrationConfig.objects.filter(
            source_type="whatsapp", is_active=True
        ).first()
        self.api_key = config.api_key if config else None
        self.account_url = (
            config.account_url if config else None
        )  # This will be the Phone Number ID or full API URL
        self.webhook_secret = (
            config.webhook_secret if config else None
        )  # Verification token

        # Fallback to settings
        if not self.api_key:
            self.api_key = getattr(settings, "WHATSAPP_API_KEY", None)
        if not self.webhook_secret:
            self.webhook_secret = getattr(settings, "WHATSAPP_VERIFY_TOKEN", None)

        # Base URL for WhatsApp Graph API
        # Example: https://graph.facebook.com/v17.0/PHONE_NUMBER_ID/messages
        self.base_url = (
            self.account_url if self.account_url else "https://graph.facebook.com/v17.0"
        )

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def verify_webhook(self, mode, token, challenge):
        """
        Verifies the webhook during the initial setup from Meta dashboard.
        """
        if mode == "subscribe" and token == self.webhook_secret:
            logger.info("WhatsApp Webhook verified successfully.")
            return challenge
        logger.warning(
            f"WhatsApp Webhook verification failed. Mode: {mode}, Token: {token}"
        )
        return None

    def handle_webhook_payload(self, data):
        """
        Parses the WhatsApp webhook payload (Cloud API format).
        Returns a list of processed messages.
        """
        processed_messages = []

        object_type = data.get("object")
        if object_type != "whatsapp_business_account":
            return []

        entries = data.get("entry", [])
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                messages = value.get("messages", [])

                for msg in messages:
                    if msg.get("type") == "text":
                        text_content = msg.get("text", {}).get("body", "")

                        ts = msg.get("timestamp")
                        if ts:
                            timestamp = datetime.fromtimestamp(
                                int(ts), tz=dt_timezone.utc
                            )
                        else:
                            timestamp = timezone.now()

                        processed_messages.append(
                            {
                                "id": msg.get("id"),
                                "sender_id": msg.get("from"),
                                "message": text_content,
                                "timestamp": timestamp,
                                "source": "whatsapp",
                                "metadata": {
                                    "display_phone_number": value.get(
                                        "metadata", {}
                                    ).get("display_phone_number"),
                                    "phone_number_id": value.get("metadata", {}).get(
                                        "phone_number_id"
                                    ),
                                    "contact_name": value.get("contacts", [{}])[0]
                                    .get("profile", {})
                                    .get("name"),
                                },
                            }
                        )

        return processed_messages

    def send_message(self, recipient_id, text):
        """
        Sends a text message via WhatsApp Business API.
        recipient_id: The recipient's phone number (with country code).
        """
        if not self.api_key:
            logger.error("WhatsApp API key not configured.")
            return None

        # If base_url doesn't contain /messages, append it
        url = self.base_url
        if "/messages" not in url:
            # We assume self.base_url is the Phone Number ID endpoint if it doesn't have /messages
            url = f"{self.base_url}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_id,
            "type": "text",
            "text": {"body": text},
        }

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            logger.info(f"WhatsApp message sent to {recipient_id}")
            return response.json()
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            if hasattr(e, "response") and e.response:
                logger.error(f"Response: {e.response.text}")
            return None

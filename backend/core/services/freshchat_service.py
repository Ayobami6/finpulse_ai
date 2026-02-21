import requests
import logging
from django.conf import settings
from django.utils import timezone
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization
from core.models import IntegrationConfig

logger = logging.getLogger(__name__)


class FreshchatService:
    """
    Service to interact with the Freshchat API.
    """

    def __init__(self):
        config = IntegrationConfig.objects.filter(
            source_type="freshchat", is_active=True
        ).first()
        self.api_key = config.api_key if config else None
        self.account_url = config.account_url if config else None
        self.webhook_secret = config.webhook_secret if config else None

        # Fallback to settings if not found in DB
        if not self.api_key:
            self.api_key = getattr(settings, "FRESHCHAT_API_KEY", None)
        if not self.account_url:
            self.account_url = getattr(settings, "FRESHCHAT_ACCOUNT_URL", None)

        # Normalize account_url
        if self.account_url:
            self.account_url = self.account_url.strip().rstrip("/")
            if not self.account_url.startswith(("http://", "https://")):
                self.account_url = f"https://{self.account_url}"

            # If the user provided a portal URL (e.g. company.freshchat.com),
            # the API usually resides at api.freshchat.com (or regional equivalents).
            # We'll warn if it doesn't look like an API URL.
            if ".freshchat.com" in self.account_url and "api" not in self.account_url:
                logger.warning(
                    f"Freshchat URL {self.account_url} looks like a portal URL. "
                    "API calls usually require a regional API URL like https://api.freshchat.com"
                )

            # Remove /v2 if it was included in the base URL to avoid duplication
            if self.account_url.endswith("/v2"):
                self.account_url = self.account_url[:-3]

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "accept": "application/json",
        }

    def list_conversations(self, page=1):
        """
        Lists conversations from Freshchat.
        """
        if not self.api_key or not self.account_url:
            logger.error("Freshchat API key or Account URL not configured.")
            return []

        url = f"{self.account_url}/v2/conversations?page={page}"
        try:
            response = requests.get(url, headers=self.headers)
            if response.status_code == 403:
                logger.error(
                    f"Auth failure (403) from Freshchat. Response: {response.text}. "
                    "Ensure you are using a regional API URL (e.g. api.freshchat.com) "
                    "and a valid API Token."
                )
            response.raise_for_status()
            return response.json().get("conversations", [])
        except Exception as e:
            logger.error(f"Error listing Freshchat conversations: {e}")
            return []

    def get_messages(self, conversation_id, from_time=None):
        """
        Lists messages for a specific Freshchat conversation.
        """
        if not self.api_key or not self.account_url:
            return []

        url = f"{self.account_url}/v2/conversations/{conversation_id}/messages"
        params = {}
        if from_time:
            # from_time should be in ISO 8601 format: YYYY-MM-DDThh:mm:ss.SSSZ
            params["from_time"] = from_time

        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json().get("messages", [])
        except Exception as e:
            logger.error(f"Error getting Freshchat messages for {conversation_id}: {e}")
            return []

    def process_message(self, message):
        """
        Extracts content from a Freshchat message object.
        """
        content = ""
        message_parts = message.get("message_parts", [])
        for part in message_parts:
            text_part = part.get("text", {})
            if text_part:
                content += text_part.get("content", "")

        return {
            "id": message.get("id"),
            "sender_id": message.get("actor_id"),
            "message": content,
            "timestamp": message.get("created_time"),
            "metadata": {
                "actor_type": message.get("actor_type"),
                "conversation_id": message.get("conversation_id"),
                "channel_id": message.get("channel_id"),
            },
        }

    def verify_signature(self, payload: bytes, signature_base64: str) -> bool:
        """
        Verifies the X-Freshchat-Signature using the public key (webhook_secret).
        """
        if not self.webhook_secret:
            logger.error("Freshchat webhook secret (public key) not configured.")
            return False

        try:
            public_key = serialization.load_pem_public_key(
                self.webhook_secret.encode("utf-8")
            )
            signature = base64.b64decode(signature_base64)

            public_key.verify(
                signature,
                payload,
                padding.PKCS1v15(),
                hashes.SHA256(),
            )
            return True
        except Exception as e:
            logger.error(f"Freshchat signature verification failed: {e}")
            return False

    def handle_webhook_payload(self, data):
        """
        Parses a Freshchat webhook payload and returns a list of processed messages.
        """
        action = data.get("action")
        if action != "message_create":
            logger.info(f"Ignoring Freshchat webhook action: {action}")
            return []

        message_data = data.get("data", {}).get("message")
        if not message_data:
            return []

        processed = self.process_message(message_data)
        # Add source field which process_message doesn't add (it's called from ingestion service too)
        processed["source"] = "freshchat"
        return [processed]

    def send_message(self, conversation_id: str, text: str):
        """
        Sends a message to a Freshchat conversation.
        """
        if not self.api_key or not self.account_url:
            logger.error("Freshchat API key or Account URL not configured.")
            return None

        url = f"{self.account_url}/v2/conversations/{conversation_id}/messages"
        payload = {
            "message_parts": [{"text": {"content": text}}],
            "actor_type": "agent",
            "actor_id": "b184e638-2b4a-4f90-9053-29be033a2a40",
        }

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            print("response from freshchat: ", response.text)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error sending Freshchat message to {conversation_id}: {e}")
            return None

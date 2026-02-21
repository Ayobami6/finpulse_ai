import json
import base64
import requests
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def generate_test_keys():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()

    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    pem_public = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    return pem_private, pem_public


def sign_payload(payload_bytes, private_key_pem):
    private_key = serialization.load_pem_private_key(
        private_key_pem,
        password=None,
    )

    signature = private_key.sign(payload_bytes, padding.PKCS1v15(), hashes.SHA256())

    return base64.b64encode(signature).decode("utf-8")


def test_webhook():
    print("Setting up test...")
    private_pem, public_pem = generate_test_keys()

    # 1. Update IntegrationConfig with test public key
    import os
    import sys
    import django

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()

    from core.models import IntegrationConfig

    config, created = IntegrationConfig.objects.get_or_create(
        source_type="freshchat", defaults={"is_active": True, "api_key": "test_api_key"}
    )
    config.webhook_secret = public_pem.decode("utf-8")
    config.save()
    print("Updated IntegrationConfig with test public key.")

    # 2. Prepare payload
    payload = {
        "actor": {"actor_type": "user", "actor_id": "user123"},
        "action": "message_create",
        "action_time": "2026-02-21T12:00:00.000Z",
        "data": {
            "message": {
                "id": "msg_webhook_1",
                "actor_id": "user123",
                "actor_type": "user",
                "conversation_id": "conv_webhook_1",
                "created_time": "2026-02-21T12:00:00.000Z",
                "message_parts": [{"text": {"content": "Hello from webhook!"}}],
            }
        },
    }
    payload_json = json.dumps(payload)
    payload_bytes = payload_json.encode("utf-8")

    # 3. Sign payload
    signature = sign_payload(payload_bytes, private_pem)
    print(f"Generated signature: {signature[:20]}...")

    # 4. Send request
    url = "http://127.0.0.1:8000/api/integrations/freshchat/webhook/"
    headers = {"X-Freshchat-Signature": signature, "Content-Type": "application/json"}

    print(f"Sending request to {url}...")
    try:
        response = requests.post(url, data=payload_json, headers=headers)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")

        if response.status_code == 200:
            print("SUCCESS: Webhook handled correctly.")

            # Verify in DB
            from core.models import ChatEntry

            chat = ChatEntry.objects.filter(external_id="msg_webhook_1").first()
            if chat:
                print(f"Verified: Chat entry created with ID {chat.id}")
                print(f"Message: {chat.message}")
            else:
                print("FAILURE: Chat entry not found in database.")
        else:
            print("FAILURE: Webhook returned non-200 status.")

    except Exception as e:
        print(f"Error sending request: {e}")


if __name__ == "__main__":
    test_webhook()

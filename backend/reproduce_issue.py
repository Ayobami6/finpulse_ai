import logging
import os
import django
import sys
from django.utils import timezone

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Setup Django environment
# Use absolute path to backend
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.services.ai_service import AIService
from core.models import ChatEntry


def reproduce():
    print("Starting reproduction of MCP wallet balance issue...")

    # 1. Create a dummy ChatEntry
    chat = ChatEntry.objects.create(
        timestamp=timezone.now(),
        source="freshchat",
        sender_id="user_test_123",
        message="I want to check my wallet balance. How much do I have?, my email is ayobamidele006+4@gmail.com",
        metadata={"conversation_id": "12345"},
    )
    print(f"Created chat entry: {chat.id}")

    try:
        # 2. Run the smart reply
        print("Running AIService.run_smart_reply...")
        # run_smart_reply is synchronous and manages its own loop
        result = AIService.run_smart_reply(chat.id)
        print("\n--- RESULT ---")
        print(result)
        print("--------------\n")

    except Exception as e:
        print(f"Error during reproduction: {e}")
    finally:
        # Clean up
        chat.delete()


if __name__ == "__main__":
    reproduce()

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
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import ChatEntry
from core.tasks import process_new_chat_entry


def reproduce():
    print("Starting reproduction of Freshchat delivery issue...")

    # 1. Create a dummy ChatEntry
    chat = ChatEntry.objects.create(
        timestamp=timezone.now(),
        source="freshchat",
        sender_id="user_test_123",
        message="I want to check my wallet balance. How much do I have?, my email is ayobamidele006+4@gmail.com",
        metadata={
            "conversation_id": "84203891-d49e-4d7d-ac99-d654c7d80bb2"
        },  # Use real conversation ID if possible
    )
    print(f"Created chat entry: {chat.id}")

    try:
        # 2. Run the task
        print("Running core.tasks.process_new_chat_entry...")
        result = process_new_chat_entry(chat.id)
        print(f"\n--- TASK RESULT ---")
        print(result)
        print("--------------------\n")

    except Exception as e:
        print(f"Error during reproduction: {e}")
        import traceback

        traceback.print_exc()
    finally:
        # Clean up
        chat.delete()


if __name__ == "__main__":
    reproduce()

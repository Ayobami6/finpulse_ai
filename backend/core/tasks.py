from celery import shared_task
from .models import LogEntry, ChatEntry, IssueCluster
from django.utils import timezone
from .services.ingestion_service import IngestionService
from .services.ai_service import AIService
from .services.system_log_service import SystemLogService
from .services.freshchat_service import FreshchatService
import logging
from .services.whatsapp_service import WhatsAppService

logger = logging.getLogger(__name__)


@shared_task
def process_new_log_entry(log_id):
    try:
        log = LogEntry.objects.get(id=log_id)
        # Simple heuristic or clustering hook
        if log.level == "ERROR":
            print(f"Processing ERROR log: {log.message}")
            # In real implementation: AIService.cluster_issues([log.message])
    except LogEntry.DoesNotExist:
        pass


@shared_task
def poll_system_logs():
    print("Polling system logs...")
    count = SystemLogService.poll_logs()
    if count > 0:
        print(f"Ingested {count} new system logs")
    return count


@shared_task
def process_new_chat_entry(chat_id):
    """
    Triggers the Agentic Smart Reply pipeline for a single message.
    """
    logger.info(f"Triggering Smart Reply task for chat {chat_id}...")
    try:
        chat = ChatEntry.objects.get(id=chat_id)
        result = AIService.run_smart_reply(chat_id)

        if not result:
            logger.warning(f"Smart Reply returned empty result for chat {chat_id}")
            # Mark as processed anyway to avoid loops
            chat.processed = True
            chat.save()
            return "No result from AI"

        logger.info(f"Smart Reply Result for {chat_id}: {result[:100]}...")

        # 1. Send the actual reply if we got one
        # Check source
        sent = False
        if chat.metadata.get("conversation_id"):
            conv_id = chat.metadata.get("conversation_id")
            logger.info(f"Attempting to send Smart Reply to Freshchat: {conv_id}")
            service = FreshchatService()
            send_resp = service.send_message(conv_id, result)
            if send_resp:
                logger.info(f"Successfully sent Smart Reply to Freshchat {conv_id}")
                sent = True
            else:
                logger.error(f"Failed to send Smart Reply to Freshchat {conv_id}")
        elif chat.metadata.get("wa_id") or chat.sender_id.startswith("+"):
            logger.info(f"Attempting to send Smart Reply to WhatsApp: {chat.sender_id}")
            WhatsAppService().send_message(chat.sender_id, result)
            sent = True
        else:
            logger.warning(
                f"No source metadata found for chat {chat_id}, reply skipped."
            )

        # 2. Mark as processed
        chat.processed = True
        chat.save()
        return f"Sent: {sent}"

    except ChatEntry.DoesNotExist:
        logger.error(f"Chat {chat_id} not found.")
    except Exception as e:
        logger.exception(f"Error in Smart Reply task for chat {chat_id}: {e}")


@shared_task
def poll_chat_sources():
    print("Polling chat sources...")
    results = IngestionService.poll_sources()
    for source, count in results.items():
        if count > 0:
            print(f"Ingested {count} new messages from {source}")
    return results


@shared_task
def run_clustering_task():
    """
    Orchestrates the Pure Agentic AI pipeline.
    Passes all unprocessed data to the ADK agents.
    """
    # 1. Fetch unprocessed chats
    chats = ChatEntry.objects.filter(processed=False)[:50]  # Smaller batch for quality
    if not chats:
        print("No new chats to process.")
        return

    print(f"Processing {len(chats)} raw chats via Agentic Pipeline...")

    # 2. Prepare raw payload
    raw_payload = {
        "timestamp": str(timezone.now()),
        "messages": [
            {
                "id": c.id,
                "message": c.message,
                "conversation_id": (c.metadata.get("conversation_id")),
                "timestamp": str(c.timestamp),
                "sender_id": c.sender_id,
                "metadata": c.metadata,
            }
            for c in chats
        ],
    }

    # 3. Run the pure agentic pipeline
    # The agents will Group, Analyze, Triage, and Act (Save)
    print("let's see the raw_data: ", raw_payload)
    try:
        result = AIService.run_agentic_pipeline(raw_payload)
        print(f"Agentic Pipeline Result: {result[:100]}...")

        # 4. Mark all as processed
        for chat in chats:
            chat.processed = True
            chat.save()

    except Exception as e:
        print(f"Pipeline Error: {e}")

    print("Agentic intelligence processing complete.")

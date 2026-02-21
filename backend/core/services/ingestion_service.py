import random
from datetime import datetime, timedelta
from django.utils import timezone
from ..models import ChatEntry, IngestionLog
from .freshchat_service import FreshchatService


class IngestionService:
    """
    Service to handle data ingestion from various sources (WhatsApp, Freshchat, etc.)
    """

    @staticmethod
    def poll_sources():
        """
        Polls all configured sources for new data.
        """
        sources = ["whatsapp", "freshchat"]
        results = {}

        fc_service = FreshchatService()

        for source in sources:
            # Get last offset/timestamp
            ingestion_log, created = IngestionLog.objects.get_or_create(source=source)

            if source == "freshchat":
                # For freshchat, we'll use from_time based on last_polled_at
                # Although we could also use the offset if it's a message ID
                from_time = None
                if ingestion_log.last_polled_at and not created:
                    # Freshchat expects ISO 8601 with milliseconds
                    from_time = ingestion_log.last_polled_at.strftime(
                        "%Y-%m-%dT%H:%M:%S.000Z"
                    )

                # Fetch all conversations (for simplicity, just first page)
                conversations = fc_service.list_conversations()
                new_messages_count = 0

                for conv in conversations:
                    messages = fc_service.get_messages(
                        conv["conversation_id"], from_time=from_time
                    )
                    for msg in messages:
                        processed_msg = fc_service.process_message(msg)

                        # Avoid duplicates: only save if doesn't exist
                        ChatEntry.objects.get_or_create(
                            external_id=processed_msg["id"],
                            defaults={
                                "timestamp": processed_msg["timestamp"],
                                "source": source,
                                "sender_id": processed_msg["sender_id"],
                                "message": processed_msg["message"],
                                "metadata": processed_msg["metadata"],
                                "processed": False,
                            },
                        )
                        new_messages_count += 1

                # Update IngestionLog timestamp is automatic on save() due to auto_now=True
                ingestion_log.save()
                results[source] = new_messages_count

            else:
                # Mocked for others (e.g. whatsapp)
                last_offset = int(ingestion_log.offset) if ingestion_log.offset else 0
                new_data, new_offset = IngestionService._fetch_mock_data(
                    source, last_offset
                )

                if new_data:
                    for item in new_data:
                        ChatEntry.objects.create(
                            timestamp=item["timestamp"],
                            source=source,
                            external_id=item["id"],
                            sender_id=item["sender_id"],
                            message=item["message"],
                            metadata=item.get("metadata", {}),
                            processed=False,
                        )
                    ingestion_log.offset = str(new_offset)
                    ingestion_log.save()
                    results[source] = len(new_data)
                else:
                    results[source] = 0

        return results

    @staticmethod
    def _fetch_mock_data(source, last_offset):
        """
        Simulates fetching data from an external API.
        Returns a list of dicts and the new offset.
        """
        # Simulate no new data sometimes
        if random.random() < 0.3:
            return [], last_offset

        # Generate 1-5 new messages
        num_messages = random.randint(1, 5)
        new_data = []
        current_offset = last_offset

        sample_messages = [
            "I cannot transfer money to my bank account.",
            "Why was my loan application rejected?",
            "My account has been blocked without reason.",
            "The app crashes when I try to login.",
            "How do I change my password?",
            "Transfer failed but money was deducted.",
            "I need to speak to an agent immediately.",
        ]

        for i in range(num_messages):
            current_offset += 1
            msg = {
                "id": f"{source}_{current_offset}",
                "sender_id": f"user_{random.randint(1000, 9999)}",
                "message": random.choice(sample_messages),
                "timestamp": timezone.now(),
                "metadata": {"original_source": source},
            }
            new_data.append(msg)

        return new_data, current_offset

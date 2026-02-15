import random
from datetime import datetime, timedelta
from django.utils import timezone
from ..models import ChatEntry, IngestionLog

class IngestionService:
    """
    Service to handle data ingestion from various sources (WhatsApp, Freshchat, etc.)
    """

    @staticmethod
    def poll_sources():
        """
        Polls all configured sources for new data.
        """
        sources = ['whatsapp', 'freshchat']
        results = {}

        for source in sources:
            # Get last offset
            ingestion_log, created = IngestionLog.objects.get_or_create(source=source)
            last_offset = int(ingestion_log.offset) if ingestion_log.offset else 0
            
            # Fetch new data (Mocked for now)
            new_data, new_offset = IngestionService._fetch_mock_data(source, last_offset)
            
            if new_data:
                # Save to ChatEntry
                for item in new_data:
                    ChatEntry.objects.create(
                        timestamp=item['timestamp'],
                        source=source,
                        external_id=item['id'],
                        sender_id=item['sender_id'],
                        message=item['message'],
                        metadata=item.get('metadata', {}),
                        processed=False
                    )
                
                # Update IngestionLog
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
            "I need to speak to an agent immediately."
        ]

        for i in range(num_messages):
            current_offset += 1
            msg = {
                'id': f"{source}_{current_offset}",
                'sender_id': f"user_{random.randint(1000, 9999)}",
                'message': random.choice(sample_messages),
                'timestamp': timezone.now(),
                'metadata': {'original_source': source}
            }
            new_data.append(msg)

        return new_data, current_offset

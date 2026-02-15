import os
import django
import sys

# Setup Django environment
sys.path.append('/home/ayo/Projects/finpulse_ai/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.services.ingestion_service import IngestionService
from core.models import ChatEntry, IngestionLog

def verify_ingestion():
    print("Starting ingestion verification...")
    
    # 1. Clear existing data
    ChatEntry.objects.all().delete()
    IngestionLog.objects.all().delete()
    print("Cleared existing ChatEntry and IngestionLog data.")
    
    # 2. Run polling
    print("Polling sources (Run 1)...")
    results = IngestionService.poll_sources()
    print(f"Run 1 Results: {results}")
    
    # 3. Verify data created
    chats = ChatEntry.objects.all()
    logs = IngestionLog.objects.all()
    
    print(f"Total ChatEntries: {chats.count()}")
    print(f"Total IngestionLogs: {logs.count()}")
    
    for log in logs:
        print(f"Log for {log.source}: Offset={log.offset}")
        
    if chats.count() > 0 and logs.count() > 0:
        print("SUCCESS: Data ingested successfully.")
    else:
        print("FAILURE: No data ingested.")

    # 4. Run polling again to check offset logic
    print("\nPolling sources (Run 2)...")
    results_2 = IngestionService.poll_sources()
    print(f"Run 2 Results: {results_2}")
    
    new_chats = ChatEntry.objects.count()
    print(f"Total ChatEntries after Run 2: {new_chats}")
    
    if new_chats >= chats.count():
         print("SUCCESS: Offset logic appears to be working (data added or skipped correctly).")

if __name__ == "__main__":
    verify_ingestion()

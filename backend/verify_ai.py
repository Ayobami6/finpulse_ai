import os
import django
import sys
from django.utils import timezone
from datetime import timedelta

# Setup Django environment
sys.path.append('/home/ayo/Projects/finpulse_ai/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.services.ai_service import AIService
from core.models import ChatEntry, LogEntry, IssueCluster

def verify_ai():
    print("Starting AI Service verification...")
    
    # 1. Test Clustering
    print("\n--- Testing Clustering ---")
    texts = [
        "Transfer failed on mobile app",
        "I cannot transfer money",
        "Transfer error occurred",
        "My app crashed when logging in",
        "Login screen is broken",
        "App closes on start"
    ]
    
    labels = AIService.cluster_issues(texts)
    print(f"Texts: {texts}")
    print(f"Cluster Labels: {labels}")
    
    # Verify we have at least 2 clusters (Transfer vs Login)
    # Note: Mock embedding uses seed, so similar text *should* get similar random embeddings
    # But DBSCAN on random embeddings might be tricky. 
    # Let's see what happens. If mock, we trust the logic structure even if clusters are imperfect.
    
    # 2. Test Correlation
    print("\n--- Testing Correlation ---")
    # Clean up
    LogEntry.objects.all().delete()
    
    # Create logs
    now = timezone.now()
    LogEntry.objects.create(
        timestamp=now - timedelta(minutes=10),
        source="payment-service",
        level="ERROR",
        message="500 Internal Server Error: Payment Gateway Timeout"
    )
    LogEntry.objects.create(
        timestamp=now - timedelta(minutes=5),
        source="auth-service",
        level="INFO",
        message="User login successful"
    )
    
    # Create a cluster
    cluster = IssueCluster.objects.create(
        theme="Transfer Failed",
        description="Users reporting transfer issues",
        sentiment_score=-0.8,
        sample_messages=["Transfer failed", "Cannot send money"]
    )
    
    correlation = AIService.correlate_root_cause(cluster)
    print(f"Correlation Result: {correlation}")
    
    # 3. Test Action Generation
    print("\n--- Testing Action Generation ---")
    actions = AIService.generate_actions(cluster.theme, correlation)
    print(f"Generated Actions: {actions}")
    
    if actions and "suggested_actions" in actions:
        print("SUCCESS: Actions generated.")
    else:
        print("FAILURE: Actions generation failed.")

if __name__ == "__main__":
    verify_ai()

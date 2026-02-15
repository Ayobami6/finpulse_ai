import os
import django
import sys
import time
from django.utils import timezone
from datetime import timedelta

# Setup Django environment
sys.path.append('/home/ayo/Projects/finpulse_ai/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import ChatEntry, LogEntry, IssueCluster, ActionRecommendation
from core.tasks import run_clustering_task
from core.services.ai_service import AIService

def verify_end_to_end():
    print("Starting End-to-End Verification...")
    
    # 1. Clear DB
    print("\n[Step 1] Clearing Database...")
    ChatEntry.objects.all().delete()
    LogEntry.objects.all().delete()
    IssueCluster.objects.all().delete()
    ActionRecommendation.objects.all().delete()
    
    # 2. Seed Data
    print("\n[Step 2] Seeding Data...")
    
    # a. Create System Logs (Root Cause)
    now = timezone.now()
    LogEntry.objects.create(
        timestamp=now - timedelta(minutes=15),
        source="transfer-service",
        level="ERROR",
        message="Connection refused to core-banking-system:5432"
    )
    LogEntry.objects.create(
        timestamp=now - timedelta(minutes=14),
        source="transfer-service",
        level="ERROR",
        message="Transaction timed out for ID: tx_12345"
    )
    print("-> Seeded 2 Error Logs.")
    
    # b. Create Chat Complaints
    complaints = [
        "My transfer is stuck pending",
        "Money left my account but receiver didn't get it",
        "Transfer failed again",
        "Why is the transfer service down?",
        "I cannot send money to anyone"
    ]
    for msg in complaints:
        ChatEntry.objects.create(
            timestamp=now - timedelta(minutes=10),
            source="whatsapp",
            sender_id="user_test",
            message=msg,
            processed=False
        )
    print(f"-> Seeded {len(complaints)} Chat Entries.")
    
    # 3. Run Pipeline
    print("\n[Step 3] Running AI Pipeline (Clustering -> Correlation -> Action -> Alert)...")
    run_clustering_task()
    
    # 4. Verification
    print("\n[Step 4] Verifying Results...")
    
    # Check Cluster
    cluster = IssueCluster.objects.first()
    if cluster:
        print(f"✅ Issue Cluster Created: {cluster.theme}")
        print(f"   - Frequency: {cluster.frequency}")
        print(f"   - Root Cause Analysis: {cluster.root_cause_analysis}")
        
        # Verify Correlation Content (Mock or Real)
        if "transfer-service" in str(cluster.root_cause_analysis) or "Connection refused" in str(cluster.root_cause_analysis) or "Mock" in str(cluster.root_cause_analysis):
             print("   - Correlation content seems relevant.")
        else:
             print("   - WARNING: Correlation content might be off.")

        # Check Action
        action = ActionRecommendation.objects.filter(cluster=cluster).first()
        if action:
            print(f"✅ Action Recommendation Created.")
            print(f"   - Summary: {action.summary}")
            print(f"   - Suggested Actions: {action.suggested_actions}")
        else:
            print("❌ FAILED: No ActionRecommendation created.")
            
    else:
        print("❌ FAILED: No IssueCluster created.")

if __name__ == "__main__":
    verify_end_to_end()

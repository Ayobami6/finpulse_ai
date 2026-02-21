from celery import shared_task
from .models import LogEntry, ChatEntry, IssueCluster


from .services.ai_service import AIService


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
def process_new_chat_entry(chat_id):
    try:
        chat = ChatEntry.objects.get(id=chat_id)

        # Sentiment Analysis
        sentiment = AIService.analyze_sentiment(chat.message)
        chat.sentiment_score = sentiment
        chat.save()
        print(f"Processed chat {chat.id}: Sentiment={sentiment}")

    except ChatEntry.DoesNotExist:
        pass


from .services.ingestion_service import IngestionService


@shared_task
def poll_chat_sources():
    print("Polling chat sources...")
    results = IngestionService.poll_sources()
    for source, count in results.items():
        if count > 0:
            print(f"Ingested {count} new messages from {source}")

    # Trigger processing for new chats (optional, could be event-driven)
    # For now, we rely on a separate schedule or trigger logic if needed.
    # But ideally, we might want to schedule individual processing tasks here.
    # process_new_chat_entry.delay(chat_id) - We'd need the IDs.

    return results


@shared_task
def run_clustering_task():
    from .services.alert_service import AlertService
    from .models import ActionRecommendation

    """
    Orchestrates the full AI pipeline:
    1. Fetch unprocessed chats.
    2. Cluster them.
    3. For each cluster:
       a. Correlate with logs.
       b. Generate actions.
       c. Alert teams.
    """
    # 1. Fetch unprocessed chats
    chats = ChatEntry.objects.filter(processed=False)[:100]
    if not chats:
        print("No new chats to process.")
        return

    print(f"Processing {len(chats)} chats...")
    texts = [c.message for c in chats]

    # 2. Cluster
    labels = AIService.cluster_issues(texts)

    # Group chats by label
    clusters_data = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue
        if label not in clusters_data:
            clusters_data[label] = []
        clusters_data[label].append(chats[i])

    print(f"Found {len(clusters_data)} clusters.")

    # 3. Process each cluster
    for label, cluster_chats in clusters_data.items():
        # Determine theme (naive: use first message)
        # In production: use LLM to summarize "What do these messages have in common?"
        theme_text = cluster_chats[0].message[:50]
        theme = f"Issue: {theme_text}..."

        # Create/Update Cluster
        # Note: In a real system, we might merge with existing similar clusters.
        # Here we create a new one for the batch or get by theme if exact match.
        cluster, created = IssueCluster.objects.get_or_create(
            theme=theme,
            defaults={
                "sentiment_score": 0.0,
                "description": "Pending analysis",
                "frequency": 0,
            },
        )

        # Update stats
        cluster.frequency += len(cluster_chats)
        cluster.sample_messages = [c.message for c in cluster_chats[:5]]

        # Calculate average sentiment
        sentiments = [
            c.sentiment_score for c in cluster_chats if c.sentiment_score is not None
        ]
        cluster.sentiment_score = (
            sum(sentiments) / len(sentiments) if sentiments else 0.0
        )

        cluster.description = f"Cluster of {len(cluster_chats)} messages. First: {cluster_chats[0].message}"

        # 3a. Correlate Root Cause
        # Only run if we haven't already or if we want to refresh (e.g. only for new clusters)
        if not cluster.root_cause_analysis:
            correlation = AIService.correlate_root_cause(cluster)
            cluster.root_cause_analysis = correlation

        cluster.save()

        # 3b. Generate Actions
        # Check if action already exists
        if not hasattr(cluster, "actions") or not cluster.actions.exists():
            actions_data = AIService.generate_actions(
                cluster.description, cluster.root_cause_analysis
            )
            if actions_data:
                action_rec = ActionRecommendation.objects.create(
                    cluster=cluster,
                    summary=actions_data.get("summary", ""),
                    likely_root_cause=actions_data.get("likely_root_cause", ""),
                    suggested_actions=actions_data.get("suggested_actions", []),
                )

                # 3c. Alert Teams
                AlertService.notify_teams(cluster, action_rec)

        # Mark chats as processed
        for chat in cluster_chats:
            chat.processed = True
            chat.save()

    # Handle noise (label -1)
    noise_chats = [chats[i] for i, l in enumerate(labels) if l == -1]
    for chat in noise_chats:
        chat.processed = True  # Mark processed so we don't re-cluster forever?
        # Or maybe leave false to retry with more data?
        # For this MVP, let's mark processed to clear queue.
        chat.save()

    print("Clustering task complete.")

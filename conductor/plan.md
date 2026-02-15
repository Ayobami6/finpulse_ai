# Implementation Plan - FinPulse AI

## Goal
Build the core backend systems for FinPulse AI, enabling data ingestion from chats and logs, AI-driven clustering and root cause analysis, and automated action generation.

## User Review Required
> [!IMPORTANT]
> This plan assumes we will use OpenAI for embeddings and LLM tasks. Please ensure `OPENAI_API_KEY` is set in the environment.
> We will simulate "Freshchat/WhatsApp" and "System Logs" ingestion for development unless specific API credentials are provided.

## Proposed Changes

### Phase 1: Data Ingestion & Models
#### [MODIFY] [backend/core/models.py](file:///home/ayo/Projects/finpulse_ai/backend/core/models.py)
- Update `ChatEntry` to include `external_id` for deduplication.
- Update `LogEntry` to ensuring `source` and `metadata` are flexible enough for Docker/Gunicorn logs.
- Create `IngestionLog` model to track offsets/last-polled timestamps for chat sources.

#### [NEW] [backend/core/services/ingestion_service.py](file:///home/ayo/Projects/finpulse_ai/backend/core/services/ingestion_service.py)
- Implement `IngestionService` to handle polling logic.
- Implement mock adapters for WhatsApp/Freshchat to generate sample data for testing.

#### [MODIFY] [backend/core/tasks.py](file:///home/ayo/Projects/finpulse_ai/backend/core/tasks.py)
- Implement `poll_chat_sources` to use `IngestionService`.
- Ensure `process_new_log_entry` triggers analysis.

### Phase 2: AI Engine (Clustering & Correlation)
#### [MODIFY] [backend/core/services/ai_service.py](file:///home/ayo/Projects/finpulse_ai/backend/core/services/ai_service.py)
- Robustify `get_embedding` with error handling and retries.
- Implement `cluster_issues` using `scikit-learn` (DBSCAN/KMeans) on embeddings.
- Implement `correlate_root_cause(cluster)`:
    - Logic to query `LogEntry` objects that occurred within a time window of the cluster's chats.
    - Use LLM to analyze the correlation between Chat text and Log error messages.

#### [MODIFY] [backend/core/models.py](file:///home/ayo/Projects/finpulse_ai/backend/core/models.py)
- Add `root_cause_analysis` field to `IssueCluster`.

### Phase 3: Automation & Actions
#### [MODIFY] [backend/core/services/action_service.py](file:///home/ayo/Projects/finpulse_ai/backend/core/services/action_service.py)
- Implement `ActionGenerator` to produce summaries/fixes using OpenAI.
- Implement `AlertService` to send emails/create ClickUp tasks (mocked interfaces initially).

#### [MODIFY] [backend/core/views.py](file:///home/ayo/Projects/finpulse_ai/backend/core/views.py)
- Exposre `IssueCluster` detailed view with "Action" button to trigger manual automation overrides.

## Verification Plan

### Automated Tests
- Run `python manage.py test core` to verify model constraints and service logic.
- Create specific tests for `AIService` causing mocks to ensure clustering logic holds together (e.g. "3 similar texts should form a cluster").

### Manual Verification
1.  **Ingestion:** Run the polling task manually via shell (`python manage.py shell`) and verify `ChatEntry` objects are created.
2.  **Clustering:** Trigger `run_clustering_task` and verify `IssueCluster` objects are created in the Django Admin.
3.  **End-to-End:** 
    - Post a "Transfer Failed" log via API.
    - Simulate 5 "Transfer Failed" chat messages.
    - Run clustering.
    - Verify the resulting Cluster links to the Log Entry in the "Root Cause" field.

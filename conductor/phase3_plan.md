# Implementation Plan - Phase 3: Automation & End-to-End Flow

## Goal
Implement the automation layer that acts on AI insights. This includes updating background tasks to orchestrate the AI pipeline (Clustering -> Correlation -> Action) and implementing an `AlertService` to dispatch notifications to email and ClickUp. Finally, expose these via API and verify the complete flow.

## Proposed Changes

### 1. Update Background Tasks
#### [MODIFY] [backend/core/tasks.py](file:///home/ayo/Projects/finpulse_ai/backend/core/tasks.py)
- Update `run_clustering_task`:
    - Fetch unprocessed `ChatEntry`s.
    - Call `AIService.cluster_issues`.
    - For each new cluster:
        - specific logic to name the cluster (e.g. using the most frequent terms or LLM).
        - Call `AIService.correlate_root_cause`.
        - Call `AIService.generate_actions`.
        - Save `IssueCluster` and `ActionRecommendation`.
        - Call `AlertService.notify_teams`.

### 2. Implement Alert Service
#### [NEW] [backend/core/services/alert_service.py](file:///home/ayo/Projects/finpulse_ai/backend/core/services/alert_service.py)
- `notify_teams(cluster, action_rec)`:
    - Mock sending emails to `TeamMember`s based on department.
    - Mock creating ClickUp tasks.
    - Log the alerts for verification.

### 3. API Updates
#### [MODIFY] [backend/core/views.py](file:///home/ayo/Projects/finpulse_ai/backend/core/views.py)
- Ensure `IssueClusterViewSet` serves the full details including `root_cause_analysis` and nested `actions`.
- (Optional) Add an endpoint to trigger clustering manually for testing.

## Verification Plan

### Automated Logic Check
- `verify_end_to_end.py`:
    1. clear DB.
    2. Seed `LogEntry` (Error logs).
    3. Seed `ChatEntry` (Complaints).
    4. Call `run_clustering_task`.
    5. Assert `IssueCluster` exists.
    6. Assert `IssueCluster.root_cause_analysis` is populated.
    7. Assert `ActionRecommendation` exists.
    8. Assert "Alert sent" logs are present (stdout or mocked logger).

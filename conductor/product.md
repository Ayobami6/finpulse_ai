# Product Definition: FinPulse AI

## Vision
FinPulse AI is an automated intelligence layer for fintech operations. It listens to customer complaints (support tickets, chat logs) and system signals (error logs), correlates them to identify root causes, and provides actionable insights to Product, Engineering, and Operations teams. It moves organizations from reactive firefighting to proactive, data-driven resolution.

## Core Value Proposition
- **Automated Issue Detection:** Clusters raw support messages into thematic issues (e.g., "Transfer Failed") without manual tagging.
- **Root Cause Correlation:** Correlates customer complaint spikes with system error logs (e.g., 500 errors on `/api/transfer`).
- **Actionable Intelligence:** Generates problem summaries, likely root causes, and suggested fixes (e.g., "Fix API Key", "Update User Communication").
- **Closed-Loop Automation:** capable of alerting teams, creating tracking issues (ClickUp), and even auto-replying to customers with context-aware messages.

## Key Features

### 1. Data Ingestion & Sources
- **Chat/Support Sources:**
    - WhatsApp
    - Freshchat
    - *Mechanism:* Background worker pulls data with offset tracking to ensure data is persistent and never duplicated.
- **System Logs:**
    - Gunicorn, Uvicorn, Docker Container logs.
    - *Mechanism:* Custom `apt` package/agent to fetch logs from files and post them to the FinPulse system log entry API.

### 2. AI Engine & Analysis
- **Auto-Clustering:** Groups issues into themes using embeddings + LLM.
    - *Themes:* e.g., "Transfer failed", "Loan rejected", "Account blocked".
- **Cluster Insights:**
    - Frequency & Trend Analysis (Rising/Falling).
    - Sentiment Score.
    - Sample Customer Messages.
- **Root Cause Correlation:**
    - Correlates "What customers are saying" with "What systems are doing".
    - Uses time-based correlation and heuristic logic + AI explanation.
    - *Example:* "72% of ‘Transfer Failed’ complaints correlate with spike in /api/transfer 500 errors."
- **Action Generator:**
    - Generates a 1-paragraph problem summary.
    - Identifies likely root cause.
    - Suggests specific actions (Fix API timeout, Update Copy, etc.).

### 3. Automation Layer
- **Alerting:** Sends targeted emails to Support, Product, and Engineering based on analyzed clusters.
- **Issue Tracking:** Automatically creates and tags issues in ClickUp for relevant teams.
- **Smart Auto-Reply:** For channels can WhatsApp, the AI engine can reply to users with a professional tone, calibrated by the sentiment analysis of the incoming message.

### 4. Executive Dashboard ("The Demo Candy")
- **Top 5 Issues This Week:** Ranked by severity/volume.
- **Trends:** Graphical representation of issue movement.
- **Customer Sentiment:** "Most angry customer segment".
- **System Health:** System components most implicated in current issues.

## Target Users & Roles
- **Customer Support:** Needs to know *what* to tell angry users.
- **Product:** Needs to know *what* features are breaking trust.
- **Engineering:** Needs to know *why* it's breaking (logs/correlation).
- **Ops:** Needs to oversee the health of the entire financial operation.

## Success Metrics
- Reduction in "Time to Detection" for operational issues.
- Reduction in manual ticket tagging/triage time.
- Increased accuracy in linking user complaints to system incidents.

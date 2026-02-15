# Implementation Plan - Dashboard UI Overhaul

## Goal
Revamp the dashboard UI to match the "Premium" design requested by the user. This includes a new layout, detailed issue cards, bar charts, and a customer segments section.

## Proposed Changes

### 1. Components
#### [MODIFY] [frontend/src/components/dashboard/StatsCard.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/dashboard/StatsCard.tsx)
- Update styling to match the screenshot (cleaner look, icon on right).
- Ensure trend indicator logic handles "neutral" and different colors correctly.

#### [NEW] [frontend/src/components/dashboard/IssueCard.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/dashboard/IssueCard.tsx)
- Create a comprehensive card component for a single issue cluster.
- **Props:** `cluster` (Object containing theme, severity, trend, correlation, complaints count, sentiment, root cause, etc.).
- **UI Elements:**
    - Header: Title, Severity Badge, Trend.
    - Description: Correlation info.
    - Stats Row: Complaints icon/count, Sentiment icon/score, Time range.
    - Root Cause Section: Text description.
    - Actions: "View Details", "Create Ticket", "Send Alert" buttons.

#### [MODIFY] [frontend/src/components/dashboard/IssueClusterList.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/dashboard/IssueClusterList.tsx)
- Update to render a list of `IssueCard` components instead of inline divs.
- Remove inline styling in favor of Tailwind classes (if possible) or cleaner CSS.

#### [NEW] [frontend/src/components/dashboard/ComponentImpactChart.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/dashboard/ComponentImpactChart.tsx)
- Create a Bar Chart using Recharts showing "Most Affected Components".
- Data: `[{ name: '/api/transfer', value: 145 }, ...]`.

#### [NEW] [frontend/src/components/dashboard/CustomerSegmentList.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/dashboard/CustomerSegmentList.tsx)
- Create a component to list "Most Affected Customer Segments".
- **UI Elements:** List items with Segment Name, Description, Sentiment Score (red/yellow/green), Complaint Count.

### 2. Pages
#### [MODIFY] [frontend/src/app/page.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/app/page.tsx)
- **Layout:**
    - Section 1: Stats Cards (Grid 4 cols).
    - Section 2: "Top 5 Issues This Week" (Full width `IssueClusterList`).
    - Section 3: Charts (Grid 2 cols: Trend Chart, Component Impact Chart).
    - Section 4: Customer Segments (`CustomerSegmentList`).
- **Mock Data:** Update `MOCK_DATA` to include fields required for the new UI (severity, correlation details, component stats, segments).

## Verification Plan
### Manual Verification
1.  Run `npm run dev`.
2.  Open `http://localhost:3000`.
3.  Verify the layout matches the screenshot structure.
4.  Check responsiveness (basic check, though full mobile optimization is secondary to the main desktop layout).
5.  Interact with buttons (hover states).

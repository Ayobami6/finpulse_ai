# Implementation Plan - Design System Extension

## Goal
Extend the "Premium" dashboard design to the remaining pages (`/issues`, `/chats`, `/team`) to ensure a consistent and polished user experience.

## Proposed Changes

### 1. Issues Page (`/issues`)
#### [MODIFY] [frontend/src/app/issues/page.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/app/issues/page.tsx)
- Replace inline styles with Tailwind classes.
- Standardize the page header (Title + Subtitle).
- Use the standard `StatsCard` or similar summary at the top if needed (e.g., "Active Issues Count").

### 2. Chats Page (`/chats`)
#### [NEW] [frontend/src/components/chats/ChatCard.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/chats/ChatCard.tsx)
- Create a reusable card for a single chat entry.
- **UI:** Sender Avatar/Icon, Message body, Timestamp, Source Icon (WhatsApp/Freshchat), Sentiment Badge.

#### [MODIFY] [frontend/src/app/chats/page.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/app/chats/page.tsx)
- Use `ChatCard`.
- Apply standard page layout.

### 3. Team Page (`/team`)
#### [MODIFY] [frontend/src/app/team/page.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/app/team/page.tsx)
- Replace placeholder with a real list of team members.
- Use a `TeamMemberCard` or table layout.

## Verification Plan
1. Check `/issues` -> Should look like the "Top Issues" section of Dashboard but full page.
2. Check `/chats` -> Should list chats with polished cards.
3. Check `/team` -> Should show team list.

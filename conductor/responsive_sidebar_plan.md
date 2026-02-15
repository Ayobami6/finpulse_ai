# Implementation Plan - Responsive Sidebar

## Goal
Make the sidebar responsive so it works well on mobile devices.

## Proposed Changes

### Components
#### [MODIFY] [frontend/src/components/layout/Sidebar.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/layout/Sidebar.tsx)
- Add state for `isOpen` (mobile menu).
- Add a Hamburger button visible only on mobile.
- Update `aside` class to handle mobile positioning (fixed, overlay).
- Add functionality to close sidebar when a link is clicked on mobile.

### Styling
#### [MODIFY] [frontend/src/components/layout/Sidebar.module.css](file:///home/ayo/Projects/finpulse_ai/frontend/src/components/layout/Sidebar.module.css)
- Add media queries (`@media (max-width: 768px)`).
- default styling for desktop (visible).
- mobile styling:
    - `position: fixed`
    - `z-index: 50`
    - `transform: translateX(-100%)` (hidden by default)
    - `&.open { transform: translateX(0) }`

#### [MODIFY] [frontend/src/app/layout.tsx](file:///home/ayo/Projects/finpulse_ai/frontend/src/app/layout.tsx)
- No major changes needed if Sidebar handles its own fixed positioning on mobile, pushing content isn't usually desired on mobile (overlay is better).

## Verification Plan
1. Open in browser.
2. Resize window to mobile width (<768px).
3. Verify sidebar disappears and hamburger icon appears.
4. Click hamburger -> Sidebar slides in.
5. Click a link -> Sidebar closes and navigates.

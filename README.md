# Grantly

Grantly is a local-first scholarship discovery and application management app for Indian students. Build a profile, compare a transparent eligibility breakdown across 36 sample scholarships, and track applications, documents, and deadlines in one place.

## Product flow

1. **Discover** the full catalog with search, filters, amount range, match sorting, and grid/list views.
2. **Understand the match** through eligible, nearly eligible, or not eligible results and plain-language criterion reasons.
3. **Prepare** with scholarship-specific checklists and a shared document vault.
4. **Track** applications on a keyboard-accessible board or list and see relevant deadlines on the dashboard, calendar, and notification bell.

The demo profile is replaceable and marked with a dismissible banner. It seeds five tracker applications, partial document progress, and near-term reminders. Reset local data on the Profile page.

## Project structure

- `src/data/` contains the scholarship catalog and demo profile.
- `src/lib/match.ts` evaluates eligibility and builds criterion explanations.
- `src/lib/deadlines.ts` selects relevant deadlines shared by dashboard, calendar, and notifications.
- `src/lib/discover.ts`, `calendar.ts`, `tracker.ts`, and `workspace.ts` hold filtering and app data logic.
- `src/store/` contains persisted Zustand stores for profile, tracker, compare selection, preferences, and toast state.
- `src/pages/` contains route-level screens, loaded as separate chunks.
- `src/components/` contains shared layout, scholarship, tracker, and accessible UI components.
- `public/` contains the local favicon and social preview image.

## Match model

Eight weighted criteria make up the 100 point score: education (15), field (20), category (15), state (10), income (15), marks (15), gender (5), and special flags (5). A failed hard eligibility criterion is shown as **Not eligible**. Close misses can be **Nearly eligible** and explain the gap. Optional criteria without a scholarship requirement do not reduce the score. Discover includes all scholarships until the user chooses to show only eligible results.

## Design and accessibility

- The palette uses deep ink `#16215B` for text on light cards and primary indigo `#1F299C` for key labels. Cyan is reserved for accents; status is also identified by text and icons.
- Light and dark themes are supported. System preference is the default; users can change it in the header.
- Layouts support narrow mobile through wide desktop widths. Mobile navigation sits at the bottom, while desktop uses a collapsible sidebar.
- Keyboard users can skip to main content, use tabs and tracker controls, and navigate dialogs with a focus trap. Dragging has keyboard and menu alternatives.
- Motion follows the operating system's reduced-motion setting. Empty states explain how to continue.
- Form errors and toast updates are announced to assistive technology; dialogs expose labels and descriptions.

## Local data and privacy

Profile, tracker, reminders, and preferences are persisted in this browser's local storage. The app has no backend and does not upload profile data. Export a JSON backup on Profile; imports are validated before any workspace state is changed. Scholarship records and deadlines are mock data. Fonts use local system fallbacks so the app does not require a third-party font request.

## Run locally

Requires Node.js 20.19+ or 22.12+ (Vite 7 requirement).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Other project checks:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

Import this repository in Vercel and use the project root containing this `package.json`. The checked-in `vercel.json` configures Vite's production build, publishes `dist`, and routes app URLs back to the SPA entry point so direct navigation and refreshes work. No environment variables are required; the app stores profile data in browser local storage.

## Current scope and future work

This submission uses a curated mock catalog and browser-only storage. A production release would need verified scholarship sources and renewal schedules, a secure optional account and cross-device backup, server-side reminders, and a maintained localization/accessibility review process. Apply through each scholarship's official provider; Grantly helps organize discovery and preparation rather than submitting applications.

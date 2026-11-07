# Grantly

Grantly is a local-first scholarship discovery and application management app for Indian students. Build a profile, compare a transparent eligibility breakdown across 36 scholarships, and track applications, documents, and deadlines in one place.

## Product Flow

1. **Discover** the catalog with search, filters, amount range, match sorting, and grid/list views.
2. **Understand the match** through eligible, nearly eligible, or not eligible results and plain-language criterion reasons.
3. **Prepare** with scholarship-specific checklists and a shared document vault.
4. **Track** applications on a keyboard-accessible Kanban board or list and see relevant deadlines on the dashboard, calendar, and notification bell.

The demo profile is replaceable and marked with a dismissible banner. It seeds five tracker applications, partial document progress, and near-term reminders. Reset local data at any time on the Profile page.

## Architecture

Grantly follows a clean unidirectional data flow:
```
data (mock catalog & demo fixtures)
  └──> lib (pure domain logic: match engine, date math, Zod schemas, workspace)
        └──> store (persisted Zustand stores with schema rehydration)
              └──> pages & components (React 18 + Tailwind UI views)
```

- **`src/data/`**: Read-only catalog of 36 scholarships (`scholarships.ts`), demo profile (`demoProfile.ts`), document definitions, and known IDs. Catalog data never mutates and has no dependency on user state.
- **`src/lib/`**: Pure functions for matching (`match.ts`), date/deadline calculations (`dates.ts`, `deadlines.ts`), search/filtering (`discover.ts`), Zod schemas (`schemas.ts`), secure storage adapter (`persistStorage.ts`), and backup validation (`workspace.ts`).
- **`src/store/`**: Local state persisted via `safeLocalStorage` with schema guards: `useProfileStore`, `useTrackerStore`, `useCompareStore`, `usePreferencesStore`, and `useToastStore`.
- **`src/pages/`**: Route components split into on-demand chunks via React Router.
- **`src/components/`**: Layout, tracker Kanban, scholarship cards, and accessible primitives (dialogs, toggles, form fields, badges).

### Match Engine Weights

Eligibility scoring calculates a transparent 100-point compatibility score across 8 criteria:
- **Field of study**: 20 points
- **Education level**: 15 points
- **Category (Caste / Reservation)**: 15 points
- **Annual family income**: 15 points
- **Academic marks / percentage**: 15 points
- **State of residence**: 10 points
- **Gender**: 5 points
- **Special flags** (first-generation learner, disability, minority, single girl child): 5 points

Blockers on non-negotiable criteria mark an application as **Not eligible**. Close criteria misses qualify as **Nearly eligible** with explicit advice on what to adjust.

## Security

- **Threat Model**: Grantly is a client-only single-page application with zero backend databases or remote APIs. The trust boundary is the student's browser and any uploaded JSON backup file. No secrets, credentials, or authentication tokens exist on the client.
- **Validation**:
  - **JSON import validation**: Backups are size-capped at 1 MB and strictly validated with Zod (`workspaceExportSchema`). Unknown object properties are stripped (`.strip()`), string inputs are length-bounded, and all enumerations are checked against canonical sets.
  - **Storage rehydration guards**: `safeLocalStorage` catches corrupt or blocked `localStorage` access without crashing. Zustand rehydration validates persisted states through `profilePersistSchema`, `trackerPersistSchema`, and `preferencesPersistSchema`.
  - **HTTPS-only External URLs**: All scholarship official links are validated via `safeExternalUrl` to require the `https:` protocol and open with `rel="noopener noreferrer"`.
  - **Identifier Sanitization**: URL route parameters are checked against strict alphanumeric kebab-case regexes (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`) before catalog lookup.
- **Security Headers (`vercel.json`)**:
  - `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`
  - `X-Content-Type-Options`: `nosniff`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`
  - `X-Frame-Options`: `DENY`
  - `Cache-Control`: `public, max-age=31536000, immutable` for `/assets/*`
  - Note: Early theme detection was extracted from an inline script to `/theme-init.js` so `script-src` remains strictly `'self'`.
- **Limitations**: As a client-only local app, it cannot defend against malware on the user's operating system, compromised browser extensions, or provide centralized account recovery.

## Performance

Measured with Lighthouse 12.8.2 against the production build preview (`vite preview` on `http://127.0.0.1:4186/`):

| Category | Desktop Score | Mobile Score | Target |
| :--- | :---: | :---: | :---: |
| **Performance** | **100** | **97** | 95+ (desktop) / 90+ (mobile) |
| **Accessibility** | **100** | **100** | 95+ (desktop) / 90+ (mobile) |
| **Best Practices** | **100** | **100** | 95+ (desktop) / 90+ (mobile) |
| **SEO** | **100** | **100** | 95+ (desktop) / 90+ (mobile) |

### Bundle & Loading Approach

- **Vendor & Feature Code-Splitting**:
  - `react-vendor`: React 18, React DOM, Scheduler isolated into a 141.86 kB chunk (45.59 kB gzip).
  - `drag-drop`: `@dnd-kit` modularized into an independent 37.85 kB lazy chunk (12.78 kB gzip), loaded only on Tracker.
  - Route chunks: All pages are lazy-loaded (e.g. Landing: 8.09 kB / 2.92 kB gzip; Dashboard: 9.85 kB / 3.36 kB gzip; Discover: 13.28 kB / 4.51 kB gzip).
  - Main shared bundle: 199.12 kB (59.41 kB gzip).
  - CSS: Single compiled Tailwind stylesheet of 39.78 kB (7.78 kB gzip).
- **Asset Optimization**:
  - Zero external font requests (using system typography fallbacks).
  - Search input debounced by 250 ms with paginated catalog rendering (9 items per page).
  - Pure SVG icons (`lucide-react`) and SVGs for favicon and OpenGraph preview images.
  - Valid `public/robots.txt` ensuring clean crawlability.

## Accessibility

- **Keyboard Navigation**:
  - Global skip link to `#main-content` on Tab.
  - Kanban board cards support keyboard-based status moves via a dedicated per-card status selector, as well as keyboard dragging using Space to lift, arrow keys to move columns, and Space to drop.
  - Calendar day buttons provide clear keyboard selection with full assistive date descriptions in `.sr-only` labels.
  - Modal dialogs trap focus on open and restore focus to trigger elements upon exit.
- **Announcements & Live Regions**:
  - Dynamic filter match counts and search results announce updates via `aria-live="polite"`.
  - Toast alerts use live regions for instant screen-reader feedback on application saves and removals.
  - Form validation errors link to input controls with `aria-describedby` and `role="alert"`.
- **Focus Management & Contrast**:
  - Explicit high-contrast `:focus-visible` ring (`2px solid #0373ff` with `2px` offset).
  - Fully compliant color contrast (WCAG 2.1 AA >= 4.5:1 for standard text, >= 3:1 for large text/icons) in both light and dark themes.
  - Respects OS `prefers-reduced-motion` by reducing transition durations to `0.001ms`.

## Testing

### Unit & Component Tests
Run unit and component tests with Vitest:
```sh
npm test
npm run test:coverage
```
- **Results**: 15 test files passed, 49 tests passed (100% passing).
- **Line Coverage**:
  - `src/lib/`: **97.75%** lines
  - `src/store/`: **98.43%** lines
  - Combined `src/lib` and `src/store`: **97.85%** lines (threshold set to 80%).

### End-to-End & Axe Automated Audits
Run browser tests with Playwright against the production preview build:
```sh
npm run build
npm run test:e2e
```
- **Results**: 7 tests passed (100% passing):
  1. `demo journey starts an application and updates its checklist`
  2. `fresh onboarding produces non-zero dashboard matches`
  3. `direct route refresh works for tracker and discover`
  4. `Discover search, sort, empty state, save, and compare controls work`
  5. `tracker status can be moved and an application removed with confirmation`
  6. `corrupt browser storage falls back to defaults without crashing`
  7. `axe reports no serious or critical violations across all routes and themes` (24 total scans: 12 routes in both light and dark modes).

### Complete Verification Suite
Run lint, typecheck, unit test coverage, production build, and end-to-end tests in one command:
```sh
npm run verify
```

## Run Locally

Requires Node.js 20.19+ or 22.12+:

```sh
npm install
npm run dev
```

Run checks individually:
```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy to Vercel

Import this repository into Vercel with the root set to the directory containing `package.json`. `vercel.json` provides SPA routing rewrites to `/index.html` and sets strict security and cache headers. No environment variables are required.

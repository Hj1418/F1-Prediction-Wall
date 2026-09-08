# Changelog

All notable changes to the F1 Community Platform are documented in this file.

---

## [2026-09-08] — Prediction Bench Beta/V1 Core Engineering Implementation

### Added
- **Google Identity `sub` Claim Invariant (`backend/Code.gs`)**:
  - Independent server-side verification using Google's UserInfo and TokenInfo APIs.
  - Extracts immutable Google `sub` and maps to `googleSubjectId` column in `Users` sheet.
  - Guarantees one Google identity permanently maps to exactly one application user.
- **Asynchronous Notification Queue & Email Engine**:
  - Structured `NotificationQueue` and `NotificationLog` in Google Sheets.
  - Implemented `enqueueNotification` with deterministic idempotency keys:
    - Welcome email: `WELCOME_{userId}`
    - Prediction confirmation: `PRED_{userId}_{roundId}`
    - Race result email: `RESULT_{userId}_{roundId}`
  - Implemented `processNotificationQueue` with `LockService` concurrency control, branded motorsport email templates, and delivery failure isolation.
  - Email sending failures never roll back or invalidate predictions, scores, or user records.
- **Beta Core Automated Verification Suite (`scripts/verify-beta-core.ts`)**:
  - 30 new unit/integration tests verifying Google identity verification, duplicate prevention, welcome notification idempotency, returning user behavior, prediction ownership, deadline enforcement, confirmation emails, scoring idempotency, result notifications, email failure isolation, and admin authorization.
  - Test suite expanded to **121 passing tests**.

### Changed
- **Google-Only Beta Authentication Experience**:
  - Completely removed user-facing password forms, confirm password fields, and password reset flows from `LoginForm`, `RegisterForm`, and `AuthModal`.
  - Streamlined `RegisterForm` to 1-click Google authentication with optional post-auth telemetry personalization (racer tag `@handle`, allegiance driver/team) and skip support.
- **Admin Authorization Hardening**:
  - Backend strictly enforces `role === 'admin'` from the `Users` sheet record for all administrative operations and directory listings.
  - Rejected cross-user prediction submissions and tampered client requests with explicit HTTP 403 / Forbidden errors.

### Fixed
- **Duplicate User Prevention under Concurrency**:
  - Enforced `LockService.getScriptLock()` in `googleLogin()` to guarantee that simultaneous first-time login requests create only ONE user.
- **Prediction Deadlines & Podium Uniqueness**:
  - Server-side deadline verification against `closesAt` using server `new Date()`.
  - Server-side enforcement of unique podium driver selections.

---

## [2026-09-08] — Google Identity Services OAuth Flow, Registration Flow & Zero-Overflow Responsive Navbar

### Fixed
- **Issue 1: Native Browser Prompt in Google Sign-In Completely Replaced with Google Identity Services (GIS) OAuth 2.0**:
  - Removed `window.prompt` dialog completely from `AuthContext.tsx`.
  - Implemented `src/services/googleAuth.ts` utilizing official Google Identity Services (`https://accounts.google.com/gsi/client`) Token Client (`google.accounts.oauth2.initTokenClient`).
  - Separated client-side authentication (Google OAuth popup granting access token to fetch `userinfo`) from server-side database persistence (`api.googleLogin` writing to Google Apps Script `USERS` sheet).
  - Graceful configuration check: if `VITE_GOOGLE_CLIENT_ID` is missing from the environment, an in-page alert banner informs the user (`"Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment."`) without freezing or triggering blocking browser popups.
  - Graceful cancellation handling: user cancelling or closing the Google popup does not throw unhandled rejections or break the UI.
  - Verified initial application state starts with `currentUser = null` without any automatic mock logins in production.

- **Issue 2: Registration Flow Wiring, In-Flight States & Robustness**:
  - Connected `SocialAuthButton` on the Register page (`src/components/auth/RegisterForm.tsx`) to `loginWithGoogle()`, enabling seamless 1-click Google registration.
  - Added real-time loading feedback on form submit: button text immediately changes to `JOINING THE LEAGUE...` with an animated spinner (`<Loader2 className="animate-spin" />`).
  - Form inputs and submit buttons are automatically disabled while submissions are in flight to strictly prevent duplicate entries.
  - Added request timeout safeguarding (20-second race) to prevent UI freezing during Apps Script cold-starts or network interruptions.
  - Upon successful registration, the user is authenticated and the `OnboardingModal` renders cleanly displaying driver license approval and welcome messaging.

- **Issue 3: Logged-Out Navbar Horizontal Overflow & Responsive Alignment**:
  - Expanded `.navbar-main` max-width to `1360px` with responsive inner padding.
  - Eliminated horizontal scrollbars (`overflow-x: hidden` / properly constrained flex children) across all viewports (1920px, 1440px, 1280px, 1024px, 768px, 430px, 375px).
  - Preserved strict visual hierarchy: `NEXT PREDICTION` remains prominent as the primary F1 red CTA; `SIGN IN` and `JOIN THE LEAGUE` fit comfortably alongside as secondary compact actions.
  - Added dedicated compact tablet landscape breakpoint (`900px–1159px` covering 1024px iPad landscape / small laptops):
    - Hides nav link icons while keeping clean typography, reducing navigation width by ~130px.
    - Condenses button text to `JOIN` with compact padding, fitting all brand, 6 nav links, prediction CTA, and auth actions within 1024px viewports with over 300px of breathing room.
  - Mobile collapse at `≤ 899px` (covering 768px tablet portrait and mobile phones): cleanly hides desktop nav and presents mobile hamburger menu; mobile drawer provides touch-friendly `SIGN IN` and `JOIN THE LEAGUE` actions.

---

## [2026-09-08] — Diagnostic & Verification: Authentication → Google Sheets Database Persistence

### Fixed
- **Authentication → Google Sheets Persistence Disconnect**:
  - **Root Cause**: Identified that Google sign-in was authenticating the client identity, but:
    1. The Google Apps Script deployment URL in `.env` was returning Google account redirects / 404 HTML due to deployment permissions not being set to "Anyone" or stale deployment ID.
    2. Frontend `apiClient.ts` caught fetch failures and silently fell back to `mockApi.registerUser`, which wrote the authenticated user into browser `localStorage` (`f1_pred_mock_users`).
    3. `backend/Code.gs` lacked dedicated endpoints for `googleLogin`, `getAllUsers`, and `loginUser`, and `registerUser` threw an error for returning Google users instead of resolving them.
    4. `submitPrediction` did not verify whether the submitting user existed in the `Users` database table.
  - **Fix Implemented**:
    - Added dedicated `googleLogin` endpoint in `backend/Code.gs` utilizing `LockService.getScriptLock()` to cleanly differentiate Case A (New User creation) vs Case B (Returning User resolution) with zero duplicate records.
    - Updated `ensureUserHeaders()` in `Code.gs` and `SetupSheet.gs` to dynamically map headers and support full user attributes (`userId`, `email`, `displayName`, `username`, `avatarUrl`, `favouriteDriver`, `favouriteConstructor`, `bio`, `passwordHash`, `authProvider`, `lastLoginAt`, `role`, `createdAt`, `totalPoints`, `seasonRank`).
    - Added server-side user verification to `submitPrediction()` ensuring predictions are strictly tied to a registered database user.
    - Added `api.googleLogin()` in `apiClient.ts` and connected `loginWithGoogle` in `AuthContext.tsx` to the backend.
    - Removed silent error-swallowing for live database operations; network/database failures now surface transparently to the user interface.
- **Documentation**:
  - Updated `SYSTEM_ARCHITECTURE.md`, `USER_WORKFLOWS.md`, `IMPLEMENTATION_RULES.md`, and `PRODUCT_DECISIONS.md` with explicit sections explaining "Authentication → Application User Persistence" and the separation of authentication from database persistence.

---

## [2026-09-07] — Circuit Asset Reliability & Logged-Out Navbar Polish

### Fixed
- **Missing Madrid Circuit SVG (Issue A)**:
  - Sourced and integrated authentic vector layout (`madring-1.svg` from `julesr0y/f1-circuits-svg`, CC BY 4.0 by ROY Jules) into `public/circuits/madrid.svg` and `public/circuits/madring.svg`.
  - Added `madrid` and `madring` mapping entries to `CIRCUIT_SOURCE_MAPPING` and complete technical metadata to `F1_CIRCUITS_REGISTRY`.
  - Updated `normalizeCircuitId` in `circuitRegistry.ts` to recognize Madrid circuit variants and avoid generic unmapped fallbacks.
  - Sourced and integrated `sepang.svg` for Round 16 calendar consistency.
  - Performed calendar consistency audit across all 23 Jolpica 2026 rounds, verifying `Total Missing Assets: 0`.
  - Added robust `onError` image fallback in `<HomePage />` and `<CircuitMap />` rendering standard `CIRCUIT MAP UNAVAILABLE` with `MapPinOff` icon, preventing browser broken-image placeholders.
  - Ensured all circuit asset URLs resolve safely via `import.meta.env.BASE_URL` for local development and GitHub Pages deployments.
- **Logged-Out Navbar Hierarchy & Alignment (Issue B)**:
  - Repositioned primary vs. secondary action hierarchy: `NEXT PREDICTION` remains the unambiguous primary CTA with its signature F1 red finish and glow.
  - Refactored `SIGN IN` into a compact ghost action (`color: var(--text-secondary)`, subtle hover highlight, 30px height).
  - Refactored `JOIN THE LEAGUE` into a compact outlined action (`1px solid rgba(255, 255, 255, 0.2)`), eliminating competing red gradients and drop shadows.
  - Added responsive text collapsing: switches from `JOIN THE LEAGUE` to `JOIN` on viewports `< 1280px`, preventing button clipping (`JOIN T...`) and horizontal overflow.
  - Fixed breakpoint bug at `860px–1159px` where auth buttons were previously hidden; buttons are now compact and cleanly visible.
  - Preserved logged-in user profile layout (`[NEXT PREDICTION] [AVATAR NAME / POINTS ▼]`) with zero regression.

### Tested
- Automated compilation (`npx tsc --noEmit`) and production build (`npm run build`).
- Full test suite execution (`scripts/run-all-tests.js`) verifying 26 circuit vector assets, scoring engine, sync service, and authentication modules.
- Consistency check across all 23 current calendar rounds (`scripts/check-calendar-circuits.mjs`).

---

### Added
- **Official F1 & FIA Resource Directory (`src/services/educational/officialContent.ts`)**: Structured repository of official documentation, sporting regulations, and beginner guides with season tracking and verification dates.
- **Official Updates Discovery Component (`src/components/common/OfficialUpdatesSection.tsx`)**: Lightweight discovery module rendering official articles, category filters, and direct outbound links.
- **3-Part Educational Framework (`src/pages/LearnPage.tsx`)**: Structured all educational topics into "1. WHAT IS IT?", "2. HOW DOES IT WORK?", and "3. WHY DOES IT MATTER?", concluding with verified official regulation links.
- **Governance Metadata Badges**: Attached verified season, authoritative source citation, and verification date to all regulation-sensitive topics (Qualifying, Sprint, Stewards, Flags, Tyres, DRS, Points).
- **Circuit Educational Depth (`src/services/circuits/circuitRegistry.ts` & `src/pages/CircuitsPage.tsx`)**: Added "Why is this track different?", iconic corners, overtaking characteristics, and direct links to official Formula1.com circuit guides.
- **Contextual Learning Bridge (`src/pages/HomePage.tsx`)**: Connected the upcoming Grand Prix circuit directly to relevant Learn F1 concepts.

### Changed
- **Content Philosophy**: Solidified the platform rule: "WE EXPLAIN. THE OFFICIAL SOURCES PUBLISH."
- **Qualifying Content**: Cleaned up qualifying explanations to reflect the verified 2026 knockout structure and grid implications.
- **Documentation Suite**: Updated all 8 documentation files with Data & Content Governance principles and the "WHY" framework.

### Why
- Beginners and casual fans need immediate, bite-sized clarity on how Formula 1 works, connected directly to this weekend's race, with friction-free links to authoritative sources rather than fragmented searches.

### Data Sources
- **Formula 1 (Formula1.com)**: Official beginner guides, editorial articles, official circuit previews.
- **FIA (FIA.com)**: 2026 Sporting Regulations, Technical Regulations, International Sporting Code (Appendix H).
- **Jolpica-F1**: Live calendar schedules, session times, driver standings, race outcomes.
- **Local Asset Registry**: 24 championship circuit vector layouts, track telemetry metrics, and verified lap records.

### User Impact
- Newcomers can quickly understand complex race procedures without leaving the platform, while seasoned enthusiasts have immediate access to authoritative official rulebooks.

### Technical Impact
- Zero new runtime dependencies or database bloat. Lightweight TypeScript interfaces and static registries provide instant rendering with zero network latency.

### Not Included
- **No News CMS or Scraping**: We deliberately do not mirror full articles, scrape websites, or maintain an article database.
- **No Automated Regulatory Rewriting**: We do not pipe raw FIA PDFs through AI agents to automatically rewrite site copy; human verification is preserved for rule accuracy.
- **No Gated Educational Views**: All learning and circuit materials remain 100% public without requiring authentication.

---

## [2.0.0] - 2026-09-07

### Added
- **Documentation Suite**: Added complete suite (`README.md`, `PRODUCT_VISION.md`, `PRODUCT_DECISIONS.md`, `SYSTEM_ARCHITECTURE.md`, `USER_WORKFLOWS.md`, `FRONTEND_DESIGN.md`, `CONTENT_GUIDELINES.md`, `IMPLEMENTATION_RULES.md`).
- **Learn F1 Pillar (`/learn`)**: Comprehensive interactive educational module covering weekend anatomy, knock-out qualifying, sprint format, flags reference, tire compounds & strategy, DRS, sporting regulations, and motorsport glossary.
- **Circuits Visual Catalog (`/circuits` & `/circuits/:circuitId`)**: Dedicated browser for all 24 official championship circuits utilizing local SVG vector maps with telemetry, length, turns, lap records, and calendar status.
- **Google Sign-In Integration**: Streamlined Google Sign-In with OAuth credential exchange and modal guidance for guest predictors.
- **Notification Queue Backend**: Added `NotificationQueue` and `NotificationLog` tables in `backend/SetupSheet.gs` and idempotent queue handler in `backend/Code.gs` for welcome, prediction confirmation, and race result notifications.

### Changed
- **Homepage Restructuring**: Repositioned home layout from prediction-first card to 6-part balanced motorsport hub:
  1. Race Status Indicator
  2. Next Race Hero & Local Countdown
  3. Next Session Schedule Breakdown
  4. Circuit Snapshot
  5. Learn F1 Educational Teaser
  6. Community & Leaderboard Highlights
- **Navigation IA**: Promoted `LEARN F1` and `CIRCUITS` to primary navigation header alongside `RACE WEEKENDS`, `PREDICTIONS`, and `LEADERBOARD`.
- **Copy & Aesthetics**: Replaced hype copy and unnecessary emojis with restrained, professional motorsport terminology and dark palette `#080a0f`.
- **Prediction Flow**: Added auth gate dialog guiding unauthenticated visitors to sign in with Google prior to submitting predictions, while keeping weekend schedules and circuits 100% public.

### Maintained
- **Test Integrity**: All 81 unit, integration, scoring, sync, auth, and circuit asset tests preserved with 100% pass rate.
- **Scoring Engine**: Exact scoring rules and point calculation preserved without modification.

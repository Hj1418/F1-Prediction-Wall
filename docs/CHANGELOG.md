# Changelog

All notable changes to the F1 Community Platform are documented in this file.

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

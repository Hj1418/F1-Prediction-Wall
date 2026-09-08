# Implementation & Engineering Rules

To ensure long-term stability, performance, and code quality, all engineers and automated agents must adhere strictly to these rules.

---

## 1. Zero Unauthorized Dependencies

- **Do NOT add extra libraries or packages**: No new UI component frameworks (no Tailwind migration unless specified, no Material UI, no Chakra, no Framer Motion bloat).
- Use Vanilla CSS and standard React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- Lucide React icons (`lucide-react`) are already installed and should be used for consistent iconography.

---

## 2. Preserve Backward Compatibility & Tests

- The existing test suite contains **81 tests** covering scoring, sync fallbacks, auth hashing, and circuit assets (`scripts/run-all-tests.js`).
- All 81 tests must pass continuously:
  - `scripts/verify-scoring.ts`
  - `scripts/verify-sync.ts`
  - `scripts/verify-auth.ts`
  - `scripts/verify-circuits.ts`
- Do **NOT** rewrite or alter the scoring logic in `src/services/scoringEngine.ts`.
- Do **NOT** delete local auth methods (`login`, `register`, `hashPassword`) in `src/services/authService.ts` as automated tests exercise them directly.

---

## 3. Preserved Route Structure

Never remove or break existing navigation paths. The platform must support both canonical and alias routes:
- `/` -> Home page
- `/learn` -> Learn F1 educational guide
- `/circuits` -> Circuit catalog
- `/circuits/:circuitId` -> Circuit detail view
- `/weekends` & `/weekends/:raceWeekendId` (and legacy `/schedule`, `/races`, `/races/:round`) -> Race weekend schedules
- `/predictions` (and `/predict/:roundId`) -> Prediction submission
- `/leaderboard` -> Community leaderboard
- `/profile` -> User profile (auth-gated)
- `/admin` -> Platform administrative management

---

## 4. Idempotent Backend Operations

- All automated notification dispatches via Google Apps Script must check the `idempotencyKey` before enqueuing or delivering messages.
- Key format conventions:
  - `WELCOME:<userId>`
  - `PREDICTION:<roundId>:<userId>`
  - `RESULT:<roundId>:<userId>`
- Concurrency locks (`LockService.getScriptLock()`) must be acquired before writing to sheets in `Code.gs`.

---

## 5. Regulation-Sensitive Content Governance

- Every rule-sensitive explanation (Qualifying format, Sprint format, Tyre allocations, Parc Fermé, Steward penalties) must carry explicit governance metadata:
  - `season`: (e.g., 2026)
  - `source`: (e.g., FIA Formula One Sporting Regulations)
  - `verifiedDate`: (e.g., March 2026)
  - `sourceUrl`: (Authoritative direct link)
- **Zero Automatic Regulatory Rewriting**: Do not pipe FIA PDFs into AI agents to automatically rewrite site copy. Any regulation change must be manually reviewed against official FIA publications before updating simplified explanations.

---

---

## 6. Official Content Boundary & Zero Scraping

- Do NOT build a news CMS, scraper, article mirror, or full-text storage.
- The platform provides beginner-friendly context and points users to official `Formula1.com` and `FIA.com` sources for exhaustive editorial or regulatory reading.

---

## 7. Circuit Asset Reliability Standards

- **Asset Source Requirement**: Every current calendar circuit must map to a verified local SVG asset in `public/circuits/` sourced from authentic community vectors (CC BY 4.0 by ROY Jules, `julesr0y/f1-circuits-svg`).
- **Zero Hallucinated Vector Paths**: Do NOT draw synthetic, approximate, or fake circuit SVG paths. Do NOT hotlink third-party images.
- **Base URL Resolution**: All circuit assets must be resolved via `getCircuitAssetUrl()`, guaranteeing correct paths across local development (`/`) and GitHub Pages repository deployments (`/f1-prediction-wall/`).
- **Graceful Application Fallback**: When an asset fails to load, `onError` handlers in `<CircuitMap />` and `<HomePage />` must render the standard application fallback (`CIRCUIT MAP UNAVAILABLE` with `MapPinOff` icon). Never show browser broken-image icons or blank containers.

---

## 8. Authentication Navigation Hierarchy Standards

- **Primary vs. Secondary**: The contextual prediction action (`NEXT PREDICTION` / `PREDICT NOW`) is the primary navigation CTA. Authentication controls (`SIGN IN` and `JOIN THE LEAGUE` / `JOIN`) are strictly secondary actions.
- **Visual Weight**: Secondary authentication controls must never use heavy gradients, primary red button fills, or high-glow drop shadows that compete with the prediction CTA.
- **Responsive Text Collapse**: To prevent horizontal overflow and clipped labels (`JOIN T...`), secondary actions must collapse to short text (`JOIN`) on narrower viewports (`< 1280px`) while retaining complete screen-reader and accessible labels (`title`, `aria-label`).
- **Preserve Authenticated State**: Changes to the unauthenticated layout must never regress the logged-in profile trigger (`[AVATAR NAME / POINTS ▼]`).

---

## 9. Authentication → Application User Persistence Rules

- **Identity vs. Persistence**: Google authentication identifies the person. The application creates or retrieves an application user record. The application user ID is used for predictions, scores, and profile data.
- **Persistence Verification**: Authentication success does not automatically mean database persistence success. Never assume a successful Google token or client profile means the record is stored in Google Sheets.
- **Zero Silent Fallback**: Never catch backend database errors and silently dump data into client-side `localStorage`. If `isLiveBackend` is enabled and an API request fails, throw an explicit, descriptive error to the user interface.
- **Strict Concurrency**: Concurrency locks (`LockService.getScriptLock()`) must always guard user lookup and creation in `Code.gs` to prevent duplicate rows.
- **Prediction User Integrity**: The backend must verify that the `userId` in `submitPrediction` exists in the `Users` sheet before writing the prediction.

---

## 10. Zero Native Browser Dialogs & In-Flight Form States

- **Zero window.prompt() / alert() / confirm()**: Never use native browser dialogs for authentication, email collection, or confirmation flows. Authentication must rely on official Google Identity Services (GIS) OAuth 2.0 popups or standard in-page form fields.
- **Graceful Unconfigured Handling**: When external OAuth configuration (`VITE_GOOGLE_CLIENT_ID`) is missing or unconfigured, render a clear, dismissible in-page error banner. Never crash or freeze the UI.
- **Immediate In-Flight Feedback**: All form submit buttons must immediately update their label (`JOINING THE LEAGUE...`, `SIGNING IN...`), show animated spinners, and enter a disabled state upon submission.
- **Duplicate Submission Lock**: While an authentication or registration request is in-flight, disable form inputs and action buttons to strictly block double-click duplicate creation.
- **Timeout Protection**: All network requests to serverless/Apps Script backends must include timeout safeguards (e.g., 20 seconds) to prevent infinite pending states during cold starts.

---

## 11. Beta/V1 Core Engineering Invariant Rules

1. **Rule: Never trust client identity**: A client providing `{ email: '...', displayName: '...' }` is never trusted. Every authenticated operation requires an independently verified Google OAuth access token or ID token verified server-side.
2. **Rule: Google `sub` is the stable Google identity**: The Google Subject ID (`sub`) is immutable and uniquely identifies the account. Users are looked up and stored by `googleSubjectId`. Email changes or display name variations do not create duplicate application accounts.
3. **Rule: Application `userId` owns application data**: Predictions, scores, achievements, and leaderboard entries reference the persistent application `userId`, never third-party provider tokens or raw email strings.
4. **Rule: Backend controls authorization**: Roles are loaded strictly from the `Users` sheet (column H). Client-supplied roles or frontend role checks are never sufficient to authorize admin operations.
5. **Rule: Backend controls prediction deadlines**: The backend verifies deadlines against `closesAt` using server time (`new Date()`). Client-supplied deadlines are strictly ignored.
6. **Rule: Prediction persistence is independent from email delivery**: An email notification is an asynchronous side effect. Email delivery failure must never invalidate or roll back a saved prediction or user registration.
7. **Rule: Notifications are idempotent**: Every notification utilizes a deterministic idempotency key (`WELCOME_{userId}`, `PRED_{userId}_{roundId}`, `RESULT_{userId}_{roundId}`). The same logical event never produces multiple emails.
8. **Rule: Scoring is idempotent**: Running scoring multiple times produces identical points and never duplicates `Scores` records or leaderboard points.
9. **Rule: No mock users**: Never render simulated or mock users when unauthenticated.
10. **Rule: No silent authentication fallback**: If authentication fails, display an explicit error. Never catch errors and secretly substitute a fake local profile.
11. **Rule: No plaintext passwords**: User-facing Beta flow is strictly Google OAuth 2.0. No passwords or plaintext hashes exist in client storage or sheets.
12. **Rule: No sensitive secrets in frontend code**: Frontend bundles expose only `VITE_GOOGLE_CLIENT_ID`. Never leak service account keys, Apps Script deployment credentials, or admin secrets.
13. **Rule: Do not add unrelated features during Beta stabilization**: Focus exclusively on deterministic reliability, security, and idempotency of the core user journey.

# User Workflows & Journeys — Prediction Bench (Beta/V1)

This document details the nine core user journeys across the Prediction Bench platform. For each workflow, we define: **WHAT**, **WHY**, **HOW**, **EXPECTED RESULT**, and **FAILURE BEHAVIOR**.

---

## Journey A: Public Visitor (Explore & Learn)
* **WHAT**: A guest browses public educational content, race calendar, session countdowns, and circuit telemetry without logging in.
* **WHY**: Zero-friction discovery. F1 fans should never be forced to sign up just to view educational guides or schedule information.
* **HOW**: Visit Home, Learn F1, Race Weekends, or Circuits. Read regulation guides, inspect 26 circuit vector assets, and view local countdowns.
* **EXPECTED RESULT**: All public pages load instantly. Navbar shows primary "Next Prediction", secondary "Sign In", and compact "Join the League".
* **FAILURE BEHAVIOR**: Offline fallback serves cached static data; no login prompts interrupt reading.

---

## Journey B: New User Registration
* **WHAT**: A newcomer joins the league using their Google account and sets up their initial telemetry profile.
* **WHY**: Establishes a permanent, secure identity without insecure custom passwords.
* **HOW**:
  1. Click "Join the League" on navbar or hero CTA.
  2. Complete Google Identity Services popup.
  3. Server independently verifies credential and extracts Google `sub`.
  4. Server creates persistent `Users` row (`role: 'user'`).
  5. Server queues exactly one `WELCOME` notification (`idempotencyKey: WELCOME_{userId}`).
  6. Frontend displays optional profile customization (racer tag, allegiance driver/team).
* **EXPECTED RESULT**: User is registered with a unique `userId`. Welcome email is enqueued. Session is established in `localStorage`.
* **FAILURE BEHAVIOR**: If Google popup is closed, user remains on page with clear cancellation message. If network times out, error alert displays retry advice; no partial user is created.

---

## Journey C: Returning User Login
* **WHAT**: An existing racer signs in on a new device or restored session.
* **WHY**: Retrieve personal prediction history, scoring history, and championship rank.
* **HOW**:
  1. Click "Sign In" or "Continue with Google".
  2. Authenticate with Google.
  3. Backend matches `googleSubjectId === sub` (or backfills it from verified email).
  4. Backend updates `lastLoginAt` in place.
* **EXPECTED RESULT**: User is logged in with their existing `userId`. Zero duplicate user rows created. **No welcome email is sent**.
* **FAILURE BEHAVIOR**: If token has expired or cannot be verified, backend rejects with `401 Unauthorized`. Frontend displays retry CTA.

---

## Journey D: Prediction Submission
* **WHAT**: A racer selects their podium (P1, P2, P3), fastest lap, driver of the day, and safety car / red flag predictions for an upcoming session.
* **WHY**: Core gameplay of the league.
* **HOW**:
  1. Navigate to Predictions page for an OPEN session.
  2. Select drivers using interactive selectors (duplicate podium driver prevented).
  3. Click "Lock In Predictions".
  4. Backend validates server deadline (`serverTime <= closesAt`), driver validity, and authentic ownership.
  5. Backend atomically persists prediction to `Predictions` sheet.
* **EXPECTED RESULT**: Prediction is locked and saved. Success toast confirms submission. Preview shows locked picks.
* **FAILURE BEHAVIOR**:
  - If deadline passed: Server rejects with `"Predictions are LOCKED"`. Form enters disabled state.
  - If duplicate driver selected on podium: Server rejects with validation error.
  - If network fails: Prediction is not saved; user is alerted with option to retry.

---

## Journey E: Prediction Confirmation Email
* **WHAT**: An automated confirmation email is queued and delivered after a prediction is saved.
* **WHY**: Reassures the racer that their choices are officially recorded before the session deadline.
* **HOW**:
  1. Upon successful prediction save, backend enqueues `PREDICTION_CONFIRMATION` notification with `idempotencyKey: PRED_{userId}_{roundId}`.
  2. Asynchronous email processor picks up `PENDING` notifications.
  3. Sends branded email containing real submitted selections.
  4. Updates queue row to `SENT` and logs in `NotificationLog`.
* **EXPECTED RESULT**: Racer receives an email detailing their exact picks. Resubmitting an updated prediction updates the picks and prevents duplicate email sends.
* **FAILURE BEHAVIOR**: If email delivery fails (e.g. SMTP timeout), the notification enters `RETRY` (up to 3 attempts) or `FAILED`. **The saved prediction remains 100% valid and unaffected.**

---

## Journey F: Race Result Processing
* **WHAT**: Race Control enters official FIA session results and triggers scoring.
* **WHY**: Translates on-track race results into league points.
* **HOW**:
  1. Administrator enters official P1, P2, P3, and Fastest Lap in Race Control.
  2. System runs `adminCalculateScores(roundId)`.
  3. Scoring engine evaluates each user prediction idempotently.
  4. Points are saved to `Scores` sheet.
* **EXPECTED RESULT**: All predictions for the round are scored. Running scoring again yields identical points with zero duplicate rows.
* **FAILURE BEHAVIOR**: If official results are missing or invalid, scoring stops with a descriptive error. Existing scores remain intact.

---

## Journey G: Result Email
* **WHAT**: Racers who submitted predictions receive their personalized points breakdown and updated championship rank.
* **WHY**: Closes the feedback loop and drives engagement.
* **HOW**:
  1. Scoring enqueues `PREDICTION_RESULT` notifications with `idempotencyKey: RESULT_{userId}_{roundId}`.
  2. Email processor formats personalized results: user predictions, actual outcomes, score breakdown, and points earned.
  3. Processor sends email via `MailApp.sendEmail()`.
* **EXPECTED RESULT**: Exactly one result email per participant. Repeated scoring runs do not trigger duplicate emails.
* **FAILURE BEHAVIOR**: If delivery fails, it is logged in `NotificationQueue` as `RETRY` / `FAILED`. User's score on the live leaderboard remains accurate.

---

## Journey H: Leaderboard Exploration
* **WHAT**: Racers view global standings, rank changes, points breakdown, and peer profiles.
* **WHY**: Fosters community competition.
* **HOW**:
  1. Click "Leaderboard" tab.
  2. Frontend queries aggregated scores derived from the backend database.
  3. Displays current rank, points, races participated, and best scores.
* **EXPECTED RESULT**: Consistent rank across page refreshes. Points match persisted server score data.
* **FAILURE BEHAVIOR**: If database query is slow, skeleton loader displays while cached state is presented.

---

## Journey I: Race Control Administration
* **WHAT**: An administrator manages race weekends, monitors registered racers, inputs results, and verifies notification delivery.
* **WHY**: Platform governance and operations.
* **HOW**:
  1. Sign in with an account having `role === 'admin'` in the `Users` sheet.
  2. Access `/admin` dashboard.
  3. Backend checks `role === 'admin'`.
  4. Admin can inspect registered users, sync Jolpica calendar, and enter official results.
* **EXPECTED RESULT**: Admin dashboard opens with full management controls.
* **FAILURE BEHAVIOR**: If a non-admin attempts to access admin APIs, the server responds with `"Forbidden: Administrator privileges required"`.

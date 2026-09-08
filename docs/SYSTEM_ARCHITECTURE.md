# System Architecture — Prediction Bench (Beta/V1)

## 1. System Topology & Core Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser (SPA)                     │
│  React 19 + TypeScript + Vite + Vanilla CSS System          │
│  State: AuthContext, ScheduleContext, Offline Caching       │
│  Auth: Google Identity Services (OAuth 2.0 Token Client)    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS POST / GET (JSON payload)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Google Apps Script Web App (API Gateway)          │
│  Code.gs: doGet (Queries), doPost (Mutations)               │
│  LockService (Concurrency control & duplicate prevention)   │
└─────────────┬───────────────────────────────┬───────────────┘
              │ Token verification            │ Relational Operations
              ▼                               ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│  Google Identity Services │   │   Google Sheets Database    │
│  https://www.googleapis.  │   │  - Users (googleSubjectId)  │
│  com/oauth2/v3/userinfo   │   │  - RaceWeekends             │
│  Extracts immutable `sub` │   │  - Sessions                 │
└───────────────────────────┘   │  - PredictionRounds         │
                                │  - Predictions              │
                                │  - Results                  │
                                │  - Scores                   │
                                │  - NotificationQueue        │
                                │  - NotificationLog          │
                                └─────────────┬───────────────┘
                                              │ Async Queue Sweep
                                              ▼
                                ┌─────────────────────────────┐
                                │   Apps Script Email Engine  │
                                │   processNotificationQueue  │
                                │   MailApp.sendEmail()       │
                                └─────────────────────────────┘
```

---

## 2. Authentication & Identity Architecture

### 2.1 Google-Only Beta Authentication
* The user-facing authentication flow relies exclusively on **Google Identity Services (GIS)**.
* No passwords, confirm passwords, or custom password hashing exist in the user-facing UI.
* Google provides a cryptographically signed OAuth `access_token` or OpenID Connect `id_token`.

### 2.2 Independent Server-Side Identity Verification
* The browser is **never trusted** to declare its own identity (e.g. sending `{ email: 'admin@f1.com' }` is rejected).
* Upon receiving a login request, Apps Script queries Google's UserInfo API (`https://www.googleapis.com/oauth2/v3/userinfo`) with `Authorization: Bearer <accessToken>`.
* Apps Script verifies:
  1. Token is present and valid.
  2. Google responds with HTTP 200.
  3. `email_verified` is strictly `true`.
* **Google `sub` as Immutable Anchor:** The user's Google Subject ID (`sub`) is extracted and treated as the immutable identity key. The application user is bound to this `sub`, preventing email changes or client-side tampering from spawning multiple accounts.

### 2.3 User Lifecycle & Concurrency Control
* **LockService Protection:** First-time login requests acquire a script lock (`LockService.getScriptLock()`) with a 10-second timeout. Simultaneous first-time logins resolve sequentially without inserting duplicate rows.
* **New User:**
  1. Verified with Google.
  2. Generated stable internal ID: `usr_<cleanUsername>_<uuid>`.
  3. Safe default role: `'user'`.
  4. Persisted to `Users` sheet with `googleSubjectId`.
  5. Exactly one `WELCOME` notification is enqueued with idempotency key `WELCOME_{userId}`.
  6. Returns user profile with `isNewUser: true` to trigger optional profile customization.
* **Returning User:**
  1. Matches existing row by `googleSubjectId === sub` (or verified email fallback for legacy accounts, which backfills `googleSubjectId`).
  2. Updates `lastLoginAt`.
  3. Preserves all profile preferences, predictions, scores, and roles.
  4. Does **not** enqueue a welcome notification.
  5. Returns user profile with `isNewUser: false`.

---

## 3. Authorization Model

Authentication answers **"Who is this user?"** while authorization answers **"What is this user permitted to do?"**.

* **Role Resolution:** The user's role is loaded exclusively from the `Users` sheet (column H). Client-side role claims in request payloads or `localStorage` are discarded.
* **Roles:**
  * `user`: Can browse public content, submit predictions for their own `userId`, view their own scores, and access the leaderboard.
  * `admin`: Can view the full registered user directory (`getAdminUsers`) and perform Race Control operations (`adminSaveWeekend`, `adminSubmitResult`, `adminCalculateScores`).
* **Enforcement:** Admin endpoints verify that `requesterId` exists in the database and has `role === 'admin'`. Non-admins are rejected with HTTP 403 / Forbidden errors.

---

## 4. Prediction Ownership & Server-Side Validation

* **Authentic Ownership:** The server verifies that the prediction belongs to an authenticated user existing in the database. Cross-user prediction manipulation is strictly blocked.
* **Server-Controlled Deadlines:** The client deadline display is purely for UX. The backend verifies that the server time (`new Date().getTime()`) has not passed the round's `closesAt` timestamp. Past-deadline submissions are rejected with `"Predictions are LOCKED"`.
* **Unique Podium:** Backend validates that no driver is selected more than once among P1, P2, and P3.
* **Atomic Persistence:** The prediction is saved to the `Predictions` sheet first. If an existing prediction for that user and round exists, it updates in place.

---

## 5. Notification System & Email Processing

### 5.1 Architecture
Email and authentication are decoupled systems:
`AUTHENTICATION` → `APPLICATION USER` → `USERS.email` → `NOTIFICATION_QUEUE` → `EMAIL PROCESSOR` → `RECIPIENT`

### 5.2 Deterministic Idempotency Keys
Before inserting into `NotificationQueue`, Apps Script checks both `NotificationQueue` and `NotificationLog`:
* **Welcome Email:** `WELCOME_{userId}`
* **Prediction Confirmation:** `PRED_{userId}_{roundId}`
* **Race Results:** `RESULT_{userId}_{roundId}`

If a notification with the same idempotency key already exists, enqueuing is skipped silently.

### 5.3 Asynchronous Queue Processor
* `processNotificationQueue(batchLimit)` runs asynchronously or via scheduled trigger.
* Wrapped in `LockService.getScriptLock()` to prevent two concurrent workers from sending the same message.
* Pulls `PENDING` or `RETRY` notifications.
* Sends branded emails via `MailApp.sendEmail()`.
* On success: Updates status to `SENT`, records entry in `NotificationLog`.
* On error: Increments `attempts`. If `attempts >= 3`, marks status as `FAILED`. Otherwise marks as `RETRY`. Records error message.

### 5.4 Delivery Failure Isolation
Email sending is treated strictly as a side effect. An email failure **never** rolls back or invalidates:
* User registration
* Saved predictions
* Calculated scores
* Leaderboard standings

---

## 6. Scoring Idempotency & Leaderboard Consistency

1. Race results are committed to the `Results` sheet.
2. `adminCalculateScores(roundId)` computes scores using the deterministic engine.
3. Scoring updates existing `Scores` rows or inserts new ones. Running scoring multiple times produces identical points and never duplicates rows.
4. Leaderboard standings are computed directly from persisted `Scores`.

# System Architecture — THE GRDX Platform (Production v2)

---

## 1. System Topology & Physical Cloud Locations

Understanding where every piece of THE GRDX physically lives and executes:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PHYSICAL & CLOUD TOPOLOGY                                   │
├────────────────────────────────┬──────────────────────────┬─────────────────────────────────┤
│          FRONTEND              │         BACKEND          │            DATABASE             │
├────────────────────────────────┼──────────────────────────┼─────────────────────────────────┤
│  Location:                     │  Location:               │  Location:                      │
│  • GitHub Pages Edge CDN       │  • Google Apps Script    │  • Google Sheets Relational     │
│  • Static Single Page App      │    Web App Gateway       │    Cloud Database               │
│  • React 19 + TypeScript 5.x   │  • Google Cloud Platform │  • Google Drive Cloud           │
│  • Vite 8.x + Vanilla CSS      │    V8 Serverless Engine  │  • 15 Relational Tables         │
│                                │                          │  • Automatic Version History    │
│  Live URL:                     │  Live URL:               │                                 │
│  https://hj1418.github.io/     │  script.google.com/      │  Cache & Fallback:              │
│  F1-Prediction-Wall/           │  macros/s/.../exec       │  • Apps Script CacheService     │
│                                │                          │  • Browser LocalStorage Engine  │
└────────────────────────────────┴──────────────────────────┴─────────────────────────────────┘
```

### Core Request Pipeline
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser (SPA)                     │
│  React 19 + TypeScript + Vite + Vanilla CSS System          │
│  State: AuthContext, AppContext, ClientCache (TTL)          │
│  Auth: Google Identity Services (OAuth 2.0 Token Client)    │
│  Hosting: GitHub Pages Edge CDN                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS POST / GET (JSON payload)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Google Apps Script Web App (API Gateway)          │
│  Code.gs: doGet (Queries), doPost (Mutations)               │
│  LockService (Distributed Mutex & Concurrency Control)      │
│  CacheService (High-Performance RAM Cache)                  │
│  Hosting: Google Cloud Platform Serverless V8 Runtime       │
└─────────────┬───────────────────────────────┬───────────────┘
              │ Token verification            │ Relational Operations
              ▼                               ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│  Google Identity Services │   │   Google Sheets Database    │
│  https://www.googleapis.  │   │  (15 Relational Sheets):    │
│  com/oauth2/v3/userinfo   │   │  - Users (googleSubjectId)  │
│  Extracts immutable `sub` │   │  - RaceWeekends             │
└───────────────────────────┘   │  - Sessions                 │
                                │  - PredictionRounds         │
                                │  - Predictions              │
                                │  - Results                  │
                                │  - Scores                   │
                                │  - Achievements             │
                                │  - SyncLogs                 │
                                │  - NotificationQueue        │
                                │  - NotificationLog          │
                                │  - QuizCategories           │
                                │  - QuizQuestions            │
                                │  - QuizAttempts             │
                                │  - QuizAchievements         │
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

### 2.1 Google-Only Passwordless Authentication
* The user-facing authentication flow relies exclusively on **Google Identity Services (GIS)**.
* No passwords, confirm passwords, or custom password hashing exist in the user-facing UI. This eliminates credential stuffing attacks, password storage leaks, and GDPR password management liabilities.
* Google provides a cryptographically signed OAuth `access_token` or OpenID Connect `id_token`.

### 2.2 Independent Server-Side Identity Verification
* The browser is **never trusted** to declare its own identity (e.g. sending `{ email: 'admin@f1.com' }` is rejected).
* Upon receiving a login request, Apps Script queries Google's UserInfo API (`https://www.googleapis.com/oauth2/v3/userinfo`) with `Authorization: Bearer <accessToken>`.
* Apps Script verifies:
  1. Token is present and valid.
  2. Google responds with HTTP 200.
  3. `email_verified` is strictly `true`.
* **Google `sub` as Immutable Anchor:** The user's Google Subject ID (`sub`) is extracted and treated as the immutable identity key. The application user is bound to this `sub`, preventing email changes or client-side tampering from spawning multiple accounts or hijacking another user's score history.

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
  4. Does **not** enqueue a welcome email.
  5. Returns user profile with `isNewUser: false`.

---

## 3. Authorization Model & Role-Based Access Control (RBAC)

Authentication answers **"Who is this user?"** while authorization answers **"What is this user permitted to do?"**.

* **Role Resolution:** The user's role is loaded exclusively from the `Users` sheet (column H). Client-side role claims in request payloads or `localStorage` are discarded.
* **Roles:**
  * `user`: Can browse public content, submit predictions for their own `userId`, view their own scores, take motorsport quizzes, and access the public leaderboard.
  * `admin`: Can view the full registered user directory (`getAdminUsers`), synchronize calendar schedules (`syncSeasonCalendar`), enter verified session results (`adminSubmitResult`), and trigger score calculations (`adminCalculateScores`).
* **Enforcement:** Admin endpoints verify that `requesterId` exists in the database and has `role === 'admin'`. Non-admins are rejected with HTTP 403 / Forbidden errors.

---

## 4. Prediction Ownership & Server-Side Deadline Enforcement

* **Authentic Ownership:** The server verifies that the prediction belongs to an authenticated user existing in the database. Cross-user prediction manipulation is strictly blocked.
* **Server-Controlled Deadlines:** The client deadline display and countdown timers are purely for UX. The backend independently verifies that the server time (`new Date().getTime()`) has not passed the round's `closesAt` timestamp. Past-deadline submissions are rejected with `"Predictions are LOCKED"`.
* **Podium Mutual Exclusion:** Backend validates that no driver is selected more than once among P1, P2, and P3 (`Set([p1, p2, p3]).size === 3`).
* **Atomic Persistence:** The prediction is saved to the `Predictions` sheet first. If an existing prediction for that user and round exists, it updates in place idempotently.

---

## 5. Notification System & Email Processing

### 5.1 Decoupled Architecture
Email and application mutations are strictly decoupled:
`ACTION` → `DATABASE COMMIT` → `NOTIFICATION_QUEUE` → `ASYNC PROCESSOR` → `MAILAPP` → `RECIPIENT`

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
Email sending is treated strictly as an asynchronous side effect. An email failure **never** rolls back or invalidates:
* User registration
* Saved predictions
* Calculated scores
* Leaderboard standings

---

## 6. Scoring Idempotency & Leaderboard Consistency

1. Race results are committed to the `Results` sheet.
2. `adminCalculateScores(roundId)` computes scores using the deterministic scoring rules:
   * **Exact P1:** 15 pts
   * **Exact P2 / P3:** 10 pts each
   * **Podium in Wrong Position:** 5 pts
   * **🎯 Perfect 1-2-3 Podium Bonus:** +10 pts
   * **Fastest Lap:** 10 pts
   * **Driver of the Day:** 10 pts
   * **Session Wildcard:** 15 pts
3. Scoring updates existing `Scores` rows or inserts new ones. Running scoring multiple times produces identical points and never duplicates rows.
4. Leaderboard standings are computed directly from persisted `Scores` rows.

---

## 7. Complete Reference Documentation
For complete **C1, C2, C3, and C4 architectural diagrams**, exhaustive feature dictionaries, and full sequence diagrams, see the master documentation at **[`docs/ARCHITECTURE.md`](ARCHITECTURE.md)**.

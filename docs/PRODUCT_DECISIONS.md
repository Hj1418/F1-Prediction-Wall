# Product & Architecture Decisions Log — Prediction Bench (Beta/V1)

This document records the foundational product and technical decisions for the F1 Community Prediction Bench, detailing the context, alternatives considered, and strategic rationale.

---

## 1. Public Content Does Not Require Authentication
* **Decision**: Public visitors can browse Home, Learn F1, Race Weekends, Circuits, and the global Leaderboard without an account.
* **Rationale**: Eliminates friction for casual fans and newcomers seeking information. Encourages organic exploration and builds community trust before requesting credentials.

---

## 2. Authentication is Required for User-Specific Prediction Functionality
* **Decision**: Authentication is strictly required only when submitting predictions, saving allegiance preferences, or accessing individual scoring history.
* **Rationale**: Predictions require verifiable ownership, score tracking, and championship points attribution. Actions that do not create or modify personal state remain public.

---

## 3. Google-Only Authentication for the Initial Beta Release
* **Decision**: Google OAuth 2.0 is the sole user-facing authentication provider for the Beta. The legacy custom password registration/login forms have been removed.
* **Rationale**: Eliminates the severe security vulnerabilities associated with custom password systems (storing password hashes in sheets, implementing password resets, handling weak passwords). Google handles two-factor authentication, verified emails, and account recovery natively.

---

## 4. Application Users Stored Separately from Identity Provider
* **Decision**: The `Users` sheet stores application-domain records with internal `userId` values, using Google's `sub` as an immutable external identifier (`googleSubjectId`).
* **Rationale**: Decouples application logic from the identity provider. If identity providers change or expand in the future, prediction records, scores, and leaderboard ranks remain undisturbed because they reference the stable application `userId`.

---

## 5. Email Architecture is Independent from Authentication
* **Decision**: The outbound notification engine pulls email addresses from the application `Users` database, not directly from active OAuth tokens.
* **Rationale**: Allows reliable asynchronous email delivery hours or days after the user has logged out (e.g. race results delivered on Sunday evening after a prediction submitted on Friday).

---

## 6. Welcome Email is Sent Only on First Registration
* **Decision**: A `WELCOME` notification is queued strictly when a new user row is created, with idempotency key `WELCOME_{userId}`. Returning users logging in never trigger a welcome email.
* **Rationale**: Reassures new racers upon joining without spamming returning users on subsequent session logins.

---

## 7. Prediction Confirmation is Sent After Successful Persistence
* **Decision**: The `PREDICTION_CONFIRMATION` notification is enqueued only after the prediction has been committed to the `Predictions` sheet.
* **Rationale**: Prediction persistence is the single source of truth. Racers are never sent a confirmation email for a prediction that failed to save.

---

## 8. Result Email is Sent After Scoring
* **Decision**: The `PREDICTION_RESULT` notification is triggered only after race results are published and individual scores are computed in the `Scores` sheet.
* **Rationale**: Guarantees that result emails contain actual points earned and an accurate score breakdown rather than preliminary estimates.

---

## 9. Notification Processing is Asynchronous
* **Decision**: Notifications are queued in `NotificationQueue` and processed asynchronously by the background email worker (`processNotificationQueue`).
* **Rationale**: Prevents external SMTP latency from slowing down user-facing prediction submissions. Guarantees that network email errors never fail or roll back core prediction writes.

---

## 10. Free-First Architecture Without Paid Infrastructure
* **Decision**: Built on React/Vite (hosted on GitHub Pages) and Google Apps Script / Google Sheets.
* **Rationale**: Zero hosting costs, zero database maintenance fees, and transparent community auditing during the Beta. Proves product-market fit before incurring infrastructure overhead.

---

## 11. Focus on a Reliable Core User Journey Before Advanced Features
* **Decision**: Focus exclusively on the single critical loop: Explore → Authenticate → Predict → Confirm → Score → Result → Rank.
* **Rationale**: Advanced community features (private mini-leagues, live chat, betting odds, badges) are meaningless if predictions, scoring, or authentication are flaky. Stabilizing the core loop ensures weekend test readiness.

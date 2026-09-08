# User Workflows & Journeys

This document maps out the core user journeys across the F1 Community Platform.

---

## 1. Journey A: The Newcomer / Casual Fan (Explore & Learn)

```
Landing on Home
  │
  ├──► Views Next Race Hero & Local Countdown (No auth required)
  │
  ├──► Clicks "Learn F1"
  │     ├── Explores 3-part educational topics (What / How / Why / Official Source):
  │     │    - Knockout Qualifying & Grid implications
  │     │    - Sprint Weekend formats
  │     │    - Race Control, Stewards & Super Licence penalties
  │     │    - Flags & Safety Car protocols (Appendix H)
  │     │    - Tyres, Compound rules & Undercut/Overcut strategies
  │     │    - DRS rules & Aerodynamics
  │     │    - Points system & WDC / WCC breakdown
  │     ├── Consults Official F1 Updates & Regulations widget
  │     └── Direct external deep-dive into official Formula1.com / FIA documentation
  │
  └──► Clicks "Circuits"
        └── Browses 24 visual vector circuit tracks
             ├── Inspects "Why is this track different?"
             ├── Reviews iconic corners, overtaking hotspots, and track DNA
             └── Follows direct link to official Formula1.com track guide
```

- **Goal**: Zero friction, high-density educational content.
- **Auth Status**: Unauthenticated (guest).

---

## 2. Journey B: Race Weekend Follower (Schedule & Planning)

```
Navigation -> "Race Weekends"
  │
  ├──► Views full 24-race championship calendar
  ├──► Selects upcoming Grand Prix
  │     ├── Sees countdown to next session
  │     ├── Inspects full session timetable in user's local timezone
  │     └── Toggles between Local Time and Track Time
  └──► Reviews circuit characteristics directly tied to that weekend
```

- **Goal**: Fast, accurate schedule answers without ads or clutter.
- **Auth Status**: Unauthenticated or Authenticated.

---

## 3. Journey C: Community Competitor (Predict & Compete)

```
Next Race Hero or "Predictions" tab
  │
  ├──► User clicks "Make Predictions"
  │     │
  │     ├── If Guest:
  │     │    └── Modal opens: "Sign in with Google to enter predictions & track your leaderboard rank"
  │     │         └── Signs in via Google OAuth (or email) -> Redirected back to prediction form
  │     │
  │     └── If Authenticated:
  │          ├── Selects Pole Position
  │          ├── Selects Podium Finishers: P1, P2, P3
  │          ├── Selects Fastest Lap
  │          ├── Selects Driver of the Day
  │          ├── Selects Safety Car prediction (Yes / No)
  │          └── Clicks "Submit Predictions"
  │               ├── Validation check: No duplicate drivers in podium
  │               ├── Payload submitted to backend
  │               ├── Instant feedback toast + Confirmation email queued
  │               └── Prediction locked state previewed
  │
  └──► Post-Race: User visits "Leaderboard"
        ├── Sees updated points, position change, and exact hits
        └── Compares scores with community peers
```

- **Goal**: Engaging, fair community competition with immediate feedback.
- **Auth Status**: Authenticated via Google.

---

## 4. Journey D: Platform Administrator (Sync & Result Resolution)

```
Admin Dashboard (`/admin`)
  │
  ├──► Authenticated as Admin
  ├──► Clicks "Trigger Calendar Sync" -> Updates schedule from Ergast/OpenF1
  ├──► Enter Actual Race Results (Pole, P1, P2, P3, Fastest Lap, Safety Car, DOTD)
  ├──► Previews scoring calculation across all submitted predictions
  └──► Confirms and Publishes Results
        ├── Updates UserPredictions points
        ├── Re-computes Leaderboard standings
        └── Buffers results notifications into `NotificationQueue`
```

---

## 5. Journey E: Authentication → Application User Persistence

```
Google Login Trigger (Modal / Button)
  │
  ├──► 1. Identity Establishment:
  │         User authenticates with Google account (email, name, avatar).
  │
  ├──► 2. Backend Persistence Handshake:
  │         Frontend dispatches `action: 'googleLogin'` to Google Apps Script.
  │         Backend secures `LockService` to prevent race conditions.
  │
  ├──► 3. Database Account Lifecycle:
  │         ├── CASE A (New User):
  │         │     No existing record found for email in `Users` sheet.
  │         │     Creates permanent `userId`, sanitizes username, appends row.
  │         │     Returns newly minted application user.
  │         └── CASE B (Returning User):
  │               Matching record found in `Users` sheet.
  │               Updates `lastLoginAt` and missing profile fields.
  │               Returns existing persistent application user.
  │
  ├──► 4. Prediction & Telemetry Binding:
  │         All predictions, leaderboard entries, and round scores are bound to the
  │         canonical application `userId` (not client session tokens).
  │
  └──► 5. Failure Transparency:
            Authentication success does not automatically mean database persistence success.
            If the Google Sheets backend fails to persist or find the account, the frontend
            surfaces an explicit error toast rather than masking it in client-side storage.
```

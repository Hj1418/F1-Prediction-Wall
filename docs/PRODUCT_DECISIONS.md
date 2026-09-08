# Product & Architecture Decisions Log

This document records the foundational product and technical decisions for the F1 Community Platform, including context, alternatives considered, and rationale.

---

## Decision 1: Separation of Public Content vs. Authenticated Actions

- **Decision**: Public users have unrestricted access to the Home, Learn F1, Race Weekends, Circuits, and Leaderboard pages without needing an account. Authentication is only required when submitting predictions, saving preferences, or accessing user profiles.
- **Rationale**: Reduces friction to zero for casual fans and newcomers seeking information. Encourages organic exploration and builds trust before asking for credentials.
- **Alternatives Considered**: Gating all views behind a sign-in wall (rejected: damages SEO, causes bounce rates, and alienates new fans).

---

## Decision 2: Google Sign-In as Primary Identity Provider

- **Decision**: Google Sign-In via OAuth 2.0 is the primary authentication path, with local email/password maintained for developer testing, automated suites, and backward compatibility.
- **Rationale**: Zero-friction sign-in for users, verified email addresses, built-in security, and no need to manage password resets.
- **Implementation**: Frontend handles Google credential response (JWT token) and exchanges user details with backend. Existing test scripts (`verify-auth.ts`) continue to test local hashing routines to maintain test fidelity.

---

## Decision 3: Google Sheets & Apps Script as the Platform Backend

- **Decision**: Use a structured Google Spreadsheet with 11 relational sheets as the database, served via a Google Apps Script Web App (`doGet`/`doPost`).
- **Rationale**: 
  - Zero-cost, zero-maintenance database and compute infrastructure.
  - Transparent data inspection and manual score overrides for community admins without needing a custom CMS.
  - Native Google MailApp / GmailApp integration for queued automated notifications.
- **Alternatives Considered**: PostgreSQL/Supabase, Firebase, Redis (rejected: unneeded complexity, ongoing cost, extra dependencies outside project scope).

---

## Decision 4: High-Performance Vector SVGs for Circuit Exploration

- **Decision**: Store all 24 official championship circuit layouts as optimized SVGs in `public/circuits/` indexed by `circuitRegistry.ts`.
- **Rationale**:
  - Instant loading, 0 kB external API latency, zero bandwidth costs.
  - Crisp rendering on any screen density (Retina, mobile, 4K displays).
  - Works offline and in local mock mode without relying on flaky third-party tile servers.

---

## Decision 5: Prediction Lock Timing at Qualifying / Sprint Qualifying Start

- **Decision**: Predictions for any race weekend lock strictly at the scheduled start time of the first competitive timed session (Qualifying for standard weekends, Sprint Qualifying for sprint weekends).
- **Rationale**: Once competitive running begins, car pace hierarchy is revealed. Locking at qualifying start ensures fair competition and authentic predictive skill across all community participants.

---

## Decision 6: Asynchronous, Idempotent Email Notification Queue

- **Decision**: Email notifications (Welcome, Prediction Confirmation, Race Results Published) are buffered into a `NotificationQueue` sheet with unique idempotency keys (`WELCOME:<userId>`, `PREDICTION:<roundId>:<userId>`, `RESULT:<roundId>:<userId>`) processed via Apps Script triggers.
- **Rationale**:
  - Prevents race conditions and duplicate email spam.
  - Avoids blocking synchronous HTTP requests during prediction submissions or admin result publication.
  - Provides a full audit trail in `NotificationLog`.

---

## Decision 7: Direct Linking to Official Sources Instead of Building a News CMS

- **Decision**: Rather than building an article database, scraper, or editorial CMS, the platform maintains curated structured metadata (`OfficialResource`) pointing directly to official `Formula1.com` and `FIA.com` publications.
- **Rationale**:
  - Official publishers own their editorial content; duplicating articles creates copyright and staleness issues.
  - Keeps our codebase lightweight and focused on our core strength: beginner explanations and contextual understanding.
  - Users are directed to authoritative rulebooks and official stewards' notices with zero latency.
- **Alternatives Considered**: Scraping RSS feeds, local article database, markdown blog (rejected: unneeded complexity, high maintenance cost, deviates from core product mission).

---

## Decision 8: Structured 3-Part Pedagogical Framework with Season Governance

- **Decision**: All educational topics are strictly structured into three questions: **1. WHAT IS IT?**, **2. HOW DOES IT WORK?**, and **3. WHY DOES IT MATTER?**, accompanied by explicit governance metadata (Season, Source, Verification Date, Official Link).
- **Rationale**:
  - Eliminates rambling walls of text and ensures bite-sized comprehension for newcomers.
  - Transparently communicates when regulation-sensitive rules were last verified (e.g. 2026 Sporting Regulations Article 39 for Qualifying).
  - Explicitly forbids automatic AI rewriting of regulatory changes, prioritizing accuracy over artificial automation.

---

## Decision 9: Authentication → Application User Persistence Decoupling

- **Decision**: Decouple Google Identity authentication from Google Sheets database user persistence. The application user record in the `Users` sheet—and its associated `userId`—is the single canonical source of truth for predictions, scores, and profile telemetry.
- **Rationale**:
  - Google authentication provides identity assertion (email, name, picture), but the league requires domain-specific state (races participated, season rank, points, favourite constructor, driver selections).
  - Explicit error boundaries prevent the application from presenting a "successful login" if the backend database write failed.
  - Eliminates duplicate accounts via server-side locking (`LockService.getScriptLock()`) and handles first-time vs. returning Google users deterministically.


# The Grid — Critical Bug Fix & Data Integrity Audit Walkthrough

## Executive Summary
This document provides a complete technical walkthrough of the architectural and data integrity fixes implemented across **The Grid** motorsport prediction platform. 

The core architectural principles enforced during this audit:
* **One Real User, One Canonical Identity:** Elimination of duplicate accounts across Google OAuth, signup, and username setup; strict case-insensitive uniqueness; canonical leaderboard deduplication; safe dry-run migration script with automated sheet backup.
* **One Prediction, One Event:** Strict `roundId` isolation; complete decoupling of Singapore GP (`2026_17`) from Azerbaijan GP (`2026_15`); zero cross-aliasing.
* **One Selected Event, One Consistent Result Workflow:** Dynamic event resolution in the Admin Dashboard and Prediction Hub; zero hardcoded race references; dynamic form resets and email templates.
* **Accurate Result & Standings Sharing:** Clean separation between Round points ("Earned This Round") and Season total points ("Championship Standings"); strict admin authorization for global leaderboard stories.
* **Strict Source of Truth & Deadlines:** Prediction rounds lock strictly 60 minutes before session start in Indian Standard Time (IST, UTC+05:30).

---

## 1. Inventory of Modified Files

| File | Purpose & Changes |
|---|---|
| [`backend/Code.gs`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/backend/Code.gs) | Implemented canonical deduplication in `getLeaderboard`; added `auditAndDeduplicateUsers(dryRun)` migration function with backup; removed Azerbaijan aliases in `adminSubmitResult`, `adminCalculateScores`, and `getAdminPredictions`; protected migration functions. |
| [`src/services/apiClient.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/apiClient.ts) | Added client-side canonical deduplication fallback in `getLeaderboard`; removed Singapore-to-Azerbaijan aliases in `getUserPrediction` and `getAdminPredictions`; exposed `auditAndDeduplicateUsers` API call. |
| [`src/services/mockApi.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/mockApi.ts) | Implemented `auditAndDeduplicateUsers` in mock service; hardened `googleLogin` email matching; removed Azerbaijan prediction cross-contamination. |
| [`src/services/mockData.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/mockData.ts) | Updated `closesAt` deadlines in `INITIAL_PREDICTION_ROUNDS` to exactly 60 minutes before session start. |
| [`src/services/schedule/f1ScheduleSyncService.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/schedule/f1ScheduleSyncService.ts) | Enforced 60-minute prediction deadline lock before session start. |
| [`src/services/sharing/storyShareService.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/sharing/storyShareService.ts) | Added `isSeasonSummary` flag; implemented dual rendering pipelines for Season Standings vs Round Prediction Results; preserved admin guard. |
| [`src/pages/LeaderboardPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/LeaderboardPage.tsx) | Configured Season tab to share Season Standings (`isSeasonSummary: true`) and Round tab to share Round results (`isSeasonSummary: false`). |
| [`src/pages/ProfilePage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/ProfilePage.tsx) | Removed hardcoded Azerbaijan fallback; dynamically shares latest scored event points or authentic Season Standing summary. |
| [`src/pages/AdminDashboardPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/AdminDashboardPage.tsx) | Dynamic round initialization via `resolveChampionshipCurrentEvent`; cleaned hardcoded Russell/Verstappen results; dynamic form state resetting; integrated User Audit & Deduplication dry-run modal. |
| [`src/pages/PredictionsHubPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/PredictionsHubPage.tsx) | Added Grand Prix Event Switcher dropdown; dynamic event resolution; IST schedule banner; distinct Sprint vs Grand Prix format badges. |
| [`src/pages/PredictionPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/PredictionPage.tsx) | Hardened `isUpcoming` and `isReadOnly` state flags with non-null round narrowing. |
| [`scripts/verify-p0-data-integrity.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/scripts/verify-p0-data-integrity.ts) | Automated test suite verifying Singapore/Azerbaijan isolation, admin scoring, leaderboard deduplication, dry-run audit, story sharing, and deadlines. |

---

## 2. Detailed Technical Breakdown by Problem Area

### Pillar 1: User Identity & Leaderboard Deduplication (P0)

#### Root Cause
1. In Google Apps Script and mock authentication, users authenticating via Google OAuth were sometimes assigned a new ID even if a record with the same email or username already existed.
2. In Google Sheets, duplicate rows in `Users` had differing user IDs for the same real person.
3. When scores were aggregated in `getLeaderboard`, rows were iterated directly without grouping by canonical identity (lowercase username / email), causing identical usernames to appear multiple times at different ranks with different avatars.

#### Solution
1. **Canonical Identity Merging in `getLeaderboard`:**
   In [`backend/Code.gs`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/backend/Code.gs#L137-L200) and [`src/services/apiClient.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/apiClient.ts#L105-L148):
   ```typescript
   // Group by canonical key: normalized username or normalized email
   const canonicalKey = (entry.username || '').trim().toLowerCase() ||
                        (entry.email || '').trim().toLowerCase() ||
                        entry.userId;
   ```
   * Compares duplicate entries, keeping the highest score and most complete profile avatar.
   * Aggregates `racesParticipated` and `bestWeekendScore` across any duplicate IDs.
   * Eliminates all duplicates so every person has exactly one entry.

2. **Audit & Deduplication Migration Script:**
   In [`backend/Code.gs`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/backend/Code.gs#L1120-L1215), implemented `auditAndDeduplicateUsers(dryRun)`:
   * **Safe Dry Run:** Reports all duplicate groups, canonical records, and duplicate rows to be consolidated without modifying the sheet.
   * **Automated Backup:** When executed with `dryRun: false`, creates a timestamped sheet `Users_Backup_<timestamp>` before making changes.
   * **Foreign Key Re-pointing:** Updates foreign key `userId` references in `Predictions` and `Scores` sheets to the canonical `userId`.
   * **Safe Deletion:** Deletes duplicate rows in descending order to preserve row index integrity.

3. **Admin UI Integration:**
   In [`src/pages/AdminDashboardPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/AdminDashboardPage.tsx#L508-L566), added an **"Audit Duplicates (Dry Run)"** tool in the User Management tab:
   * Admins can inspect duplicate user clusters and affected rows before executing any consolidation.

---

### Pillar 2: Dynamic Prediction Hub & Singapore vs Azerbaijan Isolation (P0)

#### Root Cause
1. `getUserPrediction` and `getAdminPredictions` previously included fallback logic that checked Azerbaijan GP (`2026_15`) whenever Singapore GP (`2026_17`) was requested.
2. `PredictionsHubPage` hardcoded current weekend resolution and lacked a selector for users to browse other rounds on the calendar.

#### Solution
1. **Removed Cross-Aliasing:**
   Removed all `roundId.includes('2026_17') ? '2026_15_RACE_PREDICTION' : ...` logic across [`src/services/apiClient.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/apiClient.ts), [`src/services/mockApi.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/mockApi.ts), and [`backend/Code.gs`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/backend/Code.gs).
   Singapore Grand Prix (`2026_17_RACE_PREDICTION`) and Singapore Sprint (`2026_17_SPRINT_PREDICTION`) now operate with strict, isolated round IDs.

2. **Dynamic Championship Resolution & Event Switcher:**
   In [`src/pages/PredictionsHubPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/PredictionsHubPage.tsx#L85-L150):
   * Dynamically resolves the active event via `resolveChampionshipCurrentEvent(weekends)`.
   * Added a **Grand Prix Event Switcher** dropdown enabling users to switch between any 2026 race weekend.
   * Displays distinct badges: `⚡ SPRINT RACE PREDICTION` vs `🏁 GRAND PRIX PREDICTION`.
   * Displays complete weekend session schedules formatted in Indian Standard Time (IST).

---

### Pillar 3: Admin Results Decoupling & Canonical Upcoming Event Resolution (P0)

#### Root Cause
1. `AdminDashboardPage` previously defaulted `selectedRoundId` to a hardcoded string (`2026_15_RACE_PREDICTION`), or passed `raceRounds` (`PredictionRound[]`) directly into `resolveChampionshipCurrentEvent`. Because `PredictionRound` lacked `startDate`/`endDate`, `parseEventDateBounds` fell back to `2026-01-01` (`COMPLETED`), causing the resolver to fall back to the last event in the championship calendar (Abu Dhabi GP).
2. Form fields for official race results defaulted to hardcoded dummy data: Russell (P1), Verstappen (P2), Hadjar (P3).
3. `submitPrediction` in `backend/Code.gs` and `mockApi.ts` only checked `serverTime > closeTime`, failing to check whether `round.status === 'UPCOMING'` or `serverTime < openTime`. This allowed early test submissions into future rounds before predictions opened.
4. The Admin Predictions table hardcoded the badge `LOCKED 🔒` for all rounds regardless of whether the round was `UPCOMING`, `OPEN`, or `SCORED`.

#### Solution
1. **Canonical Active/Upcoming Weekend Resolution:**
   In [`src/pages/AdminDashboardPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/AdminDashboardPage.tsx):
   * Resolves the current event from `wList` (`RaceWeekend[]`) which contains canonical session dates:
     ```typescript
     const weekendResolution = resolveChampionshipCurrentEvent(wList);
     const activeWeekend = weekendResolution.currentEvent;
     ```
   * On October 12, 2026 (post-Singapore GP), `resolveChampionshipCurrentEvent(wList)` accurately resolves to **United States Grand Prix (Texas • Circuit of the Americas)** (Round 19).
   * Finds and selects the corresponding prediction round (`2026_19_SPRINT_PREDICTION` or `2026_19_RACE_PREDICTION`) instead of falling back to Abu Dhabi.
   * Also hardened [`src/services/schedule/eventStatusResolver.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/schedule/eventStatusResolver.ts) so `parseEventDateBounds` parses `opensAt` and `closesAt` for `PredictionRound` objects.
2. **Backend Submission Gating:**
   In [`backend/Code.gs`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/backend/Code.gs) and [`src/services/mockApi.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/mockApi.ts):
   * Rejects submissions when `round.status === 'UPCOMING'` or `serverTime < openTime`:
     ```javascript
     if (round.status === 'UPCOMING' || (round.opensAt && serverTime.getTime() < openTime.getTime())) {
       throw new Error('Predictions are not open yet for ' + round.title + '. Entry opens on ' + round.opensAt);
     }
     ```
3. **Dynamic Admin Table Status & Upcoming Banner:**
   In [`src/pages/AdminDashboardPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/AdminDashboardPage.tsx):
   * Renders an informative `UPCOMING` banner when viewing a future round that is not open to public predictions yet.
   * The status column dynamically renders `SUBMITTED (UPCOMING)` for pre-window entries, `ACTIVE (OPEN)` for live rounds, and `LOCKED 🔒` for closed sessions.
   * Sorted the round selector dropdown chronologically by round number.

---

### Pillar 4: Story & Result Sharing Accuracy (P1)

#### Root Cause
1. When sharing from the user profile, the story generator used total season points and labeled them as "Earned This Round", defaulting to "Azerbaijan Grand Prix".
2. The card template did not distinguish between a single event result and overall championship standing.

#### Solution
1. **Dual Story Modes:**
   In [`src/services/sharing/storyShareService.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/sharing/storyShareService.ts#L22-L135), added `isSeasonSummary?: boolean`:
   * **When `isSeasonSummary: true`:**
     * Eyebrow: `🏆 CHAMPIONSHIP STANDINGS`
     * Stat Label: `TOTAL SEASON POINTS`
     * Sub-label: `P${rank} IN THE CHAMPIONSHIP`
   * **When `isSeasonSummary: false`:**
     * Eyebrow: `🏁 PREDICTION RESULT`
     * Stat Label: `EARNED THIS ROUND`
     * Sub-label: `P${rank} ON THE GRID`
2. **Context-Aware Triggering:**
   * [`src/pages/LeaderboardPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/LeaderboardPage.tsx#L145-L175): Season tab shares Season Standings; Round tab shares Round results.
   * [`src/pages/ProfilePage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/ProfilePage.tsx#L190-L245): If the user has scored races, shares points from their latest scored race; if none, generates a Season Standing card.
3. **Admin Guard on Global Leaderboard Story:**
   Strictly gates global leaderboard story creation to admin accounts via `assertAdminAuthorized`.

---

### Pillar 5: Prediction Lifecycle & Deadline Lock (P0)

#### Root Cause
1. Some legacy logic calculated closing deadlines as "Qualifying + 5 hours" or approximate offsets.
2. `PredictionPage` had an assertion mismatch in automated tests regarding `isUpcoming`.

#### Solution
1. **60-Minute Deadline Lock:**
   In [`src/services/mockData.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/mockData.ts) and [`src/services/schedule/f1ScheduleSyncService.ts`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/services/schedule/f1ScheduleSyncService.ts):
   Prediction deadlines lock strictly 60 minutes before session start:
   ```typescript
   closesAt = new Date(sessionStartTime.getTime() - 60 * 60 * 1000).toISOString();
   ```
2. **Hardened PredictionPage Flags:**
   In [`src/pages/PredictionPage.tsx`](file:///c:/Users/harsh/Desktop/NGDL%20Projects/My%20Projects/F1%20Prediction%20Wall/src/pages/PredictionPage.tsx#L200-L235):
   ```typescript
   const isUpcoming = round.status === 'UPCOMING';
   const isScored = round.status === 'SCORED' || (round.status === 'COMPLETED' && Boolean(officialResult));
   const isLocked = round.status === 'LOCKED' || (round.status === 'COMPLETED' && !officialResult);
   const isOpen = round.status === 'OPEN';
   const isReadOnly = isLocked || isScored || isUpcoming;
   ```

---

## 3. Verification Test Results

### 1. `scripts/verify-p0-data-integrity.ts`
All **21/21** data integrity assertions passed:
* ✓ Singapore GP (`2026_17`) vs Azerbaijan GP (`2026_15`) round isolation (no cross-leakage).
* ✓ Admin result submission and scoring pipeline for Singapore GP with independent results.
* ✓ Case-insensitive username validation in `checkUsername`.
* ✓ Zero duplicate usernames on the public leaderboard.
* ✓ Safe dry-run user audit and consolidation report.
* ✓ Story share card dimensions (1080x1920 9:16) and distinct layout rendering.
* ✓ Strict admin-only guard for global leaderboard sharing.
* ✓ Prediction deadline lock exactly 60 minutes before session start.

### 2. `scripts/verify-sync.ts`
All **19/19** synchronization tests passed:
* ✓ Session schedule parsing, Sprint weekend detection, and idempotent round generation.

### 3. Full Test Suite (`npm test`)
All unit, integration, authentication, admin, and phase tests passed with **0 failures**:
* ✓ Phase 8A to 8F suites.
* ✓ Phase 9, 10, and 11 suites.
* ✓ Master UI/UX and scoring suites.

### 4. TypeScript Compiler (`npx tsc --noEmit`)
* **0 compilation errors.** Clean build across the entire project.

---

## 4. Maintenance & Operations Guide

### How to Run the User Audit in Production Google Sheets
1. Navigate to the **Admin Dashboard** (`/admin`).
2. Open the **Users** tab.
3. Click the **"Audit Duplicates (Dry Run)"** button.
4. Review the modal report showing duplicate clusters, canonical selections, and affected rows.
5. In Google Apps Script, execute `auditAndDeduplicateUsers(false)` when ready to commit changes. The script automatically creates `Users_Backup_<timestamp>` before modifying data.

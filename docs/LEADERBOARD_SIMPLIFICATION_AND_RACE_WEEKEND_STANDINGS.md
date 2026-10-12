# THE GRID — LEADERBOARD SIMPLIFICATION & RACE WEEKEND STANDINGS REPORT

**Project:** The Grid — F1 Prediction Platform  
**Status:** Completed & Fully Verified  
**Date:** October 12, 2026  
**Test Suite Status:** 100% Passed (39/39 verification test scripts passing, 0 failures)

---

## Executive Summary

The Championship Standings page has been updated to deliver a clean, accurate, F1-style championship leaderboard adhering strictly to the **Two-View Model**:
1. **SEASON OVERALL**
2. **WEEKEND OVERALL**

All obsolete UI, state variables, and dropdown controls for the legacy **Session Round** view have been permanently removed without breaking or deleting historical prediction records or scoring data.

Additionally, the Weekend Overall view now dynamically resolves to the **latest completed race weekend with finalized, verified results** by default (e.g. Singapore Grand Prix, Round 17), eliminating the previous bug where the UI incorrectly defaulted to Round 1 (Australian Grand Prix).

---

## 1. Root Cause Analysis

### 1.1 Root Cause of Round 1 Default in Weekend Standings
In the original `LeaderboardPage.tsx`, metadata initialization contained:
```ts
const activeOrFirst = wList.find(w => w.status === 'ACTIVE') || wList[0];
setSelectedWeekendId(activeOrFirst.raceWeekendId);
```
- When no active weekend was currently running, `wList[0]` was selected. Because `wList` was ordered by calendar schedule (Round 1 Australia at index 0), the selector always defaulted to Australia (`2026_01`), a round with no finalized community scores.
- Furthermore, it did not check whether a race weekend was **completed** or whether its official prediction round had reached **finalized/scored** status.

### 1.2 Root Cause of Session Round Proliferation
- The leaderboard previously split rankings into three tabs: `Season Overall`, `This Weekend`, and `Session Round`.
- Session Round exposed individual rounds like `2026_15_RACE_PREDICTION`, causing user confusion when viewing championship standings.
- The prompt required consolidating all leaderboard views into exactly two canonical F1-style standings tables: **Season Overall** (cumulative championship points) and **Weekend Overall** (aggregated Sprint + Grand Prix points for that race weekend).

### 1.3 Weekend Scoring & Sprint Point Separation
- Previously, `getLeaderboard('weekend', weekendId)` returned only a flat `totalPoints` without categorizing points into **Sprint Points** and **Grand Prix Points**.
- When weekends featured both Sprint and GP rounds, users could not see where their weekend total points came from.

---

## 2. Key Architecture & Logic Changes

### 2.1 Dynamic Default-Event Resolution (`resolveLatestCompletedAndFinalizedWeekend`)
Implemented in `src/utils/raceLifecycle.ts`:
```ts
export function resolveLatestCompletedAndFinalizedWeekend(
  weekends: RaceWeekend[],
  rounds: PredictionRound[],
  nowTime: Date | number = new Date()
): RaceWeekend | null
```
**Resolution Workflow:**
1. **Event Lifecycle Evaluation:** Evaluates whether a weekend has concluded using `computeWeekendStatus(w, nowTime) === 'COMPLETED'` or `w.status === 'COMPLETED'`.
2. **Result Publication & Scoring State:** Verifies that the weekend has at least one associated prediction round (`rounds.filter(r => r.raceWeekendId === w.raceWeekendId)`) with `round.status === 'SCORED'` and published official results.
3. **Pending Round Protection:** If a race finished 2 hours ago but results are pending stewarding or scoring (`status === 'LOCKED'` or `'UNDER_REVIEW'`), it is **not** treated as finalized. The resolver automatically selects the most recent verified event (e.g., Azerbaijan if Singapore is pending).
4. **Chronological Descending Order:** Eligible finalized weekends are sorted chronologically, newest first (`roundNumber DESC`, then `date DESC`).
5. **Zero Hardcoding:** No race name or ID is hardcoded. As future races conclude (e.g. Austin R19, Brazil R21), they dynamically become the default upon scoring.

### 2.2 Weekend Standings Scoring & Sprint Separation
Updated in `src/services/mockApi.ts`, `src/services/apiClient.ts`, and `backend/Code.gs`:
- Filters prediction rounds for the selected `raceWeekendId`.
- Classifies rounds as **Sprint** (`roundType === 'SPRINT'` or `roundId` contains `SPRINT`) or **Grand Prix** (`roundType === 'GRAND_PRIX'` or `roundType === 'RACE'`).
- Calculates:
  - `sprintPoints`: points earned in the Sprint round.
  - `grandPrixPoints`: points earned in the Grand Prix round.
  - `totalPoints`: `sprintPoints + grandPrixPoints`.
- **Isolation Guarantee:** Points from previous or subsequent weekends are strictly excluded.
- **Season Non-Leakage:** Season totals never leak into weekend standings. Users with 0 points in the selected weekend are explicitly unranked / 0 PTS.

### 2.3 Deterministic Tie-Breaking
Established and enforced across `mockApi.ts`, `apiClient.ts`, and `backend/Code.gs`:
1. `totalPoints` DESC (primary score)
2. `exactP1Count` DESC (exact P1 race predictions)
3. `perfectPodiumCount` DESC (perfect podium bonuses)
4. `username` ASC (case-insensitive deterministic tie-break)

### 2.4 F1-Style Standings Presentation

#### Season Overall Table
- **POS**: Rank badge with motorsport styling (Gold for P1, Silver for P2, Bronze for P3, Crown icon)
- **+/-**: Position movement delta
- **USERNAME**: Racer avatar and public username linking to `/profile/:username`
- **WEEKENDS**: Number of distinct race weekends participated in
- **EXACT P1**: Exact P1 prediction count
- **PERFECT PODIUM**: Perfect podium bonus count
- **AVG PTS**: Average points per scored weekend
- **TOTAL PTS**: Cumulative season championship points

#### Weekend Overall Table
- **POS**: Rank badge with motorsport styling
- **USERNAME**: Racer avatar and public username
- **SPRINT PTS**: Points earned in the Sprint race (dynamically displayed when the weekend includes a Sprint)
- **GRAND PRIX PTS**: Points earned in the Grand Prix race
- **WEEKEND TOTAL**: Total points earned during that race weekend only

#### Dynamic "YOUR POSITION" Card
- Displays active view statistics:
  - **Season Overall**: "SEASON RANK: P{rank}", "SEASON SCORE: {points} PTS", movement delta.
  - **Weekend Overall**: "WEEKEND RANK: P{rank}", "WEEKEND SCORE: {points} PTS" (or "UNRANKED: 0 PTS" if not participated).
- **Share Rank CTA**:
  - Season generates "Championship Standing" story card.
  - Weekend generates specific "{Event Name} Result" story card.

---

## 3. Files Modified

| File | Changes Made |
| :--- | :--- |
| `src/pages/LeaderboardPage.tsx` | Completely refactored to exactly two views (`season` & `weekend`), removed Session Round tab & selector, added dynamic default weekend resolver, updated selector with chronological newest-first ordering, implemented distinct F1 tables for Season vs Weekend. |
| `src/types/index.ts` | Added `sprintPoints?: number;` and `grandPrixPoints?: number;` to `LeaderboardEntry`. |
| `src/utils/raceLifecycle.ts` | Added `resolveLatestCompletedAndFinalizedWeekend` with authoritative lifecycle & result verification rules. |
| `src/services/mockApi.ts` | Updated `getLeaderboard('weekend')` to aggregate Sprint and GP scores, populate `sprintPoints` and `grandPrixPoints`, deduplicate canonical user identities, and enforce deterministic tie-breaking. |
| `src/services/apiClient.ts` | Updated `getLeaderboard` merge logic to preserve `sprintPoints` and `grandPrixPoints`, and enforce deterministic tie-breaking. |
| `backend/Code.gs` | Updated Apps Script `getLeaderboard(type, id)` for `type === 'weekend'` with `PredictionRounds` sheet metadata mapping, Sprint/GP points calculation, zero score leakage protection, and deterministic sorting. |
| `src/services/mockData.ts` | Updated Singapore GP (`2026_17`) to `COMPLETED` and scored with official results. Added Chinese GP (`2026_02`) Sprint and GP scored predictions for end-to-end Sprint weekend testing. |
| `src/pages/PredictionPage.tsx` | Updated leaderboard links from legacy `?type=round&id=...` to `?type=weekend&id=...` with text "Weekend Standings". |
| `scripts/verify-leaderboard-simplification.ts` | Created automated regression test suite covering all 8 verification criteria. |
| `scripts/run-all-tests.js` | Added `verify-leaderboard-simplification.ts` to the main test runner. |

---

## 4. Verification Test Results

```
🏁 STARTING LEADERBOARD SIMPLIFICATION & RACE WEEKEND STANDINGS VERIFICATION

📌 TEST 1: LeaderboardPage UI Structure Audit
  ✓ LeaderboardPage includes explicit tab buttons for Season Overall and Weekend Overall
  ✓ Session Round tab button and user-facing navigation are completely removed from LeaderboardPage
  ✓ Obsolete selectedRoundId state and session round selector dropdown are eliminated
  ✓ Weekend selector dropdown is cleanly available in Weekend Overall view

📌 TEST 2: Dynamic Resolution of Latest Completed & Finalized Weekend
  ✓ Resolver returned a valid race weekend
  ✓ Resolved to Singapore Grand Prix (2026_17), NOT Australia or hardcoded choice
  ✓ Did not default to Round 1 Australia
  ✓ Pending Singapore round is not treated as scored; safely resolves to latest finalized weekend (Azerbaijan 2026_15)
  ✓ When newer race (Austin 2026_19) completes and scores, resolver automatically selects Austin without code modifications

📌 TEST 3: Live Application Metadata Resolution
  ✓ Authoritative environment resolved a default weekend
  ✓ Default weekend for Weekend Overall resolved to Singapore Grand Prix (2026_17)

📌 TEST 4: Weekend Standings Points Isolation
  ✓ Singapore leaderboard returned scored entries
  ✓ Top entry has rank 1
  ✓ Winner has 40 total points in Singapore (got 40)
  ✓ Normal weekend correctly records Grand Prix points (got 40)
  ✓ Rank ordering is strictly descending: P1 (40 PTS) >= P2 (35 PTS) >= ...

📌 TEST 5: Sprint Weekend Scoring Breakdown (Chinese GP 2026_02)
  ✓ Chinese GP Sprint weekend returned entries
  ✓ Sprint points explicitly recorded: 15 PTS (got 15)
  ✓ Grand Prix points explicitly recorded: 30 PTS (got 30)
  ✓ Weekend total correctly sums Sprint (15) + Grand Prix (30) = 45 PTS (got 45)

📌 TEST 6: Season Overall Totals Invariance
  ✓ Season leaderboard returns entries
  ✓ Season leaderboard row count is identical before and after viewing weekends
  ✓ Championship leader season points remain invariant: 115 PTS
  ✓ Championship leader user ID remains invariant
  ✓ Season total (115 PTS) is properly aggregated across multiple weekends and strictly distinct from single-weekend score (40 PTS)

📌 TEST 7: Canonical Identity Deduplication
  ✓ No duplicate userId in Season Overall
  ✓ No duplicate userId in Weekend Overall

📌 TEST 8: Deterministic Tie-Breaking Verification
  ✓ Exact P1 tie-break holds
  ✓ Alphabetical tie-break holds

🎉 ALL 8 LEADERBOARD SIMPLIFICATION & RACE WEEKEND STANDINGS TESTS PASSED!
```

---

## 5. Build & Typecheck Status
- `npx tsc -b`: 0 errors
- `npm run lint`: 0 errors in modified codebase
- `npm run build`: Production bundle built cleanly in 1.32s (`dist/assets/LeaderboardPage-*.js`)
- `npm test`: 100% passed across all 39 test scripts

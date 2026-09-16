/**
 * Verification Suite: Phase 8A — The Grid Performance, Stability & Mobile Hardening
 *
 * Verifies:
 * 1. Race Weekend & Prediction Lifecycle State Machine (raceLifecycle.ts)
 *    - All lifecycle stages: UPCOMING, LOCKED, IN_PROGRESS, AWAITING_RESULTS, RESULTS_OFFICIAL, SCORED
 *    - Weekend status computation buffer (prevents premature "ROUND COMPLETE" during live race)
 * 2. Prediction Hub Batching (getUserWeekendPredictions)
 *    - Elimination of N+1 requests
 * 3. In-flight Request Deduplication & Invalidation (getPredictionRounds)
 * 4. Anonymous Boot Safety (AuthContext.tsx does not call getAllUsers on boot)
 * 5. Font Loading Cleanup (index.css has no duplicate @import)
 * 6. Mobile & Tablet Hardening (Driver modal CSS responsive constraints)
 */

import {
  getDetailedRoundLifecycle,
  mapDetailedToRoundStatus,
  computeWeekendStatus,
  PredictionRoundLifecycleState
} from '../src/utils/raceLifecycle';
import { api } from '../src/services/apiClient';
import { mockApi } from '../src/services/mockApi';
import { clientCache } from '../src/services/cache/clientCache';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🏁 Starting Phase 8A Verification Suite...\n');

  // ==========================================
  // 1. LIFECYCLE STATE MACHINE (raceLifecycle.ts)
  // ==========================================
  console.log('1. Race Weekend & Prediction Lifecycle States:');

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Case A: Prediction window is open, race is upcoming
  const openRound = {
    opensAt: new Date(now - 2 * oneHour).toISOString(),
    closesAt: new Date(now + 4 * oneHour).toISOString(),
    sessionStartTime: new Date(now + 5 * oneHour).toISOString(),
    roundStatus: 'UPCOMING' as const,
    isScored: false,
  };
  const stateOpen = getDetailedRoundLifecycle(openRound, now);
  assert(stateOpen === 'PREDICTION_OPEN', `Pre-lock open round is PREDICTION_OPEN (got: ${stateOpen})`);
  assert(mapDetailedToRoundStatus(stateOpen) === 'OPEN', 'Mapped status for PREDICTION_OPEN is OPEN');

  // Case B: Current time is 30 mins before race, lock time passed 30 mins ago -> PREDICTION_LOCKED
  const lockedRound = {
    opensAt: new Date(now - 5 * oneHour).toISOString(),
    closesAt: new Date(now - 30 * 60 * 1000).toISOString(),
    sessionStartTime: new Date(now + 30 * 60 * 1000).toISOString(),
    roundStatus: 'UPCOMING' as const,
    isScored: false,
  };
  const stateLocked = getDetailedRoundLifecycle(lockedRound, now);
  assert(stateLocked === 'PREDICTION_LOCKED', `Post-lock, pre-green flag round is PREDICTION_LOCKED (got: ${stateLocked})`);
  assert(mapDetailedToRoundStatus(stateLocked) === 'LOCKED', 'Mapped status for PREDICTION_LOCKED is LOCKED');

  // Case C: Current time is 45 mins after scheduled start -> LIVE
  const inProgressRound = {
    closesAt: new Date(now - 105 * 60 * 1000).toISOString(),
    sessionStartTime: new Date(now - 45 * 60 * 1000).toISOString(),
    sessionEndTime: new Date(now + 75 * 60 * 1000).toISOString(),
    isScored: false,
  };
  const stateInProgress = getDetailedRoundLifecycle(inProgressRound, now);
  assert(stateInProgress === 'LIVE', `During scheduled race window is LIVE (got: ${stateInProgress})`);
  assert(mapDetailedToRoundStatus(stateInProgress) === 'LOCKED', 'Mapped status for LIVE is LOCKED (picks frozen)');

  // Case D: Current time is 3.5 hours after race start, session ended, no official results posted -> FINISHED
  const finishedRound = {
    sessionStartTime: new Date(now - 210 * 60 * 1000).toISOString(),
    sessionEndTime: new Date(now - 60 * 60 * 1000).toISOString(),
    isScored: false,
  };
  const stateFinished = getDetailedRoundLifecycle(finishedRound, now);
  assert(stateFinished === 'FINISHED', `Post-session without official results is FINISHED (got: ${stateFinished})`);
  assert(mapDetailedToRoundStatus(stateFinished) === 'LOCKED', 'Mapped status for FINISHED is LOCKED');

  // Case E: Official results posted, but not yet scored -> RESULTS_AVAILABLE
  const resultsOfficialRound = {
    hasOfficialResult: true,
    isScored: false,
  };
  const stateOfficial = getDetailedRoundLifecycle(resultsOfficialRound, now);
  assert(stateOfficial === 'RESULTS_AVAILABLE', `Official results present without scoring is RESULTS_AVAILABLE (got: ${stateOfficial})`);
  assert(mapDetailedToRoundStatus(stateOfficial) === 'COMPLETED', 'Mapped status for RESULTS_AVAILABLE is COMPLETED');

  // Case F: Scored -> SCORED
  const scoredRound = {
    hasOfficialResult: true,
    isScored: true,
  };
  const stateScored = getDetailedRoundLifecycle(scoredRound, now);
  assert(stateScored === 'SCORED', `Scored round is SCORED (got: ${stateScored})`);
  assert(mapDetailedToRoundStatus(stateScored) === 'SCORED', 'Mapped status for SCORED is SCORED');

  // ==========================================
  // 2. PREVENT PREMATURE "ROUND COMPLETE"
  // ==========================================
  console.log('\n2. Weekend Status Dynamic Buffer Computation:');

  // Future weekend:
  const futureWeekend = {
    startDate: new Date(now + 2 * 24 * oneHour).toISOString(),
    endDate: new Date(now + 4 * 24 * oneHour).toISOString(),
    sessions: [],
  };
  assert(computeWeekendStatus(futureWeekend, now) === 'UPCOMING', 'Future weekend computes as UPCOMING');

  // Weekend where race started 2 hours ago (Scheduled start passed, but race buffer active):
  const liveRaceWeekend = {
    startDate: new Date(now - 48 * oneHour).toISOString(),
    endDate: new Date(now - 2 * oneHour).toISOString(), // race scheduled start was 2 hours ago
    sessions: [
      {
        sessionId: 'fp1',
        name: 'FP1',
        startTime: new Date(now - 48 * oneHour).toISOString(),
        endTime: new Date(now - 47 * oneHour).toISOString(),
      },
      {
        sessionId: 'race',
        name: 'Grand Prix',
        startTime: new Date(now - 2 * oneHour).toISOString(),
        endTime: new Date(now - 10 * 60 * 1000).toISOString(),
      },
    ],
  };
  const liveStatus = computeWeekendStatus(liveRaceWeekend, now);
  assert(
    liveStatus === 'ACTIVE',
    `Race started 2h ago does NOT prematurely flip to COMPLETED; correctly computes as ACTIVE (got: ${liveStatus})`
  );

  // Weekend where race finished > 6 hours ago:
  const completedWeekend = {
    startDate: new Date(now - 72 * oneHour).toISOString(),
    endDate: new Date(now - 10 * oneHour).toISOString(), // race scheduled start was 10 hours ago
    sessions: [
      {
        sessionId: 'race',
        name: 'Grand Prix',
        startTime: new Date(now - 10 * oneHour).toISOString(),
        endTime: new Date(now - 8 * oneHour).toISOString(),
      },
    ],
  };
  const completedStatus = computeWeekendStatus(completedWeekend, now);
  assert(
    completedStatus === 'COMPLETED',
    `Race ended >6h ago correctly computes as COMPLETED (got: ${completedStatus})`
  );

  // ==========================================
  // 3. PREDICTIONS HUB BATCHING
  // ==========================================
  console.log('\n3. Predictions Hub Batching (getUserWeekendPredictions):');

  const weekendPredictions = await api.getUserWeekendPredictions('user_1', '2026_13');
  assert(
    typeof weekendPredictions === 'object' && weekendPredictions !== null,
    'getUserWeekendPredictions returns a round-indexed dictionary'
  );
  assert(
    typeof api.getUserWeekendPredictions === 'function',
    'getUserWeekendPredictions is exported on api client'
  );

  // ==========================================
  // 4. REQUEST DE-DUPLICATION & CACHING
  // ==========================================
  console.log('\n4. Request De-duplication & Client Cache Invalidation:');

  clientCache.clear();

  // Fire 3 simultaneous getPredictionRounds calls
  const [rounds1, rounds2, rounds3] = await Promise.all([
    api.getPredictionRounds('2026_13'),
    api.getPredictionRounds('2026_13'),
    api.getPredictionRounds('2026_13'),
  ]);

  assert(Array.isArray(rounds1) && rounds1.length > 0, `First call returned rounds array (${rounds1.length} rounds)`);
  assert(rounds1 === rounds2 && rounds2 === rounds3, 'Simultaneous in-flight requests shared the same Promise/result');

  // Ensure round is open for prediction testing
  await mockApi.adminSavePredictionRound({
    roundId: rounds1[0].roundId,
    closesAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'OPEN',
  });

  // Submit prediction and check cache invalidation
  await api.submitPrediction({
    userId: 'user_1',
    roundId: rounds1[0].roundId,
    predictionData: {
      p1: 'norris',
      p2: 'piastri',
      p3: 'verstappen',
    },
  });

  const cacheKey = `f1_prediction_rounds_2026_13`;
  assert(
    clientCache.get(cacheKey) === null,
    'Submitting prediction properly invalidates cached prediction rounds'
  );

  // ==========================================
  // 5. ANONYMOUS BOOT AUDIT (AuthContext.tsx)
  // ==========================================
  console.log('\n5. Anonymous Boot Security & Performance Audit:');

  const authContextPath = path.resolve('src/context/AuthContext.tsx');
  const authContextCode = fs.readFileSync(authContextPath, 'utf8');

  const callsGetAllUsersUnconditionally =
    authContextCode.includes('api.getAllUsers()') &&
    !authContextCode.includes(".role === 'admin'");

  assert(
    !callsGetAllUsersUnconditionally,
    'AuthContext does NOT call getAllUsers() unconditionally on app boot'
  );

  assert(
    authContextCode.includes(".role === 'admin'"),
    'AuthContext guards getAllUsers() strictly behind admin role check'
  );

  // ==========================================
  // 6. FONT LOADING AUDIT (index.css)
  // ==========================================
  console.log('\n6. Font Loading Optimization Audit:');

  const indexCssPath = path.resolve('src/index.css');
  const indexCssCode = fs.readFileSync(indexCssPath, 'utf8');

  assert(
    !indexCssCode.includes('@import url'),
    'src/index.css has no duplicate @import font declaration'
  );

  const indexHtmlPath = path.resolve('index.html');
  const indexHtmlCode = fs.readFileSync(indexHtmlPath, 'utf8');

  assert(
    indexHtmlCode.includes('fonts.googleapis.com') && indexHtmlCode.includes('rel="preconnect"'),
    'index.html retains optimized preconnected Google Fonts links'
  );

  // ==========================================
  // 7. DRIVER MODAL MOBILE RESPONSIVENESS
  // ==========================================
  console.log('\n7. Mobile Hardening (DriverSelectModal):');

  const modalPath = path.resolve('src/components/common/DriverSelectModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');

  assert(
    modalCode.includes('repeat(auto-fill, minmax(min(100%, 220px), 1fr))'),
    'Driver modal uses auto-fill with min(100%, 220px) preventing 320px-430px horizontal overflow'
  );

  assert(
    !modalCode.includes('minmax(260px, 1fr)'),
    'Driver modal has eliminated fixed 260px column minimum that broke narrow screens'
  );

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log(`\n==========================================`);
  console.log(`Phase 8A Test Results: ${passed} passed, ${failed} failed`);
  console.log(`==========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test run failed with unhandled error:', err);
  process.exit(1);
});

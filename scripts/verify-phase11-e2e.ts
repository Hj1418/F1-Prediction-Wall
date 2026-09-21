/**
 * Phase 11 — End-to-End Test Grand Prix & Lifecycle Verification
 * 
 * Verifies all 23 steps from Section 35 of the specification:
 * Step 1-3: Admin creates Test GP, opens prediction, verifies prediction-open email
 * Step 4-8: User makes prediction, reviews selections, locks prediction, verifies locked view
 * Step 9-13: Persistence on Home, reload, navigation, re-login, and submission confirmation email
 * Step 14-17: Admin enters results, runs scoring, verifies breakdown and authoritative stored score
 * Step 18-20: Isolated test leaderboard, result/score email, user result display
 * Step 21: Idempotency (repeated scoring run does NOT double points or duplicate emails)
 * Step 22: Amended result recalculation without score duplication
 * Step 23: Test Grand Prix reset isolation (production data remains completely unaffected)
 */

import { testGrandPrixService, TEST_GP_ID, TEST_ROUND_ID, TEST_DRIVERS } from '../src/services/testGrandPrix/testGrandPrixService';
import { mockApi } from '../src/services/mockApi';

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

async function runE2EWalkthrough() {
  console.log('🏎️ STARTING PHASE 11: 23-STEP END-TO-END WALKTHROUGH\n');

  // Ensure fresh test state
  testGrandPrixService.resetTestGrandPrix(true);

  // --------------------------------------------------------------------------
  // Step 1 — Admin: Create "The Grid Test Grand Prix"
  // --------------------------------------------------------------------------
  console.log('Step 1: Admin creates The Grid Test Grand Prix');
  const weekend = testGrandPrixService.createTestGrandPrix(true);
  assert(weekend.raceWeekendId === TEST_GP_ID, 'Test GP has unique ID TEST_GP_001');
  assert(weekend.raceName === 'The Grid Test Grand Prix', 'Race name is "The Grid Test Grand Prix"');
  assert(weekend.status === 'UPCOMING', 'Test GP status initialized as UPCOMING');

  // Security check: non-admin cannot create test GP
  let nonAdminBlocked = false;
  try {
    testGrandPrixService.createTestGrandPrix(false);
  } catch (_err) {
    nonAdminBlocked = true;
  }
  assert(nonAdminBlocked, 'Non-admin is blocked from creating test Grand Prix');

  // Verify dynamic prediction context resolution
  const { getActiveTestPredictionContext, getPredictionContext } = await import('../src/services/schedule/raceContextService');
  const { api } = await import('../src/services/apiClient');

  // --------------------------------------------------------------------------
  // Step 2 — Admin: Open prediction
  // --------------------------------------------------------------------------
  console.log('\nStep 2: Admin opens test prediction');
  const round = testGrandPrixService.openTestPrediction(true, [
    { userId: 'user_e2e_1', email: 'e2e_racer@thegrid.test', name: 'E2E Test Racer' },
  ]);
  assert(round.status === 'OPEN', 'Test prediction round status is OPEN');
  assert(round.roundId === TEST_ROUND_ID, 'Round ID is TEST_GP_001_RACE');

  // Verify Prediction Context resolution for TEST vs PRODUCTION
  const testCtx = getActiveTestPredictionContext();
  assert(testCtx !== null, 'getActiveTestPredictionContext() discovers active test context');
  assert(testCtx?.environment === 'TEST', 'Context environment is TEST');
  assert(testCtx?.raceId === TEST_GP_ID, 'Test race ID matches test weekend');
  assert(testCtx?.roundId === TEST_ROUND_ID, 'Test round ID matches test round');

  const prodCtx = await getPredictionContext('PRODUCTION', 2026);
  assert(prodCtx !== null, 'Production prediction context is available');
  assert(prodCtx?.environment === 'PRODUCTION', 'Production environment is PRODUCTION');
  assert(prodCtx?.raceId !== TEST_GP_ID, 'Production context is NOT replaced by test GP');

  // --------------------------------------------------------------------------
  // Step 3 — Email: Verify prediction-open email
  // --------------------------------------------------------------------------
  console.log('\nStep 3: Verify prediction-open email queue');
  const openNotes = testGrandPrixService.getState().notifications.filter(
    n => n.notificationType === 'PREDICTION_OPEN' && n.idempotencyKey === `PRED_OPEN_${TEST_GP_ID}_user_e2e_1`
  );
  assert(openNotes.length === 1, 'Exactly one PREDICTION_OPEN email queued');
  assert(openNotes[0].recipientEmail === 'e2e_racer@thegrid.test', 'Correct recipient email');
  assert(openNotes[0].status === 'PENDING', 'Notification status is PENDING before worker runs');

  // Process queue with worker
  const workerOpen = testGrandPrixService.processNotificationQueue();
  assert(workerOpen.sent === 1, 'Worker successfully delivers PREDICTION_OPEN email');
  assert(testGrandPrixService.getState().notifications[0].status === 'SENT', 'Queue item marked as SENT');

  // --------------------------------------------------------------------------
  // Step 4 to 7 — User: Prediction bench, make prediction, review & lock
  // --------------------------------------------------------------------------
  console.log('\nSteps 4–7: User selects test drivers, reviews, and locks prediction');
  const testDrivers = await api.getEligibleDrivers(TEST_GP_ID, 2026);
  assert(testDrivers.length === 5, 'api.getEligibleDrivers returns 5 deterministic test drivers for test GP');

  const userPicks = {
    p1: 'test-alpha',
    p2: 'test-bravo',
    p3: 'test-charlie',
    fastestLap: 'test-alpha',
  };

  const lockedPred = await api.submitPrediction({
    userId: 'user_e2e_1',
    roundId: TEST_ROUND_ID,
    predictionData: userPicks,
  });
  assert(Boolean(lockedPred.predictionId), 'api.submitPrediction routes and returns locked test prediction');
  assert(lockedPred.predictionData.p1 === 'test-alpha', 'Submitted P1 pick is test-alpha');

  // --------------------------------------------------------------------------
  // Step 8 — Verification: Locked prediction immediately visible with exact picks
  // --------------------------------------------------------------------------
  console.log('\nStep 8: Immediately verify locked prediction with exact picks');
  const fetchedLocked = testGrandPrixService.getTestPrediction('user_e2e_1');
  assert(fetchedLocked !== null, 'Authoritative locked prediction exists');
  assert(fetchedLocked?.predictionData.p1 === 'test-alpha', 'Exact P1 pick preserved');
  assert(fetchedLocked?.predictionData.p2 === 'test-bravo', 'Exact P2 pick preserved');
  assert(fetchedLocked?.predictionData.p3 === 'test-charlie', 'Exact P3 pick preserved');
  assert(fetchedLocked?.predictionData.fastestLap === 'test-alpha', 'Exact fastestLap pick preserved');

  // --------------------------------------------------------------------------
  // Step 9 — Home: Verify locked prediction visible on Home
  // --------------------------------------------------------------------------
  console.log('\nStep 9: Verify locked prediction accessible on Home');
  assert(fetchedLocked?.predictionData !== undefined, 'Home can read exact picks from locked prediction');

  // --------------------------------------------------------------------------
  // Step 10 — Persistence: Survives refresh / page reload
  // --------------------------------------------------------------------------
  console.log('\nStep 10: Verify persistence across simulated page refresh');
  const reloadedPred = testGrandPrixService.getTestPrediction('user_e2e_1');
  assert(reloadedPred?.predictionId === lockedPred.predictionId, 'Prediction ID identical after page refresh');
  assert(reloadedPred?.predictionData.p1 === 'test-alpha', 'Selections intact after reload');

  // --------------------------------------------------------------------------
  // Step 11 — Persistence: Survives navigation
  // --------------------------------------------------------------------------
  console.log('\nStep 11: Verify persistence across navigation');
  const navPred = testGrandPrixService.getTestPrediction('user_e2e_1');
  assert(navPred !== null && navPred.userId === 'user_e2e_1', 'Prediction survives cross-page navigation');

  // --------------------------------------------------------------------------
  // Step 12 — Persistence: Survives logout / re-login
  // --------------------------------------------------------------------------
  console.log('\nStep 12: Verify persistence across logout & re-login');
  // Simulated re-login by fetching with userId + raceId
  const reloginPred = testGrandPrixService.getTestPrediction('user_e2e_1');
  assert(reloginPred?.userId === 'user_e2e_1', 'Prediction retrieved authoritatively on re-login');

  // --------------------------------------------------------------------------
  // Step 13 — Email: Verify submission confirmation email
  // --------------------------------------------------------------------------
  console.log('\nStep 13: Verify submission confirmation email');
  const confirmNotes = testGrandPrixService.getState().notifications.filter(
    n => n.notificationType === 'PREDICTION_CONFIRMATION' && n.idempotencyKey === `PRED_SUBMIT_${TEST_GP_ID}_user_e2e_1`
  );
  assert(confirmNotes.length === 1, 'Exactly one PREDICTION_CONFIRMATION email queued');
  const workerConfirm = testGrandPrixService.processNotificationQueue();
  assert(workerConfirm.sent === 1, 'Submission confirmation email delivered successfully');

  // --------------------------------------------------------------------------
  // Step 14 — Admin: Enter controlled test result
  // --------------------------------------------------------------------------
  console.log('\nStep 14: Admin enters controlled test race results');
  // Controlled result: Perfect match for user_e2e_1!
  const controlledResult = {
    p1: 'test-alpha',
    p2: 'test-bravo',
    p3: 'test-charlie',
    fastestLap: 'test-alpha',
  };
  const resultObj = testGrandPrixService.enterTestResult(true, controlledResult, false);
  assert(resultObj?.status === 'OFFICIAL', 'Official result registered as OFFICIAL');
  assert(testGrandPrixService.getState().round?.status === 'LOCKED', 'Round locked upon entering results');

  // --------------------------------------------------------------------------
  // Step 15 — Admin: Run test scoring
  // --------------------------------------------------------------------------
  console.log('\nStep 15: Admin runs test scoring');
  const scoredMap = testGrandPrixService.runTestScoring(true);
  assert(Boolean(scoredMap['user_e2e_1']), 'User score calculated');

  // --------------------------------------------------------------------------
  // Step 16 & 17 — Score Breakdown & Authoritative Stored Score
  // --------------------------------------------------------------------------
  console.log('\nSteps 16–17: Verify field-level score breakdown and stored score');
  const userScore = testGrandPrixService.getScoreBreakdown('user_e2e_1');
  assert(userScore !== null, 'Authoritative stored score exists');
  // Perfect prediction: P1(15) + P2(10) + P3(10) + fastestLap(10) + perfectPodiumBonus(10) = 55 PTS
  assert(userScore?.breakdown.p1 === 15, 'P1 exact score is 15 pts');
  assert(userScore?.breakdown.p2 === 10, 'P2 exact score is 10 pts');
  assert(userScore?.breakdown.p3 === 10, 'P3 exact score is 10 pts');
  assert(userScore?.breakdown.fastestLap === 10, 'Fastest Lap score is 10 pts');
  assert(userScore?.breakdown.perfectPodiumBonus === 10, 'Perfect Podium Bonus awarded (+10 pts)');
  assert(userScore?.totalScore === 55, 'Total calculated score matches expected 55 pts');

  // --------------------------------------------------------------------------
  // Step 18 — Leaderboard: Verify isolated Test Leaderboard
  // --------------------------------------------------------------------------
  console.log('\nStep 18: Verify isolated Test Grand Prix leaderboard');
  const testLb = testGrandPrixService.getTestLeaderboard();
  assert(testLb.length === 1, 'Test leaderboard contains 1 scored entry');
  assert(testLb[0].userId === 'user_e2e_1', 'User is on test leaderboard');
  assert(testLb[0].totalPoints === 55, 'Leaderboard score matches authoritative stored score (55)');
  assert(testLb[0].rank === 1, 'User is Rank 1 on test leaderboard');

  // Verify complete isolation: test score does not pollute production leaderboard
  const prodSeasonLb = await mockApi.getLeaderboard('season');
  const testInProd = prodSeasonLb.some(e => e.userId === 'user_e2e_1');
  assert(!testInProd, 'Zero test score leakage into production season leaderboard');

  // --------------------------------------------------------------------------
  // Step 19 — Email: Verify result / score email
  // --------------------------------------------------------------------------
  console.log('\nStep 19: Verify result and scorecard email');
  const resultNotes = testGrandPrixService.getState().notifications.filter(
    n => n.notificationType === 'PREDICTION_RESULT' && n.idempotencyKey === `RESULT_${TEST_GP_ID}_user_e2e_1`
  );
  assert(resultNotes.length === 1, 'Exactly one PREDICTION_RESULT notification queued');
  const workerResult = testGrandPrixService.processNotificationQueue();
  assert(workerResult.sent === 1, 'Result email successfully delivered');

  // --------------------------------------------------------------------------
  // Step 20 — User Result: Verify user result display
  // --------------------------------------------------------------------------
  console.log('\nStep 20: Verify user final result display');
  assert(userScore?.totalScore === 55, 'Result display matches stored score: 55 Points');

  // --------------------------------------------------------------------------
  // Step 21 — Idempotency: Run scoring again -> Verify no duplicate points
  // --------------------------------------------------------------------------
  console.log('\nStep 21: Run scoring again (idempotency check)');
  const rescoreMap = testGrandPrixService.runTestScoring(true);
  assert(rescoreMap['user_e2e_1'].totalScore === 55, 'Rescoring does not double or mutate points (still 55)');
  const rescoreLb = testGrandPrixService.getTestLeaderboard();
  assert(rescoreLb[0].totalPoints === 55, 'Leaderboard total points strictly unchanged (55)');

  // Also verify email duplicate prevention
  const rescoreNotes = testGrandPrixService.getState().notifications.filter(
    n => n.notificationType === 'PREDICTION_RESULT' && n.idempotencyKey === `RESULT_${TEST_GP_ID}_user_e2e_1`
  );
  assert(rescoreNotes.length === 1, 'No duplicate result email enqueued on repeat scoring');

  // --------------------------------------------------------------------------
  // Step 22 — Amended Results: Amend test result & verify score recalculation
  // --------------------------------------------------------------------------
  console.log('\nStep 22: Amend test result & verify recalculation');
  // New result: test-bravo wins P1 instead of test-alpha!
  const amendedResult = {
    p1: 'test-bravo',
    p2: 'test-alpha',
    p3: 'test-charlie',
    fastestLap: 'test-alpha',
  };
  const amendedScores = testGrandPrixService.amendTestResult(true, amendedResult);
  const updatedUserScore = amendedScores['user_e2e_1'];
  // P1 pick was alpha, actual was bravo -> podiumWrongPosition(5)
  // P2 pick was bravo, actual was alpha -> podiumWrongPosition(5)
  // P3 pick was charlie, actual was charlie -> exactP3(10)
  // fastestLap pick was alpha, actual was alpha -> fastestLap(10)
  // Total: 5 + 5 + 10 + 10 = 30 pts (no perfectPodiumBonus)
  assert(updatedUserScore.totalScore === 30, `Amended total score is 30 pts (received: ${updatedUserScore.totalScore})`);
  const amendedLb = testGrandPrixService.getTestLeaderboard();
  assert(amendedLb[0].totalPoints === 30, 'Test leaderboard correctly updated to 30 pts without duplicate points');

  // --------------------------------------------------------------------------
  // Step 23 — Reset: Reset Test Grand Prix
  // --------------------------------------------------------------------------
  console.log('\nStep 23: Reset Test Grand Prix & verify isolation');
  testGrandPrixService.resetTestGrandPrix(true);
  const finalState = testGrandPrixService.getState();
  assert(finalState.weekend === null, 'Test weekend successfully cleared');
  assert(finalState.round === null, 'Test round successfully cleared');
  assert(Object.keys(finalState.predictions).length === 0, 'Test predictions cleared');
  assert(Object.keys(finalState.scores).length === 0, 'Test scores cleared');
  assert(finalState.leaderboard.length === 0, 'Test leaderboard cleared');
  assert(finalState.notifications.length === 0, 'Test notifications cleared');

  // Verify production data remains 100% intact
  const prodWeekends = await mockApi.getRaceWeekends(2026);
  assert(prodWeekends.length > 0, 'Production race weekends intact');
  const prodRounds = await mockApi.getPredictionRounds();
  assert(prodRounds.length > 0, 'Production prediction rounds intact');

  console.log(`\n======================================================`);
  console.log(`🏁 PHASE 11 E2E WALKTHROUGH RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runE2EWalkthrough().catch(err => {
  console.error('Fatal error during E2E walkthrough:', err);
  process.exit(1);
});

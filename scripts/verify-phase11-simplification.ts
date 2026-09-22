/**
 * Verification Script: Phase 11 Simplification
 * Admin Control Center 5 Sections, Qualification Prediction Removal, and Prediction Bench
 */

import { api } from '../src/services/apiClient';
import { testGrandPrixService } from '../src/services/testGrandPrix/testGrandPrixService';
import { isQualificationPredictionRound } from '../src/services/schedule/predictionRoundGenerator';

console.log('🏎️ Running Phase 11 Simplification Verification Suite...\n');

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

async function runSimplificationChecks() {
  // 1. Admin Control Center 5 Sections
  console.log('--- 1. Admin Control Center 5 Sections ---');
  const fs = await import('fs');
  const path = await import('path');
  const adminPageContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/AdminDashboardPage.tsx'), 'utf-8');

  assert(adminPageContent.includes('1. CALENDAR SYNC'), 'Tab 1 is CALENDAR SYNC');
  assert(adminPageContent.includes('2. USERS'), 'Tab 2 is USERS');
  assert(adminPageContent.includes('3. PREDICTIONS'), 'Tab 3 is PREDICTIONS');
  assert(adminPageContent.includes('4. LEADERBOARD'), 'Tab 4 is LEADERBOARD');
  assert(adminPageContent.includes('5. TEST GRAND PRIX'), 'Tab 5 is TEST GRAND PRIX');
  assert(!adminPageContent.includes('Prediction Rounds Manager'), 'Legacy duplicate Prediction Rounds Manager removed');
  assert(!adminPageContent.includes('Race Weekend Creator'), 'Legacy duplicate Race Weekend Creator removed');

  // 2. Predictions Inspection in Admin
  console.log('\n--- 2. Predictions Inspection API ---');
  const adminPreds = await api.getAdminPredictions('2026_13_RACE_PREDICTION');
  assert(Array.isArray(adminPreds), 'api.getAdminPredictions returns an array of predictions');

  // 3. Qualification Predictions Removal from Active App
  console.log('\n--- 3. Qualification Prediction Removal ---');
  const rounds = await api.getPredictionRounds();
  const legacyQualiRounds = rounds.filter(r => isQualificationPredictionRound(r));
  assert(legacyQualiRounds.length === 0, 'Zero active qualification prediction rounds generated');

  const weekendPageContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/WeekendDashboardPage.tsx'), 'utf-8');
  assert(!weekendPageContent.includes('Predict Session Outcomes'), 'Weekend page does not refer to multi-session predictions');
  assert(weekendPageContent.includes('Predict Race Outcome'), 'Weekend page focuses on race prediction');

  // 4. Test Grand Prix Simulation & State-Based Action Controls
  console.log('\n--- 4. Test Grand Prix State-Based Controls ---');
  testGrandPrixService.resetTestGrandPrix(true);
  const state0 = testGrandPrixService.getState();
  assert(state0.weekend === null, 'Test GP initially not created');

  testGrandPrixService.createTestGrandPrix(true);
  const state1 = testGrandPrixService.getState();
  assert(state1.weekend !== null && state1.round?.status === 'UPCOMING', 'Test GP created in UPCOMING state');

  testGrandPrixService.openTestPrediction(true, [{ userId: 'test_user_1', email: 'test1@thegrid.test', name: 'Racer 1' }]);
  const state2 = testGrandPrixService.getState();
  assert(state2.round?.status === 'OPEN', 'Test GP prediction state is OPEN');

  testGrandPrixService.submitTestPrediction('test_user_1', 'Racer 1', 'test1@thegrid.test', {
    p1: 'test-alpha',
    p2: 'test-bravo',
    p3: 'test-charlie',
    fastestLap: 'test-delta',
  });
  const savedTestPred = testGrandPrixService.getTestPrediction('test_user_1');
  assert(savedTestPred !== null, 'Test prediction saved via prediction bench');
  assert(savedTestPred?.predictionData.p1 === 'test-alpha', 'Test prediction P1 is test-alpha');

  testGrandPrixService.enterTestResult(true, {
    p1: 'test-alpha',
    p2: 'test-bravo',
    p3: 'test-charlie',
    fastestLap: 'test-delta',
  });
  const state3 = testGrandPrixService.getState();
  assert(state3.officialResult !== null, 'Official result successfully recorded');

  testGrandPrixService.runTestScoring(true);
  const state4 = testGrandPrixService.getState();
  assert(state4.round?.status === 'SCORED', 'Test GP status is SCORED');
  assert(state4.leaderboard.length === 1, 'Isolated test leaderboard updated');
  assert(state4.leaderboard[0].totalPoints === 55, 'Authoritative test score computed (55 pts)');

  testGrandPrixService.resetTestGrandPrix(true);
  const stateReset = testGrandPrixService.getState();
  assert(stateReset.weekend === null && stateReset.leaderboard.length === 0, 'Test GP reset cleanly clears test sandbox');

  console.log(`\n======================================================`);
  console.log(`🏁 SIMPLIFICATION VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSimplificationChecks().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

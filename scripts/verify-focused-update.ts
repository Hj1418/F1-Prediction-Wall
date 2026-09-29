/**
 * Focused Implementation Update Verification Script
 * Validates:
 * 1. Manual Race Result Entry & Idempotent Scoring
 * 2. Simplified Prediction Bench (9 canonical fields, VSC included, removed fields excluded)
 * 3. 55-Point Scoring System & Distribution
 * 4. Test GP vs Production Isolation
 * 5. Typography & Mobile Rules Verification
 */

import fs from 'fs';
import path from 'path';
import { api } from '../src/services/apiClient';
import {
  getDefaultPredictionFields,
  ACTIVE_PREDICTION_FIELD_ORDER,
  SIMPLIFIED_ACTIVE_SCORING_RULES,
} from '../src/services/schedule/predictionRoundGenerator';
import { testGrandPrixService } from '../src/services/testGrandPrix/testGrandPrixService';

console.log('🏎️ Running Focused Implementation Update Verification Suite...\n');

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

async function runTests() {
  // =========================================================================
  // 1. Simplified Prediction Bench: 9 Fields Only
  // =========================================================================
  console.log('--- 1. Simplified Prediction Bench (9 Fields) ---');
  const driverFields = getDefaultPredictionFields('Driver');
  const riderFields = getDefaultPredictionFields('Rider');

  assert(driverFields.length === 9, `Driver prediction bench has exactly 9 fields (got ${driverFields.length})`);
  assert(riderFields.length === 9, `Rider prediction bench has exactly 9 fields (got ${riderFields.length})`);

  const driverFieldIds = driverFields.map(f => f.id);
  const expectedFieldIds = [
    'p1',
    'p2',
    'p3',
    'fastestLap',
    'driverOfTheDay',
    'safetyCar',
    'virtualSafetyCar',
    'redFlag',
    'yellowFlag',
  ];
  assert(
    JSON.stringify(driverFieldIds) === JSON.stringify(expectedFieldIds),
    `Driver field order matches canonical 9 fields: ${driverFieldIds.join(', ')}`
  );

  const riderFieldIds = riderFields.map(f => f.id);
  assert(riderFieldIds.includes('riderOfTheDay'), 'Rider prediction bench includes riderOfTheDay');
  assert(!riderFieldIds.includes('driverOfTheDay'), 'Rider prediction bench adapts driverOfTheDay to riderOfTheDay');

  // Verify removed fields
  const removedFields = ['wildcard', 'winningMargin', 'dnfs', 'retirementsOverUnder', 'rainSession', 'rainIntermediates', 'lap1Leader'];
  removedFields.forEach(fieldId => {
    assert(!driverFieldIds.includes(fieldId), `Removed field '${fieldId}' is absent from active prediction bench`);
  });

  // =========================================================================
  // 2. 55-Point Scoring System
  // =========================================================================
  console.log('\n--- 2. 55-Point Maximum Scoring System ---');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.exactP1 === 10, 'P1 awards 10 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.exactP2 === 7, 'P2 awards 7 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.exactP3 === 5, 'P3 awards 5 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.fastestLap === 7, 'Fastest Lap awards 7 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.driverOfTheDay === 7, 'Driver/Rider of the Day awards 7 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.safetyCar === 5, 'Safety Car awards 5 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.virtualSafetyCar === 5, 'Virtual Safety Car awards 5 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.redFlag === 5, 'Red Flag awards 5 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.yellowFlag === 4, 'Yellow Flag awards 4 points');
  assert(SIMPLIFIED_ACTIVE_SCORING_RULES.perfectPodiumBonus === 0, 'No extra perfect podium bonus beyond individual points');

  const totalMaxPoints =
    SIMPLIFIED_ACTIVE_SCORING_RULES.exactP1 +
    SIMPLIFIED_ACTIVE_SCORING_RULES.exactP2 +
    SIMPLIFIED_ACTIVE_SCORING_RULES.exactP3 +
    SIMPLIFIED_ACTIVE_SCORING_RULES.fastestLap +
    SIMPLIFIED_ACTIVE_SCORING_RULES.driverOfTheDay +
    SIMPLIFIED_ACTIVE_SCORING_RULES.safetyCar +
    SIMPLIFIED_ACTIVE_SCORING_RULES.virtualSafetyCar +
    SIMPLIFIED_ACTIVE_SCORING_RULES.redFlag +
    SIMPLIFIED_ACTIVE_SCORING_RULES.yellowFlag;

  assert(totalMaxPoints === 55, `Total maximum points per race weekend is strictly 55 (calculated: ${totalMaxPoints})`);

  // =========================================================================
  // 3. Admin Manual Race Result Submission & Idempotent Scoring
  // =========================================================================
  console.log('\n--- 3. Admin Manual Race Result Submission & Idempotency ---');
  const testRoundId = '2026_15_RACE_PREDICTION';

  const validResultPayload = {
    roundId: testRoundId,
    season: 2026,
    round: 15,
    race: 'Azerbaijan Grand Prix',
    p1: 'russell',
    p2: 'verstappen',
    p3: 'hadjar',
    fastestLap: 'russell',
    driverOfTheDay: 'verstappen',
    safetyCar: 'YES',
    virtualSafetyCar: 'NO',
    redFlag: 'NO',
    yellowFlag: 'YES',
  };

  const savedResult = await api.adminSubmitResult(testRoundId, validResultPayload);
  assert(savedResult !== null && savedResult.roundId === testRoundId, 'Admin successfully submitted manual race result');
  assert(savedResult.resultData.p1 === 'russell', 'Official P1 recorded as russell');
  assert(savedResult.resultData.virtualSafetyCar === 'NO', 'Official VSC recorded as NO');

  // Trigger score calculation
  const scoreRun1 = await api.adminCalculateScores(testRoundId);
  assert(typeof scoreRun1.scoredCount === 'number', 'Scoring run 1 completed successfully');

  // Trigger score calculation AGAIN (idempotency check)
  const scoreRun2 = await api.adminCalculateScores(testRoundId);
  assert(typeof scoreRun2.scoredCount === 'number', 'Scoring run 2 completed successfully without errors');
  assert(scoreRun1.scoredCount === scoreRun2.scoredCount, 'Identical prediction count scored idempotently');

  // Result amendment / correction check
  const correctedPayload = {
    ...validResultPayload,
    fastestLap: 'verstappen',
  };
  const amendedResult = await api.adminSubmitResult(testRoundId, correctedPayload);
  assert(amendedResult.resultData.fastestLap === 'verstappen', 'Amended official result updated fastest lap to verstappen');

  const scoreRun3 = await api.adminCalculateScores(testRoundId);
  assert(typeof scoreRun3.scoredCount === 'number', 'Recalculation from corrected result succeeded');

  // =========================================================================
  // 4. Test Grand Prix Isolation
  // =========================================================================
  console.log('\n--- 4. Test GP Sandbox Isolation ---');
  testGrandPrixService.resetTestGrandPrix(true);
  testGrandPrixService.createTestGrandPrix(true);
  testGrandPrixService.openTestPrediction(true, [{ userId: 'test-user-iso', email: 'test@iso.com', name: 'Iso User' }]);

  const testState = testGrandPrixService.getState();
  assert(testState.round !== null && testState.round.roundId.startsWith('TEST_'), 'Test GP operates under isolated TEST_ round ID');

  testGrandPrixService.enterTestResult(true, {
    p1: 'test-alpha',
    p2: 'test-bravo',
    p3: 'test-charlie',
    fastestLap: 'test-alpha',
    safetyCar: 'YES',
    virtualSafetyCar: 'NO',
    redFlag: 'NO',
    yellowFlag: 'YES',
  });
  testGrandPrixService.runTestScoring(true);

  const testLeaderboard = testGrandPrixService.getTestLeaderboard();
  assert(Array.isArray(testLeaderboard), 'Test leaderboard computed');

  // Check production leaderboard
  const prodLeaderboard = await api.getLeaderboard('season', '2026');
  const hasTestUser = prodLeaderboard.some(e => e.userId === 'test-user-iso');
  assert(!hasTestUser, 'Production leaderboard contains zero Test GP entries (100% isolated)');

  // Clean up test GP
  testGrandPrixService.resetTestGrandPrix(true);

  // =========================================================================
  // 5. Typography Refinement & Mobile Design System
  // =========================================================================
  console.log('\n--- 5. Typography & Mobile Rules ---');
  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
  assert(indexHtml.includes('Rajdhani'), 'index.html loads Rajdhani display font');
  assert(indexHtml.includes('Inter'), 'index.html loads Inter body font');
  assert(indexHtml.includes('JetBrains+Mono'), 'index.html loads JetBrains Mono font');

  const indexCss = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf-8');
  assert(indexCss.includes('--font-display: \'Rajdhani\''), 'CSS defines --font-display as Rajdhani');
  assert(indexCss.includes('--font-body: \'Inter\''), 'CSS defines --font-body as Inter');
  assert(indexCss.includes('--font-mono: \'JetBrains Mono\''), 'CSS defines --font-mono as JetBrains Mono');

  // Mobile rules
  assert(indexCss.includes('overflow-x: hidden'), 'CSS enforces no horizontal overflow');
  assert(indexCss.includes('min-height: 44px'), 'CSS enforces touch targets minimum 44px');
  assert(indexCss.includes('@media (max-width: 430px)'), 'CSS contains dedicated rules for mobile devices (<= 430px)');
  assert(indexCss.includes('@media (max-width: 360px)'), 'CSS contains dedicated rules for compact mobile (<= 360px)');

  // PredictionPage check for active fields
  const predPageContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/PredictionPage.tsx'), 'utf-8');
  assert(predPageContent.includes('activePredictionFields'), 'PredictionPage uses activePredictionFields');
  assert(predPageContent.includes('competitorLabel'), 'PredictionPage uses dynamic competitorLabel');

  // AdminDashboardPage check for manual result workflow
  const adminPageContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/AdminDashboardPage.tsx'), 'utf-8');
  assert(adminPageContent.includes('handleValidateResult'), 'Admin dashboard includes handleValidateResult');
  assert(adminPageContent.includes('✓ RESULT VALID'), 'Admin dashboard displays ✓ RESULT VALID');
  assert(adminPageContent.includes('✓ RESULT SAVED'), 'Admin dashboard displays ✓ RESULT SAVED');
  assert(adminPageContent.includes('3. PREDICTIONS'), 'Admin dashboard preserves Tab 3 PREDICTIONS header');

  // Backend Apps Script check
  const backendCode = fs.readFileSync(path.resolve(process.cwd(), 'backend/Code.gs'), 'utf-8');
  assert(backendCode.includes('p1Exact ? 10 :'), 'Backend scoring assigns 10 pts for P1');
  assert(backendCode.includes('p2Exact ? 7 :'), 'Backend scoring assigns 7 pts for P2');
  assert(backendCode.includes('p3Exact ? 5 :'), 'Backend scoring assigns 5 pts for P3');
  assert(backendCode.includes('b.virtualSafetyCar =') && backendCode.includes('? 5 : 0;'), 'Backend scoring assigns 5 pts for VSC');
  assert(backendCode.includes('b.yellowFlag =') && backendCode.includes('? 4 : 0;'), 'Backend scoring assigns 4 pts for Yellow Flag');

  console.log(`\n======================================================`);
  console.log(`🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

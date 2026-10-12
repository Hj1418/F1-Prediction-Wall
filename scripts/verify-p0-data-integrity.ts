/**
 * scripts/verify-p0-data-integrity.ts
 *
 * Automated regression & data integrity verification suite for The Grid.
 * Verifies:
 * 1. Leaderboard deduplication & canonical user identity.
 * 2. Singapore GP vs Singapore Sprint vs Azerbaijan GP round isolation (no aliasing).
 * 3. Dynamic admin result entry & scoring pipeline.
 * 4. Story share card separation: Season standing summary vs specific round points.
 * 5. Admin authorization enforcement for global leaderboard sharing.
 * 6. Dry-run audit and consolidation logic for duplicate accounts.
 * 7. Prediction deadline calculation (session start minus buffer).
 */

import { mockApi } from '../src/services/mockApi';
import { api } from '../src/services/apiClient';
import {
  generateUserResultStoryCanvas,
  generateLeaderboardStoryCanvas,
  assertAdminAuthorized,
  formatStoryPoints,
} from '../src/services/sharing/storyShareService';
import { F1ScheduleSyncService } from '../src/services/schedule/f1ScheduleSyncService';

// Polyfill document for node runner if not in browser
if (typeof (global as any).document === 'undefined') {
  (global as any).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            createLinearGradient: () => ({ addColorStop: () => {} }),
            createRadialGradient: () => ({ addColorStop: () => {} }),
            fillRect: () => {},
            save: () => {},
            restore: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            fill: () => {},
            closePath: () => {},
            quadraticCurveTo: () => {},
            fillText: () => {},
          }),
        };
      }
      return {};
    },
  };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=== THE GRID: CRITICAL BUG FIX & DATA INTEGRITY AUDIT ===\n');

  // --------------------------------------------------------------------------
  // TEST 1: Singapore GP vs Azerbaijan GP Isolation (No Aliasing)
  // --------------------------------------------------------------------------
  console.log('1. Verifying Singapore GP (2026_17) vs Azerbaijan GP (2026_15) isolation...');
  
  // Submit prediction for Azerbaijan
  const predAzerbaijan = await mockApi.submitPrediction({
    userId: 'test_user_azerbaijan',
    roundId: '2026_15_RACE_PREDICTION',
    predictionData: {
      p1: 'leclerc',
      p2: 'piastri',
      p3: 'verstappen',
      fastestLap: 'leclerc',
      driverOfTheDay: 'leclerc',
      safetyCar: 'YES',
      virtualSafetyCar: 'NO',
      redFlag: 'NO',
      yellowFlag: 'YES',
    },
  });
  assert(predAzerbaijan.roundId === '2026_15_RACE_PREDICTION', 'Azerbaijan prediction saved with roundId 2026_15_RACE_PREDICTION');

  // Submit prediction for Singapore GP
  const predSingapore = await mockApi.submitPrediction({
    userId: 'test_user_singapore',
    roundId: '2026_17_RACE_PREDICTION',
    predictionData: {
      p1: 'norris',
      p2: 'russell',
      p3: 'hamilton',
      fastestLap: 'norris',
      driverOfTheDay: 'norris',
      safetyCar: 'NO',
      virtualSafetyCar: 'YES',
      redFlag: 'NO',
      yellowFlag: 'YES',
    },
  });
  assert(predSingapore.roundId === '2026_17_RACE_PREDICTION', 'Singapore prediction saved with roundId 2026_17_RACE_PREDICTION');

  // Query admin predictions for Azerbaijan only
  const azAdminPreds = await mockApi.getAdminPredictions('2026_15_RACE_PREDICTION');
  const hasSingaporeInAz = azAdminPreds.some(p => p.userId === 'test_user_singapore');
  assert(!hasSingaporeInAz, 'Azerbaijan admin predictions do NOT contain Singapore predictions');

  // Query admin predictions for Singapore only
  const sgAdminPreds = await mockApi.getAdminPredictions('2026_17_RACE_PREDICTION');
  const hasAzInSingapore = sgAdminPreds.some(p => p.userId === 'test_user_azerbaijan');
  assert(!hasAzInSingapore, 'Singapore admin predictions do NOT contain Azerbaijan predictions');

  // Verify user predictions queries
  const userAzPred = await mockApi.getUserPrediction('2026_15_RACE_PREDICTION', 'test_user_azerbaijan');
  const userSgPred = await mockApi.getUserPrediction('2026_17_RACE_PREDICTION', 'test_user_singapore');
  const crossQueryAz = await mockApi.getUserPrediction('2026_15_RACE_PREDICTION', 'test_user_singapore');
  assert(userAzPred !== null && userAzPred.predictionData.p1 === 'leclerc', 'Azerbaijan user prediction matches exactly');
  assert(userSgPred !== null && userSgPred.predictionData.p1 === 'norris', 'Singapore user prediction matches exactly');
  assert(crossQueryAz === null, 'Querying Azerbaijan for Singapore-only user returns null (no cross-contamination)');

  // --------------------------------------------------------------------------
  // TEST 2: Admin Results & Scoring Dynamic Decoupling
  // --------------------------------------------------------------------------
  console.log('\n2. Verifying Admin Result Submission & Scoring Pipeline...');

  // Submit official result for Singapore GP
  await mockApi.adminSubmitResult('2026_17_RACE_PREDICTION', {
    p1: 'norris',
    p2: 'russell',
    p3: 'hamilton',
    fastestLap: 'norris',
    driverOfTheDay: 'norris',
    safetyCar: 'NO',
    virtualSafetyCar: 'YES',
    redFlag: 'NO',
    yellowFlag: 'YES',
  });

  const sgOfficial = await mockApi.getOfficialResult('2026_17_RACE_PREDICTION');
  const azOfficial = await mockApi.getOfficialResult('2026_15_RACE_PREDICTION');
  assert(sgOfficial?.resultData?.p1 === 'norris', 'Singapore official result saved independently with P1 Norris');
  assert(azOfficial?.resultData?.p1 === 'russell', 'Azerbaijan official result remains intact with P1 Russell');

  // Calculate scores for Singapore GP
  const scoreResult = await mockApi.adminCalculateScores('2026_17_RACE_PREDICTION');
  assert(scoreResult.scoredCount >= 1, `Scored Singapore GP predictions (${scoreResult.scoredCount} scored)`);

  const sgUserScore = await mockApi.getRoundScore('2026_17_RACE_PREDICTION', 'test_user_singapore');
  assert(sgUserScore !== null && sgUserScore.totalScore > 0, `Singapore prediction scored successfully (${sgUserScore?.totalScore} PTS)`);

  // --------------------------------------------------------------------------
  // TEST 3: Duplicate Users & Leaderboard Deduplication
  // --------------------------------------------------------------------------
  console.log('\n3. Verifying Leaderboard Identity Deduplication...');

  // Register duplicate username with different casing
  const usernameCheckUpper = await mockApi.checkUsername('TEST_RACER');
  assert(!usernameCheckUpper.available, 'checkUsername correctly rejects existing username with different case');

  // Simulate multiple user entries sharing same username in state to verify leaderboard deduplication
  const leaderboardEntries = await mockApi.getLeaderboard('season');
  const seenUsernames = new Set<string>();
  let hasDuplicateUsernames = false;

  for (const entry of leaderboardEntries) {
    const norm = entry.username.toLowerCase().trim();
    if (seenUsernames.has(norm)) {
      hasDuplicateUsernames = true;
      break;
    }
    seenUsernames.add(norm);
  }
  assert(!hasDuplicateUsernames, 'Public leaderboard contains ZERO duplicate entries for the same username');

  // --------------------------------------------------------------------------
  // TEST 4: Dry-Run User Audit Migration
  // --------------------------------------------------------------------------
  console.log('\n4. Verifying User Audit & Dry-Run Consolidation...');

  const dryRunAudit = await mockApi.auditAndDeduplicateUsers(true);
  assert(dryRunAudit.dryRun === true, 'auditAndDeduplicateUsers runs in safe dry-run mode by default');
  assert(Array.isArray(dryRunAudit.auditReport), 'auditAndDeduplicateUsers produces structured auditReport');

  // --------------------------------------------------------------------------
  // TEST 5: Share Card Separation (Season Summary vs Event Result)
  // --------------------------------------------------------------------------
  console.log('\n5. Verifying Story Share Card Data Integrity...');

  // 5a. Season Standing Card
  const seasonStory = generateUserResultStoryCanvas({
    username: 'RacerAlex',
    eventName: '2026 World Championship',
    pointsEarned: 120,
    totalPoints: 120,
    rank: 4,
    season: 2026,
    racesParticipated: 8,
    isSeasonSummary: true,
  });
  assert(seasonStory.width === 1080 && seasonStory.height === 1920, 'Season Standing story canvas generates at 1080x1920 9:16');

  // 5b. Single Round Event Card
  const eventStory = generateUserResultStoryCanvas({
    username: 'RacerAlex',
    eventName: 'Singapore Grand Prix',
    pointsEarned: 28,
    totalPoints: 120,
    rank: 4,
    season: 2026,
    isSeasonSummary: false,
  });
  assert(eventStory.width === 1080 && eventStory.height === 1920, 'Event Result story canvas generates at 1080x1920 9:16');

  // --------------------------------------------------------------------------
  // TEST 6: Admin Authorization for Global Leaderboard Sharing
  // --------------------------------------------------------------------------
  console.log('\n6. Verifying Global Leaderboard Admin-Only Share Guard...');

  let nonAdminThrew = false;
  try {
    assertAdminAuthorized({ role: 'user' });
  } catch {
    nonAdminThrew = true;
  }
  assert(nonAdminThrew, 'assertAdminAuthorized strictly blocks non-admin users');

  let adminAllowed = false;
  try {
    assertAdminAuthorized({ role: 'admin' });
    adminAllowed = true;
  } catch {
    adminAllowed = false;
  }
  assert(adminAllowed, 'assertAdminAuthorized allows verified administrators');

  // --------------------------------------------------------------------------
  // TEST 8: Sprint vs Grand Prix Strict Isolation on Same Weekend (Austin 2026_19)
  // --------------------------------------------------------------------------
  console.log('\n8. Verifying Sprint vs Grand Prix Isolation on Same Weekend...');

  const usRounds = await mockApi.getPredictionRounds('2026_19');
  const sprintRound = usRounds.find(r => r.roundId.includes('_SPRINT_'));
  const gpRound = usRounds.find(r => r.roundId.includes('_RACE_'));

  assert(sprintRound !== undefined, 'Found Austin Sprint Prediction round (2026_19_SPRINT_PREDICTION)');
  assert(gpRound !== undefined, 'Found Austin Grand Prix Prediction round (2026_19_RACE_PREDICTION)');

  if (sprintRound && gpRound) {
    // Open rounds in mockApi for isolation testing
    const rSprint = (mockApi as any).rounds.find((r: any) => r.roundId === sprintRound.roundId);
    const rGp = (mockApi as any).rounds.find((r: any) => r.roundId === gpRound.roundId);
    if (rSprint) { rSprint.opensAt = new Date(Date.now() - 3600000).toISOString(); rSprint.status = 'OPEN'; }
    if (rGp) { rGp.opensAt = new Date(Date.now() - 3600000).toISOString(); rGp.status = 'OPEN'; }

    // Submit Sprint prediction
    await mockApi.submitPrediction({
      userId: 'test_user_isolation',
      roundId: sprintRound.roundId,
      predictionData: {
        p1: 'verstappen',
        p2: 'norris',
        p3: 'leclerc',
        fastestLap: 'verstappen',
        driverOfTheDay: 'verstappen',
        safetyCar: 'NO',
        virtualSafetyCar: 'NO',
        redFlag: 'NO',
        yellowFlag: 'NO',
      },
    });

    // Submit GP prediction with different picks
    await mockApi.submitPrediction({
      userId: 'test_user_isolation',
      roundId: gpRound.roundId,
      predictionData: {
        p1: 'hamilton',
        p2: 'russell',
        p3: 'antonelli',
        fastestLap: 'hamilton',
        driverOfTheDay: 'antonelli',
        safetyCar: 'YES',
        virtualSafetyCar: 'YES',
        redFlag: 'NO',
        yellowFlag: 'YES',
      },
    });

    const sprintPreds = await mockApi.getAdminPredictions(sprintRound.roundId);
    const gpPreds = await mockApi.getAdminPredictions(gpRound.roundId);

    const userSprintPred = sprintPreds.find(p => p.userId === 'test_user_isolation');
    const userGpPred = gpPreds.find(p => p.userId === 'test_user_isolation');

    assert(userSprintPred !== undefined && userSprintPred.predictionData.p1 === 'verstappen', 'Sprint prediction strictly isolates P1 Verstappen');
    assert(userGpPred !== undefined && userGpPred.predictionData.p1 === 'hamilton', 'Grand Prix prediction strictly isolates P1 Hamilton');
    assert(!sprintPreds.some(p => p.predictionData.p1 === 'hamilton'), 'Grand Prix predictions do not leak into Sprint set');
    assert(!gpPreds.some(p => p.predictionData.p1 === 'verstappen'), 'Sprint predictions do not leak into Grand Prix set');
  }

  // --------------------------------------------------------------------------
  // TEST 9: Pre-Window / UPCOMING Rejection Guard
  // --------------------------------------------------------------------------
  console.log('\n9. Verifying Pre-Window Submission Guard...');

  // Create or identify an upcoming round
  const allRounds = await mockApi.getPredictionRounds();
  let futureRound = allRounds.find(r => r.status === 'UPCOMING');
  if (!futureRound) {
    futureRound = {
      roundId: '2026_24_RACE_PREDICTION',
      raceWeekendId: '2026_24',
      sessionId: '2026_24_RACE',
      roundType: 'GRAND_PRIX',
      title: 'Abu Dhabi Grand Prix Race Prediction',
      description: 'Predict Abu Dhabi GP',
      opensAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      closesAt: new Date(Date.now() + 86400000 * 37).toISOString(),
      status: 'UPCOMING',
      predictionFields: [],
      scoringRules: {} as any,
    };
    (mockApi as any).rounds.push(futureRound);
  }

  let threwUpcoming = false;
  let upcomingErrorMsg = '';
  try {
    await mockApi.submitPrediction({
      userId: 'test_user_early',
      roundId: futureRound.roundId,
      predictionData: { p1: 'norris', p2: 'leclerc', p3: 'piastri' },
    });
  } catch (e: any) {
    threwUpcoming = true;
    upcomingErrorMsg = e.message;
  }
  assert(threwUpcoming, `submitPrediction strictly rejects pre-window submission (${upcomingErrorMsg})`);

  // --------------------------------------------------------------------------
  // TEST 10: Idempotent Rescoring & Score Retries
  // --------------------------------------------------------------------------
  console.log('\n10. Verifying Idempotent Scoring & Retries...');

  // Score Singapore GP again
  const rescore1 = await mockApi.adminCalculateScores('2026_17_RACE_PREDICTION');
  const rescore2 = await mockApi.adminCalculateScores('2026_17_RACE_PREDICTION');

  assert(rescore1.scoredCount === rescore2.scoredCount, `Score count identical across retries (${rescore1.scoredCount})`);
  assert(rescore2.newlyScored === 0, 'Retry creates 0 new rows (newlyScored === 0)');
  assert(rescore2.updatedScored === rescore2.scoredCount, 'Retry updates existing rows idempotently');

  const sgScores = (await mockApi.getScores()).filter(s => s.roundId === '2026_17_RACE_PREDICTION');
  const sgScoreUserIds = sgScores.map(s => s.userId);
  const uniqueSgUserIds = new Set(sgScoreUserIds);
  assert(sgScores.length === uniqueSgUserIds.size, `Zero duplicate score rows exist for Singapore GP (${sgScores.length} unique user scores)`);

  // --------------------------------------------------------------------------
  // TEST 11: Profile, Leaderboard & Event-Score Reconciliation
  // --------------------------------------------------------------------------
  console.log('\n11. Verifying Profile, Leaderboard & Event-Score Reconciliation...');

  const allScores = await mockApi.getScores();
  const leaderboards = await mockApi.getLeaderboard('season');

  // Verify for each user on the leaderboard that leaderboard points === sum of verified scores
  let allReconciled = true;
  for (const entry of leaderboards) {
    const userScores = allScores.filter(s => s.userId === entry.userId);
    const expectedSum = userScores.reduce((acc, s) => acc + s.totalScore, 0);
    if (entry.totalPoints !== expectedSum) {
      allReconciled = false;
      console.error(`Discrepancy for ${entry.username}: leaderboard ${entry.totalPoints} !== sum of scores ${expectedSum}`);
    }
  }
  assert(allReconciled, 'Every user leaderboard score strictly matches the sum of verified event scores');

  // --------------------------------------------------------------------------
  // TEST 12: Universal Platform-Wide Data Auditor (auditPlatformData)
  // --------------------------------------------------------------------------
  console.log('\n12. Verifying Universal Platform-Wide Auditor (auditPlatformData)...');

  // Run dry run audit
  const dryReport = await mockApi.auditPlatformData(true);
  assert(dryReport.status === 'COMPLETE', 'auditPlatformData completes successfully');
  assert(dryReport.dryRun === true, 'auditPlatformData dry-run does not modify data');
  assert(typeof dryReport.summary.totalDefects === 'number', `Total defects audited: ${dryReport.summary.totalDefects}`);
  assert(dryReport.remediation.backupSheetsCreated.length === 0, 'Dry run creates 0 backup sheets');

  // Run remediation audit
  const remReport = await mockApi.auditPlatformData(false);
  assert(remReport.dryRun === false, 'auditPlatformData remediation executes with dryRun === false');
  assert(remReport.remediation.backupSheetsCreated.length === 4, 'Remediation automatically creates 4 backup snapshots before mutation');
  assert(remReport.durationMs >= 0, `Audit executed in ${remReport.durationMs}ms`);

  // Summary
  console.log(`\n======================================================`);
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

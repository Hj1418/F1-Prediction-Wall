import { mockApi } from '../src/services/mockApi';
import { api } from '../src/services/apiClient';
import {
  extractNumericScore,
  evaluatePredictionItem,
  calculateUserStatsFromHistory,
  normalizeCanonicalRoundId,
} from '../src/utils/predictionScoring';
import { calculateMilestones } from '../src/components/predictions/PredictionSpeedometer';

console.log('🏎️ VERIFYING PREDICTION POINTS CALCULATION & PROFILE INTEGRITY AUDIT...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function run() {
  // =========================================================================
  // 1. CANONICAL NUMERIC SCORE EXTRACTION UNIT TESTS
  // =========================================================================
  console.log('--- 1. Canonical Numeric Score Extraction ---');
  assert(extractNumericScore(30) === 30, 'Direct numeric 30');
  assert(extractNumericScore(0) === 0, 'Legitimate numeric 0 is preserved');
  assert(extractNumericScore(null) === null, 'null returns null');
  assert(extractNumericScore(undefined) === null, 'undefined returns null');
  assert(extractNumericScore('+30 PTS') === 30, 'String "+30 PTS" parses to 30');
  assert(extractNumericScore('+30') === 30, 'String "+30" parses to 30');
  assert(extractNumericScore('0 PTS') === 0, 'String "0 PTS" parses to 0');
  assert(extractNumericScore({ totalScore: 30 }) === 30, 'Object with totalScore: 30');
  assert(extractNumericScore({ totalScore: '+30 PTS' }) === 30, 'Object with totalScore: "+30 PTS"');
  assert(extractNumericScore({ totalScore: 0 }) === 0, 'Object with totalScore: 0');
  assert(extractNumericScore({ pointsEarned: 25 }) === 25, 'Object with pointsEarned: 25');

  // =========================================================================
  // 2. SCORED VS PENDING EVALUATION & LEGITIMATE 0-POINT RESULTS
  // =========================================================================
  console.log('\n--- 2. Scored vs Pending Prediction Invariants ---');
  const pendingItem = {
    prediction: { roundId: '2026_16_RACE_PREDICTION', submittedAt: '2026-10-01T10:00:00Z' },
    round: { roundId: '2026_16_RACE_PREDICTION', raceWeekendId: '2026_16', status: 'OPEN' },
    score: null,
  };
  const evalPending = evaluatePredictionItem(pendingItem);
  assert(evalPending.isPending === true, 'Pending round evaluates to isPending: true');
  assert(evalPending.isScored === false, 'Pending round evaluates to isScored: false');
  assert(evalPending.numericScore === 0, 'Pending round contributes exactly 0 points');

  const zeroPointItem = {
    prediction: { roundId: '2026_14_RACE_PREDICTION', submittedAt: '2026-09-01T10:00:00Z' },
    round: { roundId: '2026_14_RACE_PREDICTION', raceWeekendId: '2026_14', status: 'SCORED' },
    score: { totalScore: 0, breakdown: { p1: 0, p2: 0, p3: 0 } },
  };
  const evalZero = evaluatePredictionItem(zeroPointItem);
  assert(evalZero.isPending === false, '0-point scored round evaluates to isPending: false');
  assert(evalZero.isScored === true, '0-point scored round evaluates to isScored: true');
  assert(evalZero.numericScore === 0, '0-point scored round score is numeric 0');

  // =========================================================================
  // 3. STATS CALCULATION FROM HISTORY: MULTIPLE RACES, PENDING & ZERO SCORES
  // =========================================================================
  console.log('\n--- 3. History Aggregation: Scored, Pending, Zero-Score & Multiple Races ---');
  const sampleHistory = [
    // Azerbaijan GP: 30 pts (Weekend 2026_15)
    {
      prediction: { roundId: '2026_15_RACE_PREDICTION', submittedAt: '2026-09-25T14:00:00Z' },
      round: { roundId: '2026_15_RACE_PREDICTION', raceWeekendId: '2026_15', status: 'SCORED' },
      score: { totalScore: 30, breakdown: { p1: 15, p3: 5, safetyCar: 5, lap1Leader: 5 } },
      weekend: { raceWeekendId: '2026_15', raceName: 'Azerbaijan Grand Prix' },
    },
    // Spanish GP: pending (Weekend 2026_16) - MUST NOT CONTRIBUTE POINTS OR PARTICIPATION
    {
      prediction: { roundId: '2026_16_RACE_PREDICTION', submittedAt: '2026-10-01T10:00:00Z' },
      round: { roundId: '2026_16_RACE_PREDICTION', raceWeekendId: '2026_16', status: 'OPEN' },
      score: null,
      weekend: { raceWeekendId: '2026_16', raceName: 'Spanish Grand Prix' },
    },
    // Austrian GP: 25 pts (Weekend 2026_11)
    {
      prediction: { roundId: '2026_11_RACE_PREDICTION', submittedAt: '2026-07-01T10:00:00Z' },
      round: { roundId: '2026_11_RACE_PREDICTION', raceWeekendId: '2026_11', status: 'SCORED' },
      score: { totalScore: 25, breakdown: { p1: 15, p2: 10 } },
      weekend: { raceWeekendId: '2026_11', raceName: 'Austrian Grand Prix' },
    },
    // British GP: legitimate 0 pts (Weekend 2026_12) - COUNTS AS COMPLETED ROUND
    {
      prediction: { roundId: '2026_12_RACE_PREDICTION', submittedAt: '2026-07-15T10:00:00Z' },
      round: { roundId: '2026_12_RACE_PREDICTION', raceWeekendId: '2026_12', status: 'SCORED' },
      score: { totalScore: 0, breakdown: { p1: 0 } },
      weekend: { raceWeekendId: '2026_12', raceName: 'British Grand Prix' },
    },
  ];

  const calculatedStats = calculateUserStatsFromHistory(sampleHistory);
  assert(calculatedStats.totalPoints === 55, 'Total points is 30 + 25 + 0 = 55 (pending excluded)', `got: ${calculatedStats.totalPoints}`);
  assert(calculatedStats.racesParticipated === 3, 'Races participated is 3 (2 scored + 1 zero-point, pending excluded)', `got: ${calculatedStats.racesParticipated}`);
  assert(calculatedStats.pendingRoundsCount === 1, 'Pending count is 1', `got: ${calculatedStats.pendingRoundsCount}`);
  assert(calculatedStats.scoredRoundsCount === 3, 'Scored count is 3', `got: ${calculatedStats.scoredRoundsCount}`);
  assert(calculatedStats.bestWeekendScore === 30, 'Best single weekend is 30 pts (Azerbaijan)', `got: ${calculatedStats.bestWeekendScore}`);
  assert(calculatedStats.avgPointsPerRound === 18.3, 'Avg pts/round is 55 / 3 = 18.3', `got: ${calculatedStats.avgPointsPerRound}`);
  assert(calculatedStats.exactP1Count === 2, 'Exact P1 count is 2 (Azerbaijan + Austria)', `got: ${calculatedStats.exactP1Count}`);

  // =========================================================================
  // 4. DUPLICATE PREDICTION RECORD DEDUPLICATION
  // =========================================================================
  console.log('\n--- 4. Duplicate Record & Round Alias Handling ---');
  assert(normalizeCanonicalRoundId('2026_17_RACE_PREDICTION') === '2026_15_RACE_PREDICTION', 'Alias 2026_17 normalizes to 2026_15');
  const duplicateHistory = [
    {
      prediction: { roundId: '2026_15_RACE_PREDICTION' },
      round: { roundId: '2026_15_RACE_PREDICTION', status: 'SCORED' },
      score: { totalScore: 30, breakdown: { p1: 15 } },
    },
    {
      prediction: { roundId: '2026_17_RACE_PREDICTION' }, // Duplicate alias record
      round: { roundId: '2026_17_RACE_PREDICTION', status: 'SCORED' },
      score: { totalScore: 30, breakdown: { p1: 15 } },
    },
  ];
  const dedupStats = calculateUserStatsFromHistory(duplicateHistory);
  assert(dedupStats.totalPoints === 30, 'Duplicate alias records do not double-count (got 30 pts, not 60 pts)', `got: ${dedupStats.totalPoints}`);
  assert(dedupStats.racesParticipated === 1, 'Duplicate alias records count as 1 participated race', `got: ${dedupStats.racesParticipated}`);

  // =========================================================================
  // 5. EXISTING AZERBAIJAN +30 RESULT VERIFICATION FOR USER HARSH
  // =========================================================================
  console.log('\n--- 5. Existing Azerbaijan +30 Result for Harsh ---');
  const harshUserId = 'usr_jalnekarharsh14_acaab661';

  // 1. Prediction History must contain Azerbaijan GP +30 PTS
  const userHistory = await mockApi.getUserPredictionsHistory(harshUserId);
  const azEntry = userHistory.find(h => h.round?.roundId === '2026_15_RACE_PREDICTION' || h.prediction?.roundId === '2026_15_RACE_PREDICTION');
  assert(Boolean(azEntry), 'Found Azerbaijan GP prediction in history');
  assert(azEntry?.score?.totalScore === 30, 'Azerbaijan GP score is +30 PTS in canonical history', `got: ${azEntry?.score?.totalScore}`);

  // 2. Profile stats computed from history
  const harshStats = calculateUserStatsFromHistory(userHistory);
  assert(harshStats.totalPoints >= 30, `Harsh total points from history is at least 30 (got: ${harshStats.totalPoints})`);

  // 3. mockApi.getUserProfile must return totalPoints >= 30, not 0!
  const mockProfile = await mockApi.getUserProfile(harshUserId);
  assert(Boolean(mockProfile), 'Retrieved profile from mockApi');
  assert(mockProfile!.totalPoints >= 30, `mockApi.getUserProfile returns totalPoints >= 30 (got: ${mockProfile?.totalPoints})`);
  assert(mockProfile!.racesParticipated >= 1, `mockApi.getUserProfile racesParticipated >= 1 (got: ${mockProfile?.racesParticipated})`);
  assert(mockProfile!.bestWeekendScore >= 30, `mockApi.getUserProfile bestWeekendScore >= 30 (got: ${mockProfile?.bestWeekendScore})`);

  // 4. api.getUserProfile must return totalPoints >= 30, not 0!
  const apiProfile = await api.getUserProfile('jalnekarharsh14');
  assert(Boolean(apiProfile), 'Retrieved profile via api client');
  assert(apiProfile!.totalPoints >= 30, `api.getUserProfile returns totalPoints >= 30 (got: ${apiProfile?.totalPoints})`);
  assert(apiProfile!.racesParticipated >= 1, `api.getUserProfile racesParticipated >= 1 (got: ${apiProfile?.racesParticipated})`);
  assert(apiProfile!.bestWeekendScore >= 30, `api.getUserProfile bestWeekendScore >= 30 (got: ${apiProfile?.bestWeekendScore})`);

  // =========================================================================
  // 6. LEADERBOARD, PROFILE & SPEEDOMETER CONSISTENCY
  // =========================================================================
  console.log('\n--- 6. Leaderboard, Profile & Speedometer Parity ---');
  const leaderboard = await api.getLeaderboard('season', '2026');
  const harshLbEntry = leaderboard.find(e => e.userId === harshUserId);
  assert(Boolean(harshLbEntry), 'Harsh exists on authoritative season leaderboard');
  assert(harshLbEntry!.totalPoints === apiProfile!.totalPoints, 'Profile totalPoints strictly matches Leaderboard totalPoints', `Profile: ${apiProfile?.totalPoints}, Leaderboard: ${harshLbEntry?.totalPoints}`);
  assert(harshLbEntry!.rank === apiProfile!.seasonRank, 'Profile seasonRank strictly matches Leaderboard rank', `Profile: ${apiProfile?.seasonRank}, Leaderboard: ${harshLbEntry?.rank}`);

  // Milestone calculation test
  const milestone = calculateMilestones(apiProfile!.totalPoints);
  assert(milestone.nextMilestone === 50, `Next milestone for 30 pts is 50 (got: ${milestone.nextMilestone})`);
  assert(milestone.pointsToGo === 20, `Points to go for 30 pts is 20 (got: ${milestone.pointsToGo})`);
  assert(milestone.prevMilestone === 25, `Prev milestone for 30 pts is 25 (got: ${milestone.prevMilestone})`);
  assert(milestone.progressRatio === 0.2, `Progress ratio for 30 pts is 0.2 (got: ${milestone.progressRatio})`);

  // =========================================================================
  // 7. WICKANDO1418 & USER PROFILE RECONCILIATION TEST
  // =========================================================================
  console.log('\n--- 7. Wickando1418 & Authoritative Leaderboard Parity ---');
  // Reconcile user Wickando1418
  const wickandoProfile = await api.getUserProfile('Wickando1418');
  assert(Boolean(wickandoProfile), 'Retrieved profile for Wickando1418');
  assert(wickandoProfile!.totalPoints === 30, `Wickando1418 totalPoints is 30 PTS (got: ${wickandoProfile?.totalPoints})`);
  assert(wickandoProfile!.seasonRank === 3, `Wickando1418 rank is #3 (got: #${wickandoProfile?.seasonRank})`);
  assert(wickandoProfile!.racesParticipated === 1, `Wickando1418 racesParticipated is 1 (got: ${wickandoProfile?.racesParticipated})`);

  // =========================================================================
  // 8. STORY SHARING FORMATTING & SCORING TESTS
  // =========================================================================
  console.log('\n--- 8. Story Sharing Points Formatting (+30, +15, 0, strings) ---');
  const {
    formatStoryPoints,
    sanitizePublicUsername,
    assertAdminAuthorized,
  } = await import('../src/services/sharing/storyShareService');

  assert(formatStoryPoints(30) === '+30 PTS', 'formatStoryPoints(30) returns "+30 PTS"');
  assert(formatStoryPoints(15) === '+15 PTS', 'formatStoryPoints(15) returns "+15 PTS"');
  assert(formatStoryPoints(0) === '+0 PTS', 'formatStoryPoints(0) returns "+0 PTS"');
  assert(formatStoryPoints(-5) === '-5 PTS', 'formatStoryPoints(-5) returns "-5 PTS"');
  assert(formatStoryPoints('+30 PTS') === '+30 PTS', 'formatStoryPoints("+30 PTS") returns "+30 PTS"');
  assert(formatStoryPoints('15 PTS') === '+15 PTS', 'formatStoryPoints("15 PTS") returns "+15 PTS"');

  // =========================================================================
  // 9. PRIVACY & SANITIZATION INVARIANTS
  // =========================================================================
  console.log('\n--- 9. Privacy & Sanitization: Zero Private Info Leakage ---');
  assert(sanitizePublicUsername('Wickando1418') === 'Wickando1418', 'Public handle preserved');
  assert(sanitizePublicUsername('user@gmail.com') === 'user', 'Email domain stripped from public story card');
  assert(sanitizePublicUsername('test.racer.f1@company.org') === 'test.racer.f1', 'Corporate email domain stripped');
  assert(!sanitizePublicUsername('harsh.jalnekar@gmail.com').includes('@'), 'No @ symbol allowed on story card');
  assert(sanitizePublicUsername('very_long_telemetry_username_exceeding_characters').length <= 24, 'Long usernames capped to prevent canvas overflow');
  assert(sanitizePublicUsername('') === 'RACER', 'Empty handle falls back to generic "RACER"');

  // =========================================================================
  // 10. ADMIN PERMISSION AUTHORIZATION ENFORCEMENT
  // =========================================================================
  console.log('\n--- 10. Strict Admin Authorization Enforcement for Leaderboard Story ---');
  let adminPassed = false;
  try {
    assertAdminAuthorized({ role: 'admin' });
    adminPassed = true;
  } catch (_e) {
    adminPassed = false;
  }
  assert(adminPassed === true, 'Admin user passes authorization check');

  let normalUserBlocked = false;
  try {
    assertAdminAuthorized({ role: 'user' });
  } catch (err: any) {
    if (err.message.includes('UNAUTHORIZED') || err.message.includes('administrators')) {
      normalUserBlocked = true;
    }
  }
  assert(normalUserBlocked === true, 'Normal user is strictly blocked by code-level authorization');

  let guestBlocked = false;
  try {
    assertAdminAuthorized(null);
  } catch (_err) {
    guestBlocked = true;
  }
  assert(guestBlocked === true, 'Guest/null user is strictly blocked from leaderboard story generation');

  let undefinedBlocked = false;
  try {
    assertAdminAuthorized(undefined);
  } catch (_err) {
    undefinedBlocked = true;
  }
  assert(undefinedBlocked === true, 'Undefined user is strictly blocked from leaderboard story generation');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    console.error('❌ VERIFICATION SUITE FAILED');
    process.exit(1);
  } else {
    console.log('🏆 ALL PREDICTION POINTS CALCULATION, PROFILE INTEGRITY & STORY SHARING TESTS PASSED!\n');
  }
}

run().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});

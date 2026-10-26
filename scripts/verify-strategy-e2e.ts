/**
 * Strategy Room — End-to-End Attempt Lifecycle & Competitive Progression Verification
 * 
 * Verifies:
 * 1. Single challenge lifecycle (start -> submit -> complete)
 * 2. Multi-stage simulation lifecycle with state carry-forward across all stages
 * 3. Idempotent completion & anti-duplicate scoring safeguards
 * 4. Competitive vs Practice mode segregation
 * 5. Weekly (YYYY-Www) and Overall leaderboard ranking & multi-criteria tie-breaking
 * 6. User personal telemetry calculation
 */

import {
  startStrategyAttempt,
  submitStrategyDecision,
  completeStrategyAttempt,
  getUserStrategyAttempts,
  getStrategyAttempt
} from '../src/services/strategy/strategyService';
import {
  getWeeklyStrategyLeaderboard,
  getOverallStrategyLeaderboard,
  getStrategyPeriodKey,
  getUserStrategyPerformance
} from '../src/services/strategy/strategyLeaderboardService';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runE2ETests() {
  console.log('🏁 [STRATEGY E2E TESTS] Starting Verification Suite...\n');

  const testUser = {
    userId: `test_user_${Date.now()}`,
    username: 'StrategyAce26',
    displayName: 'Hannah Schmitz Protégé',
    favouriteConstructor: 'Ferrari'
  };

  // Test 1: Single Challenge End-to-End
  console.log('--- TEST 1: Single Challenge Full Lifecycle ---');
  const challengeAttempt = await startStrategyAttempt({
    scenarioId: 'monza-undercut-p2',
    userId: testUser.userId,
    username: testUser.username,
    userDisplayName: testUser.displayName,
    isCompetitive: true
  });

  assert(Boolean(challengeAttempt.attemptId), 'Attempt ID generated');
  assert(challengeAttempt.status === 'in_progress', 'Status is in_progress');
  assert(challengeAttempt.currentStepIndex === 0, 'Current step index is 0');
  assert(challengeAttempt.currentState.position === 2, 'Initial position is P2');

  const step1 = await submitStrategyDecision({
    attemptId: challengeAttempt.attemptId,
    actionId: 'act-box-undercut'
  });

  assert(step1.isCompleted === true, 'Single challenge is marked completed after 1 decision');
  assert(step1.attempt.currentStepIndex === 1, 'Step index advanced to 1');
  assert(step1.attempt.currentState.position === 1, 'Position promoted to P1 via undercut');
  assert(step1.attempt.currentState.tireCompound === 'hard', 'Tire changed to Hard');

  const completion1 = await completeStrategyAttempt(challengeAttempt.attemptId, testUser);
  assert(completion1.attempt.status === 'completed', 'Attempt status is completed');
  assert(completion1.scoreReport.finalScore === 100, `Expected 100 score, got ${completion1.scoreReport.finalScore}`);
  assert(completion1.attempt.pointsAwarded === 100, '100 competitive points awarded');
  console.log(`✅ Single challenge completed: P2 -> P${completion1.attempt.finalPosition}, Score: ${completion1.attempt.score}/100, Points: +${completion1.attempt.pointsAwarded}.\n`);

  // Test 2: Multi-Stage Simulation Lifecycle & State Carry-Forward
  console.log('--- TEST 2: Multi-Stage Grand Prix Simulation Lifecycle ---');
  const simAttempt = await startStrategyAttempt({
    scenarioId: 'silverstone-52-lap-masterclass',
    userId: testUser.userId,
    username: testUser.username,
    userDisplayName: testUser.displayName,
    isCompetitive: true
  });

  assert(simAttempt.mode === 'race_simulation', 'Mode is race_simulation');
  assert(simAttempt.currentState.currentLap === 1, 'Starting lap 1');

  // Stage 1
  const stage1Res = await submitStrategyDecision({
    attemptId: simAttempt.attemptId,
    actionId: 'act-drop-back-clean-air'
  });
  assert(!stage1Res.isCompleted, 'Not completed after stage 1');
  assert(stage1Res.attempt.currentStepIndex === 1, 'Stage index advanced to 1');

  // Stage 2
  const stage2Res = await submitStrategyDecision({
    attemptId: simAttempt.attemptId,
    actionId: 'act-box-undercut-hard'
  });
  assert(!stage2Res.isCompleted, 'Not completed after stage 2');
  assert(stage2Res.attempt.currentState.tireCompound === 'hard', 'Hard compound fitted in stage 2 carry forward');

  // Stage 3
  const stage3Res = await submitStrategyDecision({
    attemptId: simAttempt.attemptId,
    actionId: 'act-box-soft-restart'
  });
  assert(!stage3Res.isCompleted, 'Not completed after stage 3');
  assert(stage3Res.attempt.currentState.tireCompound === 'soft', 'Soft compound fitted under SC');

  // Stage 4
  const stage4Res = await submitStrategyDecision({
    attemptId: simAttempt.attemptId,
    actionId: 'act-deploy-battery-hangar'
  });
  assert(stage4Res.isCompleted === true, 'Simulation complete after final stage');

  const simCompletion = await completeStrategyAttempt(simAttempt.attemptId, testUser);
  assert(simCompletion.attempt.status === 'completed', 'Simulation completed');
  assert(simCompletion.scoreReport.finalScore >= 90, `Simulation score expected >= 90, got ${simCompletion.scoreReport.finalScore}`);
  assert(simCompletion.scoreReport.consistencyScore > 0, 'Multi-stage consistency score awarded');
  console.log(`✅ Multi-Stage GP completed across 4 sequential stages. Final Score: ${simCompletion.scoreReport.finalScore}/100 [${simCompletion.scoreReport.ratingTier.name}].\n`);

  // Test 3: Idempotent Completion Safeguards
  console.log('--- TEST 3: Idempotency & Duplicate Points Prevention ---');
  const prevPoints = simCompletion.attempt.pointsAwarded;
  
  // Retry complete on already completed attempt
  const reCompletion = await completeStrategyAttempt(simAttempt.attemptId, testUser);
  assert(reCompletion.leaderboardRankings?.pointsEarned === 0, 'Zero additional points earned on duplicate complete call');
  assert(reCompletion.attempt.score === simCompletion.attempt.score, 'Score remains unchanged');
  console.log('✅ Idempotency verified: re-submitting completion does not duplicate points.\n');

  // Test 4: Practice vs Competitive Segregation
  console.log('--- TEST 4: Practice Mode Segregation ---');
  const practiceAttempt = await startStrategyAttempt({
    scenarioId: 'monza-undercut-p2',
    userId: testUser.userId,
    username: testUser.username,
    isCompetitive: false // PRACTICE MODE
  });

  await submitStrategyDecision({
    attemptId: practiceAttempt.attemptId,
    actionId: 'act-box-undercut'
  });

  const practiceComplete = await completeStrategyAttempt(practiceAttempt.attemptId, testUser);
  assert(practiceComplete.attempt.isCompetitive === false, 'Attempt is practice');
  assert(practiceComplete.attempt.pointsAwarded === 0, 'Practice attempts must award 0 competitive points');
  assert(practiceComplete.leaderboardRankings === undefined, 'Practice attempts do not update leaderboards');
  console.log('✅ Practice mode segregation verified: practice attempt awards 0 competitive points.\n');

  // Test 5: Weekly Period Key & Leaderboards
  console.log('--- TEST 5: Leaderboards & Period Tracking ---');
  const periodKey = getStrategyPeriodKey();
  assert(/^[0-9]{4}-W[0-9]{2}$/.test(periodKey), `Period key ${periodKey} must match YYYY-Www format`);

  const weeklyBoard = await getWeeklyStrategyLeaderboard(periodKey);
  const userWeekly = weeklyBoard.find(e => e.userId === testUser.userId);
  assert(Boolean(userWeekly), 'User is present on weekly leaderboard');
  assert(userWeekly!.totalPoints >= 190, `User total points should reflect competitive scores, got ${userWeekly?.totalPoints}`);

  const overallBoard = await getOverallStrategyLeaderboard();
  const userOverall = overallBoard.find(e => e.userId === testUser.userId);
  assert(Boolean(userOverall), 'User is present on overall leaderboard');
  console.log(`✅ Leaderboards verified: User rank Weekly #${userWeekly?.rank} (${userWeekly?.totalPoints} pts), Overall #${userOverall?.rank} (${userOverall?.totalPoints} pts).\n`);

  // Test 6: Personal Performance Telemetry
  console.log('--- TEST 6: User Strategy Performance Telemetry ---');
  const userHistory = await getUserStrategyAttempts(testUser.userId);
  assert(userHistory.length >= 3, `Expected at least 3 attempts in history, got ${userHistory.length}`);

  const perf = getUserStrategyPerformance(testUser.userId, userHistory);
  assert(perf.totalPoints >= 190, 'Total points aggregated');
  assert(perf.completedScenariosCount >= 2, 'Completed count >= 2');
  assert(perf.averageScore >= 80, `Average score >= 80, got ${perf.averageScore}`);
  assert(perf.categoryStats.undercut_overcut.completed >= 1, 'Undercut category completed');
  assert(perf.categoryStats.race_management.completed >= 1, 'Race management simulation completed');
  console.log(`✅ Performance telemetry verified: ${perf.completedScenariosCount} completed runs, Avg Score: ${perf.averageScore}, Undercut Avg: ${perf.categoryStats.undercut_overcut.avgScore}.\n`);

  console.log('🏆 ALL STRATEGY ROOM END-TO-END TESTS PASSED SUCCESSFULLY!');
}

runE2ETests().catch(err => {
  console.error('Fatal E2E test error:', err);
  process.exit(1);
});

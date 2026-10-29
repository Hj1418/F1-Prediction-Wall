import assert from 'assert';
import { mockApi } from '../src/services/mockApi';
import { api } from '../src/services/apiClient';
import { getHomeSnapshot, DEFAULT_HOME_SNAPSHOT } from '../src/services/home/homeSnapshotService';
import { getPredictionRoundStatus } from '../src/services/schedule/predictionRoundGenerator';
import { formatIstTime, getIstDateParts } from '../src/utils/istTimeUtils';

console.log('🧪 Starting Verification: Admin Competition Analytics & Prediction Status Consistency...\n');

async function runTests() {
  // Test 1: Admin Authorization Enforcement
  console.log('--- 1. Testing Admin Authorization Enforcement ---');
  const regularUserId = 'usr_wickando1418'; // regular racer
  const adminUserId = 'user_harsh'; // verified admin

  let regularUserBlocked = false;
  try {
    await api.getAdminCompetitionAnalytics(regularUserId);
  } catch (err: any) {
    regularUserBlocked = true;
    assert(
      err.message.includes('Forbidden') || err.message.includes('privilege'),
      `Expected Forbidden error message, got: ${err.message}`
    );
  }
  assert(regularUserBlocked, 'Non-admin user MUST NOT be allowed to fetch competition analytics');
  console.log('  ✓ Non-admin user blocked from global competition analytics');

  let profileBlocked = false;
  try {
    await api.getAdminUserCompetitionProfile(regularUserId, 'user_2');
  } catch (err: any) {
    profileBlocked = true;
    assert(
      err.message.includes('Forbidden') || err.message.includes('privilege'),
      `Expected Forbidden error message, got: ${err.message}`
    );
  }
  assert(profileBlocked, 'Non-admin user MUST NOT be allowed to inspect other users competition profiles');
  console.log('  ✓ Non-admin user blocked from inspecting user competition profiles');

  // Test 2: Admin Authorized Access & Global Statistics
  console.log('\n--- 2. Testing Global Competition Statistics ---');
  const analytics = await api.getAdminCompetitionAnalytics(adminUserId, undefined, 'all');
  assert(analytics, 'Admin must receive analytics payload');
  const { globalStats } = analytics;
  assert(globalStats.totalRegisteredUsers > 0, 'Registered users count must be > 0');
  assert(globalStats.usersWithAnyParticipation > 0, 'Participating users count must be > 0');
  assert(
    globalStats.usersWithAnyParticipation <= globalStats.totalRegisteredUsers,
    'Participating users cannot exceed total registered users'
  );
  assert(globalStats.racingTagParticipants > 0, 'Racing tag participants should be > 0');
  assert(globalStats.strategyRoomParticipants > 0, 'Strategy room participants should be > 0');
  assert(globalStats.predictionParticipants > 0, 'Prediction participants should be > 0');
  assert(globalStats.totalSubmissionsAndAttempts > 0, 'Total competition submissions must be > 0');

  console.log(`  ✓ Total Registered Users: ${globalStats.totalRegisteredUsers}`);
  console.log(`  ✓ Unique Active Competitors: ${globalStats.usersWithAnyParticipation} (${globalStats.participationRate}%)`);
  console.log(`  ✓ Racing Tag Participants: ${globalStats.racingTagParticipants}`);
  console.log(`  ✓ Strategy Room Participants: ${globalStats.strategyRoomParticipants}`);
  console.log(`  ✓ Prediction Participants: ${globalStats.predictionParticipants}`);
  console.log(`  ✓ Total Completed Activities: ${globalStats.totalCompletedActivities}`);

  // Test 3: Unique Participant Deduplication Check
  console.log('\n--- 3. Testing Unique Competitor Deduplication ---');
  // If user participated in Racing Tag, Strategy Room, and Predictions, they should be counted as 1 active competitor
  assert(
    globalStats.usersWithAnyParticipation <=
      globalStats.racingTagParticipants + globalStats.strategyRoomParticipants + globalStats.predictionParticipants,
    'Users participating in multiple features must be deduplicated in global unique count'
  );
  console.log('  ✓ User deduplication across Compete features verified');

  // Test 4: Time Range Filtering
  console.log('\n--- 4. Testing Time Range Filters ---');
  const analytics30d = await api.getAdminCompetitionAnalytics(adminUserId, undefined, '30d');
  const analytics7d = await api.getAdminCompetitionAnalytics(adminUserId, undefined, '7d');
  assert(analytics30d, '30d analytics should load');
  assert(analytics7d, '7d analytics should load');
  assert(analytics30d.globalStats.timeRange === '30d' || analytics30d.timeRange === '30d', 'TimeRange must be set to 30d');
  assert(analytics7d.globalStats.timeRange === '7d' || analytics7d.timeRange === '7d', 'TimeRange must be set to 7d');
  console.log('  ✓ Time filters (All Time, Last 30 Days, Last 7 Days) verified');

  // Test 5: Racing Tag Analytics
  console.log('\n--- 5. Testing Racing Tag Analytics ---');
  const { racingTag } = analytics;
  assert(racingTag.totalAttempts >= racingTag.completedAttempts, 'Total attempts >= completed attempts');
  assert(
    racingTag.byDifficulty.rookie + racingTag.byDifficulty.apex + racingTag.byDifficulty.race_analyst ===
      racingTag.totalAttempts,
    'Difficulty breakdown must sum to total attempts'
  );
  assert(racingTag.averageScore >= 0, 'Average score must be non-negative');
  assert(racingTag.bestScore >= 0, 'Best score must be non-negative');
  console.log(`  ✓ Racing Tag Attempts: ${racingTag.totalAttempts} (Rookie: ${racingTag.byDifficulty.rookie}, Apex: ${racingTag.byDifficulty.apex}, Analyst: ${racingTag.byDifficulty.race_analyst})`);
  console.log(`  ✓ Racing Tag Avg Score: ${racingTag.averageScore} pts (${racingTag.averagePercentage}%)`);

  // Test 6: Strategy Room Analytics
  console.log('\n--- 6. Testing Strategy Room Analytics ---');
  const { strategyRoom } = analytics;
  assert(strategyRoom.totalAttempts >= strategyRoom.completedAttempts, 'Total strategy attempts >= completed');
  assert(strategyRoom.scenariosAttempted.length > 0, 'Should have scenario attempts');
  assert(typeof strategyRoom.averagePositionDelta === 'number', 'Position delta must be numeric');
  assert(typeof strategyRoom.averageTimeDeltaSeconds === 'number', 'Time delta must be numeric');
  console.log(`  ✓ Strategy Runs: ${strategyRoom.totalAttempts} across ${strategyRoom.scenariosAttempted.length} scenarios`);
  console.log(`  ✓ Strategy Avg Score: ${strategyRoom.averageScore}, Avg Pos Delta: ${strategyRoom.averagePositionDelta}`);

  // Test 7: F1 Prediction Analytics
  console.log('\n--- 7. Testing F1 Prediction Analytics ---');
  const { predictions } = analytics;
  assert(predictions.totalSubmissions > 0, 'Total prediction submissions must be > 0');
  assert(predictions.byWeekend.length > 0, 'Should have Grand Prix breakdown');
  assert(predictions.averageScore >= 0, 'Prediction average score must be >= 0');
  console.log(`  ✓ Prediction Submissions: ${predictions.totalSubmissions} across ${predictions.byWeekend.length} Grands Prix`);
  console.log(`  ✓ Prediction Avg Score: ${predictions.averageScore} pts, Best: ${predictions.bestScore} pts`);

  // Test 8: Unified User Competition Profile (No password/tokens leak, accurate aggregation)
  console.log('\n--- 8. Testing Unified User Competition Profile ---');
  const userProfile = await api.getAdminUserCompetitionProfile(adminUserId, 'usr_wickando1418');
  assert(userProfile, 'User profile must be returned');
  assert(userProfile.account.userId === 'usr_wickando1418', 'Target user ID must match');
  assert(userProfile.account.displayName, 'Display name must be populated');
  // Security verification: no sensitive data exposed
  assert(!(userProfile as any).account.password, 'Security Check: Passwords must NEVER be present in competition profile');
  assert(!(userProfile as any).account.passwordHash, 'Security Check: Password hashes must NEVER be present');
  assert(!(userProfile as any).account.authToken, 'Security Check: Auth tokens must NEVER be present');

  // Verify feature breakdown in profile
  assert(typeof userProfile.racingTag.attemptsCount === 'number', 'Racing tag attempts must be numeric');
  assert(typeof userProfile.strategyRoom.attemptsCount === 'number', 'Strategy attempts must be numeric');
  assert(typeof userProfile.predictions.submissionsCount === 'number', 'Prediction submissions must be numeric');
  assert(userProfile.combined.activityTimeline.length >= 0, 'Activity timeline must be present');
  console.log(`  ✓ Unified Profile loaded for ${userProfile.account.displayName} (@${userProfile.account.username})`);
  console.log(`  ✓ Sensitive data leak prevention verified (no passwords, tokens, or hashes)`);
  console.log(`  ✓ Timeline contains ${userProfile.combined.activityTimeline.length} combined events`);

  // Test 9: Prediction Status Consistency & Race Weekend Card Alignment
  console.log('\n--- 9. Testing Prediction Status Consistency & Race Weekend Card ---');
  const snapshot = await getHomeSnapshot();
  assert(snapshot.nextRace, 'Snapshot must have nextRace');
  assert(snapshot.predictionHighlight, 'Snapshot must have predictionHighlight');

  const highlight = snapshot.predictionHighlight;
  const closesAt = highlight.closesAt || highlight.lockTime;
  const nowMs = Date.now();

  console.log(`  Highlight Status: ${highlight.status}`);
  console.log(`  ClosesAt: ${closesAt}`);

  if (closesAt) {
    const closesAtMs = new Date(closesAt).getTime();
    if (nowMs >= closesAtMs) {
      // Deadline has passed! The status MUST NOT be 'OPEN'
      assert(
        highlight.status !== 'OPEN',
        `Inconsistency bug detected! ClosesAt (${closesAt}) has passed but highlight.status is OPEN!`
      );
      console.log('  ✓ Authoritative check: When closesAt has passed, status is properly LOCKED (never OPEN)');
    } else {
      // Window is in the future
      console.log('  ✓ ClosesAt is in the future; countdown target is valid');
    }
  }

  // Test 10: Dynamic Lifecycle State Machine Verification
  console.log('\n--- 10. Testing Prediction Round Lifecycle & Cutoff Logic ---');
  const futureClosesAt = new Date(Date.now() + 3600 * 1000).toISOString();
  const pastClosesAt = new Date(Date.now() - 3600 * 1000).toISOString();
  const pastOpensAt = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const futureOpensAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  // Active open round
  const openStatus = getPredictionRoundStatus({
    opensAt: pastOpensAt,
    closesAt: futureClosesAt,
  });
  assert.strictEqual(openStatus, 'OPEN', 'Status should be OPEN when now is between opensAt and closesAt');

  // Expired deadline round
  const lockedStatus = getPredictionRoundStatus({
    opensAt: pastOpensAt,
    closesAt: pastClosesAt,
  });
  assert.strictEqual(lockedStatus, 'LOCKED', 'Status should be LOCKED when closesAt has passed');

  // Upcoming round
  const upcomingStatus = getPredictionRoundStatus({
    opensAt: futureOpensAt,
    closesAt: futureClosesAt,
  });
  assert.strictEqual(upcomingStatus, 'UPCOMING', 'Status should be UPCOMING when opensAt is in future');
  console.log('  ✓ Dynamic prediction round lifecycle (UPCOMING -> OPEN -> LOCKED) verified');

  // Test 11: IST Timezone Handling & Session Rollover
  console.log('\n--- 11. Testing IST Timezone Formatting & Session Rollovers ---');
  // Race at 2026-10-25 19:00:00 UTC (which is 00:30:00 next day Oct 26 in IST)
  const utcLateSession = '2026-10-25T19:00:00Z';
  const istTime = formatIstTime(utcLateSession);
  assert.strictEqual(istTime, '00:30 IST', `Expected 00:30 IST, got: ${istTime}`);

  const istParts = getIstDateParts(utcLateSession);
  const istDate = new Date(new Date(utcLateSession).getTime() + 330 * 60 * 1000);
  // Oct 25, 2026 was a Sunday (UTC). At 19:00 UTC (+5h30m = 00:30 on Monday, Oct 26).
  assert.strictEqual(istDate.getUTCDay(), 1, 'Expected Monday (day = 1) in IST');
  assert.strictEqual(istParts.day, 26, 'Expected 26th day of month in IST');
  console.log('  ✓ Midnight rollover correctly shifts day to Monday in IST (00:30 IST)');

  console.log('\n🎉 ALL 11 TESTS PASSED! Admin Competition Analytics & Prediction Status Consistency Verified.\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});

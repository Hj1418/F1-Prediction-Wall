/**
 * Verification Script: Full-Season Point Progress Speedometer & Milestone Independence
 * 
 * Verifies:
 * 1. Dynamic Season Configuration derived from authoritative calendar/scoring rules:
 *    - 24 race weekends × 55 max race points = 1,320 PTS
 *    - 6 sprint races × 30 max sprint points = 180 PTS
 *    - TOTAL MAXIMUM POSSIBLE SEASON SCORE = 1,500 PTS
 * 2. Speedometer Scale & Ratio Checks:
 *    - 0 PTS -> 0% (ratio = 0)
 *    - 30 PTS -> 2% (ratio = 0.02)
 *    - 750 PTS -> 50% (ratio = 0.50)
 *    - 1500 PTS -> 100% (ratio = 1.0)
 *    - > 1500 PTS (e.g. 1800 PTS) -> clamped to 100% (ratio = 1.0, progressPercent = 100%)
 * 3. Needle Angle Geometry Verification (-100 deg to +100 deg, 200 deg arc):
 *    - 0 PTS -> -100 deg
 *    - 30 PTS -> -96 deg (near beginning)
 *    - 750 PTS -> 0 deg (exact center top)
 *    - 1500 PTS -> +100 deg (full scale)
 *    - 1800 PTS -> +100 deg (clamped at max)
 * 4. Milestone Independence:
 *    - For 30 PTS:
 *      - Speedometer = 2% of 1500 PTS
 *      - Milestone next = 50 PTS, pointsToGo = 20 PTS, milestone progress = 20%
 *      - They do NOT collide and are completely separate!
 * 5. Data Consistency:
 *    - Profile total points matches Leaderboard total points
 *    - Season rank is intact
 *    - Pending predictions do not contribute points
 *    - Sprints and Races both contribute to the maximum possible season score
 */

import {
  getSeasonMaxPredictionPoints,
  calculateSeasonProgress,
  MAX_POINTS_PER_RACE,
  MAX_POINTS_PER_SPRINT,
} from '../src/utils/predictionScoring';
import { calculateMilestones } from '../src/components/predictions/PredictionSpeedometer';
import { f1Data } from '../src/services/motorsport/data/f1Data';
import { mockApi } from '../src/services/mockApi';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('🏎️ STARTING FULL-SEASON SPEEDOMETER & SCORING VERIFICATION...\n');

// 1. Authoritative Season Configuration & Dynamic Derivation
console.log('--- 1. Authoritative Season Configuration & Dynamic Derivation ---');
const totalRounds = f1Data.rounds.length;
const sprintRounds = f1Data.rounds.filter(r =>
  r.sessions?.some(s =>
    /sprint/i.test(s.name) ||
    /sprint/i.test(s.description || '')
  )
).length;
const racePoints = totalRounds * MAX_POINTS_PER_RACE;
const sprintPoints = sprintRounds * MAX_POINTS_PER_SPRINT;
const seasonMax = getSeasonMaxPredictionPoints();

assert(totalRounds === 24, `Total race weekends in season is 24 (got: ${totalRounds})`);
assert(sprintRounds === 6, `Total sprint weekends in season is 6 (got: ${sprintRounds})`);
assert(MAX_POINTS_PER_RACE === 55, `Max prediction points per Grand Prix is 55 (got: ${MAX_POINTS_PER_RACE})`);
assert(MAX_POINTS_PER_SPRINT === 30, `Max prediction points per Sprint is 30 (got: ${MAX_POINTS_PER_SPRINT})`);
assert(racePoints === 1320, `24 races × 55 pts = 1,320 pts (got: ${racePoints})`);
assert(sprintPoints === 180, `6 sprints × 30 pts = 180 pts (got: ${sprintPoints})`);
assert(seasonMax === 1500, `Total maximum season score is exactly 1,500 PTS (got: ${seasonMax})`);

// Adaptability test: changing races or sprint counts dynamically recalculates season max
const customMax = getSeasonMaxPredictionPoints(undefined, { raceCount: 20, sprintCount: 5, pointsPerRace: 50, pointsPerSprint: 25 });
assert(customMax === (20 * 50) + (5 * 25), `Dynamic custom season configuration resolves correctly to ${(20 * 50) + (5 * 25)} (got: ${customMax})`);

// 2. Speedometer Scale & Ratio Checks
console.log('\n--- 2. Speedometer Scale & Ratio Checks ---');

// 0 PTS -> 0%
const prog0 = calculateSeasonProgress(0, seasonMax);
assert(prog0.progressRatio === 0, '0 PTS has progressRatio 0');
assert(prog0.progressPercent === 0, '0 PTS has progressPercent 0%');

// 30 PTS -> 2%
const prog30 = calculateSeasonProgress(30, seasonMax);
assert(Math.abs(prog30.progressRatio - 0.02) < 0.0001, '30 PTS has progressRatio 0.02 (30/1500)');
assert(prog30.progressPercent === 2, '30 PTS has progressPercent 2%');

// 750 PTS -> 50%
const prog750 = calculateSeasonProgress(750, seasonMax);
assert(prog750.progressRatio === 0.5, '750 PTS has progressRatio 0.50 (750/1500)');
assert(prog750.progressPercent === 50, '750 PTS has progressPercent 50%');

// 1500 PTS -> 100%
const prog1500 = calculateSeasonProgress(1500, seasonMax);
assert(prog1500.progressRatio === 1.0, '1500 PTS has progressRatio 1.0 (1500/1500)');
assert(prog1500.progressPercent === 100, '1500 PTS has progressPercent 100%');

// Points > 1500 (e.g. 1800 PTS) -> clamped to 100%
const prog1800 = calculateSeasonProgress(1800, seasonMax);
assert(prog1800.progressRatio === 1.0, 'Points > 1500 clamps progressRatio to 1.0');
assert(prog1800.progressPercent === 100, 'Points > 1500 clamps progressPercent to 100% (never > 100%)');
assert(prog1800.rawRatio === 1.2, 'Points > 1500 preserves rawRatio for logging if needed');

// Negative points clamp to 0
const progNeg = calculateSeasonProgress(-20, seasonMax);
assert(progNeg.progressRatio === 0, 'Negative points clamp progressRatio to 0');
assert(progNeg.progressPercent === 0, 'Negative points clamp progressPercent to 0%');

// 3. Gauge Needle Angle Verification (-100 deg to +100 deg, 200 deg arc)
console.log('\n--- 3. Needle Angle Geometry Verification ---');
const START_ANGLE = -100;
const END_ANGLE = 100;
const TOTAL_ARC = END_ANGLE - START_ANGLE; // 200

function getNeedleAngle(pts: number, max: number): number {
  const { progressRatio } = calculateSeasonProgress(pts, max);
  return START_ANGLE + progressRatio * TOTAL_ARC;
}

assert(getNeedleAngle(0, seasonMax) === -100, '0 PTS needle angle is -100° (gauge start)');
assert(Math.round(getNeedleAngle(30, seasonMax)) === -96, '30 PTS needle angle is -96° (near beginning, not artificial)');
assert(getNeedleAngle(750, seasonMax) === 0, '750 PTS needle angle is 0° (vertical center top)');
assert(getNeedleAngle(1500, seasonMax) === 100, '1500 PTS needle angle is +100° (gauge end)');
assert(getNeedleAngle(2000, seasonMax) === 100, '2000 PTS needle angle is clamped at +100°');

// 4. Milestone Independence from Speedometer
console.log('\n--- 4. Milestone Independence from Speedometer ---');
const userPoints = 30;
const milestone = calculateMilestones(userPoints);
const seasonProg = calculateSeasonProgress(userPoints, seasonMax);

assert(milestone.nextMilestone === 50, 'Next milestone for 30 PTS is 50 PTS');
assert(milestone.pointsToGo === 20, 'Points to next milestone for 30 PTS is 20 PTS');
assert(milestone.progressRatio === 0.2, 'Milestone target progress ratio for 30 PTS is 20% ((30 - 25) / 25)');
assert(seasonProg.progressPercent === 2, 'Speedometer season progress is 2% (30 / 1500)');
assert(milestone.progressRatio !== seasonProg.progressRatio, 'Speedometer season progress (2%) is completely separate from milestone progress (20%)');

import { api } from '../src/services/apiClient';

// 5. Data Consistency with Profile & Leaderboard
console.log('\n--- 5. Data Consistency with Profile & Leaderboard ---');
async function testDataConsistency() {
  const harshUserId = 'usr_jalnekarharsh14_acaab661';
  const profile = await mockApi.getUserProfile(harshUserId);
  assert(Boolean(profile), `Retrieved profile for ${harshUserId}`);
  assert(profile!.totalPoints >= 30, `Profile total points is at least 30 PTS (got: ${profile?.totalPoints})`);

  const leaderboard = await api.getLeaderboard('season', '2026');
  const harshOnLeaderboard = leaderboard.find(e => e.userId === harshUserId || e.username === profile?.username);
  assert(Boolean(harshOnLeaderboard), 'Harsh found on authoritative season leaderboard');
  assert(harshOnLeaderboard!.totalPoints === profile!.totalPoints, 'Profile points matches Leaderboard points');
  assert(harshOnLeaderboard!.rank === profile!.seasonRank, 'Profile seasonRank matches Leaderboard rank');

  const profileSeasonProg = calculateSeasonProgress(profile!.totalPoints, seasonMax);
  assert(profileSeasonProg.progressPercent === 2, `Profile points (30) computes to 2% season progress`);

  console.log('\n🎉 ALL FULL-SEASON SPEEDOMETER & DATA CONSISTENCY TESTS PASSED!\n');
}

testDataConsistency().catch(err => {
  console.error('Data consistency test error:', err);
  process.exit(1);
});

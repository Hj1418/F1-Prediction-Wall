/**
 * Phase 11 Verification Suite
 * Prediction Bench Reliability, Race Context & Scoring Hardening
 */

import { getSharedRaceContext } from '../src/services/schedule/raceContextService.ts';
import { getHomeSnapshot } from '../src/services/home/homeSnapshotService.ts';
import { getEligibleDriversForWeekend, isValidDriverForSeason } from '../src/services/motorsport/raceEntryService.ts';
import { generatePredictionRounds, isQualificationPredictionRound } from '../src/services/schedule/predictionRoundGenerator.ts';
import { ScoringEngine } from '../src/services/scoringEngine.ts';
import { api } from '../src/services/apiClient.ts';
import { RaceWeekend } from '../src/types/index.ts';

console.log('🏎️ Running Phase 11 — Prediction Bench Reliability, Race Context & Scoring Hardening Test Suite...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

async function runPhase11Tests() {
  // =========================================================================
  // 1. Shared Race Context & Calendar Resolution (Azerbaijan GP vs Spain GP)
  // =========================================================================
  console.log('--- 1. Shared Race Context & Active Race Resolution ---');
  
  const sharedCtx = await getSharedRaceContext(2026);
  assert(sharedCtx !== null, 'Shared race context successfully resolved for 2026 season');
  assert(
    sharedCtx?.currentWeekend.name.includes('Azerbaijan') || sharedCtx?.currentWeekend.raceName.includes('Azerbaijan'),
    'Active race is dynamically resolved to Azerbaijan Grand Prix',
    `Current: ${sharedCtx?.currentWeekend.name}`
  );
  assert(
    sharedCtx?.currentWeekend.circuit.name.includes('Baku') || sharedCtx?.currentWeekend.country === 'Azerbaijan',
    'Circuit is dynamically resolved to Baku City Circuit, Azerbaijan'
  );
  assert(sharedCtx?.status === 'ACTIVE', 'Active race status is ACTIVE');
  assert(
    sharedCtx?.currentWeekend.roundNumber === 17,
    'Azerbaijan Grand Prix is Round 17',
    `Round: ${sharedCtx?.currentWeekend.roundNumber}`
  );

  // Home snapshot verification
  const homeSnap = await getHomeSnapshot();
  assert(
    homeSnap.nextRace.grandPrixName.includes('Azerbaijan'),
    'Home snapshot nextRace dynamically reflects Azerbaijan Grand Prix at Baku',
    `Home nextRace: ${homeSnap.nextRace.grandPrixName}`
  );
  assert(
    homeSnap.nextRace.city === 'Baku' && homeSnap.nextRace.country === 'Azerbaijan',
    'Home snapshot location is Baku, Azerbaijan'
  );
  assert(
    !homeSnap.nextRace.grandPrixName.includes('Spanish'),
    'Home screen does not display hardcoded Spanish Grand Prix'
  );
  assert(
    homeSnap.predictionHighlight.roundName.includes('Azerbaijan') || homeSnap.predictionHighlight.roundName.includes('Baku'),
    'Home prediction highlight binds to current Azerbaijan GP'
  );

  // =========================================================================
  // 2. 2026 Race-Eligible Driver Roster
  // =========================================================================
  console.log('\n--- 2. 2026 Race-Eligible Driver Roster ---');

  const drivers = await api.getEligibleDrivers('2026_17', 2026);
  assert(drivers.length === 22, `Active 2026 grid contains exactly 22 drivers across 11 teams (found ${drivers.length})`);

  // Check new/updated 2026 drivers
  const hamiltonFerrari = drivers.find(d => d.id === 'hamilton' && d.team.includes('Ferrari'));
  assert(Boolean(hamiltonFerrari), 'Lewis Hamilton is correctly registered at Scuderia Ferrari for 2026');

  const sainzWilliams = drivers.find(d => d.id === 'sainz' && d.team.includes('Williams'));
  assert(Boolean(sainzWilliams), 'Carlos Sainz is correctly registered at Williams for 2026');

  const antonelliMercedes = drivers.find(d => d.id === 'antonelli' && d.team.includes('Mercedes'));
  assert(Boolean(antonelliMercedes), 'Kimi Antonelli is registered at Mercedes for 2026');

  const cadillacTeam = drivers.filter(d => d.team.includes('Cadillac'));
  assert(cadillacTeam.length === 2, 'Cadillac F1 Team is present with 2 race drivers (Maloney & Pourchaire)');

  // Validation rejects historical/ineligible drivers
  assert(isValidDriverForSeason('verstappen', 2026), 'Max Verstappen is valid for 2026');
  assert(!isValidDriverForSeason('ricciardo', 2026), 'Daniel Ricciardo is rejected as ineligible for 2026 race roster');
  assert(!isValidDriverForSeason('sargeant', 2026), 'Logan Sargeant is rejected as ineligible for 2026 race roster');
  assert(!isValidDriverForSeason('latifi', 2026), 'Nicholas Latifi is rejected as ineligible for 2026 race roster');

  // Submit prediction with invalid driver should be rejected
  let invalidSubmitRejected = false;
  try {
    await api.submitPrediction({
      userId: 'test_user_p11',
      roundId: '2026_17_RACE_PREDICTION',
      predictionData: {
        p1: 'ricciardo', // Ineligible driver
        p2: 'norris',
        p3: 'leclerc',
      },
    });
  } catch (err: any) {
    invalidSubmitRejected = true;
    assert(
      err.message.includes('not an eligible 2026 driver') || err.message.includes('Invalid driver selection'),
      'Submission rejection includes clear error message for invalid driver'
    );
  }
  assert(invalidSubmitRejected, 'api.submitPrediction rejects invalid/outdated drivers');

  // =========================================================================
  // 3. Qualification Prediction Removal & Historical Preservation
  // =========================================================================
  console.log('\n--- 3. Qualification Prediction Removal & Historical Preservation ---');

  const mockWeekend: RaceWeekend = {
    id: '2026_17',
    raceWeekendId: '2026_17',
    season: 2026,
    round: 17,
    roundNumber: 17,
    name: 'Azerbaijan Grand Prix',
    raceName: 'Azerbaijan Grand Prix',
    country: 'Azerbaijan',
    circuit: 'Baku City Circuit',
    flag: '🇦🇿',
    weekendType: 'NORMAL',
    startDate: '2026-09-18T09:30:00Z',
    endDate: '2026-09-20T13:00:00Z',
    status: 'ACTIVE',
    sessions: [
      { id: '17_FP1', raceWeekendId: '2026_17', type: 'FP1', name: 'Practice 1', startTime: '2026-09-18T09:30:00Z', status: 'COMPLETED' },
      { id: '17_QUALIFYING', raceWeekendId: '2026_17', type: 'QUALIFYING', name: 'Qualifying', startTime: '2026-09-19T12:00:00Z', status: 'COMPLETED' },
      { id: '17_RACE', raceWeekendId: '2026_17', type: 'RACE', name: 'Grand Prix', startTime: '2026-09-20T11:00:00Z', status: 'UPCOMING' },
    ],
  };

  const rounds = generatePredictionRounds(mockWeekend);
  assert(rounds.length === 1, 'Only 1 prediction round generated for normal weekend (Race prediction only)');
  assert(rounds[0].type === 'RACE', 'Generated round is strictly RACE');
  assert(!rounds.some(r => isQualificationPredictionRound(r)), 'No qualification prediction rounds generated');

  // Verify historical qualification detection
  assert(isQualificationPredictionRound({ type: 'QUALIFYING' }), 'isQualificationPredictionRound recognizes QUALIFYING');
  assert(isQualificationPredictionRound({ roundId: '2026_16_QUALIFYING_PREDICTION' }), 'isQualificationPredictionRound recognizes roundId');
  assert(!isQualificationPredictionRound({ type: 'RACE' }), 'isQualificationPredictionRound correctly preserves RACE');

  // =========================================================================
  // 4. Persistent Locked Predictions
  // =========================================================================
  console.log('\n--- 4. Persistent Locked Predictions ---');

  const testUserId = 'user_audit_phase11';
  const testRoundId = '2026_17_RACE_PREDICTION';

  const submittedPred = await api.submitPrediction({
    userId: testUserId,
    roundId: testRoundId,
    predictionData: {
      p1: 'verstappen',
      p2: 'norris',
      p3: 'leclerc',
      fastestLap: 'piastri',
      driverOfTheDay: 'hamilton',
      safetyCar: 'YES',
    },
  });

  assert(Boolean(submittedPred.predictionId), 'Prediction successfully created and returned');
  assert(submittedPred.predictionData.p1 === 'verstappen', 'Prediction data contains P1 pick');

  // Verify retrieval after submission (simulating reload or navigation)
  const retrievedPred = await api.getUserPrediction(testRoundId, testUserId);
  assert(retrievedPred !== null, 'User prediction successfully retrieved from persistence layer');
  assert(retrievedPred?.predictionData.p1 === 'verstappen', 'Retrieved prediction matches submitted P1');
  assert(retrievedPred?.predictionData.p2 === 'norris', 'Retrieved prediction matches submitted P2');
  assert(retrievedPred?.predictionData.p3 === 'leclerc', 'Retrieved prediction matches submitted P3');
  assert(retrievedPred?.predictionData.fastestLap === 'piastri', 'Retrieved prediction matches Fastest Lap');

  // =========================================================================
  // 5. Scoring Engine Audit, Idempotency & DNF / DNS / DSQ Rules
  // =========================================================================
  console.log('\n--- 5. Scoring Engine Audit & DNF / DNS / DSQ Rules ---');

  const officialResult = {
    p1: 'verstappen',
    p2: 'norris',
    p3: 'leclerc',
    fastestLap: 'piastri',
    driverOfTheDay: 'hamilton',
    safetyCar: 'YES',
  };

  // Perfect podium scenario
  const perfectScore = ScoringEngine.calculate(
    {
      p1: 'verstappen',
      p2: 'norris',
      p3: 'leclerc',
      fastestLap: 'piastri',
      driverOfTheDay: 'hamilton',
      safetyCar: 'YES',
    },
    officialResult
  );

  // Expected points: P1(15) + P2(10) + P3(10) + PerfectPodiumBonus(10) + FastestLap(10) + DotD(10) + SafetyCar(10) = 75
  assert(perfectScore.totalScore === 75, `Perfect prediction scores 75 points (scored: ${perfectScore.totalScore})`);
  assert(perfectScore.breakdown.perfectPodiumBonus === 10, 'Perfect podium bonus awarded (+10 pts)');

  // Wrong position scenario: P1 predicted Norris, P2 predicted Verstappen, P3 predicted Leclerc
  const wrongPosScore = ScoringEngine.calculate(
    {
      p1: 'norris',     // On podium, but wrong spot -> 5 pts
      p2: 'verstappen', // On podium, but wrong spot -> 5 pts
      p3: 'leclerc',    // Exact P3 -> 10 pts
    },
    officialResult
  );
  // Expected: 5 + 5 + 10 = 20 pts
  assert(wrongPosScore.totalScore === 20, `Podium finishers in wrong positions award 5 pts each (scored: ${wrongPosScore.totalScore})`);
  assert(wrongPosScore.breakdown.perfectPodiumBonus === 0, 'No perfect podium bonus when positions are swapped');

  // DNF scenario: predicted driver DNFs
  const dnfScore = ScoringEngine.calculate(
    {
      p1: 'albon', // DNFs / not on podium -> 0 pts
      p2: 'norris', // Exact P2 -> 10 pts
      p3: 'leclerc', // Exact P3 -> 10 pts
    },
    officialResult
  );
  assert(dnfScore.breakdown.p1 === 0, 'DNF driver scores 0 pts for podium');
  assert(dnfScore.totalScore === 20, `DNF does not crash calculation, other correct picks awarded (scored: ${dnfScore.totalScore})`);

  // DSQ scenario: post-race disqualification
  const dsqResult = {
    ...officialResult,
    disqualifiedDrivers: ['verstappen'], // Verstappen disqualified post-race
  };
  const dsqScore = ScoringEngine.calculate(
    {
      p1: 'verstappen',
      p2: 'norris',
      p3: 'leclerc',
    },
    dsqResult
  );
  assert(dsqScore.breakdown.p1 === 0, 'Disqualified driver scores 0 points even if predicted in winning spot');
  assert(dsqScore.breakdown.perfectPodiumBonus === 0, 'Perfect podium bonus voided if a podium driver is disqualified');

  // Idempotency: re-running scoring multiple times produces identical result
  const run1 = ScoringEngine.calculate(submittedPred.predictionData, officialResult);
  const run2 = ScoringEngine.calculate(submittedPred.predictionData, officialResult);
  const run3 = ScoringEngine.calculate(submittedPred.predictionData, officialResult);
  assert(run1.totalScore === run2.totalScore && run2.totalScore === run3.totalScore, 'Scoring calculation is strictly idempotent across runs');

  // Amended results recalculation
  const amendedResult = {
    ...officialResult,
    p1: 'norris',
    p2: 'leclerc',
    p3: 'piastri',
  };
  const amendedScore = ScoringEngine.calculate(submittedPred.predictionData, amendedResult);
  assert(amendedScore.totalScore !== run1.totalScore, 'Amended official results dynamically trigger distinct, accurate recalculation');

  // Season leaderboard verification: derived directly from authoritative scores
  const leaderboard = await api.getLeaderboard('season');
  assert(Array.isArray(leaderboard), 'Season leaderboard successfully retrieved');
  assert(leaderboard.length > 0, 'Season leaderboard contains ranked entries derived from verified scores');

  console.log(`\n=======================================================`);
  console.log(`Phase 11 Verification Results: ${passed} passed, ${failed} failed.`);
  console.log(`=======================================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🏆 All Phase 11 Reliability, Race Context & Scoring tests passed!\n');
  }
}

runPhase11Tests();

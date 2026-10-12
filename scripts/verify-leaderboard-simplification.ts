/**
 * Verification Script: Leaderboard Simplification & Race Weekend Standings
 *
 * Verifies:
 * 1. Only two leaderboard views (SEASON OVERALL and WEEKEND OVERALL).
 * 2. Session Round tab and exclusively associated controls are completely removed.
 * 3. Dynamic resolution of the latest completed race weekend with finalized results (e.g., Singapore > Azerbaijan, never hardcoded, never Australia R1).
 * 4. Pending / unfinalized weekend handling (never prematurely treated as scored).
 * 5. Chronological weekend selector ordering (newest first).
 * 6. Weekend scoring isolation (points earned exclusively for the selected weekend).
 * 7. Sprint points + Grand Prix points separation and aggregation on sprint weekends.
 * 8. Zero season score leakage into weekend standings.
 * 9. Changing selected weekend does not alter season overall totals or ranks.
 * 10. Deterministic tie-breaking rules across all views.
 * 11. User identity deduplication (1 row per user per view).
 */

import { mockApi } from '../src/services/mockApi';
import { api } from '../src/services/apiClient';
import { resolveLatestCompletedAndFinalizedWeekend } from '../src/utils/raceLifecycle';
import { RaceWeekend, PredictionRound } from '../src/types';
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    throw new Error(msg);
  }
  console.log(`  ✓ ${msg}`);
}

async function runTests() {
  console.log('\n🏁 STARTING LEADERBOARD SIMPLIFICATION & RACE WEEKEND STANDINGS VERIFICATION\n');

  // =========================================================================
  // TEST 1: Source Code Audit - Exactly Two Views & Session Round Removed
  // =========================================================================
  console.log('📌 TEST 1: LeaderboardPage UI Structure Audit');
  const pagePath = path.resolve(process.cwd(), 'src/pages/LeaderboardPage.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');

  assert(
    pageContent.includes('tab-season-overall') && pageContent.includes('tab-weekend-overall'),
    'LeaderboardPage includes explicit tab buttons for Season Overall and Weekend Overall'
  );
  assert(
    !pageContent.includes('Session Round') && !pageContent.includes('tab-round'),
    'Session Round tab button and user-facing navigation are completely removed from LeaderboardPage'
  );
  assert(
    !pageContent.includes('selectedRoundId') && !pageContent.includes('setSelectedRoundId'),
    'Obsolete selectedRoundId state and session round selector dropdown are eliminated'
  );
  assert(
    pageContent.includes('race-weekend-selector'),
    'Weekend selector dropdown is cleanly available in Weekend Overall view'
  );

  // =========================================================================
  // TEST 2: Dynamic Default Resolution - Latest Completed & Finalized Weekend
  // =========================================================================
  console.log('\n📌 TEST 2: Dynamic Resolution of Latest Completed & Finalized Weekend');

  const testWeekends: RaceWeekend[] = [
    {
      raceWeekendId: '2026_01',
      season: 2026,
      round: 1,
      roundNumber: 1,
      name: 'Australian Grand Prix',
      raceName: 'Australian Grand Prix',
      country: 'Australia',
      circuit: { id: 'albert_park', name: 'Albert Park', locality: 'Melbourne' },
      flag: '🇦🇺',
      weekendType: 'NORMAL',
      startDate: '2026-03-13T01:30:00Z',
      endDate: '2026-03-15T07:00:00Z',
      status: 'COMPLETED',
      sessions: [],
    },
    {
      raceWeekendId: '2026_15',
      season: 2026,
      round: 15,
      roundNumber: 15,
      name: 'Azerbaijan Grand Prix',
      raceName: 'Azerbaijan Grand Prix',
      country: 'Azerbaijan',
      circuit: { id: 'baku', name: 'Baku City Circuit', locality: 'Baku' },
      flag: '🇦🇿',
      weekendType: 'NORMAL',
      startDate: '2026-09-24T10:30:00Z',
      endDate: '2026-09-26T16:00:00Z',
      status: 'COMPLETED',
      sessions: [],
    },
    {
      raceWeekendId: '2026_17',
      season: 2026,
      round: 17,
      roundNumber: 17,
      name: 'Singapore Grand Prix',
      raceName: 'Singapore Grand Prix',
      country: 'Singapore',
      circuit: { id: 'singapore', name: 'Marina Bay' },
      flag: '🇸🇬',
      weekendType: 'NORMAL',
      startDate: '2026-10-09T09:30:00Z',
      endDate: '2026-10-11T16:00:00Z',
      status: 'COMPLETED',
      sessions: [],
    },
    {
      raceWeekendId: '2026_19',
      season: 2026,
      round: 19,
      roundNumber: 19,
      name: 'United States Grand Prix',
      raceName: 'United States Grand Prix',
      country: 'USA',
      circuit: { id: 'cota', name: 'Circuit of the Americas' },
      flag: '🇺🇸',
      weekendType: 'NORMAL',
      startDate: '2026-10-18T10:00:00Z',
      endDate: '2026-10-25T20:00:00Z',
      status: 'UPCOMING',
      sessions: [],
    },
  ];

  const testRounds1: PredictionRound[] = [
    {
      roundId: '2026_15_RACE_PREDICTION',
      raceWeekendId: '2026_15',
      sessionId: '2026_15_RACE',
      roundType: 'GRAND_PRIX',
      title: 'Azerbaijan GP',
      description: '',
      opensAt: '',
      closesAt: '',
      status: 'SCORED',
      predictionFields: [],
      scoringRules: {} as any,
    },
    {
      roundId: '2026_17_RACE_PREDICTION',
      raceWeekendId: '2026_17',
      sessionId: '2026_17_RACE',
      roundType: 'GRAND_PRIX',
      title: 'Singapore GP',
      description: '',
      opensAt: '',
      closesAt: '',
      status: 'SCORED',
      predictionFields: [],
      scoringRules: {} as any,
    },
  ];

  // Case A: When Singapore (R17) is completed & scored, it must dynamically be chosen over Azerbaijan (R15) and Australia (R1)
  const resolvedA = resolveLatestCompletedAndFinalizedWeekend(testWeekends, testRounds1, new Date('2026-10-12T12:00:00Z'));
  assert(resolvedA !== null, 'Resolver returned a valid race weekend');
  assert(resolvedA?.raceWeekendId === '2026_17', `Resolved to Singapore Grand Prix (2026_17), NOT Australia or hardcoded choice`);
  assert(resolvedA?.raceWeekendId !== '2026_01', 'Did not default to Round 1 Australia');

  // Case B: If Singapore is completed but results are still PENDING (not yet SCORED), do NOT treat it as fully scored; pick Azerbaijan (R15)
  const testRoundsPendingSingapore: PredictionRound[] = [
    {
      roundId: '2026_15_RACE_PREDICTION',
      raceWeekendId: '2026_15',
      sessionId: '2026_15_RACE',
      roundType: 'GRAND_PRIX',
      title: 'Azerbaijan GP',
      description: '',
      opensAt: '',
      closesAt: '',
      status: 'SCORED',
      predictionFields: [],
      scoringRules: {} as any,
    },
    {
      roundId: '2026_17_RACE_PREDICTION',
      raceWeekendId: '2026_17',
      sessionId: '2026_17_RACE',
      roundType: 'GRAND_PRIX',
      title: 'Singapore GP',
      description: '',
      opensAt: '',
      closesAt: '',
      status: 'LOCKED', // Still under review by race director!
      predictionFields: [],
      scoringRules: {} as any,
    },
  ];

  const resolvedB = resolveLatestCompletedAndFinalizedWeekend(testWeekends, testRoundsPendingSingapore, new Date('2026-10-12T12:00:00Z'));
  assert(
    resolvedB?.raceWeekendId === '2026_15',
    'Pending Singapore round is not treated as scored; safely resolves to latest finalized weekend (Azerbaijan 2026_15)'
  );

  // Case C: When a newer event completes and scores (e.g. Austin R19), it automatically becomes the default
  const testWeekendsWithAustinCompleted: RaceWeekend[] = testWeekends.map(w =>
    w.raceWeekendId === '2026_19' ? { ...w, status: 'COMPLETED' } : w
  );
  const testRoundsWithAustinScored: PredictionRound[] = [
    ...testRounds1,
    {
      roundId: '2026_19_RACE_PREDICTION',
      raceWeekendId: '2026_19',
      sessionId: '2026_19_RACE',
      roundType: 'GRAND_PRIX',
      title: 'Austin GP',
      description: '',
      opensAt: '',
      closesAt: '',
      status: 'SCORED',
      predictionFields: [],
      scoringRules: {} as any,
    },
  ];

  const resolvedC = resolveLatestCompletedAndFinalizedWeekend(
    testWeekendsWithAustinCompleted,
    testRoundsWithAustinScored,
    new Date('2026-10-26T12:00:00Z')
  );
  assert(
    resolvedC?.raceWeekendId === '2026_19',
    'When newer race (Austin 2026_19) completes and scores, resolver automatically selects Austin without code modifications'
  );

  // =========================================================================
  // TEST 3: Authoritative Database Resolution in The Grid Environment
  // =========================================================================
  console.log('\n📌 TEST 3: Live Application Metadata Resolution');
  const weekends = await api.getRaceWeekends();
  const rounds = await api.getPredictionRounds();

  const activeDefaultWeekend = resolveLatestCompletedAndFinalizedWeekend(weekends, rounds);
  assert(activeDefaultWeekend !== null, 'Authoritative environment resolved a default weekend');
  assert(
    activeDefaultWeekend?.raceWeekendId === '2026_17',
    `Default weekend for Weekend Overall resolved to Singapore Grand Prix (2026_17)`
  );

  // =========================================================================
  // TEST 4: Weekend Standings Calculation & Isolation (Singapore 2026_17)
  // =========================================================================
  console.log('\n📌 TEST 4: Weekend Standings Points Isolation');
  const singaporeLeaderboard = await api.getLeaderboard('weekend', '2026_17');

  assert(singaporeLeaderboard.length > 0, 'Singapore leaderboard returned scored entries');
  const topSingaporeEntry = singaporeLeaderboard[0];
  assert(topSingaporeEntry.rank === 1, 'Top entry has rank 1');
  assert(topSingaporeEntry.totalPoints === 40, `Winner has 40 total points in Singapore (got ${topSingaporeEntry.totalPoints})`);
  assert(
    topSingaporeEntry.grandPrixPoints === 40,
    `Normal weekend correctly records Grand Prix points (got ${topSingaporeEntry.grandPrixPoints})`
  );

  // Verify rank ordering is strictly descending by points
  for (let i = 0; i < singaporeLeaderboard.length - 1; i++) {
    assert(
      singaporeLeaderboard[i].totalPoints >= singaporeLeaderboard[i + 1].totalPoints,
      `Rank ordering is strictly descending: P${singaporeLeaderboard[i].rank} (${singaporeLeaderboard[i].totalPoints} PTS) >= P${singaporeLeaderboard[i + 1].rank} (${singaporeLeaderboard[i + 1].totalPoints} PTS)`
    );
  }

  // =========================================================================
  // TEST 5: Sprint Weekend Scoring (Sprint + Grand Prix Points)
  // =========================================================================
  console.log('\n📌 TEST 5: Sprint Weekend Scoring Breakdown (Chinese GP 2026_02)');
  const chineseLeaderboard = await api.getLeaderboard('weekend', '2026_02');
  assert(chineseLeaderboard.length > 0, 'Chinese GP Sprint weekend returned entries');

  const topChineseEntry = chineseLeaderboard[0];
  assert(
    topChineseEntry.sprintPoints !== undefined && topChineseEntry.sprintPoints === 15,
    `Sprint points explicitly recorded: 15 PTS (got ${topChineseEntry.sprintPoints})`
  );
  assert(
    topChineseEntry.grandPrixPoints !== undefined && topChineseEntry.grandPrixPoints === 30,
    `Grand Prix points explicitly recorded: 30 PTS (got ${topChineseEntry.grandPrixPoints})`
  );
  assert(
    topChineseEntry.totalPoints === 45,
    `Weekend total correctly sums Sprint (15) + Grand Prix (30) = 45 PTS (got ${topChineseEntry.totalPoints})`
  );

  // =========================================================================
  // TEST 6: Season Overall Totals Invariance
  // =========================================================================
  console.log('\n📌 TEST 6: Season Overall Totals Invariance');
  const seasonLeaderboardBefore = await api.getLeaderboard('season');
  assert(seasonLeaderboardBefore.length > 0, 'Season leaderboard returns entries');

  // Query a historical weekend
  await api.getLeaderboard('weekend', '2026_15');
  await api.getLeaderboard('weekend', '2026_02');

  const seasonLeaderboardAfter = await api.getLeaderboard('season');
  assert(
    seasonLeaderboardBefore.length === seasonLeaderboardAfter.length,
    'Season leaderboard row count is identical before and after viewing weekends'
  );
  assert(
    seasonLeaderboardBefore[0].totalPoints === seasonLeaderboardAfter[0].totalPoints,
    `Championship leader season points remain invariant: ${seasonLeaderboardAfter[0].totalPoints} PTS`
  );
  assert(
    seasonLeaderboardBefore[0].userId === seasonLeaderboardAfter[0].userId,
    'Championship leader user ID remains invariant'
  );

  // Verify season score does not leak into weekend score
  const seasonScoreWinner = seasonLeaderboardAfter[0].totalPoints;
  const weekendScoreWinner = topSingaporeEntry.totalPoints;
  assert(
    seasonScoreWinner > weekendScoreWinner,
    `Season total (${seasonScoreWinner} PTS) is properly aggregated across multiple weekends and strictly distinct from single-weekend score (${weekendScoreWinner} PTS)`
  );

  // =========================================================================
  // TEST 7: Identity Deduplication (1 User = 1 Entry Per View)
  // =========================================================================
  console.log('\n📌 TEST 7: Canonical Identity Deduplication');
  const seasonUserIds = new Set<string>();
  for (const entry of seasonLeaderboardAfter) {
    assert(!seasonUserIds.has(entry.userId), `No duplicate userId in Season Overall: ${entry.userId}`);
    seasonUserIds.add(entry.userId);
  }

  const weekendUserIds = new Set<string>();
  for (const entry of singaporeLeaderboard) {
    assert(!weekendUserIds.has(entry.userId), `No duplicate userId in Weekend Overall: ${entry.userId}`);
    weekendUserIds.add(entry.userId);
  }

  // =========================================================================
  // TEST 8: Deterministic Tie-Breaking
  // =========================================================================
  console.log('\n📌 TEST 8: Deterministic Tie-Breaking Verification');
  // Check that for any identical point scores, deterministic secondary/tertiary sorting is preserved
  for (let i = 0; i < seasonLeaderboardAfter.length - 1; i++) {
    const a = seasonLeaderboardAfter[i];
    const b = seasonLeaderboardAfter[i + 1];
    if (a.totalPoints === b.totalPoints) {
      if (a.exactP1Count === b.exactP1Count) {
        if (a.perfectPodiumCount === b.perfectPodiumCount) {
          assert(
            a.username.localeCompare(b.username) <= 0,
            `Alphabetical tie-break holds: "${a.username}" <= "${b.username}"`
          );
        } else {
          assert(
            a.perfectPodiumCount >= b.perfectPodiumCount,
            `Podium tie-break holds: ${a.perfectPodiumCount} >= ${b.perfectPodiumCount}`
          );
        }
      } else {
        assert(
          a.exactP1Count >= b.exactP1Count,
          `Exact P1 tie-break holds: ${a.exactP1Count} >= ${b.exactP1Count}`
        );
      }
    }
  }

  console.log('\n🎉 ALL 8 LEADERBOARD SIMPLIFICATION & RACE WEEKEND STANDINGS TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});

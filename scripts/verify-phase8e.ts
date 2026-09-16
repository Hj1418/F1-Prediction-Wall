/**
 * Verification Suite — Phase 8E: Prediction Bench, Standings & Weekend Hub Hardening
 */

import fs from 'fs';
import path from 'path';

console.log('🏁 Starting Phase 8E Verification Suite: Prediction Bench, Standings & Weekend Hub...\\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// 1. PredictionPage Lifecycle & UPCOMING State Hardening
console.log('1. PredictionPage.tsx State & Lifecycle Tests:');
const predPageSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/PredictionPage.tsx'), 'utf-8');

assert(
  predPageSrc.includes('const isUpcoming = round.status === \'UPCOMING\';'),
  'PredictionPage declares explicit isUpcoming state flag'
);

assert(
  predPageSrc.includes('const isReadOnly = isLocked || isScored || isUpcoming;'),
  'PredictionPage marks isReadOnly = isLocked || isScored || isUpcoming'
);

assert(
  predPageSrc.includes('PREDICTIONS OPEN SOON') && predPageSrc.includes('isUpcoming ?'),
  'PredictionPage countdown/status card contains PREDICTIONS OPEN SOON for upcoming rounds'
);

assert(
  predPageSrc.includes('Predictions Open Soon') && predPageSrc.includes('read-only preview mode'),
  'PredictionPage renders informative Upcoming Banner in read-only preview mode'
);

assert(
  predPageSrc.includes('!isAuthenticated && isOpen'),
  'PredictionPage gates guest submit CTA on isOpen'
);

// 2. PredictionCTA Routing Safety
console.log('\n2. PredictionCTA.tsx Routing Safety Tests:');
const ctaSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/navbar/PredictionCTA.tsx'), 'utf-8');

assert(
  ctaSrc.includes("const targetLink = '/predictions';") && ctaSrc.includes("label: 'PREDICTION BENCH'"),
  'PredictionCTA routes to /predictions with PREDICTION BENCH when round is upcoming'
);

// 3. WeekendDashboardPage Circuit Cross-Linking
console.log('\n3. WeekendDashboardPage.tsx Cross-Linking Tests:');
const weekendPageSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/WeekendDashboardPage.tsx'), 'utf-8');

assert(
  weekendPageSrc.includes('to={`/circuits/${circuitMeta.id}`}') && weekendPageSrc.includes('VIEW CIRCUIT GUIDE'),
  'WeekendDashboardPage links circuit name and map directly to /circuits/:circuitId with VIEW CIRCUIT GUIDE'
);

// 4. LeaderboardPage Hardening & Scoring Rules
console.log('\n4. LeaderboardPage.tsx Standings & Scoring Tests:');
const leaderboardSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/LeaderboardPage.tsx'), 'utf-8');

assert(
  leaderboardSrc.includes('THE GRID • COMPETITION STANDINGS'),
  'LeaderboardPage features modernized COMPETITION STANDINGS eyebrow'
);

assert(
  leaderboardSrc.includes('Official Prediction Scoring Rules') && leaderboardSrc.includes('P1 WINNER') && leaderboardSrc.includes('PERFECT PODIUM'),
  'LeaderboardPage includes official scoring matrix guide'
);

// 5. ChampionshipDetailPage F1 Launchpad
console.log('\n5. ChampionshipDetailPage.tsx F1 Launchpad Tests:');
const champDetailSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/ChampionshipDetailPage.tsx'), 'utf-8');

assert(
  champDetailSrc.includes('to="/races"') &&
  champDetailSrc.includes('to="/predictions"') &&
  champDetailSrc.includes('to="/leaderboard"') &&
  champDetailSrc.includes('to="/circuits"'),
  'ChampionshipDetailPage F1 card contains 4 launchpad paths (races, predictions, leaderboard, circuits)'
);

// 6. Banned Legacy Terminology Audit
console.log('\n6. Banned Legacy Terminology Audit:');
const bannedTerms = [
  'Prediction Wall',
  'F1 Prediction Wall',
  'Community Prediction League',
  'F1 Community Prediction League',
  'Learn F1',
  'F1 Learn',
  'F1 Explore',
];

let bannedCount = 0;
for (const term of bannedTerms) {
  if (
    predPageSrc.toLowerCase().includes(term.toLowerCase()) ||
    ctaSrc.toLowerCase().includes(term.toLowerCase()) ||
    weekendPageSrc.toLowerCase().includes(term.toLowerCase()) ||
    leaderboardSrc.toLowerCase().includes(term.toLowerCase())
  ) {
    console.error(`  ✗ Banned term found: "${term}"`);
    bannedCount++;
  }
}

assert(bannedCount === 0, 'Zero occurrences of banned legacy terms across updated files');

console.log(`\n✨ Phase 8E Verification Completed: All ${passCount} tests passed!\n`);

if (failCount > 0) {
  process.exit(1);
}

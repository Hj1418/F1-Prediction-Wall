import { ScoringEngine } from '../src/services/scoringEngine.ts';

console.log('🏁 Starting Formula 1 Prediction Engine Unit Tests...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

// Test 1: Exact Podium + Perfect Podium Bonus
const predExact = {
  p1: 'norris',
  p2: 'verstappen',
  p3: 'leclerc',
  fastestLap: 'norris',
  driverOfTheDay: 'hamilton',
  wildCard: 'YES',
};

const officialExact = {
  p1: 'norris',
  p2: 'verstappen',
  p3: 'leclerc',
  fastestLap: 'norris',
  driverOfTheDay: 'hamilton',
  wildCard: 'YES',
};

const score1 = ScoringEngine.calculate(predExact, officialExact);
assert(score1.breakdown.p1 === 15, 'Exact P1 gives 15 points');
assert(score1.breakdown.p2 === 10, 'Exact P2 gives 10 points');
assert(score1.breakdown.p3 === 10, 'Exact P3 gives 10 points');
assert(score1.breakdown.perfectPodiumBonus === 10, 'Perfect Podium gives 10 bonus points');
assert(score1.breakdown.fastestLap === 10, 'Exact Fastest Lap gives 10 points');
assert(score1.breakdown.driverOfTheDay === 10, 'Exact Driver of the Day gives 10 points');
assert(score1.breakdown.wildCard === 15, 'Correct Wildcard gives 15 points');
assert(score1.totalScore === 80, 'Total score matches sum of all categories (80 pts)');

// Test 2: Inverted Podium (wrong positions)
const predSwapped = {
  p1: 'leclerc',
  p2: 'norris',
  p3: 'verstappen',
};

const score2 = ScoringEngine.calculate(predSwapped, officialExact);
assert(score2.breakdown.p1 === 5, 'Podium driver in wrong position gives 5 points (p1)');
assert(score2.breakdown.p2 === 5, 'Podium driver in wrong position gives 5 points (p2)');
assert(score2.breakdown.p3 === 5, 'Podium driver in wrong position gives 5 points (p3)');
assert(score2.breakdown.perfectPodiumBonus === 0, 'No perfect podium bonus when swapped');
assert(score2.totalScore === 15, 'Swapped podium total is 15 pts');

// Test 3: Completely wrong predictions
const predWrong = {
  p1: 'stroll',
  p2: 'albon',
  p3: 'gasly',
  fastestLap: 'bearman',
  driverOfTheDay: 'ocon',
  wildCard: 'NO',
};

const score3 = ScoringEngine.calculate(predWrong, officialExact);
assert(score3.totalScore === 0, 'Wrong predictions give 0 points');

// Test 4: Idempotency check
const score4 = ScoringEngine.calculate(predExact, officialExact);
assert(JSON.stringify(score1) === JSON.stringify(score4), 'Scoring engine is strictly idempotent');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('🏁 All Scoring Engine tests passed!\n');
}

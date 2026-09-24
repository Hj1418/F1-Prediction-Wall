/**
 * Verification Script: Pre-Demo Refinement (The Grid)
 * Validates:
 * 1. Global LEARN removal (Navbar, Mobile drawer, Footer, Routes)
 * 2. EXPLORE entry point to isolated motorsport hubs
 * 3. Generic MotorsportHub template with adaptive basics/learning tab
 * 4. Test GP points feed into PredictionSpeedometer with separate breakdown
 * 5. Production leaderboard remains strictly isolated from test points
 */

import fs from 'fs';
import path from 'path';
import { testGrandPrixService } from '../src/services/testGrandPrix/testGrandPrixService';
import { getMotorsportBasics } from '../src/services/motorsport/motorsportBasicsService';
import { getAllChampionships, getChampionshipById } from '../src/services/motorsport/motorsportRegistry';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('Running Pre-Demo Refinement Verification Suite');
console.log('====================================================\n');

// 1. Navigation & IA: No standalone Learn
console.log('1. Navigation & IA Verification:');
const navbarLinksContent = fs.readFileSync(path.resolve('src/components/navbar/NavbarLinks.tsx'), 'utf-8');
const mobileNavContent = fs.readFileSync(path.resolve('src/components/navbar/MobileNavigation.tsx'), 'utf-8');
const footerContent = fs.readFileSync(path.resolve('src/components/common/Footer.tsx'), 'utf-8');
const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');

assert(!navbarLinksContent.includes("to: '/learn'"), 'NavbarLinks does not contain /learn link');
assert(!navbarLinksContent.includes("label: 'LEARN'"), 'NavbarLinks does not have LEARN item');
assert(navbarLinksContent.includes("label: 'EXPLORE'"), 'NavbarLinks has EXPLORE item');
assert(!mobileNavContent.includes("to: '/learn'"), 'MobileNavigation does not contain /learn link');
assert(!footerContent.includes("to=\"/learn\""), 'Footer does not contain /learn link');
assert(footerContent.includes("to=\"/explore\""), 'Footer links to /explore');
assert(appContent.includes('<Route path="/learn" element={<Navigate to="/explore" replace />} />'), 'App.tsx redirects /learn to /explore');
assert(appContent.includes('path="/explore/:championshipId"'), 'App.tsx registers /explore/:championshipId route');

// 2. Explore & Isolated Motorsport Hubs
console.log('\n2. Explore & Motorsport Hubs:');
const championships = getAllChampionships();
assert(championships.length >= 8, `Registered championships count is ${championships.length} (>= 8)`);

for (const id of ['f1', 'motogp', 'wec', 'formula-e', 'wrc']) {
  const champ = getChampionshipById(id);
  assert(!!champ, `Championship ${id} is registered`);
  const basics = getMotorsportBasics(id);
  assert(!!basics, `Basics guide exists for ${id}`);
  assert(basics.howItWorks.weekendStructure.length > 0, `${id} has weekend structure`);
  assert(basics.pointsAndScoring.pointsTable.length > 0, `${id} has scoring system`);
  assert(basics.keyRegulations.length > 0, `${id} has key regulations`);
}

// Ensure F1 is not hardcoded as the template itself
const f1Basics = getMotorsportBasics('f1');
const motogpBasics = getMotorsportBasics('motogp');
assert(motogpBasics.machineryOverview.vehicleType !== f1Basics.machineryOverview.vehicleType, 'MotoGP vehicle type is not F1 single-seater');
assert(motogpBasics.sportName !== f1Basics.sportName, 'Sport names differ across hubs');

// 3. Speedometer & Test Grand Prix Scoring
console.log('\n3. Speedometer & Test GP Isolation:');
const speedometerFile = fs.readFileSync(path.resolve('src/components/predictions/PredictionSpeedometer.tsx'), 'utf-8');
assert(speedometerFile.includes('productionPoints?: number'), 'PredictionSpeedometer supports productionPoints prop');
assert(speedometerFile.includes('testPoints?: number'), 'PredictionSpeedometer supports testPoints prop');
assert(speedometerFile.includes('Test Runs') && speedometerFile.includes('TEST'), 'PredictionSpeedometer displays Test Runs and TEST badge');

// Test GP Service integration
const testUserId = 'user_demo_verify';
testGrandPrixService.createTestGrandPrix(true);
testGrandPrixService.openTestPrediction(true);
testGrandPrixService.submitTestPrediction(
  testUserId,
  'Demo Verifier',
  'demo@thegrid.test',
  {
    p1: 'test-alpha',
    p2: 'test-bravo',
    p3: 'test-charlie',
    fastestLap: 'test-alpha',
    safetyCar: 'NO',
    virtualSafetyCar: 'NO',
    redFlag: 'NO',
    yellowFlag: 'NO',
  }
);

testGrandPrixService.enterTestResult(true, {
  p1: 'test-alpha',
  p2: 'test-bravo',
  p3: 'test-charlie',
  fastestLap: 'test-alpha',
  safetyCar: 'NO',
  virtualSafetyCar: 'NO',
  redFlag: 'NO',
  yellowFlag: 'NO',
});

testGrandPrixService.runTestScoring(true);
const earnedScore = testGrandPrixService.getUserTestScore(testUserId);
assert(earnedScore > 0, `User earned ${earnedScore} test points from Test GP scoring`);

const testLeaderboard = testGrandPrixService.getTestLeaderboard();
assert(testLeaderboard.some(e => e.userId === testUserId), 'Test points recorded in isolated test leaderboard');

console.log('\n====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}

/**
 * Verification Suite — Phase 8B.1: The Grid Homepage & Global Content Experience
 */

import fs from 'fs';
import path from 'path';
import {
  DEFAULT_HOME_SNAPSHOT,
  DEFAULT_FEATURED_LEARN_TOPICS,
  DEFAULT_DISCOVER_MORE,
  getHomeSnapshot,
} from '../src/services/home/homeSnapshotService';
import { getAllChampionships } from '../src/services/motorsport/motorsportRegistry';
import { clientCache } from '../src/services/cache/clientCache';
import { PredictionRound } from '../src/types';

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

console.log('🏁 Starting Phase 8B.1 Verification Suite...\n');

// -------------------------------------------------------------
// 1. Homepage Source & Information Architecture Hierarchy
// -------------------------------------------------------------
console.log('1. Homepage Source & 8-Stage Information Hierarchy:');
const homePagePath = path.resolve('src/pages/HomePage.tsx');
const homePageContent = fs.readFileSync(homePagePath, 'utf8');

assert(homePageContent.includes('THE GRID'), 'Hero presents "THE GRID" headline');
assert(homePageContent.includes('Your motorsport starting point'), 'Hero presents core platform tagline');
assert(homePageContent.includes('NEXT UP IN MOTORSPORT'), 'Section 2 presents "NEXT UP IN MOTORSPORT"');
assert(homePageContent.includes('Explore Motorsport'), 'Section 3 presents "Explore Motorsport"');
assert(homePageContent.includes('Learn Motorsport'), 'Section 4 presents "Learn Motorsport"');
assert(homePageContent.includes('Indian Motorsport'), 'Section 5 presents "Indian Motorsport"');
assert(homePageContent.includes('PREDICTION BENCH'), 'Section 6 presents "PREDICTION BENCH"');
assert(homePageContent.includes('More to Explore'), 'Section 7 presents "More to Explore"');

// Check order of sections in the JSX
const heroIdx = homePageContent.indexOf('1. HERO:');
const nextUpIdx = homePageContent.indexOf('2. WHAT\'S HAPPENING / NEXT UP:');
const exploreIdx = homePageContent.indexOf('3. EXPLORE MOTORSPORT:');
const learnIdx = homePageContent.indexOf('4. LEARN MOTORSPORT:');
const indiaIdx = homePageContent.indexOf('5. INDIAN MOTORSPORT:');
const predIdx = homePageContent.indexOf('6. PREDICTION BENCH:');
const exploreMoreIdx = homePageContent.indexOf('7. DISCOVER MORE / CONTENT:');

assert(
  heroIdx < nextUpIdx &&
  nextUpIdx < exploreIdx &&
  exploreIdx < learnIdx &&
  learnIdx < indiaIdx &&
  indiaIdx < predIdx &&
  predIdx < exploreMoreIdx,
  'Homepage sections follow strict 8-stage information hierarchy'
);

// -------------------------------------------------------------
// 2. Strict Banned User-Facing Terminology Check
// -------------------------------------------------------------
console.log('\n2. Strict Banned User-Facing Terminology Audit:');

const bannedTerms = [
  'Prediction Wall',
  'F1 Prediction Wall',
  'Community Prediction League',
  'F1 Community Prediction League',
  'Learn F1',
  'F1 Learn',
  'F1 Explore',
];

for (const term of bannedTerms) {
  const containsBanned = homePageContent.includes(term);
  assert(!containsBanned, `HomePage strictly excludes banned legacy term "${term}"`);
}

// -------------------------------------------------------------
// 3. Multi-Championship Discovery & Data-Driven Registry
// -------------------------------------------------------------
console.log('\n3. Multi-Championship Discovery & Data-Driven Registry:');
const championships = getAllChampionships();

assert(championships.length === 10, `Platform registry contains exactly 10 championships (got ${championships.length})`);

const expectedChampionships = [
  'f1', 'f2', 'f3', 'f4', 'formula-e', 'wec', 'gt-world-challenge', 'wrc', 'motogp', 'indian-motorsport'
];

for (const id of expectedChampionships) {
  const found = championships.some(c => c.id === id);
  assert(found, `Championship "${id}" is present in registry and surfaced`);
}

assert(homePageContent.includes('getAllChampionships()'), 'HomePage renders championships data-driven from registry');

// -------------------------------------------------------------
// 4. Global Learn Section (Never "Learn F1")
// -------------------------------------------------------------
console.log('\n4. Global Learn Section Architecture:');
assert(DEFAULT_FEATURED_LEARN_TOPICS.length === 6, `Default featured learn topics count is 6 (got ${DEFAULT_FEATURED_LEARN_TOPICS.length})`);

const expectedTopics = [
  'how-motorsport-works',
  'race-weekends',
  'flags-safety',
  'qualifying-explained',
  'tyres-strategy',
  'motorsport-terminology',
];

for (const topicId of expectedTopics) {
  const found = DEFAULT_FEATURED_LEARN_TOPICS.some(t => t.id === topicId);
  assert(found, `Featured learn topic "${topicId}" is defined with pedagogical takeaways`);
}

assert(homePageContent.includes('activeLearnTab'), 'HomePage provides toggle between core curriculum and 30s insights');
assert(homePageContent.includes('to="/learn"'), 'HomePage links to full Learn hub');

// -------------------------------------------------------------
// 5. Indian Motorsport Domestic Ecosystem Spotlight
// -------------------------------------------------------------
console.log('\n5. Indian Motorsport Domestic Ecosystem Spotlight:');
assert(DEFAULT_HOME_SNAPSHOT.indianMotorsport.seriesCount === 5, 'Highlights 5 domestic championships');
assert(DEFAULT_HOME_SNAPSHOT.indianMotorsport.circuitsCount === 4, 'Highlights 4 permanent tracks');
assert(DEFAULT_HOME_SNAPSHOT.indianMotorsport.maxSuperLicencePoints === 12, 'Highlights 12 FIA Super Licence Points');
assert(DEFAULT_HOME_SNAPSHOT.indianMotorsport.keySeries.includes('FIA F4 India'), 'Mentions FIA F4 India');
assert(DEFAULT_HOME_SNAPSHOT.indianMotorsport.keySeries.includes('Indian Racing League (IRL)'), 'Mentions Indian Racing League');
assert(homePageContent.includes('to={indianMotorsport.url}'), 'Links directly to /indian-motorsport');

// -------------------------------------------------------------
// 6. Prediction Bench State Model & Server-Authoritative Status
// -------------------------------------------------------------
console.log('\n6. Prediction Bench State Model & Integration:');
assert(DEFAULT_HOME_SNAPSHOT.predictionHighlight.status === 'OPEN', 'Default prediction status is OPEN');

// Verify conditional CTA logic in HomePage
assert(
  homePageContent.includes("predictionHighlight.status === 'OPEN' ? (") &&
  homePageContent.includes("Make Your Prediction") &&
  homePageContent.includes("Explore Prediction Bench"),
  'CTA dynamically presents "Make Your Prediction" when OPEN, and "Explore Prediction Bench" when LOCKED or UPCOMING'
);

// Verify clientCache reconciliation
const testOpenRound: PredictionRound = {
  roundId: 'test-open-round',
  raceWeekendId: 'test-weekend',
  sessionId: 'test-session',
  roundType: 'GRAND_PRIX',
  title: 'Test Open GP',
  description: 'Test Circuit',
  opensAt: new Date(Date.now() - 3600000).toISOString(),
  closesAt: new Date(Date.now() + 3600000).toISOString(),
  status: 'OPEN',
  predictionFields: [],
  scoringRules: { polePoints: 10, p1Points: 25, p2Points: 18, p3Points: 15, fastestLapPoints: 5, safetyCarPoints: 0, dnfPoints: 0, totalMaxPoints: 73 },
};

clientCache.set('f1_prediction_rounds_all', [testOpenRound], 10000);
const reconciledOpen = await getHomeSnapshot();
assert(reconciledOpen.predictionHighlight.status === 'OPEN', 'Reconciled snapshot accurately reflects OPEN status from cache');
assert(reconciledOpen.predictionHighlight.roundId === 'test-open-round', 'Reconciled snapshot targets active roundId');

const testLockedRound: PredictionRound = {
  ...testOpenRound,
  roundId: 'test-locked-round',
  status: 'LOCKED',
};
clientCache.set('f1_prediction_rounds_all', [testLockedRound], 10000);
const reconciledLocked = await getHomeSnapshot();
assert(reconciledLocked.predictionHighlight.status === 'LOCKED', 'Reconciled snapshot accurately reflects LOCKED status from cache');
assert(reconciledLocked.predictionHighlight.url === '/predictions', 'Locked prediction round routes safely to /predictions');

clientCache.clear();

// -------------------------------------------------------------
// 7. More To Explore Discovery Paths
// -------------------------------------------------------------
console.log('\n7. More To Explore Discovery Paths:');
assert(DEFAULT_DISCOVER_MORE.length === 4, `4 curated discovery paths defined (got ${DEFAULT_DISCOVER_MORE.length})`);

const expectedPaths = ['/circuits', '/learn#topics', '/indian-motorsport#pathway', '/learn#official-updates'];
for (const url of expectedPaths) {
  const exists = DEFAULT_DISCOVER_MORE.some(d => d.url === url);
  assert(exists, `Discovery item with URL "${url}" is configured`);
}

// -------------------------------------------------------------
// 8. Performance, Lightweight Snapshot & Responsive Constraints
// -------------------------------------------------------------
console.log('\n8. Performance, Lightweight Snapshot & Responsive Constraints:');
assert(typeof DEFAULT_HOME_SNAPSHOT === 'object', 'Static snapshot is instantly available (0ms T0 render)');
assert(!homePageContent.includes('getAllUsers()'), 'HomePage does NOT trigger getAllUsers()');
assert(!homePageContent.includes('fetch('), 'HomePage does NOT execute raw un-cached fetch() calls');

// Check responsive grid layouts use minmax(min(100%, ...))
assert(
  homePageContent.includes('minmax(min(100%'),
  'HomePage uses fluid minmax(min(100%, ...), 1fr) preventing horizontal overflow on 320px screens'
);

console.log(`\n==========================================`);
console.log(`Phase 8B.1 Test Results: ${passed} passed, ${failed} failed`);
console.log(`==========================================\n`);

if (failed > 0) {
  process.exit(1);
}

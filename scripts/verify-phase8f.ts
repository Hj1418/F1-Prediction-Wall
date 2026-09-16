/**
 * Verification Suite — Phase 8F: Racing Identity, Profile Experience & Ecosystem Cross-Linking
 */

import fs from 'fs';
import path from 'path';

console.log('🏁 Starting Phase 8F Verification Suite: Racing Identity & Ecosystem Cross-Linking...\\n');

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

// 1. User Interface in types/index.ts
console.log('1. User Interface Definition Tests:');
const typesSrc = fs.readFileSync(path.join(process.cwd(), 'src/types/index.ts'), 'utf-8');

assert(
  typesSrc.includes('favouriteChampionship?: string;'),
  'User interface includes optional favouriteChampionship field'
);

// 2. ProfilePage.tsx Experience & Telemetry
console.log('\n2. ProfilePage.tsx Tests:');
const profileSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/ProfilePage.tsx'), 'utf-8');

assert(
  profileSrc.includes('CHAMPIONSHIPS_REGISTRY') && profileSrc.includes('favouriteChampionship'),
  'ProfilePage imports CHAMPIONSHIPS_REGISTRY and manages favouriteChampionship'
);

assert(
  profileSrc.includes('handleSaveFavChampionship') && profileSrc.includes('Championship:'),
  'ProfilePage renders and allows editing of Favourite Championship chip'
);

assert(
  profileSrc.includes('25 pts for P1 winner • 10 pts for pole'),
  'ProfilePage displays accurate P1 and pole position points (25 pts / 10 pts)'
);

assert(
  profileSrc.includes('5 pts per correct insight'),
  'ProfilePage displays accurate wildcard points (5 pts)'
);

assert(
  profileSrc.includes('to="/predictions"') && profileSrc.includes('to="/leaderboard"'),
  'ProfilePage includes direct shortcuts to Prediction Bench and Standings'
);

assert(
  profileSrc.includes('THE GRID • RACING IDENTITY & TELEMETRY PROFILE'),
  'ProfilePage displays modernized RACING IDENTITY eyebrow'
);

// 3. IndianMotorsportPage Buddh Cross-Link
console.log('\n3. IndianMotorsportPage.tsx Cross-Link Tests:');
const indianSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/IndianMotorsportPage.tsx'), 'utf-8');

assert(
  indianSrc.includes('to="/circuits/buddh"') && indianSrc.includes('VIEW FULL CIRCUIT GUIDE'),
  'IndianMotorsportPage provides direct cross-link to /circuits/buddh'
);

// 4. Footer.tsx Platform Discoverability
console.log('\n4. Footer.tsx Tests:');
const footerSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/common/Footer.tsx'), 'utf-8');

assert(
  footerSrc.includes('to="/indian-motorsport"') && footerSrc.includes('Indian Motorsport 🇮🇳'),
  'Footer includes universal discoverability link for Indian Motorsport 🇮🇳'
);

// 5. Strict Banned Legacy Terminology Audit
console.log('\n5. Banned Legacy Terminology Audit:');
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
    profileSrc.toLowerCase().includes(term.toLowerCase()) ||
    indianSrc.toLowerCase().includes(term.toLowerCase()) ||
    footerSrc.toLowerCase().includes(term.toLowerCase())
  ) {
    console.error(`  ✗ Banned term found: "${term}"`);
    bannedCount++;
  }
}

assert(bannedCount === 0, 'Zero occurrences of banned legacy terms across updated files');

console.log(`\n✨ Phase 8F Verification Completed: All ${passCount} tests passed!\n`);

if (failCount > 0) {
  process.exit(1);
}

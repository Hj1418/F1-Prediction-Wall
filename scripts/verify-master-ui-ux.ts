/**
 * verify-master-ui-ux.ts
 * Comprehensive verification suite for THE GRID — Master UI/UX, Product & Navigation Refinement.
 */

import fs from 'node:fs';
import path from 'node:path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

const rootDir = process.cwd();

console.log('\n🏁 Starting THE GRID Master UI/UX, Product & Navigation Verification Suite...\n');

// 1. Navigation Verification
console.log('📌 Test 1: Verifying Global Navigation Structure...');
const navbarLinksContent = fs.readFileSync(path.join(rootDir, 'src/components/navbar/NavbarLinks.tsx'), 'utf-8');
const navbarContent = fs.readFileSync(path.join(rootDir, 'src/components/navbar/Navbar.tsx'), 'utf-8');

assert(navbarLinksContent.includes("path: '/'") && navbarLinksContent.includes("label: 'HOME'"), "Navbar contains 'HOME'");
assert(navbarLinksContent.includes("path: '/explore'") && navbarLinksContent.includes("label: 'EXPLORE'"), "Navbar contains 'EXPLORE'");
assert(navbarLinksContent.includes("path: '/predictions'") && navbarLinksContent.includes("label: 'PREDICTIONS'"), "Navbar contains 'PREDICTIONS'");
assert(navbarLinksContent.includes("path: '/leaderboard'") && navbarLinksContent.includes("label: 'LEADERBOARD'"), "Navbar contains 'LEADERBOARD'");

// Verify RACES and SEARCH are removed from primary navigation
assert(!navbarLinksContent.includes("path: '/races'"), "Primary NAV_ITEMS does NOT contain '/races'");
assert(!navbarLinksContent.includes("label: 'RACES'"), "Primary NAV_ITEMS does NOT contain 'RACES'");
assert(!navbarContent.includes("navbar-search-btn"), "Navbar does not render search as a primary navbar button");
assert(navbarLinksContent.includes('<ExploreMegaMenu'), "NavbarLinks mounts ExploreMegaMenu for desktop hover/flyout");

// 2. Explore Mega-Menu Verification
console.log('\n📌 Test 2: Verifying Explore Mega-Menu Structure & Disciplines...');
const megaMenuContent = fs.readFileSync(path.join(rootDir, 'src/components/navbar/ExploreMegaMenu.tsx'), 'utf-8');

assert(megaMenuContent.includes('FORMULA RACING'), "Mega-menu contains 'FORMULA RACING' section");
assert(megaMenuContent.includes('MOTORCYCLE RACING'), "Mega-menu contains 'MOTORCYCLE RACING' section");
assert(megaMenuContent.includes('ENDURANCE / GT'), "Mega-menu contains 'ENDURANCE / GT' section");
assert(megaMenuContent.includes('OTHER DISCIPLINES'), "Mega-menu contains 'OTHER DISCIPLINES' section");

// Quick links to hubs
assert(megaMenuContent.includes("path: '/explore/f1'"), "Mega-menu links directly to Formula 1 Hub");
assert(megaMenuContent.includes("path: '/explore/motogp'"), "Mega-menu links directly to MotoGP Hub");
assert(megaMenuContent.includes("path: '/explore/wec'"), "Mega-menu links directly to WEC Hub");
assert(megaMenuContent.includes("path: '/explore/formula-e'"), "Mega-menu links directly to Formula E Hub");
assert(megaMenuContent.includes("path: '/indian-motorsport'") || megaMenuContent.includes("path: '/explore/indian-motorsport'"), "Mega-menu links directly to Indian Motorsport Hub");
assert(megaMenuContent.includes("to=\"/explore\""), "Mega-menu provides gateway link to full Explore page ('VIEW ALL MOTORSPORTS')");

// Accessibility
assert(megaMenuContent.includes("aria-label=\"Explore Motorsport Hubs\""), "Mega-menu provides semantic ARIA attributes");
assert(navbarLinksContent.includes("handleKeyDown") && navbarLinksContent.includes("Escape"), "Navigation handles keyboard events (e.g., Escape to close mega-menu)");

// 3. Mobile Navigation Verification
console.log('\n📌 Test 3: Verifying Mobile Navigation (No Hover Dependency)...');
const mobileNavContent = fs.readFileSync(path.join(rootDir, 'src/components/navbar/MobileNavigation.tsx'), 'utf-8');

assert(mobileNavContent.includes('exploreExpanded') && mobileNavContent.includes('setExploreExpanded'), "Mobile nav provides tap-to-expand state for Explore");
assert(mobileNavContent.includes('/explore/f1') && mobileNavContent.includes('/explore/motogp'), "Mobile nav provides direct links to hubs without hover");
assert(!mobileNavContent.includes("label: 'Races'") && !mobileNavContent.includes("label: 'RACES'"), "Mobile nav does NOT contain primary 'Races' link");

// 4. Home Page Refinement Verification
console.log('\n📌 Test 4: Verifying Home Page Refinement...');
const homePageContent = fs.readFileSync(path.join(rootDir, 'src/pages/HomePage.tsx'), 'utf-8');

// Ensure the 6-card catalogue grid and Explore Gateway are strictly removed from Home
assert(!homePageContent.includes("const previewChampionships = allChampionships.slice(0, 6)"), "Home page removed the 6-card catalogue grid");
assert(!homePageContent.includes("Explore All {getAllChampionships().length} Championships"), "Home page strictly excludes Explore Championships Gateway CTA");
assert(!homePageContent.includes("Motorsport discovery lives in"), "Home page strictly excludes Explore Gateway promotional block");
assert(homePageContent.includes("Prediction Open") || homePageContent.includes("PREDICTION OPEN"), "Home page elevates 'Prediction Open' state");
assert(homePageContent.includes("Prediction Locked") || homePageContent.includes("PREDICTION LOCKED"), "Home page elevates 'Prediction Locked' state");
assert(homePageContent.includes("PredictionSpeedometer"), "Home page retains Prediction Points Speedometer");

// 5. Motorsport Hub Architecture Consistency
console.log('\n📌 Test 5: Verifying Motorsport Hub Architecture (9 Pillars)...');
const hubContent = fs.readFileSync(path.join(rootDir, 'src/pages/ChampionshipDetailPage.tsx'), 'utf-8');

const expectedPillars = [
  { id: 'overview', label: 'Overview' },
  { id: 'season', label: 'Current Season' },
  { id: 'basics', label: 'How It Works' },
  { id: 'drivers', label: 'Drivers' }, // or Riders/Crews dynamically
  { id: 'teams', label: 'Teams' },
  { id: 'series', label: 'Championships & Series' },
  { id: 'circuits', label: 'Circuits' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'rules', label: 'Rules & Regulations' },
];

expectedPillars.forEach(pillar => {
  assert(hubContent.includes(`id: '${pillar.id}'`), `Motorsport Hub defines Pillar '${pillar.id}' (${pillar.label})`);
});

// Terminology adaptation
assert(hubContent.includes("competitorPlural = competitorLabel === 'Rider' ? 'Riders'"), "Motorsport Hub dynamically adapts competitor labels (Drivers/Riders/Crews)");
assert(hubContent.includes("teamsLabel = data.id === 'wrc' ? 'Manufacturers'"), "Motorsport Hub dynamically adapts team labels (Teams/Constructors/Manufacturers)");

// 6. Prediction Engine Invariants
console.log('\n📌 Test 6: Verifying Prediction Fields & Scoring Integrity...');
const predictionContent = fs.readFileSync(path.join(rootDir, 'src/pages/PredictionPage.tsx'), 'utf-8');
const scoringContent = fs.readFileSync(path.join(rootDir, 'backend/Code.gs'), 'utf-8');

assert(predictionContent.includes('p1') && predictionContent.includes('p2') && predictionContent.includes('p3'), "Predictions contain P1, P2, P3");
assert(predictionContent.includes('fastestLap'), "Predictions contain Fastest Lap");
assert(predictionContent.includes('driverOfTheDay'), "Predictions contain Driver/Rider of the Day");
assert(predictionContent.includes('safetyCar'), "Predictions contain Safety Car");
assert(predictionContent.includes('virtualSafetyCar'), "Predictions contain Virtual Safety Car (VSC preserved)");
assert(predictionContent.includes('redFlag'), "Predictions contain Red Flag");
assert(predictionContent.includes('yellowFlag'), "Predictions contain Yellow Flag");

assert(scoringContent.includes('perfectPodiumBonus') || scoringContent.includes('safetyCar'), "Authoritative scoring engine intact");

// 7. Typography & Design Tokens
console.log('\n📌 Test 7: Verifying Typography & System Theme Tokens...');
const indexCssContent = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf-8');

assert(indexCssContent.includes('-apple-system') && indexCssContent.includes('BlinkMacSystemFont'), "index.css defines modern system font stack");
assert(indexCssContent.includes('ui-monospace') && indexCssContent.includes('SFMono-Regular'), "index.css defines monospace stack for technical metadata");
assert(indexCssContent.includes('--f1-red: #e10600'), "Primary red accent token defined");
assert(indexCssContent.includes('--bg-base: #080a0f'), "Dark graphite base background token defined");

console.log('\n=================================================================');
console.log('🎉 ALL MASTER UI/UX & PRODUCT REFINEMENT VERIFICATIONS PASSED!');
console.log('=================================================================\n');

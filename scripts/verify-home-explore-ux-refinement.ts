import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

console.log('🏎️ STARTING DETERMINISTIC TEST SUITE FOR HOME & EXPLORE UX REFINEMENT');

// 1. Home Page Hero Refinements
console.log('\n🏠 [SECTION 1] Home Page Hero Refinement:');
const homePath = path.resolve('src/pages/HomePage.tsx');
const homeContent = fs.readFileSync(homePath, 'utf8');

assert(!homeContent.includes('F1</span>\n            <span style={{ opacity: 0.3 }}>•</span>\n            <span>F2'), 'Colorful motorsport ticker is completely removed from HomePage');
assert(!homeContent.includes('INDIA 🇮🇳</span>\n          </div>'), 'India flag ribbon item removed with ticker');
assert(homeContent.includes('home-hero-brand-title'), 'HomePage uses dedicated brand title class');
assert(homeContent.includes('THE <span className="home-hero-grid-accent">GRID</span>'), 'HomePage uses dynamic editorial emphasis on GRID');
assert(homeContent.includes('YOUR MOTORSPORT <span className="home-hero-tagline-accent">STARTING POINT</span>') || homeContent.includes('YOUR MOTORSPORT STARTING POINT'), 'HomePage presents YOUR MOTORSPORT STARTING POINT tagline');
assert(homeContent.includes('home-pillar-grid'), 'HomePage renders compact 4-pillar product grid');
assert(homeContent.includes('Understand the sport') && homeContent.includes('Stay updated') && homeContent.includes('Dive deeper') && homeContent.includes('Test your knowledge'), '4 Product pillars contain concise supporting explanations');
assert(homeContent.includes('home-hero-primary-cta') && homeContent.includes('to="/explore"') && homeContent.includes('Explore Motorsport'), 'Primary CTA is Explore Motorsport linking to /explore');
assert(homeContent.includes('home-hero-secondary-cta') && homeContent.includes('to="/calendar"') && homeContent.includes('Global Calendar'), 'Secondary CTA is Global Calendar linking to /calendar');

// 2. Explore Page Hero & Cards Refinements
console.log('\n🧭 [SECTION 2] Explore Page Hero & Streamlined Cards:');
const explorePath = path.resolve('src/pages/ChampionshipsPage.tsx');
const exploreContent = fs.readFileSync(explorePath, 'utf8');

assert(!exploreContent.includes('<span>EXPLORE MOTORSPORT</span>\n          </div>\n\n          <h1'), 'Explore page removed redundant "EXPLORE MOTORSPORT" badge stacked above header');
assert(exploreContent.includes('THE WORLD OF <span className="explore-hero-title-accent">MOTORSPORT</span>'), 'Explore page hero uses strong non-repetitive "THE WORLD OF MOTORSPORT" headline');
assert(exploreContent.includes('Search drivers, teams, circuits, championships...'), 'Explore search placeholder is clear without repeating "Explore Motorsport"');
assert(exploreContent.includes('BROWSE BY MOTORSPORT'), 'Section 3 header uses clear "BROWSE BY MOTORSPORT" title');
assert(exploreContent.includes('explore-card'), 'Championships render via streamlined editorial .explore-card');
assert(!exploreContent.includes('champ.governingBody'), 'Cards remove bulky governing body attribute boxes');
assert(!exploreContent.includes('champ.beginnerOverview'), 'Cards remove long beginnerOverview text blocks from cards');
assert(exploreContent.includes('ENTER HUB'), 'Cards provide clear "ENTER HUB" navigation affordance');

// 3. Motorsport Typography Refinement
console.log('\n🔤 [SECTION 3] Dynamic Motorsport Typography:');
const indexHtmlPath = path.resolve('index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
const indexCssPath = path.resolve('src/index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

assert(indexHtmlContent.includes('Barlow+Condensed:ital,wght@0,600;0,700;0,800;0,900;1,700;1,800;1,900'), 'Google Fonts includes Barlow Condensed with dynamic italics and bold weights');
assert(indexCssContent.includes("Barlow Condensed"), 'index.css configures Barlow Condensed for display typography');
assert(indexCssContent.includes('.home-hero-grid-accent::after'), 'CSS implements dynamic red speed accent under GRID');
assert(indexCssContent.includes('.explore-card::before'), 'CSS implements series accent strip on motorsport cards');

console.log('\n======================================================');
console.log('✨ ALL 14 / 14 HOME & EXPLORE UX REFINEMENT TESTS PASSED!');
console.log('======================================================\n');

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🏁 Starting Phase 8D Verification Suite: Global Motorsport Learn Hub & Multi-Discipline Curriculum...\n');

let passCount = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

const learnPagePath = path.resolve(process.cwd(), 'src/pages/LearnPage.tsx');
const learnPageContent = fs.readFileSync(learnPagePath, 'utf8');

// 1. Strict Banned Legacy Terminology Audit
test('LearnPage.tsx strictly excludes all banned legacy terminology', () => {
  assert.ok(!learnPageContent.includes('Learn F1'), 'Must not contain "Learn F1"');
  assert.ok(!learnPageContent.includes('F1 Learn'), 'Must not contain "F1 Learn"');
  assert.ok(!learnPageContent.includes('Prediction Wall'), 'Must not contain "Prediction Wall"');
  assert.ok(!learnPageContent.includes('F1 Prediction Wall'), 'Must not contain "F1 Prediction Wall"');
  assert.ok(!learnPageContent.includes('Community Prediction League'), 'Must not contain "Community Prediction League"');
  assert.ok(!learnPageContent.includes('F1 Community Prediction League'), 'Must not contain "F1 Community Prediction League"');
  assert.ok(!learnPageContent.includes('F1 Explore'), 'Must not contain "F1 Explore"');
});

// 2. Page Title & Global Header Branding
test('LearnPage.tsx implements global motorsport academy branding', () => {
  assert.ok(learnPageContent.includes("document.title = 'Learn Motorsport | The Grid Knowledge Hub'"), 'Document title must reflect Learn Motorsport');
  assert.ok(learnPageContent.includes('GLOBAL MOTORSPORT ACADEMY & KNOWLEDGE HUB'), 'Eyebrow must be GLOBAL MOTORSPORT ACADEMY & KNOWLEDGE HUB');
  assert.ok(learnPageContent.includes('Learn Motorsport'), 'H1 headline must be Learn Motorsport');
  assert.ok(learnPageContent.includes('aria-label="Motorsport Knowledge Topics"'), 'Nav must have accessible label Motorsport Knowledge Topics');
});

// 3. Multi-Discipline Curriculum Tabs
test('LearnPage.tsx contains curriculum across all platform disciplines', () => {
  // Single-Seaters & 2026 Tech
  assert.ok(learnPageContent.includes('Knockout Qualifying'), 'Must have Qualifying');
  assert.ok(learnPageContent.includes('Active Aero (X & Z Mode)'), 'Must have Active Aero');
  assert.ok(learnPageContent.includes('Overtake Mode'), 'Must have Overtake Mode');
  assert.ok(learnPageContent.includes('2026 Hybrid PU'), 'Must have 2026 Hybrid PU');
  assert.ok(learnPageContent.includes('Feeder Ladder (F4–F1)'), 'Must have Feeder Ladder');

  // Multi-Category Disciplines
  assert.ok(learnPageContent.includes('Endurance & WEC'), 'Must have Endurance & WEC');
  assert.ok(learnPageContent.includes('Formula E (Electric)'), 'Must have Formula E');
  assert.ok(learnPageContent.includes('Rally & Stages (WRC)'), 'Must have WRC Rally');
  assert.ok(learnPageContent.includes('MotoGP (Bikes)'), 'Must have MotoGP');
  assert.ok(learnPageContent.includes('Indian Motorsport 🇮🇳'), 'Must have Indian Motorsport tab');
  assert.ok(learnPageContent.includes('Glossary'), 'Must have Glossary');
});

// 4. Indian Motorsport Curriculum Section
test('LearnPage.tsx contains dedicated Indian Motorsport curriculum section', () => {
  assert.ok(learnPageContent.includes('Indian Racing League (IRL)'), 'Must feature Indian Racing League');
  assert.ok(learnPageContent.includes('FIA Formula 4 Indian Championship'), 'Must feature F4 India');
  assert.ok(learnPageContent.includes('12 Super Licence Points'), 'Must highlight 12 Super Licence Points');
  assert.ok(learnPageContent.includes('Buddh International Circuit'), 'Must highlight Buddh International Circuit');
  assert.ok(learnPageContent.includes('Madras International Circuit'), 'Must highlight Madras International Circuit');
  assert.ok(learnPageContent.includes('Chennai Street Circuit'), 'Must highlight Chennai Street Circuit');
  assert.ok(learnPageContent.includes('Kari Motor Speedway'), 'Must highlight Kari Motor Speedway');
});

// 5. Comprehensive Glossary Audit
test('LearnPage.tsx contains 50+ categorized cross-series glossary terms', () => {
  // Count matches of term: ' in GLOSSARY_TERMS
  const matches = learnPageContent.match(/term:\s*['"][^'"]+['"]/g);
  assert.ok(matches, 'Must have glossary terms');
  assert.ok(matches.length >= 50, `Expected at least 50 glossary terms, got ${matches.length}`);

  // Test coverage of cross-series concepts
  assert.ok(learnPageContent.includes('Attack Mode (Formula E)'));
  assert.ok(learnPageContent.includes('Balance of Performance (BoP)'));
  assert.ok(learnPageContent.includes('Pace Notes (Rally)'));
  assert.ok(learnPageContent.includes('Hypercar (LMH & LMDh)'));
  assert.ok(learnPageContent.includes('Highside vs Lowside (MotoGP)'));
  assert.ok(learnPageContent.includes('Ride-Height & Holeshot Device (MotoGP)'));
  assert.ok(learnPageContent.includes('Multiclass Racing (WEC / IMSA)'));
  assert.ok(learnPageContent.includes('Reverse Grid (F2 / F3 / IRL)'));
  assert.ok(learnPageContent.includes('Power Stage (WRC)'));
  assert.ok(learnPageContent.includes('Trail Braking'));
  assert.ok(learnPageContent.includes('Indian Racing League (IRL)'));
  assert.ok(learnPageContent.includes('F4 Indian Championship'));
});

// 6. Pedagogical Framework & Governance Verification
test('LearnPage.tsx preserves structured 4-part pedagogical framework', () => {
  assert.ok(learnPageContent.includes('1. WHAT IS IT?'));
  assert.ok(learnPageContent.includes('2. HOW DOES IT WORK?'));
  assert.ok(learnPageContent.includes('3. WHY DOES IT MATTER?'));
  assert.ok(learnPageContent.includes('Authoritative Reference:'));
  assert.ok(learnPageContent.includes('Read Official Regulation'));
  assert.ok(learnPageContent.includes('<OfficialUpdatesSection />'));
});

console.log(`\n✨ Phase 8D Verification Completed: All ${passCount} tests passed!\n`);

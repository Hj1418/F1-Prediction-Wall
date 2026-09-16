import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  F1_CIRCUITS_REGISTRY,
  MOTORSPORT_CIRCUITS_REGISTRY,
  CIRCUIT_SOURCE_MAPPING,
  CROSS_CHAMPIONSHIP_VENUES,
  normalizeCircuitId,
} from '../src/services/circuits/circuitRegistry';

console.log('🏁 Starting Phase 8B.2 Verification Suite: Global Circuits Directory, Cross-Series Venues & Search Hardening...\n');

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

// 1. Buddh International Circuit Registry
test('Buddh International Circuit exists in F1_CIRCUITS_REGISTRY', () => {
  const buddh = F1_CIRCUITS_REGISTRY['buddh'];
  assert.ok(buddh, 'Buddh circuit must exist in registry');
  assert.strictEqual(buddh.id, 'buddh');
  assert.strictEqual(buddh.name, 'Buddh International Circuit');
  assert.strictEqual(buddh.country, 'India');
  assert.strictEqual(buddh.lengthKm, 5.125);
  assert.strictEqual(buddh.turns, 16);
  assert.strictEqual(buddh.lapRecord.time, '1:27.249');
  assert.strictEqual(buddh.lapRecord.driver, 'Sebastian Vettel');
  assert.ok(typeof buddh.map === 'string' && buddh.map.includes('buddh.svg'));
  assert.ok(buddh.facts.some(f => (f.title + ' ' + f.description).includes('MotoGP')));
  assert.ok(buddh.facts.some(f => (f.title + ' ' + f.description).includes('F4')));
});

test('MOTORSPORT_CIRCUITS_REGISTRY is aliased to F1_CIRCUITS_REGISTRY and contains buddh', () => {
  assert.strictEqual(MOTORSPORT_CIRCUITS_REGISTRY, F1_CIRCUITS_REGISTRY);
  assert.ok(MOTORSPORT_CIRCUITS_REGISTRY['buddh']);
});

test('CIRCUIT_SOURCE_MAPPING includes buddh pointing to circuits/buddh.svg', () => {
  assert.strictEqual(CIRCUIT_SOURCE_MAPPING['buddh'].assetFile, 'buddh.svg');
});

test('normalizeCircuitId correctly maps buddh and greater_noida variants', () => {
  assert.strictEqual(normalizeCircuitId('buddh'), 'buddh');
  assert.strictEqual(normalizeCircuitId('buddh_international_circuit'), 'buddh');
  assert.strictEqual(normalizeCircuitId('greater_noida'), 'buddh');
  assert.strictEqual(normalizeCircuitId('noida'), 'buddh');
  assert.strictEqual(normalizeCircuitId('buddh international circuit'), 'buddh');
});

// 2. Cross-Championship Venues
test('CROSS_CHAMPIONSHIP_VENUES contains multi-series hostings for Buddh', () => {
  const buddhVenues = CROSS_CHAMPIONSHIP_VENUES['buddh'];
  assert.ok(buddhVenues && buddhVenues.length >= 3, 'Buddh must have at least 3 hosting series');
  const seriesNames = buddhVenues.map(v => v.championshipName);
  assert.ok(seriesNames.some(s => s.includes('MotoGP')));
  assert.ok(seriesNames.some(s => s.includes('Indian Motorsport')));
  assert.ok(seriesNames.some(s => s.includes('Formula 1')));
});

test('CROSS_CHAMPIONSHIP_VENUES includes Spa-Francorchamps with F1 and WEC', () => {
  const spaVenues = CROSS_CHAMPIONSHIP_VENUES['spa'];
  assert.ok(spaVenues && spaVenues.length >= 2, 'Spa must host multiple series');
  const seriesNames = spaVenues.map(v => v.championshipName);
  assert.ok(seriesNames.includes('Formula 1'));
  assert.ok(seriesNames.includes('FIA WEC'));
});

test('CROSS_CHAMPIONSHIP_VENUES includes Silverstone, Monaco, Losail, and COTA', () => {
  assert.ok(CROSS_CHAMPIONSHIP_VENUES['silverstone']);
  assert.ok(CROSS_CHAMPIONSHIP_VENUES['monaco']);
  assert.ok(CROSS_CHAMPIONSHIP_VENUES['losail']);
  assert.ok(CROSS_CHAMPIONSHIP_VENUES['cota']);
  assert.ok(CROSS_CHAMPIONSHIP_VENUES['barcelona']);
});

// 3. Buddh SVG Vector Asset
test('public/circuits/buddh.svg exists and is valid SVG vector data', () => {
  const svgPath = path.resolve(process.cwd(), 'public/circuits/buddh.svg');
  assert.ok(fs.existsSync(svgPath), 'buddh.svg must exist in public/circuits/');
  const content = fs.readFileSync(svgPath, 'utf8');
  assert.ok(content.includes('<svg'), 'buddh.svg must have <svg> tag');
  assert.ok(content.includes('<path'), 'buddh.svg must have track path definition');
  assert.ok(content.includes('viewBox='), 'buddh.svg must have viewBox');
  assert.ok(content.length > 500, 'buddh.svg should have substantial vector track data');
});

// 4. CircuitsPage.tsx verification
test('CircuitsPage.tsx uses global motorsport directory terminology and discipline filters', () => {
  const pagePath = path.resolve(process.cwd(), 'src/pages/CircuitsPage.tsx');
  const code = fs.readFileSync(pagePath, 'utf8');

  // Directory terminology
  assert.ok(code.includes('GLOBAL MOTORSPORT CIRCUITS DIRECTORY'));
  assert.ok(code.includes('Motorsport Circuits Directory'));
  assert.ok(code.includes('iconic racing venues'));

  // Discipline filter pills
  assert.ok(code.includes('All Disciplines'));
  assert.ok(code.includes('Formula 1'));
  assert.ok(code.includes('MotoGP™'));
  assert.ok(code.includes('FIA WEC'));
  assert.ok(code.includes('GT World Challenge'));
  assert.ok(code.includes('Formula E'));
  assert.ok(code.includes('Indian Motorsport 🇮🇳'));

  // Cross-series hostings rendering
  assert.ok(code.includes('crossHostings'));
  assert.ok(code.includes('GLOBAL MOTORSPORT HOSTING'));

  // No banned legacy terms
  assert.ok(!code.includes('Prediction Wall'), 'No banned Prediction Wall in CircuitsPage');
  assert.ok(!code.includes('F1 Prediction Wall'), 'No banned F1 Prediction Wall in CircuitsPage');
  assert.ok(!code.includes('F1 Explore'), 'No banned F1 Explore in CircuitsPage');
});

// 5. UniversalSearchModal.tsx verification
test('UniversalSearchModal.tsx contains suggested multi-series search query pills', () => {
  const modalPath = path.resolve(process.cwd(), 'src/components/search/UniversalSearchModal.tsx');
  const code = fs.readFileSync(modalPath, 'utf8');

  assert.ok(code.includes('SUGGESTED:'));
  assert.ok(code.includes('Buddh'));
  assert.ok(code.includes('Spa'));
  assert.ok(code.includes('Bagnaia'));
  assert.ok(code.includes('Attack Mode'));
  assert.ok(code.includes('Active Aero'));
  assert.ok(code.includes('F4 India'));

  // Zero banned legacy terms
  assert.ok(!code.includes('Prediction Wall'), 'No banned Prediction Wall in UniversalSearchModal');
  assert.ok(!code.includes('F1 Prediction Wall'), 'No banned F1 Prediction Wall in UniversalSearchModal');
  assert.ok(!code.includes('Learn F1'), 'No banned Learn F1 in UniversalSearchModal');
  assert.ok(!code.includes('F1 Learn'), 'No banned F1 Learn in UniversalSearchModal');
});

console.log(`\n✨ Phase 8B.2 Verification Completed: All ${passCount} tests passed!\n`);

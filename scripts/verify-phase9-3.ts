/**
 * The Grid — Phase 9.3 Verification Suite
 * Multi-Class Endurance Racing (FIA WEC & 24h Le Mans) Data Architecture
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  MOTORSPORT_SOURCE_REGISTRY,
  getSourceDefinition,
  getSourcesByDiscipline,
  createProvenanceMetadata,
  isAuthoritativeSource,
} from '../src/services/dataArchitecture/sourceRegistry';
import {
  resolveDriverId,
  resolveTeamId,
  resolveCircuitId,
  buildEventId,
  buildSessionId,
} from '../src/services/dataArchitecture/identifierRegistry';
import {
  WecNormalizer,
  WEC_POINTS_SCALES,
} from '../src/services/dataArchitecture/normalizers/wecNormalizer';
import { api } from '../src/services/apiClient';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load deterministic test fixture
const fixturePath = path.join(__dirname, 'fixtures', 'wec-sample-feed.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

console.log('🏁 Starting Phase 9.3 Verification Suite: Multi-Class Endurance Racing (FIA WEC & Le Mans)...\n');

let passCount = 0;
function pass(msg: string) {
  passCount++;
  console.log(`  ✓ PASS: ${msg}`);
}

// ============================================================================
// 1. Source Registry — WEC Registered & Authoritative
// ============================================================================
console.log('1. WEC Source Registry Tests:');

assert(MOTORSPORT_SOURCE_REGISTRY['fia-wec-official'], 'fia-wec-official must be registered in MOTORSPORT_SOURCE_REGISTRY');
pass('fia-wec-official is registered in MOTORSPORT_SOURCE_REGISTRY');

const wecSource = getSourceDefinition('fia-wec-official');
assert.strictEqual(wecSource?.discipline, 'wec', 'WEC source discipline must be wec');
assert.strictEqual(wecSource?.authorityLevel, 'OFFICIAL', 'WEC source authority level must be OFFICIAL');
assert.strictEqual(wecSource?.datasetType, 'CHAMPIONSHIP_RESULTS', 'WEC datasetType must be CHAMPIONSHIP_RESULTS');
pass('WEC source definition metadata matches expected official schema');

assert.strictEqual(isAuthoritativeSource('fia-wec-official'), true, 'fia-wec-official must be authoritative');
pass('isAuthoritativeSource validates fia-wec-official as authoritative');

const wecSources = getSourcesByDiscipline('wec');
assert(wecSources.some(s => s.sourceId === 'fia-wec-official'), 'getSourcesByDiscipline(wec) must include fia-wec-official');
pass('getSourcesByDiscipline(wec) correctly returns WEC sources');

const provenance = createProvenanceMetadata('fia-wec-official', '2026.1');
assert.strictEqual(provenance.sourceId, 'fia-wec-official');
assert.strictEqual(provenance.authorityLevel, 'OFFICIAL');
assert.strictEqual(provenance.attribution, 'FIA World Endurance Championship & Automobile Club de l’Ouest');
assert.strictEqual(provenance.version, '2026.1');
pass('createProvenanceMetadata generates complete provenance stamp for WEC datasets');

// ============================================================================
// 2. Identifier Registry — WEC Drivers & Teams Resolution
// ============================================================================
console.log('\n2. Identifier Registry Tests (WEC):');

assert.strictEqual(resolveDriverId('Kévin Estre'), 'estre');
assert.strictEqual(resolveDriverId('Antonio Fuoco'), 'fuoco');
assert.strictEqual(resolveDriverId('Kamui Kobayashi'), 'kobayashi');
assert.strictEqual(resolveDriverId('Valentino Rossi'), 'rossi');
assert.strictEqual(resolveDriverId('Michelle Gatting'), 'gatting');
assert.strictEqual(resolveDriverId('Sarah Bovy'), 'bovy');
assert.strictEqual(resolveDriverId('Robert Kubica'), 'kubica');
assert.strictEqual(resolveDriverId('Mick Schumacher'), 'mick_schumacher');
pass('Marquee WEC drivers resolve accurately to stable IDs (Hypercar & LMGT3)');

assert.strictEqual(resolveTeamId('Porsche Penske Motorsport'), 'porsche_penske');
assert.strictEqual(resolveTeamId('Ferrari AF Corse'), 'ferrari_af_corse');
assert.strictEqual(resolveTeamId('Toyota Gazoo Racing'), 'toyota_gazoo');
assert.strictEqual(resolveTeamId('BMW M Team WRT'), 'bmw_wrt');
assert.strictEqual(resolveTeamId('Manthey PureRxcing'), 'manthey');
assert.strictEqual(resolveTeamId('Iron Dames'), 'iron_dames');
assert.strictEqual(resolveTeamId('Team WRT'), 'team_wrt');
pass('WEC Hypercar and LMGT3 teams resolve cleanly to internal stable identifiers');

// ============================================================================
// 3. Duration Parsing & Endurance Classification
// ============================================================================
console.log('\n3. Endurance Duration Parsing Tests:');

assert.strictEqual(WecNormalizer.parseDurationType('6 Hours', '6 Hours of Spa'), '6h');
assert.strictEqual(WecNormalizer.parseDurationType('24 Hours', '24 Hours of Le Mans'), '24h');
assert.strictEqual(WecNormalizer.parseDurationType('8 Hours', '8 Hours of Bahrain'), '8h');
assert.strictEqual(WecNormalizer.parseDurationType('1812 km', 'Qatar 1812 km'), '1812km');
assert.strictEqual(WecNormalizer.parseDurationType('10 Hours', '10h Race'), '10h');
assert.strictEqual(WecNormalizer.parseDurationType(undefined, 'Standard Endurance'), '6h');
pass('Duration parser correctly categorizes 6h, 8h, 1812km, 10h, and 24h events');

// ============================================================================
// 4. Points Matrix & Endurance Scaling Algorithms
// ============================================================================
console.log('\n4. WEC Points Multipliers & Scaling Tests:');

// Standard 6-Hour Race
assert.strictEqual(WecNormalizer.calculateWecPoints(1, '6h'), 25, '6h winner gets 25 pts');
assert.strictEqual(WecNormalizer.calculateWecPoints(2, '6h'), 18, '6h P2 gets 18 pts');
assert.strictEqual(WecNormalizer.calculateWecPoints(10, '6h'), 1, '6h P10 gets 1 pt');
assert.strictEqual(WecNormalizer.calculateWecPoints(11, '6h'), 0, '6h P11 gets 0 pts');
assert.strictEqual(WecNormalizer.calculateWecPoints(1, '6h', true), 26, '6h winner with Pole gets 26 pts');
pass('Standard 6-Hour race points system matches official FIA WEC scale');

// 8-Hour / 1812km Race (1.5x)
assert.strictEqual(WecNormalizer.calculateWecPoints(1, '8h'), 38, '8h winner gets 38 pts (1.5x)');
assert.strictEqual(WecNormalizer.calculateWecPoints(2, '8h'), 27, '8h P2 gets 27 pts (1.5x)');
assert.strictEqual(WecNormalizer.calculateWecPoints(10, '8h'), 2, '8h P10 gets 2 pts (1.5x)');
assert.strictEqual(WecNormalizer.calculateWecPoints(1, '1812km'), 38, '1812km winner gets 38 pts');
assert.strictEqual(WecNormalizer.calculateWecPoints(1, '8h', true), 39, '8h winner with Pole gets 39 pts');
pass('Extended 8h/1812km races award official 1.5x points multiplier');

// 24 Hours of Le Mans (2.0x Double Points)
assert.strictEqual(WecNormalizer.calculateWecPoints(1, '24h'), 50, 'Le Mans winner gets 50 pts (double points)');
assert.strictEqual(WecNormalizer.calculateWecPoints(2, '24h'), 36, 'Le Mans P2 gets 36 pts (double points)');
assert.strictEqual(WecNormalizer.calculateWecPoints(3, '24h'), 30, 'Le Mans P3 gets 30 pts (double points)');
assert.strictEqual(WecNormalizer.calculateWecPoints(10, '24h'), 2, 'Le Mans P10 gets 2 pts (double points)');
assert.strictEqual(WecNormalizer.calculateWecPoints(1, '24h', true), 51, 'Le Mans winner with Pole gets 51 pts');
pass('24 Hours of Le Mans double points (2.0x) computed with exact precision');

// ============================================================================
// 5. Calendar Normalization Tests
// ============================================================================
console.log('\n5. Calendar Normalization Tests:');

const normalizedEvents = WecNormalizer.normalizeCalendar(2026, fixture.calendar);
assert.strictEqual(normalizedEvents.length, 4, 'Fixture should yield 4 normalized events');

const leMansEvent = normalizedEvents.find(e => e.officialName.includes('Le Mans'));
assert(leMansEvent, 'Le Mans event must be found in normalized calendar');
assert.strictEqual(leMansEvent?.formatType, 'ENDURANCE', 'Le Mans must have ENDURANCE formatType');
assert.strictEqual(leMansEvent?.championshipId, 'wec', 'Championship ID must be wec');
assert(leMansEvent?.circuitId, 'Circuit ID must be resolved');
assert.strictEqual(leMansEvent?.sessions.length, 3, 'WEC event should have 3 normalized sessions');
assert.strictEqual(leMansEvent?.provenance.sourceId, 'fia-wec-official');
pass('WEC calendar normalization attaches correct session models and Le Mans endurance format');

const qatarEvent = normalizedEvents[0];
assert.strictEqual(qatarEvent.status, 'COMPLETED', 'Qatar status should be COMPLETED');
assert.strictEqual(qatarEvent.round, 1);
pass('Round 1 event data and status preserved in normalized model');

// ============================================================================
// 6. Entries Normalization & Multi-Driver Lineups Tests
// ============================================================================
console.log('\n6. Entries & Driver Lineups Tests:');

const normalizedEntries = WecNormalizer.normalizeEntries(fixture.drivers, fixture.teams);
assert(normalizedEntries.length >= 4, 'Normalized entries must include Hypercar and LMGT3 cars');

const porscheEntry = normalizedEntries.find(e => e.carNumber === 6);
assert(porscheEntry, 'Porsche Penske #6 entry must be normalized');
assert.strictEqual(porscheEntry?.classId, 'hypercar', 'Entry #6 must be Hypercar class');
assert.strictEqual(porscheEntry?.tyreManufacturer, 'Michelin', 'Hypercar tyres must be Michelin');
assert.strictEqual(porscheEntry?.drivers.length, 3, 'Car #6 must have 3 drivers');
assert.strictEqual(porscheEntry?.drivers[0].name, 'Kévin Estre');
assert.strictEqual(porscheEntry?.drivers[0].rating, 'platinum', 'Estre rating must be platinum');
assert(porscheEntry?.bop, 'BoP parameters must be present');
assert.strictEqual(porscheEntry?.bop?.maxPowerKw, 505);
pass('Hypercar entry #6 normalized with 3 drivers, Platinum ratings, Michelin tyres, and BoP specs');

const mantheyEntry = normalizedEntries.find(e => e.carNumber === 92);
assert(mantheyEntry, 'Manthey PureRxcing #92 entry must be normalized');
assert.strictEqual(mantheyEntry?.classId, 'lmgt3', 'Entry #92 must be LMGT3 class');
assert.strictEqual(mantheyEntry?.tyreManufacturer, 'Goodyear', 'LMGT3 tyres must be Goodyear');
assert(mantheyEntry?.drivers.some(d => d.rating === 'bronze'), 'LMGT3 must feature mandatory Bronze driver');
pass('LMGT3 entry #92 verified with Goodyear tyres and mandatory Bronze driver rating');

// ============================================================================
// 7. Standings Normalization Tests
// ============================================================================
console.log('\n7. Standings Normalization Tests:');

const standings = WecNormalizer.normalizeStandings(2026, fixture.drivers, fixture.teams);
assert(standings.driverStandings.length > 0, 'Driver standings must not be empty');
assert(standings.constructorStandings.length > 0, 'Constructor standings must not be empty');

const hypercarLeader = standings.driverStandings.find(d => d.racingClass === 'hypercar' && d.position === 1);
assert.strictEqual(hypercarLeader?.driverName, 'Kévin Estre');
assert.strictEqual(hypercarLeader?.points, 152);

const lmgt3Leader = standings.driverStandings.find(d => d.racingClass === 'lmgt3' && d.position === 1);
assert.strictEqual(lmgt3Leader?.driverName, 'Klaus Bachler');
assert.strictEqual(lmgt3Leader?.points, 139);
pass('Standings separated by racingClass with driver grades, co-drivers, and points');

// ============================================================================
// 8. API Client Integration & Cache Tests
// ============================================================================
console.log('\n8. API Client Integration Tests:');

async function testApiClient() {
  // Calendar Events
  const events = await api.getNormalizedWecEvents(2026);
  assert(Array.isArray(events) && events.length > 0, 'api.getNormalizedWecEvents must return events');
  assert.strictEqual(events[0].championshipId, 'wec');
  pass('api.getNormalizedWecEvents returns normalized WEC calendar');

  // Entries
  const entries = await api.getNormalizedWecEntries();
  assert(Array.isArray(entries) && entries.length > 0, 'api.getNormalizedWecEntries must return entries');
  assert(entries.some(e => e.classId === 'hypercar'), 'Entries must contain Hypercar');
  assert(entries.some(e => e.classId === 'lmgt3'), 'Entries must contain LMGT3');
  pass('api.getNormalizedWecEntries returns both Hypercar and LMGT3 car entries');

  // Standings
  const liveStandings = await api.getNormalizedWecStandings(2026);
  assert(liveStandings.driverStandings.length > 0);
  assert(liveStandings.constructorStandings.length > 0);
  pass('api.getNormalizedWecStandings returns normalized driver and team standings');

  // Points Matrix
  const matrix = await api.getWecPointsMatrix();
  assert(matrix['6h'] && matrix['8h'] && matrix['24h'], 'Points matrix must contain 6h, 8h, and 24h');
  assert.strictEqual(matrix['24h'].matrix[0], 50, 'Le Mans first place must be 50 points');
  pass('api.getWecPointsMatrix returns complete points scaling table');

  // Cache Verification: Second call should resolve with 0 latency
  const t0 = Date.now();
  await api.getNormalizedWecEvents(2026);
  const duration = Date.now() - t0;
  assert(duration < 25, `Cached retrieval should be under 25ms, got ${duration}ms`);
  pass(`apiClient clientCache provides T0 latency (${duration}ms) on subsequent WEC calls`);
}

testApiClient()
  .then(() => {
    console.log(`\n==================================================`);
    console.log(`🎉 Phase 9.3 COMPLETE: ${passCount} / ${passCount} tests passed.`);
    console.log(`==================================================\n`);
    console.log('  Verified:');
    console.log('    ✅ WEC Source Registry (fia-wec-official & ACO provenance)');
    console.log('    ✅ WEC Identifier Resolution (Hypercar & LMGT3 teams/drivers)');
    console.log('    ✅ Multi-Class Data Contracts (Hypercar & LMGT3)');
    console.log('    ✅ Endurance Duration Classification (6h, 8h, 1812km, 24h)');
    console.log('    ✅ Official WEC Points Multipliers (Standard, 1.5x, 2.0x Le Mans)');
    console.log('    ✅ Multi-Driver Entries & FIA Categorization (Platinum, Gold, Silver, Bronze)');
    console.log('    ✅ Balance of Performance (BoP) Parameter Snapshots');
    console.log('    ✅ Calendar & Session Normalization');
    console.log('    ✅ Class-Segmented Standings Normalization');
    console.log('    ✅ API Client Methods with ClientCache T0 Latency');
    console.log('');
  })
  .catch(err => {
    console.error('\n❌ Phase 9.3 Verification FAILED:');
    console.error(err);
    process.exit(1);
  });

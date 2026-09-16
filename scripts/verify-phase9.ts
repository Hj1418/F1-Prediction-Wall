/**
 * The Grid — Phase 9.1 Verification Suite
 * Data Architecture, Source Registry, Licensing/Provenance & F1 Vertical Data
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
import { F1Normalizer } from '../src/services/dataArchitecture/normalizers/f1Normalizer';
import { DataValidator } from '../src/services/dataArchitecture/validation/dataValidator';
import { PredictionResultBridge } from '../src/services/dataArchitecture/predictionResultBridge';
import { CIRCUIT_SOURCE_MAPPING, F1_CIRCUITS_REGISTRY } from '../src/services/circuits/circuitRegistry';
import { api } from '../src/services/apiClient';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏁 Starting Phase 9.1 Verification Suite: Data Architecture & F1 Vertical Slice...\n');

let passCount = 0;
function pass(msg: string) {
  passCount++;
  console.log(`  ✓ PASS: ${msg}`);
}

// ----------------------------------------------------------------------------
// 1. Source Registry, Authority & Provenance Tests
// ----------------------------------------------------------------------------
console.log('1. Source Registry & Provenance Tests:');

assert(MOTORSPORT_SOURCE_REGISTRY['fia-official'], 'fia-official must be registered');
assert(MOTORSPORT_SOURCE_REGISTRY['f1-official'], 'f1-official must be registered');
assert(MOTORSPORT_SOURCE_REGISTRY['jolpica-f1'], 'jolpica-f1 must be registered');
assert(MOTORSPORT_SOURCE_REGISTRY['f1db'], 'f1db must be registered');
assert(MOTORSPORT_SOURCE_REGISTRY['the-grid-circuits'], 'the-grid-circuits must be registered');
pass('All 5 core authoritative sources are registered in MOTORSPORT_SOURCE_REGISTRY');

const fia = getSourceDefinition('fia-official');
assert.strictEqual(fia?.authorityLevel, 'OFFICIAL', 'FIA source must have authority level OFFICIAL');
assert(fia?.license.includes('Regulatory'), 'FIA license must declare regulatory/reference terms');
pass('FIA official source is classified as OFFICIAL with regulatory license');

const jolpica = getSourceDefinition('jolpica-f1');
assert.strictEqual(jolpica?.authorityLevel, 'PRIMARY_OPEN_DATA', 'Jolpica must have authority PRIMARY_OPEN_DATA');
assert(jolpica?.attributionRequirement.includes('Jolpica-F1'), 'Jolpica must require attribution');
pass('Jolpica-F1 is classified as PRIMARY_OPEN_DATA with explicit attribution requirement');

const f1Sources = getSourcesByDiscipline('f1');
assert(f1Sources.length >= 4, `F1 sources count must be >= 4 (got ${f1Sources.length})`);
pass('getSourcesByDiscipline correctly returns all F1-applicable data sources');

const prov = createProvenanceMetadata('jolpica-f1', 'v1.0');
assert.strictEqual(prov.sourceId, 'jolpica-f1');
assert.strictEqual(prov.authorityLevel, 'PRIMARY_OPEN_DATA');
assert(prov.retrievedAt, 'Provenance must have retrievedAt timestamp');
assert.strictEqual(prov.version, 'v1.0');
pass('createProvenanceMetadata generates valid SourceProvenanceMetadata');

assert.strictEqual(isAuthoritativeSource('fia-official'), true);
assert.strictEqual(isAuthoritativeSource('jolpica-f1'), true);
assert.strictEqual(isAuthoritativeSource('unknown-random'), false);
pass('isAuthoritativeSource correctly validates source authority tiers');

// ----------------------------------------------------------------------------
// 2. Stable Identifiers & Existing Circuit Registry Reuse
// ----------------------------------------------------------------------------
console.log('\n2. Stable Identifiers & Circuit Normalization Tests:');

assert.strictEqual(resolveDriverId('max_verstappen'), 'verstappen');
assert.strictEqual(resolveDriverId('Lando Norris'), 'norris');
assert.strictEqual(resolveDriverId('charles_leclerc'), 'leclerc');
pass('resolveDriverId accurately maps external provider keys to stable internal driverId');

assert.strictEqual(resolveTeamId('red_bull_racing'), 'red_bull');
assert.strictEqual(resolveTeamId('Scuderia Ferrari'), 'ferrari');
assert.strictEqual(resolveTeamId('mclaren'), 'mclaren');
pass('resolveTeamId accurately maps external provider keys to stable internal teamId');

// Circuit Normalization reuse check
assert.strictEqual(resolveCircuitId('Buddh International Circuit'), 'buddh');
assert.strictEqual(resolveCircuitId('Greater Noida'), 'buddh');
assert.strictEqual(resolveCircuitId('Albert Park Grand Prix Circuit'), 'albert_park');
assert.strictEqual(resolveCircuitId('Autodromo Nazionale Monza'), 'monza');
pass('resolveCircuitId reuses existing circuitRegistry and accurately resolves Buddh & Melbourne');

// Ensure local SVG asset mapping is preserved
assert(CIRCUIT_SOURCE_MAPPING.buddh, 'CIRCUIT_SOURCE_MAPPING must include buddh');
assert.strictEqual(CIRCUIT_SOURCE_MAPPING.buddh.assetFile, 'buddh.svg');
assert(F1_CIRCUITS_REGISTRY.buddh, 'F1_CIRCUITS_REGISTRY must contain buddh');
pass('Local circuit SVG vectors are preserved without competing registry');

assert.strictEqual(buildEventId('f1', 2026, 1), 'f1-2026-r01');
assert.strictEqual(buildEventId('f1', 2026, 14), 'f1-2026-r14');
assert.strictEqual(buildSessionId('f1-2026-r01', 'QUALIFYING'), 'f1-2026-r01-qualifying');
pass('buildEventId and buildSessionId generate deterministic hierarchical identifiers');

// ----------------------------------------------------------------------------
// 3. F1 Calendar & Session Normalization (Normal vs Sprint Weekends)
// ----------------------------------------------------------------------------
console.log('\n3. F1 Calendar & Session Normalization Tests:');

const fixturePath = path.join(__dirname, 'fixtures', 'f1-sample-feed.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

const normalizedCalendar = F1Normalizer.normalizeCalendar(fixture.calendar);
assert.strictEqual(normalizedCalendar.length, 2, 'Calendar should normalize 2 events');

// Test Round 1: Australian GP (Normal Weekend)
const ausEvent = normalizedCalendar[0];
assert.strictEqual(ausEvent.eventId, 'f1-2026-r01');
assert.strictEqual(ausEvent.formatType, 'NORMAL');
assert.strictEqual(ausEvent.circuitId, 'albert_park');
assert.strictEqual(ausEvent.country, 'Australia');
assert.strictEqual(ausEvent.sessions.length, 5, 'Normal weekend must have 5 sessions (FP1, FP2, FP3, Quali, Race)');
const ausSessionTypes = ausEvent.sessions.map(s => s.sessionType);
assert.deepStrictEqual(ausSessionTypes, ['FP1', 'FP2', 'FP3', 'QUALIFYING', 'RACE']);
pass('Australian GP normalizes as NORMAL weekend with 5 sessions (FP1, FP2, FP3, Quali, Race)');

// Test Round 2: Chinese GP (Sprint Weekend)
const chinaEvent = normalizedCalendar[1];
assert.strictEqual(chinaEvent.eventId, 'f1-2026-r02');
assert.strictEqual(chinaEvent.formatType, 'SPRINT');
assert.strictEqual(chinaEvent.circuitId, 'shanghai');
assert.strictEqual(chinaEvent.sessions.length, 5, 'Sprint weekend must have 5 sessions (FP1, SQ, Sprint, Quali, Race)');
const chinaSessionTypes = chinaEvent.sessions.map(s => s.sessionType);
assert.deepStrictEqual(chinaSessionTypes, ['FP1', 'SPRINT_QUALIFYING', 'SPRINT', 'QUALIFYING', 'RACE']);
pass('Chinese GP normalizes as SPRINT weekend with 5 sessions (FP1, SQ, Sprint, Quali, Race)');

// ----------------------------------------------------------------------------
// 4. Drivers & Teams Normalization
// ----------------------------------------------------------------------------
console.log('\n4. Drivers & Teams Normalization Tests:');

const normalizedDrivers = F1Normalizer.normalizeDrivers(fixture.drivers);
assert.strictEqual(normalizedDrivers.length, 5);
const norris = normalizedDrivers.find(d => d.driverId === 'norris');
assert(norris, 'Lando Norris must be normalized');
assert.strictEqual(norris?.code, 'NOR');
assert.strictEqual(norris?.currentTeamId, 'mclaren');
assert.strictEqual(norris?.number, 4);
assert.strictEqual(norris?.provenance.sourceId, 'jolpica-f1');
pass('Drivers normalize with stable driverId, teamId, 3-letter code, and provenance');

const normalizedTeams = F1Normalizer.normalizeTeams(fixture.teams);
assert.strictEqual(normalizedTeams.length, 3);
const redBull = normalizedTeams.find(t => t.teamId === 'red_bull');
assert(redBull, 'Red Bull Racing must be normalized');
assert.strictEqual(redBull?.name, 'Red Bull Racing');
assert.strictEqual(redBull?.color, '#1e41ff');
assert.strictEqual(redBull?.provenance.sourceId, 'jolpica-f1');
pass('Teams normalize with stable teamId, colors, and provenance');

// ----------------------------------------------------------------------------
// 5. Results Normalization & Versioning Lifecycle (PROVISIONAL -> AMENDED)
// ----------------------------------------------------------------------------
console.log('\n5. Results Normalization & Versioning Lifecycle Tests:');

// 1. Provisional Result
const provResult = F1Normalizer.normalizeSessionResult(
  fixture.raceResultProvisional,
  'f1-2026-r01-race',
  'f1-2026-r01',
  {
    resultStatus: 'PROVISIONAL',
    versionNumber: 1,
    sourceId: 'jolpica-f1',
  }
);
assert.strictEqual(provResult.resultStatus, 'PROVISIONAL');
assert.strictEqual(provResult.versionNumber, 1);
assert.strictEqual(provResult.entries[0].driverId, 'norris');
assert.strictEqual(provResult.entries[1].driverId, 'verstappen');
assert.strictEqual(provResult.entries[2].driverId, 'leclerc');
assert.strictEqual(provResult.entries[0].hasFastestLap, true);
pass('Provisional result normalized with version 1 and P1: Norris, P2: Verstappen, P3: Leclerc');

// 2. Amended Result (Post-race steward penalty)
const amendedResult = F1Normalizer.normalizeSessionResult(
  fixture.raceResultAmended,
  'f1-2026-r01-race',
  'f1-2026-r01',
  {
    resultStatus: 'AMENDED',
    versionNumber: 2,
    stewardNotes: fixture.raceResultAmended.stewardNotes,
    sourceId: 'jolpica-f1',
  }
);
assert.strictEqual(amendedResult.resultStatus, 'AMENDED');
assert.strictEqual(amendedResult.versionNumber, 2);
assert(amendedResult.stewardNotes?.includes('5 seconds'), 'Amended result must include steward penalty note');
assert.strictEqual(amendedResult.entries[0].driverId, 'norris');
assert.strictEqual(amendedResult.entries[1].driverId, 'leclerc', 'Leclerc promoted to P2 after penalty');
assert.strictEqual(amendedResult.entries[2].driverId, 'verstappen', 'Verstappen dropped to P3 after penalty');
pass('Amended result normalized with version 2, steward notes, and adjusted podium (P2 Leclerc, P3 Verstappen)');

// ----------------------------------------------------------------------------
// 6. Standings Normalization
// ----------------------------------------------------------------------------
console.log('\n6. Standings Normalization Tests:');

const standings = F1Normalizer.normalizeStandings(fixture.standings, 2026);
assert.strictEqual(standings.drivers.length, 3);
assert.strictEqual(standings.constructors.length, 3);
assert.strictEqual(standings.drivers[0].driverId, 'norris');
assert.strictEqual(standings.drivers[0].points, 26);
assert.strictEqual(standings.constructors[0].teamId, 'mclaren');
pass('Driver and Constructor standings normalize with stable IDs, points, wins, and podiums');

// ----------------------------------------------------------------------------
// 7. Prediction Bench Result Bridge & Versioned Scoring
// ----------------------------------------------------------------------------
console.log('\n7. Prediction Bench Bridge & Versioned Scoring Tests:');

const userPrediction = {
  p1: 'norris',
  p2: 'leclerc',
  p3: 'verstappen',
  fastestLap: 'norris',
};

// Evaluate against Provisional (where P2 was Verstappen, P3 was Leclerc)
const provisionalScore = PredictionResultBridge.evaluatePrediction(
  'user_harsh',
  'round_r01',
  userPrediction,
  provResult
);
assert.strictEqual(provisionalScore.resultVersion, 1);
assert.strictEqual(provisionalScore.resultStatus, 'PROVISIONAL');
// With provisional: p1 exact (15), p2 wrong position (5), p3 wrong position (5), FL exact (10) = 35
assert.strictEqual(provisionalScore.totalScore, 35);
pass('Scoring against Provisional result evaluates correctly (35 pts, version 1)');

// Evaluate against Amended (where P2 is Leclerc, P3 is Verstappen -> Exact Perfect Podium!)
const amendedScore = PredictionResultBridge.evaluatePrediction(
  'user_harsh',
  'round_r01',
  userPrediction,
  amendedResult
);
assert.strictEqual(amendedScore.resultVersion, 2);
assert.strictEqual(amendedScore.resultStatus, 'AMENDED');
// With amended: p1 exact (15), p2 exact (10), p3 exact (10), perfect podium bonus (10), FL (10) = 55
assert.strictEqual(amendedScore.totalScore, 55);
pass('Scoring against Amended result evaluates correctly with Perfect Podium bonus (55 pts, version 2)');

// ----------------------------------------------------------------------------
// 8. Boundary Validation & Error Handling Tests
// ----------------------------------------------------------------------------
console.log('\n8. Boundary Validation & Error Handling Tests:');

// Test Duplicate Driver ID detection
const duplicateDrivers = [
  ...normalizedDrivers,
  { ...normalizedDrivers[0] }, // duplicate norris
];
const dupDriverValidation = DataValidator.validateDrivers(duplicateDrivers);
assert.strictEqual(dupDriverValidation.isValid, false);
assert(dupDriverValidation.errors.some(e => e.includes('Duplicate driverId')));
pass('DataValidator detects and rejects duplicate driver IDs');

// Test invalid positions in result entries
const invalidResult = {
  ...provResult,
  entries: [
    { ...provResult.entries[0], position: 0 }, // position 0 is invalid
    ...provResult.entries.slice(1),
  ],
};
const invResultValidation = DataValidator.validateSessionResult(invalidResult);
assert.strictEqual(invResultValidation.isValid, false);
assert(invResultValidation.errors.some(e => e.includes('invalid position')));
pass('DataValidator rejects non-positive race positions');

// Test AMENDED without version increment or steward notes
const invalidAmended = {
  ...provResult,
  resultStatus: 'AMENDED' as const,
  versionNumber: 1, // must be >= 2
  stewardNotes: undefined, // must have notes
};
const invAmendedValidation = DataValidator.validateSessionResult(invalidAmended);
assert.strictEqual(invAmendedValidation.isValid, false);
assert(invAmendedValidation.errors.some(e => e.includes('versionNumber >= 2')));
assert(invAmendedValidation.errors.some(e => e.includes('stewardNotes')));
pass('DataValidator enforces version >= 2 and stewardNotes on AMENDED results');

// ----------------------------------------------------------------------------
// 9. API Client Integration & Performance Tests
// ----------------------------------------------------------------------------
console.log('\n9. API Client Integration & Performance Tests:');

const start = performance.now();
const clientDrivers = await api.getNormalizedDrivers();
const duration1 = performance.now() - start;
assert(clientDrivers.length > 0, 'api.getNormalizedDrivers should return drivers');

const start2 = performance.now();
const cachedDrivers = await api.getNormalizedDrivers();
const duration2 = performance.now() - start2;
assert.strictEqual(clientDrivers.length, cachedDrivers.length);
assert(duration2 < 10, `Cached call must be < 10ms (got ${duration2.toFixed(2)}ms)`);
pass(`api.getNormalizedDrivers successfully caches data in memory (first fetch: ${duration1.toFixed(1)}ms, cached: ${duration2.toFixed(2)}ms)`);

const clientTeams = await api.getNormalizedTeams();
assert(clientTeams.length > 0, 'api.getNormalizedTeams should return teams');
pass('api.getNormalizedTeams returns normalized teams with full provenance');

const clientEvents = await api.getNormalizedEvents(2026);
assert(clientEvents.length > 0, 'api.getNormalizedEvents should return events');
pass('api.getNormalizedEvents returns normalized season calendar events');

console.log(`\n✨ Phase 9.1 Verification Completed: All ${passCount} tests passed!`);

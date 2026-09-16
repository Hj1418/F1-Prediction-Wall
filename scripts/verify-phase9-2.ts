/**
 * The Grid — Phase 9.2 Verification Suite
 * Feeder Series (FIA F2 & F3) Data Ingestion, Reverse-Grid Algorithms,
 * Junior Academy Ladder, Super Licence Points & API Integration
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
  JUNIOR_ACADEMIES_REGISTRY,
} from '../src/services/dataArchitecture/identifierRegistry';
import {
  FeederNormalizer,
  FEEDER_RULES,
  SUPER_LICENCE_POINTS_TABLE,
} from '../src/services/dataArchitecture/normalizers/feederNormalizer';
import { api } from '../src/services/apiClient';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load deterministic test fixture
const fixturePath = path.join(__dirname, 'fixtures', 'feeder-sample-feed.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

console.log('🏁 Starting Phase 9.2 Verification Suite: Feeder Series & Junior Academy Ladder...\n');

let passCount = 0;
function pass(msg: string) {
  passCount++;
  console.log(`  ✓ PASS: ${msg}`);
}

// ============================================================================
// 1. Source Registry — Feeder Sources Registered
// ============================================================================
console.log('1. Feeder Source Registry Tests:');

assert(MOTORSPORT_SOURCE_REGISTRY['fia-f2-official'], 'fia-f2-official must be registered');
assert(MOTORSPORT_SOURCE_REGISTRY['fia-f3-official'], 'fia-f3-official must be registered');
assert(MOTORSPORT_SOURCE_REGISTRY['f1-junior-academies'], 'f1-junior-academies must be registered');
pass('All 3 feeder source entries are registered (fia-f2-official, fia-f3-official, f1-junior-academies)');

const f2Source = getSourceDefinition('fia-f2-official');
assert.strictEqual(f2Source?.discipline, 'f2', 'F2 source discipline must be f2');
assert.strictEqual(f2Source?.authorityLevel, 'OFFICIAL', 'F2 source must be OFFICIAL authority');
assert.strictEqual(f2Source?.currentStatus, 'ACTIVE', 'F2 source must be ACTIVE');
pass('FIA F2 source is OFFICIAL authority with ACTIVE status');

const f3Source = getSourceDefinition('fia-f3-official');
assert.strictEqual(f3Source?.discipline, 'f3', 'F3 source discipline must be f3');
assert.strictEqual(f3Source?.authorityLevel, 'OFFICIAL', 'F3 source must be OFFICIAL authority');
pass('FIA F3 source is OFFICIAL authority');

const academySource = getSourceDefinition('f1-junior-academies');
assert.strictEqual(academySource?.authorityLevel, 'PRIMARY_OPEN_DATA', 'Academy source must be PRIMARY_OPEN_DATA');
assert.strictEqual(academySource?.datasetType, 'JUNIOR_ACADEMIES', 'Academy dataset type must match');
pass('Junior Academies source is PRIMARY_OPEN_DATA with JUNIOR_ACADEMIES dataset type');

assert(isAuthoritativeSource('fia-f2-official'), 'F2 must be authoritative');
assert(isAuthoritativeSource('fia-f3-official'), 'F3 must be authoritative');
assert(isAuthoritativeSource('f1-junior-academies'), 'Academies must be authoritative');
pass('All feeder sources pass isAuthoritativeSource() check');

const f2Provenance = createProvenanceMetadata('fia-f2-official');
assert.strictEqual(f2Provenance.sourceId, 'fia-f2-official');
assert(f2Provenance.retrievedAt, 'Provenance must include retrievedAt timestamp');
assert.strictEqual(f2Provenance.attribution, 'FIA Formula 2 Championship');
pass('Feeder provenance metadata stamps correctly generated');

console.log('');

// ============================================================================
// 2. Identifier Registry — Feeder Driver & Team Resolution
// ============================================================================
console.log('2. Feeder Identifier Registry Tests:');

// F2 Drivers
assert.strictEqual(resolveDriverId('Arvid Lindblad'), 'lindblad');
assert.strictEqual(resolveDriverId('arvid_lindblad'), 'lindblad');
assert.strictEqual(resolveDriverId('lindblad'), 'lindblad');
pass('Arvid Lindblad resolves to stable ID "lindblad" across all provider formats');

assert.strictEqual(resolveDriverId('Gabriele Mini'), 'mini');
assert.strictEqual(resolveDriverId('Luke Browning'), 'browning');
assert.strictEqual(resolveDriverId('Kush Maini'), 'maini');
assert.strictEqual(resolveDriverId('Dino Beganovic'), 'beganovic');
assert.strictEqual(resolveDriverId('Rafael Camara'), 'camara');
assert.strictEqual(resolveDriverId('Tuukka Taponen'), 'taponen');
pass('All F2 feeder drivers resolve to correct stable IDs');

// F3 Drivers
assert.strictEqual(resolveDriverId('Noel Leon'), 'leon');
assert.strictEqual(resolveDriverId('Nikola Tsolov'), 'tsolov');
assert.strictEqual(resolveDriverId('Laurens van Hoepen'), 'van_hoepen');
assert.strictEqual(resolveDriverId('Tim Tramnitz'), 'tramnitz');
assert.strictEqual(resolveDriverId('Brando Badoer'), 'badoer');
assert.strictEqual(resolveDriverId('Callum Voisin'), 'voisin');
assert.strictEqual(resolveDriverId('Martinius Stenshorne'), 'stenshorne');
assert.strictEqual(resolveDriverId('Sophia Floersch'), 'floersch');
pass('All F3 feeder drivers resolve to correct stable IDs');

// F2/F3 Teams
assert.strictEqual(resolveTeamId('Prema Racing'), 'prema');
assert.strictEqual(resolveTeamId('prema'), 'prema');
assert.strictEqual(resolveTeamId('ART Grand Prix'), 'art_gp');
assert.strictEqual(resolveTeamId('art_gp'), 'art_gp');
assert.strictEqual(resolveTeamId('MP Motorsport'), 'mp_motorsport');
assert.strictEqual(resolveTeamId('Invicta Racing'), 'invicta');
assert.strictEqual(resolveTeamId('Hitech Pulse-Eight'), 'hitech');
assert.strictEqual(resolveTeamId('Rodin Motorsport'), 'rodin');
assert.strictEqual(resolveTeamId('Campos Racing'), 'campos');
assert.strictEqual(resolveTeamId('Trident'), 'trident');
assert.strictEqual(resolveTeamId('Van Amersfoort Racing'), 'van_amersfoort');
assert.strictEqual(resolveTeamId('DAMS'), 'dams');
pass('All F2/F3 feeder teams resolve to stable IDs');

console.log('');

// ============================================================================
// 3. Junior Academies Registry — All 8 Programmes
// ============================================================================
console.log('3. Junior Academies Registry Tests:');

const expectedAcademies = [
  'red-bull-junior',
  'ferrari-driver-academy',
  'mercedes-junior',
  'alpine-academy',
  'mclaren-driver-development',
  'williams-racing-driver-academy',
  'sauber-academy',
  'aston-martin-driver-development',
];

for (const id of expectedAcademies) {
  assert(JUNIOR_ACADEMIES_REGISTRY[id as keyof typeof JUNIOR_ACADEMIES_REGISTRY], `Academy ${id} must be registered`);
}
assert.strictEqual(Object.keys(JUNIOR_ACADEMIES_REGISTRY).length, 8);
pass('All 8 Junior Academies are registered');

const rbJunior = JUNIOR_ACADEMIES_REGISTRY['red-bull-junior'];
assert.strictEqual(rbJunior.name, 'Red Bull Junior Team');
assert.strictEqual(rbJunior.f1TeamId, 'red_bull');
assert(rbJunior.accentColor, 'Academy must have accentColor');
assert(rbJunior.description.length > 20, 'Academy must have meaningful description');
assert(rbJunior.headquarters, 'Academy must have headquarters');
pass('Red Bull Junior Team has complete metadata (name, f1TeamId, color, description, HQ)');

const ferrariAcademy = JUNIOR_ACADEMIES_REGISTRY['ferrari-driver-academy'];
assert.strictEqual(ferrariAcademy.f1TeamId, 'ferrari');
assert.strictEqual(ferrariAcademy.f1TeamName, 'Scuderia Ferrari');
pass('Ferrari Driver Academy maps to Scuderia Ferrari F1 team');

const mercedesJunior = JUNIOR_ACADEMIES_REGISTRY['mercedes-junior'];
assert.strictEqual(mercedesJunior.f1TeamId, 'mercedes');
pass('Mercedes Junior Team maps to Mercedes F1 team');

// Validate all academies have complete metadata
for (const [id, academy] of Object.entries(JUNIOR_ACADEMIES_REGISTRY)) {
  assert(academy.name, `${id}: name required`);
  assert(academy.f1TeamId, `${id}: f1TeamId required`);
  assert(academy.f1TeamName, `${id}: f1TeamName required`);
  assert(academy.accentColor, `${id}: accentColor required`);
  assert(academy.description, `${id}: description required`);
  assert(academy.headquarters, `${id}: headquarters required`);
}
pass('All 8 academies have complete metadata (name, f1TeamId, f1TeamName, accentColor, description, headquarters)');

console.log('');

// ============================================================================
// 4. Feeder Weekend Rules & Points Matrices
// ============================================================================
console.log('4. Feeder Weekend Rules & Points Tests:');

assert.deepStrictEqual(FEEDER_RULES.f2.sprintPointsMatrix, [10, 8, 6, 5, 4, 3, 2, 1]);
assert.strictEqual(FEEDER_RULES.f2.sprintReverseGridCount, 10);
assert.strictEqual(FEEDER_RULES.f2.mandatoryPitStopInFeature, true);
pass('F2 rules: Sprint top 8 matrix [10,8,6,5,4,3,2,1], reverse 10, mandatory pit stop');

assert.deepStrictEqual(FEEDER_RULES.f3.sprintPointsMatrix, [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
assert.strictEqual(FEEDER_RULES.f3.sprintReverseGridCount, 12);
assert.strictEqual(FEEDER_RULES.f3.mandatoryPitStopInFeature, false);
pass('F3 rules: Sprint top 10 matrix [10,9,8,7,6,5,4,3,2,1], reverse 12, no mandatory pit stop');

assert.deepStrictEqual(FEEDER_RULES.f2.featurePointsMatrix, [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]);
assert.deepStrictEqual(FEEDER_RULES.f3.featurePointsMatrix, [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]);
pass('Feature Race points matrix is standard FIA scale for both F2 & F3');

assert.strictEqual(FEEDER_RULES.f2.poleBonusPoints, 2);
assert.strictEqual(FEEDER_RULES.f2.fastestLapBonusPoints, 1);
assert.strictEqual(FEEDER_RULES.f3.poleBonusPoints, 2);
assert.strictEqual(FEEDER_RULES.f3.fastestLapBonusPoints, 1);
pass('Pole bonus (+2) and fastest lap bonus (+1) correct for both series');

console.log('');

// ============================================================================
// 5. Sprint Starting Grid — Reverse Grid Inversion Algorithm
// ============================================================================
console.log('5. Sprint Starting Grid Reverse Inversion Algorithm Tests:');

// F2: Reverse top 10
const f2QualiOrder = fixture.f2.qualifyingResult;
const f2SprintGrid = FeederNormalizer.calculateSprintStartingGrid(f2QualiOrder, 'f2');

// F2 has 12 drivers, top 10 should invert, last 2 stay natural
assert.strictEqual(f2SprintGrid[0], 'Mari Boya', 'F2 Sprint P1 must be P10 qualifier (Boya)');
assert.strictEqual(f2SprintGrid[1], 'Tuukka Taponen', 'F2 Sprint P2 must be P9 qualifier');
assert.strictEqual(f2SprintGrid[2], 'Rafael Camara', 'F2 Sprint P3 must be P8 qualifier');
assert.strictEqual(f2SprintGrid[9], 'Arvid Lindblad', 'F2 Sprint P10 must be P1 qualifier (Lindblad)');
// Positions 11+ keep natural order
assert.strictEqual(f2SprintGrid[10], 'Josep Maria Marti', 'F2 Sprint P11 is P11 qualifier (not inverted)');
assert.strictEqual(f2SprintGrid[11], 'Charlie Wurz', 'F2 Sprint P12 is P12 qualifier (not inverted)');
pass('F2 Sprint grid correctly inverts top 10 and preserves P11-12 in natural order');

// F3: Reverse top 12
const f3QualiOrder = fixture.f3.qualifyingResult;
const f3SprintGrid = FeederNormalizer.calculateSprintStartingGrid(f3QualiOrder, 'f3');

assert.strictEqual(f3SprintGrid[0], 'Driver Delta', 'F3 Sprint P1 must be P12 qualifier');
assert.strictEqual(f3SprintGrid[1], 'Driver Gamma', 'F3 Sprint P2 must be P11 qualifier');
assert.strictEqual(f3SprintGrid[11], 'Noel Leon', 'F3 Sprint P12 must be P1 qualifier (Leon)');
// Position 13 keeps natural order
assert.strictEqual(f3SprintGrid[12], 'Driver Epsilon', 'F3 Sprint P13 is P13 qualifier (not inverted)');
pass('F3 Sprint grid correctly inverts top 12 and preserves P13 in natural order');

// Edge case: Empty qualifying
const emptyGrid = FeederNormalizer.calculateSprintStartingGrid([], 'f2');
assert.deepStrictEqual(emptyGrid, []);
pass('Empty qualifying input returns empty sprint grid');

// Edge case: Fewer drivers than inversion threshold
const shortGrid = FeederNormalizer.calculateSprintStartingGrid(['A', 'B', 'C'], 'f2');
assert.deepStrictEqual(shortGrid, ['C', 'B', 'A']);
pass('Grid inversion handles fewer drivers than threshold (inverts all available)');

// Verify full F2 inversion length
assert.strictEqual(f2SprintGrid.length, f2QualiOrder.length, 'Sprint grid must preserve total driver count');
pass('Sprint grid preserves total driver count after inversion');

console.log('');

// ============================================================================
// 6. Feeder Calendar Normalization
// ============================================================================
console.log('6. Feeder Calendar Normalization Tests:');

const f2Calendar = FeederNormalizer.normalizeCalendar('f2', fixture.f2.calendar);
assert.strictEqual(f2Calendar.length, 3, 'F2 fixture has 3 rounds');
pass('F2 calendar normalizes 3 rounds from fixture');

const round1 = f2Calendar[0];
assert.strictEqual(round1.championshipId, 'f2');
assert.strictEqual(round1.round, 1);
assert.strictEqual(round1.season, 2026);
assert.strictEqual(round1.country, 'Bahrain');
assert.strictEqual(round1.eventId, 'f2-2026-r01');
assert.strictEqual(round1.formatType, 'DOUBLE_HEADER');
assert.strictEqual(round1.status, 'COMPLETED');
pass('F2 Round 1 (Bahrain) normalizes with correct eventId, country, format, and COMPLETED status');

// Verify all 4 sessions exist
assert.strictEqual(round1.sessions.length, 4, 'F2 round must have 4 sessions');
const sessionTypes = round1.sessions.map(s => s.sessionType);
assert(sessionTypes.includes('FP1'), 'Must include Practice');
assert(sessionTypes.includes('QUALIFYING'), 'Must include Qualifying');
assert(sessionTypes.includes('SPRINT'), 'Must include Sprint Race');
assert(sessionTypes.includes('RACE'), 'Must include Feature Race');
pass('F2 rounds have 4 sessions: Practice, Qualifying, Sprint, Feature Race');

// Sprint race session name includes reverse grid notation
const sprintSession = round1.sessions.find(s => s.sessionType === 'SPRINT');
assert(sprintSession?.name.includes('Reverse Top 10'), 'F2 sprint must mention Reverse Top 10');
pass('F2 Sprint Race session name documents "Reverse Top 10" rule');

// Provenance on sessions
assert(round1.sessions[0].provenance, 'Session provenance must exist');
assert.strictEqual(round1.sessions[0].provenance.sourceId, 'fia-f2-official');
pass('Session provenance correctly traces to fia-f2-official source');

// F3 calendar
const f3Calendar = FeederNormalizer.normalizeCalendar('f3', fixture.f3.calendar);
assert.strictEqual(f3Calendar.length, 3);
const f3Round1 = f3Calendar[0];
assert.strictEqual(f3Round1.championshipId, 'f3');
assert.strictEqual(f3Round1.eventId, 'f3-2026-r01');
const f3Sprint = f3Round1.sessions.find(s => s.sessionType === 'SPRINT');
assert(f3Sprint?.name.includes('Reverse Top 12'), 'F3 sprint must mention Reverse Top 12');
pass('F3 calendar normalizes correctly with "Reverse Top 12" sprint notation');

// Empty input
assert.deepStrictEqual(FeederNormalizer.normalizeCalendar('f2', []), []);
pass('Empty calendar input returns empty array');

console.log('');

// ============================================================================
// 7. Feeder Driver Normalization with Academy Mapping
// ============================================================================
console.log('7. Feeder Driver Normalization & Academy Mapping Tests:');

const f2Drivers = FeederNormalizer.normalizeDrivers('f2', fixture.f2.drivers);
assert.strictEqual(f2Drivers.length, 12, 'F2 fixture has 12 drivers');
pass('F2 driver normalization returns 12 drivers');

const lindblad = f2Drivers.find(d => d.driverId === 'lindblad');
assert(lindblad, 'Lindblad must be found');
assert.strictEqual(lindblad!.championshipId, 'f2');
assert.strictEqual(lindblad!.firstName, 'Arvid');
assert.strictEqual(lindblad!.lastName, 'Lindblad');
assert.strictEqual(lindblad!.code, 'LIN');
assert.strictEqual(lindblad!.carNumber, 4);
assert.strictEqual(lindblad!.currentTeamId, 'prema');
assert.strictEqual(lindblad!.juniorAcademyId, 'red-bull-junior');
assert.strictEqual(lindblad!.juniorAcademyName, 'Red Bull Junior Team');
assert.strictEqual(lindblad!.f1Affiliation, 'Red Bull Racing');
assert(lindblad!.academyColor, 'Academy color must be set');
pass('Arvid Lindblad normalizes with full Red Bull Junior affiliation and Prema team');

const mini = f2Drivers.find(d => d.driverId === 'mini');
assert(mini, 'Gabriele Minì must be found');
assert.strictEqual(mini!.juniorAcademyId, 'alpine-academy');
assert.strictEqual(mini!.f1Affiliation, 'Alpine F1 Team');
pass('Gabriele Minì maps to Alpine Academy → Alpine F1 Team');

const browning = f2Drivers.find(d => d.driverId === 'browning');
assert.strictEqual(browning!.juniorAcademyId, 'williams-racing-driver-academy');
pass('Luke Browning maps to Williams Racing Driver Academy');

const beganovic = f2Drivers.find(d => d.driverId === 'beganovic');
assert.strictEqual(beganovic!.juniorAcademyId, 'ferrari-driver-academy');
assert.strictEqual(beganovic!.f1Affiliation, 'Scuderia Ferrari');
pass('Dino Beganovic maps to Ferrari Driver Academy');

const taponen = f2Drivers.find(d => d.driverId === 'taponen');
assert.strictEqual(taponen!.juniorAcademyId, 'mercedes-junior');
pass('Tuukka Taponen maps to Mercedes Junior Team');

// Driver without academy (Kush Maini)
const maini = f2Drivers.find(d => d.driverId === 'maini');
assert(maini, 'Maini must be found');
assert.strictEqual(maini!.juniorAcademyId, undefined, 'Independent driver should have no academy');
assert.strictEqual(maini!.f1Affiliation, undefined);
pass('Independent drivers (Maini) have no academy affiliation');

// Provenance
assert(lindblad!.provenance, 'Driver provenance must exist');
assert.strictEqual(lindblad!.provenance.sourceId, 'fia-f2-official');
pass('Driver provenance correctly traces to fia-f2-official');

// F3 drivers
const f3Drivers = FeederNormalizer.normalizeDrivers('f3', fixture.f3.drivers);
assert.strictEqual(f3Drivers.length, 13);
const leon = f3Drivers.find(d => d.driverId === 'leon');
assert.strictEqual(leon!.championshipId, 'f3');
assert.strictEqual(leon!.juniorAcademyId, 'red-bull-junior');
pass('F3 driver Noel Leon normalizes with f3 championshipId and Red Bull Junior affiliation');

console.log('');

// ============================================================================
// 8. Super Licence Points Validation
// ============================================================================
console.log('8. Super Licence Points Tests:');

// F2 Super Licence Table
const f2SlTable = SUPER_LICENCE_POINTS_TABLE.f2;
assert.strictEqual(f2SlTable.length, 10, 'F2 SL table must cover top 10 positions');
assert.strictEqual(f2SlTable[0].points, 40, 'F2 Champion gets 40 SL points');
assert.strictEqual(f2SlTable[1].points, 40, 'F2 2nd gets 40 SL points');
assert.strictEqual(f2SlTable[2].points, 40, 'F2 3rd gets 40 SL points');
assert.strictEqual(f2SlTable[3].points, 30, 'F2 4th gets 30 SL points');
pass('F2 Super Licence table: Top 3 get 40 pts (instant F1 eligibility), 4th gets 30');

// F3 Super Licence Table
const f3SlTable = SUPER_LICENCE_POINTS_TABLE.f3;
assert.strictEqual(f3SlTable.length, 10, 'F3 SL table must cover top 10 positions');
assert.strictEqual(f3SlTable[0].points, 30, 'F3 Champion gets 30 SL points');
assert.strictEqual(f3SlTable[1].points, 25, 'F3 2nd gets 25 SL points');
assert.strictEqual(f3SlTable[2].points, 20, 'F3 3rd gets 20 SL points');
pass('F3 Super Licence table: Champion gets 30, 2nd gets 25, 3rd gets 20');

// Driver SL eligibility based on rank
const f2DriversWithSL = FeederNormalizer.normalizeDrivers('f2', fixture.f2.drivers);
const rank1 = f2DriversWithSL.find(d => d.driverId === 'lindblad');
assert.strictEqual(rank1!.superLicenceEligiblePoints, 40, 'F2 rank 1 must earn 40 SL points');
const rank4 = f2DriversWithSL.find(d => d.driverId === 'goethe');
assert.strictEqual(rank4!.superLicenceEligiblePoints, 30, 'F2 rank 4 must earn 30 SL points');
const rank11 = f2DriversWithSL.find(d => d.driverId === 'marti');
assert.strictEqual(rank11!.superLicenceEligiblePoints, 0, 'F2 rank 11+ earns 0 SL points');
pass('Super Licence points correctly computed from standing rank (40/30/0 for ranks 1/4/11)');

console.log('');

// ============================================================================
// 9. Feeder Standings Normalization
// ============================================================================
console.log('9. Feeder Standings Normalization Tests:');

const f2Standings = FeederNormalizer.normalizeStandings('f2', fixture.f2.standings, 2026);
assert.strictEqual(f2Standings.drivers.length, 3, 'F2 standings fixture has 3 drivers');
assert.strictEqual(f2Standings.constructors.length, 2, 'F2 standings fixture has 2 teams');
pass('F2 standings normalization returns 3 drivers and 2 constructors');

const standing1 = f2Standings.drivers[0];
assert.strictEqual(standing1.position, 1);
assert.strictEqual(standing1.driverId, 'lindblad');
assert.strictEqual(standing1.points, 98);
assert.strictEqual(standing1.wins, 2);
assert.strictEqual(standing1.podiums, 5);
assert.strictEqual(standing1.season, 2026);
pass('F2 driver standings leader is Lindblad with 98 pts, 2 wins, 5 podiums');

const teamStanding1 = f2Standings.constructors[0];
assert.strictEqual(teamStanding1.position, 1);
assert.strictEqual(teamStanding1.teamId, 'prema');
assert.strictEqual(teamStanding1.points, 183);
pass('F2 constructor standings leader is Prema with 183 pts');

const f3Standings = FeederNormalizer.normalizeStandings('f3', fixture.f3.standings, 2026);
assert.strictEqual(f3Standings.drivers[0].driverId, 'leon');
assert.strictEqual(f3Standings.constructors[0].teamId, 'art_gp');
pass('F3 standings correctly normalize with Leon leading drivers and ART GP leading teams');

// Provenance on standings
assert.strictEqual(f2Standings.drivers[0].provenance.sourceId, 'fia-f2-official');
assert.strictEqual(f3Standings.drivers[0].provenance.sourceId, 'fia-f3-official');
pass('Standings provenance correctly traces to respective FIA sources');

console.log('');

// ============================================================================
// 10. API Client — Feeder Integration & Cache
// ============================================================================
console.log('10. API Client Feeder Integration Tests:');

// Test API methods exist and return data
const apiF2Events = await api.getNormalizedFeederEvents('f2', 2026);
assert(Array.isArray(apiF2Events), 'api.getNormalizedFeederEvents must return array');
assert(apiF2Events.length > 0, 'F2 events must not be empty');
assert.strictEqual(apiF2Events[0].championshipId, 'f2');
pass('api.getNormalizedFeederEvents("f2") returns non-empty array with f2 championshipId');

const apiF3Events = await api.getNormalizedFeederEvents('f3', 2026);
assert(Array.isArray(apiF3Events), 'api.getNormalizedFeederEvents must return array for F3');
assert(apiF3Events.length > 0, 'F3 events must not be empty');
assert.strictEqual(apiF3Events[0].championshipId, 'f3');
pass('api.getNormalizedFeederEvents("f3") returns non-empty array with f3 championshipId');

const apiF2Drivers = await api.getNormalizedFeederDrivers('f2');
assert(Array.isArray(apiF2Drivers), 'api.getNormalizedFeederDrivers must return array');
assert(apiF2Drivers.length > 0, 'F2 drivers must not be empty');
assert.strictEqual(apiF2Drivers[0].championshipId, 'f2');
pass('api.getNormalizedFeederDrivers("f2") returns non-empty array');

const apiAcademies = await api.getJuniorAcademies();
assert(Array.isArray(apiAcademies), 'api.getJuniorAcademies must return array');
assert.strictEqual(apiAcademies.length, 8, 'Must return all 8 academies');
assert(apiAcademies.some(a => a.academyId === 'red-bull-junior'), 'Must include Red Bull Junior');
pass('api.getJuniorAcademies() returns all 8 academies');

const apiSlMatrix = await api.getSuperLicenceMatrix('f2');
assert(Array.isArray(apiSlMatrix), 'api.getSuperLicenceMatrix must return array');
assert.strictEqual(apiSlMatrix.length, 10, 'SL matrix must have 10 positions');
assert.strictEqual(apiSlMatrix[0].points, 40, 'SL matrix P1 must award 40 points');
pass('api.getSuperLicenceMatrix("f2") returns 10-position points table');

const apiSlF3 = await api.getSuperLicenceMatrix('f3');
assert.strictEqual(apiSlF3[0].points, 30, 'F3 SL matrix P1 must award 30 points');
pass('api.getSuperLicenceMatrix("f3") correctly returns F3 SL table');

// Cache test: Second call should be instantaneous (T0 latency)
const t0 = Date.now();
await api.getNormalizedFeederEvents('f2', 2026);
const elapsed = Date.now() - t0;
assert(elapsed < 50, `Cached feeder events retrieval must be < 50ms, got ${elapsed}ms`);
pass(`Cached feeder events retrieval is ${elapsed}ms (< 50ms T0 latency)`)

console.log('');

// ============================================================================
// Summary
// ============================================================================
console.log(`\n🏆 Phase 9.2 COMPLETE: ${passCount} / ${passCount} tests passed.\n`);
console.log('  Verified:');
console.log('    ✅ Feeder source registry (F2, F3, Academies)');
console.log('    ✅ Feeder driver & team identifier resolution');
console.log('    ✅ Junior Academies Registry (8 programmes with complete metadata)');
console.log('    ✅ Weekend rules & points matrices (Sprint/Feature/Pole/FL)');
console.log('    ✅ F2 reverse top-10 sprint grid algorithm');
console.log('    ✅ F3 reverse top-12 sprint grid algorithm');
console.log('    ✅ Calendar normalization with 4-session structure');
console.log('    ✅ Driver normalization with academy affiliation mapping');
console.log('    ✅ FIA Super Licence points tables (F2 & F3)');
console.log('    ✅ Standings normalization with provenance');
console.log('    ✅ API client feeder endpoints with clientCache T0 latency');
console.log('');

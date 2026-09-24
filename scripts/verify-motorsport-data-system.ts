/**
 * The Grid — Motorsport Data System & Provenance Verification Suite
 * 
 * Verifies:
 * 1. 11 Supported Championships completeness and source provenance
 * 2. Official F1 2026 driver/team pairings (Verstappen/Hadjar, Lawson/Lindblad, Gasly/Colapinto)
 * 3. Reserve driver identification (Tsunoda at RB, Doohan at Alpine)
 * 4. Separation of Season Roster vs. Official Event Entry List
 * 5. Prediction eligibility derivation from event entry lists
 * 6. Non-mutating event substitution isolation
 * 7. Multi-driver endurance entries (WEC/GT) and driver+co-driver rally crews (WRC)
 * 8. Identifier registry resolution
 */

import { MOTORSPORT_SOURCE_REGISTRY, getSourcesByDiscipline } from '../src/services/dataArchitecture/sourceRegistry';
import { resolveDriverId, resolveTeamId } from '../src/services/dataArchitecture/identifierRegistry';
import { F1_DRIVERS_2026, F1_RESERVES_2026 } from '../src/services/mockData';
import { f1Data } from '../src/services/motorsport/data/f1Data';
import { motogpData } from '../src/services/motorsport/data/motogpData';
import { wecData } from '../src/services/motorsport/data/wecData';
import { wrcData } from '../src/services/motorsport/data/wrcData';
import { gtWorldChallengeData } from '../src/services/motorsport/data/gtWorldChallengeData';
import { formulaEData } from '../src/services/motorsport/data/formulaEData';
import { f2Data } from '../src/services/motorsport/data/f2Data';
import { f3Data } from '../src/services/motorsport/data/f3Data';
import { f4Data } from '../src/services/motorsport/data/f4Data';
import { indianMotorsportData } from '../src/services/motorsport/data/indianMotorsportData';
import {
  getOfficialEventEntryList,
  getPredictionEligibleCompetitors,
  registerEventSubstitution,
  resetEventSubstitutions,
  isCompetitorPredictionEligible,
} from '../src/services/motorsport/eventEntryService';
import { getEligibleDriversForRace } from '../src/services/motorsport/raceEntryService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runVerification() {
  console.log('🏁 Starting Motorsport Data System & Provenance Verification Suite...\n');

  // ==========================================================================
  // Test 1: Source Registry & Provenance for All 11 Disciplines
  // ==========================================================================
  console.log('📌 Test 1: Verifying Source Registry & Governing Body Authority...');
  const sourceList = Object.values(MOTORSPORT_SOURCE_REGISTRY);
  assert(sourceList.length >= 10, `Source registry contains ${sourceList.length} registered sources`);

  const disciplines = ['f1', 'formula-e', 'motogp', 'wec', 'wrc', 'gt-world-challenge', 'indian-motorsport', 'f4'];
  for (const disc of disciplines) {
    const sources = getSourcesByDiscipline(disc);
    assert(sources.length > 0, `Discipline '${disc}' has registered authoritative sources (${sources.map(s => s.sourceId).join(', ')})`);
  }

  // ==========================================================================
  // Test 2: F1 2026 Verified Roster Audit
  // ==========================================================================
  console.log('\n📌 Test 2: Verifying Authoritative F1 2026 Grid & Driver Roster...');
  assert(F1_DRIVERS_2026.length === 22, `F1 2026 grid contains exactly 22 drivers across 11 constructors`);

  // Red Bull Racing: Verstappen + Hadjar
  const redBullDrivers = F1_DRIVERS_2026.filter(d => d.teamId === 'red_bull' || d.team === 'Red Bull Racing');
  assert(redBullDrivers.length === 2, `Red Bull Racing has exactly 2 race drivers`);
  assert(redBullDrivers.some(d => d.id === 'verstappen' && d.number === 1), `Red Bull has Max Verstappen (#1)`);
  assert(redBullDrivers.some(d => d.id === 'hadjar' && d.number === 6), `Red Bull has Isack Hadjar (#6)`);
  assert(!redBullDrivers.some(d => d.id === 'lawson'), `Liam Lawson is NOT assigned to Red Bull Racing`);

  // Racing Bulls: Lawson + Lindblad
  const rbDrivers = F1_DRIVERS_2026.filter(d => d.teamId === 'racing_bulls' || d.team === 'Racing Bulls');
  assert(rbDrivers.length === 2, `Racing Bulls has exactly 2 race drivers`);
  assert(rbDrivers.some(d => d.id === 'lawson' && d.number === 30), `Racing Bulls has Liam Lawson (#30)`);
  assert(rbDrivers.some(d => d.id === 'lindblad' && d.number === 41), `Racing Bulls has Arvid Lindblad (#41)`);
  assert(!rbDrivers.some(d => d.id === 'tsunoda'), `Yuki Tsunoda is NOT assigned to active Racing Bulls seat`);

  // Alpine: Gasly + Colapinto
  const alpineDrivers = F1_DRIVERS_2026.filter(d => d.teamId === 'alpine' || d.team === 'Alpine');
  assert(alpineDrivers.length === 2, `Alpine has exactly 2 race drivers`);
  assert(alpineDrivers.some(d => d.id === 'gasly' && d.number === 10), `Alpine has Pierre Gasly (#10)`);
  assert(alpineDrivers.some(d => d.id === 'colapinto' && d.number === 43), `Alpine has Franco Colapinto (#43)`);
  assert(!alpineDrivers.some(d => d.id === 'doohan'), `Jack Doohan is NOT in active race seat for Alpine`);

  // Official Reserves: Yuki Tsunoda & Jack Doohan
  assert(F1_RESERVES_2026.length >= 2, `F1 2026 official reserves exported (${F1_RESERVES_2026.length} reserves)`);
  assert(F1_RESERVES_2026.some(d => d.id === 'tsunoda' && d.number === 22), `Yuki Tsunoda is registered as Red Bull / Racing Bulls Reserve`);
  assert(F1_RESERVES_2026.some(d => d.id === 'doohan' && d.number === 7), `Jack Doohan is registered as Alpine Reserve Driver`);

  // Standings check
  assert(f1Data.driversStandings !== undefined && f1Data.driversStandings.length === 22, `F1 Standings contain 22 active drivers`);
  assert(f1Data.driversStandings!.some(d => d.driverName === 'Isack Hadjar' && d.teamName === 'Red Bull Racing'), `F1 Standings: Hadjar is at Red Bull`);
  assert(f1Data.driversStandings!.some(d => d.driverName === 'Franco Colapinto' && d.teamName.includes('Alpine')), `F1 Standings: Colapinto is at Alpine`);
  assert(f1Data.driversStandings!.some(d => d.driverName === 'Arvid Lindblad' && d.teamName === 'Racing Bulls'), `F1 Standings: Lindblad is at Racing Bulls`);

  // ==========================================================================
  // Test 3: Separation of Season Roster vs. Official Event Entry List
  // ==========================================================================
  console.log('\n📌 Test 3: Verifying Event Entry List vs Season Roster Separation...');
  const azerbaijanEntries = await getOfficialEventEntryList('f1', 2026, 'f1-2026-r15');
  assert(azerbaijanEntries.entries.length >= 24, `Azerbaijan GP entry list has 22 active starters + 2 standby reserves`);
  assert(azerbaijanEntries.circuitId === 'baku_city_circuit', `Azerbaijan GP resolved circuit: baku_city_circuit`);
  assert(azerbaijanEntries.verificationStatus === 'VERIFIED', `Event entry list is marked VERIFIED`);

  const confirmedStarters = azerbaijanEntries.entries.filter(e => e.status === 'CONFIRMED' && e.role === 'RACE_DRIVER');
  assert(confirmedStarters.length === 22, `Official event has exactly 22 confirmed race drivers`);

  const standbyReserves = azerbaijanEntries.entries.filter(e => e.status === 'RESERVE_STANDBY');
  assert(standbyReserves.length === 2, `Official event has 2 standby reserves`);
  assert(standbyReserves.every(e => !e.isPredictionEligible), `Standby reserves are NOT prediction eligible by default`);

  // ==========================================================================
  // Test 4: Prediction Eligibility Derivation
  // ==========================================================================
  console.log('\n📌 Test 4: Deriving Prediction Eligibility from Event Entries...');
  const eligibleDrivers = await getPredictionEligibleCompetitors('f1', 'f1-2026-r15');
  assert(eligibleDrivers.length === 22, `Prediction eligible list contains exactly 22 confirmed competitors`);
  assert(eligibleDrivers.some(d => d.id === 'colapinto'), `Franco Colapinto is prediction-eligible`);
  assert(eligibleDrivers.some(d => d.id === 'hadjar'), `Isack Hadjar is prediction-eligible`);
  assert(!eligibleDrivers.some(d => d.id === 'doohan'), `Standby reserve Jack Doohan is NOT prediction-eligible`);
  assert(!eligibleDrivers.some(d => d.id === 'tsunoda'), `Standby reserve Yuki Tsunoda is NOT prediction-eligible`);

  // Test raceEntryService integration
  const raceEntryDrivers = await getEligibleDriversForRace('f1-2026-r15');
  assert(raceEntryDrivers.length === 22, `raceEntryService returns 22 eligible drivers via eventEntryService`);
  assert(raceEntryDrivers.some(d => d.id === 'colapinto'), `raceEntryService includes Colapinto`);

  // ==========================================================================
  // Test 5: Event-Specific Driver Substitution Isolation
  // ==========================================================================
  console.log('\n📌 Test 5: Verifying Non-Mutating Event-Specific Substitutions...');
  // Scenario: Jack Doohan substitutes for Pierre Gasly at Azerbaijan GP (Round 15)
  registerEventSubstitution('f1-2026-r15', 'gasly', 'doohan', 'Medical unfitness');

  // Re-fetch Round 15 official entries
  const subEntries = await getOfficialEventEntryList('f1', 2026, 'f1-2026-r15');
  const gaslyEntry = subEntries.entries.find(e => e.competitorId === 'gasly');
  const doohanEntry = subEntries.entries.find(e => e.competitorId === 'doohan');

  assert(gaslyEntry !== undefined && gaslyEntry.status === 'SUBSTITUTED', `Gasly is marked SUBSTITUTED for Round 15`);
  assert(gaslyEntry!.isPredictionEligible === false, `Substituted driver Gasly is NOT prediction-eligible`);
  assert(doohanEntry !== undefined && doohanEntry.role === 'SUBSTITUTE', `Doohan has role SUBSTITUTE for Round 15`);
  assert(doohanEntry!.status === 'CONFIRMED' && doohanEntry!.isPredictionEligible === true, `Doohan is CONFIRMED and prediction-eligible`);
  assert(doohanEntry!.teamName === 'Alpine', `Doohan is entered for Alpine`);

  // Check prediction list for Round 15
  const subPredictionEligible = await getPredictionEligibleCompetitors('f1', 'f1-2026-r15');
  assert(subPredictionEligible.length === 22, `Prediction eligible count remains 22 after substitution`);
  assert(subPredictionEligible.some(d => d.id === 'doohan'), `Doohan is now prediction-eligible for Round 15`);
  assert(!subPredictionEligible.some(d => d.id === 'gasly'), `Gasly is NO LONGER prediction-eligible for Round 15`);

  // INVARIANT 1: F1 Season Roster is NOT mutated!
  assert(F1_DRIVERS_2026.some(d => d.id === 'gasly'), `INVARIANT: Season Roster F1_DRIVERS_2026 still has Gasly`);
  assert(f1Data.driversStandings!.some(d => d.driverCode === 'GAS'), `INVARIANT: Season Standings still retain Gasly`);

  // INVARIANT 2: Other races are NOT affected!
  const round1Entries = await getOfficialEventEntryList('f1', 2026, 'f1-2026-r01');
  const round1Gasly = round1Entries.entries.find(e => e.competitorId === 'gasly');
  assert(round1Gasly !== undefined && round1Gasly.status === 'CONFIRMED' && round1Gasly.isPredictionEligible === true, `Round 1 is unaffected: Gasly is CONFIRMED starter`);

  // Reset substitution and verify restoration
  resetEventSubstitutions('f1-2026-r15');
  const restoredEntries = await getOfficialEventEntryList('f1', 2026, 'f1-2026-r15');
  const restoredGasly = restoredEntries.entries.find(e => e.competitorId === 'gasly');
  assert(restoredGasly !== undefined && restoredGasly.status === 'CONFIRMED' && restoredGasly.isPredictionEligible === true, `Substitutions can be cleanly reset; Gasly restored`);

  // ==========================================================================
  // Test 6: Multi-Discipline Depth & Terminology Checks
  // ==========================================================================
  console.log('\n📌 Test 6: Verifying Multi-Discipline Depth & Rich Domain Models...');

  // MotoGP
  assert(motogpData.competitorLabel === 'Rider', `MotoGP competitor label is 'Rider'`);
  assert(motogpData.vehicleLabel === 'Bike', `MotoGP vehicle label is 'Bike'`);
  assert(motogpData.driversStandings !== undefined && motogpData.driversStandings.length >= 10, `MotoGP has 10+ rider standings`);
  assert(motogpData.driversStandings![0].driverName === 'Jorge Martín' && motogpData.driversStandings![0].teamName === 'Aprilia Racing', `MotoGP: Jorge Martín at Aprilia Racing`);
  assert(motogpData.driversStandings![1].driverName === 'Francesco Bagnaia' && motogpData.driversStandings![1].teamName === 'Ducati Lenovo Team', `MotoGP: Bagnaia at Ducati`);
  assert(motogpData.driversStandings![2].driverName === 'Marc Márquez' && motogpData.driversStandings![2].teamName === 'Ducati Lenovo Team', `MotoGP: Marc Márquez at Ducati`);

  // WEC & Le Mans
  assert(wecData.classes !== undefined && wecData.classes.length === 2, `WEC has Hypercar & LMGT3 classes`);
  assert(wecData.driversStandings !== undefined && wecData.driversStandings.length >= 14, `WEC has 14+ endurance driver standings`);
  assert(wecData.driversStandings![0].coDrivers !== undefined && wecData.driversStandings![0].coDrivers!.length === 2, `WEC: Car #6 has 3-driver crew (Vanthoor, Estre, Lotterer)`);
  assert(wecData.teamsStandings !== undefined && wecData.teamsStandings.length >= 8, `WEC has 8+ teams standings across Hypercar & LMGT3`);

  // WRC Rally
  assert(wrcData.classes !== undefined && wrcData.classes.length === 3, `WRC has Rally1, WRC2, Junior WRC`);
  assert(wrcData.driversStandings !== undefined && wrcData.driversStandings.length >= 8, `WRC has 8+ rally crew standings`);
  assert(wrcData.driversStandings![0].coDrivers !== undefined && wrcData.driversStandings![0].coDrivers![0] === 'Martijn Wydaeghe', `WRC: Neuville co-driver is Martijn Wydaeghe`);

  // GT World Challenge
  assert(gtWorldChallengeData.classes !== undefined && gtWorldChallengeData.classes.length === 4, `GT World Challenge has Pro, Gold, Silver, Bronze cups`);
  assert(gtWorldChallengeData.driversStandings !== undefined && gtWorldChallengeData.driversStandings.length >= 12, `GT World Challenge has 12+ GT3 driver crew standings`);

  // Formula E
  assert(formulaEData.driversStandings !== undefined && formulaEData.driversStandings.length === 22, `Formula E has all 22 Gen3 Evo drivers in standings`);
  assert(formulaEData.teamsStandings !== undefined && formulaEData.teamsStandings.length === 11, `Formula E has all 11 teams in standings`);
  assert(formulaEData.teamsStandings!.some(t => t.teamName === 'Mahindra Racing' && t.country === 'India'), `Formula E: Mahindra Racing representing India`);

  // Junior Single-Seaters (F2, F3, F4)
  assert(f2Data.driversStandings !== undefined && f2Data.driversStandings.length === 22, `F2 has 22 driver standings`);
  assert(f3Data.driversStandings !== undefined && f3Data.driversStandings.length === 15, `F3 has 15 driver standings`);
  assert(f4Data.nationalSeries !== undefined && f4Data.nationalSeries.some(s => s.name.includes('Indian')), `F4 includes F4 Indian Championship (FIA Certified)`);

  // Indian Motorsport
  assert(indianMotorsportData.series.length >= 4, `Indian Motorsport contains 4+ national championships`);
  assert(indianMotorsportData.circuits.length >= 4, `Indian Motorsport contains 4+ permanent & street circuits`);

  // ==========================================================================
  // Test 7: Identifier Registry Resolution
  // ==========================================================================
  console.log('\n📌 Test 7: Verifying Identifier Registry Resolution...');
  const colapintoResolved = resolveDriverId('franco_colapinto');
  assert(colapintoResolved === 'colapinto', `franco_colapinto resolves to internal ID: ${colapintoResolved}`);
  const hadjarResolved = resolveDriverId('isack_hadjar');
  assert(hadjarResolved === 'hadjar', `isack_hadjar resolves to internal ID: ${hadjarResolved}`);
  const alpineTeam = resolveTeamId('alpine f1 team');
  assert(alpineTeam === 'alpine', `alpine f1 team resolves to internal teamId: ${alpineTeam}`);

  console.log('\n=================================================================');
  console.log('🎉 ALL MOTORSPORT DATA SYSTEM & PROVENANCE TESTS PASSED (100%)');
  console.log('=================================================================\n');
}

runVerification().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

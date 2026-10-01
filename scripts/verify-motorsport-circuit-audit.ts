/**
 * The Grid — Motorsport & Circuit Data Layer Deterministic Verification
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { f1Data } from '../src/services/motorsport/data/f1Data';
import { f2Data } from '../src/services/motorsport/data/f2Data';
import { f3Data } from '../src/services/motorsport/data/f3Data';
import { f4Data } from '../src/services/motorsport/data/f4Data';
import { motogpData } from '../src/services/motorsport/data/motogpData';
import { moto2Data } from '../src/services/motorsport/data/moto2Data';
import { moto3Data } from '../src/services/motorsport/data/moto3Data';
import { wecData } from '../src/services/motorsport/data/wecData';
import { formulaEData } from '../src/services/motorsport/data/formulaEData';
import { wrcData } from '../src/services/motorsport/data/wrcData';
import { nascarData } from '../src/services/motorsport/data/nascarData';
import { indycarData } from '../src/services/motorsport/data/indycarData';
import { gtWorldChallengeData } from '../src/services/motorsport/data/gtWorldChallengeData';
import { imsaData } from '../src/services/motorsport/data/imsaData';
import { indianMotorsportData } from '../src/services/motorsport/data/indianMotorsportData';
import { getCircuitsByChampionship, getCircuitsForChampionship, VERIFIED_CIRCUIT_SVGS } from '../src/services/circuits/globalCircuitsService';

console.log('🏁 STARTING MOTORSPORT & CIRCUIT DATA LAYER AUDIT...\n');

// 1. DATA AUDIT: All 15 Categories Loaded and Season Verified
const championships = [
  { id: 'f1', data: f1Data, expectedRounds: 24, expectedSeason: 2026 },
  { id: 'f2', data: f2Data, expectedRounds: 14, expectedSeason: 2026 },
  { id: 'f3', data: f3Data, expectedRounds: 10, expectedSeason: 2026 },
  { id: 'f4', data: f4Data, expectedRounds: 0, expectedSeason: 2026 },
  { id: 'motogp', data: motogpData, expectedRounds: 22, expectedSeason: 2026 },
  { id: 'moto2', data: moto2Data, expectedRounds: 14, expectedSeason: 2026 },
  { id: 'moto3', data: moto3Data, expectedRounds: 14, expectedSeason: 2026 },
  { id: 'wec', data: wecData, expectedRounds: 8, expectedSeason: 2026 },
  { id: 'formula-e', data: formulaEData, expectedRounds: 16, expectedSeason: 2026 },
  { id: 'wrc', data: wrcData, expectedRounds: 14, expectedSeason: 2026 },
  { id: 'nascar', data: nascarData, expectedRounds: 14, expectedSeason: 2026 },
  { id: 'indycar', data: indycarData, expectedRounds: 17, expectedSeason: 2026 },
  { id: 'gt-world-challenge', data: gtWorldChallengeData, expectedRounds: 10, expectedSeason: 2026 },
  { id: 'imsa', data: imsaData, expectedRounds: 11, expectedSeason: 2026 },
];

console.log('=== SECTION 1: MOTORSPORT HUBS INTEGRITY ===');
for (const c of championships) {
  assert(c.data, `Championship data must be defined for ${c.id}`);
  assert(c.data.seasonYear === c.expectedSeason, `${c.id} must be season ${c.expectedSeason}, got ${c.data.seasonYear}`);
  assert(c.data.rounds?.length === c.expectedRounds, `${c.id} must have ${c.expectedRounds} rounds, got ${c.data.rounds?.length}`);
  
  if (c.data.rounds && c.data.rounds.length > 0) {
    // Verify strictly sequential round numbering
    c.data.rounds.forEach((r, idx) => {
      assert(r.roundNumber === idx + 1, `${c.id} round ${idx + 1} has roundNumber ${r.roundNumber}`);
      assert(!!r.circuitName, `${c.id} round ${idx + 1} has circuitName`);
      assert(!!r.dates, `${c.id} round ${idx + 1} has dates`);
      assert(!!r.country, `${c.id} round ${idx + 1} has country`);
    });
  }

  // Participants & Standings
  if (c.id !== 'f4') {
    assert(c.data.driversStandings && c.data.driversStandings.length > 0, `${c.id} must have drivers/riders standings`);
    assert(c.data.teamsStandings && c.data.teamsStandings.length > 0, `${c.id} must have teams/manufacturers standings`);
  }

  console.log(`  ✓ ${c.id.padEnd(20)} Season ${c.data.seasonYear} | Rounds: ${c.data.rounds?.length ?? 0} | Drivers: ${c.data.driversStandings?.length ?? 0} | Teams: ${c.data.teamsStandings?.length ?? 0}`);
}

// Indian Motorsport verification
assert(indianMotorsportData.circuits.length === 5, 'Indian Motorsport has 5 registered circuits');
assert(indianMotorsportData.drivers.length > 0, 'Indian Motorsport has drivers');
assert(indianMotorsportData.series.length > 0, 'Indian Motorsport has series');
console.log(`  ✓ indian-motorsport    Ecosystem | Circuits: ${indianMotorsportData.circuits.length} | Drivers: ${indianMotorsportData.drivers.length} | Series: ${indianMotorsportData.series.length}`);

// 2. CRITICAL SPECIFIC REGRESSIONS
console.log('\n=== SECTION 2: SPECIFIC REGRESSION CHECKS ===');

// F2 Regression: Rafael Câmara must be leader, Arvid Lindblad must NOT be F2 leader
const f2Leader = f2Data.driversStandings[0];
assert(f2Leader.driverName === 'Rafael Câmara', `F2 leader must be Rafael Câmara, got ${f2Leader.driverName}`);
assert(f2Leader.teamName.includes('Invicta'), `F2 leader team must be Invicta Racing, got ${f2Leader.teamName}`);
assert(!f2Data.driversStandings.some(d => d.driverName === 'Arvid Lindblad'), 'Arvid Lindblad must NOT be in F2 standings (promoted to F1 Racing Bulls)');
console.log(`  ✓ F2 Leader: ${f2Leader.driverName} (${f2Leader.teamName}) with ${f2Leader.points} pts — Arvid Lindblad absent`);

// F3 Regression: Ugo Ugochukwu champion, Freddie Slater runner-up
const f3Leader = f3Data.driversStandings[0];
assert(f3Leader.driverName === 'Ugo Ugochukwu', `F3 champion must be Ugo Ugochukwu, got ${f3Leader.driverName}`);
assert(f3Leader.teamName.includes('Campos'), `F3 champion team must be Campos Racing`);
const f3P2 = f3Data.driversStandings[1];
assert(f3P2.driverName === 'Freddie Slater', `F3 runner-up must be Freddie Slater`);
console.log(`  ✓ F3 Champion: ${f3Leader.driverName} (${f3Leader.points} pts), P2: ${f3P2.driverName} (${f3P2.points} pts)`);

// Moto2 & Moto3 Independent Datasets
const moto2Leader = moto2Data.driversStandings[0];
assert(moto2Leader.driverName === 'Manuel González', `Moto2 leader must be Manuel González, got ${moto2Leader.driverName}`);
assert(moto2Data.id === 'moto2', 'Moto2 has distinct id');
console.log(`  ✓ Moto2 Leader: ${moto2Leader.driverName} (${moto2Leader.teamName}) with ${moto2Leader.points} pts`);

const moto3Leader = moto3Data.driversStandings[0];
assert(moto3Leader.driverName === 'Máximo Quiles', `Moto3 leader must be Máximo Quiles, got ${moto3Leader.driverName}`);
assert(moto3Data.id === 'moto3', 'Moto3 has distinct id');
console.log(`  ✓ Moto3 Leader: ${moto3Leader.driverName} (${moto3Leader.teamName}) with ${moto3Leader.points} pts`);

// F4 Special Rule: Category-level, no fake global championship
assert(f4Data.championshipSeries && f4Data.championshipSeries.length >= 4, 'F4 defines regional championships');
assert(!f4Data.rounds || f4Data.rounds.length === 0, 'F4 does NOT combine national series into a fake global calendar');
console.log(`  ✓ F4 Category: Regional structure preserved (${f4Data.championshipSeries.length} championships, no fake global calendar)`);

// 3. CIRCUIT LAYER SCOPING & ARCHITECTURE
console.log('\n=== SECTION 3: CIRCUIT SCOPING & DATA INTEGRITY ===');

// F1 Circuit Scoping: Exactly 24 circuits matching f1Data.rounds
const f1Circuits = getCircuitsByChampionship('f1');
assert(f1Circuits.length === 24, `F1 circuits count must be exactly 24, got ${f1Circuits.length}`);

// Negative test: Buddh and Nürburgring MUST NOT be in F1 circuits
assert(!f1Circuits.some(c => c.circuitId === 'buddh'), 'CRITICAL: Buddh International Circuit must NOT appear in F1 circuits list');
assert(!f1Circuits.some(c => c.circuitId === 'nurburgring'), 'CRITICAL: Nürburgring must NOT appear in F1 circuits list');
console.log(`  ✓ F1 Calendar Scoping: Exactly 24 circuits. Buddh and Nürburgring correctly excluded.`);

// Verify all 24 F1 circuits have verified SVGs
const publicCircuitDir = path.resolve('public/circuits');
const availableSvgs = new Set(fs.readdirSync(publicCircuitDir));

for (const c of f1Circuits) {
  const primary = c.layouts.find(l => l.isPrimary) || c.layouts[0];
  assert(primary?.mapSvg, `F1 circuit ${c.name} (${c.circuitId}) must have mapSvg`);
  assert(availableSvgs.has(primary.mapSvg), `F1 circuit ${c.name} mapSvg (${primary.mapSvg}) must exist on disk`);
  assert(c.disciplines.length === 1 && c.disciplines[0] === 'f1', `F1 circuit ${c.name} must be scoped to F1 only`);
  assert(c.championships.length === 1 && c.championships[0].championshipId === 'f1', `F1 circuit ${c.name} must have only F1 championship context`);
}
console.log(`  ✓ F1 Circuit SVGs: All 24 circuits have verified, existing SVGs. Zero cross-motorsport badges.`);

// F2 Circuit Scoping: Exactly 14 circuits
const f2Circuits = getCircuitsByChampionship('f2');
assert(f2Circuits.length === 14, `F2 circuits count must be exactly 14, got ${f2Circuits.length}`);
for (const c of f2Circuits) {
  assert(c.disciplines.length === 1 && c.disciplines[0] === 'f2', `F2 circuit ${c.name} must be scoped to F2 only`);
  assert(c.championships.length === 1 && c.championships[0].championshipId === 'f2', `F2 circuit ${c.name} must have only F2 championship context`);
}
console.log(`  ✓ F2 Calendar Scoping: Exactly 14 circuits. Scoped strictly to F2.`);

// F3 Circuit Scoping: Exactly 10 circuits
const f3Circuits = getCircuitsByChampionship('f3');
assert(f3Circuits.length === 10, `F3 circuits count must be exactly 10, got ${f3Circuits.length}`);
for (const c of f3Circuits) {
  assert(c.disciplines.length === 1 && c.disciplines[0] === 'f3', `F3 circuit ${c.name} must be scoped to F3 only`);
  assert(c.championships.length === 1 && c.championships[0].championshipId === 'f3', `F3 circuit ${c.name} must have only F3 championship context`);
}
console.log(`  ✓ F3 Calendar Scoping: Exactly 10 circuits. Scoped strictly to F3.`);

// WEC Circuit Scoping: Exactly 8 circuits (Imola, Spa, Le Mans, Interlagos, COTA, Fuji, Barcelona, Monza)
const wecCircuits = getCircuitsByChampionship('wec');
assert(wecCircuits.length === 8, `WEC circuits count must be exactly 8, got ${wecCircuits.length}`);
const wecNames = wecCircuits.map(c => c.name.toLowerCase());
assert(wecCircuits.some(c => c.circuitId === 'lemans' || c.name.toLowerCase().includes('mans')), 'WEC must include Circuit des 24 Heures du Mans');
assert(wecNames.some(n => n.includes('spa')), 'WEC must include Spa');
assert(wecNames.some(n => n.includes('fuji')), 'WEC must include Fuji');
for (const c of wecCircuits) {
  assert(c.disciplines.length === 1 && c.disciplines[0] === 'wec', `WEC circuit ${c.name} must be scoped to WEC only`);
}
console.log(`  ✓ WEC Calendar Scoping: Exactly 8 circuits (including Le Mans, Spa, Fuji). Scoped strictly to WEC.`);

// MotoGP Circuit Scoping: Exactly 22 circuits
const motogpCircuits = getCircuitsByChampionship('motogp');
assert(motogpCircuits.length === 22, `MotoGP circuits count must be exactly 22, got ${motogpCircuits.length}`);
for (const c of motogpCircuits) {
  assert(c.disciplines.length === 1 && c.disciplines[0] === 'motogp', `MotoGP circuit ${c.name} must be scoped to MotoGP only`);
}
console.log(`  ✓ MotoGP Calendar Scoping: Exactly 22 circuits. Scoped strictly to MotoGP.`);

// Indian Motorsport: Exactly 5 circuits
const indianCircuits = getCircuitsByChampionship('indian-motorsport');
assert(indianCircuits.length === 5, `Indian motorsport circuits count must be 5, got ${indianCircuits.length}`);
for (const c of indianCircuits) {
  assert(c.disciplines.length === 1 && c.disciplines[0] === 'indian-motorsport', `Indian circuit ${c.name} must be scoped to indian-motorsport only`);
}
console.log(`  ✓ Indian Motorsport Scoping: Exactly 5 circuits (BIC, MMRT, Kari, CoASTT, Chennai Street).`);

// No Fallback Test: Unknown championship returns empty, not all global circuits
const unknownCircuits = getCircuitsByChampionship('non-existent-series');
assert(unknownCircuits.length === 0, `Unknown championship must return [], got ${unknownCircuits.length}`);
console.log(`  ✓ Zero Cross-Sport Fallback: Unknown championship returns empty list (honest unavailable state).`);

console.log('\n🎉 ALL MOTORSPORT DATA & CIRCUIT LAYER AUDIT INVARIANTS PASSED DETECTABLY!');

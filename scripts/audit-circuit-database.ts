import { F1_CIRCUITS_REGISTRY, CIRCUIT_SOURCE_MAPPING } from '../src/services/circuits/circuitRegistry';
import { GLOBAL_CIRCUITS, getAllGlobalCircuits, VERIFIED_CIRCUIT_SVGS } from '../src/services/circuits/globalCircuitsService';
import fs from 'fs';
import path from 'path';

// Load static championships data
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

const championships = [
  f1Data, f2Data, f3Data, f4Data, motogpData, moto2Data, moto3Data,
  wecData, formulaEData, wrcData, nascarData, indycarData,
  gtWorldChallengeData, imsaData, indianMotorsportData
];

console.log('====================================================');
console.log('🏁 THE GRDX — CIRCUIT DATABASE COMPREHENSIVE AUDIT');
console.log('====================================================\n');

// 1. Files in public/circuits
const publicCircuitsDir = path.resolve('public/circuits');
const availableSvgs = new Set(fs.readdirSync(publicCircuitsDir));
console.log(`📁 SVGs on disk (public/circuits): ${availableSvgs.size} files`);
console.log(`🛡️ VERIFIED_CIRCUIT_SVGS Set count: ${VERIFIED_CIRCUIT_SVGS.size}`);

// 2. Circuits in GLOBAL_CIRCUITS
const globalKeys = Object.keys(GLOBAL_CIRCUITS);
console.log(`\n🏛️ Registered in GLOBAL_CIRCUITS: ${globalKeys.length} circuits`);
console.log(`🏎️ Registered in F1_CIRCUITS_REGISTRY: ${Object.keys(F1_CIRCUITS_REGISTRY).length} circuits`);

const allGlobal = getAllGlobalCircuits();
console.log(`🌐 Total circuits returned by getAllGlobalCircuits() (visible on /circuits): ${allGlobal.length}`);

// 3. Circuits hosted across all championship rounds
interface RoundCircuit {
  circuitName: string;
  location: string;
  country: string;
  championship: string;
  round: number;
}
const allRoundsCircuits: Map<string, RoundCircuit[]> = new Map();

for (const champ of championships) {
  const rounds = (champ as any).rounds || (champ as any).circuits || [];
  for (const r of rounds) {
    const cName = r.circuitName || r.name;
    if (!cName) continue;
    const existing = allRoundsCircuits.get(cName) || [];
    existing.push({
      circuitName: cName,
      location: r.location || '',
      country: r.country || '',
      championship: champ.name || champ.id || 'Unknown',
      round: r.roundNumber || 0,
    });
    allRoundsCircuits.set(cName, existing);
  }
}

console.log(`\n🏆 Total unique circuit names across all championship rounds: ${allRoundsCircuits.size}`);

// Check which round circuits are missing or pending in GLOBAL_CIRCUITS
const missingFromGlobal: { name: string; championships: string[]; country: string }[] = [];
const verifiedCircuits: string[] = [];
const pendingCircuits: { id: string; name: string; reason: string; svgAvailable: boolean }[] = [];

for (const [cName, appearances] of allRoundsCircuits.entries()) {
  const norm = cName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const foundInGlobal = allGlobal.find(g =>
    g.name.toLowerCase() === cName.toLowerCase() ||
    g.shortName.toLowerCase() === cName.toLowerCase() ||
    g.id.toLowerCase() === norm ||
    g.circuitId.toLowerCase() === norm
  );

  if (!foundInGlobal) {
    missingFromGlobal.push({
      name: cName,
      country: appearances[0].country,
      championships: Array.from(new Set(appearances.map(a => a.championship))),
    });
  }
}

console.log(`\n⚠️ Championship circuits NOT registered in GLOBAL_CIRCUITS: ${missingFromGlobal.length}`);
missingFromGlobal.slice(0, 30).forEach(m => {
  console.log(`  - ${m.name} (${m.country}) [${m.championships.join(', ')}]`);
});

// Inspect all circuits in GLOBAL_CIRCUITS for completeness & verification
console.log('\n📊 Detailed audit of all circuits in getAllGlobalCircuits():');
const auditRows: any[] = [];

for (const c of allGlobal) {
  const hasLayouts = c.layouts && c.layouts.length > 0;
  const primaryLayout = hasLayouts ? (c.layouts.find(l => l.isPrimary) || c.layouts[0]) : null;
  const mapSvg = primaryLayout?.mapSvg;
  const svgExists = mapSvg ? availableSvgs.has(mapSvg.replace(/^\/?(circuits\/)?/, '')) : false;
  const hasTurns = primaryLayout && primaryLayout.turns > 0;
  const hasLength = primaryLayout && primaryLayout.lengthKm > 0;
  const hasLocation = Boolean(c.location && c.location.country && c.location.city);
  const isComplete = Boolean(hasLayouts && hasTurns && hasLength && hasLocation);

  const status = isComplete && svgExists ? 'Verified' : !svgExists ? 'Missing Assets' : 'Pending Verification';

  auditRows.push({
    id: c.circuitId || c.id,
    name: c.name,
    country: c.location?.country,
    turns: primaryLayout?.turns || 0,
    lengthKm: primaryLayout?.lengthKm || 0,
    svg: mapSvg || 'NONE',
    svgExists,
    status,
  });
}

console.table(auditRows);

const counts = {
  total: auditRows.length,
  verified: auditRows.filter(r => r.status === 'Verified').length,
  missingAssets: auditRows.filter(r => r.status === 'Missing Assets').length,
  pending: auditRows.filter(r => r.status === 'Pending Verification').length,
};

console.log('Audit Summary Counts:', counts);

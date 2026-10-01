import { GLOBAL_CIRCUITS } from '../src/services/circuits/globalCircuitsService';
import { F1_CIRCUITS_REGISTRY } from '../src/services/circuits/circuitRegistry';
import fs from 'fs';
import path from 'path';

const svgDir = path.resolve('public/circuits');
const files = fs.readdirSync(svgDir);

console.log('=== AUDITING ALL CIRCUITS AND SVGS ===\n');
console.log('Available SVG files in public/circuits:', files.length);

console.log('\n--- GLOBAL CIRCUITS ---');
for (const [id, c] of Object.entries(GLOBAL_CIRCUITS)) {
  const primary = c.layouts.find(l => l.isPrimary) || c.layouts[0];
  const svgName = primary?.mapSvg;
  const exists = svgName ? files.includes(svgName) : false;
  let fileSize = 0;
  if (exists && svgName) {
    fileSize = fs.statSync(path.join(svgDir, svgName)).size;
  }
  console.log(
    id.padEnd(20),
    (svgName || 'NONE').padEnd(25),
    `Exists: ${exists ? 'YES' : 'NO '}`.padEnd(14),
    `Size: ${fileSize}B`.padEnd(14),
    `Turns: ${primary?.turns}`.padEnd(12),
    `Length: ${primary?.lengthKm}km`.padEnd(18),
    `Championships: ${c.disciplines.join(',')}`
  );
}

console.log('\n--- F1 CIRCUITS REGISTRY ---');
for (const [id, c] of Object.entries(F1_CIRCUITS_REGISTRY)) {
  const rawMap = c.mapSvg || (c.map ? path.basename(c.map) : '');
  const svgName = rawMap || undefined;
  const exists = svgName ? files.includes(svgName) : false;
  let fileSize = 0;
  if (exists && svgName) {
    fileSize = fs.statSync(path.join(svgDir, svgName)).size;
  }
  console.log(
    id.padEnd(25),
    (svgName || 'NONE').padEnd(25),
    `Exists: ${exists ? 'YES' : 'NO '}`.padEnd(14),
    `Size: ${fileSize}B`.padEnd(14),
    `Turns: ${c.turns}`.padEnd(12),
    `Length: ${c.lengthKm}km`
  );
}

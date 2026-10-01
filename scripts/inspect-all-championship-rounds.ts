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
  { id: 'f1', data: f1Data },
  { id: 'f2', data: f2Data },
  { id: 'f3', data: f3Data },
  { id: 'f4', data: f4Data },
  { id: 'motogp', data: motogpData },
  { id: 'moto2', data: moto2Data },
  { id: 'moto3', data: moto3Data },
  { id: 'wec', data: wecData },
  { id: 'formula-e', data: formulaEData },
  { id: 'wrc', data: wrcData },
  { id: 'nascar', data: nascarData },
  { id: 'indycar', data: indycarData },
  { id: 'gt-world-challenge', data: gtWorldChallengeData },
  { id: 'imsa', data: imsaData },
  { id: 'indian-motorsport', data: indianMotorsportData },
];

for (const c of championships) {
  console.log(`\n========================================`);
  console.log(`CHAMPIONSHIP: ${c.id.toUpperCase()} (${c.data.name})`);
  console.log(`Season: ${c.data.seasonYear}`);
  console.log(`Rounds count: ${c.data.rounds?.length || 0}`);
  if (c.data.rounds) {
    for (const r of c.data.rounds) {
      console.log(`  Rnd ${String(r.roundNumber).padStart(2)}: ${r.circuitName} | ${r.location}, ${r.country} (${r.dates}) [${r.status}]`);
    }
  }
}

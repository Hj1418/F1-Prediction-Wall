import fs from 'fs';
import path from 'path';

const CIRCUITS = [
  { round: 1, id: 'albert_park', name: 'Albert Park', file: 'albert-park.svg', layout: 'melbourne-2' },
  { round: 2, id: 'shanghai', name: 'Shanghai', file: 'shanghai.svg', layout: 'shanghai-1' },
  { round: 3, id: 'suzuka', name: 'Suzuka', file: 'suzuka.svg', layout: 'suzuka-2' },
  { round: 4, id: 'bahrain', name: 'Bahrain', file: 'bahrain.svg', layout: 'bahrain-1' },
  { round: 5, id: 'jeddah', name: 'Jeddah', file: 'jeddah.svg', layout: 'jeddah-1' },
  { round: 6, id: 'miami', name: 'Miami', file: 'miami.svg', layout: 'miami-1' },
  { round: 7, id: 'imola', name: 'Imola', file: 'imola.svg', layout: 'imola-3' },
  { round: 8, id: 'monaco', name: 'Monaco', file: 'monaco.svg', layout: 'monaco-6' },
  { round: 9, id: 'barcelona', name: 'Barcelona-Catalunya', file: 'barcelona.svg', layout: 'catalunya-6' },
  { round: 10, id: 'montreal', name: 'Circuit Gilles Villeneuve', file: 'montreal.svg', layout: 'montreal-6' },
  { round: 11, id: 'red_bull_ring', name: 'Red Bull Ring', file: 'red-bull-ring.svg', layout: 'spielberg-3' },
  { round: 12, id: 'silverstone', name: 'Silverstone', file: 'silverstone.svg', layout: 'silverstone-8' },
  { round: 13, id: 'spa', name: 'Spa-Francorchamps', file: 'spa.svg', layout: 'spa-francorchamps-4' },
  { round: 14, id: 'hungaroring', name: 'Hungaroring', file: 'hungaroring.svg', layout: 'hungaroring-3' },
  { round: 15, id: 'zandvoort', name: 'Zandvoort', file: 'zandvoort.svg', layout: 'zandvoort-5' },
  { round: 16, id: 'monza', name: 'Monza', file: 'monza.svg', layout: 'monza-7' },
  { round: 17, id: 'baku', name: 'Baku', file: 'baku.svg', layout: 'baku-1' },
  { round: 18, id: 'singapore', name: 'Marina Bay', file: 'singapore.svg', layout: 'marina-bay-4' },
  { round: 19, id: 'cota', name: 'Circuit of the Americas', file: 'cota.svg', layout: 'austin-1' },
  { round: 20, id: 'mexico', name: 'Autódromo Hermanos Rodríguez', file: 'mexico.svg', layout: 'mexico-city-3' },
  { round: 21, id: 'interlagos', name: 'Interlagos', file: 'interlagos.svg', layout: 'interlagos-2' },
  { round: 22, id: 'las_vegas', name: 'Las Vegas Strip', file: 'las-vegas.svg', layout: 'las-vegas-1' },
  { round: 23, id: 'losail', name: 'Lusail', file: 'losail.svg', layout: 'lusail-1' },
  { round: 24, id: 'yas_marina', name: 'Yas Marina', file: 'yas-marina.svg', layout: 'yas-marina-2' }
];

const circuitsDir = path.resolve(process.cwd(), 'public/circuits');

console.log('🏎️ Starting Verification of All 24 Championship Circuit SVG Assets...\n');

let allPassed = true;

CIRCUITS.forEach(c => {
  const filePath = path.join(circuitsDir, c.file);
  const exists = fs.existsSync(filePath);
  if (!exists) {
    console.error(`❌ FAIL: [${c.id}] Missing file ${c.file}`);
    allPassed = false;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasSvgTag = content.includes('<svg');
  const hasViewBox = content.includes('viewBox');
  const hasAspectRatio = content.includes('preserveAspectRatio');
  const hasDesc = content.includes('Created by ROY Jules (julesr0y)');
  const hasPath = content.includes('<path');

  if (!hasSvgTag || !hasViewBox || !hasAspectRatio || !hasPath) {
    console.error(`❌ FAIL: [${c.id}] Invalid SVG structure in ${c.file}`);
    allPassed = false;
    return;
  }

  console.log(`  ✓ PASS: Round ${String(c.round).padStart(2, ' ')} | ${c.name.padEnd(28)} | ${c.file.padEnd(18)} (${c.layout}) | ${(content.length / 1024).toFixed(1)} KB`);
});

if (allPassed) {
  console.log('\n🏆 ALL 24 CALENDAR CIRCUITS VERIFIED AND READY FOR PRODUCTION!');
} else {
  console.error('\n❌ SOME CIRCUITS FAILED VERIFICATION');
  process.exit(1);
}

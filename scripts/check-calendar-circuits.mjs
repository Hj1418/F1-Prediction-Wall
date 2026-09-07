import fs from 'fs';
import path from 'path';

// Import normalizeCircuitId and registry from circuitRegistry
// Since circuitRegistry is TS, let's compile or inspect it
async function main() {
  const res = await fetch('https://api.jolpi.ca/ergast/f1/2026.json');
  const d = await res.json();
  const races = d.MRData.RaceTable.Races;

  const publicDir = path.resolve('public/circuits');
  const svgs = new Set(fs.readdirSync(publicDir));

  // Current normalize logic copied from circuitRegistry.ts
  function normalizeCircuitId(circuitInput) {
    if (!circuitInput) return 'monza';
    const rawKey = typeof circuitInput === 'string'
      ? circuitInput
      : (circuitInput.circuitId || circuitInput.id || circuitInput.name || '');
    const clean = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (clean.includes('monza') || clean.includes('italy')) return 'monza';
    if (clean.includes('monaco') || clean.includes('monte_carlo')) return 'monaco';
    if (clean.includes('silverstone') || clean.includes('britain') || clean.includes('british')) return 'silverstone';
    if (clean.includes('spa') || clean.includes('francorchamps') || clean.includes('belgi')) return 'spa';
    if (clean.includes('suzuka') || clean.includes('japan')) return 'suzuka';
    if (clean.includes('red_bull') || clean.includes('austria') || clean.includes('spielberg')) return 'red_bull_ring';
    if (clean.includes('interlagos') || clean.includes('brazil') || clean.includes('pace')) return 'interlagos';
    if (clean.includes('bahrain') || clean.includes('sakhir')) return 'bahrain';
    if (clean.includes('albert') || clean.includes('melbourne') || clean.includes('australi')) return 'albert_park';
    if (clean.includes('jeddah') || clean.includes('saudi')) return 'jeddah';
    if (clean.includes('shanghai') || clean.includes('china') || clean.includes('chinese')) return 'shanghai';
    if (clean.includes('miami')) return 'miami';
    if (clean.includes('imola') || clean.includes('emilia') || clean.includes('ferrari')) return 'imola';
    if (clean.includes('villeneuve') || clean.includes('montreal') || clean.includes('canada')) return 'montreal';
    if (clean.includes('barcelona') || clean.includes('catalunya')) return 'barcelona';
    if (clean.includes('hungaroring') || clean.includes('hungary') || clean.includes('budapest')) return 'hungaroring';
    if (clean.includes('zandvoort') || clean.includes('dutch') || clean.includes('netherlands')) return 'zandvoort';
    if (clean.includes('baku') || clean.includes('azerbaijan')) return 'baku';
    if (clean.includes('singapore') || clean.includes('marina_bay')) return 'singapore';
    if (clean.includes('cota') || clean.includes('americas') || clean.includes('austin')) return 'cota';
    if (clean.includes('mexico') || clean.includes('rodriguez')) return 'mexico';
    if (clean.includes('vegas')) return 'las_vegas';
    if (clean.includes('losail') || clean.includes('lusail') || clean.includes('qatar')) return 'losail';
    if (clean.includes('yas') || clean.includes('marina') || clean.includes('dhabi')) return 'yas_marina';
    if (clean.includes('madrid') || clean.includes('madring')) return 'madrid';
    if (clean.includes('sepang') || clean.includes('malaysia')) return 'sepang';

    return clean || 'monza';
  }

  console.log('=== CALENDAR CONSISTENCY CHECK ===');
  let missing = 0;
  for (const race of races) {
    const c = race.Circuit;
    const norm = normalizeCircuitId({
      id: c.circuitId,
      circuitId: c.circuitId,
      name: c.circuitName,
      locality: c.Location?.locality,
      country: c.Location?.country,
    });

    const expectedFile1 = `${norm}.svg`;
    const expectedFile2 = `${norm.replace(/_/g, '-')}.svg`;
    const found = svgs.has(expectedFile1) || svgs.has(expectedFile2);

    console.log(`R${race.round.padStart(2)}: ${race.raceName.padEnd(30)} -> normalized: ${norm.padEnd(15)} | Asset: ${found ? 'FOUND (' + (svgs.has(expectedFile1) ? expectedFile1 : expectedFile2) + ')' : 'MISSING!'}`);
    if (!found) missing++;
  }
  console.log(`\nTotal Missing Assets: ${missing}`);
}

main().catch(console.error);

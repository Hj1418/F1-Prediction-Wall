import { f1Data } from '../src/services/motorsport/data/f1Data';
import { f2Data } from '../src/services/motorsport/data/f2Data';
import { f3Data } from '../src/services/motorsport/data/f3Data';
import { wecData } from '../src/services/motorsport/data/wecData';
import { motogpData } from '../src/services/motorsport/data/motogpData';

function normalizeCircuitIdTest(circuitInput?: any): string {
  if (!circuitInput) return 'monza';

  let rawName = '';
  let rawLocality = '';
  let rawCountry = '';
  let rawId = '';

  if (typeof circuitInput === 'string') {
    rawName = circuitInput;
    rawId = circuitInput;
  } else {
    rawId = circuitInput.circuitId || circuitInput.id || '';
    rawName = circuitInput.name || '';
    rawLocality = circuitInput.locality || '';
    rawCountry = circuitInput.country || '';
  }

  const text = `${rawId} ${rawName} ${rawLocality}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (text.includes('buddh') || text.includes('noida')) return 'buddh';
  if (text.includes('madrid') || text.includes('madring')) return 'madrid';
  if (text.includes('sepang')) return 'sepang';
  if (text.includes('monaco') || text.includes('monte_carlo')) return 'monaco';
  if (text.includes('silverstone')) return 'silverstone';
  if (text.includes('francorchamps') || /(^|_)spa(_|$)/.test(text)) return 'spa';
  if (text.includes('suzuka')) return 'suzuka';
  if (text.includes('red_bull') || text.includes('spielberg')) return 'red_bull_ring';
  if (text.includes('interlagos') || text.includes('jose_carlos_pace') || (text.includes('ayrton_senna') && !text.includes('goiania'))) return 'interlagos';
  if (text.includes('bahrain') || text.includes('sakhir')) return 'bahrain';
  if (text.includes('albert_park') || (text.includes('melbourne') && !text.includes('phillip'))) return 'albert_park';
  if (text.includes('jeddah') || text.includes('corniche')) return 'jeddah';
  if (text.includes('shanghai')) return 'shanghai';
  if (text.includes('miami')) return 'miami';
  if (text.includes('imola') || text.includes('enzo_e_dino') || text.includes('dino_ferrari')) return 'imola';
  if (text.includes('villeneuve') || text.includes('montreal')) return 'montreal';
  if (text.includes('barcelona') || text.includes('catalunya') || text.includes('montmelo')) return 'barcelona';
  if (text.includes('hungaroring')) return 'hungaroring';
  if (text.includes('zandvoort')) return 'zandvoort';
  if (text.includes('baku')) return 'baku';
  if (text.includes('singapore') || text.includes('marina_bay')) return 'singapore';
  if (text.includes('cota') || text.includes('americas') || (text.includes('austin') && !text.includes('rally'))) return 'cota';
  if (text.includes('mexico') || text.includes('rodriguez') || text.includes('hermanos')) return 'mexico';
  if (text.includes('vegas')) return 'las_vegas';
  if (text.includes('losail') || text.includes('lusail')) return 'losail';
  if (text.includes('yas_marina') || text.includes('yas_island')) return 'yas_marina';
  if (text.includes('monza')) return 'monza';

  if (text.includes('sarthe') || text.includes('le_mans') || text.includes('bugatti')) return 'lemans';
  if (text.includes('fuji')) return 'fuji';
  if (text.includes('assen')) return 'assen';
  if (text.includes('nurburgring') || text.includes('nordschleife')) return 'nurburgring';
  if (text.includes('bathurst') || text.includes('panorama')) return 'bathurst';
  if (text.includes('daytona')) return 'daytona';
  if (text.includes('indianapolis') || text.includes('brickyard')) return 'indianapolis';
  if (text.includes('laguna')) return 'laguna_seca';
  if (text.includes('tempelhof')) return 'tempelhof';
  if (text.includes('turini')) return 'turini';
  if (text.includes('mmrt') || text.includes('madras')) return 'mmrt';
  if (text.includes('kari')) return 'kari';

  if (text.includes('jerez')) return 'jerez';
  if (text.includes('mugello')) return 'mugello';
  if (text.includes('misano')) return 'misano';
  if (text.includes('motegi')) return 'motegi';
  if (text.includes('aragon') || text.includes('motorland')) return 'aragon';
  if (text.includes('sachsenring')) return 'sachsenring';
  if (text.includes('brno')) return 'brno';
  if (text.includes('balaton')) return 'balaton_park';
  if (text.includes('mandalika')) return 'mandalika';
  if (text.includes('phillip_island') || text.includes('phillip')) return 'phillip_island';
  if (text.includes('buriram') || text.includes('chang')) return 'buriram';
  if (text.includes('portimao') || text.includes('algarve')) return 'algarve';
  if (text.includes('ricardo_tormo') || text.includes('cheste')) return 'ricardo_tormo';

  const cleanFallback = rawName
    ? rawName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
    : rawId.toLowerCase().replace(/[^a-z0-9]/g, '_');

  return cleanFallback || 'circuit';
}

const championships = [
  { id: 'f1', rounds: f1Data.rounds },
  { id: 'f2', rounds: f2Data.rounds },
  { id: 'f3', rounds: f3Data.rounds },
  { id: 'wec', rounds: wecData.rounds },
  { id: 'motogp', rounds: motogpData.rounds },
];

for (const c of championships) {
  console.log(`\n=== ${c.id.toUpperCase()} CIRCUITS ===`);
  const resolved = c.rounds.map(r => {
    const key = normalizeCircuitIdTest({
      id: r.circuitName,
      circuitId: r.circuitName,
      name: r.circuitName,
      locality: r.location,
      country: r.country,
    });
    return { round: r.roundNumber, name: r.circuitName, key };
  });

  resolved.forEach(r => {
    console.log(`  Rnd ${String(r.round).padStart(2)}: "${r.name}" -> key: "${r.key}"`);
  });
}

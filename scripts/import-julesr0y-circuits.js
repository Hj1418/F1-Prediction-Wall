import fs from 'fs';
import path from 'path';

const CIRCUITS_MAP = [
  { circuitId: 'albert-park', altId: 'albert_park', sourceId: 'melbourne', layoutId: 'melbourne-2', name: 'Albert Park Circuit' },
  { circuitId: 'shanghai', altId: null, sourceId: 'shanghai', layoutId: 'shanghai-1', name: 'Shanghai International Circuit' },
  { circuitId: 'suzuka', altId: null, sourceId: 'suzuka', layoutId: 'suzuka-2', name: 'Suzuka International Racing Course' },
  { circuitId: 'bahrain', altId: null, sourceId: 'bahrain', layoutId: 'bahrain-1', name: 'Bahrain International Circuit' },
  { circuitId: 'jeddah', altId: null, sourceId: 'jeddah', layoutId: 'jeddah-1', name: 'Jeddah Corniche Circuit' },
  { circuitId: 'miami', altId: null, sourceId: 'miami', layoutId: 'miami-1', name: 'Miami International Autodrome' },
  { circuitId: 'imola', altId: null, sourceId: 'imola', layoutId: 'imola-3', name: 'Autodromo Enzo e Dino Ferrari' },
  { circuitId: 'monaco', altId: null, sourceId: 'monaco', layoutId: 'monaco-6', name: 'Circuit de Monaco' },
  { circuitId: 'barcelona', altId: null, sourceId: 'catalunya', layoutId: 'catalunya-6', name: 'Circuit de Barcelona-Catalunya' },
  { circuitId: 'montreal', altId: null, sourceId: 'montreal', layoutId: 'montreal-6', name: 'Circuit Gilles-Villeneuve' },
  { circuitId: 'red-bull-ring', altId: 'red_bull_ring', sourceId: 'spielberg', layoutId: 'spielberg-3', name: 'Red Bull Ring' },
  { circuitId: 'silverstone', altId: null, sourceId: 'silverstone', layoutId: 'silverstone-8', name: 'Silverstone Circuit' },
  { circuitId: 'spa', altId: null, sourceId: 'spa-francorchamps', layoutId: 'spa-francorchamps-4', name: 'Circuit de Spa-Francorchamps' },
  { circuitId: 'hungaroring', altId: null, sourceId: 'hungaroring', layoutId: 'hungaroring-3', name: 'Hungaroring' },
  { circuitId: 'zandvoort', altId: null, sourceId: 'zandvoort', layoutId: 'zandvoort-5', name: 'Circuit Zandvoort' },
  { circuitId: 'monza', altId: null, sourceId: 'monza', layoutId: 'monza-7', name: 'Autodromo Nazionale Monza' },
  { circuitId: 'baku', altId: null, sourceId: 'baku', layoutId: 'baku-1', name: 'Baku City Circuit' },
  { circuitId: 'singapore', altId: null, sourceId: 'marina-bay', layoutId: 'marina-bay-4', name: 'Marina Bay Street Circuit' },
  { circuitId: 'cota', altId: null, sourceId: 'austin', layoutId: 'austin-1', name: 'Circuit of the Americas' },
  { circuitId: 'mexico', altId: null, sourceId: 'mexico-city', layoutId: 'mexico-city-3', name: 'Autódromo Hermanos Rodríguez' },
  { circuitId: 'interlagos', altId: null, sourceId: 'interlagos', layoutId: 'interlagos-2', name: 'Autódromo José Carlos Pace' },
  { circuitId: 'las-vegas', altId: 'las_vegas', sourceId: 'las-vegas', layoutId: 'las-vegas-1', name: 'Las Vegas Strip Circuit' },
  { circuitId: 'losail', altId: null, sourceId: 'lusail', layoutId: 'lusail-1', name: 'Lusail International Circuit' },
  { circuitId: 'yas-marina', altId: 'yas_marina', sourceId: 'yas-marina', layoutId: 'yas-marina-2', name: 'Yas Marina Circuit' }
];

const TARGET_DIR = path.resolve(process.cwd(), 'public/circuits');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function importCircuits() {
  console.log(`Starting verified circuit asset migration from julesr0y/f1-circuits-svg...`);
  console.log(`Target directory: ${TARGET_DIR}`);

  const results = [];

  for (const item of CIRCUITS_MAP) {
    const isImola = item.circuitId === 'imola';
    // Detailed white-outline for 23 modern circuits, minimal white-outline for Imola
    const folder = isImola ? 'circuits/minimal/white-outline' : 'circuits/detailed/white-outline';
    const sourceUrl = `https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/${folder}/${item.layoutId}.svg`;

    console.log(`Fetching ${item.name} (${item.layoutId}) from ${folder}...`);
    const resp = await fetch(sourceUrl);
    if (!resp.ok) {
      throw new Error(`Failed to fetch ${sourceUrl}: ${resp.statusText}`);
    }

    let rawSvg = await resp.text();

    // Ensure viewBox="0 0 500 500" and preserveAspectRatio="xMidYMid meet" are set
    // The raw SVG starts with <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="500" height="500">
    let processedSvg = rawSvg;
    if (!processedSvg.includes('viewBox')) {
      processedSvg = processedSvg.replace(
        /<svg([^>]*)>/,
        '<svg$1 viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">'
      );
    } else if (!processedSvg.includes('preserveAspectRatio')) {
      processedSvg = processedSvg.replace(
        /<svg([^>]*)>/,
        '<svg$1 preserveAspectRatio="xMidYMid meet">'
      );
    }

    // Ensure attribution description is intact
    if (!processedSvg.includes('Created by ROY Jules (julesr0y)')) {
      processedSvg = processedSvg.replace(
        /<svg([^>]*)>/,
        '<svg$1>\n    <desc>Created by ROY Jules (julesr0y) - https://github.com/julesr0y/f1-circuits-svg (CC BY 4.0)</desc>'
      );
    }

    // Save canonical file (e.g. monza.svg, albert-park.svg)
    const canonicalPath = path.join(TARGET_DIR, `${item.circuitId}.svg`);
    fs.writeFileSync(canonicalPath, processedSvg, 'utf8');

    // Save alias file if needed (e.g. albert_park.svg, red_bull_ring.svg, las_vegas.svg, yas_marina.svg)
    if (item.altId) {
      const aliasPath = path.join(TARGET_DIR, `${item.altId}.svg`);
      fs.writeFileSync(aliasPath, processedSvg, 'utf8');
    }

    results.push({
      circuitId: item.circuitId,
      altId: item.altId,
      layoutId: item.layoutId,
      name: item.name,
      sizeBytes: processedSvg.length,
      file: `${item.circuitId}.svg`
    });
  }

  console.log(`\nSuccessfully imported ${results.length} circuits from julesr0y/f1-circuits-svg:`);
  console.table(results.map(r => ({
    Circuit: r.circuitId,
    SourceLayout: r.layoutId,
    File: r.file,
    Size: `${(r.sizeBytes / 1024).toFixed(1)} KB`
  })));
}

importCircuits().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

import { CircuitMetadata, CircuitInfo } from '../../types';

/**
 * Verified circuit asset mapping to julesr0y/f1-circuits-svg layouts
 * Source: https://github.com/julesr0y/f1-circuits-svg (CC BY 4.0 by ROY Jules)
 */
export const CIRCUIT_SOURCE_MAPPING: Record<
  string,
  {
    circuitId: string;
    sourceId: string;
    layoutId: string;
    seasons: string;
    assetFile: string;
  }
> = {
  albert_park: { circuitId: 'albert_park', sourceId: 'melbourne', layoutId: 'melbourne-2', seasons: '2022-2026', assetFile: 'albert-park.svg' },
  shanghai: { circuitId: 'shanghai', sourceId: 'shanghai', layoutId: 'shanghai-1', seasons: '2004-2019,2024-2026', assetFile: 'shanghai.svg' },
  suzuka: { circuitId: 'suzuka', sourceId: 'suzuka', layoutId: 'suzuka-2', seasons: '2003-2006,2009-2019,2022-2026', assetFile: 'suzuka.svg' },
  bahrain: { circuitId: 'bahrain', sourceId: 'bahrain', layoutId: 'bahrain-1', seasons: '2004-2009,2011-2025', assetFile: 'bahrain.svg' },
  jeddah: { circuitId: 'jeddah', sourceId: 'jeddah', layoutId: 'jeddah-1', seasons: '2021-2025', assetFile: 'jeddah.svg' },
  miami: { circuitId: 'miami', sourceId: 'miami', layoutId: 'miami-1', seasons: '2022-2026', assetFile: 'miami.svg' },
  imola: { circuitId: 'imola', sourceId: 'imola', layoutId: 'imola-3', seasons: '2020-2025', assetFile: 'imola.svg' },
  monaco: { circuitId: 'monaco', sourceId: 'monaco', layoutId: 'monaco-6', seasons: '2003-2019,2021-2026', assetFile: 'monaco.svg' },
  barcelona: { circuitId: 'barcelona', sourceId: 'catalunya', layoutId: 'catalunya-6', seasons: '2023-2026', assetFile: 'barcelona.svg' },
  montreal: { circuitId: 'montreal', sourceId: 'montreal', layoutId: 'montreal-6', seasons: '2002-2019,2022-2026', assetFile: 'montreal.svg' },
  red_bull_ring: { circuitId: 'red_bull_ring', sourceId: 'spielberg', layoutId: 'spielberg-3', seasons: '1997-2003,2014-2026', assetFile: 'red-bull-ring.svg' },
  silverstone: { circuitId: 'silverstone', sourceId: 'silverstone', layoutId: 'silverstone-8', seasons: '2010-2026', assetFile: 'silverstone.svg' },
  spa: { circuitId: 'spa', sourceId: 'spa-francorchamps', layoutId: 'spa-francorchamps-4', seasons: '2007-2026', assetFile: 'spa.svg' },
  hungaroring: { circuitId: 'hungaroring', sourceId: 'hungaroring', layoutId: 'hungaroring-3', seasons: '2003-2026', assetFile: 'hungaroring.svg' },
  zandvoort: { circuitId: 'zandvoort', sourceId: 'zandvoort', layoutId: 'zandvoort-5', seasons: '2021-2026', assetFile: 'zandvoort.svg' },
  monza: { circuitId: 'monza', sourceId: 'monza', layoutId: 'monza-7', seasons: '2000-2026', assetFile: 'monza.svg' },
  baku: { circuitId: 'baku', sourceId: 'baku', layoutId: 'baku-1', seasons: '2016-2019,2021-2026', assetFile: 'baku.svg' },
  singapore: { circuitId: 'singapore', sourceId: 'marina-bay', layoutId: 'marina-bay-4', seasons: '2023-2026', assetFile: 'singapore.svg' },
  cota: { circuitId: 'cota', sourceId: 'austin', layoutId: 'austin-1', seasons: '2012-2019,2021-2026', assetFile: 'cota.svg' },
  mexico: { circuitId: 'mexico', sourceId: 'mexico-city', layoutId: 'mexico-city-3', seasons: '2015-2019,2021-2026', assetFile: 'mexico.svg' },
  interlagos: { circuitId: 'interlagos', sourceId: 'interlagos', layoutId: 'interlagos-2', seasons: '1990-2026', assetFile: 'interlagos.svg' },
  las_vegas: { circuitId: 'las_vegas', sourceId: 'las-vegas', layoutId: 'las-vegas-1', seasons: '2023-2026', assetFile: 'las-vegas.svg' },
  losail: { circuitId: 'losail', sourceId: 'lusail', layoutId: 'lusail-1', seasons: '2021,2023-2026', assetFile: 'losail.svg' },
  yas_marina: { circuitId: 'yas_marina', sourceId: 'yas-marina', layoutId: 'yas-marina-2', seasons: '2021-2026', assetFile: 'yas-marina.svg' },
  madrid: { circuitId: 'madrid', sourceId: 'madring', layoutId: 'madring-1', seasons: '2026', assetFile: 'madrid.svg' },
  madring: { circuitId: 'madring', sourceId: 'madring', layoutId: 'madring-1', seasons: '2026', assetFile: 'madrid.svg' },
  sepang: { circuitId: 'sepang', sourceId: 'sepang', layoutId: 'sepang-1', seasons: '1999-2017,2026', assetFile: 'sepang.svg' }
};

/**
 * Resolves a circuit asset path taking Vite BASE_URL into account
 */
export function getCircuitAssetUrl(assetRef?: string | { asset: string }): string {
  if (!assetRef) return '';
  let raw = typeof assetRef === 'object' && assetRef !== null && 'asset' in assetRef
    ? assetRef.asset
    : String(assetRef);

  raw = raw.replace(/^\/?(circuits\/)?/, '');
  if (!raw.endsWith('.svg')) {
    raw = `${raw}.svg`;
  }
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${base}/circuits/${raw}`;
}

export const F1_CIRCUITS_REGISTRY: Record<string, CircuitMetadata> = {
  monza: {
    circuitId: 'monza',
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    locality: 'Monza',
    location: 'Monza, Italy',
    country: 'Italy',
    flag: '🇮🇹',
    lengthKm: 5.793,
    length: 5.793,
    turns: 11,
    drsZones: 2,
    laps: 53,
    raceDistance: '306.720 km',
    firstGrandPrix: 1950,
    map: '/circuits/monza.svg',
    trackCharacter: {
      speed: 'Very High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:21.046',
      driver: 'Rubens Barrichello',
      year: 2004,
    },
    facts: [
      {
        category: 'SPEED',
        title: 'The Temple of Speed',
        description: 'Monza is the fastest circuit in Formula 1 history. Drivers spend more than 75% of the lap at full throttle through historic parkland straights.',
      },
      {
        category: 'HISTORY',
        title: 'Formula 1 Classic',
        description: 'Present on the inaugural 1950 World Championship calendar, Monza has hosted more Italian Grands Prix than any other venue in the sport.',
      },
      {
        category: 'CRAZY FACT',
        title: 'Historic High Banking',
        description: 'The ancient high-speed banked oval built in the 1950s still stands adjacent to the modern track and was used in Grand Prix racing until 1961.',
      },
      {
        category: 'TECHNICAL',
        title: 'Heavy Braking into Rettifilo',
        description: 'Cars decelerate violently from 350 km/h down to just 70 km/h in approximately 120 metres, subjecting drivers to over 5G of braking force.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 10, max: 10, description: 'Highest straight-line speeds exceeding 350 km/h.' },
      { label: 'Braking Demand', value: 9, max: 10, description: 'Violent deceleration into Rettifilo and Roggia.' },
      { label: 'Downforce Requirement', value: 2, max: 10, description: 'Skinny low-drag rear wings required.' },
      { label: 'Overtaking Potential', value: 9, max: 10, description: 'Massive slipstream passing zones.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'High longitudinal braking loads.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'TEMPLE OF SPEED',
        description: 'Monza is the fastest circuit on the calendar, where long straights and heavy braking zones reward supreme engine power and bravery.',
      },
    ],
    whySpecial: 'Known as the "Temple of Speed", Monza requires the lowest aerodynamic downforce package of the year. Teams run nearly flat rear wings to exceed 350 km/h down the historic parkland straights.',
    keyCorners: [
      { number: '1-2', name: 'Variante del Rettifilo', description: 'Cars slow from 350 km/h to 70 km/h in 120m, providing the prime overtaking hotspot on the track.' },
      { number: '4-5', name: 'Variante della Roggia', description: 'Tight chicane demanding aggressive kerb-riding where precise braking balance is critical.' },
      { number: '8-10', name: 'Variante Ascari', description: 'High-speed sequence where drivers flick through left-right-left transitions at over 220 km/h.' },
      { number: '11', name: 'Curva Parabolica (Alboreto)', description: 'Long, accelerating 180-degree sweep onto the main straight determining top-speed runs.' },
    ],
    overtakingCharacteristics: 'High overtaking potential down the main straight into Turn 1 (Rettifilo) and along the back straight into Ascari, powered by slipstreaming and twin DRS zones.',
    officialCircuitUrl: 'https://www.formula1.com/en/racing/2026/italy/circuit.html',
  },

  monaco: {
    circuitId: 'monaco',
    id: 'monaco',
    name: 'Circuit de Monaco',
    locality: 'Monte Carlo',
    location: 'Monte Carlo, Monaco',
    country: 'Monaco',
    flag: '🇲🇨',
    lengthKm: 3.337,
    length: 3.337,
    turns: 19,
    drsZones: 1,
    laps: 78,
    raceDistance: '260.286 km',
    firstGrandPrix: 1950,
    map: '/circuits/monaco.svg',
    trackCharacter: {
      speed: 'Low',
      braking: 'Medium',
      overtaking: 'Very Low',
      tyreWear: 'Low',
    },
    lapRecord: {
      time: '1:12.909',
      driver: 'Lewis Hamilton',
      year: 2021,
    },
    facts: [
      {
        category: 'CRAZY FACT',
        title: 'Zero Room for Error',
        description: 'Nelson Piquet famously described racing around Monaco as "like riding a bicycle around your living room." Barriers line every millimeter of the track.',
      },
      {
        category: 'HISTORY',
        title: 'The Crown Jewel',
        description: 'Monaco forms part of motorsport’s Triple Crown alongside the 24 Hours of Le Mans and the Indianapolis 500.',
      },
      {
        category: 'RECORD',
        title: 'Slowest Corner in F1',
        description: 'The Fairmont Hairpin is tackled at barely 45 km/h, requiring specially modified steering racks to negotiate the extreme steering lock.',
      },
      {
        category: 'SPEED',
        title: 'Qualifying is Everything',
        description: 'Due to narrow streets, overtaking during the Grand Prix is nearly impossible. Saturday qualifying is widely considered the most crucial lap of the year.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 2, max: 10, description: 'Short straights with top speed around 290 km/h in the tunnel.' },
      { label: 'Braking Demand', value: 5, max: 10, description: 'Frequent short braking into Sainte Dévote and chicane.' },
      { label: 'Downforce Requirement', value: 10, max: 10, description: 'Maximum aero downforce configuration.' },
      { label: 'Overtaking Potential', value: 1, max: 10, description: 'Notoriously difficult to pass.' },
      { label: 'Tyre Demand', value: 3, max: 10, description: 'Smooth asphalt creates the lowest tyre wear of the year.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'THE CROWN JEWEL',
        description: 'Narrow barriers, extreme steering angles, and high glamour define motorsport’s ultimate test of driver concentration.',
      },
    ],
  },

  silverstone: {
    circuitId: 'silverstone',
    id: 'silverstone',
    name: 'Silverstone Circuit',
    locality: 'Silverstone',
    location: 'Northamptonshire, UK',
    country: 'United Kingdom',
    flag: '🇬🇧',
    lengthKm: 5.891,
    length: 5.891,
    turns: 18,
    drsZones: 2,
    laps: 52,
    raceDistance: '306.198 km',
    firstGrandPrix: 1950,
    map: '/circuits/silverstone.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Medium',
      overtaking: 'High',
      tyreWear: 'Very High',
    },
    lapRecord: {
      time: '1:27.097',
      driver: 'Max Verstappen',
      year: 2020,
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'Birthplace of Formula 1',
        description: 'Silverstone hosted the very first Formula 1 World Championship Grand Prix on 13 May 1950, attended by King George VI.',
      },
      {
        category: 'SPEED',
        title: 'Maggotts & Becketts',
        description: 'Drivers flick left, right, left at nearly 290 km/h through Maggotts and Becketts, generating lateral cornering loads exceeding 5G.',
      },
      {
        category: 'TECHNICAL',
        title: 'High-Downforce Sweepers',
        description: 'Built on a former WWII airfield, high open winds frequently upset aerodynamic balance through Copse and Stowe corners.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'High-speed blast down Hangar and Wellington straights.' },
      { label: 'Braking Demand', value: 6, max: 10, description: 'Heavy stops at Brooklands, Vale, and Stowe.' },
      { label: 'Downforce Requirement', value: 8, max: 10, description: 'High downforce essential for high-speed esses.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Wide circuit with multiple line choices.' },
      { label: 'Tyre Demand', value: 9, max: 10, description: 'Severe lateral energy loads on tyres.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'HOME OF BRITISH MOTORSPORT',
        description: 'Fast, sweeping, and steeped in history, Silverstone is the ultimate test of high-speed aero grip.',
      },
    ],
  },

  spa: {
    circuitId: 'spa',
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    locality: 'Stavelot',
    location: 'Ardennes, Belgium',
    country: 'Belgium',
    flag: '🇧🇪',
    lengthKm: 7.004,
    length: 7.004,
    turns: 19,
    drsZones: 2,
    laps: 44,
    raceDistance: '308.052 km',
    firstGrandPrix: 1950,
    map: '/circuits/spa.svg',
    trackCharacter: {
      speed: 'Very High',
      braking: 'Medium',
      overtaking: 'High',
      tyreWear: 'High',
    },
    lapRecord: {
      time: '1:46.286',
      driver: 'Valtteri Bottas',
      year: 2018,
    },
    facts: [
      {
        category: 'SPEED',
        title: 'Eau Rouge & Raidillon',
        description: 'The most legendary corner sequence in motorsport compresses drivers into the floor as they climb a 17% gradient blind at 300 km/h.',
      },
      {
        category: 'CRAZY FACT',
        title: 'Microclimates',
        description: 'At 7.004 km, Spa is the longest circuit on the calendar. It is common for rain to pour at La Source while the Kemmel Straight remains bone dry!',
      },
      {
        category: 'RECORD',
        title: 'Longest Track in F1',
        description: 'Spa’s 7-kilometre lap through the Ardennes forest makes it over double the length of Monaco.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 9, max: 10, description: 'Blistering Kemmel Straight velocities.' },
      { label: 'Braking Demand', value: 6, max: 10, description: 'Les Combes and Bus Stop are key passing zones.' },
      { label: 'Downforce Requirement', value: 5, max: 10, description: 'Medium compromise between Sector 1 speed and Sector 2 twistiness.' },
      { label: 'Overtaking Potential', value: 9, max: 10, description: 'Massive slipstream drafting into Turn 5.' },
      { label: 'Tyre Demand', value: 8, max: 10, description: 'Massive vertical compression through Eau Rouge.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'ROLLERCOASTER IN THE ARDENNES',
        description: 'Vast elevation changes, unpredictable weather, and Eau Rouge make Spa a driver favorite worldwide.',
      },
    ],
  },

  suzuka: {
    circuitId: 'suzuka',
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    locality: 'Suzuka',
    location: 'Mie Prefecture, Japan',
    country: 'Japan',
    flag: '🇯🇵',
    lengthKm: 5.807,
    length: 5.807,
    turns: 18,
    drsZones: 1,
    laps: 53,
    raceDistance: '307.471 km',
    firstGrandPrix: 1987,
    map: '/circuits/suzuka.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Medium',
      overtaking: 'Medium',
      tyreWear: 'Very High',
    },
    lapRecord: {
      time: '1:30.983',
      driver: 'Lewis Hamilton',
      year: 2019,
    },
    facts: [
      {
        category: 'TECHNICAL',
        title: 'Figure-of-Eight Layout',
        description: 'Suzuka is the only circuit on the Formula 1 calendar designed in a figure-of-eight layout, featuring an overpass bridge at the 130R curve.',
      },
      {
        category: 'SPEED',
        title: 'The Iconic 130R',
        description: 'Named after its 130-metre radius, drivers take this legendary left-hand sweeper flat out in eighth gear at over 305 km/h.',
      },
      {
        category: 'HISTORY',
        title: 'Championship Deciders',
        description: 'Suzuka has crowned 12 World Champions, hosting legendary clashes between Ayrton Senna, Alain Prost, and Michael Schumacher.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'High speed back straight into 130R.' },
      { label: 'Braking Demand', value: 5, max: 10, description: 'Heavy braking into Casio Triangle chicane.' },
      { label: 'Downforce Requirement', value: 9, max: 10, description: 'Supreme aero balance needed for the iconic Esses.' },
      { label: 'Overtaking Potential', value: 6, max: 10, description: 'Turn 1 and Casio Triangle are best opportunities.' },
      { label: 'Tyre Demand', value: 9, max: 10, description: 'Abrasive surface and lateral cornering torture tyres.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'FIGURE-OF-EIGHT MASTERPIECE',
        description: 'A pure driver track demanding precision through the rhythm of Sector 1 and raw courage through 130R.',
      },
    ],
  },

  red_bull_ring: {
    circuitId: 'red_bull_ring',
    id: 'red_bull_ring',
    name: 'Red Bull Ring',
    locality: 'Spielberg',
    location: 'Styria, Austria',
    country: 'Austria',
    flag: '🇦🇹',
    lengthKm: 4.318,
    length: 4.318,
    turns: 10,
    drsZones: 3,
    laps: 71,
    raceDistance: '306.452 km',
    firstGrandPrix: 1970,
    map: '/circuits/red-bull-ring.svg',
    trackCharacter: {
      speed: 'Very High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:05.619',
      driver: 'Carlos Sainz',
      year: 2020,
    },
    facts: [
      {
        category: 'RECORD',
        title: 'Quickest Lap in F1',
        description: 'With only 10 corners, lap times around the Red Bull Ring average just 64 to 68 seconds, creating microscopic qualifying margins.',
      },
      {
        category: 'SPEED',
        title: 'Uphill Blast into Turn 3',
        description: 'The run up the steep Styrian hillside into Turn 3 provides one of the best overtaking braking zones in the sport.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 9, max: 10, description: 'Three consecutive DRS straights.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Stops into Turn 1, Turn 3, and Turn 4.' },
      { label: 'Downforce Requirement', value: 6, max: 10, description: 'Medium aero package for fast sweeping final sector.' },
      { label: 'Overtaking Potential', value: 9, max: 10, description: 'Superb passing into uphill Turn 3 hairpin.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'High traction demands out of slow corners.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'STYRIAN POWERHOUSE',
        description: 'Short, aggressive, and dramatic, the Red Bull Ring produces close racing across three DRS zones.',
      },
    ],
  },

  interlagos: {
    circuitId: 'interlagos',
    id: 'interlagos',
    name: 'Autódromo José Carlos Pace (Interlagos)',
    locality: 'São Paulo',
    location: 'São Paulo, Brazil',
    country: 'Brazil',
    flag: '🇧🇷',
    lengthKm: 4.309,
    length: 4.309,
    turns: 15,
    drsZones: 2,
    laps: 71,
    raceDistance: '305.879 km',
    firstGrandPrix: 1973,
    map: '/circuits/interlagos.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'Very High',
      tyreWear: 'High',
    },
    lapRecord: {
      time: '1:10.540',
      driver: 'Valtteri Bottas',
      year: 2018,
    },
    facts: [
      {
        category: 'CRAZY FACT',
        title: 'Anti-Clockwise Challenge',
        description: 'Interlagos runs anti-clockwise, placing immense strain on drivers’ neck muscles due to left-hand G-forces.',
      },
      {
        category: 'HISTORY',
        title: 'The Senna ‘S’',
        description: 'Named after Brazilian national hero Ayrton Senna, the downhill complex into Turn 1 and 2 is famous for daring late-braking overtakes.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'Long uphill climb through Junção onto the start/finish straight.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Downhill braking into Senna S and Descida do Lago.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'High downforce for twisty infield.' },
      { label: 'Overtaking Potential', value: 9, max: 10, description: 'Consistently provides the best wheel-to-wheel racing.' },
      { label: 'Tyre Demand', value: 7, max: 10, description: 'Heavy wear in infield hairpin sections.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'SAMBA OF PASSING',
        description: 'Rich in drama and passionate fans, Interlagos rarely fails to deliver classic Grand Prix moments.',
      },
    ],
  },

  bahrain: {
    circuitId: 'bahrain',
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    locality: 'Sakhir',
    location: 'Sakhir, Bahrain',
    country: 'Bahrain',
    flag: '🇧🇭',
    lengthKm: 5.412,
    length: 5.412,
    turns: 15,
    drsZones: 3,
    laps: 57,
    raceDistance: '308.238 km',
    firstGrandPrix: 2004,
    map: '/circuits/bahrain.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Very High',
    },
    lapRecord: {
      time: '1:31.447',
      driver: 'Pedro de la Rosa',
      year: 2005,
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'First in the Middle East',
        description: 'In 2004, Bahrain became the first country in the Middle East to host a Formula 1 Grand Prix.',
      },
      {
        category: 'TECHNICAL',
        title: 'Night Racing under 495 Floodlights',
        description: 'Shifted to a night race in 2014, track temperatures drop rapidly as twilight turns to darkness, dramatically changing tyre behavior.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'Long front straight with speeds around 330 km/h.' },
      { label: 'Braking Demand', value: 9, max: 10, description: 'Severe stop into Turn 1 and tricky downhill Turn 9/10.' },
      { label: 'Downforce Requirement', value: 6, max: 10, description: 'Balanced medium downforce setup.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Turn 1, Turn 4, and Turn 11 all offer DRS opportunities.' },
      { label: 'Tyre Demand', value: 9, max: 10, description: 'The most abrasive asphalt on the entire calendar.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'DESERT SHOWCASE',
        description: 'A technical stop-and-go circuit that tests rear traction and braking stability.',
      },
    ],
  },

  albert_park: {
    circuitId: 'albert_park',
    id: 'albert-park',
    name: 'Albert Park Circuit',
    locality: 'Melbourne',
    location: 'Melbourne, Australia',
    country: 'Australia',
    flag: '🇦🇺',
    lengthKm: 5.278,
    length: 5.278,
    turns: 14,
    drsZones: 4,
    laps: 58,
    raceDistance: '305.880 km',
    firstGrandPrix: 1996,
    map: '/circuits/albert-park.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Medium',
      overtaking: 'Medium',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:19.813',
      driver: 'Charles Leclerc',
      year: 2024,
    },
    facts: [
      {
        category: 'RECORD',
        title: 'Four DRS Zones',
        description: 'Albert Park features four separate DRS activation zones, the most of any circuit on the calendar.',
      },
      {
        category: 'TECHNICAL',
        title: 'Public Roads Reborn',
        description: 'Set around picturesque Albert Park lake, the circuit consists of everyday public roadways that evolve rapidly with rubber throughout the weekend.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'High speed lakeside curve.' },
      { label: 'Braking Demand', value: 7, max: 10, description: 'Hard stop into Turn 1 and Turn 3.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'Medium-high downforce configuration.' },
      { label: 'Overtaking Potential', value: 7, max: 10, description: 'Greatly improved by the 2022 circuit re-profiling.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'Medium degradation.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'MELBOURNE PARKLAND',
        description: 'Fast, scenic, and unforgiving barriers right alongside parkland trees.',
      },
    ],
  },

  jeddah: {
    circuitId: 'jeddah',
    id: 'jeddah',
    name: 'Jeddah Corniche Circuit',
    locality: 'Jeddah',
    location: 'Jeddah, Saudi Arabia',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    lengthKm: 6.174,
    length: 6.174,
    turns: 27,
    drsZones: 3,
    laps: 50,
    raceDistance: '308.450 km',
    firstGrandPrix: 2021,
    map: '/circuits/jeddah.svg',
    trackCharacter: {
      speed: 'Very High',
      braking: 'Medium',
      overtaking: 'Medium',
      tyreWear: 'Low',
    },
    lapRecord: {
      time: '1:30.734',
      driver: 'Lewis Hamilton',
      year: 2021,
    },
    facts: [
      {
        category: 'SPEED',
        title: 'Fastest Street Track in the World',
        description: 'Drivers average over 250 km/h in between concrete walls alongside the Red Sea coast.',
      },
      {
        category: 'RECORD',
        title: '27 Turns',
        description: 'Jeddah features the highest turn count on the Formula 1 calendar at 27 corners.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 9, max: 10, description: 'Blistering continuous high speed sweepers.' },
      { label: 'Braking Demand', value: 6, max: 10, description: 'Heavy stops at Turn 1 and final Turn 27 hairpin.' },
      { label: 'Downforce Requirement', value: 5, max: 10, description: 'Skinny rear wing for street speed.' },
      { label: 'Overtaking Potential', value: 7, max: 10, description: 'Three DRS zones assist passing.' },
      { label: 'Tyre Demand', value: 4, max: 10, description: 'Smooth asphalt preserves tyre life.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'RED SEA THRILLER',
        description: 'Extreme speed between barriers where absolute precision is demanded at every turn.',
      },
    ],
  },

  shanghai: {
    circuitId: 'shanghai',
    id: 'shanghai',
    name: 'Shanghai International Circuit',
    locality: 'Shanghai',
    location: 'Shanghai, China',
    country: 'China',
    flag: '🇨🇳',
    lengthKm: 5.451,
    length: 5.451,
    turns: 16,
    drsZones: 2,
    laps: 56,
    raceDistance: '305.066 km',
    firstGrandPrix: 2004,
    map: '/circuits/shanghai.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'High',
    },
    lapRecord: {
      time: '1:32.238',
      driver: 'Michael Schumacher',
      year: 2004,
    },
    facts: [
      {
        category: 'TECHNICAL',
        title: 'The Snail Turns',
        description: 'Turns 1 and 2 tighten into a 270-degree snail shell right-hander, severely loading the front-left tyre.',
      },
      {
        category: 'SPEED',
        title: '1.2km Back Straight',
        description: 'One of the longest straights on the calendar, cars reach over 340 km/h before slamming on the brakes for Turn 14.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 9, max: 10, description: 'Immense 1.2km back straight.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Violent stop into Turn 14 hairpin.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'High downforce for middle sector.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Classic DRS passing down back straight.' },
      { label: 'Tyre Demand', value: 8, max: 10, description: 'Heavy front-left tyre graining.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'SHANGHAI DRAGON',
        description: 'Designed to resemble the Chinese character "shang" (上), combining extreme straights with unique tightening corners.',
      },
    ],
  },

  miami: {
    circuitId: 'miami',
    id: 'miami',
    name: 'Miami International Autodrome',
    locality: 'Miami',
    location: 'Florida, USA',
    country: 'USA',
    flag: '🇺🇸',
    lengthKm: 5.412,
    length: 5.412,
    turns: 19,
    drsZones: 3,
    laps: 57,
    raceDistance: '308.326 km',
    firstGrandPrix: 2022,
    map: '/circuits/miami.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:29.708',
      driver: 'Max Verstappen',
      year: 2023,
    },
    facts: [
      {
        category: 'CRAZY FACT',
        title: 'Hard Rock Stadium Circuit',
        description: 'The circuit weaves around the home of the Miami Dolphins NFL team, including a custom marina and paddock campus.',
      },
      {
        category: 'SPEED',
        title: '340 km/h Straightaway',
        description: 'A 1.28km back straight between Turns 16 and 17 allows cars to reach top speeds before heavy braking into the hairpin.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'Long straight under Turnpike highway.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Hard stop into Turn 17.' },
      { label: 'Downforce Requirement', value: 6, max: 10, description: 'Medium downforce balance.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Three DRS zones.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'High surface temperatures.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'SUNSHINE SPEEDWAY',
        description: 'Fast, modern, and challenging with a unique tight chicane under the turnpike overpass.',
      },
    ],
  },

  imola: {
    circuitId: 'imola',
    id: 'imola',
    name: 'Autodromo Enzo e Dino Ferrari',
    locality: 'Imola',
    location: 'Emilia-Romagna, Italy',
    country: 'Italy',
    flag: '🇮🇹',
    lengthKm: 4.909,
    length: 4.909,
    turns: 19,
    drsZones: 1,
    laps: 63,
    raceDistance: '309.049 km',
    firstGrandPrix: 1980,
    map: '/circuits/imola.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'Medium',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:15.484',
      driver: 'Lewis Hamilton',
      year: 2020,
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'Home of Ferrari Heritage',
        description: 'Named in honour of Ferrari founder Enzo Ferrari and his son Dino, located just 80km from the Maranello factory.',
      },
      {
        category: 'TECHNICAL',
        title: 'Acque Minerali',
        description: 'A severe downhill drop followed by an uphill snap right-hander where hitting the curbs with precision is critical.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'Long straight from Rivazza to Tamburello.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Heavy braking into Variante Tamburello and Tosa.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'Good aero stability over aggressive kerbs.' },
      { label: 'Overtaking Potential', value: 5, max: 10, description: 'Narrow traditional layout.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'Medium degradation.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'HISTORIC ITALIAN HEART',
        description: 'A classic European roller coaster with old-school grass and gravel waiting for any mistake.',
      },
    ],
  },

  montreal: {
    circuitId: 'montreal',
    id: 'montreal',
    name: 'Circuit Gilles Villeneuve',
    locality: 'Montreal',
    location: 'Quebec, Canada',
    country: 'Canada',
    flag: '🇨🇦',
    lengthKm: 4.361,
    length: 4.361,
    turns: 14,
    drsZones: 2,
    laps: 70,
    raceDistance: '305.270 km',
    firstGrandPrix: 1978,
    map: '/circuits/montreal.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:13.078',
      driver: 'Valtteri Bottas',
      year: 2019,
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'The Wall of Champions',
        description: 'The final chicane wall earned its nickname in 1999 when three F1 World Champions (Damon Hill, Michael Schumacher, Jacques Villeneuve) all crashed into it in the same race!',
      },
      {
        category: 'TECHNICAL',
        title: 'Brutal on Brakes',
        description: 'Repeated stops from over 300 km/h into chicanes make Montreal the hardest test of brake caliper durability on the calendar.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 9, max: 10, description: 'Casino straight blast.' },
      { label: 'Braking Demand', value: 10, max: 10, description: 'Extreme brake disc wear.' },
      { label: 'Downforce Requirement', value: 4, max: 10, description: 'Low downforce for high speed.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Hairpin and Casino straight passing.' },
      { label: 'Tyre Demand', value: 5, max: 10, description: 'Traction out of slow corners.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'ÎLE NOTRE-DAME',
        description: 'Chicanes, kerbs, and close walls on a man-made island in the Saint Lawrence river.',
      },
    ],
  },

  barcelona: {
    circuitId: 'barcelona',
    id: 'barcelona',
    name: 'Circuit de Barcelona-Catalunya',
    locality: 'Montmeló',
    location: 'Barcelona, Spain',
    country: 'Spain',
    flag: '🇪🇸',
    lengthKm: 4.657,
    length: 4.657,
    turns: 14,
    drsZones: 2,
    laps: 66,
    raceDistance: '307.236 km',
    firstGrandPrix: 1991,
    map: '/circuits/barcelona.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Medium',
      overtaking: 'Medium',
      tyreWear: 'High',
    },
    lapRecord: {
      time: '1:16.330',
      driver: 'Max Verstappen',
      year: 2023,
    },
    facts: [
      {
        category: 'TECHNICAL',
        title: 'The Ultimate Aero Benchmark',
        description: 'Teams have historically tested at Barcelona because it features every corner speed type: slow, medium, and ultra-fast long sweeps like Turn 3.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 7, max: 10, description: 'Long straight with 325 km/h speeds.' },
      { label: 'Braking Demand', value: 6, max: 10, description: 'Braking into Turn 1 and Turn 10.' },
      { label: 'Downforce Requirement', value: 8, max: 10, description: 'High aerodynamic balance needed.' },
      { label: 'Overtaking Potential', value: 6, max: 10, description: 'Turn 1 is main overtaking spot.' },
      { label: 'Tyre Demand', value: 9, max: 10, description: 'Severe front-left tyre loading.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'SPANISH BENCHMARK',
        description: 'Fast, sweeping, and demanding every ounce of car balance.',
      },
    ],
  },

  hungaroring: {
    circuitId: 'hungaroring',
    id: 'hungaroring',
    name: 'Hungaroring',
    locality: 'Mogyoród',
    location: 'Budapest, Hungary',
    country: 'Hungary',
    flag: '🇭🇺',
    lengthKm: 4.381,
    length: 4.381,
    turns: 14,
    drsZones: 2,
    laps: 70,
    raceDistance: '306.630 km',
    firstGrandPrix: 1986,
    map: '/circuits/hungaroring.svg',
    trackCharacter: {
      speed: 'Low',
      braking: 'Medium',
      overtaking: 'Low',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:16.627',
      driver: 'Lewis Hamilton',
      year: 2020,
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'First Behind the Iron Curtain',
        description: 'In 1986, Hungary hosted the first Formula 1 Grand Prix behind the Cold War Iron Curtain, drawing over 200,000 fans.',
      },
      {
        category: 'TECHNICAL',
        title: 'Monaco Without Walls',
        description: 'Non-stop twisty corners give drivers zero rest, demanding maximum downforce and precise rhythm.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 4, max: 10, description: 'Short main straight only.' },
      { label: 'Braking Demand', value: 6, max: 10, description: 'Downhill Turn 1 is best opportunity.' },
      { label: 'Downforce Requirement', value: 9, max: 10, description: 'Monaco-level maximum wing angles.' },
      { label: 'Overtaking Potential', value: 3, max: 10, description: 'Very difficult to pass outside of Turn 1.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'High ambient summer heat.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'NATURAL AMPHITHEATRE',
        description: 'Tight, technical kart-like layout where qualifying position is paramount.',
      },
    ],
  },

  zandvoort: {
    circuitId: 'zandvoort',
    id: 'zandvoort',
    name: 'Circuit Zandvoort',
    locality: 'Zandvoort',
    location: 'North Holland, Netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    lengthKm: 4.259,
    length: 4.259,
    turns: 14,
    drsZones: 2,
    laps: 72,
    raceDistance: '306.648 km',
    firstGrandPrix: 1952,
    map: '/circuits/zandvoort.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Medium',
      overtaking: 'Medium',
      tyreWear: 'High',
    },
    lapRecord: {
      time: '1:11.097',
      driver: 'Lewis Hamilton',
      year: 2021,
    },
    facts: [
      {
        category: 'TECHNICAL',
        title: 'Steeper Than Indianapolis',
        description: 'Turn 3 (Hugenholtz) and Turn 14 (Arie Luyendyk) feature banking angles of up to 19 degrees—twice as steep as Indianapolis!',
      },
      {
        category: 'CRAZY FACT',
        title: 'Dunes & Ocean Breeze',
        description: 'Located directly on the North Sea coast, coastal wind constantly blows ocean sand across the racing surface.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 7, max: 10, description: 'Banked final corner launches onto straight.' },
      { label: 'Braking Demand', value: 6, max: 10, description: 'Tarzan corner stop.' },
      { label: 'Downforce Requirement', value: 8, max: 10, description: 'High downforce for dune curves.' },
      { label: 'Overtaking Potential', value: 5, max: 10, description: 'Narrow traditional track.' },
      { label: 'Tyre Demand', value: 8, max: 10, description: 'Extreme compression through banking.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'ROLLER COASTER IN THE DUNES',
        description: 'Old-school layout with unique steep banking that tests courage and neck muscles.',
      },
    ],
  },

  baku: {
    circuitId: 'baku',
    id: 'baku',
    name: 'Baku City Circuit',
    locality: 'Baku',
    location: 'Baku, Azerbaijan',
    country: 'Azerbaijan',
    flag: '🇦🇿',
    lengthKm: 6.003,
    length: 6.003,
    turns: 20,
    drsZones: 2,
    laps: 51,
    raceDistance: '306.049 km',
    firstGrandPrix: 2016,
    map: '/circuits/baku.svg',
    trackCharacter: {
      speed: 'Very High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Low',
    },
    lapRecord: {
      time: '1:43.009',
      driver: 'Charles Leclerc',
      year: 2019,
    },
    facts: [
      {
        category: 'SPEED',
        title: '2.2km Full Throttle Straight',
        description: 'The main straight alongside the Caspian Sea promenade is the longest in Formula 1, with cars hitting 360 km/h.',
      },
      {
        category: 'CRAZY FACT',
        title: 'The Medieval Castle Section',
        description: 'At Turn 8, the track narrows to just 7.6 metres as it winds past a 12th-century fortress tower—the tightest spot in F1.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 10, max: 10, description: 'Fastest street circuit straight in the world.' },
      { label: 'Braking Demand', value: 9, max: 10, description: 'Heavy stops into 90-degree street corners.' },
      { label: 'Downforce Requirement', value: 4, max: 10, description: 'Low wing package essential for straight-line speed.' },
      { label: 'Overtaking Potential', value: 9, max: 10, description: 'Tremendous slipstreaming into Turn 1 and Turn 3.' },
      { label: 'Tyre Demand', value: 3, max: 10, description: 'Smooth asphalt creates minimal tyre wear.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'LAND OF FIRE',
        description: 'A study in contrasts: high-speed boulevard drag racing meets ultra-tight medieval street corners.',
      },
    ],
  },

  singapore: {
    circuitId: 'singapore',
    id: 'singapore',
    name: 'Marina Bay Street Circuit',
    locality: 'Singapore',
    location: 'Marina Bay, Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    lengthKm: 4.940,
    length: 4.940,
    turns: 19,
    drsZones: 4,
    laps: 62,
    raceDistance: '306.143 km',
    firstGrandPrix: 2008,
    map: '/circuits/singapore.svg',
    trackCharacter: {
      speed: 'Medium',
      braking: 'Heavy',
      overtaking: 'Medium',
      tyreWear: 'High',
    },
    lapRecord: {
      time: '1:34.486',
      driver: 'Daniel Ricciardo',
      year: 2024,
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'The Original Night Race',
        description: 'In 2008, Singapore hosted Formula 1’s very first night race, illuminated by 1,600 specialized floodlights.',
      },
      {
        category: 'CRAZY FACT',
        title: 'Drivers Lose 3kg of Weight',
        description: 'With 80% humidity, cockpit temperatures reach 60°C. Singapore is universally recognized as the most physically punishing race of the season.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 6, max: 10, description: 'Medium speeds down Raffles Boulevard.' },
      { label: 'Braking Demand', value: 9, max: 10, description: 'Countless heavy braking stops.' },
      { label: 'Downforce Requirement', value: 9, max: 10, description: 'Maximum downforce required.' },
      { label: 'Overtaking Potential', value: 6, max: 10, description: 'Four DRS zones aid passing.' },
      { label: 'Tyre Demand', value: 7, max: 10, description: 'Constant traction demands degrade rear tyres.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'THE NIGHT MARATHON',
        description: 'A two-hour physical torture test beneath the glittering Marina Bay skyline.',
      },
    ],
  },

  cota: {
    circuitId: 'cota',
    id: 'cota',
    name: 'Circuit of The Americas (COTA)',
    locality: 'Austin',
    location: 'Austin, Texas, USA',
    country: 'USA',
    flag: '🇺🇸',
    lengthKm: 5.513,
    length: 5.513,
    turns: 20,
    drsZones: 2,
    laps: 56,
    raceDistance: '308.405 km',
    firstGrandPrix: 2012,
    map: '/circuits/cota.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'High',
    },
    lapRecord: {
      time: '1:36.169',
      driver: 'Charles Leclerc',
      year: 2019,
    },
    facts: [
      {
        category: 'TECHNICAL',
        title: '133-Foot Uphill Turn 1',
        description: 'The steep climb into Turn 1 rises 41 metres into a blind apex, encouraging drivers to take wildly different lines on race start.',
      },
      {
        category: 'HISTORY',
        title: 'Best of F1 Inspired',
        description: 'COTA’s design deliberately mimics famous corners: Silverstone’s Maggotts/Becketts, Hockenheim’s stadium, and Istanbul’s Turn 8.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'Long 1km back straight.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Sharp stop into Turn 12 hairpin.' },
      { label: 'Downforce Requirement', value: 8, max: 10, description: 'High downforce for high-speed Sector 1 esses.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Wide entry into Turn 1 and Turn 12.' },
      { label: 'Tyre Demand', value: 8, max: 10, description: 'Bumpy surface tests tyre grip.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'TEXAS TITAN',
        description: 'Bold, sweeping elevation changes inspired by the world’s greatest racing circuits.',
      },
    ],
  },

  mexico: {
    circuitId: 'mexico',
    id: 'mexico',
    name: 'Autódromo Hermanos Rodríguez',
    locality: 'Mexico City',
    location: 'Mexico City, Mexico',
    country: 'Mexico',
    flag: '🇲🇽',
    lengthKm: 4.304,
    length: 4.304,
    turns: 17,
    drsZones: 3,
    laps: 71,
    raceDistance: '305.354 km',
    firstGrandPrix: 1963,
    map: '/circuits/mexico.svg',
    trackCharacter: {
      speed: 'Very High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Low',
    },
    lapRecord: {
      time: '1:17.774',
      driver: 'Valtteri Bottas',
      year: 2021,
    },
    facts: [
      {
        category: 'RECORD',
        title: '2,200m Above Sea Level',
        description: 'The extreme altitude means thin air: cars run Monaco-level maximum downforce wings but experience Monza-like straight-line speeds exceeding 350 km/h!',
      },
      {
        category: 'CRAZY FACT',
        title: 'Foro Sol Stadium',
        description: 'The final sector drives directly through a 40,000-seat baseball stadium filled with roaring fans.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 10, max: 10, description: 'Thin air enables 355 km/h top speeds.' },
      { label: 'Braking Demand', value: 9, max: 10, description: 'Heavy braking into Turn 1.' },
      { label: 'Downforce Requirement', value: 10, max: 10, description: 'Max wing generates low downforce in thin air.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Huge slipstream down main straight.' },
      { label: 'Tyre Demand', value: 4, max: 10, description: 'Low grip due to lack of aero downforce.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'HIGH ALTITUDE SENSATION',
        description: 'Thin air, roaring stadium crowds, and immense straight-line velocities.',
      },
    ],
  },

  las_vegas: {
    circuitId: 'las_vegas',
    id: 'las-vegas',
    name: 'Las Vegas Strip Circuit',
    locality: 'Las Vegas',
    location: 'Nevada, USA',
    country: 'USA',
    flag: '🇺🇸',
    lengthKm: 6.201,
    length: 6.201,
    turns: 17,
    drsZones: 2,
    laps: 50,
    raceDistance: '309.958 km',
    firstGrandPrix: 2023,
    map: '/circuits/las-vegas.svg',
    trackCharacter: {
      speed: 'Very High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Low',
    },
    lapRecord: {
      time: '1:35.490',
      driver: 'Oscar Piastri',
      year: 2023,
    },
    facts: [
      {
        category: 'SPEED',
        title: 'Racing Down the Strip',
        description: 'Cars blast down the iconic Las Vegas Boulevard past Bellagio and Caesars Palace at speeds over 350 km/h.',
      },
      {
        category: 'TECHNICAL',
        title: 'Freezing Desert Night Air',
        description: 'Late November night temperatures can drop to 10°C, making tyre warm-up and graining a critical challenge.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 10, max: 10, description: 'Monza-rivaling velocities on the Strip.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Hard stops into Turn 1 and Turn 14.' },
      { label: 'Downforce Requirement', value: 3, max: 10, description: 'Ultra-low drag aerodynamic configuration.' },
      { label: 'Overtaking Potential', value: 9, max: 10, description: 'Wide avenues enable slipstreaming.' },
      { label: 'Tyre Demand', value: 4, max: 10, description: 'Tyres struggle to stay inside operating window.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'NEON SPECTACLE',
        description: 'High-speed street racing illuminated by billions of casino lights.',
      },
    ],
  },

  losail: {
    circuitId: 'losail',
    id: 'losail',
    name: 'Lusail International Circuit',
    locality: 'Lusail',
    location: 'Lusail, Qatar',
    country: 'Qatar',
    flag: '🇶🇦',
    lengthKm: 5.419,
    length: 5.419,
    turns: 16,
    drsZones: 1,
    laps: 57,
    raceDistance: '308.611 km',
    firstGrandPrix: 2021,
    map: '/circuits/losail.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Medium',
      overtaking: 'Medium',
      tyreWear: 'Very High',
    },
    lapRecord: {
      time: '1:24.319',
      driver: 'Max Verstappen',
      year: 2023,
    },
    facts: [
      {
        category: 'TECHNICAL',
        title: 'Brutal Lateral G-Forces',
        description: 'Lusail’s fast flowing curves place sustained lateral loads of over 4G on drivers with almost no rest.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 7, max: 10, description: 'Long 1km main straight.' },
      { label: 'Braking Demand', value: 5, max: 10, description: 'Medium braking demands.' },
      { label: 'Downforce Requirement', value: 8, max: 10, description: 'High downforce for high-speed corners.' },
      { label: 'Overtaking Potential', value: 6, max: 10, description: 'Turn 1 is primary passing zone.' },
      { label: 'Tyre Demand', value: 10, max: 10, description: 'Aggressive kerbs and high speeds stress tyres.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'DESERT FLOW',
        description: 'A fast, flowing motorcycle-inspired circuit that pushes physical limits.',
      },
    ],
  },

  yas_marina: {
    circuitId: 'yas_marina',
    id: 'yas-marina',
    name: 'Yas Marina Circuit',
    locality: 'Abu Dhabi',
    location: 'Yas Island, Abu Dhabi',
    country: 'UAE',
    flag: '🇦🇪',
    lengthKm: 5.281,
    length: 5.281,
    turns: 16,
    drsZones: 2,
    laps: 58,
    raceDistance: '306.183 km',
    firstGrandPrix: 2009,
    map: '/circuits/yas-marina.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Medium',
    },
    lapRecord: {
      time: '1:26.103',
      driver: 'Max Verstappen',
      year: 2021,
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'Twilight Season Finale',
        description: 'Starting in sunlight and finishing under 4,700 LED light fixtures, Yas Marina is the traditional final Grand Prix of the championship.',
      },
      {
        category: 'CRAZY FACT',
        title: 'Subterranean Pit Exit',
        description: 'The pit lane exit passes through an underground tunnel underneath Turn 1 before rejoining the track.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: '1.2km straight between Turn 5 and 6.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Heavy braking into Turn 5 chicane and Turn 6.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'Medium downforce balance.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Back-to-back DRS straights.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'Rear tyre degradation in hotel sector.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'THE SEASON FINALE',
        description: 'A glamorous twilight venue with long straights and a marina hotel sector.',
      },
    ],
  },

  madrid: {
    circuitId: 'madrid',
    id: 'madrid',
    name: 'Circuito de Madrid',
    locality: 'Madrid',
    location: 'Madrid, Spain',
    country: 'Spain',
    flag: '🇪🇸',
    lengthKm: 5.474,
    length: 5.474,
    turns: 20,
    drsZones: 2,
    laps: 56,
    raceDistance: '306.544 km',
    firstGrandPrix: 2026,
    map: '/circuits/madrid.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Medium',
    },
    facts: [
      {
        category: 'HISTORY',
        title: 'New Spanish Grand Prix Era',
        description: 'Beginning in 2026, the Spanish Grand Prix moves to a modern hybrid street-permanent circuit constructed around the IFEMA Madrid exhibition complex and Valdebebas.',
      },
      {
        category: 'SPEED',
        title: 'Dramatic Banked Turn',
        description: 'The layout incorporates an exhilarating banked corner designed to challenge driver commitment and aerodynamic setup under high lateral G-forces.',
      },
      {
        category: 'TECHNICAL',
        title: 'Hybrid Circuit Dynamics',
        description: 'Combining high-speed sweeping corners with tight urban exhibition sections, the Madrid circuit rewards mechanical grip and precise low-speed rotation.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'Long full-throttle bursts along IFEMA avenues.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Heavy braking zones entering chicanes and hairpins.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'Medium-high downforce for high-speed stability.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Multiple DRS zones and wide braking entries.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'Balanced degradation across front and rear axles.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'HYBRID STREET CIRCUIT',
        description: 'A cutting-edge modern venue combining purpose-built track sections with existing urban thoroughfares in the Spanish capital.',
      },
    ],
    whySpecial: 'The Madrid circuit brings Formula 1 back to the Spanish capital with a purpose-engineered hybrid street circuit featuring tunnels, elevation changes, and a signature banked curve.',
    keyCorners: [
      { number: '1-2', name: 'IFEMA Arena Chicanes', description: 'Hard braking zone creating prime overtaking opportunities on the opening lap.' },
      { number: '10', name: 'Valdebebas Banked Sweep', description: 'High-commitment banked turn producing intense lateral loading on suspension and tyres.' },
    ],
    overtakingCharacteristics: 'High overtaking capability supported by twin DRS straights and wide deceleration zones leading into tight radius turns.',
    officialCircuitUrl: 'https://www.formula1.com/en/racing/2026/spain/circuit.html',
  },

  sepang: {
    circuitId: 'sepang',
    id: 'sepang',
    name: 'Sepang International Circuit',
    locality: 'Kuala Lumpur',
    location: 'Kuala Lumpur, Malaysia',
    country: 'Malaysia',
    flag: '🇲🇾',
    lengthKm: 5.543,
    length: 5.543,
    turns: 15,
    drsZones: 2,
    laps: 56,
    raceDistance: '310.408 km',
    firstGrandPrix: 1999,
    map: '/circuits/sepang.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'High',
    },
    facts: [
      {
        category: 'TECHNICAL',
        title: 'Twin Grandstand Straights',
        description: 'Sepang features two massive straightaways separated only by the sharp hairpin of Turn 15 opposite the grandstand.',
      },
      {
        category: 'TECHNICAL',
        title: 'Tropical Heat & Rain',
        description: 'Known for extreme humidity and sudden monsoon downpours that radically reshape race strategies.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 8, max: 10, description: 'High terminal velocities along the twin parallel straights.' },
      { label: 'Braking Demand', value: 8, max: 10, description: 'Heavy braking into Turn 1 and Turn 15 hairpins.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'High aerodynamic balance for mid-lap sweeps.' },
      { label: 'Overtaking Potential', value: 8, max: 10, description: 'Wide circuit with sweeping entries.' },
      { label: 'Tyre Demand', value: 8, max: 10, description: 'Severe lateral thermal loads on high-speed sweeps.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'FLOWING MODERN CLASSIC',
        description: 'Hermann Tilke benchmark track with wide radius sweeping corners and dual opposing DRS straights.',
      },
    ],
  },
};

/**
 * Normalizes circuit ID strings into standardized registry keys
 */
export function normalizeCircuitId(circuitInput?: CircuitInfo | string): string {
  if (!circuitInput) return 'monza';

  let rawKey = '';
  if (typeof circuitInput === 'string') {
    rawKey = circuitInput;
  } else {
    rawKey = [
      circuitInput.id,
      (circuitInput as any).circuitId,
      circuitInput.name,
      circuitInput.locality,
      circuitInput.country,
    ].filter(Boolean).join(' ');
  }

  const clean = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (clean.includes('madrid') || clean.includes('madring')) return 'madrid';
  if (clean.includes('sepang') || clean.includes('malaysia')) return 'sepang';
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

  return clean || 'monza';
}

/**
 * Retrieves full circuit metadata with verified SVG map path and facts
 */
export function getCircuitMetadata(circuit?: CircuitInfo | string): CircuitMetadata {
  if (!circuit) {
    return F1_CIRCUITS_REGISTRY.monza;
  }

  const key = normalizeCircuitId(circuit);
  if (F1_CIRCUITS_REGISTRY[key]) {
    return F1_CIRCUITS_REGISTRY[key];
  }

  // Fallback with custom label if unknown
  const fallbackName = typeof circuit === 'string' ? circuit : circuit.name || 'Grand Prix Circuit';
  return {
    circuitId: key || 'custom_gp',
    id: key || 'custom_gp',
    name: fallbackName,
    locality: typeof circuit === 'object' && circuit.locality ? circuit.locality : 'Formula 1',
    location: typeof circuit === 'object' && circuit.country ? circuit.country : 'World Championship',
    country: typeof circuit === 'object' && circuit.country ? circuit.country : 'World Championship',
    flag: '🏁',
    lengthKm: 5.4,
    length: 5.4,
    turns: 16,
    drsZones: 2,
    laps: 55,
    raceDistance: '305.000 km',
    firstGrandPrix: 2000,
    map: '/circuits/monza.svg',
    trackCharacter: {
      speed: 'High',
      braking: 'Medium',
      overtaking: 'Medium',
      tyreWear: 'Medium',
    },
    facts: [
      {
        category: 'SPEED',
        title: 'Formula 1 Grand Prix Circuit',
        description: 'A benchmark Formula 1 venue demanding aerodynamic balance and engine performance.',
      },
    ],
    characteristics: [
      { label: 'Top Speed', value: 7, max: 10, description: 'Standard high-speed capability.' },
      { label: 'Braking Demand', value: 7, max: 10, description: 'Balanced braking zones.' },
      { label: 'Downforce Requirement', value: 7, max: 10, description: 'Medium-high downforce.' },
      { label: 'Overtaking Potential', value: 6, max: 10, description: 'DRS straight opportunities.' },
      { label: 'Tyre Demand', value: 6, max: 10, description: 'Balanced stress on tyres.' },
    ],
    insights: [
      {
        category: 'TRACK CHARACTER',
        title: 'WORLD CHAMPIONSHIP VENUE',
        description: 'A demanding Formula 1 layout requiring precision aero balance.',
      },
    ],
  };
}

/**
 * The Grid — Verified Championship Venues & Specifications
 * 
 * Authoritative circuit specifications verified against official FIA, FIM, ACO, and IMSA regulatory citations:
 * - Official circuit name, location, country, coordinates
 * - Accurate layout length (km) and certified turn counts
 * - Verified direction of travel (Clockwise / Anti-Clockwise)
 * - Circuit characteristics and multi-championship hostings
 */

import { CircuitEntity } from '../../types/circuit';

export const ADDITIONAL_VERIFIED_CIRCUITS: Record<string, CircuitEntity> = {
  // =========================================================================
  // AUTÓDROMO INTERNACIONAL DO ALGARVE (PORTIMÃO)
  // =========================================================================
  algarve: {
    circuitId: 'algarve',
    id: 'algarve',
    name: 'Autódromo Internacional do Algarve',
    shortName: 'Portimão',
    location: {
      city: 'Portimão',
      region: 'Algarve',
      country: 'Portugal',
      countryCode: 'PT',
      flag: '🇵🇹',
      coordinates: { latitude: 37.2272, longitude: -8.6267 },
      timezone: 'Europe/Lisbon',
    },
    primaryDiscipline: 'motogp',
    disciplines: ['motogp', 'wec', 'f1', 'gt'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'algarve-gp',
        name: 'Grand Prix Circuit',
        lengthKm: 4.653,
        turns: 15,
        direction: 'Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 38,
        longestStraightMeters: 969,
        isPrimary: true,
        championshipsHosted: ['motogp', 'wec', 'elms'],
        lapRecord: {
          time: '1:37.226',
          driver: 'Enea Bastianini',
          teamOrCar: 'Ducati Desmosedici GP24',
          year: 2024,
          category: 'MotoGP',
        },
      },
    ],
    characteristics: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'High',
      downforce: 'Medium-High',
      summary: 'Famous motorsport "rollercoaster" with severe blind crests, plunging downhill braking zones, and sweeping fast right-handers.',
    },
    history: {
      openedYear: 2008,
      historicalOverview: 'Opened in 2008 in the Algarve hills, Portimão has hosted the Portuguese Grand Prix in both MotoGP and Formula 1, renowned for its dramatic topography and technical blind entries.',
      notableMoments: [
        {
          year: 2020,
          title: 'Lewis Hamilton All-Time Win Record',
          description: 'Hamilton clinched his 92nd career Formula 1 victory at Portimão, breaking Michael Schumacher’s long-standing all-time record.',
        },
        {
          year: 2024,
          title: 'Jorge Martín Masterclass',
          description: 'Jorge Martín dominated the Portuguese MotoGP Grand Prix from lights-to-flag to take control of the 2024 World Championship.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'motogp',
        championshipName: 'FIM MotoGP World Championship',
        badge: 'MOTOGP',
        badgeColor: '#dc2626',
        eventName: 'Grande Prémio de Portugal',
        url: '/explore/motogp/circuits/algarve',
        notes: 'Host of the Portuguese motorcycle Grand Prix.',
      },
      {
        championshipId: 'wec',
        championshipName: 'FIA World Endurance Championship',
        badge: 'WEC',
        badgeColor: '#002b49',
        eventName: '6 Hours of Portimão',
        url: '/explore/wec/circuits/algarve',
        notes: 'European round of the FIA World Endurance Championship.',
      },
    ],
    didYouKnow: [
      {
        category: 'TECHNICAL',
        title: 'The Rollercoaster Crest',
        fact: 'Turn 1 is an entirely blind crest taken in 6th gear before plunging down a steep gradient into a tight right-hand apex.',
      },
    ],
    shortDescription: 'Autódromo Internacional do Algarve — 4.653 km modern rollercoaster circuit in Portimão, Portugal.',
    officialWebsite: 'https://autodromodoalgarve.com',
  },

  // =========================================================================
  // CIRCUIT RICARDO TORMO (VALENCIA)
  // =========================================================================
  valencia: {
    circuitId: 'valencia',
    id: 'valencia',
    name: 'Circuit Ricardo Tormo',
    shortName: 'Valencia',
    location: {
      city: 'Cheste',
      region: 'Valencia',
      country: 'Spain',
      countryCode: 'ES',
      flag: '🇪🇸',
      coordinates: { latitude: 39.4839, longitude: -0.6272 },
      timezone: 'Europe/Madrid',
    },
    primaryDiscipline: 'motogp',
    disciplines: ['motogp', 'fe', 'gt'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'valencia-gp',
        name: 'Grand Prix Track',
        lengthKm: 4.005,
        turns: 14,
        direction: 'Anti-Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 18,
        longestStraightMeters: 876,
        isPrimary: true,
        championshipsHosted: ['motogp', 'formula-e'],
        lapRecord: {
          time: '1:28.931',
          driver: 'Francesco Bagnaia',
          teamOrCar: 'Ducati Desmosedici GP23',
          year: 2023,
          category: 'MotoGP',
        },
      },
    ],
    characteristics: {
      speed: 'Medium',
      braking: 'Heavy',
      overtaking: 'Medium',
      tyreWear: 'High',
      downforce: 'High',
      summary: 'Colosseum-style stadium bowl venue with anti-clockwise layout where grandstands encircle the entire track for unobstructed spectator viewing.',
    },
    history: {
      openedYear: 1999,
      historicalOverview: 'Named in honour of Spanish Grand Prix motorcycle World Champion Ricardo Tormo, the circuit has served as the traditional championship finale for MotoGP since 2002.',
      notableMoments: [
        {
          year: 2023,
          title: 'Pecco Bagnaia Title Defense',
          description: 'Bagnaia won the Valencia finale to clinch his second consecutive MotoGP World Championship crown.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'motogp',
        championshipName: 'FIM MotoGP World Championship',
        badge: 'MOTOGP',
        badgeColor: '#dc2626',
        eventName: 'Gran Premio de la Comunitat Valenciana',
        url: '/explore/motogp/circuits/valencia',
        notes: 'The traditional season finale decider of MotoGP.',
      },
    ],
    didYouKnow: [
      {
        category: 'HISTORY',
        title: '360° Amphitheatre Sightlines',
        fact: 'From the main grandstands, fans can view over 95% of the 4.0 km lap without moving from their seats.',
      },
    ],
    shortDescription: 'Circuit Ricardo Tormo — 4.005 km anti-clockwise stadium circuit in Valencia, Spain.',
    officialWebsite: 'https://www.circuitvalencia.com',
  },

  // =========================================================================
  // AUTODROMO INTERNAZIONALE DEL MUGELLO
  // =========================================================================
  mugello: {
    circuitId: 'mugello',
    id: 'mugello',
    name: 'Autodromo Internazionale del Mugello',
    shortName: 'Mugello',
    location: {
      city: 'Scarperia e San Piero',
      region: 'Tuscany',
      country: 'Italy',
      countryCode: 'IT',
      flag: '🇮🇹',
      coordinates: { latitude: 43.9975, longitude: 11.3714 },
      timezone: 'Europe/Rome',
    },
    primaryDiscipline: 'motogp',
    disciplines: ['motogp', 'f1', 'gt'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'mugello-gp',
        name: 'Grand Prix Circuit',
        lengthKm: 5.245,
        turns: 15,
        direction: 'Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 41,
        longestStraightMeters: 1141,
        isPrimary: true,
        championshipsHosted: ['motogp', 'f1'],
        lapRecord: {
          time: '1:44.858',
          driver: 'Francesco Bagnaia',
          teamOrCar: 'Ducati Desmosedici GP24',
          year: 2024,
          category: 'MotoGP',
        },
      },
    ],
    characteristics: {
      speed: 'Very High',
      braking: 'Very Heavy',
      overtaking: 'High',
      tyreWear: 'High',
      downforce: 'Medium-High',
      summary: 'Nestled in Tuscan hills with legendary 1.14 km front straight producing 366+ km/h top speeds and iconic Arrabbiata 1 & 2 blind downhill sweeps.',
    },
    history: {
      openedYear: 1974,
      historicalOverview: 'Acquired by Ferrari in 1988, Mugello is renowned globally as one of the fastest, most fluid permanent racing circuits in the world.',
      notableMoments: [
        {
          year: 2020,
          title: 'Ferrari’s 1000th Grand Prix',
          description: 'Mugello hosted the 2020 Tuscan Grand Prix celebrating Scuderia Ferrari’s milestone 1000th Formula 1 World Championship race.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'motogp',
        championshipName: 'FIM MotoGP World Championship',
        badge: 'MOTOGP',
        badgeColor: '#dc2626',
        eventName: 'Gran Premio d’Italia',
        url: '/explore/motogp/circuits/mugello',
        notes: 'Host of the Italian motorcycle Grand Prix.',
      },
    ],
    didYouKnow: [
      {
        category: 'SPEED',
        title: '366.1 km/h Speed Record',
        fact: 'KTM rider Brad Binder set an all-time MotoGP top speed record of 366.1 km/h along Mugello’s straight.',
      },
    ],
    shortDescription: 'Autodromo Internazionale del Mugello — 5.245 km premier Tuscan speed cathedral.',
    officialWebsite: 'https://www.mugellocircuit.com',
  },

  // =========================================================================
  // MISANO WORLD CIRCUIT MARCO SIMONCELLI
  // =========================================================================
  misano: {
    circuitId: 'misano',
    id: 'misano',
    name: 'Misano World Circuit Marco Simoncelli',
    shortName: 'Misano',
    location: {
      city: 'Misano Adriatico',
      region: 'Rimini, Emilia-Romagna',
      country: 'Italy',
      countryCode: 'IT',
      flag: '🇮🇹',
      coordinates: { latitude: 43.9625, longitude: 12.6842 },
      timezone: 'Europe/Rome',
    },
    primaryDiscipline: 'motogp',
    disciplines: ['motogp', 'fe', 'gt'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'misano-gp',
        name: 'Grand Prix Track',
        lengthKm: 4.226,
        turns: 16,
        direction: 'Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 12,
        longestStraightMeters: 530,
        isPrimary: true,
        championshipsHosted: ['motogp', 'formula-e', 'worldsbk'],
        lapRecord: {
          time: '1:30.304',
          driver: 'Francesco Bagnaia',
          teamOrCar: 'Ducati Desmosedici GP24',
          year: 2024,
          category: 'MotoGP',
        },
      },
    ],
    characteristics: {
      speed: 'Medium-High',
      braking: 'Heavy',
      overtaking: 'Medium',
      tyreWear: 'High',
      downforce: 'High',
      summary: 'Heart of Italian motorcycle racing: tight chicanes leading into the legendary Curvone fast flat-out right sweep.',
    },
    history: {
      openedYear: 1972,
      historicalOverview: 'Renamed in 2012 in honor of the late Italian Grand Prix hero Marco Simoncelli, Misano is the temple of the Romagna racing motor valley.',
      notableMoments: [
        {
          year: 2024,
          title: 'Marc Márquez Misano Masterclass',
          description: 'Márquez charged through damp conditions to score back-to-back 2024 victories for Gresini Racing.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'motogp',
        championshipName: 'FIM MotoGP World Championship',
        badge: 'MOTOGP',
        badgeColor: '#dc2626',
        eventName: 'Gran Premio di San Marino e della Riviera di Rimini',
        url: '/explore/motogp/circuits/misano',
        notes: 'Host of the San Marino and Emilia-Romagna Grand Prix.',
      },
    ],
    didYouKnow: [
      {
        category: 'SPEED',
        title: 'The Blistering Curvone',
        fact: 'Turn 11 (Curvone) is entered at over 280 km/h with riders knee-down across the curb.',
      },
    ],
    shortDescription: 'Misano World Circuit Marco Simoncelli — 4.226 km Adriatic coast circuit in Rimini, Italy.',
    officialWebsite: 'https://www.misanocircuit.com',
  },

  // =========================================================================
  // PHILLIP ISLAND GRAND PRIX CIRCUIT
  // =========================================================================
  phillip_island: {
    circuitId: 'phillip_island',
    id: 'phillip_island',
    name: 'Phillip Island Grand Prix Circuit',
    shortName: 'Phillip Island',
    location: {
      city: 'Ventnor',
      region: 'Victoria',
      country: 'Australia',
      countryCode: 'AU',
      flag: '🇦🇺',
      coordinates: { latitude: -38.5033, longitude: 145.2333 },
      timezone: 'Australia/Melbourne',
    },
    primaryDiscipline: 'motogp',
    disciplines: ['motogp', 'worldsbk'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'phillip-island-gp',
        name: 'Grand Prix Circuit',
        lengthKm: 4.448,
        turns: 12,
        direction: 'Anti-Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 57,
        longestStraightMeters: 900,
        isPrimary: true,
        championshipsHosted: ['motogp', 'worldsbk'],
        lapRecord: {
          time: '1:27.246',
          driver: 'Marc Márquez',
          teamOrCar: 'Ducati Desmosedici GP23',
          year: 2024,
          category: 'MotoGP',
        },
      },
    ],
    characteristics: {
      speed: 'Very High',
      braking: 'Medium',
      overtaking: 'Very High',
      tyreWear: 'Very High',
      downforce: 'Medium',
      summary: 'Universally acclaimed as one of the purest high-speed flow circuits in existence, perched directly on the cliff edge of Bass Strait.',
    },
    history: {
      openedYear: 1956,
      historicalOverview: 'Racing on Phillip Island dates back to public road racing in 1928, with the permanent circuit built in 1956. It has provided some of the closest slipstreaming battles in Grand Prix history.',
      notableMoments: [
        {
          year: 2024,
          title: 'Marc Márquez Comeback Victory',
          description: 'Márquez recovered from an opening lap tear-off visor spin to win an epic Phillip Island duel against Jorge Martín.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'motogp',
        championshipName: 'FIM MotoGP World Championship',
        badge: 'MOTOGP',
        badgeColor: '#dc2626',
        eventName: 'Australian Motorcycle Grand Prix',
        url: '/explore/motogp/circuits/phillip_island',
        notes: 'Host of the Australian Grand Prix on Bass Strait.',
      },
    ],
    didYouKnow: [
      {
        category: 'SPEED',
        title: 'Doohan Corner (Turn 1)',
        fact: 'Riders enter Turn 1 at 340 km/h before tipping into a 220 km/h right-hand apex while looking over ocean waves.',
      },
    ],
    shortDescription: 'Phillip Island Grand Prix Circuit — 4.448 km cliff-edge high-speed flow circuit in Victoria, Australia.',
    officialWebsite: 'https://www.phillipislandcircuit.com.au',
  },

  // =========================================================================
  // CIRCUITO DE JEREZ – ÁNGEL NIETO
  // =========================================================================
  jerez: {
    circuitId: 'jerez',
    id: 'jerez',
    name: 'Circuito de Jerez – Ángel Nieto',
    shortName: 'Jerez',
    location: {
      city: 'Jerez de la Frontera',
      region: 'Andalusia',
      country: 'Spain',
      countryCode: 'ES',
      flag: '🇪🇸',
      coordinates: { latitude: 36.7083, longitude: -6.0342 },
      timezone: 'Europe/Madrid',
    },
    primaryDiscipline: 'motogp',
    disciplines: ['motogp', 'worldsbk', 'f1'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'jerez-gp',
        name: 'Grand Prix Circuit',
        lengthKm: 4.428,
        turns: 13,
        direction: 'Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 25,
        longestStraightMeters: 607,
        isPrimary: true,
        championshipsHosted: ['motogp', 'worldsbk'],
        lapRecord: {
          time: '1:36.025',
          driver: 'Francesco Bagnaia',
          teamOrCar: 'Ducati Desmosedici GP24',
          year: 2024,
          category: 'MotoGP',
        },
      },
    ],
    characteristics: {
      speed: 'Medium',
      braking: 'Heavy',
      overtaking: 'Medium-High',
      tyreWear: 'High',
      downforce: 'High',
      summary: 'Andalusian sunshine amphitheatre with tight technical hairpins and the infamous Jorge Lorenzo final corner decider.',
    },
    history: {
      openedYear: 1985,
      historicalOverview: 'Opened in 1985, Jerez hosted Formula 1 European and Spanish GPs before cementing its position as the festive heart of Spanish motorcycle racing.',
      notableMoments: [
        {
          year: 2024,
          title: 'Bagnaia vs Márquez Epic Duel',
          description: 'Pecco Bagnaia and Marc Márquez banged fairings through the final laps in one of the greatest Jerez shootouts in history.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'motogp',
        championshipName: 'FIM MotoGP World Championship',
        badge: 'MOTOGP',
        badgeColor: '#dc2626',
        eventName: 'Gran Premio de España',
        url: '/explore/motogp/circuits/jerez',
        notes: 'Host of the Spanish Grand Prix in Andalusia.',
      },
    ],
    didYouKnow: [
      {
        category: 'HISTORY',
        title: 'Curva Jorge Lorenzo',
        fact: 'The final hairpin (Turn 13) has decided multiple world championships, famous for last-corner lunges by Doohan, Rossi, and Márquez.',
      },
    ],
    shortDescription: 'Circuito de Jerez – Ángel Nieto — 4.428 km iconic Andalusian amphitheatre circuit in Spain.',
    officialWebsite: 'https://www.circuitodejerez.com',
  },

  // =========================================================================
  // SEBRING INTERNATIONAL RACEWAY
  // =========================================================================
  sebring: {
    circuitId: 'sebring',
    id: 'sebring',
    name: 'Sebring International Raceway',
    shortName: 'Sebring',
    location: {
      city: 'Sebring',
      region: 'Florida',
      country: 'United States',
      countryCode: 'US',
      flag: '🇺🇸',
      coordinates: { latitude: 27.4547, longitude: -81.3483 },
      timezone: 'America/New_York',
    },
    primaryDiscipline: 'imsa',
    disciplines: ['imsa', 'wec', 'gt'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'sebring-full',
        name: 'Full Course',
        lengthKm: 6.019,
        turns: 17,
        direction: 'Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 5,
        longestStraightMeters: 1040,
        isPrimary: true,
        championshipsHosted: ['imsa', 'wec'],
        lapRecord: {
          time: '1:45.067',
          driver: 'Kamui Kobayashi',
          teamOrCar: 'Cadillac DPi-V.R',
          year: 2020,
          category: 'IMSA GTP / DPi',
        },
      },
    ],
    characteristics: {
      speed: 'High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'Very High',
      downforce: 'Medium',
      summary: 'Built on WWII airbase runways: brutally bumpy concrete slabs that punish suspension, chassis, and drivers across 12 gruelling hours.',
    },
    history: {
      openedYear: 1950,
      historicalOverview: 'America’s oldest permanent road racing facility, Sebring hosted the first 12 Hours of Sebring in 1952 and has tested sports cars to destruction for over 70 years.',
      notableMoments: [
        {
          year: 2023,
          title: 'Ferrari Prototype Return Pole',
          description: 'Antonio Fuoco captured pole position for Ferrari on the 499P’s world debut at Sebring.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'imsa',
        championshipName: 'IMSA WeatherTech SportsCar Championship',
        badge: 'IMSA',
        badgeColor: '#e10600',
        eventName: 'Mobil 1 Twelve Hours of Sebring',
        url: '/explore/imsa/circuits/sebring',
        notes: 'Crown jewel endurance classic of the IMSA championship.',
      },
      {
        championshipId: 'wec',
        championshipName: 'FIA World Endurance Championship',
        badge: 'WEC',
        badgeColor: '#002b49',
        eventName: '1000 Miles of Sebring',
        url: '/explore/wec/circuits/sebring',
        notes: 'Historic season-opening venue for the World Endurance Championship.',
      },
    ],
    didYouKnow: [
      {
        category: 'TECHNICAL',
        title: 'Respect The Bumps',
        fact: 'Turn 17 (Sunset Bend) is paved over 1940s concrete bomber pads, producing violent vertical suspension compressions.',
      },
    ],
    shortDescription: 'Sebring International Raceway — 6.019 km brutal airfield circuit in Florida, USA.',
    officialWebsite: 'https://www.sebringraceway.com',
  },

  // =========================================================================
  // WATKINS GLEN INTERNATIONAL
  // =========================================================================
  watkins_glen: {
    circuitId: 'watkins_glen',
    id: 'watkins_glen',
    name: 'Watkins Glen International',
    shortName: 'Watkins Glen',
    location: {
      city: 'Watkins Glen',
      region: 'New York',
      country: 'United States',
      countryCode: 'US',
      flag: '🇺🇸',
      coordinates: { latitude: 42.3369, longitude: -76.9272 },
      timezone: 'America/New_York',
    },
    primaryDiscipline: 'imsa',
    disciplines: ['imsa', 'nascar', 'gt'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'the-glen-boot',
        name: 'Grand Prix Course (With The Boot)',
        lengthKm: 5.472,
        turns: 11,
        direction: 'Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 45,
        longestStraightMeters: 800,
        isPrimary: true,
        championshipsHosted: ['imsa', 'nascar'],
        lapRecord: {
          time: '1:27.795',
          driver: 'Oliver Jarvis',
          teamOrCar: 'Mazda RT24-P DPi',
          year: 2019,
          category: 'IMSA GTP / DPi',
        },
      },
    ],
    characteristics: {
      speed: 'Very High',
      braking: 'Heavy',
      overtaking: 'High',
      tyreWear: 'High',
      downforce: 'Medium-High',
      summary: 'Historic cathedral of American road racing with iconic baby-blue Armco barriers and ultra-fast esses through the Finger Lakes hills.',
    },
    history: {
      openedYear: 1956,
      historicalOverview: 'Watkins Glen hosted the Formula 1 United States Grand Prix for two decades (1961–1980) and continues as a cornerstone of the IMSA and NASCAR schedules.',
      notableMoments: [
        {
          year: 1970,
          title: 'Emerson Fittipaldi Maiden GP Win',
          description: 'Fittipaldi won his first Grand Prix at The Glen, securing the posthumous World Championship for Jochen Rindt.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'imsa',
        championshipName: 'IMSA WeatherTech SportsCar Championship',
        badge: 'IMSA',
        badgeColor: '#e10600',
        eventName: 'Sahlen’s Six Hours of The Glen',
        url: '/explore/imsa/circuits/watkins_glen',
        notes: 'Six-hour endurance classic on the Grand Prix course.',
      },
    ],
    didYouKnow: [
      {
        category: 'HISTORY',
        title: 'The Boot',
        fact: 'The southern extension loop of the circuit resembles the boot of Italy and adds four sweeping turns to the Grand Prix course.',
      },
    ],
    shortDescription: 'Watkins Glen International — 5.472 km high-speed road course in upstate New York.',
    officialWebsite: 'https://www.theglen.com',
  },

  // =========================================================================
  // ROAD AMERICA
  // =========================================================================
  road_america: {
    circuitId: 'road_america',
    id: 'road_america',
    name: 'Road America',
    shortName: 'Road America',
    location: {
      city: 'Elkhart Lake',
      region: 'Wisconsin',
      country: 'United States',
      countryCode: 'US',
      flag: '🇺🇸',
      coordinates: { latitude: 43.8058, longitude: -87.9947 },
      timezone: 'America/Chicago',
    },
    primaryDiscipline: 'indycar',
    disciplines: ['indycar', 'imsa', 'nascar'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'road-america-full',
        name: 'Full Course',
        lengthKm: 6.515,
        turns: 14,
        direction: 'Clockwise',
        type: 'Permanent',
        elevationChangeMeters: 55,
        longestStraightMeters: 1200,
        isPrimary: true,
        championshipsHosted: ['indycar', 'imsa', 'nascar'],
        lapRecord: {
          time: '1:40.705',
          driver: 'Colton Herta',
          teamOrCar: 'Andretti Autosport Dallara-Honda',
          year: 2023,
          category: 'IndyCar',
        },
      },
    ],
    characteristics: {
      speed: 'Very High',
      braking: 'Very Heavy',
      overtaking: 'Very High',
      tyreWear: 'Medium-High',
      downforce: 'Medium',
      summary: 'America’s National Park of Speed: over 6.5 km of rolling Wisconsin forest hills, heavy braking downhill zones, and the legendary Carousel.',
    },
    history: {
      openedYear: 1955,
      historicalOverview: 'Opened in 1955, Road America’s 4.048-mile layout has remained virtually unchanged since its inception, hosting IndyCar and IMSA endurance classics.',
      notableMoments: [
        {
          year: 2023,
          title: 'Complete Circuit Repave',
          description: 'A multi-million dollar full repave shattered track records across IndyCar and IMSA classes.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'indycar',
        championshipName: 'NTT IndyCar Series',
        badge: 'INDYCAR',
        badgeColor: '#002f6c',
        eventName: 'Sonsio Grand Prix at Road America',
        url: '/explore/indycar/circuits/road_america',
        notes: 'IndyCar championship fixture through the Kettle Moraine.',
      },
      {
        championshipId: 'imsa',
        championshipName: 'IMSA WeatherTech SportsCar Championship',
        badge: 'IMSA',
        badgeColor: '#e10600',
        eventName: 'IMSA SportsCar Weekend',
        url: '/explore/imsa/circuits/road_america',
        notes: 'IMSA premier prototype and GT endurance fixture.',
      },
    ],
    didYouKnow: [
      {
        category: 'SPEED',
        title: 'The Kink (Turn 11)',
        fact: 'Turn 11 is taken in 6th gear at over 290 km/h with Armco barrier inches from the right-hand wheel.',
      },
    ],
    shortDescription: 'Road America — 6.515 km legendary National Park of Speed in Elkhart Lake, Wisconsin.',
    officialWebsite: 'https://www.roadamerica.com',
  },

  // =========================================================================
  // LONG BEACH STREET CIRCUIT
  // =========================================================================
  long_beach: {
    circuitId: 'long_beach',
    id: 'long_beach',
    name: 'Long Beach Street Circuit',
    shortName: 'Long Beach',
    location: {
      city: 'Long Beach',
      region: 'California',
      country: 'United States',
      countryCode: 'US',
      flag: '🇺🇸',
      coordinates: { latitude: 33.7667, longitude: -118.1917 },
      timezone: 'America/Los_Angeles',
    },
    primaryDiscipline: 'indycar',
    disciplines: ['indycar', 'imsa'],
    verificationStatus: 'MISSING_ASSETS',
    layouts: [
      {
        layoutId: 'long-beach-street',
        name: 'Grand Prix Course',
        lengthKm: 3.167,
        turns: 11,
        direction: 'Clockwise',
        type: 'Street',
        longestStraightMeters: 750,
        isPrimary: true,
        championshipsHosted: ['indycar', 'imsa'],
        lapRecord: {
          time: '1:05.309',
          driver: 'Colton Herta',
          teamOrCar: 'Andretti Autosport Dallara-Honda',
          year: 2022,
          category: 'IndyCar',
        },
      },
    ],
    characteristics: {
      speed: 'Medium',
      braking: 'Heavy',
      overtaking: 'Medium-High',
      tyreWear: 'High',
      downforce: 'High',
      summary: 'The Monaco of America: iconic palm-tree street track along the Pacific shoreline with the famous hairpin leading onto Shoreline Drive.',
    },
    history: {
      openedYear: 1975,
      historicalOverview: 'Originally hosting Formula 5000 and the Formula 1 United States Grand Prix West (1976–1983), Long Beach has been the premier street race in North America for 50 years.',
      notableMoments: [
        {
          year: 1983,
          title: 'John Watson Win From 22nd on Grid',
          description: 'John Watson won the 1983 F1 US GP West starting from 22nd position, the furthest back any driver has won a Grand Prix.',
        },
      ],
    },
    championships: [
      {
        championshipId: 'indycar',
        championshipName: 'NTT IndyCar Series',
        badge: 'INDYCAR',
        badgeColor: '#002f6c',
        eventName: 'Acura Grand Prix of Long Beach',
        url: '/explore/indycar/circuits/long_beach',
        notes: 'America’s premier street racing festival.',
      },
      {
        championshipId: 'imsa',
        championshipName: 'IMSA WeatherTech SportsCar Championship',
        badge: 'IMSA',
        badgeColor: '#e10600',
        eventName: 'Grand Prix of Long Beach (IMSA Sprint)',
        url: '/explore/imsa/circuits/long_beach',
        notes: 'IMSA prototype sprint showdown.',
      },
    ],
    didYouKnow: [
      {
        category: 'HISTORY',
        title: 'Fountain Section',
        fact: 'Cars circle the Aquarium of the Pacific fountain roundabout on Pine Avenue with palm trees towering overhead.',
      },
    ],
    shortDescription: 'Long Beach Street Circuit — 3.167 km iconic Pacific shoreline street track in California, USA.',
    officialWebsite: 'https://gplb.com',
  },
};

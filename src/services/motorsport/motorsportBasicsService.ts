/**
 * The Grid — Unified Motorsport Basics & Knowledge Service
 * 
 * Architectural Invariant:
 * "Each Motorsport Hub provides simple, beginner-friendly knowledge.
 *  The goal is NOT an encyclopedia, but to help someone understand this
 *  motorsport in a few minutes with short, visual, easy-to-understand topics."
 */

export interface MotorsportBasicTopic {
  id: string;
  title: string;
  category: 'Format' | 'Scoring' | 'Machinery' | 'Rules' | 'Strategy';
  badge: string;
  badgeColor?: string;
  shortSummary: string;
  keyPoints: string[];
}

export interface MotorsportBasicsGuide {
  championshipId: string;
  sportName: string;
  oneLineIntro: string;
  howItWorks: {
    overview: string;
    eventFormat: string;
    weekendStructure: Array<{ session: string; description: string }>;
  };
  pointsAndScoring: {
    summary: string;
    pointsTable: Array<{ position: string; points: string }>;
    bonuses?: string[];
  };
  keyRegulations: Array<{ rule: string; explanation: string }>;
  machineryOverview: {
    vehicleType: string;
    headline: string;
    keyHighlights: string[];
  };
  historyOverview: string;
  beginnerTopics: MotorsportBasicTopic[];
}

const BASICS_REGISTRY: Record<string, MotorsportBasicsGuide> = {
  f1: {
    championshipId: 'f1',
    sportName: 'Formula 1',
    oneLineIntro: 'The pinnacle of open-wheel single-seater circuit racing, featuring 1,000+ bhp hybrid cars, active aerodynamics, and 24 global Grands Prix.',
    howItWorks: {
      overview: 'Ten two-car teams compete across 24 international Grands Prix. Drivers race wheel-to-wheel over ~305 km (approx. 50–70 laps) on purpose-built circuits and iconic street courses.',
      eventFormat: 'A standard Grand Prix weekend spans three days: Friday practice, Saturday three-stage knockout qualifying, and Sunday 300+ km race.',
      weekendStructure: [
        { session: 'Free Practice 1 & 2 (Friday)', description: 'Teams validate setups, simulate race stints, and test tyre degradation.' },
        { session: 'Free Practice 3 (Saturday)', description: 'Final qualifying simulations with lightweight fuel loads.' },
        { session: 'Qualifying (Saturday)', description: 'Knockout showdown: Q1 (bottom 5 eliminated), Q2 (bottom 5 eliminated), Q3 (top 10 pole position shootout).' },
        { session: 'Grand Prix (Sunday)', description: 'Standing start race to complete 305 km, featuring mandatory pit stops and strategic tyre changes.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points are awarded to the top 10 finishers in every Grand Prix. Sprint races award points to the top 8.',
      pointsTable: [
        { position: 'P1 (Winner)', points: '25 PTS' },
        { position: 'P2', points: '18 PTS' },
        { position: 'P3', points: '15 PTS' },
        { position: 'P4', points: '12 PTS' },
        { position: 'P5', points: '10 PTS' },
        { position: 'P6', points: '8 PTS' },
        { position: 'P7', points: '6 PTS' },
        { position: 'P8', points: '4 PTS' },
        { position: 'P9', points: '2 PTS' },
        { position: 'P10', points: '1 PT' },
      ],
      bonuses: [
        'Sprint Race points: 8-7-6-5-4-3-2-1 for top 8 finishers',
        'Both Drivers’ and Constructors’ World Championships run concurrently',
      ],
    },
    keyRegulations: [
      { rule: 'Mandatory Pit Stop & 2 Compounds', explanation: 'In dry races, every driver must use at least two different dry tyre compounds (Soft, Medium, or Hard).' },
      { rule: 'Parc Fermé Conditions', explanation: 'From the start of qualifying, teams cannot alter major mechanical car setup or aerodynamics.' },
      { rule: 'Track Limits', explanation: 'White lines define circuit boundaries. All four wheels crossing white lines invalidates lap times and incurs penalties.' },
      { rule: 'Safety Car & VSC', explanation: 'Safety Car bunches the field at controlled speeds; Virtual Safety Car enforces minimum delta sector times.' },
    ],
    machineryOverview: {
      vehicleType: 'Single-Seater Hybrid Prototype',
      headline: 'Next-Gen Active Aero & 50/50 Power Split',
      keyHighlights: [
        '1.6L turbocharged V6 combustion engine paired with high-output 350 kW MGU-K electric motor',
        'Active movable wings: Low-drag X-Mode on straights, high-downforce Z-Mode through corners',
        '100% sustainable drop-in fuel with zero net fossil emissions',
        'McLaren Applied Standard Electronic Control Unit (SECU) and 18-inch Pirelli tyres',
      ],
    },
    historyOverview: 'Inaugurated in 1950 at Silverstone, Formula 1 has evolved from hazardous front-engined machines into the world’s most advanced technological sporting spectacle.',
    beginnerTopics: [
      {
        id: 'f1-qualifying',
        title: 'How Knockout Qualifying Works',
        category: 'Format',
        badge: 'QUALIFYING',
        badgeColor: '#e10600',
        shortSummary: 'Qualifying determines Sunday’s starting grid through three intense elimination rounds.',
        keyPoints: [
          'Q1 (18 mins): All 20 cars take to the track; the 5 slowest drivers are eliminated (P16–P20).',
          'Q2 (15 mins): 15 remaining cars reset lap times; the 5 slowest are eliminated (P11–P15).',
          'Q3 (12 mins): Top 10 shootout for pole position (P1 on the starting grid).',
        ],
      },
      {
        id: 'f1-active-aero',
        title: '2026 Active Aerodynamics (X-Mode & Z-Mode)',
        category: 'Machinery',
        badge: 'TECH 2026',
        badgeColor: '#00d2ff',
        shortSummary: 'Movable wing surfaces actively adapt aerodynamic drag and downforce around every lap.',
        keyPoints: [
          'Z-Mode (Cornering): Wings open to maximum surface area for high downforce and cornering grip.',
          'X-Mode (Straights): Flaps articulate flat to shed air resistance for extreme top speeds and fuel efficiency.',
          'Manual Override Mode: Attacking drivers within 1s receive extra 0.5 MJ electrical boost up to 337 km/h.',
        ],
      },
      {
        id: 'f1-tyres-strategy',
        title: 'Tyre Compounds & The Undercut',
        category: 'Strategy',
        badge: 'STRATEGY',
        badgeColor: '#eab308',
        shortSummary: 'Selecting when to pit for fresh rubber makes or breaks Grand Prix victories.',
        keyPoints: [
          'Soft (Red): Maximum cornering grip, but wears down quickly.',
          'Medium (Yellow): Optimal balance between raw speed and durability.',
          'Hard (White): Most durable compound, ideal for long stints in hot track conditions.',
          'Undercut: Pitting one lap earlier than a rival to use fresh grip to jump ahead when they pit.',
        ],
      },
    ],
  },

  motogp: {
    championshipId: 'motogp',
    sportName: 'MotoGP™',
    oneLineIntro: 'The ultimate motorcycle world championship, where brave riders pilot 300+ bhp bespoke prototypes at 360+ km/h with 65° lean angles.',
    howItWorks: {
      overview: '22 elite riders race purpose-built prototype motorcycles across 20+ Grands Prix worldwide. Unlike road-bike racing, MotoGP machines are pure prototypes unavailable for public purchase.',
      eventFormat: 'Every Grand Prix features two premier races: a rapid Saturday afternoon Tissot Sprint (half-distance) and the full Sunday Grand Prix.',
      weekendStructure: [
        { session: 'Free Practice & Practice (Friday)', description: 'Determines direct entry into Qualifying 2 for the top 10 fastest riders.' },
        { session: 'Qualifying 1 & 2 (Saturday Morning)', description: 'Q1 sends top 2 into Q2; Q2 decides the grid for BOTH the Sprint and Sunday Grand Prix.' },
        { session: 'Tissot Sprint (Saturday Afternoon)', description: 'Flat-out half-distance race with half points and no tyre management needed.' },
        { session: 'Grand Prix (Sunday Afternoon)', description: 'Full-distance championship race requiring precision tyre preservation and fuel management.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points are scored across both the Saturday Sprint (top 9) and Sunday Grand Prix (top 15).',
      pointsTable: [
        { position: 'P1 (Winner)', points: 'GP: 25 PTS | Sprint: 12 PTS' },
        { position: 'P2', points: 'GP: 20 PTS | Sprint: 9 PTS' },
        { position: 'P3', points: 'GP: 16 PTS | Sprint: 7 PTS' },
        { position: 'P4', points: 'GP: 13 PTS | Sprint: 6 PTS' },
        { position: 'P5', points: 'GP: 11 PTS | Sprint: 5 PTS' },
        { position: 'P6', points: 'GP: 10 PTS | Sprint: 4 PTS' },
        { position: 'P7', points: 'GP: 9 PTS | Sprint: 3 PTS' },
        { position: 'P8', points: 'GP: 8 PTS | Sprint: 2 PTS' },
        { position: 'P9', points: 'GP: 7 PTS | Sprint: 1 PT' },
        { position: 'P10–P15', points: 'GP: 6 to 1 PT' },
      ],
    },
    keyRegulations: [
      { rule: 'Flag-to-Flag Races', explanation: 'If rain begins during a dry race, riders may enter pit lane and jump onto a second bike fitted with wet grooved tyres.' },
      { rule: 'Long Lap Penalty', explanation: 'Infractions require the rider to steer through a slower paved loop off the racing line, losing 2–3 seconds.' },
      { rule: 'Minimum Tyre Pressures', explanation: 'Riders must maintain strictly monitored minimum front and rear Michelin tyre pressures throughout 60% of the race distance.' },
    ],
    machineryOverview: {
      vehicleType: '1,000 cc Prototype Motorcycle',
      headline: '300+ bhp Prototypes with Aerodynamic Winglets',
      keyHighlights: [
        '1,000 cc 4-cylinder four-stroke engines producing over 300 bhp for a 157 kg minimum bike weight',
        'Carbon-fibre composite brake discs capable of operating above 800°C',
        'Ride-height squat devices lowering the rear suspension to prevent wheelies on exit',
        'Aerodynamic ground-effect side fairings and front winglets for high-speed stability',
      ],
    },
    historyOverview: 'Founded in 1949 as the FIM Road Racing World Championship, MotoGP is motorsport’s oldest world championship, synonymous with legendary courage and agility.',
    beginnerTopics: [
      {
        id: 'motogp-lean-physics',
        title: '65° Lean Angles & Riding Style',
        category: 'Machinery',
        badge: 'PHYSICS',
        badgeColor: '#dc2626',
        shortSummary: 'Riders drag knees, elbows, and even shoulders across asphalt at triple-digit speeds.',
        keyPoints: [
          'Michelin bespoke slick tyres provide incredible lateral grip at up to 65 degrees of lean.',
          'Riders hang their entire body weight off the inside of the bike to lower the center of gravity.',
          'Highside vs Lowside: Lowside is a front tyre slide; highside is when a sliding rear tyre abruptly bites, launching the rider violently.',
        ],
      },
      {
        id: 'motogp-sprint-format',
        title: 'The Tissot Sprint Difference',
        category: 'Format',
        badge: 'SPRINT',
        badgeColor: '#eab308',
        shortSummary: 'Saturday sprints require 100% aggression from lights-out to checkered flag.',
        keyPoints: [
          'Half the laps of Sunday’s Grand Prix, meaning softest tyres can be pushed without preservation.',
          'Awards 12 points to the winner down to 1 point for 9th place.',
          'Qualifying on Saturday morning sets the grid position for BOTH Saturday and Sunday.',
        ],
      },
    ],
  },

  wec: {
    championshipId: 'wec',
    sportName: 'FIA World Endurance Championship (WEC)',
    oneLineIntro: 'The ultimate endurance proving ground, where manufacturers battle for 6, 8, and 24 hours of non-stop prototype and GT racing.',
    howItWorks: {
      overview: 'Teams of two to three drivers share a single car, completing continuous driver stints, fuel stops, and tyre changes through daylight, dusk, and darkness.',
      eventFormat: 'Races range from 6 Hours to 8 Hours, culminating in the crown jewel: the centenary 24 Hours of Le Mans in France.',
      weekendStructure: [
        { session: 'Free Practice (3 sessions)', description: 'Night practice and long-run balance testing.' },
        { session: 'Qualifying & Hyperpole', description: 'Top 8 cars from qualifying duel in Hyperpole for pole position.' },
        { session: 'Endurance Race (6h–24h)', description: 'Multiclass endurance race testing mechanical reliability and traffic management.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points are awarded based on race duration, with multipliers for 8/10 hour events and double points for the 24 Hours of Le Mans.',
      pointsTable: [
        { position: 'P1 (Winner)', points: '6h: 25 PTS | 8h/10h: 38 PTS | Le Mans: 50 PTS' },
        { position: 'P2', points: '6h: 18 PTS | 8h/10h: 27 PTS | Le Mans: 36 PTS' },
        { position: 'P3', points: '6h: 15 PTS | 8h/10h: 23 PTS | Le Mans: 30 PTS' },
        { position: 'P4–P10', points: 'Scaled by race duration' },
      ],
      bonuses: ['1 bonus championship point for pole position in each class'],
    },
    keyRegulations: [
      { rule: 'Multiclass Traffic', explanation: 'Hypercars and LMGT3 cars share the track simultaneously, requiring Hypercar drivers to lap slower cars constantly.' },
      { rule: 'Driver Stint Limits', explanation: 'No single driver may exceed 4 hours within a 6h race, or 14 hours total in the 24 Hours of Le Mans.' },
      { rule: 'Balance of Performance (BoP)', explanation: 'Technical regulations dynamically balance engine power, vehicle weight, and fuel energy per stint to ensure parity.' },
    ],
    machineryOverview: {
      vehicleType: 'Hypercar Prototypes & LMGT3 Sportscars',
      headline: 'LMH & LMDh Hybrids Battling Production GTs',
      keyHighlights: [
        'Hypercar Class: Bespoke Le Mans Hypercar (LMH) and standardized Le Mans Daytona h (LMDh) hybrid prototypes',
        'Maximum system power capped at 500–520 kW (~670–700 bhp) measured by wheel torque sensors',
        'LMGT3 Class: Production-based sportscars (Porsche 911, Ferrari 296, Corvette Z06, Aston Martin Vantage)',
        'Mandatory Bronze-rated amateur driver pairing in LMGT3 to foster accessible sportscar racing',
      ],
    },
    historyOverview: 'Tracing its lineage back through the 1953 World Sportscar Championship, WEC embodies the romantic heritage of international endurance racing.',
    beginnerTopics: [
      {
        id: 'wec-multiclass',
        title: 'Hypercars vs LMGT3: The Art of Traffic',
        category: 'Format',
        badge: 'MULTICLASS',
        badgeColor: '#002b49',
        shortSummary: 'Two distinct vehicle classes compete simultaneously on the exact same asphalt.',
        keyPoints: [
          'Hypercars are 10–15 seconds per lap faster than LMGT3 cars.',
          'Hypercar drivers must constantly navigate through slower GT traffic without losing lap time or damaging carbon bodywork.',
          'LMGT3 drivers must hold predictable racing lines so faster prototypes can sweep past safely.',
        ],
      },
      {
        id: 'wec-bop',
        title: 'Understanding Balance of Performance (BoP)',
        category: 'Rules',
        badge: 'PARITY',
        badgeColor: '#d97706',
        shortSummary: 'A mathematical data-driven system ensuring Ferrari, Porsche, Toyota, and Cadillac race on equal terms.',
        keyPoints: [
          'Adjusts minimum car weight in kilograms and maximum power output in kilowatts.',
          'Regulates maximum energy allowance per stint (measured in megajoules).',
          'Ensures victory is decided by driver talent and pit strategy rather than unchecked manufacturing budgets.',
        ],
      },
    ],
  },

  'formula-e': {
    championshipId: 'formula-e',
    sportName: 'ABB FIA Formula E World Championship',
    oneLineIntro: 'The world’s premier all-electric motorsport, featuring high-speed street circuit battles and cutting-edge battery technology.',
    howItWorks: {
      overview: 'Single-seater electric racers battle through the heart of world capitals, from Tokyo and London to Monaco and São Paulo.',
      eventFormat: 'Action-packed single-day schedule: practice, unique head-to-head qualifying duels, and the flat-out E-Prix race.',
      weekendStructure: [
        { session: 'Practice 1 & 2', description: 'Street track grip ramp-up and energy regen calibration.' },
        { session: 'Qualifying Groups & Duels', description: 'Group stage followed by head-to-head quarter-finals, semi-finals, and final shootout.' },
        { session: 'E-Prix Race', description: 'Flat-out street race where regenerative braking generates over 40% of the energy consumed.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Standard FIA 25-18-15-12-10-8-6-4-2-1 system, plus bonus points for Julius Baer Pole Position and Fastest Lap.',
      pointsTable: [
        { position: 'P1 (Winner)', points: '25 PTS' },
        { position: 'P2', points: '18 PTS' },
        { position: 'P3', points: '15 PTS' },
        { position: 'P4–P10', points: '12 down to 1 PT' },
      ],
      bonuses: ['3 PTS for Julius Baer Pole Position', '1 PT for Fastest Lap (inside top 10)'],
    },
    keyRegulations: [
      { rule: 'Attack Mode', explanation: 'Drivers must steer offline through designated timing loops to unlock an additional 50 kW of motor power.' },
      { rule: 'Regenerative Braking', explanation: 'Cars have no rear mechanical brakes; deceleration is performed entirely by electric motors generating charge.' },
    ],
    machineryOverview: {
      vehicleType: 'All-Electric Gen3 Evo Single-Seater',
      headline: '0–100 km/h in 1.82 seconds with All-Wheel Drive',
      keyHighlights: [
        'Gen3 Evo race car accelerates 30% faster than current Formula 1 cars (0–100 km/h in 1.82s)',
        'Twin powertrains delivering 350 kW traction and 600 kW total regeneration capacity',
        'Hankook all-weather bio-material tyres designed for both wet and dry asphalt',
      ],
    },
    historyOverview: 'Launched in Beijing in 2014, Formula E was conceived by FIA president Jean Todt and Alejandro Agag to promote global electric vehicle mobility.',
    beginnerTopics: [
      {
        id: 'fe-attack-mode',
        title: 'Attack Mode: The Video Game Rule in Real Life',
        category: 'Strategy',
        badge: 'ATTACK MODE',
        badgeColor: '#00d2be',
        shortSummary: 'Drivers sacrifice track position off the racing line to earn massive electrical horsepower.',
        keyPoints: [
          'Mandatory activation in designated offline corner sectors.',
          'Provides an extra 50 kW of electric power for a defined duration (e.g. 2 x 4 minutes).',
          'Creates frantic overtaking opportunities when combined with tactical team radio calls.',
        ],
      },
    ],
  },

  wrc: {
    championshipId: 'wrc',
    sportName: 'FIA World Rally Championship (WRC)',
    oneLineIntro: 'Man and machine against the raw elements, sliding 500 bhp hybrid rally cars across gravel, snow, ice, and mountain tarmac.',
    howItWorks: {
      overview: 'Two-person crews (driver and co-driver) race against the clock on closed public roads rather than circuit tracks.',
      eventFormat: 'Rallies span four days across 15 to 25 Special Stages, covering ~300 competitive kilometers.',
      weekendStructure: [
        { session: 'Shakedown (Thursday)', description: 'Full-speed test run through a representative stage.' },
        { session: 'Special Stages (Friday & Saturday)', description: 'Timed stages run at 1–2 minute intervals through forests, mountain passes, and deserts.' },
        { session: 'Super Sunday & Wolf Power Stage', description: 'Sunday sprint leg culminating in the live televised Power Stage awarding bonus points.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points are awarded for overall standing after Saturday, plus separate Super Sunday points and bonus Power Stage points.',
      pointsTable: [
        { position: 'Saturday Leader', points: '18 PTS (if crew finishes rally)' },
        { position: 'Super Sunday Winner', points: '7 PTS' },
        { position: 'Power Stage Winner', points: '5 PTS' },
      ],
    },
    keyRegulations: [
      { rule: 'Pace Notes', explanation: 'Co-drivers dictate notes at lightning speed describing corner angle, blind crests, and hazards.' },
      { rule: 'Service Park Time Limits', explanation: 'Mechanics have strict 15 or 45-minute windows to completely rebuild damaged cars.' },
    ],
    machineryOverview: {
      vehicleType: 'Rally1 Hybrid 4WD Machinery',
      headline: '500 bhp Rocketships on Gravel and Snow',
      keyHighlights: [
        '1.6L turbocharged engine + 100 kW hybrid boost generating 500+ combined horsepower',
        'Tubular spaceframe safety cell built to withstand violent rollover crashes',
        'Long-travel suspension soaking up 40-metre jumps at over 150 km/h',
      ],
    },
    historyOverview: 'Established in 1973, the World Rally Championship is legendary for the iconic Group B era and iconic rallies like Monte-Carlo, Safari, and Finland.',
    beginnerTopics: [
      {
        id: 'wrc-pace-notes',
        title: 'How Pace Notes Work',
        category: 'Strategy',
        badge: 'CO-DRIVER',
        badgeColor: '#1e3a8a',
        shortSummary: 'Drivers cannot see around corners at 180 km/h; they drive entirely on their co-driver’s voice.',
        keyPoints: [
          'Corners graded 1 (tightest, hairpin) to 6 (fastest, flat out in top gear).',
          'Includes modifiers: "Don’t cut", "Rock inside", "Over crest into tightening left".',
          'Read ahead in rhythm so the driver prepares steering and braking inputs before seeing the road.',
        ],
      },
    ],
  },
};

/**
 * Returns structured beginner-friendly knowledge for a given motorsport discipline
 */
export function getMotorsportBasics(championshipId: string): MotorsportBasicsGuide | null {
  const norm = championshipId.toLowerCase().trim();
  return BASICS_REGISTRY[norm] || null;
}

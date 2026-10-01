/**
 * The Grid — Unified Motorsport Basics & Editorial Knowledge Service
 * 
 * Architectural Invariant:
 * "Each Motorsport Hub answers: 'I'm new to this sport. Help me understand it quickly.'
 *  Editorial tone: Discover -> Understand -> Explore -> Follow.
 *  Compact inline facts, beginner-friendly analogies (In Simple Terms),
 *  clear event progression sequences, and progressive technical disclosure."
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

export interface WeekendStep {
  step: string;
  name: string;
  description?: string;
}

export interface BeginnerConcept {
  num: string;
  title: string;
  explanation: string;
  tag?: string;
}

export interface InlineStat {
  label: string;
  value: string;
}

export interface MotorsportBasicsGuide {
  championshipId: string;
  sportName: string;
  oneLineIntro: string;
  simpleTerms: string;
  inlineStats: InlineStat[];
  weekendSequence: WeekendStep[];
  beginnerConcepts: BeginnerConcept[];
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
    simpleTerms: 'You can think of Formula 1 as high-tech sprint racing where 11 teams build their own custom cars and battle across 24 countries for driver and engineering glory.',
    inlineStats: [
      { label: 'ROUNDS', value: '24' },
      { label: 'TEAMS', value: '11' },
      { label: 'DRIVERS', value: '22' },
      { label: 'TOP SPEED', value: '350+ KM/H' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Setup optimization & long-run tyre degradation simulations' },
      { step: '02', name: 'QUALIFYING', description: 'Three-stage knockout shootout (Q1, Q2, Q3) for Pole Position' },
      { step: '03', name: 'RACE', description: 'Standing start 305 km Grand Prix with mandatory pit stops' },
      { step: '04', name: 'PODIUM', description: 'Trophy ceremony, champagne spray, and official points tally' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'TWO CHAMPIONSHIPS', explanation: 'Drivers race for the individual crown; teams compete for the massive Constructors prize pool.' },
      { num: '02', title: 'ACTIVE AERO (2026)', explanation: 'Cars shift between low-drag straight-line X-Mode and high-downforce cornering Z-Mode.' },
      { num: '03', title: 'TYRE STRATEGY', explanation: 'Every dry race requires using at least two different tyre compounds, forcing strategic pit stops.' },
      { num: '04', title: 'POINTS SYSTEM', explanation: 'Top 10 finishers score points (25 for the win down to 1 point for 10th place).' },
    ],
    howItWorks: {
      overview: 'Eleven two-car teams compete across 24 international Grands Prix. Drivers race wheel-to-wheel over ~305 km on purpose-built circuits and iconic street courses.',
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
          'Q1 (18 mins): All 22 cars take to the track; the 5 slowest drivers are eliminated (P18–P22).',
          'Q2 (15 mins): 17 remaining cars reset lap times; the 7 slowest are eliminated (P11–P17).',
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
          'Manual Override Mode: Attacking drivers within 1s receive extra electrical boost.',
        ],
      },
    ],
  },

  wec: {
    championshipId: 'wec',
    sportName: 'FIA World Endurance Championship',
    oneLineIntro: 'Global endurance racing where manufacturers and private teams compete across multiple classes over grueling long-distance races.',
    simpleTerms: 'You can think of WEC as long-distance team racing where teams share cars between multiple drivers and compete simultaneously across different classes.',
    inlineStats: [
      { label: 'ROUNDS', value: '8' },
      { label: 'CLASSES', value: '2 (HYPERCAR & LMGT3)' },
      { label: 'RACE DURATION', value: '6H TO 24H' },
      { label: 'CREW / CAR', value: '3 DRIVERS' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Day & night multi-class balance and long-run tire stint validation' },
      { step: '02', name: 'HYPERPOLE', description: 'Top 10 cars in each class battle in pure low-fuel shootouts' },
      { step: '03', name: 'ENDURANCE RACE', description: '6 to 24 uninterrupted hours of rotating driver stints, pit stops & traffic' },
      { step: '04', name: 'CLASSIFICATION', description: 'Class winners and overall champion crowned on total distance covered' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'MULTICLASS RACING', explanation: 'Fast Hypercars and production LMGT3 cars share the asphalt at the same time.' },
      { num: '02', title: 'DRIVER ROTATIONS', explanation: 'Two or three drivers share each car, handing over controls during scheduled pit stops.' },
      { num: '03', title: 'BALANCE OF PERFORMANCE', explanation: 'A data-driven mathematical rule balances car weight and engine power for dead-even competition.' },
      { num: '04', title: '24 HOURS OF LE MANS', explanation: 'The crown jewel: twice around the clock at Circuit de la Sarthe for double championship points.' },
    ],
    howItWorks: {
      overview: 'Teams of two to three drivers share a single car, completing continuous driver stints, fuel stops, and tyre changes through daylight, dusk, and darkness.',
      eventFormat: 'Races range from 6 Hours to 8 Hours, culminating in the crown jewel: the legendary 24 Hours of Le Mans in France.',
      weekendStructure: [
        { session: 'Free Practice (3 sessions)', description: 'Night practice and long-run balance testing.' },
        { session: 'Qualifying & Hyperpole', description: 'Top 10 cars from qualifying duel in Hyperpole for pole position.' },
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
      { rule: 'Multiclass Traffic', explanation: 'Hypercars lap slower GT cars constantly, testing patience and spatial awareness.' },
      { rule: 'Driver Stint Limits', explanation: 'Maximum stint times ensure driver safety and fair team rotation across day and night.' },
      { rule: 'Balance of Performance (BoP)', explanation: 'Technical regulations dynamically balance engine power and weight to ensure competitive parity.' },
    ],
    machineryOverview: {
      vehicleType: 'Hypercar Prototypes & LMGT3 Sportscars',
      headline: 'LMH & LMDh Hybrids Battling Production GTs',
      keyHighlights: [
        'Hypercar Class: Bespoke LMH and standardized LMDh hybrid prototypes (Ferrari 499P, Porsche 963, Toyota GR010)',
        'Maximum system power capped at 500 kW (~670 bhp) measured by wheel torque sensors',
        'LMGT3 Class: Production-based sportscars (Porsche 911, Ferrari 296, BMW M4, Aston Martin Vantage)',
      ],
    },
    historyOverview: 'Tracing its lineage back through the 1953 World Sportscar Championship, WEC represents the romantic heritage and automotive technology test of endurance.',
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
          'Hypercar drivers must constantly navigate through slower GT traffic.',
          'LMGT3 drivers must hold predictable lines so faster prototypes can pass safely.',
        ],
      },
    ],
  },

  motogp: {
    championshipId: 'motogp',
    sportName: 'MotoGP™',
    oneLineIntro: 'The ultimate motorcycle world championship, where brave riders pilot 300+ bhp bespoke prototypes at 360+ km/h with 65° lean angles.',
    simpleTerms: 'You can think of MotoGP as Formula 1 on two wheels: pure prototype motorcycles with insane acceleration, where riders drag their knees and elbows inches off the asphalt.',
    inlineStats: [
      { label: 'ROUNDS', value: '22' },
      { label: 'RIDERS', value: '22' },
      { label: 'TOP SPEED', value: '366 KM/H' },
      { label: 'MAX LEAN', value: '65 DEGREES' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Friday sessions determining direct entry into Saturday Q2' },
      { step: '02', name: 'QUALIFYING', description: 'Shootout setting grid positions for BOTH the Sprint and Grand Prix' },
      { step: '03', name: 'TISSOT SPRINT', description: 'Flat-out Saturday half-distance sprint with no tyre management' },
      { step: '04', name: 'GRAND PRIX', description: 'Sunday full-distance main championship race for 25 points' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'TWO RACES PER WEEKEND', explanation: 'A rapid Saturday Sprint awards half points; the full-length Sunday Grand Prix awards full points.' },
      { num: '02', title: 'PROTOTYPES ONLY', explanation: 'These bikes are pure experimental prototypes and cannot be purchased by the public.' },
      { num: '03', title: 'FLAG-TO-FLAG', explanation: 'If it rains, riders dive into pit lane and jump onto a second bike fitted with wet tyres.' },
      { num: '04', title: 'RIDER LEAN PHYSICS', explanation: 'Riders hang their entire body weight off the bike to counteract extreme cornering G-forces.' },
    ],
    howItWorks: {
      overview: '22 elite riders race purpose-built prototype motorcycles across 22 Grands Prix worldwide. Unlike road-bike racing, MotoGP machines are pure prototypes unavailable for public purchase.',
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
        { position: 'P4–P15', points: 'Scaled down to 1 PT' },
      ],
    },
    keyRegulations: [
      { rule: 'Flag-to-Flag Races', explanation: 'If rain begins during a dry race, riders jump onto a backup bike with wet grooved tyres.' },
      { rule: 'Long Lap Penalty', explanation: 'Infractions require the rider to steer through a slower paved loop, losing 2–3 seconds.' },
    ],
    machineryOverview: {
      vehicleType: '1,000 cc Prototype Motorcycle',
      headline: '300+ bhp Prototypes with Aerodynamic Winglets',
      keyHighlights: [
        '1,000 cc 4-cylinder engines producing over 300 bhp for a 157 kg minimum bike weight',
        'Carbon-fibre brake discs operating above 800°C',
        'Ride-height squat devices and aerodynamic ground-effect side fairings',
      ],
    },
    historyOverview: 'Founded in 1949 as the FIM Road Racing World Championship, MotoGP is motorsport’s oldest world championship.',
    beginnerTopics: [],
  },

  wrc: {
    championshipId: 'wrc',
    sportName: 'FIA World Rally Championship',
    oneLineIntro: 'Man and machine against the raw elements, sliding 500 bhp hybrid rally cars across gravel, snow, ice, and mountain tarmac.',
    simpleTerms: 'You can think of WRC as extreme point-to-point time trials where a driver and navigator race against the clock on closed public roads rather than on a circuit.',
    inlineStats: [
      { label: 'ROUNDS', value: '14' },
      { label: 'SURFACES', value: 'GRAVEL, SNOW, TARMAC' },
      { label: 'COMPETITIVE DIST.', value: '~300 KM / RALLY' },
      { label: 'CREW', value: 'DRIVER & CO-DRIVER' },
    ],
    weekendSequence: [
      { step: '01', name: 'SHAKEDOWN', description: 'Thursday high-speed trial run to verify suspension & damper settings' },
      { step: '02', name: 'SPECIAL STAGES', description: 'Friday & Saturday timed sprints on closed roads at 1-2 min intervals' },
      { step: '03', name: 'SERVICE PARK', description: 'Strict 15/45 min windows where mechanics rebuild damaged cars' },
      { step: '04', name: 'POWER STAGE', description: 'Televised Sunday finale awarding crucial bonus championship points' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'RACING THE CLOCK', explanation: 'Cars do not race side-by-side; they start one-by-one and the lowest total time wins.' },
      { num: '02', title: 'PACE NOTES', explanation: 'The co-driver reads notes predicting every corner and hazard before the driver can see it.' },
      { num: '03', title: 'SURFACE ADAPTATION', explanation: 'Rounds span ice and snow (Sweden), rocky dust (Kenya, Greece), and mountain asphalt (Monte-Carlo).' },
      { num: '04', title: 'SUPER SUNDAY', explanation: 'Sunday is a standalone points race, keeping competition alive even for crews who had Friday issues.' },
    ],
    howItWorks: {
      overview: 'Two-person crews (driver and co-driver) race against the clock on closed public roads rather than circuit tracks.',
      eventFormat: 'Rallies span four days across 15 to 25 Special Stages, covering ~300 competitive kilometers.',
      weekendStructure: [
        { session: 'Shakedown (Thursday)', description: 'Full-speed test run through a representative stage.' },
        { session: 'Special Stages (Friday & Saturday)', description: 'Timed stages run at 1–2 minute intervals through forests and mountain passes.' },
        { session: 'Super Sunday & Wolf Power Stage', description: 'Sunday sprint leg culminating in the live televised Power Stage awarding bonus points.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points are awarded for overall standing after Saturday, plus separate Super Sunday points and bonus Power Stage points.',
      pointsTable: [
        { position: 'Saturday Leader', points: '18 PTS' },
        { position: 'Super Sunday Winner', points: '7 PTS' },
        { position: 'Power Stage Winner', points: '5 PTS' },
      ],
    },
    keyRegulations: [
      { rule: 'Pace Notes', explanation: 'Co-drivers dictate notes at lightning speed describing corner angle and crest hazards.' },
      { rule: 'Service Park Limits', explanation: 'Mechanics have strict time windows to rebuild damaged cars between stages.' },
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
    historyOverview: 'Established in 1973, WRC is legendary for legendary rallies like Monte-Carlo, Safari, and Finland.',
    beginnerTopics: [],
  },

  'formula-e': {
    championshipId: 'formula-e',
    sportName: 'ABB FIA Formula E World Championship',
    oneLineIntro: 'The world’s premier all-electric motorsport, featuring high-speed street circuit battles and cutting-edge battery technology.',
    simpleTerms: 'You can think of Formula E as street racing with electric cars where managing battery power and timing speed boosts is just as important as raw speed.',
    inlineStats: [
      { label: 'SEASON', value: '2025–26 (S12)' },
      { label: 'ROUNDS', value: '17 RACES' },
      { label: '0–100 KM/H', value: '1.82 SECONDS' },
      { label: 'POWERTRAIN', value: 'ALL-WHEEL DRIVE' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Early morning street grip checks and energy regeneration calibration' },
      { step: '02', name: 'DUELS QUALIFYING', description: 'Group stage followed by head-to-head quarter, semi and final shootouts' },
      { step: '03', name: 'E-PRIX RACE', description: 'Flat-out urban race with mandatory Attack Mode activations' },
      { step: '04', name: 'PODIUM', description: 'City-centre podium celebration rewarding tactical energy masters' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'ENERGY MANAGEMENT', explanation: 'Drivers must finish the race before running out of allocated battery power.' },
      { num: '02', title: 'ATTACK MODE', explanation: 'Drivers steer off the racing line to trigger extra 50 kW power bursts.' },
      { num: '03', title: 'QUALIFYING DUELS', explanation: 'Unique head-to-head bracket style knockout qualifying for pole position.' },
      { num: '04', title: 'REGEN BRAKING', explanation: 'Front and rear motor-generators recharge over 40% of the energy consumed in the race.' },
    ],
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
      { rule: 'Attack Mode', explanation: 'Drivers must steer offline through designated timing loops to unlock an additional 50 kW.' },
      { rule: 'Regenerative Braking', explanation: 'Cars have no rear mechanical brakes; deceleration is performed entirely by electric motors.' },
    ],
    machineryOverview: {
      vehicleType: 'All-Electric Gen3 Evo Single-Seater',
      headline: '0–100 km/h in 1.82 seconds with All-Wheel Drive',
      keyHighlights: [
        'Gen3 Evo race car accelerates faster than Formula 1 cars (0–100 km/h in 1.82s)',
        'Twin powertrains delivering 350 kW traction and 600 kW regeneration capacity',
      ],
    },
    historyOverview: 'Launched in Beijing in 2014, Formula E promotes sustainable urban electric mobility.',
    beginnerTopics: [],
  },

  f2: {
    championshipId: 'f2',
    sportName: 'FIA Formula 2 Championship',
    oneLineIntro: 'The official direct feeder series to Formula 1, where 22 young stars race in identical spec machinery on Grand Prix weekends.',
    simpleTerms: 'You can think of Formula 2 as the audition for Formula 1: all 22 drivers race the exact same car, so raw driver talent and tyre management decide who graduates.',
    inlineStats: [
      { label: 'ROUNDS', value: '14' },
      { label: 'DRIVERS', value: '22' },
      { label: 'HORSEPOWER', value: '620 BHP' },
      { label: 'SPEC STATUS', value: '100% IDENTICAL CARS' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: '45-minute single practice session before going straight into qualifying' },
      { step: '02', name: 'QUALIFYING', description: 'Single high-stakes 30-min session; top 10 reversed for Saturday Sprint' },
      { step: '03', name: 'SPRINT RACE', description: 'Saturday afternoon reverse-grid sprint awarding 10 points to winner' },
      { step: '04', name: 'FEATURE RACE', description: 'Sunday morning main race with mandatory pit stop and full 25 points' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'IDENTICAL CARS', explanation: 'Dallara chassis, Mecachrome turbo engine, and Pirelli tyres are identical for every driver.' },
      { num: '02', title: 'REVERSE GRID SPRINT', explanation: 'The top 10 from Friday qualifying are flipped for Saturday, creating aggressive overtaking.' },
      { num: '03', title: 'FEATURE RACE STRATEGY', explanation: 'Sunday requires a mandatory pit stop with two different tyre compounds.' },
      { num: '04', title: 'SUPER LICENCE TICKET', explanation: 'Finishing top 3 virtually guarantees the 40 FIA points required to race in Formula 1.' },
    ],
    howItWorks: {
      overview: '22 drivers compete in identical Dallara-Mecachrome machinery across 14 Formula 1 Grand Prix support weekends.',
      eventFormat: 'One practice, one qualifying, a Saturday reverse-grid Sprint, and a Sunday mandatory pit-stop Feature Race.',
      weekendStructure: [
        { session: 'Free Practice (Friday)', description: '45 minutes setup acclimatization.' },
        { session: 'Qualifying (Friday)', description: 'Decides Sunday Feature Race grid; top 10 reversed for Saturday Sprint.' },
        { session: 'Sprint Race (Saturday)', description: 'Short race awarding 10 points to winner.' },
        { session: 'Feature Race (Sunday)', description: 'Full points (25 for winner) with mandatory tyre change pit stop.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points are awarded for both races, plus bonus points for Feature Race Pole (2 pts) and Fastest Lap (1 pt).',
      pointsTable: [
        { position: 'Feature P1', points: '25 PTS' },
        { position: 'Sprint P1', points: '10 PTS' },
      ],
    },
    keyRegulations: [
      { rule: 'Spec Machinery', explanation: 'Teams cannot manufacture custom aerodynamic or mechanical parts.' },
    ],
    machineryOverview: {
      vehicleType: 'Dallara F2 2024 Monocoque',
      headline: '620 bhp Turbocharged Feeder Weapon',
      keyHighlights: ['3.4L V6 Turbo engine', 'Pirelli 18-inch slick tyres', 'FIA safety halo and anti-intrusion panels'],
    },
    historyOverview: 'Evolving from Formula 3000 and GP2, F2 has produced F1 champions including Hamilton, Rosberg, Russell, and Piastri.',
    beginnerTopics: [],
  },

  f3: {
    championshipId: 'f3',
    sportName: 'FIA Formula 3 Championship',
    oneLineIntro: 'The international proving ground where 30 junior karting and F4 champions battle in fierce slipstream packs on Grand Prix weekends.',
    simpleTerms: 'You can think of Formula 3 as junior high-speed open-wheel racing where 30 hungry young drivers go wheel-to-wheel in identical cars to earn an F2 seat.',
    inlineStats: [
      { label: 'ROUNDS', value: '10' },
      { label: 'DRIVERS', value: '30' },
      { label: 'HORSEPOWER', value: '380 BHP' },
      { label: 'ENGINE', value: '3.4L NATURALLY ASPIRATED' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: '45-minute high-traffic practice session' },
      { step: '02', name: 'QUALIFYING', description: '30-minute traffic management session; top 12 reversed for Sprint' },
      { step: '03', name: 'SPRINT RACE', description: 'Saturday reverse-grid dogfight awarding 10 points to winner' },
      { step: '04', name: 'FEATURE RACE', description: 'Sunday morning main race without pit stops for full 25 points' },
    ],
    beginnerConcepts: [
      { num: '01', title: '30-CAR GRID', explanation: 'One of the most crowded grids in racing, leading to intense slipstreaming battles.' },
      { num: '02', title: 'TOP 12 REVERSED', explanation: 'Saturday sprint reverses the top 12 qualifiers, putting midfield drivers on pole.' },
      { num: '03', title: 'NO PIT STOPS', explanation: 'Drivers must manage tyre degradation purely through driving style from start to finish.' },
      { num: '04', title: 'ACADEMY SCOUTS', explanation: 'F1 driver academies (Ferrari, Red Bull, Mercedes, McLaren) watch F3 races closely for future stars.' },
    ],
    howItWorks: {
      overview: '30 drivers from 10 teams race identical 380 bhp single-seaters at 10 F1 Grand Prix weekends.',
      eventFormat: 'One practice, one qualifying, a top-12 reverse grid Sprint, and Sunday Feature Race.',
      weekendStructure: [
        { session: 'Practice', description: '45-minute track acclimatization.' },
        { session: 'Qualifying', description: 'Grid determination with top 12 reversed for Sprint.' },
        { session: 'Sprint Race', description: 'Reverse-grid sprint race.' },
        { session: 'Feature Race', description: 'Championship feature race.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points for top 10 in Feature (25-18-15) and Sprint (10-9-8).',
      pointsTable: [{ position: 'Feature P1', points: '25 PTS' }, { position: 'Sprint P1', points: '10 PTS' }],
    },
    keyRegulations: [{ rule: 'Spec Chassis', explanation: 'Strictly equal machinery; driver setups make all the difference.' }],
    machineryOverview: {
      vehicleType: 'Dallara F3 Monocoque',
      headline: '380 bhp Naturally Aspirated Screamer',
      keyHighlights: ['Bespoke Mecachrome 3.4L V6', 'Pirelli spec tyres', 'Carbon-composite crash structures'],
    },
    historyOverview: 'Formula 3 has served as the foundational stepping stone for nearly every modern Formula 1 legend.',
    beginnerTopics: [],
  },

  imsa: {
    championshipId: 'imsa',
    sportName: 'IMSA WeatherTech SportsCar Championship',
    oneLineIntro: 'North America’s premier endurance series, featuring multi-class prototype and GT battles at legendary circuits like Daytona, Sebring, and Road Atlanta.',
    simpleTerms: 'You can think of IMSA as American endurance racing where high-tech GTP prototypes weave through production Corvettes, Porsches, and Ferraris on rugged, bumpy tracks.',
    inlineStats: [
      { label: 'ROUNDS', value: '11' },
      { label: 'CLASSES', value: '4 (GTP, LMP2, GTD PRO, GTD)' },
      { label: 'TOP RACE', value: 'ROLEX 24 AT DAYTONA' },
      { label: 'DRIVERS / CAR', value: '2 TO 4 DRIVERS' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Multi-class traffic negotiation and night lighting trials' },
      { step: '02', name: 'QUALIFYING', description: 'Class-by-class shootouts for the Rolex 24 / race pole positions' },
      { step: '03', name: 'ENDURANCE RACE', description: 'Timed events from 2h 40m sprints to 12h Sebring and 24h Daytona' },
      { step: '04', name: 'VICTORY LANE', description: 'Rolex watches and class winner celebrations in iconic Victory Lane' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'GTP HYBRID PROTOTYPES', explanation: 'Top class features LMDh hybrids from Porsche, Cadillac, Acura, and BMW.' },
      { num: '02', title: 'HISTORIC TRACKS', explanation: 'Races take place on raw, bumpy American circuits like Sebring, Road America, and Watkins Glen.' },
      { num: '03', title: 'FULL COURSE YELLOWS', explanation: 'IMSA uses safety car wave-arounds that bunch up fields for thrilling restarts.' },
      { num: '04', title: 'PRO-AM GT RACING', explanation: 'GTD classes feature pro factory stars alongside passionate privateer owner-drivers.' },
    ],
    howItWorks: {
      overview: 'Four classes of prototypes and GT cars battle in timed endurance races across premier North American venues.',
      eventFormat: 'Features endurance crown jewels (Daytona 24, Sebring 12h, Petit Le Mans) and 2-hour 40-minute sprint rounds.',
      weekendStructure: [
        { session: 'Practice Sessions', description: 'Track acclimatization and night practice.' },
        { session: 'Qualifying', description: 'Split session class qualifying.' },
        { session: 'Race', description: 'Multi-class endurance battle.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points awarded to all finishers (350 for win, 320 for 2nd, 300 for 3rd), plus Michelin Endurance Cup bonus points.',
      pointsTable: [{ position: 'P1 (Winner)', points: '350 PTS' }, { position: 'P2', points: '320 PTS' }, { position: 'P3', points: '300 PTS' }],
    },
    keyRegulations: [{ rule: 'Wave-Around Rule', explanation: 'Under safety cars, cars between the safety car and class leader regain their lap.' }],
    machineryOverview: {
      vehicleType: 'GTP Hybrid Prototype & GT3 Sportscars',
      headline: 'LMDh Technology Meeting GT3 Thunder',
      keyHighlights: ['GTP hybrids producing 500 kW', 'GTD Pro & GTD production GT3 cars', 'Michelin bespoke racing tyres'],
    },
    historyOverview: 'Founded in 1969 by John Bishop and Bill France Sr., IMSA is the soul of North American sports car endurance racing.',
    beginnerTopics: [],
  },

  indycar: {
    championshipId: 'indycar',
    sportName: 'NTT INDYCAR SERIES',
    oneLineIntro: 'North America’s premier open-wheel championship, featuring ultra-fast racing across speedway ovals, street tracks, and permanent road courses.',
    simpleTerms: 'You can think of IndyCar as pure high-speed open-wheel racing where cars reach 380 km/h on superspeedway ovals and drivers battle without power steering.',
    inlineStats: [
      { label: 'ROUNDS', value: '17' },
      { label: 'TRACK TYPES', value: 'OVALS, STREETS, ROAD COURSES' },
      { label: 'CROWN JEWEL', value: '110TH INDY 500' },
      { label: 'TOP SPEED', value: '380+ KM/H' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Aero trim and mechanical grip testing on varied surfaces' },
      { step: '02', name: 'QUALIFYING', description: 'Fast Six knockout on road courses; 4-lap average speed runs on ovals' },
      { step: '03', name: 'RACE', description: 'Rolling start, wheel-to-wheel battles, and tactical fuel-saving stints' },
      { step: '04', name: 'VICTORY CELEBRATION', description: 'Drinking the traditional bottle of cold milk at the Indianapolis 500' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'THE INDY 500', explanation: 'The Greatest Spectacle in Racing: 33 cars, 200 laps, 500 miles at 380 km/h.' },
      { num: '02', title: 'TRACK DIVERSITY', explanation: 'Drivers must master tight city street barriers, sweeping road courses, and high-banked ovals.' },
      { num: '03', title: 'PUSH-TO-PASS', explanation: 'On road and street courses, drivers get 150–200 seconds of extra horsepower on demand.' },
      { num: '04', title: 'NO POWER STEERING', explanation: 'IndyCars have zero power steering, making them physically demanding to steer at high Gs.' },
    ],
    howItWorks: {
      overview: '27 drivers in spec Dallara IR-18 hybrid chassis powered by Chevy and Honda V6 twin-turbos compete across 17 rounds.',
      eventFormat: 'Features road courses, street circuits, short ovals, and superspeedways culminating in the Indianapolis 500.',
      weekendStructure: [
        { session: 'Practice Sessions', description: 'Setup fine-tuning for high or low downforce.' },
        { session: 'Qualifying', description: 'Knockout Fast Six or 4-lap oval speed runs.' },
        { session: 'Race', description: 'Rolling start endurance sprint.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points awarded to all starters (50 for win, 40 for 2nd, 35 for 3rd), plus bonus points for pole and leading laps.',
      pointsTable: [{ position: 'P1 (Winner)', points: '50 PTS' }, { position: 'P2', points: '40 PTS' }, { position: 'P3', points: '35 PTS' }],
    },
    keyRegulations: [{ rule: 'Aeroscreen Protection', explanation: 'Ballistic cockpit screen protecting driver head from high-speed debris.' }],
    machineryOverview: {
      vehicleType: 'Dallara IR-18 Hybrid Open-Wheel',
      headline: 'Twin-Turbo V6 Hybrid Screaming at 12,000 RPM',
      keyHighlights: ['2.2L twin-turbo V6 + supercapacitor hybrid unit', 'Aeroscreen safety canopy', 'Firestone Firehawk tyres'],
    },
    historyOverview: 'Rooted in the first Indianapolis 500 in 1911, IndyCar is an American motorsport institution.',
    beginnerTopics: [],
  },

  nascar: {
    championshipId: 'nascar',
    sportName: 'NASCAR Cup Series',
    oneLineIntro: 'The top division of American stock car racing, where 36 roaring V8 beasts engage in close-quarters bumper-to-bumper combat.',
    simpleTerms: 'You can think of NASCAR as full-contact heavy stock car racing where drivers rub bumpers at 320 km/h around high-banked ovals.',
    inlineStats: [
      { label: 'ROUNDS', value: '36' },
      { label: 'ENGINE', value: '5.86L PUSHROD V8' },
      { label: 'CROWN JEWEL', value: 'DAYTONA 500' },
      { label: 'WEIGHT', value: '1,450 KG' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Drafting pack simulations and tyre wear testing' },
      { step: '02', name: 'QUALIFYING', description: 'Single-car or group speed runs for front-row starting spots' },
      { step: '03', name: 'STAGE RACING', description: 'Stage 1, Stage 2, and Final Stage awarding points throughout the race' },
      { step: '04', name: 'VICTORY BURNOUT', description: 'Smoky burnouts and checkered flag celebration' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'THE DRAFT & BUMP DRAFTING', explanation: 'Cars punch a hole in the air; following cars push the car ahead to gain mutual speed.' },
      { num: '02', title: 'STAGE RACING', explanation: 'Races are split into three stages, awarding bonus playoff points at each stage break.' },
      { num: '03', title: 'THE PLAYOFFS', explanation: 'The regular season leads into a 10-race elimination playoff to crown the Cup Champion.' },
      { num: '04', title: 'RUBBING IS RACING', explanation: 'With durable composite bodies, close contact and bumper tapping are part of the sport.' },
    ],
    howItWorks: {
      overview: '36 chartered teams race Next Gen cars powered by roaring naturally aspirated V8s across ovals, superspeedways, and road courses.',
      eventFormat: '36 championship rounds spanning the Daytona 500 opener to the Championship 4 season finale.',
      weekendStructure: [
        { session: 'Practice & Qualifying', description: 'Drafting balance and pole runs.' },
        { session: 'Race Stages 1 & 2', description: 'Stage points and strategy pit stops.' },
        { session: 'Final Stage', description: 'Checkered flag showdown.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Points awarded for finish position (40 for win down to 1), plus 10-to-1 points for top 10 in Stages 1 and 2.',
      pointsTable: [{ position: 'P1 (Winner)', points: '40 PTS + 5 Playoff PTS' }, { position: 'P2', points: '35 PTS' }, { position: 'P3', points: '34 PTS' }],
    },
    keyRegulations: [{ rule: 'Next Gen Spec Chassis', explanation: 'Equalized spec components with sequential manual gearboxes and independent rear suspension.' }],
    machineryOverview: {
      vehicleType: 'NASCAR Next Gen V8 Stock Car',
      headline: '670 bhp Pushrod V8 Muscle',
      keyHighlights: ['5.86L naturally aspirated V8', 'Composite carbon-Kevlar body panels', 'Goodyear 18-inch aluminum wheels'],
    },
    historyOverview: 'Born in 1948 from moonshine runners modifying production cars, NASCAR is a cornerstone of American sports culture.',
    beginnerTopics: [],
  },

  'gt-world-challenge': {
    championshipId: 'gt-world-challenge',
    sportName: 'Fanatec GT World Challenge',
    oneLineIntro: 'The world’s premier customer GT3 racing network, uniting Ferrari, Porsche, BMW, Mercedes-AMG, Aston Martin, and Lamborghini in Sprint and Endurance battles.',
    simpleTerms: 'You can think of GT World Challenge as dream supercar racing where production-based Ferraris, Porsches, and Lamborghinis battle in multi-hour endurance classics.',
    inlineStats: [
      { label: 'CLASSES', value: 'PRO, GOLD, SILVER, BRONZE' },
      { label: 'CROWN JEWEL', value: 'CROWD洞TRIKE 24 HOURS OF SPA' },
      { label: 'MACHINERY', value: 'FIA HOMOLOGATED GT3' },
      { label: 'DRIVERS', value: 'PROS & GENTLEMAN DRIVERS' },
    ],
    weekendSequence: [
      { step: '01', name: 'FREE PRACTICE', description: 'Bronze driver test and general setup balance' },
      { step: '02', name: 'QUALIFYING', description: 'Combined driver lap times deciding the starting grid' },
      { step: '03', name: 'SPRINT / ENDURANCE', description: '1-hour pit-stop sprints or 3h/24h endurance marathons' },
      { step: '04', name: 'PODIUM', description: 'Overall and category class podium awards' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'CUSTOMER RACING', explanation: 'Manufacturers sell race cars to private teams, supporting them with factory star drivers.' },
      { num: '02', title: 'SPRINT VS ENDURANCE', explanation: 'The championship splits into 1-hour 2-driver Sprints and 3-hour to 24-hour Endurance races.' },
      { num: '03', title: 'DRIVER CATEGORISATION', explanation: 'FIA grades drivers (Platinum, Gold, Silver, Bronze) to ensure fair Pro-Am competition.' },
      { num: '04', title: '24 HOURS OF SPA', explanation: 'The biggest GT3 race on earth: 70+ GT3 cars flat-out through Eau Rouge for 24 hours.' },
    ],
    howItWorks: {
      overview: 'Over 60 GT3 cars compete across sprint and endurance formats at legendary tracks across Europe, America, and Asia.',
      eventFormat: 'Features 5 Sprint Cup weekends and 5 Endurance Cup weekends, headlined by the 24 Hours of Spa.',
      weekendStructure: [
        { session: 'Practice', description: 'Setup tuning and driver rotation drills.' },
        { session: 'Qualifying', description: 'Combined aggregate qualifying times.' },
        { session: 'Race', description: 'Endurance or sprint race with mandatory pit stops.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Standard 25-18-15 points for standard races; scaled points for 24 Hours of Spa at 6h, 12h, and 24h marks.',
      pointsTable: [{ position: 'P1 (Winner)', points: '25 PTS' }, { position: 'P2', points: '18 PTS' }],
    },
    keyRegulations: [{ rule: 'SRO Balance of Performance', explanation: 'Continuous data monitoring ensures parity between front-, mid-, and rear-engined supercars.' }],
    machineryOverview: {
      vehicleType: 'FIA GT3 Homologated Supercar',
      headline: 'Production Supercars Tuned for Racing',
      keyHighlights: ['500–550 bhp power cap', 'ABS and adjustable traction control', 'Pirelli spec DHF tyres'],
    },
    historyOverview: 'Created by Stéphane Ratel Organisation (SRO), GT3 has become the most successful global sportscar formula in racing history.',
    beginnerTopics: [],
  },

  'indian-motorsport': {
    championshipId: 'indian-motorsport',
    sportName: 'Indian National Racing & Formula 4 India',
    oneLineIntro: 'The vibrant subcontinent racing ecosystem, from grassroots karting and JK Tyre National Racing to FIA-certified Formula 4 India.',
    simpleTerms: 'You can think of Indian Motorsport as India’s homegrown racing pipeline where young talent develops from karting to F4 on historic circuits like Buddh, Chennai, and Kari.',
    inlineStats: [
      { label: 'CIRCUITS', value: 'BUDDH, MMRT, KARI, COIMBATORE' },
      { label: 'TOP SERIES', value: 'F4 INDIA & INDIAN RACING LEAGUE' },
      { label: 'SUPER LICENCE', value: '12 FIA SL POINTS (F4 INDIA)' },
      { label: 'GOVERNING BODY', value: 'FMSCI / FIA' },
    ],
    weekendSequence: [
      { step: '01', name: 'PRACTICE', description: 'Acclimatization in high tropical heat at Chennai, Kari or Buddh' },
      { step: '02', name: 'QUALIFYING', description: 'Time attack session setting the grid for Sprint Race 1' },
      { step: '03', name: 'SPRINT RACES', description: 'Multiple sprint races over a double-header race weekend' },
      { step: '04', name: 'PODIUM', description: 'Celebrating India’s next generation of motorsport champions' },
    ],
    beginnerConcepts: [
      { num: '01', title: 'THE INDIAN PATHWAY', explanation: 'Karting -> JK Tyre / MRF National Series -> F4 India -> FIA F3 and global single-seaters.' },
      { num: '02', title: 'HISTORIC TRACKS', explanation: 'From the F1-spec Buddh International Circuit to the technical sweeps of Madras (MMRT) and Kari.' },
      { num: '03', title: 'FIA F4 ACCREDITATION', explanation: 'Formula 4 India awards official FIA Super Licence points, giving Indian drivers an international bridge.' },
      { num: '04', title: 'CITY STREET CIRCUITS', explanation: 'Initiatives like the Chennai Night Street Circuit bring street racing to passionate urban crowds.' },
    ],
    howItWorks: {
      overview: 'Sanctioned by the Federation of Motor Sports Clubs of India (FMSCI), hosting national single-seater, touring car, and rally championships.',
      eventFormat: 'Multi-round weekend festivals with 3 to 4 sprint races per weekend.',
      weekendStructure: [
        { session: 'Free Practice', description: 'Setup tuning for track grip and tyre life.' },
        { session: 'Qualifying', description: 'Grid placement shootouts.' },
        { session: 'Races 1–3', description: 'Multiple sprint heats across the weekend.' },
      ],
    },
    pointsAndScoring: {
      summary: 'Standard FIA points (25-18-15) awarded across sprint heats.',
      pointsTable: [{ position: 'P1 (Winner)', points: '25 PTS' }, { position: 'P2', points: '18 PTS' }],
    },
    keyRegulations: [{ rule: 'FMSCI Sporting Code', explanation: 'Safety standards compliant with FIA Appendix J and national technical regulations.' }],
    machineryOverview: {
      vehicleType: 'FIA F4 Gen2 & National Touring Cars',
      headline: 'Abarth-Powered Carbon Single-Seaters',
      keyHighlights: ['Tatuus F4-T421 carbon monocoque with Halo', 'Abarth 1.4L 180 bhp turbo engine', 'MRF / Giti spec tyres'],
    },
    historyOverview: 'From the Sholavaram airfield races in the 1950s to F1 Grands Prix at Buddh, Indian motorsport has a rich and passionate heritage.',
    beginnerTopics: [],
  },
};

/**
 * Returns structured beginner-friendly knowledge for a given motorsport discipline
 */
export function getMotorsportBasics(championshipId: string): MotorsportBasicsGuide | null {
  const norm = championshipId.toLowerCase().trim();
  if (BASICS_REGISTRY[norm]) {
    return BASICS_REGISTRY[norm];
  }
  // Fuzzy alias matching
  if (norm.includes('f1') || norm.includes('formula-1') || norm.includes('formula1')) return BASICS_REGISTRY['f1'];
  if (norm.includes('f2') || norm.includes('formula-2')) return BASICS_REGISTRY['f2'];
  if (norm.includes('f3') || norm.includes('formula-3')) return BASICS_REGISTRY['f3'];
  if (norm.includes('wec') || norm.includes('endurance') || norm.includes('le-mans')) return BASICS_REGISTRY['wec'];
  if (norm.includes('motogp') || norm.includes('moto-gp')) return BASICS_REGISTRY['motogp'];
  if (norm.includes('wrc') || norm.includes('rally')) return BASICS_REGISTRY['wrc'];
  if (norm.includes('electric') || norm.includes('fe') || norm.includes('formula-e')) return BASICS_REGISTRY['formula-e'];
  if (norm.includes('imsa') || norm.includes('weathertech')) return BASICS_REGISTRY['imsa'];
  if (norm.includes('indy') || norm.includes('indycar')) return BASICS_REGISTRY['indycar'];
  if (norm.includes('nascar') || norm.includes('cup')) return BASICS_REGISTRY['nascar'];
  if (norm.includes('gt') || norm.includes('sro')) return BASICS_REGISTRY['gt-world-challenge'];
  if (norm.includes('india') || norm.includes('fmsci')) return BASICS_REGISTRY['indian-motorsport'];

  return null;
}

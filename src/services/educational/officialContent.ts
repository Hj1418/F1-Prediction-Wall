/**
 * Official F1 and FIA Resource Directory & Governance Metadata
 * 
 * CORE PRINCIPLE:
 * "WE EXPLAIN. THE OFFICIAL SOURCES PUBLISH."
 * 
 * Our platform provides beginner-friendly explanations and contextual understanding.
 * For authoritative, technical, and regulatory depth, we provide direct, verified
 * links to official Formula1.com and FIA.com publications.
 */

export interface OfficialResource {
  id: string;
  title: string;
  source: 'Formula 1' | 'FIA';
  url: string;
  publishedDate?: string;
  verifiedSeason: number;
  verifiedDate: string;
  category: 'Regulations' | 'Race Weekend' | 'Technical' | 'Circuits';
  description: string;
}

export interface GovernanceMetadata {
  season: number;
  source: string;
  sourceUrl: string;
  verifiedDate: string;
  ruleReference?: string;
}

export interface StructuredTopic {
  id: string;
  title: string;
  category: 'Weekend' | 'Qualifying' | 'Officials' | 'Safety' | 'Strategy' | 'Aero' | 'PowerUnit' | 'Overtake' | 'Points';
  whatIsIt: string;
  howItWorks: string[];
  whyItMatters: string;
  governance: GovernanceMetadata;
}

/**
 * Verified official resources from Formula1.com and FIA.com.
 * No full articles are mirrored; only metadata, contextual descriptions,
 * and direct links to official publications are provided.
 */
export const OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    id: 'fia-2026-sporting-regs',
    title: 'FIA Formula One Sporting Regulations (2026 Issue Revision)',
    source: 'FIA',
    url: 'https://www.fia.com/regulation/category/2182',
    publishedDate: '2026-08-05',
    verifiedSeason: 2026,
    verifiedDate: 'August 2026 Revision',
    category: 'Regulations',
    description: 'The authoritative governing rules covering race weekend schedules, 22-car knockout qualifying procedures, Parc Fermé, safety car restarts, and steward penalties.',
  },
  {
    id: 'fia-2026-technical-regs',
    title: 'FIA Formula One Technical Regulations (Sections A–F Issue Revisions)',
    source: 'FIA',
    url: 'https://www.fia.com/regulation/category/2182',
    publishedDate: '2026-08-05',
    verifiedSeason: 2026,
    verifiedDate: 'August 2026 Revision',
    category: 'Technical',
    description: 'Official technical specifications dictating chassis aerodynamics, Active Aero (X-Mode & Z-Mode), ~350 kW MGU-K hybrid power units, and 100% sustainable fuels.',
  },
  {
    id: 'f1-beginners-guide',
    title: 'The Beginner’s Guide to Formula 1: Everything You Need to Know',
    source: 'Formula 1',
    url: 'https://www.formula1.com/en/latest/article/the-beginners-guide-to-formula-1-everything-you-need-to-know.2z6n1lE9uN0wSj2k5mX7bA.html',
    publishedDate: '2026-03-01',
    verifiedSeason: 2026,
    verifiedDate: '2026 Season',
    category: 'Race Weekend',
    description: 'Official introduction covering championship points, driver lineups, race distances, and how 11 teams and 22 race seats compete across the globe.',
  },
  {
    id: 'f1-sprint-explained',
    title: 'F1 Sprint Format: How Does the 100km Dash Work?',
    source: 'Formula 1',
    url: 'https://www.formula1.com/en/latest/article/the-beginners-guide-to-the-f1-sprint.2R4l6z2V5Q8s1d3Y7f9w0A.html',
    publishedDate: '2026-03-01',
    verifiedSeason: 2026,
    verifiedDate: '2026 Season',
    category: 'Race Weekend',
    description: 'Official explanation of the standalone Saturday Sprint format, Sprint Qualifying (SQ1, SQ2, SQ3), and points awarded to the top eight finishers.',
  },
  {
    id: 'fia-active-aero-overtake',
    title: 'FIA 2026 Regulations: Active Aerodynamics and Manual Override Mode',
    source: 'FIA',
    url: 'https://www.fia.com/news/f1s-new-era-everything-you-need-know-about-how-fia-making-formula-1-more-competitive-more',
    publishedDate: '2026-06-06',
    verifiedSeason: 2026,
    verifiedDate: 'August 2026 Revision',
    category: 'Technical',
    description: 'Comprehensive overview of 2026 aerodynamics: X-Mode (low drag) and Z-Mode (high downforce), combined with the 0.5 MJ electrical Manual Override Mode for overtaking.',
  },
  {
    id: 'fia-appendix-h-flags',
    title: 'FIA International Sporting Code — Appendix H: Circuit Signals & Flags',
    source: 'FIA',
    url: 'https://www.fia.com/regulation/category/123',
    publishedDate: '2026-01-15',
    verifiedSeason: 2026,
    verifiedDate: '2026 Season',
    category: 'Regulations',
    description: 'Authoritative rules for track marshals, safety car protocols, red flag stoppages, and electronic light panel signals during sessions.',
  },
];

/**
 * Structured educational explanations structured into the 3-question pedagogical framework:
 * 1. WHAT IS IT?
 * 2. HOW DOES IT WORK?
 * 3. WHY DOES IT MATTER?
 * Followed by official regulatory governance references.
 */
export const STRUCTURED_TOPICS: StructuredTopic[] = [
  {
    id: 'qualifying',
    title: 'Knockout Qualifying',
    category: 'Qualifying',
    whatIsIt: 'Qualifying is the competitive Saturday session that determines the starting order (the grid) for Sunday’s Grand Prix.',
    howItWorks: [
      'Q1 (18 minutes): All 22 cars take to the track on low fuel and soft tyres. The slowest 6 cars (P17–P22) are eliminated and lock their starting spots.',
      'Q2 (15 minutes): Lap times reset to zero. The remaining 16 cars compete. The slowest 6 cars (P11–P16) are eliminated.',
      'Q3 (12 minutes): The top-10 pole position shootout. The fastest driver claims Pole Position (P1) on Sunday’s starting grid.',
      '22 Race Seats Context: With 11 constructors and 22 race seats on the grid, 6 cars are knocked out in each of the first two elimination segments.',
    ],
    whyItMatters: 'Starting near the front gives drivers clean air, avoids mid-pack traffic collisions, and massively increases the statistical likelihood of winning the Grand Prix.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Sporting Regulations',
      ruleReference: 'Section B (Issue 08) — Article 39',
      sourceUrl: 'https://www.fia.com/regulation/category/2182',
      verifiedDate: 'August 2026 Revision',
    },
  },
  {
    id: 'sprint',
    title: 'F1 Sprint Format',
    category: 'Weekend',
    whatIsIt: 'A 100-kilometre flat-out race contested on Saturday at select Grands Prix, awarding championship points with no mandatory pit stops.',
    howItWorks: [
      'Friday: Free Practice 1 (60 mins) followed directly by Sprint Qualifying (SQ1: 12m, SQ2: 10m, SQ3: 8m).',
      'Saturday Morning: The 100km Sprint race takes place, lasting approximately 30 minutes.',
      'Points: Awarded to the top eight finishers (8 points for 1st down to 1 point for 8th).',
      'Saturday Afternoon: Standard Grand Prix Qualifying takes place to set the grid for Sunday’s Grand Prix.',
    ],
    whyItMatters: 'It provides immediate competitive racing on Saturday and awards up to 8 valuable championship points that frequently swing title battles.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Sporting Regulations',
      ruleReference: 'Section B (Issue 08) — Article 40',
      sourceUrl: 'https://www.fia.com/regulation/category/2182',
      verifiedDate: 'August 2026 Revision',
    },
  },
  {
    id: 'officials',
    title: 'Race Control & FIA Stewards',
    category: 'Officials',
    whatIsIt: 'The independent officiating body responsible for enforcing safety, sporting fairness, and adjudicating on-track racing incidents.',
    howItWorks: [
      'Race Director: Manages track safety, starts, Safety Car / Virtual Safety Car deployments, and red flag stoppages.',
      'FIA Stewards: A rotating panel of 4 independent judicial officials (including an experienced ex-driver) who investigate clashes, track limits, and rule breaches.',
      'Penalties: Stewards can assess 5-second or 10-second time penalties, drive-throughs, stop-and-go penalties, or penalty points on a driver’s Super Licence.',
    ],
    whyItMatters: 'Without independent stewards, dangerous driving and sporting unfairness would go unchecked. 12 penalty points in 12 months triggers an automatic one-race ban.',
    governance: {
      season: 2026,
      source: 'FIA International Sporting Code',
      ruleReference: 'Article 11 (Stewards & Judicial Authority)',
      sourceUrl: 'https://www.fia.com/regulation/category/123',
      verifiedDate: '2026 Season',
    },
  },
  {
    id: 'flags',
    title: 'Flags & Safety Car Systems',
    category: 'Safety',
    whatIsIt: 'The visual signaling system used by marshals and electronic light panels around the track to warn drivers of danger, track conditions, or session stoppages.',
    howItWorks: [
      'Green Flag: Track is clear; normal racing and overtaking are permitted.',
      'Yellow Flag: Hazard ahead. Single waved means reduce speed and no overtaking. Double waved means hazard blocking the track or marshals present; drivers must be prepared to stop.',
      'Red Flag: Session suspended immediately. Cars must slowly return to pit lane.',
      'Blue Flag: Shown to a car about to be lapped. Must yield to the leader within 3 marshal sectors.',
      'Safety Car (SC): Controlled pace car bunches the pack. Virtual Safety Car (VSC): Drivers must strictly maintain a positive delta time on steering displays without a physical car on track.',
    ],
    whyItMatters: 'High-speed motorsport depends on split-second safety communication. Ignoring yellow or red flags results in immediate severe sporting penalties.',
    governance: {
      season: 2026,
      source: 'FIA International Sporting Code',
      ruleReference: 'Appendix H (Circuit Signals)',
      sourceUrl: 'https://www.fia.com/regulation/category/123',
      verifiedDate: '2026 Season',
    },
  },
  {
    id: 'tyres',
    title: 'Tyre Compounds & Pit Strategy',
    category: 'Strategy',
    whatIsIt: 'Pirelli supplies 5 dry compound grades (C1 hardest to C5 softest). Three consecutive grades are nominated for each Grand Prix as Soft (Red), Medium (Yellow), and Hard (White).',
    howItWorks: [
      'Soft (Red): Maximum grip, fast lap times, short lifespan before degrading.',
      'Medium (Yellow): Balanced pace and durability; the workhorse race tyre.',
      'Hard (White): Lower mechanical grip, highly durable; essential for long stints.',
      'Inters (Green) & Wet (Blue): Grooved rain tyres clearing 30 to 85 litres of water per second.',
      'Mandatory Dry Rule: Every driver must use at least two different dry compounds in a dry race, enforcing at least one pit stop.',
    ],
    whyItMatters: 'Tyre degradation dictates race strategy. Pitting early to undercut a rival or staying out longer on durable tyres determines track position and victories.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Sporting Regulations',
      ruleReference: 'Section B (Issue 08) — Article 30',
      sourceUrl: 'https://www.fia.com/regulation/category/2182',
      verifiedDate: 'August 2026 Revision',
    },
  },
  {
    id: 'active-aero',
    title: 'Active Aerodynamics (X-Mode & Z-Mode)',
    category: 'Aero',
    whatIsIt: 'Active Aerodynamics replaces traditional DRS with movable front and rear wing elements that switch between a low-drag straight-line state and a high-downforce cornering state. It is an energy-efficiency and aerodynamic handling system available to all cars, not an overtaking button.',
    howItWorks: [
      'Low-Drag Straight Mode (FIA technical designation: X-Mode): Wing elements open on designated high-speed straights, dramatically cutting drag to increase straight-line efficiency and fuel/energy economy.',
      'High-Downforce Cornering Mode (FIA technical designation: Z-Mode): Wing elements close automatically prior to braking zones, restoring full downforce to maximize mechanical and aero grip through corners.',
      'Universal System: Unlike legacy DRS, Active Aero is operated by every car across designated track sectors regardless of time gaps to rivals.',
      'UI Terminology Note: While fans and broadcasts often use "Straight Mode" and "Corner Mode", the official FIA technical regulations classify these states as X-Mode and Z-Mode.',
    ],
    whyItMatters: '2026 cars achieve high top speeds on straights without expending excessive battery power, while maintaining high aerodynamic stability and cornering speeds through technical sectors.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Technical Regulations',
      ruleReference: 'Section C (Issue 20) — Aerodynamic Components',
      sourceUrl: 'https://www.fia.com/regulation/category/2182',
      verifiedDate: 'August 2026 Revision',
    },
  },
  {
    id: 'overtake-mode',
    title: 'Overtake Mode & Manual Override',
    category: 'Overtake',
    whatIsIt: 'The primary overtaking aid for the 2026 era. Because Active Aero is used by all cars, overtaking is assisted through additional electrical energy deployment via the Manual Override / Overtake system when an attacking car is within range.',
    howItWorks: [
      'Activation Window: An attacking car must be within 1.000 second of the rival ahead at the official detection point.',
      '0.5 MJ Electrical Boost: When activated, the attacking driver receives an extra burst of up to 0.5 megajoules of electrical power from the MGU-K.',
      'Tapering Deployment Curve: Up to 290 km/h, both cars have 350 kW electrical boost. Past 290 km/h, the leading car’s electrical power ramps down to zero at 355 km/h, while the attacking car maintains full 350 kW electrical output up to 337 km/h with 0.5 MJ extra energy.',
      'Active Aero ≠ Overtake Mode: Active Aero manages drag for everyone; Overtake Mode delivers temporary tactical battery deployment exclusively to the trailing attacker.',
    ],
    whyItMatters: 'Creates genuine tactical wheel-to-wheel battles that reward energy harvesting and defensive battery management rather than simple push-to-pass DRS flybys.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Technical & Sporting Regulations',
      ruleReference: 'Section B (Issue 08) & Section E (Issue 06) — Manual Override',
      sourceUrl: 'https://www.fia.com/regulation/category/2182',
      verifiedDate: 'August 2026 Revision',
    },
  },
  {
    id: 'power-unit',
    title: '2026 Hybrid Power Unit',
    category: 'PowerUnit',
    whatIsIt: 'The 2026 Formula 1 Power Unit is a next-generation hybrid combining an advanced 1.6-litre turbocharged V6 internal combustion engine (ICE) with a dramatically expanded 350 kW electric motor (MGU-K), fueled by 100% sustainable fuels.',
    howItWorks: [
      'ICE Power (~400 kW): The 1.6-litre V6 turbocharged combustion engine produces approximately 400 kW (~535 bhp), operating with strict fuel energy flow limits.',
      'Electric MGU-K Power (up to 350 kW): The Motor Generator Unit - Kinetic delivers up to 350 kW (~470 bhp), nearly tripling the previous 120 kW electrical output.',
      'MGU-H Removal: The complex Motor Generator Unit - Heat has been completely eliminated to reduce costs and technical complexity.',
      '100% Sustainable Fuel: Engines run exclusively on advanced drop-in fossil-free fuels produced from non-food bio-waste or carbon capture synthetic sources.',
      'Braking Energy Recovery: The MGU-K can harvest up to 8.5 MJ of energy per lap under heavy braking, making energy regeneration twice as powerful as previous seasons.',
    ],
    whyItMatters: 'Delivers approximately 1,000 total horsepower with a far more balanced contribution between combustion and electrical power, making energy management as critical to race victory as tyre wear.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Technical Regulations',
      ruleReference: 'Section E (Issue 06) — Power Unit Specification',
      sourceUrl: 'https://www.fia.com/regulation/category/2182',
      verifiedDate: 'August 2026 Revision',
    },
  },
  {
    id: 'points',
    title: 'Championship Points System',
    category: 'Points',
    whatIsIt: 'The scoring table that determines the World Drivers’ Championship (WDC) and World Constructors’ Championship (WCC) standings.',
    howItWorks: [
      'Grand Prix: 25 points for 1st, 18 for 2nd, 15 for 3rd, 12 for 4th, 10 for 5th, 8 for 6th, 6 for 7th, 4 for 8th, 2 for 9th, and 1 for 10th.',
      'Sprint: 8 points for 1st down to 1 point for 8th.',
      'Constructors Score: Both cars fielded by a team combine their points in every session.',
    ],
    whyItMatters: 'Every point matters. The Constructors’ Championship finish determines millions of dollars in official prize money and aerodynamic testing wind tunnel allocations.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Sporting Regulations',
      ruleReference: 'Section B (Issue 08) — Article 6',
      sourceUrl: 'https://www.fia.com/regulation/category/2182',
      verifiedDate: 'August 2026 Revision',
    },
  },
];


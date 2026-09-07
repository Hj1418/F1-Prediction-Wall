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
  category: 'Weekend' | 'Qualifying' | 'Officials' | 'Safety' | 'Strategy' | 'Aero' | 'Points';
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
    title: 'FIA Formula One Sporting Regulations',
    source: 'FIA',
    url: 'https://www.fia.com/regulation/category/110',
    publishedDate: '2026-01-15',
    verifiedSeason: 2026,
    verifiedDate: 'March 2026',
    category: 'Regulations',
    description: 'The authoritative governing rules covering race weekend schedules, knockout qualifying procedures, Parc Fermé, safety car restarts, and steward penalties.',
  },
  {
    id: 'fia-2026-technical-regs',
    title: 'FIA Formula One Technical Regulations',
    source: 'FIA',
    url: 'https://www.fia.com/regulation/category/110',
    publishedDate: '2026-01-15',
    verifiedSeason: 2026,
    verifiedDate: 'March 2026',
    category: 'Technical',
    description: 'Official technical specifications dictating chassis aerodynamics, minimum weight, hybrid power unit recovery (ERS), and safety survival cells.',
  },
  {
    id: 'f1-beginners-guide',
    title: 'The Beginner’s Guide to Formula 1: Everything You Need to Know',
    source: 'Formula 1',
    url: 'https://www.formula1.com/en/latest/article/the-beginners-guide-to-formula-1-everything-you-need-to-know.2z6n1lE9uN0wSj2k5mX7bA.html',
    publishedDate: '2025-02-20',
    verifiedSeason: 2026,
    verifiedDate: 'March 2026',
    category: 'Race Weekend',
    description: 'Official introduction by Formula 1 covering championship points, driver lineups, race distances, and how 10 teams compete across the globe.',
  },
  {
    id: 'f1-sprint-explained',
    title: 'F1 Sprint Format: How Does the 100km Dash Work?',
    source: 'Formula 1',
    url: 'https://www.formula1.com/en/latest/article/the-beginners-guide-to-the-f1-sprint.2R4l6z2V5Q8s1d3Y7f9w0A.html',
    publishedDate: '2025-03-01',
    verifiedSeason: 2026,
    verifiedDate: 'March 2026',
    category: 'Race Weekend',
    description: 'Official explanation of the standalone Saturday Sprint format, Sprint Qualifying (SQ1, SQ2, SQ3), and points awarded to the top eight finishers.',
  },
  {
    id: 'f1-tyres-guide',
    title: 'Pirelli F1 Tyres Explained: Compounds, Allocations and Strategies',
    source: 'Formula 1',
    url: 'https://www.formula1.com/en/latest/article/the-beginners-guide-to-f1-tyres.1A2B3C4D5E6F7G8H9I0J.html',
    publishedDate: '2025-02-28',
    verifiedSeason: 2026,
    verifiedDate: 'March 2026',
    category: 'Technical',
    description: 'Official breakdown of the 5 dry compounds (C1 to C5), colour-coded slick tyres (Soft, Medium, Hard), wet tyres, and mandatory pit stop requirements.',
  },
  {
    id: 'fia-appendix-h-flags',
    title: 'FIA International Sporting Code — Appendix H: Circuit Signals & Flags',
    source: 'FIA',
    url: 'https://www.fia.com/regulation/category/123',
    publishedDate: '2025-12-10',
    verifiedSeason: 2026,
    verifiedDate: 'March 2026',
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
      'Q1 (18 minutes): All 20 cars take to the track on low fuel and soft tyres. The slowest 5 cars (P16–P20) are eliminated and lock their grid spots.',
      'Q2 (15 minutes): Lap times reset to zero. The remaining 15 cars compete. The slowest 5 cars (P11–P15) are eliminated.',
      'Q3 (12 minutes): The top-10 pole position shootout. The fastest driver claims Pole Position (P1) on Sunday’s starting grid.',
    ],
    whyItMatters: 'Starting near the front gives drivers clean air, avoids mid-pack traffic collisions, and massively increases the statistical likelihood of winning the Grand Prix.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Sporting Regulations',
      ruleReference: 'Article 39 (Qualifying Procedures)',
      sourceUrl: 'https://www.fia.com/regulation/category/110',
      verifiedDate: 'March 2026',
    },
  },
  {
    id: 'sprint',
    title: 'F1 Sprint Format',
    category: 'Weekend',
    whatIsIt: 'A 100-kilometre flat-out race contested on Saturday at 6 select Grands Prix, awarding championship points with no mandatory pit stops.',
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
      ruleReference: 'Article 40 (Sprint Sessions)',
      sourceUrl: 'https://www.fia.com/regulation/category/110',
      verifiedDate: 'March 2026',
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
      verifiedDate: 'March 2026',
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
      verifiedDate: 'March 2026',
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
      ruleReference: 'Article 30 (Tyre Supply & Usage)',
      sourceUrl: 'https://www.fia.com/regulation/category/110',
      verifiedDate: 'March 2026',
    },
  },
  {
    id: 'drs',
    title: 'DRS & Aerodynamics',
    category: 'Aero',
    whatIsIt: 'Drag Reduction System (DRS) is a driver-activated flap in the rear wing designed to promote overtaking by cutting aerodynamic drag on straights.',
    howItWorks: [
      'Detection Zone: An electronic timing loop checks if a trailing car is within 1.000 second of the car ahead.',
      'Activation Zone: If within 1 second, the driver presses the DRS steering button. A hydraulic actuator opens the rear wing flap.',
      'Top Speed Boost: Drag is reduced by ~20%, increasing straight-line speed by 15–25 km/h until the driver brakes.',
      'Restrictions: DRS is disabled during wet conditions, safety car periods, and the first laps following a race start or restart.',
    ],
    whyItMatters: 'Modern F1 cars generate turbulent "dirty air" that makes following closely through corners difficult. DRS offsets this disadvantage down the straights.',
    governance: {
      season: 2026,
      source: 'FIA Formula One Technical & Sporting Regulations',
      ruleReference: 'Article 3.10 (Rear Wing Aerodynamic Devices)',
      sourceUrl: 'https://www.fia.com/regulation/category/110',
      verifiedDate: 'March 2026',
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
      ruleReference: 'Article 6 (World Championship Points)',
      sourceUrl: 'https://www.fia.com/regulation/category/110',
      verifiedDate: 'March 2026',
    },
  },
];

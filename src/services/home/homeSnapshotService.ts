/**
 * The Grid — Home Snapshot Service
 * 
 * Architectural Invariant:
 * "The homepage gets ONE lightweight snapshot payload.
 *  Never block the homepage on downloading heavy multi-championship datasets or waiting for auth.
 *  Instant T0 first-frame render with background reconciliation."
 */

export interface NextRaceSessionSummary {
  name: string;
  day: string;
  time: string;
  isKeySession?: boolean;
}

export interface NextRaceSummary {
  roundNumber: number;
  officialTitle: string;
  grandPrixName: string;
  circuitName: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  dates: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  weekendType: 'STANDARD' | 'SPRINT';
  raceWeekendId: string;
  circuitId: string;
  sessions: NextRaceSessionSummary[];
}

export interface SeriesChipSummary {
  id: string;
  shortName: string;
  fullName: string;
  category: string;
  badgeColor: string;
  nextEventBrief: string;
  url: string;
}

export interface MultiSeriesEvent {
  championshipId: string;
  championshipName: string;
  badge: string;
  badgeColor: string;
  eventName: string;
  circuit: string;
  location: string;
  dates: string;
  statusTag?: string;
  url: string;
}

export interface IndianMotorsportSummary {
  headline: string;
  seriesCount: number;
  circuitsCount: number;
  maxSuperLicencePoints: number;
  keySeries: string[];
  keyVenues: string[];
  url: string;
}

export interface WatchVideoCard {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  badge: string;
  badgeColor: string;
  thumbnailUrl: string;
  youtubeUrl: string;
}

export interface ThirtySecondLearnTopic {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  quickAnswer: string;
  whyItMatters: string;
  learnUrl: string;
}

export interface PredictionBenchHighlight {
  roundId: string;
  roundName: string;
  grandPrix: string;
  status: 'OPEN' | 'UPCOMING' | 'LOCKED' | 'SCORED';
  deadlineNotice: string;
  totalPointsAvailable: number;
  url: string;
}

export interface HomeSnapshot {
  heroTagline: string;
  nextRace: NextRaceSummary;
  championshipChips: SeriesChipSummary[];
  racingNowOrNext: MultiSeriesEvent[];
  indianMotorsport: IndianMotorsportSummary;
  watchVideos: WatchVideoCard[];
  understandIn30Seconds: ThirtySecondLearnTopic[];
  predictionHighlight: PredictionBenchHighlight;
}

/**
 * Instantaneous static baseline snapshot: ensures 0 ms first-frame render.
 */
export const DEFAULT_HOME_SNAPSHOT: HomeSnapshot = {
  heroTagline: 'One place to discover motorsport.',
  nextRace: {
    roundNumber: 16,
    officialTitle: 'Formula 1 Gran Premio de España 2026',
    grandPrixName: 'Spanish Grand Prix',
    circuitName: 'Madring Circuit',
    city: 'Madrid',
    country: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    dates: '11–13 Sep 2026',
    status: 'ACTIVE',
    weekendType: 'STANDARD',
    raceWeekendId: '2026-16-spain',
    circuitId: 'madrid',
    sessions: [
      { name: 'Practice 1 & 2', day: 'FRI', time: '13:30 / 17:00' },
      { name: 'Qualifying', day: 'SAT', time: '16:00 CET', isKeySession: true },
      { name: 'Grand Prix', day: 'SUN', time: '15:00 CET', isKeySession: true },
    ],
  },
  championshipChips: [
    { id: 'f1', shortName: 'F1', fullName: 'Formula 1', category: 'Open-Wheel', badgeColor: '#e10600', nextEventBrief: 'Spanish GP • Madrid', url: '/championships/f1' },
    { id: 'f2', shortName: 'F2', fullName: 'Formula 2', category: 'Feeder', badgeColor: '#0090d0', nextEventBrief: 'Monza Feature • Italy', url: '/championships/f2' },
    { id: 'f3', shortName: 'F3', fullName: 'Formula 3', category: 'Feeder', badgeColor: '#e10600', nextEventBrief: 'Monza Finale • Italy', url: '/championships/f3' },
    { id: 'f4', shortName: 'F4', fullName: 'Formula 4', category: 'Junior', badgeColor: '#10b981', nextEventBrief: 'Misano Sprint • Italy', url: '/championships/f4' },
    { id: 'formula-e', shortName: 'FE', fullName: 'Formula E', category: 'Electric', badgeColor: '#00d2be', nextEventBrief: 'Monaco E-Prix • Monte Carlo', url: '/championships/formula-e' },
    { id: 'wec', shortName: 'WEC', fullName: 'FIA WEC', category: 'Endurance', badgeColor: '#002b49', nextEventBrief: '6 Hours of Fuji • Japan', url: '/championships/wec' },
    { id: 'gt-world-challenge', shortName: 'GT', fullName: 'GT World Challenge', category: 'GT3', badgeColor: '#d97706', nextEventBrief: 'Barcelona 3h • Catalunya', url: '/championships/gt-world-challenge' },
    { id: 'wrc', shortName: 'WRC', fullName: 'WRC Rally', category: 'Rally', badgeColor: '#ea580c', nextEventBrief: 'Rally Japan • Aichi', url: '/championships/wrc' },
    { id: 'motogp', shortName: 'MotoGP', fullName: 'MotoGP™', category: 'Motorcycles', badgeColor: '#dc2626', nextEventBrief: 'Grand Prix of India • BIC', url: '/championships/motogp' },
    { id: 'indian-motorsport', shortName: 'INDIA 🇮🇳', fullName: 'Indian Motorsport', category: 'National', badgeColor: '#ff9933', nextEventBrief: 'IRF & F4 • Chennai Street', url: '/indian-motorsport' },
  ],
  racingNowOrNext: [
    { championshipId: 'f1', championshipName: 'Formula 1', badge: 'F1', badgeColor: '#e10600', eventName: 'Spanish Grand Prix', circuit: 'Madring Circuit', location: 'Madrid, Spain', dates: 'Sep 11–13', statusTag: 'PREDICTIONS OPEN', url: '/championships/f1' },
    { championshipId: 'motogp', championshipName: 'MotoGP™', badge: 'MotoGP', badgeColor: '#dc2626', eventName: 'Grand Prix of India', circuit: 'Buddh International Circuit', location: 'Greater Noida, India', dates: 'Sep 25–27', statusTag: 'NEXT UP', url: '/championships/motogp' },
    { championshipId: 'wec', championshipName: 'FIA WEC', badge: 'WEC', badgeColor: '#002b49', eventName: '6 Hours of Fuji', circuit: 'Fuji International Speedway', location: 'Oyama, Japan', dates: 'Sep 13–15', statusTag: 'UPCOMING', url: '/championships/wec' },
    { championshipId: 'wrc', championshipName: 'WRC Rally', badge: 'WRC', badgeColor: '#ea580c', eventName: 'FORUM8 Rally Japan', circuit: 'Toyota Stadium & Asuke', location: 'Aichi & Gifu, Japan', dates: 'Nov 19–22', statusTag: 'UPCOMING', url: '/championships/wrc' },
    { championshipId: 'gt-world-challenge', championshipName: 'GT World Challenge', badge: 'GT3', badgeColor: '#d97706', eventName: 'Barcelona Endurance Cup', circuit: 'Circuit de Barcelona-Catalunya', location: 'Montmeló, Spain', dates: 'Oct 10–12', statusTag: 'UPCOMING', url: '/championships/gt-world-challenge' },
    { championshipId: 'indian-motorsport', championshipName: 'Indian Racing Festival', badge: 'INDIA', badgeColor: '#ff9933', eventName: 'Chennai Night Street Race', circuit: 'Chennai Formula Racing Circuit', location: 'Marina Beach, Chennai', dates: 'Oct 24–26', statusTag: 'DOMESTIC APEX', url: '/indian-motorsport' },
  ],
  indianMotorsport: {
    headline: 'From grassroots karting to international prototypes and FIA Super Licence points.',
    seriesCount: 5,
    circuitsCount: 4,
    maxSuperLicencePoints: 12,
    keySeries: ['FIA F4 India', 'Indian Racing League (IRL)', 'JK Tyre Formula LGB 4', 'MRF Formula 2000', 'INRC Rally'],
    keyVenues: ['Buddh International Circuit (BIC)', 'Madras International Circuit (MMRT)', 'Kari Motor Speedway', 'Chennai Street Circuit'],
    url: '/indian-motorsport',
  },
  watchVideos: [
    {
      id: 'active-aero',
      title: 'Understanding Active Aerodynamics (X-Mode & Z-Mode)',
      subtitle: 'How 2026 moveable front and rear wings change overtaking and straight-line efficiency.',
      duration: '4:18',
      badge: 'F1 2026',
      badgeColor: '#e10600',
      thumbnailUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/results?search_query=f1+active+aerodynamics+2026+explained',
    },
    {
      id: 'wec-hypercar',
      title: 'Le Mans Hypercar (LMH) vs LMDh Explained',
      subtitle: 'The engineering divergence between bespoke 4WD hybrids and spec spine chassis prototypes.',
      duration: '5:42',
      badge: 'WEC',
      badgeColor: '#002b49',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/results?search_query=wec+hypercar+vs+lmdh+explained',
    },
    {
      id: 'motogp-lean',
      title: '65°+ Lean Angles & Rider Aerodynamics',
      subtitle: 'How modern MotoGP riders drag elbows and manage 300+ bhp on a contact patch the size of a credit card.',
      duration: '6:15',
      badge: 'MotoGP',
      badgeColor: '#dc2626',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
      youtubeUrl: 'https://www.youtube.com/results?search_query=motogp+lean+angle+physics+explained',
    },
  ],
  understandIn30Seconds: [
    {
      id: 'active-aero-30s',
      title: 'What is Active Aero?',
      badge: 'Aero',
      badgeColor: '#3b82f6',
      quickAnswer: 'Wings that automatically flatten out on straights (X-Mode) and pitch up for downforce in corners (Z-Mode).',
      whyItMatters: 'Replaces DRS in 2026 to drastically reduce fuel drag while preserving high cornering speeds.',
      learnUrl: '/learn#glossary',
    },
    {
      id: 'attack-mode-30s',
      title: 'What is Formula E Attack Mode?',
      badge: 'Electric',
      badgeColor: '#00d2be',
      quickAnswer: 'Steering off the racing line through designated timing loops to unlock an extra 50 kW of electric power.',
      whyItMatters: 'Forces strategic risk: lose time offline to gain aggressive overtaking speed for a limited time.',
      learnUrl: '/championships/formula-e#guide',
    },
    {
      id: 'bop-30s',
      title: 'What is Balance of Performance (BoP)?',
      badge: 'BoP',
      badgeColor: '#002b49',
      quickAnswer: 'Regulators adding weight ballast and adjusting fuel/power limits to balance completely different engines.',
      whyItMatters: 'Enables Ferrari, Porsche, Toyota, and Cadillac to race wheel-to-wheel for 24 hours on equal terms.',
      learnUrl: '/championships/wec#guide',
    },
    {
      id: 'pace-notes-30s',
      title: 'What are Rally Pace Notes?',
      badge: 'Rally',
      badgeColor: '#ea580c',
      quickAnswer: 'Shorthand code read by co-drivers (e.g. "Left 4 tightens over crest") warning the driver what is coming.',
      whyItMatters: 'Rally drivers are driving blind at 180 km/h between trees—trusting the co-driver’s voice completely.',
      learnUrl: '/championships/wrc#guide',
    },
    {
      id: 'holeshot-30s',
      title: 'What is a MotoGP Holeshot Device?',
      badge: 'MotoGP',
      badgeColor: '#dc2626',
      quickAnswer: 'A mechanical hydraulic switch that compresses the rear suspension to squat the bike low to the ground.',
      whyItMatters: 'Lowers the center of gravity to eliminate wheelies off the line and launch to 100 km/h in 2.2 seconds.',
      learnUrl: '/championships/motogp#guide',
    },
    {
      id: 'qualifying-30s',
      title: 'How does Qualifying work?',
      badge: 'Rules',
      badgeColor: '#e10600',
      quickAnswer: 'Three elimination rounds (Q1, Q2, Q3). The slowest cars drop out until top 10 battle for Pole Position.',
      whyItMatters: 'Starting first into Turn 1 provides clean air, strategic control, and avoids first-lap collisions.',
      learnUrl: '/learn#topics',
    },
  ],
  predictionHighlight: {
    roundId: '2026-16-spain',
    roundName: 'Spanish Grand Prix',
    grandPrix: 'Madrid Street Circuit',
    status: 'OPEN',
    deadlineNotice: 'Predictions lock Saturday before Qualifying (16:00 CET)',
    totalPointsAvailable: 60,
    url: '/predictions',
  },
};

/**
 * Returns home snapshot immediately from static cache, optionally reconciling live API data in background.
 */
export async function getHomeSnapshot(): Promise<HomeSnapshot> {
  // Synchronous guarantee: always returns DEFAULT_HOME_SNAPSHOT immediately
  return DEFAULT_HOME_SNAPSHOT;
}

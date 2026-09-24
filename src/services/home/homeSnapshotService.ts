/**
 * The Grid — Home Snapshot Service
 * 
 * Architectural Invariant:
 * "The homepage gets ONE lightweight snapshot payload.
 *  Never block the homepage on downloading heavy multi-championship datasets or waiting for auth.
 *  Instant T0 first-frame render with background reconciliation."
 */

import { clientCache } from '../cache/clientCache';
import { PredictionRound } from '../../types';
import { getResultsTimeline } from '../../utils/predictionTimeline';

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

export interface FeaturedLearnTopic {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  category: string;
  shortExplanation: string;
  keyTakeaway: string;
  learnUrl: string;
}

export interface DiscoverMoreItem {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  description: string;
  url: string;
  actionText: string;
}

export interface PredictionBenchHighlight {
  roundId: string;
  roundName: string;
  grandPrix: string;
  status: 'OPEN' | 'UPCOMING' | 'LOCKED' | 'SCORED';
  deadlineNotice: string;
  resultsExpectedNotice?: string;
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
  featuredLearnTopics: FeaturedLearnTopic[];
  discoverMoreItems: DiscoverMoreItem[];
  predictionHighlight: PredictionBenchHighlight;
}

/**
 * Featured Beginner & Intermediate Learning Cards
 */
export const DEFAULT_FEATURED_LEARN_TOPICS: FeaturedLearnTopic[] = [
  {
    id: 'how-motorsport-works',
    title: 'How Motorsport Works',
    badge: 'Disciplines',
    badgeColor: '#3b82f6',
    category: 'Structure & Disciplines',
    shortExplanation: 'From single-seater apex prototypes to multi-class 24-hour endurance, rally stages, and bikes — racing spans diverse technical rules and physics.',
    keyTakeaway: 'Open-wheel tests pure aero; endurance tests car reliability; rally tests pace-note trust; bikes test extreme physics.',
    learnUrl: '/explore',
  },
  {
    id: 'race-weekends',
    title: 'Understanding Race Weekends',
    badge: 'Weekend',
    badgeColor: '#00d2be',
    category: 'Weekend Format',
    shortExplanation: 'How practice sessions, knockout qualifying shootouts, sprint races, and Sunday Grands Prix fit together across standard and sprint schedules.',
    keyTakeaway: 'Fridays dial in aerodynamic setup; Saturdays set the grid under Parc Fermé; Sundays award maximum championship points.',
    learnUrl: '/explore/f1?tab=basics',
  },
  {
    id: 'flags-safety',
    title: 'Flags & Safety Protocols',
    badge: 'Safety',
    badgeColor: '#eab308',
    category: 'Race Control',
    shortExplanation: 'Green, yellow, red, and blue marshal signals, alongside Safety Car (SC) and Virtual Safety Car (VSC) delta management.',
    keyTakeaway: 'Drivers must respect electronic light panels instantly. Ignoring yellow flags or VSC deltas triggers immediate time penalties.',
    learnUrl: '/explore/f1?tab=basics',
  },
  {
    id: 'qualifying-explained',
    title: 'Qualifying Shootouts Explained',
    badge: 'Quali',
    badgeColor: '#e10600',
    category: 'Grid Order',
    shortExplanation: 'Knockout elimination rounds (Q1, Q2, Q3) where the slowest cars drop out until the top 10 battle on fresh soft tyres for Pole Position.',
    keyTakeaway: 'P1 provides clean aerodynamic air, strategic race control into Turn 1, and avoids mid-pack opening lap incidents.',
    learnUrl: '/explore/f1?tab=basics',
  },
  {
    id: 'tyres-strategy',
    title: 'Tyres, Degradation & Pit Strategy',
    badge: 'Strategy',
    badgeColor: '#10b981',
    category: 'Pit Strategy',
    shortExplanation: 'Soft, Medium, and Hard tyre compounds degrade at different thermal rates. Drivers must pit for mandatory compound switches.',
    keyTakeaway: 'Pitting early (undercut) gains track position on fresh rubber; extending a stint (overcut) exploits clean air and tyre offset.',
    learnUrl: '/explore/f1?tab=basics',
  },
  {
    id: 'motorsport-terminology',
    title: 'Motorsport Terminology',
    badge: 'Glossary',
    badgeColor: '#a855f7',
    category: '50+ Terms',
    shortExplanation: 'Master essential racing jargon: Active Aero, Attack Mode, Balance of Performance (BoP), Apex, Parc Fermé, Box Box, and Delta Times.',
    keyTakeaway: 'Understanding motorsport vocabulary unlocks broadcast commentary and race engineer team radio communications.',
    learnUrl: '/explore/wec?tab=basics',
  },
];

/**
 * Curated discovery paths across the platform
 */
export const DEFAULT_DISCOVER_MORE: DiscoverMoreItem[] = [
  {
    id: 'circuit-guides',
    title: 'Global Circuit Guides',
    tag: 'Circuits',
    tagColor: '#e10600',
    description: 'Explore 25+ iconic circuits across F1, MotoGP, WEC, and Indian tracks with corner layouts, track DNA, and elevation.',
    url: '/circuits',
    actionText: 'Explore Circuits',
  },
  {
    id: 'tech-2026',
    title: '2026 Racecraft & Tech Regulations',
    tag: 'Technical',
    tagColor: '#3b82f6',
    description: 'Deep dive into Active Aerodynamics (X-Mode & Z-Mode), 350 kW MGU-K hybrid deployment, and Manual Override passing assist.',
    url: '/explore/f1?tab=basics',
    actionText: 'Read Tech Guide',
  },
  {
    id: 'driver-ladder',
    title: 'Driver Development Ladders',
    tag: 'Pathways',
    tagColor: '#ff9933',
    description: 'Trace the progression pathway from grassroots karting through Formula 4, Formula 3, Formula 2, and premier world championship seats.',
    url: '/explore/indian-motorsport',
    actionText: 'View Pathway',
  },
  {
    id: 'governance',
    title: 'Official Governance & Rulebooks',
    tag: 'Regulations',
    tagColor: '#10b981',
    description: 'Access direct, verified references to official FIA sporting regulations, technical directives, and International Sporting Code bulletins.',
    url: '/explore',
    actionText: 'Review Hubs',
  },
];

/**
 * Instantaneous static baseline snapshot: ensures 0 ms first-frame render.
 */
export const DEFAULT_HOME_SNAPSHOT: HomeSnapshot = {
  heroTagline: 'Your motorsport starting point.',
  nextRace: {
    roundNumber: 17,
    officialTitle: 'Formula 1 Qatar Airways Azerbaijan Grand Prix 2026',
    grandPrixName: 'Azerbaijan Grand Prix',
    circuitName: 'Baku City Circuit',
    city: 'Baku',
    country: 'Azerbaijan',
    countryCode: 'AZ',
    flag: '🇦🇿',
    dates: '18–20 Sep 2026',
    status: 'ACTIVE',
    weekendType: 'STANDARD',
    raceWeekendId: '2026_17',
    circuitId: 'baku',
    sessions: [
      { name: 'Practice 1 & 2', day: 'FRI', time: '13:30 / 17:00 AZT' },
      { name: 'Practice 3 & Qualifying', day: 'SAT', time: '12:30 / 16:00 AZT', isKeySession: true },
      { name: 'Grand Prix', day: 'SUN', time: '15:00 AZT', isKeySession: true },
    ],
  },
  championshipChips: [
    { id: 'f1', shortName: 'F1', fullName: 'Formula 1', category: 'Open-Wheel', badgeColor: '#e10600', nextEventBrief: 'Azerbaijan GP • Baku', url: '/championships/f1' },
    { id: 'f2', shortName: 'F2', fullName: 'Formula 2', category: 'Feeder', badgeColor: '#0090d0', nextEventBrief: 'Baku Feature • Azerbaijan', url: '/championships/f2' },
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
    { championshipId: 'f1', championshipName: 'Formula 1', badge: 'F1', badgeColor: '#e10600', eventName: 'Azerbaijan Grand Prix', circuit: 'Baku City Circuit', location: 'Baku, Azerbaijan', dates: 'Sep 18–20', statusTag: 'PREDICTIONS OPEN', url: '/championships/f1' },
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
      learnUrl: '/explore/f1?tab=basics',
    },
    {
      id: 'attack-mode-30s',
      title: 'What is Formula E Attack Mode?',
      badge: 'Electric',
      badgeColor: '#00d2be',
      quickAnswer: 'Steering off the racing line through designated timing loops to unlock an extra 50 kW of electric power.',
      whyItMatters: 'Forces strategic risk: lose time offline to gain aggressive overtaking speed for a limited time.',
      learnUrl: '/explore/formula-e?tab=basics',
    },
    {
      id: 'bop-30s',
      title: 'What is Balance of Performance (BoP)?',
      badge: 'BoP',
      badgeColor: '#002b49',
      quickAnswer: 'Regulators adding weight ballast and adjusting fuel/power limits to balance completely different engines.',
      whyItMatters: 'Enables Ferrari, Porsche, Toyota, and Cadillac to race wheel-to-wheel for 24 hours on equal terms.',
      learnUrl: '/explore/wec?tab=basics',
    },
    {
      id: 'pace-notes-30s',
      title: 'What are Rally Pace Notes?',
      badge: 'Rally',
      badgeColor: '#ea580c',
      quickAnswer: 'Shorthand code read by co-drivers (e.g. "Left 4 tightens over crest") warning the driver what is coming.',
      whyItMatters: 'Rally drivers are driving blind at 180 km/h between trees—trusting the co-driver’s voice completely.',
      learnUrl: '/explore/wrc?tab=basics',
    },
    {
      id: 'holeshot-30s',
      title: 'What is a MotoGP Holeshot Device?',
      badge: 'MotoGP',
      badgeColor: '#dc2626',
      quickAnswer: 'A mechanical hydraulic switch that compresses the rear suspension to squat the bike low to the ground.',
      whyItMatters: 'Lowers the center of gravity to eliminate wheelies off the line and launch to 100 km/h in 2.2 seconds.',
      learnUrl: '/explore/motogp?tab=basics',
    },
    {
      id: 'qualifying-30s',
      title: 'How does Qualifying work?',
      badge: 'Rules',
      badgeColor: '#e10600',
      quickAnswer: 'Three elimination rounds (Q1, Q2, Q3). The slowest cars drop out until top 10 battle for Pole Position.',
      whyItMatters: 'Starting first into Turn 1 provides clean air, strategic control, and avoids first-lap collisions.',
      learnUrl: '/explore/f1?tab=basics',
    },
  ],
  featuredLearnTopics: DEFAULT_FEATURED_LEARN_TOPICS,
  discoverMoreItems: DEFAULT_DISCOVER_MORE,
  predictionHighlight: {
    roundId: '2026_17_RACE_PREDICTION',
    roundName: 'Azerbaijan Grand Prix',
    grandPrix: 'Baku City Circuit',
    status: 'OPEN',
    deadlineNotice: 'Predictions lock before Grand Prix start',
    totalPointsAvailable: 60,
    url: '/predict/2026_17_RACE_PREDICTION',
  },
};

export async function getHomeSnapshot(): Promise<HomeSnapshot> {
  const snapshot: HomeSnapshot = { ...DEFAULT_HOME_SNAPSHOT };

  try {
    const { getSharedRaceContext } = await import('../schedule/raceContextService');
    const raceContext = await getSharedRaceContext(2026);

    if (raceContext && raceContext.currentWeekend) {
      const w = raceContext.currentWeekend;
      const circuitName = typeof w.circuit === 'object' && w.circuit ? w.circuit.name : String(w.circuit || 'Grand Prix Circuit');
      const circuitKey = typeof w.circuit === 'object' && w.circuit ? (w.circuit.id || w.circuit.name) : String(w.circuit || 'circuit');
      
      const datesFormatted = w.startDate && w.endDate
        ? `${new Date(w.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}–${new Date(w.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
        : 'Sep 18–20';

      snapshot.nextRace = {
        roundNumber: w.roundNumber || w.round || 17,
        officialTitle: w.name || w.raceName || 'Formula 1 Grand Prix',
        grandPrixName: w.raceName || w.name || 'Azerbaijan Grand Prix',
        circuitName,
        city: (typeof w.circuit === 'object' && w.circuit && (w.circuit as any).locality) ? (w.circuit as any).locality : ((w.raceName || w.name || '').includes('Azerbaijan') ? 'Baku' : (w.country || 'Baku')),
        country: w.country || 'Azerbaijan',
        countryCode: 'AZ',
        flag: w.flag || '🇦🇿',
        dates: datesFormatted,
        status: raceContext.status,
        weekendType: w.weekendType === 'SPRINT' ? 'SPRINT' : 'STANDARD',
        raceWeekendId: w.raceWeekendId,
        circuitId: circuitKey,
        sessions: (w.sessions || []).slice(0, 3).map(s => ({
          name: s.name,
          day: s.startTime ? new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() : 'FRI',
          time: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:00',
          isKeySession: s.type === 'RACE' || s.type === 'QUALIFYING',
        })),
      };

      // Synchronize F1 category chip and radar event
      if (snapshot.championshipChips && snapshot.championshipChips[0]) {
        snapshot.championshipChips[0].nextEventBrief = `${w.raceName || 'Azerbaijan GP'} • ${w.country || 'Baku'}`;
      }
      const isLive = raceContext.status === 'ACTIVE';
      const isPredOpen = raceContext.activePredictionRound?.status === 'OPEN';
      snapshot.racingNowOrNext[0] = {
        championshipId: 'f1',
        championshipName: 'Formula 1',
        badge: 'F1',
        badgeColor: '#e10600',
        eventName: w.raceName || 'Azerbaijan Grand Prix',
        circuit: circuitName,
        location: `${w.country || 'Baku'}`,
        dates: datesFormatted,
        statusTag: isLive ? 'RACE WEEKEND LIVE' : isPredOpen ? 'PREDICTIONS OPEN' : 'NEXT UP',
        url: `/weekends/${w.raceWeekendId}`,
      };

      // Bind active prediction round
      let activeRound = raceContext.activePredictionRound;
      if (!activeRound && w) {
        const { generatePredictionRounds } = await import('../schedule/predictionRoundGenerator');
        const generated = generatePredictionRounds(w);
        activeRound = generated[0];
      }

      if (activeRound) {
        const timeline = getResultsTimeline(activeRound);
        snapshot.predictionHighlight = {
          roundId: activeRound.roundId,
          roundName: activeRound.title || `${w.raceName || 'Grand Prix'} Race Prediction`,
          grandPrix: circuitName,
          status: activeRound.status === 'OPEN' ? 'OPEN' : activeRound.status === 'LOCKED' ? 'LOCKED' : activeRound.status === 'SCORED' ? 'SCORED' : 'UPCOMING',
          deadlineNotice: activeRound.closesAt ? `Predictions lock: ${new Date(activeRound.closesAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` : 'Predictions lock before start',
          resultsExpectedNotice: activeRound.status === 'SCORED' ? 'Results Published' : `Results: ~${timeline.formattedExpectedResultsTime} (${timeline.shortEta})`,
          totalPointsAvailable: 60,
          url: activeRound.status === 'OPEN' ? `/predict/${activeRound.roundId}` : '/predictions',
        };
      }
    }

    // Check clientCache for active prediction round override (e.g. testing or explicit client cache)
    const cachedRounds = clientCache.get<PredictionRound[]>('f1_prediction_rounds_all');
    if (cachedRounds && cachedRounds.length > 0) {
      const currentWId = raceContext?.currentWeekend?.raceWeekendId || raceContext?.currentWeekend?.id;
      const weekendMatch = currentWId ? cachedRounds.filter(r => r.raceWeekendId === currentWId) : [];
      const candidateList = weekendMatch.length > 0 ? weekendMatch : cachedRounds;
      const activeRound = candidateList.find(r => r.status === 'OPEN') || candidateList[0];
      if (activeRound) {
        const timeline = getResultsTimeline(activeRound);
        snapshot.predictionHighlight = {
          roundId: activeRound.roundId,
          roundName: activeRound.title || 'Prediction Round',
          grandPrix: activeRound.description || 'Grand Prix',
          status: activeRound.status === 'OPEN' ? 'OPEN' : activeRound.status === 'LOCKED' ? 'LOCKED' : activeRound.status === 'SCORED' ? 'SCORED' : 'UPCOMING',
          deadlineNotice: activeRound.status === 'OPEN' ? 'Predictions lock before Grand Prix' : 'Predictions are locked for this session',
          resultsExpectedNotice: activeRound.status === 'SCORED' ? 'Results Published' : `Results: ~${timeline.formattedExpectedResultsTime}`,
          totalPointsAvailable: 60,
          url: activeRound.status === 'OPEN' ? `/predict/${activeRound.roundId}` : '/predictions',
        };
      }
    }
  } catch (err) {
    console.warn('Home snapshot dynamic reconciliation error:', err);
  }

  return snapshot;
}

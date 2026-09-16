/**
 * The Grid — Unified Multi-Championship Racing Calendar & Schedule Service
 * 
 * Aggregates and normalizes racing events across all 10 platform championships:
 * Formula 1, MotoGP, FIA WEC, Formula E, GT World Challenge, WRC, F2, F3, F4, and Indian Motorsport.
 * 
 * Features:
 * - Server-authoritative Prediction Bench linkage for live Formula 1 rounds
 * - Normalized circuit routing to /circuits/:circuitId
 * - Zero un-cached raw fetches on mount (leveraging clientCache)
 */

import { api } from '../apiClient';
import { clientCache, CACHE_TTL } from '../cache/clientCache';
import { getChampionshipDetail } from './championshipDataService';
import { normalizeCircuitId, F1_CIRCUITS_REGISTRY } from '../circuits/circuitRegistry';
import { evaluateRoundState } from '../../utils/raceLifecycle';
import { RaceWeekend, PredictionRound } from '../../types';

export interface UnifiedCalendarEvent {
  id: string;
  championshipId: string;
  championshipName: string;
  championshipBadge: string;
  championshipColor: string;
  roundNumber: number;
  officialTitle: string;
  circuitName: string;
  circuitId?: string;
  location: string;
  country: string;
  countryFlag: string;
  dates: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  weekendType?: string;
  sessions?: Array<{
    name: string;
    day?: string;
    durationMinutes?: number;
    description?: string;
  }>;
  hasPrediction: boolean;
  predictionRoundId?: string;
  predictionStatus?: 'OPEN' | 'UPCOMING' | 'LOCKED' | 'SCORED';
  detailUrl: string;
  circuitUrl?: string;
}

export type ChampionshipCategoryFilter =
  | 'all'
  | 'f1'
  | 'motogp'
  | 'wec'
  | 'formula-e'
  | 'gt-world-challenge'
  | 'wrc'
  | 'feeder'
  | 'india';

export interface CalendarFilterOptions {
  category?: ChampionshipCategoryFilter;
  status?: 'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'PREDICTION';
  search?: string;
}

/**
 * Static baseline Indian Motorsport domestic rounds (Indian Racing Festival & FIA F4 India)
 */
export const INDIAN_MOTORSPORT_ROUNDS: UnifiedCalendarEvent[] = [
  {
    id: 'india-r1-kari',
    championshipId: 'indian-motorsport',
    championshipName: 'Indian Racing Festival / F4 India',
    championshipBadge: 'INDIA',
    championshipColor: '#ff9933',
    roundNumber: 1,
    officialTitle: 'Kari Motor Speedway Season Opener',
    circuitName: 'Kari Motor Speedway',
    circuitId: 'kari',
    location: 'Coimbatore, Tamil Nadu',
    country: 'India',
    countryFlag: '🇮🇳',
    dates: 'Aug 22 – Aug 24',
    status: 'COMPLETED',
    weekendType: 'DOMESTIC',
    sessions: [
      { name: 'IRL & F4 Official Practice', day: 'Friday', durationMinutes: 60, description: 'Track acclimatization through the tight technical infield.' },
      { name: 'F4 India Qualifying 1 & 2', day: 'Saturday', durationMinutes: 30, description: 'Mygale M21-F4 grid decider.' },
      { name: 'IRL Feature Race 1', day: 'Saturday', durationMinutes: 35, description: 'Wolf GB08 Thunder prototype sprint.' },
      { name: 'F4 India Races 1 & 2', day: 'Sunday', durationMinutes: 50, description: 'Double-header junior championship points.' },
      { name: 'IRL Feature Race 2', day: 'Sunday', durationMinutes: 35, description: 'Main event prototype battle.' },
    ],
    hasPrediction: false,
    detailUrl: '/indian-motorsport#series',
  },
  {
    id: 'india-r2-chennai-street',
    championshipId: 'indian-motorsport',
    championshipName: 'Indian Racing Festival / F4 India',
    championshipBadge: 'INDIA',
    championshipColor: '#ff9933',
    roundNumber: 2,
    officialTitle: 'Chennai Formula Racing Circuit Night Race',
    circuitName: 'Chennai Street Circuit (Island Grounds)',
    circuitId: 'chennai_street',
    location: 'Chennai, Tamil Nadu',
    country: 'India',
    countryFlag: '🇮🇳',
    dates: 'Aug 30 – Sep 1',
    status: 'ACTIVE',
    weekendType: 'NIGHT_STREET',
    sessions: [
      { name: 'Free Practice Under Floodlights', day: 'Friday', durationMinutes: 45, description: 'Night practice along the Marina Beach straight.' },
      { name: 'IRL & F4 Superpole Shootout', day: 'Saturday', durationMinutes: 40, description: 'High-stakes barrier qualifying shootout.' },
      { name: 'Night Sprint Race 1', day: 'Saturday', durationMinutes: 30, description: 'Historic inaugural Indian night street race.' },
      { name: 'F4 India Feature Race', day: 'Sunday', durationMinutes: 45, description: 'FIA Super Licence points under the lights.' },
      { name: 'IRL Grand Finale Night Race', day: 'Sunday', durationMinutes: 40, description: 'Feature franchise race through city streets.' },
    ],
    hasPrediction: false,
    detailUrl: '/indian-motorsport#series',
  },
  {
    id: 'india-r3-mmrt',
    championshipId: 'indian-motorsport',
    championshipName: 'Indian Racing Festival / F4 India',
    championshipBadge: 'INDIA',
    championshipColor: '#ff9933',
    roundNumber: 3,
    officialTitle: 'Madras International Circuit Trophy',
    circuitName: 'Madras International Circuit',
    circuitId: 'mmrt',
    location: 'Irungattukottai, Chennai',
    country: 'India',
    countryFlag: '🇮🇳',
    dates: 'Sep 19 – Sep 21',
    status: 'UPCOMING',
    weekendType: 'DOMESTIC',
    sessions: [
      { name: 'Free Practice & Setup', day: 'Friday', durationMinutes: 60, description: 'Historic venue aerodynamic tuning.' },
      { name: 'Qualifying Shootouts', day: 'Saturday', durationMinutes: 35, description: 'F4 and IRL grid qualifying.' },
      { name: 'Double Feature Races', day: 'Sunday', durationMinutes: 60, description: 'Full points award day.' },
    ],
    hasPrediction: false,
    detailUrl: '/indian-motorsport#series',
  },
  {
    id: 'india-r4-buddh',
    championshipId: 'indian-motorsport',
    championshipName: 'Indian Racing Festival / F4 India',
    championshipBadge: 'INDIA',
    championshipColor: '#ff9933',
    roundNumber: 4,
    officialTitle: 'Indian Racing Festival Buddh Grand Finale',
    circuitName: 'Buddh International Circuit',
    circuitId: 'buddh',
    location: 'Greater Noida, Uttar Pradesh',
    country: 'India',
    countryFlag: '🇮🇳',
    dates: 'Oct 17 – Oct 19',
    status: 'UPCOMING',
    weekendType: 'SEASON_FINALE',
    sessions: [
      { name: 'Free Practice on Grade 1 Circuit', day: 'Friday', durationMinutes: 60, description: 'Top speed runs along the 1.06 km back straight.' },
      { name: 'Championship Qualifying', day: 'Saturday', durationMinutes: 40, description: 'Pole position decider at BIC.' },
      { name: 'F4 India Championship Finale', day: 'Sunday', durationMinutes: 45, description: 'FIA Super Licence champion crowned.' },
      { name: 'IRL Season Finale Crown Race', day: 'Sunday', durationMinutes: 40, description: 'Season crowning ceremony.' },
    ],
    hasPrediction: false,
    detailUrl: '/indian-motorsport#series',
    circuitUrl: '/circuits/buddh',
  },
];

/**
 * Converts F1 RaceWeekend + PredictionRound models into a UnifiedCalendarEvent
 */
export function normalizeF1Weekend(
  weekend: RaceWeekend,
  predictionRounds: PredictionRound[] = []
): UnifiedCalendarEvent {
  const circuitNameStr = typeof weekend.circuit === 'object' && weekend.circuit ? weekend.circuit.name : String(weekend.circuit || weekend.raceName || '');
  const circuitKey = typeof weekend.circuit === 'object' && weekend.circuit ? (weekend.circuit.id || weekend.circuit.name) : String(weekend.circuit || weekend.raceName || '');
  const normCircuit = normalizeCircuitId(circuitKey);
  const hasCircuitProfile = Boolean(F1_CIRCUITS_REGISTRY[normCircuit]);

  // Find corresponding Prediction Bench round
  const predRound = predictionRounds.find(r => r.raceWeekendId === weekend.raceWeekendId);

  let predictionStatus: 'OPEN' | 'UPCOMING' | 'LOCKED' | 'SCORED' | undefined;
  if (predRound) {
    const lifecycle = evaluateRoundState({
      ...predRound,
      roundStatus: predRound.status,
    });
    predictionStatus = lifecycle.predictionStatus === 'OPEN'
      ? 'OPEN'
      : lifecycle.predictionStatus === 'LOCKED'
      ? 'LOCKED'
      : lifecycle.predictionStatus === 'CLOSED'
      ? 'SCORED'
      : 'UPCOMING';
  }

  const sessions = (weekend.sessions || []).map(s => ({
    name: s.name,
    day: s.startTime ? new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short' }) : undefined,
    durationMinutes: 60,
    description: s.type === 'RACE' ? 'Official Grand Prix Race' : `${s.name} session`,
  }));

  const datesFormatted = weekend.startDate && weekend.endDate
    ? `${new Date(weekend.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(weekend.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : 'Season 2026';

  return {
    id: `f1-${weekend.raceWeekendId}`,
    championshipId: 'f1',
    championshipName: 'Formula 1',
    championshipBadge: 'F1',
    championshipColor: '#e10600',
    roundNumber: weekend.roundNumber || weekend.round || 1,
    officialTitle: weekend.raceName || weekend.name || 'Formula 1 Grand Prix',
    circuitName: circuitNameStr || 'Grand Prix Circuit',
    circuitId: normCircuit,
    location: weekend.country || 'World Championship',
    country: weekend.country || 'World',
    countryFlag: getFlagForCountry(weekend.country),
    dates: datesFormatted,
    status: weekend.status === 'COMPLETED' ? 'COMPLETED' : weekend.status === 'ACTIVE' ? 'ACTIVE' : 'UPCOMING',
    weekendType: weekend.weekendType,
    sessions,
    hasPrediction: true,
    predictionRoundId: predRound?.roundId,
    predictionStatus,
    detailUrl: `/weekends/${weekend.raceWeekendId}`,
    circuitUrl: hasCircuitProfile ? `/circuits/${normCircuit}` : undefined,
  };
}

/**
 * Normalizes a ChampionshipRound from motorsport datasets (MotoGP, WEC, FE, etc.)
 */
function normalizeCategoryRound(
  round: any,
  championshipId: string,
  championshipName: string,
  badge: string,
  badgeColor: string
): UnifiedCalendarEvent {
  const normCircuit = normalizeCircuitId(round.circuitName || round.officialTitle);
  const hasCircuitProfile = Boolean(F1_CIRCUITS_REGISTRY[normCircuit]);

  return {
    id: `${championshipId}-r${round.roundNumber}`,
    championshipId,
    championshipName,
    championshipBadge: badge,
    championshipColor: badgeColor,
    roundNumber: round.roundNumber,
    officialTitle: round.officialTitle,
    circuitName: round.circuitName,
    circuitId: normCircuit,
    location: round.location || round.country,
    country: round.country,
    countryFlag: round.flag || '🏁',
    dates: round.dates || '2025 Calendar',
    status: round.status || 'UPCOMING',
    weekendType: round.duration ? round.duration : 'CHAMPIONSHIP',
    sessions: (round.sessions || []).map((s: any) => ({
      name: s.name,
      day: s.day,
      durationMinutes: s.durationMinutes,
      description: s.description,
    })),
    hasPrediction: false,
    detailUrl: `/championships/${championshipId}`,
    circuitUrl: hasCircuitProfile ? `/circuits/${normCircuit}` : undefined,
  };
}

/**
 * Helper to get country flag emojis
 */
function getFlagForCountry(country?: string): string {
  if (!country) return '🏁';
  const c = country.toLowerCase();
  if (c.includes('australia')) return '🇦🇺';
  if (c.includes('china')) return '🇨🇳';
  if (c.includes('japan')) return '🇯🇵';
  if (c.includes('bahrain')) return '🇧🇭';
  if (c.includes('saudi')) return '🇸🇦';
  if (c.includes('miami') || c.includes('states') || c.includes('usa') || c.includes('america')) return '🇺🇸';
  if (c.includes('italy')) return '🇮🇹';
  if (c.includes('monaco')) return '🇲🇨';
  if (c.includes('spain') || c.includes('catalunya')) return '🇪🇸';
  if (c.includes('canada')) return '🇨🇦';
  if (c.includes('austria')) return '🇦🇹';
  if (c.includes('britain') || c.includes('united kingdom') || c.includes('uk')) return '🇬🇧';
  if (c.includes('belgium')) return '🇧🇪';
  if (c.includes('netherlands') || c.includes('dutch')) return '🇳🇱';
  if (c.includes('azerbaijan')) return '🇦🇿';
  if (c.includes('singapore')) return '🇸🇬';
  if (c.includes('mexico')) return '🇲🇽';
  if (c.includes('brazil')) return '🇧🇷';
  if (c.includes('qatar')) return '🇶🇦';
  if (c.includes('emirates') || c.includes('abu dhabi')) return '🇦🇪';
  if (c.includes('india')) return '🇮🇳';
  if (c.includes('france')) return '🇫🇷';
  if (c.includes('germany')) return '🇩🇪';
  return '🏁';
}

/**
 * Aggregates all racing calendar events across all championships.
 * Results are cached in clientCache for high performance.
 */
export async function getUnifiedCalendar(
  filters: CalendarFilterOptions = {}
): Promise<UnifiedCalendarEvent[]> {
  const cacheKey = 'unified_calendar_all_events';

  const allEvents = await clientCache.getOrFetch<UnifiedCalendarEvent[]>(
    cacheKey,
    async () => {
      const events: UnifiedCalendarEvent[] = [];

      // 1. Fetch live Formula 1 Weekends & Prediction Rounds
      try {
        const [f1Weekends, predictionRounds] = await Promise.all([
          api.getRaceWeekends(),
          api.getPredictionRounds().catch(() => []),
        ]);

        for (const w of f1Weekends) {
          events.push(normalizeF1Weekend(w, predictionRounds));
        }
      } catch (err) {
        console.warn('Could not load live F1 race weekends for unified calendar:', err);
      }

      // 2. Load other championship rounds dynamically
      const seriesList = [
        { id: 'motogp', name: 'MotoGP™', badge: 'MotoGP', color: '#dc2626' },
        { id: 'wec', name: 'FIA WEC', badge: 'WEC', color: '#002b49' },
        { id: 'formula-e', name: 'Formula E', badge: 'FE', color: '#00d2be' },
        { id: 'gt-world-challenge', name: 'GT World Challenge', badge: 'GT3', color: '#d97706' },
        { id: 'wrc', name: 'WRC Rally', badge: 'WRC', color: '#f59e0b' },
        { id: 'f2', name: 'Formula 2', badge: 'F2', color: '#0090d0' },
        { id: 'f3', name: 'Formula 3', badge: 'F3', color: '#e10600' },
        { id: 'f4', name: 'Formula 4', badge: 'F4', color: '#10b981' },
      ];

      await Promise.all(
        seriesList.map(async series => {
          try {
            const detail = await getChampionshipDetail(series.id);
            if (detail?.rounds) {
              for (const round of detail.rounds) {
                events.push(
                  normalizeCategoryRound(
                    round,
                    series.id,
                    series.name,
                    series.badge,
                    series.color
                  )
                );
              }
            }
          } catch (err) {
            console.warn(`Could not load rounds for ${series.id}:`, err);
          }
        })
      );

      // 3. Append Indian Motorsport events
      events.push(...INDIAN_MOTORSPORT_ROUNDS);

      return events;
    },
    { ttlMs: CACHE_TTL.MEDIUM } // 5 minutes
  );

  // Apply filters
  let filtered = allEvents;

  if (filters.category && filters.category !== 'all') {
    if (filters.category === 'feeder') {
      filtered = filtered.filter(e => ['f2', 'f3', 'f4'].includes(e.championshipId));
    } else if (filters.category === 'india') {
      filtered = filtered.filter(e => e.championshipId === 'indian-motorsport');
    } else {
      filtered = filtered.filter(e => e.championshipId === filters.category);
    }
  }

  if (filters.status && filters.status !== 'ALL') {
    if (filters.status === 'PREDICTION') {
      filtered = filtered.filter(e => e.hasPrediction && (e.predictionStatus === 'OPEN' || e.predictionStatus === 'UPCOMING'));
    } else {
      filtered = filtered.filter(e => e.status === filters.status);
    }
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      e =>
        e.officialTitle.toLowerCase().includes(q) ||
        e.circuitName.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        e.championshipName.toLowerCase().includes(q)
    );
  }

  return filtered;
}

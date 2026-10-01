/**
 * The Grid — Global Race Calendar Service
 * 
 * Core Architectural Mandates (Parts 3–17):
 * 1. Single Authoritative Source: Aggregates events directly from the official championship datasets
 *    (f1Data, f2Data, f3Data, formulaEData, motogpData, moto2Data, moto3Data, wecData, wrcData, indycarData, nascarData, gtWorldChallengeData, imsaData).
 * 2. NO DUPLICATE CALENDAR DATABASE. If date/circuit changes in the championship data, the calendar updates automatically.
 * 3. Scoped context preserved: Motorsport -> Championship -> Season -> Event -> Circuit -> Prediction.
 * 4. Honest Circuit Geometry: Shows verified SVG layouts only. Never invents geometry. Missing geometry never hides an event.
 */

import { f1Data } from '../motorsport/data/f1Data';
import { f2Data } from '../motorsport/data/f2Data';
import { f3Data } from '../motorsport/data/f3Data';
import { formulaEData } from '../motorsport/data/formulaEData';
import { motogpData } from '../motorsport/data/motogpData';
import { moto2Data } from '../motorsport/data/moto2Data';
import { moto3Data } from '../motorsport/data/moto3Data';
import { wecData } from '../motorsport/data/wecData';
import { wrcData } from '../motorsport/data/wrcData';
import { indycarData } from '../motorsport/data/indycarData';
import { nascarData } from '../motorsport/data/nascarData';
import { gtWorldChallengeData } from '../motorsport/data/gtWorldChallengeData';
import { imsaData } from '../motorsport/data/imsaData';
import { ChampionshipDetailData, ChampionshipRound } from '../../types/motorsportDetail';
import {
  parseEventDateBounds,
  getCurrentEventStatus,
  EventDateBounds,
  EventLiveStatus,
} from '../schedule/eventStatusResolver';
import { normalizeCircuitId, CIRCUIT_SOURCE_MAPPING } from '../circuits/circuitRegistry';

export interface GlobalCalendarEvent {
  id: string;
  seriesId: string;
  seriesName: string;
  seriesBadge: string;
  seriesColor: string;
  seasonYear: number | string;
  roundNumber: number;
  officialTitle: string;
  circuitName: string;
  circuitId: string;
  mapSvg?: string;
  hasVerifiedGeometry: boolean;
  location: string;
  country: string;
  countryCode: string;
  flag: string;
  dates: string;
  dateBounds: EventDateBounds;
  status: EventLiveStatus;
  hasPrediction: boolean;
  predictionUrl?: string;
  hubUrl: string;
  circuitUrl: string;
  sessions?: Array<{
    name: string;
    day: string;
    durationMinutes?: number;
    description?: string;
  }>;
}

export interface CalendarSeriesFilterItem {
  id: string;
  label: string;
  badge: string;
  color: string;
  eventCount: number;
}

interface ChampionshipSourceConfig {
  seriesId: string;
  data: ChampionshipDetailData;
  hasPrediction?: boolean;
}

const AUTHORITATIVE_CHAMPIONSHIP_SOURCES: ChampionshipSourceConfig[] = [
  { seriesId: 'f1', data: f1Data, hasPrediction: true },
  { seriesId: 'f2', data: f2Data },
  { seriesId: 'f3', data: f3Data },
  { seriesId: 'formula-e', data: formulaEData },
  { seriesId: 'motogp', data: motogpData },
  { seriesId: 'moto2', data: moto2Data },
  { seriesId: 'moto3', data: moto3Data },
  { seriesId: 'wec', data: wecData },
  { seriesId: 'wrc', data: wrcData },
  { seriesId: 'indycar', data: indycarData },
  { seriesId: 'nascar', data: nascarData },
  { seriesId: 'gt-world-challenge', data: gtWorldChallengeData },
  { seriesId: 'imsa', data: imsaData },
];

/**
 * Transforms a raw ChampionshipRound into a standardized GlobalCalendarEvent
 */
function roundToCalendarEvent(
  round: ChampionshipRound,
  source: ChampionshipSourceConfig,
  referenceDate: Date = new Date()
): GlobalCalendarEvent {
  const { data, seriesId, hasPrediction } = source;
  const year = data.seasonYear || 2026;
  const numYear = typeof year === 'number' ? year : 2026;
  const dateBounds = parseEventDateBounds(round, numYear);
  const status = getCurrentEventStatus(round, referenceDate);

  const normKey = normalizeCircuitId({
    id: round.circuitName,
    name: round.circuitName,
    locality: round.location,
    country: round.country,
  });

  const mapping = CIRCUIT_SOURCE_MAPPING[normKey];
  const hasVerifiedGeometry = Boolean(mapping && mapping.assetFile);
  const mapSvg = hasVerifiedGeometry ? mapping!.assetFile : undefined;

  const eventId = `${seriesId}-${data.seasonYear}-r${round.roundNumber}`;

  return {
    id: eventId,
    seriesId,
    seriesName: data.shortName || data.name,
    seriesBadge: data.shortName?.toUpperCase() || seriesId.toUpperCase(),
    seriesColor: data.heroBadgeColor || '#e10600',
    seasonYear: data.seasonYear,
    roundNumber: round.roundNumber,
    officialTitle: round.officialTitle,
    circuitName: round.circuitName,
    circuitId: normKey,
    mapSvg,
    hasVerifiedGeometry,
    location: round.location,
    country: round.country,
    countryCode: round.countryCode,
    flag: round.flag,
    dates: round.dates,
    dateBounds,
    status,
    hasPrediction: Boolean(hasPrediction),
    predictionUrl: hasPrediction ? '/predictions' : undefined,
    hubUrl: `/explore/${seriesId}`,
    circuitUrl: `/explore/${seriesId}/circuits/${normKey}`,
    sessions: round.sessions,
  };
}

/**
 * Returns all active season calendar events from all supported championships, sorted chronologically.
 */
export function getAllGlobalCalendarEvents(referenceDate: Date = new Date()): GlobalCalendarEvent[] {
  const allEvents: GlobalCalendarEvent[] = [];

  for (const source of AUTHORITATIVE_CHAMPIONSHIP_SOURCES) {
    if (!source.data.rounds || source.data.rounds.length === 0) continue;

    for (const round of source.data.rounds) {
      allEvents.push(roundToCalendarEvent(round, source, referenceDate));
    }
  }

  // Sort chronologically by event start date
  return allEvents.sort((a, b) => a.dateBounds.startMs - b.dateBounds.startMs);
}

/**
 * Returns list of supported series with their active event counts for filtering pills.
 */
export function getSupportedCalendarSeries(events: GlobalCalendarEvent[]): CalendarSeriesFilterItem[] {
  const items: CalendarSeriesFilterItem[] = [
    {
      id: 'all',
      label: 'All Motorsport',
      badge: 'ALL',
      color: '#e10600',
      eventCount: events.length,
    },
  ];

  for (const source of AUTHORITATIVE_CHAMPIONSHIP_SOURCES) {
    const seriesEvents = events.filter(e => e.seriesId === source.seriesId);
    if (seriesEvents.length > 0) {
      items.push({
        id: source.seriesId,
        label: source.data.shortName || source.seriesId.toUpperCase(),
        badge: source.data.shortName || source.seriesId.toUpperCase(),
        color: source.data.heroBadgeColor || '#ffffff',
        eventCount: seriesEvents.length,
      });
    }
  }

  return items;
}

export interface CalendarFilterOptions {
  seriesId?: string;
  year?: number;
  month?: number; // 0-indexed (0 = Jan, 9 = Oct)
  query?: string;
  currentSeasonOnly?: boolean;
}

/**
 * Filters calendar events by series, month, current season, and search query.
 * Can be called as filterCalendarEvents(options) or filterCalendarEvents(events, options).
 */
export function filterCalendarEvents(
  eventsOrOptions?: GlobalCalendarEvent[] | CalendarFilterOptions,
  maybeOptions?: CalendarFilterOptions
): GlobalCalendarEvent[] {
  let events: GlobalCalendarEvent[];
  let options: CalendarFilterOptions;

  if (Array.isArray(eventsOrOptions)) {
    events = eventsOrOptions;
    options = maybeOptions || {};
  } else {
    events = getAllGlobalCalendarEvents();
    options = eventsOrOptions || {};
  }

  const { seriesId = 'all', year, month, query, currentSeasonOnly } = options;
  const q = (query || '').trim().toLowerCase();

  return events.filter(event => {
    // 1. Current Season Filter
    if (currentSeasonOnly) {
      const numYear = typeof event.seasonYear === 'number' ? event.seasonYear : parseInt(String(event.seasonYear).split('-')[0], 10);
      if (!isNaN(numYear) && numYear < 2025) {
        return false;
      }
    }

    // 2. Series Filter
    if (seriesId !== 'all' && event.seriesId.toLowerCase() !== seriesId.toLowerCase()) {
      return false;
    }

    // 3. Month & Year Filter (if specified)
    if (year !== undefined && month !== undefined) {
      const start = event.dateBounds.start;
      const end = event.dateBounds.end;
      const startYear = start.getUTCFullYear();
      const startMonth = start.getUTCMonth();
      const endYear = end.getUTCFullYear();
      const endMonth = end.getUTCMonth();

      const spansMonth =
        (startYear === year && startMonth === month) ||
        (endYear === year && endMonth === month) ||
        (start.getTime() <= Date.UTC(year, month + 1, 0) && end.getTime() >= Date.UTC(year, month, 1));

      if (!spansMonth) return false;
    }

    // 4. Search Query Filter
    if (q) {
      const match =
        event.officialTitle.toLowerCase().includes(q) ||
        event.circuitName.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.country.toLowerCase().includes(q) ||
        event.seriesName.toLowerCase().includes(q) ||
        event.seriesBadge.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Returns events happening "THIS WEEK" or currently "LIVE"
 */
export function getThisWeekEvents(
  events: GlobalCalendarEvent[],
  referenceDate: Date = new Date()
): GlobalCalendarEvent[] {
  return events.filter(e => {
    const status = getCurrentEventStatus(e, referenceDate);
    return status === 'THIS_WEEKEND' || status === 'LIVE';
  });
}

/**
 * Returns immediate upcoming events for the "NEXT UP" section.
 */
export function getNextUpEvents(
  events: GlobalCalendarEvent[],
  limit: number = 3,
  referenceDate: Date = new Date()
): GlobalCalendarEvent[] {
  const refMs = referenceDate.getTime();

  // Pick events that are either active this weekend or starting in the future
  const upcoming = events.filter(e => {
    return e.dateBounds.endMs >= refMs;
  });

  return upcoming.slice(0, limit);
}

/**
 * Checks if an event is active on a specific calendar day (UTC)
 */
export function isEventOnDate(event: GlobalCalendarEvent, date: Date): boolean {
  const targetDayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
  const targetDayEnd = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59);

  return event.dateBounds.startMs <= targetDayEnd && event.dateBounds.endMs >= targetDayStart;
}

/**
 * Groups events by day of week for the Week View.
 * Can be called as getWeekEventsGrouped(startDate) or getWeekEventsGrouped(events, startDate).
 */
export function getWeekEventsGrouped(
  eventsOrStartDate: GlobalCalendarEvent[] | Date,
  maybeStartDate?: Date
): Array<{ date: Date; dayName: string; formattedDate: string; events: GlobalCalendarEvent[] }> {
  let events: GlobalCalendarEvent[];
  let weekStartDate: Date;

  if (Array.isArray(eventsOrStartDate)) {
    events = eventsOrStartDate;
    weekStartDate = maybeStartDate || new Date();
  } else {
    events = getAllGlobalCalendarEvents();
    weekStartDate = eventsOrStartDate instanceof Date ? eventsOrStartDate : new Date();
  }

  const days: Array<{ date: Date; dayName: string; formattedDate: string; events: GlobalCalendarEvent[] }> = [];
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(weekStartDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = curDate.getUTCDay();
    const dayOfMonth = String(curDate.getUTCDate()).padStart(2, '0');
    const month = monthNames[curDate.getUTCMonth()];

    const dayEvents = events.filter(e => isEventOnDate(e, curDate));

    days.push({
      date: curDate,
      dayName: dayNames[dayOfWeek],
      formattedDate: `${dayOfMonth} ${month}`,
      events: dayEvents,
    });
  }

  return days;
}

/**
 * The Grid — Event Status & Live Season Synchronization Resolver
 * 
 * Core Architectural Mandate (Sections 1-5):
 * "The Grid must NEVER determine 'Next Event' from:
 *  - first event in an array
 *  - hardcoded event
 *  - static JSON ordering
 *  - 2025 fallback data
 *  It must determine the event from:
 *  CURRENT DATE + SELECTED CHAMPIONSHIP + SELECTED SEASON + EVENT STATUS"
 */

export type EventLiveStatus = 'LIVE' | 'THIS_WEEKEND' | 'NEXT' | 'UPCOMING' | 'COMPLETED';

export interface EventDateSubject {
  startDate?: string;
  endDate?: string;
  dates?: string;
  timezone?: string;
  roundNumber?: number;
  round?: number;
  status?: string;
  sessions?: Array<{
    name: string;
    day?: string;
    startTime?: string;
    durationMinutes?: number;
    status?: string;
  }>;
  [key: string]: any;
}

import { formatIsoDateString, getIstDateParts } from '../../utils/istTimeUtils';

export interface EventDateBounds {
  start: Date;
  end: Date;
  startMs: number;
  endMs: number;
  startDateIso: string;
  endDateIso: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parses any date representation (ISO 8601 or range strings like "Oct 02 – Oct 04", "Sep 24 – Sep 26")
 * into normalized start and end Date bounds with canonical ISO dates.
 */
export function parseEventDateBounds(event: EventDateSubject, defaultYear: number = 2026): EventDateBounds {
  const rawYear = event.season || event.seasonYear || defaultYear;
  const numYear = typeof rawYear === 'number' ? rawYear : parseInt(String(rawYear).split('-')[0], 10) || defaultYear;

  // 1. Direct ISO startDate / endDate
  if (event.startDate && event.endDate) {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      let startDateIso: string;
      let endDateIso: string;

      if (/^\d{4}-\d{2}-\d{2}$/.test(event.startDate.trim())) {
        startDateIso = event.startDate.trim();
      } else {
        const p = getIstDateParts(start);
        startDateIso = formatIsoDateString(p.year, p.month, p.day);
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(event.endDate.trim())) {
        endDateIso = event.endDate.trim();
      } else {
        const p = getIstDateParts(end);
        endDateIso = formatIsoDateString(p.year, p.month, p.day);
      }

      return {
        start,
        end,
        startMs: start.getTime(),
        endMs: end.getTime(),
        startDateIso,
        endDateIso,
      };
    }
  }

  // 2. Parse human readable string from dates field (e.g. "Oct 02 – Oct 04", "Sep 24 – Sep 26", "2–4 Oct 2026")
  const rawDates = (event.dates || '').trim();

  if (rawDates) {
    // Pattern A: "Month Day – Month Day" (e.g. "Oct 02 – Oct 04", "Mar 13 – Mar 15", "Feb 27 – Mar 01")
    const matchTwoMonth = rawDates.match(/([a-zA-Z]+)\s+(\d{1,2})\s*[–\-—]\s*([a-zA-Z]+)\s+(\d{1,2})/);
    if (matchTwoMonth) {
      const startM = MONTH_MAP[matchTwoMonth[1].toLowerCase()] ?? 0;
      const startD = parseInt(matchTwoMonth[2], 10);
      const endM = MONTH_MAP[matchTwoMonth[3].toLowerCase()] ?? startM;
      const endD = parseInt(matchTwoMonth[4], 10);

      const start = new Date(Date.UTC(numYear, startM, startD, 0, 0, 0));
      const end = new Date(Date.UTC(numYear, endM, endD, 23, 59, 59));
      const startDateIso = formatIsoDateString(numYear, startM, startD);
      const endDateIso = formatIsoDateString(numYear, endM, endD);
      return { start, end, startMs: start.getTime(), endMs: end.getTime(), startDateIso, endDateIso };
    }

    // Pattern B: "Month Day – Day" (e.g. "Oct 02 – 04" or "Oct 2 – 4")
    const matchSameMonth = rawDates.match(/([a-zA-Z]+)\s+(\d{1,2})\s*[–\-—]\s*(\d{1,2})/);
    if (matchSameMonth) {
      const m = MONTH_MAP[matchSameMonth[1].toLowerCase()] ?? 0;
      const startD = parseInt(matchSameMonth[2], 10);
      const endD = parseInt(matchSameMonth[3], 10);

      const start = new Date(Date.UTC(numYear, m, startD, 0, 0, 0));
      const end = new Date(Date.UTC(numYear, m, endD, 23, 59, 59));
      const startDateIso = formatIsoDateString(numYear, m, startD);
      const endDateIso = formatIsoDateString(numYear, m, endD);
      return { start, end, startMs: start.getTime(), endMs: end.getTime(), startDateIso, endDateIso };
    }

    // Pattern C: "Day–Day Month Year" (e.g. "2–4 Oct 2026" or "18–20 Sep 2026")
    const matchEuro = rawDates.match(/(\d{1,2})\s*[–\-—]\s*(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?/);
    if (matchEuro) {
      const startD = parseInt(matchEuro[1], 10);
      const endD = parseInt(matchEuro[2], 10);
      const m = MONTH_MAP[matchEuro[3].toLowerCase()] ?? 0;
      const y = matchEuro[4] ? parseInt(matchEuro[4], 10) : numYear;

      const start = new Date(Date.UTC(y, m, startD, 0, 0, 0));
      const end = new Date(Date.UTC(y, m, endD, 23, 59, 59));
      const startDateIso = formatIsoDateString(y, m, startD);
      const endDateIso = formatIsoDateString(y, m, endD);
      return { start, end, startMs: start.getTime(), endMs: end.getTime(), startDateIso, endDateIso };
    }

    // Pattern D: Single day "Month Day" (e.g. "May 24" or "Oct 04")
    const matchSingle = rawDates.match(/([a-zA-Z]+)\s+(\d{1,2})(?:\s+(\d{4}))?/);
    if (matchSingle) {
      const m = MONTH_MAP[matchSingle[1].toLowerCase()] ?? 0;
      const d = parseInt(matchSingle[2], 10);
      const y = matchSingle[3] ? parseInt(matchSingle[3], 10) : numYear;

      const start = new Date(Date.UTC(y, m, d, 0, 0, 0));
      const end = new Date(Date.UTC(y, m, d, 23, 59, 59));
      const dateIso = formatIsoDateString(y, m, d);
      return { start, end, startMs: start.getTime(), endMs: end.getTime(), startDateIso: dateIso, endDateIso: dateIso };
    }
  }

  // 3. Direct timestamp startTimeUtc
  if (event.startTimeUtc) {
    const t = new Date(event.startTimeUtc);
    if (!isNaN(t.getTime())) {
      const p = getIstDateParts(t);
      const dateIso = formatIsoDateString(p.year, p.month, p.day);
      return { start: t, end: t, startMs: t.getTime(), endMs: t.getTime(), startDateIso: dateIso, endDateIso: dateIso };
    }
  }

  // Fallback safe date
  const fallback = new Date(Date.UTC(numYear, 0, 1, 0, 0, 0));
  const fallbackIso = formatIsoDateString(numYear, 0, 1);
  return { start: fallback, end: fallback, startMs: fallback.getTime(), endMs: fallback.getTime(), startDateIso: fallbackIso, endDateIso: fallbackIso };
}

/**
 * Centrally evaluates the dynamic live status of an event relative to a reference time.
 * Supports injected `now` for deterministic testing.
 */
export function getCurrentEventStatus(event: EventDateSubject, now: Date = new Date()): EventLiveStatus {
  const nowMs = now.getTime();
  const { start, end, startMs, endMs } = parseEventDateBounds(event);

  // If after the event end + 4 hours buffer -> COMPLETED
  const postBufferMs = 4 * 3600 * 1000;
  if (nowMs > endMs + postBufferMs) {
    return 'COMPLETED';
  }

  // Check if actively within the event weekend
  // A race weekend window covers from Thursday 18:00 UTC (or 28h before start) to Sunday night
  const preWeekendBufferMs = 28 * 3600 * 1000; // ~28 hours pre-start (covers Thursday before a Friday weekend)
  const isWithinWeekend = nowMs >= (startMs - preWeekendBufferMs) && nowMs <= (endMs + postBufferMs);

  if (isWithinWeekend) {
    // Check if reliable session timing indicates a session is actively running right now
    if (event.sessions && event.sessions.length > 0) {
      const activeSession = event.sessions.find(s => {
        if (!s.startTime) return false;
        const sStartMs = new Date(s.startTime).getTime();
        const sDurationMs = (s.durationMinutes || 90) * 60 * 1000;
        return nowMs >= sStartMs && nowMs <= (sStartMs + sDurationMs);
      });
      if (activeSession) {
        return 'LIVE';
      }
    }

    // If today is during the event dates (e.g. Oct 1-4 for WRC or Oct 2 for F1)
    const isTodayWithinDates = nowMs >= startMs && nowMs <= endMs;
    if (isTodayWithinDates) {
      return 'THIS_WEEKEND';
    }

    // Within pre-weekend window (e.g. Oct 1 for Oct 2-4 GP)
    return 'THIS_WEEKEND';
  }

  // Future event
  return 'UPCOMING';
}

export interface ChampionshipEventResolution<T extends EventDateSubject> {
  currentEvent: T | null;
  event: T | null;
  currentStatus: 'LIVE' | 'THIS_WEEKEND' | 'NEXT' | 'COMPLETED';
  status: 'LIVE' | 'THIS_WEEKEND' | 'NEXT' | 'COMPLETED';
  upcomingEvents: T[];
  completedEvents: T[];
  activeWeekendIndex: number;
}

/**
 * Universal Next/Current Event Resolution Algorithm (Section 4):
 * 1. Normalize dates
 * 2. Sort chronologically
 * 3. Classify each event
 * 4. Filter out completed events
 * 5. If an event is currently underway/this weekend -> CURRENT / LIVE / THIS WEEKEND
 * 6. Otherwise select the earliest upcoming event -> NEXT
 * NEVER returns events[0] blindly.
 */
export function resolveChampionshipCurrentEvent<T extends EventDateSubject>(
  events: T[],
  now: Date = new Date()
): ChampionshipEventResolution<T> {
  if (!events || events.length === 0) {
    return {
      currentEvent: null,
      event: null,
      currentStatus: 'COMPLETED',
      status: 'COMPLETED',
      upcomingEvents: [],
      completedEvents: [],
      activeWeekendIndex: -1,
    };
  }

  // Sort events chronologically by start date
  const sorted = [...events].sort((a, b) => {
    const aBounds = parseEventDateBounds(a);
    const bBounds = parseEventDateBounds(b);
    return aBounds.startMs - bBounds.startMs;
  });

  const completedEvents: T[] = [];
  const upcomingEvents: T[] = [];
  let liveOrWeekendEvent: T | null = null;
  let liveOrWeekendStatus: 'LIVE' | 'THIS_WEEKEND' | null = null;
  let liveOrWeekendIndex = -1;

  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    const status = getCurrentEventStatus(ev, now);

    if (status === 'COMPLETED') {
      completedEvents.push(ev);
    } else if (status === 'LIVE') {
      if (!liveOrWeekendEvent) {
        liveOrWeekendEvent = ev;
        liveOrWeekendStatus = 'LIVE';
        liveOrWeekendIndex = i;
      }
      upcomingEvents.push(ev);
    } else if (status === 'THIS_WEEKEND') {
      if (!liveOrWeekendEvent) {
        liveOrWeekendEvent = ev;
        liveOrWeekendStatus = 'THIS_WEEKEND';
        liveOrWeekendIndex = i;
      }
      upcomingEvents.push(ev);
    } else {
      upcomingEvents.push(ev);
    }
  }

  // 1. If an event is active or this weekend, it takes priority
  if (liveOrWeekendEvent && liveOrWeekendStatus) {
    return {
      currentEvent: liveOrWeekendEvent,
      event: liveOrWeekendEvent,
      currentStatus: liveOrWeekendStatus,
      status: liveOrWeekendStatus,
      upcomingEvents,
      completedEvents,
      activeWeekendIndex: liveOrWeekendIndex,
    };
  }

  // 2. Otherwise pick the earliest upcoming event
  if (upcomingEvents.length > 0) {
    const nextEv = upcomingEvents[0];
    const index = sorted.indexOf(nextEv);
    return {
      currentEvent: nextEv,
      event: nextEv,
      currentStatus: 'NEXT',
      status: 'NEXT',
      upcomingEvents,
      completedEvents,
      activeWeekendIndex: index,
    };
  }

  // 3. All season rounds completed -> pick final championship round
  const finalEv = sorted[sorted.length - 1];
  return {
    currentEvent: finalEv,
    event: finalEv,
    currentStatus: 'COMPLETED',
    status: 'COMPLETED',
    upcomingEvents: [],
    completedEvents,
    activeWeekendIndex: sorted.length - 1,
  };
}

/**
 * Visual badge metadata helper for event status display
 */
export function getEventStatusBadge(status: 'LIVE' | 'THIS_WEEKEND' | 'NEXT' | 'UPCOMING' | 'COMPLETED', options?: { customPrefix?: string }): {
  label: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  color: string;
  bg: string;
  border: string;
  dotColor?: string;
  isPulsing?: boolean;
} {
  switch (status) {
    case 'LIVE':
      return {
        label: '● LIVE NOW',
        badgeColor: '#ff2d55',
        bgColor: 'rgba(255, 45, 85, 0.15)',
        borderColor: 'rgba(255, 45, 85, 0.4)',
        color: '#ff2d55',
        bg: 'rgba(255, 45, 85, 0.15)',
        border: 'rgba(255, 45, 85, 0.4)',
        dotColor: '#ff2d55',
        isPulsing: true,
      };
    case 'THIS_WEEKEND':
      return {
        label: '● THIS WEEKEND',
        badgeColor: 'var(--telemetry-green, #00e676)',
        bgColor: 'rgba(0, 230, 118, 0.14)',
        borderColor: 'rgba(0, 230, 118, 0.35)',
        color: 'var(--telemetry-green, #00e676)',
        bg: 'rgba(0, 230, 118, 0.14)',
        border: 'rgba(0, 230, 118, 0.35)',
        dotColor: '#00e676',
        isPulsing: true,
      };
    case 'NEXT':
      return {
        label: 'NEXT EVENT',
        badgeColor: 'var(--telemetry-yellow, #ffd600)',
        bgColor: 'rgba(255, 214, 0, 0.12)',
        borderColor: 'rgba(255, 214, 0, 0.3)',
        color: 'var(--telemetry-yellow, #ffd600)',
        bg: 'rgba(255, 214, 0, 0.12)',
        border: 'rgba(255, 214, 0, 0.3)',
      };
    case 'COMPLETED':
      return {
        label: 'COMPLETED',
        badgeColor: 'var(--text-muted, #8b949e)',
        bgColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        color: 'var(--text-muted, #8b949e)',
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
      };
    case 'UPCOMING':
    default:
      return {
        label: 'UPCOMING',
        badgeColor: 'var(--telemetry-blue, #38bdf8)',
        bgColor: 'rgba(56, 189, 248, 0.12)',
        borderColor: 'rgba(56, 189, 248, 0.25)',
        color: 'var(--telemetry-blue, #38bdf8)',
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.25)',
      };
  }
}

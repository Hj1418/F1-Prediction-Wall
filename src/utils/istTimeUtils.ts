/**
 * The Grid — India Standard Time (IST, UTC+05:30) Calendar & Event Timing Utilities
 * 
 * Architectural Mandates:
 * 1. Normalized Timezone: Fixed IST (UTC+05:30), no browser-local dynamic switching.
 * 2. Deterministic Conversion: Accurate conversion of UTC timestamps to IST.
 * 3. Date Boundaries: Multi-day weekend ranges use canonical calendar date representation (YYYY-MM-DD)
 *    so inclusive weekend ends NEVER spill into subsequent days in IST.
 * 4. Data Integrity: Never invent times. Missing times strictly return 'Time TBA' / 'TBA'.
 * 5. Chronological Sorting: Timed events first in chronological order, followed by 'Time TBA'.
 * 6. Session Timing Parity: If a specific day in a race weekend has a dedicated session with a verified
 *    timestamp, that session's time is displayed for that date.
 */

export const IST_OFFSET_MINUTES = 330; // +5 hours 30 minutes
export const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

export interface IstDateParts {
  year: number;
  month: number; // 0-indexed (0 = Jan, 9 = Oct)
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Formats calendar components into standard ISO date string: "YYYY-MM-DD".
 */
export function formatIsoDateString(year: number, monthZeroIndexed: number, day: number): string {
  const y = String(year);
  const m = String(monthZeroIndexed + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converts a UTC Date or ISO 8601 string to an IST-shifted Date.
 * Its getUTC* methods return the exact calendar values in IST.
 */
export function toIstDate(dateOrIso: Date | string): Date {
  const utcDate = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(utcDate.getTime())) {
    throw new Error(`Invalid date provided to toIstDate: ${dateOrIso}`);
  }
  return new Date(utcDate.getTime() + IST_OFFSET_MS);
}

/**
 * Extracts individual IST calendar and time components from a UTC timestamp.
 */
export function getIstDateParts(dateOrIso: Date | string): IstDateParts {
  const istDate = toIstDate(dateOrIso);
  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),
    day: istDate.getUTCDate(),
    hours: istDate.getUTCHours(),
    minutes: istDate.getUTCMinutes(),
    seconds: istDate.getUTCSeconds(),
  };
}

/**
 * Formats a UTC timestamp into standard IST presentation: "HH:mm IST" (e.g. "12:30 IST").
 * If no valid timestamp is available, strictly returns "Time TBA".
 */
export function formatIstTime(dateOrIso?: Date | string | null): string {
  if (!dateOrIso) return 'Time TBA';
  try {
    const parts = getIstDateParts(dateOrIso);
    const hh = String(parts.hours).padStart(2, '0');
    const mm = String(parts.minutes).padStart(2, '0');
    return `${hh}:${mm} IST`;
  } catch {
    return 'Time TBA';
  }
}

/**
 * Formats a UTC timestamp into short time format for compact calendar bars: "HH:mm" (e.g. "12:30").
 * If no valid timestamp is available, strictly returns "TBA".
 */
export function formatIstTimeShort(dateOrIso?: Date | string | null): string {
  if (!dateOrIso) return 'TBA';
  try {
    const parts = getIstDateParts(dateOrIso);
    const hh = String(parts.hours).padStart(2, '0');
    const mm = String(parts.minutes).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return 'TBA';
  }
}

/**
 * Computes the UTC start and end bounds for a given calendar day in IST.
 * For example, October 4, 2026 in IST runs from:
 * Start: 2026-10-03T18:30:00.000Z (00:00 IST on Oct 4)
 * End:   2026-10-04T18:29:59.999Z (23:59:59.999 IST on Oct 4)
 */
export function getIstDayUtcBounds(year: number, month: number, day: number): { startMs: number; endMs: number } {
  const calendarMidnightUtc = Date.UTC(year, month, day, 0, 0, 0, 0);
  const startMs = calendarMidnightUtc - IST_OFFSET_MS;
  const endMs = startMs + 24 * 60 * 60 * 1000 - 1;
  return { startMs, endMs };
}

/**
 * Evaluates whether an authoritative UTC timestamp falls on the specified calendar date in IST.
 */
export function isTimestampOnIstDate(
  dateOrIso: Date | string,
  calendarDate: Date
): boolean {
  try {
    const tMs = typeof dateOrIso === 'string' ? new Date(dateOrIso).getTime() : dateOrIso.getTime();
    if (isNaN(tMs)) return false;

    const y = calendarDate.getUTCFullYear();
    const m = calendarDate.getUTCMonth();
    const d = calendarDate.getUTCDate();
    const { startMs, endMs } = getIstDayUtcBounds(y, m, d);

    return tMs >= startMs && tMs <= endMs;
  } catch {
    return false;
  }
}

/**
 * Evaluates whether a calendar event is active on a specific calendar day in IST.
 * Uses canonical date string comparison (YYYY-MM-DD) for multi-day weekend spans
 * so that inclusive end dates (e.g. Oct 04) NEVER spill into the subsequent day (Oct 05).
 * Also respects session and race timestamps that genuinely cross midnight during IST conversion.
 */
export function isEventOnCalendarDateInIst(
  event: {
    startTimeUtc?: string;
    dates?: string;
    dateBounds?: {
      startMs: number;
      endMs: number;
      startDateIso?: string;
      endDateIso?: string;
      start?: Date;
      end?: Date;
    };
    weekendStartDate?: string;
    weekendEndDate?: string;
    sessions?: Array<{ startTimeUtc?: string; day?: string }>;
  },
  calendarDate: Date
): boolean {
  const targetYear = calendarDate.getUTCFullYear();
  const targetMonth = calendarDate.getUTCMonth();
  const targetDay = calendarDate.getUTCDate();
  const targetDateIso = formatIsoDateString(targetYear, targetMonth, targetDay);

  // 1. Check Weekend Date Range (canonical calendar date bounds)
  const startDateIso = event.weekendStartDate || event.dateBounds?.startDateIso;
  const endDateIso = event.weekendEndDate || event.dateBounds?.endDateIso;

  if (startDateIso && endDateIso) {
    if (targetDateIso >= startDateIso && targetDateIso <= endDateIso) {
      return true;
    }
  }

  // 2. Check if primary start time in IST falls on this calendar day
  if (event.startTimeUtc) {
    const istParts = getIstDateParts(event.startTimeUtc);
    const eventIstDateIso = formatIsoDateString(istParts.year, istParts.month, istParts.day);
    if (targetDateIso === eventIstDateIso) {
      return true;
    }
  }

  // 3. Check if any session start time in IST falls on this calendar day
  if (event.sessions && event.sessions.length > 0) {
    for (const session of event.sessions) {
      if (session.startTimeUtc) {
        const istParts = getIstDateParts(session.startTimeUtc);
        const sessionIstDateIso = formatIsoDateString(istParts.year, istParts.month, istParts.day);
        if (targetDateIso === sessionIstDateIso) {
          return true;
        }
      }
    }
  }

  return false;
}

export interface CalendarDateEventTime {
  timeUtc?: string;
  timeIst: string;
  timeIstShort: string;
  sessionName?: string;
}

/**
 * Resolves the appropriate display time for an event on a specific calendar day in IST.
 * - If the event has a session specifically matching this date with startTimeUtc, returns that session's time.
 * - Otherwise, if the date is the primary race date or within the weekend, returns the event's primary startTimeUtc.
 * - If no reliable time exists, returns 'Time TBA' / 'TBA'. Never invents times.
 */
export function getEventTimeForCalendarDate(
  event: {
    startTimeUtc?: string;
    sessions?: Array<{ name: string; day?: string; startTimeUtc?: string }>;
    dateBounds?: { startDateIso?: string; endDateIso?: string };
    weekendStartDate?: string;
    weekendEndDate?: string;
  },
  calendarDate: Date
): CalendarDateEventTime {
  const calDateIso = formatIsoDateString(
    calendarDate.getUTCFullYear(),
    calendarDate.getUTCMonth(),
    calendarDate.getUTCDate()
  );

  // 1. Check if there is an explicit session with a startTimeUtc falling on this IST date
  if (event.sessions && event.sessions.length > 0) {
    for (const session of event.sessions) {
      if (session.startTimeUtc) {
        const istParts = getIstDateParts(session.startTimeUtc);
        const sessionDateIso = formatIsoDateString(istParts.year, istParts.month, istParts.day);
        if (sessionDateIso === calDateIso) {
          return {
            timeUtc: session.startTimeUtc,
            timeIst: formatIstTime(session.startTimeUtc),
            timeIstShort: formatIstTimeShort(session.startTimeUtc),
            sessionName: session.name,
          };
        }
      }
    }

    // Secondary check: match by day of week if day field exists (e.g. Friday / Saturday / Sunday)
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const cellDayName = daysOfWeek[calendarDate.getUTCDay()];
    const matchingDaySession = event.sessions.find(s =>
      s.day && s.day.toLowerCase() === cellDayName.toLowerCase() && Boolean(s.startTimeUtc)
    );
    if (matchingDaySession?.startTimeUtc) {
      return {
        timeUtc: matchingDaySession.startTimeUtc,
        timeIst: formatIstTime(matchingDaySession.startTimeUtc),
        timeIstShort: formatIstTimeShort(matchingDaySession.startTimeUtc),
        sessionName: matchingDaySession.name,
      };
    }
  }

  // 2. Primary event startTimeUtc
  if (event.startTimeUtc) {
    return {
      timeUtc: event.startTimeUtc,
      timeIst: formatIstTime(event.startTimeUtc),
      timeIstShort: formatIstTimeShort(event.startTimeUtc),
    };
  }

  // 3. Untimed event
  return {
    timeIst: 'Time TBA',
    timeIstShort: 'TBA',
  };
}

/**
 * Returns a compact, user-friendly event name for tight calendar bars.
 * E.g. "Formula 1 Gulf Air Bahrain Grand Prix in Malaysia" -> "Bahrain GP"
 */
export function getCompactEventName(officialTitle: string, seriesBadge?: string): string {
  if (!officialTitle) return seriesBadge || 'Race';

  let clean = officialTitle;

  // Specific canonical race abbreviations for ultra-compact cell display
  if (/Bahrain/i.test(clean)) return 'Bahrain GP';
  if (/Singapore/i.test(clean)) return 'Singapore GP';
  if (/United States|Austin/i.test(clean)) return 'US GP';
  if (/Mexico/i.test(clean)) return 'Mexico GP';
  if (/Brazil|São Paulo/i.test(clean)) return 'São Paulo GP';
  if (/Las Vegas/i.test(clean)) return 'Las Vegas GP';
  if (/Qatar/i.test(clean)) return 'Qatar GP';
  if (/Abu Dhabi/i.test(clean)) return 'Abu Dhabi GP';
  if (/Japan|Motegi/i.test(clean)) return 'Japan GP';
  if (/Indonesia|Mandalika|Pertamina/i.test(clean)) return 'Indonesian GP';
  if (/Australia|Phillip Island/i.test(clean)) return 'Australian GP';
  if (/Malaysia|Sepang/i.test(clean)) return 'Malaysian GP';
  if (/Valencia/i.test(clean)) return 'Valencia GP';
  if (/Sardegna|Italia/i.test(clean)) return 'Rally Italia';
  if (/Barcelona.*3.*h/i.test(clean)) return 'Barcelona 3h';
  if (/6.*Hours.*Barcelona/i.test(clean)) return 'Barcelona 6h';
  if (/Petit Le Mans/i.test(clean)) return 'Petit Le Mans';
  if (/Baku|Azerbaijan/i.test(clean)) return 'Baku GP';
  if (/Monza/i.test(clean)) return 'Monza GP';
  if (/Spa/i.test(clean)) return 'Spa GP';

  // Strip leading series or sponsor keywords
  clean = clean
    .replace(/^(Formula 1|Formula 2|Formula 3|Formula 4|FIA |PETRONAS |Motul |Gulf Air |Qatar Airways |Aramco |Pirelli |Bapco Energies |Singapore Airlines )+/gi, '')
    .trim();

  // Shorten Grand Prix to GP
  clean = clean.replace(/Grand Prix/gi, 'GP');
  clean = clean.replace(/\s+in\s+.*$/i, '');
  clean = clean.replace(/\s+202\d$/, '');

  return clean.trim() || officialTitle.split(' ')[0];
}

/**
 * Sorts calendar events chronologically by their IST start time:
 * - Timed events first, ordered ascending by start time.
 * - Events with missing/TBA times appear after timed events.
 */
export function sortEventsChronologicalIst<T extends { startTimeUtc?: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const aTime = a.startTimeUtc ? new Date(a.startTimeUtc).getTime() : NaN;
    const bTime = b.startTimeUtc ? new Date(b.startTimeUtc).getTime() : NaN;

    const aHasTime = !isNaN(aTime);
    const bHasTime = !isNaN(bTime);

    if (aHasTime && bHasTime) {
      return aTime - bTime;
    }
    if (aHasTime && !bHasTime) {
      return -1;
    }
    if (!aHasTime && bHasTime) {
      return 1;
    }
    return 0;
  });
}

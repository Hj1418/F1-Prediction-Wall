/**
 * The Grid — Public iCalendar (.ics) Feed Generator
 *
 * RFC 5545 Compliant Generator for "The Grid — All Motorsport"
 *
 * Architectural Guarantees:
 * 1. Single Authoritative Source: Consumes GlobalCalendarEvent objects from globalCalendarService.
 * 2. Deterministic & Stable UIDs: {event.id}@thegrid (never random UUIDs or indexes).
 * 3. Accurate Date/Time: Preserves multi-day race weekend spans using RFC 5545 VALUE=DATE with non-inclusive DTEND.
 * 4. RFC Compliance: Proper text escaping (\,, \;, \\, \n), 75-octet line folding, and CRLF line endings.
 * 5. Static & Dynamic: Compatible with static build exports and dynamic client URL derivation.
 */

import { GlobalCalendarEvent } from './globalCalendarService';

export interface CalendarFeedOptions {
  calendarName?: string;
  calendarDescription?: string;
  baseUrl?: string;
  timestamp?: Date;
}

/**
 * Escapes characters according to RFC 5545 Section 3.3.11 for TEXT value types:
 * - Backslash (\) -> \\
 * - Semicolon (;) -> \;
 * - Comma (,) -> \,
 * - Line breaks -> \n
 */
export function escapeIcsText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * Folds lines longer than maxOctets (default 75 octets) according to RFC 5545 Section 3.1.
 * Continuation lines begin with a single space character.
 * Uses TextEncoder to accurately measure UTF-8 octet length without splitting multi-byte code points.
 */
export function foldIcsLine(line: string, maxOctets: number = 75): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= maxOctets) {
    return line;
  }

  const parts: string[] = [];
  let currentChunk = '';
  let currentBytes = 0;
  let isFirstLine = true;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const maxAllowed = isFirstLine ? maxOctets : (maxOctets - 1); // 1 byte reserved for leading space

    if (currentBytes + charBytes > maxAllowed) {
      parts.push(isFirstLine ? currentChunk : ` ${currentChunk}`);
      currentChunk = char;
      currentBytes = charBytes;
      isFirstLine = false;
    } else {
      currentChunk += char;
      currentBytes += charBytes;
    }
  }

  if (currentChunk.length > 0) {
    parts.push(isFirstLine ? currentChunk : ` ${currentChunk}`);
  }

  return parts.join('\r\n');
}

/**
 * Formats a Date object to RFC 5545 DATE format: YYYYMMDD (UTC)
 */
export function formatIcsDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Formats a Date object to RFC 5545 DATE-TIME format: YYYYMMDDTHHMMSSZ (UTC)
 */
export function formatIcsDateTime(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

/**
 * Derives the canonical public calendar feed URL dynamically without hardcoding.
 */
export function getCalendarFeedUrl(customBaseUrl?: string): string {
  if (customBaseUrl) {
    const clean = customBaseUrl.replace(/\/+$/, '');
    return `${clean}/calendar/the-grid.ics`;
  }

  // Environment variable override if specified at build time
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return `${envUrl.trim().replace(/\/+$/, '')}/calendar/the-grid.ics`;
  }

  // Derive dynamically in browser environment
  if (typeof window !== 'undefined' && window.location) {
    // Google Calendar's cloud servers cannot connect to localhost or 127.0.0.1.
    // In local development, provide the public production URL so Google Calendar can reach it.
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://hj1418.github.io/F1-Prediction-Wall/calendar/the-grid.ics';
    }

    const origin = window.location.origin;
    let pathname = window.location.pathname.replace(/\/[^/]*\.[^/]+$/, '');
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    const fullBase = `${origin}${pathname}`.replace(/\/+$/, '');
    return `${fullBase}/calendar/the-grid.ics`;
  }

  // Default fallback for node build scripts / tests
  return 'https://hj1418.github.io/F1-Prediction-Wall/calendar/the-grid.ics';
}

/**
 * Generates an RFC 5545 compliant iCalendar string (.ics) from authoritative GlobalCalendarEvent objects.
 */
export function generateIcsFeed(
  events: GlobalCalendarEvent[],
  options?: CalendarFeedOptions
): string {
  const calName = options?.calendarName || 'The Grid — All Motorsport';
  const calDesc = options?.calendarDescription || 'Authoritative global race calendar covering Formula 1, MotoGP, WEC, WRC, IndyCar, and more.';
  const baseUrl = options?.baseUrl || (typeof window !== 'undefined' && window.location ? window.location.origin : 'https://hj1418.github.io/F1-Prediction-Wall');
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const dtstamp = formatIcsDateTime(options?.timestamp || new Date('2026-10-01T00:00:00Z'));

  const rawLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Grid//Motorsport Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
    `X-WR-CALDESC:${escapeIcsText(calDesc)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  for (const event of events) {
    if (!event || !event.dateBounds || isNaN(event.dateBounds.startMs) || isNaN(event.dateBounds.endMs)) {
      continue;
    }

    // 1. Stable, deterministic UID
    const uid = event.id.includes('@') ? event.id : `${event.id}@thegrid`;

    // 2. Multi-day vs Single-day RFC 5545 DATE formatting
    // For all-day/date-only race weekend spans, DTEND is exclusive (day after inclusive end)
    const startDate = event.dateBounds.start;
    const inclusiveEndDate = event.dateBounds.end;
    const exclusiveEndDate = new Date(
      Date.UTC(
        inclusiveEndDate.getUTCFullYear(),
        inclusiveEndDate.getUTCMonth(),
        inclusiveEndDate.getUTCDate() + 1
      )
    );

    const dtstartProp = `DTSTART;VALUE=DATE:${formatIcsDate(startDate)}`;
    const dtendProp = `DTEND;VALUE=DATE:${formatIcsDate(exclusiveEndDate)}`;

    // 3. Structured Summary
    const summary = `${event.seriesBadge} — ${event.officialTitle}`;

    // 4. Structured Location
    const locationParts = [event.circuitName, event.location, event.country].filter(Boolean);
    const location = locationParts.join(', ');

    // 5. Rich Description with Sessions & Context
    const descLines: string[] = [
      `${event.seriesName} (${event.seriesBadge}) — Round ${event.roundNumber}: ${event.officialTitle}`,
      `Circuit: ${event.circuitName}`,
      `Location: ${location}`,
      `Dates: ${event.dates}`,
    ];

    if (event.sessions && event.sessions.length > 0) {
      descLines.push('Sessions:');
      for (const s of event.sessions) {
        const dur = s.durationMinutes ? ` (${s.durationMinutes}m)` : '';
        descLines.push(`• ${s.name} [${s.day}]${dur}`);
      }
    }

    const eventUrl = `${cleanBase}/#/explore/${event.seriesId}`;
    descLines.push(`View on The Grid: ${eventUrl}`);

    const description = descLines.join('\n');

    // 6. Categories
    const categories = [event.seriesBadge, event.seriesName, 'Motorsport'].filter(Boolean).map(escapeIcsText).join(',');

    rawLines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      dtstartProp,
      dtendProp,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      `CATEGORIES:${categories}`,
      `URL:${eventUrl}`,
      'STATUS:CONFIRMED',
      `LAST-MODIFIED:${dtstamp}`,
      'END:VEVENT'
    );
  }

  rawLines.push('END:VCALENDAR');

  // Apply line folding and CRLF formatting to every line
  const foldedLines = rawLines.map(line => foldIcsLine(line, 75));
  return foldedLines.join('\r\n') + '\r\n';
}

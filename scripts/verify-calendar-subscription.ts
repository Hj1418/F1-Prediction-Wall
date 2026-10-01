import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllGlobalCalendarEvents,
  GlobalCalendarEvent,
} from '../src/services/calendar/globalCalendarService.js';
import {
  generateIcsFeed,
  escapeIcsText,
  foldIcsLine,
  formatIcsDate,
  formatIcsDateTime,
  getCalendarFeedUrl,
} from '../src/services/calendar/calendarFeedGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🏁 STARTING DETERMINISTIC VERIFICATION FOR THE GRID CALENDAR SUBSCRIPTION (.ics)...\n');

let passedTests = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// =========================================================================
// SECTION 1: VCALENDAR WRAPPER & RFC 5545 SPECIFICATION
// =========================================================================
console.log('📅 [SECTION 1] VCALENDAR Structure & RFC 5545 Compliance:');

test('1. Valid VCALENDAR wrapper with required RFC 5545 headers and footers', () => {
  const events = getAllGlobalCalendarEvents();
  const ics = generateIcsFeed(events);

  assert(ics.startsWith('BEGIN:VCALENDAR\r\n'), 'Feed must begin with BEGIN:VCALENDAR');
  assert(ics.includes('VERSION:2.0\r\n'), 'Feed must specify VERSION:2.0');
  assert(ics.includes('PRODID:-//The Grid//Motorsport Calendar//EN\r\n'), 'Feed must include PRODID');
  assert(ics.includes('CALSCALE:GREGORIAN\r\n'), 'Feed must include CALSCALE:GREGORIAN');
  assert(ics.includes('METHOD:PUBLISH\r\n'), 'Feed must include METHOD:PUBLISH');
  assert(ics.includes('X-WR-CALNAME:The Grid — All Motorsport\r\n'), 'Feed must include X-WR-CALNAME');
  assert(ics.trimEnd().endsWith('END:VCALENDAR'), 'Feed must end with END:VCALENDAR');
});

test('2. Output exclusively uses CRLF line endings (no bare LF or CR)', () => {
  const events = getAllGlobalCalendarEvents();
  const ics = generateIcsFeed(events);

  // Check that every line break is \r\n
  const strippedOfCrlf = ics.replace(/\r\n/g, '');
  assert(!strippedOfCrlf.includes('\n'), 'Generated ICS must NOT contain any lone LF (\\n) characters');
  assert(!strippedOfCrlf.includes('\r'), 'Generated ICS must NOT contain any lone CR (\\r) characters');
});

// =========================================================================
// SECTION 2: STABLE UIDs & DETERMINISM
// =========================================================================
console.log('\n🔑 [SECTION 2] Stable UIDs & Deterministic Generation:');

test('3. Every event has a stable, non-empty UID with canonical @thegrid domain', () => {
  const events = getAllGlobalCalendarEvents();
  const ics = generateIcsFeed(events);
  const uidMatches = ics.match(/^UID:.+$/gm) || [];

  assert.strictEqual(uidMatches.length, events.length, `Expected ${events.length} UIDs, found ${uidMatches.length}`);

  for (const uidLine of uidMatches) {
    const uid = uidLine.replace('UID:', '').trim();
    assert(uid.endsWith('@thegrid'), `UID "${uid}" must end with @thegrid`);
    assert(uid.length > '@thegrid'.length + 3, `UID "${uid}" must be descriptive`);
    assert(!uid.includes('undefined'), `UID "${uid}" must not contain undefined`);
    assert(!uid.includes('null'), `UID "${uid}" must not contain null`);
  }
});

test('4. Idempotence: Same input produces identical UIDs and identical ICS output', () => {
  const events = getAllGlobalCalendarEvents();
  const fixedDate = new Date('2026-10-01T12:00:00Z');
  const run1 = generateIcsFeed(events, { timestamp: fixedDate });
  const run2 = generateIcsFeed(events, { timestamp: fixedDate });

  assert.strictEqual(run1, run2, 'Regenerating the feed from the same dataset must be strictly byte-identical');
});

test('5. Zero duplicate UIDs across the entire calendar feed', () => {
  const events = getAllGlobalCalendarEvents();
  const ics = generateIcsFeed(events);
  const uidMatches = ics.match(/^UID:(.+)$/gm) || [];
  const seenUids = new Set<string>();

  for (const match of uidMatches) {
    const uid = match.replace('UID:', '').trim();
    assert(!seenUids.has(uid), `Duplicate UID detected: ${uid}`);
    seenUids.add(uid);
  }
  assert.strictEqual(seenUids.size, events.length, 'Every event in the feed must have a unique UID');
});

// =========================================================================
// SECTION 3: CURRENT-SEASON INTEGRITY & DATA REUSE
// =========================================================================
console.log('\n🏎️ [SECTION 3] Authoritative Data & Season Filtering:');

test('6. Feed consumes same authoritative events as Global Calendar UI (188 active rounds)', () => {
  const events = getAllGlobalCalendarEvents();
  assert(events.length >= 150, `Expected at least 150 events, found ${events.length}`);
  const ics = generateIcsFeed(events);
  const veventMatches = ics.match(/BEGIN:VEVENT/g) || [];
  assert.strictEqual(veventMatches.length, events.length, 'VEVENT count must match authoritative event count');
});

test('7. Excludes stale previous seasons and validates active 2026 championship seasons', () => {
  const events = getAllGlobalCalendarEvents();
  for (const event of events) {
    const year = typeof event.seasonYear === 'number' ? event.seasonYear : parseInt(String(event.seasonYear), 10);
    assert(year >= 2026, `Event ${event.id} belongs to past season: ${event.seasonYear}`);
  }
});

// =========================================================================
// SECTION 4: MULTI-DAY RACE WEEKENDS & DATE BOUNDS
// =========================================================================
console.log('\n📆 [SECTION 4] Multi-Day Events & RFC 5545 Date Representation:');

test('8. Multi-day events produce valid VALUE=DATE with non-inclusive exclusive DTEND (+1 day)', () => {
  const sampleEvent: GlobalCalendarEvent = {
    id: 'f1-2026-r1',
    seriesId: 'f1',
    seriesName: 'Formula 1',
    seriesBadge: 'F1',
    seriesColor: '#e10600',
    seasonYear: 2026,
    roundNumber: 1,
    officialTitle: 'Formula 1 Australian Grand Prix 2026',
    circuitName: 'Albert Park Circuit',
    circuitId: 'albert_park',
    hasVerifiedGeometry: true,
    location: 'Melbourne',
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    dates: 'Mar 13 – Mar 15',
    dateBounds: {
      start: new Date(Date.UTC(2026, 2, 13, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 2, 15, 23, 59, 59)),
      startMs: Date.UTC(2026, 2, 13, 0, 0, 0),
      endMs: Date.UTC(2026, 2, 15, 23, 59, 59),
    },
    status: 'COMPLETED',
    hasPrediction: true,
    hubUrl: '/explore/f1',
    circuitUrl: '/explore/f1/circuits/albert_park',
  };

  const ics = generateIcsFeed([sampleEvent]);
  assert(ics.includes('DTSTART;VALUE=DATE:20260313\r\n'), 'DTSTART must be 20260313');
  // Exclusive end date for Mar 15 is Mar 16:
  assert(ics.includes('DTEND;VALUE=DATE:20260316\r\n'), 'DTEND must be 20260316 (exclusive end of multi-day race weekend)');
});

test('9. Single-day events produce exclusive DTEND equal to DTSTART + 1 day', () => {
  const singleDayEvent: GlobalCalendarEvent = {
    id: 'test-2026-r1',
    seriesId: 'f1',
    seriesName: 'Formula 1',
    seriesBadge: 'F1',
    seriesColor: '#e10600',
    seasonYear: 2026,
    roundNumber: 1,
    officialTitle: 'Test One-Day Race',
    circuitName: 'Silverstone Circuit',
    circuitId: 'silverstone',
    hasVerifiedGeometry: true,
    location: 'Silverstone',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    dates: 'May 03',
    dateBounds: {
      start: new Date(Date.UTC(2026, 4, 3, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 4, 3, 23, 59, 59)),
      startMs: Date.UTC(2026, 4, 3, 0, 0, 0),
      endMs: Date.UTC(2026, 4, 3, 23, 59, 59),
    },
    status: 'UPCOMING',
    hasPrediction: false,
    hubUrl: '/explore/f1',
    circuitUrl: '/explore/f1/circuits/silverstone',
  };

  const ics = generateIcsFeed([singleDayEvent]);
  assert(ics.includes('DTSTART;VALUE=DATE:20260503\r\n'), 'DTSTART must be 20260503');
  assert(ics.includes('DTEND;VALUE=DATE:20260504\r\n'), 'DTEND must be 20260504 (DTSTART + 1 day)');
});

test('10. Multi-day month boundary transitions roll correctly (e.g. Feb 27 – Mar 01)', () => {
  const febMarEvent: GlobalCalendarEvent = {
    id: 'nascar-2026-r3',
    seriesId: 'nascar',
    seriesName: 'NASCAR Cup Series',
    seriesBadge: 'NASCAR',
    seriesColor: '#ffffff',
    seasonYear: 2026,
    roundNumber: 3,
    officialTitle: 'NASCAR at COTA',
    circuitName: 'Circuit of the Americas',
    circuitId: 'cota',
    hasVerifiedGeometry: true,
    location: 'Austin',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    dates: 'Feb 27 – Mar 01',
    dateBounds: {
      start: new Date(Date.UTC(2026, 1, 27, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 2, 1, 23, 59, 59)),
      startMs: Date.UTC(2026, 1, 27, 0, 0, 0),
      endMs: Date.UTC(2026, 2, 1, 23, 59, 59),
    },
    status: 'UPCOMING',
    hasPrediction: false,
    hubUrl: '/explore/nascar',
    circuitUrl: '/explore/nascar/circuits/cota',
  };

  const ics = generateIcsFeed([febMarEvent]);
  assert(ics.includes('DTSTART;VALUE=DATE:20260227\r\n'), 'DTSTART must be 20260227');
  assert(ics.includes('DTEND;VALUE=DATE:20260302\r\n'), 'DTEND must roll to 20260302');
});

// =========================================================================
// SECTION 5: ESCAPING & LINE FOLDING
// =========================================================================
console.log('\n🛡️ [SECTION 5] RFC Escaping & 75-Octet Line Folding:');

test('11. escapeIcsText properly escapes commas, semicolons, backslashes, and newlines', () => {
  const raw = 'Formula 1; Grand Prix, with \\backslash\nand new line';
  const escaped = escapeIcsText(raw);
  assert.strictEqual(escaped, 'Formula 1\\; Grand Prix\\, with \\\\backslash\\nand new line');
});

test('12. foldIcsLine folds lines longer than 75 octets with CRLF followed by single space', () => {
  const longLine = 'DESCRIPTION:This is a very long line that exceeds the standard seventy-five octet limit defined in RFC 5545 Section 3.1.';
  const folded = foldIcsLine(longLine, 75);

  const lines = folded.split('\r\n');
  assert(lines.length >= 2, 'Line must be split into at least 2 folded lines');
  const encoder = new TextEncoder();
  for (let i = 0; i < lines.length; i++) {
    const octets = encoder.encode(lines[i]).length;
    assert(octets <= 75, `Line ${i} exceeds 75 octets: ${octets}`);
    if (i > 0) {
      assert(lines[i].startsWith(' '), `Continuation line ${i} must begin with space`);
    }
  }

  // Unfolding check: remove CRLF + space restores original
  const unfolded = lines.map((l, idx) => (idx === 0 ? l : l.slice(1))).join('');
  assert.strictEqual(unfolded, longLine, 'Unfolded string must match original string');
});

test('13. No line in the entire generated calendar feed exceeds 75 octets', () => {
  const events = getAllGlobalCalendarEvents();
  const ics = generateIcsFeed(events);
  const lines = ics.split('\r\n');
  const encoder = new TextEncoder();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const octets = encoder.encode(line).length;
    assert(octets <= 75, `Line ${i + 1} exceeds 75 octets (${octets} bytes): "${line}"`);
  }
});

// =========================================================================
// SECTION 6: EVENT FIELDS INTEGRITY & URL RESOLUTION
// =========================================================================
console.log('\n🔍 [SECTION 6] Field Integrity & URL Resolution:');

test('14. No empty or missing required fields in any VEVENT', () => {
  const events = getAllGlobalCalendarEvents();
  const ics = generateIcsFeed(events);
  const veventBlocks = ics.split('BEGIN:VEVENT').slice(1);

  for (const block of veventBlocks) {
    assert(block.includes('UID:'), 'Missing UID');
    assert(block.includes('DTSTAMP:'), 'Missing DTSTAMP');
    assert(block.includes('DTSTART;VALUE=DATE:'), 'Missing DTSTART');
    assert(block.includes('DTEND;VALUE=DATE:'), 'Missing DTEND');
    assert(block.includes('SUMMARY:'), 'Missing SUMMARY');
    assert(block.includes('DESCRIPTION:'), 'Missing DESCRIPTION');
    assert(block.includes('LOCATION:'), 'Missing LOCATION');
    assert(block.includes('CATEGORIES:'), 'Missing CATEGORIES');
    assert(block.includes('URL:'), 'Missing URL');
    assert(block.includes('STATUS:CONFIRMED'), 'Missing STATUS');
    assert(block.includes('LAST-MODIFIED:'), 'Missing LAST-MODIFIED');
    assert(block.includes('END:VEVENT'), 'Missing END:VEVENT');
  }
});

test('15. Robustness: Generator gracefully handles missing optional metadata', () => {
  const sparseEvent: GlobalCalendarEvent = {
    id: 'sparse-2026-r1',
    seriesId: 'f1',
    seriesName: 'Formula 1',
    seriesBadge: 'F1',
    seriesColor: '#e10600',
    seasonYear: 2026,
    roundNumber: 1,
    officialTitle: 'Sparse Event Without Optional Fields',
    circuitName: 'Bespoke Track',
    circuitId: 'bespoke',
    hasVerifiedGeometry: false,
    location: 'City',
    country: 'Country',
    countryCode: 'XX',
    flag: '',
    dates: 'Nov 01 – Nov 02',
    dateBounds: {
      start: new Date(Date.UTC(2026, 10, 1)),
      end: new Date(Date.UTC(2026, 10, 2)),
      startMs: Date.UTC(2026, 10, 1),
      endMs: Date.UTC(2026, 10, 2),
    },
    status: 'UPCOMING',
    hasPrediction: false,
    hubUrl: '/explore/f1',
    circuitUrl: '/explore/f1/circuits/bespoke',
    sessions: undefined,
  };

  const ics = generateIcsFeed([sparseEvent]);
  assert(ics.includes('UID:sparse-2026-r1@thegrid'), 'Sparse event should generate valid UID');
  assert(ics.includes('SUMMARY:F1 — Sparse Event'), 'Sparse event should generate valid SUMMARY');
});

test('16. getCalendarFeedUrl dynamically computes the feed URL without hardcoding', () => {
  const custom = getCalendarFeedUrl('https://example.com/subpath/');
  assert.strictEqual(custom, 'https://example.com/subpath/calendar/the-grid.ics');

  const fallback = getCalendarFeedUrl();
  assert(fallback.endsWith('/calendar/the-grid.ics'), `Expected URL ending with /calendar/the-grid.ics, got ${fallback}`);
});

// =========================================================================
// SECTION 7: STATIC ARTIFACT VERIFICATION
// =========================================================================
console.log('\n📦 [SECTION 7] Build Artifact Verification:');

test('17. public/calendar/the-grid.ics exists and is populated', () => {
  const publicPath = path.join(rootDir, 'public', 'calendar', 'the-grid.ics');
  assert(fs.existsSync(publicPath), 'public/calendar/the-grid.ics must exist');
  const stats = fs.statSync(publicPath);
  assert(stats.size > 50000, `Expected public feed size > 50KB, got ${stats.size} bytes`);
});

test('18. dist/calendar/the-grid.ics exists and matches public output', () => {
  const publicPath = path.join(rootDir, 'public', 'calendar', 'the-grid.ics');
  const distPath = path.join(rootDir, 'dist', 'calendar', 'the-grid.ics');

  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    assert(fs.existsSync(distPath), 'dist/calendar/the-grid.ics must exist after build');
    const publicContent = fs.readFileSync(publicPath, 'utf-8');
    const distContent = fs.readFileSync(distPath, 'utf-8');
    assert.strictEqual(distContent, publicContent, 'Dist copy must be identical to public feed');
  }
});

console.log(`\n======================================================`);
console.log(`✨ ALL ${passedTests} CALENDAR SUBSCRIPTION TESTS PASSED!`);
console.log(`======================================================\n`);

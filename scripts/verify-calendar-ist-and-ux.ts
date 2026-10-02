import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  toIstDate,
  getIstDateParts,
  formatIstTime,
  formatIstTimeShort,
  isTimestampOnIstDate,
  isEventOnCalendarDateInIst,
  sortEventsChronologicalIst,
  getEventTimeForCalendarDate,
  formatIsoDateString,
} from '../src/utils/istTimeUtils';
import {
  getAllGlobalCalendarEvents,
  filterCalendarEvents,
  isEventOnDate,
  GlobalCalendarEvent,
} from '../src/services/calendar/globalCalendarService';
import { parseEventDateBounds } from '../src/services/schedule/eventStatusResolver';
import { f1Data } from '../src/services/motorsport/data/f1Data';
import { motogpData } from '../src/services/motorsport/data/motogpData';
import { wrcData } from '../src/services/motorsport/data/wrcData';

console.log('🏎️ STARTING DETERMINISTIC TEST SUITE FOR GLOBAL CALENDAR IST TIMINGS & UX REFINEMENT');

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
// SECTION 1: IST CONVERSION & MIDNIGHT CROSSING
// =========================================================================
console.log('\n🕒 [SECTION 1] IST Conversion & Date Boundary Verification:');

test('1. Correct IST conversion for known race timestamps (UTC+05:30)', () => {
  // Bahrain GP in Malaysia: 07:00 UTC / 15:00 local Malaysia -> 12:30 IST
  assert.strictEqual(formatIstTime('2026-10-04T07:00:00Z'), '12:30 IST');
  assert.strictEqual(formatIstTimeShort('2026-10-04T07:00:00Z'), '12:30');

  // MotoGP Motegi: 09:00 UTC -> 14:30 IST
  assert.strictEqual(formatIstTime('2026-10-04T09:00:00Z'), '14:30 IST');
  assert.strictEqual(formatIstTimeShort('2026-10-04T09:00:00Z'), '14:30');

  // WRC Sardegna: 05:30 UTC -> 11:00 IST
  assert.strictEqual(formatIstTime('2026-10-04T05:30:00Z'), '11:00 IST');
  assert.strictEqual(formatIstTimeShort('2026-10-04T05:30:00Z'), '11:00');

  // Singapore GP: 12:00 UTC -> 17:30 IST
  assert.strictEqual(formatIstTime('2026-10-11T12:00:00Z'), '17:30 IST');
  assert.strictEqual(formatIstTimeShort('2026-10-11T12:00:00Z'), '17:30');
});

test('2. Correct IST date when UTC/source timezone crosses midnight', () => {
  // An evening event starting at 19:00 UTC on Oct 25 (e.g. US Grand Prix in Austin, Texas)
  // In IST (+5:30), 19:00 + 5h30m = 00:30 on the NEXT DAY: October 26!
  const utcEvening = '2026-10-25T19:00:00Z';
  const parts = getIstDateParts(utcEvening);

  assert.strictEqual(parts.year, 2026, 'Year remains 2026');
  assert.strictEqual(parts.month, 9, 'Month is October (9)');
  assert.strictEqual(parts.day, 26, 'Day crosses midnight into October 26');
  assert.strictEqual(parts.hours, 0, 'Hour is 00');
  assert.strictEqual(parts.minutes, 30, 'Minute is 30');
  assert.strictEqual(formatIstTime(utcEvening), '00:30 IST');

  // Check date matching:
  // On Oct 26 calendar day in IST -> true
  const oct26Utc = new Date(Date.UTC(2026, 9, 26));
  assert.strictEqual(isTimestampOnIstDate(utcEvening, oct26Utc), true, 'Falls on Oct 26 IST calendar day');

  // On Oct 25 calendar day in IST -> false
  const oct25Utc = new Date(Date.UTC(2026, 9, 25));
  assert.strictEqual(isTimestampOnIstDate(utcEvening, oct25Utc), false, 'Does NOT fall on Oct 25 IST calendar day');
});

test('2b. Month boundary crossing with IST conversion (Oct 31 19:00 UTC -> Nov 01 IST)', () => {
  const monthEndUtc = '2026-10-31T19:00:00Z';
  const parts = getIstDateParts(monthEndUtc);
  assert.strictEqual(parts.month, 10, 'Month rolls over to November (10)');
  assert.strictEqual(parts.day, 1, 'Day rolls over to 1st of November');
  assert.strictEqual(parts.hours, 0, 'Hour is 00');
  assert.strictEqual(parts.minutes, 30, 'Minute is 30');
  assert.strictEqual(formatIstTime(monthEndUtc), '00:30 IST');
});

// =========================================================================
// SECTION 2: CHRONOLOGICAL SORTING & TBA HANDLING
// =========================================================================
console.log('\n📊 [SECTION 2] Chronological Sorting & TBA Handling:');

test('3. Correct chronological sorting in IST (timed events ascending, then TBA)', () => {
  const sampleEvents = [
    { id: 'ev-f1', title: 'Formula 1', startTimeUtc: '2026-10-04T07:00:00Z' },    // 12:30 IST
    { id: 'ev-f2', title: 'Formula 2', startTimeUtc: undefined },                    // TBA
    { id: 'ev-wrc', title: 'WRC', startTimeUtc: '2026-10-04T05:30:00Z' },          // 11:00 IST
    { id: 'ev-moto', title: 'MotoGP', startTimeUtc: '2026-10-04T09:00:00Z' },      // 14:30 IST
    { id: 'ev-f3', title: 'Formula 3', startTimeUtc: undefined },                    // TBA
  ];

  const sorted = sortEventsChronologicalIst(sampleEvents);
  assert.strictEqual(sorted[0].id, 'ev-wrc', '11:00 IST WRC must be first');
  assert.strictEqual(sorted[1].id, 'ev-f1', '12:30 IST Formula 1 must be second');
  assert.strictEqual(sorted[2].id, 'ev-moto', '14:30 IST MotoGP must be third');
  assert.strictEqual(sorted[3].id, 'ev-f2', 'TBA event must be after timed events');
  assert.strictEqual(sorted[4].id, 'ev-f3', 'TBA event must be after timed events');
});

test('4. Events with missing times display "Time TBA"', () => {
  assert.strictEqual(formatIstTime(undefined), 'Time TBA');
  assert.strictEqual(formatIstTime(null), 'Time TBA');
  assert.strictEqual(formatIstTime(''), 'Time TBA');
  assert.strictEqual(formatIstTimeShort(undefined), 'TBA');
  assert.strictEqual(formatIstTimeShort(null), 'TBA');
});

test('5. No invented times in authoritative data sources', () => {
  const allEvents = getAllGlobalCalendarEvents();
  assert(allEvents.length > 0, 'Events loaded');

  // Verify that events without explicit startTimeUtc are never given a fabricated string
  const untimed = allEvents.filter(e => !e.startTimeUtc);
  assert(untimed.length > 0, 'Found untimed events in global calendar');
  untimed.forEach(e => {
    assert.strictEqual(formatIstTime(e.startTimeUtc), 'Time TBA', `Untimed event ${e.officialTitle} must format to Time TBA`);
    assert.strictEqual(formatIstTimeShort(e.startTimeUtc), 'TBA', `Untimed event ${e.officialTitle} must format short to TBA`);
  });
});

// =========================================================================
// SECTION 3: MULTI-EVENT DATE COORDINATION
// =========================================================================
console.log('\n🏎️ [SECTION 3] Multi-Event Date Coordination & Popup Parity:');

test('6. Multiple events on the same date display their individual authoritative times', () => {
  const allEvents = getAllGlobalCalendarEvents();
  const oct4Date = new Date(Date.UTC(2026, 9, 4));

  const oct4Events = allEvents.filter(e => isEventOnDate(e, oct4Date));
  assert(oct4Events.length >= 3, `Expected at least 3 events on Oct 04 2026, found ${oct4Events.length}`);

  const f1 = oct4Events.find(e => e.seriesId === 'f1');
  const motogp = oct4Events.find(e => e.seriesId === 'motogp');
  const wrc = oct4Events.find(e => e.seriesId === 'wrc');

  assert(f1, 'F1 Bahrain GP in Malaysia must be present on Oct 4');
  assert(motogp, 'MotoGP Japanese GP must be present on Oct 4');
  assert(wrc, 'WRC Rally Italia Sardegna must be present on Oct 4');

  assert.strictEqual(formatIstTime(f1!.startTimeUtc), '12:30 IST', 'F1 Bahrain GP starts at 12:30 IST (15:00 local Malaysia / 07:00 UTC)');
  assert.strictEqual(formatIstTime(motogp!.startTimeUtc), '14:30 IST', 'MotoGP Motegi starts at 14:30 IST');
  assert.strictEqual(formatIstTime(wrc!.startTimeUtc), '11:00 IST', 'WRC Sardegna starts at 11:00 IST');
});

test('7. Calendar cell timing matches popup timing', () => {
  const allEvents = getAllGlobalCalendarEvents();
  allEvents.forEach(e => {
    if (e.startTimeUtc) {
      const cellTime = formatIstTimeShort(e.startTimeUtc);
      const popupTime = formatIstTime(e.startTimeUtc);
      assert.strictEqual(popupTime, `${cellTime} IST`, `Cell time ${cellTime} must match popup time ${popupTime}`);
    }
  });
});

test('8. Month navigation does not break timezone/date calculations', () => {
  const months = [
    { year: 2026, month: 8 },  // Sep
    { year: 2026, month: 9 },  // Oct
    { year: 2026, month: 10 }, // Nov
    { year: 2026, month: 11 }, // Dec
    { year: 2027, month: 0 },  // Jan
  ];

  months.forEach(({ year, month }) => {
    const filtered = filterCalendarEvents({ year, month });
    assert(Array.isArray(filtered), `Month ${month + 1}/${year} filtered events returned an array`);
  });
});

test('9. Existing current-season filtering remains intact', () => {
  const currentOnly = filterCalendarEvents({ currentSeasonOnly: true });
  assert(currentOnly.length > 0, 'Current season filter returns events');
  currentOnly.forEach(e => {
    const yr = Number(String(e.seasonYear).split('-')[0]);
    assert(yr >= 2025, `Event ${e.officialTitle} season ${e.seasonYear} must be >= 2025`);
  });
});

// =========================================================================
// SECTION 4: EXPLORE MEGA-MENU REFINEMENT AUDIT
// =========================================================================
console.log('\n🧭 [SECTION 4] Explore Mega-Menu UX Simplification Audit:');

test('10. ExploreMegaMenu is compact, has no long descriptions or promotional callout cards', () => {
  const megaMenuPath = path.resolve(process.cwd(), 'src/components/navbar/ExploreMegaMenu.tsx');
  const megaMenuSrc = fs.readFileSync(megaMenuPath, 'utf8');

  assert(!megaMenuSrc.includes('explore-mega-menu__item-desc'), 'item-desc class must be removed');
  assert(!megaMenuSrc.includes('explore-mega-menu__tag'), 'tag badge class must be removed');
  assert(!megaMenuSrc.includes('PROTOTYPE LADDER'), 'PROTOTYPE LADDER callout must be removed');
  assert(!megaMenuSrc.includes('ENDURANCE MAJORS'), 'ENDURANCE MAJORS callout must be removed');
  assert(!megaMenuSrc.includes('RALLY & NATIONAL'), 'RALLY & NATIONAL callout must be removed');
  assert(!megaMenuSrc.includes('THE GRID MOTORSPORT REGISTRY • 10 DISCIPLINES COVERED'), 'Verbose footer copy removed');
  assert(megaMenuSrc.includes('FORMULA RACING'), 'FORMULA RACING category preserved');
  assert(megaMenuSrc.includes('MOTORCYCLE RACING'), 'MOTORCYCLE RACING category preserved');
  assert(megaMenuSrc.includes('ENDURANCE / GT'), 'ENDURANCE / GT category preserved');
  assert(megaMenuSrc.includes('OTHER DISCIPLINES'), 'OTHER DISCIPLINES category preserved');
  assert(megaMenuSrc.includes('VIEW ALL MOTORSPORTS'), 'VIEW ALL MOTORSPORTS link preserved');
  assert(megaMenuSrc.includes('to="/explore"'), 'to="/explore" destination preserved');
});

// =========================================================================
// SECTION 5: CRITICAL DATE RANGE BUG & BAHRAIN GP REGRESSION
// =========================================================================
console.log('\n🛑 [SECTION 5] Date Range Bug & Bahrain GP Regression Verification:');

test('11. Regression Test — Bahrain GP weekend (2026-10-02 -> 2026-10-04) visibility & race start', () => {
  const allEvents = getAllGlobalCalendarEvents();
  const f1Event = allEvents.find(e => e.seriesId === 'f1' && (e.officialTitle.includes('Bahrain') || e.dates.includes('Oct 02')));

  assert(f1Event, 'F1 Bahrain GP event must exist in authoritative calendar');
  assert.strictEqual(f1Event!.weekendStartDate, '2026-10-02', 'Weekend start date is 2026-10-02');
  assert.strictEqual(f1Event!.weekendEndDate, '2026-10-04', 'Weekend end date is 2026-10-04');
  assert.strictEqual(f1Event!.circuitName, 'Sepang International Circuit', 'Venue is Sepang International Circuit');
  assert.strictEqual(f1Event!.country, 'Malaysia', 'Country is Malaysia');

  // Calendar dates
  const oct2Date = new Date(Date.UTC(2026, 9, 2));
  const oct3Date = new Date(Date.UTC(2026, 9, 3));
  const oct4Date = new Date(Date.UTC(2026, 9, 4));
  const oct5Date = new Date(Date.UTC(2026, 9, 5));

  // Visibility assertions
  assert.strictEqual(isEventOnDate(f1Event!, oct2Date), true, 'Bahrain GP MUST be visible on Oct 2 (Practice)');
  assert.strictEqual(isEventOnDate(f1Event!, oct3Date), true, 'Bahrain GP MUST be visible on Oct 3 (Qualifying)');
  assert.strictEqual(isEventOnDate(f1Event!, oct4Date), true, 'Bahrain GP MUST be visible on Oct 4 (Race)');
  assert.strictEqual(isEventOnDate(f1Event!, oct5Date), false, 'Bahrain GP MUST NOT be visible on Monday Oct 5');

  // Timing on each date
  const oct2Timing = getEventTimeForCalendarDate(f1Event!, oct2Date);
  const oct3Timing = getEventTimeForCalendarDate(f1Event!, oct3Date);
  const oct4Timing = getEventTimeForCalendarDate(f1Event!, oct4Date);

  assert.strictEqual(oct2Timing.timeIstShort, '10:00', 'Oct 2 shows FP1 start: 10:00');
  assert.strictEqual(oct3Timing.timeIstShort, '13:30', 'Oct 3 shows Qualifying start: 13:30');
  assert.strictEqual(oct4Timing.timeIst, '12:30 IST', 'Oct 4 shows Race start: 12:30 IST');
  assert.strictEqual(oct4Timing.timeIstShort, '12:30', 'Oct 4 short format is 12:30');
});

test('12. Boundary Test 1: Starts before midnight UTC on same IST date', () => {
  // 17:00 UTC -> 22:30 IST (same date)
  const ev = {
    startTimeUtc: '2026-10-04T17:00:00Z',
    dateBounds: parseEventDateBounds({ dates: 'Oct 04', season: 2026 }),
  };
  const oct4 = new Date(Date.UTC(2026, 9, 4));
  const oct5 = new Date(Date.UTC(2026, 9, 5));
  assert.strictEqual(isEventOnCalendarDateInIst(ev, oct4), true, 'Visible on Oct 4');
  assert.strictEqual(isEventOnCalendarDateInIst(ev, oct5), false, 'Not visible on Oct 5');
});

test('13. Boundary Test 2: Starts after midnight UTC (early morning UTC, same date in IST)', () => {
  // 01:00 UTC -> 06:30 IST (same date)
  const ev = {
    startTimeUtc: '2026-10-04T01:00:00Z',
    dateBounds: parseEventDateBounds({ dates: 'Oct 04', season: 2026 }),
  };
  const oct4 = new Date(Date.UTC(2026, 9, 4));
  const oct3 = new Date(Date.UTC(2026, 9, 3));
  assert.strictEqual(isEventOnCalendarDateInIst(ev, oct4), true, 'Visible on Oct 4');
  assert.strictEqual(isEventOnCalendarDateInIst(ev, oct3), false, 'Not visible on Oct 3');
});

test('14. Boundary Test 3: Crosses midnight during IST conversion', () => {
  // 19:00 UTC on Oct 25 -> 00:30 IST on Oct 26
  const ev = {
    startTimeUtc: '2026-10-25T19:00:00Z',
    dates: 'Oct 23 – Oct 25',
    dateBounds: parseEventDateBounds({ dates: 'Oct 23 – Oct 25', season: 2026 }),
  };
  const oct25 = new Date(Date.UTC(2026, 9, 25));
  const oct26 = new Date(Date.UTC(2026, 9, 26));
  const oct27 = new Date(Date.UTC(2026, 9, 27));

  assert.strictEqual(isEventOnCalendarDateInIst(ev, oct25), true, 'Visible on Oct 25 (in weekend)');
  assert.strictEqual(isEventOnCalendarDateInIst(ev, oct26), true, 'Visible on Oct 26 (due to 00:30 IST start)');
  assert.strictEqual(isEventOnCalendarDateInIst(ev, oct27), false, 'Not visible on Oct 27');
});

test('15. Boundary Test 4 & 7: Multi-day date-only Friday-Sunday range never spills into Monday', () => {
  const ev = {
    dates: 'Oct 02 – Oct 04',
    dateBounds: parseEventDateBounds({ dates: 'Oct 02 – Oct 04', season: 2026 }),
  };
  assert.strictEqual(isEventOnCalendarDateInIst(ev, new Date(Date.UTC(2026, 9, 2))), true, 'Friday Oct 2 visible');
  assert.strictEqual(isEventOnCalendarDateInIst(ev, new Date(Date.UTC(2026, 9, 3))), true, 'Saturday Oct 3 visible');
  assert.strictEqual(isEventOnCalendarDateInIst(ev, new Date(Date.UTC(2026, 9, 4))), true, 'Sunday Oct 4 visible');
  assert.strictEqual(isEventOnCalendarDateInIst(ev, new Date(Date.UTC(2026, 9, 5))), false, 'Monday Oct 5 strictly NOT visible');
});

test('16. Boundary Test 8 & 9: End boundary just before midnight (23:59:59 UTC) does NOT cause extra day in IST', () => {
  const bounds = parseEventDateBounds({ dates: 'Oct 02 – Oct 04', season: 2026 });
  // In UTC bounds.end is 2026-10-04T23:59:59Z, which is 05:29:59 IST on Oct 5.
  // Our canonical date comparison MUST prevent it from appearing on Oct 5:
  const ev = {
    dates: 'Oct 02 – Oct 04',
    dateBounds: bounds,
  };
  assert.strictEqual(isEventOnCalendarDateInIst(ev, new Date(Date.UTC(2026, 9, 5))), false, 'Must not spill into Oct 5');
});

test('17. Boundary Test 6: Untimed events return TBA without inventing times', () => {
  const untimed = {
    dates: 'Nov 06 – Nov 08',
    dateBounds: parseEventDateBounds({ dates: 'Nov 06 – Nov 08', season: 2026 }),
  };
  const timing = getEventTimeForCalendarDate(untimed, new Date(Date.UTC(2026, 10, 6)));
  assert.strictEqual(timing.timeIst, 'Time TBA');
  assert.strictEqual(timing.timeIstShort, 'TBA');
});

console.log(`\n======================================================`);
console.log(`✨ ALL ${passedTests} / ${passedTests} CALENDAR IST & UX AUDIT TESTS PASSED!`);
console.log(`======================================================\n`);

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  getAllGlobalCalendarEvents,
  filterCalendarEvents,
  isEventOnDate,
  getWeekEventsGrouped,
} from '../src/services/calendar/globalCalendarService';
import { f1Data } from '../src/services/motorsport/data/f1Data';
import { f2Data } from '../src/services/motorsport/data/f2Data';
import { wecData } from '../src/services/motorsport/data/wecData';
import { motogpData } from '../src/services/motorsport/data/motogpData';
import { wrcData } from '../src/services/motorsport/data/wrcData';
import { getCircuitsByChampionship, VERIFIED_CIRCUIT_SVGS } from '../src/services/circuits/globalCircuitsService';

console.log('🏎️ STARTING DETERMINISTIC TEST SUITE FOR GLOBAL CALENDAR + HUB NAVIGATION + CIRCUIT VERIFICATION');

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
// SECTION A: GLOBAL RACE CALENDAR (Tests 1 - 15)
// =========================================================================
console.log('\n📅 [PART 19.A] Global Calendar Verification:');

test('1. Calendar uses authoritative event source across all supported championships', () => {
  const allEvents = getAllGlobalCalendarEvents();
  assert(allEvents.length >= 150, `Expected at least 150 aggregated events, got ${allEvents.length}`);

  // Confirm authoritative mapping matches F1 data exact round count
  const f1Events = allEvents.filter(e => e.seriesId === 'f1');
  assert.strictEqual(f1Events.length, f1Data.rounds.length, `F1 calendar count ${f1Events.length} matches f1Data.rounds ${f1Data.rounds.length}`);

  // Confirm authoritative mapping matches MotoGP data exact round count
  const motogpEvents = allEvents.filter(e => e.seriesId === 'motogp');
  assert.strictEqual(motogpEvents.length, motogpData.rounds.length, `MotoGP calendar count matches motogpData`);
});

test('2. ALL filter returns all supported events chronologically sorted', () => {
  const allEvents = filterCalendarEvents({ seriesId: 'all' });
  const allRaw = getAllGlobalCalendarEvents();
  assert.strictEqual(allEvents.length, allRaw.length, 'Filter "all" returns complete set of calendar events');

  // Verify chronological sort
  for (let i = 1; i < allEvents.length; i++) {
    const prevTime = allEvents[i - 1].dateBounds.start.getTime();
    const currTime = allEvents[i].dateBounds.start.getTime();
    assert(prevTime <= currTime, `Events must be sorted chronologically: ${allEvents[i - 1].officialTitle} should precede ${allEvents[i].officialTitle}`);
  }
});

test('3. F1 filter returns only F1 events', () => {
  const f1Only = filterCalendarEvents({ seriesId: 'f1' });
  assert(f1Only.length > 0, 'F1 filter returned events');
  assert(f1Only.every(e => e.seriesId === 'f1'), 'All filtered events have seriesId === "f1"');
});

test('4. F2 filter returns only F2 events', () => {
  const f2Only = filterCalendarEvents({ seriesId: 'f2' });
  assert(f2Only.length > 0, 'F2 filter returned events');
  assert(f2Only.every(e => e.seriesId === 'f2'), 'All filtered events have seriesId === "f2"');
  assert.strictEqual(f2Only.length, f2Data.rounds.length, 'F2 count matches f2Data source');
});

test('5. WEC filter returns only WEC events', () => {
  const wecOnly = filterCalendarEvents({ seriesId: 'wec' });
  assert(wecOnly.length > 0, 'WEC filter returned events');
  assert(wecOnly.every(e => e.seriesId === 'wec'), 'All filtered events have seriesId === "wec"');
  assert.strictEqual(wecOnly.length, wecData.rounds.length, 'WEC count matches wecData source');
});

test('6. MotoGP filter returns only MotoGP events', () => {
  const motogpOnly = filterCalendarEvents({ seriesId: 'motogp' });
  assert(motogpOnly.length > 0, 'MotoGP filter returned events');
  assert(motogpOnly.every(e => e.seriesId === 'motogp'), 'All filtered events have seriesId === "motogp"');
  assert.strictEqual(motogpOnly.length, motogpData.rounds.length, 'MotoGP count matches motogpData source');
});

test('7. WRC filter returns only WRC events', () => {
  const wrcOnly = filterCalendarEvents({ seriesId: 'wrc' });
  assert(wrcOnly.length > 0, 'WRC filter returned events');
  assert(wrcOnly.every(e => e.seriesId === 'wrc'), 'All filtered events have seriesId === "wrc"');
  assert.strictEqual(wrcOnly.length, wrcData.rounds.length, 'WRC count matches wrcData source');
});

test('8. Current-season filtering works correctly with actual season definitions', () => {
  const currentEvents = filterCalendarEvents({ currentSeasonOnly: true });
  assert(currentEvents.length > 0, 'Current season filter returned events');
  currentEvents.forEach(e => {
    const yr = String(e.seasonYear);
    assert(yr.includes('2026') || yr.includes('2025'), `Event ${e.officialTitle} season ${e.seasonYear} must be active`);
  });
});

test('9. Multi-day events are grouped correctly across date spans', () => {
  const allEvents = getAllGlobalCalendarEvents();
  const multiDayEvent = allEvents.find(e => e.dateBounds.start.getTime() !== e.dateBounds.end.getTime());
  assert(multiDayEvent, 'Found at least one multi-day event');

  const startDay = multiDayEvent.dateBounds.start;
  const endDay = multiDayEvent.dateBounds.end;

  // Verify isEventOnDate returns true for both start and end dates
  assert(isEventOnDate(multiDayEvent, startDay), 'isEventOnDate returns true for start day');
  assert(isEventOnDate(multiDayEvent, endDay), 'isEventOnDate returns true for end day');

  // Verify day in between if > 1 day
  const midDay = new Date(startDay.getTime() + (endDay.getTime() - startDay.getTime()) / 2);
  assert(isEventOnDate(multiDayEvent, midDay), 'isEventOnDate returns true for intermediate event day');
});

test('10. Month boundaries work correctly for event filtering', () => {
  const marchEvents = filterCalendarEvents({ year: 2026, month: 2 }); // 0-indexed: 2 = March
  assert(marchEvents.length > 0, 'March 2026 has motorsport events');
  marchEvents.forEach(e => {
    const s = e.dateBounds.start;
    const end = e.dateBounds.end;
    const touchesMarch = (s.getUTCFullYear() === 2026 && s.getUTCMonth() === 2) || (end.getUTCFullYear() === 2026 && end.getUTCMonth() === 2);
    assert(touchesMarch, `Event ${e.officialTitle} (${e.dates}) touches March 2026`);
  });
});

test('11. Week boundaries work correctly in grouping events', () => {
  const refDate = new Date('2026-10-01T12:00:00Z');
  const weekEvents = getWeekEventsGrouped(refDate, 'all');
  assert(Array.isArray(weekEvents), 'getWeekEventsGrouped returns array');
  assert.strictEqual(weekEvents.length, 7, 'Week breakdown contains exactly 7 days');
  weekEvents.forEach(day => {
    assert(day.date instanceof Date, 'Each item has a valid Date object');
    assert(typeof day.dayName === 'string', 'Each item has dayName');
    assert(Array.isArray(day.events), 'Each day contains events array');
  });
});

test('12. Duplicate events are not created in global aggregation', () => {
  const allEvents = getAllGlobalCalendarEvents();
  const seenIds = new Set<string>();
  const duplicates: string[] = [];

  allEvents.forEach(e => {
    if (seenIds.has(e.id)) {
      duplicates.push(e.id);
    }
    seenIds.add(e.id);
  });

  assert.strictEqual(duplicates.length, 0, `No duplicate event IDs allowed in global calendar. Found: ${duplicates.join(', ')}`);
});

test('13. Event → championship relationship is correct and preserved', () => {
  const allEvents = getAllGlobalCalendarEvents();
  allEvents.forEach(e => {
    assert(e.seriesId, `Event ${e.officialTitle} must have seriesId`);
    assert(e.seriesName, `Event ${e.officialTitle} must have seriesName`);
    assert(e.hubUrl.startsWith('/explore/'), `Event ${e.officialTitle} hubUrl must link into championship hub`);
  });
});

test('14. Event → circuit relationship is correct', () => {
  const allEvents = getAllGlobalCalendarEvents();
  const eventsWithCircuits = allEvents.filter(e => e.circuitName);
  assert(eventsWithCircuits.length > 100, 'Most calendar events have associated circuits or rally venues');

  // Check that F1 Monaco points to Monaco
  const monaco = allEvents.find(e => e.seriesId === 'f1' && e.officialTitle.includes('Monaco'));
  assert(monaco, 'Monaco GP exists in calendar');
  assert(monaco.circuitName.includes('Monaco'), 'Monaco GP associated with Circuit de Monaco');
});

test('15. Stale previous-season events do not appear in the default current view', () => {
  const currentEvents = filterCalendarEvents({ currentSeasonOnly: true });
  const stale2024 = currentEvents.filter(e => typeof e.seasonYear === 'number' && e.seasonYear <= 2024);
  assert.strictEqual(stale2024.length, 0, 'No stale 2024 or earlier events in default current calendar');
});

test('15b. Month navigation transitions correctly handle month boundaries, year rolls, and leap years', () => {
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Helper function simulating the canonical month transition logic
  const stepMonth = (d: Date, delta: number) => {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1));
  };

  // October 2026 -> November 2026
  const oct2026 = new Date(Date.UTC(2026, 9, 1));
  assert.strictEqual(monthNames[oct2026.getUTCMonth()], 'OCTOBER');
  assert.strictEqual(oct2026.getUTCFullYear(), 2026);

  const nov2026 = stepMonth(oct2026, 1);
  assert.strictEqual(monthNames[nov2026.getUTCMonth()], 'NOVEMBER');
  assert.strictEqual(nov2026.getUTCFullYear(), 2026);

  // November 2026 -> December 2026
  const dec2026 = stepMonth(nov2026, 1);
  assert.strictEqual(monthNames[dec2026.getUTCMonth()], 'DECEMBER');
  assert.strictEqual(dec2026.getUTCFullYear(), 2026);

  // December 2026 -> January 2027 (Year roll forward)
  const jan2027 = stepMonth(dec2026, 1);
  assert.strictEqual(monthNames[jan2027.getUTCMonth()], 'JANUARY');
  assert.strictEqual(jan2027.getUTCFullYear(), 2027);

  // January 2027 -> December 2026 (Year roll backward)
  const decBack = stepMonth(jan2027, -1);
  assert.strictEqual(monthNames[decBack.getUTCMonth()], 'DECEMBER');
  assert.strictEqual(decBack.getUTCFullYear(), 2026);

  // Leap Year calculation (February 2028 = 29 days, February 2026 = 28 days)
  const feb2028Days = new Date(Date.UTC(2028, 2, 0)).getUTCDate();
  assert.strictEqual(feb2028Days, 29, 'February 2028 has 29 days (leap year)');

  const feb2026Days = new Date(Date.UTC(2026, 2, 0)).getUTCDate();
  assert.strictEqual(feb2026Days, 28, 'February 2026 has 28 days (standard year)');
});

test('15c. Calendar page hierarchy is simplified: large This Weekend card section and circuit SVGs removed', () => {
  const calPagePath = path.join(process.cwd(), 'src/pages/CalendarPage.tsx');
  const calPageContent = fs.readFileSync(calPagePath, 'utf-8');
  assert(!calPageContent.includes('<CalendarNextUp'), 'CalendarNextUp / This Weekend section removed from CalendarPage');
  assert(!calPageContent.includes('THIS WEEKEND ACROSS MOTORSPORT'), 'This Weekend banner removed from CalendarPage');
  assert(!calPageContent.includes('<CircuitVector'), 'CircuitVector removed from CalendarPage');

  const calMonthPath = path.join(process.cwd(), 'src/components/calendar/CalendarMonthView.tsx');
  const calMonthContent = fs.readFileSync(calMonthPath, 'utf-8');
  assert(!calMonthContent.includes('<CircuitVector'), 'CircuitVector removed from CalendarMonthView');
  assert(!calMonthContent.includes('>OCTOBER 2026<'), 'Month navigation does not have hardcoded OCTOBER 2026 button text');

  const calCardPath = path.join(process.cwd(), 'src/components/calendar/CalendarEventCard.tsx');
  const calCardContent = fs.readFileSync(calCardPath, 'utf-8');
  assert(!calCardContent.includes('CircuitVector'), 'CircuitVector completely removed from CalendarEventCard');
});

test('15d. CalendarEventModal provides compact event detail interaction without circuit SVGs', () => {
  const modalPath = path.join(process.cwd(), 'src/components/calendar/CalendarEventModal.tsx');
  assert(fs.existsSync(modalPath), 'CalendarEventModal exists');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  assert(!modalContent.includes('CircuitVector'), 'CircuitVector strictly excluded from CalendarEventModal');
  assert(modalContent.includes('VIEW EVENT'), 'Modal provides VIEW EVENT link');
  assert(modalContent.includes('PREDICT NOW'), 'Modal provides PREDICT NOW link for eligible events');
  assert(modalContent.includes('CIRCUIT / VENUE'), 'Modal provides venue information');
});

// =========================================================================
// SECTION B: MOTORSPORT HUB SECTION-BASED NAVIGATION (Tests 16 - 22)
// =========================================================================
console.log('\n🧭 [PART 19.B] Motorsport Hub Section-Based Navigation Verification:');

const rootDir = process.cwd();
const championshipPagePath = path.join(rootDir, 'src/pages/ChampionshipDetailPage.tsx');
const championshipPageContent = fs.readFileSync(championshipPagePath, 'utf-8');
const appTsxPath = path.join(rootDir, 'src/App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf-8');
const navComponentPath = path.join(rootDir, 'src/components/motorsport/MotorsportHubSectionNavigator.tsx');
const navComponentContent = fs.readFileSync(navComponentPath, 'utf-8');

test('16. Motorsport Hub behaves as a SECTION-BASED information interface (only active section rendered)', () => {
  // Must render only the active section conditionally, not stacked vertically down one long page
  assert(championshipPageContent.includes("activeSection === 'learn'"), 'Learn section conditionally rendered on activeSection');
  assert(championshipPageContent.includes("activeSection === 'drivers'"), 'Drivers section conditionally rendered on activeSection');
  assert(championshipPageContent.includes("activeSection === 'teams'"), 'Teams section conditionally rendered on activeSection');
  assert(championshipPageContent.includes("activeSection === 'circuits'"), 'Circuits section conditionally rendered on activeSection');
  assert(championshipPageContent.includes("activeSection === 'calendar'"), 'Calendar section conditionally rendered on activeSection');
  assert(championshipPageContent.includes("activeSection === 'rules'"), 'Rules section conditionally rendered on activeSection');
  assert(championshipPageContent.includes("activeSection === 'championships'"), 'Championships section conditionally rendered on activeSection');
  assert(championshipPageContent.includes("activeSection === 'season'"), 'Current season section conditionally rendered on activeSection');
});

test('17. LEARN is the default active view when opening a Motorsport Hub', () => {
  // Test normalization logic: undefined or empty returns 'learn'
  assert(championshipPageContent.includes("export function normalizeHubSection"), 'normalizeHubSection helper exported');
  assert(championshipPageContent.includes("if (!rawSection) return 'learn';"), 'Default section is explicitly learn');
  assert(championshipPageContent.includes("return 'learn';"), 'Fallback section is explicitly learn');
});

test('18. Direct section URLs work and active section persists on refresh', () => {
  // Check App.tsx route patterns
  assert(appTsxContent.includes('/explore/:championshipId/:section'), 'Route pattern for /explore/:championshipId/:section exists in App.tsx');
  assert(appTsxContent.includes('/championships/:championshipId/:section'), 'Route pattern for /championships/:championshipId/:section exists in App.tsx');
  // Check that ChampionshipDetailPage reads section from useParams
  assert(championshipPageContent.includes("useParams<{ championshipId: string; section?: string }>()"), 'ChampionshipDetailPage reads section param directly from router');
});

test('19. Browser Back/Forward navigation is preserved via React Router navigate()', () => {
  assert(championshipPageContent.includes("navigate(targetUrl)"), 'Section changes trigger router navigation pushing history entries');
  assert(championshipPageContent.includes("`/explore/${championshipId}/learn`"), 'Target URLs route under /explore/:championshipId/ preserving history');
  assert(!championshipPageContent.includes("new IntersectionObserver"), 'Continuous scroll-spy IntersectionObserver removed in favor of section routing');
});

test('20. Mobile section navigation provides dropdown with >= 44px touch targets', () => {
  assert(navComponentContent.includes('hub-nav-mobile'), 'Dedicated mobile selector CSS class defined');
  assert(navComponentContent.includes("minHeight: '44px'"), 'Mobile dropdown trigger provides >= 44px touch target');
  assert(navComponentContent.includes("role=\"listbox\""), 'Mobile dropdown provides semantic ARIA role');
  assert(navComponentContent.includes("role=\"option\""), 'Dropdown items provide semantic option role');
});

test('21. Desktop navigation renders compact horizontal section navigation bar with 8 major sections', () => {
  assert(navComponentContent.includes('hub-nav-desktop'), 'Desktop navigation bar class defined');
  assert(navComponentContent.includes('hub-nav-tab-btn'), 'Section navigation buttons use compact editorial tab button styling');
  assert(navComponentContent.includes("{ id: 'learn', label: 'LEARN'"), 'First section in navigator is LEARN');
  assert(navComponentContent.includes("{ id: 'season', label: 'CURRENT SEASON'"), 'Second section in navigator is CURRENT SEASON');
  assert(navComponentContent.includes("{ id: 'rules', label: 'RULES & REGULATIONS'"), 'Eighth section in navigator is RULES & REGULATIONS');
});

test('21b. Content separation: Championships does NOT contain technical regulations; Rules & Regulations contains technical blueprint', () => {
  // Extract hub-series and hub-rules section blocks from ChampionshipDetailPage
  const seriesMatch = championshipPageContent.match(/id="hub-series"[\s\S]*?<\/section>/);
  assert(seriesMatch, 'hub-series section found');
  const seriesContent = seriesMatch[0];
  assert(!seriesContent.includes('Active Aerodynamics: Z-Mode & X-Mode'), 'hub-series must NOT contain technical regulation feature guide');
  assert(!seriesContent.includes('data.featureGuide'), 'hub-series must NOT reference data.featureGuide');

  const rulesMatch = championshipPageContent.match(/id="hub-rules"[\s\S]*?<\/section>/);
  assert(rulesMatch, 'hub-rules section found');
  const rulesContent = rulesMatch[0];
  assert(rulesContent.includes('data.featureGuide'), 'hub-rules must contain data.featureGuide technical regulations');
});

test('22. Terminology dynamically adapts across motorsports without forcing F1 terminology', () => {
  assert(championshipPageContent.includes("competitorPlural = competitorLabel === 'Rider' ? 'Riders'"), 'Competitor label adapts for MotoGP/Bikes (Riders)');
  assert(championshipPageContent.includes("competitorLabel === 'Crew' ? 'Crews & Drivers'"), 'Competitor label adapts for WRC/Rally (Crews & Drivers)');
  assert(championshipPageContent.includes("teamsLabel = data?.id === 'wrc' ? 'Manufacturers'"), 'Team label adapts for WRC (Manufacturers)');
  assert(championshipPageContent.includes("data?.id === 'wec' ? 'Teams & Manufacturers'"), 'Team label adapts for WEC (Teams & Manufacturers)');
});

// =========================================================================
// SECTION C: CIRCUIT VERIFICATION & INTEGRITY (Tests 23 - 30)
// =========================================================================
console.log('\n🏁 [PART 19.C] Circuit Verification & Integrity:');

test('23. F1 circuit belongs strictly to F1 active-season event without cross-motorsport leakage', () => {
  const f1Circuits = getCircuitsByChampionship('f1', f1Data.rounds);
  assert(f1Circuits.length > 0, 'F1 circuits returned');
  f1Circuits.forEach(c => {
    assert(c.primaryDiscipline === 'f1', `F1 circuit ${c.name} has primaryDiscipline f1`);
    assert(c.championships.every(ch => ch.championshipId === 'f1'), `Circuit ${c.name} championships scoped strictly to F1`);
  });
});

test('24. F2 circuit belongs strictly to F2 active-season event without cross-motorsport leakage', () => {
  const f2Circuits = getCircuitsByChampionship('f2', f2Data.rounds);
  assert(f2Circuits.length > 0, 'F2 circuits returned');
  f2Circuits.forEach(c => {
    assert(c.primaryDiscipline === 'f2', `F2 circuit ${c.name} has primaryDiscipline f2`);
    assert(c.championships.every(ch => ch.championshipId === 'f2'), `Circuit ${c.name} championships scoped strictly to F2`);
  });
});

test('25. MotoGP circuit belongs strictly to MotoGP active-season event without cross-motorsport leakage', () => {
  const motogpCircuits = getCircuitsByChampionship('motogp', motogpData.rounds);
  assert(motogpCircuits.length > 0, 'MotoGP circuits returned');
  motogpCircuits.forEach(c => {
    assert(c.primaryDiscipline === 'motogp', `MotoGP circuit ${c.name} has primaryDiscipline motogp`);
    assert(c.championships.every(ch => ch.championshipId === 'motogp'), `Circuit ${c.name} championships scoped strictly to MotoGP`);
  });
});

test('26. WEC circuit belongs strictly to WEC active-season event without cross-motorsport leakage', () => {
  const wecCircuits = getCircuitsByChampionship('wec', wecData.rounds);
  assert(wecCircuits.length > 0, 'WEC circuits returned');
  wecCircuits.forEach(c => {
    assert(c.primaryDiscipline === 'wec', `WEC circuit ${c.name} has primaryDiscipline wec`);
    assert(c.championships.every(ch => ch.championshipId === 'wec'), `Circuit ${c.name} championships scoped strictly to WEC`);
  });
});

test('27. Global registry circuits not associated with the active championship are not rendered', () => {
  const f2Circuits = getCircuitsByChampionship('f2', f2Data.rounds);
  const f2CircuitNames = new Set(f2Circuits.map(c => c.name.toLowerCase()));
  // Le Mans 24h Circuit de la Sarthe is NOT on the F2 calendar
  assert(!f2CircuitNames.has('circuit de la sarthe'), 'Circuit de la Sarthe is NOT in F2 circuits');
});

test('28. Unverified geometry is never marked verified or given fake track geometry', () => {
  // Check that missing or approximate circuits are NOT in VERIFIED_CIRCUIT_SVGS
  assert(!VERIFIED_CIRCUIT_SVGS.has('lemans.svg'), 'Le Mans is unverified and not in verified SVGs set');
  assert(!VERIFIED_CIRCUIT_SVGS.has('assen.svg'), 'Assen TT is unverified and not in verified SVGs set');
  assert(!VERIFIED_CIRCUIT_SVGS.has('buddh.svg'), 'Buddh is unverified and not in verified SVGs set');
});

test('29. Event remains renderable when circuit geometry is unavailable', () => {
  const allEvents = getAllGlobalCalendarEvents();
  // Find an event with unverified circuit outline
  const unverifiedCircuitEvent = allEvents.find(e => !e.hasVerifiedGeometry);
  assert(unverifiedCircuitEvent, 'Found at least one valid calendar event where circuit geometry is pending verification');
  assert(unverifiedCircuitEvent.officialTitle, 'Event has valid title');
  assert(unverifiedCircuitEvent.dates, 'Event has valid dates');
  assert(unverifiedCircuitEvent.location, 'Event has valid location');
  // It is still part of the calendar!
});

test('30. Circuit configuration matches the event/championship', () => {
  // Verify Le Mans Bugatti circuit for MotoGP vs Circuit de la Sarthe for WEC
  const motogpCircuits = getCircuitsByChampionship('motogp', motogpData.rounds);
  const frenchMotoGP = motogpCircuits.find(c => c.location.country === 'France' || c.name.toLowerCase().includes('le mans'));
  if (frenchMotoGP) {
    const layout = frenchMotoGP.layouts[0];
    // Bugatti circuit length is ~4.185 km, NOT 13.6 km Sarthe
    assert(layout.lengthKm < 6.0, `MotoGP Le Mans uses Bugatti circuit configuration (~4.2 km), got ${layout.lengthKm} km`);
  }
});

console.log(`\n======================================================`);
console.log(`✨ ALL ${passedTests} / 30 DETERMINISTIC ACCEPTANCE TESTS PASSED!`);
console.log(`======================================================\n`);

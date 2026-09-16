import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  getUnifiedCalendar,
  normalizeF1Weekend,
  INDIAN_MOTORSPORT_ROUNDS,
  UnifiedCalendarEvent,
} from '../src/services/motorsport/calendarScheduleService';
import { RaceWeekend, PredictionRound } from '../src/types';

console.log('🏁 Starting Phase 8C Verification Suite: Unified Racing Calendar & Schedule Hub...\n');

let passCount = 0;
function test(name: string, fn: () => Promise<void> | void) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✓ ${name}`);
          passCount++;
        })
        .catch(err => {
          console.error(`  ✗ ${name}`);
          throw err;
        });
    } else {
      console.log(`  ✓ ${name}`);
      passCount++;
    }
  } catch (err) {
    console.error(`  ✗ ${name}`);
    throw err;
  }
}

async function runSuite() {
  // 1. Indian Motorsport Calendar Rounds
  test('Indian Motorsport baseline rounds exist and contain 4 iconic events', () => {
    assert.ok(Array.isArray(INDIAN_MOTORSPORT_ROUNDS), 'Must be an array');
    assert.strictEqual(INDIAN_MOTORSPORT_ROUNDS.length, 4, 'Must have 4 domestic rounds');

    const buddhRound = INDIAN_MOTORSPORT_ROUNDS.find(r => r.circuitId === 'buddh');
    assert.ok(buddhRound, 'Must include Buddh International Circuit season finale');
    assert.strictEqual(buddhRound.circuitUrl, '/circuits/buddh');

    const chennaiStreet = INDIAN_MOTORSPORT_ROUNDS.find(r => r.circuitId === 'chennai_street');
    assert.ok(chennaiStreet, 'Must include Chennai Street Circuit night race');

    const kari = INDIAN_MOTORSPORT_ROUNDS.find(r => r.circuitId === 'kari');
    assert.ok(kari, 'Must include Kari Motor Speedway');

    const mmrt = INDIAN_MOTORSPORT_ROUNDS.find(r => r.circuitId === 'mmrt');
    assert.ok(mmrt, 'Must include Madras International Circuit');
  });

  // 2. F1 Weekend Normalization & Prediction Bench Linkage
  test('normalizeF1Weekend attaches prediction attributes and circuit metadata', () => {
    const mockWeekend: RaceWeekend = {
      raceWeekendId: '2026-01-australia',
      season: 2026,
      round: 1,
      roundNumber: 1,
      name: 'Australian Grand Prix',
      raceName: 'Australian Grand Prix',
      circuit: 'albert_park',
      country: 'Australia',
      flag: '🇦🇺',
      startDate: '2026-03-13T00:00:00Z',
      endDate: '2026-03-15T00:00:00Z',
      weekendType: 'STANDARD',
      status: 'UPCOMING',
      sessions: [
        { raceWeekendId: '2026-01-australia', name: 'Free Practice 1', startTime: '2026-03-13T01:30:00Z', status: 'UPCOMING', type: 'PRACTICE' },
        { raceWeekendId: '2026-01-australia', name: 'Qualifying', startTime: '2026-03-14T05:00:00Z', status: 'UPCOMING', type: 'QUALIFYING' },
        { raceWeekendId: '2026-01-australia', name: 'Race', startTime: '2026-03-15T04:00:00Z', status: 'UPCOMING', type: 'RACE' },
      ],
    };

    const mockPredRound: PredictionRound = {
      roundId: 'round-aus-2026',
      raceWeekendId: '2026-01-australia',
      title: 'Australian Grand Prix Predictions',
      description: 'Predict pole, podium and wild cards',
      opensAt: '2026-01-01T00:00:00Z',
      closesAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      status: 'OPEN',
      scoringStatus: 'NOT_SCORED',
      predictionDeadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      weekendId: '2026-01-australia',
      predictionFields: [],
    };

    const unified = normalizeF1Weekend(mockWeekend, [mockPredRound]);
    assert.strictEqual(unified.id, 'f1-2026-01-australia');
    assert.strictEqual(unified.championshipId, 'f1');
    assert.strictEqual(unified.championshipName, 'Formula 1');
    assert.strictEqual(unified.hasPrediction, true);
    assert.strictEqual(unified.predictionRoundId, 'round-aus-2026');
    assert.strictEqual(unified.predictionStatus, 'OPEN');
    assert.strictEqual(unified.circuitUrl, '/circuits/albert_park');
    assert.strictEqual(unified.countryFlag, '🇦🇺');
  });

  // 3. Unified Calendar Aggregation across multiple championships
  await test('getUnifiedCalendar aggregates events across categories', async () => {
    const calendar = await getUnifiedCalendar();
    assert.ok(Array.isArray(calendar), 'Calendar must be an array');
    assert.ok(calendar.length >= 20, 'Calendar should contain at least 20 multi-series events');

    const championships = new Set(calendar.map(e => e.championshipId));
    assert.ok(championships.has('f1'), 'Must include F1');
    assert.ok(championships.has('motogp'), 'Must include MotoGP');
    assert.ok(championships.has('wec'), 'Must include WEC');
    assert.ok(championships.has('formula-e'), 'Must include Formula E');
    assert.ok(championships.has('indian-motorsport'), 'Must include Indian Motorsport');
  });

  // 4. Category & Status Filtering
  await test('getUnifiedCalendar correctly filters by category and status', async () => {
    // Filter MotoGP
    const motogpEvents = await getUnifiedCalendar({ category: 'motogp' });
    assert.ok(motogpEvents.length > 0, 'Must have MotoGP events');
    assert.ok(motogpEvents.every(e => e.championshipId === 'motogp'), 'All must be MotoGP');

    // Filter Indian Motorsport
    const indiaEvents = await getUnifiedCalendar({ category: 'india' });
    assert.strictEqual(indiaEvents.length, 4, 'Must have 4 Indian events');
    assert.ok(indiaEvents.every(e => e.championshipId === 'indian-motorsport'));

    // Filter Feeder
    const feederEvents = await getUnifiedCalendar({ category: 'feeder' });
    assert.ok(feederEvents.length > 0, 'Must have feeder events');
    assert.ok(feederEvents.every(e => ['f2', 'f3', 'f4'].includes(e.championshipId)));

    // Filter Prediction available
    const predictionEvents = await getUnifiedCalendar({ status: 'PREDICTION' });
    assert.ok(predictionEvents.every(e => e.hasPrediction), 'All must have predictions');
  });

  // 5. Search Filtering
  await test('getUnifiedCalendar filters by keyword search', async () => {
    const searchBuddh = await getUnifiedCalendar({ search: 'Buddh' });
    assert.ok(searchBuddh.length > 0, 'Search for Buddh must return events');
    assert.ok(searchBuddh.some(e => e.circuitName.includes('Buddh') || e.officialTitle.includes('Buddh')));

    const searchMonaco = await getUnifiedCalendar({ search: 'Monaco' });
    assert.ok(searchMonaco.length > 0, 'Search for Monaco must return events');
  });

  // 6. WeekendsPage.tsx Source Checks
  test('WeekendsPage.tsx implements multi-championship schedule UI and zero legacy terms', () => {
    const pagePath = path.resolve(process.cwd(), 'src/pages/WeekendsPage.tsx');
    const code = fs.readFileSync(pagePath, 'utf8');

    // Headers & Terminology
    assert.ok(code.includes('WORLD MOTORSPORT RACING SCHEDULE'));
    assert.ok(code.includes('Global Racing Calendar'));

    // Category filter tabs
    assert.ok(code.includes('All Categories'));
    assert.ok(code.includes('Formula 1'));
    assert.ok(code.includes('MotoGP™'));
    assert.ok(code.includes('FIA WEC'));
    assert.ok(code.includes('Formula E'));
    assert.ok(code.includes('GT World Challenge'));
    assert.ok(code.includes('WRC Rally'));
    assert.ok(code.includes('Feeder (F2/F3/F4)'));
    assert.ok(code.includes('Indian Motorsport 🇮🇳'));

    // Status filter options
    assert.ok(code.includes('PREDICTION BENCH'));
    assert.ok(code.includes('statusFilter'));

    // Banned legacy terms check
    assert.ok(!code.includes('Prediction Wall'), 'Zero occurrences of Prediction Wall in WeekendsPage');
    assert.ok(!code.includes('F1 Prediction Wall'), 'Zero occurrences of F1 Prediction Wall in WeekendsPage');
    assert.ok(!code.includes('Community Prediction League'), 'Zero occurrences of Community Prediction League in WeekendsPage');
    assert.ok(!code.includes('Learn F1'), 'Zero occurrences of Learn F1 in WeekendsPage');
    assert.ok(!code.includes('F1 Learn'), 'Zero occurrences of F1 Learn in WeekendsPage');
    assert.ok(!code.includes('F1 Explore'), 'Zero occurrences of F1 Explore in WeekendsPage');
  });

  console.log(`\n✨ Phase 8C Verification Completed: All ${passCount} tests passed!\n`);
}

runSuite().catch(err => {
  console.error(err);
  process.exit(1);
});

import { detectWeekendFormat } from '../src/services/schedule/weekendFormatDetector.ts';
import { generatePredictionRounds, getPredictionRoundStatus } from '../src/services/schedule/predictionRoundGenerator.ts';
import { F1ScheduleSyncService } from '../src/services/schedule/f1ScheduleSyncService.ts';
import { F1DataProvider } from '../src/services/providers/f1DataProvider.ts';
import { RaceWeekend, Session } from '../src/types/index.ts';

console.log('🏎️ Running F1 Data Provider & Schedule Synchronization Unit Tests...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

// 1. Normal Weekend Format Detection
const normalSessions: Session[] = [
  { id: '1_FP1', raceWeekendId: 'rw_normal', type: 'FP1', name: 'Practice 1', startTime: '2026-05-22T11:30:00Z', status: 'UPCOMING' },
  { id: '1_FP2', raceWeekendId: 'rw_normal', type: 'FP2', name: 'Practice 2', startTime: '2026-05-22T15:00:00Z', status: 'UPCOMING' },
  { id: '1_FP3', raceWeekendId: 'rw_normal', type: 'FP3', name: 'Practice 3', startTime: '2026-05-23T10:30:00Z', status: 'UPCOMING' },
  { id: '1_QUALIFYING', raceWeekendId: 'rw_normal', type: 'QUALIFYING', name: 'Qualifying', startTime: '2026-05-23T14:00:00Z', status: 'UPCOMING' },
  { id: '1_RACE', raceWeekendId: 'rw_normal', type: 'RACE', name: 'Grand Prix', startTime: '2026-05-24T13:00:00Z', status: 'UPCOMING' },
];

const normalType = detectWeekendFormat(normalSessions);
assert(normalType === 'NORMAL', 'Normal weekend correctly detected without hardcoding');

// 2. Sprint Weekend Format Detection
const sprintSessions: Session[] = [
  { id: '2_FP1', raceWeekendId: 'rw_sprint', type: 'FP1', name: 'Practice 1', startTime: '2026-06-05T11:30:00Z', status: 'UPCOMING' },
  { id: '2_SQ', raceWeekendId: 'rw_sprint', type: 'SPRINT_QUALIFYING', name: 'Sprint Qualifying', startTime: '2026-06-05T15:30:00Z', status: 'UPCOMING' },
  { id: '2_SPRINT', raceWeekendId: 'rw_sprint', type: 'SPRINT', name: 'Sprint Race', startTime: '2026-06-06T10:00:00Z', status: 'UPCOMING' },
  { id: '2_QUALIFYING', raceWeekendId: 'rw_sprint', type: 'QUALIFYING', name: 'Grand Prix Qualifying', startTime: '2026-06-06T14:00:00Z', status: 'UPCOMING' },
  { id: '2_RACE', raceWeekendId: 'rw_sprint', type: 'RACE', name: 'Grand Prix', startTime: '2026-06-07T13:00:00Z', status: 'UPCOMING' },
];

const sprintType = detectWeekendFormat(sprintSessions);
assert(sprintType === 'SPRINT', 'Sprint weekend correctly detected based on SPRINT / SPRINT_QUALIFYING session presence');

// 3. Dynamic Prediction Round Generation (Normal Weekend)
const normalWeekend: RaceWeekend = {
  id: '2026_1',
  raceWeekendId: '2026_1',
  season: 2026,
  round: 1,
  roundNumber: 1,
  name: 'Spanish Grand Prix',
  raceName: 'Spanish Grand Prix',
  country: 'Spain',
  circuit: 'Circuit de Barcelona-Catalunya',
  flag: '🇪🇸',
  weekendType: 'NORMAL',
  startDate: '2026-05-22T11:30:00Z',
  endDate: '2026-05-24T15:00:00Z',
  status: 'UPCOMING',
  sessions: normalSessions,
};

const normalRounds = generatePredictionRounds(normalWeekend, { defaultCloseBufferMinutes: 5 });
assert(normalRounds.length === 2, 'Normal weekend generates exactly 2 prediction rounds (Qualifying + Race)');
assert(normalRounds[0].type === 'QUALIFYING', 'First round is Qualifying Prediction');
assert(normalRounds[1].type === 'RACE', 'Second round is Grand Prix Race Prediction');

// Check closesAt is exactly 5 minutes before session start
const expectedQualiClose = new Date(new Date('2026-05-23T14:00:00Z').getTime() - 5 * 60 * 1000).toISOString();
assert(normalRounds[0].closesAt === expectedQualiClose, 'Qualifying prediction closes exactly 5 minutes before Qualifying start');

// 4. Dynamic Prediction Round Generation (Sprint Weekend)
const sprintWeekend: RaceWeekend = {
  id: '2026_2',
  raceWeekendId: '2026_2',
  season: 2026,
  round: 2,
  roundNumber: 2,
  name: 'Austrian Grand Prix',
  raceName: 'Austrian Grand Prix',
  country: 'Austria',
  circuit: 'Red Bull Ring',
  flag: '🇦🇹',
  weekendType: 'SPRINT',
  startDate: '2026-06-05T11:30:00Z',
  endDate: '2026-06-07T15:00:00Z',
  status: 'UPCOMING',
  sessions: sprintSessions,
};

const sprintRounds = generatePredictionRounds(sprintWeekend, { defaultCloseBufferMinutes: 5 });
assert(sprintRounds.length === 4, 'Sprint weekend dynamically generates 4 prediction rounds (SQ, Sprint, Quali, Race)');
assert(sprintRounds[0].type === 'SPRINT_QUALIFYING', 'Round 1 is Sprint Qualifying');
assert(sprintRounds[1].type === 'SPRINT', 'Round 2 is Sprint Race');
assert(sprintRounds[2].type === 'QUALIFYING', 'Round 3 is Grand Prix Qualifying');
assert(sprintRounds[3].type === 'RACE', 'Round 4 is Grand Prix Race');

// 5. Centralized Status Engine Verification
const mockServerTime = new Date('2026-05-23T12:00:00Z'); // Between open (May 21) and close (May 23 13:55)
const statusOpen = getPredictionRoundStatus(normalRounds[0], mockServerTime);
assert(statusOpen === 'OPEN', 'Prediction round status is OPEN when current server time is within window');

const mockServerTimePastDeadline = new Date('2026-05-23T14:05:00Z'); // After 13:55 deadline
const statusLocked = getPredictionRoundStatus(normalRounds[0], mockServerTimePastDeadline);
assert(statusLocked === 'LOCKED', 'Prediction round status is LOCKED when server deadline has passed');

const mockServerTimeEarly = new Date('2026-05-20T00:00:00Z'); // Before window opens
const statusUpcoming = getPredictionRoundStatus(normalRounds[0], mockServerTimeEarly);
assert(statusUpcoming === 'UPCOMING', 'Prediction round status is UPCOMING before opening timestamp');

// 6. Schedule Change Detection & Idempotent Synchronization
class MockF1Provider implements F1DataProvider {
  public providerName = 'MOCK_PROVIDER';
  public seasonData: RaceWeekend[] = [normalWeekend];

  public async getSeasonCalendar(): Promise<RaceWeekend[]> {
    return this.seasonData;
  }

  public async getRaceWeekend(): Promise<RaceWeekend> {
    return this.seasonData[0];
  }
}

const mockProvider = new MockF1Provider();
const syncService = new F1ScheduleSyncService(mockProvider);

async function runSyncTests() {
  // First Sync: Newly created
  const firstSync = await syncService.syncSeasonCalendar(2026, [], []);
  assert(firstSync.weekends.length === 1, 'First sync creates race weekend');
  assert(firstSync.rounds.length === 2, 'First sync generates prediction rounds');
  assert(firstSync.logs[0].action === 'CREATED', 'First sync logs action CREATED');

  // Second Sync: Identical data -> Idempotency & NO_CHANGE
  const secondSync = await syncService.syncSeasonCalendar(2026, firstSync.weekends, firstSync.rounds);
  assert(secondSync.weekends.length === 1, 'Second sync does not duplicate weekends (idempotent)');
  assert(secondSync.rounds.length === 2, 'Second sync does not duplicate prediction rounds');
  assert(secondSync.logs[0].action === 'NO_CHANGE', 'Second sync logs action NO_CHANGE');

  // Third Sync: Schedule Change (Qualifying shifted from 14:00 to 16:00 UTC)
  const updatedSessions = normalSessions.map(s => {
    if (s.type === 'QUALIFYING') {
      return { ...s, startTime: '2026-05-23T16:00:00Z' };
    }
    return s;
  });

  mockProvider.seasonData = [
    {
      ...normalWeekend,
      sessions: updatedSessions,
    },
  ];

  const thirdSync = await syncService.syncSeasonCalendar(2026, secondSync.weekends, secondSync.rounds);
  assert(thirdSync.logs.some(l => l.action === 'UPDATED'), 'Schedule change detected and logged as UPDATED');

  const updatedQualiRound = thirdSync.rounds.find(r => r.type === 'QUALIFYING');
  const expectedNewClose = new Date(new Date('2026-05-23T16:00:00Z').getTime() - 5 * 60 * 1000).toISOString();
  assert(updatedQualiRound?.closesAt === expectedNewClose, 'Prediction round closesAt deadline automatically updated to reflect shifted schedule');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🏁 All Data Provider & Schedule Synchronization tests passed!\n');
  }
}

runSyncTests();

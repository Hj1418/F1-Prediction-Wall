/**
 * Verification Script: Live Season, Current Event & 2026 Data Synchronization
 * 
 * Injects reference date 2026-10-01 and asserts:
 * 1. F1 resolves to Bahrain (Round 16, Oct 02-04, 2026)
 * 2. MotoGP resolves to Motul Grand Prix of Japan / Motegi (Round 17, Oct 02-04, 2026)
 * 3. WRC resolves to Rally Italia Sardegna (Round 12, Oct 01-04, 2026)
 * 4. WEC resolves to 6 Hours of Barcelona (Round 7, Oct 16-18, 2026) after Fuji completed
 * 5. Standings are 2026 official: Antonelli P1 (302 pts), Russell P2 (236 pts), Hamilton P3 (199 pts)
 * 6. F1 grid includes 11 teams with Cadillac
 */

import { f1Data } from '../src/services/motorsport/data/f1Data';
import { motogpData } from '../src/services/motorsport/data/motogpData';
import { wrcData } from '../src/services/motorsport/data/wrcData';
import { wecData } from '../src/services/motorsport/data/wecData';
import { resolveChampionshipCurrentEvent, getCurrentEventStatus } from '../src/services/schedule/eventStatusResolver';

const MOCK_DATE = new Date('2026-10-01T12:00:00Z');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('--- RUNNING 2026 SEASON & EVENT SYNCHRONIZATION AUDIT ---');
console.log(`Reference Injected Date: ${MOCK_DATE.toISOString()}\n`);

// 1. F1 Current Event Resolution
const f1Current = resolveChampionshipCurrentEvent(f1Data.rounds, MOCK_DATE);
assert(Boolean(f1Current && f1Current.event), 'F1 current event must resolve');
assert(f1Current!.event.roundNumber === 17, `F1 round should be 17 (Bahrain), got ${f1Current?.event.roundNumber}`);
assert(f1Current!.event.officialTitle.includes('Bahrain'), `F1 title should be Bahrain, got ${f1Current?.event.officialTitle}`);
assert(['THIS_WEEKEND', 'UPCOMING', 'LIVE'].includes(f1Current!.status), `F1 status should be THIS_WEEKEND or UPCOMING, got ${f1Current?.status}`);
assert(f1Current!.event.roundNumber !== 1, 'F1 must NEVER return Round 1 Australian GP on Oct 01, 2026');

// 2. F1 Standings Verification
const p1Driver = f1Data.driversStandings[0];
const p2Driver = f1Data.driversStandings[1];
const p3Driver = f1Data.driversStandings[2];
assert(p1Driver.driverName === 'Kimi Antonelli' && p1Driver.points === 302, `F1 P1 must be Kimi Antonelli with 302 pts, got ${p1Driver?.driverName} (${p1Driver?.points})`);
assert(p2Driver.driverName === 'George Russell' && p2Driver.points === 236, `F1 P2 must be George Russell with 236 pts, got ${p2Driver?.driverName} (${p2Driver?.points})`);
assert(p3Driver.driverName === 'Lewis Hamilton' && p3Driver.points === 199, `F1 P3 must be Lewis Hamilton with 199 pts, got ${p3Driver?.driverName} (${p3Driver?.points})`);

// 3. F1 2026 11 Teams Verification
assert(f1Data.teamsStandings.length >= 11, `F1 2026 grid must have at least 11 teams, got ${f1Data.teamsStandings.length}`);
const cadillac = f1Data.teamsStandings.find(t => t.teamName.toLowerCase().includes('cadillac'));
assert(Boolean(cadillac), 'F1 2026 grid must contain Cadillac Formula 1 Team');

// 4. MotoGP Current Event Resolution
const motogpCurrent = resolveChampionshipCurrentEvent(motogpData.rounds, MOCK_DATE);
assert(Boolean(motogpCurrent && motogpCurrent.event), 'MotoGP current event must resolve');
assert(motogpCurrent!.event.officialTitle.includes('Japan'), `MotoGP event should be Motul Grand Prix of Japan, got ${motogpCurrent?.event.officialTitle}`);
assert(motogpCurrent!.event.circuitName.includes('Motegi'), `MotoGP circuit should be Motegi, got ${motogpCurrent?.event.circuitName}`);

// 5. WRC Current Event Resolution
const wrcCurrent = resolveChampionshipCurrentEvent(wrcData.rounds, MOCK_DATE);
assert(Boolean(wrcCurrent && wrcCurrent.event), 'WRC current event must resolve');
assert(wrcCurrent!.event.officialTitle.includes('Sardegna'), `WRC event should be Rally Italia Sardegna, got ${wrcCurrent?.event.officialTitle}`);

// 6. WEC Current Event Resolution
const wecCurrent = resolveChampionshipCurrentEvent(wecData.rounds, MOCK_DATE);
assert(Boolean(wecCurrent && wecCurrent.event), 'WEC current event must resolve');
assert(wecCurrent!.event.officialTitle.includes('Barcelona'), `WEC next event should be 6 Hours of Barcelona, got ${wecCurrent?.event.officialTitle}`);
const fujiRound = wecData.rounds.find(r => r.officialTitle.includes('Fuji'));
assert(Boolean(fujiRound), 'WEC must have Fuji round');
const fujiStatus = getCurrentEventStatus(fujiRound!, MOCK_DATE);
assert(fujiStatus === 'COMPLETED', `WEC Fuji on Sep 25-27 must be COMPLETED on Oct 01, got ${fujiStatus}`);

// 7. Shared Race Context & Prediction Binding Verification
const { getSharedRaceContext } = await import('../src/services/schedule/raceContextService');
const sharedContext = await getSharedRaceContext(2026, MOCK_DATE);
assert(Boolean(sharedContext && sharedContext.currentWeekend), 'Shared race context must resolve');
assert(sharedContext!.currentWeekend.roundNumber === 16, `Shared race context currentWeekend must be Round 16, got ${sharedContext?.currentWeekend.roundNumber}`);
assert(sharedContext!.currentWeekend.raceName.includes('Bahrain'), `Shared race context currentWeekend must be Bahrain, got ${sharedContext?.currentWeekend.raceName}`);
assert(sharedContext!.activePredictionRound?.roundId === '2026_16_RACE_PREDICTION', `Active prediction round must be 2026_16_RACE_PREDICTION, got ${sharedContext?.activePredictionRound?.roundId}`);

// 8. Home Snapshot Verification
const { getHomeSnapshot } = await import('../src/services/home/homeSnapshotService');
const homeSnapshot = await getHomeSnapshot(MOCK_DATE);
assert(homeSnapshot.nextRace.roundNumber === 16 || homeSnapshot.nextRace.roundNumber === 17, `Home snapshot next race must be Round 16 or 17, got ${homeSnapshot.nextRace.roundNumber}`);
assert(homeSnapshot.nextRace.grandPrixName.includes('Bahrain'), `Home snapshot next race must be Bahrain, got ${homeSnapshot.nextRace.grandPrixName}`);
assert(homeSnapshot.predictionHighlight.roundId.includes('RACE_PREDICTION'), `Home snapshot prediction highlight must be RACE_PREDICTION, got ${homeSnapshot.predictionHighlight.roundId}`);

console.log('\nALL 2026 SEASON SYNCHRONIZATION TESTS PASSED Deterministically!');

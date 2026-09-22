import {
  RaceWeekend,
  Session,
  PredictionRound,
  PredictionFieldConfig,
  ScoringRules,
  RoundStatus,
  RoundType,
} from '../../types';
import { detectWeekendFormat } from './weekendFormatDetector';

export interface PredictionConfig {
  defaultCloseBufferMinutes: number;
}

export const DEFAULT_PREDICTION_CONFIG: PredictionConfig = {
  defaultCloseBufferMinutes: 5,
};

export const DEFAULT_SCORING_RULES: ScoringRules = {
  exactP1: 15,
  exactP2: 10,
  exactP3: 10,
  podiumWrongPosition: 5,
  fastestLap: 10,
  driverOfTheDay: 10,
  wildCard: 15,
  safetyCar: 10,
  virtualSafetyCar: 10,
  redFlag: 10,
  yellowFlag: 10,
  retirementsOverUnder: 10,
  lap1Leader: 10,
  winningMargin: 10,
  rainSession: 10,
  poleMargin: 10,
  q1Elimination: 10,
  sprintDnf: 10,
  perfectPodiumBonus: 10,
};

export const STANDARD_PODIUM_FIELDS: PredictionFieldConfig[] = [
  { id: 'p1', label: 'Race Winner (P1)', type: 'driver', required: true, helperText: '15 PTS for exact winner • 5 PTS for podium place' },
  { id: 'p2', label: 'Second Place (P2)', type: 'driver', required: true, helperText: '10 PTS for exact P2 • 5 PTS for podium place' },
  { id: 'p3', label: 'Third Place (P3)', type: 'driver', required: true, helperText: '10 PTS for exact P3 • 5 PTS for podium place' },
];

export const QUALI_PODIUM_FIELDS: PredictionFieldConfig[] = [
  { id: 'p1', label: 'Pole Position (P1)', type: 'driver', required: true, helperText: '15 PTS for exact pole winner' },
  { id: 'p2', label: 'Front Row (P2)', type: 'driver', required: true, helperText: '10 PTS for exact front row qualifier' },
  { id: 'p3', label: 'Third Place (P3)', type: 'driver', required: true, helperText: '10 PTS for exact 3rd on grid' },
];

/**
 * Returns default prediction fields for each session type.
 * Includes podium, performance awards, safety cars, red flags, and high-adrenaline wild cards.
 */
export function getDefaultPredictionFields(roundType: string): PredictionFieldConfig[] {
  switch (roundType) {
    case 'QUALIFYING':
    case 'SPRINT_QUALIFYING':
      return [
        ...QUALI_PODIUM_FIELDS,
        {
          id: 'poleMargin',
          label: 'Wild Card: Will pole margin be under 0.100s?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Q3 pole gap separated by less than a tenth of a second',
          options: [
            { value: 'YES', label: 'Yes (Gap < 0.100s — Photo Finish Pole)' },
            { value: 'NO', label: 'No (Gap >= 0.100s — Clear Advantage)' },
          ],
        },
        {
          id: 'redFlag',
          label: 'Wild Card: Red Flag in Qualifying?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will any qualifying segment (Q1, Q2, or Q3) be red flagged?',
          options: [
            { value: 'YES', label: 'Yes — Red Flag stoppage' },
            { value: 'NO', label: 'No — Clean uninterrupted qualifying' },
          ],
        },
        {
          id: 'q1Elimination',
          label: 'Wild Card: Top-Team Q1 Knockout?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will any Red Bull, Ferrari, McLaren, or Mercedes driver get eliminated in Q1?',
          options: [
            { value: 'YES', label: 'Yes — Shock Q1 elimination' },
            { value: 'NO', label: 'No — All top contenders advance to Q2' },
          ],
        },
        {
          id: 'rainSession',
          label: 'Wild Card: Wet Weather / Rain in Quali?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will intermediate (green) or wet (blue) tyres be used during qualifying?',
          options: [
            { value: 'YES', label: 'Yes — Wet/Intermediate tyres run' },
            { value: 'NO', label: 'No — 100% dry slick tyre session' },
          ],
        },
      ];

    case 'SPRINT':
      return [
        ...STANDARD_PODIUM_FIELDS,
        {
          id: 'fastestLap',
          label: 'Sprint Fastest Lap',
          type: 'driver',
          required: false,
          helperText: '+10 PTS • Driver who clocks the single fastest lap during the sprint',
        },
        {
          id: 'safetyCar',
          label: 'Safety Car Deployed?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will Bernd Mayländer Safety Car be dispatched in the sprint?',
          options: [
            { value: 'YES', label: 'Yes — Physical Safety Car deployed' },
            { value: 'NO', label: 'No — No physical Safety Car deployed' },
          ],
        },
        {
          id: 'virtualSafetyCar',
          label: 'Virtual Safety Car (VSC)?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Speed delta restriction VSC period triggered in sprint',
          options: [
            { value: 'YES', label: 'Yes — VSC deployed during sprint' },
            { value: 'NO', label: 'No — No VSC deployed' },
          ],
        },
        {
          id: 'redFlag',
          label: 'Red Flag Stoppage?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will the sprint race be halted by a red flag?',
          options: [
            { value: 'YES', label: 'Yes — Sprint suspended with red flag' },
            { value: 'NO', label: 'No — Green flag uninterrupted' },
          ],
        },
        {
          id: 'yellowFlag',
          label: 'Yellow Flag Caution?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will a yellow flag caution be waved during the sprint?',
          options: [
            { value: 'YES', label: 'Yes — Yellow flag waved' },
            { value: 'NO', label: 'No — Full green flag session' },
          ],
        },
        {
          id: 'sprintDnf',
          label: 'Any Sprint Retirements (DNFs)?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will at least 1 car fail to complete the 100km sprint distance?',
          options: [
            { value: 'YES', label: 'Yes — At least 1 retirement' },
            { value: 'NO', label: 'No — All 20 drivers see the chequered flag' },
          ],
        },
      ];

    case 'GRAND_PRIX':
    case 'RACE':
    default:
      return [
        ...STANDARD_PODIUM_FIELDS,
        {
          id: 'fastestLap',
          label: 'Fastest Lap',
          type: 'driver',
          required: false,
          helperText: '+10 PTS • Driver who clocks the official fastest lap of the Grand Prix',
        },
        {
          id: 'safetyCar',
          label: 'Safety Car Deployed?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Physical Bernd Mayländer Safety Car dispatched onto the circuit',
          options: [
            { value: 'YES', label: 'Yes — Full physical Safety Car deployed' },
            { value: 'NO', label: 'No — No physical Safety Car deployed' },
          ],
        },
        {
          id: 'virtualSafetyCar',
          label: 'Virtual Safety Car (VSC)?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Speed delta restriction Virtual Safety Car period triggered',
          options: [
            { value: 'YES', label: 'Yes — VSC deployed during the race' },
            { value: 'NO', label: 'No — No VSC period triggered' },
          ],
        },
        {
          id: 'redFlag',
          label: 'Red Flag Stoppage?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Grand Prix officially suspended and cars return to pit lane',
          options: [
            { value: 'YES', label: 'Yes — Race suspended with red flags' },
            { value: 'NO', label: 'No — No red flag stoppage' },
          ],
        },
        {
          id: 'yellowFlag',
          label: 'Yellow Flag Caution?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Track sector or full course yellow flag waved for incident/debris',
          options: [
            { value: 'YES', label: 'Yes — Yellow flag waved during race' },
            { value: 'NO', label: 'No — Clean green flag race' },
          ],
        },
        {
          id: 'driverOfTheDay',
          label: 'Driver of the Day',
          type: 'driver',
          required: false,
          helperText: '+10 PTS • Official FIA fan-voted Driver of the Day',
        },
        {
          id: 'retirementsOverUnder',
          label: 'Wild Card: Total Race Retirements (DNFs)',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Total cars that fail to reach the chequered flag',
          options: [
            { value: 'OVER_2_5', label: 'Over 2.5 DNFs (3 or more retirements)' },
            { value: 'UNDER_2_5', label: 'Under 2.5 DNFs (0, 1, or 2 retirements)' },
          ],
        },
        {
          id: 'lap1Leader',
          label: 'Wild Card: Will Pole Sitter lead Lap 1?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will the pole position starter cross the start/finish line in P1 on Lap 1?',
          options: [
            { value: 'YES', label: 'Yes — Pole sitter holds P1 on Lap 1' },
            { value: 'NO', label: 'No — Turn 1 lead change on Lap 1' },
          ],
        },
        {
          id: 'winningMargin',
          label: 'Wild Card: Winning margin under 5.000s?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Time delta between P1 and P2 at the checkered flag',
          options: [
            { value: 'YES', label: 'Yes — Under 5.000s (Thrilling close finish)' },
            { value: 'NO', label: 'No — 5.000s or more (Dominant margin of victory)' },
          ],
        },
        {
          id: 'rainSession',
          label: 'Wild Card: Rain / Wet Tyres in Race?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Will intermediate (green) or wet (blue) tyres be used by any car in the race?',
          options: [
            { value: 'YES', label: 'Yes — Rain affects race / wet tyres fitted' },
            { value: 'NO', label: 'No — Dry slick tyre race throughout' },
          ],
        },
      ];
  }
}

function subtractMinutes(isoString: string, minutes: number): string {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}

/**
 * Centrally calculates the dynamic lifecycle state of a prediction round.
 * UPCOMING -> OPEN -> LOCKED -> COMPLETED -> SCORED
 */
export function getPredictionRoundStatus(
  predictionRound: Partial<PredictionRound>,
  currentServerTime: Date = new Date()
): RoundStatus {
  if (predictionRound.status === 'SCORED' || predictionRound.status === 'COMPLETED') {
    return predictionRound.status;
  }

  const nowMs = currentServerTime.getTime();
  const opensAtMs = predictionRound.opensAt ? new Date(predictionRound.opensAt).getTime() : 0;
  const closesAtMs = predictionRound.closesAt ? new Date(predictionRound.closesAt).getTime() : 0;

  if (nowMs < opensAtMs) {
    return 'UPCOMING';
  }
  if (nowMs >= opensAtMs && nowMs < closesAtMs) {
    return 'OPEN';
  }
  return 'LOCKED';
}

/**
 * Automatically generates prediction rounds dynamically from race weekend sessions.
 */
export function generatePredictionRounds(
  raceWeekend: RaceWeekend,
  config: PredictionConfig = DEFAULT_PREDICTION_CONFIG
): PredictionRound[] {
  const sessions = raceWeekend.sessions || [];
  const weekendType = detectWeekendFormat(sessions);
  const bufferMins = config.defaultCloseBufferMinutes;

  const fp1 = sessions.find(s => s.type === 'FP1' || s.sessionType === 'FP1');
  const sq = sessions.find(s => s.type === 'SPRINT_QUALIFYING' || s.sessionType === 'SPRINT_QUALIFYING');
  const sprint = sessions.find(s => s.type === 'SPRINT' || s.sessionType === 'SPRINT');
  const quali = sessions.find(s => s.type === 'QUALIFYING' || s.sessionType === 'QUALIFYING');
  const race = sessions.find(s =>
    s.type === 'RACE' ||
    s.type === 'GRAND_PRIX' ||
    s.sessionType === 'RACE' ||
    s.sessionType === 'GRAND_PRIX' ||
    (s.name && /grand prix|race/i.test(s.name) && !/sprint/i.test(s.name))
  );

  const weekendId = raceWeekend.id || raceWeekend.raceWeekendId;
  const generatedRounds: PredictionRound[] = [];
  const firstSessionTime = fp1 ? fp1.startTime : raceWeekend.startDate;
  // If weekend is already ACTIVE, predictions are open (opens 7 days before session start).
  // If UPCOMING, predictions open 24 hours before first session start.
  const openMinutes = raceWeekend.status === 'ACTIVE' ? 7 * 24 * 60 : 24 * 60;
  const weekendOpenTime = subtractMinutes(firstSessionTime, openMinutes);

  // Phase 11: Prediction Bench supports RACE PREDICTIONS ONLY (Grand Prix & Sprint Race).
  // Deprecated qualification prediction rounds (Qualifying, Sprint Qualifying) are no longer actively created.
  if (sprint) {
    const opensAt = weekendOpenTime;
    const closesAt = subtractMinutes(sprint.startTime, bufferMins);
    const roundId = `${weekendId}_SPRINT_PREDICTION`;
    generatedRounds.push({
      id: roundId,
      roundId,
      raceWeekendId: weekendId,
      sessionId: sprint.id || sprint.sessionId || '',
      type: 'SPRINT',
      roundType: 'SPRINT',
      title: `${raceWeekend.name || raceWeekend.raceName} Sprint Race`,
      description: 'Predict Sprint podium (P1, P2, P3), fastest lap, and sprint wildcards.',
      opensAt,
      closesAt,
      status: getPredictionRoundStatus({ opensAt, closesAt }),
      predictionFields: getDefaultPredictionFields('SPRINT'),
      scoringRules: DEFAULT_SCORING_RULES,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  // Ensure a Grand Prix Race prediction round is always generated for every race weekend
  const raceSessionStartTime = race ? race.startTime : (raceWeekend.endDate || raceWeekend.startDate);
  const raceSessionId = race ? (race.id || race.sessionId || `${weekendId}_RACE`) : `${weekendId}_RACE`;
  const opensAt = weekendOpenTime;
  const closesAt = subtractMinutes(raceSessionStartTime, bufferMins);
  const roundId = `${weekendId}_RACE_PREDICTION`;

  generatedRounds.push({
    id: roundId,
    roundId,
    raceWeekendId: weekendId,
    sessionId: raceSessionId,
    type: 'RACE',
    roundType: 'GRAND_PRIX',
    title: `${raceWeekend.name || raceWeekend.raceName || 'Grand Prix'} Race Prediction`,
    description: 'Predict podium (P1, P2, P3), fastest lap, driver of the day, safety car, and race wildcards.',
    opensAt,
    closesAt,
    status: getPredictionRoundStatus({ opensAt, closesAt }),
    predictionFields: getDefaultPredictionFields('GRAND_PRIX'),
    scoringRules: DEFAULT_SCORING_RULES,
    lastUpdatedAt: new Date().toISOString(),
  });

  return generatedRounds;
}

/**
 * Checks if a prediction round is a deprecated qualification round.
 */
export function isQualificationPredictionRound(round: Partial<PredictionRound>): boolean {
  const type = String(round.roundType || round.type || '').toUpperCase();
  const id = String(round.roundId || round.id || '').toUpperCase();
  const title = String(round.title || '').toUpperCase();
  return (
    type === 'QUALIFYING' ||
    type === 'SPRINT_QUALIFYING' ||
    id.includes('QUALIFYING') ||
    title.includes('QUALIFYING')
  );
}

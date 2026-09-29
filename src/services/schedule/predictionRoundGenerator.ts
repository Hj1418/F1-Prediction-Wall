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

export const SIMPLIFIED_ACTIVE_SCORING_RULES: ScoringRules = {
  exactP1: 10,
  exactP2: 7,
  exactP3: 5,
  podiumWrongPosition: 3,
  fastestLap: 7,
  driverOfTheDay: 7,
  safetyCar: 5,
  virtualSafetyCar: 5,
  redFlag: 5,
  yellowFlag: 4,
  wildCard: 5,
  perfectPodiumBonus: 0,
};

export const DEFAULT_SCORING_RULES: ScoringRules = SIMPLIFIED_ACTIVE_SCORING_RULES;

export const STANDARD_PODIUM_FIELDS: PredictionFieldConfig[] = [
  { id: 'p1', label: 'Race Winner (P1)', type: 'driver', required: true, helperText: '10 PTS for exact winner • 3 PTS for podium place' },
  { id: 'p2', label: 'Second Place (P2)', type: 'driver', required: true, helperText: '7 PTS for exact P2 • 3 PTS for podium place' },
  { id: 'p3', label: 'Third Place (P3)', type: 'driver', required: true, helperText: '5 PTS for exact P3 • 3 PTS for podium place' },
];

export const QUALI_PODIUM_FIELDS: PredictionFieldConfig[] = STANDARD_PODIUM_FIELDS;

/**
 * Returns simplified active prediction fields (strictly 9 fields, max 55 pts).
 * 1. P1 (10 pts)
 * 2. P2 (7 pts)
 * 3. P3 (5 pts)
 * 4. Fastest Lap (7 pts)
 * 5. Driver/Rider of the Day (7 pts)
 * 6. Safety Car (5 pts)
 * 7. Virtual Safety Car (5 pts)
 * 8. Red Flag (5 pts)
 * 9. Yellow Flag (4 pts)
 */
export function getDefaultPredictionFields(arg1?: string, arg2?: string): PredictionFieldConfig[] {
  let competitorLabel = 'Driver';
  if (arg1 && (arg1.toLowerCase() === 'rider' || arg1.toLowerCase() === 'driver')) {
    competitorLabel = arg1;
  } else if (arg2) {
    competitorLabel = arg2;
  }
  const isRider = competitorLabel.toLowerCase() === 'rider';
  const person = isRider ? 'Rider' : 'Driver';
  const dotdId = isRider ? 'riderOfTheDay' : 'driverOfTheDay';

  return [
    {
      id: 'p1',
      label: 'Race Winner (P1)',
      type: 'driver',
      required: true,
      helperText: '10 PTS for exact winner • 3 PTS for podium position',
    },
    {
      id: 'p2',
      label: 'Second Place (P2)',
      type: 'driver',
      required: true,
      helperText: '7 PTS for exact P2 • 3 PTS for podium position',
    },
    {
      id: 'p3',
      label: 'Third Place (P3)',
      type: 'driver',
      required: true,
      helperText: '5 PTS for exact P3 • 3 PTS for podium position',
    },
    {
      id: 'fastestLap',
      label: 'Fastest Lap',
      type: 'driver',
      required: false,
      helperText: `+7 PTS • ${person} who clocks the official fastest lap`,
    },
    {
      id: dotdId,
      label: `${person} of the Day`,
      type: 'driver',
      required: false,
      helperText: `+7 PTS • Official fan-voted ${person} of the Day`,
    },
    {
      id: 'safetyCar',
      label: 'Safety Car Deployed?',
      type: 'option',
      required: false,
      helperText: '+5 PTS • Physical Safety Car deployed during race',
      options: [
        { value: 'YES', label: 'Yes — Safety Car deployed' },
        { value: 'NO', label: 'No — No physical Safety Car' },
      ],
    },
    {
      id: 'virtualSafetyCar',
      label: 'Virtual Safety Car (VSC)?',
      type: 'option',
      required: false,
      helperText: '+5 PTS • Virtual Safety Car speed restriction deployed',
      options: [
        { value: 'YES', label: 'Yes — VSC deployed' },
        { value: 'NO', label: 'No — No VSC period' },
      ],
    },
    {
      id: 'redFlag',
      label: 'Red Flag Stoppage?',
      type: 'option',
      required: false,
      helperText: '+5 PTS • Race officially suspended with red flags',
      options: [
        { value: 'YES', label: 'Yes — Race red-flagged' },
        { value: 'NO', label: 'No — No red flag stoppage' },
      ],
    },
    {
      id: 'yellowFlag',
      label: 'Yellow Flag Caution?',
      type: 'option',
      required: false,
      helperText: '+4 PTS • Yellow flag caution waved during race',
      options: [
        { value: 'YES', label: 'Yes — Yellow flag waved' },
        { value: 'NO', label: 'No — Clean green flag race' },
      ],
    },
  ];
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
  let closesAt = subtractMinutes(raceSessionStartTime, bufferMins);
  const roundId = `${weekendId}_RACE_PREDICTION`;

  // Enforce Baku Azerbaijan Grand Prix deadline: midnight tonight (Sep 25 18:30 UTC / Sep 26 00:00 IST)
  if (
    weekendId === '2026_15' ||
    weekendId === '2026_17' ||
    (raceWeekend.name && raceWeekend.name.includes('Azerbaijan')) ||
    (raceWeekend.country && raceWeekend.country.includes('Azerbaijan'))
  ) {
    closesAt = '2026-09-25T18:30:00.000Z';
  }

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

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
  perfectPodiumBonus: 10,
};

const STANDARD_PODIUM_FIELDS: PredictionFieldConfig[] = [
  { id: 'p1', label: 'Race Winner (P1)', type: 'driver', required: true },
  { id: 'p2', label: 'Second Place (P2)', type: 'driver', required: true },
  { id: 'p3', label: 'Third Place (P3)', type: 'driver', required: true },
];

const QUALI_PODIUM_FIELDS: PredictionFieldConfig[] = [
  { id: 'p1', label: 'Pole Position (P1)', type: 'driver', required: true },
  { id: 'p2', label: 'Second Place (P2)', type: 'driver', required: true },
  { id: 'p3', label: 'Third Place (P3)', type: 'driver', required: true },
];

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

  const fp1 = sessions.find(s => s.type === 'FP1');
  const sq = sessions.find(s => s.type === 'SPRINT_QUALIFYING');
  const sprint = sessions.find(s => s.type === 'SPRINT');
  const quali = sessions.find(s => s.type === 'QUALIFYING');
  const race = sessions.find(s => s.type === 'RACE' || s.type === 'GRAND_PRIX');

  const weekendId = raceWeekend.id || raceWeekend.raceWeekendId;
  const generatedRounds: PredictionRound[] = [];
  const weekendOpenTime = fp1
    ? subtractMinutes(fp1.startTime, 24 * 60) // opens 24h before FP1
    : subtractMinutes(raceWeekend.startDate, 24 * 60);

  if (weekendType === 'SPRINT') {
    // 1. SPRINT QUALIFYING PREDICTION
    if (sq) {
      const closesAt = subtractMinutes(sq.startTime, bufferMins);
      const roundId = `${weekendId}_SPRINT_QUALIFYING_PREDICTION`;
      generatedRounds.push({
        id: roundId,
        roundId,
        raceWeekendId: weekendId,
        sessionId: sq.id || sq.sessionId || '',
        type: 'SPRINT_QUALIFYING',
        roundType: 'SPRINT_QUALIFYING',
        title: 'Sprint Qualifying Prediction',
        description: 'Predict the top 3 drivers for Sprint Qualifying shootout.',
        opensAt: weekendOpenTime,
        closesAt,
        status: getPredictionRoundStatus({ opensAt: weekendOpenTime, closesAt }),
        predictionFields: [
          ...QUALI_PODIUM_FIELDS,
          {
            id: 'wildCard',
            label: 'Wild Card: Will track have wet conditions during session?',
            type: 'option',
            required: false,
            options: [
              { value: 'YES', label: 'Yes - Inters or Wets used' },
              { value: 'NO', label: 'No - Dry running throughout' },
            ],
          },
        ],
        scoringRules: DEFAULT_SCORING_RULES,
        lastUpdatedAt: new Date().toISOString(),
      });
    }

    // 2. SPRINT RACE PREDICTION
    if (sprint) {
      const opensAt = sq ? sq.startTime : weekendOpenTime;
      const closesAt = subtractMinutes(sprint.startTime, bufferMins);
      const roundId = `${weekendId}_SPRINT_PREDICTION`;
      generatedRounds.push({
        id: roundId,
        roundId,
        raceWeekendId: weekendId,
        sessionId: sprint.id || sprint.sessionId || '',
        type: 'SPRINT',
        roundType: 'SPRINT',
        title: 'Sprint Race Prediction',
        description: 'Predict the top 3 finishers of the 100km Shanghai/Sprint race.',
        opensAt,
        closesAt,
        status: getPredictionRoundStatus({ opensAt, closesAt }),
        predictionFields: [
          ...STANDARD_PODIUM_FIELDS,
          { id: 'fastestLap', label: 'Fastest Lap', type: 'driver', required: false },
          {
            id: 'wildCard',
            label: 'Wild Card: Will any driver DNF in the Sprint?',
            type: 'option',
            required: false,
            options: [
              { value: 'YES', label: 'Yes - At least 1 retirement' },
              { value: 'NO', label: 'No - All cars finish' },
            ],
          },
        ],
        scoringRules: DEFAULT_SCORING_RULES,
        lastUpdatedAt: new Date().toISOString(),
      });
    }

    // 3. GP QUALIFYING PREDICTION (In Sprint weekend, after Sprint race)
    if (quali) {
      const opensAt = sprint ? sprint.startTime : (sq ? sq.startTime : weekendOpenTime);
      const closesAt = subtractMinutes(quali.startTime, bufferMins);
      const roundId = `${weekendId}_QUALIFYING_PREDICTION`;
      generatedRounds.push({
        id: roundId,
        roundId,
        raceWeekendId: weekendId,
        sessionId: quali.id || quali.sessionId || '',
        type: 'QUALIFYING',
        roundType: 'QUALIFYING',
        title: 'Grand Prix Qualifying Prediction',
        description: 'Predict the top 3 qualifiers on the Sunday starting grid.',
        opensAt,
        closesAt,
        status: getPredictionRoundStatus({ opensAt, closesAt }),
        predictionFields: [
          ...QUALI_PODIUM_FIELDS,
          {
            id: 'wildCard',
            label: 'Wild Card: Will pole margin be under 0.100s?',
            type: 'option',
            required: false,
            options: [
              { value: 'YES', label: 'Yes (Gap < 0.100s)' },
              { value: 'NO', label: 'No (Gap >= 0.100s)' },
            ],
          },
        ],
        scoringRules: DEFAULT_SCORING_RULES,
        lastUpdatedAt: new Date().toISOString(),
      });
    }

    // 4. GRAND PRIX PREDICTION
    if (race) {
      const opensAt = quali ? quali.startTime : weekendOpenTime;
      const closesAt = subtractMinutes(race.startTime, bufferMins);
      const roundId = `${weekendId}_RACE_PREDICTION`;
      generatedRounds.push({
        id: roundId,
        roundId,
        raceWeekendId: weekendId,
        sessionId: race.id || race.sessionId || '',
        type: 'RACE',
        roundType: 'GRAND_PRIX',
        title: `${raceWeekend.name || raceWeekend.raceName} Race Prediction`,
        description: 'Predict the podium, fastest lap, driver of the day, and race wildcard.',
        opensAt,
        closesAt,
        status: getPredictionRoundStatus({ opensAt, closesAt }),
        predictionFields: [
          ...STANDARD_PODIUM_FIELDS,
          { id: 'fastestLap', label: 'Fastest Lap', type: 'driver', required: false },
          { id: 'driverOfTheDay', label: 'Driver of the Day', type: 'driver', required: false },
          {
            id: 'wildCard',
            label: 'Wild Card: Will there be a Safety Car or VSC during the race?',
            type: 'option',
            required: false,
            options: [
              { value: 'YES', label: 'Yes - Safety Car or VSC deployed' },
              { value: 'NO', label: 'No - Green flag race throughout' },
            ],
          },
        ],
        scoringRules: DEFAULT_SCORING_RULES,
        lastUpdatedAt: new Date().toISOString(),
      });
    }
  } else {
    // NORMAL WEEKEND FORMAT
    // 1. QUALIFYING PREDICTION
    if (quali) {
      const closesAt = subtractMinutes(quali.startTime, bufferMins);
      const roundId = `${weekendId}_QUALIFYING_PREDICTION`;
      generatedRounds.push({
        id: roundId,
        roundId,
        raceWeekendId: weekendId,
        sessionId: quali.id || quali.sessionId || '',
        type: 'QUALIFYING',
        roundType: 'QUALIFYING',
        title: 'Qualifying Predictions',
        description: 'Predict the top 3 qualifiers on the grid and Q3 wildcard.',
        opensAt: weekendOpenTime,
        closesAt,
        status: getPredictionRoundStatus({ opensAt: weekendOpenTime, closesAt }),
        predictionFields: [
          ...QUALI_PODIUM_FIELDS,
          {
            id: 'wildCard',
            label: 'Wild Card: Will both Ferrari drivers reach Q3?',
            type: 'option',
            required: false,
            options: [
              { value: 'YES', label: 'Yes - Leclerc & Hamilton in Q3' },
              { value: 'NO', label: 'No - At least one knocked out in Q1/Q2' },
            ],
          },
        ],
        scoringRules: DEFAULT_SCORING_RULES,
        lastUpdatedAt: new Date().toISOString(),
      });
    }

    // 2. GRAND PRIX PREDICTION
    if (race) {
      const opensAt = quali ? quali.startTime : weekendOpenTime;
      const closesAt = subtractMinutes(race.startTime, bufferMins);
      const roundId = `${weekendId}_RACE_PREDICTION`;
      generatedRounds.push({
        id: roundId,
        roundId,
        raceWeekendId: weekendId,
        sessionId: race.id || race.sessionId || '',
        type: 'RACE',
        roundType: 'GRAND_PRIX',
        title: `${raceWeekend.name || raceWeekend.raceName} Race Prediction`,
        description: 'Predict the podium, fastest lap, driver of the day, and race wildcard.',
        opensAt,
        closesAt,
        status: getPredictionRoundStatus({ opensAt, closesAt }),
        predictionFields: [
          ...STANDARD_PODIUM_FIELDS,
          { id: 'fastestLap', label: 'Fastest Lap', type: 'driver', required: false },
          { id: 'driverOfTheDay', label: 'Driver of the Day', type: 'driver', required: false },
          {
            id: 'wildCard',
            label: 'Wild Card: Will there be a Safety Car or VSC deployed?',
            type: 'option',
            required: false,
            options: [
              { value: 'YES', label: 'Yes - Full SC or VSC deployed' },
              { value: 'NO', label: 'No - Clean Green Flag Race' },
            ],
          },
        ],
        scoringRules: DEFAULT_SCORING_RULES,
        lastUpdatedAt: new Date().toISOString(),
      });
    }
  }

  return generatedRounds;
}

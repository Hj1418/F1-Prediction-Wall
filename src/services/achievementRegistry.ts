/**
 * The Grid — Authoritative Achievement Registry & Evaluation Engine
 * 
 * Provides:
 * - Canonical achievement definitions across Participation, Points Milestones, and Prediction Performance.
 * - Deterministic, idempotent evaluation from verified prediction records and season totals.
 * - Safe support for re-evaluation following amended results or historical corrections.
 * - Clear distinction between Unlocked and Locked (with progress telemetry) states.
 */

import { Achievement } from '../types';
import { extractNumericScore, normalizeCanonicalRoundId, deriveWeekendId } from '../utils/predictionScoring';

export interface AchievementDefinition {
  id: string;
  type: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: 'PARTICIPATION' | 'MILESTONE' | 'PERFORMANCE';
  targetValue: number;
}

export const CANONICAL_ACHIEVEMENT_REGISTRY: AchievementDefinition[] = [
  // Participation
  {
    id: 'grid_regular',
    type: 'GRID_REGULAR',
    title: 'Grid Regular',
    description: 'Submitted valid predictions across 3 distinct race weekends.',
    badgeIcon: '🎯',
    category: 'PARTICIPATION',
    targetValue: 3,
  },
  {
    id: 'grid_loyalist',
    type: 'GRID_LOYALIST',
    title: 'Grid Loyalist',
    description: 'Submitted valid predictions across 5 distinct race weekends.',
    badgeIcon: '🛡️',
    category: 'PARTICIPATION',
    targetValue: 5,
  },

  // Points Milestones
  {
    id: 'half_century',
    type: 'HALF_CENTURY',
    title: 'Half-Century',
    description: 'Achieved 50 verified cumulative season points.',
    badgeIcon: '⚡',
    category: 'MILESTONE',
    targetValue: 50,
  },
  {
    id: 'century_club',
    type: 'CENTURY_CLUB',
    title: 'Century Club',
    description: 'Achieved 100 verified cumulative season points.',
    badgeIcon: '💯',
    category: 'MILESTONE',
    targetValue: 100,
  },

  // Prediction Performance
  {
    id: 'perfect_podium',
    type: 'PERFECT_PODIUM',
    title: 'Perfect Podium',
    description: 'Correctly predicted P1, P2, and P3 in one eligible finalized round.',
    badgeIcon: '🏆',
    category: 'PERFORMANCE',
    targetValue: 1,
  },
  {
    id: 'fastest_lap_hunter',
    type: 'FASTEST_LAP_HUNTER',
    title: 'Fastest Lap Hunter',
    description: 'Correctly predicted the official fastest lap in a finalized round.',
    badgeIcon: '⏱️',
    category: 'PERFORMANCE',
    targetValue: 1,
  },
  {
    id: 'wildcard_wizard',
    type: 'WILDCARD_WIZARD',
    title: 'Wildcard Wizard',
    description: 'Correctly predicted 3 or more race condition wildcards (Safety Car, VSC, Red Flag, Yellow Flag).',
    badgeIcon: '🔮',
    category: 'PERFORMANCE',
    targetValue: 3,
  },
  {
    id: 'perfect_prediction_round',
    type: 'PERFECT_PREDICTION_ROUND',
    title: 'Perfect Prediction Round',
    description: 'Scored 100% of all required categories correctly in a finalized round.',
    badgeIcon: '👑',
    category: 'PERFORMANCE',
    targetValue: 1,
  },
];

export interface EvaluateAchievementsInput {
  userId: string;
  history: any[];
  seasonPoints: number;
}

/**
 * Idempotently evaluates all achievements for a racer based on authoritative history and season totals.
 * Returns a list of all registry achievements with isUnlocked, earnedAt, and progress fields.
 */
export function evaluateUserAchievements(input: EvaluateAchievementsInput): Achievement[] {
  const { userId, history, seasonPoints } = input;
  const items = Array.isArray(history) ? history : [];

  // 1. Gather distinct race weekends with valid submitted predictions
  const distinctWeekends = new Set<string>();
  let earliestWeekendEarnedMap: Record<string, string> = {};

  items.forEach(item => {
    if (!item) return;
    const round = item.round || {};
    const pred = item.prediction || {};
    const weekend = item.weekend || {};
    const rawRoundId = round.roundId || pred.roundId || item.roundId || '';
    const canonicalRoundId = normalizeCanonicalRoundId(rawRoundId);
    const weekendId = weekend.raceWeekendId || round.raceWeekendId || item.raceWeekendId || deriveWeekendId(canonicalRoundId);
    const submittedAt = pred.submittedAt || item.submittedAt || '';

    if (weekendId && weekendId !== 'unknown_weekend') {
      distinctWeekends.add(weekendId);
      if (submittedAt && (!earliestWeekendEarnedMap[weekendId] || new Date(submittedAt) < new Date(earliestWeekendEarnedMap[weekendId]))) {
        earliestWeekendEarnedMap[weekendId] = submittedAt;
      }
    }
  });

  const distinctWeekendCount = distinctWeekends.size;

  // 2. Evaluate performance items from finalized / scored rounds only
  let perfectPodiumsEarned: { roundId: string; timestamp: string }[] = [];
  let fastestLapEarned: { roundId: string; timestamp: string }[] = [];
  let wildcardsCount = 0;
  let wildcardTimestamps: string[] = [];
  let perfectRoundsEarned: { roundId: string; timestamp: string }[] = [];

  const coreKeys = ['p1', 'p2', 'p3', 'fastestLap', 'driverOfTheDay', 'perfectPodiumBonus'];

  items.forEach(item => {
    if (!item) return;
    const score = item.score;
    const round = item.round || {};
    const isFinalized = round.status === 'SCORED' || (score && extractNumericScore(score) !== null);

    if (!isFinalized || !score) return;

    const breakdown = typeof score === 'object' && score.breakdown ? score.breakdown : {};
    const roundId = round.roundId || item.roundId || '';
    const calcAt = score.calculatedAt || item.prediction?.submittedAt || new Date().toISOString();

    // Perfect Podium:
    // Either explicit perfectPodiumBonus > 0, OR p1, p2, p3 all exact (10, 7, 5 or 15, 10, 5)
    const hasPodiumBonus = (breakdown.perfectPodiumBonus || 0) > 0;
    const hasExact123 = (breakdown.p1 === 10 || breakdown.p1 === 15) &&
                        (breakdown.p2 === 7 || breakdown.p2 === 10) &&
                        (breakdown.p3 === 5);

    if (hasPodiumBonus || hasExact123) {
      perfectPodiumsEarned.push({ roundId, timestamp: calcAt });
    }

    // Fastest Lap: 7 pts
    if (breakdown.fastestLap === 7) {
      fastestLapEarned.push({ roundId, timestamp: calcAt });
    }

    // Wildcards / Race condition predictions:
    // safetyCar (5), virtualSafetyCar (5), redFlag (5), yellowFlag (4), wildCard (5)
    const conditionKeys = ['safetyCar', 'virtualSafetyCar', 'redFlag', 'yellowFlag', 'wildCard', 'retirementsOverUnder', 'lap1Leader'];
    conditionKeys.forEach(k => {
      if (typeof breakdown[k] === 'number' && breakdown[k] > 0) {
        wildcardsCount++;
        wildcardTimestamps.push(calcAt);
      }
    });

    // Check custom wildcard keys
    for (const [k, v] of Object.entries(breakdown)) {
      if (!coreKeys.includes(k) && !conditionKeys.includes(k) && typeof v === 'number' && v > 0) {
        wildcardsCount++;
        wildcardTimestamps.push(calcAt);
      }
    }

    // Perfect Round:
    // Max available points in round: Grand Prix 55 pts, Sprint 30 pts
    const scoreVal = extractNumericScore(score) || 0;
    const isSprint = roundId.includes('SPRINT');
    if ((isSprint && scoreVal >= 30) || (!isSprint && scoreVal >= 55)) {
      perfectRoundsEarned.push({ roundId, timestamp: calcAt });
    }
  });

  // 3. Map into full list of Achievement objects
  const defaultIso = new Date().toISOString();

  return CANONICAL_ACHIEVEMENT_REGISTRY.map(def => {
    let isUnlocked = false;
    let earnedAt = '';
    let currentVal = 0;
    let roundRef: string | undefined = undefined;

    switch (def.id) {
      case 'grid_regular':
        currentVal = distinctWeekendCount;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = Object.values(earliestWeekendEarnedMap).sort()[2] || defaultIso;
        }
        break;

      case 'grid_loyalist':
        currentVal = distinctWeekendCount;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = Object.values(earliestWeekendEarnedMap).sort()[4] || defaultIso;
        }
        break;

      case 'half_century':
        currentVal = seasonPoints;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = defaultIso;
        }
        break;

      case 'century_club':
        currentVal = seasonPoints;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = defaultIso;
        }
        break;

      case 'perfect_podium':
        currentVal = perfectPodiumsEarned.length;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = perfectPodiumsEarned[0].timestamp;
          roundRef = perfectPodiumsEarned[0].roundId;
        }
        break;

      case 'fastest_lap_hunter':
        currentVal = fastestLapEarned.length;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = fastestLapEarned[0].timestamp;
          roundRef = fastestLapEarned[0].roundId;
        }
        break;

      case 'wildcard_wizard':
        currentVal = wildcardsCount;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = wildcardTimestamps.sort()[2] || defaultIso;
        }
        break;

      case 'perfect_prediction_round':
        currentVal = perfectRoundsEarned.length;
        isUnlocked = currentVal >= def.targetValue;
        if (isUnlocked) {
          earnedAt = perfectRoundsEarned[0].timestamp;
          roundRef = perfectRoundsEarned[0].roundId;
        }
        break;
    }

    return {
      achievementId: `ach_${def.id}_${userId}`,
      userId,
      achievementType: def.type,
      title: def.title,
      description: def.description,
      badgeIcon: def.badgeIcon,
      category: def.category,
      earnedAt: isUnlocked ? earnedAt : '',
      roundId: roundRef,
      isUnlocked,
      progress: {
        current: Math.min(currentVal, def.targetValue),
        target: def.targetValue,
      },
    };
  });
}

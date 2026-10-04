/**
 * Canonical Prediction Points & Telemetry Scoring Utilities
 * 
 * Provides the single source of truth for:
 * - Parsing canonical numeric scores (handling numbers, strings like "+30 PTS", nulls, zeroes)
 * - Distinguishing scored vs pending predictions (pending predictions NEVER contribute points)
 * - Round deduplication (alias rounds e.g. 2026_17 -> 2026_15 and duplicate submissions)
 * - Calculating user profile telemetry metrics:
 *   - Total Prediction Points
 *   - Races Participated / Rounds Scored
 *   - Avg PTS / Round
 *   - Best Single Weekend
 *   - Exact P1, Perfect Podiums, Wildcards
 */

import { INITIAL_RACE_WEEKENDS } from '../services/mockData';
import { f1Data } from '../services/motorsport/data/f1Data';

export interface CanonicalPredictionStats {
  totalPoints: number;
  racesParticipated: number;
  avgPointsPerRound: number;
  bestWeekendScore: number;
  exactP1Count: number;
  perfectPodiumCount: number;
  wildcardsCorrect: number;
  scoredRoundsCount: number;
  pendingRoundsCount: number;
  roundScores: Record<string, number>;
}

/**
 * Normalizes round IDs to resolve alias identifiers (e.g. Baku 2026_17 -> 2026_15).
 */
export function normalizeCanonicalRoundId(roundId?: string): string {
  if (!roundId) return '';
  const clean = String(roundId).trim();
  if (clean === '2026_17_RACE_PREDICTION' || clean === '2026_17_RACE') {
    return '2026_15_RACE_PREDICTION';
  }
  return clean;
}

/**
 * Derives a raceWeekendId from a roundId if not explicitly provided.
 * e.g. "2026_15_RACE_PREDICTION" -> "2026_15"
 */
export function deriveWeekendId(roundId?: string): string {
  if (!roundId) return 'unknown_weekend';
  const clean = normalizeCanonicalRoundId(roundId);
  const parts = clean.split('_');
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[1]}`;
  }
  return clean;
}

/**
 * Extracts a canonical numeric score from any valid input representation.
 * Prioritizes canonical numeric score values, with clean fallback string extraction.
 * Returns null if the value represents an unscored / missing / null score.
 */
export function extractNumericScore(raw: any): number | null {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'number') {
    return isNaN(raw) ? null : raw;
  }

  if (typeof raw === 'object') {
    if (raw.totalScore !== undefined && raw.totalScore !== null) {
      return extractNumericScore(raw.totalScore);
    }
    if (raw.score !== undefined && raw.score !== null) {
      return extractNumericScore(raw.score);
    }
    if (raw.pointsEarned !== undefined && raw.pointsEarned !== null) {
      return extractNumericScore(raw.pointsEarned);
    }
    if (raw.points !== undefined && raw.points !== null) {
      return extractNumericScore(raw.points);
    }
    return null;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    // Strip everything except digits, minus, and decimal point (e.g. "+30 PTS" -> "30", "+0 PTS" -> "0")
    const cleaned = trimmed.replace(/[^0-9.-]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }

  return null;
}

/**
 * Evaluates an individual prediction record from history.
 */
export function evaluatePredictionItem(item: any): {
  isScored: boolean;
  isPending: boolean;
  numericScore: number;
  canonicalRoundId: string;
  raceWeekendId: string;
  breakdown: Record<string, any>;
  submittedAt: string;
} {
  const round = item.round || {};
  const pred = item.prediction || {};
  const weekend = item.weekend || {};

  const rawRoundId = round.roundId || pred.roundId || item.roundId || '';
  const canonicalRoundId = normalizeCanonicalRoundId(rawRoundId);
  const raceWeekendId =
    weekend.raceWeekendId ||
    round.raceWeekendId ||
    item.raceWeekendId ||
    deriveWeekendId(canonicalRoundId);

  const roundStatus = String(round.status || item.status || '').toUpperCase();
  const rawScore =
    item.score !== undefined
      ? item.score
      : item.pointsEarned !== undefined
      ? item.pointsEarned
      : item.totalScore;

  const scoreNum = extractNumericScore(rawScore);
  const isRoundExplicitlyScored = roundStatus === 'SCORED' || roundStatus === 'COMPLETED';

  // Scored condition:
  // 1. extractNumericScore returns a valid number (including legitimate 0!)
  // 2. OR the round is officially marked SCORED/COMPLETED and a score was recorded
  if (scoreNum !== null) {
    const breakdown =
      (typeof item.score === 'object' && item.score?.breakdown) ||
      item.breakdown ||
      {};

    return {
      isScored: true,
      isPending: false,
      numericScore: scoreNum,
      canonicalRoundId,
      raceWeekendId,
      breakdown,
      submittedAt: pred.submittedAt || item.submittedAt || '',
    };
  }

  if (isRoundExplicitlyScored && rawScore !== null && rawScore !== undefined) {
    return {
      isScored: true,
      isPending: false,
      numericScore: 0,
      canonicalRoundId,
      raceWeekendId,
      breakdown: {},
      submittedAt: pred.submittedAt || item.submittedAt || '',
    };
  }

  // Otherwise, it is a pending prediction that MUST NOT contribute points
  return {
    isScored: false,
    isPending: true,
    numericScore: 0,
    canonicalRoundId,
    raceWeekendId,
    breakdown: {},
    submittedAt: pred.submittedAt || item.submittedAt || '',
  };
}

/**
 * Calculates canonical profile stats from a user's prediction history array.
 * 
 * Invariants:
 * - Scored predictions contribute their canonical numeric score
 * - Pending predictions do NOT contribute points, nor count towards racesParticipated
 * - Zero-point scored predictions contribute 0 pts and count as a completed round
 * - Multiple completed races are aggregated across weekends
 * - Duplicate records for the same canonical round ID are deduplicated (highest score selected)
 * - Best single weekend sums all scored round points belonging to each weekend
 */
export function calculateUserStatsFromHistory(history: any[]): CanonicalPredictionStats {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      totalPoints: 0,
      racesParticipated: 0,
      avgPointsPerRound: 0,
      bestWeekendScore: 0,
      exactP1Count: 0,
      perfectPodiumCount: 0,
      wildcardsCorrect: 0,
      scoredRoundsCount: 0,
      pendingRoundsCount: 0,
      roundScores: {},
    };
  }

  // Deduplicate records by canonicalRoundId
  // If multiple records exist for the same canonical round, prioritize the scored record with highest score
  const canonicalScoredMap = new Map<
    string,
    {
      numericScore: number;
      raceWeekendId: string;
      breakdown: Record<string, any>;
      submittedAt: string;
    }
  >();

  const pendingRoundIds = new Set<string>();

  history.forEach(item => {
    if (!item) return;
    const evaluated = evaluatePredictionItem(item);
    if (!evaluated.canonicalRoundId) return;

    if (evaluated.isScored) {
      const existing = canonicalScoredMap.get(evaluated.canonicalRoundId);
      if (!existing || evaluated.numericScore > existing.numericScore) {
        canonicalScoredMap.set(evaluated.canonicalRoundId, {
          numericScore: evaluated.numericScore,
          raceWeekendId: evaluated.raceWeekendId,
          breakdown: evaluated.breakdown,
          submittedAt: evaluated.submittedAt,
        });
      }
      // If a round was scored, remove from pending
      pendingRoundIds.delete(evaluated.canonicalRoundId);
    } else if (evaluated.isPending) {
      if (!canonicalScoredMap.has(evaluated.canonicalRoundId)) {
        pendingRoundIds.add(evaluated.canonicalRoundId);
      }
    }
  });

  const scoredEntries = Array.from(canonicalScoredMap.entries());
  const roundScores: Record<string, number> = {};
  let totalPoints = 0;
  let exactP1Count = 0;
  let perfectPodiumCount = 0;
  let wildcardsCorrect = 0;

  const weekendScores: Record<string, number> = {};
  const coreBreakdownKeys = ['p1', 'p2', 'p3', 'fastestLap', 'driverOfTheDay', 'perfectPodiumBonus'];

  scoredEntries.forEach(([roundId, data]) => {
    const pts = data.numericScore;
    roundScores[roundId] = pts;
    totalPoints += pts;

    // Aggregate weekend totals
    const wId = data.raceWeekendId;
    weekendScores[wId] = (weekendScores[wId] || 0) + pts;

    // Performance telemetry
    const b = data.breakdown || {};
    if (b.p1 === 15 || b.exactP1 === 15 || b.p1 === 25) {
      exactP1Count++;
    }
    if ((b.perfectPodiumBonus || 0) > 0) {
      perfectPodiumCount++;
    }

    // Wildcards: non-core keys with positive points, or explicit wildCard
    if ((b.wildCard || 0) > 0) {
      wildcardsCorrect++;
    }
    for (const [k, v] of Object.entries(b)) {
      if (!coreBreakdownKeys.includes(k) && k !== 'wildCard' && typeof v === 'number' && v > 0) {
        wildcardsCorrect++;
      }
    }
  });

  const racesParticipated = scoredEntries.length;
  const avgPointsPerRound =
    racesParticipated > 0 ? Math.round((totalPoints / racesParticipated) * 10) / 10 : 0;

  const weekendTotals = Object.values(weekendScores);
  const bestWeekendScore = weekendTotals.length > 0 ? Math.max(0, ...weekendTotals) : 0;

  return {
    totalPoints,
    racesParticipated,
    avgPointsPerRound,
    bestWeekendScore,
    exactP1Count,
    perfectPodiumCount,
    wildcardsCorrect,
    scoredRoundsCount: scoredEntries.length,
    pendingRoundsCount: pendingRoundIds.size,
    roundScores,
  };
}

// ============================================================================
// FULL-SEASON MAXIMUM SCORE & PROGRESS TELEMETRY
// ============================================================================

export const MAX_POINTS_PER_RACE = 55;
export const MAX_POINTS_PER_SPRINT = 30;

export interface SeasonScoringConfig {
  pointsPerRace?: number;
  pointsPerSprint?: number;
  raceCount?: number;
  sprintCount?: number;
}

/**
 * Calculates the maximum possible season score derived from the authoritative
 * race weekend calendar and scoring rules.
 * 
 * Formula:
 * (number of race events × max race points) + (number of sprint events × max sprint points)
 * 
 * For Formula 1 (24 race weekends, 6 sprint races):
 * (24 × 55) + (6 × 30) = 1,320 + 180 = 1,500 PTS
 */
export function getSeasonMaxPredictionPoints(
  weekends?: Array<{ weekendType?: string; sessions?: Array<{ type?: string; sessionType?: string; name?: string; description?: string }> }>,
  config?: SeasonScoringConfig
): number {
  const pointsPerRace = config?.pointsPerRace ?? MAX_POINTS_PER_RACE;
  const pointsPerSprint = config?.pointsPerSprint ?? MAX_POINTS_PER_SPRINT;

  let raceCount = config?.raceCount;
  let sprintCount = config?.sprintCount;

  if (raceCount === undefined || sprintCount === undefined) {
    if (weekends && Array.isArray(weekends) && weekends.length > 0) {
      if (raceCount === undefined) {
        raceCount = weekends.length;
      }
      if (sprintCount === undefined) {
        sprintCount = weekends.filter(w => {
          if (w.weekendType === 'SPRINT') return true;
          if (w.sessions && Array.isArray(w.sessions)) {
            return w.sessions.some(s =>
              s.type === 'SPRINT' ||
              s.sessionType === 'SPRINT' ||
              (s.name && /sprint/i.test(s.name)) ||
              (s.description && /sprint/i.test(s.description))
            );
          }
          return false;
        }).length;
      }
    } else {
      // Default to authoritative Formula 1 championship calendar dataset
      raceCount = raceCount ?? (f1Data?.rounds?.length || 24);
      sprintCount = sprintCount ?? (
        f1Data?.rounds
          ? f1Data.rounds.filter(r =>
              r.sessions?.some(s =>
                /sprint/i.test(s.name) ||
                /sprint/i.test(s.description || '')
              )
            ).length
          : 6
      );
    }
  }

  return (raceCount * pointsPerRace) + (sprintCount * pointsPerSprint);
}

export interface SeasonProgressInfo {
  progressRatio: number; // 0 to 1 (clamped)
  progressPercent: number; // 0 to 100 (clamped)
  rawRatio: number;
  maxPoints: number;
}

/**
 * Calculates full-season progress percentage (clamped 0% to 100%) and ratio (0 to 1).
 */
export function calculateSeasonProgress(
  points: number,
  maxPoints: number = getSeasonMaxPredictionPoints()
): SeasonProgressInfo {
  const validPoints = Math.max(0, Math.round(points || 0));
  const validMax = Math.max(1, Math.round(maxPoints || 1500));
  const rawRatio = validPoints / validMax;
  const progressRatio = Math.min(Math.max(rawRatio, 0), 1);
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawRatio * 100)));

  return {
    progressRatio,
    progressPercent,
    rawRatio,
    maxPoints: validMax,
  };
}

/**
 * The Grid — Prediction Bench Result Bridge & Versioned Scoring
 * 
 * Safely bridges NormalizedSessionResult records into the Prediction Bench
 * scoring engine, preserving prediction lockout independence and auditability.
 */

import { NormalizedSessionResult } from '../../types/dataContract';
import { ScoringEngine, ScoringResult } from '../scoringEngine';
import { ScoringRules } from '../../types';

export interface EvaluatedPredictionScore {
  scoreId: string;
  userId: string;
  roundId: string;
  resultId: string;
  resultVersion: number;
  resultStatus: string;
  totalScore: number;
  breakdown: Record<string, number | undefined>;
  calculatedAt: string;
}

export class PredictionResultBridge {
  /**
   * Transforms a NormalizedSessionResult into the dictionary format expected by ScoringEngine.
   */
  public static extractScoringOutcome(result: NormalizedSessionResult): Record<string, any> {
    const outcome: Record<string, any> = {};

    const p1Entry = result.entries.find(e => e.position === 1);
    const p2Entry = result.entries.find(e => e.position === 2);
    const p3Entry = result.entries.find(e => e.position === 3);
    const flEntry = result.entries.find(e => e.hasFastestLap);

    if (p1Entry) outcome.p1 = p1Entry.driverId;
    if (p2Entry) outcome.p2 = p2Entry.driverId;
    if (p3Entry) outcome.p3 = p3Entry.driverId;
    if (flEntry) outcome.fastestLap = flEntry.driverId;

    return outcome;
  }

  /**
   * Scores a user prediction against a normalized session result with full version provenance.
   */
  public static evaluatePrediction(
    userId: string,
    roundId: string,
    predictionData: Record<string, any>,
    result: NormalizedSessionResult,
    rules?: Partial<ScoringRules>
  ): EvaluatedPredictionScore {
    const outcome = this.extractScoringOutcome(result);
    const scoreResult: ScoringResult = ScoringEngine.calculate(predictionData, outcome, rules);

    return {
      scoreId: `score-${roundId}-${userId}-v${result.versionNumber}`,
      userId,
      roundId,
      resultId: result.resultId,
      resultVersion: result.versionNumber,
      resultStatus: result.resultStatus,
      totalScore: scoreResult.totalScore,
      breakdown: scoreResult.breakdown,
      calculatedAt: new Date().toISOString(),
    };
  }
}

/**
 * THE GRDX — Strategy Room Authoritative Scoring Engine
 * 
 * Standardized 100-point scoring model across single-decision challenges
 * and multi-stage simulations.
 * 
 * Evaluates:
 * 1. Decision Quality (sound tactical choice vs known race telemetry)
 * 2. Race Time / Position Outcome (net delta seconds relative to baseline)
 * 3. Execution Consistency across multi-stage scenarios
 */

import {
  StrategyScenario,
  StrategyDecisionRecord,
  StrategyScoreReport
} from '../../types/strategy';

export interface RatingTierInfo {
  tier: 'legendary' | 'apex' | 'prudent' | 'gambler' | 'blunder';
  name: string;
  color: string;
  description: string;
}

/**
 * Returns rating tier and color given a 0-100 score
 */
export function getRatingTier(score: number): RatingTierInfo {
  if (score >= 90) {
    return {
      tier: 'legendary',
      name: 'Legendary Tactician',
      color: '#FFB000',
      description: 'Masterclass pit wall telemetry! Optimal tire compound selection and timing achieved maximum track advantage.'
    };
  }
  if (score >= 80) {
    return {
      tier: 'apex',
      name: 'Apex Strategist',
      color: '#00e676',
      description: 'Sharp strategic execution. You exploited race windows effectively with only minor theoretical margins left on the table.'
    };
  }
  if (score >= 65) {
    return {
      tier: 'prudent',
      name: 'Prudent Race Engineer',
      color: '#00e5ff',
      description: 'Sound defensive call, but rival delta or degradation curves could have been handled with higher aggression.'
    };
  }
  if (score >= 45) {
    return {
      tier: 'gambler',
      name: 'Gambler on the Pit Wall',
      color: '#FF7A00',
      description: 'Pitted into traffic or mistimed the degradation cliff. The call compromised race position.'
    };
  }
  return {
    tier: 'blunder',
    name: 'Strategy Blunder',
    color: '#FF3025',
    description: 'Severe tactical error. Tire compound or pit window mismatch resulted in heavy delta losses.'
  };
}

/**
 * Authoritatively calculates 100-point score report for a scenario attempt
 */
export function calculateAuthoritativeScore(
  scenario: StrategyScenario,
  decisions: StrategyDecisionRecord[]
): StrategyScoreReport {
  if (decisions.length === 0) {
    const tier = getRatingTier(0);
    return {
      finalScore: 0,
      decisionQualityScore: 0,
      timeOutcomeScore: 0,
      positionOutcomeScore: 0,
      consistencyScore: 0,
      ratingTier: tier,
      summaryFeedback: 'No strategic decisions recorded.'
    };
  }

  const isMultiStage = scenario.mode === 'race_simulation' || decisions.length > 1;
  const rubric = scenario.scoringRubric;

  // Weight allocations
  const decisionQualityMax = rubric.decisionQualityWeight * rubric.maxScore;
  const timeOutcomeMax = rubric.timeOutcomeWeight * rubric.maxScore;
  const positionOutcomeMax = rubric.positionOutcomeWeight * rubric.maxScore;
  const consistencyMax = rubric.consistencyWeight * rubric.maxScore;

  // 1. Decision Quality Component
  const avgDecisionScore = decisions.reduce(
    (sum, d) => sum + Math.max(0, Math.min(100, d.decisionScore)),
    0
  ) / decisions.length;
  const decisionQualityScore = Number(((avgDecisionScore / 100) * decisionQualityMax).toFixed(1));

  // 2. Time Outcome Component
  const netTimeDelta = decisions.reduce((sum, d) => sum + d.timeDeltaSeconds, 0);
  let timeOutcomeRatio = 0;
  if (netTimeDelta <= -2.0) {
    timeOutcomeRatio = 1.0;
  } else if (netTimeDelta <= 0) {
    timeOutcomeRatio = 0.85;
  } else if (netTimeDelta <= 3.0) {
    timeOutcomeRatio = 0.65;
  } else if (netTimeDelta <= 6.0) {
    timeOutcomeRatio = 0.40;
  } else if (netTimeDelta <= 10.0) {
    timeOutcomeRatio = 0.15;
  } else {
    timeOutcomeRatio = 0.0;
  }
  const timeOutcomeScore = Number((timeOutcomeRatio * timeOutcomeMax).toFixed(1));

  // 3. Position Outcome Component
  const netPositionDelta = decisions.reduce((sum, d) => sum + d.positionDelta, 0);
  let positionOutcomeRatio = 0.5; // baseline neutral
  if (netPositionDelta > 0) {
    positionOutcomeRatio = Math.min(1.0, 0.5 + netPositionDelta * 0.25);
  } else if (netPositionDelta < 0) {
    positionOutcomeRatio = Math.max(0.0, 0.5 + netPositionDelta * 0.25);
  }
  const positionOutcomeScore = Number((positionOutcomeRatio * positionOutcomeMax).toFixed(1));

  // 4. Consistency Component (for multi-stage simulations)
  let consistencyScore = 0;
  if (isMultiStage && consistencyMax > 0) {
    const allHigh = decisions.every(d => d.decisionScore >= 75);
    const minScore = Math.min(...decisions.map(d => d.decisionScore));
    if (allHigh) {
      consistencyScore = consistencyMax;
    } else if (minScore >= 60) {
      consistencyScore = Number((consistencyMax * 0.75).toFixed(1));
    } else if (minScore >= 40) {
      consistencyScore = Number((consistencyMax * 0.40).toFixed(1));
    } else {
      consistencyScore = 0;
    }
  }

  // Final Total Score bounded strictly to [0, 100]
  const rawTotal = Math.round(
    decisionQualityScore + timeOutcomeScore + positionOutcomeScore + consistencyScore
  );
  const finalScore = Math.max(0, Math.min(100, rawTotal));

  const ratingTier = getRatingTier(finalScore);

  return {
    finalScore,
    decisionQualityScore,
    timeOutcomeScore,
    positionOutcomeScore,
    consistencyScore,
    ratingTier,
    summaryFeedback: ratingTier.description
  };
}

/**
 * Backward compatibility alias
 */
export function calculateStrategyAttemptScore(
  scenario: StrategyScenario,
  decisions: StrategyDecisionRecord[]
) {
  return calculateAuthoritativeScore(scenario, decisions);
}

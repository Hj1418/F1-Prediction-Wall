/**
 * THE GRDX — Pre-Race Strategy Deterministic Simulation Engine
 * 
 * Evaluates user-submitted or predefined reference race strategies against
 * scenario baselines, tire physics models, pit-stop time losses, and competitor telemetry.
 * 
 * Rules:
 * - Deterministic: identical inputs always produce identical outcomes.
 * - No AI API calls at runtime.
 * - Pit stop losses are never double-counted.
 * - Stint durations, compound degradation, and tire cliff drop-offs are mathematically modeled.
 * - Scoring is bounded between 0 and 100 with clear component weightings.
 */

import {
  PreRaceScenario,
  PreRaceStrategyPlan,
  PreRaceSimulatedOutcome,
  PreRaceStintSimulationBreakdown,
  TireCompound
} from '../../types/strategy';
import { getRatingTier } from './strategyScoring';

export const PRE_RACE_SIMULATION_VERSION = 1;

/**
 * Compound pace offsets relative to Medium (0.0s baseline)
 */
export const COMPOUND_PACE_DELTA: Record<TireCompound, number> = {
  soft: -0.65,
  medium: 0.0,
  hard: 0.75,
  intermediate: 2.5,
  wet: 5.0
};

export interface StrategyValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a strategy plan against scenario constraints
 */
export function validatePreRaceStrategy(
  scenario: PreRaceScenario,
  plan: PreRaceStrategyPlan
): StrategyValidationResult {
  const errors: string[] = [];

  if (!plan.stints || plan.stints.length === 0) {
    errors.push('Strategy must have at least one stint.');
    return { isValid: false, errors };
  }

  const totalStintLaps = plan.stints.reduce((sum, s) => sum + (s.laps || 0), 0);
  if (totalStintLaps !== scenario.totalLaps) {
    errors.push(
      `Total stint laps (${totalStintLaps}) must exactly equal race distance (${scenario.totalLaps} laps).`
    );
  }

  // Check stint laps are strictly positive
  plan.stints.forEach((stint, idx) => {
    if (!stint.laps || stint.laps <= 0) {
      errors.push(`Stint ${idx + 1} must have at least 1 lap.`);
    }
    if (!scenario.availableCompounds.includes(stint.compound)) {
      errors.push(
        `Stint ${idx + 1} uses invalid compound "${stint.compound}". Available: ${scenario.availableCompounds.join(', ')}.`
      );
    }
  });

  // Check pit stops
  const actualPitStops = Math.max(0, plan.stints.length - 1);
  if (actualPitStops < scenario.rules.minPitStops) {
    errors.push(
      `Strategy has ${actualPitStops} pit stop(s), but the scenario requires at least ${scenario.rules.minPitStops}.`
    );
  }

  // Mandatory different compounds rule for dry races
  if (scenario.rules.mandatoryDifferentCompounds && scenario.trackCondition === 'dry') {
    const uniqueCompounds = new Set(plan.stints.map(s => s.compound));
    if (uniqueCompounds.size < 2) {
      errors.push(
        'FIA Sporting Regulations require using at least two different dry tire compounds during the race.'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats seconds into human-readable time string: e.g. "1h 14m 58.2s"
 */
export function formatRaceTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 60).toFixed(1);
  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Executes the deterministic simulation of a pre-race strategy
 */
export function simulatePreRaceStrategy(
  scenario: PreRaceScenario,
  plan: PreRaceStrategyPlan
): PreRaceSimulatedOutcome {
  const validation = validatePreRaceStrategy(scenario, plan);
  if (!validation.isValid) {
    throw new Error(`Invalid strategy: ${validation.errors.join(' ')}`);
  }

  const baseLapTime = scenario.baseLapTimeSeconds;
  const stintBreakdowns: PreRaceStintSimulationBreakdown[] = [];
  let totalRaceTimeSeconds = 0;
  let totalDegradationLost = 0;
  let totalCliffPenalty = 0;
  let currentLapPointer = 1;

  // Stint by stint calculation
  plan.stints.forEach((stint, idx) => {
    const compound = stint.compound;
    const laps = stint.laps;
    const startLap = currentLapPointer;
    const endLap = currentLapPointer + laps - 1;
    currentLapPointer = endLap + 1;

    const compoundPaceOffset = COMPOUND_PACE_DELTA[compound] || 0.0;
    const degRate = scenario.tireDegradationSecondsPerLap[compound] || 0.08;
    const cliffLap = scenario.tireCliffLap[compound] || 25;

    let stintTotalSeconds = 0;
    let stintDegTime = 0;
    let stintCliffTime = 0;

    for (let l = 1; l <= laps; l++) {
      // Base lap pace adjusted for compound grip
      let lapTime = baseLapTime + compoundPaceOffset;

      // Linear thermal and mechanical degradation with tire age
      const degDelta = (l - 1) * degRate;
      stintDegTime += degDelta;
      lapTime += degDelta;

      // Steep cliff drop-off if pushed beyond compound thermal life
      if (l > cliffLap) {
        const pastCliff = l - cliffLap;
        const cliffDelta = pastCliff * 0.35;
        stintCliffTime += cliffDelta;
        lapTime += cliffDelta;
      }

      stintTotalSeconds += lapTime;
    }

    // Traffic model: if a driver starts in midfield (P4-P10) or pits into early traffic
    let trafficTimeLost = 0;
    if (idx === 0 && scenario.startingPosition > 3 && laps > 10) {
      // Slight dirty air penalty in stint 1 while trailing competitors
      trafficTimeLost = Math.min(2.5, laps * 0.05);
      stintTotalSeconds += trafficTimeLost;
    }

    totalDegradationLost += stintDegTime;
    totalCliffPenalty += stintCliffTime;
    totalRaceTimeSeconds += stintTotalSeconds;

    stintBreakdowns.push({
      stintNumber: idx + 1,
      compound,
      laps,
      startLap,
      endLap,
      averageLapTime: Number((stintTotalSeconds / laps).toFixed(3)),
      stintTimeSeconds: Number(stintTotalSeconds.toFixed(2)),
      degradationTimeLostSeconds: Number(stintDegTime.toFixed(2)),
      cliffPenaltySeconds: Number(stintCliffTime.toFixed(2)),
      trafficTimeLostSeconds: Number(trafficTimeLost.toFixed(2))
    });
  });

  // Add pit stop time loss: exactly 1 loss per pit stop (never double-counted)
  const pitStopCount = Math.max(0, plan.stints.length - 1);
  const totalPitTimeLoss = pitStopCount * scenario.pitLossSeconds;
  totalRaceTimeSeconds += totalPitTimeLoss;
  totalRaceTimeSeconds = Number(totalRaceTimeSeconds.toFixed(2));

  // Compare with baseline outcome
  const baselineTime = scenario.baselineOutcome.totalRaceTimeSeconds;
  const timeDeltaSeconds = Number((totalRaceTimeSeconds - baselineTime).toFixed(2));

  // Determine simulated position by ranking against competitor finishing times
  const allFinishingTimes: Array<{ name: string; time: number; isUser: boolean }> = [
    { name: 'You', time: totalRaceTimeSeconds, isUser: true }
  ];

  scenario.competitors.forEach(c => {
    allFinishingTimes.push({
      name: c.driver,
      time: c.estimatedTotalRaceTimeSeconds,
      isUser: false
    });
  });

  allFinishingTimes.sort((a, b) => a.time - b.time);
  const userRankIndex = allFinishingTimes.findIndex(f => f.isUser);
  const simulatedPosition = userRankIndex + 1;
  const baselinePosition = scenario.baselineOutcome.finishingPosition;
  const positionDelta = baselinePosition - simulatedPosition; // e.g. P5 -> P3 = +2 positions

  // Strategic debrief deductions
  const keyAdvantages: string[] = [];
  const keyDisadvantages: string[] = [];
  const actionableLessons: string[] = [];

  if (timeDeltaSeconds < 0) {
    keyAdvantages.push(
      `Saved ${Math.abs(timeDeltaSeconds)}s total race time compared to the baseline strategy.`
    );
  } else if (timeDeltaSeconds > 0) {
    keyDisadvantages.push(
      `Conceded ${timeDeltaSeconds}s total race time relative to the baseline strategy.`
    );
  } else {
    keyAdvantages.push('Matched the baseline race time exactly.');
  }

  // Analyze cliff penalties
  if (totalCliffPenalty > 1.5) {
    keyDisadvantages.push(
      `Extended tire stints lost ${totalCliffPenalty.toFixed(1)}s past the degradation cliff threshold.`
    );
    actionableLessons.push(
      'Box 2-3 laps earlier before the thermal degradation cliff drops lap times by >0.4s/lap.'
    );
  } else {
    keyAdvantages.push(
      'Well-managed stint lengths prevented severe tire cliff drop-offs.'
    );
  }

  // Analyze pit stop count
  if (pitStopCount < scenario.baselineOutcome.pitStopCount) {
    keyAdvantages.push(
      `Saved ${scenario.pitLossSeconds}s in pit lane transit time by executing a 1-stop strategy.`
    );
    actionableLessons.push(
      'A 1-stop strategy requires defensive track positioning in dirty air to hold off charging multi-stoppers.'
    );
  } else if (pitStopCount > scenario.baselineOutcome.pitStopCount) {
    keyDisadvantages.push(
      `Incurred an extra ${scenario.pitLossSeconds}s pit loss that required heavy on-track passing.`
    );
    actionableLessons.push(
      'A multi-stop strategy is only advantageous if traffic windows offer immediate clean air for aggressive out-laps.'
    );
  }

  if (positionDelta > 0) {
    keyAdvantages.push(
      `Promoted ${positionDelta} position(s) from baseline (Finished P${simulatedPosition}).`
    );
  } else if (positionDelta < 0) {
    keyDisadvantages.push(
      `Lost ${Math.abs(positionDelta)} position(s) on track compared to baseline finish.`
    );
  }

  if (actionableLessons.length === 0) {
    actionableLessons.push(
      'Optimal compound pairing and stint balancing achieved peak track position.'
    );
  }

  // =========================================================================
  // AUTHORITATIVE SCORING MODEL (0 - 100 PTS)
  // Decision Quality: 50%, Race Outcome: 30%, Strategy Efficiency: 20%
  // =========================================================================

  // 1. Decision Quality (0 to 50 pts)
  let decisionQualityScore = 50;
  if (totalCliffPenalty > 4.0) {
    decisionQualityScore -= 18;
  } else if (totalCliffPenalty > 1.5) {
    decisionQualityScore -= 8;
  }
  // Compound suitability penalty
  const usesSoftOnHighDeg = scenario.tireDegradationSecondsPerLap.soft > 0.15 &&
    plan.stints.some(s => s.compound === 'soft' && s.laps > 18);
  if (usesSoftOnHighDeg) {
    decisionQualityScore -= 12;
  }
  decisionQualityScore = Math.max(10, Math.min(50, decisionQualityScore));

  // 2. Race Outcome (0 to 30 pts)
  let raceOutcomeScore = 15; // baseline neutral
  if (positionDelta > 0) {
    raceOutcomeScore += Math.min(15, positionDelta * 7);
  } else if (positionDelta < 0) {
    raceOutcomeScore -= Math.min(15, Math.abs(positionDelta) * 6);
  }
  if (timeDeltaSeconds < -3.0) {
    raceOutcomeScore += 5;
  } else if (timeDeltaSeconds > 5.0) {
    raceOutcomeScore -= 5;
  }
  raceOutcomeScore = Math.max(0, Math.min(30, raceOutcomeScore));

  // 3. Strategy Efficiency (0 to 20 pts)
  let strategyEfficiencyScore = 20;
  if (totalDegradationLost > 35) {
    strategyEfficiencyScore -= 6;
  }
  if (pitStopCount > 2) {
    strategyEfficiencyScore -= 6;
  }
  strategyEfficiencyScore = Math.max(4, Math.min(20, strategyEfficiencyScore));

  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(decisionQualityScore + raceOutcomeScore + strategyEfficiencyScore))
  );

  const ratingTier = getRatingTier(finalScore);

  let debriefSummary = `Finished P${simulatedPosition} (${formatRaceTime(totalRaceTimeSeconds)}), `;
  if (positionDelta > 0) {
    debriefSummary += `gaining ${positionDelta} place(s) vs the baseline P${baselinePosition} finish!`;
  } else if (positionDelta < 0) {
    debriefSummary += `dropping ${Math.abs(positionDelta)} place(s) behind the baseline P${baselinePosition}.`;
  } else {
    debriefSummary += `matching the baseline P${baselinePosition} result with ${timeDeltaSeconds < 0 ? `${Math.abs(timeDeltaSeconds)}s faster pace` : 'consistent execution'}.`;
  }

  // =========================================================================
  // DETAILED MODELED INFLUENCING FACTORS (Section 8.B)
  // =========================================================================
  const startingStint = plan.stints[0];
  const startingCompound = startingStint.compound;
  const startingOffset = COMPOUND_PACE_DELTA[startingCompound] || 0.0;
  const longestStint = [...plan.stints].sort((a, b) => b.laps - a.laps)[0];

  const influencingFactors = [
    {
      factorName: 'Starting Compound Pace & Launch',
      decisionMade: `Started on ${startingCompound.toUpperCase()} (${startingStint.laps} Laps)`,
      expectedTradeoff: startingCompound === 'soft'
        ? 'High initial launch grip into Turn 1 vs rapid thermal wear'
        : startingCompound === 'medium'
        ? 'Balanced launch pace with consistent early degradation'
        : 'Maximum stint durability but slower out-lap warmup',
      calculatedEffect: startingOffset < 0
        ? `${Math.abs(startingOffset)}s/lap compound pace advantage over Medium baseline`
        : startingOffset > 0
        ? `+${startingOffset}s/lap initial pace deficit vs softer runners`
        : 'Neutral baseline launch pace matching primary rivals',
      impact: (startingOffset < 0 ? 'helped' : startingOffset > 0 ? 'hurt' : 'neutral') as 'helped' | 'hurt' | 'neutral'
    },
    {
      factorName: 'Pit Stop Transit Loss',
      decisionMade: `${pitStopCount} Pit Stop(s)`,
      expectedTradeoff: `Each stop incurs ${scenario.pitLossSeconds}s transit time loss`,
      calculatedEffect: `${totalPitTimeLoss}s total pit loss (${
        pitStopCount < scenario.baselineOutcome.pitStopCount
          ? `Saved ${scenario.pitLossSeconds}s vs baseline`
          : pitStopCount > scenario.baselineOutcome.pitStopCount
          ? `Conceded +${(pitStopCount - scenario.baselineOutcome.pitStopCount) * scenario.pitLossSeconds}s vs baseline`
          : 'Matched baseline pit stop transit loss'
      })`,
      impact: (pitStopCount < scenario.baselineOutcome.pitStopCount ? 'helped' : pitStopCount > scenario.baselineOutcome.pitStopCount ? 'hurt' : 'neutral') as 'helped' | 'hurt' | 'neutral'
    },
    {
      factorName: 'Tire Degradation & Cliff Drop-off',
      decisionMade: `Longest stint: ${longestStint.compound.toUpperCase()} (${longestStint.laps}L vs ${scenario.tireCliffLap[longestStint.compound]}L cliff)`,
      expectedTradeoff: 'Extending stint protects track position but risks steep thermal cliff drop-off',
      calculatedEffect: totalCliffPenalty > 0
        ? `Incurred +${totalCliffPenalty.toFixed(1)}s penalty exceeding compound cliff threshold`
        : '0.0s lost to cliff; degradation remained linear throughout',
      impact: (totalCliffPenalty > 1.5 ? 'hurt' : 'helped') as 'helped' | 'hurt' | 'neutral'
    },
    {
      factorName: 'Track Position & Traffic Management',
      decisionMade: pitStopCount > 0 ? `Pit window triggered at Lap ${plan.stints[0].endLap}` : 'Zero stops (track position focus)',
      expectedTradeoff: 'Pitting into clean air preserves out-lap delta; dirty air costs ~0.05s/lap',
      calculatedEffect: positionDelta >= 0
        ? `Promoted to P${simulatedPosition} with clean track position window`
        : `Encountered traffic deltas, conceding ${Math.abs(positionDelta)} place(s) vs baseline`,
      impact: (positionDelta >= 0 ? 'helped' : 'hurt') as 'helped' | 'hurt' | 'neutral'
    }
  ];

  // =========================================================================
  // RISK ASSESSMENT (Section 8.C)
  // =========================================================================
  const didRiskMaterialize = totalCliffPenalty > 1.5 || timeDeltaSeconds > 1.0 || positionDelta < 0;
  const riskAssessment = {
    mainRiskAccepted: plan.mainRisk || 'Stretching tire stint to minimize pit stops.',
    riskContext: `In ${scenario.circuitName}, tire degradation is ${scenario.tireDegradationSecondsPerLap[startingCompound]}s/lap with a pit loss of ${scenario.pitLossSeconds}s.`,
    didRiskMaterialize,
    calculatedConsequence: didRiskMaterialize
      ? totalCliffPenalty > 1.5
        ? `Tire degradation cliff materialized, costing +${totalCliffPenalty.toFixed(1)}s in the final laps of the stint.`
        : `Overall pace was insufficient to offset traffic/pit delta, finishing ${timeDeltaSeconds > 0 ? `+${timeDeltaSeconds}s` : 'behind'} baseline.`
      : 'Risk was successfully mitigated: tire wear stayed within manageable thermal thresholds without triggering the cliff.',
    alternativeDecision: pitStopCount === 1
      ? 'A 2-stop strategy with an aggressive undercut could eliminate late-stint degradation.'
      : 'Extending the initial stint by 3-4 laps to shorten the final stint would provide higher grip at the finish.'
  };

  // =========================================================================
  // WHAT WORKED & WHAT DID NOT WORK (Section 8.D)
  // =========================================================================
  const whatWorked: string[] = [];
  const whatDidNotWork: string[] = [];

  if (timeDeltaSeconds <= 0) {
    whatWorked.push(`Total race time beat baseline by ${Math.abs(timeDeltaSeconds)}s.`);
  } else {
    whatDidNotWork.push(`Total race time conceded +${timeDeltaSeconds}s vs baseline benchmark.`);
  }

  if (totalCliffPenalty <= 1.5) {
    whatWorked.push('Kept stint lengths within the compound cliff threshold, preventing steep lap-time drop-offs.');
  } else {
    whatDidNotWork.push(`Stretching ${longestStint.compound.toUpperCase()} to lap ${longestStint.endLap} crossed the thermal cliff by ${longestStint.laps - scenario.tireCliffLap[longestStint.compound]} laps (+${totalCliffPenalty.toFixed(1)}s).`);
  }

  if (pitStopCount <= scenario.baselineOutcome.pitStopCount) {
    whatWorked.push(`Executing ${pitStopCount} stop(s) saved pit transit exposure.`);
  } else {
    whatDidNotWork.push(`Incurring ${pitStopCount * scenario.pitLossSeconds}s total pit loss required high on-track passing delta.`);
  }

  if (whatWorked.length === 0) {
    whatWorked.push('Completed race distance with consistent mechanical reliability and steady lap execution.');
  }

  if (whatDidNotWork.length === 0) {
    whatDidNotWork.push('Clean execution left minimal pace on the table; minor gains could be found by fine-tuning pit entry by 1-2 laps.');
  }

  return {
    simulatedFinishingPosition: simulatedPosition,
    baselineFinishingPosition: baselinePosition,
    positionDelta,
    simulatedTotalRaceTimeSeconds: totalRaceTimeSeconds,
    baselineTotalRaceTimeSeconds: baselineTime,
    timeDeltaSeconds,
    formattedSimulatedTime: formatRaceTime(totalRaceTimeSeconds),
    pitStopCount,
    stintBreakdowns,
    keyAdvantages,
    keyDisadvantages,
    actionableLessons,
    influencingFactors,
    riskAssessment,
    whatWorked,
    whatDidNotWork,
    scoreBreakdown: {
      decisionQualityScore,
      raceOutcomeScore,
      strategyEfficiencyScore,
      finalScore
    },
    ratingTier,
    debriefSummary
  };
}

import { ScoringRules, ScoreBreakdown } from '../types';

export interface ScoringResult {
  breakdown: ScoreBreakdown;
  totalScore: number;
}

export class ScoringEngine {
  /**
   * Calculates points and breakdown for a user prediction against official results.
   */
  public static calculate(
    predictionData: Record<string, any> | undefined,
    resultData: Record<string, any> | undefined,
    rules: Partial<ScoringRules> = {}
  ): ScoringResult {
    const defaultRules: ScoringRules = {
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
      retirementsOverUnder: 10,
      lap1Leader: 10,
      winningMargin: 10,
      rainSession: 10,
      poleMargin: 10,
      q1Elimination: 10,
      sprintDnf: 10,
      perfectPodiumBonus: 10,
      ...rules,
    };

    const breakdown: ScoreBreakdown = {};
    let totalScore = 0;

    if (!predictionData || !resultData) {
      return { breakdown, totalScore: 0 };
    }

    // Explicit DSQ / DNF handling: Disqualified drivers are ineligible for points
    const dsqSet = new Set<string>(
      Array.isArray(resultData.disqualifiedDrivers) ? resultData.disqualifiedDrivers : []
    );

    const officialPodium = [resultData.p1, resultData.p2, resultData.p3]
      .filter(Boolean)
      .filter(d => !dsqSet.has(d));

    let isP1Exact = false;
    let isP2Exact = false;
    let isP3Exact = false;

    // Evaluate P1 (0 pts if DNF/DNS or DSQ)
    if (predictionData.p1 && resultData.p1 && !dsqSet.has(predictionData.p1)) {
      if (predictionData.p1 === resultData.p1) {
        breakdown.p1 = defaultRules.exactP1;
        isP1Exact = true;
      } else if (officialPodium.includes(predictionData.p1)) {
        breakdown.p1 = defaultRules.podiumWrongPosition;
      } else {
        breakdown.p1 = 0;
      }
      totalScore += breakdown.p1;
    } else {
      breakdown.p1 = 0;
    }

    // Evaluate P2 (0 pts if DNF/DNS or DSQ)
    if (predictionData.p2 && resultData.p2 && !dsqSet.has(predictionData.p2)) {
      if (predictionData.p2 === resultData.p2) {
        breakdown.p2 = defaultRules.exactP2;
        isP2Exact = true;
      } else if (officialPodium.includes(predictionData.p2)) {
        breakdown.p2 = defaultRules.podiumWrongPosition;
      } else {
        breakdown.p2 = 0;
      }
      totalScore += breakdown.p2;
    } else {
      breakdown.p2 = 0;
    }

    // Evaluate P3 (0 pts if DNF/DNS or DSQ)
    if (predictionData.p3 && resultData.p3 && !dsqSet.has(predictionData.p3)) {
      if (predictionData.p3 === resultData.p3) {
        breakdown.p3 = defaultRules.exactP3;
        isP3Exact = true;
      } else if (officialPodium.includes(predictionData.p3)) {
        breakdown.p3 = defaultRules.podiumWrongPosition;
      } else {
        breakdown.p3 = 0;
      }
      totalScore += breakdown.p3;
    } else {
      breakdown.p3 = 0;
    }

    // Perfect Podium Bonus (only if all 3 podium spots are exact and classified)
    if (isP1Exact && isP2Exact && isP3Exact) {
      breakdown.perfectPodiumBonus = defaultRules.perfectPodiumBonus;
      totalScore += breakdown.perfectPodiumBonus;
    } else {
      breakdown.perfectPodiumBonus = 0;
    }

    // Evaluate Fastest Lap (0 pts if DSQ)
    if (predictionData.fastestLap && resultData.fastestLap && !dsqSet.has(predictionData.fastestLap)) {
      if (predictionData.fastestLap === resultData.fastestLap) {
        breakdown.fastestLap = defaultRules.fastestLap;
      } else {
        breakdown.fastestLap = 0;
      }
      totalScore += breakdown.fastestLap;
    } else {
      breakdown.fastestLap = 0;
    }

    // Evaluate Driver of the Day
    if (predictionData.driverOfTheDay && resultData.driverOfTheDay && !dsqSet.has(predictionData.driverOfTheDay)) {
      if (predictionData.driverOfTheDay === resultData.driverOfTheDay) {
        breakdown.driverOfTheDay = defaultRules.driverOfTheDay;
      } else {
        breakdown.driverOfTheDay = 0;
      }
      totalScore += breakdown.driverOfTheDay;
    } else {
      breakdown.driverOfTheDay = 0;
    }

    // Evaluate all Wildcards & Dynamic fields (safetyCar, virtualSafetyCar, redFlag, poleMargin, winningMargin, etc.)
    const coreFields = ['p1', 'p2', 'p3', 'perfectPodiumBonus', 'fastestLap', 'driverOfTheDay'];
    for (const [key, predVal] of Object.entries(predictionData)) {
      if (coreFields.includes(key)) continue;
      if (predVal !== undefined && resultData[key] !== undefined) {
        const predNorm = String(predVal).trim().toUpperCase();
        const resNorm = String(resultData[key]).trim().toUpperCase();
        const pts = defaultRules[key] ?? defaultRules.wildCard ?? 10;
        if (predNorm === resNorm) {
          breakdown[key] = pts;
        } else {
          breakdown[key] = 0;
        }
        totalScore += breakdown[key] || 0;
      }
    }

    return { breakdown, totalScore };
  }
}

/**
 * THE GRDX — Strategy Room Deterministic Simulation Engine
 * 
 * Pure, UI-independent mathematical simulation of Formula 1 race strategies.
 * Evaluates decisions against scenario rules, tire degradation models, pit window physics,
 * undercut/overcut gaps, safety car delta times, and track condition shifts.
 */

import {
  StrategyScenario,
  StrategyRaceState,
  StrategyDecisionPoint,
  StrategySimulationParameters,
  StrategyDecisionResolution,
  TireCompound,
  SafetyCarStatus,
} from '../../types/strategy';

export const SIMULATION_ENGINE_VERSION = 1;

export interface SimulationStepResult {
  nextState: StrategyRaceState;
  timeDeltaSeconds: number; // negative = time gained, positive = time lost
  positionDelta: number; // positive = positions gained, negative = positions lost
  eventLog: string[];
  decisionScore: number;
  explanation: string;
  isOptimal: boolean;
  isDefensible: boolean;
  strategicTradeoff: string;
}

/**
 * Validates that an action ID is permitted for the given decision point.
 */
export function isActionPermitted(decisionPoint: StrategyDecisionPoint, actionId: string): boolean {
  return decisionPoint.availableActions.some(a => a.id === actionId);
}

/**
 * Calculates tire degradation time loss in seconds for a specific compound and age.
 */
export function calculateTireDegradationDelta(
  compound: TireCompound,
  ageLaps: number,
  params: StrategySimulationParameters
): number {
  const ratePerLap = params.tireDegradationSecondsPerLap[compound] || 0.08;
  const cliffLap = params.tireCliffLap[compound] || 25;

  let totalLoss = ageLaps * ratePerLap;
  if (ageLaps > cliffLap) {
    const lapsPastCliff = ageLaps - cliffLap;
    totalLoss += lapsPastCliff * 0.45; // steep thermal degradation cliff
  }
  return Number(totalLoss.toFixed(2));
}

/**
 * Calculates pit stop time loss under the given safety car status.
 */
export function calculatePitLoss(
  status: SafetyCarStatus,
  params: StrategySimulationParameters
): number {
  if (status === 'vsc') {
    return params.safetyCarRules.vscPitLossSeconds;
  }
  if (status === 'safety_car') {
    return params.safetyCarRules.scPitLossSeconds;
  }
  return params.pitLossSeconds;
}

/**
 * Executes a deterministic simulation step for an action at a decision point.
 * Supports both:
 * - (scenario, currentState, actionId, stepIndex)
 * - (currentState, decisionPoint, actionId, params)
 */
export function executeSimulationStep(
  scenarioOrState: StrategyScenario | StrategyRaceState,
  stateOrPoint: StrategyRaceState | StrategyDecisionPoint,
  actionId: string,
  paramsOrIndex?: StrategySimulationParameters | number
): StrategyDecisionResolution {
  let currentState: StrategyRaceState;
  let decisionPoint: StrategyDecisionPoint;
  let params: StrategySimulationParameters;

  if ('decisionPoints' in scenarioOrState) {
    const scenario = scenarioOrState as StrategyScenario;
    currentState = stateOrPoint as StrategyRaceState;
    const stepIndex = typeof paramsOrIndex === 'number' ? paramsOrIndex : 0;
    decisionPoint = scenario.decisionPoints[stepIndex] || scenario.decisionPoints[0];
    params = scenario.simulationParameters;
  } else {
    currentState = scenarioOrState as StrategyRaceState;
    decisionPoint = stateOrPoint as StrategyDecisionPoint;
    params = (paramsOrIndex as StrategySimulationParameters) || {
      pitLossSeconds: 22.0,
      pitStopDurationSeconds: 2.5,
      tireDegradationSecondsPerLap: { soft: 0.12, medium: 0.08, hard: 0.04, intermediate: 0.15, wet: 0.2 },
      baseLapTimeSeconds: 90.0,
      tireCliffLap: { soft: 15, medium: 25, hard: 38, intermediate: 20, wet: 22 },
      weatherTransitionRules: {
        willRain: false,
        dryPacePenaltyWithWetsSeconds: 12.0,
        wetPacePenaltyWithSlicksSeconds: 18.0
      },
      safetyCarRules: {
        status: 'none',
        lapsRemaining: 0,
        normalPitLossSeconds: 22.0,
        vscPitLossSeconds: 12.0,
        scPitLossSeconds: 15.0,
        fieldBunchedup: false
      },
      randomnessPolicy: 'none'
    };
  }

  if (!isActionPermitted(decisionPoint, actionId)) {
    throw new Error(`Action "${actionId}" is not permitted for decision point "${decisionPoint.id}".`);
  }

  const selectedAction = decisionPoint.availableActions.find(a => a.id === actionId)!;
  const resolution: StrategyDecisionResolution | undefined =
    decisionPoint.resolutionRules.resolutions[actionId];

  if (!resolution) {
    throw new Error(`No resolution rules defined for action "${actionId}" at decision point "${decisionPoint.id}".`);
  }

  // Clone state
  const baseNextState: StrategyRaceState = { ...currentState };

  // Apply explicit resolution state overrides
  Object.assign(baseNextState, resolution.nextState);

  // If a pit stop action was executed with a target compound
  if (selectedAction.targetCompound) {
    baseNextState.tireCompound = selectedAction.targetCompound;
    baseNextState.tireAgeLaps = 0;
    baseNextState.tireWear = 0;
  }

  // Ensure lap counter progresses if specified or natural increment
  if (resolution.nextState.currentLap === undefined) {
    baseNextState.currentLap = Math.min(baseNextState.totalLaps, baseNextState.currentLap + 1);
  }

  // Ensure position bounds are respected (1 to 20)
  const calculatedPos = Math.max(1, Math.min(20, baseNextState.position));
  baseNextState.position = calculatedPos;

  // Build structured event log
  const eventLog = [...resolution.eventLog];

  return {
    actionId,
    nextState: baseNextState,
    timeDeltaSeconds: resolution.timeDeltaSeconds,
    positionDelta: resolution.positionDelta,
    eventLog,
    decisionScore: resolution.decisionScore,
    explanation: resolution.explanation,
    isOptimal: resolution.isOptimal,
    isDefensible: resolution.isDefensible,
    strategicTradeoff: resolution.strategicTradeoff,
  };
}

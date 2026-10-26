/**
 * THE GRDX — Strategy Room Data Models & Contracts
 * 
 * Defines data structures for:
 * - Strategy modes (single challenges vs multi-stage race simulations)
 * - Race state, telemetry, and tire physics parameters
 * - Decision points, action options, resolution rules, and event logs
 * - Simulation engine parameters and deterministic scoring rubrics
 * - Attempt records, competitive point ledger, and leaderboards
 */

export type StrategyMode = 'challenge' | 'race_simulation';

export type StrategyCategory =
  | 'pit_window'
  | 'undercut_overcut'
  | 'safety_car'
  | 'weather_tires'
  | 'pace_management'
  | 'race_management';

export type TireCompound =
  | 'soft'
  | 'medium'
  | 'hard'
  | 'intermediate'
  | 'wet';

export type StrategyDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export type TrackCondition = 'dry' | 'damp' | 'wet';
export type SafetyCarStatus = 'none' | 'vsc' | 'safety_car';

export interface StrategyRaceState {
  currentLap: number;
  totalLaps: number;
  position: number;
  gapAheadSeconds: number | null;
  gapBehindSeconds: number | null;
  tireCompound: TireCompound;
  tireAgeLaps: number;
  tireWear: number; // 0 to 100%
  trackCondition: TrackCondition;
  safetyCar: SafetyCarStatus;
  pitLossSeconds: number;
  // Rival & track telemetry
  rivalDriver?: string;
  rivalCompound?: TireCompound;
  rivalTireAge?: number;
  rivalGapSeconds?: number;
  weatherForecast?: string;
  trafficAhead?: boolean;
  notes?: string;
}

export interface StrategyActionOption {
  id: string;
  action: string;
  label: string;
  description: string;
  targetCompound?: TireCompound;
  riskLevel?: 'low' | 'medium' | 'high';
  tacticalIntent?: string;
}

export interface WeatherTransitionRules {
  willRain: boolean;
  rainLap?: number;
  rainIntensity?: 'damp' | 'wet';
  dryPacePenaltyWithWetsSeconds: number;
  wetPacePenaltyWithSlicksSeconds: number;
}

export interface SafetyCarRules {
  status: SafetyCarStatus;
  lapsRemaining: number;
  normalPitLossSeconds: number;
  vscPitLossSeconds: number;
  scPitLossSeconds: number;
  fieldBunchedup: boolean;
}

export interface StrategySimulationParameters {
  pitLossSeconds: number;
  pitStopDurationSeconds: number;
  tireDegradationSecondsPerLap: Record<TireCompound, number>;
  baseLapTimeSeconds: number;
  tireCliffLap: Record<TireCompound, number>;
  weatherTransitionRules: WeatherTransitionRules;
  safetyCarRules: SafetyCarRules;
  randomnessPolicy: 'none' | 'seeded';
}

export interface StrategyDecisionResolution {
  actionId: string;
  nextState: Partial<StrategyRaceState>;
  timeDeltaSeconds: number; // negative = time gained vs expected baseline, positive = time lost
  positionDelta: number; // positive = positions gained (e.g. +1 from P3 to P2), negative = lost
  eventLog: string[];
  decisionScore: number; // 0 to 100
  explanation: string;
  isOptimal: boolean;
  isDefensible: boolean;
  strategicTradeoff: string;
}

export interface StrategyDecisionRules {
  resolutions: Record<string, StrategyDecisionResolution>;
  defaultOptimalActionId: string;
}

export interface StrategyDecisionPoint {
  id: string;
  stepIndex: number;
  title: string;
  prompt: string;
  contextDescription: string;
  availableActions: StrategyActionOption[];
  resolutionRules: StrategyDecisionRules;
}

export interface StrategyScoringRubric {
  maxScore: number; // standard 100
  decisionQualityWeight: number; // 0 to 1
  timeOutcomeWeight: number; // 0 to 1
  positionOutcomeWeight: number; // 0 to 1
  consistencyWeight: number; // 0 to 1 (0 for single challenge, >0 for multi-stage)
}

export interface StrategyDebrief {
  objective: string;
  keyPrinciples: string[];
  referenceStrategy: string;
  explanationsByAction: Record<string, string>;
  assumptions: string[];
  tacticalTakeaway: string;
}

export interface StrategyScenario {
  id: string;
  version: number;
  title: string;
  circuitName: string;
  roundNumber?: number;
  season?: number;
  mode: StrategyMode;
  category: StrategyCategory;
  difficulty: StrategyDifficulty;
  description: string;
  estimatedDurationMinutes: number;
  initialState: StrategyRaceState;
  decisionPoints: StrategyDecisionPoint[];
  simulationParameters: StrategySimulationParameters;
  scoringRubric: StrategyScoringRubric;
  debrief: StrategyDebrief;
  status: 'draft' | 'approved' | 'retired';
}

export interface StrategyDecisionRecord {
  decisionPointId: string;
  stepIndex: number;
  actionId: string;
  stateBefore: StrategyRaceState;
  stateAfter: StrategyRaceState;
  timeDeltaSeconds: number;
  positionDelta: number;
  decisionScore: number;
  explanation: string;
  submittedAt: string;
}

export interface StrategyAttempt {
  attemptId: string;
  userId: string;
  username?: string;
  userDisplayName?: string;
  scenarioId: string;
  scenarioVersion: number;
  simulationVersion: number;
  mode: StrategyMode;
  isCompetitive: boolean;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentStepIndex: number;
  decisions: StrategyDecisionRecord[];
  currentState: StrategyRaceState;
  score: number;
  maxScore: number;
  pointsAwarded: number;
  finalTimeDeltaSeconds: number;
  finalPosition: number;
  startedAt: string;
  completedAt?: string;
}

export interface StrategyLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  favouriteConstructor?: string;
  totalPoints: number;
  challengesCompleted: number;
  simulationsCompleted: number;
  averageScore: number;
  bestScore: number;
  periodKey: string;
  updatedAt: string;
}

export interface StrategyUserPerformance {
  userId: string;
  totalPoints: number;
  weeklyPoints: number;
  weeklyRank: number;
  overallRank: number;
  totalAttempts: number;
  completedScenariosCount: number;
  averageScore: number;
  bestScore: number;
  categoryStats: Record<StrategyCategory, { completed: number; avgScore: number }>;
  recentAttempts: StrategyAttempt[];
}

export interface StrategyScoreReport {
  finalScore: number;
  decisionQualityScore: number;
  timeOutcomeScore: number;
  positionOutcomeScore: number;
  consistencyScore: number;
  ratingTier: {
    tier: 'legendary' | 'apex' | 'prudent' | 'gambler' | 'blunder';
    name: string;
    color: string;
    description: string;
  };
  summaryFeedback: string;
}

/**
 * =========================================================================
 * PRE-RACE STRATEGY — CORE GAMEPLAY CONTRACTS
 * =========================================================================
 */

export interface PreRaceStint {
  stintNumber: number;
  compound: TireCompound;
  startLap: number;
  endLap: number;
  laps: number;
}

export type PlanIdentifier = 'plan_a' | 'plan_b' | 'plan_c' | 'custom';

export interface PreRaceStrategyPlan {
  id: PlanIdentifier;
  name: string;
  label: string;
  pitStopCount: number;
  stints: PreRaceStint[];
  mainAdvantage: string;
  mainRisk: string;
  idealConditions: string;
  contingency?: string;
  rationale?: string;
}

export interface PreRaceCompetitor {
  driver: string;
  team: string;
  startingPosition: number;
  strategyDescription: string;
  pitLaps: number[];
  compounds: TireCompound[];
  estimatedTotalRaceTimeSeconds: number;
  baselineFinishingPosition: number;
}

export interface PreRaceBaselineOutcome {
  startingPosition: number;
  finishingPosition: number;
  totalRaceTimeSeconds: number;
  formattedTime: string;
  pitStopCount: number;
  strategyDescription: string;
  stints: PreRaceStint[];
  competitorAssumptions: string[];
}

export interface PreRaceScenario {
  id: string;
  version: number;
  title: string;
  circuitName: string;
  circuitCharacteristics: string;
  totalLaps: number;
  baseLapTimeSeconds: number;
  startingPosition: number;
  availableCompounds: TireCompound[];
  tireDegradationSecondsPerLap: Record<TireCompound, number>;
  tireCliffLap: Record<TireCompound, number>;
  pitLossSeconds: number;
  pitStopDurationSeconds: number;
  trackCondition: TrackCondition;
  trackTempCelsius: number;
  weatherDescription: string;
  specialConditions: string;
  rivalBehaviorNotes: string;
  rules: {
    minPitStops: number;
    mandatoryDifferentCompounds: boolean;
  };
  baselineOutcome: PreRaceBaselineOutcome;
  referencePlans: PreRaceStrategyPlan[];
  competitors: PreRaceCompetitor[];
  status: 'draft' | 'approved' | 'retired';
}

export interface PreRaceRound {
  roundId: string;
  scenarioId: string;
  scenarioVersion: number;
  openingTime: string;
  deadlineTime: string;
  durationMinutes: number;
  status: 'not_started' | 'active' | 'locked' | 'completed';
  hasExplicitlyStartedDiscussion: boolean;
}

export interface PreRaceDiscussionComment {
  commentId: string;
  roundId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  comment: string;
  timestamp: string;
  planPreference?: PlanIdentifier;
}

export interface PreRaceVote {
  voteId: string;
  roundId: string;
  userId: string;
  planId: PlanIdentifier;
  timestamp: string;
}

export interface PreRaceStintSimulationBreakdown {
  stintNumber: number;
  compound: TireCompound;
  laps: number;
  startLap: number;
  endLap: number;
  averageLapTime: number;
  stintTimeSeconds: number;
  degradationTimeLostSeconds: number;
  cliffPenaltySeconds: number;
  trafficTimeLostSeconds: number;
}

export interface PreRaceInfluencingFactor {
  factorName: string;
  decisionMade: string;
  expectedTradeoff: string;
  calculatedEffect: string;
  impact: 'helped' | 'hurt' | 'neutral';
}

export interface PreRaceRiskAssessment {
  mainRiskAccepted: string;
  riskContext: string;
  didRiskMaterialize: boolean;
  calculatedConsequence: string;
  alternativeDecision: string;
}

export interface PreRaceSimulatedOutcome {
  simulatedFinishingPosition: number;
  baselineFinishingPosition: number;
  positionDelta: number;
  simulatedTotalRaceTimeSeconds: number;
  baselineTotalRaceTimeSeconds: number;
  timeDeltaSeconds: number;
  formattedSimulatedTime: string;
  pitStopCount: number;
  stintBreakdowns: PreRaceStintSimulationBreakdown[];
  keyAdvantages: string[];
  keyDisadvantages: string[];
  actionableLessons: string[];
  influencingFactors: PreRaceInfluencingFactor[];
  riskAssessment: PreRaceRiskAssessment;
  whatWorked: string[];
  whatDidNotWork: string[];
  scoreBreakdown: {
    decisionQualityScore: number;
    raceOutcomeScore: number;
    strategyEfficiencyScore: number;
    finalScore: number;
  };
  ratingTier: {
    tier: 'legendary' | 'apex' | 'prudent' | 'gambler' | 'blunder';
    name: string;
    color: string;
    description: string;
  };
  debriefSummary: string;
}

export interface PreRaceDraft {
  scenarioId: string;
  selectedPlanId: PlanIdentifier;
  strategy: PreRaceStrategyPlan;
  rationale: string;
  savedAt: string;
  activeRoundId?: string;
  roundDeadline?: string;
}

export interface PreRaceAttempt {
  attemptId: string;
  userId: string;
  username: string;
  displayName: string;
  roundId: string;
  scenarioId: string;
  scenarioVersion: number;
  simulationVersion: number;
  isCompetitive: boolean;
  status: 'locked' | 'completed';
  submittedAt: string;
  selectedPlanId: PlanIdentifier;
  strategy: PreRaceStrategyPlan;
  rationale: string;
  outcome: PreRaceSimulatedOutcome;
  score: number;
}




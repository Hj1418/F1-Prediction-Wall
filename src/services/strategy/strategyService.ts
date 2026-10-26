/**
 * THE GRDX — Strategy Room Core Service
 * 
 * Manages:
 * - Scenario retrieval and Featured Scenario of the Day
 * - Attempt lifecycle: Start, Step Resolution, Authoritative Completion
 * - Idempotency and anti-duplicate point safeguards
 * - Seamless fallback between local simulation/storage and Google Apps Script backend
 */

import {
  StrategyScenario,
  StrategyAttempt,
  StrategyDecisionResolution,
  StrategyMode,
  StrategyCategory,
  StrategyDifficulty,
  StrategyScoreReport
} from '../../types/strategy';
import {
  APPROVED_SCENARIOS,
  getScenarioById as getRegistryScenarioById,
  getApprovedScenarios
} from './scenarioRegistry';
import { executeSimulationStep } from './simulationEngine';
import { calculateAuthoritativeScore } from './strategyScoring';
import {
  recordCompetitiveStrategyAttempt,
  getUserStrategyPerformance
} from './strategyLeaderboardService';
import { notificationService } from '../notificationService';

const STORAGE_ATTEMPTS_PREFIX = 'thegrid_strategy_attempts_';
const PRODUCTION_API_URL =
  'https://script.google.com/macros/s/AKfycbz_TmSvhPNdrTT9HCiCnViVY9dG-5ypZMfyWtp0d4XcjP25mJc7yW8VyawKaSI6LTF9/exec';
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' ? PRODUCTION_API_URL : '');
const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http') && typeof window !== 'undefined');

// In-memory cache for fast lookup and headless environments
const inMemoryAttempts: Map<string, StrategyAttempt> = new Map();

/**
 * Load attempts for a user from storage
 */
function loadUserAttemptsFromStorage(userId: string): StrategyAttempt[] {
  if (typeof localStorage === 'undefined') {
    return Array.from(inMemoryAttempts.values()).filter(a => a.userId === userId);
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_ATTEMPTS_PREFIX}${userId}`);
    if (!raw) return Array.from(inMemoryAttempts.values()).filter(a => a.userId === userId);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return Array.from(inMemoryAttempts.values()).filter(a => a.userId === userId);
  }
}

/**
 * Save an attempt to storage
 */
function saveAttemptToStorage(attempt: StrategyAttempt): void {
  inMemoryAttempts.set(attempt.attemptId, attempt);
  if (typeof localStorage === 'undefined') return;
  try {
    const key = `${STORAGE_ATTEMPTS_PREFIX}${attempt.userId}`;
    const current = loadUserAttemptsFromStorage(attempt.userId).filter(a => a.attemptId !== attempt.attemptId);
    current.unshift(attempt);
    localStorage.setItem(key, JSON.stringify(current));
  } catch {
    // Non-fatal
  }
}

/**
 * Fetches approved scenarios with optional filtering
 */
export async function getStrategyScenarios(filters?: {
  mode?: StrategyMode;
  category?: StrategyCategory;
  difficulty?: StrategyDifficulty;
}): Promise<StrategyScenario[]> {
  let list = getApprovedScenarios();

  if (filters?.mode) {
    list = list.filter(s => s.mode === filters.mode);
  }
  if (filters?.category) {
    list = list.filter(s => s.category === filters.category);
  }
  if (filters?.difficulty) {
    list = list.filter(s => s.difficulty === filters.difficulty);
  }

  return list;
}

/**
 * Get a single scenario by ID
 */
export function getStrategyScenario(scenarioId: string): StrategyScenario | null {
  return getRegistryScenarioById(scenarioId) || null;
}

/**
 * Get Scenario of the Day (deterministic rotation based on day of year)
 */
export function getFeaturedScenario(): StrategyScenario {
  const approved = getApprovedScenarios();
  if (approved.length === 0) {
    return APPROVED_SCENARIOS[0];
  }

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % approved.length;
  return approved[index];
}

/**
 * Starts a new strategy attempt
 */
export async function startStrategyAttempt(params: {
  scenarioId: string;
  userId: string;
  username?: string;
  userDisplayName?: string;
  isCompetitive?: boolean;
}): Promise<StrategyAttempt> {
  const scenario = getStrategyScenario(params.scenarioId);
  if (!scenario) {
    throw new Error(`Scenario with ID ${params.scenarioId} not found.`);
  }

  const attemptId = `strat_att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const attempt: StrategyAttempt = {
    attemptId,
    userId: params.userId,
    username: params.username || 'Strategist',
    userDisplayName: params.userDisplayName || params.username || 'Strategist',
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    simulationVersion: 1,
    mode: scenario.mode,
    isCompetitive: params.isCompetitive !== false,
    status: 'in_progress',
    currentStepIndex: 0,
    decisions: [],
    currentState: { ...scenario.initialState },
    score: 0,
    maxScore: scenario.scoringRubric.maxScore,
    pointsAwarded: 0,
    finalTimeDeltaSeconds: 0,
    finalPosition: scenario.initialState.position,
    startedAt: new Date().toISOString()
  };

  saveAttemptToStorage(attempt);

  // Background sync if live backend available
  if (isLiveBackend) {
    try {
      fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'startStrategyAttempt',
          attemptId: attempt.attemptId,
          userId: attempt.userId,
          scenarioId: attempt.scenarioId,
          scenarioVersion: attempt.scenarioVersion,
          mode: attempt.mode,
          isCompetitive: attempt.isCompetitive,
          startedAt: attempt.startedAt
        })
      }).catch(() => {});
    } catch {
      // Non-fatal
    }
  }

  return attempt;
}

/**
 * Submits a tactical decision for the current step
 */
export async function submitStrategyDecision(params: {
  attemptId: string;
  actionId: string;
}): Promise<{
  attempt: StrategyAttempt;
  resolution: StrategyDecisionResolution;
  isCompleted: boolean;
}> {
  let attempt = inMemoryAttempts.get(params.attemptId);
  if (!attempt) {
    // Search across storage
    const all = typeof localStorage !== 'undefined'
      ? Object.keys(localStorage)
          .filter(k => k.startsWith(STORAGE_ATTEMPTS_PREFIX))
          .flatMap(k => {
            try {
              return JSON.parse(localStorage.getItem(k) || '[]');
            } catch {
              return [];
            }
          })
      : [];
    attempt = all.find((a: StrategyAttempt) => a.attemptId === params.attemptId);
  }

  if (!attempt) {
    throw new Error(`Attempt with ID ${params.attemptId} not found.`);
  }

  if (attempt.status !== 'in_progress') {
    throw new Error(`Attempt ${params.attemptId} is already ${attempt.status}.`);
  }

  const scenario = getStrategyScenario(attempt.scenarioId);
  if (!scenario) {
    throw new Error(`Scenario ${attempt.scenarioId} not found.`);
  }

  const stepIndex = attempt.currentStepIndex;
  const decisionPoint = scenario.decisionPoints[stepIndex];
  if (!decisionPoint) {
    throw new Error(`No decision point at step ${stepIndex} for scenario ${scenario.id}`);
  }

  // Execute deterministic simulation step
  const resolution = executeSimulationStep(
    scenario,
    attempt.currentState,
    params.actionId,
    stepIndex
  );

  const stateBefore = { ...attempt.currentState };
  const stateAfter = {
    ...attempt.currentState,
    ...resolution.nextState
  };

  const decisionRecord = {
    decisionPointId: decisionPoint.id,
    stepIndex,
    actionId: params.actionId,
    stateBefore,
    stateAfter,
    timeDeltaSeconds: resolution.timeDeltaSeconds,
    positionDelta: resolution.positionDelta,
    decisionScore: resolution.decisionScore,
    explanation: resolution.explanation,
    submittedAt: new Date().toISOString()
  };

  attempt.decisions.push(decisionRecord);
  attempt.currentState = stateAfter;
  attempt.finalTimeDeltaSeconds += resolution.timeDeltaSeconds;
  attempt.finalPosition = stateAfter.position;
  attempt.currentStepIndex += 1;

  const isCompleted = attempt.currentStepIndex >= scenario.decisionPoints.length;

  saveAttemptToStorage(attempt);

  return {
    attempt,
    resolution,
    isCompleted
  };
}

/**
 * Authoritatively completes an attempt and computes 100-pt score and leaderboard points.
 * IDEMPOTENT: Retrying a completed attempt returns the cached result without duplicate points.
 */
export async function completeStrategyAttempt(
  attemptId: string,
  userProfile?: {
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    favouriteConstructor?: string;
  }
): Promise<{
  attempt: StrategyAttempt;
  scoreReport: StrategyScoreReport;
  leaderboardRankings?: { weeklyRank: number; overallRank: number; pointsEarned: number };
}> {
  let attempt = inMemoryAttempts.get(attemptId);
  if (!attempt) {
    const all = typeof localStorage !== 'undefined'
      ? Object.keys(localStorage)
          .filter(k => k.startsWith(STORAGE_ATTEMPTS_PREFIX))
          .flatMap(k => {
            try {
              return JSON.parse(localStorage.getItem(k) || '[]');
            } catch {
              return [];
            }
          })
      : [];
    attempt = all.find((a: StrategyAttempt) => a.attemptId === attemptId);
  }

  if (!attempt) {
    throw new Error(`Attempt ${attemptId} not found.`);
  }

  const scenario = getStrategyScenario(attempt.scenarioId);
  if (!scenario) {
    throw new Error(`Scenario ${attempt.scenarioId} not found.`);
  }

  // Calculate authoritative score report
  const scoreReport = calculateAuthoritativeScore(scenario, attempt.decisions);

  // If already completed, return existing record idempotently
  if (attempt.status === 'completed') {
    return {
      attempt,
      scoreReport,
      leaderboardRankings: {
        weeklyRank: 1,
        overallRank: 1,
        pointsEarned: 0 // No duplicate points!
      }
    };
  }

  attempt.status = 'completed';
  attempt.score = scoreReport.finalScore;
  attempt.maxScore = scenario.scoringRubric.maxScore;
  attempt.pointsAwarded = attempt.isCompetitive ? scoreReport.finalScore : 0;
  attempt.completedAt = new Date().toISOString();

  saveAttemptToStorage(attempt);

  let leaderboardRankings: { weeklyRank: number; overallRank: number; pointsEarned: number } | undefined;

  if (attempt.isCompetitive) {
    leaderboardRankings = recordCompetitiveStrategyAttempt(attempt, userProfile);

    // Toast notification for user
    try {
      if (scoreReport.finalScore >= 80) {
        notificationService.enqueueNotification({
          userId: attempt.userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Strategic Masterstroke!',
          message: `Scored ${scoreReport.finalScore}/100 in ${scenario.title} (${scoreReport.ratingTier.name})!`,
          entityReference: '/strategy/leaderboard'
        });
      }
    } catch {
      // Non-fatal
    }
  }

  // Background sync if live backend available
  if (isLiveBackend) {
    try {
      fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completeStrategyAttempt',
          attemptId: attempt.attemptId,
          userId: attempt.userId,
          score: attempt.score,
          maxScore: attempt.maxScore,
          pointsAwarded: attempt.pointsAwarded,
          completedAt: attempt.completedAt,
          decisions: attempt.decisions
        })
      }).catch(() => {});
    } catch {
      // Non-fatal
    }
  }

  return {
    attempt,
    scoreReport,
    leaderboardRankings
  };
}

/**
 * Gets a strategy attempt by ID
 */
export async function getStrategyAttempt(attemptId: string): Promise<StrategyAttempt | null> {
  const inMem = inMemoryAttempts.get(attemptId);
  if (inMem) return inMem;

  if (typeof localStorage !== 'undefined') {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STORAGE_ATTEMPTS_PREFIX)) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const found = list.find((a: StrategyAttempt) => a.attemptId === attemptId);
          if (found) return found;
        } catch {
          // ignore
        }
      }
    }
  }

  return null;
}

/**
 * Gets all attempts for a given user
 */
export async function getUserStrategyAttempts(userId: string): Promise<StrategyAttempt[]> {
  return loadUserAttemptsFromStorage(userId);
}

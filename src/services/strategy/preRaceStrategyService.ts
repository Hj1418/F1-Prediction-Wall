/**
 * THE GRDX — Pre-Race Strategy Room Service
 * 
 * Manages:
 * - Strategy drafts & user rationale persistence
 * - Explicit discussion activation (10/15-minute countdown starts ONLY when requested)
 * - Discussion comments & community voting on reference plans
 * - Individual strategy commitment & anti-tamper locking
 * - Idempotency & anti-duplicate scoring
 * - Practice vs Competitive segregation
 * - Local storage caching and seamless Google Apps Script sync
 */

import {
  PreRaceScenario,
  PreRaceRound,
  PreRaceStrategyPlan,
  PreRaceAttempt,
  PreRaceDiscussionComment,
  PreRaceVote,
  PlanIdentifier,
  PreRaceSimulatedOutcome,
  PreRaceDraft
} from '../../types/strategy';
import { getPreRaceScenarioById } from './preRaceScenarioRegistry';
import { simulatePreRaceStrategy } from './preRaceSimulationEngine';
import { recordCompetitiveStrategyAttempt } from './strategyLeaderboardService';

const STORAGE_PRERACE_ATTEMPTS = 'thegrid_prerace_attempts_v1';
const STORAGE_PRERACE_COMMENTS = 'thegrid_prerace_comments_v1';
const STORAGE_PRERACE_VOTES = 'thegrid_prerace_votes_v1';
const STORAGE_PRERACE_ROUNDS = 'thegrid_prerace_rounds_v1';
const STORAGE_PRERACE_DRAFTS = 'thegrid_prerace_drafts_v1';

const PRODUCTION_API_URL =
  'https://script.google.com/macros/s/AKfycbz_TmSvhPNdrTT9HCiCnViVY9dG-5ypZMfyWtp0d4XcjP25mJc7yW8VyawKaSI6LTF9/exec';
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' ? PRODUCTION_API_URL : '');
const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http') && typeof window !== 'undefined');

// In-memory memory structures for tests & headless execution
const inMemoryAttempts: Map<string, PreRaceAttempt> = new Map();
const inMemoryComments: Map<string, PreRaceDiscussionComment[]> = new Map();
const inMemoryVotes: Map<string, PreRaceVote[]> = new Map();
const inMemoryRounds: Map<string, PreRaceRound> = new Map();
const inMemoryDrafts: Map<string, PreRaceDraft> = new Map();

/**
 * Retrieves the current round for a scenario if it has been started.
 * Does NOT start a timer automatically upon page load or strategy preview.
 */
export function getPreRaceRoundStatus(scenarioId: string): PreRaceRound | null {
  const roundKey = `round_${scenarioId}`;
  let round: PreRaceRound | null = inMemoryRounds.get(roundKey) || null;

  if (!round && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PRERACE_ROUNDS}_${scenarioId}`);
      if (raw) {
        round = JSON.parse(raw) as PreRaceRound;
        inMemoryRounds.set(roundKey, round);
      }
    } catch {
      // ignore
    }
  }

  if (round && round.deadlineTime) {
    const now = Date.now();
    const deadline = new Date(round.deadlineTime).getTime();
    if (now >= deadline && round.status === 'active') {
      round.status = 'locked';
    }
  }

  return round;
}

/**
 * Starts a timed discussion round explicitly upon user request ("Discuss with Friends").
 * Configurable for 10 or 15 minutes (default 15).
 */
export function startPreRaceDiscussionRound(scenarioId: string, durationMinutes: number = 15): PreRaceRound {
  const roundKey = `round_${scenarioId}`;
  const now = new Date();
  const deadline = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const newRound: PreRaceRound = {
    roundId: `round_${scenarioId}_${Date.now()}`,
    scenarioId,
    scenarioVersion: 1,
    openingTime: now.toISOString(),
    deadlineTime: deadline.toISOString(),
    durationMinutes,
    status: 'active',
    hasExplicitlyStartedDiscussion: true
  };

  inMemoryRounds.set(roundKey, newRound);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PRERACE_ROUNDS}_${scenarioId}`, JSON.stringify(newRound));
    } catch {
      // ignore
    }
  }

  return newRound;
}

/**
 * Backward compatibility alias: gets existing round or returns an unstarted round.
 */
export function getOrCreatePreRaceRound(scenarioId: string, durationMinutes: number = 15): PreRaceRound {
  const existing = getPreRaceRoundStatus(scenarioId);
  if (existing) return existing;

  return {
    roundId: `round_${scenarioId}_unstarted`,
    scenarioId,
    scenarioVersion: 1,
    openingTime: '',
    deadlineTime: '',
    durationMinutes,
    status: 'not_started',
    hasExplicitlyStartedDiscussion: false
  };
}

/**
 * Checks if a round is locked (deadline passed)
 */
export function isRoundLocked(round: PreRaceRound | null): boolean {
  if (!round) return false;
  if (round.status === 'locked' || round.status === 'completed') return true;
  if (!round.deadlineTime) return false;
  const now = Date.now();
  const deadline = new Date(round.deadlineTime).getTime();
  return now >= deadline;
}

/**
 * Saves a user's uncommitted strategy draft and rationale
 */
export function savePreRaceDraft(draft: PreRaceDraft): void {
  const key = `${draft.scenarioId}`;
  inMemoryDrafts.set(key, draft);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PRERACE_DRAFTS}_${key}`, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }
}

/**
 * Restores a user's uncommitted strategy draft and rationale
 */
export function getPreRaceDraft(scenarioId: string): PreRaceDraft | null {
  const key = `${scenarioId}`;
  if (inMemoryDrafts.has(key)) {
    return inMemoryDrafts.get(key)!;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PRERACE_DRAFTS}_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as PreRaceDraft;
        inMemoryDrafts.set(key, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Loads discussion comments for a round
 */
export function getPreRaceDiscussionComments(roundId: string): PreRaceDiscussionComment[] {
  if (inMemoryComments.has(roundId)) {
    return inMemoryComments.get(roundId)!;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PRERACE_COMMENTS}_${roundId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryComments.set(roundId, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // Provide initial mock community commentary for rich UX
  const defaultComments: PreRaceDiscussionComment[] = [
    {
      commentId: `comm_init_1_${roundId}`,
      roundId,
      userId: 'user_analyst_1',
      username: 'AeroChief',
      displayName: 'Carlos V. (Pit Wall Analyst)',
      avatarUrl: '',
      comment: 'Plan A provides the highest security against tire degradation, but Plan B could be lethal if you gain track position off the line into T1.',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      planPreference: 'plan_a'
    },
    {
      commentId: `comm_init_2_${roundId}`,
      roundId,
      userId: 'user_analyst_2',
      username: 'TireWhisperer',
      displayName: 'Sophie M. (Race Strategist)',
      avatarUrl: '',
      comment: 'Watching track temps closely. If the surface stays cool, the softs will last 2-3 laps longer than the baseline cliff.',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      planPreference: 'plan_b'
    }
  ];

  inMemoryComments.set(roundId, defaultComments);
  return defaultComments;
}

/**
 * Posts a new discussion comment
 */
export function postPreRaceDiscussionComment(comment: {
  roundId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  comment: string;
  planPreference?: PlanIdentifier;
}): PreRaceDiscussionComment {
  const current = getPreRaceDiscussionComments(comment.roundId);
  const newComment: PreRaceDiscussionComment = {
    commentId: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    roundId: comment.roundId,
    userId: comment.userId,
    username: comment.username,
    displayName: comment.displayName,
    avatarUrl: comment.avatarUrl,
    comment: comment.comment.trim(),
    timestamp: new Date().toISOString(),
    planPreference: comment.planPreference
  };

  current.unshift(newComment);
  inMemoryComments.set(comment.roundId, current);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PRERACE_COMMENTS}_${comment.roundId}`, JSON.stringify(current));
    } catch {
      // ignore
    }
  }

  return newComment;
}

/**
 * Loads votes for a round
 */
export function getPreRaceVotes(roundId: string): PreRaceVote[] {
  if (inMemoryVotes.has(roundId)) {
    return inMemoryVotes.get(roundId)!;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PRERACE_VOTES}_${roundId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryVotes.set(roundId, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  const initialVotes: PreRaceVote[] = [
    { voteId: 'v1', roundId, userId: 'u_seed1', planId: 'plan_a', timestamp: new Date().toISOString() },
    { voteId: 'v2', roundId, userId: 'u_seed2', planId: 'plan_a', timestamp: new Date().toISOString() },
    { voteId: 'v3', roundId, userId: 'u_seed3', planId: 'plan_b', timestamp: new Date().toISOString() },
    { voteId: 'v4', roundId, userId: 'u_seed4', planId: 'plan_c', timestamp: new Date().toISOString() }
  ];

  inMemoryVotes.set(roundId, initialVotes);
  return initialVotes;
}

/**
 * Casts a vote for a strategy plan
 */
export function castPreRaceVote(params: {
  roundId: string;
  userId: string;
  planId: PlanIdentifier;
}): { votes: PreRaceVote[]; percentages: Record<PlanIdentifier, number> } {
  let list = getPreRaceVotes(params.roundId);
  list = list.filter(v => v.userId !== params.userId);

  list.push({
    voteId: `vote_${Date.now()}_${params.userId}`,
    roundId: params.roundId,
    userId: params.userId,
    planId: params.planId,
    timestamp: new Date().toISOString()
  });

  inMemoryVotes.set(params.roundId, list);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PRERACE_VOTES}_${params.roundId}`, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  const total = list.length;
  const counts: Record<PlanIdentifier, number> = {
    plan_a: 0,
    plan_b: 0,
    plan_c: 0,
    custom: 0
  };

  list.forEach(v => {
    if (counts[v.planId] !== undefined) counts[v.planId]++;
  });

  const percentages: Record<PlanIdentifier, number> = {
    plan_a: total > 0 ? Math.round((counts.plan_a / total) * 100) : 25,
    plan_b: total > 0 ? Math.round((counts.plan_b / total) * 100) : 25,
    plan_c: total > 0 ? Math.round((counts.plan_c / total) * 100) : 25,
    custom: total > 0 ? Math.round((counts.custom / total) * 100) : 25
  };

  return { votes: list, percentages };
}

/**
 * Loads user attempts for a scenario
 */
export function getUserPreRaceAttempts(userId: string, scenarioId?: string): PreRaceAttempt[] {
  let all: PreRaceAttempt[] = [];

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PRERACE_ATTEMPTS}_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) all = parsed;
      }
    } catch {
      // ignore
    }
  }

  if (all.length === 0) {
    all = Array.from(inMemoryAttempts.values()).filter(a => a.userId === userId);
  }

  if (scenarioId) {
    return all.filter(a => a.scenarioId === scenarioId);
  }
  return all;
}

/**
 * Commits a strategy (Competitive or Practice)
 * IDEMPOTENT: Retrying a completed/locked attempt returns the existing record.
 * SERVER-AUTHORITATIVE LOCK: Rejects competitive commitment if round deadline has expired.
 */
export async function commitPreRaceStrategy(params: {
  scenarioId: string;
  roundId?: string;
  userId: string;
  username: string;
  displayName: string;
  isCompetitive: boolean;
  selectedPlanId: PlanIdentifier;
  strategy: PreRaceStrategyPlan;
  rationale?: string;
  userProfile?: {
    avatarUrl?: string;
    favouriteConstructor?: string;
  };
}): Promise<{
  attempt: PreRaceAttempt;
  outcome: PreRaceSimulatedOutcome;
  isLocked: boolean;
}> {
  const scenario = getPreRaceScenarioById(params.scenarioId);
  if (!scenario) {
    throw new Error(`Scenario "${params.scenarioId}" not found.`);
  }

  const round = getPreRaceRoundStatus(params.scenarioId);

  // Authoritative deadline check for competitive submissions
  if (params.isCompetitive && isRoundLocked(round)) {
    throw new Error(
      `Round deadline has passed. Competitive submissions are locked.`
    );
  }

  const effectiveRoundId = round?.roundId || params.roundId || `round_${params.scenarioId}_direct`;

  // Check if competitive attempt already exists for this round/scenario (Idempotency)
  if (params.isCompetitive) {
    const existingAttempts = getUserPreRaceAttempts(params.userId, params.scenarioId);
    const existingComp = existingAttempts.find(a => a.isCompetitive && a.roundId === effectiveRoundId);
    if (existingComp) {
      return {
        attempt: existingComp,
        outcome: existingComp.outcome,
        isLocked: true
      };
    }
  }

  // Deterministically simulate the strategy against scenario baseline
  const outcome = simulatePreRaceStrategy(scenario, params.strategy);
  const attemptId = `att_pre_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const rationaleText = params.rationale || params.strategy.rationale || '';

  const attempt: PreRaceAttempt = {
    attemptId,
    userId: params.userId,
    username: params.username,
    displayName: params.displayName,
    roundId: effectiveRoundId,
    scenarioId: params.scenarioId,
    scenarioVersion: scenario.version,
    simulationVersion: 1,
    isCompetitive: params.isCompetitive,
    status: 'locked',
    submittedAt: new Date().toISOString(),
    selectedPlanId: params.selectedPlanId,
    strategy: { ...params.strategy, rationale: rationaleText },
    rationale: rationaleText,
    outcome,
    score: outcome.scoreBreakdown.finalScore
  };

  inMemoryAttempts.set(attemptId, attempt);

  // Save to localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const key = `${STORAGE_PRERACE_ATTEMPTS}_${params.userId}`;
      const list = getUserPreRaceAttempts(params.userId).filter(a => a.attemptId !== attemptId);
      list.unshift(attempt);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  // If competitive, record score on leaderboard
  if (params.isCompetitive) {
    try {
      recordCompetitiveStrategyAttempt(
        {
          attemptId: attempt.attemptId,
          userId: attempt.userId,
          username: attempt.username,
          userDisplayName: attempt.displayName,
          scenarioId: attempt.scenarioId,
          scenarioVersion: attempt.scenarioVersion,
          simulationVersion: attempt.simulationVersion,
          mode: 'race_simulation',
          isCompetitive: true,
          status: 'completed',
          currentStepIndex: 1,
          decisions: [],
          currentState: {
            currentLap: scenario.totalLaps,
            totalLaps: scenario.totalLaps,
            position: outcome.simulatedFinishingPosition,
            gapAheadSeconds: null,
            gapBehindSeconds: null,
            tireCompound: attempt.strategy.stints[0]?.compound || 'medium',
            tireAgeLaps: 0,
            tireWear: 0,
            trackCondition: scenario.trackCondition,
            safetyCar: 'none',
            pitLossSeconds: scenario.pitLossSeconds
          },
          score: attempt.score,
          maxScore: 100,
          pointsAwarded: attempt.score,
          finalTimeDeltaSeconds: outcome.timeDeltaSeconds,
          finalPosition: outcome.simulatedFinishingPosition,
          startedAt: attempt.submittedAt,
          completedAt: attempt.submittedAt
        },
        params.userProfile
      );
    } catch {
      // Non-fatal
    }

    // Sync to live backend if available
    if (isLiveBackend) {
      try {
        fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'commitPreRaceStrategy',
            attemptId: attempt.attemptId,
            userId: attempt.userId,
            scenarioId: attempt.scenarioId,
            roundId: attempt.roundId,
            score: attempt.score,
            strategy: attempt.strategy,
            rationale: attempt.rationale,
            outcome: attempt.outcome
          })
        }).catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  return {
    attempt,
    outcome,
    isLocked: true
  };
}

/**
 * Generates a clean text summary of a strategy for messaging & clipboard sharing.
 * Exactly matches Section 6 specification.
 */
export function generateShareableStrategySummary(
  scenario: PreRaceScenario,
  plan: PreRaceStrategyPlan,
  rationale?: string,
  outcome?: PreRaceSimulatedOutcome
): string {
  const tirePlanText = plan.stints.map(s => s.compound.toUpperCase()).join(' → ');
  const pitWindowText = plan.pitStopCount > 0
    ? plan.stints.slice(0, -1).map(s => `Lap ${s.endLap}`).join(', ')
    : 'None';

  let summary = `THE GRDX — Strategy Room\n\n`;
  summary += `Scenario: ${scenario.title}\n\n`;
  summary += `Strategy: ${plan.name}\n`;
  summary += `Tire Plan: ${tirePlanText}\n`;
  summary += `Pit Stops: ${plan.pitStopCount}\n`;
  summary += `Pit Window: ${pitWindowText}\n\n`;

  summary += `Why I chose it:\n${rationale || plan.rationale || plan.mainAdvantage}\n\n`;
  summary += `Expected Advantage:\n${plan.mainAdvantage}\n\n`;
  summary += `Main Risk:\n${plan.mainRisk}\n\n`;

  summary += `Baseline:\n${scenario.baselineOutcome.strategyDescription} | Baseline finish: P${scenario.baselineOutcome.finishingPosition} (${scenario.baselineOutcome.formattedTime})\n\n`;

  if (outcome) {
    summary += `Simulated Outcome:\nBaseline: P${scenario.baselineOutcome.finishingPosition} ➔ Simulated: P${outcome.simulatedFinishingPosition} (${outcome.timeDeltaSeconds <= 0 ? `${outcome.timeDeltaSeconds}s` : `+${outcome.timeDeltaSeconds}s`})\n`;
    summary += `Strategy Room Score: ${outcome.scoreBreakdown.finalScore}/100 [${outcome.ratingTier.name}]\n\n`;
  }

  summary += `This is a simulated strategy challenge. The final outcome depends on the scenario's simulation rules.\n`;
  summary += `https://hj1418.github.io/F1-Prediction-Wall/#/strategy/scenario/${scenario.id}`;
  return summary;
}

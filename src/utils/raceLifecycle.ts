/**
 * Race & Prediction Lifecycle State Machine — The Grid
 * Authoritative, decoupled state evaluation for sessions, prediction rounds, and race weekends.
 *
 * Distinct lifecycle states:
 * - UPCOMING: Session/round is scheduled; predictions have not yet opened.
 * - PREDICTION_OPEN: Prediction window is active and accepting submissions.
 * - PREDICTION_LOCKED: Prediction deadline has passed; waiting for session to start.
 * - LIVE: Session has started and racing is currently in progress.
 * - FINISHED: Racing has concluded, but official FIA results have not yet been published.
 * - RESULTS_AVAILABLE: Official results are verified and published; scores are pending calculation.
 * - SCORED: Official scoring is complete; points and leaderboard standings are recorded.
 */

import { PredictionRound, RaceWeekend, RoundStatus, Session } from '../types';

export type DetailedLifecycleState =
  | 'UPCOMING'
  | 'PREDICTION_OPEN'
  | 'PREDICTION_LOCKED'
  | 'LIVE'
  | 'FINISHED'
  | 'RESULTS_AVAILABLE'
  | 'SCORED';

export interface RoundLifecycleContext {
  opensAt?: string;
  closesAt?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  sessionStatus?: 'UPCOMING' | 'ONGOING' | 'LIVE' | 'COMPLETED';
  hasOfficialResult?: boolean;
  isScored?: boolean;
  roundStatus?: RoundStatus;
}

/**
 * Centrally computes the exact, decoupled lifecycle state of a prediction round.
 */
export function getDetailedRoundLifecycle(
  ctx: RoundLifecycleContext,
  nowTime: Date | number = new Date()
): DetailedLifecycleState {
  // 1. Authoritative completed / scored states
  if (ctx.isScored || ctx.roundStatus === 'SCORED') {
    return 'SCORED';
  }

  if (ctx.hasOfficialResult || ctx.roundStatus === 'COMPLETED') {
    return 'RESULTS_AVAILABLE';
  }

  // 2. Authoritative session state from database / live provider
  if (ctx.sessionStatus === 'COMPLETED') {
    return 'FINISHED';
  }

  const nowMs = typeof nowTime === 'number' ? nowTime : nowTime.getTime();
  const opensAtMs = ctx.opensAt ? new Date(ctx.opensAt).getTime() : 0;
  const closesAtMs = ctx.closesAt ? new Date(ctx.closesAt).getTime() : 0;
  const sessionStartMs = ctx.sessionStartTime ? new Date(ctx.sessionStartTime).getTime() : closesAtMs;
  const sessionEndMs = ctx.sessionEndTime ? new Date(ctx.sessionEndTime).getTime() : 0;

  // 3. Check if session is LIVE
  if (ctx.sessionStatus === 'LIVE' || ctx.sessionStatus === 'ONGOING') {
    return 'LIVE';
  }

  if (sessionEndMs > 0 && nowMs >= sessionStartMs && nowMs < sessionEndMs) {
    return 'LIVE';
  }

  // If past session start time and not explicitly completed:
  // Racing has started! If no explicit end time is given, it remains LIVE during the session window.
  if (sessionStartMs > 0 && nowMs >= sessionStartMs) {
    if (sessionEndMs > 0 && nowMs >= sessionEndMs) {
      return 'FINISHED';
    }
    // Session is in progress (a race starting does NOT mean round complete!)
    return 'LIVE';
  }

  // 4. Pre-session prediction window
  if (closesAtMs > 0 && nowMs >= closesAtMs) {
    return 'PREDICTION_LOCKED';
  }

  if (opensAtMs > 0 && nowMs >= opensAtMs) {
    return 'PREDICTION_OPEN';
  }

  return 'UPCOMING';
}

/**
 * Maps the detailed lifecycle state to the backward-compatible RoundStatus enum.
 */
export function mapDetailedToRoundStatus(detailed: DetailedLifecycleState): RoundStatus {
  switch (detailed) {
    case 'UPCOMING':
      return 'UPCOMING';
    case 'PREDICTION_OPEN':
      return 'OPEN';
    case 'PREDICTION_LOCKED':
    case 'LIVE':
    case 'FINISHED':
      return 'LOCKED';
    case 'RESULTS_AVAILABLE':
      return 'COMPLETED';
    case 'SCORED':
      return 'SCORED';
    default:
      return 'LOCKED';
  }
}

export type PredictionRoundStatus = 'NOT_OPEN' | 'OPEN' | 'LOCKED' | 'CLOSED';
export type SessionStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';
export type ResultStatus = 'NOT_AVAILABLE' | 'PROVISIONAL' | 'OFFICIAL';
export type ScoringStatus = 'NOT_SCORED' | 'SCORED' | 'AMENDED';

export interface DecoupledRoundState {
  predictionStatus: PredictionRoundStatus;
  sessionStatus: SessionStatus;
  resultStatus: ResultStatus;
  scoringStatus: ScoringStatus;
  displayStatusText: string;
  badgeLabel: string;
  badgeType: 'upcoming' | 'open' | 'locked' | 'scored' | 'results';
  actionButtonText: string;
  canPredict: boolean;
}

/**
 * Authoritatively evaluates the separated dimensions:
 * 1. PREDICTION ROUND STATUS (NOT_OPEN, OPEN, LOCKED, CLOSED)
 * 2. SESSION STATUS (UPCOMING, LIVE, FINISHED)
 * 3. RESULT STATUS (NOT_AVAILABLE, PROVISIONAL, OFFICIAL)
 * 4. SCORING STATUS (NOT_SCORED, SCORED, AMENDED)
 *
 * Guarantees:
 * - Upcoming rounds NEVER display "Scored"
 * - Live sessions NEVER prematurely mark rounds as Complete or Scored
 * - Session finished without official results displays "Results Pending", NOT "Scored"
 */
export function evaluateRoundState(
  ctx: RoundLifecycleContext,
  hasUserPrediction: boolean = false,
  nowTime: Date | number = new Date()
): DecoupledRoundState {
  const nowMs = typeof nowTime === 'number' ? nowTime : nowTime.getTime();
  const opensAtMs = ctx.opensAt ? new Date(ctx.opensAt).getTime() : 0;
  const closesAtMs = ctx.closesAt ? new Date(ctx.closesAt).getTime() : 0;
  const sessionStartMs = ctx.sessionStartTime ? new Date(ctx.sessionStartTime).getTime() : closesAtMs;
  const sessionEndMs = ctx.sessionEndTime ? new Date(ctx.sessionEndTime).getTime() : 0;

  // 1. SCORING STATUS
  const isScored = Boolean(ctx.isScored || ctx.roundStatus === 'SCORED');
  const scoringStatus: ScoringStatus = isScored ? 'SCORED' : 'NOT_SCORED';

  // 2. RESULT STATUS
  const hasResult = Boolean(ctx.hasOfficialResult || ctx.roundStatus === 'COMPLETED');
  const resultStatus: ResultStatus = hasResult ? 'OFFICIAL' : 'NOT_AVAILABLE';

  // 3. SESSION STATUS
  let sessionStatus: SessionStatus = 'UPCOMING';
  if (ctx.sessionStatus === 'COMPLETED' || (sessionEndMs > 0 && nowMs >= sessionEndMs)) {
    sessionStatus = 'FINISHED';
  } else if (
    ctx.sessionStatus === 'LIVE' ||
    ctx.sessionStatus === 'ONGOING' ||
    (sessionStartMs > 0 && nowMs >= sessionStartMs)
  ) {
    sessionStatus = 'LIVE';
  }

  // 4. PREDICTION ROUND STATUS
  let predictionStatus: PredictionRoundStatus = 'NOT_OPEN';
  if (isScored || hasResult || sessionStatus === 'FINISHED') {
    predictionStatus = 'CLOSED';
  } else if (
    (closesAtMs > 0 && nowMs >= closesAtMs) ||
    sessionStatus === 'LIVE' ||
    ctx.roundStatus === 'LOCKED'
  ) {
    predictionStatus = 'LOCKED';
  } else if (
    (opensAtMs > 0 ? nowMs >= opensAtMs : true) &&
    (closesAtMs > 0 ? nowMs < closesAtMs : true) &&
    ctx.roundStatus === 'OPEN'
  ) {
    predictionStatus = 'OPEN';
  } else if (opensAtMs > 0 && nowMs < opensAtMs) {
    predictionStatus = 'NOT_OPEN';
  } else if (ctx.roundStatus === 'UPCOMING') {
    predictionStatus = 'NOT_OPEN';
  }

  // 5. PRESENTATION & DERIVED LABELS
  if (scoringStatus === 'SCORED') {
    return {
      predictionStatus,
      sessionStatus,
      resultStatus,
      scoringStatus,
      displayStatusText: 'Scored',
      badgeLabel: 'SCORED',
      badgeType: 'scored',
      actionButtonText: 'View Scores & Breakdown',
      canPredict: false,
    };
  }

  if (resultStatus === 'OFFICIAL') {
    return {
      predictionStatus,
      sessionStatus,
      resultStatus,
      scoringStatus,
      displayStatusText: 'Official Results Verified • Scoring in Progress',
      badgeLabel: 'RESULTS IN',
      badgeType: 'results',
      actionButtonText: 'View Official Results',
      canPredict: false,
    };
  }

  if (sessionStatus === 'FINISHED') {
    return {
      predictionStatus,
      sessionStatus,
      resultStatus,
      scoringStatus,
      displayStatusText: 'Session Finished • Awaiting Official FIA Results',
      badgeLabel: 'FINISHED',
      badgeType: 'locked',
      actionButtonText: 'View Session Telemetry',
      canPredict: false,
    };
  }

  if (sessionStatus === 'LIVE') {
    return {
      predictionStatus,
      sessionStatus,
      resultStatus,
      scoringStatus,
      displayStatusText: 'Session in Progress • Predictions Locked',
      badgeLabel: 'LIVE',
      badgeType: 'locked',
      actionButtonText: 'View Live Telemetry',
      canPredict: false,
    };
  }

  if (predictionStatus === 'LOCKED') {
    return {
      predictionStatus,
      sessionStatus,
      resultStatus,
      scoringStatus,
      displayStatusText: 'Predictions Locked • Awaiting Session Start',
      badgeLabel: 'LOCKED',
      badgeType: 'locked',
      actionButtonText: 'View Picks & Grid',
      canPredict: false,
    };
  }

  if (predictionStatus === 'OPEN') {
    return {
      predictionStatus,
      sessionStatus,
      resultStatus,
      scoringStatus,
      displayStatusText: 'Predictions Open',
      badgeLabel: 'OPEN',
      badgeType: 'open',
      actionButtonText: hasUserPrediction ? 'UPDATE PREDICTION' : 'MAKE PREDICTION',
      canPredict: true,
    };
  }

  // Default: UPCOMING / NOT_OPEN
  let opensText = 'Predictions Open Soon';
  if (ctx.opensAt) {
    const d = new Date(ctx.opensAt);
    if (!isNaN(d.getTime())) {
      opensText = `Opens ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  }

  return {
    predictionStatus: 'NOT_OPEN',
    sessionStatus: 'UPCOMING',
    resultStatus: 'NOT_AVAILABLE',
    scoringStatus: 'NOT_SCORED',
    displayStatusText: opensText,
    badgeLabel: 'UPCOMING',
    badgeType: 'upcoming',
    actionButtonText: 'View Session Details',
    canPredict: false,
  };
}

/**
 * Evaluates the status of a RaceWeekend, ensuring passing the scheduled start
 * time does not prematurely mark it as COMPLETED.
 */
export function computeWeekendStatus(
  weekend: RaceWeekend,
  nowTime: Date | number = new Date()
): 'UPCOMING' | 'ACTIVE' | 'COMPLETED' {
  const nowMs = typeof nowTime === 'number' ? nowTime : nowTime.getTime();
  const startMs = new Date(weekend.startDate).getTime();
  const endMs = new Date(weekend.endDate).getTime();

  // If explicitly flagged as COMPLETED by backend authority:
  if (weekend.status === 'COMPLETED') {
    return 'COMPLETED';
  }

  // If sessions are populated, derive from session authoritative states
  if (weekend.sessions && weekend.sessions.length > 0) {
    const allCompleted = weekend.sessions.every(s => s.status === 'COMPLETED');
    if (allCompleted) {
      return 'COMPLETED';
    }

    const anyLive = weekend.sessions.some(s => s.status === 'LIVE' || s.status === 'ONGOING');
    if (anyLive) {
      return 'ACTIVE';
    }

    const sessionTimes = weekend.sessions.map(s => new Date(s.startTime).getTime()).filter(t => !isNaN(t));
    const firstSessionMs = sessionTimes.length > 0 ? Math.min(...sessionTimes) : startMs;
    const lastSessionMs = sessionTimes.length > 0 ? Math.max(...sessionTimes) : endMs;

    // Active window: from 24h before first session to at least 4h after last session starts
    if (nowMs >= firstSessionMs - 24 * 3600 * 1000 && nowMs <= lastSessionMs + 4 * 3600 * 1000) {
      return 'ACTIVE';
    }

    if (nowMs < firstSessionMs) {
      return 'UPCOMING';
    }

    return 'COMPLETED';
  }

  // When session details are not populated:
  // A race weekend remains ACTIVE during its dates plus a 6-hour post-race buffer.
  // This prevents the scheduled race start time from instantly flipping to COMPLETED.
  const postRaceBufferMs = 6 * 3600 * 1000;
  if (nowMs > endMs + postRaceBufferMs) {
    return 'COMPLETED';
  }
  if (nowMs >= startMs - 24 * 3600 * 1000) {
    return 'ACTIVE';
  }
  return 'UPCOMING';
}

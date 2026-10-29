/**
 * THE GRDX — Admin Competition Analytics Types
 * 
 * Defines data structures for:
 * - Global competition metrics across Racing Tag, Strategy Room, and F1 Predictions
 * - Feature-specific performance and participation analytics
 * - Competition leaderboard user summaries
 * - Unified user competition profile and timeline
 */

import { FanIdentityTier } from './quiz';
import { StrategyMode, StrategyCategory, StrategyDifficulty } from './strategy';

export type AnalyticsTimeRange = 'all' | '30d' | '7d';

export type CompetitionFeatureFilter = 'all' | 'quiz' | 'strategy' | 'predictions';

export interface GlobalCompetitionStats {
  totalRegisteredUsers: number;
  uniqueCompetitors: number;
  usersWithAnyParticipation: number;
  racingTagParticipants: number;
  strategyRoomParticipants: number;
  predictionParticipants: number;
  totalAttempts: number;
  totalSubmissionsAndAttempts: number;
  totalCompletedActivities: number;
  activeInPeriod: number;
  activeParticipantsInPeriod: number;
  participationRate: number;
  timeRange: AnalyticsTimeRange;
}

export interface RacingTagAnalytics {
  uniqueUsers: number;
  totalAttempts: number;
  completedAttempts: number;
  incompleteAttempts: number;
  difficultyBreakdown: {
    rookie: number;
    apex: number;
    race_analyst: number;
  };
  byDifficulty: {
    rookie: number;
    apex: number;
    race_analyst: number;
  };
  tierDistribution: Record<FanIdentityTier, number>;
  averageScore: number;
  averagePercentage: number;
  bestScore: number;
  bestScorePercentage: number;
  scoreDistribution: {
    '0-49%': number;
    '50-69%': number;
    '70-84%': number;
    '85-100%': number;
  };
  latestAttemptDate: string | null;
  recentAttempts: Array<{
    attemptId: string;
    userId: string;
    username: string;
    displayName: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    fanIdentityTier: FanIdentityTier;
    difficultyLevel: string;
    status: string;
    completedAt: string;
  }>;
}

export interface StrategyRoomAnalytics {
  uniqueUsers: number;
  totalAttempts: number;
  completedAttempts: number;
  abandonedAttempts: number;
  inProgressAttempts: number;
  byRoomType: {
    tacticalChallenges: number;
    multiStageSimulations: number;
    preRaceStrategy: number;
    liveRaceStrategy: number; // Stated strictly as 0 / not implemented if unrecorded
  };
  scenariosAttempted: Array<{
    scenarioId: string;
    title: string;
    mode: StrategyMode | string;
    attempts: number;
    completed: number;
    avgScore: number;
    bestScore: number;
  }>;
  averageScore: number;
  bestScore: number;
  scoreDistribution: {
    '0-49': number;
    '50-69': number;
    '70-84': number;
    '85-100': number;
  };
  averageTimeDeltaSeconds: number; // negative = net time gained
  averagePositionDelta: number; // positive = net positions gained
  planPreferences: Record<string, number>; // e.g. plan_a, plan_b, plan_c, custom
  latestAttemptDate: string | null;
  recentAttempts: Array<{
    attemptId: string;
    userId: string;
    username: string;
    displayName: string;
    scenarioId: string;
    scenarioTitle: string;
    mode: string;
    status: string;
    score: number;
    timeDeltaSeconds: number;
    positionDelta: number;
    completedAt: string;
    isCompetitive: boolean;
  }>;
}

export interface PredictionAnalytics {
  uniqueUsers: number;
  totalSubmissions: number;
  completedSubmissions: number;
  incompleteSubmissions: number;
  byWeekend: Array<{
    raceWeekendId: string;
    grandPrixName: string;
    roundNumber?: number;
    submissionsCount: number;
    scoredCount: number;
    averageScore: number;
    highestScore: number;
  }>;
  averageScore: number;
  bestScore: number;
  scoreDistribution: {
    '0-15 pts': number;
    '16-30 pts': number;
    '31-45 pts': number;
    '46-60 pts': number;
  };
  latestSubmissionDate: string | null;
  recentSubmissions: Array<{
    predictionId: string;
    userId: string;
    username: string;
    displayName: string;
    roundId: string;
    grandPrixName: string;
    submittedAt: string;
    isScored: boolean;
    score?: number;
  }>;
}

export interface CompetitionUserSummary {
  userId: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  lastCompetitionActivity: string | null;
  
  // Racing Tag stats
  racingTagAttempts: number;
  racingTagCompleted: number;
  racingTagBestScore: number;
  racingTagBestPercentage: number;
  racingTagTier: FanIdentityTier | null;
  
  // Strategy Room stats
  strategyAttempts: number;
  strategyCompleted: number;
  strategyBestScore: number;
  strategyAverageScore: number;
  
  // Prediction stats
  predictionSubmissions: number;
  predictionTotalPoints: number;
  predictionBestScore: number;
  
  // Combined
  totalAttempts: number;
  totalCompletedActivities: number;
  activeFeaturesCount: number;
}

export interface CompetitionActivityEvent {
  id: string;
  type: 'RACING_TAG' | 'STRATEGY_ROOM' | 'PREDICTION';
  title: string;
  detail: string;
  timestamp: string;
  score?: number | string;
  badgeText?: string;
  statusText?: string;
}

export interface UnifiedUserCompetitionProfile {
  account: {
    userId: string;
    username: string;
    displayName: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    createdAt: string;
    lastLoginAt?: string;
    lastCompetitionActivity: string | null;
    role: string;
  };
  combined: {
    totalAttempts: number;
    totalCompletedActivities: number;
    activeFeaturesCount: number;
    lastActivityPerFeature: {
      racingTag: string | null;
      strategyRoom: string | null;
      predictions: string | null;
    };
    activityTimeline: CompetitionActivityEvent[];
  };
  racingTag: {
    attemptsCount: number;
    completedCount: number;
    averageScore: number;
    averagePercentage: number;
    bestScore: number;
    bestPercentage: number;
    earnedTier: FanIdentityTier | null;
    difficultyBreakdown: {
      rookie: number;
      apex: number;
      race_analyst: number;
    };
    achievementsCount: number;
    recentAttempts: Array<{
      attemptId: string;
      score: number;
      totalQuestions: number;
      percentage: number;
      fanIdentityTier: FanIdentityTier;
      difficultyLevel?: string;
      completedAt: string;
      status: string;
    }>;
  };
  strategyRoom: {
    attemptsCount: number;
    completedCount: number;
    scenariosPlayedCount: number;
    averageScore: number;
    bestScore: number;
    tacticalChallengesCount: number;
    multiStageSimulationsCount: number;
    preRaceCount: number;
    averagePositionDelta: number;
    averageTimeDeltaSeconds: number;
    leaderboardRank?: number;
    leaderboardPoints?: number;
    recentAttempts: Array<{
      attemptId: string;
      scenarioId: string;
      scenarioTitle: string;
      mode: string;
      score: number;
      positionDelta: number;
      timeDeltaSeconds: number;
      completedAt: string;
      status: string;
      planId?: string;
      rationale?: string;
    }>;
  };
  predictions: {
    submissionsCount: number;
    raceWeekendsCount: number;
    totalPoints: number;
    averageScore: number;
    bestScore: number;
    seasonRank?: number;
    leaderboardRank?: number;
    recentPredictions: Array<{
      predictionId: string;
      roundId: string;
      grandPrixName: string;
      submittedAt: string;
      isScored: boolean;
      score?: number;
      p1Driver?: string;
      p2Driver?: string;
      p3Driver?: string;
      picksSummary?: string;
    }>;
    recentSubmissions?: Array<{
      predictionId: string;
      roundId: string;
      grandPrixName: string;
      submittedAt: string;
      isScored: boolean;
      score?: number;
      p1Driver?: string;
      p2Driver?: string;
      p3Driver?: string;
      picksSummary?: string;
    }>;
  };
  trackingGaps: {
    liveRaceStrategy: string;
    inDepthTelemetry: string;
  };
}

export interface CompetitionAnalyticsPayload {
  globalStats: GlobalCompetitionStats;
  racingTag: RacingTagAnalytics;
  strategyRoom: StrategyRoomAnalytics;
  predictions: PredictionAnalytics;
  users: CompetitionUserSummary[];
  usersTable?: CompetitionUserSummary[];
  timeRange?: AnalyticsTimeRange;
}

export interface PublicCommunityReport {
  period: AnalyticsTimeRange;
  periodLabel: string;
  lastUpdatedAt: string;
  headlineStats: {
    registeredMembers: number;
    activeCompetitors: number;
    participationRate: number;
    racingTagParticipants: number;
    strategyRoomParticipants: number;
    predictionParticipants: number;
    totalCompetitionActivity: number;
    activityDefinition: string;
  };
  racingTag: {
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
    averagePercentage: number;
    difficultyBreakdown: {
      rookie: number;
      apex: number;
      race_analyst: number;
    };
    tierDistribution: Record<string, number>;
  };
  strategyRoom: {
    totalRuns: number;
    completedRuns: number;
    averageScore: number;
    roomTypeBreakdown: {
      tactical: number;
      multiStage: number;
      preRace: number;
    };
    popularScenarios: Array<{
      scenarioId: string;
      title: string;
      mode: string;
      runs: number;
      completionRate: number;
      avgScore: number;
    }>;
  };
  predictions: {
    totalSubmissions: number;
    activeWeekendsCount: number;
    averageScore: number;
    byWeekend: Array<{
      raceWeekendId: string;
      grandPrixName: string;
      submissionsCount: number;
      averageScore: number;
    }>;
  };
}

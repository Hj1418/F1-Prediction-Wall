/**
 * THE GRDX — Strategy Room Leaderboard & Performance Service
 * 
 * Handles:
 * - Deterministic ISO week period-key generation (YYYY-Www)
 * - Competitive score tracking with anti-duplicate and best-score enforcement
 * - Weekly, Overall, and Scenario-specific leaderboards
 * - Multi-criteria tie-breaking (Points -> Avg Score -> Completed count -> Earliest completion)
 * - User telemetry and performance summaries across categories
 */

import {
  StrategyAttempt,
  StrategyLeaderboardEntry,
  StrategyUserPerformance,
  StrategyCategory
} from '../../types/strategy';
import { getScenarioById } from './scenarioRegistry';

const STORAGE_WEEKLY_KEY = 'thegrid_strategy_weekly_lb_v1';
const STORAGE_OVERALL_KEY = 'thegrid_strategy_overall_lb_v1';
const STORAGE_SCENARIO_RECORDS_KEY = 'thegrid_strategy_scenario_records_v1';

// In-memory caches for test environments and high performance
let inMemoryWeekly: Record<string, StrategyLeaderboardEntry[]> = {};
let inMemoryOverall: StrategyLeaderboardEntry[] = [];
let inMemoryScenarioRecords: Record<string, Array<{
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  favouriteConstructor?: string;
  score: number;
  completedAt: string;
  scenarioVersion: number;
}>> = {};

/**
 * Returns ISO 8601 week string: "YYYY-Www" (e.g. "2026-W43")
 */
export function getStrategyPeriodKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Load raw weekly store
 */
function loadWeeklyStore(): Record<string, StrategyLeaderboardEntry[]> {
  if (typeof localStorage === 'undefined') return inMemoryWeekly;
  try {
    const raw = localStorage.getItem(STORAGE_WEEKLY_KEY);
    return raw ? JSON.parse(raw) : inMemoryWeekly;
  } catch {
    return inMemoryWeekly;
  }
}

/**
 * Save weekly store
 */
function saveWeeklyStore(data: Record<string, StrategyLeaderboardEntry[]>): void {
  inMemoryWeekly = data;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_WEEKLY_KEY, JSON.stringify(data));
  } catch {
    // Non-fatal
  }
}

/**
 * Load raw overall store
 */
function loadOverallStore(): StrategyLeaderboardEntry[] {
  if (typeof localStorage === 'undefined') return inMemoryOverall;
  try {
    const raw = localStorage.getItem(STORAGE_OVERALL_KEY);
    return raw ? JSON.parse(raw) : inMemoryOverall;
  } catch {
    return inMemoryOverall;
  }
}

/**
 * Save overall store
 */
function saveOverallStore(data: StrategyLeaderboardEntry[]): void {
  inMemoryOverall = data;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_OVERALL_KEY, JSON.stringify(data));
  } catch {
    // Non-fatal
  }
}

/**
 * Load scenario records store
 */
function loadScenarioRecordsStore(): typeof inMemoryScenarioRecords {
  if (typeof localStorage === 'undefined') return inMemoryScenarioRecords;
  try {
    const raw = localStorage.getItem(STORAGE_SCENARIO_RECORDS_KEY);
    return raw ? JSON.parse(raw) : inMemoryScenarioRecords;
  } catch {
    return inMemoryScenarioRecords;
  }
}

/**
 * Save scenario records store
 */
function saveScenarioRecordsStore(data: typeof inMemoryScenarioRecords): void {
  inMemoryScenarioRecords = data;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SCENARIO_RECORDS_KEY, JSON.stringify(data));
  } catch {
    // Non-fatal
  }
}

/**
 * Deterministic leaderboard sorter
 * 1. totalPoints descending
 * 2. averageScore descending
 * 3. bestScore descending
 * 4. challengesCompleted + simulationsCompleted descending
 * 5. updatedAt ascending (first to achieve wins tie)
 */
function sortAndRankLeaderboard(entries: StrategyLeaderboardEntry[]): StrategyLeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    const countA = a.challengesCompleted + a.simulationsCompleted;
    const countB = b.challengesCompleted + b.simulationsCompleted;
    if (countB !== countA) return countB - countA;
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

/**
 * Registers a completed competitive attempt and recalculates weekly & overall rankings.
 * Enforces one eligible competitive score per scenario version per user per period.
 */
export function recordCompetitiveStrategyAttempt(
  attempt: StrategyAttempt,
  userProfile?: {
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    favouriteConstructor?: string;
  }
): { weeklyRank: number; overallRank: number; pointsEarned: number } {
  if (!attempt.isCompetitive || attempt.status !== 'completed') {
    return { weeklyRank: 0, overallRank: 0, pointsEarned: 0 };
  }

  const periodKey = getStrategyPeriodKey(new Date(attempt.completedAt || attempt.startedAt));
  const username = userProfile?.username || attempt.username || 'Strategist';
  const displayName = userProfile?.displayName || attempt.userDisplayName || username;
  const avatarUrl = userProfile?.avatarUrl;
  const favouriteConstructor = userProfile?.favouriteConstructor;

  // 1. Scenario record update (keeps best score for this scenario)
  const scenarioStore = loadScenarioRecordsStore();
  const scenarioList = scenarioStore[attempt.scenarioId] || [];
  const existingScenarioIndex = scenarioList.findIndex(
    r => r.userId === attempt.userId && r.scenarioVersion === attempt.scenarioVersion
  );

  let newScenarioBest = false;
  if (existingScenarioIndex >= 0) {
    if (attempt.score > scenarioList[existingScenarioIndex].score) {
      scenarioList[existingScenarioIndex] = {
        userId: attempt.userId,
        username,
        displayName,
        avatarUrl,
        favouriteConstructor,
        score: attempt.score,
        completedAt: attempt.completedAt || new Date().toISOString(),
        scenarioVersion: attempt.scenarioVersion
      };
      newScenarioBest = true;
    }
  } else {
    scenarioList.push({
      userId: attempt.userId,
      username,
      displayName,
      avatarUrl,
      favouriteConstructor,
      score: attempt.score,
      completedAt: attempt.completedAt || new Date().toISOString(),
      scenarioVersion: attempt.scenarioVersion
    });
    newScenarioBest = true;
  }
  scenarioStore[attempt.scenarioId] = scenarioList;
  saveScenarioRecordsStore(scenarioStore);

  // 2. Weekly Leaderboard update
  const weeklyStore = loadWeeklyStore();
  const weekList = weeklyStore[periodKey] || [];
  const existingWeeklyIdx = weekList.findIndex(e => e.userId === attempt.userId);

  const pointsEarned = attempt.pointsAwarded || attempt.score;

  if (existingWeeklyIdx >= 0) {
    const entry = weekList[existingWeeklyIdx];
    // If user improved their score on this scenario or it's a new scenario
    const prevPoints = entry.totalPoints;
    const prevBest = entry.bestScore;
    const isChallenge = attempt.mode === 'challenge';
    
    // Only increment completion if it's the first competitive completion of this scenario this week
    // Otherwise update totals idempotently
    entry.totalPoints = prevPoints + (newScenarioBest ? Math.max(0, pointsEarned) : 0);
    entry.bestScore = Math.max(prevBest, attempt.score);
    if (newScenarioBest) {
      if (isChallenge) entry.challengesCompleted += 1;
      else entry.simulationsCompleted += 1;
    }
    const totalCount = entry.challengesCompleted + entry.simulationsCompleted;
    entry.averageScore = totalCount > 0 ? Math.round((entry.totalPoints / totalCount) * 10) / 10 : attempt.score;
    entry.updatedAt = attempt.completedAt || new Date().toISOString();
    if (avatarUrl) entry.avatarUrl = avatarUrl;
    if (favouriteConstructor) entry.favouriteConstructor = favouriteConstructor;
    weekList[existingWeeklyIdx] = entry;
  } else {
    weekList.push({
      rank: 1,
      userId: attempt.userId,
      username,
      displayName,
      avatarUrl,
      favouriteConstructor,
      totalPoints: pointsEarned,
      challengesCompleted: attempt.mode === 'challenge' ? 1 : 0,
      simulationsCompleted: attempt.mode === 'race_simulation' ? 1 : 0,
      averageScore: attempt.score,
      bestScore: attempt.score,
      periodKey,
      updatedAt: attempt.completedAt || new Date().toISOString()
    });
  }

  const rankedWeekly = sortAndRankLeaderboard(weekList);
  weeklyStore[periodKey] = rankedWeekly;
  saveWeeklyStore(weeklyStore);

  // 3. Overall Leaderboard update
  const overallList = loadOverallStore();
  const existingOverallIdx = overallList.findIndex(e => e.userId === attempt.userId);

  if (existingOverallIdx >= 0) {
    const entry = overallList[existingOverallIdx];
    entry.totalPoints += (newScenarioBest ? Math.max(0, pointsEarned) : 0);
    entry.bestScore = Math.max(entry.bestScore, attempt.score);
    if (newScenarioBest) {
      if (attempt.mode === 'challenge') entry.challengesCompleted += 1;
      else entry.simulationsCompleted += 1;
    }
    const totalCount = entry.challengesCompleted + entry.simulationsCompleted;
    entry.averageScore = totalCount > 0 ? Math.round((entry.totalPoints / totalCount) * 10) / 10 : attempt.score;
    entry.updatedAt = attempt.completedAt || new Date().toISOString();
    if (avatarUrl) entry.avatarUrl = avatarUrl;
    if (favouriteConstructor) entry.favouriteConstructor = favouriteConstructor;
    overallList[existingOverallIdx] = entry;
  } else {
    overallList.push({
      rank: 1,
      userId: attempt.userId,
      username,
      displayName,
      avatarUrl,
      favouriteConstructor,
      totalPoints: pointsEarned,
      challengesCompleted: attempt.mode === 'challenge' ? 1 : 0,
      simulationsCompleted: attempt.mode === 'race_simulation' ? 1 : 0,
      averageScore: attempt.score,
      bestScore: attempt.score,
      periodKey: 'all_time',
      updatedAt: attempt.completedAt || new Date().toISOString()
    });
  }

  const rankedOverall = sortAndRankLeaderboard(overallList);
  saveOverallStore(rankedOverall);

  const userWeekly = rankedWeekly.find(e => e.userId === attempt.userId);
  const userOverall = rankedOverall.find(e => e.userId === attempt.userId);

  return {
    weeklyRank: userWeekly?.rank || 1,
    overallRank: userOverall?.rank || 1,
    pointsEarned
  };
}

/**
 * Get Weekly Strategy Leaderboard
 */
export async function getWeeklyStrategyLeaderboard(periodKey?: string): Promise<StrategyLeaderboardEntry[]> {
  const targetPeriod = periodKey || getStrategyPeriodKey();
  const store = loadWeeklyStore();
  return store[targetPeriod] || [];
}

/**
 * Get Overall Strategy Leaderboard
 */
export async function getOverallStrategyLeaderboard(): Promise<StrategyLeaderboardEntry[]> {
  return loadOverallStore();
}

/**
 * Get Scenario-specific High Scores
 */
export async function getScenarioLeaderboard(scenarioId: string): Promise<Array<{
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  favouriteConstructor?: string;
  score: number;
  completedAt: string;
}>> {
  const store = loadScenarioRecordsStore();
  const list = store[scenarioId] || [];
  const sorted = [...list].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
  });

  return sorted.map((entry, index) => ({
    rank: index + 1,
    ...entry
  }));
}

/**
 * Calculate full user performance telemetry from their attempts
 */
export function getUserStrategyPerformance(
  userId: string,
  userAttempts: StrategyAttempt[]
): StrategyUserPerformance {
  const weekly = loadWeeklyStore()[getStrategyPeriodKey()] || [];
  const overall = loadOverallStore();

  const userWeekly = weekly.find(e => e.userId === userId);
  const userOverall = overall.find(e => e.userId === userId);

  const completed = userAttempts.filter(a => a.status === 'completed');
  const scores = completed.map(a => a.score);
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const averageScore = scores.length > 0
    ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
    : 0;

  const categoryStats: Record<StrategyCategory, { completed: number; avgScore: number }> = {
    pit_window: { completed: 0, avgScore: 0 },
    undercut_overcut: { completed: 0, avgScore: 0 },
    safety_car: { completed: 0, avgScore: 0 },
    weather_tires: { completed: 0, avgScore: 0 },
    pace_management: { completed: 0, avgScore: 0 },
    race_management: { completed: 0, avgScore: 0 }
  };

  const categoryScoreSums: Record<string, { sum: number; count: number }> = {};

  completed.forEach(attempt => {
    const scenario = getScenarioById(attempt.scenarioId);
    let cat: StrategyCategory = scenario?.category || (attempt.mode === 'race_simulation' ? 'race_management' : 'pit_window');

    if (!categoryScoreSums[cat]) {
      categoryScoreSums[cat] = { sum: 0, count: 0 };
    }
    categoryScoreSums[cat].sum += attempt.score;
    categoryScoreSums[cat].count += 1;
  });

  (Object.keys(categoryStats) as StrategyCategory[]).forEach(cat => {
    const data = categoryScoreSums[cat];
    if (data && data.count > 0) {
      categoryStats[cat] = {
        completed: data.count,
        avgScore: Math.round((data.sum / data.count) * 10) / 10
      };
    }
  });

  return {
    userId,
    totalPoints: userOverall?.totalPoints || 0,
    weeklyPoints: userWeekly?.totalPoints || 0,
    weeklyRank: userWeekly?.rank || 0,
    overallRank: userOverall?.rank || 0,
    totalAttempts: userAttempts.length,
    completedScenariosCount: completed.length,
    averageScore,
    bestScore: highestScore,
    categoryStats,
    recentAttempts: [...userAttempts].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    ).slice(0, 10)
  };
}

/**
 * Seed initial mock leaderboard entries if empty, ensuring immediate competitive richness
 */
export function seedMockLeaderboardsIfEmpty(): void {
  const overall = loadOverallStore();
  if (overall.length > 0) return;

  const mockUsers: Array<Partial<StrategyLeaderboardEntry>> = [
    {
      userId: 'mock-user-1',
      username: 'ApexPredator44',
      displayName: 'Hannah Schmitz Fan',
      favouriteConstructor: 'Red Bull Racing',
      totalPoints: 1380,
      challengesCompleted: 14,
      simulationsCompleted: 4,
      averageScore: 92.4,
      bestScore: 99
    },
    {
      userId: 'mock-user-2',
      username: 'PitWallMaestro',
      displayName: 'Inaki Rueda',
      favouriteConstructor: 'Ferrari',
      totalPoints: 1210,
      challengesCompleted: 12,
      simulationsCompleted: 3,
      averageScore: 88.5,
      bestScore: 96
    },
    {
      userId: 'mock-user-3',
      username: 'JamesVowlesDisciple',
      displayName: 'Valtteri, It\'s James',
      favouriteConstructor: 'Mercedes',
      totalPoints: 1040,
      challengesCompleted: 11,
      simulationsCompleted: 2,
      averageScore: 85.0,
      bestScore: 94
    },
    {
      userId: 'mock-user-4',
      username: 'MonacoOvercut',
      displayName: 'Checo Whisperer',
      favouriteConstructor: 'Red Bull Racing',
      totalPoints: 920,
      challengesCompleted: 10,
      simulationsCompleted: 2,
      averageScore: 82.3,
      bestScore: 91
    },
    {
      userId: 'mock-user-5',
      username: 'SlickInTheRain',
      displayName: 'Interlagos 2008',
      favouriteConstructor: 'McLaren',
      totalPoints: 780,
      challengesCompleted: 8,
      simulationsCompleted: 1,
      averageScore: 79.5,
      bestScore: 88
    }
  ];

  const now = new Date().toISOString();
  const periodKey = getStrategyPeriodKey();

  const seededOverall: StrategyLeaderboardEntry[] = mockUsers.map((u, i) => ({
    rank: i + 1,
    userId: u.userId!,
    username: u.username!,
    displayName: u.displayName!,
    favouriteConstructor: u.favouriteConstructor,
    totalPoints: u.totalPoints!,
    challengesCompleted: u.challengesCompleted!,
    simulationsCompleted: u.simulationsCompleted!,
    averageScore: u.averageScore!,
    bestScore: u.bestScore!,
    periodKey: 'all_time',
    updatedAt: now
  }));

  const seededWeekly: StrategyLeaderboardEntry[] = mockUsers.slice(0, 4).map((u, i) => ({
    rank: i + 1,
    userId: u.userId!,
    username: u.username!,
    displayName: u.displayName!,
    favouriteConstructor: u.favouriteConstructor,
    totalPoints: Math.round(u.totalPoints! * 0.4),
    challengesCompleted: Math.max(1, Math.round(u.challengesCompleted! * 0.4)),
    simulationsCompleted: Math.max(0, Math.round(u.simulationsCompleted! * 0.4)),
    averageScore: u.averageScore!,
    bestScore: u.bestScore!,
    periodKey,
    updatedAt: now
  }));

  saveOverallStore(seededOverall);
  const weeklyStore = loadWeeklyStore();
  weeklyStore[periodKey] = seededWeekly;
  saveWeeklyStore(weeklyStore);
}

// Auto seed on module load
seedMockLeaderboardsIfEmpty();

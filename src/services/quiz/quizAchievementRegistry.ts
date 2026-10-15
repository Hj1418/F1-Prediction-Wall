import {
  QuizAchievement,
  UserQuizAchievement,
  QuizAttemptRecord,
  QuizPerformanceSummary,
  FanIdentityTier,
} from '../../types/quiz';

/**
 * GRDX — Motorsport Quiz Achievement Registry
 * 
 * Stable identifiers, explicit award rules, and immutable versioning.
 * Strictly separate from Prediction League points, trophies, and standings.
 */
export const QUIZ_ACHIEVEMENT_REGISTRY: QuizAchievement[] = [
  {
    id: 'first-lap',
    title: 'First Lap',
    description: 'Complete your first motorsport knowledge quiz on GRDX.',
    badgeIcon: '🏁',
    badgeColor: '#10b981',
    ruleVersion: 1,
    targetValue: 1,
    requirementText: 'Complete 1 quiz attempt',
  },
  {
    id: 'consistent-racer',
    title: 'Consistent Racer',
    description: 'Complete five official motorsport knowledge quizzes.',
    badgeIcon: '⚡',
    badgeColor: '#00d2be',
    ruleVersion: 1,
    targetValue: 5,
    requirementText: 'Complete 5 quiz attempts',
  },
  {
    id: 'podium-performance',
    title: 'Podium Performance',
    description: 'Score 80% or higher on an official motorsport quiz attempt.',
    badgeIcon: '🏆',
    badgeColor: '#eab308',
    ruleVersion: 1,
    targetValue: 80,
    requirementText: 'Score at least 80% on a quiz',
  },
  {
    id: 'motorsport-oracle',
    title: 'Motorsport Oracle',
    description: 'Reach the pinnacle of motorsport knowledge with a score of 95% or higher.',
    badgeIcon: '🔮',
    badgeColor: '#b966ff',
    ruleVersion: 1,
    targetValue: 95,
    requirementText: 'Attain the Motorsport Oracle tier (≥ 95%)',
  },
  {
    id: 'all-rounder',
    title: 'All-Rounder',
    description: 'Complete quizzes across at least three distinct motorsport categories.',
    badgeIcon: '🌐',
    badgeColor: '#f43f5e',
    ruleVersion: 1,
    targetValue: 3,
    requirementText: 'Test knowledge in at least 3 categories',
  },
];

/**
 * Deterministically evaluates achievements for a user based on their completed quiz history.
 * Idempotent: previously earned achievements remain unlocked with their original earnedAt timestamp.
 */
export function evaluateQuizAchievements(
  userId: string,
  history: QuizAttemptRecord[],
  existingEarned: UserQuizAchievement[] = []
): {
  allAchievements: UserQuizAchievement[];
  newlyUnlocked: UserQuizAchievement[];
} {
  const completedHistory = (history || []).filter(h => h.status === 'completed' || Boolean(h.completedAt));
  const earnedMap = new Map<string, UserQuizAchievement>();
  existingEarned.forEach(a => earnedMap.set(a.achievementId, a));

  const newlyUnlocked: UserQuizAchievement[] = [];
  const allAchievements: UserQuizAchievement[] = [];

  // Metrics for calculation
  const totalCompleted = completedHistory.length;
  const bestPercentage = completedHistory.reduce((max, h) => Math.max(max, h.percentage || 0), 0);

  const distinctCategories = new Set<string>();
  completedHistory.forEach(h => {
    (h.selectedCategories || []).forEach(cat => distinctCategories.add(cat));
  });
  const categoryCount = distinctCategories.size;

  const nowIso = new Date().toISOString();

  for (const def of QUIZ_ACHIEVEMENT_REGISTRY) {
    const existing = earnedMap.get(def.id);
    let isQualifying = false;
    let progressVal = 0;

    switch (def.id) {
      case 'first-lap':
        progressVal = Math.min(1, totalCompleted);
        isQualifying = totalCompleted >= 1;
        break;
      case 'consistent-racer':
        progressVal = Math.min(5, totalCompleted);
        isQualifying = totalCompleted >= 5;
        break;
      case 'podium-performance':
        progressVal = Math.min(80, bestPercentage);
        isQualifying = bestPercentage >= 80;
        break;
      case 'motorsport-oracle':
        progressVal = Math.min(95, bestPercentage);
        isQualifying = bestPercentage >= 95;
        break;
      case 'all-rounder':
        progressVal = Math.min(3, categoryCount);
        isQualifying = categoryCount >= 3;
        break;
      default:
        break;
    }

    if (existing && existing.isUnlocked) {
      allAchievements.push({
        ...existing,
        progress: {
          current: def.targetValue,
          target: def.targetValue,
        },
      });
    } else if (isQualifying) {
      const unlockedRecord: UserQuizAchievement = {
        achievementId: def.id,
        userId,
        title: def.title,
        description: def.description,
        badgeIcon: def.badgeIcon,
        badgeColor: def.badgeColor,
        earnedAt: nowIso,
        ruleVersion: def.ruleVersion,
        isUnlocked: true,
        progress: {
          current: def.targetValue,
          target: def.targetValue,
        },
      };
      newlyUnlocked.push(unlockedRecord);
      allAchievements.push(unlockedRecord);
    } else {
      allAchievements.push({
        achievementId: def.id,
        userId,
        title: def.title,
        description: def.description,
        badgeIcon: def.badgeIcon,
        badgeColor: def.badgeColor,
        earnedAt: '',
        ruleVersion: def.ruleVersion,
        isUnlocked: false,
        progress: {
          current: progressVal,
          target: def.targetValue,
        },
      });
    }
  }

  return {
    allAchievements,
    newlyUnlocked,
  };
}

/**
 * Calculates high-level summary metrics from completed quiz history.
 */
export function calculateQuizPerformanceSummary(
  history: QuizAttemptRecord[]
): QuizPerformanceSummary {
  const completed = (history || []).filter(h => h.status === 'completed' || Boolean(h.completedAt));

  if (completed.length === 0) {
    return {
      quizzesCompleted: 0,
      bestScorePercentage: 0,
      bestScoreCorrect: 0,
      bestScoreTotal: 0,
      highestTier: 'The Rookie',
      uniqueDisciplinesCount: 0,
      totalQuestionsAnswered: 0,
    };
  }

  let bestPercentage = 0;
  let bestCorrect = 0;
  let bestTotal = 0;
  let totalQuestions = 0;
  const categories = new Set<string>();

  for (const att of completed) {
    if ((att.percentage || 0) > bestPercentage) {
      bestPercentage = att.percentage;
      bestCorrect = att.score;
      bestTotal = att.totalQuestions;
    }
    totalQuestions += (att.totalQuestions || 0);
    (att.selectedCategories || []).forEach(c => categories.add(c));
  }

  // Derive highest tier achieved
  let highestTier: FanIdentityTier = 'The Rookie';
  if (bestPercentage >= 95) highestTier = 'The Motorsport Oracle';
  else if (bestPercentage >= 80) highestTier = 'The Race Strategist';
  else if (bestPercentage >= 60) highestTier = 'The Paddock Insider';
  else if (bestPercentage >= 40) highestTier = 'The Enthusiast';

  return {
    quizzesCompleted: completed.length,
    bestScorePercentage: bestPercentage,
    bestScoreCorrect: bestCorrect,
    bestScoreTotal: bestTotal,
    highestTier,
    uniqueDisciplinesCount: categories.size,
    totalQuestionsAnswered: totalQuestions,
  };
}

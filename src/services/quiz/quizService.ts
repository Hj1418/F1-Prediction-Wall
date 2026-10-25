import {
  QuizQuestion,
  PublicQuizQuestion,
  QuizStartResponse,
  QuizResultPayload,
  QuizAttemptRecord,
  QuizSubmitRequest,
  ScoredQuestionReview,
  QuizCategoryResult,
  UserQuizAchievement,
  QuizPerformanceSummary,
  QuizDifficultyLevel,
} from '../../types/quiz';
import {
  MOTORSPORT_QUIZ_CATEGORIES,
  DEFAULT_QUIZ_QUESTION_COUNT,
  resolveCategoryId,
  getQuizCategory,
  allocateQuestionsPerCategory,
  calculateOverallPercentage,
  calculateCategoryPercentage,
  calculateFanIdentityTier,
  normalizeQuestionDifficulty,
  getDifficultyConfig,
  isQuestionPermittedForDifficulty,
} from './quizRegistry';
import { VERIFIED_QUESTION_BANK, getApprovedQuestions } from './questionBank';
import {
  evaluateQuizAchievements,
  calculateQuizPerformanceSummary,
} from './quizAchievementRegistry';
import { notificationService } from '../notificationService';

const STORAGE_ATTEMPTS_KEY = 'thegrid_quiz_attempts_v1';
const STORAGE_ACHIEVEMENTS_KEY = 'gridx_quiz_achievements_v1';
const PRODUCTION_API_URL =
  'https://script.google.com/macros/s/AKfycbz_TmSvhPNdrTT9HCiCnViVY9dG-5ypZMfyWtp0d4XcjP25mJc7yW8VyawKaSI6LTF9/exec';
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' ? PRODUCTION_API_URL : '');
const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http') && typeof window !== 'undefined');

// In-memory attempts cache for fast retrieval and test environments
const inMemoryAttempts: Map<string, QuizAttemptRecord> = new Map();
const inMemoryAchievements: Map<string, UserQuizAchievement[]> = new Map();

/**
 * Strips correctOptionId and explanation from a QuizQuestion before returning to client.
 */
export function sanitizeQuestionForClient(question: QuizQuestion): PublicQuizQuestion {
  const category = getQuizCategory(question.categoryId);
  return {
    questionId: question.questionId,
    categoryId: question.categoryId,
    categoryName: category?.displayName || question.categoryId,
    question: question.question,
    options: question.options.map(opt => ({ id: opt.id, text: opt.text })),
    difficulty: question.difficulty,
    topic: question.topic,
    contentVersion: question.contentVersion,
    context: question.context,
    era: question.era,
    season: question.season,
  };
}

/**
 * Loads all locally persisted quiz attempts from localStorage
 */
function loadLocalAttempts(): QuizAttemptRecord[] {
  if (typeof localStorage === 'undefined') {
    return Array.from(inMemoryAttempts.values());
  }
  try {
    const raw = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
    if (!raw) return Array.from(inMemoryAttempts.values());
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return Array.from(inMemoryAttempts.values());
  }
}

/**
 * Persists an attempt record to localStorage and memory
 */
function saveLocalAttempt(record: QuizAttemptRecord): void {
  inMemoryAttempts.set(record.attemptId, record);
  if (typeof localStorage === 'undefined') return;
  try {
    const current = loadLocalAttempts().filter(a => a.attemptId !== record.attemptId);
    current.unshift(record);
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(current));
  } catch (_e) {
    // Non-critical local storage fallback
  }
}

/**
 * Loads locally persisted quiz achievements for a user
 */
function loadLocalQuizAchievements(userId: string): UserQuizAchievement[] {
  if (inMemoryAchievements.has(userId)) {
    return inMemoryAchievements.get(userId)!;
  }
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_ACHIEVEMENTS_KEY}_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

/**
 * Persists quiz achievements for a user to localStorage and memory
 */
function saveLocalQuizAchievements(userId: string, achievements: UserQuizAchievement[]): void {
  inMemoryAchievements.set(userId, achievements);
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_ACHIEVEMENTS_KEY}_${userId}`, JSON.stringify(achievements));
  } catch (_e) {}
}

/**
 * Shuffles an array deterministically or pseudo-randomly
 */
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const quizService = {
  isLive: isLiveBackend,

  /**
   * Fetches the category registry with approved question counts, optionally filtered by difficulty
   */
  async getCategories(difficultyLevel?: QuizDifficultyLevel | string) {
    const rawApproved = getApprovedQuestions();
    const approved = difficultyLevel
      ? rawApproved.filter(q => isQuestionPermittedForDifficulty(q.difficulty, difficultyLevel))
      : rawApproved;

    const countMap: Record<string, number> = {};
    for (const q of approved) {
      countMap[q.categoryId] = (countMap[q.categoryId] || 0) + 1;
    }

    return MOTORSPORT_QUIZ_CATEGORIES.map(cat => ({
      ...cat,
      availableQuestions: countMap[cat.id] || 0,
    }));
  },

  /**
   * Starts a new standard 20-question quiz attempt.
   * Enforces selected difficulty ceiling:
   * - Rookie: Rookie questions only
   * - Apex: Rookie and Apex questions
   * - Race Analyst: Rookie, Apex, and Race Analyst questions
   * Allocates 20 unique questions balanced across selected categories.
   * If insufficient eligible questions exist, raises an explicit error.
   */
  async startQuizAttempt(params: {
    userId: string;
    categoryIds: string[];
    difficultyLevel?: QuizDifficultyLevel | string;
  }): Promise<QuizStartResponse> {
    const userId = (params.userId || '').trim();
    if (!userId || userId === 'guest_user') {
      throw new Error('Authentication required: You must be signed in to take the Motorsport Fan Identity Quiz.');
    }

    const rawCategories = params.categoryIds || [];
    if (rawCategories.length === 0) {
      throw new Error('Please select at least one motorsport category.');
    }

    const resolvedCategories = Array.from(
      new Set(rawCategories.map(c => resolveCategoryId(c)))
    ).filter(c => MOTORSPORT_QUIZ_CATEGORIES.some(cat => cat.id === c));

    if (resolvedCategories.length === 0) {
      throw new Error('No valid motorsport categories selected.');
    }

    const resolvedDifficulty: QuizDifficultyLevel = normalizeQuestionDifficulty(params.difficultyLevel || 'apex');
    const diffConfig = getDifficultyConfig(resolvedDifficulty);

    // Try live backend if available
    if (isLiveBackend) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${API_BASE_URL}?action=startQuizAttempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, categoryIds: resolvedCategories, difficultyLevel: resolvedDifficulty }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      } catch (_e) {
        // Fall back to local authoritative engine
      }
    }

    // Authoritative Local Engine
    // Filter questions by difficulty ceiling: questions must not exceed selected difficulty
    const approvedPool = getApprovedQuestions().filter(q =>
      isQuestionPermittedForDifficulty(q.difficulty, resolvedDifficulty)
    );

    const availableByCat: Record<string, number> = {};
    const poolByCat: Record<string, QuizQuestion[]> = {};

    for (const catId of resolvedCategories) {
      poolByCat[catId] = approvedPool.filter(q => q.categoryId === catId);
      availableByCat[catId] = poolByCat[catId].length;
    }

    const totalAvailable = Object.values(availableByCat).reduce((a, b) => a + b, 0);

    // Safeguard: do not silently duplicate or downgrade difficulty if inventory is insufficient
    if (totalAvailable < DEFAULT_QUIZ_QUESTION_COUNT) {
      throw new Error(
        `Insufficient eligible questions available (${totalAvailable} available, ${DEFAULT_QUIZ_QUESTION_COUNT} required) for the selected categories and difficulty level (${diffConfig.label}). Please select additional categories or choose a higher difficulty ceiling.`
      );
    }

    const allocation = allocateQuestionsPerCategory(
      resolvedCategories,
      DEFAULT_QUIZ_QUESTION_COUNT,
      availableByCat
    );

    const totalAllocated = Object.values(allocation).reduce((a, b) => a + b, 0);
    if (totalAllocated < DEFAULT_QUIZ_QUESTION_COUNT) {
      throw new Error(
        `Insufficient eligible questions available (${totalAllocated} allocated, ${DEFAULT_QUIZ_QUESTION_COUNT} required) for the selected categories and difficulty level (${diffConfig.label}). Please select additional categories or choose a higher difficulty ceiling.`
      );
    }

    const selectedQuestions: QuizQuestion[] = [];

    // Avoid immediately repeating recent questions for this user
    const previousAttempts = (await this.getUserQuizHistory(userId)).slice(0, 3);
    const recentQuestionIds = new Set<string>();
    for (const att of previousAttempts) {
      for (const qId of att.questionIds || []) {
        recentQuestionIds.add(qId);
      }
    }

    for (const catId of resolvedCategories) {
      const quota = allocation[catId] || 0;
      if (quota <= 0) continue;

      const catPool = poolByCat[catId] || [];

      // Sort category pool according to difficulty distribution policy:
      // - Rookie: 100% Rookie
      // - Apex: Prioritize Apex, filled with Rookie
      // - Race Analyst: Prioritize Race Analyst, then Apex, then Rookie
      const rookieQuestions = shuffleArray(catPool.filter(q => normalizeQuestionDifficulty(q.difficulty) === 'rookie'));
      const apexQuestions = shuffleArray(catPool.filter(q => normalizeQuestionDifficulty(q.difficulty) === 'apex'));
      const analystQuestions = shuffleArray(catPool.filter(q => normalizeQuestionDifficulty(q.difficulty) === 'race_analyst'));

      let prioritizedPool: QuizQuestion[] = [];
      if (resolvedDifficulty === 'race_analyst') {
        prioritizedPool = [...analystQuestions, ...apexQuestions, ...rookieQuestions];
      } else if (resolvedDifficulty === 'apex') {
        prioritizedPool = [...apexQuestions, ...rookieQuestions];
      } else {
        prioritizedPool = rookieQuestions;
      }

      const freshQuestions = prioritizedPool.filter(q => !recentQuestionIds.has(q.questionId));
      const poolToDrawFrom = freshQuestions.length >= quota ? freshQuestions : prioritizedPool;

      const chosen = poolToDrawFrom.slice(0, quota);
      selectedQuestions.push(...chosen);
    }

    // Verify uniqueness of question IDs
    const seenIds = new Set<string>();
    const uniqueSelected: QuizQuestion[] = [];
    for (const q of selectedQuestions) {
      if (!seenIds.has(q.questionId)) {
        seenIds.add(q.questionId);
        uniqueSelected.push(q);
      }
    }

    if (uniqueSelected.length < DEFAULT_QUIZ_QUESTION_COUNT) {
      throw new Error(
        `Insufficient unique questions available (${uniqueSelected.length} unique, ${DEFAULT_QUIZ_QUESTION_COUNT} required).`
      );
    }

    // Shuffle questions order for dynamic interactive experience
    const finalQuestions = shuffleArray(uniqueSelected.slice(0, DEFAULT_QUIZ_QUESTION_COUNT));

    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startedAt = new Date().toISOString();

    const questionIds = finalQuestions.map(q => q.questionId);
    const questionVersions: Record<string, number> = {};
    for (const q of finalQuestions) {
      questionVersions[q.questionId] = q.contentVersion;
    }

    const attemptRecord: QuizAttemptRecord = {
      attemptId,
      userId,
      selectedCategories: resolvedCategories,
      difficultyLevel: resolvedDifficulty,
      questionIds,
      questionContentVersions: questionVersions,
      submittedAnswers: {},
      score: 0,
      totalQuestions: finalQuestions.length,
      percentage: 0,
      fanIdentityTier: 'The Rookie',
      categoryBreakdown: {},
      startedAt,
      status: 'in_progress',
    };

    saveLocalAttempt(attemptRecord);

    const publicQuestions = finalQuestions.map(sanitizeQuestionForClient);

    return {
      attemptId,
      totalQuestions: finalQuestions.length,
      selectedCategories: resolvedCategories,
      difficultyLevel: resolvedDifficulty,
      questions: publicQuestions,
      startedAt,
    };
  },

  /**
   * Submits a completed quiz attempt.
   * Synchronously scores answers against verified answer keys.
   * Idempotent: repeated submissions return the already recorded result.
   */
  async submitQuizAttempt(payload: QuizSubmitRequest): Promise<QuizResultPayload> {
    const { attemptId, userId, answers } = payload;

    const cleanUserId = (userId || '').trim();
    if (!cleanUserId || cleanUserId === 'guest_user') {
      throw new Error('Authentication required: You must be signed in to submit your quiz attempt.');
    }

    if (!attemptId) {
      throw new Error('Missing attempt ID.');
    }

    // Try live backend if available
    if (isLiveBackend) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${API_BASE_URL}?action=submitQuizAttempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId, userId: cleanUserId, answers }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        const json = await res.json();
        if (json.success && json.data) {
          // Sync result to local cache as well
          const result = json.data;
          const localRecord: QuizAttemptRecord = {
            attemptId: result.attemptId,
            userId: result.userId,
            selectedCategories: result.selectedCategories,
            questionIds: result.questions.map((q: any) => q.questionId),
            questionContentVersions: {},
            submittedAnswers: answers,
            score: result.score,
            totalQuestions: result.totalQuestions,
            percentage: result.percentage,
            fanIdentityTier: result.fanIdentityTier,
            categoryBreakdown: result.categoryBreakdown,
            startedAt: result.startedAt,
            completedAt: result.completedAt,
            status: 'completed',
          };
          saveLocalAttempt(localRecord);
          return result;
        }
      } catch (_e) {
        // Fall back to local authoritative scoring engine
      }
    }

    // Authoritative Local Scoring
    const attempts = loadLocalAttempts();
    const existing = attempts.find(a => a.attemptId === attemptId) || inMemoryAttempts.get(attemptId);

    if (!existing) {
      throw new Error(`Attempt with ID "${attemptId}" was not found.`);
    }

    // Verify ownership
    if (existing.userId && existing.userId !== cleanUserId) {
      throw new Error('Unauthorized: You do not own this quiz attempt.');
    }

    // Idempotency: if already completed, return existing completed result
    if (existing.status === 'completed' && existing.completedAt) {
      return this.formatResultPayload(existing);
    }

    // Score against verified question bank
    const questionBankMap = new Map<string, QuizQuestion>();
    for (const q of VERIFIED_QUESTION_BANK) {
      questionBankMap.set(q.questionId, q);
    }

    let totalScore = 0;
    const scoredQuestions: ScoredQuestionReview[] = [];
    const categoryStats: Record<string, { correct: number; total: number; name: string }> = {};

    for (const catId of existing.selectedCategories) {
      const cat = getQuizCategory(catId);
      categoryStats[catId] = {
        correct: 0,
        total: 0,
        name: cat?.displayName || catId,
      };
    }

    for (const questionId of existing.questionIds) {
      const q = questionBankMap.get(questionId);
      if (!q) continue;

      const selectedOptionId = answers[questionId] || null;
      const isCorrect = Boolean(selectedOptionId && selectedOptionId === q.correctOptionId);

      if (isCorrect) {
        totalScore += 1;
      }

      if (!categoryStats[q.categoryId]) {
        const cat = getQuizCategory(q.categoryId);
        categoryStats[q.categoryId] = {
          correct: 0,
          total: 0,
          name: cat?.displayName || q.categoryId,
        };
      }

      categoryStats[q.categoryId].total += 1;
      if (isCorrect) {
        categoryStats[q.categoryId].correct += 1;
      }

      scoredQuestions.push({
        questionId: q.questionId,
        categoryId: q.categoryId,
        categoryName: categoryStats[q.categoryId].name,
        question: q.question,
        options: q.options,
        selectedOptionId,
        correctOptionId: q.correctOptionId,
        isCorrect,
        explanation: q.explanation,
        sourceUrl: q.sourceUrl,
        context: q.context,
        contentVersion: q.contentVersion,
        difficulty: q.difficulty,
        topic: q.topic,
        era: q.era,
        season: q.season,
      });
    }

    const totalQuestions = existing.questionIds.length;
    const overallPercentage = calculateOverallPercentage(totalScore, totalQuestions);
    const fanIdentityTier = calculateFanIdentityTier(overallPercentage);

    const categoryBreakdown: Record<string, QuizCategoryResult> = {};
    for (const [catId, stats] of Object.entries(categoryStats)) {
      categoryBreakdown[catId] = {
        categoryId: catId,
        categoryName: stats.name,
        correct: stats.correct,
        total: stats.total,
        percentage: calculateCategoryPercentage(stats.correct, stats.total),
      };
    }

    const completedAt = new Date().toISOString();

    // Persist completed attempt immutably
    const completedRecord: QuizAttemptRecord = {
      ...existing,
      userId: cleanUserId,
      submittedAnswers: answers,
      score: totalScore,
      totalQuestions,
      percentage: overallPercentage,
      fanIdentityTier,
      categoryBreakdown,
      completedAt,
      status: 'completed',
    };

    saveLocalAttempt(completedRecord);

    // Evaluate and save quiz achievements locally for offline/test mode
    const history = await this.getUserQuizHistory(cleanUserId);
    const allUserAttempts = [completedRecord, ...history.filter(h => h.attemptId !== completedRecord.attemptId)];
    const existingEarnedAchs = await this.getUserQuizAchievements(cleanUserId);
    const evalRes = evaluateQuizAchievements(cleanUserId, allUserAttempts, existingEarnedAchs);
    saveLocalQuizAchievements(cleanUserId, evalRes.allAchievements);

    // Notify newly unlocked quiz achievements idempotently with compact toasts
    if (evalRes.newlyUnlocked && evalRes.newlyUnlocked.length > 0) {
      for (const ach of evalRes.newlyUnlocked) {
        notificationService.notifyQuizAchievementUnlocked(cleanUserId, ach);
      }
    }

    return {
      attemptId,
      userId: cleanUserId,
      selectedCategories: existing.selectedCategories,
      difficultyLevel: existing.difficultyLevel,
      score: totalScore,
      totalQuestions,
      percentage: overallPercentage,
      fanIdentityTier,
      categoryBreakdown,
      startedAt: existing.startedAt,
      completedAt,
      questions: scoredQuestions,
    };
  },

  /**
   * Returns past completed attempts for a specific user
   */
  async getUserQuizHistory(userId: string): Promise<QuizAttemptRecord[]> {
    if (!userId || userId === 'guest_user') return [];

    if (isLiveBackend) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${API_BASE_URL}?action=getUserQuizHistory&userId=${encodeURIComponent(userId)}`, {
          signal: controller.signal,
        });
        clearTimeout(timer);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (_e) {
        // Fall back to local storage
      }
    }

    const allAttempts = loadLocalAttempts();
    return allAttempts
      .filter(a => a.userId === userId && a.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime());
  },

  /**
   * Retrieves full result payload for an attempt by ID
   */
  async getQuizAttemptResult(attemptId: string, userId?: string): Promise<QuizResultPayload | null> {
    if (!attemptId) return null;

    const attempts = loadLocalAttempts();
    const existing = attempts.find(a => a.attemptId === attemptId) || inMemoryAttempts.get(attemptId);

    if (!existing || existing.status !== 'completed') {
      return null;
    }

    if (existing.userId && userId && existing.userId !== userId) {
      throw new Error('Unauthorized: You do not have permission to view this quiz attempt.');
    }

    return this.formatResultPayload(existing);
  },

  /**
   * Retrieves all quiz achievements for a user with earned status and progress
   */
  async getUserQuizAchievements(userId: string): Promise<UserQuizAchievement[]> {
    if (!userId || userId === 'guest_user') return [];

    if (isLiveBackend) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${API_BASE_URL}?action=getUserQuizAchievements&userId=${encodeURIComponent(userId)}`, {
          signal: controller.signal,
        });
        clearTimeout(timer);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (_e) {
        // Fall back to local storage
      }
    }

    const localAchs = loadLocalQuizAchievements(userId);
    const history = await this.getUserQuizHistory(userId);
    const evalRes = evaluateQuizAchievements(userId, history, localAchs);
    return evalRes.allAchievements;
  },

  /**
   * Returns a high-level performance summary for a user
   */
  async getQuizPerformanceSummary(userId: string): Promise<QuizPerformanceSummary> {
    const history = await this.getUserQuizHistory(userId);
    return calculateQuizPerformanceSummary(history);
  },

  /**
   * Helper to format an attempt record into QuizResultPayload with verified explanations
   */
  formatResultPayload(record: QuizAttemptRecord): QuizResultPayload {
    const questionBankMap = new Map<string, QuizQuestion>();
    for (const q of VERIFIED_QUESTION_BANK) {
      questionBankMap.set(q.questionId, q);
    }

    const scoredQuestions: ScoredQuestionReview[] = [];

    for (const questionId of record.questionIds) {
      const q = questionBankMap.get(questionId);
      if (!q) continue;

      const selectedOptionId = record.submittedAnswers[questionId] || null;
      const isCorrect = Boolean(selectedOptionId && selectedOptionId === q.correctOptionId);
      const cat = getQuizCategory(q.categoryId);

      scoredQuestions.push({
        questionId: q.questionId,
        categoryId: q.categoryId,
        categoryName: cat?.displayName || q.categoryId,
        question: q.question,
        options: q.options,
        selectedOptionId,
        correctOptionId: q.correctOptionId,
        isCorrect,
        explanation: q.explanation,
        sourceUrl: q.sourceUrl,
        context: q.context,
        contentVersion: q.contentVersion,
        difficulty: q.difficulty,
        topic: q.topic,
        era: q.era,
        season: q.season,
      });
    }

    return {
      attemptId: record.attemptId,
      userId: record.userId,
      selectedCategories: record.selectedCategories,
      difficultyLevel: record.difficultyLevel,
      score: record.score,
      totalQuestions: record.totalQuestions,
      percentage: record.percentage,
      fanIdentityTier: record.fanIdentityTier,
      categoryBreakdown: record.categoryBreakdown,
      startedAt: record.startedAt,
      completedAt: record.completedAt || record.startedAt,
      questions: scoredQuestions,
    };
  },
};

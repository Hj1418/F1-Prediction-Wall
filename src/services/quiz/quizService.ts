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
} from '../../types/quiz';
import {
  MOTORSPORT_QUIZ_CATEGORIES,
  resolveCategoryId,
  getQuizCategory,
  allocateQuestionsPerCategory,
  calculateOverallPercentage,
  calculateCategoryPercentage,
  calculateFanIdentityTier,
} from './quizRegistry';
import { VERIFIED_QUESTION_BANK, getApprovedQuestions } from './questionBank';
import {
  evaluateQuizAchievements,
  calculateQuizPerformanceSummary,
} from './quizAchievementRegistry';

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
   * Fetches the category registry with approved question counts
   */
  async getCategories() {
    const approved = getApprovedQuestions();
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
   * Starts a new quiz attempt.
   * Allocates up to 15 questions balanced across selected categories.
   * Securely strips answer keys and persists attempt in 'in_progress' status.
   */
  async startQuizAttempt(params: {
    userId: string;
    categoryIds: string[];
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

    // Try live backend if available
    if (isLiveBackend) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${API_BASE_URL}?action=startQuizAttempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, categoryIds: resolvedCategories }),
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
    const approvedPool = getApprovedQuestions();
    const availableByCat: Record<string, number> = {};
    const poolByCat: Record<string, QuizQuestion[]> = {};

    for (const catId of resolvedCategories) {
      poolByCat[catId] = approvedPool.filter(q => q.categoryId === catId);
      availableByCat[catId] = poolByCat[catId].length;
    }

    const allocation = allocateQuestionsPerCategory(resolvedCategories, 15, availableByCat);
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
      const freshQuestions = catPool.filter(q => !recentQuestionIds.has(q.questionId));
      const poolToDrawFrom = freshQuestions.length >= quota ? freshQuestions : catPool;

      const shuffled = shuffleArray(poolToDrawFrom);
      const chosen = shuffled.slice(0, quota);
      selectedQuestions.push(...chosen);
    }

    if (selectedQuestions.length === 0) {
      throw new Error('No approved questions available for the selected categories.');
    }

    // Shuffle questions order for dynamic experience
    const finalQuestions = shuffleArray(selectedQuestions);

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

    return {
      attemptId,
      userId: cleanUserId,
      selectedCategories: existing.selectedCategories,
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
      });
    }

    return {
      attemptId: record.attemptId,
      userId: record.userId,
      selectedCategories: record.selectedCategories,
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

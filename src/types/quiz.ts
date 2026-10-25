/**
 * The Grid — Motorsport Fan Identity Quiz Types
 * 
 * Defines data structures for:
 * - Category registry & grouping
 * - Question bank, options, verification metadata & approval status
 * - Attempt lifecycle, allocation, deterministic scoring & fan identity tiers
 * - Submission payloads, per-category results & attempt history
 */

export type FanIdentityTier =
  | 'The Rookie'
  | 'The Enthusiast'
  | 'The Paddock Insider'
  | 'The Race Strategist'
  | 'The Motorsport Oracle';

export type QuizCategoryGroup =
  | 'Formula Racing'
  | 'Motorcycle Racing'
  | 'Endurance Racing'
  | 'GT Racing';

export type QuizDifficultyLevel = 'rookie' | 'apex' | 'race_analyst';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'rookie' | 'apex' | 'race_analyst';

export type QuestionApprovalStatus = 'draft' | 'in_review' | 'approved' | 'retired';

export interface QuizOption {
  id: string; // 'a' | 'b' | 'c' | 'd'
  text: string;
}

export interface QuizCategory {
  id: string;
  displayName: string;
  grouping: QuizCategoryGroup;
  description: string;
  status: 'available' | 'coming_soon';
  questionBankRef: string;
  color: string;
  badge: string;
  icon?: string;
}

export interface QuizQuestion {
  questionId: string;
  categoryId: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  incorrectExplanations?: Record<string, string>;
  difficulty: QuestionDifficulty;
  topic: string;
  contentVersion: number;
  sourceUrl: string;
  context?: string;
  approvalStatus: QuestionApprovalStatus;
  era?: string;
  season?: number | string;
}

/**
 * Stripped public question sent to client before submission.
 * Correct answer key and explanation are strictly withheld.
 */
export interface PublicQuizQuestion {
  questionId: string;
  categoryId: string;
  categoryName?: string;
  question: string;
  options: QuizOption[];
  difficulty: QuestionDifficulty;
  topic: string;
  contentVersion: number;
  context?: string;
  era?: string;
  season?: number | string;
}

export interface QuizCategoryResult {
  categoryId: string;
  categoryName: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface ScoredQuestionReview {
  questionId: string;
  categoryId: string;
  categoryName: string;
  question: string;
  options: QuizOption[];
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
  sourceUrl: string;
  context?: string;
  contentVersion: number;
  difficulty: QuestionDifficulty;
  topic: string;
  era?: string;
  season?: number | string;
}

export interface QuizResultPayload {
  attemptId: string;
  userId: string;
  selectedCategories: string[];
  difficultyLevel?: QuizDifficultyLevel;
  score: number;
  totalQuestions: number;
  percentage: number;
  fanIdentityTier: FanIdentityTier;
  categoryBreakdown: Record<string, QuizCategoryResult>;
  startedAt: string;
  completedAt: string;
  questions: ScoredQuestionReview[];
}

export interface QuizAttemptRecord {
  attemptId: string;
  userId: string;
  selectedCategories: string[];
  difficultyLevel?: QuizDifficultyLevel;
  questionIds: string[];
  questionContentVersions: Record<string, number>;
  submittedAnswers: Record<string, string>;
  score: number;
  totalQuestions: number;
  percentage: number;
  fanIdentityTier: FanIdentityTier;
  categoryBreakdown: Record<string, QuizCategoryResult>;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizStartResponse {
  attemptId: string;
  totalQuestions: number;
  selectedCategories: string[];
  difficultyLevel?: QuizDifficultyLevel;
  questions: PublicQuizQuestion[];
  startedAt: string;
}

export interface QuizSubmitRequest {
  attemptId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> optionId
}

export interface QuizAchievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  badgeColor: string;
  ruleVersion: number;
  targetValue: number;
  requirementText: string;
}

export interface UserQuizAchievement {
  achievementId: string;
  userId: string;
  title: string;
  description: string;
  badgeIcon: string;
  badgeColor: string;
  earnedAt: string;
  ruleVersion: number;
  isUnlocked: boolean;
  progress: {
    current: number;
    target: number;
  };
}

export interface QuizPerformanceSummary {
  quizzesCompleted: number;
  bestScorePercentage: number;
  bestScoreCorrect: number;
  bestScoreTotal: number;
  highestTier: FanIdentityTier | null;
  uniqueDisciplinesCount: number;
  totalQuestionsAnswered: number;
}

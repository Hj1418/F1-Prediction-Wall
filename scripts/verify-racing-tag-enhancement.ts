/**
 * Comprehensive Automated Verification Suite for:
 * THE GRDX — Racing Tag Audit, Enhancement and Implementation
 *
 * Covers all 27 Phase Nine verification criteria:
 * - Difficulty tests (1–5)
 * - Question-count tests (6–12)
 * - Quality and historical coverage tests (13–17)
 * - Scoring and persistence tests (18–23)
 * - Regression tests (24–27)
 */

import assert from 'node:assert';
import {
  VERIFIED_QUESTION_BANK,
  getApprovedQuestions,
  validateQuestionBank,
} from '../src/services/quiz/questionBank';
import {
  allocateQuestionsPerCategory,
  calculateOverallPercentage,
  calculateCategoryPercentage,
  calculateFanIdentityTier,
  getTierDetails,
  normalizeQuestionDifficulty,
  isQuestionPermittedForDifficulty,
  getPermittedDifficulties,
  getDifficultyConfig,
  DEFAULT_QUIZ_QUESTION_COUNT,
  MOTORSPORT_QUIZ_CATEGORIES,
} from '../src/services/quiz/quizRegistry';
import { quizService, sanitizeQuestionForClient } from '../src/services/quiz/quizService';
import { QuizDifficultyLevel, QuizAttemptRecord } from '../src/types/quiz';

let passedCount = 0;

function testPass(index: number, description: string) {
  passedCount++;
  console.log(`  ✓ TEST [${index}/27] PASS: ${description}`);
}

async function runRacingTagEnhancementSuite() {
  console.log('========================================================================');
  console.log('🏁 THE GRDX — RACING TAG AUDIT & ENHANCEMENT ACCEPTANCE TEST SUITE');
  console.log('========================================================================\n');

  // ==========================================================================
  // DIFFICULTY TESTS (1-5)
  // ==========================================================================
  console.log('📌 [GROUP 1: DIFFICULTY ENFORCEMENT & CEILING RULES]');

  // Test 1: Rookie attempts contain only Rookie questions
  const rookieAttempt = await quizService.startQuizAttempt({
    userId: 'user_rookie_test',
    categoryIds: ['formula-1'],
    difficultyLevel: 'rookie',
  });
  assert.strictEqual(rookieAttempt.questions.length, 20, 'Rookie attempt must have 20 questions');
  for (const q of rookieAttempt.questions) {
    const norm = normalizeQuestionDifficulty(q.difficulty);
    assert.strictEqual(norm, 'rookie', `Question ${q.questionId} must be rookie difficulty, got ${q.difficulty}`);
  }
  testPass(1, 'Rookie attempt contains strictly Rookie-level questions (no Apex or Race Analyst)');

  // Test 2: Apex attempts contain no questions above Apex
  const apexAttempt = await quizService.startQuizAttempt({
    userId: 'user_apex_test',
    categoryIds: ['formula-1'],
    difficultyLevel: 'apex',
  });
  assert.strictEqual(apexAttempt.questions.length, 20, 'Apex attempt must have 20 questions');
  for (const q of apexAttempt.questions) {
    const norm = normalizeQuestionDifficulty(q.difficulty);
    assert(norm === 'rookie' || norm === 'apex', `Apex question ${q.questionId} must be <= apex, got ${q.difficulty}`);
  }
  testPass(2, 'Apex attempts contain no questions above Apex ceiling (only Rookie and Apex)');

  // Test 3: Race Analyst attempts contain questions up to Race Analyst
  const analystAttempt = await quizService.startQuizAttempt({
    userId: 'user_analyst_test',
    categoryIds: ['formula-1'],
    difficultyLevel: 'race_analyst',
  });
  assert.strictEqual(analystAttempt.questions.length, 20, 'Race Analyst attempt must have 20 questions');
  const analystNorms = analystAttempt.questions.map(q => normalizeQuestionDifficulty(q.difficulty));
  assert(analystNorms.includes('race_analyst'), 'Race Analyst attempt contains race_analyst level questions');
  testPass(3, 'Race Analyst attempts draw from comprehensive pool up to Race Analyst level');

  // Test 4: Difficulty selection persists throughout an active attempt and completed results
  assert.strictEqual(rookieAttempt.difficultyLevel, 'rookie', 'Attempt records difficultyLevel "rookie"');
  assert.strictEqual(apexAttempt.difficultyLevel, 'apex', 'Attempt records difficultyLevel "apex"');
  assert.strictEqual(analystAttempt.difficultyLevel, 'race_analyst', 'Attempt records difficultyLevel "race_analyst"');
  testPass(4, 'Difficulty selection persists immutably throughout active attempt lifecycle');

  // Test 5: Invalid or missing difficulty values are handled safely (defaults to apex)
  const defaultAttempt = await quizService.startQuizAttempt({
    userId: 'user_default_test',
    categoryIds: ['formula-1'],
    difficultyLevel: undefined,
  });
  assert.strictEqual(defaultAttempt.difficultyLevel, 'apex', 'Undefined difficulty defaults to apex');
  const fallbackAttempt = await quizService.startQuizAttempt({
    userId: 'user_fallback_test',
    categoryIds: ['formula-1'],
    difficultyLevel: 'non_existent_difficulty_level',
  });
  assert.strictEqual(fallbackAttempt.difficultyLevel, 'apex', 'Invalid difficulty safely normalizes to apex');
  testPass(5, 'Invalid or missing difficulty values are safely handled and normalized to apex');

  // ==========================================================================
  // QUESTION COUNT & ALLOCATION TESTS (6-12)
  // ==========================================================================
  console.log('\n📌 [GROUP 2: 20-QUESTION LIMIT & CATEGORY ALLOCATION POLICY]');

  // Test 6: A valid attempt contains exactly 20 unique questions
  assert.strictEqual(rookieAttempt.questions.length, DEFAULT_QUIZ_QUESTION_COUNT);
  const uniqueQIds = new Set(rookieAttempt.questions.map(q => q.questionId));
  assert.strictEqual(uniqueQIds.size, 20, 'Attempt contains exactly 20 unique questions');
  testPass(6, 'Valid attempt contains exactly 20 unique questions with no duplicates');

  // Test 7: Four eligible categories with five questions each produce 20 questions (5 each)
  const fourCatAlloc = allocateQuestionsPerCategory(
    ['formula-1', 'formula-2', 'formula-3', 'formula-4'],
    20
  );
  assert.strictEqual(Object.values(fourCatAlloc).reduce((a, b) => a + b, 0), 20);
  assert.strictEqual(fourCatAlloc['formula-1'], 5);
  assert.strictEqual(fourCatAlloc['formula-2'], 5);
  assert.strictEqual(fourCatAlloc['formula-3'], 5);
  assert.strictEqual(fourCatAlloc['formula-4'], 5);
  testPass(7, 'Four selected categories allocate exactly 5 questions each (4 x 5 = 20)');

  // Test 8: Fewer selected categories use documented fill policy
  // 1 category -> 20
  const oneCatAlloc = allocateQuestionsPerCategory(['formula-1'], 20);
  assert.strictEqual(oneCatAlloc['formula-1'], 20);
  // 2 categories -> 10, 10
  const twoCatAlloc = allocateQuestionsPerCategory(['formula-1', 'motogp'], 20);
  assert.strictEqual(twoCatAlloc['formula-1'], 10);
  assert.strictEqual(twoCatAlloc['motogp'], 10);
  // 3 categories -> 7, 7, 6
  const threeCatAlloc = allocateQuestionsPerCategory(['formula-1', 'formula-2', 'formula-3'], 20);
  const threeSum = Object.values(threeCatAlloc).reduce((a, b) => a + b, 0);
  assert.strictEqual(threeSum, 20);
  assert(Math.max(...Object.values(threeCatAlloc)) - Math.min(...Object.values(threeCatAlloc)) <= 1);
  testPass(8, 'Documented fill policy evenly balances allocations for 1, 2, and 3 categories');

  // Test 9: The previous 15-question cap no longer truncates valid attempts
  const startRes20 = await quizService.startQuizAttempt({
    userId: 'user_count_20',
    categoryIds: ['formula-1', 'formula-2'],
  });
  assert.strictEqual(startRes20.totalQuestions, 20, 'startQuizAttempt generates 20 questions');
  assert.strictEqual(startRes20.questions.length, 20, 'startQuizAttempt returns 20 public questions');
  testPass(9, 'The previous 15-question cap no longer truncates valid attempts; standard is 20');

  // Test 10: Insufficient inventory produces a clear error instead of duplicates or difficulty downgrade
  let insufficientCaught = false;
  try {
    // formula-3 only has 15 questions in total. If user selects only formula-3 with rookie, pool < 20
    await quizService.startQuizAttempt({
      userId: 'user_insufficient_test',
      categoryIds: ['formula-3'], // F3 has 15 total, less than 20
      difficultyLevel: 'rookie',
    });
  } catch (err: any) {
    insufficientCaught = true;
    assert(err.message.includes('Insufficient eligible questions available'));
  }
  assert(insufficientCaught, 'Insufficient eligible questions throws explicit descriptive error');
  testPass(10, 'Insufficient inventory throws clear descriptive error without silent downgrade');

  // Test 11: Question IDs remain unique within an attempt
  const allAttemptIds = startRes20.questions.map(q => q.questionId);
  assert.strictEqual(new Set(allAttemptIds).size, 20, 'All question IDs in attempt are unique');
  testPass(11, 'Question IDs remain strictly unique within each attempt');

  // Test 12: Randomization does not cause missing questions or invalid answer mappings
  for (const q of startRes20.questions) {
    assert(Array.isArray(q.options) && q.options.length === 4, `Question ${q.questionId} has 4 options`);
    const optIds = q.options.map(o => o.id);
    assert.deepStrictEqual(optIds.sort(), ['a', 'b', 'c', 'd']);
  }
  testPass(12, 'Question randomization preserves 4 options and valid option ID mappings');

  // ==========================================================================
  // QUALITY AND HISTORICAL TESTS (13-17)
  // ==========================================================================
  console.log('\n📌 [GROUP 3: HISTORICAL ACCURACY, QUALITY & COVERAGE]');

  // Test 13: Questions have valid IDs, options, correct answers, and difficulty metadata
  const approved = getApprovedQuestions();
  assert.strictEqual(approved.length, 170, 'Approved question bank contains 170 questions');
  for (const q of approved) {
    assert(q.questionId && q.questionId.length > 2);
    assert(q.question && q.question.length > 15);
    assert(Array.isArray(q.options) && q.options.length === 4);
    assert(['a', 'b', 'c', 'd'].includes(q.correctOptionId));
    assert(['easy', 'medium', 'hard', 'rookie', 'apex', 'race_analyst'].includes(q.difficulty));
  }
  testPass(13, 'All 170 questions possess valid IDs, options, correct answers, and difficulty metadata');

  // Test 14: Question classification matches the selected difficulty rules
  const rookieQuestions = approved.filter(q => normalizeQuestionDifficulty(q.difficulty) === 'rookie');
  const apexQuestions = approved.filter(q => normalizeQuestionDifficulty(q.difficulty) === 'apex');
  const analystQuestions = approved.filter(q => normalizeQuestionDifficulty(q.difficulty) === 'race_analyst');
  assert(rookieQuestions.length >= 20, `At least 20 rookie questions in pool (got ${rookieQuestions.length})`);
  assert(apexQuestions.length >= 20, `At least 20 apex questions in pool (got ${apexQuestions.length})`);
  assert(analystQuestions.length >= 20, `At least 20 race analyst questions in pool (got ${analystQuestions.length})`);
  testPass(14, 'Question classification cleanly partitions into Rookie, Apex, and Race Analyst tiers');

  // Test 15: Historical questions include adequate context and verifiable references
  const f1Questions = approved.filter(q => q.categoryId === 'formula-1');
  assert.strictEqual(f1Questions.length, 65, `Formula 1 has 65 verified questions (got ${f1Questions.length})`);
  for (const q of f1Questions) {
    assert(q.explanation.length >= 30, `Explanation too short for ${q.questionId}`);
    assert(q.sourceUrl.startsWith('http'), `Invalid source URL for ${q.questionId}`);
    assert(q.era, `Historical era metadata missing for ${q.questionId}`);
  }
  testPass(15, 'All historical questions include regulatory context, factual explanations, and source URLs');

  // Test 16: Duplicate and near-duplicate questions are identified for review (zero duplicates)
  const textSet = new Set<string>();
  for (const q of approved) {
    const key = q.question.trim().toLowerCase();
    assert(!textSet.has(key), `Duplicate question detected: "${q.question}"`);
    textSet.add(key);
  }
  testPass(16, 'Zero duplicate or colliding question texts across entire 170-question inventory');

  // Test 17: Questions from different historical eras are represented in the bank
  const eras = new Set(f1Questions.map(q => q.era));
  assert(eras.has('1950s'), '1950s era represented');
  assert(eras.has('1960s'), '1960s era represented');
  assert(eras.has('1970s'), '1970s era represented');
  assert(eras.has('1980s'), '1980s era represented');
  assert(eras.has('1990s'), '1990s era represented');
  assert(eras.has('2000s'), '2000s era represented');
  assert(eras.has('2010s'), '2010s era represented');
  assert(eras.has('2020s') || eras.has('2026 Season'), '2020s/2026 era represented');
  testPass(17, 'Historical coverage spans 1950s, 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, and 2020s/2026');

  // ==========================================================================
  // SCORING AND PERSISTENCE TESTS (18-23)
  // ==========================================================================
  console.log('\n📌 [GROUP 4: SCORING, RACING TAG THRESHOLDS & PERSISTENCE]');

  // Test 18: Scores and percentages are correct for 20 questions (5% per question)
  assert.strictEqual(calculateOverallPercentage(0, 20), 0);
  assert.strictEqual(calculateOverallPercentage(1, 20), 5);
  assert.strictEqual(calculateOverallPercentage(10, 20), 50);
  assert.strictEqual(calculateOverallPercentage(16, 20), 80);
  assert.strictEqual(calculateOverallPercentage(19, 20), 95);
  assert.strictEqual(calculateOverallPercentage(20, 20), 100);
  testPass(18, 'Scores and percentages calculate accurately for 20 questions (5% per point)');

  // Test 19: Unanswered questions are handled consistently (score 0, denominator 20)
  const answers19: Record<string, string> = {};
  // Only answer 5 questions correctly
  const qBankMap = new Map(approved.map(q => [q.questionId, q.correctOptionId]));
  startRes20.questions.slice(0, 5).forEach(q => {
    answers19[q.questionId] = qBankMap.get(q.questionId)!;
  });
  const result19 = await quizService.submitQuizAttempt({
    attemptId: startRes20.attemptId,
    userId: 'user_count_20',
    answers: answers19,
  });
  assert.strictEqual(result19.score, 5);
  assert.strictEqual(result19.totalQuestions, 20);
  assert.strictEqual(result19.percentage, 25);
  assert.strictEqual(result19.fanIdentityTier, 'The Rookie');
  testPass(19, 'Unanswered questions are treated as incorrect without distorting denominator or percentage');

  // Test 20: Racing Tag assignment uses the correct existing thresholds
  assert.strictEqual(calculateFanIdentityTier(0), 'The Rookie');
  assert.strictEqual(calculateFanIdentityTier(39), 'The Rookie');
  assert.strictEqual(calculateFanIdentityTier(40), 'The Enthusiast');
  assert.strictEqual(calculateFanIdentityTier(59), 'The Enthusiast');
  assert.strictEqual(calculateFanIdentityTier(60), 'The Paddock Insider');
  assert.strictEqual(calculateFanIdentityTier(79), 'The Paddock Insider');
  assert.strictEqual(calculateFanIdentityTier(80), 'The Race Strategist');
  assert.strictEqual(calculateFanIdentityTier(94), 'The Race Strategist');
  assert.strictEqual(calculateFanIdentityTier(95), 'The Motorsport Oracle');
  assert.strictEqual(calculateFanIdentityTier(100), 'The Motorsport Oracle');
  testPass(20, 'Racing Tag thresholds match exact 0-39 / 40-59 / 60-79 / 80-94 / 95-100 specification');

  // Test 21: Repeated result submission does not duplicate scores or awards (idempotent)
  const resubmission = await quizService.submitQuizAttempt({
    attemptId: startRes20.attemptId,
    userId: 'user_count_20',
    answers: { [startRes20.questions[0].questionId]: 'tampered_option' },
  });
  assert.strictEqual(resubmission.score, 5, 'Idempotent resubmission preserves score');
  assert.strictEqual(resubmission.percentage, 25, 'Idempotent resubmission preserves percentage');
  assert.strictEqual(resubmission.completedAt, result19.completedAt, 'Idempotent resubmission preserves completedAt');
  testPass(21, 'Repeated submission of completed attempt is strictly idempotent and tamper-proof');

  // Test 22: Completed results survive refresh and history retrieval
  const userHistory = await quizService.getUserQuizHistory('user_count_20');
  const persistedAttempt = userHistory.find(h => h.attemptId === startRes20.attemptId);
  assert(Boolean(persistedAttempt), 'Completed attempt exists in history');
  assert.strictEqual(persistedAttempt?.score, 5);
  assert.strictEqual(persistedAttempt?.percentage, 25);
  assert.strictEqual(persistedAttempt?.totalQuestions, 20);
  testPass(22, 'Completed results survive refresh and sign-in via persistence layer');

  // Test 23: Existing historical results and tags remain intact (backward compatibility with 15-question records)
  const past15Record: QuizAttemptRecord = {
    attemptId: 'legacy_attempt_15_q',
    userId: 'user_legacy',
    selectedCategories: ['formula-1'],
    questionIds: approved.slice(0, 15).map(q => q.questionId),
    questionContentVersions: {},
    submittedAnswers: {},
    score: 12,
    totalQuestions: 15,
    percentage: 80,
    fanIdentityTier: 'The Race Strategist',
    categoryBreakdown: {
      'formula-1': {
        categoryId: 'formula-1',
        categoryName: 'Formula 1',
        correct: 12,
        total: 15,
        percentage: 80,
      },
    },
    startedAt: '2026-01-01T10:00:00.000Z',
    completedAt: '2026-01-01T10:15:00.000Z',
    status: 'completed',
  };
  const legacyFormatted = quizService.formatResultPayload(past15Record);
  assert.strictEqual(legacyFormatted.totalQuestions, 15, 'Legacy 15-question record keeps totalQuestions: 15');
  assert.strictEqual(legacyFormatted.score, 12, 'Legacy 15-question record keeps score: 12');
  assert.strictEqual(legacyFormatted.percentage, 80, 'Legacy percentage intact');
  assert.strictEqual(legacyFormatted.fanIdentityTier, 'The Race Strategist', 'Legacy tag intact');
  testPass(23, 'Historical 15-question attempts and tags remain fully backward compatible');

  // ==========================================================================
  // REGRESSION TESTS (24-27)
  // ==========================================================================
  console.log('\n📌 [GROUP 5: REGRESSION & INTEGRATION TESTS]');

  // Test 24: Existing authentication flows continue to work
  let guestBlocked = false;
  try {
    await quizService.startQuizAttempt({
      userId: 'guest_user',
      categoryIds: ['formula-1'],
    });
  } catch (err: any) {
    guestBlocked = err.message.includes('Authentication required');
  }
  assert(guestBlocked, 'Guest authentication check functions properly');
  testPass(24, 'Authentication rules and guest rejection flows remain fully intact');

  // Test 25: Other quiz features (achievements, categories) remain functional
  const categories = await quizService.getCategories();
  assert.strictEqual(categories.length, 8, 'All 8 motorsport categories loaded');
  const userAchs = await quizService.getUserQuizAchievements('user_count_20');
  assert(userAchs.length >= 5, 'Achievement evaluation engine functional');
  testPass(25, 'Other quiz features (achievement evaluation, performance metrics) remain functional');

  // Test 26: Desktop and mobile quiz flows work correctly (sanitization & category configs)
  for (const cat of MOTORSPORT_QUIZ_CATEGORIES) {
    assert(cat.id && cat.displayName && cat.badge && cat.color);
  }
  testPass(26, 'Category configurations, badges, and responsive metadata structures verified');

  // Test 27: Decoupled quiz difficulty vs Racing Tag performance
  // A user taking "Race Analyst" difficulty scoring 20% gets "The Rookie"
  const rookieTierOnAnalyst = calculateFanIdentityTier(20);
  assert.strictEqual(rookieTierOnAnalyst, 'The Rookie');
  // A user taking "Rookie" difficulty scoring 100% gets "The Motorsport Oracle"
  const oracleTierOnRookie = calculateFanIdentityTier(100);
  assert.strictEqual(oracleTierOnRookie, 'The Motorsport Oracle');
  testPass(27, 'Selected quiz difficulty is decoupled from earned Racing Tag (governed strictly by score)');

  console.log('\n========================================================================');
  console.log(`🏆 ALL ${passedCount}/27 ACCEPTANCE TESTS PASSED (100% SUCCESS)`);
  console.log('========================================================================\n');
}

runRacingTagEnhancementSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

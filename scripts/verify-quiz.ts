import { validateQuestionBank, VERIFIED_QUESTION_BANK, getApprovedQuestions } from '../src/services/quiz/questionBank';
import {
  MOTORSPORT_QUIZ_CATEGORIES,
  allocateQuestionsPerCategory,
  calculateOverallPercentage,
  calculateCategoryPercentage,
  calculateFanIdentityTier,
  getTierDetails,
  resolveCategoryId,
} from '../src/services/quiz/quizRegistry';
import { quizService, sanitizeQuestionForClient } from '../src/services/quiz/quizService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

console.log('🏁 STARTING THE GRID: MOTORSPORT FAN IDENTITY QUIZ VERIFICATION SUITE\n');

async function runQuizVerificationSuite() {
  // =========================================================================
  // 1. QUESTION BANK VALIDATION (120 QUESTIONS, 15 PER CATEGORY)
  // =========================================================================
  console.log('📌 [SECTION 1] Question Bank Quality & Completeness Audit:');
  const validation = validateQuestionBank();

  assert(validation.isValid, 'Question bank passes full validation with 0 errors');
  assert(validation.totalCount === 120, `Total questions must be exactly 120 (got: ${validation.totalCount})`);
  assert(validation.approvedCount === 120, `All 120 questions must have approvalStatus "approved" (got: ${validation.approvedCount})`);

  const expectedCategories = [
    'formula-1',
    'formula-2',
    'formula-3',
    'formula-4',
    'formula-e',
    'motogp',
    'endurance-racing',
    'gt-racing',
  ];

  for (const catId of expectedCategories) {
    const count = validation.countByCategory[catId] || 0;
    assert(count === 15, `Category "${catId}" has exactly 15 verified questions (got: ${count})`);
  }

  // Check every question individually
  for (const q of VERIFIED_QUESTION_BANK) {
    assert(Array.isArray(q.options) && q.options.length === 4, `Question ${q.questionId} has exactly 4 options`);
    const optionIds = q.options.map(o => o.id);
    assert(optionIds.includes(q.correctOptionId), `Question ${q.questionId} correctOptionId (${q.correctOptionId}) is in options`);
    assert(q.explanation.length > 20, `Question ${q.questionId} has detailed factual explanation`);
    assert(q.sourceUrl.startsWith('http'), `Question ${q.questionId} has valid verification source URL`);
    assert(q.contentVersion >= 1, `Question ${q.questionId} has valid contentVersion`);
    assert(['easy', 'medium', 'hard'].includes(q.difficulty), `Question ${q.questionId} has valid difficulty rating`);
  }

  // =========================================================================
  // 2. CENTRALIZED CATEGORY REGISTRY
  // =========================================================================
  console.log('\n📌 [SECTION 2] Centralized Category Registry Audit:');
  assert(MOTORSPORT_QUIZ_CATEGORIES.length === 8, 'Centralized registry defines exactly 8 Phase 1 categories');

  const groupings = Array.from(new Set(MOTORSPORT_QUIZ_CATEGORIES.map(c => c.grouping)));
  assert(groupings.includes('Formula Racing'), 'Registry includes Formula Racing group');
  assert(groupings.includes('Motorcycle Racing'), 'Registry includes Motorcycle Racing group');
  assert(groupings.includes('Endurance Racing'), 'Registry includes Endurance Racing group');
  assert(groupings.includes('GT Racing'), 'Registry includes GT Racing group');

  assert(resolveCategoryId('f1') === 'formula-1', 'resolveCategoryId maps "f1" alias to "formula-1"');
  assert(resolveCategoryId('wec') === 'endurance-racing', 'resolveCategoryId maps "wec" alias to "endurance-racing"');
  assert(resolveCategoryId('gt3') === 'gt-racing', 'resolveCategoryId maps "gt3" alias to "gt-racing"');

  // =========================================================================
  // 3. ALLOCATION LOGIC & 15-QUESTION CAP
  // =========================================================================
  console.log('\n📌 [SECTION 3] Balanced Question Allocation Algorithm:');

  // Single category: up to 15 questions
  const alloc1 = allocateQuestionsPerCategory(['formula-1'], 15);
  assert(alloc1['formula-1'] === 15, `1 selected category: allocated 15 questions (got: ${alloc1['formula-1']})`);

  // Two categories: 8 and 7 (balanced)
  const alloc2 = allocateQuestionsPerCategory(['formula-1', 'motogp'], 15);
  const sum2 = (alloc2['formula-1'] || 0) + (alloc2['motogp'] || 0);
  assert(sum2 === 15, `2 categories: total questions capped at 15 (got: ${sum2})`);
  assert(Math.abs((alloc2['formula-1'] || 0) - (alloc2['motogp'] || 0)) <= 1, '2 categories: distributed as evenly as possible');

  // Three categories: 5, 5, 5
  const alloc3 = allocateQuestionsPerCategory(['formula-1', 'formula-2', 'motogp'], 15);
  const sum3 = Object.values(alloc3).reduce((a, b) => a + b, 0);
  assert(sum3 === 15, `3 categories: total questions capped at 15 (got: ${sum3})`);
  assert(alloc3['formula-1'] === 5 && alloc3['formula-2'] === 5 && alloc3['motogp'] === 5, '3 categories: exactly 5 questions each');

  // Four categories: 4, 4, 4, 3 (balanced)
  const alloc4 = allocateQuestionsPerCategory(['formula-1', 'motogp', 'endurance-racing', 'gt-racing'], 15);
  const sum4 = Object.values(alloc4).reduce((a, b) => a + b, 0);
  assert(sum4 === 15, `4 categories: total questions capped at 15 (got: ${sum4})`);
  const values4 = Object.values(alloc4);
  assert(Math.max(...values4) - Math.min(...values4) <= 1, '4 categories: balanced distribution');

  // All 8 categories: 2, 2, 2, 2, 2, 2, 2, 1 = 15
  const alloc8 = allocateQuestionsPerCategory(expectedCategories, 15);
  const sum8 = Object.values(alloc8).reduce((a, b) => a + b, 0);
  assert(sum8 === 15, `8 categories: total questions capped at 15 (got: ${sum8})`);
  const values8 = Object.values(alloc8);
  assert(Math.max(...values8) - Math.min(...values8) <= 1, '8 categories: balanced distribution');

  // No questions from unselected categories
  assert(alloc2['formula-3'] === undefined, 'No questions allocated from unselected categories');

  // Constrained pool handling (e.g. only 2 available in one category)
  const allocConstrained = allocateQuestionsPerCategory(['formula-1', 'motogp'], 15, {
    'formula-1': 2,
    'motogp': 15,
  });
  assert(allocConstrained['formula-1'] === 2, 'Constrained category allocates only available count (2)');
  assert(allocConstrained['motogp'] === 13, 'Surplus allocation fills remaining capacity up to 15');
  assert(allocConstrained['formula-1'] + allocConstrained['motogp'] === 15, 'Constrained allocation respects 15 question total');

  // =========================================================================
  // 4. SCORING & FAN IDENTITY TIER BOUNDARIES
  // =========================================================================
  console.log('\n📌 [SECTION 4] Deterministic Scoring & Fan Identity Tiers:');

  // 0–39%: The Rookie
  assert(calculateFanIdentityTier(0) === 'The Rookie', '0% -> The Rookie');
  assert(calculateFanIdentityTier(25) === 'The Rookie', '25% -> The Rookie');
  assert(calculateFanIdentityTier(39) === 'The Rookie', '39% -> The Rookie');

  // 40–59%: The Enthusiast
  assert(calculateFanIdentityTier(40) === 'The Enthusiast', '40% boundary -> The Enthusiast');
  assert(calculateFanIdentityTier(50) === 'The Enthusiast', '50% -> The Enthusiast');
  assert(calculateFanIdentityTier(59) === 'The Enthusiast', '59% boundary -> The Enthusiast');

  // 60–79%: The Paddock Insider
  assert(calculateFanIdentityTier(60) === 'The Paddock Insider', '60% boundary -> The Paddock Insider');
  assert(calculateFanIdentityTier(70) === 'The Paddock Insider', '70% -> The Paddock Insider');
  assert(calculateFanIdentityTier(79) === 'The Paddock Insider', '79% boundary -> The Paddock Insider');

  // 80–94%: The Race Strategist
  assert(calculateFanIdentityTier(80) === 'The Race Strategist', '80% boundary -> The Race Strategist');
  assert(calculateFanIdentityTier(87) === 'The Race Strategist', '87% -> The Race Strategist');
  assert(calculateFanIdentityTier(94) === 'The Race Strategist', '94% boundary -> The Race Strategist');

  // 95–100%: The Motorsport Oracle
  assert(calculateFanIdentityTier(95) === 'The Motorsport Oracle', '95% boundary -> The Motorsport Oracle');
  assert(calculateFanIdentityTier(100) === 'The Motorsport Oracle', '100% -> The Motorsport Oracle');

  // Percentage calculations with documented rounding policy
  assert(calculateOverallPercentage(0, 15) === 0, '0 / 15 = 0%');
  assert(calculateOverallPercentage(15, 15) === 100, '15 / 15 = 100%');
  assert(calculateOverallPercentage(10, 15) === 67, '10 / 15 = 67% (Math.round)');
  assert(calculateOverallPercentage(14, 15) === 93, '14 / 15 = 93%');
  assert(calculateOverallPercentage(7, 10) === 70, '7 / 10 = 70%');

  // Tier metadata integrity
  for (const t of ['The Rookie', 'The Enthusiast', 'The Paddock Insider', 'The Race Strategist', 'The Motorsport Oracle'] as const) {
    const details = getTierDetails(t);
    assert(details.title === t, `Tier details for ${t} has valid title`);
    assert(details.description.length > 10, `Tier details for ${t} has descriptive text`);
    assert(details.color.startsWith('#'), `Tier details for ${t} has brand color`);
  }

  // =========================================================================
  // 5. SECURITY & ANSWER KEY WITHHOLDING
  // =========================================================================
  console.log('\n📌 [SECTION 5] Answer Key Protection & Security Audit:');

  const testQuestion = VERIFIED_QUESTION_BANK[0];
  const publicQuestion = sanitizeQuestionForClient(testQuestion);

  assert((publicQuestion as any).correctOptionId === undefined, 'Public question strictly omits correctOptionId');
  assert((publicQuestion as any).explanation === undefined, 'Public question strictly omits explanation');
  assert(publicQuestion.questionId === testQuestion.questionId, 'Public question preserves questionId');
  assert(publicQuestion.options.length === 4, 'Public question retains all 4 options for client rendering');

  // Start attempt through service
  const startAttemptRes = await quizService.startQuizAttempt({
    userId: 'test_verifier_user',
    categoryIds: ['formula-1', 'formula-2'],
  });

  assert(Boolean(startAttemptRes.attemptId), 'Quiz attempt created with unique ID');
  assert(startAttemptRes.totalQuestions === 15, `Attempt allocated exactly 15 questions (got: ${startAttemptRes.totalQuestions})`);
  assert(startAttemptRes.questions.length === 15, 'Attempt returned 15 client-safe questions');

  for (const q of startAttemptRes.questions) {
    assert((q as any).correctOptionId === undefined, 'No question returned by startQuizAttempt exposes correctOptionId');
    assert((q as any).explanation === undefined, 'No question returned by startQuizAttempt exposes explanation');
  }

  // =========================================================================
  // 6. SUBMISSION, SCORING & IDEMPOTENCY
  // =========================================================================
  console.log('\n📌 [SECTION 6] Submission Scoring & Idempotency:');

  // Build answer payload: simulate 10 correct, 5 incorrect
  const bankMap = new Map<string, string>();
  for (const q of VERIFIED_QUESTION_BANK) {
    bankMap.set(q.questionId, q.correctOptionId);
  }

  const simulatedAnswers: Record<string, string> = {};
  startAttemptRes.questions.forEach((q, idx) => {
    const correctKey = bankMap.get(q.questionId)!;
    if (idx < 10) {
      simulatedAnswers[q.questionId] = correctKey; // correct
    } else {
      // Pick an incorrect option
      const wrongOpt = q.options.find(o => o.id !== correctKey)!;
      simulatedAnswers[q.questionId] = wrongOpt.id; // incorrect
    }
  });

  const scoredResult = await quizService.submitQuizAttempt({
    attemptId: startAttemptRes.attemptId,
    userId: 'test_verifier_user',
    answers: simulatedAnswers,
  });

  assert(scoredResult.attemptId === startAttemptRes.attemptId, 'Scored result matches attempt ID');
  assert(scoredResult.score === 10, `Score is accurately 10 / 15 (got: ${scoredResult.score})`);
  assert(scoredResult.totalQuestions === 15, 'Total questions is 15');
  assert(scoredResult.percentage === 67, `Percentage is Math.round(10/15*100) = 67% (got: ${scoredResult.percentage})`);
  assert(scoredResult.fanIdentityTier === 'The Paddock Insider', `Fan identity tier is "The Paddock Insider" for 67% (got: ${scoredResult.fanIdentityTier})`);
  assert(scoredResult.questions.length === 15, 'Result contains 15 reviewed questions');

  // Verified review details exist in result
  const firstReviewed = scoredResult.questions[0];
  assert(Boolean(firstReviewed.correctOptionId), 'Scored result includes correctOptionId for review');
  assert(Boolean(firstReviewed.explanation), 'Scored result includes factual explanation for review');
  assert(firstReviewed.isCorrect === true, 'First question correctly scored as true');

  // Category breakdown calculation
  for (const [catId, catResult] of Object.entries(scoredResult.categoryBreakdown)) {
    assert(catResult.total > 0, `Category ${catId} has positive denominator`);
    assert(catResult.correct <= catResult.total, `Category ${catId} correct count <= total`);
    const expectedCatPct = Math.round((catResult.correct / catResult.total) * 100);
    assert(catResult.percentage === expectedCatPct, `Category ${catId} percentage matches (${catResult.percentage}% vs ${expectedCatPct}%)`);
  }

  // Idempotency: resubmission of the exact same attempt returns identical result without duplicate creation
  const resubmittedResult = await quizService.submitQuizAttempt({
    attemptId: startAttemptRes.attemptId,
    userId: 'test_verifier_user',
    answers: simulatedAnswers,
  });

  assert(resubmittedResult.score === scoredResult.score, 'Resubmission returns identical score (idempotent)');
  assert(resubmittedResult.completedAt === scoredResult.completedAt, 'Resubmission preserves original completedAt timestamp');

  // History persistence: past attempt is present in user history
  const history = await quizService.getUserQuizHistory('test_verifier_user');
  assert(history.length >= 1, `User history contains completed attempt (got: ${history.length})`);
  const foundInHistory = history.find(h => h.attemptId === startAttemptRes.attemptId);
  assert(Boolean(foundInHistory), 'Completed attempt exists in history');
  assert(foundInHistory?.score === 10, 'History record contains accurate score');
  assert(foundInHistory?.fanIdentityTier === 'The Paddock Insider', 'History record contains accurate fan identity tier');

  // Retake preserves history: starting a second attempt creates a separate attempt
  const secondAttempt = await quizService.startQuizAttempt({
    userId: 'test_verifier_user',
    categoryIds: ['formula-1'],
  });
  assert(secondAttempt.attemptId !== startAttemptRes.attemptId, 'Retake generates fresh unique attemptId');

  const historyAfterRetake = await quizService.getUserQuizHistory('test_verifier_user');
  const originalStillInHistory = historyAfterRetake.find(h => h.attemptId === startAttemptRes.attemptId);
  assert(Boolean(originalStillInHistory), 'Original attempt remains safely preserved after retake');

  // =========================================================================
  // 7. PREDICTION LEAGUE ISOLATION INVARIANT
  // =========================================================================
  console.log('\n📌 [SECTION 7] Strict Isolation from Prediction League:');
  const userHistory = await quizService.getUserQuizHistory('usr_wickando1418');
  // Confirm quiz attempts have no field named 'totalPoints', 'seasonRank', 'predictionData', 'roundId'
  for (const att of userHistory) {
    assert((att as any).seasonRank === undefined, 'Quiz attempt does not possess seasonRank');
    assert((att as any).totalPoints === undefined, 'Quiz attempt does not modify totalPoints');
    assert((att as any).predictionData === undefined, 'Quiz attempt does not possess predictionData');
  }
  console.log('  ✓ PASS: Motorsport Quiz is strictly isolated from Prediction League points and standings');

  console.log('\n=================================================================');
  console.log('🎉 ALL MOTORSPORT FAN IDENTITY QUIZ TESTS PASSED (100%)');
  console.log('=================================================================\n');
}

runQuizVerificationSuite().catch(err => {
  console.error('Quiz verification suite failed:', err);
  process.exit(1);
});

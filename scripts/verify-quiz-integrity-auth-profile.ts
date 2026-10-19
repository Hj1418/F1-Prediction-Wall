/**
 * Automated Verification Script:
 * Grid X — Quiz Integrity, Authentication, Profiles, Achievements and Rebrand
 *
 * Covers:
 * 1. Question bank integrity, verification sources, approval filtering, answer key withholding
 * 2. Logged-out access rejection, login requirements, and authenticated attempt creation
 * 3. User ownership enforcement, cross-user access denial, and privacy isolation
 * 4. Completed attempt immutability and submission idempotency
 * 5. Achievement evaluation engine, award rules, single-award guarantee, and performance summary
 * 6. Profile integration (history, achievements, performance stats, empty states)
 * 7. Upcoming features roadmap component validation
 * 8. Grid X rebrand audit across UI components, browser title, metadata, and share cards
 */

import fs from 'fs';
import path from 'path';
import {
  VERIFIED_QUESTION_BANK,
  validateQuestionBank,
  getApprovedQuestions,
} from '../src/services/quiz/questionBank';
import {
  QUIZ_ACHIEVEMENT_REGISTRY,
  evaluateQuizAchievements,
  calculateQuizPerformanceSummary,
} from '../src/services/quiz/quizAchievementRegistry';
import { quizService, sanitizeQuestionForClient } from '../src/services/quiz/quizService';
import { QuizAttemptRecord } from '../src/types/quiz';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🏁 STARTING GRID X — INTEGRITY, AUTH, PROFILES & REBRAND TESTS');
  console.log('=============================================================\n');

  // --------------------------------------------------------------------------
  // SECTION 1: Question Accuracy, Verification & Approval Filtering
  // --------------------------------------------------------------------------
  console.log('📌 [SECTION 1] Question Accuracy, Verification & Server Withholding:');
  
  const validation = validateQuestionBank();
  assert(validation.isValid === true, `Question bank schema and metadata valid (valid: ${validation.isValid})`);
  assert(validation.totalCount === 120, `Question bank contains exactly 120 questions (got: ${validation.totalCount})`);
  assert(validation.approvedCount === 120, `All 120 questions are approved and verified (got: ${validation.approvedCount})`);
  assert(validation.errors.length === 0, `Zero validation errors encountered (got: ${validation.errors.length})`);

  const approvedQuestions = getApprovedQuestions();
  assert(approvedQuestions.length === 120, `getApprovedQuestions() returns only approved items (got: ${approvedQuestions.length})`);

  // Verify sources, content versions, and distinct options
  let allSourcesValid = true;
  let allVersionsValid = true;
  let allOptionsValid = true;
  const questionTexts = new Set<string>();
  let duplicateTexts = 0;

  for (const q of VERIFIED_QUESTION_BANK) {
    if (!q.sourceUrl || (!q.sourceUrl.startsWith('http://') && !q.sourceUrl.startsWith('https://'))) {
      allSourcesValid = false;
    }
    if (!q.contentVersion || !q.topic || !q.context) {
      allVersionsValid = false;
    }
    if (!q.options || q.options.length !== 4) {
      allOptionsValid = false;
    }
    const cleanText = q.question.trim().toLowerCase();
    if (questionTexts.has(cleanText)) {
      duplicateTexts++;
    }
    questionTexts.add(cleanText);
  }

  assert(allSourcesValid, 'All questions have authoritative HTTP/HTTPS regulatory source URLs');
  assert(allVersionsValid, 'All questions have content versions, pedagogical topics, and regulatory context');
  assert(allOptionsValid, 'All questions have exactly 4 choices with valid identifiers');
  assert(duplicateTexts === 0, 'Zero duplicate question texts across entire repository');

  // Verify client projection hides answers and explanations
  const sampleQ = approvedQuestions[0];
  const publicQ = sanitizeQuestionForClient(sampleQ);
  assert(!('correctOptionId' in publicQ), 'Public question projection strictly omits correctOptionId');
  assert(!('explanation' in publicQ), 'Public question projection strictly omits explanation');
  assert(publicQ.questionId === sampleQ.questionId, 'Public question retains immutable questionId');
  assert(publicQ.options.length === 4, 'Public question provides 4 options for client rendering');

  // --------------------------------------------------------------------------
  // SECTION 2: Authentication Requirement & Guest Rejection
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 2] Authentication Requirement & Guest Rejection:');

  let loggedOutErrorThrown = false;
  try {
    await quizService.startQuizAttempt({
      userId: '',
      categoryIds: ['formula-1'],
    });
  } catch (err: any) {
    loggedOutErrorThrown = true;
    assert(err.message.includes('Authentication required'), `Logged-out attempt rejected with auth error: "${err.message}"`);
  }
  assert(loggedOutErrorThrown, 'Starting quiz attempt without userId is rejected');

  let guestErrorThrown = false;
  try {
    await quizService.startQuizAttempt({
      userId: 'guest_user',
      categoryIds: ['formula-1'],
    });
  } catch (err: any) {
    guestErrorThrown = true;
    assert(err.message.includes('Authentication required'), `Guest attempt rejected with auth error: "${err.message}"`);
  }
  assert(guestErrorThrown, 'Guest user (guest_user) cannot start official quiz attempt');

  // --------------------------------------------------------------------------
  // SECTION 3: Authenticated Attempt, Ownership Enforcement & Privacy
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 3] Authenticated Attempt, Ownership & Cross-User Denial:');

  const racerA = 'user_racer_alice';
  const racerB = 'user_racer_bob';

  const attemptA = await quizService.startQuizAttempt({
    userId: racerA,
    categoryIds: ['formula-1', 'motogp'],
  });

  assert(Boolean(attemptA.attemptId), `Attempt created with unique ID: ${attemptA.attemptId}`);
  assert(attemptA.questions.length === 15, `Attempt allocated exactly 15 questions (got: ${attemptA.questions.length})`);
  assert(!('correctOptionId' in attemptA.questions[0]), 'Attempt questions do not leak correct answer keys');

  // Cross-user submission denial
  let crossUserSubmitBlocked = false;
  try {
    await quizService.submitQuizAttempt({
      attemptId: attemptA.attemptId,
      userId: racerB, // Bob trying to submit Alice's attempt
      answers: {},
    });
  } catch (err: any) {
    crossUserSubmitBlocked = true;
    const msg = (err.message || '').toLowerCase();
    assert(
      msg.includes('ownership') || msg.includes('unauthorized') || msg.includes('not own'),
      `Cross-user submission blocked: "${err.message}"`
    );
  }
  assert(crossUserSubmitBlocked, 'Cross-user attempt submission is strictly blocked by ownership check');

  // Cross-user result access denial
  let crossUserResultBlocked = false;
  try {
    const forbiddenResult = await quizService.getQuizAttemptResult(attemptA.attemptId, racerB);
    if (!forbiddenResult) {
      crossUserResultBlocked = true;
    }
  } catch (_e) {
    crossUserResultBlocked = true;
  }
  assert(crossUserResultBlocked, 'Racer Bob cannot access Racer Alice\'s attempt result');

  // --------------------------------------------------------------------------
  // SECTION 4: Submission Scoring, Idempotency & Immutability
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 4] Submission Scoring, Idempotency & Immutability:');

  // Prepare answers for Alice
  const aliceAnswers: Record<string, string> = {};
  attemptA.questions.forEach((q, idx) => {
    // Answer first 12 questions with first option
    if (idx < 12) {
      aliceAnswers[q.questionId] = q.options[0].id;
    }
  });

  const submitResult1 = await quizService.submitQuizAttempt({
    attemptId: attemptA.attemptId,
    userId: racerA,
    answers: aliceAnswers,
  });

  assert(submitResult1.attemptId === attemptA.attemptId, 'Scored result matches attempt ID');
  assert(typeof submitResult1.score === 'number', `Scored result has numeric score: ${submitResult1.score}/${submitResult1.totalQuestions}`);
  assert(typeof submitResult1.percentage === 'number', `Scored result has percentage: ${submitResult1.percentage}%`);
  assert(Boolean(submitResult1.fanIdentityTier), `Scored result assigned fan identity: ${submitResult1.fanIdentityTier}`);
  assert(submitResult1.questions.length === 15, 'Scored result includes all 15 questions with answers and explanations for review');
  assert(Boolean(submitResult1.questions[0].correctOptionId), 'Answer review exposes correct answer key post-submission');
  assert(Boolean(submitResult1.questions[0].explanation), 'Answer review exposes factual explanation post-submission');

  // Test Submission Idempotency: re-submitting with different answers must return original result
  const submitResult2 = await quizService.submitQuizAttempt({
    attemptId: attemptA.attemptId,
    userId: racerA,
    answers: { [attemptA.questions[0].questionId]: 'wrong_tampered_option' },
  });

  assert(submitResult2.score === submitResult1.score, 'Re-submitting attempt returns identical original score (idempotent)');
  assert(submitResult2.percentage === submitResult1.percentage, 'Re-submitting attempt returns identical percentage');
  assert(submitResult2.completedAt === submitResult1.completedAt, 'Completed attempt timestamp is strictly immutable');

  // Test Alice can view her own result
  const aliceFetchResult = await quizService.getQuizAttemptResult(attemptA.attemptId, racerA);
  assert(aliceFetchResult !== null && aliceFetchResult.attemptId === attemptA.attemptId, 'Racer Alice can retrieve her own completed attempt result');

  // --------------------------------------------------------------------------
  // SECTION 5: Achievements Registry, Deterministic Rules & Single-Award Guarantee
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 5] Achievements Registry, Award Rules & Idempotency:');

  assert(QUIZ_ACHIEVEMENT_REGISTRY.length === 5, `Registry defines exactly 5 canonical achievements (got: ${QUIZ_ACHIEVEMENT_REGISTRY.length})`);
  const achievementIds = QUIZ_ACHIEVEMENT_REGISTRY.map(a => a.id);
  assert(achievementIds.includes('first-lap'), 'Registry contains "first-lap"');
  assert(achievementIds.includes('consistent-racer'), 'Registry contains "consistent-racer"');
  assert(achievementIds.includes('podium-performance'), 'Registry contains "podium-performance"');
  assert(achievementIds.includes('motorsport-oracle'), 'Registry contains "motorsport-oracle"');
  assert(achievementIds.includes('all-rounder'), 'Registry contains "all-rounder"');

  // Test 1: Single attempt with 85% score in F1
  const mockSingleAttempt: QuizAttemptRecord = {
    attemptId: 'att_test_1',
    userId: 'user_test_ach',
    startedAt: new Date(Date.now() - 60000).toISOString(),
    completedAt: new Date().toISOString(),
    selectedCategories: ['formula-1'],
    questionIds: ['f1-001'],
    questionContentVersions: { 'f1-001': 1 },
    submittedAnswers: { 'f1-001': 'c' },
    categoryBreakdown: {},
    totalQuestions: 15,
    score: 13,
    percentage: 87,
    fanIdentityTier: 'The Race Strategist',
    status: 'completed',
  };

  const eval1 = evaluateQuizAchievements('user_test_ach', [mockSingleAttempt], []);
  const eval1Unlocked = eval1.allAchievements.filter(a => a.isUnlocked).map(a => a.achievementId);
  assert(eval1Unlocked.includes('first-lap'), '1 completed quiz unlocks "first-lap"');
  assert(eval1Unlocked.includes('podium-performance'), 'Score of 87% (>= 80%) unlocks "podium-performance"');
  assert(!eval1Unlocked.includes('motorsport-oracle'), 'Score of 87% (< 95%) does NOT unlock "motorsport-oracle"');
  assert(!eval1Unlocked.includes('all-rounder'), '1 category does NOT unlock "all-rounder"');
  assert(!eval1Unlocked.includes('consistent-racer'), '1 quiz does NOT unlock "consistent-racer"');

  // Test 2: Oracle score (95%) across 3 categories
  const mockOracleAttempt: QuizAttemptRecord = {
    attemptId: 'att_test_2',
    userId: 'user_test_ach',
    startedAt: new Date(Date.now() - 50000).toISOString(),
    completedAt: new Date().toISOString(),
    selectedCategories: ['formula-1', 'motogp', 'endurance-racing'],
    questionIds: ['f1-001', 'motogp-001', 'wec-001'],
    questionContentVersions: { 'f1-001': 1, 'motogp-001': 1, 'wec-001': 1 },
    submittedAnswers: {},
    categoryBreakdown: {},
    totalQuestions: 15,
    score: 15,
    percentage: 100,
    fanIdentityTier: 'The Motorsport Oracle',
    status: 'completed',
  };

  const eval2 = evaluateQuizAchievements('user_test_ach', [mockSingleAttempt, mockOracleAttempt], eval1.allAchievements);
  const eval2Unlocked = eval2.allAchievements.filter(a => a.isUnlocked).map(a => a.achievementId);
  assert(eval2Unlocked.includes('motorsport-oracle'), 'Score of 100% (>= 95%) unlocks "motorsport-oracle"');
  assert(eval2Unlocked.includes('all-rounder'), 'Attempts covering 3 categories unlocks "all-rounder"');

  // Verify single-award guarantee / timestamp stability
  const firstLapInitial = eval1.allAchievements.find(a => a.achievementId === 'first-lap');
  const firstLapSecond = eval2.allAchievements.find(a => a.achievementId === 'first-lap');
  assert(firstLapInitial?.earnedAt === firstLapSecond?.earnedAt, 'Already-earned achievements preserve their original earnedAt timestamp');

  // Test 3: 5 completed quizzes unlocks consistent-racer
  const fiveAttempts: QuizAttemptRecord[] = [1, 2, 3, 4, 5].map(i => ({
    attemptId: `att_${i}`,
    userId: 'user_consistent',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    selectedCategories: ['formula-1'],
    questionIds: ['f1-001'],
    questionContentVersions: { 'f1-001': 1 },
    submittedAnswers: {},
    categoryBreakdown: {},
    totalQuestions: 15,
    score: 8,
    percentage: 53,
    fanIdentityTier: 'The Enthusiast',
    status: 'completed',
  }));

  const eval3 = evaluateQuizAchievements('user_consistent', fiveAttempts, []);
  const eval3Unlocked = eval3.allAchievements.filter(a => a.isUnlocked).map(a => a.achievementId);
  assert(eval3Unlocked.includes('consistent-racer'), '5 completed quizzes unlocks "consistent-racer"');

  // Test 4: Performance summary calculation
  const summary = calculateQuizPerformanceSummary(fiveAttempts);
  assert(summary.quizzesCompleted === 5, `Summary calculates quizzes completed (expected: 5, got: ${summary.quizzesCompleted})`);
  assert(summary.bestScorePercentage === 53, `Summary calculates best score percentage (expected: 53, got: ${summary.bestScorePercentage})`);
  assert(summary.highestTier === 'The Enthusiast', `Summary calculates highest tier (got: ${summary.highestTier})`);
  assert(summary.uniqueDisciplinesCount === 1, `Summary calculates unique disciplines count (got: ${summary.uniqueDisciplinesCount})`);

  // --------------------------------------------------------------------------
  // SECTION 6: Profile & Upcoming Features Component Validation
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 6] Profile & Upcoming Features Component Architecture:');

  const profilePageSrc = fs.readFileSync(path.resolve('src/pages/ProfilePage.tsx'), 'utf-8');
  assert(profilePageSrc.includes('GRDX • Motorsport Fan Identity & Knowledge'), 'ProfilePage features dedicated GRDX quiz section');
  assert(profilePageSrc.includes('Quiz Achievements & Awards'), 'ProfilePage features Quiz Achievements & Awards subsection');
  assert(profilePageSrc.includes('Quiz Attempts Ledger'), 'ProfilePage features Quiz Attempts Ledger subsection');
  assert(profilePageSrc.includes('QUIZZES COMPLETED'), 'ProfilePage surfaces Quizzes Completed performance card');
  assert(profilePageSrc.includes('BEST KNOWLEDGE SCORE'), 'ProfilePage surfaces Best Knowledge Score performance card');
  assert(profilePageSrc.includes('FAN IDENTITY TIER'), 'ProfilePage surfaces Fan Identity Tier performance card');
  assert(profilePageSrc.includes('CATEGORIES TESTED'), 'ProfilePage surfaces Categories Tested performance card');
  assert(profilePageSrc.includes('Racer Knowledge Telemetry is Private'), 'ProfilePage protects quiz history with privacy check for non-owners');
  assert(profilePageSrc.includes('SEPARATE FROM PREDICTION TROPHIES'), 'ProfilePage explicitly preserves separation from prediction trophies');

  const upcomingFeaturesSrc = fs.readFileSync(path.resolve('src/components/quiz/UpcomingQuizFeatures.tsx'), 'utf-8');
  assert(upcomingFeaturesSrc.includes('More motorsports. More challenges.'), 'UpcomingFeatures component presents "More motorsports. More challenges." section');
  assert(upcomingFeaturesSrc.includes('Editorial Publication Gate'), 'UpcomingFeatures explains verified question publication requirements');
  assert(upcomingFeaturesSrc.includes('Phase 1 Active Disciplines'), 'UpcomingFeatures details existing 8 Phase 1 categories');
  assert(upcomingFeaturesSrc.includes('IndyCar Series'), 'UpcomingFeatures previews upcoming IndyCar championship');
  assert(upcomingFeaturesSrc.includes('EXPANSION ROADMAP • GRDX'), 'UpcomingFeatures displays GRDX expansion banner');

  const quizPageSrc = fs.readFileSync(path.resolve('src/pages/QuizPage.tsx'), 'utf-8');
  assert(quizPageSrc.includes('UpcomingQuizFeatures'), 'QuizPage imports and renders UpcomingQuizFeatures');
  assert(quizPageSrc.includes('openLoginModal'), 'QuizPage redirects logged-out users via openLoginModal');
  assert(quizPageSrc.includes('Please sign in with your racer account to start'), 'QuizPage requires signed-in session before launching attempt');
  assert(quizPageSrc.includes('Sign in with your GRDX racer account'), 'QuizPage sign-in prompt branded with GRDX');

  // --------------------------------------------------------------------------
  // SECTION 7: GRDX Rebranding Audit
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 7] GRDX Rebrand Audit across Platform:');

  const homePageSrc = fs.readFileSync(path.resolve('src/pages/HomePage.tsx'), 'utf-8');
  assert(
    homePageSrc.includes('THE <span className="home-hero-grid-accent">GRDX</span>') ||
    (homePageSrc.includes('home-hero-brand-title') && homePageSrc.includes('GRD') && homePageSrc.includes('X')),
    'HomePage hero headline renders "THE GRDX"'
  );
  assert(homePageSrc.includes('YOUR MOTORSPORT <span className="home-hero-tagline-accent">STARTING POINT</span>'), 'HomePage hero renders "YOUR MOTORSPORT STARTING POINT"');
  assert(homePageSrc.includes('Discover, follow, learn and predict across the world of motorsport.'), 'HomePage hero description renders exact requested copy');
  assert(homePageSrc.includes('document.title = \'GRDX | Your Motorsport Starting Point\''), 'HomePage sets browser document title to GRDX');

  const indexHtmlSrc = fs.readFileSync(path.resolve('index.html'), 'utf-8');
  assert(
    indexHtmlSrc.includes('<title>GRDX | Your Motorsport Starting Point') ||
    indexHtmlSrc.includes('<title>GRDX | Motorsport Knowledge'),
    'index.html title updated to "GRDX"'
  );
  assert(indexHtmlSrc.includes('content="GRDX — Motorsport Knowledge'), 'index.html meta description updated to "GRDX"');

  const navbarBrandSrc = fs.readFileSync(path.resolve('src/components/navbar/NavbarBrand.tsx'), 'utf-8');
  assert(navbarBrandSrc.includes('GRDX'), 'NavbarBrand icon text updated to "GRDX"');
  assert(
    navbarBrandSrc.includes('THE GRDX') ||
    (navbarBrandSrc.includes('THE') && navbarBrandSrc.includes('GRD') && navbarBrandSrc.includes('X')),
    'NavbarBrand title text updated to "THE GRDX"'
  );
  assert(navbarBrandSrc.includes('GRDX - Motorsport Knowledge'), 'NavbarBrand aria-label updated to "GRDX"');

  const footerSrc = fs.readFileSync(path.resolve('src/components/common/Footer.tsx'), 'utf-8');
  assert(footerSrc.includes('GRDX'), 'Footer brand text updated to "GRDX"');
  assert(footerSrc.includes('GRDX. An open motorsport platform'), 'Footer copyright updated to "GRDX"');

  const mobileNavSrc = fs.readFileSync(path.resolve('src/components/navbar/MobileNavigation.tsx'), 'utf-8');
  assert(mobileNavSrc.includes('GRDX • The Motorsport Community Hub'), 'MobileNavigation drawer brand updated to "GRDX"');

  const quizSharingSrc = fs.readFileSync(path.resolve('src/services/quiz/quizSharing.ts'), 'utf-8');
  assert(quizSharingSrc.includes("fillText('GRDX', 97, 107)"), 'Share card canvas logo text updated to "GRDX"');
  assert(quizSharingSrc.includes("fillText('THE GRDX', 140, 102)"), 'Share card brand header updated to "THE GRDX"');
  assert(quizSharingSrc.includes('GRDX — ${result.fanIdentityTier}'), 'Share card native share title updated to "GRDX"');

  // Summary
  console.log('\n=============================================================');
  console.log(`✨ TEST EXECUTION COMPLETE: ${passedTests} passed, ${failedTests} failed.`);
  console.log('=============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

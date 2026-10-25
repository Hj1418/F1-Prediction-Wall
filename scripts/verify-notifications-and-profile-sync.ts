/**
 * Regression & Verification Test Suite:
 * Phase 1 & Phase 2: Notification Reliability, UX, Mark-as-Read Persistence & Profile-Quiz Synchronization
 */

import { notificationService } from '../src/services/notificationService';
import { quizService } from '../src/services/quiz/quizService';
import {
  evaluateQuizAchievements,
  calculateQuizPerformanceSummary,
  QUIZ_ACHIEVEMENT_REGISTRY,
} from '../src/services/quiz/quizAchievementRegistry';
import { QuizAttemptRecord } from '../src/types/quiz';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function run() {
  console.log('\n================================================================');
  console.log('🏁 RUNNING NOTIFICATION & PROFILE SYNCHRONIZATION REGRESSION SUITE');
  console.log('================================================================\n');

  const testUserId = `user_sync_test_${Date.now()}`;

  // --------------------------------------------------------------------------
  // SECTION 1: Profile Synchronization & Empty States (Phase 2)
  // --------------------------------------------------------------------------
  console.log('📌 [SECTION 1] Profile Quiz Performance Summary & Empty State Alignment:');

  // Initial state: user has 0 completed quiz attempts
  const emptyHistory: QuizAttemptRecord[] = [];
  const emptySummary = calculateQuizPerformanceSummary(emptyHistory);

  assert(emptySummary.quizzesCompleted === 0, 'Quizzes completed count is 0 for new racer');
  assert(emptySummary.bestScorePercentage === 0, 'Best score percentage is 0%');
  assert(emptySummary.highestTier === null, 'highestTier is null (not "The Rookie") when 0 quizzes completed');

  // Verify ProfilePage.tsx renders clean "Not Yet Earned" instead of premature "The Rookie"
  const profileSrc = fs.readFileSync(path.resolve('src/pages/ProfilePage.tsx'), 'utf-8');
  assert(
    profileSrc.includes("quizSummary?.highestTier && (quizSummary?.quizzesCompleted ?? 0) > 0 ? quizSummary.highestTier : 'Not Yet Earned'"),
    'ProfilePage renders "Not Yet Earned" when quizzesCompleted is 0'
  );
  assert(
    profileSrc.includes('!isQuizLoading && quizHistory.length === 0'),
    'ProfilePage empty state panel is guarded by !isQuizLoading so it never flashes while loading'
  );
  assert(
    !profileSrc.includes('notificationService.notifyAchievementUnlocked(effectiveUser!.userId, a)'),
    'ProfilePage no longer has the unconditional re-notifying loop that spammed notifications on load'
  );

  // Initial achievements evaluation for 0 completed attempts
  const emptyAchs = evaluateQuizAchievements(testUserId, emptyHistory, []);
  assert(emptyAchs.allAchievements.length === 5, 'Evaluates all 5 canonical quiz achievements');
  const unlockedCount = emptyAchs.allAchievements.filter(a => a.isUnlocked).length;
  assert(unlockedCount === 0, '0 achievements unlocked for 0 completed attempts (0/5)');
  assert(emptyAchs.newlyUnlocked.length === 0, '0 newly unlocked achievements');

  // --------------------------------------------------------------------------
  // SECTION 2: 1 Completed Attempt & Achievement Unlocking
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 2] Completed Attempt Synchronization & First Lap Award:');

  const attempt1: QuizAttemptRecord = {
    attemptId: `att_${Date.now()}_1`,
    userId: testUserId,
    selectedCategories: ['formula-1', 'motogp'],
    difficultyLevel: 'apex',
    questionIds: ['q1', 'q2'],
    questionContentVersions: { q1: 1, q2: 1 },
    submittedAnswers: { q1: 'a', q2: 'b' },
    score: 16,
    totalQuestions: 20,
    percentage: 80,
    fanIdentityTier: 'The Race Strategist',
    categoryBreakdown: {},
    startedAt: new Date(Date.now() - 300000).toISOString(),
    completedAt: new Date().toISOString(),
    status: 'completed',
  };

  const evalAfter1 = evaluateQuizAchievements(testUserId, [attempt1], emptyAchs.allAchievements);
  const newlyUnlockedIds = evalAfter1.newlyUnlocked.map(a => a.achievementId);
  assert(newlyUnlockedIds.includes('first-lap'), '1 completed attempt awards "first-lap" achievement');
  assert(newlyUnlockedIds.includes('podium-performance'), '80% score awards "podium-performance" achievement');

  const summaryAfter1 = calculateQuizPerformanceSummary([attempt1]);
  assert(summaryAfter1.quizzesCompleted === 1, 'quizzesCompleted is 1');
  assert(summaryAfter1.bestScorePercentage === 80, 'bestScorePercentage is 80%');
  assert(summaryAfter1.highestTier === 'The Race Strategist', 'highestTier is "The Race Strategist"');

  // --------------------------------------------------------------------------
  // SECTION 3: Notification Deduplication & Presentation Decoupling (Phase 1)
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 3] Notification Idempotency, Deduplication & Presentation State:');

  // Clear any existing toasts for clean test run
  let activeToasts = notificationService.getActiveToasts();
  for (const t of activeToasts) {
    notificationService.dismissToast(t.id);
  }

  // Subscribe to toasts
  let toastCount = 0;
  const unsubToast = notificationService.subscribeToasts((toasts) => {
    toastCount = toasts.length;
  });

  // Enqueue genuinely new quiz achievement
  const firstLapAch = evalAfter1.newlyUnlocked.find(a => a.achievementId === 'first-lap')!;
  const queued1 = notificationService.notifyQuizAchievementUnlocked(testUserId, firstLapAch);
  assert(queued1 === true, 'First dispatch of new achievement returns true');
  assert(notificationService.getActiveToasts().length === 1, 'Exactly 1 toast is active after first dispatch');

  const activeToast = notificationService.getActiveToasts()[0];
  assert(activeToast.title.includes('First Lap'), 'Toast title reflects unlocked achievement');
  assert(activeToast.badgeIcon === '🏁', 'Toast has correct badge icon');
  assert(activeToast.actionPath === '/profile', 'Toast action links to /profile');

  // Repeated dispatch for the SAME achievement (e.g. page refresh, navigation, re-render)
  const queued2 = notificationService.notifyQuizAchievementUnlocked(testUserId, firstLapAch);
  assert(queued2 === false, 'Duplicate dispatch of already-processed achievement returns false');
  assert(notificationService.getActiveToasts().length === 1, 'Toast count remains 1 (no duplicate toast spawned)');

  // Verify notification history in storage
  const notifs = notificationService.getNotifications(testUserId);
  const matchingNotifs = notifs.filter(n => n.entityReference === 'first-lap');
  assert(matchingNotifs.length === 1, 'Exactly 1 notification record in storage for first-lap (no duplicates in ledger)');
  assert(matchingNotifs[0].isRead === false, 'Newly unlocked achievement notification starts as unread');

  // --------------------------------------------------------------------------
  // SECTION 4: Mark as Read & Mark All as Read (Phase 1.3)
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 4] Mark as Read & Mark All as Read Persistence:');

  assert(notificationService.getUnreadCount(testUserId) === 1, 'Unread count is 1');

  // Add a second notification
  const podiumAch = evalAfter1.newlyUnlocked.find(a => a.achievementId === 'podium-performance')!;
  notificationService.notifyQuizAchievementUnlocked(testUserId, podiumAch);
  assert(notificationService.getUnreadCount(testUserId) === 2, 'Unread count is now 2');

  // Mark single notification as read
  const notif1 = notificationService.getNotifications(testUserId).find(n => n.entityReference === 'first-lap')!;
  const markRes1 = notificationService.markAsRead(testUserId, notif1.id);
  assert(markRes1 === true, 'markAsRead returns true on success');
  assert(notificationService.getUnreadCount(testUserId) === 1, 'Unread count immediately decrements to 1');

  const updatedNotif1 = notificationService.getNotifications(testUserId).find(n => n.id === notif1.id);
  assert(updatedNotif1?.isRead === true, 'Notification record isRead is updated to true');

  // Verify underlying notification is NOT deleted
  assert(notificationService.getNotifications(testUserId).length === 2, 'Marking as read preserves notification in history');

  // Mark all as read
  const markAllRes = notificationService.markAllAsRead(testUserId);
  assert(markAllRes === true, 'markAllAsRead returns true');
  assert(notificationService.getUnreadCount(testUserId) === 0, 'Unread count immediately drops to 0');

  const allAfterMarkAll = notificationService.getNotifications(testUserId);
  assert(allAfterMarkAll.every(n => n.isRead === true), 'All notifications are now marked as isRead: true');
  assert(allAfterMarkAll.length === 2, 'All 2 notifications remain intact in history');

  // --------------------------------------------------------------------------
  // SECTION 5: Toast Auto-Dismiss & Max Visible Limit (Phase 1.1)
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 5] Toast Queue Limiting & Dismissal:');

  // Dismiss current active toasts
  for (const t of notificationService.getActiveToasts()) {
    notificationService.dismissToast(t.id);
  }
  assert(notificationService.getActiveToasts().length === 0, 'Toasts can be dismissed cleanly');

  // Push 4 unique mock toasts to test maxVisibleToasts limit of 3
  for (let i = 1; i <= 4; i++) {
    notificationService.pushToast({
      id: `toast_queue_${i}`,
      userId: testUserId,
      type: 'ACHIEVEMENT_UNLOCKED',
      title: `Test Achievement ${i}`,
      message: `Test description ${i}`,
      createdAt: new Date().toISOString(),
    });
  }

  assert(notificationService.getActiveToasts().length === 3, 'Active toasts capped at max 3 simultaneous toasts');
  // Dismiss 1 toast, 4th queued toast should promote to active
  notificationService.dismissToast('toast_queue_1');
  assert(notificationService.getActiveToasts().length === 3, 'Dismissing 1 toast promotes next queued toast to active');
  assert(notificationService.getActiveToasts().some(t => t.id === 'toast_queue_4'), '4th toast is now visible in active toasts');

  // Cleanup toasts
  for (const t of notificationService.getActiveToasts()) {
    notificationService.dismissToast(t.id);
  }
  unsubToast();

  // --------------------------------------------------------------------------
  // SECTION 6: UI Component Integrity (NotificationCoordinator & NotificationCenter)
  // --------------------------------------------------------------------------
  console.log('\n📌 [SECTION 6] Component Contract & Layout Verification:');

  const coordSrc = fs.readFileSync(path.resolve('src/components/notifications/NotificationCoordinator.tsx'), 'utf-8');
  assert(coordSrc.includes('AchievementToastContainer'), 'NotificationCoordinator mounts AchievementToastContainer');
  assert(!coordSrc.includes('AchievementUnlockModal'), 'NotificationCoordinator removed blocking full-screen AchievementUnlockModal');

  const toastContainerSrc = fs.readFileSync(path.resolve('src/components/notifications/AchievementToastContainer.tsx'), 'utf-8');
  assert(toastContainerSrc.includes('bottom: 1.5rem') || toastContainerSrc.includes("bottom: '1.5rem'"), 'AchievementToastContainer is positioned in bottom-right corner');
  assert(toastContainerSrc.includes('pointerEvents') && toastContainerSrc.includes('none'), 'AchievementToastContainer uses pointerEvents: none to avoid blocking clicks');
  assert(toastContainerSrc.includes('safe-area-inset-bottom'), 'AchievementToastContainer respects mobile safe areas');
  assert(toastContainerSrc.includes('hoveredToastId'), 'AchievementToastContainer pauses auto-dismiss on mouse hover');

  const notifCenterSrc = fs.readFileSync(path.resolve('src/components/notifications/NotificationCenter.tsx'), 'utf-8');
  assert(notifCenterSrc.includes('activeTab') && notifCenterSrc.includes('unread') && notifCenterSrc.includes('all'), 'NotificationCenter features dedicated Unread vs History tabs');
  assert(notifCenterSrc.includes('handleMarkSingleRead'), 'NotificationCenter supports individual mark-as-read checkmarks');
  assert(notifCenterSrc.includes('handleMarkAllRead'), 'NotificationCenter supports Mark all read');

  console.log('\n================================================================');
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});

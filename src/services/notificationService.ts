/**
 * The Grid — In-App Live Notification Service & Event Dispatcher
 * 
 * Manages in-app notifications with:
 * - Persistent storage per user (localStorage + memory fallback)
 * - Strict deduplication by unique event keys (prevents repeated notifications)
 * - Decoupled state: Earned State vs Presentation State vs Read/Unread State vs History
 * - Non-intrusive compact toast delivery with auto-dismiss & queue management
 * - Event emitter for reactive UI updates across Toast, Notification Center, and Modals
 */

import { InAppNotification, NotificationType, WeekendTrophy, Achievement } from '../types';
import { UserQuizAchievement } from '../types/quiz';

export interface ToastNotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  badgeIcon?: string;
  badgeColor?: string;
  actionLabel?: string;
  actionPath?: string;
  durationMs?: number;
  createdAt: string;
}

type NotificationListener = (notifications: InAppNotification[]) => void;
type ModalQueueListener = (pendingModal: InAppNotification | null) => void;
type ToastListener = (activeToasts: ToastNotificationItem[]) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private modalQueueListeners: Set<ModalQueueListener> = new Set();
  private toastListeners: Set<ToastListener> = new Set();

  private modalQueue: InAppNotification[] = [];
  private activeModal: InAppNotification | null = null;

  private toastQueue: ToastNotificationItem[] = [];
  private activeToasts: ToastNotificationItem[] = [];
  private readonly maxVisibleToasts = 3;

  // In-memory fallbacks for test & SSR environments
  private inMemoryNotifications: Map<string, InAppNotification[]> = new Map();
  private inMemoryProcessedEvents: Map<string, Set<string>> = new Map();
  private inMemoryPresentedEvents: Map<string, Set<string>> = new Map();

  private getStorageKey(userId: string): string {
    return `thegrid_notifications_${userId}`;
  }

  private getProcessedEventsKey(userId: string): string {
    return `thegrid_processed_events_${userId}`;
  }

  private getPresentedEventsKey(userId: string): string {
    return `thegrid_presented_events_${userId}`;
  }

  // =========================================================================
  // PERSISTENCE & STORAGE ACCESSORS
  // =========================================================================

  public getNotifications(userId: string): InAppNotification[] {
    if (!userId) return [];
    if (typeof localStorage === 'undefined') {
      return this.inMemoryNotifications.get(userId) || [];
    }
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return this.inMemoryNotifications.get(userId) || [];
    }
  }

  public getUnreadCount(userId: string): number {
    return this.getNotifications(userId).filter(n => !n.isRead).length;
  }

  public markAsRead(userId: string, notificationId: string): boolean {
    if (!userId) return false;
    try {
      const current = this.getNotifications(userId);
      let modified = false;
      const items = current.map(n => {
        if (n.id === notificationId && !n.isRead) {
          modified = true;
          return { ...n, isRead: true };
        }
        return n;
      });

      if (modified) {
        this.saveNotifications(userId, items);
      }
      return true;
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
      return false;
    }
  }

  public markAllAsRead(userId: string): boolean {
    if (!userId) return false;
    try {
      const current = this.getNotifications(userId);
      const items = current.map(n => ({ ...n, isRead: true }));
      this.saveNotifications(userId, items);
      return true;
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
      return false;
    }
  }

  private saveNotifications(userId: string, items: InAppNotification[]): void {
    this.inMemoryNotifications.set(userId, items);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.getStorageKey(userId), JSON.stringify(items));
      } catch (e) {
        console.warn('localStorage saveNotifications error:', e);
      }
    }
    this.notifyListeners(items);
  }

  public isEventProcessed(userId: string, dedupeKey: string): boolean {
    if (!userId || !dedupeKey) return false;
    if (this.inMemoryProcessedEvents.get(userId)?.has(dedupeKey)) {
      return true;
    }
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem(this.getProcessedEventsKey(userId));
      const set: string[] = raw ? JSON.parse(raw) : [];
      return Array.isArray(set) && set.includes(dedupeKey);
    } catch (_) {
      return false;
    }
  }

  public markEventProcessed(userId: string, dedupeKey: string): void {
    if (!userId || !dedupeKey) return;
    if (!this.inMemoryProcessedEvents.has(userId)) {
      this.inMemoryProcessedEvents.set(userId, new Set());
    }
    this.inMemoryProcessedEvents.get(userId)!.add(dedupeKey);

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getProcessedEventsKey(userId));
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(dedupeKey)) {
          list.push(dedupeKey);
          localStorage.setItem(this.getProcessedEventsKey(userId), JSON.stringify(list));
        }
      } catch (_) {}
    }
  }

  public isEventPresented(userId: string, presentationKey: string): boolean {
    if (!userId || !presentationKey) return false;
    if (this.inMemoryPresentedEvents.get(userId)?.has(presentationKey)) {
      return true;
    }
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem(this.getPresentedEventsKey(userId));
      const set: string[] = raw ? JSON.parse(raw) : [];
      return Array.isArray(set) && set.includes(presentationKey);
    } catch (_) {
      return false;
    }
  }

  public markEventPresented(userId: string, presentationKey: string): void {
    if (!userId || !presentationKey) return;
    if (!this.inMemoryPresentedEvents.has(userId)) {
      this.inMemoryPresentedEvents.set(userId, new Set());
    }
    this.inMemoryPresentedEvents.get(userId)!.add(presentationKey);

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.getPresentedEventsKey(userId));
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(presentationKey)) {
          list.push(presentationKey);
          localStorage.setItem(this.getPresentedEventsKey(userId), JSON.stringify(list));
        }
      } catch (_) {}
    }
  }

  // =========================================================================
  // TOAST QUEUE & ACTIVE TOASTS
  // =========================================================================

  public pushToast(toast: ToastNotificationItem): void {
    if (this.activeToasts.length < this.maxVisibleToasts) {
      this.activeToasts.push(toast);
      this.notifyToastListeners();
    } else {
      this.toastQueue.push(toast);
    }
  }

  public dismissToast(toastId: string): void {
    this.activeToasts = this.activeToasts.filter(t => t.id !== toastId);
    if (this.toastQueue.length > 0 && this.activeToasts.length < this.maxVisibleToasts) {
      const next = this.toastQueue.shift();
      if (next) {
        this.activeToasts.push(next);
      }
    }
    this.notifyToastListeners();
  }

  public getActiveToasts(): ToastNotificationItem[] {
    return [...this.activeToasts];
  }

  public subscribeToasts(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    listener([...this.activeToasts]);
    return () => this.toastListeners.delete(listener);
  }

  private notifyToastListeners(): void {
    const copy = [...this.activeToasts];
    this.toastListeners.forEach(l => l(copy));
  }

  // =========================================================================
  // ENQUEUE & EVENT DISPATCHING
  // =========================================================================

  /**
   * Dispatches a verified in-app notification idempotently.
   * If dedupeKey was previously handled, returns false without generating noise.
   */
  public enqueueNotification(
    notification: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>,
    dedupeKey?: string,
    showModal: boolean = false,
    showToast: boolean = true
  ): boolean {
    const { userId, type, title, message, entityReference, metadata } = notification;
    if (!userId) return false;

    const actualDedupeKey = dedupeKey || `${type}_${entityReference || ''}_${userId}`;
    const stableNotifId = `notif_${actualDedupeKey}`;

    if (this.isEventProcessed(userId, actualDedupeKey)) {
      return false; // Already handled
    }

    const current = this.getNotifications(userId);
    // Double check that notification with matching ID doesn't already exist
    const exists = current.some(n => n.id === stableNotifId);
    if (exists) {
      this.markEventProcessed(userId, actualDedupeKey);
      return false;
    }

    const newNotification: InAppNotification = {
      id: stableNotifId,
      userId,
      type,
      title,
      message,
      entityReference,
      metadata,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const updated = [newNotification, ...current].slice(0, 50); // Keep latest 50
    this.saveNotifications(userId, updated);
    this.markEventProcessed(userId, actualDedupeKey);

    // Present notification once via Toast or Modal
    if (!this.isEventPresented(userId, actualDedupeKey)) {
      this.markEventPresented(userId, actualDedupeKey);

      if (showToast) {
        this.pushToast({
          id: stableNotifId,
          userId,
          type,
          title,
          message,
          badgeIcon: metadata?.badgeIcon || (type === 'TROPHY_AWARDED' ? '🏆' : '🏁'),
          badgeColor: metadata?.badgeColor || (type === 'TROPHY_AWARDED' ? '#eab308' : '#10b981'),
          actionLabel: type === 'ACHIEVEMENT_UNLOCKED' ? 'View in Profile' : 'View Details',
          actionPath: type === 'ACHIEVEMENT_UNLOCKED' ? '/profile' : '/leaderboard',
          durationMs: 6000,
          createdAt: newNotification.createdAt,
        });
      } else if (showModal) {
        this.pushModalQueue(newNotification);
      }
    }

    return true;
  }

  /**
   * Dispatches a verified Quiz Achievement unlock toast & unread notification.
   * Genuinely new unlock events trigger exactly 1 toast.
   */
  public notifyQuizAchievementUnlocked(userId: string, achievement: UserQuizAchievement): boolean {
    const dedupeKey = `quiz_ach_unlock_${achievement.achievementId}_${userId}`;
    return this.enqueueNotification(
      {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: `Achievement Unlocked: ${achievement.title}`,
        message: achievement.description,
        entityReference: achievement.achievementId,
        metadata: {
          badgeIcon: achievement.badgeIcon,
          badgeColor: achievement.badgeColor,
          achievementType: achievement.achievementId,
          category: 'QUIZ',
        },
      },
      dedupeKey,
      false, // Never block with modal
      true   // Compact toast notification
    );
  }

  /**
   * Helper to trigger prediction achievement unlock notification & compact toast
   */
  public notifyAchievementUnlocked(userId: string, achievement: Achievement): boolean {
    const dedupeKey = `ach_unlock_${achievement.achievementType}_${userId}`;
    return this.enqueueNotification(
      {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: `Achievement Unlocked: ${achievement.title}`,
        message: achievement.description,
        entityReference: achievement.achievementId,
        metadata: {
          badgeIcon: achievement.badgeIcon,
          achievementType: achievement.achievementType,
          category: achievement.category,
        },
      },
      dedupeKey,
      false, // Never block with modal
      true   // Compact toast notification
    );
  }

  /**
   * Helper to trigger weekend trophy awarded notification & celebration
   */
  public notifyTrophyAwarded(userId: string, trophy: WeekendTrophy): boolean {
    const dedupeKey = `trophy_awarded_${trophy.raceWeekendId}_${trophy.trophyType}_${userId}`;
    const rankLabel = trophy.rank === 1 ? 'P1 Gold' : trophy.rank === 2 ? 'P2 Silver' : 'P3 Bronze';
    return this.enqueueNotification(
      {
        userId,
        type: 'TROPHY_AWARDED',
        title: `${trophy.trophyType} Trophy Awarded: ${trophy.eventName}`,
        message: `Congratulations! You placed ${rankLabel} in the ${trophy.eventName} with ${trophy.points} PTS!`,
        entityReference: trophy.trophyId,
        metadata: {
          trophyType: trophy.trophyType,
          rank: trophy.rank,
          eventName: trophy.eventName,
          raceWeekendId: trophy.raceWeekendId,
          points: trophy.points,
          season: trophy.season,
          badgeIcon: '🏆',
          badgeColor: trophy.rank === 1 ? '#eab308' : trophy.rank === 2 ? '#94a3b8' : '#d97706',
        },
      },
      dedupeKey,
      false, // Compact toast instead of screen blocking
      true
    );
  }

  /**
   * Helper to notify prediction submitted
   */
  public notifyPredictionSubmitted(userId: string, roundTitle: string, roundId: string): boolean {
    const dedupeKey = `pred_submitted_${roundId}_${userId}`;
    return this.enqueueNotification(
      {
        userId,
        type: 'PREDICTION_SUBMITTED',
        title: 'Prediction Submitted',
        message: `Your telemetry picks for ${roundTitle} have been verified and saved to the ledger.`,
        entityReference: roundId,
        metadata: { roundId, badgeIcon: '🏎️' },
      },
      dedupeKey,
      false,
      false
    );
  }

  /**
   * Helper to notify results finalized
   */
  public notifyResultsFinalized(userId: string, roundTitle: string, roundId: string, score: number): boolean {
    const dedupeKey = `result_finalized_${roundId}_${userId}`;
    return this.enqueueNotification(
      {
        userId,
        type: 'RESULTS_FINALIZED',
        title: 'Race Results Finalized',
        message: `Official scoring for ${roundTitle} is complete. You scored +${score} PTS!`,
        entityReference: roundId,
        metadata: { roundId, score, badgeIcon: '🏁' },
      },
      dedupeKey,
      false,
      true
    );
  }

  // =========================================================================
  // MODAL COORDINATION (Security modals like Password Setup)
  // =========================================================================

  private pushModalQueue(notification: InAppNotification): void {
    this.modalQueue.push(notification);
    if (!this.activeModal) {
      this.advanceModalQueue();
    }
  }

  public advanceModalQueue(): void {
    if (this.modalQueue.length > 0) {
      this.activeModal = this.modalQueue.shift() || null;
    } else {
      this.activeModal = null;
    }
    this.notifyModalListeners(this.activeModal);
  }

  public dismissCurrentModal(): void {
    this.advanceModalQueue();
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeModalQueue(listener: ModalQueueListener): () => void {
    this.modalQueueListeners.add(listener);
    listener(this.activeModal);
    return () => this.modalQueueListeners.delete(listener);
  }

  private notifyListeners(items: InAppNotification[]): void {
    this.listeners.forEach(l => l(items));
  }

  private notifyModalListeners(modal: InAppNotification | null): void {
    this.modalQueueListeners.forEach(l => l(modal));
  }
}

export const notificationService = new NotificationService();

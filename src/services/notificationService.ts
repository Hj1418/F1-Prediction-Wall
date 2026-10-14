/**
 * The Grid — In-App Live Notification Service & Event Dispatcher
 * 
 * Manages in-app notifications with:
 * - Persistent storage per user (localStorage + memory)
 * - Strict deduplication by unique event keys (prevents repeated notifications)
 * - Read/unread status tracking
 * - Event emitter for reactive UI updates across Toast, Notification Center, and Modals
 */

import { InAppNotification, NotificationType, WeekendTrophy, Achievement } from '../types';

type NotificationListener = (notifications: InAppNotification[]) => void;
type ModalQueueListener = (pendingModal: InAppNotification | null) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private modalQueueListeners: Set<ModalQueueListener> = new Set();
  private modalQueue: InAppNotification[] = [];
  private activeModal: InAppNotification | null = null;

  private getStorageKey(userId: string): string {
    return `thegrid_notifications_${userId}`;
  }

  private getProcessedEventsKey(userId: string): string {
    return `thegrid_processed_events_${userId}`;
  }

  public getNotifications(userId: string): InAppNotification[] {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  public getUnreadCount(userId: string): number {
    return this.getNotifications(userId).filter(n => !n.isRead).length;
  }

  public markAsRead(userId: string, notificationId: string): void {
    if (!userId) return;
    const items = this.getNotifications(userId).map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.saveNotifications(userId, items);
  }

  public markAllAsRead(userId: string): void {
    if (!userId) return;
    const items = this.getNotifications(userId).map(n => ({ ...n, isRead: true }));
    this.saveNotifications(userId, items);
  }

  private saveNotifications(userId: string, items: InAppNotification[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(items));
      this.notifyListeners(items);
    } catch (_) {}
  }

  private isEventProcessed(userId: string, dedupeKey: string): boolean {
    try {
      const raw = localStorage.getItem(this.getProcessedEventsKey(userId));
      const set: string[] = raw ? JSON.parse(raw) : [];
      return set.includes(dedupeKey);
    } catch (_) {
      return false;
    }
  }

  private markEventProcessed(userId: string, dedupeKey: string): void {
    try {
      const raw = localStorage.getItem(this.getProcessedEventsKey(userId));
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(dedupeKey)) {
        list.push(dedupeKey);
        localStorage.setItem(this.getProcessedEventsKey(userId), JSON.stringify(list));
      }
    } catch (_) {}
  }

  /**
   * Dispatches a verified in-app notification idempotently.
   * If dedupeKey was previously handled, returns false without generating noise.
   */
  public enqueueNotification(
    notification: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>,
    dedupeKey?: string,
    showModal: boolean = false
  ): boolean {
    const { userId, type, title, message, entityReference, metadata } = notification;
    if (!userId) return false;

    const actualDedupeKey = dedupeKey || `${type}_${entityReference || ''}_${userId}`;
    if (this.isEventProcessed(userId, actualDedupeKey)) {
      return false; // Already delivered
    }

    const newNotification: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type,
      title,
      message,
      entityReference,
      metadata,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const current = this.getNotifications(userId);
    const updated = [newNotification, ...current].slice(0, 50); // Keep latest 50
    this.saveNotifications(userId, updated);
    this.markEventProcessed(userId, actualDedupeKey);

    if (showModal) {
      this.pushModalQueue(newNotification);
    }

    return true;
  }

  /**
   * Helper to trigger achievement unlock notification & modal
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
      true // Show celebration modal
    );
  }

  /**
   * Helper to trigger weekend trophy awarded notification & modal
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
        },
      },
      dedupeKey,
      true // Show celebration modal
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
        metadata: { roundId },
      },
      dedupeKey,
      false // Routine notification (toast handled separately)
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
        metadata: { roundId, score },
      },
      dedupeKey,
      false
    );
  }

  // =========================================================================
  // MODAL COORDINATION & QUEUE MANAGEMENT
  // =========================================================================

  private pushModalQueue(notification: InAppNotification): void {
    // Priority order:
    // 1. PASSWORD_SETUP_PROMPT (security)
    // 2. TROPHY_AWARDED (high honor)
    // 3. ACHIEVEMENT_UNLOCKED (milestone)
    const priority = (type: NotificationType) => {
      switch (type) {
        case 'PASSWORD_SETUP_PROMPT': return 1;
        case 'TROPHY_AWARDED': return 2;
        case 'ACHIEVEMENT_UNLOCKED': return 3;
        default: return 4;
      }
    };

    this.modalQueue.push(notification);
    this.modalQueue.sort((a, b) => priority(a.type) - priority(b.type));

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

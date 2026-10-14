import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { InAppNotification } from '../../types';
import { AchievementUnlockModal } from './AchievementUnlockModal';
import { TrophyModal } from './TrophyModal';
import { GooglePasswordSetupModal } from './GooglePasswordSetupModal';

export const NotificationCoordinator: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeModal, setActiveModal] = useState<InAppNotification | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Subscribe to queued modals from notification service
  useEffect(() => {
    const unsubscribe = notificationService.subscribeModalQueue((modal) => {
      setActiveModal(modal);
    });
    return unsubscribe;
  }, []);

  // Google Password Setup Prompt Evaluator
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setIsPasswordModalOpen(false);
      return;
    }

    // Check authoritative password configuration state
    // Only prompt if backend explicitly confirms user has no configured password
    const hasPassword = currentUser.hasPasswordConfigured !== undefined
      ? currentUser.hasPasswordConfigured
      : currentUser.hasPassword;

    if (hasPassword === false) {
      // Check if reminder was deferred
      const deferKey = `thegrid_password_remind_later_${currentUser.userId}`;
      const deferredUntil = localStorage.getItem(deferKey);
      const isDeferred = deferredUntil ? Date.now() < Number(deferredUntil) : false;

      // Only open if not deferred and no higher priority modal active
      if (!isDeferred) {
        setIsPasswordModalOpen(true);
      }
    } else if (hasPassword === true) {
      setIsPasswordModalOpen(false);
    }
  }, [isAuthenticated, currentUser?.userId, currentUser?.hasPasswordConfigured, currentUser?.hasPassword]);

  const handleDismissModal = () => {
    notificationService.dismissCurrentModal();
  };

  const handleRemindLaterPassword = () => {
    if (currentUser?.userId) {
      const deferKey = `thegrid_password_remind_later_${currentUser.userId}`;
      // Defer for 7 days
      localStorage.setItem(deferKey, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    }
    setIsPasswordModalOpen(false);
  };

  const handleSuccessPassword = () => {
    if (currentUser) {
      currentUser.hasPasswordConfigured = true;
      currentUser.hasPassword = true;
    }
    setIsPasswordModalOpen(false);
  };

  // Strict priority rendering: exactly ONE modal active at any time
  if (isPasswordModalOpen) {
    return (
      <GooglePasswordSetupModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onRemindLater={handleRemindLaterPassword}
        onSuccess={handleSuccessPassword}
      />
    );
  }

  if (activeModal) {
    if (activeModal.type === 'TROPHY_AWARDED') {
      return (
        <TrophyModal
          notification={activeModal}
          onClose={handleDismissModal}
        />
      );
    }

    if (activeModal.type === 'ACHIEVEMENT_UNLOCKED') {
      return (
        <AchievementUnlockModal
          notification={activeModal}
          onClose={handleDismissModal}
        />
      );
    }
  }

  return null;
};

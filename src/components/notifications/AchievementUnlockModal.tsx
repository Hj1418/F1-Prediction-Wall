import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Trophy } from 'lucide-react';
import { InAppNotification } from '../../types';

interface AchievementUnlockModalProps {
  notification: InAppNotification;
  onClose: () => void;
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  notification,
  onClose,
}) => {
  const navigate = useNavigate();
  const icon = notification.metadata?.badgeIcon || '🏆';

  const handleViewProfile = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-modal-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#14181F',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 50px rgba(234, 179, 8, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Gold Accent Top Bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #ca8a04 0%, #eab308 50%, #fef08a 100%)' }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: '#8E9BAE',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '6px',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div style={{ padding: '2.5rem 1.75rem 2rem 1.75rem' }}>
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#eab308',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} /> NEW ACHIEVEMENT UNLOCKED
          </div>

          {/* Badge Icon with Glow */}
          <div
            style={{
              fontSize: '3.5rem',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(20, 24, 31, 0.9))',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              boxShadow: '0 0 30px rgba(234, 179, 8, 0.3)',
            }}
          >
            {icon}
          </div>

          {/* Title */}
          <h2
            id="achievement-modal-title"
            style={{
              color: '#FFFFFF',
              fontSize: '1.5rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              margin: '0 0 0.5rem 0',
              letterSpacing: '0.04em',
            }}
          >
            {notification.title.replace(/^Achievement Unlocked:\s*/i, '')}
          </h2>

          {/* Explanation */}
          <p
            style={{
              color: '#94A3B8',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              margin: '0 0 1.75rem 0',
            }}
          >
            {notification.message}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={handleViewProfile}
              className="btn btn-sm"
              style={{
                backgroundColor: '#eab308',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                padding: '0.65rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Trophy size={15} /> VIEW IN PROFILE
            </button>
            <button
              onClick={onClose}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#E2E8F0',
                padding: '0.65rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px',
              }}
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trophy, Sparkles, ChevronRight, Award } from 'lucide-react';
import { notificationService, ToastNotificationItem } from '../../services/notificationService';

export const AchievementToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotificationItem[]>([]);
  const [hoveredToastId, setHoveredToastId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToasts((active) => {
      setToasts(active);
    });
    return unsubscribe;
  }, []);

  // Per-toast auto-dismiss timer that pauses on hover
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      if (hoveredToastId === toast.id) return null;

      const duration = toast.durationMs || 6000;
      return setTimeout(() => {
        notificationService.dismissToast(toast.id);
      }, duration);
    });

    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, [toasts, hoveredToastId]);

  if (toasts.length === 0) return null;

  const handleAction = (toast: ToastNotificationItem) => {
    notificationService.dismissToast(toast.id);
    if (toast.actionPath) {
      navigate(toast.actionPath);
    }
  };

  const handleDismiss = (toastId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.dismissToast(toastId);
  };

  return (
    <div
      role="region"
      aria-label="Achievement notifications"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 99990,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '380px',
        maxWidth: 'calc(100vw - 2rem)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
      className="grdx-toast-container"
    >
      <style>{`
        @keyframes toastSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (max-width: 640px) {
          .grdx-toast-container {
            bottom: calc(1rem + env(safe-area-inset-bottom, 0px)) !important;
            right: 1rem !important;
            left: 1rem !important;
            width: auto !important;
            max-width: calc(100% - 2rem) !important;
          }
        }
      `}</style>
      {toasts.map((toast) => {
        const isAchievement = toast.type === 'ACHIEVEMENT_UNLOCKED';
        const isTrophy = toast.type === 'TROPHY_AWARDED';
        const accentColor = toast.badgeColor || (isTrophy ? '#eab308' : '#10b981');
        const icon = toast.badgeIcon || (isTrophy ? '🏆' : '🏁');

        return (
          <div
            key={toast.id}
            onMouseEnter={() => setHoveredToastId(toast.id)}
            onMouseLeave={() => setHoveredToastId(null)}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#14181F',
              border: `1px solid ${accentColor}55`,
              borderRadius: '12px',
              boxShadow: `0 12px 30px rgba(0, 0, 0, 0.75), 0 0 20px ${accentColor}25`,
              overflow: 'hidden',
              position: 'relative',
              animation: 'toastSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* Top Color Accent Line */}
            <div
              style={{
                height: '3px',
                background: isTrophy
                  ? 'linear-gradient(90deg, #ca8a04 0%, #eab308 50%, #fef08a 100%)'
                  : 'linear-gradient(90deg, #059669 0%, #10b981 50%, #6ee7b7 100%)',
              }}
            />

            <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              {/* Badge Icon */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: `${accentColor}18`,
                  border: `1.5px solid ${accentColor}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                  boxShadow: `0 0 12px ${accentColor}33`,
                }}
              >
                {icon}
              </div>

              {/* Text Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Eyebrow */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: accentColor,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.2rem',
                  }}
                >
                  {isTrophy ? <Trophy size={11} /> : <Sparkles size={11} />}
                  {isTrophy ? 'PODIUM TROPHY AWARDED' : 'NEW ACHIEVEMENT UNLOCKED'}
                </div>

                {/* Title */}
                <h4
                  style={{
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    margin: '0 0 0.25rem 0',
                    lineHeight: 1.25,
                    letterSpacing: '0.02em',
                  }}
                >
                  {toast.title.replace(/^Achievement Unlocked:\s*/i, '')}
                </h4>

                {/* Description */}
                <p
                  style={{
                    color: '#94A3B8',
                    fontSize: '0.75rem',
                    lineHeight: 1.35,
                    margin: 0,
                  }}
                >
                  {toast.message}
                </p>

                {/* Action CTA */}
                {toast.actionLabel && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <button
                      onClick={() => handleAction(toast)}
                      style={{
                        background: `${accentColor}22`,
                        border: `1px solid ${accentColor}55`,
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${accentColor}44`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${accentColor}22`;
                      }}
                    >
                      {isTrophy ? <Trophy size={12} color={accentColor} /> : <Award size={12} color={accentColor} />}
                      {toast.actionLabel}
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => handleDismiss(toast.id, e)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  marginTop: '-0.2rem',
                  marginRight: '-0.3rem',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748B';
                }}
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

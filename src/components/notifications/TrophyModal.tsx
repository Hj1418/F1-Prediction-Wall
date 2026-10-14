import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trophy, Award, Calendar } from 'lucide-react';
import { InAppNotification } from '../../types';

interface TrophyModalProps {
  notification: InAppNotification;
  onClose: () => void;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({
  notification,
  onClose,
}) => {
  const navigate = useNavigate();
  const trophyType = notification.metadata?.trophyType || 'GOLD';
  const rank = notification.metadata?.rank || 1;
  const eventName = notification.metadata?.eventName || 'Race Weekend';
  const weekendId = notification.metadata?.raceWeekendId || '';
  const points = notification.metadata?.points || 0;

  const trophyColors = {
    GOLD: {
      accent: '#eab308',
      gradient: 'linear-gradient(135deg, #fef08a 0%, #eab308 50%, #854d0e 100%)',
      border: 'rgba(234, 179, 8, 0.5)',
      glow: 'rgba(234, 179, 8, 0.25)',
      label: 'P1 GOLD TROPHY',
    },
    SILVER: {
      accent: '#94a3b8',
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #475569 100%)',
      border: 'rgba(148, 163, 184, 0.5)',
      glow: 'rgba(148, 163, 184, 0.25)',
      label: 'P2 SILVER TROPHY',
    },
    BRONZE: {
      accent: '#d97706',
      gradient: 'linear-gradient(135deg, #fdba74 0%, #d97706 50%, #7c2d12 100%)',
      border: 'rgba(217, 119, 6, 0.5)',
      glow: 'rgba(217, 119, 6, 0.25)',
      label: 'P3 BRONZE TROPHY',
    },
  }[trophyType as 'GOLD' | 'SILVER' | 'BRONZE'] || {
    accent: '#eab308',
    gradient: 'linear-gradient(135deg, #fef08a 0%, #eab308 50%, #854d0e 100%)',
    border: 'rgba(234, 179, 8, 0.5)',
    glow: 'rgba(234, 179, 8, 0.25)',
    label: 'P1 GOLD TROPHY',
  };

  const handleViewResults = () => {
    onClose();
    if (weekendId) {
      navigate(`/leaderboard?type=weekend&id=${encodeURIComponent(weekendId)}`);
    } else {
      navigate('/leaderboard?type=weekend');
    }
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
      aria-labelledby="trophy-modal-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#14181F',
          border: `1px solid ${trophyColors.border}`,
          borderRadius: '16px',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 50px ${trophyColors.glow}`,
          overflow: 'hidden',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <div style={{ height: '4px', background: trophyColors.gradient }} />

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
              color: trophyColors.accent,
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <Award size={14} /> WEEKEND PODIUM TROPHY AWARDED
          </div>

          {/* Trophy Cup Icon */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(20, 24, 31, 0.9))',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: `2px solid ${trophyColors.border}`,
              boxShadow: `0 0 30px ${trophyColors.glow}`,
            }}
          >
            <Trophy size={48} color={trophyColors.accent} />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: trophyColors.accent,
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '0.35rem',
            }}
          >
            {trophyColors.label} • {points} PTS
          </div>

          <h2
            id="trophy-modal-title"
            style={{
              color: '#FFFFFF',
              fontSize: '1.5rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              margin: '0 0 0.5rem 0',
              letterSpacing: '0.04em',
            }}
          >
            {eventName}
          </h2>

          <p
            style={{
              color: '#94A3B8',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              margin: '0 0 1.75rem 0',
            }}
          >
            Your predictions placed you <strong>#{rank} Overall</strong> for the race weekend across all Sprint and Grand Prix sessions!
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={handleViewResults}
              className="btn btn-sm"
              style={{
                backgroundColor: trophyColors.accent,
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
              <Calendar size={15} /> VIEW WEEKEND RESULTS
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

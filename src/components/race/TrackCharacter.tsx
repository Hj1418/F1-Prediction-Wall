import React from 'react';
import { TrackCharacterSimple } from '../../types';
import { Zap, Activity, ArrowLeftRight, Disc3 } from 'lucide-react';

interface TrackCharacterProps {
  trackCharacter?: TrackCharacterSimple;
  className?: string;
}

const DEFAULT_CHARACTER: TrackCharacterSimple = {
  speed: 'Very High',
  braking: 'Heavy',
  overtaking: 'High',
  tyreWear: 'Medium',
};

export const TrackCharacter: React.FC<TrackCharacterProps> = ({
  trackCharacter = DEFAULT_CHARACTER,
  className = '',
}) => {
  const items = [
    {
      label: 'SPEED',
      value: trackCharacter.speed,
      icon: <Zap size={18} color="var(--f1-red)" />,
      color: 'var(--f1-red)',
      bg: 'rgba(225, 6, 0, 0.12)',
    },
    {
      label: 'BRAKING',
      value: trackCharacter.braking,
      icon: <Activity size={18} color="#f87171" />,
      color: '#f87171',
      bg: 'rgba(248, 113, 113, 0.12)',
    },
    {
      label: 'OVERTAKING',
      value: trackCharacter.overtaking,
      icon: <ArrowLeftRight size={18} color="var(--telemetry-green)" />,
      color: 'var(--telemetry-green)',
      bg: 'rgba(0, 230, 118, 0.12)',
    },
    {
      label: 'TYRE WEAR',
      value: trackCharacter.tyreWear,
      icon: <Disc3 size={18} color="var(--telemetry-yellow)" />,
      color: 'var(--telemetry-yellow)',
      bg: 'rgba(234, 179, 8, 0.12)',
    },
  ];

  return (
    <div
      className={`race-card ${className}`}
      style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-surface-card) 0%, var(--bg-surface-elevated) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--f1-red)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          CIRCUIT PROFILE
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.15rem' }}>
          Track Character
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {items.map(item => (
          <div
            key={item.label}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {item.icon}
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                }}
              >
                {item.label}
              </span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

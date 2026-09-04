import React from 'react';
import { Driver } from '../../types';
import { Check } from 'lucide-react';

interface DriverCardProps {
  driver: Driver;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  onClick?: () => void;
  compact?: boolean;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  isSelected = false,
  isDisabled = false,
  disabledReason,
  onClick,
  compact = false,
}) => {
  return (
    <div
      onClick={() => {
        if (!isDisabled && onClick) onClick();
      }}
      title={isDisabled ? disabledReason : undefined}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: compact ? '0.45rem 0.75rem' : '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: isSelected
          ? 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, var(--bg-surface-elevated) 100%)'
          : 'var(--bg-surface-card)',
        border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
        borderLeft: `5px solid ${driver.teamColor}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.4 : 1,
        transition: 'all 0.15s ease',
        userSelect: 'none',
        boxShadow: isSelected ? `0 0 15px -4px ${driver.teamColor}` : 'none',
      }}
      onMouseEnter={e => {
        if (!isDisabled && !isSelected) {
          e.currentTarget.style.borderColor = 'var(--border-medium)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        if (!isDisabled && !isSelected) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Driver Number Badge */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            fontSize: compact ? '0.85rem' : '1.1rem',
            color: driver.teamColor,
            minWidth: compact ? '24px' : '30px',
          }}
        >
          #{driver.number}
        </div>

        {/* Driver Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{driver.firstName}</span>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: compact ? '0.85rem' : '0.95rem' }}>
              {driver.lastName}
            </span>
            <span style={{ fontSize: '0.9rem' }}>{driver.countryFlag}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>{driver.team}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{driver.code}</span>
          </div>
        </div>
      </div>

      {/* Selected Indicator / Disabled Hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isDisabled && disabledReason && (
          <span style={{ fontSize: '0.68rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
            {disabledReason}
          </span>
        )}
        {isSelected && (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--telemetry-green)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
};

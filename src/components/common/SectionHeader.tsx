import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  rightAction,
  style,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.25rem',
        ...style,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--f1-red)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'var(--font-mono)',
              marginBottom: '0.2rem',
            }}
          >
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {rightAction && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {rightAction}
        </div>
      )}
    </div>
  );
};

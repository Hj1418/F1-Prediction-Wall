import React from 'react';
import { Flag } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message = 'There are no active records or sessions currently available for this section.',
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`race-card ${className}`}
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--bg-input)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {icon || <Flag size={24} />}
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.5, margin: '0 auto 1.25rem auto' }}>
        {message}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
};

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry Connection Interrupted',
  message = 'Unable to synchronize official race information. Check your network or server status.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`race-card ${className}`}
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          marginBottom: '1rem',
          border: '1px solid rgba(239, 68, 68, 0.4)',
        }}
      >
        <AlertCircle size={24} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem', color: '#fff' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, margin: '0 auto 1.25rem auto' }}>
        {message}
      </p>

      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <RotateCcw size={14} /> Retry Telemetry Sync
        </button>
      )}
    </div>
  );
};

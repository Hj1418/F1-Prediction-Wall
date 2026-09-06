import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'ACQUIRING PIT WALL TELEMETRY...',
  className = '',
  minHeight = '300px',
}) => {
  return (
    <div
      className={`container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="live-pulse"
        style={{
          width: '14px',
          height: '14px',
          backgroundColor: 'var(--f1-red)',
          marginBottom: '1rem',
          boxShadow: '0 0 15px var(--f1-red-glow)',
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
        }}
      >
        {message}
      </div>
    </div>
  );
};

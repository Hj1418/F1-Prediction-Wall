import React from 'react';

interface PageLoadingFallbackProps {
  label?: string;
}

export const PageLoadingFallback: React.FC<PageLoadingFallbackProps> = ({
  label = 'LOADING EXPERIENCE...',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '45vh',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      {/* Branded motorsport pulse indicator */}
      <div
        style={{
          position: 'relative',
          width: '44px',
          height: '44px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '10px',
            border: '2px solid rgba(225, 6, 0, 0.25)',
            animation: 'thegrid-pulse 1.8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: 'var(--f1-red, #e10600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(225, 6, 0, 0.5)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 900,
              fontSize: '0.7rem',
              color: '#ffffff',
              letterSpacing: '-0.05em',
            }}
          >
            TG
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          color: 'var(--text-secondary, #94a3b8)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>

      <style>{`
        @keyframes thegrid-pulse {
          0% {
            transform: scale(0.9);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
            border-color: rgba(225, 6, 0, 0.6);
          }
          100% {
            transform: scale(0.9);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default PageLoadingFallback;

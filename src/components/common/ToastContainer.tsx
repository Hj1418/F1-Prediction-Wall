import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        maxWidth: '380px',
        width: 'calc(100% - 3rem)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        let borderColor = 'var(--border-medium)';
        let Icon = Info;
        let iconColor = 'var(--telemetry-cyan)';

        if (t.type === 'success') {
          borderColor = 'rgba(0, 230, 118, 0.4)';
          Icon = CheckCircle2;
          iconColor = 'var(--telemetry-green)';
        } else if (t.type === 'error') {
          borderColor = 'rgba(239, 68, 68, 0.4)';
          Icon = AlertCircle;
          iconColor = '#f87171';
        }

        return (
          <div
            key={t.id}
            className="animate-fade-in"
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'var(--bg-surface-card)',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

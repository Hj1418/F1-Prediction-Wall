import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backTo?: {
    label: string;
    path: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  backTo,
  actions,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <div>
        {backTo && (
          <Link
            to={backTo.path}
            style={{
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginBottom: '0.75rem',
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={14} /> {backTo.label}
          </Link>
        )}

        {eyebrow && (
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--f1-red)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'var(--font-mono)',
              marginBottom: '0.25rem',
            }}
          >
            {eyebrow}
          </div>
        )}

        <h1
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginTop: '0.4rem',
              maxWidth: '680px',
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

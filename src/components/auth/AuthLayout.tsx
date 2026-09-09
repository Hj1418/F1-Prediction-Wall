import React from 'react';
import './auth.css';
import { Flag } from 'lucide-react';

interface AuthLayoutProps {
  badgeText?: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  badgeText = 'THE GRID • F1 COMMUNITY HUB',
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="auth-page-wrapper">
      {/* Grid line overlay */}
      <div className="auth-grid-overlay" aria-hidden="true" />

      {/* Subtle top telemetry glow */}
      <div className="auth-telemetry-glow" aria-hidden="true" />

      <div className="auth-container">
        <header className="auth-header">
          {badgeText && (
            <div className="auth-brand-badge">
              <Flag size={13} className="text-red-500" />
              <span>{badgeText}</span>
            </div>
          )}
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </header>

        <main>{children}</main>

        <footer className="auth-page-footer">
          The Grid <span>•</span> The F1 Community Hub <span>•</span> Prediction Bench
        </footer>
      </div>
    </div>
  );
};

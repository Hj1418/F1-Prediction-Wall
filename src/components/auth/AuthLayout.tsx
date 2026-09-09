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
  badgeText = '2026 Season • F1 Prediction League',
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
          Formula 1 Community Hub <span>•</span> Grid Live Telemetry <span>•</span> 2026
        </footer>
      </div>
    </div>
  );
};

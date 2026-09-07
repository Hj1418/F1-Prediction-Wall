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

      {/* Subtle background circuit SVG watermark */}
      <svg
        className="auth-circuit-bg"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M 100,300 C 120,200 200,100 350,120 C 500,140 650,80 700,200 C 750,320 680,480 550,520 C 420,560 300,500 220,480 C 140,460 80,400 100,300 Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="8 6"
        />
        <path
          d="M 180,300 C 200,230 260,170 380,180 C 500,190 580,150 620,240 C 660,330 600,430 500,450 C 400,470 300,430 240,410 C 180,390 160,360 180,300 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <circle cx="700" cy="200" r="8" fill="#e10600" opacity="0.6" />
        <circle cx="220" cy="480" r="6" fill="#e10600" opacity="0.4" />
      </svg>

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

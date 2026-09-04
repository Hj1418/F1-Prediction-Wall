import React from 'react';
import { api } from '../../services/apiClient';
import { Database, Shield, Code2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        padding: '2.5rem 0 1.75rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.04em' }}>
                F1 COMMUNITY PREDICTION LEAGUE
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  backgroundColor: api.isLive ? 'rgba(0, 230, 118, 0.15)' : 'rgba(157, 78, 221, 0.15)',
                  color: api.isLive ? 'var(--telemetry-green)' : 'var(--telemetry-purple)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${api.isLive ? 'rgba(0, 230, 118, 0.3)' : 'rgba(157, 78, 221, 0.3)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Database size={11} />
                {api.isLive ? 'LIVE GOOGLE APPS SCRIPT API' : 'OFFLINE DEMO / PERSISTED STATE'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: '600px' }}>
              Production portfolio web application for Formula 1 communities. Dynamic prediction rounds for Normal and Sprint weekends, scoring engine, server-side deadline validation, and season championship leaderboards.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ textTransform: 'none', gap: '0.4rem' }}
            >
              <Code2 size={14} /> GitHub Repository
            </a>
          </div>
        </div>

        <div
          style={{
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            gap: '0.75rem',
          }}
        >
          <div>
            Built with React, Vite, TypeScript & Google Apps Script. Not affiliated with Formula 1 or the FIA.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Telemetry Timing Dashboard • 2026 Season
          </div>
        </div>
      </div>
    </footer>
  );
};

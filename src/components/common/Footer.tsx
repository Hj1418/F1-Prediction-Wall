import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, HelpCircle, Home, Calendar, Trophy, Target } from 'lucide-react';

export const Footer: React.FC = () => {
  const linkStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.82rem',
    transition: 'color 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  };

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
        {/* Top Section: Brand + Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            paddingBottom: '1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--f1-red)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(225, 6, 0, 0.35)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    color: '#fff',
                  }}
                >
                  F1
                </span>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.04em', color: '#fff' }}>
                PREDICTION LEAGUE
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '320px' }}>
              The community-driven Formula 1 prediction platform. Predict race results, compete with friends, and climb
              the championship leaderboard.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '0.85rem',
              }}
            >
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link to="/" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Home size={13} /> Home
              </Link>
              <Link to="/races" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Calendar size={13} /> Race Weekends
              </Link>
              <Link to="/predictions" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Target size={13} /> Predictions
              </Link>
              <Link to="/leaderboard" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Trophy size={13} /> Leaderboard
              </Link>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h4
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '0.85rem',
              }}
            >
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a
                href="mailto:support@f1predictionwall.com"
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Mail size={13} /> support@f1predictionwall.com
              </a>
              <a
                href="mailto:feedback@f1predictionwall.com"
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <MessageCircle size={13} /> Send Feedback
              </a>
              <a
                href="mailto:help@f1predictionwall.com"
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <HelpCircle size={13} /> Help & Support
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
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
          <div>© {new Date().getFullYear()} F1 Prediction League. Not affiliated with Formula 1 or the FIA.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>2026 Season</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

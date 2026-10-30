import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, HelpCircle, Home, Calendar, Trophy, Target, BookOpen, MapPin, Compass, Flag, Brain, Users } from 'lucide-react';

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
                  minWidth: '38px',
                  height: '28px',
                  padding: '0 4px',
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
                    fontSize: '0.74rem',
                    color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >
                  GRDX
                </span>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.04em', color: '#fff' }}>
                THE GRDX
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '320px' }}>
              Your place to learn, follow, explore and experience motorsport. Understand racing categories, follow race weekends, explore circuits, and compete with the community on Prediction Bench.
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
              The Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link to="/" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Home size={13} /> Home
              </Link>
              <Link to="/races" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Calendar size={13} /> Race Weekends
              </Link>
              <Link to="/explore" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Compass size={13} /> Explore Motorsport
              </Link>
              <Link to="/circuits" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <MapPin size={13} /> Circuits
              </Link>
              <Link to="/indian-motorsport" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Flag size={13} style={{ color: '#ff9933' }} /> Indian Motorsport 🇮🇳
              </Link>
              <Link to="/predictions" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Target size={13} /> Prediction Bench
              </Link>
              <Link to="/quiz" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Brain size={13} /> Motorsport Quiz
              </Link>
              <Link to="/leaderboard" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Trophy size={13} /> Leaderboard
              </Link>
              <Link to="/community-stats" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Users size={13} /> Community Report
              </Link>
              <Link to="/about" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Compass size={13} /> About Us
              </Link>
            </div>
          </div>

          {/* Contact & Support */}
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
              Contact & Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a
                href="mailto:thepaddockprediction14@gmail.com"
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Mail size={13} /> thepaddockprediction14@gmail.com
              </a>
              <a
                href="mailto:thepaddockprediction14@gmail.com?subject=The%20GRDX%20Feedback"
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <MessageCircle size={13} /> Send Feedback
              </a>
              <a
                href="mailto:thepaddockprediction14@gmail.com?subject=The%20GRDX%20Support%20Request"
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
          <div>© {new Date().getFullYear()} GRDX. An open motorsport platform. Not affiliated with Formula 1, the FIA, or any motorsport governing body.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link>
            <Link to="/circuits" style={{ color: 'inherit', textDecoration: 'none' }}>Circuits</Link>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>2026 Season</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

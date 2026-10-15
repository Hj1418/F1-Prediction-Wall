import React from 'react';
import { Sparkles, Compass, ShieldAlert, Award, Clock } from 'lucide-react';

export const UpcomingQuizFeatures: React.FC = () => {
  return (
    <section
      style={{
        marginTop: '4rem',
        paddingTop: '2.5rem',
        borderTop: '1px solid var(--border-subtle)',
      }}
      aria-label="Upcoming Motorsport Quiz Features"
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--f1-red)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.4rem',
          }}
        >
          <Sparkles size={13} />
          <span>EXPANSION ROADMAP • GRDX</span>
        </div>
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
            color: '#ffffff',
          }}
        >
          More motorsports. More challenges.
        </h2>
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            maxWidth: '620px',
            margin: '0.5rem auto 0',
            lineHeight: 1.5,
          }}
        >
          GRDX is continuously expanding across global racing disciplines. Discover upcoming championships, upcoming thematic challenges, and future achievement tiers.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Card 1: Upcoming Series */}
        <div
          className="race-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Compass size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Series in Pipeline
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Next Championships
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
              Editorial question banks are in active regulatory verification for <strong style={{ color: '#fff' }}>IndyCar Series</strong>, <strong style={{ color: '#fff' }}>Supercars Championship</strong>, <strong style={{ color: '#fff' }}>WRC World Rally</strong>, <strong style={{ color: '#fff' }}>World Superbike (WSBK)</strong>, and the <strong style={{ color: '#fff' }}>Indian Racing Festival (IRF)</strong>.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <Clock size={12} />
            <span>VERIFICATION IN PROGRESS</span>
          </div>
        </div>

        {/* Card 2: Thematic Challenges */}
        <div
          className="race-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Special Formats
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Deep-Dive Themes
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
              Future releases will introduce curated deep-dive modes: <strong style={{ color: '#fff' }}>Historic Turbo & V10 Eras</strong>, <strong style={{ color: '#fff' }}>Technical & Active Aero Regulations</strong>, and <strong style={{ color: '#fff' }}>24h Race Strategy Tactics</strong>.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: '#eab308',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <Clock size={12} />
            <span>TOPIC PACKS PLANNED</span>
          </div>
        </div>

        {/* Card 3: New Badges & Trophies */}
        <div
          className="race-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(185, 102, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b966ff',
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Profile Integration
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Milestone Awards
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
              More achievement badges, discipline masteries, and speedrun accolades will unlock as new question pools are certified by our editorial team.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: '#b966ff',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <Clock size={12} />
            <span>MORE ACHIEVEMENTS IN ROADMAP</span>
          </div>
        </div>
      </div>

      {/* Verified Phase 1 Gate Callout */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          maxWidth: '780px',
          margin: '0 auto',
        }}
      >
        <ShieldAlert size={20} color="var(--f1-red)" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          <strong style={{ color: '#fff' }}>Editorial Publication Gate:</strong> Only Phase 1 Active Disciplines (Formula 1, Formula 2, Formula 3, Formula 4, Formula E, MotoGP, Endurance Racing, and GT Racing) are live and playable. Upcoming series will remain unplayable until 100% of their verified question sets are approved.
        </p>
      </div>
    </section>
  );
};

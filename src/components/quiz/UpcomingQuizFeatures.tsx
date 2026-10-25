import React from 'react';
import { Sparkles, Compass, ShieldAlert, Award, Clock } from 'lucide-react';

export const UpcomingQuizFeatures: React.FC = () => {
  return (
    <section
      style={{
        marginTop: '1.75rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
      }}
      aria-label="Upcoming Motorsport Quiz Features"
    >
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--f1-red, #e10600)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.25rem',
          }}
        >
          <Sparkles size={12} />
          <span>EXPANSION ROADMAP • GRDX</span>
        </div>
        <h2
          style={{
            fontSize: '1.25rem',
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
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            maxWidth: '580px',
            margin: '0.3rem auto 0',
            lineHeight: 1.45,
          }}
        >
          We're expanding the GRDX quiz experience with more championships, new question sets, and more ways to test your motorsport knowledge.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        {/* Card 1: Upcoming Series */}
        <div
          className="race-card"
          style={{
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 'var(--radius-md, 8px)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  flexShrink: 0,
                }}
              >
                <Compass size={15} />
              </div>
              <div>
                <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Series in Pipeline
                </span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Next Championships
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.65rem 0' }}>
              Editorial question banks are in active regulatory verification for <strong style={{ color: '#fff' }}>IndyCar Series</strong>, <strong style={{ color: '#fff' }}>Supercars Championship</strong>, <strong style={{ color: '#fff' }}>WRC World Rally</strong>, <strong style={{ color: '#fff' }}>World Superbike (WSBK)</strong>, and the <strong style={{ color: '#fff' }}>Indian Racing Festival (IRF)</strong>.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.68rem',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <Clock size={11} />
            <span>VERIFICATION IN PROGRESS</span>
          </div>
        </div>

        {/* Card 2: Thematic Challenges */}
        <div
          className="race-card"
          style={{
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 'var(--radius-md, 8px)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={15} />
              </div>
              <div>
                <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Special Formats
                </span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Deep-Dive Themes
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.65rem 0' }}>
              Future releases will introduce curated deep-dive modes: <strong style={{ color: '#fff' }}>Historic Turbo & V10 Eras</strong>, <strong style={{ color: '#fff' }}>Technical & Active Aero Regulations</strong>, and <strong style={{ color: '#fff' }}>24h Race Strategy Tactics</strong>.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.68rem',
              color: '#eab308',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <Clock size={11} />
            <span>TOPIC PACKS PLANNED</span>
          </div>
        </div>

        {/* Card 3: New Badges & Trophies */}
        <div
          className="race-card"
          style={{
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 'var(--radius-md, 8px)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(185, 102, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b966ff',
                  flexShrink: 0,
                }}
              >
                <Award size={15} />
              </div>
              <div>
                <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Profile Integration
                </span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Milestone Awards
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.65rem 0' }}>
              More achievement badges, discipline masteries, and speedrun accolades will unlock as new question pools are certified by our editorial team.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.68rem',
              color: '#b966ff',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
            }}
          >
            <Clock size={11} />
            <span>MORE ACHIEVEMENTS IN ROADMAP</span>
          </div>
        </div>
      </div>

      {/* Verified Phase 1 Gate Callout */}
      <div
        style={{
          padding: '0.65rem 0.95rem',
          borderRadius: 'var(--radius-md, 8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          maxWidth: '820px',
          margin: '0 auto',
        }}
      >
        <ShieldAlert size={16} color="var(--f1-red, #e10600)" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
          <strong style={{ color: '#fff' }}>Editorial Publication Gate:</strong> Only Phase 1 Active Disciplines (Formula 1, Formula 2, Formula 3, Formula 4, Formula E, MotoGP, Endurance Racing, and GT Racing) are live and playable. Upcoming series will remain unplayable until 100% of their verified question sets are approved.
        </p>
      </div>
    </section>
  );
};

export default UpcomingQuizFeatures;

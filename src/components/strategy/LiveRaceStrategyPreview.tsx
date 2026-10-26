import React from 'react';
import { ShieldAlert, CloudRain, GitFork, Gauge, Radio, AlertCircle } from 'lucide-react';

export const LiveRaceStrategyPreview: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--surface, #11131A)',
      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
      borderRadius: '16px',
      padding: '2.5rem 2rem',
      maxWidth: '900px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Header Badge & Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center', alignItems: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(255, 85, 0, 0.12)',
          border: '1px solid rgba(255, 85, 0, 0.35)',
          color: 'var(--flame-orange, #FF5500)',
          padding: '0.3rem 0.8rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          <Radio size={14} className="pulse-dot" />
          <span>Second Phase Feature Roadmap</span>
        </div>

        <h2 style={{
          margin: 0,
          fontSize: '1.75rem',
          fontWeight: 900,
          fontFamily: "var(--font-brand, 'Orbitron', sans-serif)",
          color: '#FFFFFF',
          letterSpacing: '-0.01em'
        }}>
          Live Race Strategy (Phase 2 — Coming Soon)
        </h2>

        <p style={{
          margin: 0,
          fontSize: '0.95rem',
          color: 'var(--text-muted, #848B96)',
          maxWidth: '640px',
          lineHeight: 1.5
        }}>
          Live Race Strategy will allow strategists to make reactive pit-call decisions at critical moments during a race already in progress. The deterministic simulation engine recalculates outcomes dynamically at each inflection point.
        </p>
      </div>

      {/* Planned Mid-Race Decision Points */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: 'var(--surface-raised, #171A24)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFB000' }}>
            <ShieldAlert size={18} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
              Safety Car & VSC Windows
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
            Take advantage of discounted 12–15s pit loss deltas under neutralized track conditions or gamble on staying out to maintain track position.
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--surface-raised, #171A24)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00E5FF' }}>
            <CloudRain size={18} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
              Sudden Rain & Crossover
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
            Identify the precise lap where Intermediate tires surpass degrading slicks as rainfall intensity transitions track moisture levels.
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--surface-raised, #171A24)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--flame-orange, #FF5500)' }}>
            <GitFork size={18} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
              Rival Undercut & Overcut
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
            React immediately when your closest rival enters the pit lane. Pull the trigger on an out-lap sprint or extend in clean air.
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--surface-raised, #171A24)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00E676' }}>
            <Gauge size={18} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
              Degradation Cliff Defense
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
            Balance tire nursing against lap delta losses to hold track position in dirty air without falling off the terminal degradation cliff.
          </p>
        </div>
      </div>

      {/* Engineering Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '8px',
        padding: '0.85rem 1.25rem'
      }}>
        <AlertCircle size={18} style={{ color: 'var(--text-muted, #848B96)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
          <strong>Design Note:</strong> Phase 1 focuses exclusively on establishing a reliable, verified, and competitive Pre-Race Strategy MVP. Live Race Strategy will be rolled out in an upcoming release utilizing the shared deterministic simulation engine.
        </span>
      </div>
    </div>
  );
};

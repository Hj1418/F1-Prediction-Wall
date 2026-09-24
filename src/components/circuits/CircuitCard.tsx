import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { CircuitEntity } from '../../types/circuit';
import { CircuitVector } from './CircuitVector';

export interface CircuitCardProps {
  circuit: CircuitEntity;
  activeLayoutId?: string;
  className?: string;
}

export const CircuitCard: React.FC<CircuitCardProps> = ({
  circuit,
  activeLayoutId,
  className = '',
}) => {
  const primaryLayout =
    circuit.layouts.find(l => l.layoutId === activeLayoutId) ||
    circuit.layouts.find(l => l.isPrimary) ||
    circuit.layouts[0];

  const quickFact = circuit.didYouKnow?.[0];

  return (
    <article
      className={`circuit-card race-card-interactive ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface, #131722)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '14px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Discipline & Location Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {circuit.championships.slice(0, 3).map(ch => (
            <span
              key={ch.championshipId}
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: ch.badgeColor,
                backgroundColor: `${ch.badgeColor}18`,
                border: `1px solid ${ch.badgeColor}35`,
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                letterSpacing: '0.04em',
              }}
            >
              {ch.badge}
            </span>
          ))}
          {circuit.layouts.length > 1 && (
            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #94a3b8)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '4px',
                padding: '0.15rem 0.4rem',
              }}
            >
              {circuit.layouts.length} LAYOUTS
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--text-secondary, #cbd5e1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span>{circuit.location.flag}</span>
          <span>{circuit.location.country}</span>
        </span>
      </div>

      {/* Primary Track Visualization */}
      <Link
        to={`/circuits/${circuit.circuitId}`}
        aria-label={`View ${circuit.name} details`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <CircuitVector
          mapSvg={primaryLayout?.mapSvg || `${circuit.circuitId}.svg`}
          name={circuit.name}
          direction={primaryLayout?.direction}
          lengthKm={primaryLayout?.lengthKm}
          turns={primaryLayout?.turns}
          variant="card"
        />
      </Link>

      {/* Title & Location Header */}
      <div>
        <h3
          style={{
            fontSize: '1.12rem',
            fontWeight: 800,
            margin: '0 0 0.2rem 0',
            color: 'var(--text-primary, #ffffff)',
            letterSpacing: '-0.015em',
            lineHeight: 1.25,
          }}
        >
          <Link
            to={`/circuits/${circuit.circuitId}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {circuit.name}
          </Link>
        </h3>
        <div
          style={{
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--text-secondary, #cbd5e1)',
          }}
        >
          {circuit.location.city}
        </div>
      </div>

      {/* Verified Compact Metric Chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.4rem',
          backgroundColor: 'var(--bg-base, #0d0f17)',
          padding: '0.5rem 0.6rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          textAlign: 'center',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Length</div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff' }}>{primaryLayout?.lengthKm}k</div>
        </div>
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Turns</div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--f1-red, #e10600)' }}>{primaryLayout?.turns}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Type</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {primaryLayout?.type}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Dir</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: primaryLayout?.direction === 'Anti-Clockwise' ? '#00e676' : '#cbd5e1' }}>
            {primaryLayout?.direction === 'Anti-Clockwise' ? 'Anti-CW' : 'CW'}
          </div>
        </div>
      </div>

      {/* Short Visual Summary */}
      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary, #cbd5e1)',
          margin: 0,
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {circuit.shortDescription}
      </p>

      {/* Small Quick Fact / Did You Know Callout */}
      {quickFact && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.45rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            padding: '0.4rem 0.6rem',
            fontSize: '0.74rem',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.35,
          }}
        >
          <Sparkles size={13} style={{ color: 'var(--f1-red, #e10600)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <strong style={{ color: 'var(--text-primary, #ffffff)', fontWeight: 700 }}>{quickFact.title}: </strong>
            <span>{quickFact.fact}</span>
          </div>
        </div>
      )}

      {/* Bottom CTA Action Link */}
      <div style={{ marginTop: 'auto', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))' }}>
        <Link
          to={`/circuits/${circuit.circuitId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.78rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--f1-red, #e10600)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Explore Circuit</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
};

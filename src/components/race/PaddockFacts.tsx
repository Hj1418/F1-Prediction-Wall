import React, { useState } from 'react';
import { CircuitFact } from '../../types';
import { ChevronLeft, ChevronRight, Sparkles, Compass, Award, History, Zap, Lightbulb } from 'lucide-react';

interface PaddockFactsProps {
  facts?: CircuitFact[];
  circuitName?: string;
  className?: string;
}

const DEFAULT_FACTS: CircuitFact[] = [
  {
    category: 'SPEED',
    title: 'The Temple of Speed',
    description: 'Monza is the fastest circuit in Formula 1 history. Cars spend more than 75% of the lap at full throttle through historic parkland straights.',
  },
  {
    category: 'HISTORY',
    title: 'A Formula 1 Classic',
    description: 'Present on the inaugural 1950 World Championship calendar, Monza has hosted more Italian Grands Prix than any other venue in the sport.',
  },
  {
    category: 'CRAZY FACT',
    title: 'Historic High Banking',
    description: 'The ancient high-speed banked oval built in the 1950s still stands adjacent to the modern track and was used in Grand Prix racing until 1961.',
  },
];

function getCategoryBadge(cat: string) {
  switch (cat) {
    case 'SPEED':
      return { bg: 'rgba(225, 6, 0, 0.15)', text: 'var(--f1-red)', border: 'rgba(225, 6, 0, 0.35)', icon: <Zap size={13} /> };
    case 'HISTORY':
      return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: 'rgba(234, 179, 8, 0.35)', icon: <History size={13} /> };
    case 'RECORD':
      return { bg: 'rgba(0, 230, 118, 0.15)', text: 'var(--telemetry-green)', border: 'rgba(0, 230, 118, 0.35)', icon: <Award size={13} /> };
    case 'CRAZY FACT':
      return { bg: 'rgba(157, 78, 221, 0.15)', text: 'var(--telemetry-purple)', border: 'rgba(157, 78, 221, 0.35)', icon: <Sparkles size={13} /> };
    default:
      return { bg: 'rgba(0, 210, 190, 0.15)', text: 'var(--telemetry-cyan)', border: 'rgba(0, 210, 190, 0.35)', icon: <Lightbulb size={13} /> };
  }
}

export const PaddockFacts: React.FC<PaddockFactsProps> = ({
  facts = DEFAULT_FACTS,
  circuitName = 'Circuit',
  className = '',
}) => {
  const [index, setIndex] = useState(0);

  if (!facts || facts.length === 0) return null;

  const activeFact = facts[index] || facts[0];
  const total = facts.length;
  const badge = getCategoryBadge(activeFact.category);
  const counterStr = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  const handlePrev = () => setIndex(prev => (prev === 0 ? total - 1 : prev - 1));
  const handleNext = () => setIndex(prev => (prev === total - 1 ? 0 : prev + 1));

  return (
    <div
      className={`race-card ${className}`}
      style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-surface-elevated) 0%, var(--bg-surface-card) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--f1-red)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            DID YOU KNOW?
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.15rem' }}>
            Paddock Fact
          </h3>
        </div>

        {/* Counter and Previous / Next Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            TRACK FACT {counterStr}
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={handlePrev}
              aria-label="Previous Fact"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Fact"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Fact Card */}
      <div
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              background: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {badge.icon}
            {activeFact.category}
          </span>
        </div>

        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '0.4rem' }}>
          {activeFact.title}
        </h4>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {activeFact.description}
        </p>
      </div>

      {/* Indicator dots */}
      {total > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}>
          {facts.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to fact ${i + 1}`}
              style={{
                width: i === index ? '18px' : '6px',
                height: '6px',
                borderRadius: 'var(--radius-full)',
                background: i === index ? 'var(--f1-red)' : 'var(--border-medium)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

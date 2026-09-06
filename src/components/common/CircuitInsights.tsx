import React, { useState } from 'react';
import { CircuitInsight } from '../../types';
import { ChevronLeft, ChevronRight, Lightbulb, Compass, Award, History, Cpu, Zap } from 'lucide-react';

interface CircuitInsightsProps {
  insights?: CircuitInsight[];
  circuitName?: string;
  className?: string;
}

const DEFAULT_INSIGHTS: CircuitInsight[] = [
  {
    category: 'TRACK CHARACTER',
    title: 'PRECISION RACING LAYOUT',
    description: 'A benchmark Formula 1 venue demanding aerodynamic balance, engine efficiency, and extreme driver commitment through every sector.',
  },
  {
    category: 'HISTORY',
    title: 'WORLD CHAMPIONSHIP HERITAGE',
    description: 'Renowned for producing historic championship deciders and memorable wheel-to-wheel battles throughout decades of Grand Prix racing.',
  },
];

function getCategoryColor(category: string): { bg: string; text: string; border: string } {
  switch (category) {
    case 'TRACK CHARACTER':
      return { bg: 'rgba(0, 229, 255, 0.12)', text: 'var(--telemetry-cyan)', border: 'rgba(0, 229, 255, 0.3)' };
    case 'HISTORY':
      return { bg: 'rgba(234, 179, 8, 0.12)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' };
    case 'TECHNICAL':
      return { bg: 'rgba(157, 78, 221, 0.12)', text: 'var(--telemetry-purple)', border: 'rgba(157, 78, 221, 0.3)' };
    case 'SPEED':
      return { bg: 'rgba(225, 6, 0, 0.12)', text: 'var(--f1-red)', border: 'rgba(225, 6, 0, 0.3)' };
    case 'RECORD':
      return { bg: 'rgba(0, 230, 118, 0.12)', text: 'var(--telemetry-green)', border: 'rgba(0, 230, 118, 0.3)' };
    default:
      return { bg: 'rgba(255, 255, 255, 0.08)', text: 'var(--text-secondary)', border: 'var(--border-subtle)' };
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'TRACK CHARACTER':
      return <Compass size={13} />;
    case 'HISTORY':
      return <History size={13} />;
    case 'TECHNICAL':
      return <Cpu size={13} />;
    case 'SPEED':
      return <Zap size={13} />;
    case 'RECORD':
      return <Award size={13} />;
    default:
      return <Lightbulb size={13} />;
  }
}

export const CircuitInsights: React.FC<CircuitInsightsProps> = ({
  insights = DEFAULT_INSIGHTS,
  circuitName = 'Circuit',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!insights || insights.length === 0) return null;

  const activeInsight = insights[currentIndex] || insights[0];
  const catStyle = getCategoryColor(activeInsight.category);
  const total = insights.length;
  const counterStr = `${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className={`race-card ${className}`}
      style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-surface-elevated) 0%, var(--bg-surface-card) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
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
            TRACK INTELLIGENCE
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.15rem' }}>
            Circuit Insights
          </h3>
        </div>

        {/* Counter and Carousel controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            {counterStr}
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={handlePrev}
              aria-label="Previous Insight"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Insight"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Insight Card */}
      <div
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          minHeight: '130px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              background: catStyle.bg,
              color: catStyle.text,
              border: `1px solid ${catStyle.border}`,
              padding: '0.15rem 0.5rem',
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
            {getCategoryIcon(activeInsight.category)}
            {activeInsight.category}
          </span>
        </div>

        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '0.4rem' }}>
          {activeInsight.title}
        </h4>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {activeInsight.description}
        </p>
      </div>

      {/* Navigation indicator dots */}
      {total > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}>
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to insight ${i + 1}`}
              style={{
                width: i === currentIndex ? '20px' : '6px',
                height: '6px',
                borderRadius: 'var(--radius-full)',
                background: i === currentIndex ? 'var(--f1-red)' : 'var(--border-medium)',
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

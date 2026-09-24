import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Zap, ChevronRight, Flame, CheckCircle2 } from 'lucide-react';

export interface PredictionSpeedometerProps {
  /** Current user prediction points */
  points: number;
  /** Production prediction points breakdown */
  productionPoints?: number;
  /** Test Grand Prix points breakdown */
  testPoints?: number;
  /** Championship / season rank (optional) */
  seasonRank?: number;
  /** Previous rank to show delta */
  previousRank?: number;
  /** Recent points gained in latest scored round (optional) */
  recentPoints?: number;
  /** Recent round title (optional) */
  recentRoundTitle?: string;
  /** Championship name or context (default: 'Motorsport') */
  championshipName?: string;
  /** Visual variant: 'default' | 'compact' | 'hero' */
  variant?: 'default' | 'compact' | 'hero';
  /** Action link or button when clicking speedometer */
  actionLink?: string;
  /** Action label */
  actionLabel?: string;
  /** Custom class name */
  className?: string;
}

export interface MilestoneInfo {
  prevMilestone: number;
  nextMilestone: number;
  pointsToGo: number;
  progressRatio: number;
  isMilestoneHit: boolean;
}

/**
 * Calculates dynamic milestones without hardcoded ceilings.
 * Points progress from previous milestone to next milestone (e.g. 186 -> 200, 200 -> 250, 250 -> 300).
 */
export function calculateMilestones(pts: number): MilestoneInfo {
  const points = Math.max(0, Math.round(pts || 0));

  let step = 25;
  if (points >= 1000) {
    step = 250;
  } else if (points >= 300) {
    step = 100;
  } else if (points >= 100) {
    step = 50;
  }

  // Next milestone is the next multiple of step strictly greater than points
  // If points is exactly on a milestone, next milestone is the subsequent step
  const nextMilestone = Math.ceil((points + 1) / step) * step;
  const prevMilestone = Math.max(0, nextMilestone - step);
  const pointsToGo = Math.max(0, nextMilestone - points);
  const span = nextMilestone - prevMilestone;
  const progressRatio = span > 0 ? Math.min(Math.max((points - prevMilestone) / span, 0), 1) : 0;
  const isMilestoneHit = points > 0 && points % step === 0;

  return {
    prevMilestone,
    nextMilestone,
    pointsToGo,
    progressRatio,
    isMilestoneHit,
  };
}

export const PredictionSpeedometer: React.FC<PredictionSpeedometerProps> = ({
  points = 0,
  productionPoints,
  testPoints,
  seasonRank,
  previousRank,
  recentPoints,
  recentRoundTitle,
  championshipName = 'Motorsport',
  variant = 'default',
  actionLink = '/predictions',
  actionLabel = 'Make Predictions',
  className = '',
}) => {
  const milestone = useMemo(() => calculateMilestones(points), [points]);
  const [displayPoints, setDisplayPoints] = useState(points);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  // Subtle count-up animation for numbers (350ms duration)
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayPoints(points);
      return;
    }

    const startVal = displayPoints;
    const endVal = points;
    if (startVal === endVal) return;

    const duration = 350; // ms
    const startTime = performance.now();

    let animationFrameId: number;
    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      setDisplayPoints(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [points, prefersReducedMotion]);

  // Gauge angles (-100 deg to +100 deg, 200 degree total arc)
  const START_ANGLE = -100;
  const END_ANGLE = 100;
  const TOTAL_ARC = END_ANGLE - START_ANGLE;
  const needleAngle = START_ANGLE + milestone.progressRatio * TOTAL_ARC;

  // Geometry for SVG arc (center 110, 100, radius 76)
  const cx = 110;
  const cy = 100;
  const r = 76;

  // Generate tick marks (every 20 deg from -100 to 100)
  const ticks = useMemo(() => {
    const tickList = [];
    const count = 11;
    for (let i = 0; i < count; i++) {
      const angle = START_ANGLE + (i / (count - 1)) * TOTAL_ARC;
      const rad = ((angle - 90) * Math.PI) / 180;
      const isRedline = i >= 8;
      const isMajor = i === 0 || i === 5 || i === 10;
      const tickLen = isMajor ? 9 : 5;
      const x1 = cx + (r - 2) * Math.cos(rad);
      const y1 = cy + (r - 2) * Math.sin(rad);
      const x2 = cx + (r - 2 - tickLen) * Math.cos(rad);
      const y2 = cy + (r - 2 - tickLen) * Math.sin(rad);
      tickList.push({ id: i, x1, y1, x2, y2, isRedline, isMajor });
    }
    return tickList;
  }, []);

  // SVG arc calculation helper
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const trackPath = describeArc(cx, cy, r, START_ANGLE, END_ANGLE);
  const activeArcEnd = START_ANGLE + Math.max(0.5, milestone.progressRatio * TOTAL_ARC);
  const activePath = describeArc(cx, cy, r, START_ANGLE, activeArcEnd);

  // Rank Delta
  const rankDelta = previousRank && seasonRank ? previousRank - seasonRank : 0;

  return (
    <div
      className={`speedometer-card ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(18, 23, 34, 0.95) 0%, rgba(10, 13, 20, 0.98) 100%)',
        border: milestone.isMilestoneHit ? '1px solid rgba(0, 230, 118, 0.45)' : '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: variant === 'compact' ? '1.25rem 1rem' : '1.75rem 1.5rem',
        boxShadow: milestone.isMilestoneHit
          ? '0 0 25px rgba(0, 230, 118, 0.15), 0 4px 20px rgba(0, 0, 0, 0.5)'
          : 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Background motorsport grid hint */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle at top right, rgba(225, 6, 0, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Zap size={14} style={{ color: 'var(--f1-red)' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'var(--text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            PREDICTION POINTS • {championshipName}
          </span>
        </div>

        {seasonRank ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#eab308',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            <Trophy size={12} />
            <span>SEASON RANK #{seasonRank}</span>
            {rankDelta !== 0 && (
              <span
                style={{
                  color: rankDelta > 0 ? 'var(--telemetry-green)' : 'var(--f1-red)',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                }}
              >
                {rankDelta > 0 ? `▲${rankDelta}` : `▼${Math.abs(rankDelta)}`}
              </span>
            )}
          </div>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Ranked on 1st pick
          </span>
        )}
      </div>

      {/* Speedometer Gauge & Core Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: variant === 'compact' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        {/* Left: SVG Gauge Display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg
            viewBox="0 0 220 145"
            style={{
              width: '100%',
              maxWidth: '220px',
              height: 'auto',
              overflow: 'visible',
            }}
            aria-label={`Prediction Speedometer showing ${displayPoints} points`}
          >
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--telemetry-cyan)" />
                <stop offset="65%" stopColor="var(--telemetry-green)" />
                <stop offset="100%" stopColor="var(--f1-red)" />
              </linearGradient>
              <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Gauge Background Track */}
            <path
              d={trackPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Gauge Active Progress Track */}
            {milestone.progressRatio > 0 && (
              <path
                d={activePath}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                style={{
                  transition: prefersReducedMotion ? 'none' : 'stroke 0.4s ease',
                  filter: 'drop-shadow(0 0 6px rgba(0, 230, 118, 0.4))',
                }}
              />
            )}

            {/* Ticks */}
            {ticks.map(t => (
              <line
                key={t.id}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isRedline ? 'rgba(225, 6, 0, 0.6)' : 'rgba(255, 255, 255, 0.25)'}
                strokeWidth={t.isMajor ? '2' : '1'}
              />
            ))}

            {/* Dial Labels: prevMilestone and nextMilestone */}
            <text
              x="26"
              y="135"
              fill="var(--text-muted)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              textAnchor="middle"
            >
              {milestone.prevMilestone}
            </text>
            <text
              x="194"
              y="135"
              fill={milestone.isMilestoneHit ? 'var(--telemetry-green)' : 'var(--text-muted)'}
              fontSize="10"
              fontFamily="var(--font-mono)"
              fontWeight="800"
              textAnchor="middle"
            >
              {milestone.nextMilestone}
            </text>

            {/* Animated Needle */}
            <g
              transform={`rotate(${needleAngle} ${cx} ${cy})`}
              style={{
                transition: prefersReducedMotion
                  ? 'none'
                  : 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: `${cx}px ${cy}px`,
              }}
            >
              {/* Needle Body */}
              <polygon
                points={`${cx - 2.5},${cy} ${cx},${cy - r + 8} ${cx + 2.5},${cy}`}
                fill="var(--f1-red)"
                filter="url(#needleGlow)"
              />
              <circle cx={cx} cy={cy - r + 8} r="2" fill="#ffffff" />
            </g>

            {/* Center Pivot Hub */}
            <circle cx={cx} cy={cy} r="8" fill="#121722" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="4" fill="var(--f1-red)" />
          </svg>

          {/* Central Point Counter */}
          <div style={{ textAlign: 'center', marginTop: '-0.25rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '2.5rem',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.15)',
              }}
            >
              {displayPoints}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginTop: '0.2rem',
              }}
            >
              PTS
            </div>

            {/* Production vs Test Runs Breakdown */}
            {testPoints !== undefined && testPoints > 0 && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '0.35rem' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Production
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                    {productionPoints ?? (points - testPoints)} <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>pts</span>
                  </div>
                </div>
                <div style={{ paddingLeft: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Test Runs
                    </span>
                    <span style={{ fontSize: '0.55rem', padding: '0.05rem 0.25rem', borderRadius: '3px', background: 'rgba(0, 210, 255, 0.2)', color: 'var(--telemetry-cyan)', fontWeight: 900 }}>
                      TEST
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                    {testPoints} <span style={{ fontSize: '0.62rem', color: 'rgba(0, 210, 255, 0.7)' }}>pts</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Milestone Breakdown & Recent Round Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Milestone Progress Bar Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                Next Milestone
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                }}
              >
                {milestone.nextMilestone} PTS
              </span>
            </div>

            {/* Progress Track */}
            <div
              style={{
                height: '7px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${Math.round(milestone.progressRatio * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--telemetry-cyan), var(--telemetry-green))',
                  borderRadius: '4px',
                  transition: prefersReducedMotion ? 'none' : 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '0.4rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ color: 'var(--telemetry-cyan)', fontWeight: 800 }}>
                {milestone.pointsToGo === 0
                  ? 'Milestone Reached! 🏁'
                  : `${milestone.pointsToGo} pts to go`}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {Math.round(milestone.progressRatio * 100)}% of target
              </span>
            </div>
          </div>

          {/* Recent Scored Points Pill (if available) */}
          {recentPoints !== undefined && recentPoints > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(0, 230, 118, 0.08)',
                border: '1px solid rgba(0, 230, 118, 0.25)',
                fontSize: '0.76rem',
              }}
            >
              <Flame size={14} style={{ color: 'var(--telemetry-green)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--telemetry-green)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  +{recentPoints} PTS
                </span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {recentRoundTitle ? `in ${recentRoundTitle}` : 'in latest scored round'}
                </span>
              </div>
            </div>
          )}

          {/* Milestone Hit Indication */}
          {milestone.isMilestoneHit && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(0, 230, 118, 0.15)',
                border: '1px solid rgba(0, 230, 118, 0.35)',
                color: 'var(--telemetry-green)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              <CheckCircle2 size={13} />
              <span>MILESTONE ACHIEVED • LEVEL ADVANCED</span>
            </div>
          )}

          {/* Action Link */}
          {actionLink && (
            <a
              href={`#${actionLink}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--f1-red)';
                e.currentTarget.style.borderColor = 'var(--f1-red)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
            >
              <span>{actionLabel}</span>
              <ChevronRight size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionSpeedometer;

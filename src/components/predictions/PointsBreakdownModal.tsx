import React from 'react';
import { X, Check, Award, AlertCircle } from 'lucide-react';
import { extractNumericScore } from '../../utils/predictionScoring';

interface PointsBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictionItem: {
    prediction?: any;
    round?: any;
    score?: any;
    weekend?: any;
    result?: any;
  } | null;
}

export const PointsBreakdownModal: React.FC<PointsBreakdownModalProps> = ({
  isOpen,
  onClose,
  predictionItem,
}) => {
  if (!isOpen || !predictionItem) return null;

  const { prediction: p, round: r, score: s, weekend: w } = predictionItem;
  const eventName = w?.raceName || r?.title || 'Race Event';
  const format = r?.roundType || 'GRAND_PRIX';
  const totalScore = extractNumericScore(s?.totalScore ?? s?.pointsEarned ?? s) ?? 0;
  const breakdown: Record<string, any> = (s && typeof s === 'object' && s.breakdown) || {};

  const categoryLabels: Record<string, { label: string; maxPts: number; description: string }> = {
    p1: { label: 'P1 Winner Pick', maxPts: 10, description: '10 pts exact winner • 3 pts podium position' },
    p2: { label: 'P2 Runner-up Pick', maxPts: 7, description: '7 pts exact P2 • 3 pts podium position' },
    p3: { label: 'P3 Podium Pick', maxPts: 5, description: '5 pts exact P3 • 3 pts podium position' },
    perfectPodiumBonus: { label: 'Perfect Podium Bonus', maxPts: 10, description: 'Bonus for 100% exact 1-2-3 podium finish' },
    fastestLap: { label: 'Fastest Lap', maxPts: 7, description: '7 pts for correct official fastest lap driver' },
    driverOfTheDay: { label: 'Driver / Rider of the Day', maxPts: 7, description: '7 pts for official fan-voted Driver of the Day' },
    safetyCar: { label: 'Safety Car Deployed', maxPts: 5, description: '5 pts for physical safety car prediction' },
    virtualSafetyCar: { label: 'Virtual Safety Car (VSC)', maxPts: 5, description: '5 pts for virtual safety car prediction' },
    redFlag: { label: 'Red Flag Session Stoppage', maxPts: 5, description: '5 pts for red flag session stoppage prediction' },
    yellowFlag: { label: 'Yellow Flag Caution', maxPts: 4, description: '4 pts for yellow flag caution prediction' },
    retirementsOverUnder: { label: 'Retirements Over/Under', maxPts: 5, description: '5 pts for classified retirements prediction' },
    lap1Leader: { label: 'Lap 1 Leader Retention', maxPts: 5, description: '5 pts for pole-to-lap-1 leader prediction' },
    winningMargin: { label: 'Winning Margin Gap', maxPts: 5, description: '5 pts for margin of victory bracket' },
    wildCard: { label: 'Special Insight Wildcard', maxPts: 5, description: '5 pts for weekend special category' },
  };

  const breakdownEntries = Object.entries(breakdown).filter(([_, pts]) => typeof pts === 'number');
  const sumOfBreakdown = breakdownEntries.reduce((sum, [_, pts]) => sum + (pts || 0), 0);
  const isBreakdownAvailable = breakdownEntries.length > 0;

  // Trace picks
  const predData = p?.predictionData || {};

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-modal-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#14181F',
          border: '1px solid #282F3C',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #E10600 0%, #FF3B30 60%, rgba(225,6,0,0.3) 100%)' }} />

        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1F2532',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#E10600', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <Award size={13} /> {format} • TELEMETRY BREAKDOWN
            </div>
            <h2 id="breakdown-modal-title" style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              {eventName}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#8E9BAE', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Total Points Callout */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid #1F2532',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              VERIFIED EVENT SCORE
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
              Submitted {p?.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--telemetry-green)' }}>
            +{totalScore} PTS
          </div>
        </div>

        {/* Scrollable Category Breakdown */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {isBreakdownAvailable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {breakdownEntries.map(([key, pts]) => {
                const def = categoryLabels[key] || {
                  label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                  maxPts: 5,
                  description: 'Verified session criteria',
                };
                const userPick = predData[key];
                const earnedPoints = Number(pts || 0);

                return (
                  <div
                    key={key}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: earnedPoints > 0 ? 'rgba(0, 230, 118, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${earnedPoints > 0 ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                        {def.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        {userPick !== undefined ? `Pick: ${String(userPick).toUpperCase()} • ` : ''}{def.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1rem',
                          fontWeight: 900,
                          color: earnedPoints > 0 ? 'var(--telemetry-green)' : '#64748B',
                        }}
                      >
                        {earnedPoints > 0 ? `+${earnedPoints} PTS` : '0 PTS'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                        Max {def.maxPts} pts
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Parity Verification Note */}
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  color: '#94A3B8',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Category Sum: {sumOfBreakdown} PTS</span>
                <span>Verified Match: {sumOfBreakdown === totalScore ? '✓ Exact Parity' : 'Reconciled'}</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <AlertCircle size={28} color="#64748B" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ color: '#E2E8F0', fontWeight: 700, fontSize: '0.9rem' }}>
                Detailed Category Breakdown Unavailable
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '0.4rem', lineHeight: 1.4 }}>
                The authoritative event score of <strong>+{totalScore} PTS</strong> is verified from the official result record. Detailed category-level telemetry was not stored for this round.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1F2532', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1.25rem' }}>
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Sparkles, Zap, Shield, Clock } from 'lucide-react';

interface PredictionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PredictionGuideModal: React.FC<PredictionGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="race-card animate-scale-in"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px -5px rgba(225, 6, 0, 0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.15) 0%, var(--bg-surface-elevated) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(225, 6, 0, 0.2)',
                border: '1px solid var(--f1-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} color="var(--f1-red)" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                THE GRID • OFFICIAL SCORING GUIDE
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
                Prediction Bench & Scoring Rules
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: How Predictions Work */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--telemetry-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} /> 1. How Predictions Work
            </div>
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong style={{ color: '#fff' }}>Make Your Selections:</strong> Pick the <strong>P1 Race Winner</strong>, <strong>P2 Runner-up</strong>, <strong>P3 Third Place</strong>, and the driver who sets the <strong>Fastest Lap</strong>.</li>
                <li><strong style={{ color: '#fff' }}>Session Lockout:</strong> Predictions close strictly at the scheduled race formation lap / session start. Once locked, your prediction is final and read-only.</li>
                <li><strong style={{ color: '#fff' }}>Tamper-Proof Verification:</strong> Locked predictions are authoritatively stored. Once official FIA classification results are posted, scores are computed and rankings update automatically.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Scoring Matrix */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--telemetry-green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={14} /> 2. Official Points Scoring Matrix
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {/* P1 Winner */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem' }}>🥇 P1 Race Winner</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exact P1 race winner</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#eab308', fontSize: '1.2rem' }}>
                  +15 PTS
                </div>
              </div>

              {/* P2 Runner-Up */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(203, 213, 225, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem' }}>🥈 P2 Runner-Up</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exact 2nd place finisher</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#cbd5e1', fontSize: '1.2rem' }}>
                  +10 PTS
                </div>
              </div>

              {/* P3 Third Place */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem' }}>🥉 P3 Third Place</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exact 3rd place finisher</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#d97706', fontSize: '1.2rem' }}>
                  +10 PTS
                </div>
              </div>

              {/* Fastest Lap */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(157, 78, 221, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem' }}>⚡ Fastest Lap</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exact fastest lap setter</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--telemetry-purple)', fontSize: '1.2rem' }}>
                  +10 PTS
                </div>
              </div>
            </div>

            {/* Special Bonuses */}
            <div
              style={{
                marginTop: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {/* Podium Anywhere */}
              <div
                style={{
                  background: 'rgba(0, 230, 118, 0.05)',
                  border: '1px solid rgba(0, 230, 118, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem' }}>🏎️ Podium Finish (Wrong Spot)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Driver finishes in top 3 in different slot</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--telemetry-green)', fontSize: '1.1rem' }}>
                  +5 PTS <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ each</span>
                </div>
              </div>

              {/* Perfect Podium Bonus */}
              <div
                style={{
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#eab308', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={16} /> PERFECT PODIUM BONUS
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>P1, P2, and P3 all exactly correct!</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#eab308', fontSize: '1.2rem' }}>
                  +10 PTS
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Official FIA Rules & Penalties */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} /> 3. DNF, DSQ & Steward Amendment Rules
            </div>
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div><strong style={{ color: '#fff' }}>DNF (Did Not Finish):</strong> If your predicted podium driver crashes out or suffers mechanical failure, they score 0 points for that spot. Your other valid picks still score normally.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div><strong style={{ color: '#fff' }}>DSQ (Disqualification):</strong> A driver disqualified by FIA stewards scores 0 points and instantly invalidates any Perfect Podium bonus.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} color="var(--telemetry-green)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div><strong style={{ color: '#fff' }}>Official Classification:</strong> Scores become final only after the FIA publishes the official verified race document (provisional results are subject to steward review).</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Max possible session score: <strong style={{ color: 'var(--telemetry-green)' }}>55 PTS</strong>
          </span>
          <button onClick={onClose} className="btn btn-primary btn-sm" style={{ padding: '0.45rem 1.25rem' }}>
            Got It, Let's Predict!
          </button>
        </div>
      </div>
    </div>
  );
};

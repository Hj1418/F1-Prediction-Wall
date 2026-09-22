import React from 'react';
import { Award, CheckCircle2, AlertTriangle, Sparkles, Zap, Shield, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface PredictionGuideCardProps {
  isOpen?: boolean;
  onToggle?: () => void;
  collapsible?: boolean;
}

export const PredictionGuideCard: React.FC<PredictionGuideCardProps> = ({
  isOpen = true,
  onToggle,
  collapsible = true,
}) => {
  return (
    <div
      id="scoring-guide"
      className="race-card animate-fade-in"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.06) 0%, var(--bg-surface-card) 100%)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '1.1rem 1.5rem',
          borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
          background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.14) 0%, var(--bg-surface-elevated) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          cursor: collapsible ? 'pointer' : 'default',
        }}
        onClick={collapsible && onToggle ? onToggle : undefined}
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
              flexShrink: 0,
            }}
          >
            <Award size={20} color="var(--f1-red)" />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              THE GRID • OFFICIAL SCORING GUIDE
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
              Prediction Bench & Scoring Rules
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(0, 230, 118, 0.12)',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              color: 'var(--telemetry-green)',
            }}
          >
            MAX 95 PTS / SESSION
          </span>

          {collapsible && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggle?.();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              <span>{isOpen ? 'Hide Rules' : 'Show Rules'}</span>
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Guide Content Body */}
      {isOpen && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong style={{ color: '#fff' }}>Make Your Selections:</strong> Pick the <strong>P1 Race Winner</strong>, <strong>P2 Runner-up</strong>, <strong>P3 Third Place</strong>, and the <strong>Fastest Lap</strong> driver, plus race disruption wildcards (<strong>Safety Car</strong>, <strong>Virtual Safety Car</strong>, <strong>Red Flag</strong>, <strong>Yellow Flag</strong>).</li>
                <li><strong style={{ color: '#fff' }}>Session Lockout:</strong> Predictions close strictly at scheduled race formation lap / session start. Once locked, picks are final and read-only.</li>
                <li><strong style={{ color: '#fff' }}>Tamper-Proof Verification:</strong> Locked predictions are authoritatively stored. Once official FIA classification results are posted, scores are computed and rankings update automatically.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Scoring Matrix */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--telemetry-green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={14} /> 2. Official Points Scoring Matrix
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
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
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>🥇 P1 Race Winner</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exact P1 race winner</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#eab308', fontSize: '1.15rem' }}>
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
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>🥈 P2 Runner-Up</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exact 2nd place finisher</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#cbd5e1', fontSize: '1.15rem' }}>
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
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>🥉 P3 Third Place</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exact 3rd place finisher</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#d97706', fontSize: '1.15rem' }}>
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
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>⚡ Fastest Lap</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exact fastest lap setter</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--telemetry-purple)', fontSize: '1.15rem' }}>
                  +10 PTS
                </div>
              </div>

              {/* Safety Car */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(255, 204, 0, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>🟨 Safety Car Deployed</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Full Bernd Mayländer SC deployed</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#ffcc00', fontSize: '1.15rem' }}>
                  +10 PTS
                </div>
              </div>

              {/* Virtual Safety Car */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>🟪 Virtual Safety Car</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>VSC delta restriction period</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#ff9800', fontSize: '1.15rem' }}>
                  +10 PTS
                </div>
              </div>

              {/* Red Flag */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>🚩 Red Flag Stoppage</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Session suspended / red flagged</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#ff3b30', fontSize: '1.15rem' }}>
                  +10 PTS
                </div>
              </div>

              {/* Yellow Flag */}
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
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>⚠️ Yellow Flag Caution</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sector or full course yellow flag</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#eab308', fontSize: '1.15rem' }}>
                  +10 PTS
                </div>
              </div>
            </div>

            {/* Special Bonuses */}
            <div
              style={{
                marginTop: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem' }}>🏎️ Podium Finish (Wrong Spot)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Driver finishes in top 3 in different slot</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--telemetry-green)', fontSize: '1.1rem' }}>
                  +5 PTS <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ each</span>
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
                  <div style={{ fontWeight: 800, color: '#eab308', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={15} /> PERFECT PODIUM BONUS
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>P1, P2, and P3 all exactly correct!</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#eab308', fontSize: '1.15rem' }}>
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
                fontSize: '0.84rem',
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
      )}
    </div>
  );
};

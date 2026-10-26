import React from 'react';
import { StrategyRaceState, StrategySimulationParameters, TireCompound } from '../../types/strategy';
import { Disc, AlertCircle, Timer, Shield } from 'lucide-react';

interface TireStatusPanelProps {
  state: StrategyRaceState;
  simulationParams?: StrategySimulationParameters;
}

const COMPOUND_CONFIG: Record<TireCompound, { name: string; color: string; border: string; bg: string }> = {
  soft: {
    name: 'Soft (C3/C4)',
    color: '#FF3025',
    border: 'rgba(255, 48, 37, 0.5)',
    bg: 'rgba(255, 48, 37, 0.1)'
  },
  medium: {
    name: 'Medium (C2/C3)',
    color: '#FFB000',
    border: 'rgba(255, 176, 0, 0.5)',
    bg: 'rgba(255, 176, 0, 0.1)'
  },
  hard: {
    name: 'Hard (C1/C2)',
    color: '#F8FAFC',
    border: 'rgba(248, 250, 252, 0.4)',
    bg: 'rgba(248, 250, 252, 0.08)'
  },
  intermediate: {
    name: 'Intermediate',
    color: '#10B981',
    border: 'rgba(16, 185, 129, 0.5)',
    bg: 'rgba(16, 185, 129, 0.1)'
  },
  wet: {
    name: 'Full Wet',
    color: '#3B82F6',
    border: 'rgba(59, 130, 246, 0.5)',
    bg: 'rgba(59, 130, 246, 0.1)'
  }
};

export const TireStatusPanel: React.FC<TireStatusPanelProps> = ({ state, simulationParams }) => {
  const compound = COMPOUND_CONFIG[state.tireCompound] || COMPOUND_CONFIG.medium;
  const wear = Math.min(100, Math.max(0, state.tireWear));

  const cliffLap = simulationParams?.tireCliffLap?.[state.tireCompound] || 25;
  const isNearCliff = state.tireAgeLaps >= cliffLap - 3;
  const isPastCliff = state.tireAgeLaps >= cliffLap;

  const degRate = simulationParams?.tireDegradationSecondsPerLap?.[state.tireCompound] || 0.12;

  // Active pit loss based on safety car condition
  const effectivePitLoss = state.safetyCar === 'safety_car'
    ? (simulationParams?.safetyCarRules?.scPitLossSeconds || 11.0)
    : state.safetyCar === 'vsc'
    ? (simulationParams?.safetyCarRules?.vscPitLossSeconds || 14.5)
    : state.pitLossSeconds;

  return (
    <div className="cockpit-panel">
      {/* Header */}
      <div className="cockpit-panel-header">
        <div className="cockpit-panel-title">
          <Disc size={16} style={{ color: 'var(--flame-yellow, #FFB000)' }} />
          <span>Tire &amp; Pit Telemetry</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
          Sensors Active
        </span>
      </div>

      {/* Current Tire Compound Card */}
      <div
        className="tire-compound-card"
        style={{
          backgroundColor: compound.bg,
          borderColor: compound.border
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            className="tire-compound-circle"
            style={{
              borderColor: compound.color,
              color: compound.color
            }}
          >
            {state.tireCompound.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontFamily: 'var(--font-display, sans-serif)', fontWeight: 700, color: '#FFFFFF' }}>
              {compound.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
              Fitted: Lap {Math.max(1, state.currentLap - state.tireAgeLaps)}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF' }}>
            {state.tireAgeLaps} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted, #848B96)' }}>laps</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-display, sans-serif)', textTransform: 'uppercase' }}>
            Stint Age
          </div>
        </div>
      </div>

      {/* Degradation Meter */}
      <div
        style={{
          backgroundColor: 'var(--surface-raised, #171A24)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          borderRadius: '10px',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-display, sans-serif)' }}>
            Tire Wear Level
          </span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: wear > 75 ? '#F43F5E' : wear > 50 ? '#F59E0B' : '#10B981' }}>
            {wear.toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="tire-wear-track">
          <div
            style={{
              height: '100%',
              borderRadius: '999px',
              transition: 'width 0.4s ease',
              width: `${wear}%`,
              backgroundColor: wear > 75 ? '#FF3025' : wear > 50 ? '#FFB000' : '#10B981',
              boxShadow: wear > 75 ? '0 0 10px rgba(255, 48, 37, 0.6)' : 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)', paddingTop: '2px' }}>
          <span>Fresh</span>
          <span>Cliff (~{cliffLap} laps)</span>
          <span>Dead</span>
        </div>
      </div>

      {/* Cliff & Degradation Alert */}
      {isPastCliff ? (
        <div
          style={{
            backgroundColor: 'rgba(244, 43, 22, 0.18)',
            border: '1px solid rgba(244, 43, 22, 0.5)',
            borderRadius: '10px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            color: '#FDA4AF'
          }}
        >
          <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.75rem' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display, sans-serif)', display: 'block' }}>
              Tire Cliff Exceeded!
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(254, 205, 211, 0.9)', lineHeight: 1.5, display: 'block', marginTop: '2px' }}>
              Traction collapse imminent. Degradation penalty is compounding over 0.5s/lap. Immediate pit call recommended.
            </span>
          </div>
        </div>
      ) : isNearCliff ? (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.18)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '10px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            color: '#FDE68A'
          }}
        >
          <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.75rem' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display, sans-serif)', display: 'block' }}>
              Approaching Tire Cliff
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(254, 243, 199, 0.9)', lineHeight: 1.5, display: 'block', marginTop: '2px' }}>
              Within 3 laps of expected thermal cliff. Prepare pit window now to avoid undercut vulnerability.
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #171A24)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            borderRadius: '10px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }}
        >
          <span style={{ color: 'var(--text-muted, #848B96)' }}>Degradation Rate</span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF', fontWeight: 600 }}>
            +{degRate.toFixed(2)}s / lap
          </span>
        </div>
      )}

      {/* Pit Stop Delta Loss Box */}
      <div
        style={{
          backgroundColor: 'var(--surface-raised, #171A24)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          borderRadius: '10px',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-display, sans-serif)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Timer size={13} style={{ color: '#00e5ff' }} />
            Pit Loss Estimation
          </span>
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#00e5ff' }}>
            {effectivePitLoss.toFixed(1)}s
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.72rem' }}>
          <div style={{ backgroundColor: '#08090C', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <span style={{ color: 'var(--text-muted, #848B96)', display: 'block', fontSize: '0.65rem' }}>Normal Pit Delta:</span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF', fontWeight: 600 }}>{state.pitLossSeconds.toFixed(1)}s</span>
          </div>
          <div style={{ backgroundColor: '#08090C', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <span style={{ color: 'var(--text-muted, #848B96)', display: 'block', fontSize: '0.65rem' }}>SC / VSC Saving:</span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#10B981', fontWeight: 600 }}>
              -{(state.pitLossSeconds - effectivePitLoss).toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Rule Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted, #848B96)',
          backgroundColor: '#08090C',
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}
      >
        <Shield size={13} style={{ color: 'var(--flame-orange, #FF5500)', flexShrink: 0 }} />
        <span>Regulations: 2 different dry compounds mandatory in dry GP.</span>
      </div>
    </div>
  );
};

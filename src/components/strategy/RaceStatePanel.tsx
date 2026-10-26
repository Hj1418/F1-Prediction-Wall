import React from 'react';
import { StrategyRaceState } from '../../types/strategy';
import { Flag, Gauge, ShieldAlert, CloudRain, Sun, Cloud, AlertTriangle } from 'lucide-react';

interface RaceStatePanelProps {
  state: StrategyRaceState;
  circuitName?: string;
}

export const RaceStatePanel: React.FC<RaceStatePanelProps> = ({ state, circuitName }) => {
  const lapProgress = state.totalLaps > 0 ? (state.currentLap / state.totalLaps) * 100 : 0;

  return (
    <div className="cockpit-panel">
      {/* Header with Circuit and Status */}
      <div className="cockpit-panel-header">
        <div className="cockpit-panel-title">
          <Gauge size={16} style={{ color: 'var(--flame-orange, #FF5500)' }} />
          <span>Race Telemetry</span>
        </div>
        {circuitName && (
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary, #D1D5DB)',
              fontWeight: 600,
              backgroundColor: 'var(--surface-raised, #171A24)',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {circuitName}
          </span>
        )}
      </div>

      {/* Position Hero & Lap Counter */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {/* Track Position */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #171A24)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              fontSize: '0.62rem',
              color: 'var(--text-muted, #848B96)',
              fontFamily: 'var(--font-display, sans-serif)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            Position
          </div>
          <div className="telemetry-pos-hero" style={{ marginTop: '0.85rem' }}>
            P{state.position}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', marginTop: '0.25rem', fontFamily: 'var(--font-mono, monospace)' }}>
            {state.position === 1 ? 'Race Leader' : state.position <= 3 ? 'Podium Spot' : state.position <= 10 ? 'Points Zone' : 'Outside Points'}
          </div>
        </div>

        {/* Lap Progress */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #171A24)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-display, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>Lap Progress</span>
            <Flag size={12} />
          </div>
          <div style={{ margin: '0.35rem 0' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF' }}>
              {state.currentLap}
            </span>
            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted, #848B96)' }}>
              {' '}/ {state.totalLaps}
            </span>
          </div>
          {/* Lap Progress Bar */}
          <div className="telemetry-progress-track">
            <div
              className="telemetry-progress-bar"
              style={{ width: `${Math.min(100, Math.max(0, lapProgress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Track Intervals & Gaps */}
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
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-display, sans-serif)' }}>
          Track Intervals
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-secondary, #D1D5DB)' }}>Gap to Ahead</span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#00e5ff' }}>
            {state.gapAheadSeconds !== null ? `+${state.gapAheadSeconds.toFixed(1)}s` : 'Leader'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-secondary, #D1D5DB)' }}>Gap to Behind</span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--flame-yellow, #FFB000)' }}>
            {state.gapBehindSeconds !== null ? `-${state.gapBehindSeconds.toFixed(1)}s` : 'Tail of field'}
          </span>
        </div>
      </div>

      {/* Rival Telemetry (if present) */}
      {state.rivalDriver && (
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #171A24)',
            border: '1px solid rgba(255, 85, 0, 0.22)',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--flame-amber, #FF8A00)', fontFamily: 'var(--font-display, sans-serif)' }}>
              Target Rival
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF' }}>
              {state.rivalDriver}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem' }}>
            {state.rivalCompound && (
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#08090C', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.7rem' }}>Tire:</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#FFFFFF' }}>{state.rivalCompound}</span>
              </div>
            )}
            {state.rivalTireAge !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#08090C', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.7rem' }}>Age:</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: '#FFFFFF' }}>{state.rivalTireAge} laps</span>
              </div>
            )}
          </div>
          {state.rivalGapSeconds !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', backgroundColor: '#08090C', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.7rem' }}>Interval:</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--flame-orange, #FF5500)' }}>
                {state.rivalGapSeconds > 0 ? `+${state.rivalGapSeconds.toFixed(1)}s` : `${state.rivalGapSeconds.toFixed(1)}s`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Track Condition & Safety Car Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {state.safetyCar === 'safety_car' && (
          <div className="telemetry-sc-banner telemetry-sc-banner--sc">
            <ShieldAlert size={16} />
            <span>Safety Car Deployed — Reduced Pit Loss</span>
          </div>
        )}
        {state.safetyCar === 'vsc' && (
          <div className="telemetry-sc-banner telemetry-sc-banner--vsc">
            <ShieldAlert size={16} />
            <span>Virtual Safety Car Active</span>
          </div>
        )}
        {state.safetyCar === 'none' && (
          <div className="telemetry-sc-banner telemetry-sc-banner--green">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>Track Green — Full Racing Speed</span>
          </div>
        )}

        {/* Weather Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-raised, #171A24)',
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            fontSize: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary, #D1D5DB)' }}>
            {state.trackCondition === 'dry' ? (
              <Sun size={15} style={{ color: '#FBBF24' }} />
            ) : state.trackCondition === 'damp' ? (
              <Cloud size={15} style={{ color: '#7DD3FC' }} />
            ) : (
              <CloudRain size={15} style={{ color: '#60A5FA' }} />
            )}
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{state.trackCondition} Track</span>
          </div>
          {state.weatherForecast && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
              {state.weatherForecast}
            </span>
          )}
        </div>

        {/* Traffic Alert */}
        {state.trafficAhead && (
          <div
            style={{
              backgroundColor: 'rgba(244, 43, 22, 0.15)',
              border: '1px solid rgba(244, 43, 22, 0.35)',
              borderRadius: '8px',
              padding: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#FDA4AF',
              fontSize: '0.75rem'
            }}
          >
            <AlertTriangle size={14} />
            <span>Heavy traffic ahead in pit exit window</span>
          </div>
        )}
      </div>
    </div>
  );
};

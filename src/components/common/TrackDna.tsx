import React from 'react';
import { TrackCharacteristic } from '../../types';
import { Gauge, Zap, Wind, ArrowLeftRight, Activity } from 'lucide-react';

interface TrackDnaProps {
  characteristics?: TrackCharacteristic[];
  className?: string;
}

const DEFAULT_CHARACTERISTICS: TrackCharacteristic[] = [
  { label: 'Top Speed', value: 8, max: 10, description: 'Straight-line velocity potential' },
  { label: 'Braking Demand', value: 7, max: 10, description: 'Severity and frequency of deceleration zones' },
  { label: 'Downforce Requirement', value: 7, max: 10, description: 'Aerodynamic grip level demanded by cornering' },
  { label: 'Overtaking Potential', value: 6, max: 10, description: 'Passing viability across DRS and slipstream zones' },
  { label: 'Tyre Demand', value: 7, max: 10, description: 'Lateral and longitudinal carcass energy stresses' },
];

function getMetricIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('speed')) return <Zap size={14} color="var(--f1-red)" />;
  if (l.includes('braking')) return <Activity size={14} color="#f87171" />;
  if (l.includes('downforce')) return <Wind size={14} color="var(--telemetry-cyan)" />;
  if (l.includes('overtaking')) return <ArrowLeftRight size={14} color="var(--telemetry-green)" />;
  return <Gauge size={14} color="var(--telemetry-yellow)" />;
}

function getMeterColor(label: string) {
  const l = label.toLowerCase();
  if (l.includes('speed')) return 'var(--f1-red)';
  if (l.includes('downforce')) return 'var(--telemetry-cyan)';
  if (l.includes('overtaking')) return 'var(--telemetry-green)';
  if (l.includes('tyre')) return 'var(--telemetry-yellow)';
  return '#f87171';
}

export const TrackDna: React.FC<TrackDnaProps> = ({
  characteristics = DEFAULT_CHARACTERISTICS,
  className = '',
}) => {
  return (
    <div
      className={`race-card ${className}`}
      style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-surface-card) 0%, var(--bg-surface-elevated) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
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
            CIRCUIT DYNAMICS
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.15rem' }}>
            Track DNA & Telemetry Metrics
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            background: 'var(--bg-input)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          FIA SCALE 1-10
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {characteristics.map(c => {
          const max = c.max || 10;
          const percentage = Math.min(100, Math.max(5, (c.value / max) * 100));
          const meterColor = getMeterColor(c.label);

          return (
            <div key={c.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {getMetricIcon(c.label)}
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {c.label}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>
                  <span style={{ color: meterColor }}>{c.value}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> / {max}</span>
                </div>
              </div>

              {/* Progress bar container */}
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${meterColor}80, ${meterColor})`,
                    borderRadius: 'var(--radius-full)',
                    boxShadow: `0 0 10px ${meterColor}60`,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {c.description && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.3 }}>
                  {c.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

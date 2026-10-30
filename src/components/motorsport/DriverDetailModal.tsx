import React, { useEffect } from 'react';
import { DriverProfile } from '../../types/driversHub';
import { X, Trophy, Flag, Shield, Award, Zap, CheckCircle2, Calendar } from 'lucide-react';

export interface DriverDetailModalProps {
  driver: DriverProfile | null;
  onClose: () => void;
}

/**
 * DriverDetailModal - Detailed profile inspection modal
 * Displays career achievements, series-verified telemetry stats, and DNA breakdown.
 */
export const DriverDetailModal: React.FC<DriverDetailModalProps> = ({ driver, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!driver) return null;

  const { stats } = driver;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="race-card"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--bg-surface, #14171E)',
          border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.14))',
          borderRadius: '16px',
          boxShadow: `0 24px 64px -12px rgba(0, 0, 0, 0.95), 0 0 30px -5px ${driver.seriesBadgeColor}44`,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Racing Color Stripe */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: driver.seriesBadgeColor,
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: `${driver.seriesBadgeColor}22`,
                  color: driver.seriesBadgeColor,
                  border: `1px solid ${driver.seriesBadgeColor}44`,
                  textTransform: 'uppercase',
                }}
              >
                {driver.seriesName}
              </span>
              {driver.racingClass && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted, #94A3B8)',
                  }}
                >
                  {driver.racingClass}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{driver.countryFlag}</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                {driver.name}
              </h2>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: driver.seriesBadgeColor,
                }}
              >
                #{driver.number}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #9CA3AF)', marginTop: '0.2rem' }}>
              {driver.team} {driver.carOrBike ? `• ${driver.carOrBike}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              color: 'var(--text-secondary, #9CA3AF)',
              borderRadius: '8px',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Statistics Grid */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: 'var(--text-muted, #94A3B8)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              CAREER &amp; SERIES STATISTICS • {stats.statLabel}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '0.65rem',
              }}
            >
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase' }}>
                  World Titles
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFB000', fontFamily: 'var(--font-mono)' }}>
                  {stats.worldChampionships ?? 0}
                </div>
              </div>

              {driver.series === 'wec' && stats.leMansWins !== undefined && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase' }}>
                    Le Mans Wins
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                    {stats.leMansWins}
                  </div>
                </div>
              )}

              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase' }}>
                  Race Wins
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {stats.raceWins ?? 0}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase' }}>
                  Podiums
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--telemetry-cyan, #00e5ff)', fontFamily: 'var(--font-mono)' }}>
                  {stats.podiums ?? 0}
                </div>
              </div>

              {stats.polePositions !== undefined && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase' }}>
                    Poles
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#E2E8F0', fontFamily: 'var(--font-mono)' }}>
                    {stats.polePositions}
                  </div>
                </div>
              )}

              {stats.fastestLaps !== undefined && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase' }}>
                    Fastest Laps
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#E2E8F0', fontFamily: 'var(--font-mono)' }}>
                    {stats.fastestLaps}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver DNA Breakdown */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${driver.seriesBadgeColor}33`,
              borderRadius: '10px',
              padding: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: driver.seriesBadgeColor,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Zap size={14} />
              <span>DRIVER DNA &amp; RACING CHARACTERISTICS</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#E2E8F0', lineHeight: 1.5, margin: 0 }}>
              {driver.driverDna}
            </p>
          </div>

          {/* Career Highlights */}
          {driver.careerHighlights && driver.careerHighlights.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: 'var(--text-muted, #94A3B8)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                CAREER HIGHLIGHTS &amp; MILESTONES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {driver.careerHighlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.55rem',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary, #CBD5E1)',
                      lineHeight: 1.4,
                    }}
                  >
                    <CheckCircle2 size={14} style={{ color: driver.seriesBadgeColor, flexShrink: 0, marginTop: '2px' }} />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Biography summary */}
          {driver.biography && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94A3B8)', lineHeight: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.85rem' }}>
              {driver.biography}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDetailModal;

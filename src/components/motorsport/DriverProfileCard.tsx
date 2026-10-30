import React from 'react';
import { Link } from 'react-router-dom';
import { DriverProfile } from '../../types/driversHub';
import { Trophy, Award, Zap, ChevronRight, Compass } from 'lucide-react';

export interface DriverProfileCardProps {
  driver: DriverProfile;
  onSelect?: (driver: DriverProfile) => void;
}

/**
 * DriverProfileCard - Reusable motorsport discovery card
 * Displays identity, series-appropriate statistics, verified Driver DNA insights,
 * and links to the dedicated driver profile page.
 */
export const DriverProfileCard: React.FC<DriverProfileCardProps> = ({ driver, onSelect }) => {
  const { stats } = driver;
  const profileUrl = `/explore/drivers/${driver.slug || driver.id}`;

  // Determine series-specific primary stat label
  const championshipStatTitle =
    driver.series === 'wec'
      ? 'World Titles'
      : driver.series === 'motogp'
      ? 'World Titles'
      : 'WDC Titles';

  return (
    <Link
      to={profileUrl}
      className="race-card driver-profile-card"
      style={{
        background: 'var(--bg-surface-elevated, #14171E)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '14px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = `${driver.seriesBadgeColor}88`;
        e.currentTarget.style.boxShadow = `0 12px 32px -8px rgba(0, 0, 0, 0.7), 0 0 20px -6px ${driver.seriesBadgeColor}44`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.08))';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top series indicator bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: driver.seriesBadgeColor,
        }}
      />

      {/* Card Header: Series Tag + Racing Number */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: driver.seriesBadgeColor,
                backgroundColor: `${driver.seriesBadgeColor}22`,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: `1px solid ${driver.seriesBadgeColor}44`,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {driver.seriesName}
            </span>

            {driver.status === 'historical' && (
              <span
                style={{
                  fontSize: '0.64rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: '#94a3b8',
                  backgroundColor: 'rgba(148, 163, 184, 0.15)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                Legend
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted, #94A3B8)',
              letterSpacing: '-0.02em',
            }}
          >
            #{driver.number}
          </div>
        </div>

        {/* Driver Name & Team */}
        <div style={{ marginBottom: '1rem' }}>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 0.25rem 0',
              lineHeight: 1.2,
            }}
          >
            {driver.name}
          </h3>

          <div
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary, #9CA3AF)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexWrap: 'wrap',
            }}
          >
            <span>{driver.team}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>{driver.countryFlag} {driver.nationality}</span>
          </div>
        </div>

        {/* Series-Specific Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: stats.leMansWins !== undefined ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.65rem 0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted, #94A3B8)',
                marginBottom: '0.15rem',
              }}
            >
              {championshipStatTitle}
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: driver.seriesBadgeColor,
              }}
            >
              {stats.worldChampionships || 0}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted, #94A3B8)',
                marginBottom: '0.15rem',
              }}
            >
              Race Wins
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#ffffff',
              }}
            >
              {stats.raceWins || 0}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted, #94A3B8)',
                marginBottom: '0.15rem',
              }}
            >
              Podiums
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#ffffff',
              }}
            >
              {stats.podiums || 0}
            </div>
          </div>
        </div>

        {/* Driver DNA Summary Callout */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: 'var(--text-muted, #94A3B8)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Zap size={11} style={{ color: driver.seriesBadgeColor }} />
            <span>DRIVER DNA INSIGHT</span>
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary, #CBD5E1)',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {driver.driverDna}
          </p>
        </div>
      </div>

      {/* Card Footer: View Details CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--text-secondary, #9CA3AF)',
        }}
      >
        <span>VIEW DEDICATED PROFILE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: driver.seriesBadgeColor }}>
          <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
};

export default DriverProfileCard;

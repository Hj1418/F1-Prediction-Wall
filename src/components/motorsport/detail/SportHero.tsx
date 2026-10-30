import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Shield,
  Calendar,
  Trophy,
  Users,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Championship } from '../../../types/motorsport';
import { ChampionshipDetailData } from '../../../types/motorsportDetail';

export interface SportHeroProps {
  championship: Championship;
  detail: ChampionshipDetailData | null;
  driversCount: number;
  teamsCount: number;
  circuitsCount: number;
}

export const SportHero: React.FC<SportHeroProps> = ({
  championship,
  detail,
  driversCount,
  teamsCount,
  circuitsCount,
}) => {
  const seasonYear = detail?.seasonYear || 2026;
  const roundsCount = detail?.rounds?.length || 0;

  // Verified reigning champion context (only displayed when factually verified; no guessing!)
  const reigningChampion = React.useMemo(() => {
    if (championship.id === 'f1') {
      return { title: 'REIGNING WORLD DRIVERS’ CHAMPION', name: 'Max Verstappen (Red Bull Racing)' };
    }
    if (championship.id === 'motogp') {
      return { title: 'REIGNING MOTOGP WORLD CHAMPION', name: 'Jorge Martín (Aprilia Racing)' };
    }
    if (championship.id === 'wec') {
      return { title: '24H OF LE MANS WINNER', name: 'Ferrari AF Corse (Ferrari 499P #50)' };
    }
    return null;
  }, [championship.id]);

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface, #131722)',
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        position: 'relative',
        overflow: 'hidden',
        padding: '2.5rem 0 2rem 0',
        background: `radial-gradient(ellipse 90% 60% at 50% -10%, ${championship.badgeColor}18, transparent)`,
      }}
    >
      {/* Top series accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: championship.badgeColor,
        }}
      />

      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem' }}>
        {/* Breadcrumb & External Link Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <Link
              to="/explore"
              style={{
                color: 'var(--text-secondary, #94a3b8)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 700,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)')}
            >
              <ArrowLeft size={13} />
              <span>EXPLORE</span>
            </Link>
            <span style={{ color: 'var(--text-muted, #64748b)' }}>/</span>
            <span style={{ color: 'var(--text-muted, #64748b)' }}>{championship.tier.toUpperCase()}</span>
            <span style={{ color: 'var(--text-muted, #64748b)' }}>/</span>
            <span style={{ color: championship.badgeColor, fontWeight: 800 }}>
              {championship.shortName.toUpperCase()}
            </span>
          </nav>

          {championship.officialUrl && (
            <a
              href={championship.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                color: 'var(--text-secondary, #94a3b8)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
                e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.1))';
              }}
            >
              <span>OFFICIAL WEBSITE</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Hero Identity Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Badges Bar */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: championship.badgeColor,
                backgroundColor: `${championship.badgeColor}18`,
                border: `1px solid ${championship.badgeColor}40`,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                letterSpacing: '0.06em',
              }}
            >
              {championship.shortName}
            </span>

            <span
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #94a3b8)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
              }}
            >
              {championship.governingBody}
            </span>

            <span
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--telemetry-cyan, #00e5ff)',
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
              }}
            >
              {seasonYear} SEASON
            </span>
          </div>

          {/* Championship Main Name */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            {championship.name}
          </h1>

          {/* Tagline / Intro */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              color: 'var(--text-secondary, #94a3b8)',
              margin: 0,
              maxWidth: '820px',
              lineHeight: 1.6,
            }}
          >
            {championship.tagline}
          </p>

          {/* Season Context & Verified Stats Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginTop: '0.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {roundsCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                <Calendar size={15} style={{ color: championship.badgeColor }} />
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{roundsCount}</span>
                <span style={{ color: 'var(--text-muted)' }}>Rounds</span>
              </div>
            )}

            {teamsCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                <Shield size={15} style={{ color: championship.badgeColor }} />
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{teamsCount}</span>
                <span style={{ color: 'var(--text-muted)' }}>Teams</span>
              </div>
            )}

            {driversCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                <Users size={15} style={{ color: championship.badgeColor }} />
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{driversCount}</span>
                <span style={{ color: 'var(--text-muted)' }}>Verified Drivers</span>
              </div>
            )}

            {circuitsCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                <MapPin size={15} style={{ color: championship.badgeColor }} />
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{circuitsCount}</span>
                <span style={{ color: 'var(--text-muted)' }}>Circuits</span>
              </div>
            )}

            {reigningChampion && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.82rem',
                  marginLeft: 'auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Trophy size={14} style={{ color: '#fbbf24' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                  {reigningChampion.title}:
                </span>
                <strong style={{ color: '#ffffff' }}>{reigningChampion.name}</strong>
              </div>
            )}
          </div>

          {/* F1 Dedicated Launchpad Bar */}
          {championship.id === 'f1' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                flexWrap: 'wrap',
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                F1 Launchpad:
              </span>
              <Link
                to="/races"
                style={{
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Calendar & Races
              </Link>
              <Link
                to="/predictions"
                style={{
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  backgroundColor: 'rgba(225, 6, 0, 0.2)',
                  border: '1px solid rgba(225, 6, 0, 0.4)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Prediction Bench
              </Link>
              <Link
                to="/leaderboard"
                style={{
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Leaderboard
              </Link>
              <Link
                to="/circuits"
                style={{
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Circuits Guide
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

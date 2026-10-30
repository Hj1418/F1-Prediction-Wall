import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Award,
  Flag,
  Shield,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Share2,
  Check,
  BookOpen,
  Milestone,
  History,
  Star,
  Quote,
} from 'lucide-react';
import { getDriverProfileBySlug } from '../services/motorsport/driversHubService';
import { DriverProfile, CareerJourneyMilestone, HistoricalTeamRecord, CareerAchievement, DriverInterestingFact } from '../types/driversHub';
import { useApp } from '../context/AppContext';

export const DriverProfilePage: React.FC = () => {
  const { driverSlug } = useParams<{ driverSlug?: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const driver: DriverProfile | undefined = useMemo(() => {
    return getDriverProfileBySlug(driverSlug);
  }, [driverSlug]);

  useEffect(() => {
    if (driver) {
      document.title = `${driver.fullName || driver.name} | Driver Profile • THE GRDX`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.title = 'Driver Not Found • THE GRDX';
    }
  }, [driver]);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedUrl(true);
        showToast('Driver profile URL copied to clipboard!', 'success');
        setTimeout(() => setCopiedUrl(false), 2500);
      }
    } catch {
      showToast('Could not copy URL to clipboard', 'info');
    }
  };

  // =========================================================================
  // VIEW: 404 NOT FOUND STATE
  // =========================================================================
  if (!driver) {
    return (
      <div
        className="driver-not-found-page"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '6rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--color-accent, #FF4B33)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Compass size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
          Driver Profile Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          No competitor matches the identifier &ldquo;<strong>{driverSlug}</strong>&rdquo;. The profile may not be registered in our verified paddock database yet.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/explore/drivers')}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent, #FF4B33)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Browse All Drivers & Riders</span>
          </button>
        </div>
      </div>
    );
  }

  // Fallback defaults for evergreen sections if not explicitly defined
  const shortIntro =
    driver.shortIntroduction ||
    driver.biography ||
    `${driver.name} is a distinguished competitor in ${driver.seriesName}, representing ${driver.team}.`;

  const earlyLife =
    driver.earlyLifeAndBeginnings ||
    `${driver.name} grew up with a deep passion for motorsport, developing foundational racecraft in competitive junior categories before climbing to the pinnacle of international racing.`;

  const legacy =
    driver.driverLegacy ||
    `${driver.name}’s commitment to competitive excellence, sportsmanship, and continuous technical evolution continues to inspire motorsport enthusiasts and young racers across the world.`;

  const achievements: CareerAchievement[] =
    driver.careerAchievements && driver.careerAchievements.length > 0
      ? driver.careerAchievements
      : driver.careerHighlights.map(h => ({
          title: h,
          description: 'Verified career milestone.',
        }));

  return (
    <div
      className="driver-profile-page"
      style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '2rem 1.25rem 6rem',
      }}
    >
      {/* 1. BREADCRUMB NAVIGATION & SHARE ACTION */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
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
            }}
          >
            <ArrowLeft size={14} />
            <span>EXPLORE</span>
          </Link>
          <span style={{ color: 'var(--text-muted, #64748b)' }}>/</span>
          <Link
            to={`/explore/${driver.series}/drivers`}
            style={{
              color: 'var(--text-secondary, #94a3b8)',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            {driver.seriesName ? `${driver.seriesName.toUpperCase()} DRIVERS` : 'DRIVERS HUB'}
          </Link>
          <span style={{ color: 'var(--text-muted, #64748b)' }}>/</span>
          <span style={{ color: driver.seriesBadgeColor, fontWeight: 800 }}>
            {driver.name.toUpperCase()}
          </span>
        </nav>

        {/* Share Profile Affordance */}
        <button
          type="button"
          onClick={handleShare}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: copiedUrl ? '#22c55e' : 'var(--text-secondary)',
            backgroundColor: copiedUrl ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            border: copiedUrl ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-subtle)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {copiedUrl ? <Check size={14} /> : <Share2 size={14} />}
          <span>{copiedUrl ? 'LINK COPIED' : 'SHARE PROFILE'}</span>
        </button>
      </div>

      {/* 2. SECTION A: DRIVER HERO & IDENTITY CARD */}
      <header
        style={{
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '2.25rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 12px 36px -12px ${driver.seriesBadgeColor}15`,
        }}
      >
        {/* Top Accent Strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: driver.seriesBadgeColor,
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          {/* Left Column: Number, Name, Nationality, Team */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: `${driver.seriesBadgeColor}22`,
                  color: driver.seriesBadgeColor,
                  border: `1px solid ${driver.seriesBadgeColor}44`,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {driver.seriesName}
              </span>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  backgroundColor: driver.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: driver.status === 'active' ? '#22c55e' : '#94a3b8',
                  border: driver.status === 'active' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                {driver.status === 'active' ? 'Active Competitor' : 'Historical Legend'}
              </span>

              {driver.racingClass && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {driver.racingClass}
                </span>
              )}
            </div>

            {/* Racing Number & Full Official Name */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: driver.seriesBadgeColor,
                  lineHeight: 1,
                }}
              >
                #{driver.number}
              </span>
              <div>
                <h1
                  style={{
                    fontSize: 'clamp(2rem, 4.5vw, 2.85rem)',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: 0,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {driver.fullName || driver.name}
                </h1>
                {driver.fullName && driver.fullName !== driver.name && (
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Commonly known as {driver.name}
                  </span>
                )}
              </div>
            </div>

            {/* Key Factual Identity Specs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                marginTop: '1.25rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary, #cbd5e1)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Shield size={16} color={driver.seriesBadgeColor} />
                <span>Current / Recent Team:</span>
                <strong style={{ color: '#ffffff' }}>{driver.team}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flag size={15} color={driver.seriesBadgeColor} />
                <span>Nationality:</span>
                <strong style={{ color: '#ffffff' }}>{driver.countryFlag} {driver.nationality}</strong>
              </div>

              {driver.birthDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color={driver.seriesBadgeColor} />
                  <span>DOB:</span>
                  <strong style={{ color: '#ffffff' }}>{driver.birthDate}</strong>
                </div>
              )}

              {driver.birthPlace && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={15} color={driver.seriesBadgeColor} />
                  <span>Born:</span>
                  <strong style={{ color: '#ffffff' }}>{driver.birthPlace}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Primary Discipline Badge & Lead Introduction */}
          <div
            style={{
              maxWidth: '440px',
              backgroundColor: 'var(--bg-surface-elevated, #14171E)',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: driver.seriesBadgeColor,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.4rem',
              }}
            >
              PRIMARY MOTORSPORT DISCIPLINE
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
              {driver.primaryDiscipline || driver.seriesName}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
              {shortIntro}
            </p>
          </div>
        </div>
      </header>

      {/* 3. EDITORIAL SECTIONS GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* SECTION B: EARLY LIFE & MOTORSPORT BEGINNINGS */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: `${driver.seriesBadgeColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: driver.seriesBadgeColor,
              }}
            >
              <BookOpen size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                SECTION B • NARRATIVE BIOGRAPHY
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Early Life & Motorsport Beginnings
              </h2>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.75, maxWidth: '960px' }}>
            <p style={{ margin: 0 }}>{earlyLife}</p>
          </div>
        </section>

        {/* SECTION C: CAREER JOURNEY (CHRONOLOGICAL TIMELINE) */}
        {driver.careerJourney && driver.careerJourney.length > 0 && (
          <section
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: `${driver.seriesBadgeColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: driver.seriesBadgeColor,
                }}
              >
                <Milestone size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  SECTION C • DEVELOPMENT TIMELINE
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  Career Journey & Milestones
                </h2>
              </div>
            </div>

            {/* Chronological Timeline Container */}
            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: `2px solid ${driver.seriesBadgeColor}33`, marginLeft: '0.75rem' }}>
              {driver.careerJourney.map((milestone, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    marginBottom: idx === driver.careerJourney!.length - 1 ? 0 : '1.75rem',
                  }}
                >
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.95rem',
                      top: '0.2rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: driver.seriesBadgeColor,
                      boxShadow: `0 0 10px ${driver.seriesBadgeColor}`,
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        color: driver.seriesBadgeColor,
                      }}
                    >
                      {milestone.period}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {milestone.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    {milestone.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
                    {milestone.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION D: TEAMS & CAREER HISTORY (CHRONOLOGICAL TABLE) */}
        {driver.teamsHistory && driver.teamsHistory.length > 0 && (
          <section
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: `${driver.seriesBadgeColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: driver.seriesBadgeColor,
                }}
              >
                <History size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  SECTION D • VERIFIED LEDGER
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  Teams & Career History
                </h2>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <th style={{ padding: '0.75rem 1rem 0.75rem 0' }}>Season / Period</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Verified Team</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Championship</th>
                    <th style={{ padding: '0.75rem 0 0.75rem 1rem' }}>Milestone / Car Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {driver.teamsHistory.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td
                        style={{
                          padding: '1rem 1rem 1rem 0',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: driver.seriesBadgeColor,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.period}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 800, color: '#ffffff' }}>
                        {item.team}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {item.championship}
                      </td>
                      <td style={{ padding: '1rem 0 1rem 1rem', color: 'var(--text-secondary)' }}>
                        <div>{item.notes || '—'}</div>
                        {item.carOrBike && (
                          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {item.carOrBike}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION E: CAREER ACHIEVEMENTS */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: `${driver.seriesBadgeColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: driver.seriesBadgeColor,
              }}
            >
              <Trophy size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                SECTION E • HISTORIC ACCOMPLISHMENTS
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Career Achievements & Records
              </h2>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-surface-elevated, #14171E)',
                  border: ach.isRecord ? `1px solid ${driver.seriesBadgeColor}66` : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {ach.isRecord && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 900,
                      color: driver.seriesBadgeColor,
                      backgroundColor: `${driver.seriesBadgeColor}20`,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      border: `1px solid ${driver.seriesBadgeColor}40`,
                      textTransform: 'uppercase',
                    }}
                  >
                    HISTORIC RECORD
                  </div>
                )}

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0', paddingRight: ach.isRecord ? '5rem' : 0 }}>
                  {ach.title}
                </h3>

                {ach.countOrDetail && (
                  <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: driver.seriesBadgeColor, marginBottom: '0.45rem' }}>
                    {ach.countOrDetail}
                  </div>
                )}

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {ach.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION F: INTERESTING FACTS */}
        {driver.interestingFacts && driver.interestingFacts.length > 0 && (
          <section
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: `${driver.seriesBadgeColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: driver.seriesBadgeColor,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  SECTION F • VERIFIED MOTORSPORT TRIVIA
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  Interesting Facts & Lore
                </h2>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '1rem',
              }}
            >
              {driver.interestingFacts.map((factItem, idx) => {
                const topic = typeof factItem === 'object' ? factItem.topic : 'Trivia';
                const factText = typeof factItem === 'object' ? factItem.fact : factItem;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        color: driver.seriesBadgeColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {topic}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.55 }}>
                      {factText}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION G: DRIVER LEGACY */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '2.25rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: `${driver.seriesBadgeColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: driver.seriesBadgeColor,
              }}
            >
              <Star size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                SECTION G • EDITORIAL ESSAY
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Driver Legacy & Influence on Motorsport
              </h2>
            </div>
          </div>

          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-elevated, #14171E)',
              borderLeft: `4px solid ${driver.seriesBadgeColor}`,
            }}
          >
            <p style={{ color: '#ffffff', fontSize: '1rem', lineHeight: 1.7, margin: 0, fontStyle: 'normal' }}>
              {legacy}
            </p>
          </div>
        </section>
      </div>

      {/* 4. FOOTER RETURN TO EXPLORE CTA */}
      <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
        <Link
          to="/explore/drivers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--bg-surface)',
            color: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <ArrowLeft size={16} />
          <span>RETURN TO DRIVERS HUB</span>
        </Link>
      </div>
    </div>
  );
};

export default DriverProfilePage;

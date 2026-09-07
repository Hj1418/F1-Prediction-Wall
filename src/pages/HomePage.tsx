import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { RaceWeekend, PredictionRound, LeaderboardEntry, Driver, getCircuitName, Session } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
import { getCircuitMetadata, getCircuitAssetUrl, CIRCUIT_SOURCE_MAPPING } from '../services/circuits/circuitRegistry';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Zap,
  Trophy,
  Gauge,
  Clock,
  ChevronRight,
  BookOpen,
  MapPin,
  Flag,
  Crown,
  Timer,
  Sliders,
  LogIn,
  ExternalLink,
  MapPinOff,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { dataVersion } = useApp();
  const { currentUser, isAuthenticated, setAuthModalOpen } = useAuth();
  const [activeWeekend, setActiveWeekend] = useState<RaceWeekend | null>(null);
  const [circuitImgError, setCircuitImgError] = useState(false);
  const [activeRounds, setActiveRounds] = useState<PredictionRound[]>([]);
  const [currentRound, setCurrentRound] = useState<PredictionRound | null>(null);
  const [seasonLeaderboard, setSeasonLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [weekends, dList, lboard] = await Promise.all([
          api.getRaceWeekends(),
          api.getDrivers(),
          api.getLeaderboard('season'),
        ]);

        setDrivers(dList);
        setSeasonLeaderboard(lboard);

        const currentW =
          weekends.find(w => w.status === 'ACTIVE') ||
          weekends.find(w => w.status === 'UPCOMING') ||
          weekends[0];
        setActiveWeekend(currentW);
        setCircuitImgError(false);

        if (currentW) {
          const rounds = await api.getPredictionRounds(currentW.raceWeekendId);
          setActiveRounds(rounds);

          const openR =
            rounds.find(r => r.status === 'OPEN') ||
            rounds.find(r => r.status === 'UPCOMING') ||
            rounds[0];
          setCurrentRound(openR);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [dataVersion]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div
          className="live-pulse"
          style={{ width: '14px', height: '14px', backgroundColor: 'var(--f1-red)', margin: '0 auto 1rem' }}
        />
        <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
          LOADING RACE INFORMATION...
        </div>
      </div>
    );
  }

  const topThree = seasonLeaderboard.slice(0, 3);
  const circuitMeta = activeWeekend ? getCircuitMetadata(activeWeekend.circuit) : null;
  const circuitKey = circuitMeta ? circuitMeta.circuitId : 'monza';
  const mapping = CIRCUIT_SOURCE_MAPPING[circuitKey];
  const circuitSvgUrl = getCircuitAssetUrl(mapping ? mapping.assetFile : `${circuitKey}.svg`);

  const startDateStr = activeWeekend
    ? new Date(activeWeekend.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : '';
  const endDateStr = activeWeekend
    ? new Date(activeWeekend.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : '';

  // Next session determination
  const sortedSessions: Session[] = (activeWeekend?.sessions || []).slice().sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  const nowMs = Date.now();
  const nextSession =
    sortedSessions.find(s => new Date(s.startTime).getTime() > nowMs) ||
    sortedSessions[sortedSessions.length - 1];

  return (
    <div className="homepage-root" style={{ paddingBottom: '4rem' }}>
      {/* 1. RACE STATUS HEADER BANNER */}
      <section
        style={{
          background: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.65rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--f1-red)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              2026 FIA FORMULA ONE WORLD CHAMPIONSHIP
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--telemetry-green, #00e676)',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span className="live-pulse" /> ROUND {activeWeekend?.roundNumber || (activeWeekend as any)?.round || 13} OF 24
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status:</span>
            <StatusBadge status={activeWeekend?.status || 'UPCOMING'} />
          </div>
        </div>
      </section>

      {/* 2. NEXT RACE HERO SECTION */}
      {activeWeekend && (
        <section
          style={{
            background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '2.5rem 0 3rem 0',
          }}
        >
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              {/* Left Column: Grand Prix Identity */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>{activeWeekend.flag}</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--f1-red)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {activeWeekend.country} GRAND PRIX
                    </div>
                    <h1
                      style={{
                        fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                        fontWeight: 900,
                        lineHeight: 1.15,
                        margin: 0,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {activeWeekend.raceName}
                    </h1>
                  </div>
                </div>

                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {getCircuitName(activeWeekend.circuit)} • {startDateStr} – {endDateStr}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  <span
                    style={{
                      background: activeWeekend.weekendType === 'SPRINT' ? 'rgba(255, 128, 0, 0.15)' : 'rgba(0, 210, 190, 0.12)',
                      color: activeWeekend.weekendType === 'SPRINT' ? '#ff9500' : 'var(--telemetry-cyan, #00e5ff)',
                      border: `1px solid ${activeWeekend.weekendType === 'SPRINT' ? 'rgba(255, 128, 0, 0.3)' : 'rgba(0, 210, 190, 0.3)'}`,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Zap size={13} />
                    {activeWeekend.weekendType === 'SPRINT' ? 'SPRINT WEEKEND' : 'STANDARD GRAND PRIX'}
                  </span>

                  <Link
                    to={`/races/${activeWeekend.roundNumber || activeWeekend.raceWeekendId}`}
                    style={{
                      textDecoration: 'none',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Calendar size={13} /> Weekend Hub <ChevronRight size={12} />
                  </Link>
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    to={currentRound ? `/predict/${currentRound.roundId}` : `/predictions`}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
                  >
                    <Zap size={16} /> Enter Predictions
                  </Link>

                  <Link
                    to={`/circuits/${circuitKey}`}
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
                  >
                    <MapPin size={16} /> Circuit Profile
                  </Link>
                </div>
              </div>

              {/* Right Column: Countdown Card to Next Competitive Session */}
              <div
                style={{
                  background: 'var(--bg-surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                    NEXT SESSION COUNTDOWN
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                    {nextSession ? nextSession.name : 'Grand Prix Race'}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    {nextSession ? new Date(nextSession.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                  </div>
                </div>

                {nextSession && (
                  <div style={{ padding: '0.5rem 0' }}>
                    <CountdownTimer targetDate={nextSession.startTime} prefix="Session Starts In" />
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Prediction Lock: <strong style={{ color: '#fff' }}>At Qualifying Start</strong>
                  </span>
                  <Link
                    to="/races"
                    style={{ textDecoration: 'none', color: 'var(--f1-red)', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    Full Timetable →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. NEXT SESSION & TIMETABLE BREAKDOWN */}
      {sortedSessions.length > 0 && (
        <section className="container" style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SESSION TIMETABLE
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0 0', color: '#fff' }}>
                Race Weekend Schedule (Your Local Time)
              </h2>
            </div>
            <Link to="/weekends" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textDecoration: 'none' }}>
              All 24 Weekends →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {sortedSessions.map(session => {
              const sessionDate = new Date(session.startTime);
              const isPast = sessionDate.getTime() < nowMs;
              const isCurrent = session.status === 'LIVE' || session.status === 'ONGOING';

              return (
                <div
                  key={session.id || session.name}
                  style={{
                    background: isCurrent ? 'rgba(35, 134, 54, 0.08)' : 'var(--bg-surface)',
                    border: isCurrent ? '1px solid #238636' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      {sessionDate.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        background: isCurrent ? 'rgba(35, 134, 54, 0.2)' : isPast ? 'rgba(255, 255, 255, 0.05)' : 'rgba(31, 111, 235, 0.15)',
                        color: isCurrent ? '#00e676' : isPast ? 'var(--text-muted)' : '#58a6ff',
                      }}
                    >
                      {isCurrent ? 'LIVE' : isPast ? 'COMPLETED' : 'UPCOMING'}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                    {session.name}
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. CIRCUIT SNAPSHOT & TELEMETRY */}
      {circuitMeta && (
        <section className="container" style={{ marginTop: '3rem' }}>
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  CIRCUIT SNAPSHOT
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0 0', color: '#fff' }}>
                  {circuitMeta.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {circuitMeta.locality}, {circuitMeta.country}
                </div>
              </div>

              <Link
                to={`/circuits/${circuitKey}`}
                className="btn btn-outline btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Inspect Circuit Layout →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                alignItems: 'center',
              }}
            >
              {/* Circuit Vector Track */}
              <div
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '220px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {circuitImgError ? (
                  <div
                    className="circuit-map-fallback"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.5rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                    }}
                  >
                    <MapPinOff size={28} style={{ opacity: 0.6, marginBottom: '0.5rem', color: 'var(--f1-red)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      CIRCUIT MAP UNAVAILABLE
                    </span>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
                      Circuit layout is currently unavailable.
                    </span>
                  </div>
                ) : (
                  <img
                    src={circuitSvgUrl}
                    alt={circuitMeta.name}
                    onError={() => setCircuitImgError(true)}
                    style={{
                      maxHeight: '200px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 14px rgba(225, 6, 0, 0.25))',
                    }}
                  />
                )}
              </div>

              {/* Telemetry Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Length</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                      {circuitMeta.lengthKm} KM
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corners</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                      {circuitMeta.turns} TURNS
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DRS Zones</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--f1-red)' }}>
                      {circuitMeta.drsZones}
                    </div>
                  </div>
                </div>

                {circuitMeta.lapRecord && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lap Record</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        {circuitMeta.lapRecord.driver} ({circuitMeta.lapRecord.year})
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--telemetry-purple, #9d4edd)' }}>
                      {circuitMeta.lapRecord.time}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Speed profile: <strong style={{ color: '#fff' }}>{circuitMeta.trackCharacter?.speed || 'High'}</strong>
                  </span>
                  <Link to="/circuits" style={{ fontSize: '0.8rem', color: 'var(--f1-red)', textDecoration: 'none', fontWeight: 700 }}>
                    Browse All 24 Circuits →
                  </Link>
                </div>

                {/* Contextual Educational Bridge */}
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-base)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    WHY THIS TRACK IS UNIQUE
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.45 }}>
                    {circuitMeta.whySpecial || 'High-speed straights and violent braking zones demand extreme aerodynamic efficiency and low drag.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.35rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link to="/learn" style={{ fontSize: '0.74rem', color: '#58a6ff', textDecoration: 'none', fontWeight: 700 }}>
                      • Learn: DRS & Low-Downforce Aero →
                    </Link>
                    <Link to="/learn" style={{ fontSize: '0.74rem', color: '#58a6ff', textDecoration: 'none', fontWeight: 700 }}>
                      • Learn: Heavy Braking & Tyres →
                    </Link>
                    <a
                      href={circuitMeta.officialCircuitUrl || 'https://www.formula1.com/en/racing/2026.html'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }}
                    >
                      <span>Official F1 Track Guide</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. LEARN F1 EDUCATIONAL TEASER */}
      <section className="container" style={{ marginTop: '3rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.08) 0%, var(--bg-surface) 100%)',
            border: '1px solid rgba(225, 6, 0, 0.25)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--f1-red)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              <BookOpen size={15} />
              <span>LEARN F1 ACADEMY</span>
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem', lineHeight: 1.25 }}>
              Master the Rules, Strategy & Formats
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 1.25rem' }}>
              Whether you are a newcomer or a seasoned race fan, explore our comprehensive guides to knockout qualifying, Pirelli tire compound strategies, official flag rules, and Parc Fermé sporting regulations.
            </p>
            <Link
              to="/learn"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
            >
              <BookOpen size={16} /> Explore Learn F1
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '0.2rem' }}>Weekend Anatomy</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Standard 3-practice vs Sprint 1-practice formats.</p>
            </div>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '0.2rem' }}>Knockout Qualifying</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Q1, Q2, and Q3 progression to Pole Position.</p>
            </div>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '0.2rem' }}>Tyres & Strategy</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Soft, Medium, Hard compounds, Undercut vs Overcut.</p>
            </div>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', marginBottom: '0.2rem' }}>Motorsport Glossary</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Demystifying 50+ technical concepts and jargon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMMUNITY / LEADERBOARD & PREDICTION PROMPT */}
      <section className="container" style={{ marginTop: '3rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Top 3 Season Podium */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  2026 COMMUNITY STANDINGS
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Season Leaderboard
                </h3>
              </div>
              <Link to="/leaderboard" className="btn btn-outline btn-sm">
                Full Standings →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topThree.map((player, idx) => {
                const fav = drivers.find(d => d.id === player.favouriteDriver);
                let rankColor = idx === 0 ? '#eab308' : idx === 1 ? '#cbd5e1' : '#d97706';

                return (
                  <Link
                    key={player.userId}
                    to={`/profile/${player.username}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: rankColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                        }}
                      >
                        {idx + 1}
                      </div>

                      <UserInitialsAvatar name={player.displayName} size={34} showBorder={false} />

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {player.displayName}
                          {idx === 0 && <Crown size={13} color="#eab308" />}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          @{player.username} {fav && `• ${fav.code}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                        {player.totalPoints} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PTS</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--telemetry-green, #00e676)', fontFamily: 'var(--font-mono)' }}>
                        {player.exactP1Count} Exact P1s
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Predict & Compete Prompt Card */}
          <div className="race-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Trophy size={20} color="var(--f1-red)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  Predict & Compete
                </h3>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Test your motorsport knowledge across every Grand Prix. Pick the Pole Sitter, Podium Finishers (P1, P2, P3), and Fastest Lap before sessions lock.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>Exact Podium Finishers</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-green, #00e676)' }}>10 PTS each</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>Pole Position & Fastest Lap</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-green, #00e676)' }}>5 PTS each</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                  <span>Podium Driver (Any Position)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-yellow, #ffd600)' }}>5 PTS each</span>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <Link
                to={currentRound ? `/predict/${currentRound.roundId}` : '/predictions'}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.9rem' }}
              >
                <Zap size={16} /> Enter This Weekend's Picks
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.9rem' }}
                >
                  <LogIn size={16} /> Sign in to Predict
                </button>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Google Sign-In enables your prediction entry & leaderboard rank
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

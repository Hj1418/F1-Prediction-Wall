import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { RaceWeekend, PredictionRound, LeaderboardEntry, Driver, getCircuitName } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { CircuitMap } from '../components/common/CircuitMap';
import { PaddockFacts } from '../components/race/PaddockFacts';
import { TrackCharacter } from '../components/race/TrackCharacter';
import { getCircuitMetadata } from '../services/circuits/circuitRegistry';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Zap,
  ArrowRight,
  Trophy,
  Gauge,
  Medal,
  CheckCircle2,
  Clock,
  ChevronRight,
  Lock,
  Crown,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { dataVersion } = useApp();
  const { currentUser } = useAuth();
  const [activeWeekend, setActiveWeekend] = useState<RaceWeekend | null>(null);
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

        // Find active weekend (or first upcoming, or first available)
        const currentW = weekends.find(w => w.status === 'ACTIVE') || weekends.find(w => w.status === 'UPCOMING') || weekends[0];
        setActiveWeekend(currentW);

        if (currentW) {
          const rounds = await api.getPredictionRounds(currentW.raceWeekendId);
          setActiveRounds(rounds);

          // Find current open round, or next upcoming/locked
          const openR = rounds.find(r => r.status === 'OPEN') || rounds.find(r => r.status === 'UPCOMING') || rounds[0];
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
        <div className="live-pulse" style={{ width: '14px', height: '14px', backgroundColor: 'var(--f1-red)', marginBottom: '1rem' }} />
        <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
          LOADING RACE INFORMATION...
        </div>
      </div>
    );
  }

  const topThree = seasonLeaderboard.slice(0, 3);
  const circuitMeta = activeWeekend ? getCircuitMetadata(activeWeekend.circuit) : null;

  // Distinguish Qualifying and Race prediction rounds
  const qualiRound = activeRounds.find(r => r.roundType.includes('QUALI'));
  const raceRound = activeRounds.find(r => r.roundType.includes('RACE'));

  const startDateStr = activeWeekend ? new Date(activeWeekend.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
  const endDateStr = activeWeekend ? new Date(activeWeekend.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* 1. UPCOMING RACE HERO SECTION */}
      {activeWeekend && (
        <section
          style={{
            background: 'linear-gradient(180deg, rgba(18, 23, 34, 0.85) 0%, rgba(8, 10, 15, 0.98) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '3rem 0 2.5rem 0',
            position: 'relative',
          }}
        >
          <div className="container">
            {/* Category Eyebrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--f1-red)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                UPCOMING GRAND PRIX
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--telemetry-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 800,
                }}
              >
                <span className="live-pulse" /> ROUND {activeWeekend.roundNumber || (activeWeekend as any).round || 13} OF 24
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              {/* Left Column: Weekend details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>{activeWeekend.flag}</span>
                  <div>
                    <h1
                      style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {activeWeekend.raceName}
                    </h1>
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {getCircuitName(activeWeekend.circuit)}, {activeWeekend.country}
                    </div>
                  </div>
                </div>

                {/* Circuit tags & format */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1.25rem 0 1.75rem 0' }}>
                  <span
                    style={{
                      background: activeWeekend.weekendType === 'SPRINT' ? 'rgba(255, 128, 0, 0.15)' : 'rgba(0, 210, 190, 0.15)',
                      color: activeWeekend.weekendType === 'SPRINT' ? '#ff9500' : 'var(--telemetry-cyan)',
                      border: `1px solid ${activeWeekend.weekendType === 'SPRINT' ? 'rgba(255, 128, 0, 0.3)' : 'rgba(0, 210, 190, 0.3)'}`,
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Zap size={13} />
                    {activeWeekend.weekendType === 'SPRINT' ? 'SPRINT WEEKEND' : 'CONVENTIONAL GP FORMAT'}
                  </span>

                  <span
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Calendar size={13} /> {startDateStr} – {endDateStr}
                  </span>

                  <Link
                    to={`/races/${activeWeekend.roundNumber || activeWeekend.raceWeekendId}`}
                    style={{
                      textDecoration: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.3rem 0.5rem',
                    }}
                  >
                    Weekend Hub <ChevronRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Right Column: PREDICTIONS ARE OPEN (Primary CTA Card) */}
              <div
                className="race-card"
                style={{
                  background: 'linear-gradient(135deg, rgba(18, 23, 34, 0.95), rgba(22, 28, 40, 0.95))',
                  border: currentRound?.status === 'OPEN' ? '1px solid rgba(0, 230, 118, 0.45)' : '1px solid var(--border-medium)',
                  padding: '1.75rem',
                  boxShadow: currentRound?.status === 'OPEN' ? '0 10px 30px -5px rgba(0, 230, 118, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--telemetry-green)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="live-pulse" /> PREDICTIONS ARE OPEN
                  </span>
                  <StatusBadge status={currentRound?.status || 'OPEN'} />
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  {activeWeekend.raceName}
                </h3>

                {/* Session Status Overview Table */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    margin: '1rem 0 1.25rem 0',
                    background: 'var(--bg-input)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      QUALIFYING
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.2rem', color: qualiRound?.status === 'OPEN' ? 'var(--telemetry-green)' : '#f87171' }}>
                      {qualiRound?.status === 'OPEN' ? '🟢 OPEN' : qualiRound?.status === 'LOCKED' ? '🔴 LOCKED' : 'UPCOMING'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      GRAND PRIX RACE
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.2rem', color: raceRound?.status === 'OPEN' ? 'var(--telemetry-green)' : 'var(--text-secondary)' }}>
                      {raceRound?.status === 'OPEN' ? '🟢 OPEN' : raceRound?.status === 'LOCKED' ? '🔴 LOCKED' : 'OPENS SOON'}
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div style={{ marginBottom: '1.5rem' }}>
                  {currentRound && currentRound.status === 'OPEN' ? (
                    <CountdownTimer targetDate={currentRound.closesAt} prefix="Predictions Close In" />
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      Predictions open as the race weekend begins
                    </div>
                  )}
                </div>

                {/* Primary Button */}
                <Link
                  to={currentRound ? `/predict/${currentRound.roundId}` : `/races/${activeWeekend.roundNumber || activeWeekend.raceWeekendId}`}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem 1.25rem', justifyContent: 'center', fontSize: '0.95rem' }}
                >
                  <Zap size={16} /> MAKE YOUR PREDICTION
                </Link>
              </div>
            </div>

            {/* 2. ABOUT THE CIRCUIT SECTION */}
            <div style={{ marginTop: '3rem' }}>
              <CircuitMap circuit={activeWeekend.circuit} variant="hero" />
            </div>

            {/* 3. PADDOCK FACT & TRACK CHARACTER GRID */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem',
              }}
            >
              {circuitMeta && (
                <>
                  <PaddockFacts facts={circuitMeta.facts} circuitName={circuitMeta.name} />
                  <TrackCharacter trackCharacter={circuitMeta.trackCharacter} />
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. COMMUNITY LEADERBOARD PREVIEW SECTION */}
      <section className="container" style={{ marginTop: '3.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Season Championship Podium Card */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  2026 COMMUNITY CHAMPIONSHIP
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Season Leaderboard
                </h3>
              </div>
              <Link to="/leaderboard" className="btn btn-outline btn-sm">
                Full Standings →
              </Link>
            </div>

            {/* Top 3 Visual Podium */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topThree.map((player, idx) => {
                const fav = drivers.find(d => d.id === player.favouriteDriver);
                let rankBadgeBg = 'var(--bg-input)';
                let rankBadgeColor = 'var(--text-secondary)';
                if (idx === 0) {
                  rankBadgeBg = 'rgba(234, 179, 8, 0.2)';
                  rankBadgeColor = '#eab308';
                } else if (idx === 1) {
                  rankBadgeBg = 'rgba(203, 213, 225, 0.2)';
                  rankBadgeColor = '#cbd5e1';
                } else if (idx === 2) {
                  rankBadgeBg = 'rgba(217, 119, 6, 0.2)';
                  rankBadgeColor = '#d97706';
                }

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
                      background: idx === 0 ? 'rgba(234, 179, 8, 0.05)' : 'var(--bg-surface-elevated)',
                      border: idx === 0 ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid var(--border-subtle)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: rankBadgeBg,
                          color: rankBadgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                        }}
                      >
                        {idx + 1}
                      </div>

                      <img
                        src={player.avatarUrl}
                        alt={player.displayName}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {player.displayName}
                          {idx === 0 && <Crown size={13} color="#eab308" />}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span>@{player.username}</span>
                          {fav && (
                            <>
                              <span>•</span>
                              <span style={{ color: fav.teamColor, fontWeight: 700 }}>{fav.code}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>
                        {player.totalPoints} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PTS</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)' }}>
                        {player.exactP1Count} Exact P1s
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Simple Scoring Guide */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Medal size={20} color="var(--telemetry-cyan)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase' }}>
                How Scoring Works
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Exact P1 Winner</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-green)' }}>+15 PTS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Exact P2 or P3 Podium</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-green)' }}>+10 PTS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Podium Driver (Wrong Position)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-yellow)' }}>+5 PTS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Fastest Lap & Driver of the Day</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-cyan)' }}>+10 PTS each</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Wildcard Question</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-purple)' }}>+15 PTS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0' }}>
                <span style={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Trophy size={14} color="var(--f1-red)" /> Perfect 1-2-3 Podium Bonus
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--f1-red)' }}>+10 BONUS</span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <Link
                to={currentRound ? `/predict/${currentRound.roundId}` : '/races'}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
              >
                {currentRound ? `Predict ${currentRound.title}` : 'View Championship Calendar'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

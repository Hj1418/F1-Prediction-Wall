import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { RaceWeekend, PredictionRound, LeaderboardEntry, Driver, getCircuitName } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { useApp } from '../context/AppContext';
import {
  Flag,
  Calendar,
  Zap,
  ArrowRight,
  Trophy,
  Gauge,
  Medal,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { dataVersion } = useApp();
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
          ACQUIRING PIT WALL TELEMETRY...
        </div>
      </div>
    );
  }

  const topThree = seasonLeaderboard.slice(0, 3);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* 1. HERO RACE WEEKEND SECTION */}
      {activeWeekend && (
        <section
          style={{
            background: 'linear-gradient(180deg, rgba(18, 23, 34, 0.8) 0%, rgba(8, 10, 15, 0.95) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '3.5rem 0 2.5rem 0',
            position: 'relative',
          }}
        >
          <div className="container">
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
                FORMULA 1 COMMUNITY PREDICTION LEAGUE
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--telemetry-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <span className="live-pulse" /> ROUND {activeWeekend.roundNumber || (activeWeekend as any).round || 1} OF {(activeWeekend as any).totalRounds || 24}
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
              {/* Left Column: Weekend details & headline */}
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
                    {activeWeekend.weekendType === 'SPRINT' ? 'SPRINT WEEKEND FORMAT' : 'CONVENTIONAL GP FORMAT'}
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
                    <Gauge size={13} /> {activeWeekend.circuitLengthKm} km • {activeWeekend.laps} Laps
                  </span>

                  <Link
                    to={`/weekends/${activeWeekend.raceWeekendId}`}
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

              {/* Right Column: Next Active Prediction Card */}
              {currentRound && (
                <div
                  className="race-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(18, 23, 34, 0.95), rgba(22, 28, 40, 0.95))',
                    border: currentRound.status === 'OPEN' ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid var(--border-medium)',
                    padding: '1.75rem',
                    boxShadow: currentRound.status === 'OPEN' ? '0 10px 30px -5px rgba(0, 230, 118, 0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      FEATURED PREDICTION ROUND
                    </span>
                    <StatusBadge status={currentRound.status} />
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    {currentRound.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                    {currentRound.description}
                  </p>

                  {/* Countdown */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    {currentRound.status === 'OPEN' ? (
                      <CountdownTimer targetDate={currentRound.closesAt} prefix="Predictions Close In" />
                    ) : currentRound.status === 'LOCKED' ? (
                      <div style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700 }}>
                        🔒 PREDICTIONS LOCKED FOR THIS SESSION
                      </div>
                    ) : currentRound.status === 'SCORED' ? (
                      <div style={{ color: 'var(--telemetry-purple)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700 }}>
                        🏁 OFFICIAL RESULTS SCORED
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                        Opens: {new Date(currentRound.opensAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link
                      to={`/predict/${currentRound.roundId}`}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.85rem 1.25rem' }}
                    >
                      {currentRound.status === 'OPEN' ? (
                        <>
                          <Sparkles size={16} /> MAKE YOUR PREDICTION
                        </>
                      ) : (
                        <>
                          <ArrowRight size={16} /> VIEW PREDICTIONS & SCORES
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Race Weekend Timeline Strip */}
            {activeRounds.length > 0 && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                    WEEKEND TIMELINE & PREDICTION STAGES
                  </div>
                  <Link
                    to={`/weekends/${activeWeekend.raceWeekendId}`}
                    style={{ fontSize: '0.75rem', color: 'var(--f1-red)', textDecoration: 'none', fontWeight: 700 }}
                  >
                    View All Sessions →
                  </Link>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
                    gap: '0.75rem',
                  }}
                >
                  {activeRounds.map(round => {
                    const isSelected = currentRound?.roundId === round.roundId;
                    return (
                      <Link
                        key={round.roundId}
                        to={`/predict/${round.roundId}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-card)',
                          border: `1px solid ${isSelected ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {round.roundType.replace('_', ' ')}
                          </span>
                          <StatusBadge status={round.status} size="sm" />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                          {round.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={11} />
                          {round.status === 'OPEN' ? 'Closes at race start' : round.status}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. CHAMPIONSHIP STANDINGS & HIGHLIGHTS GRID */}
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.2rem' }}>
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
                        <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{player.displayName}</div>
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

          {/* Scoring Rules Quick Reference Card */}
          <div className="race-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Medal size={20} color="var(--telemetry-cyan)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase' }}>
                How Scoring Works
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Exact P1 Position</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-green)' }}>+15 PTS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>Exact P2 or P3 Position</span>
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
                <span>Session Wild Card Question</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--telemetry-purple)' }}>+15 PTS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0' }}>
                <span style={{ fontWeight: 800, color: '#fff' }}>🎯 Perfect 1-2-3 Podium Bonus</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--f1-red)' }}>+10 BONUS</span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <Link to="/predict/round_chn_gp" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Make Predictions Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

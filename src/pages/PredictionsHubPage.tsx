import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { RaceWeekend, PredictionRound, Prediction } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { LoadingState } from '../components/common/LoadingState';
import {
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Trophy,
  LogIn,
  Zap,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const PredictionsHubPage: React.FC = () => {
  const { currentUser, isAuthenticated, openLoginModal } = useAuth();
  const { dataVersion } = useApp();

  const [currentWeekend, setCurrentWeekend] = useState<RaceWeekend | null>(null);
  const [upcomingWeekends, setUpcomingWeekends] = useState<RaceWeekend[]>([]);
  const [currentRounds, setCurrentRounds] = useState<PredictionRound[]>([]);
  const [userPredictions, setUserPredictions] = useState<Record<string, Prediction | null>>({});
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHubData() {
      try {
        setLoading(true);
        const [weekends, allRounds] = await Promise.all([
          api.getRaceWeekends(),
          api.getPredictionRounds(),
        ]);

        const activeW = weekends.find(w => w.status === 'ACTIVE') || weekends.find(w => w.status === 'UPCOMING') || weekends[0];
        setCurrentWeekend(activeW || null);

        const futureW = weekends.filter(w => w.raceWeekendId !== activeW?.raceWeekendId && w.status !== 'COMPLETED');
        setUpcomingWeekends(futureW);

        if (activeW) {
          const weekendRounds = allRounds.filter(r => r.raceWeekendId === activeW.raceWeekendId);
          setCurrentRounds(weekendRounds);

          if (currentUser?.userId) {
            const predMap: Record<string, Prediction | null> = {};
            await Promise.all(
              weekendRounds.map(async r => {
                const p = await api.getUserPrediction(r.roundId, currentUser.userId);
                predMap[r.roundId] = p;
              })
            );
            setUserPredictions(predMap);

            const hist = await api.getUserPredictionsHistory(currentUser.userId);
            setUserHistory(hist);
          }
        }
      } catch (err) {
        console.error('Failed to load predictions hub data', err);
      } finally {
        setLoading(false);
      }
    }

    loadHubData();
  }, [currentUser?.userId, dataVersion]);

  if (loading) {
    return <LoadingState message="LOADING YOUR PREDICTIONS..." />;
  }

  const isGuest = !currentUser || currentUser.userId.startsWith('guest');

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          COMMUNITY PREDICTION LEAGUE
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
          Predictions Hub
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
          Predict qualifying and race outcomes, check session deadlines, and review your points.
        </p>
      </div>

      {/* 1. PREDICTIONS OPEN */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <span className="live-pulse" style={{ backgroundColor: 'var(--telemetry-green)' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            Predictions Open
          </h2>
          {currentWeekend && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              — {currentWeekend.raceName}
            </span>
          )}
        </div>

        {currentRounds.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {currentRounds.map(round => {
              const userPred = userPredictions[round.roundId];
              const isLocked = round.status === 'LOCKED';
              const isOpen = round.status === 'OPEN';

              return (
                <div
                  key={round.roundId}
                  className="race-card"
                  style={{
                    padding: '1.5rem',
                    border: isOpen ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {round.roundType.replace('_', ' ')}
                      </span>
                      <StatusBadge status={round.status} size="sm" />
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      {round.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                      {round.description}
                    </p>
                  </div>

                  <div>
                    {/* Countdown or status */}
                    <div style={{ marginBottom: '1rem' }}>
                      {isOpen ? (
                        <CountdownTimer targetDate={round.closesAt} prefix="Closes in" />
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: isLocked ? '#f87171' : 'var(--telemetry-purple)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {isLocked ? <Lock size={14} /> : <CheckCircle2 size={14} />}
                          {isLocked ? 'Predictions Locked' : 'Scored'}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/predict/${round.roundId}`}
                      onClick={e => {
                        if (!isAuthenticated && isOpen) {
                          e.preventDefault();
                          openLoginModal(`/predict/${round.roundId}`);
                        }
                      }}
                      className={`btn ${isOpen ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                    >
                      {isOpen ? (
                        <>
                          <Zap size={14} /> {userPred ? 'UPDATE PREDICTION' : 'MAKE PREDICTION'}
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} /> View Picks & Telemetry
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="race-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No prediction rounds currently active.
          </div>
        )}
      </section>

      {/* 2. COMING UP */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Clock size={18} color="var(--telemetry-cyan)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            Coming Up
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {upcomingWeekends.slice(0, 4).map(w => {
            const startStr = new Date(w.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
            const endStr = new Date(w.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={w.raceWeekendId}
                className="race-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{w.flag}</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                      {w.raceName}
                    </h4>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {w.country} • {startStr} – {endStr}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  Predictions open when race weekend begins
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. YOUR RESULTS */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Trophy size={18} color="var(--telemetry-yellow)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            Your Results
          </h2>
        </div>

        {userHistory.length > 0 ? (
          <div className="race-card" style={{ overflow: 'hidden' }}>
            <table className="timing-table">
              <thead>
                <tr>
                  <th>GRAND PRIX</th>
                  <th>SESSION</th>
                  <th style={{ textAlign: 'center' }}>DATE</th>
                  <th style={{ textAlign: 'right' }}>POINTS</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {userHistory.map(({ prediction: p, round: r, score: s, weekend: w }) => (
                  <tr key={p.predictionId}>
                    <td style={{ fontWeight: 800, color: '#fff' }}>
                      <span style={{ marginRight: '0.4rem' }}>{w?.flag || '🏁'}</span>
                      {w?.raceName || 'Grand Prix'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {r?.title || 'Session'}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(p.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 900, color: s ? 'var(--telemetry-green)' : 'var(--text-muted)', fontSize: '1.05rem' }}>
                      {s ? `+${s.totalScore} PTS` : 'PENDING'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/predict/${p.roundId}`} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="race-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No past prediction scores recorded yet. Submit your first prediction above!
          </div>
        )}
      </section>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { RaceWeekend, PredictionRound, Prediction } from '../types';
import { getSharedRaceContext, getActiveTestPredictionContext, PredictionContext } from '../services/schedule/raceContextService';
import { isQualificationPredictionRound } from '../services/schedule/predictionRoundGenerator';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { LoadingState } from '../components/common/LoadingState';
import { evaluateRoundState } from '../utils/raceLifecycle';
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

  // Test Grand Prix context (when activated by Admin)
  const [testContext, setTestContext] = useState<PredictionContext | null>(null);
  const [userTestPrediction, setUserTestPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    document.title = 'Prediction Bench | The Grid';
  }, []);

  // 1. Stable weekend & round metadata loading (does not re-query on auth changes)
  useEffect(() => {
    let mounted = true;
    async function loadMetadata() {
      try {
        setLoading(true);
        const [sharedCtx, weekends, allRounds] = await Promise.all([
          getSharedRaceContext(2026),
          api.getRaceWeekends(2026),
          api.getPredictionRounds(),
        ]);

        if (!mounted) return;

        const activeW = sharedCtx ? sharedCtx.currentWeekend : (weekends.find(w => w.status === 'ACTIVE') || weekends.find(w => w.status === 'UPCOMING') || weekends[0]);
        setCurrentWeekend(activeW || null);

        const futureW = weekends.filter(w => w.raceWeekendId !== activeW?.raceWeekendId && w.status !== 'COMPLETED');
        setUpcomingWeekends(futureW);

        if (activeW) {
          const weekendRounds = allRounds.filter(r => r.raceWeekendId === activeW.raceWeekendId && !isQualificationPredictionRound(r));
          setCurrentRounds(weekendRounds);
        }

        // Check for active test context
        const activeTestCtx = getActiveTestPredictionContext();
        setTestContext(activeTestCtx);
      } catch (err) {
        console.error('Failed to load predictions hub metadata', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMetadata();
    return () => {
      mounted = false;
    };
  }, [dataVersion]);

  // 2. User predictions loading (runs when auth state resolves without reloading entire page)
  useEffect(() => {
    let mounted = true;
    async function loadUserData() {
      // Load user test prediction if test context is active
      const activeTestCtx = getActiveTestPredictionContext();
      if (activeTestCtx && currentUser?.userId) {
        api.getUserPrediction(activeTestCtx.roundId, currentUser.userId).then(p => {
          if (mounted) setUserTestPrediction(p);
        }).catch(() => {});
      } else if (mounted) {
        setUserTestPrediction(null);
      }

      if (!currentWeekend || !currentUser?.userId) {
        setUserPredictions({});
        setUserHistory([]);
        return;
      }

      try {
        const [predMap, hist] = await Promise.all([
          api.getUserWeekendPredictions(currentUser.userId, currentWeekend.raceWeekendId),
          api.getUserPredictionsHistory(currentUser.userId),
        ]);

        if (!mounted) return;
        setUserPredictions(predMap || {});
        setUserHistory(hist || []);
      } catch (err) {
        console.warn('Failed to load user predictions in hub', err);
      }
    }

    loadUserData();
    return () => {
      mounted = false;
    };
  }, [currentUser?.userId, currentWeekend?.raceWeekendId, dataVersion]);

  if (loading) {
    return <LoadingState message="LOADING YOUR PREDICTIONS..." />;
  }

  const isGuest = !currentUser || currentUser.userId.startsWith('guest');

  const getTestDriverName = (driverId?: string): string => {
    if (!driverId) return '—';
    if (driverId.startsWith('test-')) {
      const formatted = driverId.replace('test-', '');
      return 'Test Driver ' + formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return driverId;
  };

  const hasOpenRounds = currentRounds.some(r => r.status === 'OPEN');
  const allUpcoming = currentRounds.length > 0 && currentRounds.every(r => r.status === 'UPCOMING');
  const allLocked = currentRounds.length > 0 && currentRounds.every(r => r.status === 'LOCKED');
  const allScored = currentRounds.length > 0 && currentRounds.every(r => r.status === 'SCORED');

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          THE GRID • INTERACTIVE COMPETITION
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
          Prediction Bench
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
          Prediction Bench is The Grid's interactive competition layer. Put your strategy foresight to the test: pick the Podium Finishers (P1, P2, P3), Fastest Lap, Driver of the Day, and Race Strategy wildcards before the race locks to earn points and climb the championship leaderboard.
        </p>
      </div>

      {/* 0. TEST GRAND PRIX (SANDBOX CONTEXT - DISPLAYED ONLY WHEN ACTIVATED BY ADMIN) */}
      {testContext && testContext.round && testContext.round.status !== 'UPCOMING' && (
        <section
          className="animate-fade-in"
          style={{
            marginBottom: '3rem',
            padding: '1.75rem clamp(1rem, 3vw, 2rem)',
            background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.08) 0%, rgba(185, 102, 255, 0.05) 100%)',
            border: '2px dashed rgba(0, 210, 255, 0.5)',
            borderRadius: '16px',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🧪</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: 'var(--telemetry-cyan)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    TEST GRAND PRIX
                  </span>
                  <span
                    style={{
                      background: 'rgba(0, 210, 255, 0.2)',
                      color: 'var(--telemetry-cyan)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {testContext.raceId}
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.65rem)', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0 0' }}>
                  {testContext.weekend?.raceName || 'The Grid Test Grand Prix'}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-muted)' }}>
                Prediction Round:
              </span>
              <StatusBadge status={testContext.round.status} size="sm" />
            </div>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', maxWidth: '750px' }}>
            This is a test race. Predictions and scores will not affect the production leaderboard.
          </p>

          {/* User's Test Prediction state */}
          {userTestPrediction ? (
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(0, 230, 118, 0.4)',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--telemetry-green)', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  <Lock size={14} /> YOUR TEST PREDICTION 🔒
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>P1</strong> — {getTestDriverName(userTestPrediction.predictionData?.p1)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>P2</strong> — {getTestDriverName(userTestPrediction.predictionData?.p2)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>P3</strong> — {getTestDriverName(userTestPrediction.predictionData?.p3)}
                  </span>
                  {userTestPrediction.predictionData?.fastestLap && (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#fff' }}>Fastest Lap</strong> — {getTestDriverName(userTestPrediction.predictionData?.fastestLap)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--telemetry-green)', fontWeight: 700, marginTop: '0.4rem' }}>
                  Prediction Locked
                </div>
              </div>

              <Link
                to={`/predict/${testContext.roundId}`}
                className="btn btn-primary btn-sm"
                style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}
              >
                VIEW TEST PREDICTION
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '1.25rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                  Ready to test the prediction lifecycle?
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Submit podium and fastest lap predictions with deterministic test drivers.
                </div>
              </div>

              <Link
                to={`/predict/${testContext.roundId}`}
                className="btn btn-primary"
                style={{
                  background: 'var(--telemetry-cyan)',
                  color: '#000000',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                MAKE TEST PREDICTION
              </Link>
            </div>
          )}
        </section>
      )}

      {/* 1. WEEKEND PREDICTIONS SECTION */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {hasOpenRounds ? (
            <span className="live-pulse" style={{ backgroundColor: 'var(--telemetry-green)' }} />
          ) : allUpcoming ? (
            <Clock size={18} color="var(--telemetry-cyan)" />
          ) : allLocked ? (
            <Lock size={18} color="#f87171" />
          ) : allScored ? (
            <Trophy size={18} color="var(--telemetry-yellow)" />
          ) : (
            <Sparkles size={18} color="var(--telemetry-purple)" />
          )}

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            {hasOpenRounds
              ? 'Predictions Open'
              : allUpcoming
              ? 'Upcoming Predictions'
              : allLocked
              ? 'Predictions Locked'
              : allScored
              ? 'Round Results & Scores'
              : 'Weekend Predictions'}
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {currentRounds.map(round => {
              const userPred = userPredictions[round.roundId];
              const state = evaluateRoundState(round, Boolean(userPred));

              return (
                <div
                  key={round.roundId}
                  className="race-card"
                  style={{
                    padding: '1.5rem',
                    border: state.canPredict
                      ? '1px solid rgba(0, 230, 118, 0.4)'
                      : '1px solid var(--border-subtle)',
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
                      {state.canPredict ? (
                        <CountdownTimer targetDate={round.closesAt} prefix="Closes in" />
                      ) : state.predictionStatus === 'NOT_OPEN' ? (
                        <div style={{ fontSize: '0.82rem', color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} />
                          {state.displayStatusText}
                        </div>
                      ) : state.scoringStatus === 'SCORED' ? (
                        <div style={{ fontSize: '0.82rem', color: 'var(--telemetry-purple)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={14} />
                          Scored
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: '#f87171', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Lock size={14} />
                          {state.displayStatusText}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/predict/${round.roundId}`}
                      onClick={e => {
                        if (!isAuthenticated && state.canPredict) {
                          e.preventDefault();
                          openLoginModal(`/predict/${round.roundId}`);
                        }
                      }}
                      className={`btn ${state.canPredict ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                    >
                      {state.canPredict ? (
                        <>
                          <Zap size={14} /> {userPred ? 'UPDATE PREDICTION' : 'MAKE PREDICTION'}
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} /> {state.actionButtonText}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
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

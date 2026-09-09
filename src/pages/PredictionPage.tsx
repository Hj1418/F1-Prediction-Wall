import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import {
  PredictionRound,
  Prediction,
  SessionResult,
  RoundScore,
  Driver,
  RaceWeekend,
  PredictionFieldConfig,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { DriverSelectModal } from '../components/common/DriverSelectModal';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
import confetti from 'canvas-confetti';
import {
  Lock,
  Save,
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  Trophy,
  Share2,
  LogIn,
} from 'lucide-react';

export const PredictionPage: React.FC = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const { currentUser, isAuthenticated, openLoginModal } = useAuth();
  const { showToast, triggerDataRefresh } = useApp();

  const [round, setRound] = useState<PredictionRound | null>(null);
  const [weekend, setWeekend] = useState<RaceWeekend | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [officialResult, setOfficialResult] = useState<SessionResult | null>(null);
  const [userScore, setUserScore] = useState<RoundScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Driver modal selector state
  const [activeDriverField, setActiveDriverField] = useState<PredictionFieldConfig | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!roundId) return;
      try {
        setLoading(true);
        const [r, dList] = await Promise.all([
          api.getPredictionRoundById(roundId),
          api.getDrivers(),
        ]);

        setRound(r);
        setDrivers(dList);

        if (r) {
          document.title = `${r.title || 'Prediction Entry'} | Prediction Bench • The Grid`;
          const [w, existingPred, res, score] = await Promise.all([
            api.getWeekendById(r.raceWeekendId),
            currentUser ? api.getUserPrediction(r.roundId, currentUser.userId) : Promise.resolve(null),
            api.getOfficialResult(r.roundId),
            currentUser ? api.getRoundScore(r.roundId, currentUser.userId) : Promise.resolve(null),
          ]);

          setWeekend(w);
          setPrediction(existingPred);
          setOfficialResult(res);
          setUserScore(score);

          if (existingPred && existingPred.predictionData) {
            setFormData({ ...existingPred.predictionData });
          } else {
            setFormData({});
          }
        }
      } catch (err) {
        console.error('Failed to load prediction round', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [roundId, currentUser?.userId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="live-pulse" style={{ width: '12px', height: '12px', backgroundColor: 'var(--f1-red)', marginBottom: '1rem' }} />
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          LOADING PREDICTION FORM...
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Prediction Round Not Found</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Return to Overview
        </Link>
      </div>
    );
  }

  const isLocked = round.status === 'LOCKED';
  const isScored = round.status === 'SCORED';
  const isOpen = round.status === 'OPEN';
  const isReadOnly = isLocked || isScored;

  // Podium duplicate exclusion rules
  const podiumFields = ['p1', 'p2', 'p3'];
  const getDisabledDriverIdsForField = (fieldId: string) => {
    const disabledMap: Record<string, string> = {};
    if (podiumFields.includes(fieldId)) {
      podiumFields.forEach(pKey => {
        if (pKey !== fieldId && formData[pKey]) {
          disabledMap[formData[pKey]] = `Already selected for ${pKey.toUpperCase()}`;
        }
      });
    }
    return disabledMap;
  };

  const handleSelectDriver = (driverId: string) => {
    if (!activeDriverField) return;
    setFormData(prev => ({
      ...prev,
      [activeDriverField.id]: driverId,
    }));
  };

  const handleFieldChange = (fieldId: string, val: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!isAuthenticated || !currentUser) {
      showToast('Please sign in with Google or your account to submit predictions.', 'info');
      openLoginModal(`/predict/${round.roundId}`);
      return;
    }

    // Validate required fields
    for (const field of round.predictionFields) {
      if (field.required && !formData[field.id]) {
        showToast(`Please complete the required field: ${field.label}`, 'error');
        return;
      }
    }

    // Explicit podium duplicate check
    const podiumPicks = [formData.p1, formData.p2, formData.p3].filter(Boolean);
    const uniquePodiumPicks = new Set(podiumPicks);
    if (podiumPicks.length !== uniquePodiumPicks.size) {
      showToast('A driver cannot be selected more than once across podium positions (P1, P2, P3).', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const saved = await api.submitPrediction({
        userId: currentUser.userId,
        roundId: round.roundId,
        predictionData: formData,
      });

      setPrediction(saved);
      showToast('Prediction successfully submitted and locked for this round.', 'success');
      triggerDataRefresh();

      // Fire celebratory podium confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e10600', '#ff8000', '#00e676', '#ffffff'],
        });
      } catch (err) {
        // Confetti non-critical
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit prediction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find(d => d.id === id);
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-base) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '2.5rem 0 2rem 0',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Link
              to={weekend ? `/races/${weekend.roundNumber || weekend.raceWeekendId}` : '/races'}
              style={{
                textDecoration: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <ChevronLeft size={14} /> Back to {weekend ? weekend.raceName : 'Championship Calendar'}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isAuthenticated && currentUser ? (
                <>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicting as:</span>
                  <div
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <UserInitialsAvatar
                      name={currentUser.displayName}
                      imageUrl={currentUser.avatarUrl}
                      size={18}
                      showBorder={false}
                    />
                    <span>{currentUser.displayName}</span>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openLoginModal(round ? `/predict/${round.roundId}` : undefined)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', gap: '0.35rem' }}
                >
                  <LogIn size={13} /> Sign in to Predict
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{weekend?.flag || '🏁'}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  THE GRID • PREDICTION BENCH • {weekend?.raceName.toUpperCase()} • {round.roundType.replace('_', ' ')}
                </span>
                <StatusBadge status={round.status} />
              </div>

              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase' }}>
                {round.title}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: '650px' }}>
                {round.description}
              </p>
            </div>

            {/* Countdown or locked notice */}
            <div
              style={{
                background: 'var(--bg-surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.5rem',
                minWidth: '240px',
              }}
            >
              {isOpen ? (
                <CountdownTimer targetDate={round.closesAt} prefix="Predictions Close In" />
              ) : isLocked ? (
                <div style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Lock size={18} />
                  PREDICTIONS LOCKED
                </div>
              ) : (
                <div style={{ color: 'var(--telemetry-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Award size={18} />
                  SESSION SCORED
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Score & Breakdown Summary Banner (If Scored) */}
        {isScored && userScore && (
          <div
            className="race-card animate-fade-in"
            style={{
              padding: '1.75rem',
              marginBottom: '2rem',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, var(--bg-surface-card) 100%)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--telemetry-purple)',
                    letterSpacing: '0.1em',
                  }}
                >
                  OFFICIAL SESSION SCORECARD
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  You Scored {userScore.totalScore} Points!
                </h2>
                {userScore.breakdown.perfectPodiumBonus ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', fontWeight: 800, fontSize: '0.85rem', marginTop: '0.4rem' }}>
                    <Sparkles size={16} /> PERFECT PODIUM BONUS ACHIEVED (+10 PTS)!
                  </div>
                ) : null}
              </div>

              {/* Point chips breakdown */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Object.entries(userScore.breakdown).map(([key, pts]) => (
                  <div
                    key={key}
                    style={{
                      background: 'var(--bg-input)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: (pts || 0) > 0 ? 'var(--telemetry-green)' : 'var(--text-muted)' }}>
                      +{pts} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lock Banner if locked */}
        {isLocked && !isScored && (
          <div
            className="race-card"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Lock size={22} color="#f87171" />
              <div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#f87171' }}>
                  Predictions Locked for this session
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  The session deadline has passed. Your submitted prediction is safely registered. Official results and scores will be computed once the session concludes.
                </div>
              </div>
            </div>
            {prediction && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Locked at: {new Date(prediction.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {/* Guest Prediction Notice */}
        {!isAuthenticated && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.08) 0%, rgba(22, 28, 40, 0.95) 100%)',
              border: '1px solid rgba(225, 6, 0, 0.3)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                Viewing Prediction Grid as Guest
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Sign in with Google to submit your picks, earn championship points, and join the community leaderboard.
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLoginModal(round ? `/predict/${round.roundId}` : undefined)}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Sign In to Submit
            </button>
          </div>
        )}

        {/* Dynamic Prediction Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {round.predictionFields.map(field => {
              const currentValue = formData[field.id];
              const selectedDriver = field.type === 'driver' && currentValue ? getDriverById(currentValue) : null;
              const officialVal = officialResult?.resultData?.[field.id];
              const officialDriver = field.type === 'driver' && officialVal ? getDriverById(officialVal) : null;

              return (
                <div
                  key={field.id}
                  className="race-card"
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Field Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        {field.label} {field.required && <span style={{ color: 'var(--f1-red)' }}>*</span>}
                      </label>
                      {isScored && userScore?.breakdown?.[field.id] !== undefined && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            color: (userScore.breakdown[field.id] || 0) > 0 ? 'var(--telemetry-green)' : '#f87171',
                          }}
                        >
                          +{(userScore.breakdown[field.id] || 0)} PTS
                        </span>
                      )}
                    </div>

                    {field.helperText && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                        {field.helperText}
                      </p>
                    )}

                    {/* Driver Picker Field */}
                    {field.type === 'driver' && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {selectedDriver ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-medium)',
                              borderLeft: `5px solid ${selectedDriver.teamColor}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: selectedDriver.teamColor, fontSize: '1.1rem' }}>
                                #{selectedDriver.number}
                              </span>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                                  {selectedDriver.firstName} {selectedDriver.lastName} {selectedDriver.countryFlag}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {selectedDriver.team}
                                </div>
                              </div>
                            </div>

                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => setActiveDriverField(field)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                              >
                                Change
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setActiveDriverField(field)}
                            style={{
                              width: '100%',
                              padding: '1rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-input)',
                              border: '1px dashed var(--border-medium)',
                              color: 'var(--text-secondary)',
                              cursor: isReadOnly ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => !isReadOnly && (e.currentTarget.style.borderColor = 'var(--f1-red)')}
                            onMouseLeave={e => !isReadOnly && (e.currentTarget.style.borderColor = 'var(--border-medium)')}
                          >
                            <Sparkles size={15} color="var(--f1-red)" /> Select {field.label}
                          </button>
                        )}

                        {/* If Scored: Show Official Driver Result underneath */}
                        {isScored && officialDriver && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ color: 'var(--text-muted)' }}>Official Outcome:</span>
                            <span style={{ fontWeight: 800, color: '#fff' }}>
                              #{officialDriver.number} {officialDriver.lastName} ({officialDriver.code})
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Option / Boolean Picker Field */}
                    {(field.type === 'option' || field.type === 'boolean') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {(field.options || [
                          { value: 'YES', label: 'Yes' },
                          { value: 'NO', label: 'No' },
                        ]).map(opt => {
                          const isOptSelected = String(currentValue).toUpperCase() === String(opt.value).toUpperCase();

                          return (
                            <label
                              key={opt.value}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: isOptSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-input)',
                                border: `1px solid ${isOptSelected ? 'var(--telemetry-purple)' : 'var(--border-subtle)'}`,
                                cursor: isReadOnly ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={opt.value}
                                disabled={isReadOnly}
                                checked={isOptSelected}
                                onChange={() => handleFieldChange(field.id, opt.value)}
                                style={{ accentColor: 'var(--f1-red)' }}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: isOptSelected ? 700 : 500, color: isOptSelected ? '#fff' : 'var(--text-secondary)' }}>
                                {opt.label}
                              </span>
                            </label>
                          );
                        })}

                        {isScored && officialVal !== undefined && (
                          <div
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ color: 'var(--text-muted)' }}>Official Result:</span>
                            <span style={{ fontWeight: 800, color: 'var(--telemetry-purple)' }}>{String(officialVal)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Bar / Locked Message */}
          <div
            style={{
              marginTop: '2.5rem',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-card)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              {prediction ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--telemetry-green)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} /> Prediction safely saved
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Last saved: {new Date(prediction.updatedAt).toLocaleString()}
                    {!isReadOnly && ' • You may update your choices any time before the deadline.'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Complete your selections above and submit to enter the session leaderboard.
                </div>
              )}
            </div>

            {!isReadOnly ? (
              !isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openLoginModal(`/predict/${round.roundId}`)}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '240px' }}
                >
                  <LogIn size={18} /> Sign In to Submit
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '220px' }}
                >
                  {submitting ? (
                    'LOCKING SELECTION...'
                  ) : (
                    <>
                      <Save size={18} /> {prediction ? 'UPDATE PREDICTION' : 'SUBMIT PREDICTION'}
                    </>
                  )}
                </button>
              )
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  to={`/leaderboard?type=round&id=${round.roundId}`}
                  className="btn btn-secondary"
                >
                  <Trophy size={16} color="var(--telemetry-yellow)" /> View Session Leaderboard
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Driver Selection Modal */}
      {activeDriverField && (
        <DriverSelectModal
          isOpen={Boolean(activeDriverField)}
          onClose={() => setActiveDriverField(null)}
          title={activeDriverField.label}
          drivers={drivers}
          selectedDriverId={formData[activeDriverField.id]}
          disabledDriverIds={getDisabledDriverIdsForField(activeDriverField.id)}
          onSelect={handleSelectDriver}
        />
      )}
    </div>
  );
};

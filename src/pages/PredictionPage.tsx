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
import { DriverCard } from '../components/common/DriverCard';
import { UserInitialsAvatar } from '../components/common/UserInitialsAvatar';
import { PredictionGuideCard } from '../components/predictions/PredictionGuideCard';
import { getResultsTimeline } from '../utils/predictionTimeline';
import {
  Lock,
  Save,
  CheckCircle2,
  ChevronLeft,
  Award,
  Sparkles,
  Trophy,
  LogIn,
  Edit3,
  Check,
  X as XIcon,
  Clock,
  ArrowLeft,
  BookOpen,
  CalendarClock,
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
  const [isEditing, setIsEditing] = useState(false);
  const [driverError, setDriverError] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [justLocked, setJustLocked] = useState(false);

  // Driver modal selector state
  const [activeDriverField, setActiveDriverField] = useState<PredictionFieldConfig | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!roundId) return;
      try {
        setLoading(true);
        const r = await api.getPredictionRoundById(roundId);
        setRound(r);

        let dList: Driver[] = [];
        let dErr = false;
        if (r && r.raceWeekendId) {
          try {
            dList = await api.getEligibleDrivers(r.raceWeekendId, 2026);
            if (!dList || dList.length === 0) {
              dErr = true;
            }
          } catch (_e) {
            dErr = true;
          }
        } else {
          try {
            dList = await api.getDrivers(2026);
          } catch (_e) {
            dErr = true;
          }
        }

        setDrivers(dList);
        setDriverError(dErr);

        if (r) {
          const isScoredRound = r.status === 'SCORED';
          const [w, existingPred, res, score] = await Promise.all([
            api.getWeekendById(r.raceWeekendId),
            currentUser ? api.getUserPrediction(r.roundId, currentUser.userId) : Promise.resolve(null),
            isScoredRound ? api.getOfficialResult(r.roundId) : Promise.resolve(null),
            (isScoredRound && currentUser) ? api.getRoundScore(r.roundId, currentUser.userId) : Promise.resolve(null),
          ]);

          setWeekend(w);
          setPrediction(existingPred);
          setOfficialResult(res);
          setUserScore(score);

          if (existingPred && existingPred.predictionData) {
            setFormData({ ...existingPred.predictionData });
            setIsEditing(false);
          } else {
            setFormData({});
            setIsEditing(true);
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

  // Field category badge helper
  const getFieldBadge = (fieldId: string) => {
    if (['p1', 'p2', 'p3'].includes(fieldId)) {
      return { label: 'PODIUM POSITION', color: '#ffb800', bg: 'rgba(255, 184, 0, 0.1)', icon: '🏆' };
    }
    if (fieldId === 'fastestLap') {
      return { label: 'FASTEST LAP', color: '#b966ff', bg: 'rgba(185, 102, 255, 0.1)', icon: '⚡' };
    }
    if (fieldId === 'driverOfTheDay') {
      return { label: 'DRIVER OF THE DAY', color: '#00e676', bg: 'rgba(0, 230, 118, 0.1)', icon: '⭐' };
    }
    if (fieldId === 'safetyCar') {
      return { label: 'SAFETY CAR', color: '#ffcc00', bg: 'rgba(255, 204, 0, 0.12)', icon: '🟨' };
    }
    if (fieldId === 'virtualSafetyCar') {
      return { label: 'VIRTUAL SAFETY CAR', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.12)', icon: '🟪' };
    }
    if (fieldId === 'redFlag') {
      return { label: 'RED FLAG', color: '#ff3b30', bg: 'rgba(255, 59, 48, 0.15)', icon: '🚩' };
    }
    if (fieldId === 'yellowFlag') {
      return { label: 'YELLOW FLAG', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', icon: '⚠️' };
    }
    if (fieldId === 'rainSession' || fieldId === 'rainIntermediates') {
      return { label: 'WEATHER INTEL', color: '#00d2ff', bg: 'rgba(0, 210, 255, 0.1)', icon: '🌧️' };
    }
    if (fieldId === 'winningMargin') {
      return { label: 'TIMING MARGIN', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)', icon: '⏱️' };
    }
    if (fieldId === 'retirementsOverUnder' || fieldId === 'sprintDnf') {
      return { label: 'RETIREMENTS (DNFs)', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', icon: '🔥' };
    }
    if (fieldId === 'lap1Leader') {
      return { label: 'LAP 1 BATTLE', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', icon: '🏁' };
    }
    return { label: 'WILD CARD', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '🎲' };
  };

  const isUpcoming = round.status === 'UPCOMING';
  const isLocked = round.status === 'LOCKED';
  const isScored = round.status === 'SCORED';
  const isOpen = round.status === 'OPEN';
  const isReadOnly = isLocked || isScored || isUpcoming;

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
    for (const field of (round.predictionFields || [])) {
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
        email: currentUser.email,
        displayName: currentUser.displayName,
      });

      setPrediction(saved);
      setIsEditing(false);
      setJustLocked(true);
      setTimeout(() => setJustLocked(false), 4000);
      showToast('Prediction successfully submitted and locked for this round.', 'success');
      triggerDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit prediction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find(d => d.id === id);
  };

  const getDriverName = (driverId?: string): string => {
    if (!driverId) return '—';
    const d = getDriverById(driverId);
    if (d) return `${d.firstName} ${d.lastName}`;
    if (driverId.startsWith('test-')) {
      const formatted = driverId.replace('test-', '');
      return 'Test Driver ' + formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return driverId;
  };

  const isTestRound = Boolean(
    round?.roundId?.startsWith('TEST_') ||
    round?.raceWeekendId?.startsWith('TEST_') ||
    weekend?.raceWeekendId?.startsWith('TEST_')
  );

  return (
    <div style={{ paddingBottom: '5rem', position: 'relative' }}>
      {/* Short Lightweight Lock Confirmation Animation */}
      {justLocked && (
        <div
          className="animate-lock-pop"
          style={{
            position: 'fixed',
            top: '4.5rem',
            right: '1.5rem',
            zIndex: 9999,
            background: 'rgba(10, 14, 23, 0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--telemetry-green)',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            boxShadow: '0 8px 30px rgba(0, 230, 118, 0.25), 0 0 1px rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#ffffff',
            maxWidth: '90vw',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 230, 118, 0.15)',
              border: '1px solid rgba(0, 230, 118, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--telemetry-green)',
              fontWeight: 900,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            ✓
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 900,
                color: 'var(--telemetry-green)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              PREDICTION LOCKED ✓
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Your strategy picks are securely recorded for scoring.
            </div>
          </div>
        </div>
      )}
      {/* Test Environment Banner */}
      {isTestRound && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(0, 210, 255, 0.2) 0%, rgba(185, 102, 255, 0.15) 100%)',
            borderBottom: '2px dashed rgba(0, 210, 255, 0.6)',
            padding: '0.65rem 1rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: 'var(--telemetry-cyan)',
            letterSpacing: '0.08em',
          }}
        >
          🧪 TEST GRAND PRIX ENVIRONMENT • SEPARATED FROM PRODUCTION DATA • LEADERBOARD ISOLATED
        </div>
      )}

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
              to={isTestRound ? '/predictions' : (weekend ? `/races/${weekend.roundNumber || weekend.raceWeekendId}` : '/races')}
              style={{
                textDecoration: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <ChevronLeft size={14} /> Back to {isTestRound ? 'Prediction Hub' : (weekend ? weekend.raceName : 'Championship Calendar')}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setIsGuideOpen(true);
                  const el = document.getElementById('scoring-guide');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.76rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: '1px solid rgba(0, 210, 255, 0.4)',
                  color: 'var(--telemetry-cyan)',
                  background: 'rgba(0, 210, 255, 0.08)',
                  padding: '0.3rem 0.75rem',
                }}
              >
                <BookOpen size={14} /> {isGuideOpen ? 'Scoring & Rules Guide' : 'Show Scoring Guide'}
              </button>

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
                <span style={{ fontSize: '1.8rem' }}>{isTestRound ? '🧪' : (weekend?.flag || '🏁')}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: isTestRound ? 'var(--telemetry-cyan)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {isTestRound
                    ? `THE GRID • TEST BENCH • ${(weekend?.raceName || 'TEST GRAND PRIX').toUpperCase()}`
                    : `THE GRID • PREDICTION BENCH • ${weekend?.raceName.toUpperCase()} • ${round.roundType.replace('_', ' ')}`}
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
              ) : isUpcoming ? (
                <div style={{ color: 'var(--telemetry-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Clock size={18} />
                  PREDICTIONS OPEN SOON
                </div>
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

              {/* Race Results Out Notice */}
              {(() => {
                const timeline = getResultsTimeline(round);
                return (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontWeight: 700,
                        color: isScored
                          ? 'var(--telemetry-purple)'
                          : isLocked
                          ? '#fb923c'
                          : 'var(--telemetry-cyan)',
                      }}
                    >
                      <CalendarClock size={13} />
                      <span>{isScored ? 'RESULTS PUBLISHED' : `RESULTS OUT: ~${timeline.formattedExpectedResultsTime}`}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {timeline.shortEta}
                    </div>
                  </div>
                );
              })()}
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

        {/* Upcoming Banner if upcoming */}
        {isUpcoming && (
          <div
            className="race-card"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(0, 210, 255, 0.4)',
              background: 'rgba(0, 210, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={22} color="var(--telemetry-cyan)" />
              <div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--telemetry-cyan)' }}>
                  Predictions Open Soon
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  This prediction round is scheduled for the upcoming race weekend. Entry will unlock when the race weekend commences. You are currently viewing the format in read-only preview mode.
                </div>
              </div>
            </div>
            <Link to="/predictions" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
              <ArrowLeft size={14} /> Return to Prediction Hub
            </Link>
          </div>
        )}

        {/* Guest Prediction Notice */}
        {!isAuthenticated && isOpen && (
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

        {/* Driver Loading Error Notice */}
        {driverError && (
          <div
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <span>⚠️</span>
            <span>Driver list unavailable — please refresh or try again shortly.</span>
          </div>
        )}

        {/* In-Page Prediction & Scoring Guide (Displayed outside directly on page) */}
        <div style={{ marginBottom: '2rem' }}>
          <PredictionGuideCard
            isOpen={isGuideOpen}
            onToggle={() => setIsGuideOpen(prev => !prev)}
          />
        </div>

        {/* PREDICTION SUBMITTED SUMMARY & POST-RACE COMPARISON (STEPS 6 & 7) */}
        {prediction && !isEditing ? (
          <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
            {/* Header & Status Bar */}
            <div
              className="race-card"
              style={{
                padding: '1.5rem clamp(1rem, 3vw, 1.75rem)',
                marginBottom: '1.5rem',
                border: '1px solid rgba(0, 230, 118, 0.35)',
                background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.08) 0%, var(--bg-surface-card) 100%)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{isTestRound ? '🧪' : '🔒'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 900, color: 'var(--telemetry-green)', letterSpacing: '0.08em' }}>
                    {isTestRound ? '🧪 TEST PREDICTION LOCKED' : '🔒 PREDICTIONS LOCKED'}
                  </span>
                  <span style={{ background: 'rgba(0, 230, 118, 0.15)', color: 'var(--telemetry-green)', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                    {isTestRound ? 'TEST REGISTERED' : 'REGISTERED'}
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                  {isTestRound ? '🔒 YOUR TEST PREDICTION' : '🔒 YOUR LOCKED PREDICTION'}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Submitted: {new Date(prediction.updatedAt).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {isTestRound
                    ? 'Test scores are calculated by the admin test console. Isolated from production championship.'
                    : 'Scores will be calculated after the race concludes.'}
                  {!isLocked && !isScored && ' You may update your choices anytime before deadline.'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                {!isLocked && !isScored && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  >
                    <Edit3 size={14} /> Edit My Picks
                  </button>
                )}
                <Link
                  to={`/leaderboard?type=round&id=${round.roundId}`}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <Trophy size={14} color="var(--telemetry-yellow)" /> Live Leaderboard
                </Link>
              </div>
            </div>

            {/* Immediate Clean Locked Prediction Summary */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(0, 230, 118, 0.4)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--telemetry-green)', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                <Lock size={15} /> YOUR PREDICTION 🔒
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.75rem 0', color: '#ffffff' }}>
                {round.title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', fontSize: '0.92rem' }}>
                {prediction.predictionData?.p1 && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>P1</strong> — {getDriverName(prediction.predictionData.p1)}
                  </span>
                )}
                {prediction.predictionData?.p2 && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>P2</strong> — {getDriverName(prediction.predictionData.p2)}
                  </span>
                )}
                {prediction.predictionData?.p3 && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>P3</strong> — {getDriverName(prediction.predictionData.p3)}
                  </span>
                )}
                {prediction.predictionData?.fastestLap && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>Fastest Lap</strong> — {getDriverName(prediction.predictionData.fastestLap)}
                  </span>
                )}
                {prediction.predictionData?.safetyCar && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>Safety Car</strong> — {prediction.predictionData.safetyCar}
                  </span>
                )}
                {prediction.predictionData?.virtualSafetyCar && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>VSC</strong> — {prediction.predictionData.virtualSafetyCar}
                  </span>
                )}
                {prediction.predictionData?.redFlag && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>Red Flag</strong> — {prediction.predictionData.redFlag}
                  </span>
                )}
                {prediction.predictionData?.yellowFlag && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fff' }}>Yellow Flag</strong> — {prediction.predictionData.yellowFlag}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--telemetry-green)', fontWeight: 700, marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} /> Prediction Locked
              </div>
            </div>

            {/* Grid of User Submitted Picks */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {(round.predictionFields || []).map(field => {
                const userPickVal = prediction.predictionData?.[field.id];
                const selectedDriver = field.type === 'driver' && userPickVal ? getDriverById(userPickVal) : null;
                const officialVal = officialResult?.resultData?.[field.id];
                const officialDriver = field.type === 'driver' && officialVal ? getDriverById(officialVal) : null;
                const badge = getFieldBadge(field.id);
                const ptsEarned = userScore?.breakdown?.[field.id];
                const isCorrect = isScored && (ptsEarned !== undefined ? ptsEarned > 0 : (userPickVal && officialVal && String(userPickVal).trim().toUpperCase() === String(officialVal).trim().toUpperCase()));

                return (
                  <div
                    key={field.id}
                    className="race-card"
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: 'var(--bg-surface-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      {/* Field Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            background: badge.bg,
                            border: `1px solid ${badge.color}40`,
                            color: badge.color,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {badge.label}
                        </span>
                        {isScored && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              color: isCorrect ? 'var(--telemetry-green)' : 'var(--text-muted)',
                            }}
                          >
                            {isCorrect ? <Check size={13} strokeWidth={3} /> : <XIcon size={13} strokeWidth={3} />}
                            {ptsEarned !== undefined ? `+${ptsEarned} pts` : (isCorrect ? 'CORRECT' : 'INCORRECT')}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {field.label}
                      </div>

                      {/* Pick Display */}
                      {field.type === 'driver' ? (
                        selectedDriver ? (
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderLeft: `4px solid ${selectedDriver.teamColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: selectedDriver.teamColor, fontSize: '1.1rem' }}>
                                #{selectedDriver.number}
                              </span>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>
                                  {selectedDriver.firstName} {selectedDriver.lastName} {selectedDriver.countryFlag}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {selectedDriver.team}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No driver selected
                          </div>
                        )
                      ) : (
                        <div
                          style={{
                            padding: '0.65rem 0.9rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#fff',
                            display: 'inline-block',
                          }}
                        >
                          {String(userPickVal || 'None')}
                        </div>
                      )}
                    </div>

                    {/* Step 7 Post-Race Comparison Outcome */}
                    {isScored && (officialDriver || officialVal !== undefined) && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>Official Outcome:</span>
                        <span style={{ fontWeight: 800, color: '#fff' }}>
                          {officialDriver ? `#${officialDriver.number} ${officialDriver.lastName}` : String(officialVal)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Dynamic Prediction Form */
          <form onSubmit={handleSubmit}>
            {prediction && isEditing && (
              <div
                style={{
                  background: 'rgba(225, 6, 0, 0.08)',
                  border: '1px solid rgba(225, 6, 0, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                  <strong>Editing Prediction:</strong> Update any field below and submit to overwrite your previous choices.
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  Cancel & View Saved Picks
                </button>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '1.5rem',
              }}
            >
              {(round.predictionFields || []).map(field => {
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
                      {/* Category Badge & Score */}
                      {(() => {
                        const badge = getFieldBadge(field.id);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '999px',
                                background: badge.bg,
                                border: `1px solid ${badge.color}40`,
                                color: badge.color,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {badge.label}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {field.required ? 'REQUIRED' : 'OPTIONAL'}
                            </span>
                          </div>
                        );
                      })()}

                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        {field.label}
                      </div>
                      {field.helperText && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                          {field.helperText}
                        </div>
                      )}

                      {/* Driver Selection Field */}
                      {field.type === 'driver' && (
                        <div>
                          {selectedDriver ? (
                            <div style={{ position: 'relative' }}>
                              <DriverCard
                                driver={selectedDriver}
                                isSelected={true}
                                onClick={() => !isReadOnly && setActiveDriverField(field)}
                              />
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange(field.id, '')}
                                  style={{
                                    position: 'absolute',
                                    right: '-8px',
                                    top: '-8px',
                                    background: 'var(--f1-red)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                  }}
                                  title="Clear selection"
                                >
                                  ×
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

            {/* Review Your Prediction Panel */}
            {!isReadOnly && (
              <div
                style={{
                  marginTop: '2.5rem',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📋</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '0.04em' }}>
                      Review Your Prediction
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    CONFIRM SELECTIONS BEFORE LOCKING
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {(round.predictionFields || []).map(f => {
                    const val = formData[f.id];
                    let displayVal = '— Not selected —';
                    if (f.type === 'driver' && val) {
                      const d = getDriverById(val);
                      displayVal = d ? `${d.firstName} ${d.lastName} (${d.team})` : val;
                    } else if (f.type === 'boolean' && val !== undefined) {
                      displayVal = val === true ? 'YES' : 'NO';
                    } else if (val) {
                      displayVal = String(val);
                    }

                    return (
                      <div
                        key={f.id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          background: 'var(--bg-input)',
                          border: val ? '1px solid var(--border-medium)' : '1px dashed var(--border-subtle)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {f.label}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: val ? '#ffffff' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {displayVal}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submission Bar / Locked Message */}
            <div
              style={{
                marginTop: '1.5rem',
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
                ) : isUpcoming ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--telemetry-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} /> Predictions will open when the race weekend commences.
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Complete your selections above, review your choices, and click Lock Prediction.
                  </div>
                )}
              </div>

              {!isReadOnly ? (
                !isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => openLoginModal(`/predict/${round.roundId}`)}
                    className="btn btn-primary btn-lg"
                    style={{ minWidth: 'min(100%, 240px)' }}
                  >
                    <LogIn size={18} /> Sign In to Submit
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-lg"
                    style={{ minWidth: 'min(100%, 240px)', letterSpacing: '0.04em' }}
                  >
                    {submitting ? (
                      'LOCKING PREDICTION...'
                    ) : (
                      <>
                        <Lock size={18} />{' '}
                        {prediction
                          ? isTestRound
                            ? 'LOCK UPDATED TEST PREDICTION'
                            : 'LOCK UPDATED PREDICTION'
                          : isTestRound
                            ? 'LOCK TEST PREDICTION'
                            : 'LOCK PREDICTION'}
                      </>
                    )}
                  </button>
                )
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {isUpcoming ? (
                    <Link
                      to="/predictions"
                      className="btn btn-secondary"
                    >
                      <ArrowLeft size={16} /> Return to Prediction Hub
                    </Link>
                  ) : (
                    <Link
                      to={`/leaderboard?type=round&id=${round.roundId}`}
                      className="btn btn-secondary"
                    >
                      <Trophy size={16} color="var(--telemetry-yellow)" /> View Session Leaderboard
                    </Link>
                  )}
                </div>
              )}
            </div>
          </form>
        )}
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Calendar,
  Zap,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Lock,
  Trophy,
  CheckCircle2,
  Clock,
  CalendarClock,
  Sparkles,
  MapPin,
  Flame,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import { Prediction, RoundScore, Driver } from '../types';
import {
  DEFAULT_HOME_SNAPSHOT,
  HomeSnapshot,
  getHomeSnapshot,
} from '../services/home/homeSnapshotService';
import { getAllChampionships } from '../services/motorsport/motorsportRegistry';
import { PredictionSpeedometer } from '../components/predictions/PredictionSpeedometer';
import { testGrandPrixService } from '../services/testGrandPrix/testGrandPrixService';

export const HomePage: React.FC = () => {
  const { openSearch } = useApp();
  const { currentUser, isAuthenticated, openLoginModal } = useAuth();
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(DEFAULT_HOME_SNAPSHOT);
  const [activeLearnTab, setActiveLearnTab] = useState<'topics' | 'thirty_seconds'>('topics');
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null);
  const [userScore, setUserScore] = useState<RoundScore | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    document.title = 'The Grid | Your Motorsport Starting Point';
  }, []);

  // Background fetch for live updates without ever blocking initial render
  useEffect(() => {
    let isMounted = true;
    getHomeSnapshot()
      .then(data => {
        if (isMounted) {
          setSnapshot(data);
        }
      })
      .catch(err => {
        console.warn('Background snapshot fetch error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    nextRace,
    racingNowOrNext,
    indianMotorsport,
    featuredLearnTopics,
    understandIn30Seconds,
    discoverMoreItems,
    predictionHighlight,
  } = snapshot;

  useEffect(() => {
    let isMounted = true;
    if (!currentUser?.userId || !predictionHighlight?.roundId) {
      setUserPrediction(null);
      setUserScore(null);
      return;
    }

    const isScoredRound = predictionHighlight.status === 'SCORED';
    Promise.all([
      api.getUserPrediction(predictionHighlight.roundId, currentUser.userId).catch(() => null),
      isScoredRound ? api.getRoundScore(predictionHighlight.roundId, currentUser.userId).catch(() => null) : Promise.resolve(null),
      api.getDrivers(2026).catch(() => [] as Driver[]),
    ]).then(([pred, score, drvs]) => {
      if (isMounted) {
        setUserPrediction(pred);
        setUserScore(score);
        if (drvs && drvs.length > 0) {
          setDrivers(drvs);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.userId, predictionHighlight?.roundId]);

  const getDriverLastName = (driverId?: string): string => {
    if (!driverId) return 'TBD';
    const d = drivers.find(drv => drv.id === driverId);
    return d ? d.lastName : driverId;
  };

  const getDriverFullName = (driverId?: string): string => {
    if (!driverId) return '—';
    const d = drivers.find(drv => drv.id === driverId);
    return d ? `${d.firstName} ${d.lastName}` : driverId;
  };

  const championships = getAllChampionships();

  return (
    <div className="homepage-root" style={{ paddingBottom: '5rem' }}>
      {/* ===================================================================
          1. HERO: The Front Door to All Motorsport
          =================================================================== */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% -10%, rgba(225, 6, 0, 0.22) 0%, var(--bg-base) 70%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '3.5rem 1.25rem 2.75rem 1.25rem',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Motorsport Category Ribbon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-mono)',
              maxWidth: '100%',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ color: 'var(--f1-red)' }}>F1</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>F2</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>F3</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span>F4</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{ color: '#00d2be' }}>FE</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{ color: '#0090d0' }}>WEC</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{ color: '#d97706' }}>GT</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{ color: '#ea580c' }}>WRC</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{ color: '#dc2626' }}>MotoGP</span>
            <span style={{ opacity: 0.3 }}>•</span>
            <span style={{ color: '#ff9933' }}>INDIA 🇮🇳</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              margin: '0 0 0.85rem 0',
              color: '#ffffff',
            }}
          >
            THE GRID
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.18rem)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 1.25rem auto',
              lineHeight: 1.5,
            }}
          >
            Your motorsport starting point. Discover, follow, learn and predict across global motorsport — from Formula 1 to MotoGP, WEC, and Indian Motorsport.
          </p>

          {/* 4 Core Platform Pillars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              marginBottom: '1.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#00d2be' }}>
              <BookOpen size={13} /> LEARN
            </span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ffd600' }}>
              <Calendar size={13} /> FOLLOW
            </span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6' }}>
              <Compass size={13} /> EXPLORE
            </span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--f1-red)' }}>
              <Zap size={13} /> COMPETE
            </span>
          </div>

          {/* Hero Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/championships"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                backgroundColor: 'var(--f1-red)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(225, 6, 0, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <Compass size={16} />
              <span>Explore Motorsport</span>
            </Link>

            <Link
              to="/races"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: '#ffffff',
                border: '1px solid var(--border-medium)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Calendar size={16} />
              <span>Global Calendar</span>
            </Link>

            <button
              type="button"
              onClick={openSearch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Search size={15} />
              <span>Search</span>
              <kbd
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  padding: '0.1rem 0.35rem',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem' }}>
        {/* ===================================================================
            2. NEXT / CURRENT RACE: Multi-Category Racing Radar
            =================================================================== */}
        <section style={{ marginTop: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--f1-red)',
                  boxShadow: '0 0 10px var(--f1-red)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--f1-red)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                NEXT UP IN MOTORSPORT
              </span>
            </div>
            <Link
              to="/races"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700,
              }}
            >
              <span>Full Calendar</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Primary Featured Event Card */}
          <div
            className="race-card-interactive"
            style={{
              background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.08) 0%, rgba(22, 27, 34, 0.95) 100%)',
              border: '1px solid rgba(225, 6, 0, 0.25)',
              borderRadius: '14px',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.25rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{nextRace.flag}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  ROUND {nextRace.roundNumber} • FORMULA 1
                </span>
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.3rem, 4vw, 1.65rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  margin: '0 0 0.25rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {nextRace.grandPrixName}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '0 0 1rem 0' }}>
                {nextRace.circuitName} • {nextRace.city}, {nextRace.country} • <strong style={{ color: '#fff' }}>{nextRace.dates}</strong>
              </p>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/races/${nextRace.roundNumber}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--f1-red)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                  }}
                >
                  <span>Race Weekend</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  to={`/circuits/${nextRace.circuitId || 'albert_park'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                  }}
                >
                  <MapPin size={13} />
                  <span>Circuit Layout</span>
                </Link>
              </div>
            </div>

            {/* Session Breakdown Mini Cards */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {nextRace.sessions.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: '1 1 80px',
                    background: s.isKeySession ? 'rgba(225, 6, 0, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: s.isKeySession ? '1px solid rgba(225, 6, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: s.isKeySession ? 'var(--f1-red)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginTop: '0.2rem',
                    }}
                  >
                    {s.day}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '0.15rem',
                    }}
                  >
                    {s.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. YOUR PREDICTION PROGRESS: Community Competition & Speedometer
            =================================================================== */}
        <section style={{ marginTop: '2.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Zap size={14} style={{ color: 'var(--f1-red)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--f1-red)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                YOUR PREDICTION PROGRESS • PREDICTION BENCH
              </span>
            </div>
            <Link
              to="/predictions"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700,
              }}
            >
              <span>Open Bench</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '1.25rem',
              alignItems: 'stretch',
            }}
          >
            {/* Speedometer Gauge Component */}
            {(() => {
              const testPoints = currentUser?.userId ? testGrandPrixService.getUserTestScore(currentUser.userId) : 0;
              const productionPoints = currentUser?.totalPoints || 0;
              const totalPoints = productionPoints + testPoints;

              return (
                <PredictionSpeedometer
                  points={totalPoints}
                  productionPoints={productionPoints}
                  testPoints={testPoints}
                  seasonRank={currentUser?.seasonRank}
                  previousRank={currentUser?.previousRank}
                  recentPoints={userScore?.totalScore}
                  recentRoundTitle={predictionHighlight.roundName}
                  championshipName="Motorsport"
                  actionLink="/predictions"
                  actionLabel="Go to Prediction Bench"
                />
              );
            })()}

            {/* Current Active Round Status Card */}
            <div
              className="race-card-interactive"
              style={{
                background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)',
                border: userScore
                  ? '1px solid rgba(157, 78, 221, 0.4)'
                  : userPrediction
                  ? '1px solid rgba(0, 230, 118, 0.35)'
                  : '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1rem' }}>🏁</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {predictionHighlight.roundName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      background:
                        predictionHighlight.status === 'OPEN'
                          ? 'rgba(0, 230, 118, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        predictionHighlight.status === 'OPEN'
                          ? 'var(--telemetry-green)'
                          : '#ef4444',
                    }}
                  >
                    {predictionHighlight.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', margin: '0 0 0.35rem 0' }}>
                  {userScore
                    ? `Scored: +${userScore.totalScore} PTS`
                    : userPrediction
                    ? 'Predictions Locked'
                    : 'Pick the Podium & Pole'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
                  {userScore
                    ? `Official race results verified. Your score has been credited to your season rank.`
                    : userPrediction
                    ? `Selections locked for ${predictionHighlight.roundName}. Results will evaluate upon race conclusion.`
                    : `Predict P1, P2, P3, and Fastest Lap before lights out to climb the championship leaderboard.`}
                </p>

                {/* Pick Preview if user has predicted */}
                {userPrediction && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(0, 230, 118, 0.06)',
                      border: '1px solid rgba(0, 230, 118, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      gap: '0.75rem',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>P1: </span>
                      <strong style={{ color: '#fff' }}>{getDriverLastName(userPrediction.predictionData?.p1)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>P2: </span>
                      <strong style={{ color: '#fff' }}>{getDriverLastName(userPrediction.predictionData?.p2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>P3: </span>
                      <strong style={{ color: '#fff' }}>{getDriverLastName(userPrediction.predictionData?.p3)}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem' }}>
                {predictionHighlight.status === 'OPEN' ? (
                  <Link
                    to={predictionHighlight.url || `/predict/${predictionHighlight.roundId}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--f1-red)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{userPrediction ? 'Review My Picks' : 'Make Your Prediction'}</span>
                    <ArrowRight size={13} />
                  </Link>
                ) : (
                  <Link
                    to="/predictions"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-medium)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Explore Prediction Bench</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
                <Link
                  to="/leaderboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  <Trophy size={13} style={{ color: '#eab308' }} />
                  <span>Leaderboard</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            4. EXPLORE MOTORSPORT: Supported Championships Registry
            =================================================================== */}
        <section style={{ marginTop: '3.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                PLATFORM REGISTRY
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0.35rem 0', color: '#fff' }}>
                Explore Motorsport
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '680px' }}>
                Discover racing disciplines, vehicle specs, and calendars across the global motorsport pyramid.
              </p>
            </div>
            <Link
              to="/championships"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700,
              }}
            >
              <span>All 10 Championships</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1rem',
            }}
          >
            {championships.slice(0, 6).map(c => (
              <Link
                key={c.id}
                to={`/championships/${c.id}`}
                className="race-card-interactive"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: `${c.badgeColor}18`,
                        color: c.badgeColor,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {c.shortName}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {c.governingBody}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem 0', lineHeight: 1.45 }}>
                    {c.tagline}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>{c.topSpeed}</span>
                  <span style={{ color: 'var(--f1-red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Explore <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================================
            5. LATEST / FEATURED: Indian Motorsport & Domestic Spotlight
            =================================================================== */}
        <section style={{ marginTop: '3.5rem' }}>
          <div
            className="race-card-interactive"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.08) 0%, rgba(22, 27, 34, 0.98) 100%)',
              border: '1px solid rgba(255, 153, 51, 0.3)',
              borderRadius: '14px',
              padding: 'clamp(1rem, 3.5vw, 1.75rem)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#ff9933', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  DOMESTIC SPOTLIGHT • INDIAN MOTORSPORT
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
                India's Racing Ecosystem
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Explore domestic championships from the Indian Racing League (IRL) to FIA F4 India, national karting pathways, and iconic venues like Buddh International Circuit.
              </p>

              <Link
                to={indianMotorsport.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '6px',
                  backgroundColor: '#ff9933',
                  color: '#0a0d14',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                }}
              >
                <span>Explore Indian Motorsport</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Quick Stat Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 153, 51, 0.2)', borderRadius: '8px', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 900, color: '#ff9933' }}>
                  {indianMotorsport.seriesCount}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Series
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 153, 51, 0.2)', borderRadius: '8px', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  {indianMotorsport.circuitsCount}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Tracks
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 153, 51, 0.2)', borderRadius: '8px', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--telemetry-green)' }}>
                  12
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  SL Points
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            6. UPCOMING RACES: Multi-Category Racing Radar
            =================================================================== */}
        <section style={{ marginTop: '3.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                GLOBAL SCHEDULE
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0.35rem 0', color: '#fff' }}>
                Upcoming Races & Weekends
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '680px' }}>
                Follow upcoming events across Formula 1, MotoGP, FIA WEC, Formula E, and WRC.
              </p>
            </div>
            <Link
              to="/races"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700,
              }}
            >
              <span>Full Racing Schedule</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1rem',
            }}
          >
            {racingNowOrNext.slice(0, 4).map((item, idx) => (
              <Link
                key={idx}
                to={item.url}
                className="race-card-interactive"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: item.badgeColor || 'var(--text-primary)',
                      }}
                    >
                      {item.badge}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.championshipName}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                    {item.eventName}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {item.circuit} • {item.location}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.75rem',
                    paddingTop: '0.6rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {item.dates}
                  </span>
                  <span style={{ color: 'var(--f1-red)', display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================================
            7. EXPLORE MOTORSPORT HUBS: Isolated Hubs & Technical Fundamentals
            =================================================================== */}
        <section style={{ marginTop: '3.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                EXPLORE MOTORSPORT
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0.35rem 0', color: '#fff' }}>
                Motorsport Fundamentals & Hubs
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '680px' }}>
                Explore isolated championship hubs with verified guides explaining racing fundamentals, machinery, strategy, and regulations.
              </p>
            </div>

            {/* Curriculum vs 30s Insights Tab Switcher */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bg-surface)',
                padding: '0.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveLearnTab('topics')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeLearnTab === 'topics' ? 'var(--f1-red)' : 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Core Concepts
              </button>
              <button
                type="button"
                onClick={() => setActiveLearnTab('thirty_seconds')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeLearnTab === 'thirty_seconds' ? 'var(--f1-red)' : 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                30-Second Guides
              </button>
            </div>
          </div>

          {activeLearnTab === 'topics' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '1rem',
              }}
            >
              {featuredLearnTopics.map((topic, idx) => (
                <Link
                  key={idx}
                  to={topic.learnUrl}
                  className="race-card-interactive"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: topic.badgeColor || 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {topic.badge || topic.category}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {topic.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
                      {topic.shortExplanation}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.6rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                      color: 'var(--f1-red)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span>Explore Hub</span>
                    <ChevronRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '1rem',
              }}
            >
              {understandIn30Seconds.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.learnUrl}
                  className="race-card-interactive"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(0, 210, 255, 0.1)',
                        color: item.badgeColor || 'var(--telemetry-cyan)',
                        fontFamily: 'var(--font-mono)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <Clock size={11} /> {item.badge || '30-SEC BRIEF'}
                    </span>

                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                      {item.quickAnswer}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.75rem',
                      paddingTop: '0.6rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                      color: 'var(--telemetry-cyan)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span>Explore in Hub</span>
                    <ChevronRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--f1-red)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <span>Explore All Motorsport Hubs</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* ===================================================================
            8. DISCOVER MORE: Curated Motorsport Knowledge Paths
            =================================================================== */}
        <section style={{ marginTop: '3.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                DEEPER CONTEXT
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0.35rem 0', color: '#fff' }}>
                More to Explore
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '680px' }}>
                Deepen your motorsport journey with circuit guides, racecraft engineering, driver pathways, and official regulations.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1rem',
            }}
          >
            {discoverMoreItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.url}
                className="race-card-interactive"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: item.tagColor || 'var(--f1-red)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.tag}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.actionText}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

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
import { getCircuitAssetUrl, CIRCUIT_SOURCE_MAPPING } from '../services/circuits/circuitRegistry';

function getCircuitSvgForRace(circuitId?: string, circuitName?: string, grandPrixName?: string): string {
  const normId = (circuitId || '').toLowerCase().trim().replace(/[-\s]+/g, '_');
  const normCircuit = (circuitName || '').toLowerCase().trim();
  const normGp = (grandPrixName || '').toLowerCase().trim();

  // 1. Direct match in CIRCUIT_SOURCE_MAPPING by ID
  if (CIRCUIT_SOURCE_MAPPING[normId]?.assetFile) {
    return CIRCUIT_SOURCE_MAPPING[normId].assetFile;
  }

  // 2. Direct key or sourceId match
  for (const [key, mapping] of Object.entries(CIRCUIT_SOURCE_MAPPING)) {
    if (normId === key || normId.includes(key) || key.includes(normId)) {
      return mapping.assetFile;
    }
    if (normCircuit.includes(mapping.sourceId) || normCircuit.includes(key)) {
      return mapping.assetFile;
    }
    if (normGp.includes(mapping.sourceId) || normGp.includes(key)) {
      return mapping.assetFile;
    }
  }

  // 3. Name heuristics
  if (normCircuit.includes('sepang') || normGp.includes('sepang') || normGp.includes('malaysia')) return 'sepang.svg';
  if (normCircuit.includes('baku') || normGp.includes('azerbaijan') || normGp.includes('baku')) return 'baku.svg';
  if (normCircuit.includes('bahrain') || normCircuit.includes('sakhir') || normGp.includes('bahrain')) return 'bahrain.svg';
  if (normCircuit.includes('monza') || normGp.includes('italian') || normGp.includes('monza')) return 'monza.svg';
  if (normCircuit.includes('silverstone') || normGp.includes('british')) return 'silverstone.svg';
  if (normCircuit.includes('spa') || normGp.includes('belgian')) return 'spa.svg';
  if (normCircuit.includes('monaco')) return 'monaco.svg';
  if (normCircuit.includes('suzuka') || normGp.includes('japanese')) return 'suzuka.svg';
  if (normCircuit.includes('melbourne') || normCircuit.includes('albert') || normGp.includes('australian')) return 'albert-park.svg';
  if (normCircuit.includes('yas marina') || normCircuit.includes('abu dhabi') || normGp.includes('abu dhabi')) return 'yas-marina.svg';
  if (normCircuit.includes('cota') || normCircuit.includes('americas') || normCircuit.includes('austin')) return 'cota.svg';
  if (normCircuit.includes('interlagos') || normGp.includes('brazil') || normGp.includes('são paulo') || normGp.includes('sao paulo')) return 'interlagos.svg';
  if (normCircuit.includes('vegas') || normGp.includes('vegas')) return 'las-vegas.svg';
  if (normCircuit.includes('losail') || normCircuit.includes('lusail') || normGp.includes('qatar')) return 'losail.svg';
  if (normCircuit.includes('jeddah') || normGp.includes('saudi')) return 'jeddah.svg';
  if (normCircuit.includes('miami')) return 'miami.svg';
  if (normCircuit.includes('imola') || normGp.includes('emilia')) return 'imola.svg';
  if (normCircuit.includes('barcelona') || normCircuit.includes('catalunya') || normGp.includes('spanish')) return 'barcelona.svg';
  if (normCircuit.includes('zandvoort') || normGp.includes('dutch')) return 'zandvoort.svg';
  if (normCircuit.includes('hungaroring') || normGp.includes('hungarian')) return 'hungaroring.svg';
  if (normCircuit.includes('montreal') || normCircuit.includes('villeneuve') || normGp.includes('canadian')) return 'montreal.svg';
  if (normCircuit.includes('spielberg') || normCircuit.includes('red bull ring') || normGp.includes('austrian')) return 'red-bull-ring.svg';
  if (normCircuit.includes('shanghai') || normGp.includes('chinese')) return 'shanghai.svg';
  if (normCircuit.includes('singapore') || normCircuit.includes('marina bay')) return 'singapore.svg';

  return 'albert-park.svg';
}

export const HomePage: React.FC = () => {
  const { openSearch } = useApp();
  const { currentUser, isAuthenticated, openLoginModal } = useAuth();
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(DEFAULT_HOME_SNAPSHOT);
  const [activeLearnTab, setActiveLearnTab] = useState<'topics' | 'thirty_seconds'>('topics');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>('ALL');
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
          {(() => {
            const circuitSvgFile = getCircuitSvgForRace(nextRace.circuitId, nextRace.circuitName, nextRace.grandPrixName);
            const circuitAssetUrl = getCircuitAssetUrl(circuitSvgFile);

            return (
              <div
                className="race-card-interactive"
                style={{
                  background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.08) 0%, rgba(22, 27, 34, 0.95) 100%)',
                  border: '1px solid rgba(225, 6, 0, 0.25)',
                  borderRadius: '14px',
                  padding: 'clamp(1.1rem, 3vw, 1.6rem)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                  gap: '1.5rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

                    {/* Prominent Prediction State Indicator */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        backgroundColor:
                          predictionHighlight.status === 'OPEN'
                            ? 'rgba(0, 230, 118, 0.15)'
                            : userPrediction
                            ? 'rgba(255, 214, 0, 0.15)'
                            : userScore
                            ? 'rgba(157, 78, 221, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color:
                          predictionHighlight.status === 'OPEN'
                            ? 'var(--telemetry-green)'
                            : userPrediction
                            ? 'var(--telemetry-yellow)'
                            : userScore
                            ? 'var(--telemetry-purple)'
                            : '#ef4444',
                        border:
                          predictionHighlight.status === 'OPEN'
                            ? '1px solid rgba(0, 230, 118, 0.35)'
                            : userPrediction
                            ? '1px solid rgba(255, 214, 0, 0.35)'
                            : userScore
                            ? '1px solid rgba(157, 78, 221, 0.35)'
                            : '1px solid rgba(239, 68, 68, 0.35)',
                      }}
                    >
                      {predictionHighlight.status === 'OPEN'
                        ? 'Prediction Open'
                        : userPrediction
                        ? '🔒 Prediction Locked'
                        : userScore
                        ? 'Result Available'
                        : 'Prediction Closed'}
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

                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Primary Prediction Action CTA */}
                    {predictionHighlight.status === 'OPEN' ? (
                      <Link
                        to={`/predict/${predictionHighlight.roundId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 1.15rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--f1-red)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          textDecoration: 'none',
                          boxShadow: '0 0 14px rgba(225, 6, 0, 0.4)',
                        }}
                      >
                        <Zap size={14} />
                        <span>MAKE PREDICTION</span>
                      </Link>
                    ) : userPrediction ? (
                      <Link
                        to={`/predict/${predictionHighlight.roundId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 1.15rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          textDecoration: 'none',
                        }}
                      >
                        <Lock size={14} style={{ color: 'var(--telemetry-green)' }} />
                        <span>VIEW PREDICTION</span>
                      </Link>
                    ) : userScore ? (
                      <Link
                        to={`/predict/${predictionHighlight.roundId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 1.15rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(157, 78, 221, 0.15)',
                          border: '1px solid rgba(157, 78, 221, 0.4)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          textDecoration: 'none',
                        }}
                      >
                        <Trophy size={14} style={{ color: 'var(--telemetry-purple)' }} />
                        <span>VIEW RESULT</span>
                      </Link>
                    ) : null}

                    <Link
                      to={`/races/${nextRace.roundNumber}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem 1rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
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

                  {/* Session Breakdown Mini Cards (if available) */}
                  {nextRace.sessions && nextRace.sessions.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      {nextRace.sessions.map((s, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex: '1 1 75px',
                            background: s.isKeySession ? 'rgba(225, 6, 0, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                            border: s.isKeySession ? '1px solid rgba(225, 6, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '0.6rem 0.45rem',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: s.isKeySession ? 'var(--f1-red)' : 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {s.name}
                          </div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#ffffff',
                              marginTop: '0.15rem',
                            }}
                          >
                            {s.day}
                          </div>
                          <div
                            style={{
                              fontSize: '0.66rem',
                              color: 'var(--text-secondary)',
                              fontFamily: 'var(--font-mono)',
                              marginTop: '0.1rem',
                            }}
                          >
                            {s.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side: Seamlessly Blended Circuit Graphic */}
                <div
                  className="circuit-blend-container"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '220px',
                    width: '100%',
                    padding: '0.5rem',
                  }}
                >
                  {/* Ambient Telemetry Radar Rings */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '240px',
                      height: '240px',
                      borderRadius: '50%',
                      border: '1px dashed rgba(255, 255, 255, 0.05)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      border: '1px dashed rgba(225, 6, 0, 0.08)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Soft Radial Ambient Glow */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '260px',
                      height: '260px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(225, 6, 0, 0.16) 0%, rgba(0, 240, 255, 0.04) 45%, transparent 70%)',
                      filter: 'blur(18px)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Clickable Circuit Track Link */}
                  <Link
                    to={`/circuits/${nextRace.circuitId || 'albert_park'}`}
                    title={`Explore ${nextRace.circuitName} Circuit Layout`}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Track SVG Vector */}
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.75rem 0',
                      }}
                    >
                      <img
                        src={circuitAssetUrl}
                        alt={`${nextRace.circuitName} track layout`}
                        className="track-svg-animated"
                        style={{
                          maxHeight: '180px',
                          maxWidth: '88%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 0 16px rgba(225, 6, 0, 0.45)) drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))',
                        }}
                      />
                    </div>

                    {/* Subtle Telemetry Footer Pill */}
                    <div
                      className="circuit-telemetry-badge"
                      style={{
                        marginTop: '0.65rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <Compass size={12} style={{ color: 'var(--f1-red)' }} />
                      <span>{nextRace.circuitName}</span>
                      <span style={{ opacity: 0.3 }}>•</span>
                      <span style={{ color: 'var(--f1-red)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                        CIRCUIT LAYOUT <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })()}
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
            4. EXPLORE MOTORSPORT: (Removed per product mandate - Discovery belongs exclusively in EXPLORE)
            =================================================================== */}

        {/* ===================================================================
            5. UPCOMING RACES: Interactive Multi-Category Racing Radar
            =================================================================== */}
        {(() => {
          const upcomingRaces = (racingNowOrNext || []).filter(item => item.championshipId !== 'indian-motorsport');
          const seriesFilterList = [
            { id: 'ALL', label: 'All Series', badge: 'ALL', count: upcomingRaces.length, badgeColor: 'var(--f1-red)' },
            ...Array.from(new Set(upcomingRaces.map(r => r.championshipId))).map(cId => {
              const item = upcomingRaces.find(r => r.championshipId === cId)!;
              return {
                id: cId,
                label: item.championshipName,
                badge: item.badge,
                badgeColor: item.badgeColor,
                count: upcomingRaces.filter(r => r.championshipId === cId).length,
              };
            }),
          ];

          const filteredRaces = selectedSeriesFilter === 'ALL'
            ? upcomingRaces.slice(0, 4)
            : upcomingRaces.filter(r => r.championshipId === selectedSeriesFilter || r.badge.toLowerCase() === selectedSeriesFilter.toLowerCase());

          return (
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
                    GLOBAL SCHEDULE
                  </span>
                  <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0.35rem 0', color: '#fff' }}>
                    Upcoming Races & Weekends
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '680px' }}>
                    Follow upcoming events across Formula 1, MotoGP, FIA WEC, Formula E, and WRC.
                  </p>
                </div>
                <Link
                  to="/races"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: 700,
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <span>Full Racing Schedule</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Interactive Series Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  marginBottom: '1.25rem',
                  scrollbarWidth: 'none',
                }}
              >
                {seriesFilterList.map(tab => {
                  const isActive = selectedSeriesFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedSeriesFilter(tab.id)}
                      className={`series-filter-pill ${isActive ? 'active' : ''}`}
                      style={
                        isActive && tab.badgeColor
                          ? {
                              borderColor: tab.badgeColor,
                              background: `${tab.badgeColor}22`,
                              boxShadow: `0 0 14px -3px ${tab.badgeColor}77`,
                              color: '#ffffff',
                            }
                          : undefined
                      }
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: tab.badgeColor || 'var(--f1-red)',
                          display: 'inline-block',
                        }}
                      />
                      <span>{tab.label}</span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          opacity: isActive ? 1 : 0.6,
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Upcoming Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                  gap: '1.15rem',
                }}
              >
                {filteredRaces.map((item, idx) => {
                  const accentColor = item.badgeColor || 'var(--f1-red)';
                  return (
                    <Link
                      key={idx}
                      to={item.url}
                      className="upcoming-race-card"
                      style={{
                        '--card-accent': accentColor,
                        '--card-accent-glow': `${accentColor}44`,
                      } as React.CSSProperties}
                    >
                      <div>
                        {/* Card Header: Series Badge & Status / Championship Name */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '5px',
                              background: `${accentColor}18`,
                              border: `1px solid ${accentColor}44`,
                              color: accentColor,
                              letterSpacing: '0.05em',
                            }}
                          >
                            {item.badge}
                          </span>

                          {item.statusTag ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: item.statusTag.includes('OPEN') ? 'var(--telemetry-green)' : 'var(--text-muted)',
                                background: item.statusTag.includes('OPEN') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                                border: `1px solid ${item.statusTag.includes('OPEN') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                              }}
                            >
                              <span
                                className="radar-pulse-dot"
                                style={{
                                  '--pulse-color': item.statusTag.includes('OPEN') ? 'rgba(16, 185, 129, 0.7)' : 'rgba(255, 255, 255, 0.4)',
                                  backgroundColor: item.statusTag.includes('OPEN') ? 'var(--telemetry-green)' : 'var(--text-muted)',
                                } as React.CSSProperties}
                              />
                              {item.statusTag}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {item.championshipName}
                            </span>
                          )}
                        </div>

                        {/* Event Name */}
                        <h3
                          className="card-event-name"
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            lineHeight: 1.25,
                            color: '#ffffff',
                            margin: '0 0 0.5rem 0',
                          }}
                        >
                          {item.eventName}
                        </h3>

                        {/* Circuit & Location with MapPin */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                          <MapPin size={13} style={{ color: accentColor, flexShrink: 0, marginTop: '0.15rem' }} />
                          <span>{item.circuit} <span style={{ opacity: 0.45 }}>•</span> {item.location}</span>
                        </div>
                      </div>

                      {/* Paddock Date & CTA Footer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '1.25rem',
                          paddingTop: '0.85rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '6px',
                            padding: '0.3rem 0.55rem',
                          }}
                        >
                          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                          <span
                            style={{
                              color: '#ffffff',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.74rem',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {item.dates}
                          </span>
                        </div>

                        <div
                          className="radar-cta-btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: accentColor,
                            letterSpacing: '0.04em',
                          }}
                        >
                          <span>RACE HUB</span>
                          <ChevronRight size={13} className="radar-cta-arrow" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })()}

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

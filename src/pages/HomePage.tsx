import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Calendar,
  Zap,
  ChevronRight,
  ChevronLeft,
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
  Brain,
  Play,
  PlayCircle,
  Flag,
  Users,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/quiz/quizService';
import { QuizAttemptRecord } from '../types/quiz';
import { getTierDetails } from '../services/quiz/quizRegistry';
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
import { FlameX } from '../components/common/FlameX';
import { GrdxWordmark, GrdxLogo } from '../components/common/GrdxWordmark';
import { CountdownTimer } from '../components/common/CountdownTimer';
import heroRacetrackBg from '../assets/grdx-hero-racetrack.jpg';
import heroFlameRacetrackBg from '../assets/grdx-flame-hero-racetrack.jpg';
import cotaNightBg from '../assets/grdx-cota-night.jpg';
import cardPredictionsImg from '../assets/grdx-card-predictions.jpg';
import cardRacingTagImg from '../assets/grdx-card-racing-tag.jpg';
import cardCalendarImg from '../assets/grdx-card-calendar.jpg';
import cardLeaderboardImg from '../assets/grdx-card-leaderboard.jpg';
import cardHighlightImg from '../assets/grdx-card-highlight.jpg';

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
  const [userQuizHistory, setUserQuizHistory] = useState<QuizAttemptRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.userId) {
      quizService.getUserQuizHistory(currentUser.userId)
        .then(history => {
          if (isMounted) setUserQuizHistory(history);
        })
        .catch(() => {
          if (isMounted) setUserQuizHistory([]);
        });
    } else {
      setUserQuizHistory([]);
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser?.userId]);

  useEffect(() => {
    document.title = 'GRDX | Your Motorsport Starting Point';
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
          1. HERO: The Front Door to All Motorsport (GRDX Cinematic Racetrack)
          =================================================================== */}
      <section
        className="home-hero-section"
        style={{ '--hero-bg-image': `url(${heroRacetrackBg})` } as React.CSSProperties}
      >
        {/* Trackside lighting beam & atmospheric accents */}
        <div className="home-hero-trackside-beam" aria-hidden="true" />
        <div className="home-hero-light-streak-left" aria-hidden="true" />
        <div className="home-hero-light-streak-right" aria-hidden="true" />
        <div className="home-hero-checkered-accent home-hero-checkered-accent--left" aria-hidden="true" />
        <div className="home-hero-checkered-accent home-hero-checkered-accent--right" aria-hidden="true" />

        <div className="home-hero-container">
          {/* Main Hero Content (Left-Aligned, Uncluttered) */}
          <div className="home-hero-main-content">
            {/* THE GRID Headline | THE <span className="home-hero-grid-accent">GRID</span> | Discovery Hubs: Indian Motorsport */}
            {/* Canonical Hero Anchor: THE <span className="home-hero-grid-accent">GRDX</span> */}
            <h1 className="home-hero-brand-title" aria-label="THE GRDX">
              <span className="home-hero-the">THE</span>{' '}
              <span className="home-hero-grid-accent grdx-hero-wordmark" title="GRDX">
                <GrdxLogo showTagline={false} variant="hero" className="grdx-hero-logo h-20 md:h-28 lg:h-32 w-auto" />
                <span className="sr-only">GRD X</span>
              </span>
            </h1>

            <div className="home-hero-tagline sr-only" aria-label="Your motorsport starting point">
              YOUR MOTORSPORT <span className="home-hero-tagline-accent">STARTING POINT</span>
            </div>

            <p className="home-hero-description" style={{ maxWidth: '520px' }}>
              Discover, follow, learn and predict across the world of motorsport.
            </p>

            {/* Hero Action Buttons: Focused Primary Actions (Explore Motorsport & Global Calendar) */}
            <div className="home-hero-cta-row">
              <Link
                to="/explore"
                className="home-hero-primary-cta btn-primary-conversion"
                style={{ height: '48px', padding: '0 1.75rem', gap: '0.5rem', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center' }}
              >
                <ArrowRight size={16} />
                <span>Explore Motorsport</span>
              </Link>

              <Link
                to="/calendar"
                className="home-hero-secondary-cta btn-secondary"
                style={{ height: '48px', padding: '0 1.5rem', gap: '0.5rem', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center' }}
              >
                <Calendar size={16} />
                <span>Global Calendar</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
        {/* ===================================================================
            2. NEXT / CURRENT RACE: NEXT UP IN MOTORSPORT (LIVE FEATURE SPOTLIGHT)
            =================================================================== */}
            {(() => {
              const circuitSvgFile = getCircuitSvgForRace(nextRace.circuitId, nextRace.circuitName, nextRace.grandPrixName);
              const circuitAssetUrl = getCircuitAssetUrl(circuitSvgFile);
              const isAustinCota = (nextRace.circuitId || '').includes('cota') || (nextRace.circuitName || '').includes('Americas') || (nextRace.grandPrixName || '').includes('United States');
              const displayCity = isAustinCota
                ? 'Austin'
                : (nextRace.city && nextRace.city.toLowerCase() !== 'us' && nextRace.city.toLowerCase() !== 'usa' ? nextRace.city : '');
              const displayCountry = isAustinCota
                ? 'USA'
                : (nextRace.country && nextRace.country.toLowerCase() !== 'us' ? nextRace.country : 'USA');
              const locationText = displayCity ? `${displayCity}, ${displayCountry}` : displayCountry;
              const countdownTarget = (predictionHighlight as any).lockTime || (nextRace as any).startTimeUtc || '2026-10-24T18:00:00Z';

              const displaySessions = (nextRace.sessions && nextRace.sessions.length > 0)
                ? nextRace.sessions
                : [
                    { name: 'Practice 1', day: 'Fri', time: '23:00 IST' },
                    { name: 'Sprint Quali', day: 'Sat', time: '03:00 IST' },
                    { name: 'Sprint', day: 'Sat', time: '23:30 IST' },
                    { name: 'Qualifying', day: 'Sun', time: '03:30 IST' },
                    { name: 'Main Race', day: 'Mon', time: '00:30 IST', isKeySession: true },
                  ];

              return (
                <section
                  className="home-next-up-banner-section"
                  style={{
                    marginTop: '2rem',
                    width: '100%',
                  }}
                >
                  <div className="home-next-up-banner">
                    <div className="home-next-up-3zone-grid">
                      {/* ZONE 1 (Left — Race Identity & Actions) */}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Top Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#FF5500',
                                boxShadow: '0 0 10px #FF5500',
                                display: 'inline-block',
                                animation: 'restrainedPulse 2s ease-in-out infinite',
                              }}
                            />
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#FF7A00',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                              }}
                            >
                              NEXT UP IN MOTORSPORT
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span
                              style={{
                                background: '#FFB000',
                                color: '#050505',
                                fontWeight: 900,
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-display)',
                              }}
                            >
                              R{nextRace.roundNumber || 18}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-mono)',
                                textTransform: 'uppercase',
                                background: predictionHighlight.status === 'OPEN' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(244, 43, 22, 0.18)',
                                color: predictionHighlight.status === 'OPEN' ? 'var(--telemetry-green)' : '#F42B16',
                                border: predictionHighlight.status === 'OPEN' ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid rgba(244, 43, 22, 0.4)',
                              }}
                            >
                              {predictionHighlight.status === 'OPEN' ? '● PREDICTION OPEN' : userPrediction ? '🔒 PREDICTION LOCKED' : 'PREDICTION CLOSED'}
                            </span>
                          </div>
                        </div>

                        {/* Race Title */}
                        <h2
                          style={{
                            fontFamily: "var(--font-heading, 'Barlow Condensed', sans-serif)",
                            fontSize: '22px',
                            fontWeight: 800,
                            color: '#ffffff',
                            textTransform: 'uppercase',
                            margin: '0 0 4px 0',
                            letterSpacing: '0.02em',
                            lineHeight: 1.2,
                          }}
                        >
                          {nextRace.grandPrixName || 'UNITED STATES GRAND PRIX'}
                        </h2>

                        {/* Subtitle */}
                        <p
                          style={{
                            color: '#D1D5DB',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            margin: '0 0 14px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>{nextRace.circuitName || 'Circuit of the Americas'}</span>
                          <span style={{ opacity: 0.4 }}>•</span>
                          <span>{locationText}</span>
                          <span style={{ opacity: 0.4 }}>•</span>
                          <strong style={{ color: '#ffffff' }}>{nextRace.dates || 'Oct 23–Oct 26'}</strong>
                        </p>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                          <Link
                            to={`/races/${nextRace.roundNumber || 18}`}
                            className="btn-secondary"
                            style={{
                              height: '38px',
                              minHeight: '38px',
                              padding: '0 16px',
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderRadius: '8px',
                            }}
                          >
                            <span>RACE WEEKEND</span>
                            <ArrowRight size={13} style={{ color: 'var(--color-accent)' }} />
                          </Link>

                          {predictionHighlight.status === 'OPEN' && (
                            <Link
                              to={`/predict/${predictionHighlight.roundId}`}
                              className="btn-primary-conversion"
                              style={{
                                height: '38px',
                                minHeight: '38px',
                                padding: '0 16px',
                                fontSize: '12px',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '8px',
                              }}
                            >
                              <Zap size={13} />
                              <span>MAKE A PREDICTION</span>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* ZONE 2 (Center — Full Non-Truncated Session Schedule & Countdown) */}
                      <div
                        style={{
                          background: 'rgba(8, 9, 12, 0.55)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {/* Top Row inside Zone 2: Sessions Label + Live Countdown */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={13} style={{ color: 'var(--color-accent, #FF5500)' }} />
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '11px',
                                fontWeight: 800,
                                color: 'var(--text-secondary, #D1D5DB)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                              }}
                            >
                              RACE WEEKEND SESSIONS (IST)
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#FFB000',
                                letterSpacing: '0.04em',
                              }}
                            >
                              LOCK IN:
                            </span>
                            <CountdownTimer targetDate={countdownTarget} size="mini" />
                          </div>
                        </div>

                        {/* Non-Truncated Sessions Strip */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '8px',
                          }}
                        >
                          {displaySessions.map((sess: any, sIdx: number) => (
                            <div
                              key={sIdx}
                              style={{
                                background: sess.isKeySession
                                  ? 'linear-gradient(135deg, rgba(255, 85, 0, 0.16) 0%, rgba(255, 85, 0, 0.04) 100%)'
                                  : 'rgba(255, 255, 255, 0.035)',
                                border: sess.isKeySession
                                  ? '1px solid rgba(255, 85, 0, 0.45)'
                                  : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'visible',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    color: sess.isKeySession ? '#FF5500' : '#848B96',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {sess.day}
                                </span>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: '#FFB000',
                                    fontWeight: 700,
                                  }}
                                >
                                  {sess.time}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: sess.isKeySession ? '#ffffff' : '#E5E7EB',
                                  whiteSpace: 'nowrap',
                                  overflow: 'visible',
                                }}
                              >
                                {sess.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ZONE 3 (Right — Circuit Artwork & Map Preview) */}
                      <div
                        style={{
                          width: '240px',
                          height: '135px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          background: 'radial-gradient(circle at center, rgba(255, 85, 0, 0.14) 0%, rgba(8, 9, 12, 0.95) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.5)',
                          flexShrink: 0,
                          justifySelf: 'end',
                        }}
                      >
                        {/* Circuit Background Grid Texture */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
                            backgroundSize: '12px 12px',
                            opacity: 0.35,
                            pointerEvents: 'none',
                          }}
                        />

                        {/* Circuit Silhouette */}
                        <img
                          src={circuitAssetUrl}
                          alt={`${nextRace.circuitName} layout`}
                          style={{
                            maxHeight: '80px',
                            maxWidth: '170px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 12px rgba(255, 85, 0, 0.75))',
                            position: 'relative',
                            zIndex: 1,
                          }}
                        />

                        {/* VIEW MAP -> Overlay Link */}
                        <Link
                          to={`/circuits/${nextRace.circuitId || 'cota'}`}
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            zIndex: 2,
                            background: 'rgba(17, 19, 26, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            color: '#ffffff',
                            textDecoration: 'none',
                            letterSpacing: '0.04em',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--color-accent, #FF5500)';
                            e.currentTarget.style.color = 'var(--color-accent, #FF5500)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                        >
                          <span>VIEW MAP</span>
                          <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}



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
                background: 'linear-gradient(135deg, rgba(17, 19, 26, 0.98) 0%, rgba(24, 27, 36, 0.96) 100%)',
                border: userScore
                  ? '1px solid rgba(157, 78, 221, 0.4)'
                  : userPrediction
                  ? '1px solid rgba(0, 230, 118, 0.35)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '1rem' }}>🏁</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {predictionHighlight.roundName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
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

                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', margin: '0 0 0.35rem 0', fontFamily: 'var(--font-heading)' }}>
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
                {userPrediction ? (
                  <div
                    style={{
                      marginTop: '0.95rem',
                      padding: '0.75rem 0.95rem',
                      background: 'rgba(0, 230, 118, 0.06)',
                      border: '1px solid rgba(0, 230, 118, 0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.85rem',
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
                    {userPrediction.predictionData?.fastestLap && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>FL: </span>
                        <strong style={{ color: 'var(--telemetry-purple)' }}>{getDriverLastName(userPrediction.predictionData?.fastestLap)}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  /* High-value Scoring & Target Preview when not yet predicted (Eliminates empty void) */
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Scoring Breakdown
                      </span>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 800 }}>
                        {predictionHighlight.totalPointsAvailable || 60} PTS MAX
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem', textAlign: 'center' }}>
                      <div style={{ padding: '0.35rem 0.2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>P1</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>+25</div>
                      </div>
                      <div style={{ padding: '0.35rem 0.2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>P2</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>+18</div>
                      </div>
                      <div style={{ padding: '0.35rem 0.2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>P3</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>+15</div>
                      </div>
                      <div style={{ padding: '0.35rem 0.2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FAST LAP</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>+10</div>
                      </div>
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
                      padding: '0.6rem 1.15rem',
                      borderRadius: '6px',
                      background: 'var(--grdx-flame-gradient)',
                      color: '#050505',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      boxShadow: '0 0 16px rgba(255, 122, 0, 0.35)',
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
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    border: '1px solid rgba(255, 255, 255, 0.08)',
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
            4. EXPLORE MOTORSPORT: THE GRDX KNOWLEDGE CHALLENGE (GET YOUR RACING TAG)
            =================================================================== */}
        <section style={{ marginTop: '2.5rem' }}>
          {userQuizHistory && userQuizHistory.length > 0 ? (
            (() => {
              const latestQuiz = userQuizHistory[userQuizHistory.length - 1];
              const tierInfo = getTierDetails(latestQuiz.fanIdentityTier);
              return (
                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-surface, #11131A)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderLeft: `4px solid ${tierInfo.color}`,
                    borderRadius: 'var(--radius-lg, 16px)',
                    padding: '2rem 2.25rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.75rem',
                    boxShadow: 'var(--shadow-card, 0 8px 32px rgba(0, 0, 0, 0.35))',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '-20px',
                      top: '-20px',
                      opacity: 0.03,
                      fontSize: '8rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-display)',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      color: '#ffffff',
                    }}
                  >
                    GRDX
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', maxWidth: '680px', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        backgroundColor: `${tierInfo.color}1a`,
                        border: `1px solid ${tierInfo.color}55`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tierInfo.color,
                        flexShrink: 0,
                        marginTop: '0.2rem',
                      }}
                    >
                      <Award size={28} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: tierInfo.color,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                          }}
                        >
                          YOUR RACING IDENTITY
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>•</span>
                        <span style={{ fontSize: '0.68rem', color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {latestQuiz.percentage}% Score ({latestQuiz.score}/{latestQuiz.totalQuestions})
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                          fontWeight: 900,
                          fontFamily: 'var(--font-display)',
                          textTransform: 'uppercase',
                          color: '#ffffff',
                          margin: '0 0 0.5rem 0',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {tierInfo.title}
                      </h3>

                      <p
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem',
                          margin: '0 0 0.85rem 0',
                          lineHeight: 1.55,
                        }}
                      >
                        {tierInfo.tagline}. {tierInfo.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                          }}
                        >
                          Completed: {latestQuiz.completedAt ? new Date(latestQuiz.completedAt).toLocaleDateString() : 'Active'}
                        </span>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: `${tierInfo.color}15`,
                            border: `1px solid ${tierInfo.color}40`,
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            color: tierInfo.color,
                            fontWeight: 700,
                          }}
                        >
                          Official Pit Pass Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                    <Link
                      to="/quiz"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.85rem 1.85rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--f1-red)',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        textDecoration: 'none',
                        boxShadow: '0 0 25px rgba(225, 6, 0, 0.45)',
                        flexShrink: 0,
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      <span>VIEW MY RACING TAG</span>
                      <ArrowRight size={16} />
                    </Link>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Retake anytime to level up your status
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface, #11131A)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '4px solid var(--f1-red)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: '2rem 2.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.75rem',
                boxShadow: 'var(--shadow-card, 0 8px 32px rgba(0, 0, 0, 0.35))',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: '-20px',
                  top: '-20px',
                  opacity: 0.03,
                  fontSize: '8rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  color: '#ffffff',
                }}
              >
                GRDX
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', maxWidth: '680px', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(225, 6, 0, 0.12)',
                    border: '1px solid rgba(225, 6, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--f1-red)',
                    flexShrink: 0,
                    marginTop: '0.2rem',
                  }}
                >
                  <Award size={28} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'var(--f1-red)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      THE GRDX KNOWLEDGE CHALLENGE
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>•</span>
                    <span style={{ fontSize: '0.68rem', color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      8 Verified Disciplines
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                      fontWeight: 900,
                      fontFamily: 'var(--font-display)',
                      textTransform: 'uppercase',
                      color: '#ffffff',
                      margin: '0 0 0.5rem 0',
                      letterSpacing: '0.02em',
                    }}
                  >
                    GET YOUR RACING TAG
                  </h3>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      margin: '0 0 0.85rem 0',
                      lineHeight: 1.55,
                    }}
                  >
                    Discover how much you know about motorsport, take on verified racing questions, and earn a tag that represents your knowledge.
                  </p>

                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--telemetry-cyan)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      marginBottom: '1.15rem',
                    }}
                  >
                    Your knowledge. Your tag. Your GRDX profile.
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    {['F1', 'F2', 'F3', 'F4', 'Formula E', 'MotoGP', 'Endurance', 'GT Racing'].map(cat => (
                      <span
                        key={cat}
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      + IndyCar & Supercars coming soon
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                <Link
                  to="/quiz"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--f1-red)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                    boxShadow: '0 0 25px rgba(225, 6, 0, 0.45)',
                    flexShrink: 0,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <span>GET YOUR RACING TAG</span>
                  <ArrowRight size={16} />
                </Link>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Tiers: Rookie • Enthusiast • Insider • Strategist • Oracle
                </div>
              </div>
            </div>
          )}
        </section>

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
                  const getSeriesColor = (badge?: string, champId?: string) => {
                    const norm = (badge || champId || '').toUpperCase();
                    if (norm.includes('F1') || norm.includes('FORMULA 1')) return '#E10600';
                    if (norm.includes('MOTO') || norm.includes('MOTOGP')) return '#00D2BE';
                    if (norm.includes('WEC') || norm.includes('ENDURANCE')) return '#0055FF';
                    if (norm.includes('INDY')) return '#FFB800';
                    if (norm.includes('FE') || norm.includes('FORMULA E')) return '#00D2BE';
                    return item.badgeColor || 'var(--f1-red)';
                  };
                  const accentColor = getSeriesColor(item.badge, item.championshipId);
                  const circuitSvg = getCircuitSvgForRace(undefined, item.circuit, item.eventName);
                  const circuitSvgUrl = getCircuitAssetUrl(circuitSvg);
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
                      {circuitSvgUrl && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            right: '-10px',
                            bottom: '-10px',
                            width: '120px',
                            height: '90px',
                            opacity: 0.06,
                            pointerEvents: 'none',
                            backgroundImage: `url(${circuitSvgUrl})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'right bottom',
                            backgroundRepeat: 'no-repeat',
                            filter: 'brightness(1.8)',
                          }}
                        />
                      )}
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
            <div className="grdx-fundamentals-grid">
              {featuredLearnTopics.map((topic, idx) => {
                const TopicIcon = [BookOpen, Flag, Layers, Calendar, Zap, BarChart3][idx % 6];
                return (
                  <Link
                    key={idx}
                    to={topic.learnUrl}
                    className="race-card-interactive"
                    style={{
                      background: 'var(--color-surface, #11131A)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1.35rem',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: `${topic.badgeColor || 'var(--grdx-flame-orange)'}15`,
                              border: `1px solid ${topic.badgeColor || 'var(--grdx-flame-orange)'}33`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: topic.badgeColor || 'var(--grdx-flame-orange)',
                            }}
                          >
                            <TopicIcon size={14} />
                          </div>
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
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {topic.category}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-display)',
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                          color: '#ffffff',
                          margin: '0 0 0.4rem 0',
                        }}
                      >
                        {topic.title}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
                        {topic.shortExplanation}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.74rem',
                        color: 'var(--grdx-flame-primary, #FF5500)',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span>EXPLORE HUB</span>
                      <ChevronRight size={13} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grdx-fundamentals-grid">
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

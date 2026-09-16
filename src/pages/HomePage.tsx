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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  DEFAULT_HOME_SNAPSHOT,
  HomeSnapshot,
  getHomeSnapshot,
} from '../services/home/homeSnapshotService';
import { getAllChampionships } from '../services/motorsport/motorsportRegistry';

export const HomePage: React.FC = () => {
  const { openSearch } = useApp();
  const { currentUser, isAuthenticated } = useAuth();
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(DEFAULT_HOME_SNAPSHOT);
  const [activeLearnTab, setActiveLearnTab] = useState<'topics' | 'thirty_seconds'>('topics');

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
          padding: '4rem 1.25rem 3rem 1.25rem',
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
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              margin: '0 0 1rem 0',
              color: '#ffffff',
            }}
          >
            THE GRID
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '700px',
              margin: '0 auto 1.5rem auto',
              lineHeight: 1.55,
            }}
          >
            Your motorsport starting point. Explore championships, upcoming events, drivers, teams, circuits and beginner-friendly motorsport knowledge — all in one place.
          </p>

          {/* 4 Core Platform Pillars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              marginBottom: '2rem',
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
              gap: '0.85rem',
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
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                backgroundColor: 'var(--f1-red)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 20px rgba(225, 6, 0, 0.4)',
                minWidth: 'min(100%, 240px)',
              }}
            >
              <Compass size={16} />
              <span>Explore What's Happening</span>
            </Link>

            <button
              type="button"
              onClick={openSearch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: 'min(100%, 220px)',
              }}
            >
              <Search size={16} style={{ color: 'var(--f1-red)' }} />
              <span>Search The Grid</span>
              <kbd
                className="hero-search-kbd"
                style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
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
            2. WHAT'S HAPPENING / NEXT UP: Multi-Category Racing Radar
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
            style={{
              background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.08) 0%, rgba(22, 27, 34, 0.95) 100%)',
              border: '1px solid rgba(225, 6, 0, 0.25)',
              borderRadius: '14px',
              padding: 'clamp(1rem, 3.5vw, 1.75rem)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1.5rem',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{nextRace.flag}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
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
                  fontSize: 'clamp(1.35rem, 4.5vw, 1.75rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  margin: '0 0 0.35rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {nextRace.grandPrixName}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>
                {nextRace.circuitName} • {nextRace.city}, {nextRace.country} • <strong style={{ color: '#fff' }}>{nextRace.dates}</strong>
              </p>

              <Link
                to={`/races/${nextRace.roundNumber}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--f1-red)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                }}
              >
                <span>View Race Weekend</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Session Breakdown Cards */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {nextRace.sessions.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: '1 1 90px',
                    background: s.isKeySession ? 'rgba(225, 6, 0, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: s.isKeySession ? '1px solid rgba(225, 6, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: s.isKeySession ? 'var(--f1-red)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {s.day}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                    {s.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Category Upcoming Radar Grid */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                UPCOMING EVENTS ACROSS DISCIPLINES
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {racingNowOrNext.length} Events Tracked
              </span>
            </div>

            {racingNowOrNext.map((ev, idx) => (
              <Link
                key={idx}
                to={ev.url}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderBottom: idx < racingNowOrNext.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.15s ease',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 'min(100%, 240px)' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: `${ev.badgeColor}22`,
                      color: ev.badgeColor,
                      border: `1px solid ${ev.badgeColor}44`,
                      minWidth: '54px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {ev.badge}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                      {ev.eventName}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {ev.circuit} • {ev.location}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {ev.dates}
                    </div>
                    {ev.statusTag && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: ev.badgeColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {ev.statusTag}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================================
            3. EXPLORE MOTORSPORT: Supported Championships Registry
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
                MOTORSPORT UNIVERSE
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0.35rem 0', color: '#fff' }}>
                Explore Motorsport
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '680px' }}>
                From Formula 1 to rally, endurance racing and motorcycles — discover the championships, drivers, teams and circuits that make motorsport what it is.
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '1rem',
            }}
          >
            {championships.map(champ => {
              const targetUrl = champ.id === 'indian-motorsport' ? '/indian-motorsport' : `/championships/${champ.id}`;
              return (
                <Link
                  key={champ.id}
                  to={targetUrl}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = `${champ.badgeColor}66`;
                    e.currentTarget.style.boxShadow = `0 8px 24px -6px ${champ.badgeColor}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Subtle Top Accent Glow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: champ.badgeColor,
                      opacity: 0.8,
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: `${champ.badgeColor}22`,
                          color: champ.badgeColor,
                          border: `1px solid ${champ.badgeColor}44`,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {champ.shortName}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {champ.tier}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                      {champ.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.85rem 0' }}>
                      {champ.tagline}
                    </p>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                      {champ.vehicleType.split('(')[0].trim()}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: champ.badgeColor, fontWeight: 800 }}>
                      Explore <ChevronRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ===================================================================
            4. LEARN MOTORSPORT: Global Educational Curriculum & Guides
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
                KNOWLEDGE ARCHITECTURE
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.2rem 0 0.35rem 0', color: '#fff' }}>
                Learn Motorsport
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '680px' }}>
                New to motorsport? Start with the basics, understand how different racing disciplines work, and build your knowledge one topic at a time.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  padding: '0.2rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveLearnTab('topics')}
                  style={{
                    border: 'none',
                    background: activeLearnTab === 'topics' ? 'var(--f1-red)' : 'transparent',
                    color: activeLearnTab === 'topics' ? '#ffffff' : 'var(--text-secondary)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Core Topics
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLearnTab('thirty_seconds')}
                  style={{
                    border: 'none',
                    background: activeLearnTab === 'thirty_seconds' ? 'var(--f1-red)' : 'transparent',
                    color: activeLearnTab === 'thirty_seconds' ? '#ffffff' : 'var(--text-secondary)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  30s Insights
                </button>
              </div>

              <Link
                to="/learn"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 700,
                  marginLeft: '0.5rem',
                }}
              >
                <span>Explore Learn</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {activeLearnTab === 'topics' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '1rem',
              }}
            >
              {featuredLearnTopics.map(topic => (
                <Link
                  key={topic.id}
                  to={topic.learnUrl}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1.2rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${topic.badgeColor}55`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: `${topic.badgeColor}22`,
                          color: topic.badgeColor,
                          border: `1px solid ${topic.badgeColor}44`,
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {topic.badge}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {topic.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.45rem 0' }}>
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.65rem 0' }}>
                      {topic.shortExplanation}
                    </p>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '0.6rem',
                      marginTop: '0.6rem',
                      fontSize: '0.73rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <strong style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Key takeaway:</strong> {topic.keyTakeaway}
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
              {understandIn30Seconds.map(topic => (
                <Link
                  key={topic.id}
                  to={topic.learnUrl}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1.2rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${topic.badgeColor}55`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: `${topic.badgeColor}22`,
                          color: topic.badgeColor,
                          border: `1px solid ${topic.badgeColor}44`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {topic.badge}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        30s read
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.45rem 0' }}>
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.5rem 0' }}>
                      {topic.quickAnswer}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Why it matters:</strong> {topic.whyItMatters}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ===================================================================
            5. INDIAN MOTORSPORT: Dedicated Domestic Ecosystem Spotlight
            =================================================================== */}
        <section style={{ marginTop: '3.5rem' }}>
          <div
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#ff9933', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  NATIONAL MOTORSPORT ECOSYSTEM
                </span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                Indian Motorsport
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Discover the racing scene closer to home — from national championships and circuits to the pathway for drivers looking to progress through Indian motorsport.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {indianMotorsport.keySeries.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <Link
                to={indianMotorsport.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  backgroundColor: '#ff9933',
                  color: '#0d1117',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                }}
              >
                <span>Explore Indian Motorsport</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Quick Metrics Pillar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ff9933', fontFamily: 'var(--font-mono)' }}>
                  {indianMotorsport.seriesCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Championships
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {indianMotorsport.circuitsCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Permanent Tracks
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem', textAlign: 'center', gridColumn: 'span 2' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {indianMotorsport.maxSuperLicencePoints} PTS
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Domestic FIA Super Licence Points (F4 India)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            6. PREDICTION BENCH: Engagement & Community Competition
            =================================================================== */}
        <section style={{ marginTop: '3.5rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '2rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Zap size={16} style={{ color: 'var(--f1-red)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  PREDICTION BENCH
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor:
                      predictionHighlight.status === 'OPEN'
                        ? 'rgba(0, 230, 118, 0.15)'
                        : predictionHighlight.status === 'LOCKED'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(255, 255, 255, 0.1)',
                    color:
                      predictionHighlight.status === 'OPEN'
                        ? '#00e676'
                        : predictionHighlight.status === 'LOCKED'
                        ? '#ef4444'
                        : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {predictionHighlight.status}
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                Think You Know Racing?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 0.5rem 0', maxWidth: '540px' }}>
                Put your motorsport knowledge to the test. Make your predictions for the {predictionHighlight.roundName}. Predict pole position, top-3 podium finishers, and fastest lap.
              </p>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {predictionHighlight.deadlineNotice}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {isAuthenticated ? (
                <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Your Score
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--telemetry-yellow)' }}>
                    {currentUser?.totalPoints ?? 0} PTS
                  </div>
                </div>
              ) : null}

              {predictionHighlight.status === 'OPEN' ? (
                <Link
                  to={predictionHighlight.url}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--f1-red)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    boxShadow: '0 0 20px rgba(225, 6, 0, 0.35)',
                  }}
                >
                  <span>Make Your Prediction</span>
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Link
                  to="/predictions"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                  }}
                >
                  <span>Explore Prediction Bench</span>
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================================
            7. DISCOVER MORE / CONTENT: Curated Motorsport Knowledge Paths
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1rem',
            }}
          >
            {discoverMoreItems.map(item => (
              <Link
                key={item.id}
                to={item.url}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${item.tagColor}55`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: `${item.tagColor}22`,
                        color: item.tagColor,
                        border: `1px solid ${item.tagColor}44`,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.85rem 0' }}>
                    {item.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: item.tagColor,
                    fontWeight: 800,
                  }}
                >
                  <span>{item.actionText}</span>
                  <ChevronRight size={13} />
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

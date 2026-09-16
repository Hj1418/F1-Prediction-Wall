import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Zap,
  Flag,
  Gauge,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Compass,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import {
  getUnifiedCalendar,
  UnifiedCalendarEvent,
  ChampionshipCategoryFilter,
} from '../services/motorsport/calendarScheduleService';

interface CategoryTab {
  id: ChampionshipCategoryFilter;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'f1', label: 'Formula 1', badge: 'F1', badgeColor: '#e10600' },
  { id: 'motogp', label: 'MotoGP™', badge: 'MotoGP', badgeColor: '#dc2626' },
  { id: 'wec', label: 'FIA WEC', badge: 'WEC', badgeColor: '#002b49' },
  { id: 'formula-e', label: 'Formula E', badge: 'FE', badgeColor: '#00d2be' },
  { id: 'gt-world-challenge', label: 'GT World Challenge', badge: 'GT3', badgeColor: '#d97706' },
  { id: 'wrc', label: 'WRC Rally', badge: 'WRC', badgeColor: '#f59e0b' },
  { id: 'feeder', label: 'Feeder (F2/F3/F4)', badge: 'FEEDER', badgeColor: '#0090d0' },
  { id: 'india', label: 'Indian Motorsport 🇮🇳', badge: 'INDIA', badgeColor: '#ff9933' },
];

type StatusFilter = 'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'PREDICTION';

export const WeekendsPage: React.FC = () => {
  const [events, setEvents] = useState<UnifiedCalendarEvent[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ChampionshipCategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Global Motorsport Racing Calendar | The Grid';
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCalendar() {
      try {
        setLoading(true);
        const data = await getUnifiedCalendar();
        if (isMounted) {
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to load global racing calendar:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadCalendar();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter events based on active category, status, and search query
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Category filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'feeder') {
          if (!['f2', 'f3', 'f4'].includes(e.championshipId)) return false;
        } else if (categoryFilter === 'india') {
          if (e.championshipId !== 'indian-motorsport') return false;
        } else if (e.championshipId !== categoryFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PREDICTION') {
          if (!e.hasPrediction) return false;
        } else if (e.status !== statusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          e.officialTitle.toLowerCase().includes(q) ||
          e.circuitName.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q) ||
          e.championshipName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [events, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem 1.25rem', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--f1-red)',
            fontSize: '0.76rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.45rem',
          }}
        >
          <Compass size={14} />
          <span>WORLD MOTORSPORT RACING SCHEDULE</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--text-primary)',
          }}
        >
          Global Racing Calendar
        </h1>

        <p
          style={{
            fontSize: '0.96rem',
            color: 'var(--text-secondary)',
            marginTop: '0.5rem',
            maxWidth: '820px',
            lineHeight: 1.55,
          }}
        >
          Explore session timetables, race weekends, circuit profiles, and Prediction Bench rounds across
          Formula 1, MotoGP, FIA WEC, Formula E, GT World Challenge, WRC, Feeder Series, and Indian Motorsport.
        </p>

        {/* Controls Bar: Category Pills + Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORY_TABS.map(tab => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  style={{
                    padding: '0.42rem 0.85rem',
                    borderRadius: '9999px',
                    border: active
                      ? `1px solid ${tab.badgeColor || 'var(--f1-red)'}`
                      : '1px solid var(--border-subtle)',
                    background: active
                      ? `${tab.badgeColor || 'var(--f1-red)'}22`
                      : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {tab.badge && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.05rem 0.35rem',
                        borderRadius: '3px',
                        background: active ? (tab.badgeColor || 'var(--f1-red)') : 'rgba(255,255,255,0.08)',
                        color: active ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Pills & Search Filter */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.85rem',
            }}
          >
            {/* Status Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {(['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'PREDICTION'] as const).map(s => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: active ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                      background: active ? 'var(--f1-red)' : 'var(--bg-surface-elevated)',
                      color: active ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s === 'PREDICTION' && <Sparkles size={11} />}
                    {s === 'PREDICTION' ? 'PREDICTION BENCH' : s}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                gap: '0.5rem',
                minWidth: 'min(100%, 280px)',
              }}
            >
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search event, circuit, or country..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0 0.2rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
          <div className="live-pulse" style={{ width: 14, height: 14, margin: '0 auto 1rem auto' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>SYNCING GLOBAL MOTORSPORT RADAR...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Empty State */
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏁</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
            No Racing Events Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 auto 1.25rem', maxWidth: '420px' }}>
            No rounds match your active category or status filters. Try selecting "All Categories" or clearing the search.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="btn btn-primary btn-sm"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        /* Event Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredEvents.map(e => {
            const isF1 = e.championshipId === 'f1';
            const isPredictionOpen = e.hasPrediction && e.predictionStatus === 'OPEN';

            return (
              <div
                key={e.id}
                className="race-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.35rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface)',
                  border: isPredictionOpen
                    ? '1px solid rgba(0, 230, 118, 0.45)'
                    : e.status === 'ACTIVE'
                    ? '1px solid rgba(225, 6, 0, 0.4)'
                    : '1px solid var(--border-subtle)',
                  boxShadow: isPredictionOpen ? '0 0 16px rgba(0, 230, 118, 0.08)' : 'none',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div>
                  {/* Top Bar: Championship Badge, Round # & Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.85rem',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: `${e.championshipColor}22`,
                          color: e.championshipColor,
                          border: `1px solid ${e.championshipColor}44`,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {e.championshipBadge}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        ROUND {e.roundNumber}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {e.weekendType && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            backgroundColor: 'rgba(255, 128, 0, 0.12)',
                            color: '#ff9500',
                            padding: '0.12rem 0.4rem',
                            borderRadius: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <Zap size={9} /> {e.weekendType}
                        </span>
                      )}

                      <span
                        className={`status-pill ${
                          e.status === 'ACTIVE'
                            ? 'status-open'
                            : e.status === 'COMPLETED'
                            ? 'status-scored'
                            : 'status-upcoming'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {e.status === 'ACTIVE' && <span className="live-pulse" />}
                        {e.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Flag */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.45rem' }}>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>{e.countryFlag}</span>
                    <div>
                      <h3
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          margin: 0,
                          lineHeight: 1.3,
                          color: '#fff',
                        }}
                      >
                        {e.officialTitle}
                      </h3>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: e.championshipColor,
                          marginTop: '0.15rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {e.championshipName}
                      </div>
                    </div>
                  </div>

                  {/* Circuit & Location */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1rem',
                    }}
                  >
                    <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    {e.circuitUrl ? (
                      <Link
                        to={e.circuitUrl}
                        style={{
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          borderBottom: '1px dotted var(--text-muted)',
                        }}
                        title={`View ${e.circuitName} track profile`}
                      >
                        {e.circuitName}
                      </Link>
                    ) : (
                      <span>{e.circuitName}</span>
                    )}
                    <span>• {e.location}</span>
                  </div>

                  {/* Calendar Dates & Session Pills */}
                  <div
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem 0.85rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                      <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{e.dates}</span>
                    </div>

                    {/* Session tags preview */}
                    {e.sessions && e.sessions.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.15rem' }}>
                        {e.sessions.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.66rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '4px',
                              padding: '0.1rem 0.35rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {s.day ? `${s.day}: ` : ''}{s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prediction Bench Banner (if round exists) */}
                  {e.hasPrediction && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        background: isPredictionOpen
                          ? 'rgba(0, 230, 118, 0.08)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isPredictionOpen
                          ? '1px solid rgba(0, 230, 118, 0.3)'
                          : '1px solid var(--border-subtle)',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Sparkles
                          size={13}
                          style={{ color: isPredictionOpen ? '#00e676' : 'var(--text-muted)' }}
                        />
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: isPredictionOpen ? '#00e676' : 'var(--text-secondary)' }}>
                          {isPredictionOpen
                            ? 'PREDICTION BENCH: OPEN'
                            : e.predictionStatus === 'LOCKED'
                            ? 'PREDICTIONS LOCKED'
                            : e.predictionStatus === 'SCORED'
                            ? 'PREDICTIONS SCORED'
                            : 'PREDICTION BENCH: UPCOMING'}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        COMMUNITY
                      </span>
                    </div>
                  )}
                </div>

                {/* Contextual Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                  {/* Primary Predict CTA if round is open */}
                  {isPredictionOpen && e.predictionRoundId ? (
                    <Link
                      to={`/predict/${e.predictionRoundId}`}
                      className="btn btn-primary btn-sm"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        fontSize: '0.76rem',
                        padding: '0.45rem',
                      }}
                    >
                      MAKE PREDICTION →
                    </Link>
                  ) : isF1 ? (
                    <Link
                      to={e.detailUrl}
                      className="btn btn-secondary btn-sm"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        fontSize: '0.76rem',
                        padding: '0.45rem',
                      }}
                    >
                      SESSION DETAILS
                    </Link>
                  ) : (
                    <Link
                      to={e.detailUrl}
                      className="btn btn-secondary btn-sm"
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        fontSize: '0.76rem',
                        padding: '0.45rem',
                      }}
                    >
                      CHAMPIONSHIP HUB
                    </Link>
                  )}

                  {/* Circuit profile button if available */}
                  {e.circuitUrl && (
                    <Link
                      to={e.circuitUrl}
                      className="btn btn-outline btn-sm"
                      style={{
                        justifyContent: 'center',
                        fontSize: '0.74rem',
                        padding: '0.45rem 0.65rem',
                      }}
                      title="Inspect circuit layout & telemetry"
                    >
                      CIRCUIT
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeekendsPage;

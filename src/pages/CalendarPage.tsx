import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Grid,
  Clock,
  List,
} from 'lucide-react';
import {
  getAllGlobalCalendarEvents,
  getSupportedCalendarSeries,
  filterCalendarEvents,
} from '../services/calendar/globalCalendarService';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarListView } from '../components/calendar/CalendarListView';

type CalendarViewMode = 'month' | 'week' | 'list';

export const CalendarPage: React.FC = () => {
  // Use October 1, 2026 as reference anchor date for deterministic season sync
  const referenceDate = useMemo(() => new Date('2026-10-01T12:00:00Z'), []);

  // URL state synchronization
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSeries = searchParams.get('series') || 'all';
  const monthParam = searchParams.get('month'); // e.g., '2026-10'
  const viewMode = (searchParams.get('view') as CalendarViewMode) || 'month';
  const searchQuery = searchParams.get('q') || '';

  // Canonical active calendar month date
  const currentMonthDate = useMemo(() => {
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        return new Date(Date.UTC(y, m - 1, 1));
      }
    }
    return new Date(Date.UTC(2026, 9, 1)); // Default anchor: October 2026
  }, [monthParam]);

  // All 2026/active calendar events
  const allEvents = useMemo(() => getAllGlobalCalendarEvents(referenceDate), [referenceDate]);

  // Series filter items with counts
  const seriesFilterItems = useMemo(() => getSupportedCalendarSeries(allEvents), [allEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return filterCalendarEvents(allEvents, {
      seriesId: activeSeries,
      query: searchQuery,
    });
  }, [allEvents, activeSeries, searchQuery]);

  // Update Handlers
  const handleSelectSeries = (seriesId: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (seriesId === 'all') {
        next.delete('series');
      } else {
        next.set('series', seriesId);
      }
      return next;
    });
  };

  const handleDateChange = (newDate: Date) => {
    const y = newDate.getUTCFullYear();
    const m = String(newDate.getUTCMonth() + 1).padStart(2, '0');
    const monthStr = `${y}-${m}`;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('month', monthStr);
      return next;
    });
  };

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (mode === 'month') {
        next.delete('view');
      } else {
        next.set('view', mode);
      }
      return next;
    });
  };

  const handleSearchChange = (q: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!q.trim()) {
        next.delete('q');
      } else {
        next.set('q', q);
      }
      return next;
    });
  };

  return (
    <div className="calendar-page" style={{ paddingBottom: '6rem', minHeight: '80vh' }}>
      {/* 1. COMPACT PAGE HEADER */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(225, 6, 0, 0.14) 0%, var(--bg-base) 70%)',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          padding: '2rem 0 1.5rem 0',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              RACE CALENDAR
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
                color: 'var(--text-secondary, #cbd5e1)',
                maxWidth: '650px',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              See what’s happening across motorsport.
            </p>

            {/* Quick Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: 'var(--bg-surface, #131722)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                maxWidth: '380px',
                marginTop: '0.4rem',
              }}
            >
              <Search size={15} style={{ color: 'var(--text-muted, #94a3b8)' }} />
              <input
                type="text"
                placeholder="Search event, circuit, or city..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                aria-label="Search race calendar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOTORSPORT FILTERS BAR */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          backgroundColor: 'rgba(15, 19, 28, 0.95)',
          padding: '0.75rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 15,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="container" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '2px',
            }}
          >
            {seriesFilterItems.map(item => {
              const isActive = activeSeries === item.id;
              return (
                <button
                  key={item.id}
                  id={`filter-${item.id}`}
                  onClick={() => handleSelectSeries(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    minHeight: '44px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    backgroundColor: isActive ? 'var(--f1-red, #e10600)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                    border: isActive ? '1px solid var(--f1-red, #e10600)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 0 12px rgba(225, 6, 0, 0.35)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#ffffff' : item.color,
                    }}
                  />
                  <span>{item.label}</span>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      opacity: 0.7,
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                    }}
                  >
                    {item.eventCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. PRIMARY CALENDAR HERO CONTAINER */}
      <div className="container" style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SUBTLE VIEW CONTROLS & EVENT COUNTER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #94a3b8)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              SHOWING {filteredEvents.length} {filteredEvents.length === 1 ? 'EVENT' : 'EVENTS'}:
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              {activeSeries.toUpperCase()}
            </span>
          </div>

          {/* View Mode Segmented Controls: [MONTH] [WEEK] [LIST] */}
          <div
            role="group"
            aria-label="Calendar view options"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface, #131722)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              id="view-month"
              onClick={() => handleViewModeChange('month')}
              aria-pressed={viewMode === 'month'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.8rem',
                minHeight: '36px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'month' ? 'var(--f1-red, #e10600)' : 'transparent',
                color: viewMode === 'month' ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Grid size={14} />
              <span>MONTH</span>
            </button>

            <button
              type="button"
              id="view-week"
              onClick={() => handleViewModeChange('week')}
              aria-pressed={viewMode === 'week'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.8rem',
                minHeight: '36px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'week' ? 'var(--f1-red, #e10600)' : 'transparent',
                color: viewMode === 'week' ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Clock size={14} />
              <span>WEEK</span>
            </button>

            <button
              type="button"
              id="view-list"
              onClick={() => handleViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.8rem',
                minHeight: '36px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? 'var(--f1-red, #e10600)' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <List size={14} />
              <span>LIST</span>
            </button>
          </div>
        </div>

        {/* PRIMARY CALENDAR VIEW RENDERER (THE HERO) */}
        <div>
          {viewMode === 'month' && (
            <CalendarMonthView
              events={filteredEvents}
              currentDate={currentMonthDate}
              onDateChange={handleDateChange}
            />
          )}

          {viewMode === 'week' && (
            <CalendarWeekView
              events={filteredEvents}
              referenceDate={currentMonthDate}
            />
          )}

          {viewMode === 'list' && (
            <CalendarListView
              events={filteredEvents}
            />
          )}
        </div>
      </div>
    </div>
  );
};

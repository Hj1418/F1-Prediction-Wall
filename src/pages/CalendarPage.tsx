import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  getAllGlobalCalendarEvents,
  getSupportedCalendarSeries,
  filterCalendarEvents,
} from '../services/calendar/globalCalendarService';
import { CalendarMiniDock } from '../components/calendar/CalendarMiniDock';
import { CalendarDayFeed } from '../components/calendar/CalendarDayFeed';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarListView } from '../components/calendar/CalendarListView';
import { AddToGoogleCalendarModal } from '../components/calendar/AddToGoogleCalendarModal';
import { getTodayIst } from '../utils/istTimeUtils';

type CalendarViewMode = 'month' | 'week' | 'upcoming';

export const CalendarPage: React.FC = () => {
  // Use October 1, 2026 as reference anchor date for deterministic season sync
  const referenceDate = useMemo(() => new Date('2026-10-01T12:00:00Z'), []);

  // Modal state
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // URL state synchronization
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSeries = searchParams.get('series') || 'all';
  const monthParam = searchParams.get('month'); // e.g., '2026-10'
  const rawView = searchParams.get('view');
  const viewMode: CalendarViewMode = rawView === 'week' ? 'week' : rawView === 'upcoming' || rawView === 'list' ? 'upcoming' : 'month';
  const searchQuery = searchParams.get('q') || '';

  // Canonical active calendar month date (defaults to current runtime month in IST)
  const currentMonthDate = useMemo(() => {
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        return new Date(Date.UTC(y, m - 1, 1));
      }
    }
    const today = getTodayIst();
    return new Date(Date.UTC(today.year, today.month, 1));
  }, [monthParam]);

  // Selected date for day-level inspection (defaulting to runtime today in IST on initial load)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = getTodayIst();
    return new Date(Date.UTC(today.year, today.month, today.day));
  });

  // Keep selected date synced if user navigates month via query parameter
  useEffect(() => {
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setSelectedDate(prev => {
          if (prev.getUTCFullYear() !== y || prev.getUTCMonth() !== m - 1) {
            return new Date(Date.UTC(y, m - 1, 1));
          }
          return prev;
        });
      }
    }
  }, [monthParam]);

  // All 2026/active calendar events
  const allEvents = useMemo(() => getAllGlobalCalendarEvents(referenceDate), [referenceDate]);

  // Series filter items with counts
  const seriesFilterItems = useMemo(() => getSupportedCalendarSeries(allEvents), [allEvents]);

  // Filtered events based on series pill and search query
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
    <div className="calendar-page" style={{ paddingBottom: '6rem', minHeight: '85vh' }}>
      {/* 1. COMPACT PAGE HEADER & SEARCH */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(255, 85, 0, 0.12) 0%, var(--color-background, #08090C) 70%)',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          padding: '1.5rem 0 1.15rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '280px' }}>
              <h1
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.85rem)',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display, sans-serif)',
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                }}
              >
                RACE CALENDAR
              </h1>

              <p
                style={{
                  fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
                  color: 'var(--text-secondary, #D1D5DB)',
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
                  backgroundColor: '#11131A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  maxWidth: '380px',
                  marginTop: '0.4rem',
                }}
              >
                <Search size={15} style={{ color: 'var(--text-muted, #848B96)' }} />
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
                      color: 'var(--text-muted, #848B96)',
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
        </div>
      </section>

      {/* 2. MOTORSPORT SERIES FILTERS BAR */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          backgroundColor: 'rgba(8, 9, 12, 0.95)',
          padding: '0.75rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 15,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="container">
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
                    minHeight: '40px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    backgroundColor: isActive ? 'var(--color-accent, #FF5500)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary, #D1D5DB)',
                    border: isActive
                      ? '1px solid var(--color-accent, #FF5500)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 0 14px rgba(255, 85, 0, 0.4)' : 'none',
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
                      opacity: 0.75,
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.06)',
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

      {/* 3. SPLIT-PANE WORKSPACE: AGENDA + MINI-CALENDAR DOCK */}
      <div className="container" style={{ marginTop: '1.25rem' }}>
        <div className="calendar-split-container">
          {/* LEFT COLUMN: ACTIVE DAY / EVENT FEED (~65% width) */}
          <main className="calendar-feed-column">
            {viewMode === 'month' && (
              <CalendarDayFeed
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onMonthChange={handleDateChange}
                filteredEvents={filteredEvents}
                allEvents={allEvents}
              />
            )}

            {viewMode === 'week' && (
              <CalendarWeekView
                events={filteredEvents}
                referenceDate={selectedDate}
              />
            )}

            {viewMode === 'upcoming' && (
              <CalendarListView
                events={filteredEvents}
              />
            )}
          </main>

          {/* RIGHT COLUMN: STICKY MINI-CALENDAR TAB DOCK (~35% width, 380px fixed on desktop) */}
          <aside className="calendar-dock-column">
            <CalendarMiniDock
              currentDate={currentMonthDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onDateChange={handleDateChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              allEvents={allEvents}
              activeSeries={activeSeries}
              onOpenGoogleCalendar={() => setIsCalendarModalOpen(true)}
            />
          </aside>
        </div>
      </div>

      {/* 4. GOOGLE CALENDAR SUBSCRIPTION MODAL */}
      <AddToGoogleCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlobalCalendarEvent, isEventOnDate } from '../../services/calendar/globalCalendarService';
import { CalendarEventModal } from './CalendarEventModal';

export interface CalendarMonthViewProps {
  events: GlobalCalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  events,
  currentDate,
  onDateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
  });

  const [activeModalEvent, setActiveModalEvent] = useState<GlobalCalendarEvent | null>(null);

  // Sync selectedDate with currentDate when month changes
  useEffect(() => {
    setSelectedDate(prev => {
      if (!prev) return new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
      // If previous selection was in a different month, reset to 1st of the new month
      if (prev.getUTCFullYear() !== currentDate.getUTCFullYear() || prev.getUTCMonth() !== currentDate.getUTCMonth()) {
        return new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
      }
      return prev;
    });
  }, [currentDate]);

  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Calculate start of month and total days
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = lastDayOfMonth.getUTCDate();

  // Convert Sunday (0) to 6, Monday (1) to 0
  let startOffset = firstDayOfMonth.getUTCDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const handlePrevMonth = () => {
    const prev = new Date(Date.UTC(year, month - 1, 1));
    onDateChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(Date.UTC(year, month + 1, 1));
    onDateChange(next);
  };

  const handleToday = () => {
    const today = new Date(Date.UTC(2026, 9, 1)); // 2026 Season anchor: October 2026
    onDateChange(today);
  };

  // Events on selected day
  const selectedDayEvents = selectedDate
    ? events.filter(e => isEventOnDate(e, selectedDate))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Month Navigation & Today Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', width: '100%', maxWidth: '480px' }}>
          <button
            type="button"
            id="calendar-prev-month"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <h2
            id="calendar-active-month-title"
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontWeight: 900,
              fontFamily: 'var(--font-mono, monospace)',
              color: '#ffffff',
              margin: 0,
              letterSpacing: '0.05em',
              textAlign: 'center',
              flex: 1,
              userSelect: 'none',
            }}
          >
            {monthNames[month]} {year}
          </h2>

          <button
            type="button"
            id="calendar-next-month"
            onClick={handleNextMonth}
            aria-label="Next month"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          type="button"
          id="calendar-today-btn"
          onClick={handleToday}
          aria-label="Go to today"
          style={{
            padding: '0.35rem 1rem',
            minHeight: '34px',
            borderRadius: '6px',
            backgroundColor: 'rgba(225, 6, 0, 0.12)',
            border: '1px solid rgba(225, 6, 0, 0.35)',
            color: 'var(--f1-red, #e10600)',
            fontSize: '0.74rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
        >
          TODAY
        </button>
      </div>

      {/* 7-Column Calendar Grid */}
      <div
        className="calendar-grid-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          backgroundColor: 'var(--border-subtle, rgba(255, 255, 255, 0.05))',
          padding: '6px',
          borderRadius: '12px',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Day Name Headers */}
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              padding: '0.65rem 0.25rem',
              textAlign: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-muted, #94a3b8)',
              backgroundColor: 'var(--bg-surface, #131722)',
              letterSpacing: '0.05em',
            }}
          >
            {day}
          </div>
        ))}

        {/* Empty cells before start of month */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              minHeight: '100px',
              backgroundColor: 'rgba(13, 15, 23, 0.4)',
              opacity: 0.3,
            }}
          />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNumber = i + 1;
          const cellDate = new Date(Date.UTC(year, month, dayNumber));
          const dayEvents = events.filter(e => isEventOnDate(e, cellDate));
          const isSelected = selectedDate?.getUTCDate() === dayNumber && selectedDate?.getUTCMonth() === month;

          return (
            <div
              key={dayNumber}
              role="button"
              tabIndex={0}
              id={`cal-day-${dayNumber}`}
              onClick={() => setSelectedDate(cellDate)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedDate(cellDate);
                }
              }}
              aria-label={`${monthNames[month]} ${dayNumber}: ${dayEvents.length} events`}
              style={{
                minHeight: '110px',
                padding: '0.5rem',
                backgroundColor: isSelected
                  ? 'rgba(225, 6, 0, 0.12)'
                  : dayEvents.length > 0
                  ? 'var(--bg-surface, #131722)'
                  : 'var(--bg-base, #0d0f17)',
                border: isSelected
                  ? '1px solid var(--f1-red, #e10600)'
                  : '1px solid transparent',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {/* Day Number */}
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 900 : 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: isSelected
                    ? 'var(--f1-red, #e10600)'
                    : dayEvents.length > 0
                    ? '#ffffff'
                    : 'var(--text-muted, #64748b)',
                  marginBottom: '0.4rem',
                }}
              >
                {dayNumber}
              </span>

              {/* Compact Horizontal Event Bars */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                {dayEvents.slice(0, 3).map(ev => (
                  <button
                    key={`${dayNumber}-${ev.id}`}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveModalEvent(ev);
                    }}
                    title={`${ev.seriesBadge}: ${ev.officialTitle} (${ev.dates})`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      width: '100%',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: `${ev.seriesColor}22`,
                      color: '#ffffff',
                      border: 'none',
                      borderLeft: `3px solid ${ev.seriesColor}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.25,
                      transition: 'filter 0.15s ease, background-color 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.filter = 'brightness(1.25)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.filter = 'none';
                    }}
                  >
                    <span style={{ color: ev.seriesColor, flexShrink: 0 }}>{ev.seriesBadge}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.85 }}>
                      {ev.officialTitle.split(' ')[0]}
                    </span>
                  </button>
                ))}

                {/* +N More Trigger */}
                {dayEvents.length > 3 && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedDate(cellDate);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0.15rem 0.2rem',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: 'var(--f1-red, #e10600)',
                      fontFamily: 'var(--font-mono, monospace)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    +{dayEvents.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Detail Drawer (Shown below the calendar for context without circuit diagrams) */}
      {selectedDate && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🏁</span>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                EVENTS ON {selectedDate.getUTCDate()} {monthNames[selectedDate.getUTCMonth()]} {selectedDate.getUTCFullYear()}
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #94a3b8)',
              }}
            >
              {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'EVENT' : 'EVENTS'}
            </span>
          </div>

          {selectedDayEvents.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {selectedDayEvents.map(event => (
                <div
                  key={`day-event-${event.id}`}
                  onClick={() => setActiveModalEvent(event)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    minHeight: '44px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                    borderLeft: `4px solid ${event.seriesColor}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: `${event.seriesColor}22`,
                        color: event.seriesColor,
                      }}
                    >
                      {event.seriesBadge}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                      {event.officialTitle}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {event.location}, {event.country}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: event.seriesColor,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    DETAILS →
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '1.5rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted, #64748b)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              No motorsport events scheduled on this specific date. Select a date with event bars above.
            </div>
          )}
        </div>
      )}

      {/* Interactive Event Detail Modal */}
      <CalendarEventModal
        event={activeModalEvent}
        onClose={() => setActiveModalEvent(null)}
      />
    </div>
  );
};

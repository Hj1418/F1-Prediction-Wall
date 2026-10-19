import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Grid,
  Clock,
  List,
} from 'lucide-react';
import { GlobalCalendarEvent } from '../../services/calendar/globalCalendarService';
import {
  getTodayIst,
  isTodayIst,
  isEventOnCalendarDateInIst,
} from '../../utils/istTimeUtils';

export interface CalendarMiniDockProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onDateChange: (date: Date) => void;
  viewMode: 'month' | 'week' | 'upcoming';
  onViewModeChange: (mode: 'month' | 'week' | 'upcoming') => void;
  allEvents: GlobalCalendarEvent[];
  activeSeries: string;
  onOpenGoogleCalendar: () => void;
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];
const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const LEGEND_ITEMS = [
  { label: 'F1', color: '#e10600' },
  { label: 'MotoGP', color: '#00D2BE' },
  { label: 'WEC', color: '#3B82F6' },
  { label: 'FE', color: '#00B0FF' },
  { label: 'WRC', color: '#FF5500' },
];

export const CalendarMiniDock: React.FC<CalendarMiniDockProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  allEvents,
  activeSeries,
  onOpenGoogleCalendar,
}) => {
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();

  // First day of month & total days
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = lastDayOfMonth.getUTCDate();

  // Convert Sunday (0) to 6, Monday (1) to 0
  let startOffset = firstDayOfMonth.getUTCDay() - 1;
  if (startOffset < 0) startOffset = 6;

  // Month navigation
  const handlePrevMonth = () => {
    const prev = new Date(Date.UTC(year, month - 1, 1));
    onDateChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(Date.UTC(year, month + 1, 1));
    onDateChange(next);
  };

  const handleToday = () => {
    const today = getTodayIst();
    const todayMonth = new Date(Date.UTC(today.year, today.month, 1));
    onDateChange(todayMonth);
    onSelectDate(new Date(Date.UTC(today.year, today.month, today.day)));
    if (viewMode !== 'month') {
      onViewModeChange('month');
    }
  };

  // Precompute series dots for every day of the active month
  const dayDotsMap = useMemo(() => {
    const map = new Map<number, Array<{ seriesId: string; color: string }>>();
    for (let d = 1; d <= totalDays; d++) {
      const cellDate = new Date(Date.UTC(year, month, d));
      const seriesSeen = new Map<string, string>();
      for (const ev of allEvents) {
        if (activeSeries !== 'all' && ev.seriesId !== activeSeries) {
          continue;
        }
        if (isEventOnCalendarDateInIst(ev, cellDate)) {
          if (!seriesSeen.has(ev.seriesId)) {
            seriesSeen.set(ev.seriesId, ev.seriesColor);
          }
        }
      }
      const dots = Array.from(seriesSeen.entries()).map(([seriesId, color]) => ({
        seriesId,
        color,
      }));
      map.set(d, dots);
    }
    return map;
  }, [allEvents, year, month, totalDays, activeSeries]);

  return (
    <div
      style={{
        background: '#11131A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '16px',
        padding: '1.25rem',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        boxShadow: '0 12px 36px -8px rgba(0, 0, 0, 0.65)',
      }}
    >
      {/* 1. TOP DOCK CONTROLS: VIEW MODE TABS */}
      <div
        role="group"
        aria-label="Calendar view options"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: '#08090C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '3px',
          gap: '2px',
        }}
      >
        <button
          type="button"
          id="view-month"
          onClick={() => onViewModeChange('month')}
          aria-pressed={viewMode === 'month'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.5rem',
            minHeight: '36px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'month' ? 'var(--color-accent, #FF5500)' : 'transparent',
            color: viewMode === 'month' ? '#ffffff' : 'var(--text-secondary, #D1D5DB)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Grid size={13} />
          <span>MONTH</span>
        </button>

        <button
          type="button"
          id="view-week"
          onClick={() => onViewModeChange('week')}
          aria-pressed={viewMode === 'week'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.5rem',
            minHeight: '36px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'week' ? 'var(--color-accent, #FF5500)' : 'transparent',
            color: viewMode === 'week' ? '#ffffff' : 'var(--text-secondary, #D1D5DB)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Clock size={13} />
          <span>WEEK</span>
        </button>

        <button
          type="button"
          id="view-upcoming"
          data-testid="view-upcoming"
          onClick={() => onViewModeChange('upcoming')}
          aria-pressed={viewMode === 'upcoming'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.5rem',
            minHeight: '36px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'upcoming' ? 'var(--color-accent, #FF5500)' : 'transparent',
            color: viewMode === 'upcoming' ? '#ffffff' : 'var(--text-secondary, #D1D5DB)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <List size={13} />
          <span>UPCOMING</span>
        </button>
      </div>

      {/* 2. MONTH / YEAR NAVIGATOR + TODAY BUTTON */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            id="calendar-prev-month"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <span
            id="calendar-active-month-title"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
              fontSize: '0.86rem',
              letterSpacing: '0.04em',
              color: '#ffffff',
              minWidth: '130px',
              textAlign: 'center',
            }}
          >
            {MONTH_NAMES[month]} {year}
          </span>

          <button
            type="button"
            id="calendar-next-month"
            onClick={handleNextMonth}
            aria-label="Next month"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          type="button"
          id="calendar-today-btn"
          onClick={handleToday}
          aria-label="Reset to today"
          style={{
            padding: '0.3rem 0.65rem',
            minHeight: '30px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 85, 0, 0.12)',
            border: '1px solid rgba(255, 85, 0, 0.35)',
            color: 'var(--color-accent, #FF5500)',
            fontSize: '0.7rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          TODAY
        </button>
      </div>

      {/* 3. 7-COLUMN COMPACT DATE MATRIX */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '4px',
          width: '100%',
        }}
      >
        {/* Weekday headers */}
        {DAY_NAMES.map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.66rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-muted, #848B96)',
              padding: '0.25rem 0',
            }}
          >
            {day}
          </div>
        ))}

        {/* Empty cells before day 1 */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div
            key={`pad-${i}`}
            style={{
              aspectRatio: '1',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              opacity: 0.2,
            }}
          />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNumber = i + 1;
          const cellDate = new Date(Date.UTC(year, month, dayNumber));
          const isToday = isTodayIst(year, month, dayNumber);
          const isSelected =
            selectedDate.getUTCFullYear() === year &&
            selectedDate.getUTCMonth() === month &&
            selectedDate.getUTCDate() === dayNumber;

          const dots = dayDotsMap.get(dayNumber) || [];

          let bg = 'rgba(255, 255, 255, 0.02)';
          let border = '1px solid rgba(255, 255, 255, 0.06)';
          let shadow = 'none';

          if (isSelected) {
            bg = 'rgba(255, 85, 0, 0.16)';
            border = '1px solid #FF5500';
            shadow = '0 0 12px rgba(255, 85, 0, 0.35)';
          } else if (isToday) {
            bg = 'rgba(255, 255, 255, 0.04)';
            border = '1px dashed rgba(255, 255, 255, 0.4)';
          }

          return (
            <button
              key={dayNumber}
              type="button"
              id={`cal-day-${dayNumber}`}
              data-is-today={isToday ? 'true' : 'false'}
              data-is-selected={isSelected ? 'true' : 'false'}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => onSelectDate(cellDate)}
              aria-label={`${MONTH_NAMES[month]} ${dayNumber}${isToday ? ' (Today)' : ''}${isSelected ? ' (Selected)' : ''}: ${dots.length} series active`}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                border,
                backgroundColor: bg,
                boxShadow: shadow,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 85, 0, 0.4)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = bg;
                  e.currentTarget.style.borderColor = border;
                }
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isSelected || isToday ? 800 : 600,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: isSelected ? '#ffffff' : isToday ? 'var(--color-accent, #FF5500)' : '#D1D5DB',
                  lineHeight: 1.1,
                }}
              >
                {dayNumber}
              </span>

              {/* 5px Colored Series Indicator Dots underneath */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  marginTop: '3px',
                  height: '5px',
                  minWidth: '5px',
                }}
              >
                {dots.slice(0, 4).map((dot, idx) => (
                  <span
                    key={`${dot.seriesId}-${idx}`}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: dot.color,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. COMPACT SERIES COLOR-DOT LEGEND */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.45rem',
          padding: '0.65rem 0.75rem',
          backgroundColor: '#08090C',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {LEGEND_ITEMS.map(item => (
          <div
            key={item.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: item.color,
              }}
            />
            <span
              style={{
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #848B96)',
                fontWeight: 700,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* 5. + ADD TO GOOGLE CALENDAR ACTION BUTTON */}
      <button
        type="button"
        id="btn-add-to-google-calendar"
        onClick={onOpenGoogleCalendar}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.65rem 1rem',
          minHeight: '44px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#ffffff',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.78rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 85, 0, 0.15)';
          e.currentTarget.style.borderColor = 'var(--color-accent, #FF5500)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        }}
      >
        <CalendarPlus size={15} style={{ color: 'var(--color-accent, #FF5500)' }} />
        <span>+ ADD TO GOOGLE CALENDAR</span>
      </button>
    </div>
  );
};

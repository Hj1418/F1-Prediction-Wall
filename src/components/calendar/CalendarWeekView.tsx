import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  GlobalCalendarEvent,
  getWeekEventsGrouped,
} from '../../services/calendar/globalCalendarService';
import { CalendarEventCard } from './CalendarEventCard';

export interface CalendarWeekViewProps {
  events: GlobalCalendarEvent[];
  referenceDate?: Date;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  events,
  referenceDate = new Date(Date.UTC(2026, 9, 1)), // Anchor: Oct 1, 2026
}) => {
  // Start of week: find Monday of the week containing referenceDate
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(referenceDate);
    const day = d.getUTCDay();
    // diff to previous Monday: if Sunday (0) diff is -6, if Mon (1) diff is 0, etc.
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  });

  const handlePrevWeek = () => {
    setWeekStart(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNextWeek = () => {
    setWeekStart(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  const weekDays = getWeekEventsGrouped(events, weekStart);

  const formatWeekRange = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${weekStart.getUTCDate()} ${months[weekStart.getUTCMonth()]} – ${weekEnd.getUTCDate()} ${months[weekEnd.getUTCMonth()]} ${weekEnd.getUTCFullYear()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Week Navigator Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={18} style={{ color: 'var(--f1-red, #e10600)' }} />
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono, monospace)',
              color: '#ffffff',
              margin: 0,
            }}
          >
            WEEK OF {formatWeekRange().toUpperCase()}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            onClick={handlePrevWeek}
            aria-label="Previous Week"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              const d = new Date(Date.UTC(2026, 9, 1));
              const day = d.getUTCDay();
              const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
              setWeekStart(new Date(Date.UTC(2026, 9, diff)));
            }}
            style={{
              padding: '0.4rem 0.8rem',
              minHeight: '40px',
              borderRadius: '6px',
              backgroundColor: 'rgba(225, 6, 0, 0.12)',
              border: '1px solid rgba(225, 6, 0, 0.3)',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
            }}
          >
            OCTOBER RACE WEEKEND
          </button>

          <button
            type="button"
            onClick={handleNextWeek}
            aria-label="Next Week"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {weekDays.map(dayItem => {
          const hasEvents = dayItem.events.length > 0;

          return (
            <div
              key={dayItem.formattedDate}
              style={{
                backgroundColor: hasEvents ? 'var(--bg-surface, #131722)' : 'rgba(19, 23, 34, 0.4)',
                border: hasEvents
                  ? '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))'
                  : '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Day Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono, monospace)',
                      color: hasEvents ? '#ffffff' : 'var(--text-muted, #64748b)',
                    }}
                  >
                    {dayItem.dayName}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: hasEvents ? 'var(--f1-red, #e10600)' : 'var(--text-muted, #64748b)',
                      fontWeight: 800,
                    }}
                  >
                    {dayItem.formattedDate}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                >
                  {dayItem.events.length} {dayItem.events.length === 1 ? 'EVENT' : 'EVENTS'}
                </span>
              </div>

              {/* Day Events */}
              {hasEvents ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {dayItem.events.map(ev => (
                    <CalendarEventCard key={`${dayItem.formattedDate}-${ev.id}`} event={ev} compact />
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)', padding: '0.25rem 0' }}>
                  No active track sessions or race events.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

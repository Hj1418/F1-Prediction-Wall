import React from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { GlobalCalendarEvent } from '../../services/calendar/globalCalendarService';
import { CalendarEventCard } from './CalendarEventCard';

export interface CalendarNextUpProps {
  events: GlobalCalendarEvent[];
  title?: string;
}

export const CalendarNextUp: React.FC<CalendarNextUpProps> = ({
  events,
  title = 'NEXT UP ACROSS MOTORSPORT',
}) => {
  if (events.length === 0) return null;

  return (
    <section
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '14px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame size={18} style={{ color: 'var(--f1-red, #e10600)' }} />
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono, monospace)',
              color: '#ffffff',
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            {title}
          </h3>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--text-muted, #94a3b8)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
          }}
        >
          ACTIVE & UPCOMING RACES
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {events.map(event => (
          <CalendarEventCard key={`next-up-${event.id}`} event={event} />
        ))}
      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Zap } from 'lucide-react';
import { GlobalCalendarEvent } from '../../services/calendar/globalCalendarService';

export interface CalendarEventCardProps {
  event: GlobalCalendarEvent;
  compact?: boolean;
  highlightDate?: string;
  className?: string;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  compact = false,
  className = '',
}) => {
  const isWeekendOrLive = event.status === 'THIS_WEEKEND' || event.status === 'LIVE';

  return (
    <article
      className={`calendar-event-card race-card-interactive ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface, #131722)',
        border: isWeekendOrLive
          ? `1px solid ${event.seriesColor}`
          : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        borderRadius: '12px',
        padding: compact ? '1rem' : '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isWeekendOrLive ? `0 0 15px -3px ${event.seriesColor}44` : 'none',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Top Header: Series Badge + Round + Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
              backgroundColor: `${event.seriesColor}22`,
              color: event.seriesColor,
              border: `1px solid ${event.seriesColor}55`,
              padding: '0.15rem 0.5rem',
              borderRadius: '5px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {event.seriesBadge}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-muted, #94a3b8)',
              fontWeight: 700,
            }}
          >
            ROUND {event.roundNumber}
          </span>
        </div>

        {/* Live or Weekend Status */}
        {isWeekendOrLive ? (
          <span
            style={{
              fontSize: '0.66rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
              color: event.status === 'LIVE' ? '#00e676' : 'var(--telemetry-yellow, #ffd600)',
              backgroundColor: event.status === 'LIVE' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 214, 0, 0.15)',
              border: `1px solid ${event.status === 'LIVE' ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 214, 0, 0.3)'}`,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
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
                backgroundColor: event.status === 'LIVE' ? '#00e676' : 'var(--telemetry-yellow, #ffd600)',
              }}
            />
            {event.status === 'LIVE' ? 'LIVE NOW' : 'THIS WEEKEND'}
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-secondary, #cbd5e1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <span>{event.flag}</span>
            <span>{event.country}</span>
          </span>
        )}
      </div>

      {/* Event Title */}
      <div>
        <h4
          style={{
            fontSize: compact ? '0.98rem' : '1.1rem',
            fontWeight: 800,
            margin: '0 0 0.25rem 0',
            color: '#ffffff',
            lineHeight: 1.3,
            letterSpacing: '-0.015em',
          }}
        >
          <Link
            to={event.hubUrl}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {event.officialTitle}
          </Link>
        </h4>
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary, #cbd5e1)',
            fontFamily: 'var(--font-mono, monospace)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} style={{ color: event.seriesColor }} />
            {event.dates}
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
            {event.location}, {event.country}
          </span>
        </div>
      </div>

      {/* Actions Row */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.6rem',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to={event.hubUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.76rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--text-primary, #ffffff)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            minHeight: '36px',
            padding: '0.2rem 0.4rem',
            borderRadius: '5px',
          }}
        >
          <span>EXPLORE {event.seriesBadge}</span>
          <ArrowRight size={13} style={{ color: event.seriesColor }} />
        </Link>

        {event.hasPrediction && (
          <Link
            to={event.predictionUrl || '/predictions'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.74rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              color: '#ffffff',
              backgroundColor: 'var(--f1-red, #e10600)',
              textDecoration: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              minHeight: '36px',
              boxShadow: '0 0 10px rgba(225, 6, 0, 0.3)',
            }}
          >
            <Zap size={13} />
            <span>PREDICT NOW</span>
          </Link>
        )}
      </div>
    </article>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Zap, Flag, Compass } from 'lucide-react';
import { GlobalCalendarEvent } from '../../services/calendar/globalCalendarService';

export interface CalendarListViewProps {
  events: GlobalCalendarEvent[];
}

export const CalendarListView: React.FC<CalendarListViewProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div
        style={{
          padding: '3rem 1rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface, #131722)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          color: 'var(--text-muted, #94a3b8)',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        No motorsport events match the selected filters.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {events.map(event => {
        const isLiveOrWeekend = event.status === 'LIVE' || event.status === 'THIS_WEEKEND';

        return (
          <article
            key={event.id}
            className="race-card-interactive"
            style={{
              backgroundColor: 'var(--bg-surface, #131722)',
              border: isLiveOrWeekend
                ? `1px solid ${event.seriesColor}`
                : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              boxShadow: isLiveOrWeekend ? `0 0 12px -2px ${event.seriesColor}33` : 'none',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            {/* Left: Date Badge + Series Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
              {/* Date Box */}
              <div
                style={{
                  minWidth: '85px',
                  backgroundColor: 'var(--bg-base, #0d0f17)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                  borderRadius: '6px',
                  padding: '0.4rem 0.5rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                  {event.dates}
                </div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted, #94a3b8)' }}>
                  {event.seasonYear}
                </div>
              </div>

              {/* Series Badge & Round */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 900,
                    color: event.seriesColor,
                    backgroundColor: `${event.seriesColor}20`,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    width: 'fit-content',
                    borderLeft: `2px solid ${event.seriesColor}`,
                    textTransform: 'uppercase',
                  }}
                >
                  {event.seriesBadge}
                </span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted, #64748b)' }}>
                  R{event.roundNumber}
                </span>
              </div>
            </div>

            {/* Center: Title + Venue */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  <Link to={event.hubUrl} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {event.officialTitle}
                  </Link>
                </h4>
                {isLiveOrWeekend && (
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 800,
                      color: event.status === 'LIVE' ? '#00e676' : 'var(--telemetry-yellow, #ffd600)',
                      backgroundColor: event.status === 'LIVE' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 214, 0, 0.15)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                    }}
                  >
                    {event.status === 'LIVE' ? 'LIVE NOW' : 'THIS WEEKEND'}
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary, #cbd5e1)',
                  fontFamily: 'var(--font-mono, monospace)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexWrap: 'wrap',
                }}
              >
                <span>{event.flag}</span>
                <span>{event.location}, {event.country}</span>
                <span>•</span>
                <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{event.circuitName}</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    padding: '0.45rem 0.8rem',
                    borderRadius: '6px',
                    minHeight: '38px',
                    boxShadow: '0 0 10px rgba(225, 6, 0, 0.25)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Zap size={13} />
                  <span>PREDICT</span>
                </Link>
              )}

              <Link
                to={event.hubUrl}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--text-primary, #ffffff)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                  textDecoration: 'none',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  minHeight: '38px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>HUB</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
};

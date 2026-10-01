import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Calendar, MapPin, Flag, Zap, ArrowRight, Compass } from 'lucide-react';
import { GlobalCalendarEvent } from '../../services/calendar/globalCalendarService';

export interface CalendarEventModalProps {
  event: GlobalCalendarEvent | null;
  onClose: () => void;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({ event, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (event) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [event, onClose]);

  if (!event) return null;

  const isWeekendOrLive = event.status === 'THIS_WEEKEND' || event.status === 'LIVE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-event-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '520px',
          padding: '1.75rem',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close event details"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary, #cbd5e1)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <X size={18} />
        </button>

        {/* Header: Series Badge + Round + Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', paddingRight: '2rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
              backgroundColor: `${event.seriesColor}22`,
              color: event.seriesColor,
              border: `1px solid ${event.seriesColor}55`,
              padding: '0.2rem 0.55rem',
              borderRadius: '5px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {event.seriesBadge}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-muted, #94a3b8)',
              fontWeight: 700,
            }}
          >
            ROUND {event.roundNumber}
          </span>

          {isWeekendOrLive ? (
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: event.status === 'LIVE' ? '#00e676' : 'var(--telemetry-yellow, #ffd600)',
                backgroundColor: event.status === 'LIVE' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 214, 0, 0.15)',
                border: `1px solid ${event.status === 'LIVE' ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 214, 0, 0.3)'}`,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
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
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #94a3b8)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                textTransform: 'uppercase',
              }}
            >
              {event.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h2
            id="calendar-event-modal-title"
            style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 0.25rem 0',
              lineHeight: 1.25,
              letterSpacing: '-0.015em',
            }}
          >
            {event.officialTitle}
          </h2>
          <div style={{ fontSize: '0.85rem', color: event.seriesColor, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
            {event.seriesName}
          </div>
        </div>

        {/* Key Event Details Grid (Strictly NO circuit SVGs) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            borderRadius: '10px',
            padding: '1rem',
          }}
        >
          {/* Date Range */}
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
              <Calendar size={13} style={{ color: event.seriesColor }} />
              <span>DATE / DATES</span>
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)' }}>
              {event.dates}
            </div>
          </div>

          {/* Location */}
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
              <Flag size={13} style={{ color: 'var(--text-muted, #94a3b8)' }} />
              <span>LOCATION</span>
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
              {event.flag} {event.location}, {event.country}
            </div>
          </div>

          {/* Circuit / Venue */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
              <MapPin size={13} style={{ color: 'var(--text-muted, #94a3b8)' }} />
              <span>CIRCUIT / VENUE</span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              {event.circuitName}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to={event.hubUrl}
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              minHeight: '44px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>VIEW EVENT</span>
            <ArrowRight size={14} style={{ color: event.seriesColor }} />
          </Link>

          {event.hasPrediction && (
            <Link
              to={event.predictionUrl || '/predictions'}
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                minHeight: '44px',
                borderRadius: '8px',
                backgroundColor: 'var(--f1-red, #e10600)',
                border: '1px solid var(--f1-red, #e10600)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono, monospace)',
                textDecoration: 'none',
                boxShadow: '0 0 14px rgba(225, 6, 0, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <Zap size={14} />
              <span>PREDICT NOW</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

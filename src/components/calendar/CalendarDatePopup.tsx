import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, MapPin, Zap, ArrowRight, Clock } from 'lucide-react';
import { GlobalCalendarEvent } from '../../services/calendar/globalCalendarService';
import { formatIstTime, sortEventsChronologicalIst, getEventTimeForCalendarDate } from '../../utils/istTimeUtils';
import { trackCalendarDateSelected } from '../../analytics/events';

export interface CalendarDatePopupProps {
  isOpen: boolean;
  date: Date | null;
  events: GlobalCalendarEvent[];
  onClose: () => void;
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

export const CalendarDatePopup: React.FC<CalendarDatePopupProps> = ({
  isOpen,
  date,
  events,
  onClose,
}) => {
  const navigate = useNavigate();

  // Handle Escape key to dismiss
  useEffect(() => {
    if (!isOpen || !date) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    trackCalendarDateSelected({
      date: date.toISOString().split('T')[0],
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, date, onClose]);

  if (!isOpen || !date) return null;

  const year = date.getUTCFullYear();
  const monthName = MONTH_NAMES[date.getUTCMonth()];
  const day = date.getUTCDate();

  // Sort events chronologically by IST time on this specific date
  const sortedEvents = [...events].sort((a, b) => {
    const aUtc = getEventTimeForCalendarDate(a, date).timeUtc;
    const bUtc = getEventTimeForCalendarDate(b, date).timeUtc;
    const aMs = aUtc ? new Date(aUtc).getTime() : NaN;
    const bMs = bUtc ? new Date(bUtc).getTime() : NaN;
    const aHas = !isNaN(aMs);
    const bHas = !isNaN(bMs);
    if (aHas && bHas) return aMs - bMs;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return 0;
  });
  const eventCount = sortedEvents.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-date-popup-title"
      className="calendar-date-popup-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeInOverlay 0.15s ease-out',
      }}
    >
      <div
        className="calendar-date-popup-card"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#0f131c',
          backgroundImage: 'linear-gradient(180deg, rgba(22, 27, 38, 0.95) 0%, rgba(12, 15, 22, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderTop: '2px solid var(--f1-red, #e10600)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'min(88vh, 720px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          animation: 'slideUpPopup 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.5rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
              <Calendar size={15} style={{ color: 'var(--f1-red, #e10600)' }} />
              <h2
                id="calendar-date-popup-title"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.04em',
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {monthName} {day}, {year}
              </h2>
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #94a3b8)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {eventCount} {eventCount === 1 ? 'EVENT' : 'EVENTS'} · ALL TIMES IN IST
            </div>
          </div>

          <button
            type="button"
            id="btn-close-date-popup"
            onClick={onClose}
            aria-label="Close date popup"
            style={{
              width: '38px',
              height: '38px',
              minWidth: '38px',
              minHeight: '38px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary, #cbd5e1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(225, 6, 0, 0.15)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(225, 6, 0, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-secondary, #cbd5e1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Events Body */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            flex: 1,
          }}
        >
          {eventCount === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted, #94a3b8)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.84rem',
              }}
            >
              No events scheduled on this date.
            </div>
          ) : (
            sortedEvents.map(event => {
              const timing = getEventTimeForCalendarDate(event, date);
              const istTimeDisplay = timing.timeIst;
              const hasReliableTime = timing.timeIstShort !== 'TBA';
              const isWeekendOrLive = event.status === 'THIS_WEEKEND' || event.status === 'LIVE';

              return (
                <div
                  key={event.id}
                  className="calendar-date-event-card"
                  tabIndex={0}
                  role="button"
                  onClick={() => {
                    onClose();
                    navigate(event.hubUrl);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                      navigate(event.hubUrl);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderLeft: `4px solid ${event.seriesColor}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Card Header: Series Badge + Time + Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          padding: '0.18rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: `${event.seriesColor}22`,
                          color: event.seriesColor,
                          border: `1px solid ${event.seriesColor}44`,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {event.seriesBadge}
                      </span>

                      {/* IST Start Time Highlight */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          color: hasReliableTime ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                          backgroundColor: hasReliableTime ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                          padding: hasReliableTime ? '0.15rem 0.45rem' : '0',
                          borderRadius: '4px',
                        }}
                      >
                        <Clock size={12} style={{ color: hasReliableTime ? event.seriesColor : 'var(--text-muted, #94a3b8)' }} />
                        <span>{istTimeDisplay}</span>
                        {timing.sessionName && (
                          <span style={{ fontSize: '0.68rem', color: event.seriesColor, fontWeight: 700, marginLeft: '0.2rem' }}>
                            • {timing.sessionName}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Status Pill */}
                    {isWeekendOrLive ? (
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          color: event.status === 'LIVE' ? '#00e676' : 'var(--telemetry-yellow, #ffd600)',
                          backgroundColor: event.status === 'LIVE' ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 214, 0, 0.12)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {event.status === 'LIVE' ? '● LIVE' : 'THIS WEEKEND'}
                      </span>
                    ) : event.status ? (
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: 'var(--text-muted, #94a3b8)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {event.status.replace('_', ' ')}
                      </span>
                    ) : null}
                  </div>

                  {/* Race & Venue Info */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: '0 0 0.25rem 0',
                        lineHeight: 1.25,
                      }}
                    >
                      {event.officialTitle}
                    </h3>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary, #cbd5e1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <MapPin size={12} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.circuitName ? `${event.circuitName} · ` : ''}{event.location}, {event.country}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.6rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      marginTop: '0.2rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onClose();
                        navigate(event.hubUrl);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.85rem',
                        minHeight: '36px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono, monospace)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      }}
                    >
                      <span>VIEW EVENT</span>
                      <ArrowRight size={13} style={{ color: event.seriesColor }} />
                    </button>

                    {event.hasPrediction && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onClose();
                          navigate(event.predictionUrl || '/predictions');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.95rem',
                          minHeight: '36px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--f1-red, #e10600)',
                          border: '1px solid var(--f1-red, #e10600)',
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono, monospace)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 0 10px rgba(225, 6, 0, 0.35)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#ff1a14';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'var(--f1-red, #e10600)';
                        }}
                      >
                        <Zap size={13} />
                        <span>PREDICT NOW</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Close Action */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <button
            type="button"
            id="btn-dismiss-date-popup"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              minHeight: '44px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            CLOSE
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpPopup {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
          .calendar-date-popup-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .calendar-date-popup-card {
            max-width: 100% !important;
            max-height: 82vh !important;
            border-radius: 20px 20px 0 0 !important;
            border-bottom: none !important;
          }
        }
      `}</style>
    </div>
  );
};

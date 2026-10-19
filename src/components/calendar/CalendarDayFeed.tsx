import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar as CalendarIcon,
  ArrowRight,
  Zap,
  Flag,
} from 'lucide-react';
import { GlobalCalendarEvent } from '../../services/calendar/globalCalendarService';
import {
  isEventOnCalendarDateInIst,
  isTimestampOnIstDate,
  formatIstTime,
  getEventTimeForCalendarDate,
  sortEventsChronologicalIst,
} from '../../utils/istTimeUtils';

export interface CalendarDayFeedProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  filteredEvents: GlobalCalendarEvent[];
  allEvents: GlobalCalendarEvent[];
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const CalendarDayFeed: React.FC<CalendarDayFeedProps> = ({
  selectedDate,
  onSelectDate,
  onMonthChange,
  filteredEvents,
  allEvents,
}) => {
  const year = selectedDate.getUTCFullYear();
  const month = selectedDate.getUTCMonth();
  const day = selectedDate.getUTCDate();
  const weekdayName = WEEKDAY_NAMES[selectedDate.getUTCDay()];

  // Formatted selected date: e.g. "OCTOBER 19, 2026"
  const formattedDateTitle = `${MONTH_NAMES[month]} ${day}, ${year}`;

  // Step -1 day
  const handlePrevDay = () => {
    const prev = new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
    onSelectDate(prev);
    if (prev.getUTCMonth() !== month || prev.getUTCFullYear() !== year) {
      onMonthChange(new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), 1)));
    }
  };

  // Step +1 day
  const handleNextDay = () => {
    const next = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
    onSelectDate(next);
    if (next.getUTCMonth() !== month || next.getUTCFullYear() !== year) {
      onMonthChange(new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), 1)));
    }
  };

  // Events on selected day (filtered by active series & search query)
  const dayEvents = useMemo(() => {
    const matched = filteredEvents.filter(ev => isEventOnCalendarDateInIst(ev, selectedDate));
    return sortEventsChronologicalIst(matched);
  }, [filteredEvents, selectedDate]);

  // Total session count for day header
  const totalSessionsCount = useMemo(() => {
    let count = 0;
    const cellDayName = weekdayName.toLowerCase();
    for (const ev of dayEvents) {
      if (ev.sessions && ev.sessions.length > 0) {
        const matchingSessions = ev.sessions.filter(s => {
          if (s.startTimeUtc) return isTimestampOnIstDate(s.startTimeUtc, selectedDate);
          if (s.day) return s.day.toLowerCase() === cellDayName;
          return false;
        });
        count += Math.max(matchingSessions.length, 1);
      } else {
        count += 1;
      }
    }
    return count;
  }, [dayEvents, selectedDate, weekdayName]);

  // Smart calculation for Next Upcoming Race Weekend when day is quiet
  const nextUpcomingEvent = useMemo(() => {
    if (dayEvents.length > 0) return null;
    const targetMs = selectedDate.getTime();

    // Look for events on or after selectedDate in the filtered set
    const candidates = filteredEvents.filter(ev => {
      const startMs = ev.dateBounds?.start
        ? ev.dateBounds.start.getTime()
        : new Date(ev.weekendStartDate).getTime();
      return startMs >= targetMs;
    });

    if (candidates.length > 0) {
      return candidates[0];
    }

    // Fallback: search across allEvents
    const allCandidates = allEvents.filter(ev => {
      const startMs = ev.dateBounds?.start
        ? ev.dateBounds.start.getTime()
        : new Date(ev.weekendStartDate).getTime();
      return startMs >= targetMs;
    });

    return allCandidates[0] || filteredEvents[0] || null;
  }, [dayEvents.length, filteredEvents, allEvents, selectedDate]);

  // Jump to next race day handler
  const handleJumpToNextRace = () => {
    if (!nextUpcomingEvent) return;
    const targetDate = nextUpcomingEvent.dateBounds?.start || new Date(nextUpcomingEvent.weekendStartDate);
    const validDate = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
    onSelectDate(validDate);
    onMonthChange(new Date(Date.UTC(validDate.getUTCFullYear(), validDate.getUTCMonth(), 1)));
  };

  // Helper to resolve session list for an event on this specific day
  const getEventSessionsForDay = (ev: GlobalCalendarEvent) => {
    const cellDayName = weekdayName.toLowerCase();
    const list: Array<{ name: string; timeIst: string }> = [];

    if (ev.sessions && ev.sessions.length > 0) {
      for (const s of ev.sessions) {
        let matches = false;
        if (s.startTimeUtc) {
          matches = isTimestampOnIstDate(s.startTimeUtc, selectedDate);
        } else if (s.day && s.day.toLowerCase() === cellDayName) {
          matches = true;
        }

        if (matches) {
          list.push({
            name: s.name,
            timeIst: s.startTimeUtc ? formatIstTime(s.startTimeUtc) : 'Time TBA',
          });
        }
      }
    }

    // Fallback to event primary timing if no explicit day session found
    if (list.length === 0) {
      const timing = getEventTimeForCalendarDate(ev, selectedDate);
      list.push({
        name: timing.sessionName || (ev.startTimeUtc ? 'Main Race' : 'Race Session'),
        timeIst: timing.timeIst,
      });
    }

    return list;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. COMPACT SELECTED DATE HEADER BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          padding: '12px 16px',
          background: '#11131A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderTop: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'var(--font-display, sans-serif)',
                color: '#ffffff',
                margin: 0,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              {formattedDateTitle}
            </h2>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--color-accent, #FF5500)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(255, 85, 0, 0.12)',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 85, 0, 0.25)',
              }}
            >
              ALL TIMES IN IST
            </span>
          </div>

          <span
            style={{
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-muted, #848B96)',
            }}
          >
            {weekdayName} • {totalSessionsCount} {totalSessionsCount === 1 ? 'SESSION' : 'SESSIONS'} SCHEDULED
          </span>
        </div>

        {/* Quick Prev / Next Day navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={handlePrevDay}
            aria-label="Previous day"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              minHeight: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 85, 0, 0.12)';
              e.currentTarget.style.borderColor = 'var(--color-accent, #FF5500)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            <ChevronLeft size={14} />
            <span>Prev Day</span>
          </button>

          <button
            type="button"
            onClick={handleNextDay}
            aria-label="Next day"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              minHeight: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 85, 0, 0.12)';
              e.currentTarget.style.borderColor = 'var(--color-accent, #FF5500)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            <span>Next Day</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. HIGH-DENSITY EVENT CARDS (SLEEK TELEMETRY ROW ~110px-130px) */}
      {dayEvents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dayEvents.map(ev => {
            const sessionsForDay = getEventSessionsForDay(ev);
            const isLive = ev.status === 'LIVE';
            const isWeekend = ev.status === 'THIS_WEEKEND';

            return (
              <article
                key={ev.id}
                style={{
                  background: '#11131A',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.14)',
                  borderLeft: `3px solid ${ev.seriesColor}`,
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isLive
                    ? `0 0 20px -4px ${ev.seriesColor}44`
                    : '0 6px 18px -4px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Consolidate Header + Action Button into a Single Top Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left Side: Badges + Title + Metadata */}
                  <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          color: ev.seriesColor,
                          backgroundColor: `${ev.seriesColor}20`,
                          border: `1px solid ${ev.seriesColor}55`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {ev.seriesBadge}
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: 'var(--text-muted, #848B96)',
                          fontWeight: 700,
                        }}
                      >
                        ROUND {ev.roundNumber}
                      </span>

                      {/* Status Pill */}
                      {isLive ? (
                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            color: '#00e676',
                            backgroundColor: 'rgba(0, 230, 118, 0.15)',
                            border: '1px solid rgba(0, 230, 118, 0.35)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00e676' }} />
                          LIVE NOW
                        </span>
                      ) : isWeekend ? (
                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            color: 'var(--telemetry-yellow, #FFB000)',
                            backgroundColor: 'rgba(255, 176, 0, 0.15)',
                            border: '1px solid rgba(255, 176, 0, 0.35)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--telemetry-yellow, #FFB000)' }} />
                          THIS WEEKEND
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 700,
                            color: '#9CA3AF',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          UPCOMING
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-display, sans-serif)',
                        color: '#ffffff',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {ev.officialTitle}
                    </h3>

                    {/* Location/Date metadata inline beneath title with 2px margin */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '11px',
                        color: '#9CA3AF',
                        marginTop: '2px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} style={{ color: 'var(--color-accent, #FF5500)' }} />
                        <span>{ev.circuitName}</span>
                      </span>

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CalendarIcon size={12} style={{ color: 'var(--color-accent, #FF5500)' }} />
                        <span>{ev.dates}, {ev.seasonYear}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Side (Buttons moved up into top row!) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary, #D1D5DB)',
                        fontFamily: 'var(--font-mono, monospace)',
                        marginRight: '2px',
                      }}
                    >
                      {ev.flag} {ev.location}
                    </span>

                    <Link
                      to={ev.hubUrl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        height: '32px',
                        minHeight: '32px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      }}
                    >
                      <span>Race Hub</span>
                      <ArrowRight size={12} />
                    </Link>

                    {ev.hasPrediction ? (
                      <Link
                        to={ev.predictionUrl || '/predictions'}
                        className="btn-primary-conversion"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          height: '32px',
                          minHeight: '32px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--color-accent, #FF5500)',
                          border: '1px solid var(--color-accent, #FF5500)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '12px',
                          fontWeight: 800,
                          letterSpacing: '0.03em',
                          textDecoration: 'none',
                          boxShadow: '0 0 12px rgba(255, 85, 0, 0.35)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Zap size={12} />
                        <span>Predict</span>
                      </Link>
                    ) : null}
                  </div>
                </div>

                {/* Slimmed-Down Track Sessions Bar (Redundant header removed) */}
                {sessionsForDay.length === 1 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 12px',
                      marginTop: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      minHeight: '32px',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>
                      {sessionsForDay[0].name}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--telemetry-yellow, #FFB000)',
                        fontWeight: 700,
                      }}
                    >
                      {sessionsForDay[0].timeIst}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '8px',
                      marginTop: '8px',
                    }}
                  >
                    {sessionsForDay.map((session, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          minHeight: '32px',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.name}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--telemetry-yellow, #FFB000)',
                            fontWeight: 700,
                            flexShrink: 0,
                            marginLeft: '8px',
                          }}
                        >
                          {session.timeIst}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        /* 3. SMART EMPTY-DAY FALLBACK: "TRACK QUIET TODAY" */
        <div
          style={{
            background: '#11131A',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '14px',
            padding: '2.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 85, 0, 0.1)',
              border: '1px solid rgba(255, 85, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent, #FF5500)',
            }}
          >
            <Flag size={22} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '480px' }}>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display, sans-serif)',
                color: '#ffffff',
                margin: 0,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              Track Quiet Today
            </h3>

            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-secondary, #D1D5DB)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              No live sessions on {MONTH_NAMES[month]} {day}
              {nextUpcomingEvent ? (
                <>
                  {' '}— Next Action: <strong style={{ color: '#ffffff' }}>{nextUpcomingEvent.dates}</strong> ({nextUpcomingEvent.officialTitle})
                </>
              ) : null}
            </p>
          </div>

          {nextUpcomingEvent && (
            <button
              type="button"
              onClick={handleJumpToNextRace}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.15rem',
                minHeight: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 85, 0, 0.15)',
                border: '1px solid var(--color-accent, #FF5500)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                marginTop: '0.25rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-accent, #FF5500)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 85, 0, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 85, 0, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>Jump to Next Race Day ({nextUpcomingEvent.dates.split('–')[0]?.trim() || nextUpcomingEvent.dates})</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { getSharedRaceContext } from '../../services/schedule/raceContextService';
import { RaceWeekend, getCircuitName } from '../../types';

type StripState = 'upcoming' | 'active' | 'completed';

interface RaceContext {
  state: StripState;
  current: RaceWeekend;
  next?: RaceWeekend;
  totalRounds: number;
}

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  const sDay = s.getUTCDate();
  const eDay = e.getUTCDate();
  const month = e.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  const year = e.getUTCFullYear();
  return `${sDay}–${eDay} ${month} ${year}`;
};

const getCountryFlag = (weekend: RaceWeekend): string => {
  return weekend.flag || '';
};

export const RaceStatusStrip: React.FC = () => {
  const [raceCtx, setRaceCtx] = useState<RaceContext | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const sharedCtx = await getSharedRaceContext(2026);
        if (!mounted || !sharedCtx) return;

        let state: StripState = 'upcoming';
        if (sharedCtx.status === 'ACTIVE') {
          state = 'active';
        } else if (sharedCtx.status === 'COMPLETED') {
          state = 'completed';
        } else {
          // If upcoming, check if previous completed within 48h
          if (sharedCtx.previousWeekend && sharedCtx.previousWeekend.status === 'COMPLETED') {
            const prevEnd = new Date(sharedCtx.previousWeekend.endDate).getTime();
            const hoursSincePrev = (Date.now() - prevEnd) / (1000 * 3600);
            if (hoursSincePrev < 48) {
              state = 'completed';
              setRaceCtx({
                state: 'completed',
                current: sharedCtx.previousWeekend,
                next: sharedCtx.currentWeekend,
                totalRounds: sharedCtx.totalRounds,
              });
              return;
            }
          }
          state = 'upcoming';
        }

        setRaceCtx({
          state,
          current: sharedCtx.currentWeekend,
          next: sharedCtx.nextWeekend,
          totalRounds: sharedCtx.totalRounds,
        });
      } catch (e) {
        console.warn('RaceStatusStrip: Failed to load shared race context', e);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!raceCtx) return null;

  const { state, current, next, totalRounds } = raceCtx;
  const circuitName = getCircuitName(current.circuit);
  const roundNum = current.roundNumber || current.round || 0;

  return (
    <div className="race-status-strip">
      <div className="race-status-strip__inner">
        {state === 'active' && (
          <>
            <span className="race-status-strip__live-dot" />
            <span className="race-status-strip__label">RACE WEEKEND LIVE</span>
            <span className="race-status-strip__separator">|</span>
            <span className="race-status-strip__value">ROUND {roundNum} / {totalRounds}</span>
            <span className="race-status-strip__separator race-status-strip__detail">|</span>
            <span className="race-status-strip__value race-status-strip__detail">
              {getCountryFlag(current)} {current.raceName || current.name}
            </span>
            <span className="race-status-strip__separator race-status-strip__detail">|</span>
            <span className="race-status-strip__detail">
              {circuitName}, {current.country}
            </span>
          </>
        )}

        {state === 'upcoming' && (
          <>
            <span className="race-status-strip__upcoming-dot" />
            <span className="race-status-strip__label">NEXT ROUND</span>
            <span className="race-status-strip__separator">|</span>
            <span className="race-status-strip__value">ROUND {roundNum} / {totalRounds}</span>
            <span className="race-status-strip__separator race-status-strip__detail">|</span>
            <span className="race-status-strip__value race-status-strip__detail">
              {getCountryFlag(current)} {current.raceName || current.name}
            </span>
            <span className="race-status-strip__separator race-status-strip__detail">|</span>
            <span className="race-status-strip__detail">
              {circuitName}, {current.country}
            </span>
            <span className="race-status-strip__separator race-status-strip__dates">|</span>
            <span className="race-status-strip__dates">
              {formatDateRange(current.startDate, current.endDate)}
            </span>
          </>
        )}

        {state === 'completed' && (
          <>
            <span className="race-status-strip__complete-dot">✓</span>
            <span className="race-status-strip__label">ROUND COMPLETE</span>
            {next && (
              <>
                <span className="race-status-strip__separator">|</span>
                <span className="race-status-strip__value">
                  NEXT: {getCountryFlag(next)} {next.raceName || next.name}
                </span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

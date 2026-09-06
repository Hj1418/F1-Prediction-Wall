import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
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
        const weekends = await api.getRaceWeekends(2026);
        if (!mounted || weekends.length === 0) return;

        const sorted = [...weekends].sort((a, b) => a.roundNumber - b.roundNumber);
        const active = sorted.find(w => w.status === 'ACTIVE');
        const upcoming = sorted.find(w => w.status === 'UPCOMING');

        if (active) {
          const nextIdx = sorted.findIndex(w => w.raceWeekendId === active.raceWeekendId) + 1;
          setRaceCtx({
            state: 'active',
            current: active,
            next: sorted[nextIdx],
            totalRounds: sorted.length,
          });
        } else if (upcoming) {
          // Check if the previous race just completed
          const upIdx = sorted.findIndex(w => w.raceWeekendId === upcoming.raceWeekendId);
          const prev = upIdx > 0 ? sorted[upIdx - 1] : undefined;
          const prevEnd = prev ? new Date(prev.endDate).getTime() : 0;
          const hoursSincePrev = (Date.now() - prevEnd) / (1000 * 3600);

          if (prev && prev.status === 'COMPLETED' && hoursSincePrev < 48) {
            setRaceCtx({
              state: 'completed',
              current: prev,
              next: upcoming,
              totalRounds: sorted.length,
            });
          } else {
            setRaceCtx({
              state: 'upcoming',
              current: upcoming,
              totalRounds: sorted.length,
            });
          }
        } else {
          // All completed — show last race
          const last = sorted[sorted.length - 1];
          setRaceCtx({
            state: 'completed',
            current: last,
            totalRounds: sorted.length,
          });
        }
      } catch (e) {
        console.warn('RaceStatusStrip: Failed to load weekends', e);
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

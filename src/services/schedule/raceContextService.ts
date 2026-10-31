/**
 * The Grid — Shared Race Context Service
 * 
 * Single authoritative source of truth for:
 * - Which race is active / next on the calendar
 * - Race lifecycle state (ACTIVE, UPCOMING, COMPLETED)
 * - Prediction Bench round binding for the current race
 * 
 * Shared across Home, Navbar (RaceStatusStrip), Predictions Hub,
 * Prediction Bench, and Calendar widgets to eliminate disjoint race state.
 */

import { api } from '../apiClient';
import { clientCache, CACHE_TTL } from '../cache/clientCache';
import { RaceWeekend, PredictionRound } from '../../types';
import { isQualificationPredictionRound, generatePredictionRounds } from './predictionRoundGenerator';
import { testGrandPrixService } from '../testGrandPrix/testGrandPrixService';

export interface SharedRaceContext {
  currentWeekend: RaceWeekend;
  nextWeekend?: RaceWeekend;
  previousWeekend?: RaceWeekend;
  activePredictionRound?: PredictionRound;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  totalRounds: number;
  season: number;
}

/**
 * Centrally and dynamically resolves the authoritative current race context.
 * Deterministic with optional referenceDate (defaults to real-time Date.now()).
 */
export async function getSharedRaceContext(
  season: number = 2026,
  referenceDate: Date = new Date()
): Promise<SharedRaceContext | null> {
  const refMs = referenceDate.getTime();
  const cacheKey = `shared_race_context_${season}_${Math.floor(refMs / 60000)}`; // 1-minute bucket

  return clientCache.getOrFetch<SharedRaceContext | null>(
    cacheKey,
    async () => {
      try {
        const [weekends, allRounds] = await Promise.all([
          api.getRaceWeekends(season),
          api.getPredictionRounds().catch(() => [] as PredictionRound[]),
        ]);

        if (!weekends || weekends.length === 0) {
          return null;
        }

        // Sort weekends strictly by round number
        const sortedWeekends = [...weekends].sort(
          (a, b) => (a.roundNumber || a.round || 0) - (b.roundNumber || b.round || 0)
        );

        // Filter out deprecated qualification rounds for active binding
        const racePredictionRounds = allRounds.filter(r => !isQualificationPredictionRound(r));

        // Evaluate weekend status against reference time
        let activeWeekend: RaceWeekend | undefined;
        let upcomingWeekend: RaceWeekend | undefined;
        let previousWeekend: RaceWeekend | undefined;

        for (let i = 0; i < sortedWeekends.length; i++) {
          const w = sortedWeekends[i];
          const startMs = new Date(w.startDate).getTime();
          const endMs = new Date(w.endDate).getTime();
          const postRaceBufferMs = 6 * 3600 * 1000;

          if (w.status === 'ACTIVE' || (refMs >= startMs && refMs <= endMs + postRaceBufferMs)) {
            activeWeekend = w;
            previousWeekend = i > 0 ? sortedWeekends[i - 1] : undefined;
            upcomingWeekend = i < sortedWeekends.length - 1 ? sortedWeekends[i + 1] : undefined;
            break;
          } else if (refMs < startMs && !upcomingWeekend) {
            upcomingWeekend = w;
            previousWeekend = i > 0 ? sortedWeekends[i - 1] : undefined;
            break;
          }
        }

        let selectedWeekend: RaceWeekend;
        let state: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';

        if (activeWeekend) {
          selectedWeekend = activeWeekend;
          state = 'ACTIVE';
        } else if (upcomingWeekend) {
          selectedWeekend = upcomingWeekend;
          state = 'UPCOMING';
        } else {
          // All season rounds completed — select the final championship race
          selectedWeekend = sortedWeekends[sortedWeekends.length - 1];
          previousWeekend = sortedWeekends.length > 1 ? sortedWeekends[sortedWeekends.length - 2] : undefined;
          state = 'COMPLETED';
        }

        // Ensure selectedWeekend has complete sessions populated
        const weekendKey = selectedWeekend.raceWeekendId || selectedWeekend.id || '2026_default';
        if (!selectedWeekend.sessions || selectedWeekend.sessions.length === 0) {
          try {
            const detailed = await api.getWeekendById(weekendKey);
            if (detailed && detailed.sessions && detailed.sessions.length > 0) {
              selectedWeekend = { ...selectedWeekend, ...detailed };
            }
          } catch (e) {
            console.warn('Could not populate sessions for selected weekend:', e);
          }
        }

        // If sessions still absent, dynamically synthesize sessions adhering strictly to weekendType
        if (!selectedWeekend.sessions || selectedWeekend.sessions.length === 0) {
          const isSprint = selectedWeekend.weekendType === 'SPRINT';
          const startMs = new Date(selectedWeekend.startDate || Date.now()).getTime();
          const endMs = new Date(selectedWeekend.endDate || new Date(startMs + 48 * 3600 * 1000)).getTime();

          if (isSprint) {
            selectedWeekend.sessions = [
              { sessionId: `${weekendKey}_FP1`, raceWeekendId: weekendKey, sessionType: 'FP1', type: 'FP1', name: 'Practice 1', startTime: new Date(startMs).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_SQ`, raceWeekendId: weekendKey, sessionType: 'SPRINT_QUALIFYING', type: 'SPRINT_QUALIFYING', name: 'Sprint Qualifying', startTime: new Date(startMs + 4 * 3600 * 1000).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_SPRINT`, raceWeekendId: weekendKey, sessionType: 'SPRINT', type: 'SPRINT', name: 'Sprint Race', startTime: new Date(startMs + 24 * 3600 * 1000).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_QUALIFYING`, raceWeekendId: weekendKey, sessionType: 'QUALIFYING', type: 'QUALIFYING', name: 'Grand Prix Qualifying', startTime: new Date(startMs + 28 * 3600 * 1000).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_RACE`, raceWeekendId: weekendKey, sessionType: 'RACE', type: 'RACE', name: selectedWeekend.raceName || selectedWeekend.name || 'Grand Prix', startTime: new Date(endMs).toISOString(), status: 'UPCOMING' },
            ];
          } else {
            selectedWeekend.sessions = [
              { sessionId: `${weekendKey}_FP1`, raceWeekendId: weekendKey, sessionType: 'FP1', type: 'FP1', name: 'Practice 1', startTime: new Date(startMs).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_FP2`, raceWeekendId: weekendKey, sessionType: 'FP2', type: 'FP2', name: 'Practice 2', startTime: new Date(startMs + 3.5 * 3600 * 1000).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_FP3`, raceWeekendId: weekendKey, sessionType: 'FP3', type: 'FP3', name: 'Practice 3', startTime: new Date(startMs + 23 * 3600 * 1000).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_QUALIFYING`, raceWeekendId: weekendKey, sessionType: 'QUALIFYING', type: 'QUALIFYING', name: 'Qualifying', startTime: new Date(startMs + 26.5 * 3600 * 1000).toISOString(), status: 'UPCOMING' },
              { sessionId: `${weekendKey}_RACE`, raceWeekendId: weekendKey, sessionType: 'RACE', type: 'RACE', name: selectedWeekend.raceName || selectedWeekend.name || 'Grand Prix', startTime: new Date(endMs).toISOString(), status: 'UPCOMING' },
            ];
          }
        }

        // Find associated active race prediction round (RACE_PREDICTION)
        let activePredRound = racePredictionRounds.find(
          r => (r.raceWeekendId === selectedWeekend.raceWeekendId || r.raceWeekendId === selectedWeekend.id) && !isQualificationPredictionRound(r)
        );

        // Dynamic fallback: generate active prediction round if not pre-populated
        if (!activePredRound && selectedWeekend) {
          const generated = generatePredictionRounds(selectedWeekend);
          activePredRound = generated.find(r => !isQualificationPredictionRound(r));
        }

        return {
          currentWeekend: selectedWeekend,
          nextWeekend: upcomingWeekend && upcomingWeekend.raceWeekendId !== selectedWeekend.raceWeekendId ? upcomingWeekend : undefined,
          previousWeekend,
          activePredictionRound: activePredRound,
          status: state,
          totalRounds: sortedWeekends.length,
          season,
        };
      } catch (err) {
        console.error('Failed to resolve shared race context:', err);
        return null;
      }
    },
    { ttlMs: CACHE_TTL.SHORT }
  );
}

export type PredictionEnvironment = 'PRODUCTION' | 'TEST';

export interface PredictionContext {
  environment: PredictionEnvironment;
  raceId: string;
  roundId: string;
  weekend?: RaceWeekend;
  round?: PredictionRound;
  isTest: boolean;
}

/**
 * Returns the currently active test prediction context if Test Grand Prix has been activated.
 * Returns null when Test Grand Prix is inactive or has been reset.
 */
export function getActiveTestPredictionContext(): PredictionContext | null {
  try {
    const testState = testGrandPrixService.getState();
    if (testState.weekend && testState.round) {
      return {
        environment: 'TEST',
        raceId: testState.weekend.raceWeekendId,
        roundId: testState.round.roundId,
        weekend: testState.weekend,
        round: testState.round,
        isTest: true,
      };
    }
  } catch (err) {
    console.warn('Error reading test Grand Prix state:', err);
  }
  return null;
}

/**
 * Centrally resolves prediction context for a requested environment.
 */
export async function getPredictionContext(
  environment: PredictionEnvironment = 'PRODUCTION',
  season: number = 2026
): Promise<PredictionContext | null> {
  if (environment === 'TEST') {
    return getActiveTestPredictionContext();
  }

  const shared = await getSharedRaceContext(season);
  if (!shared || !shared.currentWeekend || !shared.activePredictionRound) {
    return null;
  }

  return {
    environment: 'PRODUCTION',
    raceId: shared.currentWeekend.raceWeekendId,
    roundId: shared.activePredictionRound.roundId,
    weekend: shared.currentWeekend,
    round: shared.activePredictionRound,
    isTest: false,
  };
}


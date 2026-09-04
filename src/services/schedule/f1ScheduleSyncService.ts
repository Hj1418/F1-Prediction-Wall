import {
  RaceWeekend,
  Session,
  PredictionRound,
  SyncLog,
} from '../../types';
import { F1DataProvider, getF1DataProvider } from '../providers/f1DataProvider';
import { generatePredictionRounds } from './predictionRoundGenerator';

export interface SyncResult {
  weekends: RaceWeekend[];
  rounds: PredictionRound[];
  logs: SyncLog[];
}

export class F1ScheduleSyncService {
  private provider: F1DataProvider;

  constructor(provider?: F1DataProvider) {
    this.provider = provider || getF1DataProvider('JOLPICA');
  }

  public setProvider(provider: F1DataProvider) {
    this.provider = provider;
  }

  /**
   * Synchronizes full season calendar from the F1 data provider.
   * Compares against existing data, detects changes, updates prediction rounds,
   * and preserves existing predictions.
   */
  public async syncSeasonCalendar(
    season: number,
    existingWeekends: RaceWeekend[] = [],
    existingRounds: PredictionRound[] = []
  ): Promise<SyncResult> {
    const rawWeekends = await this.provider.getSeasonCalendar(season);
    const logs: SyncLog[] = [];

    const updatedWeekends: RaceWeekend[] = [];
    const updatedRounds: PredictionRound[] = [...existingRounds];

    for (const fetchedWeekend of rawWeekends) {
      const fetchedId = fetchedWeekend.id || fetchedWeekend.raceWeekendId;
      const existing = existingWeekends.find(w => (w.id || w.raceWeekendId) === fetchedId);

      if (!existing) {
        // 1. Newly discovered weekend
        const newRounds = generatePredictionRounds(fetchedWeekend);
        updatedWeekends.push(fetchedWeekend);
        updatedRounds.push(...newRounds);

        logs.push({
          logId: `log_${Date.now()}_${fetchedId}`,
          timestamp: new Date().toISOString(),
          entityType: 'RACE_WEEKEND',
          entityId: fetchedId,
          action: 'CREATED',
          newValue: `${fetchedWeekend.name || fetchedWeekend.raceName} (${fetchedWeekend.weekendType})`,
          details: `Added ${fetchedWeekend.name || fetchedWeekend.raceName} with ${newRounds.length} prediction rounds`,
        });
      } else {
        // 2. Existing weekend - check for schedule changes
        const changeResult = this.detectScheduleChanges(existing.sessions || [], fetchedWeekend.sessions || []);

        if (changeResult.hasChanges) {
          // Merge sessions
          const mergedWeekend: RaceWeekend = {
            ...existing,
            ...fetchedWeekend,
            sessions: fetchedWeekend.sessions,
            lastSyncedAt: new Date().toISOString(),
          };

          updatedWeekends.push(mergedWeekend);

          // Recalculate prediction round deadlines while preserving existing round status/configs
          const freshRounds = generatePredictionRounds(mergedWeekend);
          freshRounds.forEach(fr => {
            const rIdx = updatedRounds.findIndex(r => r.roundId === fr.roundId || r.id === fr.roundId);
            if (rIdx >= 0) {
              // Update timestamps while preserving state
              updatedRounds[rIdx] = {
                ...updatedRounds[rIdx],
                opensAt: fr.opensAt,
                closesAt: fr.closesAt,
                lastUpdatedAt: new Date().toISOString(),
                lastSyncedAt: new Date().toISOString(),
              };
            } else {
              updatedRounds.push(fr);
            }
          });

          changeResult.changes.forEach(ch => {
            logs.push({
              logId: `log_${Date.now()}_${ch.sessionId}`,
              timestamp: new Date().toISOString(),
              entityType: 'SESSION',
              entityId: ch.sessionId,
              action: 'UPDATED',
              previousValue: ch.oldTime,
              newValue: ch.newTime,
              details: `Session start time shifted from ${ch.oldTime} to ${ch.newTime}. Prediction deadline recalculated.`,
            });
          });
        } else {
          // No schedule change
          updatedWeekends.push({
            ...existing,
            lastSyncedAt: new Date().toISOString(),
          });

          const existingId = existing.id || existing.raceWeekendId;
          logs.push({
            logId: `log_${Date.now()}_${existingId}`,
            timestamp: new Date().toISOString(),
            entityType: 'RACE_WEEKEND',
            entityId: existingId,
            action: 'NO_CHANGE',
            details: `Schedule verified for ${existing.name || existing.raceName}. No changes detected.`,
          });
        }
      }
    }

    return {
      weekends: updatedWeekends,
      rounds: updatedRounds,
      logs,
    };
  }

  /**
   * Synchronizes a single race weekend by season and round number.
   */
  public async syncRaceWeekend(
    season: number,
    roundNumber: number,
    existingWeekend?: RaceWeekend,
    existingRounds: PredictionRound[] = []
  ): Promise<{ weekend: RaceWeekend; rounds: PredictionRound[]; logs: SyncLog[] }> {
    const fetchedWeekend = await this.provider.getRaceWeekend(season, roundNumber);
    const fetchedId = fetchedWeekend.id || fetchedWeekend.raceWeekendId;
    const logs: SyncLog[] = [];
    let updatedRounds = [...existingRounds];

    if (!existingWeekend) {
      const newRounds = generatePredictionRounds(fetchedWeekend);
      logs.push({
        logId: `log_${Date.now()}_${fetchedId}`,
        timestamp: new Date().toISOString(),
        entityType: 'RACE_WEEKEND',
        entityId: fetchedId,
        action: 'CREATED',
        newValue: fetchedWeekend.name || fetchedWeekend.raceName,
      });
      return {
        weekend: fetchedWeekend,
        rounds: newRounds,
        logs,
      };
    }

    const changeResult = this.detectScheduleChanges(existingWeekend.sessions || [], fetchedWeekend.sessions || []);

    const mergedWeekend: RaceWeekend = {
      ...existingWeekend,
      ...fetchedWeekend,
      sessions: fetchedWeekend.sessions,
      lastSyncedAt: new Date().toISOString(),
    };

    if (changeResult.hasChanges) {
      const freshRounds = generatePredictionRounds(mergedWeekend);
      freshRounds.forEach(fr => {
        const rIdx = updatedRounds.findIndex(r => r.roundId === fr.roundId);
        if (rIdx >= 0) {
          updatedRounds[rIdx] = {
            ...updatedRounds[rIdx],
            opensAt: fr.opensAt,
            closesAt: fr.closesAt,
            lastUpdatedAt: new Date().toISOString(),
          };
        } else {
          updatedRounds.push(fr);
        }
      });

      changeResult.changes.forEach(ch => {
        logs.push({
          logId: `log_${Date.now()}_${ch.sessionId}`,
          timestamp: new Date().toISOString(),
          entityType: 'SESSION',
          entityId: ch.sessionId,
          action: 'UPDATED',
          previousValue: ch.oldTime,
          newValue: ch.newTime,
          details: `Session ${ch.sessionId} updated to ${ch.newTime}`,
        });
      });
    } else {
      const existingId = existingWeekend.id || existingWeekend.raceWeekendId;
      logs.push({
        logId: `log_${Date.now()}_${existingId}`,
        timestamp: new Date().toISOString(),
        entityType: 'RACE_WEEKEND',
        entityId: existingId,
        action: 'NO_CHANGE',
      });
    }

    return {
      weekend: mergedWeekend,
      rounds: updatedRounds,
      logs,
    };
  }

  /**
   * Compares session timestamps to detect schedule updates (e.g. session delays, time shifts)
   */
  public detectScheduleChanges(
    existingSessions: Session[],
    newSessions: Session[]
  ): { hasChanges: boolean; changes: { sessionId: string; oldTime: string; newTime: string }[] } {
    const changes: { sessionId: string; oldTime: string; newTime: string }[] = [];

    newSessions.forEach(newSess => {
      const match = existingSessions.find(s => s.type === newSess.type || (s.id && s.id === newSess.id) || (s.sessionId && s.sessionId === newSess.sessionId));
      if (match) {
        const oldMs = new Date(match.startTime).getTime();
        const newMs = new Date(newSess.startTime).getTime();

        // Detect timestamp difference > 60 seconds
        if (Math.abs(oldMs - newMs) > 60 * 1000) {
          const sid = match.id || match.sessionId || newSess.id || newSess.sessionId || 'session';
          changes.push({
            sessionId: sid,
            oldTime: match.startTime,
            newTime: newSess.startTime,
          });
        }
      }
    });

    return {
      hasChanges: changes.length > 0,
      changes,
    };
  }
}

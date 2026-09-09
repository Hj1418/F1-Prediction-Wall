import { RaceWeekend, Session, SyncLog } from '../types';
import { apiClient, isLiveBackend } from './client';
import { mockApi } from '../services/mockApi';
import { F1ScheduleSyncService } from '../services/schedule/f1ScheduleSyncService';
import { JolpicaF1Provider } from '../services/providers/jolpicaProvider';

const syncService = new F1ScheduleSyncService(new JolpicaF1Provider());

export const raceWeekendApi = {
  async getServerTime(): Promise<string> {
    if (isLiveBackend) {
      const res = await apiClient<{ serverTime: string }>('action=getServerTime');
      if (res.success && res.data?.serverTime) return res.data.serverTime;
    }
    return new Date().toISOString();
  },

  async getCurrentWeekend(): Promise<RaceWeekend | null> {
    if (isLiveBackend) {
      const res = await apiClient<RaceWeekend>('action=getCurrentWeekend');
      if (res.success && res.data) return res.data;
    }
    if (import.meta.env.PROD) return null;
    const all = await mockApi.getRaceWeekends();
    return all.find(w => w.status === 'ACTIVE') || all.find(w => w.status === 'UPCOMING') || all[0] || null;
  },

  async getUpcomingRace(): Promise<RaceWeekend | null> {
    if (isLiveBackend) {
      const res = await apiClient<RaceWeekend>('action=getUpcomingRace');
      if (res.success && res.data) return res.data;
    }
    if (import.meta.env.PROD) return null;
    const all = await mockApi.getRaceWeekends();
    return all.find(w => w.status === 'UPCOMING') || all[0] || null;
  },

  async getRaceWeekends(season: number = 2026): Promise<RaceWeekend[]> {
    let list: RaceWeekend[] = [];
    if (isLiveBackend) {
      const res = await apiClient<RaceWeekend[]>(`action=getRaceWeekends&season=${season}`);
      if (res.success && res.data && res.data.length > 0) {
        list = res.data;
      }
    }
    if (list.length === 0) {
      if (import.meta.env.PROD) return [];
      list = await mockApi.getRaceWeekends();
    }

    if (season) {
      const filtered = list.filter(w => Number(w.season) === season);
      if (filtered.length > 0) list = filtered;
    }

    // Evaluate live status relative to current timestamp (e.g. Monza active on 2026-09-04)
    const now = new Date().getTime();
    return list.map(w => {
      const startMs = new Date(w.startDate).getTime();
      const endMs = new Date(w.endDate).getTime();
      let status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' = w.status as any;
      if (now > endMs) {
        status = 'COMPLETED';
      } else if (now >= startMs - 24 * 3600 * 1000 && now <= endMs) {
        status = 'ACTIVE';
      } else {
        status = 'UPCOMING';
      }
      return { ...w, status };
    });
  },

  async getWeekendById(id: string): Promise<RaceWeekend | null> {
    if (isLiveBackend) {
      const res = await apiClient<RaceWeekend>(`action=getWeekendDetails&raceWeekendId=${encodeURIComponent(id)}`);
      if (res.success && res.data) return res.data;
    }
    return mockApi.getWeekendById(id);
  },

  async getSessionSchedule(raceWeekendId: string): Promise<Session[]> {
    if (isLiveBackend) {
      const res = await apiClient<Session[]>(`action=getSessionSchedule&raceWeekendId=${encodeURIComponent(raceWeekendId)}`);
      if (res.success && res.data) return res.data;
    }
    const weekend = await mockApi.getWeekendById(raceWeekendId);
    return weekend?.sessions || [];
  },

  /**
   * Synchronizes calendar from external provider (Jolpica F1)
   */
  async syncSeasonCalendar(season: number = 2026): Promise<{
    season: number;
    syncedCount: number;
    weekends: RaceWeekend[];
    logs: SyncLog[];
  }> {
    if (isLiveBackend) {
      const res = await apiClient<any>('', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncSeasonCalendar', season }),
      });
      if (res.success && res.data) return res.data;
    }

    // Local / In-browser sync via JolpicaF1Provider
    const existingWeekends = await mockApi.getRaceWeekends();
    const existingRounds = await mockApi.getPredictionRounds();

    const result = await syncService.syncSeasonCalendar(season, existingWeekends, existingRounds);

    // Save into local mock database
    for (const w of result.weekends) {
      await mockApi.adminSaveWeekend(w);
    }
    for (const r of result.rounds) {
      await mockApi.adminSavePredictionRound(r);
    }

    return {
      season,
      syncedCount: result.weekends.length,
      weekends: result.weekends,
      logs: result.logs,
    };
  },
};

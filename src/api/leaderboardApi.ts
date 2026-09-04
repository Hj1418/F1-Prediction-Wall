import { LeaderboardEntry } from '../types';
import { apiClient, isLiveBackend } from './client';
import { mockApi } from '../services/mockApi';

export const leaderboardApi = {
  async getLeaderboard(type: 'season' | 'weekend' | 'round', id?: string): Promise<LeaderboardEntry[]> {
    if (isLiveBackend) {
      const url = `action=getLeaderboard&type=${type}${id ? `&id=${encodeURIComponent(id)}` : ''}`;
      const res = await apiClient<LeaderboardEntry[]>(url);
      if (res.success && res.data) return res.data;
    }
    return mockApi.getLeaderboard(type, id);
  },
};

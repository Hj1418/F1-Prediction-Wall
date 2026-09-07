import {
  Constructor,
  RaceWeekend,
  PredictionRound,
  User,
  Prediction,
  SessionResult,
  RoundScore,
  LeaderboardEntry,
  Achievement,
  Driver,
  ApiResponse,
} from '../types';
import { mockApi } from './mockApi';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

export const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http'));

export const api = {
  isLive: isLiveBackend,

  async getDrivers(): Promise<Driver[]> {
    return mockApi.getDrivers();
  },

  async getConstructors(): Promise<Constructor[]> {
    return mockApi.getConstructors();
  },

  async getRaceWeekends(season: number = 2026): Promise<RaceWeekend[]> {
    let list: RaceWeekend[] = [];
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getRaceWeekends&season=${season}`);
        const json: ApiResponse<RaceWeekend[]> = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          list = json.data;
        }
      } catch (e) {
        console.warn('Live API request failed, falling back to mockApi', e);
      }
    }
    if (list.length === 0) {
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
    if (!isLiveBackend) return mockApi.getWeekendById(id);
    try {
      const res = await fetch(`${API_BASE_URL}?action=getWeekendDetails&raceWeekendId=${encodeURIComponent(id)}`);
      const json: ApiResponse<RaceWeekend> = await res.json();
      if (json.success && json.data) return json.data;
      return mockApi.getWeekendById(id);
    } catch (e) {
      return mockApi.getWeekendById(id);
    }
  },

  async getPredictionRounds(raceWeekendId?: string): Promise<PredictionRound[]> {
    if (!isLiveBackend) return mockApi.getPredictionRounds(raceWeekendId);
    try {
      const url = `${API_BASE_URL}?action=getPredictionRounds${raceWeekendId ? `&raceWeekendId=${encodeURIComponent(raceWeekendId)}` : ''}`;
      const res = await fetch(url);
      const json: ApiResponse<PredictionRound[]> = await res.json();
      if (json.success && json.data) return json.data;
      return mockApi.getPredictionRounds(raceWeekendId);
    } catch (e) {
      return mockApi.getPredictionRounds(raceWeekendId);
    }
  },

  async getPredictionRoundById(roundId: string): Promise<PredictionRound | null> {
    if (!isLiveBackend) return mockApi.getPredictionRoundById(roundId);
    try {
      const res = await fetch(`${API_BASE_URL}?action=getPredictionRound&roundId=${encodeURIComponent(roundId)}`);
      const json: ApiResponse<PredictionRound> = await res.json();
      if (json.success && json.data) return json.data;
      return mockApi.getPredictionRoundById(roundId);
    } catch (e) {
      return mockApi.getPredictionRoundById(roundId);
    }
  },

  async getUserPrediction(roundId: string, userId: string): Promise<Prediction | null> {
    if (!isLiveBackend) return mockApi.getUserPrediction(roundId, userId);
    try {
      const res = await fetch(`${API_BASE_URL}?action=getUserPrediction&roundId=${encodeURIComponent(roundId)}&userId=${encodeURIComponent(userId)}`);
      const json: ApiResponse<Prediction> = await res.json();
      if (json.success && json.data) return json.data;
      return mockApi.getUserPrediction(roundId, userId);
    } catch (e) {
      return mockApi.getUserPrediction(roundId, userId);
    }
  },

  async submitPrediction(payload: {
    userId: string;
    roundId: string;
    predictionData: Record<string, any>;
  }): Promise<Prediction> {
    if (!isLiveBackend) return mockApi.submitPrediction(payload);
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Apps Script preferred Content-Type for CORS
        body: JSON.stringify({ action: 'submitPrediction', ...payload }),
      });
      const json: ApiResponse<Prediction> = await res.json();
      if (json.success && json.data) return json.data;
      throw new Error(json.message || 'Failed to submit prediction on live backend');
    } catch (e: any) {
      console.warn('Live API submit failed, saving locally via mockApi:', e);
      return mockApi.submitPrediction(payload);
    }
  },

  async getOfficialResult(roundId: string): Promise<SessionResult | null> {
    if (!isLiveBackend) return mockApi.getOfficialResult(roundId);
    try {
      const res = await fetch(`${API_BASE_URL}?action=getRoundResults&roundId=${encodeURIComponent(roundId)}`);
      const json: ApiResponse<SessionResult> = await res.json();
      if (json.success && json.data) return json.data;
      return mockApi.getOfficialResult(roundId);
    } catch (e) {
      return mockApi.getOfficialResult(roundId);
    }
  },

  async getRoundScore(roundId: string, userId: string): Promise<RoundScore | null> {
    return mockApi.getRoundScore(roundId, userId);
  },

  async getLeaderboard(type: 'season' | 'weekend' | 'round', id?: string): Promise<LeaderboardEntry[]> {
    if (!isLiveBackend) return mockApi.getLeaderboard(type, id);
    try {
      const url = `${API_BASE_URL}?action=getLeaderboard&type=${type}${id ? `&id=${encodeURIComponent(id)}` : ''}`;
      const res = await fetch(url);
      const json: ApiResponse<LeaderboardEntry[]> = await res.json();
      if (json.success && json.data) return json.data;
      return mockApi.getLeaderboard(type, id);
    } catch (e) {
      return mockApi.getLeaderboard(type, id);
    }
  },

  async getUserProfile(usernameOrId: string): Promise<User | null> {
    return mockApi.getUserProfile(usernameOrId);
  },

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return mockApi.getUserAchievements(userId);
  },

  async getUserPredictionsHistory(userId: string) {
    return mockApi.getUserPredictionsHistory(userId);
  },

  async getAllUsers(): Promise<User[]> {
    return mockApi.getAllUsers();
  },

  async registerUser(userData: any): Promise<User> {
    if (!isLiveBackend) return mockApi.registerUser(userData);
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'registerUser', ...userData }),
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
      throw new Error(json.message || 'Registration failed');
    } catch (e: any) {
      console.warn('Live API registration failed, saving locally via mockApi:', e);
      return mockApi.registerUser(userData);
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!isLiveBackend) return mockApi.updateUser(userId, updates);
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateUser', userId, updates }),
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
      return mockApi.updateUser(userId, updates);
    } catch (e) {
      return mockApi.updateUser(userId, updates);
    }
  },

  // Admin Methods
  async adminSaveWeekend(weekend: Partial<RaceWeekend>): Promise<RaceWeekend> {
    return mockApi.adminSaveWeekend(weekend);
  },

  async adminSavePredictionRound(round: Partial<PredictionRound>): Promise<PredictionRound> {
    return mockApi.adminSavePredictionRound(round);
  },

  async adminSubmitResult(roundId: string, resultData: Record<string, any>): Promise<SessionResult> {
    return mockApi.adminSubmitResult(roundId, resultData);
  },

  async adminCalculateScores(roundId: string) {
    return mockApi.adminCalculateScores(roundId);
  },

  resetDemoData() {
    mockApi.resetToDefaults();
  },
};

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
import { clientCache, TTL } from './cache/clientCache';

const isTestEnv = typeof window === 'undefined';

const PRODUCTION_API_URL =
  'https://script.google.com/macros/s/AKfycbz_TmSvhPNdrTT9HCiCnViVY9dG-5ypZMfyWtp0d4XcjP25mJc7yW8VyawKaSI6LTF9/exec';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' ? PRODUCTION_API_URL : '');

export const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http') && !isTestEnv);

const isProd = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD);

export const api = {
  isLive: isLiveBackend,

  async getDrivers(): Promise<Driver[]> {
    return clientCache.getOrFetch('f1_drivers_list', () => mockApi.getDrivers(), {
      ttlMs: TTL.LONG,
    });
  },

  async getConstructors(): Promise<Constructor[]> {
    return clientCache.getOrFetch('f1_constructors_list', () => mockApi.getConstructors(), {
      ttlMs: TTL.LONG,
    });
  },

  async getRaceWeekends(season: number = 2026): Promise<RaceWeekend[]> {
    return clientCache.getOrFetch(`f1_weekends_${season}`, async () => {
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
    }, { ttlMs: TTL.SHORT });
  },

  async getWeekendById(id: string): Promise<RaceWeekend | null> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getWeekendDetails&raceWeekendId=${encodeURIComponent(id)}`);
        const json: ApiResponse<RaceWeekend> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.error('Live API getWeekendById failed:', e);
      }
    }
    return isProd ? null : mockApi.getWeekendById(id);
  },

  async getPredictionRounds(raceWeekendId?: string): Promise<PredictionRound[]> {
    if (isLiveBackend) {
      try {
        const url = `${API_BASE_URL}?action=getPredictionRounds${raceWeekendId ? `&raceWeekendId=${encodeURIComponent(raceWeekendId)}` : ''}`;
        const res = await fetch(url);
        const json: ApiResponse<PredictionRound[]> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.error('Live API getPredictionRounds failed:', e);
      }
    }
    return isProd ? [] : mockApi.getPredictionRounds(raceWeekendId);
  },

  async getPredictionRoundById(roundId: string): Promise<PredictionRound | null> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getPredictionRound&roundId=${encodeURIComponent(roundId)}`);
        const json: ApiResponse<PredictionRound> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.error('Live API getPredictionRoundById failed:', e);
      }
    }
    return isProd ? null : mockApi.getPredictionRoundById(roundId);
  },

  async getUserPrediction(roundId: string, userId: string): Promise<Prediction | null> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getUserPrediction&roundId=${encodeURIComponent(roundId)}&userId=${encodeURIComponent(userId)}`);
        const json: ApiResponse<Prediction> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.error('Live API getUserPrediction failed:', e);
      }
    }
    return isProd ? null : mockApi.getUserPrediction(roundId, userId);
  },

  async submitPrediction(payload: {
    userId: string;
    roundId: string;
    predictionData: Record<string, any>;
  }): Promise<Prediction> {
    if (!isLiveBackend && isProd) {
      throw new Error('Live database connection is required for predictions.');
    }
    if (!isLiveBackend) return mockApi.submitPrediction(payload);
    try {
      const res = await fetch(`${API_BASE_URL}?action=submitPrediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submitPrediction', ...payload }),
      });
      const json: ApiResponse<Prediction> = await res.json();
      if (json.success && json.data) return json.data;
      throw new Error(json.message || 'Failed to submit prediction to live database');
    } catch (e: any) {
      console.error('Live database prediction submit failed:', e);
      throw new Error(e.message || 'Failed to submit prediction to database');
    }
  },

  async getOfficialResult(roundId: string): Promise<SessionResult | null> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getRoundResults&roundId=${encodeURIComponent(roundId)}`);
        const json: ApiResponse<SessionResult> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.error('Live API getOfficialResult failed:', e);
      }
    }
    return isProd ? null : mockApi.getOfficialResult(roundId);
  },

  async getRoundScore(roundId: string, userId: string): Promise<RoundScore | null> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getRoundScore&roundId=${encodeURIComponent(roundId)}&userId=${encodeURIComponent(userId)}`);
        const json: ApiResponse<RoundScore> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.error('Live API getRoundScore failed:', e);
      }
    }
    return isProd ? null : mockApi.getRoundScore(roundId, userId);
  },

  async getLeaderboard(type: 'season' | 'weekend' | 'round', id?: string): Promise<LeaderboardEntry[]> {
    if (isLiveBackend) {
      try {
        const url = `${API_BASE_URL}?action=getLeaderboard&type=${type}${id ? `&id=${encodeURIComponent(id)}` : ''}`;
        const res = await fetch(url);
        const json: ApiResponse<LeaderboardEntry[]> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.error('Live API getLeaderboard failed:', e);
      }
    }
    return isProd ? [] : mockApi.getLeaderboard(type, id);
  },

  async getUserProfile(usernameOrId: string): Promise<User | null> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getUserProfile&userId=${encodeURIComponent(usernameOrId)}`);
        const json: ApiResponse<User> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.warn('Live API getUserProfile failed, checking fallback:', e);
      }
    }
    return isProd ? null : mockApi.getUserProfile(usernameOrId);
  },

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getUserAchievements&userId=${encodeURIComponent(userId)}`);
        const json: ApiResponse<Achievement[]> = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.warn('Live API getUserAchievements failed, checking fallback:', e);
      }
    }
    return isProd ? [] : mockApi.getUserAchievements(userId);
  },

  async getUserPredictionsHistory(userId: string) {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getUserPredictionsHistory&userId=${encodeURIComponent(userId)}`);
        const json = await res.json();
        if (json.success && json.data) return json.data;
      } catch (e) {
        console.warn('Live API getUserPredictionsHistory failed, checking fallback:', e);
      }
    }
    return isProd ? [] : mockApi.getUserPredictionsHistory(userId);
  },

  async getAllUsers(): Promise<User[]> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getAllUsers`);
        const json: ApiResponse<User[]> = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      } catch (e) {
        console.warn('Live API getAllUsers failed, checking fallback:', e);
      }
    }
    return isProd ? [] : mockApi.getAllUsers();
  },

  async getAdminUsers(requesterId: string): Promise<User[]> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=getAdminUsers&requesterId=${encodeURIComponent(requesterId)}`);
        const json: ApiResponse<User[]> = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
        throw new Error(json.message || 'Failed to fetch admin users directory');
      } catch (e: any) {
        console.error('Live API getAdminUsers error:', e);
        throw e;
      }
    }
    if (isProd) {
      throw new Error('Live database required for admin directory.');
    }
    return mockApi.getAdminUsers(requesterId);
  },

  async googleLogin(payload: { email: string; displayName?: string; photoUrl?: string; accessToken?: string }): Promise<User> {
    if (!isLiveBackend && isProd) {
      throw new Error('Live database connection is required for Google authentication.');
    }
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=googleLogin`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'googleLogin', ...payload }),
        });
        const json: ApiResponse<User> = await res.json();
        if (json.success && json.data) return json.data;
        throw new Error(json.message || 'Failed to authenticate Google user on live database');
      } catch (e: any) {
        console.error('Live API googleLogin failed:', e);
        throw e;
      }
    }
    return mockApi.googleLogin(payload);
  },

  async loginUser(identifier: string, passwordHash?: string): Promise<User> {
    if (!isLiveBackend && isProd) {
      throw new Error('Live database connection is required for login.');
    }
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=loginUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'loginUser', identifier, passwordHash }),
        });
        const json: ApiResponse<User> = await res.json();
        if (json.success && json.data) return json.data;
        throw new Error(json.message || 'Authentication failed on live database');
      } catch (e: any) {
        console.error('Live API login failed:', e);
        throw e;
      }
    }
    return mockApi.login(identifier, passwordHash);
  },

  async registerUser(userData: any): Promise<User> {
    if (!isLiveBackend && isProd) {
      throw new Error('Live database connection is required for registration.');
    }
    if (!isLiveBackend) return mockApi.registerUser(userData);
    try {
      const res = await fetch(`${API_BASE_URL}?action=registerUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'registerUser', ...userData }),
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
      throw new Error(json.message || 'Registration failed on live database');
    } catch (e: any) {
      console.error('Live API registration failed:', e);
      throw e;
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!isLiveBackend && isProd) {
      throw new Error('Live database connection is required for profile updates.');
    }
    if (!isLiveBackend) return mockApi.updateUser(userId, updates);
    try {
      const res = await fetch(`${API_BASE_URL}?action=updateUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateUser', userId, updates }),
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
      throw new Error(json.message || 'Profile update failed on database');
    } catch (e: any) {
      console.error('Live API updateUser failed:', e);
      throw e;
    }
  },

  async checkUsername(username: string, excludeUserId?: string): Promise<{ available: boolean; reason?: string; username?: string }> {
    if (isLiveBackend) {
      try {
        const url = `${API_BASE_URL}?action=checkUsernameAvailability&username=${encodeURIComponent(username)}${excludeUserId ? `&userId=${encodeURIComponent(excludeUserId)}` : ''}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) return json.data;
        return { available: false, reason: json.message || 'Racer Tag check failed' };
      } catch (e: any) {
        console.error('Live API checkUsername failed:', e);
        if (isProd) {
          return { available: false, reason: 'Live database connection failed. Please retry.' };
        }
      }
    }
    if (isProd) {
      return { available: false, reason: 'Live database connection required.' };
    }
    return mockApi.checkUsername(username, excludeUserId);
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

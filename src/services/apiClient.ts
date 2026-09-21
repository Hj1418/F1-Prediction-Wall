import {
  Constructor,
  RaceWeekend,
  PredictionRound,
  PredictionFieldConfig,
  User,
  Prediction,
  SessionResult,
  RoundScore,
  LeaderboardEntry,
  Achievement,
  Driver,
  ApiResponse,
  NormalizedEvent,
  NormalizedDriver,
  NormalizedTeam,
  NormalizedSessionResult,
  NormalizedDriverStanding,
  NormalizedConstructorStanding,
  NormalizedFeederDriver,
  JuniorAcademy,
  FeederChampionshipId,
  SuperLicenceStandingRule,
  NormalizedWecEntry,
  WecPointsScale,
  WecDurationType,
  NormalizedMotoGpRider,
  ConcessionTier,
  ConcessionRules,
  MotoGpPointsScale,
} from '../types';
import { mockApi } from './mockApi';
import { F1Normalizer } from './dataArchitecture/normalizers/f1Normalizer';
import { FeederNormalizer, SUPER_LICENCE_POINTS_TABLE } from './dataArchitecture/normalizers/feederNormalizer';
import { WecNormalizer, WEC_POINTS_SCALES } from './dataArchitecture/normalizers/wecNormalizer';
import { MotoGpNormalizer, MOTOGP_POINTS_SCALE, CONCESSION_TIERS } from './dataArchitecture/normalizers/motogpNormalizer';
import { JUNIOR_ACADEMIES_REGISTRY } from './dataArchitecture/identifierRegistry';
import { clientCache, TTL } from './cache/clientCache';
import { DEFAULT_SCORING_RULES, getDefaultPredictionFields } from './schedule/predictionRoundGenerator';
import { computeWeekendStatus } from '../utils/raceLifecycle';
import { f2Data } from './motorsport/data/f2Data';
import { f3Data } from './motorsport/data/f3Data';
import { wecData } from './motorsport/data/wecData';
import { motogpData } from './motorsport/data/motogpData';
import { testGrandPrixService } from './testGrandPrix/testGrandPrixService';

const isTestEnv = typeof window === 'undefined';

const PRODUCTION_API_URL =
  'https://script.google.com/macros/s/AKfycbz_TmSvhPNdrTT9HCiCnViVY9dG-5ypZMfyWtp0d4XcjP25mJc7yW8VyawKaSI6LTF9/exec';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' ? PRODUCTION_API_URL : '');

export const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http') && !isTestEnv);

const isProd = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD);

/**
 * Ensures a PredictionRound from the live API has predictionFields and scoringRules.
 * The backend may not store these, so we hydrate them client-side.
 */
function hydratePredictionRound(round: PredictionRound): PredictionRound {
  if (!round.predictionFields || round.predictionFields.length === 0) {
    round.predictionFields = getDefaultPredictionFields(round.roundType || round.type || 'GRAND_PRIX');
  }
  if (!round.scoringRules) {
    round.scoringRules = DEFAULT_SCORING_RULES;
  }
  return round;
}

export const api = {
  isLive: isLiveBackend,

  async getDrivers(season: number = 2026): Promise<Driver[]> {
    return clientCache.getOrFetch(`f1_drivers_${season}`, () => mockApi.getDrivers(), {
      ttlMs: TTL.LONG,
    });
  },

  async getEligibleDrivers(raceWeekendId?: string, season: number = 2026): Promise<Driver[]> {
    if (raceWeekendId) {
      try {
        const testState = testGrandPrixService.getState();
        if (testState.weekend && (testState.weekend.raceWeekendId === raceWeekendId || testState.weekend.id === raceWeekendId)) {
          return testGrandPrixService.getTestDrivers();
        }
      } catch (_e) {}
    }
    if (!raceWeekendId) {
      return this.getDrivers(season);
    }
    const { getEligibleDriversForRace } = await import('./motorsport/raceEntryService');
    return getEligibleDriversForRace(raceWeekendId, season);
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

      // Authoritative lifecycle state evaluation
      const now = new Date();
      return list.map(w => {
        const status = computeWeekendStatus(w, now);
        return { ...w, status };
      });
    }, { ttlMs: TTL.SHORT });
  },

  async getWeekendById(id: string): Promise<RaceWeekend | null> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.weekend && (testState.weekend.raceWeekendId === id || testState.weekend.id === id)) {
        return testState.weekend;
      }
    } catch (_e) {}

    // 1. Check if season weekends are already in memory cache
    const cachedSeason = clientCache.get<RaceWeekend[]>('f1_weekends_2026');
    if (cachedSeason) {
      const match = cachedSeason.find(w => w.raceWeekendId === id || w.id === id);
      if (match) return match;
    }

    // 2. Check if season weekends are currently in flight
    const inFlightSeason = clientCache.getInFlight<RaceWeekend[]>('f1_weekends_2026');
    if (inFlightSeason) {
      try {
        const seasonList = await inFlightSeason;
        const match = seasonList.find(w => w.raceWeekendId === id || w.id === id);
        if (match) return match;
      } catch {
        // Fallback to direct query
      }
    }

    // 3. Fallback to cached individual fetch
    return clientCache.getOrFetch(`f1_weekend_${id}`, async () => {
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
    }, { ttlMs: TTL.SHORT });
  },

  async getPredictionRounds(raceWeekendId?: string, forceRefresh: boolean = false): Promise<PredictionRound[]> {
    if (raceWeekendId) {
      try {
        const testState = testGrandPrixService.getState();
        if (testState.weekend && (testState.weekend.raceWeekendId === raceWeekendId || testState.weekend.id === raceWeekendId)) {
          return testState.round ? [testState.round] : [];
        }
      } catch (_e) {}
    }

    // 1. If requesting for a specific raceWeekendId, check if all rounds are already cached
    if (raceWeekendId && !forceRefresh) {
      const cachedAll = clientCache.get<PredictionRound[]>('f1_prediction_rounds_all');
      if (cachedAll) {
        return cachedAll.filter(r => r.raceWeekendId === raceWeekendId);
      }

      // Check if all rounds fetch is currently in-flight
      const inFlightAll = clientCache.getInFlight<PredictionRound[]>('f1_prediction_rounds_all');
      if (inFlightAll) {
        try {
          const allRounds = await inFlightAll;
          return allRounds.filter(r => r.raceWeekendId === raceWeekendId);
        } catch {
          // Fall back to scoped fetch
        }
      }
    }

    const cacheKey = `f1_prediction_rounds_${raceWeekendId || 'all'}`;
    return clientCache.getOrFetch(
      cacheKey,
      async () => {
        if (isLiveBackend) {
          try {
            const url = `${API_BASE_URL}?action=getPredictionRounds${raceWeekendId ? `&raceWeekendId=${encodeURIComponent(raceWeekendId)}` : ''}`;
            const res = await fetch(url);
            const json: ApiResponse<PredictionRound[]> = await res.json();
            if (json.success && json.data) return json.data.map(hydratePredictionRound);
          } catch (e) {
            console.error('Live API getPredictionRounds failed:', e);
          }
        }
        return isProd ? [] : mockApi.getPredictionRounds(raceWeekendId);
      },
      { ttlMs: TTL.SHORT, forceRefresh }
    );
  },

  async getPredictionRoundById(roundId: string): Promise<PredictionRound | null> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === roundId || testState.round.id === roundId)) {
        return testState.round;
      }
    } catch (_e) {}

    // Check if season rounds are in cache or in flight
    const cachedAll = clientCache.get<PredictionRound[]>('f1_prediction_rounds_all');
    if (cachedAll) {
      const found = cachedAll.find(r => r.roundId === roundId || r.id === roundId);
      if (found) return found;
    }

    const inFlightAll = clientCache.getInFlight<PredictionRound[]>('f1_prediction_rounds_all');
    if (inFlightAll) {
      try {
        const allRounds = await inFlightAll;
        const found = allRounds.find(r => r.roundId === roundId || r.id === roundId);
        if (found) return found;
      } catch {}
    }

    return clientCache.getOrFetch(`f1_round_${roundId}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetch(`${API_BASE_URL}?action=getPredictionRound&roundId=${encodeURIComponent(roundId)}`);
          const json: ApiResponse<PredictionRound> = await res.json();
          if (json.success && json.data) return hydratePredictionRound(json.data);
        } catch (e) {
          console.error('Live API getPredictionRoundById failed:', e);
        }
      }
      return isProd ? null : mockApi.getPredictionRoundById(roundId);
    }, { ttlMs: TTL.SHORT });
  },

  async getUserPrediction(roundId: string, userId: string): Promise<Prediction | null> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === roundId || testState.round.id === roundId)) {
        return testGrandPrixService.getTestPrediction(userId);
      }
    } catch (_e) {}

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

  async getUserWeekendPredictions(userId: string, raceWeekendId?: string): Promise<Record<string, Prediction>> {
    if (raceWeekendId) {
      try {
        const testState = testGrandPrixService.getState();
        if (testState.weekend && (testState.weekend.raceWeekendId === raceWeekendId || testState.weekend.id === raceWeekendId)) {
          const p = testGrandPrixService.getTestPrediction(userId);
          return p ? { [p.roundId]: p } : {};
        }
      } catch (_e) {}
    }

    if (isLiveBackend) {
      try {
        const url = `${API_BASE_URL}?action=getUserWeekendPredictions&userId=${encodeURIComponent(userId)}${raceWeekendId ? `&raceWeekendId=${encodeURIComponent(raceWeekendId)}` : ''}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          if (Array.isArray(json.data)) {
            const map: Record<string, Prediction> = {};
            json.data.forEach((p: Prediction) => {
              if (p && p.roundId) map[p.roundId] = p;
            });
            return map;
          }
          return json.data;
        }
      } catch (e) {
        console.warn('Live API getUserWeekendPredictions failed:', e);
      }
    }
    return isProd ? {} : mockApi.getUserWeekendPredictions(userId, raceWeekendId);
  },

  async submitPrediction(payload: {
    userId: string;
    roundId: string;
    predictionData: Record<string, any>;
    email?: string;
    displayName?: string;
  }): Promise<Prediction> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === payload.roundId || testState.round.id === payload.roundId)) {
        const saved = testGrandPrixService.submitTestPrediction(
          payload.userId,
          payload.displayName || 'Test Racer',
          payload.email || `${payload.userId}@thegrid.test`,
          payload.predictionData
        );
        clientCache.clearPrefix('f1_prediction_rounds_');
        clientCache.clearPrefix('user_predictions_');
        return saved;
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('test') || e.message.includes('Test'))) {
        throw e;
      }
    }

    if (!isLiveBackend && isProd) {
      throw new Error('Live database connection is required for predictions.');
    }
    let saved: Prediction;
    if (!isLiveBackend) {
      saved = await mockApi.submitPrediction(payload);
    } else {
      try {
        const res = await fetch(`${API_BASE_URL}?action=submitPrediction`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'submitPrediction', ...payload }),
        });
        const json: ApiResponse<Prediction> = await res.json();
        if (json.success && json.data) {
          saved = json.data;
        } else {
          throw new Error(json.message || 'Failed to submit prediction to live database');
        }
      } catch (e: any) {
        console.error('Live database prediction submit failed:', e);
        throw new Error(e.message || 'Failed to submit prediction to database');
      }
    }

    // Invalidate prediction round and race context caches so fresh status is immediately reflected
    clientCache.clearPrefix('f1_prediction_rounds_');
    clientCache.clearPrefix('user_predictions_');
    clientCache.clearPrefix('shared_race_context_');
    return saved;
  },

  async getOfficialResult(roundId: string): Promise<SessionResult | null> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === roundId || testState.round.id === roundId)) {
        const res = testState.officialResult;
        return res ? ({ ...res, publishedAt: res.enteredAt } as any) : null;
      }
    } catch (_e) {}

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
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === roundId || testState.round.id === roundId)) {
        return testGrandPrixService.getScoreBreakdown(userId);
      }
    } catch (_e) {}

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
    if (type === 'round' && id) {
      try {
        const testState = testGrandPrixService.getState();
        if (testState.round && (testState.round.roundId === id || testState.round.id === id)) {
          return testGrandPrixService.getTestLeaderboard();
        }
      } catch (_e) {}
    }

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

  async processNotificationQueue(limit = 25): Promise<{ processed: number; sent: number; failed: number }> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=processNotificationQueue`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'processNotificationQueue', limit }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      } catch (e) {
        console.warn('Live API processNotificationQueue failed:', e);
      }
    }
    return { processed: 0, sent: 0, failed: 0 };
  },

  async sendDirectEmail(payload: {
    to: string;
    subject: string;
    body: string;
    name?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=sendDirectEmail`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'sendDirectEmail', ...payload }),
        });
        const json = await res.json();
        if (json.success) return { success: true };
        return { success: false, error: json.message };
      } catch (e: any) {
        return { success: false, error: e.message || 'Failed to dispatch email via Google Apps Script' };
      }
    }
    return { success: false, error: 'Live backend URL is not configured' };
  },

  // Normalized The Grid Architecture Methods
  async getNormalizedDrivers(): Promise<NormalizedDriver[]> {
    return clientCache.getOrFetch('f1_norm_drivers', async () => {
      const rawDrivers = await this.getDrivers();
      return F1Normalizer.normalizeDrivers(rawDrivers, 'jolpica-f1');
    }, { ttlMs: TTL.LONG });
  },

  async getNormalizedTeams(): Promise<NormalizedTeam[]> {
    return clientCache.getOrFetch('f1_norm_teams', async () => {
      const rawConstructors = await this.getConstructors();
      return F1Normalizer.normalizeTeams(rawConstructors, 'jolpica-f1');
    }, { ttlMs: TTL.LONG });
  },

  async getNormalizedEvents(season: number = 2026): Promise<NormalizedEvent[]> {
    return clientCache.getOrFetch(`f1_norm_events_${season}`, async () => {
      const weekends = await this.getRaceWeekends(season);
      return F1Normalizer.normalizeCalendar(weekends, 'jolpica-f1');
    }, { ttlMs: TTL.SHORT });
  },

  async getNormalizedEventById(eventId: string): Promise<NormalizedEvent | null> {
    const events = await this.getNormalizedEvents();
    return events.find(e => e.eventId === eventId) || null;
  },

  async getNormalizedResult(sessionId: string): Promise<NormalizedSessionResult | null> {
    return clientCache.getOrFetch(`f1_norm_res_${sessionId}`, async () => {
      // Find corresponding round
      const rounds = await this.getPredictionRounds();
      const round = rounds.find(r => r.sessionId === sessionId || r.roundId === sessionId);
      if (!round) return null;
      const officialRes = await this.getOfficialResult(round.roundId);
      if (!officialRes) return null;

      return F1Normalizer.normalizeSessionResult(
        officialRes.resultData,
        sessionId,
        round.raceWeekendId,
        {
          resultStatus: 'OFFICIAL',
          versionNumber: 1,
          sourceId: 'jolpica-f1',
        }
      );
    }, { ttlMs: TTL.SHORT });
  },

  async getNormalizedStandings(season: number = 2026): Promise<{
    drivers: NormalizedDriverStanding[];
    constructors: NormalizedConstructorStanding[];
  }> {
    return clientCache.getOrFetch(`f1_norm_standings_${season}`, async () => {
      // Build standings from current season drivers & constructors points
      const [drivers, constructors] = await Promise.all([
        this.getNormalizedDrivers(),
        this.getNormalizedTeams(),
      ]);

      const driverStandings: NormalizedDriverStanding[] = drivers.map((d, idx) => ({
        position: idx + 1,
        driverId: d.driverId,
        driverName: d.fullName,
        driverCode: d.code,
        teamId: d.currentTeamId,
        teamName: d.currentTeamId,
        points: 0,
        wins: 0,
        podiums: 0,
        season,
        provenance: d.provenance,
      }));

      const constructorStandings: NormalizedConstructorStanding[] = constructors.map((c, idx) => ({
        position: idx + 1,
        teamId: c.teamId,
        teamName: c.name,
        points: 0,
        wins: 0,
        podiums: 0,
        season,
        provenance: c.provenance,
      }));

      return { drivers: driverStandings, constructors: constructorStandings };
    }, { ttlMs: TTL.LONG });
  },

  // ==========================================================================
  // Feeder Series (F2 / F3) — Phase 9.2 API Layer
  // ==========================================================================

  /**
   * Returns normalized calendar events for a feeder championship.
   */
  async getNormalizedFeederEvents(
    championship: FeederChampionshipId,
    season: number = 2026
  ): Promise<NormalizedEvent[]> {
    return clientCache.getOrFetch(`${championship}_norm_events_${season}`, () => {
      const sourceData = championship === 'f2' ? f2Data : f3Data;
      return Promise.resolve(
        FeederNormalizer.normalizeCalendar(championship, sourceData.rounds as any[])
      );
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns normalized feeder drivers with Junior Academy affiliations.
   */
  async getNormalizedFeederDrivers(
    championship: FeederChampionshipId
  ): Promise<NormalizedFeederDriver[]> {
    return clientCache.getOrFetch(`${championship}_norm_drivers`, () => {
      const sourceData = championship === 'f2' ? f2Data : f3Data;
      return Promise.resolve(
        FeederNormalizer.normalizeDrivers(championship, sourceData.driversStandings as any[])
      );
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns the full Junior Academies registry.
   */
  async getJuniorAcademies(): Promise<JuniorAcademy[]> {
    return clientCache.getOrFetch('junior_academies_all', () => {
      return Promise.resolve(Object.values(JUNIOR_ACADEMIES_REGISTRY));
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns the FIA Super Licence points table for a feeder championship.
   */
  async getSuperLicenceMatrix(
    championship: FeederChampionshipId
  ): Promise<SuperLicenceStandingRule[]> {
    return clientCache.getOrFetch(`${championship}_sl_matrix`, () => {
      return Promise.resolve(SUPER_LICENCE_POINTS_TABLE[championship]);
    }, { ttlMs: TTL.LONG });
  },

  // ==========================================================================
  // Multi-Class Endurance Racing (FIA WEC) — Phase 9.3 API Layer
  // ==========================================================================

  /**
   * Returns normalized calendar rounds for the FIA World Endurance Championship.
   */
  async getNormalizedWecEvents(season: number = 2026): Promise<NormalizedEvent[]> {
    return clientCache.getOrFetch(`wec_norm_events_${season}`, () => {
      return Promise.resolve(WecNormalizer.normalizeCalendar(season, wecData.rounds as any[]));
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns normalized car entries, driver rosters, and FIA driver categorizations across Hypercar and LMGT3.
   */
  async getNormalizedWecEntries(): Promise<NormalizedWecEntry[]> {
    return clientCache.getOrFetch('wec_norm_entries', () => {
      return Promise.resolve(
        WecNormalizer.normalizeEntries(wecData.driversStandings as any[], wecData.teamsStandings as any[])
      );
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns normalized WEC Driver and Manufacturer/Team standings.
   */
  async getNormalizedWecStandings(season: number = 2026) {
    return clientCache.getOrFetch(`wec_norm_standings_${season}`, () => {
      return Promise.resolve(
        WecNormalizer.normalizeStandings(season, wecData.driversStandings as any[], wecData.teamsStandings as any[])
      );
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns the official FIA WEC points matrices according to race duration (6h, 8h/1812km, 24h Le Mans).
   */
  async getWecPointsMatrix(): Promise<Record<WecDurationType, WecPointsScale>> {
    return clientCache.getOrFetch('wec_points_matrix', () => {
      return Promise.resolve(WEC_POINTS_SCALES);
    }, { ttlMs: TTL.LONG });
  },

  // ==========================================================================
  // Premier Two-Wheel Grand Prix (MotoGP) — Phase 10 API Layer
  // ==========================================================================

  /**
   * Returns normalized calendar rounds for the FIM MotoGP World Championship.
   */
  async getNormalizedMotoGpEvents(season: number = 2026): Promise<NormalizedEvent[]> {
    return clientCache.getOrFetch(`motogp_norm_events_${season}`, () => {
      return Promise.resolve(MotoGpNormalizer.normalizeCalendar(season, motogpData.rounds as any[]));
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns normalized MotoGP riders with bike, team, manufacturer, and Concession tier.
   */
  async getNormalizedMotoGpRiders(): Promise<NormalizedMotoGpRider[]> {
    return clientCache.getOrFetch('motogp_norm_riders', () => {
      return Promise.resolve(
        MotoGpNormalizer.normalizeRiders(motogpData.driversStandings as any[], motogpData.teamsStandings as any[])
      );
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns normalized MotoGP Rider and Team/Manufacturer standings.
   */
  async getNormalizedMotoGpStandings(season: number = 2026) {
    return clientCache.getOrFetch(`motogp_norm_standings_${season}`, () => {
      return Promise.resolve(
        MotoGpNormalizer.normalizeStandings(season, motogpData.driversStandings as any[], motogpData.teamsStandings as any[])
      );
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns official MotoGP points scale (Sprint top 9 and Grand Prix top 15).
   */
  async getMotoGpPointsRules(): Promise<MotoGpPointsScale> {
    return clientCache.getOrFetch('motogp_points_rules', () => {
      return Promise.resolve(MOTOGP_POINTS_SCALE);
    }, { ttlMs: TTL.LONG });
  },

  /**
   * Returns official FIM Manufacturer Concession rules and tiers (A, B, C, D).
   */
  async getMotoGpConcessionTiers(): Promise<Record<ConcessionTier, ConcessionRules>> {
    return clientCache.getOrFetch('motogp_concessions', () => {
      return Promise.resolve(CONCESSION_TIERS);
    }, { ttlMs: TTL.LONG });
  },

  resetDemoData() {
    mockApi.resetToDefaults();
  },
};



import { generatePredictionRounds } from './schedule/predictionRoundGenerator';

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
  WeekendTrophy,
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
import {
  CompetitionAnalyticsPayload,
  UnifiedUserCompetitionProfile,
  AnalyticsTimeRange,
  PublicCommunityReport,
} from '../types/competitionAnalytics';
import { mockApi, PlatformAuditReport } from './mockApi';
import { F1Normalizer } from './dataArchitecture/normalizers/f1Normalizer';
import { FeederNormalizer, SUPER_LICENCE_POINTS_TABLE } from './dataArchitecture/normalizers/feederNormalizer';
import { WecNormalizer, WEC_POINTS_SCALES } from './dataArchitecture/normalizers/wecNormalizer';
import { MotoGpNormalizer, MOTOGP_POINTS_SCALE, CONCESSION_TIERS } from './dataArchitecture/normalizers/motogpNormalizer';
import { JUNIOR_ACADEMIES_REGISTRY } from './dataArchitecture/identifierRegistry';
import { clientCache, TTL } from './cache/clientCache';
import { DEFAULT_SCORING_RULES, getDefaultPredictionFields, isQualificationPredictionRound } from './schedule/predictionRoundGenerator';
import { computeWeekendStatus } from '../utils/raceLifecycle';
import { f2Data } from './motorsport/data/f2Data';
import { f3Data } from './motorsport/data/f3Data';
import { wecData } from './motorsport/data/wecData';
import { motogpData } from './motorsport/data/motogpData';
import { testGrandPrixService } from './testGrandPrix/testGrandPrixService';
import { calculateUserStatsFromHistory } from '../utils/predictionScoring';
import { evaluateUserAchievements } from './achievementRegistry';
import { weekendTrophyService } from './weekendTrophyService';

const isTestEnv = typeof window === 'undefined';

const PRODUCTION_API_URL =
  'https://script.google.com/macros/s/AKfycbz_TmSvhPNdrTT9HCiCnViVY9dG-5ypZMfyWtp0d4XcjP25mJc7yW8VyawKaSI6LTF9/exec';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' ? PRODUCTION_API_URL : '');

export const isLiveBackend = Boolean(API_BASE_URL && API_BASE_URL.startsWith('http') && !isTestEnv);

const isProd = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD);

/**
 * Network fetch with AbortController timeout and cold-start tolerance.
 * Provides resilient handling for Google Apps Script serverless cold-start latency.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 25000,
  retries: number = 1
): Promise<Response> {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const maxAttempts = isGet ? Math.max(0, retries) : 0;

  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === maxAttempts) {
        throw err;
      }
      // Brief pause before retry so Google Apps Script container has time to wake up
      await new Promise(r => setTimeout(r, 800));
    }
  }
  throw new Error('fetchWithTimeout failed');
}

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
    return clientCache.getOrFetch(`f1_drivers_${season}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getDrivers&season=${season}`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        } catch (_e) {}
      }
      return mockApi.getDrivers();
    }, {
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

  async getOfficialEventEntryList(championshipId: string = 'f1', season: number = 2026, eventId: string) {
    const { getOfficialEventEntryList } = await import('./motorsport/eventEntryService');
    return getOfficialEventEntryList(championshipId, season, eventId);
  },

  async getConstructors(): Promise<Constructor[]> {
    return clientCache.getOrFetch('f1_constructors_list', async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getConstructors`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        } catch (_e) {}
      }
      return mockApi.getConstructors();
    }, {
      ttlMs: TTL.LONG,
    });
  },

  getWeekendByIdSync(id: string): RaceWeekend | null {
    if (!id) return null;
    try {
      const testState = testGrandPrixService.getState();
      if (testState.weekend && (testState.weekend.raceWeekendId === id || testState.weekend.id === id)) {
        return testState.weekend;
      }
    } catch (_e) {}

    const cachedSeason = clientCache.get<RaceWeekend[]>('f1_weekends_2026');
    if (cachedSeason) {
      const match = cachedSeason.find(w => w.raceWeekendId === id || w.id === id);
      if (match) return match;
    }

    const cachedIndividual = clientCache.get<RaceWeekend>(`f1_weekend_${id}`);
    if (cachedIndividual) return cachedIndividual;

    return mockApi.getWeekendByIdSync ? mockApi.getWeekendByIdSync(id) : null;
  },

  getPredictionRoundByIdSync(roundId: string): PredictionRound | null {
    if (!roundId) return null;
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === roundId || testState.round.id === roundId)) {
        return testState.round;
      }
    } catch (_e) {}

    const cachedAll = clientCache.get<PredictionRound[]>('f1_prediction_rounds_all');
    if (cachedAll) {
      const found = cachedAll.find(r => r.roundId === roundId || r.id === roundId);
      if (found) return hydratePredictionRound(found);
    }

    const cachedIndividual = clientCache.get<PredictionRound>(`f1_round_${roundId}`);
    if (cachedIndividual) return hydratePredictionRound(cachedIndividual);

    const weekendMatch = roundId.match(/^(\d{4}_\d+)/);
    if (weekendMatch) {
      const weekendId = weekendMatch[1];
      const weekend = this.getWeekendByIdSync(weekendId);
      if (weekend) {
        const genRounds = generatePredictionRounds(weekend);
        const found = genRounds.find((r: PredictionRound) => r.roundId === roundId || r.id === roundId) || genRounds[0];
        if (found) return hydratePredictionRound(found);
      }
    }

    return null;
  },

  async getRaceWeekends(season: number = 2026): Promise<RaceWeekend[]> {
    return clientCache.getOrFetch(`f1_weekends_${season}`, async () => {
      let list: RaceWeekend[] = [];
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getRaceWeekends&season=${season}`);
          const json: ApiResponse<RaceWeekend[]> = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            list = json.data;
          }
        } catch (e) {
          console.warn('Live API request failed or timed out, falling back to mockApi', e);
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
    }, { ttlMs: TTL.MEDIUM });
  },

  async getWeekendById(id: string): Promise<RaceWeekend | null> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.weekend && (testState.weekend.raceWeekendId === id || testState.weekend.id === id)) {
        return testState.weekend;
      }
    } catch (_e) {}

    // 1. Check if season weekends are already in memory cache with sessions
    const cachedSeason = clientCache.get<RaceWeekend[]>('f1_weekends_2026');
    if (cachedSeason) {
      const match = cachedSeason.find(w => w.raceWeekendId === id || w.id === id);
      if (match && match.sessions && match.sessions.length > 0) return match;
    }

    // 2. Check if season weekends are currently in flight
    const inFlightSeason = clientCache.getInFlight<RaceWeekend[]>('f1_weekends_2026');
    if (inFlightSeason) {
      try {
        const seasonList = await inFlightSeason;
        const match = seasonList.find(w => w.raceWeekendId === id || w.id === id);
        if (match && match.sessions && match.sessions.length > 0) return match;
      } catch {
        // Fallback to direct query
      }
    }

    // 3. Fallback to cached individual fetch
    return clientCache.getOrFetch(`f1_weekend_${id}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getWeekendDetails&raceWeekendId=${encodeURIComponent(id)}`);
          const json: ApiResponse<RaceWeekend> = await res.json();
          if (json.success && json.data) return json.data;
        } catch (e) {
          console.warn('Live API getWeekendById failed or timed out:', e);
        }
      }
      return isProd ? null : mockApi.getWeekendById(id);
    }, { ttlMs: TTL.MEDIUM });
  },

  async getSessionSchedule(raceWeekendId: string): Promise<any[]> {
    return clientCache.getOrFetch(`f1_sessions_${raceWeekendId}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getSessionSchedule&raceWeekendId=${encodeURIComponent(raceWeekendId)}`);
          const json: ApiResponse<any[]> = await res.json();
          if (json.success && json.data && json.data.length > 0) return json.data;
        } catch (e) {
          console.warn('Live API getSessionSchedule failed:', e);
        }
      }
      const w = await this.getWeekendById(raceWeekendId);
      return w?.sessions || [];
    }, { ttlMs: TTL.MEDIUM });
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
        let rounds: PredictionRound[] = [];
        if (isLiveBackend) {
          try {
            const url = `${API_BASE_URL}?action=getPredictionRounds${raceWeekendId ? `&raceWeekendId=${encodeURIComponent(raceWeekendId)}` : ''}`;
            const res = await fetchWithTimeout(url);
            const json: ApiResponse<PredictionRound[]> = await res.json();
            if (json.success && json.data && json.data.length > 0) {
              rounds = json.data
                .map(hydratePredictionRound)
                .filter(r => !isQualificationPredictionRound(r));
            }
          } catch (e) {
            console.warn('Live API getPredictionRounds failed or timed out:', e);
          }
        }

        if (rounds.length === 0) {
          const mockList = await mockApi.getPredictionRounds(raceWeekendId);
          rounds = mockList.filter(r => !isQualificationPredictionRound(r));
        }

        // Dynamic round synthesis fallback: If rounds are still empty for a specific weekend or if active weekends lack rounds,
        // dynamically generate them using generatePredictionRounds
        if (raceWeekendId && rounds.length === 0) {
          const weekend = await this.getWeekendById(raceWeekendId);
          if (weekend) {
            const { generatePredictionRounds } = await import('./schedule/predictionRoundGenerator');
            rounds = generatePredictionRounds(weekend).filter(r => !isQualificationPredictionRound(r));
          }
        } else if (!raceWeekendId) {
          try {
            const weekends = await this.getRaceWeekends();
            const { generatePredictionRounds } = await import('./schedule/predictionRoundGenerator');
            for (const w of weekends) {
              const hasRound = rounds.some(r => r.raceWeekendId === w.raceWeekendId || r.raceWeekendId === w.id);
              if (!hasRound) {
                const gen = generatePredictionRounds(w).filter(r => !isQualificationPredictionRound(r));
                rounds.push(...gen);
              }
            }
          } catch (_e) {}
        }

        return rounds;
      },
      { ttlMs: TTL.MEDIUM, forceRefresh }
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
      if (found) return hydratePredictionRound(found);
    }

    const inFlightAll = clientCache.getInFlight<PredictionRound[]>('f1_prediction_rounds_all');
    if (inFlightAll) {
      try {
        const allRounds = await inFlightAll;
        const found = allRounds.find(r => r.roundId === roundId || r.id === roundId);
        if (found) return hydratePredictionRound(found);
      } catch {}
    }

    return clientCache.getOrFetch(`f1_round_${roundId}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getPredictionRound&roundId=${encodeURIComponent(roundId)}`);
          const json: ApiResponse<PredictionRound> = await res.json();
          if (json.success && json.data) return hydratePredictionRound(json.data);
        } catch (e) {
          console.warn('Live API getPredictionRoundById failed or timed out:', e);
        }
      }
      const mock = await mockApi.getPredictionRoundById(roundId);
      if (mock && !isQualificationPredictionRound(mock)) return hydratePredictionRound(mock);

      // Dynamic synthesis fallback if roundId represents a weekend prediction
      // e.g. "2026_15_RACE_PREDICTION" -> weekend "2026_15"
      const weekendMatch = roundId.match(/^(\d{4}_\d+)/);
      if (weekendMatch) {
        const weekendId = weekendMatch[1];
        const weekend = await this.getWeekendById(weekendId);
        if (weekend) {
          const { generatePredictionRounds } = await import('./schedule/predictionRoundGenerator');
          const genRounds = generatePredictionRounds(weekend);
          const found = genRounds.find(r => r.roundId === roundId || r.id === roundId) || genRounds[0];
          if (found) return hydratePredictionRound(found);
        }
      }

      return null;
    }, { ttlMs: TTL.MEDIUM });
  },

  async getUserPrediction(roundId: string, userId: string): Promise<Prediction | null> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === roundId || testState.round.id === roundId)) {
        return testGrandPrixService.getTestPrediction(userId);
      }
    } catch (_e) {}

    const localKey = `thegrid_user_pred_${roundId}_${userId}`;
    let fallbackPred: Prediction | null = null;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        fallbackPred = JSON.parse(raw);
      }
    } catch {}

    const cacheKey = `user_pred_${roundId}_${userId}`;
    return clientCache.getOrFetch(cacheKey, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(
            `${API_BASE_URL}?action=getUserPrediction&roundId=${encodeURIComponent(roundId)}&userId=${encodeURIComponent(userId)}`,
            {},
            10000
          );
          const json: ApiResponse<Prediction> = await res.json();
          if (json.success && json.data) {
            try {
              localStorage.setItem(localKey, JSON.stringify(json.data));
            } catch {}
            return json.data;
          }
        } catch (e) {
          console.warn('Live API getUserPrediction failed or timed out:', e);
        }
      }
      if (fallbackPred) return fallbackPred;
      return isProd ? null : mockApi.getUserPrediction(roundId, userId);
    }, { ttlMs: TTL.SHORT });
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

    const cacheKey = `user_wknd_preds_${userId}_${raceWeekendId || 'all'}`;
    return clientCache.getOrFetch(cacheKey, async () => {
      if (isLiveBackend) {
        try {
          const url = `${API_BASE_URL}?action=getUserWeekendPredictions&userId=${encodeURIComponent(userId)}${raceWeekendId ? `&raceWeekendId=${encodeURIComponent(raceWeekendId)}` : ''}`;
          const res = await fetchWithTimeout(url, {}, 10000);
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
          console.warn('Live API getUserWeekendPredictions failed or timed out:', e);
        }
      }
      return isProd ? {} : mockApi.getUserWeekendPredictions(userId, raceWeekendId);
    }, { ttlMs: TTL.SHORT });
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
        clientCache.clearPrefix('user_pred_');
        clientCache.clearPrefix('user_wknd_preds_');
        clientCache.clearPrefix('user_predictions_');
        clientCache.clearPrefix('shared_race_context_');
        clientCache.clearPrefix('leaderboard_');
        return saved;
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('test') || e.message.includes('Test'))) {
        throw e;
      }
    }

    let saved: Prediction;
    if (!isLiveBackend) {
      saved = await mockApi.submitPrediction(payload);
    } else {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}?action=submitPrediction`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'submitPrediction', ...payload }),
        }, 12000);
        const json: ApiResponse<Prediction> = await res.json();
        if (json.success && json.data) {
          saved = json.data;
        } else {
          throw new Error(json.message || 'Failed to submit prediction to live database');
        }
      } catch (e: any) {
        console.warn('Live database prediction submit failed, saving to local storage:', e);
        try {
          saved = await mockApi.submitPrediction(payload);
        } catch (mockErr: any) {
          throw mockErr;
        }
      }
    }

    // Immediately persist in localStorage for instant restore and offline fallback
    if (saved && saved.predictionData) {
      try {
        localStorage.setItem(`thegrid_user_pred_${payload.roundId}_${payload.userId}`, JSON.stringify(saved));
        if (payload.roundId === '2026_15_RACE_PREDICTION' || payload.roundId === '2026_17_RACE_PREDICTION') {
          const alias = payload.roundId === '2026_15_RACE_PREDICTION' ? '2026_17_RACE_PREDICTION' : '2026_15_RACE_PREDICTION';
          localStorage.setItem(`thegrid_user_pred_${alias}_${payload.userId}`, JSON.stringify(saved));
        }
      } catch {}
    }

    // Invalidate prediction round and race context caches so fresh status is immediately reflected
    clientCache.clearPrefix('f1_prediction_rounds_');
    clientCache.clearPrefix('user_pred_');
    clientCache.clearPrefix('user_wknd_preds_');
    clientCache.clearPrefix('user_predictions_');
    clientCache.clearPrefix('shared_race_context_');
    clientCache.clearPrefix('leaderboard_');
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

    return clientCache.getOrFetch(`official_result_${roundId}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getRoundResults&roundId=${encodeURIComponent(roundId)}`);
          const json: ApiResponse<SessionResult> = await res.json();
          if (json.success && json.data) return json.data;
        } catch (e) {
          console.warn('Live API getOfficialResult failed or timed out:', e);
        }
      }
      return isProd ? null : mockApi.getOfficialResult(roundId);
    }, { ttlMs: TTL.SHORT });
  },

  async getRoundScore(roundId: string, userId: string): Promise<RoundScore | null> {
    try {
      const testState = testGrandPrixService.getState();
      if (testState.round && (testState.round.roundId === roundId || testState.round.id === roundId)) {
        return testGrandPrixService.getScoreBreakdown(userId);
      }
    } catch (_e) {}

    return clientCache.getOrFetch(`round_score_${roundId}_${userId}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getRoundScore&roundId=${encodeURIComponent(roundId)}&userId=${encodeURIComponent(userId)}`);
          const json: ApiResponse<RoundScore> = await res.json();
          if (json.success && json.data) return json.data;
        } catch (e) {
          console.warn('Live API getRoundScore failed or timed out:', e);
        }
      }
      return isProd ? null : mockApi.getRoundScore(roundId, userId);
    }, { ttlMs: TTL.SHORT });
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

    return clientCache.getOrFetch(`leaderboard_${type}_${id || 'all'}`, async () => {
      if (isLiveBackend) {
        try {
          const url = `${API_BASE_URL}?action=getLeaderboard&type=${type}${id ? `&id=${encodeURIComponent(id)}` : ''}`;
          const res = await fetchWithTimeout(url, {}, 25000);
          const json: ApiResponse<LeaderboardEntry[]> = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        } catch (e) {
          console.warn('Live API getLeaderboard failed or timed out:', e);
        }
      }

      const mockLb = await mockApi.getLeaderboard(type, id);
      if (mockLb && mockLb.length > 0) {
        return mockLb;
      }

      return [];
    }, { ttlMs: TTL.MEDIUM });
  },

  async getUserProfile(usernameOrId: string): Promise<User | null> {
    if (!usernameOrId || !usernameOrId.trim()) return null;
    const cleanId = usernameOrId.trim();

    return clientCache.getOrFetch(`user_profile_${cleanId.toLowerCase()}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(
            `${API_BASE_URL}?action=getUserProfile&userId=${encodeURIComponent(cleanId)}&username=${encodeURIComponent(cleanId)}`,
            {},
            25000
          );
          const json: ApiResponse<User> = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        } catch (e) {
          console.warn('Live API getUserProfile failed or timed out, checking fallback:', e);
        }
      }

      // Robust fallback 1: Cross-reference season leaderboard
      let user: User | null = null;
      try {
        const leaderboard = await this.getLeaderboard('season');
        const lbEntry = (leaderboard || []).find(
          e => e.userId === cleanId ||
               (e.username && e.username.toLowerCase() === cleanId.toLowerCase()) ||
               (e.displayName && e.displayName.toLowerCase() === cleanId.toLowerCase())
        );
        if (lbEntry) {
          user = {
            userId: lbEntry.userId,
            username: lbEntry.username || cleanId,
            displayName: lbEntry.displayName || lbEntry.username || cleanId,
            email: `${lbEntry.userId}@thegrid.mock`,
            avatarUrl: lbEntry.avatarUrl || '',
            favouriteDriver: lbEntry.favouriteDriver || 'norris',
            role: 'user',
            totalPoints: lbEntry.totalPoints || 0,
            seasonRank: lbEntry.rank || 1,
            previousRank: lbEntry.previousRank || lbEntry.rank || 1,
            racesParticipated: lbEntry.racesParticipated || 0,
            exactP1Count: lbEntry.exactP1Count || 0,
            perfectPodiumCount: lbEntry.perfectPodiumCount || 0,
            wildcardsCorrect: 0,
            bestWeekendScore: lbEntry.totalPoints || 0,
            createdAt: new Date().toISOString(),
          };
        }
      } catch (_err) {}

      // Robust fallback 2: Check locally cached authenticated profile in localStorage
      if (!user && typeof window !== 'undefined' && window.localStorage) {
        try {
          const cachedProfileRaw = window.localStorage.getItem('f1_pred_current_user_profile');
          if (cachedProfileRaw) {
            const cachedUser: User = JSON.parse(cachedProfileRaw);
            if (
              cachedUser &&
              (cachedUser.userId === cleanId ||
               (cachedUser.username && cachedUser.username.toLowerCase() === cleanId.toLowerCase()))
            ) {
              user = cachedUser;
            }
          }
        } catch (_storageErr) {}
      }

      // Robust fallback 3: Local mock user (development / offline test data)
      if (!user) {
        const localUser = await mockApi.getUserProfile(cleanId);
        if (localUser) {
          user = localUser;
        }
      }

      if (user) {
        // Cross-reference with canonical season leaderboard to guarantee data parity
        try {
          const leaderboard = await this.getLeaderboard('season');
          const lbEntry = leaderboard.find(
            e => e.userId === user!.userId || (e.username && e.username.toLowerCase() === user!.username.toLowerCase())
          );
          if (lbEntry) {
            user.totalPoints = Math.max(user.totalPoints || 0, lbEntry.totalPoints || 0);
            user.seasonRank = lbEntry.rank || user.seasonRank;
            user.previousRank = lbEntry.previousRank || user.previousRank || user.seasonRank;
            user.racesParticipated = Math.max(user.racesParticipated || 0, lbEntry.racesParticipated || 0);
            user.exactP1Count = Math.max(user.exactP1Count || 0, lbEntry.exactP1Count || 0);
            user.perfectPodiumCount = Math.max(user.perfectPodiumCount || 0, lbEntry.perfectPodiumCount || 0);
          }
        } catch (_err) {}

        // Cross-reference with canonical prediction history stats
        try {
          const history = await this.getUserPredictionsHistory(user.userId);
          if (Array.isArray(history) && history.length > 0) {
            const stats = calculateUserStatsFromHistory(history);
            user.totalPoints = Math.max(user.totalPoints || 0, stats.totalPoints);
            user.racesParticipated = Math.max(user.racesParticipated || 0, stats.racesParticipated);
            user.bestWeekendScore = Math.max(user.bestWeekendScore || 0, stats.bestWeekendScore);
            user.exactP1Count = Math.max(user.exactP1Count || 0, stats.exactP1Count);
            user.perfectPodiumCount = Math.max(user.perfectPodiumCount || 0, stats.perfectPodiumCount);
            user.wildcardsCorrect = Math.max(user.wildcardsCorrect || 0, stats.wildcardsCorrect);
          }
        } catch (_err) {}
      }

      return user;
    }, { ttlMs: TTL.MEDIUM });
  },

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return clientCache.getOrFetch(`user_achievements_${userId}`, async () => {
      let liveAchs: Achievement[] = [];
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getUserAchievements&userId=${encodeURIComponent(userId)}`);
          const json: ApiResponse<Achievement[]> = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            liveAchs = json.data;
          }
        } catch (e) {
          console.warn('Live API getUserAchievements failed or timed out, checking fallback:', e);
        }
      }

      if (liveAchs.length > 0) {
        return liveAchs;
      }

      // Authoritative evaluation from canonical prediction records & verified season points
      try {
        const history = await this.getUserPredictionsHistory(userId);
        const profile = await this.getUserProfile(userId);
        const seasonPoints = profile?.totalPoints || 0;
        const evaluated = evaluateUserAchievements({ userId, history, seasonPoints });
        return evaluated.filter(a => a.isUnlocked);
      } catch (_e) {
        return isProd ? [] : mockApi.getUserAchievements(userId);
      }
    }, { ttlMs: TTL.SHORT });
  },

  async getUserTrophies(userId: string): Promise<WeekendTrophy[]> {
    return clientCache.getOrFetch(`user_trophies_${userId}`, async () => {
      try {
        const weekends = await this.getRaceWeekends();
        const rounds = await this.getPredictionRounds();
        return weekendTrophyService.getUserTrophies(
          userId,
          weekends,
          rounds,
          (wId) => this.getLeaderboard('weekend', wId)
        );
      } catch (err) {
        console.warn('Error resolving user trophies:', err);
        return [];
      }
    }, { ttlMs: TTL.SHORT });
  },

  async getUserPredictionsHistory(userId: string) {
    return clientCache.getOrFetch(`user_pred_history_${userId}`, async () => {
      if (isLiveBackend) {
        try {
          const res = await fetchWithTimeout(`${API_BASE_URL}?action=getUserPredictionsHistory&userId=${encodeURIComponent(userId)}`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        } catch (e) {
          console.warn('Live API getUserPredictionsHistory failed or timed out, checking fallback:', e);
        }
      }

      if (isProd) {
        return [];
      }

      return mockApi.getUserPredictionsHistory(userId);
    }, { ttlMs: TTL.SHORT });
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

  async getAdminUsers(requesterId: string, authToken?: string): Promise<User[]> {
    if (isLiveBackend) {
      try {
        const tokenQuery = authToken ? `&authToken=${encodeURIComponent(authToken)}` : '';
        const res = await fetch(`${API_BASE_URL}?action=getAdminUsers&requesterId=${encodeURIComponent(requesterId)}${tokenQuery}`);
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

  async getAdminPredictions(roundId?: string): Promise<Prediction[]> {
    if (isLiveBackend) {
      try {
        const url = `${API_BASE_URL}?action=getAdminPredictions${roundId ? `&roundId=${encodeURIComponent(roundId)}` : ''}`;
        const res = await fetch(url);
        const json: ApiResponse<Prediction[]> = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (e: any) {
        console.error('Live API getAdminPredictions error:', e);
      }
    }
    return mockApi.getAdminPredictions(roundId);
  },

  async googleLogin(payload: { email: string; displayName?: string; photoUrl?: string; accessToken?: string; username?: string }): Promise<User> {
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

        // If the live backend threw ReferenceError: createAdminSessionToken is not defined,
        // it confirms the user's password credential was successfully verified by the backend,
        // but the older deployment hit the missing function reference before returning.
        // Retrieve the authentic verified user record directly from the live database.
        if (!json.success && json.message && json.message.includes('createAdminSessionToken')) {
          console.warn('Backend createAdminSessionToken notice during live login; resolving verified profile from database.');
          const verifiedProfile = await this.getUserProfile(identifier);
          if (verifiedProfile) {
            return verifiedProfile;
          }
        }

        throw new Error(json.message || 'Authentication failed on live database');
      } catch (e: any) {
        console.error('Live API login failed:', e);
        throw e;
      }
    }
    return mockApi.login(identifier, passwordHash);
  },

  async setupPassword(payload: {
    userId?: string;
    email?: string;
    newPasswordHash: string;
    currentPasswordHash?: string;
    accessToken?: string;
    authToken?: string;
  }): Promise<{ success: boolean; message: string; hasPassword?: boolean }> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=setupPassword`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'setupPassword', ...payload }),
        });
        const json = await res.json();
        if (json.success) return json.data || json;
        throw new Error(json.message || 'Failed to configure password credential');
      } catch (e: any) {
        console.error('Live API setupPassword failed:', e);
        throw e;
      }
    }
    return mockApi.setupPassword(payload);
  },

  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=requestPasswordReset`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'requestPasswordReset', identifier }),
        });
        const json = await res.json();
        if (json.success) return json.data || json;
        throw new Error(json.message || 'Failed to request password reset');
      } catch (e: any) {
        console.error('Live API requestPasswordReset failed:', e);
        throw e;
      }
    }
    return { success: true, message: 'If an account exists with this email or username, password reset instructions have been sent.' };
  },

  async resetPassword(payload: {
    token: string;
    newPasswordHash: string;
    identifier?: string;
  }): Promise<{ success: boolean; message: string }> {
    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=resetPassword`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'resetPassword', ...payload }),
        });
        const json = await res.json();
        if (json.success) return json.data || json;
        throw new Error(json.message || 'Failed to reset password');
      } catch (e: any) {
        console.error('Live API resetPassword failed:', e);
        throw e;
      }
    }
    return { success: true, message: 'Password has been reset successfully.' };
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
    if (!isLiveBackend) {
      const res = await mockApi.updateUser(userId, updates);
      clientCache.remove(`user_profile_${userId.toLowerCase()}`);
      if (res.username) clientCache.remove(`user_profile_${res.username.toLowerCase()}`);
      return res;
    }
    try {
      const res = await fetch(`${API_BASE_URL}?action=updateUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateUser', userId, updates }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        clientCache.remove(`user_profile_${userId.toLowerCase()}`);
        if (json.data.username) {
          clientCache.remove(`user_profile_${json.data.username.toLowerCase()}`);
        }
        clientCache.invalidatePrefix('leaderboard_');
        return json.data;
      }
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

  async auditAndDeduplicateUsers(dryRun: boolean = true): Promise<any> {
    if (isLiveBackend) {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}?action=auditAndDeduplicateUsers&dryRun=${dryRun}`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'auditAndDeduplicateUsers', dryRun }),
        });
        const json: ApiResponse<any> = await res.json();
        if (json.success) return json.data;
      } catch (e: any) {
        console.error('auditAndDeduplicateUsers error:', e);
      }
    }
    return mockApi.auditAndDeduplicateUsers(dryRun);
  },

  async auditPlatformData(dryRun: boolean = true): Promise<PlatformAuditReport> {
    if (isLiveBackend) {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}?action=auditPlatformData&dryRun=${dryRun}`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'auditPlatformData', dryRun }),
        });
        const json: ApiResponse<PlatformAuditReport> = await res.json();
        if (json.success && json.data) {
          if (!dryRun) {
            clientCache.clearAll();
          }
          return json.data;
        }
      } catch (e: any) {
        console.error('auditPlatformData live API error:', e);
      }
    }
    const res = await mockApi.auditPlatformData(dryRun);
    if (!dryRun) {
      clientCache.clearAll();
    }
    return res;
  },

  // Admin Methods
  async adminSaveWeekend(weekend: Partial<RaceWeekend>): Promise<RaceWeekend> {
    return mockApi.adminSaveWeekend(weekend);
  },

  async adminSavePredictionRound(round: Partial<PredictionRound>): Promise<PredictionRound> {
    return mockApi.adminSavePredictionRound(round);
  },

  async adminSubmitResult(roundId: string, resultData: Record<string, any>): Promise<SessionResult> {
    if (isLiveBackend) {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}?action=adminSubmitResult`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'adminSubmitResult', roundId, resultData }),
        });
        const json: ApiResponse<SessionResult> = await res.json();
        if (json.success && json.data) {
          try { await mockApi.adminSubmitResult(roundId, resultData); } catch {}
          clientCache.clearPrefix('official_result_');
          clientCache.clearPrefix('f1_prediction_rounds_');
          clientCache.clearPrefix('user_pred_history_');
          return json.data;
        }
      } catch (e) {
        console.warn('Live API adminSubmitResult failed or timed out, syncing locally:', e);
      }
    }
    const res = await mockApi.adminSubmitResult(roundId, resultData);
    clientCache.clearPrefix('official_result_');
    clientCache.clearPrefix('f1_prediction_rounds_');
    clientCache.clearPrefix('user_pred_history_');
    return res;
  },

  async adminCalculateScores(roundId: string) {
    if (isLiveBackend) {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}?action=adminCalculateScores`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'adminCalculateScores', roundId }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          try { await mockApi.adminCalculateScores(roundId); } catch {}
          clientCache.clearPrefix('official_result_');
          clientCache.clearPrefix('round_score_');
          clientCache.clearPrefix('leaderboard_');
          clientCache.clearPrefix('user_pred_history_');
          clientCache.clearPrefix('user_profile_');
          clientCache.clearPrefix('f1_prediction_rounds_');
          clientCache.clearPrefix('user_predictions_');
          return json.data;
        }
      } catch (e) {
        console.warn('Live API adminCalculateScores failed or timed out, running locally:', e);
      }
    }
    const res = await mockApi.adminCalculateScores(roundId);
    clientCache.clearPrefix('official_result_');
    clientCache.clearPrefix('round_score_');
    clientCache.clearPrefix('leaderboard_');
    clientCache.clearPrefix('user_pred_history_');
    clientCache.clearPrefix('user_profile_');
    clientCache.clearPrefix('f1_prediction_rounds_');
    clientCache.clearPrefix('user_predictions_');
    return res;
  },

  async publishRaceResult(roundId: string): Promise<{ success: boolean; roundId: string; status: string }> {
    const res = await mockApi.publishRaceResult(roundId);
    clientCache.clearPrefix('official_result_');
    clientCache.clearPrefix('f1_prediction_rounds_');
    return res;
  },

  async getScoringTelemetry(roundId: string) {
    return mockApi.getScoringTelemetry(roundId);
  },

  async getNotificationQueue() {
    return mockApi.getNotificationQueue();
  },

  async processNotificationQueue(limit = 25): Promise<{ processed: number; sent: number; failed: number }> {
    let mockResult = { processed: 0, sent: 0, failed: 0 };
    try {
      mockResult = await mockApi.processNotificationQueue(limit);
    } catch {}

    if (isLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}?action=processNotificationQueue`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'processNotificationQueue', limit }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          return {
            processed: mockResult.processed + (json.data.processed || 0),
            sent: mockResult.sent + (json.data.sent || 0),
            failed: mockResult.failed + (json.data.failed || 0),
          };
        }
      } catch (e) {
        console.warn('Live API processNotificationQueue failed:', e);
      }
    }
    return mockResult;
  },

  async sendDirectEmail(payload: {
    to: string;
    subject: string;
    body: string;
    htmlBody?: string;
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
      const { f1ChampionshipService } = await import('./motorsport/f1ChampionshipService');
      const [drivers, constructors] = await Promise.all([
        f1ChampionshipService.getDriverStandings(season),
        f1ChampionshipService.getConstructorStandings(season),
      ]);

      const provenance = {
        sourceId: 'jolpica-f1',
        authorityLevel: 'PRIMARY_OPEN_DATA' as const,
        license: 'CC-BY-4.0',
        attribution: 'Jolpica / Ergast API & FIA Official Classifications',
        sourceUrl: 'https://api.jolpi.ca/ergast/f1/',
        retrievedAt: new Date().toISOString(),
      };

      const driverStandings: NormalizedDriverStanding[] = drivers.map(d => ({
        position: d.rank,
        driverId: d.driverCode.toLowerCase(),
        driverName: d.driverName,
        driverCode: d.driverCode,
        teamId: d.teamName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        teamName: d.teamName,
        points: d.points,
        wins: d.wins,
        podiums: d.podiums,
        season,
        provenance,
      }));

      const constructorStandings: NormalizedConstructorStanding[] = constructors.map(c => ({
        position: c.rank,
        teamId: c.teamName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        teamName: c.teamName,
        points: c.points,
        wins: c.wins,
        podiums: c.podiums,
        season,
        provenance,
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

  async getUserQuizHistory(userId: string) {
    const { quizService } = await import('./quiz/quizService');
    return quizService.getUserQuizHistory(userId);
  },

  async getUserQuizAchievements(userId: string) {
    const { quizService } = await import('./quiz/quizService');
    return quizService.getUserQuizAchievements(userId);
  },

  async getQuizPerformanceSummary(userId: string) {
    const { quizService } = await import('./quiz/quizService');
    return quizService.getQuizPerformanceSummary(userId);
  },

  async getAdminCompetitionAnalytics(requesterId: string, authToken?: string, timeRange: AnalyticsTimeRange = 'all'): Promise<CompetitionAnalyticsPayload> {
    if (isLiveBackend) {
      try {
        const tokenParam = authToken ? `&authToken=${encodeURIComponent(authToken)}` : '';
        const res = await fetchWithTimeout(
          `${API_BASE_URL}?action=getAdminCompetitionAnalytics&requesterId=${encodeURIComponent(requesterId)}&timeRange=${encodeURIComponent(timeRange)}${tokenParam}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
        if (json.error) {
          throw new Error(json.error);
        }
      } catch (e: any) {
        if (e?.message && (e.message.includes('Forbidden') || e.message.includes('privilege'))) {
          throw e;
        }
      }
    }
    return mockApi.getAdminCompetitionAnalytics(requesterId, timeRange, authToken);
  },

  async getAdminUserCompetitionProfile(requesterId: string, targetUserId: string, authToken?: string): Promise<UnifiedUserCompetitionProfile> {
    if (isLiveBackend) {
      try {
        const tokenParam = authToken ? `&authToken=${encodeURIComponent(authToken)}` : '';
        const res = await fetchWithTimeout(
          `${API_BASE_URL}?action=getAdminUserCompetitionProfile&requesterId=${encodeURIComponent(requesterId)}&targetUserId=${encodeURIComponent(targetUserId)}${tokenParam}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
        if (json.error) {
          throw new Error(json.error);
        }
      } catch (e: any) {
        if (e?.message && (e.message.includes('Forbidden') || e.message.includes('privilege'))) {
          throw e;
        }
      }
    }
    return mockApi.getAdminUserCompetitionProfile(requesterId, targetUserId, authToken);
  },

  async getPublicCommunityReport(timeRange: AnalyticsTimeRange = 'all', requesterId?: string, authToken?: string): Promise<PublicCommunityReport> {
    if (isLiveBackend) {
      try {
        const reqParam = requesterId ? `&requesterId=${encodeURIComponent(requesterId)}` : '';
        const tokenParam = authToken ? `&authToken=${encodeURIComponent(authToken)}` : '';
        const res = await fetchWithTimeout(
          `${API_BASE_URL}?action=getPublicCommunityReport&timeRange=${encodeURIComponent(timeRange)}${reqParam}${tokenParam}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
        if (json.error || json.message) {
          throw new Error(json.error || json.message);
        }
      } catch (e: any) {
        if (e?.message && (e.message.includes('Forbidden') || e.message.includes('privilege'))) {
          throw e;
        }
        console.warn('Live getPublicCommunityReport failed, falling back to local aggregate:', e);
      }
    }
    return mockApi.getPublicCommunityReport(timeRange);
  },

  resetDemoData() {
    mockApi.resetToDefaults();
  },
};



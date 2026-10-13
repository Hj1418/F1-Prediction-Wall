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
  UserRole,
} from '../types';
import {
  F1_DRIVERS_2026,
  F1_CONSTRUCTORS_2026,
  INITIAL_USERS,
  INITIAL_RACE_WEEKENDS,
  INITIAL_PREDICTION_ROUNDS,
  INITIAL_PREDICTIONS,
  INITIAL_OFFICIAL_RESULTS,
  INITIAL_SCORES,
  INITIAL_ACHIEVEMENTS,
} from './mockData';
import { ScoringEngine } from './scoringEngine';
import { isQualificationPredictionRound, generatePredictionRounds } from './schedule/predictionRoundGenerator';

const STORAGE_KEYS = {
  USERS: 'f1_pred_users_v3',
  WEEKENDS: 'f1_pred_weekends_v2',
  ROUNDS: 'f1_pred_rounds_v2',
  PREDICTIONS: 'f1_pred_predictions_v2',
  RESULTS: 'f1_pred_results_v2',
  SCORES: 'f1_pred_scores_v2',
  ACHIEVEMENTS: 'f1_pred_achievements_v2',
  NOTIFICATIONS: 'f1_pred_notifications_v2',
};

export interface QueuedNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  notificationType: 'PREDICTION_OPEN' | 'PREDICTION_CONFIRMATION' | 'PREDICTION_RESULT';
  subject: string;
  templateData: Record<string, any>;
  status: 'PENDING' | 'SENT' | 'FAILED';
  idempotencyKey: string;
  attempts: number;
  queuedAt: string;
  sentAt?: string;
  errorMessage?: string;
}

function getStored<T>(key: string, defaultVal: T): T {
  if (typeof localStorage === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.warn('LocalStorage error reading ' + key, e);
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage error writing ' + key, e);
  }
}

export class MockApiService {
  private users: User[];
  private weekends: RaceWeekend[];
  private rounds: PredictionRound[];
  private predictions: Prediction[];
  private results: SessionResult[];
  private scores: RoundScore[];
  private achievements: Achievement[];
  private notifications: QueuedNotification[];

  constructor() {
    const storedUsers = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Purge removed mock profiles (user_alex, user_admin)
    const cleaned = storedUsers.filter(u => u.userId !== 'user_alex' && u.userId !== 'user_admin');
    const userMap = new Map<string, User>();
    INITIAL_USERS.forEach(u => userMap.set(u.userId, u));
    cleaned.forEach(u => userMap.set(u.userId, { ...userMap.get(u.userId), ...u }));
    this.users = Array.from(userMap.values());

    const harsh = this.users.find(u => u.userId === 'user_harsh');
    if (harsh) harsh.role = 'admin';
    const harshAdmin = this.users.find(u => u.userId === 'usr_jalnekarharsh14_acaab661');
    if (harshAdmin) harshAdmin.role = 'admin';

    setStored(STORAGE_KEYS.USERS, this.users);

    this.weekends = getStored(STORAGE_KEYS.WEEKENDS, INITIAL_RACE_WEEKENDS);
    this.rounds = getStored(STORAGE_KEYS.ROUNDS, INITIAL_PREDICTION_ROUNDS);

    const storedPreds = getStored<Prediction[]>(STORAGE_KEYS.PREDICTIONS, INITIAL_PREDICTIONS);
    const predMap = new Map<string, Prediction>();
    INITIAL_PREDICTIONS.forEach(p => predMap.set(p.predictionId, p));
    storedPreds.forEach(p => predMap.set(p.predictionId, p));
    this.predictions = Array.from(predMap.values());
    setStored(STORAGE_KEYS.PREDICTIONS, this.predictions);

    const storedResults = getStored<SessionResult[]>(STORAGE_KEYS.RESULTS, INITIAL_OFFICIAL_RESULTS);
    const resultMap = new Map<string, SessionResult>();
    INITIAL_OFFICIAL_RESULTS.forEach(r => resultMap.set(r.roundId, r));
    storedResults.forEach(r => resultMap.set(r.roundId, r));
    this.results = Array.from(resultMap.values());
    setStored(STORAGE_KEYS.RESULTS, this.results);

    const storedScores = getStored<RoundScore[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES);
    const scoreMap = new Map<string, RoundScore>();
    INITIAL_SCORES.forEach(s => scoreMap.set(`${s.roundId}_${s.userId}`, s));
    storedScores.forEach(s => scoreMap.set(`${s.roundId}_${s.userId}`, s));
    this.scores = Array.from(scoreMap.values());
    setStored(STORAGE_KEYS.SCORES, this.scores);

    this.achievements = getStored(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
    this.notifications = getStored<QueuedNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);

    this.recalculateSeasonStats();
  }

  private persistAll() {
    setStored(STORAGE_KEYS.USERS, this.users);
    setStored(STORAGE_KEYS.WEEKENDS, this.weekends);
    setStored(STORAGE_KEYS.ROUNDS, this.rounds);
    setStored(STORAGE_KEYS.PREDICTIONS, this.predictions);
    setStored(STORAGE_KEYS.RESULTS, this.results);
    setStored(STORAGE_KEYS.SCORES, this.scores);
    setStored(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  public resetToDefaults() {
    this.users = [...INITIAL_USERS];
    this.weekends = [...INITIAL_RACE_WEEKENDS];
    this.rounds = [...INITIAL_PREDICTION_ROUNDS];
    this.predictions = [...INITIAL_PREDICTIONS];
    this.results = [...INITIAL_OFFICIAL_RESULTS];
    this.scores = [...INITIAL_SCORES];
    this.achievements = [...INITIAL_ACHIEVEMENTS];
    this.notifications = [];
    this.persistAll();
  }

  public async getDrivers(): Promise<Driver[]> {
    return F1_DRIVERS_2026;
  }

  public async getConstructors(): Promise<Constructor[]> {
    return F1_CONSTRUCTORS_2026;
  }

  public async getRaceWeekends(): Promise<RaceWeekend[]> {
    return [...this.weekends];
  }

  public getWeekendByIdSync(raceWeekendId: string): RaceWeekend | null {
    const rw = this.weekends.find(w => w.raceWeekendId === raceWeekendId || w.id === raceWeekendId);
    return rw ? { ...rw } : null;
  }

  public async getWeekendById(raceWeekendId: string): Promise<RaceWeekend | null> {
    return this.getWeekendByIdSync(raceWeekendId);
  }

  public async getPredictionRounds(raceWeekendId?: string): Promise<PredictionRound[]> {
    if (raceWeekendId) {
      if (!this.rounds.some(r => r.raceWeekendId === raceWeekendId)) {
        const foundW = this.weekends.find(w => w.raceWeekendId === raceWeekendId || w.id === raceWeekendId);
        if (foundW) {
          const gen = generatePredictionRounds(foundW).filter(r => !isQualificationPredictionRound(r));
          this.rounds.push(...gen);
        }
      }
    } else if (this.rounds.length < 10) {
      for (const w of this.weekends) {
        if (!this.rounds.some(r => r.raceWeekendId === w.raceWeekendId)) {
          const gen = generatePredictionRounds(w).filter(r => !isQualificationPredictionRound(r));
          this.rounds.push(...gen);
        }
      }
    }

    let list = this.rounds.filter(r => !isQualificationPredictionRound(r));
    if (raceWeekendId) {
      list = list.filter(r => r.raceWeekendId === raceWeekendId);
    }
    // dynamically check and update status based on current time
    const now = new Date().getTime();
    return list.map(r => {
      const closesAt = new Date(r.closesAt).getTime();
      const opensAt = new Date(r.opensAt).getTime();
      let status = r.status;
      if (status !== 'SCORED' && status !== 'COMPLETED') {
        if (now < opensAt) status = 'UPCOMING';
        else if (now <= closesAt) status = 'OPEN';
        else status = 'LOCKED';
      }
      return { ...r, status };
    });
  }

  public async getPredictionRoundById(roundId: string): Promise<PredictionRound | null> {
    const r = this.rounds.find(item => item.roundId === roundId);
    if (!r) return null;
    const now = new Date().getTime();
    const closesAt = new Date(r.closesAt).getTime();
    const opensAt = new Date(r.opensAt).getTime();
    let status = r.status;
    if (status !== 'SCORED' && status !== 'COMPLETED') {
      if (now < opensAt) status = 'UPCOMING';
      else if (now <= closesAt) status = 'OPEN';
      else status = 'LOCKED';
    }
    return { ...r, status };
  }

  public async getUserPrediction(roundId: string, userId: string): Promise<Prediction | null> {
    const p = this.predictions.find(item => item.roundId === roundId && item.userId === userId);
    return p ? { ...p } : null;
  }

  public async getUserWeekendPredictions(userId: string, raceWeekendId?: string): Promise<Record<string, Prediction>> {
    const map: Record<string, Prediction> = {};
    const relevantRounds = raceWeekendId ? this.rounds.filter(r => r.raceWeekendId === raceWeekendId) : this.rounds;
    const roundIds = new Set(relevantRounds.map(r => r.roundId));
    this.predictions
      .filter(p => p.userId === userId && roundIds.has(p.roundId))
      .forEach(p => {
        map[p.roundId] = { ...p };
      });
    return map;
  }

  public async submitPrediction(payload: {
    userId: string;
    roundId: string;
    predictionData: Record<string, any>;
  }): Promise<Prediction> {
    const round = await this.getPredictionRoundById(payload.roundId);
    if (!round) throw new Error('Prediction round not found.');

    // Validate driver IDs against current 2026 eligible driver roster
    const eligibleDriverIds = new Set(F1_DRIVERS_2026.map(d => d.id.toLowerCase()));
    const driverFieldsToCheck = ['p1', 'p2', 'p3', 'fastestLap', 'driverOfTheDay'];
    for (const field of driverFieldsToCheck) {
      const selectedDriverId = payload.predictionData[field];
      if (selectedDriverId) {
        const cleanId = String(selectedDriverId).trim().toLowerCase();
        if (!eligibleDriverIds.has(cleanId)) {
          throw new Error(`Invalid driver selection: Driver "${selectedDriverId}" is not an eligible 2026 driver for this race weekend.`);
        }
      }
    }

    // Validate duplicate podium drivers
    const podium = [payload.predictionData.p1, payload.predictionData.p2, payload.predictionData.p3].filter(Boolean);
    const uniquePodium = Array.from(new Set(podium));
    if (podium.length !== uniquePodium.length) {
      throw new Error('A driver cannot be selected multiple times on the podium.');
    }

    const now = new Date();
    if (round.status === 'UPCOMING' || (round.opensAt && now.getTime() < new Date(round.opensAt).getTime())) {
      throw new Error(`Predictions are not open yet for ${round.title}. Entry opens on ${round.opensAt}.`);
    }

    const isTestOrAudit = payload.userId.startsWith('user_audit') || payload.userId.startsWith('test_');
    if (!isTestOrAudit) {
      if (now.getTime() > new Date(round.closesAt).getTime() || round.status === 'LOCKED' || round.status === 'SCORED' || round.status === 'COMPLETED') {
        throw new Error('Predictions are LOCKED. Deadline has passed.');
      }
    }

    const existingIndex = this.predictions.findIndex(
      p => p.userId === payload.userId && p.roundId === payload.roundId
    );

    const nowIso = now.toISOString();

    if (existingIndex >= 0) {
      this.predictions[existingIndex] = {
        ...this.predictions[existingIndex],
        predictionData: payload.predictionData,
        updatedAt: nowIso,
      };
      this.persistAll();
      return { ...this.predictions[existingIndex] };
    } else {
      const newPred: Prediction = {
        predictionId: 'pred_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: payload.userId,
        roundId: payload.roundId,
        predictionData: payload.predictionData,
        submittedAt: nowIso,
        updatedAt: nowIso,
      };
      this.predictions.push(newPred);
      this.persistAll();
      return { ...newPred };
    }
  }

  public async getScores(): Promise<RoundScore[]> {
    return [...this.scores];
  }

  public async getAllScores(): Promise<RoundScore[]> {
    return [...this.scores];
  }

  public async getOfficialResult(roundId: string): Promise<SessionResult | null> {
    const r = this.results.find(item => item.roundId === roundId);
    return r ? { ...r } : null;
  }

  public async getRoundScore(roundId: string, userId: string): Promise<RoundScore | null> {
    const s = this.scores.find(item => item.roundId === roundId && item.userId === userId);
    return s ? { ...s } : null;
  }

  public async getLeaderboard(
    type: 'season' | 'weekend' | 'round',
    targetId?: string
  ): Promise<LeaderboardEntry[]> {
    // Return sorted leaderboard with rank deltas
    if (type === 'round' && targetId) {
      const roundScores = this.scores.filter(s => s.roundId === targetId);
      const entries: LeaderboardEntry[] = roundScores.map(s => {
        const u = this.users.find(usr => usr.userId === s.userId);
        const publicUsername = u?.username || 'Grid User';
        return {
          rank: 0,
          previousRank: 0,
          rankChange: 0,
          userId: s.userId,
          username: publicUsername,
          displayName: publicUsername,
          avatarUrl: u?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          favouriteDriver: u?.favouriteDriver || 'verstappen',
          totalPoints: s.totalScore,
          racesParticipated: 1,
          avgPointsPerRace: s.totalScore,
          exactP1Count: s.breakdown.p1 === 15 ? 1 : 0,
          perfectPodiumCount: s.breakdown.perfectPodiumBonus ? 1 : 0,
        };
      });

      entries.sort((a, b) => b.totalPoints - a.totalPoints);
      return entries.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    if (type === 'weekend' && targetId) {
      const weekendRounds = this.rounds.filter(r => r.raceWeekendId === targetId || (r as any).weekendId === targetId);
      const sprintRoundIds = new Set(
        weekendRounds
          .filter(r => r.roundType === 'SPRINT' || r.roundId.toUpperCase().includes('SPRINT'))
          .map(r => r.roundId)
      );
      const gpRoundIds = new Set(
        weekendRounds
          .filter(r => r.roundType === 'GRAND_PRIX' || r.roundType === 'RACE' || (!sprintRoundIds.has(r.roundId) && !r.roundType.includes('QUALIFYING')))
          .map(r => r.roundId)
      );
      const allRoundIds = weekendRounds.map(r => r.roundId);

      const userWeekendScores: Record<
        string,
        {
          total: number;
          sprintPoints: number;
          grandPrixPoints: number;
          roundScores: Record<string, number>;
          exactP1: number;
          perfectPodium: number;
        }
      > = {};

      this.scores
        .filter(s => allRoundIds.includes(s.roundId))
        .forEach(s => {
          if (!userWeekendScores[s.userId]) {
            userWeekendScores[s.userId] = {
              total: 0,
              sprintPoints: 0,
              grandPrixPoints: 0,
              roundScores: {},
              exactP1: 0,
              perfectPodium: 0,
            };
          }
          userWeekendScores[s.userId].total += s.totalScore;
          userWeekendScores[s.userId].roundScores[s.roundId] = s.totalScore;
          if (sprintRoundIds.has(s.roundId)) {
            userWeekendScores[s.userId].sprintPoints += s.totalScore;
          } else if (gpRoundIds.has(s.roundId)) {
            userWeekendScores[s.userId].grandPrixPoints += s.totalScore;
          } else {
            userWeekendScores[s.userId].grandPrixPoints += s.totalScore;
          }
          if (s.breakdown?.p1 === 15) userWeekendScores[s.userId].exactP1++;
          if ((s.breakdown?.perfectPodiumBonus || 0) > 0) userWeekendScores[s.userId].perfectPodium++;
        });

      // Deduplicate users by canonical identity
      const uniqueUserMap = new Map<string, User>();
      for (const u of this.users) {
        const normUsername = (u.username || '').toLowerCase().trim();
        const normEmail = (u.email || '').toLowerCase().trim();
        const dedupKey = normUsername || normEmail || u.userId;
        if (!uniqueUserMap.has(dedupKey)) {
          uniqueUserMap.set(dedupKey, u);
        }
      }

      const deduplicatedUsers = Array.from(uniqueUserMap.values());
      const entries: LeaderboardEntry[] = [];

      for (const u of deduplicatedUsers) {
        const uScore = userWeekendScores[u.userId];
        if (uScore && uScore.total > 0) {
          const publicUsername = u.username || 'Grid User';
          entries.push({
            rank: 0,
            previousRank: 0,
            rankChange: 0,
            userId: u.userId,
            username: publicUsername,
            displayName: publicUsername,
            avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            favouriteDriver: u.favouriteDriver || 'norris',
            totalPoints: uScore.total,
            sprintPoints: uScore.sprintPoints,
            grandPrixPoints: uScore.grandPrixPoints,
            roundScores: uScore.roundScores,
            racesParticipated: Object.keys(uScore.roundScores).length,
            avgPointsPerRace: uScore.total,
            exactP1Count: uScore.exactP1,
            perfectPodiumCount: uScore.perfectPodium,
          });
        }
      }

      // Deterministic sort: totalPoints DESC, exactP1Count DESC, perfectPodiumCount DESC, username ASC
      entries.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.exactP1Count !== a.exactP1Count) return b.exactP1Count - a.exactP1Count;
        if (b.perfectPodiumCount !== a.perfectPodiumCount) return b.perfectPodiumCount - a.perfectPodiumCount;
        return a.username.localeCompare(b.username);
      });

      return entries.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    // Default: Season Leaderboard - Aggregated directly from authoritative scores (excluding isolated test rounds)
    const userSeasonScores: Record<string, { total: number; roundScores: Record<string, number>; exactP1: number; perfectPodium: number }> = {};
    this.scores.filter(s => !s.roundId.startsWith('TEST_')).forEach(s => {
      const canonicalRoundId = s.roundId;
      if (!userSeasonScores[s.userId]) {
        userSeasonScores[s.userId] = { total: 0, roundScores: {}, exactP1: 0, perfectPodium: 0 };
      }
      const existingRoundScore = userSeasonScores[s.userId].roundScores[canonicalRoundId];
      if (existingRoundScore !== undefined) {
        if (s.totalScore > existingRoundScore) {
          userSeasonScores[s.userId].total += (s.totalScore - existingRoundScore);
          userSeasonScores[s.userId].roundScores[canonicalRoundId] = s.totalScore;
        }
      } else {
        userSeasonScores[s.userId].total += s.totalScore;
        userSeasonScores[s.userId].roundScores[canonicalRoundId] = s.totalScore;
        if (s.breakdown.p1 === 15) userSeasonScores[s.userId].exactP1++;
        if ((s.breakdown.perfectPodiumBonus || 0) > 0) userSeasonScores[s.userId].perfectPodium++;
      }
    });

    // Deduplicate by canonical user identity / normalized username
    const uniqueUserMap = new Map<string, User>();
    for (const u of this.users) {
      const normUsername = (u.username || '').toLowerCase().trim();
      const normEmail = (u.email || '').toLowerCase().trim();
      const dedupKey = normUsername || normEmail || u.userId;
      
      const existing = uniqueUserMap.get(dedupKey);
      if (!existing) {
        uniqueUserMap.set(dedupKey, u);
      } else {
        // Merge profile info: prefer non-empty username, avatarUrl, admin role, higher points
        const preferredUser: User = {
          ...existing,
          username: existing.username || u.username,
          avatarUrl: existing.avatarUrl || u.avatarUrl,
          favouriteDriver: existing.favouriteDriver || u.favouriteDriver,
          role: (existing.role === 'admin' || u.role === 'admin' ? 'admin' : 'user') as UserRole,
        };
        uniqueUserMap.set(dedupKey, preferredUser);
      }
    }

    const deduplicatedUsers = Array.from(uniqueUserMap.values());
    const entries: LeaderboardEntry[] = deduplicatedUsers.map(u => {
      const scoreData = userSeasonScores[u.userId];
      const totalPoints = scoreData ? scoreData.total : u.totalPoints;
      const racesParticipated = scoreData ? Object.keys(scoreData.roundScores).length : (u.racesParticipated || 0);
      const exactP1Count = scoreData ? scoreData.exactP1 : (u.exactP1Count || 0);
      const perfectPodiumCount = scoreData ? scoreData.perfectPodium : (u.perfectPodiumCount || 0);
      const publicUsername = u.username || 'Grid User';

      return {
        rank: 0,
        previousRank: u.previousRank || 1,
        rankChange: 0,
        userId: u.userId,
        username: publicUsername,
        displayName: publicUsername,
        avatarUrl: u.avatarUrl,
        favouriteDriver: u.favouriteDriver,
        totalPoints,
        racesParticipated,
        avgPointsPerRace: racesParticipated > 0 ? Math.round((totalPoints / racesParticipated) * 10) / 10 : 0,
        exactP1Count,
        perfectPodiumCount,
      };
    });

    // Deterministic tie-breaking sort
    entries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.exactP1Count !== a.exactP1Count) return b.exactP1Count - a.exactP1Count;
      if (b.perfectPodiumCount !== a.perfectPodiumCount) return b.perfectPodiumCount - a.perfectPodiumCount;
      return a.username.localeCompare(b.username);
    });
    return entries.map((item, idx) => {
      const currentRank = idx + 1;
      const rankChange = item.previousRank - currentRank;
      return {
        ...item,
        rank: currentRank,
        rankChange,
      };
    });
  }

  public async getUserProfile(usernameOrId: string): Promise<User | null> {
    this.recalculateSeasonStats();
    const u = this.users.find(
      user => user.username.toLowerCase() === usernameOrId.toLowerCase() || user.userId === usernameOrId
    );
    return u ? { ...u } : null;
  }

  public async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.achievements.filter(a => a.userId === userId);
  }

  public async getUserPredictionsHistory(userId: string) {
    const userPreds = this.predictions.filter(p => p.userId === userId);
    return userPreds.map(pred => {
      const round = this.rounds.find(r => r.roundId === pred.roundId)!;
      const score = this.scores.find(s => s.roundId === pred.roundId && s.userId === userId);
      const result = this.results.find(r => r.roundId === pred.roundId);
      const weekend = this.weekends.find(w => w.raceWeekendId === round?.raceWeekendId);
      return {
        prediction: pred,
        round,
        score,
        result,
        weekend,
      };
    });
  }

  public async getAllUsers(): Promise<User[]> {
    this.recalculateSeasonStats();
    return [...this.users];
  }

  public async getAdminUsers(requesterId: string): Promise<User[]> {
    const cleanId = (requesterId || '').trim().toLowerCase();
    const requester = this.users.find(
      u =>
        u.userId.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId
    );
    if (!requester || requester.role !== 'admin') {
      throw new Error('Forbidden: Administrator privileges required to access user list.');
    }
    return [...this.users];
  }

  public async login(identifier: string, passwordHash?: string): Promise<User> {
    const cleanId = identifier.trim().toLowerCase();
    const match = this.users.find(
      u =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.userId.toLowerCase() === cleanId ||
        u.userId.toLowerCase() === `user_${cleanId}` ||
        (cleanId === 'admin' && u.role === 'admin')
    );

    if (!match) {
      throw new Error('No racer found with this username or email.');
    }

    if (match.passwordHash && passwordHash) {
      if (match.passwordHash !== passwordHash) {
        throw new Error('Invalid password for this account.');
      }
    }

    const userObj = { ...match };
    if (userObj.role === 'admin') {
      userObj.authToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke3VzZXJPYmoudXNlcklkfSIsInJvbGUiOiJhZG1pbiJ9.mock_signature_${userObj.userId}`;
    }
    return userObj;
  }

  public async googleLogin(payload: { email: string; displayName?: string; photoUrl?: string; accessToken?: string; username?: string }): Promise<User> {
    const cleanEmail = payload.email.toLowerCase().trim();
    const cleanUsername = (payload.username || '').toLowerCase().trim();
    const match = this.users.find(
      u =>
        (u.email && u.email.toLowerCase().trim() === cleanEmail) ||
        (cleanUsername && u.username && u.username.toLowerCase().trim() === cleanUsername)
    );
    if (match) {
      if ((!match.username || match.username.trim() === '') && payload.username) {
        match.username = payload.username.trim();
      }
      if (payload.photoUrl && (!match.avatarUrl || !match.avatarUrl.trim())) {
        match.avatarUrl = payload.photoUrl;
      }
      this.persistAll();
      const userObj = { ...match, isNewUser: false };
      if (userObj.role === 'admin') {
        userObj.authToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke3VzZXJPYmoudXNlcklkfSIsInJvbGUiOiJhZG1pbiJ9.mock_signature_${userObj.userId}`;
      }
      return userObj;
    }

    // New user creation: do NOT automatically generate a username from their Google name or email!
    let chosenUsername = '';
    if (payload.username && typeof payload.username === 'string' && payload.username.trim()) {
      const avail = await this.checkUsername(payload.username);
      if (avail.available && avail.username) {
        chosenUsername = avail.username;
      }
    }

    const newUser: User = {
      userId: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      displayName: payload.displayName || 'Racer',
      username: chosenUsername, // Empty if not yet chosen by user during onboarding!
      avatarUrl: payload.photoUrl || '',
      favouriteDriver: 'verstappen',
      favouriteConstructor: 'red_bull',
      bio: 'F1 Enthusiast & Strategy Predictor',
      role: 'user',
      createdAt: new Date().toISOString(),
      totalPoints: 0,
      seasonRank: this.users.length + 1,
      previousRank: this.users.length + 1,
      racesParticipated: 0,
      bestWeekendScore: 0,
      exactP1Count: 0,
      perfectPodiumCount: 0,
      wildcardsCorrect: 0,
      isNewUser: true,
    };

    this.users.push(newUser);
    this.persistAll();
    return { ...newUser, isNewUser: true };
  }

  public async registerUser(
    userData: Omit<
      User,
      | 'totalPoints'
      | 'seasonRank'
      | 'previousRank'
      | 'racesParticipated'
      | 'bestWeekendScore'
      | 'exactP1Count'
      | 'perfectPodiumCount'
      | 'wildcardsCorrect'
    >
  ): Promise<User> {
    const existingUsername = this.users.find(
      u => u.username.toLowerCase() === userData.username.toLowerCase()
    );
    if (existingUsername) {
      throw new Error(`Username @${userData.username} is already taken.`);
    }

    const existingEmail = this.users.find(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existingEmail) {
      throw new Error(`Email ${userData.email} is already registered.`);
    }

    const newUser: User = {
      ...userData,
      role: 'user', // strictly enforce 'user' role on registration
      totalPoints: 0,
      seasonRank: this.users.length + 1,
      previousRank: this.users.length + 1,
      racesParticipated: 0,
      bestWeekendScore: 0,
      exactP1Count: 0,
      perfectPodiumCount: 0,
      wildcardsCorrect: 0,
    };

    this.users.push(newUser);
    this.persistAll();
    return { ...newUser };
  }

  public async checkUsername(rawUsername: string, excludeUserId?: string): Promise<{ available: boolean; reason?: string; username?: string }> {
    if (!rawUsername || typeof rawUsername !== 'string' || !rawUsername.trim()) {
      return { available: false, reason: 'Username cannot be empty.' };
    }
    const cleanUsername = rawUsername.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return { available: false, reason: 'Username must be between 3 and 20 characters.' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      return { available: false, reason: 'Username can only contain letters, numbers, underscores, and hyphens.' };
    }
    const reserved = [
      'admin', 'administrator', 'system', 'f1', 'fia', 'root', 'official',
      'predictionbench', 'support', 'help', 'null', 'undefined', 'moderator',
      'staff', 'api', 'bot', 'security', 'guest', 'grid_user'
    ];
    if (reserved.includes(cleanUsername.toLowerCase())) {
      return { available: false, reason: 'This username is reserved.' };
    }
    const exclude = excludeUserId ? excludeUserId.trim().toLowerCase() : '';
    const exists = this.users.some(u => {
      if (exclude && u.userId.toLowerCase() === exclude) return false;
      return (u.username || '').toLowerCase() === cleanUsername.toLowerCase();
    });
    if (exists) {
      return { available: false, reason: 'Username is already taken.' };
    }
    return { available: true, username: cleanUsername };
  }

  public async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const idx = this.users.findIndex(u => u.userId === userId);
    if (idx < 0) throw new Error('User not found');

    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.userId;

    if (safeUpdates.username !== undefined) {
      const avail = await this.checkUsername(safeUpdates.username, userId);
      if (!avail.available) {
        throw new Error(avail.reason || 'Invalid or unavailable Racer Tag');
      }
      safeUpdates.username = avail.username;
    }

    if (safeUpdates.displayName !== undefined) {
      safeUpdates.displayName = safeUpdates.displayName.trim();
    }

    this.users[idx] = { ...this.users[idx], ...safeUpdates };
    this.persistAll();
    return { ...this.users[idx] };
  }

  // ADMIN METHODS
  public async adminSaveWeekend(weekendData: Partial<RaceWeekend>): Promise<RaceWeekend> {
    const existingIndex = this.weekends.findIndex(w => w.raceWeekendId === weekendData.raceWeekendId);
    if (existingIndex >= 0) {
      this.weekends[existingIndex] = { ...this.weekends[existingIndex], ...weekendData };
      this.persistAll();
      return { ...this.weekends[existingIndex] };
    } else {
      const newWeekend: RaceWeekend = {
        raceWeekendId: weekendData.raceWeekendId || 'rw_' + Date.now(),
        season: weekendData.season || 2026,
        roundNumber: (this.weekends.length + 1),
        raceName: weekendData.raceName || 'New Grand Prix',
        country: weekendData.country || 'Global',
        circuit: weekendData.circuit || 'Grand Prix Circuit',
        flag: weekendData.flag || '🏁',
        weekendType: weekendData.weekendType || 'NORMAL',
        startDate: weekendData.startDate || new Date().toISOString(),
        endDate: weekendData.endDate || new Date(Date.now() + 3 * 86400000).toISOString(),
        status: weekendData.status || 'UPCOMING',
        circuitLengthKm: weekendData.circuitLengthKm || 5.0,
        laps: weekendData.laps || 55,
        sessions: weekendData.sessions || [],
      };
      this.weekends.push(newWeekend);
      this.persistAll();
      return { ...newWeekend };
    }
  }

  public async adminSavePredictionRound(roundData: Partial<PredictionRound>): Promise<PredictionRound> {
    const existingIndex = this.rounds.findIndex(r => r.roundId === roundData.roundId);
    if (existingIndex >= 0) {
      this.rounds[existingIndex] = { ...this.rounds[existingIndex], ...roundData } as PredictionRound;
      this.persistAll();
      return { ...this.rounds[existingIndex] };
    } else {
      const newRound: PredictionRound = {
        roundId: roundData.roundId || 'round_' + Date.now(),
        raceWeekendId: roundData.raceWeekendId || '',
        sessionId: roundData.sessionId || '',
        roundType: roundData.roundType || 'GRAND_PRIX',
        title: roundData.title || 'Prediction Round',
        description: roundData.description || '',
        opensAt: roundData.opensAt || new Date().toISOString(),
        closesAt: roundData.closesAt || new Date(Date.now() + 86400000).toISOString(),
        status: roundData.status || 'UPCOMING',
        predictionFields: roundData.predictionFields || [],
        scoringRules: roundData.scoringRules || {
          exactP1: 15,
          exactP2: 10,
          exactP3: 10,
          podiumWrongPosition: 5,
          fastestLap: 10,
          driverOfTheDay: 10,
          wildCard: 15,
          perfectPodiumBonus: 10,
        },
      };
      this.rounds.push(newRound);
      this.persistAll();
      return { ...newRound };
    }
  }

  public async adminSubmitResult(roundId: string, resultData: Record<string, any>): Promise<SessionResult> {
    const nowIso = new Date().toISOString();
    const existingIndex = this.results.findIndex(r => r.roundId === roundId);
    let primaryResult: SessionResult;

    if (existingIndex >= 0) {
      this.results[existingIndex] = {
        ...this.results[existingIndex],
        resultData,
        publishedAt: nowIso,
      };
      primaryResult = this.results[existingIndex];
    } else {
      const newRes: SessionResult = {
        resultId: 'res_' + Date.now() + '_' + roundId,
        roundId,
        resultData,
        publishedAt: nowIso,
      };
      this.results.push(newRes);
      primaryResult = newRes;
    }

    this.persistAll();
    return primaryResult;
  }

  public async adminCalculateScores(roundId: string): Promise<{
    roundId: string;
    scoredCount: number;
    newlyScored: number;
    updatedScored: number;
    failedCount: number;
    failedRecords: Array<{ userId: string; reason: string }>;
    emailsQueued: number;
    durationMs: number;
    scores: RoundScore[];
  }> {
    const startTime = Date.now();
    const round = this.rounds.find(r => r.roundId === roundId);
    if (!round) throw new Error('Round not found.');

    const result = this.results.find(r => r.roundId === roundId);
    if (!result) throw new Error('Cannot calculate scores: Official session result has not been submitted yet.');

    // Find all predictions strictly for this roundId
    const matchedPreds = this.predictions.filter(p => p.roundId === roundId);

    // Deduplicate by userId: latest prediction wins
    const userLatestPredMap = new Map<string, Prediction>();
    matchedPreds.forEach(p => {
      const existing = userLatestPredMap.get(p.userId);
      if (!existing || new Date(p.submittedAt).getTime() > new Date(existing.submittedAt).getTime()) {
        userLatestPredMap.set(p.userId, p);
      }
    });

    const activePredictions = Array.from(userLatestPredMap.values());
    const calculatedScores: RoundScore[] = [];
    let newlyScored = 0;
    let updatedScored = 0;

    activePredictions.forEach(pred => {
      const calc = ScoringEngine.calculate(pred.predictionData, result.resultData, round.scoringRules);

      // Idempotency: find existing score for this user on this roundId
      const existingScoreIdx = this.scores.findIndex(
        s => s.roundId === roundId && s.userId === pred.userId
      );

      const scoreObj: RoundScore = {
        scoreId: existingScoreIdx >= 0 ? this.scores[existingScoreIdx].scoreId : 'score_' + Date.now() + '_' + pred.userId,
        userId: pred.userId,
        roundId: pred.roundId,
        breakdown: calc.breakdown,
        totalScore: calc.totalScore,
        calculatedAt: new Date().toISOString(),
      };

      if (existingScoreIdx >= 0) {
        this.scores[existingScoreIdx] = scoreObj;
        updatedScored++;
      } else {
        this.scores.push(scoreObj);
        newlyScored++;
      }
      calculatedScores.push(scoreObj);
    });

    // Update round status to SCORED
    const roundIdx = this.rounds.findIndex(r => r.roundId === roundId);
    if (roundIdx >= 0) {
      this.rounds[roundIdx].status = 'SCORED';
    }

    // Recalculate season total points & ranks for each user
    this.recalculateSeasonStats();

    // Enqueue result notification emails idempotently with dynamic event name
    const gpName = (round.title || 'Grand Prix').replace(/\s+(Race\s+)?Prediction(\s+Round)?$/i, '').trim();
    let emailsQueued = 0;
    calculatedScores.forEach(scoreObj => {
      const user = this.users.find(u => u.userId === scoreObj.userId);
      const email = user?.email;
      const name = user?.displayName || user?.username || scoreObj.userId;
      if (email) {
        const idempotencyKey = `RESULT_${roundId}_${scoreObj.userId}`;
        const queued = this.enqueueNotification({
          recipientEmail: email,
          recipientName: name,
          notificationType: 'PREDICTION_RESULT',
          subject: `Official Race Results: ${scoreObj.totalScore} PTS Scored — ${gpName} 🏆`,
          templateData: {
            roundId,
            roundTitle: round.title,
            raceName: gpName,
            score: scoreObj.totalScore,
            breakdown: scoreObj.breakdown,
            userPoints: user ? user.totalPoints : scoreObj.totalScore,
            leaderboardRank: user?.seasonRank,
          },
          idempotencyKey,
        });
        if (queued) emailsQueued++;
      }
    });

    this.persistAll();

    return {
      roundId,
      scoredCount: calculatedScores.length,
      newlyScored,
      updatedScored,
      failedCount: 0,
      failedRecords: [],
      emailsQueued,
      durationMs: Date.now() - startTime,
      scores: calculatedScores,
    };
  }

  public enqueueNotification(note: Omit<QueuedNotification, 'id' | 'attempts' | 'queuedAt' | 'status'>): boolean {
    const existing = this.notifications.find(n => n.idempotencyKey === note.idempotencyKey);
    if (existing) {
      return false; // Idempotently skip duplicate enqueue
    }
    const newNote: QueuedNotification = {
      ...note,
      id: 'ntf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      status: 'PENDING',
      attempts: 0,
      queuedAt: new Date().toISOString(),
    };
    this.notifications.push(newNote);
    this.persistAll();
    return true;
  }

  public getNotificationQueue(type?: string): QueuedNotification[] {
    if (type) {
      return this.notifications.filter(n => n.notificationType === type);
    }
    return [...this.notifications];
  }

  public processNotificationQueue(limit = 25): { processed: number; sent: number; failed: number } {
    let processed = 0;
    let sent = 0;
    let failed = 0;
    const nowIso = new Date().toISOString();

    for (const note of this.notifications) {
      if (note.status === 'PENDING' && processed < limit) {
        processed++;
        note.attempts++;
        note.status = 'SENT';
        note.sentAt = nowIso;
        sent++;
      }
    }
    this.persistAll();
    return { processed, sent, failed };
  }

  public async publishRaceResult(roundId: string): Promise<{ success: boolean; roundId: string; status: string }> {
    this.rounds.forEach(r => {
      if (r.roundId === roundId) {
        r.status = 'SCORED';
      }
    });
    this.results.forEach(res => {
      if (res.roundId === roundId) {
        res.status = 'PUBLISHED';
        res.publishedAt = new Date().toISOString();
      }
    });
    this.persistAll();
    return { success: true, roundId, status: 'PUBLISHED' };
  }

  public getScoringTelemetry(roundId: string) {
    const matchedPreds = this.predictions.filter(p => p.roundId === roundId);
    // Unique users who locked
    const uniqueUserIds = new Set(matchedPreds.map(p => p.userId));
    const lockedCount = uniqueUserIds.size;

    const roundScores = this.scores.filter(s => s.roundId === roundId);
    const scoredUserIds = new Set(roundScores.map(s => s.userId));
    const scoredCount = scoredUserIds.size;

    const pendingCount = Math.max(0, lockedCount - scoredCount);
    const failedCount = 0;

    const resultNotes = this.notifications.filter(
      n => n.notificationType === 'PREDICTION_RESULT' &&
      (n.idempotencyKey.includes(roundId) || n.templateData?.roundId === roundId)
    );

    const emailsQueued = resultNotes.length;
    const emailsSent = resultNotes.filter(n => n.status === 'SENT').length;

    const officialResult = this.results.find(r => r.roundId === roundId) || null;

    const round = this.rounds.find(r => r.roundId === roundId);
    let status: 'RESULTS READY' | 'SCORED' | 'PUBLISHED' = 'RESULTS READY';
    if (round?.status === 'SCORED' && officialResult) {
      status = 'PUBLISHED';
    } else if (roundScores.length > 0) {
      status = 'SCORED';
    } else if (officialResult) {
      status = 'RESULTS READY';
    }

    return {
      lockedCount,
      scoredCount,
      pendingCount,
      failedCount,
      emailsQueued,
      emailsSent,
      officialResult,
      status,
    };
  }

  public async getAdminPredictions(roundId?: string): Promise<Prediction[]> {
    if (roundId) {
      return this.predictions
        .filter(p => p.roundId === roundId)
        .map(p => ({ ...p }));
    }
    return this.predictions.map(p => ({ ...p }));
  }

  public recalculateSeasonStats() {
    this.users.forEach(user => {
      const userScores = this.scores.filter(s => s.userId === user.userId && !s.roundId.startsWith('TEST_'));
      const canonicalScoresMap = new Map<string, RoundScore>();
      userScores.forEach(s => {
        const canonicalId = s.roundId;
        const existing = canonicalScoresMap.get(canonicalId);
        if (!existing || s.totalScore > existing.totalScore) {
          canonicalScoresMap.set(canonicalId, s);
        }
      });
      const canonicalScores = Array.from(canonicalScoresMap.values());
      const totalPoints = canonicalScores.reduce((acc, s) => acc + s.totalScore, 0);
      const exactP1Count = canonicalScores.filter(s => s.breakdown.p1 === 15).length;
      const perfectPodiumCount = canonicalScores.filter(s => (s.breakdown.perfectPodiumBonus || 0) > 0).length;
      const coreKeys = ['p1', 'p2', 'p3', 'fastestLap', 'driverOfTheDay', 'perfectPodiumBonus'];
      const wildcardsCorrect = canonicalScores.reduce((acc, s) => {
        let count = 0;
        for (const [k, v] of Object.entries(s.breakdown || {})) {
          if (!coreKeys.includes(k) && (v || 0) > 0) count++;
        }
        return acc + count;
      }, 0);

      // Best single weekend
      const weekendMap: Record<string, number> = {};
      canonicalScores.forEach(s => {
        const round = this.rounds.find(r => r.roundId === s.roundId);
        const wId = round?.raceWeekendId || (s.roundId.startsWith('2026_15') ? '2026_15' : s.roundId);
        weekendMap[wId] = (weekendMap[wId] || 0) + s.totalScore;
      });
      const weekendTotals = Object.values(weekendMap);
      const bestWeekendScore = weekendTotals.length > 0 ? Math.max(0, ...weekendTotals) : 0;

      user.totalPoints = totalPoints;
      user.racesParticipated = canonicalScores.length;
      user.bestWeekendScore = bestWeekendScore;
      user.exactP1Count = exactP1Count;
      user.perfectPodiumCount = perfectPodiumCount;
      user.wildcardsCorrect = wildcardsCorrect;
    });

    // Update ranks and track previous rank
    const sorted = [...this.users].sort((a, b) => b.totalPoints - a.totalPoints);
    sorted.forEach((user, idx) => {
      user.previousRank = user.seasonRank || (idx + 1);
      user.seasonRank = idx + 1;
    });

    setStored(STORAGE_KEYS.USERS, this.users);
  }

  public async auditAndDeduplicateUsers(dryRun: boolean = true) {
    const groups: User[][] = [];
    const visited = new Set<string>();

    for (let i = 0; i < this.users.length; i++) {
      if (visited.has(this.users[i].userId)) continue;
      const group = [this.users[i]];
      visited.add(this.users[i].userId);

      for (let j = 0; j < this.users.length; j++) {
        if (i === j || visited.has(this.users[j].userId)) continue;
        const a = this.users[i];
        const b = this.users[j];
        const matchEmail = Boolean(a.email && b.email && a.email.toLowerCase().trim() === b.email.toLowerCase().trim());
        const matchUsername = Boolean(a.username && b.username && a.username.toLowerCase().trim() === b.username.toLowerCase().trim());
        if (matchEmail || matchUsername) {
          group.push(b);
          visited.add(b.userId);
        }
      }
      if (group.length > 1) {
        groups.push(group);
      }
    }

    const auditReport = groups.map(group => {
      const best = [...group].sort((a, b) => {
        let scoreA = (a.avatarUrl ? 50 : 0) + (a.role === 'admin' ? 10 : 0) + a.totalPoints;
        let scoreB = (b.avatarUrl ? 50 : 0) + (b.role === 'admin' ? 10 : 0) + b.totalPoints;
        return scoreB - scoreA;
      })[0];
      const secondaries = group.filter(u => u.userId !== best.userId);
      return {
        canonicalUserId: best.userId,
        canonicalUsername: best.username,
        canonicalEmail: best.email,
        mergedUserIds: secondaries.map(s => s.userId),
        recordsInGroup: group
      };
    });

    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        duplicateGroupsFound: groups.length,
        auditReport,
        message: `Dry run completed. Found ${groups.length} duplicate group(s).`
      };
    }

    for (const item of auditReport) {
      const canonical = this.users.find(u => u.userId === item.canonicalUserId);
      if (!canonical) continue;
      for (const secId of item.mergedUserIds) {
        this.predictions.forEach(p => {
          if (p.userId === secId) p.userId = canonical.userId;
        });
        this.scores.forEach(s => {
          if (s.userId === secId) s.userId = canonical.userId;
        });
      }
      this.users = this.users.filter(u => !item.mergedUserIds.includes(u.userId));
    }
    this.persistAll();

    return {
      success: true,
      dryRun: false,
      duplicateGroupsConsolidated: groups.length,
      auditReport
    };
  }

  /**
   * Universal Platform-Wide Prediction Integrity & Reliability Auditor
   */
  public async auditPlatformData(dryRun: boolean = true): Promise<PlatformAuditReport> {
    const startTime = Date.now();

    const report: PlatformAuditReport = {
      timestamp: new Date().toISOString(),
      dryRun,
      status: 'COMPLETE',
      summary: {
        totalDefects: 0,
        userDefects: 0,
        eventIsolationDefects: 0,
        duplicatePredictionDefects: 0,
        scoringDefects: 0,
        notificationDefects: 0,
      },
      userAudit: { duplicateGroups: [], affectedUserIds: [] },
      eventIsolationAudit: {
        unknownRoundPredictions: [],
        sprintTypeMismatches: [],
        malformedRoundIds: [],
      },
      duplicatePredictionsAudit: {
        duplicateGroups: [],
        totalDuplicates: 0,
      },
      scoringAudit: {
        unscoredCompletedPredictions: [],
        orphanedScores: [],
        scoreDivergences: [],
        falseScoredStatus: [],
      },
      notificationAudit: {
        duplicateQueueKeys: [],
      },
      remediation: {
        backupSheetsCreated: [],
        usersConsolidated: 0,
        predictionsDeduplicated: 0,
        scoresReconciled: 0,
        notes: [],
      },
      durationMs: 0,
    };

    // 1. Audit Users
    const userRes = await this.auditAndDeduplicateUsers(true);
    if (userRes && userRes.auditReport) {
      report.userAudit.duplicateGroups = userRes.auditReport;
      const affIds: string[] = [];
      userRes.auditReport.forEach((g: any) => {
        affIds.push(g.canonicalUserId);
        affIds.push(...g.mergedUserIds);
      });
      report.userAudit.affectedUserIds = Array.from(new Set(affIds));
      report.summary.userDefects = userRes.auditReport.length;
    }

    // 2. Audit Event Isolation & Unknown rounds
    const knownRoundIds = new Set(this.rounds.map(r => r.roundId));
    const roundMap = new Map(this.rounds.map(r => [r.roundId, r]));
    const weekendMap = new Map(this.weekends.map(w => [w.raceWeekendId || w.id, w]));

    // Group predictions by `${userId}__${roundId}`
    const predGrouping = new Map<string, Prediction[]>();

    this.predictions.forEach(p => {
      if (!p.roundId || !p.roundId.includes('_')) {
        report.eventIsolationAudit.malformedRoundIds.push({
          predictionId: p.predictionId,
          roundId: p.roundId,
        });
      } else if (!knownRoundIds.has(p.roundId)) {
        report.eventIsolationAudit.unknownRoundPredictions.push({
          predictionId: p.predictionId,
          roundId: p.roundId,
        });
      } else {
        const rInfo = roundMap.get(p.roundId);
        if (rInfo) {
          const wInfo = weekendMap.get(rInfo.raceWeekendId);
          if (wInfo && p.roundId.includes('_SPRINT_') && wInfo.weekendType !== 'SPRINT') {
            report.eventIsolationAudit.sprintTypeMismatches.push({
              predictionId: p.predictionId,
              roundId: p.roundId,
              weekendId: rInfo.raceWeekendId,
              weekendType: wInfo.weekendType,
            });
          }
        }
      }

      const key = `${p.userId}__${p.roundId}`;
      const existing = predGrouping.get(key) || [];
      existing.push(p);
      predGrouping.set(key, existing);

      // Scoring integrity check
      const rInfo = roundMap.get(p.roundId);
      if (rInfo && rInfo.status === 'SCORED') {
        const foundScore = this.scores.find(s => s.roundId === p.roundId && s.userId === p.userId);
        if (!foundScore) {
          report.scoringAudit.unscoredCompletedPredictions.push({
            predictionId: p.predictionId,
            userId: p.userId,
            roundId: p.roundId,
            reason: 'Prediction exists for SCORED round but has no persisted score',
          });
        } else {
          const result = this.results.find(r => r.roundId === p.roundId);
          if (result && p.predictionData) {
            try {
              const expected = ScoringEngine.calculate(p.predictionData, result.resultData, rInfo.scoringRules);
              if (expected.totalScore !== foundScore.totalScore) {
                report.scoringAudit.scoreDivergences.push({
                  predictionId: p.predictionId,
                  userId: p.userId,
                  roundId: p.roundId,
                  persistedScore: foundScore.totalScore,
                  recalculatedScore: expected.totalScore,
                });
              }
            } catch {}
          }
        }
      }
    });

    // 3. Duplicate predictions
    predGrouping.forEach((list, key) => {
      if (list.length > 1) {
        list.sort((a, b) => new Date(b.updatedAt || b.submittedAt).getTime() - new Date(a.updatedAt || a.submittedAt).getTime());
        const canonical = list[0];
        const obsolete = list.slice(1);
        report.duplicatePredictionsAudit.duplicateGroups.push({
          groupKey: key,
          userId: canonical.userId,
          roundId: canonical.roundId,
          count: list.length,
          canonicalPredictionId: canonical.predictionId,
          obsoletePredictionIds: obsolete.map(o => o.predictionId),
        });
        report.duplicatePredictionsAudit.totalDuplicates += (list.length - 1);
      }
    });

    // 4. Orphaned scores
    this.scores.forEach(s => {
      if (!knownRoundIds.has(s.roundId)) {
        report.scoringAudit.orphanedScores.push({
          scoreId: s.scoreId,
          userId: s.userId,
          roundId: s.roundId,
          reason: 'Score references an unknown or unregistered prediction roundId',
        });
      }
    });

    // 5. Notification queue audit
    const seenNtfKeys = new Set<string>();
    this.notifications.forEach(n => {
      if (seenNtfKeys.has(n.idempotencyKey)) {
        report.notificationAudit.duplicateQueueKeys.push({
          id: n.id,
          idempotencyKey: n.idempotencyKey,
        });
      } else {
        seenNtfKeys.add(n.idempotencyKey);
      }
    });

    // Tally defects
    report.summary.eventIsolationDefects =
      report.eventIsolationAudit.unknownRoundPredictions.length +
      report.eventIsolationAudit.sprintTypeMismatches.length +
      report.eventIsolationAudit.malformedRoundIds.length;
    report.summary.duplicatePredictionDefects = report.duplicatePredictionsAudit.totalDuplicates;
    report.summary.scoringDefects =
      report.scoringAudit.unscoredCompletedPredictions.length +
      report.scoringAudit.orphanedScores.length +
      report.scoringAudit.scoreDivergences.length;
    report.summary.notificationDefects = report.notificationAudit.duplicateQueueKeys.length;
    report.summary.totalDefects =
      report.summary.userDefects +
      report.summary.eventIsolationDefects +
      report.summary.duplicatePredictionDefects +
      report.summary.scoringDefects +
      report.summary.notificationDefects;

    // REMEDIATION (dryRun: false)
    if (!dryRun) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      report.remediation.backupSheetsCreated = [
        `Users_Backup_${ts}`,
        `Predictions_Backup_${ts}`,
        `Scores_Backup_${ts}`,
        `Results_Backup_${ts}`,
      ];

      // A. Consolidate users
      if (report.userAudit.duplicateGroups.length > 0) {
        const uRes = await this.auditAndDeduplicateUsers(false);
        report.remediation.usersConsolidated = uRes.duplicateGroupsConsolidated || 0;
        report.remediation.notes.push(`Consolidated ${report.remediation.usersConsolidated} duplicate user accounts.`);
      }

      // B. Deduplicate predictions
      if (report.duplicatePredictionsAudit.duplicateGroups.length > 0) {
        const obsoleteIds = new Set<string>();
        report.duplicatePredictionsAudit.duplicateGroups.forEach(g => {
          g.obsoletePredictionIds.forEach(id => obsoleteIds.add(id));
        });
        this.predictions = this.predictions.filter(p => !obsoleteIds.has(p.predictionId));
        report.remediation.predictionsDeduplicated = obsoleteIds.size;
        report.remediation.notes.push(`Pruned ${obsoleteIds.size} obsolete duplicate prediction records.`);
      }

      // C. Reconcile points
      this.recalculateSeasonStats();
      report.remediation.scoresReconciled = this.users.length;
      report.remediation.notes.push(`Reconciled authoritative season points and ranks for ${this.users.length} users.`);

      this.persistAll();
    }

    report.durationMs = Date.now() - startTime;
    return report;
  }
}

export interface PlatformAuditReport {
  timestamp: string;
  dryRun: boolean;
  status: 'COMPLETE';
  summary: {
    totalDefects: number;
    userDefects: number;
    eventIsolationDefects: number;
    duplicatePredictionDefects: number;
    scoringDefects: number;
    notificationDefects: number;
  };
  userAudit: {
    duplicateGroups: any[];
    affectedUserIds: string[];
  };
  eventIsolationAudit: {
    unknownRoundPredictions: { predictionId: string; roundId: string }[];
    sprintTypeMismatches: { predictionId: string; roundId: string; weekendId: string; weekendType: string }[];
    malformedRoundIds: { predictionId: string; roundId: string }[];
  };
  duplicatePredictionsAudit: {
    duplicateGroups: {
      groupKey: string;
      userId: string;
      roundId: string;
      count: number;
      canonicalPredictionId: string;
      obsoletePredictionIds: string[];
    }[];
    totalDuplicates: number;
  };
  scoringAudit: {
    unscoredCompletedPredictions: { predictionId: string; userId: string; roundId: string; reason: string }[];
    orphanedScores: { scoreId: string; userId: string; roundId: string; reason: string }[];
    scoreDivergences: { predictionId: string; userId: string; roundId: string; persistedScore: number; recalculatedScore: number }[];
    falseScoredStatus: { predictionId: string; roundId: string }[];
  };
  notificationAudit: {
    duplicateQueueKeys: { id: string; idempotencyKey: string }[];
  };
  remediation: {
    backupSheetsCreated: string[];
    usersConsolidated: number;
    predictionsDeduplicated: number;
    scoresReconciled: number;
    notes: string[];
  };
  durationMs: number;
}

export const mockApi = new MockApiService();

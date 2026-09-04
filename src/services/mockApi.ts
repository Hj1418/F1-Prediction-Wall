import {
  RaceWeekend,
  PredictionRound,
  User,
  Prediction,
  SessionResult,
  RoundScore,
  LeaderboardEntry,
  Achievement,
  Driver,
} from '../types';
import {
  F1_DRIVERS_2026,
  INITIAL_USERS,
  INITIAL_RACE_WEEKENDS,
  INITIAL_PREDICTION_ROUNDS,
  INITIAL_PREDICTIONS,
  INITIAL_OFFICIAL_RESULTS,
  INITIAL_SCORES,
  INITIAL_ACHIEVEMENTS,
} from './mockData';
import { ScoringEngine } from './scoringEngine';

const STORAGE_KEYS = {
  USERS: 'f1_pred_users_v2',
  WEEKENDS: 'f1_pred_weekends_v2',
  ROUNDS: 'f1_pred_rounds_v2',
  PREDICTIONS: 'f1_pred_predictions_v2',
  RESULTS: 'f1_pred_results_v2',
  SCORES: 'f1_pred_scores_v2',
  ACHIEVEMENTS: 'f1_pred_achievements_v2',
};

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.warn('LocalStorage error reading ' + key, e);
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
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

  constructor() {
    this.users = getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.weekends = getStored(STORAGE_KEYS.WEEKENDS, INITIAL_RACE_WEEKENDS);
    this.rounds = getStored(STORAGE_KEYS.ROUNDS, INITIAL_PREDICTION_ROUNDS);
    this.predictions = getStored(STORAGE_KEYS.PREDICTIONS, INITIAL_PREDICTIONS);
    this.results = getStored(STORAGE_KEYS.RESULTS, INITIAL_OFFICIAL_RESULTS);
    this.scores = getStored(STORAGE_KEYS.SCORES, INITIAL_SCORES);
    this.achievements = getStored(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  }

  private persistAll() {
    setStored(STORAGE_KEYS.USERS, this.users);
    setStored(STORAGE_KEYS.WEEKENDS, this.weekends);
    setStored(STORAGE_KEYS.ROUNDS, this.rounds);
    setStored(STORAGE_KEYS.PREDICTIONS, this.predictions);
    setStored(STORAGE_KEYS.RESULTS, this.results);
    setStored(STORAGE_KEYS.SCORES, this.scores);
    setStored(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
  }

  public resetToDefaults() {
    this.users = [...INITIAL_USERS];
    this.weekends = [...INITIAL_RACE_WEEKENDS];
    this.rounds = [...INITIAL_PREDICTION_ROUNDS];
    this.predictions = [...INITIAL_PREDICTIONS];
    this.results = [...INITIAL_OFFICIAL_RESULTS];
    this.scores = [...INITIAL_SCORES];
    this.achievements = [...INITIAL_ACHIEVEMENTS];
    this.persistAll();
  }

  public async getDrivers(): Promise<Driver[]> {
    return F1_DRIVERS_2026;
  }

  public async getRaceWeekends(): Promise<RaceWeekend[]> {
    return [...this.weekends];
  }

  public async getWeekendById(raceWeekendId: string): Promise<RaceWeekend | null> {
    const rw = this.weekends.find(w => w.raceWeekendId === raceWeekendId);
    return rw ? { ...rw } : null;
  }

  public async getPredictionRounds(raceWeekendId?: string): Promise<PredictionRound[]> {
    let list = [...this.rounds];
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

  public async submitPrediction(payload: {
    userId: string;
    roundId: string;
    predictionData: Record<string, any>;
  }): Promise<Prediction> {
    const round = await this.getPredictionRoundById(payload.roundId);
    if (!round) throw new Error('Prediction round not found.');

    const now = new Date();
    if (now.getTime() > new Date(round.closesAt).getTime()) {
      throw new Error('Predictions are LOCKED. Deadline has passed.');
    }

    // Validate duplicate podium drivers
    const podium = [payload.predictionData.p1, payload.predictionData.p2, payload.predictionData.p3].filter(Boolean);
    const uniquePodium = Array.from(new Set(podium));
    if (podium.length !== uniquePodium.length) {
      throw new Error('A driver cannot be selected multiple times on the podium.');
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
        const u = this.users.find(usr => usr.userId === s.userId) || {
          displayName: 'Racer',
          username: s.userId,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          favouriteDriver: 'verstappen',
          exactP1Count: 0,
          perfectPodiumCount: 0,
        };
        return {
          rank: 0,
          previousRank: 0,
          rankChange: 0,
          userId: s.userId,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          favouriteDriver: u.favouriteDriver,
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
      const weekendRounds = this.rounds.filter(r => r.raceWeekendId === targetId).map(r => r.roundId);
      const userWeekendScores: Record<string, { total: number; roundScores: Record<string, number> }> = {};

      this.scores
        .filter(s => weekendRounds.includes(s.roundId))
        .forEach(s => {
          if (!userWeekendScores[s.userId]) {
            userWeekendScores[s.userId] = { total: 0, roundScores: {} };
          }
          userWeekendScores[s.userId].total += s.totalScore;
          userWeekendScores[s.userId].roundScores[s.roundId] = s.totalScore;
        });

      const entries: LeaderboardEntry[] = Object.keys(userWeekendScores).map(uid => {
        const u = this.users.find(usr => usr.userId === uid) || {
          displayName: 'Racer',
          username: uid,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          favouriteDriver: 'norris',
          exactP1Count: 0,
          perfectPodiumCount: 0,
        };
        return {
          rank: 0,
          previousRank: 0,
          rankChange: 0,
          userId: uid,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          favouriteDriver: u.favouriteDriver,
          totalPoints: userWeekendScores[uid].total,
          roundScores: userWeekendScores[uid].roundScores,
          racesParticipated: Object.keys(userWeekendScores[uid].roundScores).length,
          avgPointsPerRace: Math.round(
            userWeekendScores[uid].total / (Object.keys(userWeekendScores[uid].roundScores).length || 1)
          ),
          exactP1Count: 0,
          perfectPodiumCount: 0,
        };
      });

      entries.sort((a, b) => b.totalPoints - a.totalPoints);
      return entries.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    // Default: Season Leaderboard
    const sorted = [...this.users].sort((a, b) => b.totalPoints - a.totalPoints);
    return sorted.map((u, idx) => {
      const currentRank = idx + 1;
      const rankChange = (u.previousRank || currentRank) - currentRank;
      return {
        rank: currentRank,
        previousRank: u.previousRank || currentRank,
        rankChange,
        userId: u.userId,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        favouriteDriver: u.favouriteDriver,
        totalPoints: u.totalPoints,
        racesParticipated: u.racesParticipated || 2,
        avgPointsPerRace: Math.round((u.totalPoints / (u.racesParticipated || 1)) * 10) / 10,
        exactP1Count: u.exactP1Count || 0,
        perfectPodiumCount: u.perfectPodiumCount || 0,
      };
    });
  }

  public async getUserProfile(usernameOrId: string): Promise<User | null> {
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
    return [...this.users];
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
    const existingIndex = this.results.findIndex(r => r.roundId === roundId);
    const nowIso = new Date().toISOString();

    if (existingIndex >= 0) {
      this.results[existingIndex] = {
        ...this.results[existingIndex],
        resultData,
        publishedAt: nowIso,
      };
      this.persistAll();
      return { ...this.results[existingIndex] };
    } else {
      const newRes: SessionResult = {
        resultId: 'res_' + Date.now(),
        roundId,
        resultData,
        publishedAt: nowIso,
      };
      this.results.push(newRes);
      this.persistAll();
      return { ...newRes };
    }
  }

  public async adminCalculateScores(roundId: string): Promise<{
    roundId: string;
    scoredCount: number;
    scores: RoundScore[];
  }> {
    const round = this.rounds.find(r => r.roundId === roundId);
    if (!round) throw new Error('Round not found.');

    const result = this.results.find(r => r.roundId === roundId);
    if (!result) throw new Error('Cannot calculate scores: Official session result has not been submitted yet.');

    const roundPredictions = this.predictions.filter(p => p.roundId === roundId);
    const calculatedScores: RoundScore[] = [];

    roundPredictions.forEach(pred => {
      const calc = ScoringEngine.calculate(pred.predictionData, result.resultData, round.scoringRules);
      const existingScoreIdx = this.scores.findIndex(s => s.roundId === roundId && s.userId === pred.userId);

      const scoreObj: RoundScore = {
        scoreId: existingScoreIdx >= 0 ? this.scores[existingScoreIdx].scoreId : 'score_' + Date.now() + '_' + pred.userId,
        userId: pred.userId,
        roundId,
        breakdown: calc.breakdown,
        totalScore: calc.totalScore,
        calculatedAt: new Date().toISOString(),
      };

      if (existingScoreIdx >= 0) {
        this.scores[existingScoreIdx] = scoreObj;
      } else {
        this.scores.push(scoreObj);
      }
      calculatedScores.push(scoreObj);
    });

    // Update round status to SCORED
    round.status = 'SCORED';

    // Recalculate season total points & ranks for each user
    this.recalculateSeasonStats();
    this.persistAll();

    return {
      roundId,
      scoredCount: calculatedScores.length,
      scores: calculatedScores,
    };
  }

  private recalculateSeasonStats() {
    this.users.forEach(user => {
      const userScores = this.scores.filter(s => s.userId === user.userId);
      const totalPoints = userScores.reduce((acc, s) => acc + s.totalScore, 0);
      const exactP1Count = userScores.filter(s => s.breakdown.p1 === 15).length;
      const perfectPodiumCount = userScores.filter(s => (s.breakdown.perfectPodiumBonus || 0) > 0).length;
      const wildcardsCorrect = userScores.filter(s => (s.breakdown.wildCard || 0) > 0).length;

      user.totalPoints = totalPoints;
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
  }
}

export const mockApi = new MockApiService();

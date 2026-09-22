import { RaceWeekend, PredictionRound, Driver, Prediction, RoundScore, LeaderboardEntry, ScoringRules } from '../../types';
import { ScoringEngine } from '../scoringEngine';

export interface TestNotification {
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

export interface TestGrandPrixState {
  environment: 'TEST';
  weekend: RaceWeekend | null;
  round: PredictionRound | null;
  predictions: Record<string, Prediction>;
  officialResult: {
    resultId: string;
    roundId: string;
    status: 'OFFICIAL' | 'AMENDED';
    resultData: Record<string, any>;
    enteredAt: string;
    updatedAt: string;
  } | null;
  scores: Record<string, RoundScore>;
  leaderboard: LeaderboardEntry[];
  notifications: TestNotification[];
  notificationLog: Array<{ id: string; idempotencyKey: string; sentAt: string; status: string }>;
}

export const TEST_GP_ID = 'TEST_GP_001';
export const TEST_ROUND_ID = 'TEST_GP_001_RACE';
const STORAGE_KEY = 'f1_test_grand_prix_state';

export const TEST_DRIVERS: Driver[] = [
  {
    id: 'test-alpha',
    code: 'TDA',
    firstName: 'Test Driver',
    lastName: 'Alpha',
    number: 101,
    team: 'Test Racing Alpha',
    teamColor: '#e10600',
    country: 'Testland',
    countryFlag: '🏁',
  },
  {
    id: 'test-bravo',
    code: 'TDB',
    firstName: 'Test Driver',
    lastName: 'Bravo',
    number: 102,
    team: 'Test Racing Bravo',
    teamColor: '#00d2ff',
    country: 'Testland',
    countryFlag: '🏁',
  },
  {
    id: 'test-charlie',
    code: 'TDC',
    firstName: 'Test Driver',
    lastName: 'Charlie',
    number: 103,
    team: 'Test Racing Charlie',
    teamColor: '#00e676',
    country: 'Testland',
    countryFlag: '🏁',
  },
  {
    id: 'test-delta',
    code: 'TDD',
    firstName: 'Test Driver',
    lastName: 'Delta',
    number: 104,
    team: 'Test Racing Delta',
    teamColor: '#ffb800',
    country: 'Testland',
    countryFlag: '🏁',
  },
  {
    id: 'test-echo',
    code: 'TDE',
    firstName: 'Test Driver',
    lastName: 'Echo',
    number: 105,
    team: 'Test Racing Echo',
    teamColor: '#b966ff',
    country: 'Testland',
    countryFlag: '🏁',
  },
];

const DEFAULT_TEST_SCORING_RULES: ScoringRules = {
  exactP1: 15,
  exactP2: 10,
  exactP3: 10,
  podiumWrongPosition: 5,
  fastestLap: 10,
  driverOfTheDay: 10,
  wildCard: 15,
  safetyCar: 10,
  virtualSafetyCar: 10,
  redFlag: 10,
  yellowFlag: 10,
  retirementsOverUnder: 10,
  lap1Leader: 10,
  winningMargin: 10,
  rainSession: 10,
  poleMargin: 10,
  q1Elimination: 10,
  sprintDnf: 10,
  perfectPodiumBonus: 10,
};

class TestGrandPrixService {
  private state: TestGrandPrixState;

  constructor() {
    this.state = this.loadState();
  }

  private getInitialState(): TestGrandPrixState {
    return {
      environment: 'TEST',
      weekend: null,
      round: null,
      predictions: {},
      officialResult: null,
      scores: {},
      leaderboard: [],
      notifications: [],
      notificationLog: [],
    };
  }

  private loadState(): TestGrandPrixState {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.environment === 'TEST') {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to load test Grand Prix state:', err);
      }
    }
    return this.getInitialState();
  }

  private persistState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.warn('Failed to persist test Grand Prix state:', err);
      }
    }
  }

  public getState(): TestGrandPrixState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getTestDrivers(): Driver[] {
    return [...TEST_DRIVERS];
  }

  public createTestGrandPrix(isAdmin: boolean): RaceWeekend {
    if (!isAdmin) {
      throw new Error('Admin authorization required to create End-to-End Test Grand Prix.');
    }

    const now = new Date();
    const weekend: RaceWeekend = {
      raceWeekendId: TEST_GP_ID,
      season: 2026,
      roundNumber: 99,
      raceName: 'The Grid Test Grand Prix',
      country: 'Testland',
      circuit: {
        id: 'test-circuit-alpha',
        name: 'The Grid Test Circuit Alpha',
        country: 'Testland',
        locality: 'Testville',
      },
      startDate: now.toISOString(),
      endDate: new Date(now.getTime() + 86400000 * 3).toISOString(),
      weekendType: 'NORMAL',
      status: 'UPCOMING',
      flag: '🏁',
      sessions: [
        {
          sessionId: 'test_session_fp1',
          raceWeekendId: TEST_GP_ID,
          name: 'Practice 1',
          type: 'FP1',
          startTime: now.toISOString(),
          endTime: new Date(now.getTime() + 3600000).toISOString(),
          status: 'COMPLETED',
        },
        {
          sessionId: 'test_session_race',
          raceWeekendId: TEST_GP_ID,
          name: 'Grand Prix Race',
          type: 'RACE',
          startTime: new Date(now.getTime() + 86400000 * 2).toISOString(),
          endTime: new Date(now.getTime() + 86400000 * 2 + 7200000).toISOString(),
          status: 'UPCOMING',
        },
      ],
    };

    const round: PredictionRound = {
      roundId: TEST_ROUND_ID,
      raceWeekendId: TEST_GP_ID,
      sessionId: 'test_session_race',
      roundType: 'RACE',
      title: 'The Grid Test Grand Prix Race Prediction',
      description: 'Isolated test round for end-to-end verification of prediction, lock, emails, and scoring.',
      opensAt: now.toISOString(),
      closesAt: new Date(now.getTime() + 86400000).toISOString(),
      status: 'UPCOMING',
      scoringRules: DEFAULT_TEST_SCORING_RULES,
      predictionFields: [
        { id: 'p1', label: 'Race Winner (P1)', type: 'driver', required: true },
        { id: 'p2', label: 'Second Place (P2)', type: 'driver', required: true },
        { id: 'p3', label: 'Third Place (P3)', type: 'driver', required: true },
        { id: 'fastestLap', label: 'Fastest Lap', type: 'driver', required: true },
        {
          id: 'safetyCar',
          label: 'Safety Car Deployed?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Physical Bernd Mayländer Safety Car deployed',
          options: [
            { value: 'YES', label: 'Yes — Safety Car deployed' },
            { value: 'NO', label: 'No — No physical Safety Car' },
          ],
        },
        {
          id: 'virtualSafetyCar',
          label: 'Virtual Safety Car (VSC)?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Virtual Safety Car speed restriction deployed',
          options: [
            { value: 'YES', label: 'Yes — VSC deployed' },
            { value: 'NO', label: 'No — No VSC period' },
          ],
        },
        {
          id: 'redFlag',
          label: 'Red Flag Stoppage?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Race officially suspended with red flags',
          options: [
            { value: 'YES', label: 'Yes — Race red-flagged' },
            { value: 'NO', label: 'No — No red flag stoppage' },
          ],
        },
        {
          id: 'yellowFlag',
          label: 'Yellow Flag Caution?',
          type: 'option',
          required: false,
          helperText: '+10 PTS • Yellow flag waved during session',
          options: [
            { value: 'YES', label: 'Yes — Yellow flag waved' },
            { value: 'NO', label: 'No — Clean green flag session' },
          ],
        },
        { id: 'driverOfTheDay', label: 'Driver of the Day', type: 'driver', required: false },
      ],
    };

    this.state.weekend = weekend;
    this.state.round = round;
    this.persistState();

    return weekend;
  }

  public openTestPrediction(isAdmin: boolean, registeredUsers?: Array<{ userId: string; email: string; name: string }>): PredictionRound {
    if (!isAdmin) {
      throw new Error('Admin authorization required to open Test Grand Prix prediction.');
    }
    if (!this.state.round) {
      throw new Error('Test Grand Prix round has not been initialized.');
    }

    this.state.round.status = 'OPEN';

    // Queue prediction-open notification idempotently for registered or sample user
    const users = registeredUsers && registeredUsers.length > 0 ? registeredUsers : [
      { userId: 'admin_test_user', email: 'admin@thegrid.test', name: 'Test Administrator' },
    ];

    users.forEach(u => {
      this.enqueueNotification(
        u.email,
        u.name,
        'PREDICTION_OPEN',
        `Predictions Open: ${this.state.weekend?.raceName || 'The Grid Test Grand Prix'}`,
        {
          userId: u.userId,
          raceId: TEST_GP_ID,
          raceName: this.state.weekend?.raceName,
          roundId: TEST_ROUND_ID,
          deadline: this.state.round?.closesAt,
        },
        `PRED_OPEN_${TEST_GP_ID}_${u.userId}`
      );
    });

    this.persistState();
    return this.state.round;
  }

  public submitTestPrediction(
    userId: string,
    userDisplayName: string,
    userEmail: string,
    predictionData: Record<string, any>
  ): Prediction {
    if (!this.state.round) {
      throw new Error('Test Grand Prix round not found.');
    }
    if (this.state.round.status !== 'OPEN') {
      throw new Error(`Test predictions are currently ${this.state.round.status}. Submission rejected.`);
    }

    // Validate driver IDs against test roster
    const validDriverIds = new Set(TEST_DRIVERS.map(d => d.id));
    const driverKeys = ['p1', 'p2', 'p3', 'fastestLap', 'driverOfTheDay'];
    for (const k of driverKeys) {
      const val = predictionData[k];
      if (val && !validDriverIds.has(val)) {
        throw new Error(`Invalid test driver "${val}" for ${k}. Must be one of: ${TEST_DRIVERS.map(d => d.id).join(', ')}`);
      }
    }

    // Validate podium distinctness
    const podiumPicks = [predictionData.p1, predictionData.p2, predictionData.p3].filter(Boolean);
    if (new Set(podiumPicks).size !== podiumPicks.length) {
      throw new Error('A test driver cannot be selected more than once across podium positions (P1, P2, P3).');
    }

    const nowIso = new Date().toISOString();
    const existing = this.state.predictions[userId];
    const prediction: Prediction = {
      predictionId: existing ? existing.predictionId : `pred_test_${Date.now()}_${userId}`,
      userId,
      roundId: TEST_ROUND_ID,
      predictionData: { ...predictionData },
      submittedAt: existing ? existing.submittedAt : nowIso,
      updatedAt: nowIso,
    };

    this.state.predictions[userId] = prediction;

    // Enqueue submission confirmation notification idempotently
    this.enqueueNotification(
      userEmail,
      userDisplayName,
      'PREDICTION_CONFIRMATION',
      `Locked Prediction: ${this.state.weekend?.raceName || 'The Grid Test Grand Prix'}`,
      {
        userId,
        raceId: TEST_GP_ID,
        raceName: this.state.weekend?.raceName,
        roundId: TEST_ROUND_ID,
        predictionData,
        lockedAt: nowIso,
      },
      `PRED_SUBMIT_${TEST_GP_ID}_${userId}`
    );

    this.persistState();
    return prediction;
  }

  public getTestPrediction(userId: string): Prediction | null {
    return this.state.predictions[userId] || null;
  }

  public enterTestResult(
    isAdmin: boolean,
    resultData: Record<string, any>,
    isAmended: boolean = false
  ): TestGrandPrixState['officialResult'] {
    if (!isAdmin) {
      throw new Error('Admin authorization required to enter Test Grand Prix results.');
    }
    if (!this.state.round) {
      throw new Error('Test Grand Prix round not found.');
    }

    const nowIso = new Date().toISOString();
    const resultObj = {
      resultId: `res_${TEST_ROUND_ID}_${isAmended ? 'amended' : 'official'}`,
      roundId: TEST_ROUND_ID,
      status: (isAmended ? 'AMENDED' : 'OFFICIAL') as 'OFFICIAL' | 'AMENDED',
      resultData: { ...resultData },
      enteredAt: this.state.officialResult?.enteredAt || nowIso,
      updatedAt: nowIso,
    };

    this.state.officialResult = resultObj;
    this.state.round.status = 'LOCKED';

    this.persistState();
    return resultObj;
  }

  public runTestScoring(isAdmin: boolean): Record<string, RoundScore> {
    if (!isAdmin) {
      throw new Error('Admin authorization required to run test scoring.');
    }
    if (!this.state.round || !this.state.officialResult) {
      throw new Error('Cannot run scoring: test round or official result is missing.');
    }

    const round = this.state.round;
    const result = this.state.officialResult;

    // Calculate score for each test prediction using the real scoringEngine
    const updatedScores: Record<string, RoundScore> = {};

    Object.entries(this.state.predictions).forEach(([uid, pred]) => {
      const scoringResult = ScoringEngine.calculate(pred.predictionData, result.resultData, round.scoringRules);
      const scoreObj: RoundScore = {
        scoreId: `score_${TEST_ROUND_ID}_${uid}`,
        userId: uid,
        roundId: TEST_ROUND_ID,
        breakdown: scoringResult.breakdown,
        totalScore: scoringResult.totalScore,
        calculatedAt: new Date().toISOString(),
      };

      updatedScores[uid] = scoreObj;
      this.state.scores[uid] = scoreObj;

      // Find user recipient email from prediction notification or fallback
      const prevSubmitNote = this.state.notifications.find(
        n => n.notificationType === 'PREDICTION_CONFIRMATION' && n.idempotencyKey === `PRED_SUBMIT_${TEST_GP_ID}_${uid}`
      );
      const recipientEmail = prevSubmitNote?.recipientEmail || `user_${uid}@thegrid.test`;
      const recipientName = prevSubmitNote?.recipientName || `Racer ${uid}`;

      // Queue result notification with deterministic idempotency key
      this.enqueueNotification(
        recipientEmail,
        recipientName,
        'PREDICTION_RESULT',
        `Official Result & Scorecard: ${this.state.weekend?.raceName || 'The Grid Test Grand Prix'}`,
        {
          userId: uid,
          raceId: TEST_GP_ID,
          raceName: this.state.weekend?.raceName,
          roundId: TEST_ROUND_ID,
          totalScore: scoreObj.totalScore,
          breakdown: scoreObj.breakdown,
        },
        `RESULT_${TEST_GP_ID}_${uid}`
      );
    });

    this.state.round.status = 'SCORED';

    // Build isolated test leaderboard
    this.rebuildTestLeaderboard();
    this.persistState();

    return updatedScores;
  }

  public amendTestResult(isAdmin: boolean, amendedResultData: Record<string, any>): Record<string, RoundScore> {
    this.enterTestResult(isAdmin, amendedResultData, true);
    return this.runTestScoring(isAdmin);
  }

  private rebuildTestLeaderboard(): void {
    const entries: LeaderboardEntry[] = Object.entries(this.state.scores).map(([uid, score]) => {
      return {
        rank: 0,
        previousRank: 0,
        rankChange: 0,
        userId: uid,
        username: uid,
        displayName: uid.toUpperCase(),
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        totalPoints: score.totalScore,
        racesParticipated: 1,
        avgPointsPerRace: score.totalScore,
        exactP1Count: score.breakdown.p1 === 15 ? 1 : 0,
        perfectPodiumCount: (score.breakdown.perfectPodiumBonus || 0) > 0 ? 1 : 0,
      };
    });

    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    this.state.leaderboard = entries.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  public getTestLeaderboard(): LeaderboardEntry[] {
    return [...this.state.leaderboard];
  }

  public getScoreBreakdown(userId: string): RoundScore | null {
    return this.state.scores[userId] || null;
  }

  // --- Isolated Notification Queue & Delivery Worker ---
  public enqueueNotification(
    recipientEmail: string,
    recipientName: string,
    notificationType: TestNotification['notificationType'],
    subject: string,
    templateData: Record<string, any>,
    idempotencyKey: string
  ): TestNotification {
    // Check if already in queue or already sent in log
    const existingQueue = this.state.notifications.find(n => n.idempotencyKey === idempotencyKey);
    if (existingQueue) {
      return existingQueue;
    }

    const existingLog = this.state.notificationLog.find(l => l.idempotencyKey === idempotencyKey);
    if (existingLog) {
      return {
        id: existingLog.id,
        recipientEmail,
        recipientName,
        notificationType,
        subject,
        templateData,
        status: 'SENT',
        idempotencyKey,
        attempts: 1,
        queuedAt: existingLog.sentAt,
        sentAt: existingLog.sentAt,
      };
    }

    const newNotification: TestNotification = {
      id: `note_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipientEmail,
      recipientName,
      notificationType,
      subject,
      templateData,
      status: 'PENDING',
      idempotencyKey,
      attempts: 0,
      queuedAt: new Date().toISOString(),
    };

    this.state.notifications.push(newNotification);
    this.persistState();
    return newNotification;
  }

  public processNotificationQueue(simulateFailures = false): { processed: number; sent: number; failed: number } {
    let sent = 0;
    let failed = 0;

    for (const note of this.state.notifications) {
      if (note.status === 'SENT') continue;

      note.attempts += 1;
      if (simulateFailures && note.attempts === 1) {
        note.status = 'FAILED';
        note.errorMessage = 'Simulated SMTP connection error (isolated retry test)';
        failed++;
      } else {
        note.status = 'SENT';
        note.sentAt = new Date().toISOString();
        note.errorMessage = undefined;
        this.state.notificationLog.push({
          id: note.id,
          idempotencyKey: note.idempotencyKey,
          sentAt: note.sentAt,
          status: 'DELIVERED',
        });
        sent++;
      }
    }

    this.persistState();
    return { processed: sent + failed, sent, failed };
  }

  public resetTestGrandPrix(isAdmin: boolean): void {
    if (!isAdmin) {
      throw new Error('Admin authorization required to reset Test Grand Prix.');
    }

    this.state = this.getInitialState();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Failed to clear test Grand Prix state:', err);
      }
    }
  }
}

export const testGrandPrixService = new TestGrandPrixService();

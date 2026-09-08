export type WeekendType = 'NORMAL' | 'SPRINT';

export type RoundType = 'QUALIFYING' | 'SPRINT_QUALIFYING' | 'SPRINT' | 'GRAND_PRIX' | 'RACE';

export type RoundStatus = 'UPCOMING' | 'OPEN' | 'LOCKED' | 'COMPLETED' | 'SCORED';

export type SessionType =
  | 'FP1'
  | 'FP2'
  | 'FP3'
  | 'QUALIFYING'
  | 'SPRINT_QUALIFYING'
  | 'SPRINT'
  | 'GRAND_PRIX'
  | 'RACE';

export type UserRole = 'user' | 'admin';

export interface Constructor {
  id: string;
  name: string;
  color: string;
  textColor?: string;
  country: string;
  flag: string;
  powerUnit?: string;
}

export interface TrackCharacteristic {
  label: string;
  value: number;
  max?: number;
  description?: string;
}

export interface CircuitInsight {
  category: 'TRACK CHARACTER' | 'HISTORY' | 'TECHNICAL' | 'RECORD' | 'UNIQUE FEATURE' | 'STATISTIC' | 'SPEED';
  title: string;
  description: string;
}

export interface TrackCharacterSimple {
  speed: string; // e.g. "Very High"
  braking: string; // e.g. "Heavy"
  overtaking: string; // e.g. "High"
  tyreWear: string; // e.g. "Medium"
}

export interface CircuitFact {
  category: 'HISTORY' | 'SPEED' | 'RECORD' | 'CRAZY FACT' | 'TECHNICAL';
  title: string;
  description: string;
}

export interface CircuitMetadata {
  circuitId: string;
  id?: string;
  name: string;
  locality: string;
  location?: string;
  country: string;
  flag: string;
  lengthKm: number;
  length?: number;
  turns: number;
  drsZones: number;
  laps?: number;
  raceDistance?: string;
  firstGrandPrix?: number;
  lapRecord?: {
    time: string;
    driver: string;
    year: number;
  };
  trackCharacter?: TrackCharacterSimple;
  facts?: CircuitFact[];
  map?: string | { asset: string };
  characteristics?: TrackCharacteristic[];
  insights?: CircuitInsight[];
  whySpecial?: string;
  keyCorners?: Array<{ number: number | string; name: string; description: string }>;
  overtakingCharacteristics?: string;
  officialCircuitUrl?: string;
  svgPath?: string;
  viewBox?: string;
}

export interface Driver {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  number: number;
  team: string;
  teamColor: string;
  teamTextColor?: string;
  country: string;
  countryFlag: string;
  avatar?: string;
}

export interface User {
  userId: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  favouriteDriver: string;
  favouriteConstructor?: string;
  bio?: string;
  passwordHash?: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
  totalPoints: number;
  seasonRank: number;
  previousRank: number;
  racesParticipated: number;
  bestWeekendScore: number;
  exactP1Count: number;
  perfectPodiumCount: number;
  wildcardsCorrect: number;
}

export interface CircuitInfo {
  id: string;
  name: string;
  locality?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export function getCircuitName(circuit?: CircuitInfo | string): string {
  if (!circuit) return '';
  return typeof circuit === 'string' ? circuit : circuit.name;
}

export interface Session {
  id?: string;
  sessionId?: string; // backwards compatibility alias
  raceWeekendId: string;
  type?: SessionType;
  sessionType?: SessionType; // backwards compatibility alias
  name: string;
  startTime: string; // ISO 8601 UTC string
  endTime?: string;   // ISO 8601 UTC string
  status: 'UPCOMING' | 'ONGOING' | 'LIVE' | 'COMPLETED';
  externalProvider?: string;
  externalId?: string;
  lastSyncedAt?: string;
}

export interface RaceWeekend {
  id?: string;
  raceWeekendId: string; // backwards compatibility alias
  season: number;
  round?: number;
  roundNumber: number;   // backwards compatibility alias
  name?: string;
  raceName: string;      // backwards compatibility alias
  country: string;
  circuit: CircuitInfo | string;
  flag: string;
  weekendType: WeekendType;
  startDate: string; // ISO UTC
  endDate: string;   // ISO UTC
  status: 'UPCOMING' | 'ONGOING' | 'ACTIVE' | 'COMPLETED';
  circuitLengthKm?: number;
  laps?: number;
  sessions?: Session[];
  externalProvider?: string;
  externalId?: string;
  lastSyncedAt?: string;
}

export interface PredictionFieldOption {
  value: string;
  label: string;
}

export interface PredictionFieldConfig {
  id: string;
  label: string;
  type: 'driver' | 'option' | 'boolean' | 'text';
  required: boolean;
  options?: PredictionFieldOption[];
  helperText?: string;
  placeholder?: string;
}

export interface ScoringRules {
  exactP1: number;
  exactP2: number;
  exactP3: number;
  podiumWrongPosition: number;
  fastestLap: number;
  driverOfTheDay: number;
  wildCard: number;
  perfectPodiumBonus: number;
  [key: string]: number;
}

export interface PredictionRound {
  id?: string;
  roundId: string;
  raceWeekendId: string;
  sessionId: string;
  type?: RoundType;
  roundType: RoundType;
  title: string;
  description: string;
  opensAt: string;  // ISO UTC
  closesAt: string; // ISO UTC
  status: RoundStatus;
  predictionFields: PredictionFieldConfig[];
  scoringRules: ScoringRules;
  lastUpdatedAt?: string;
  lastSyncedAt?: string;
}

export interface Prediction {
  predictionId: string;
  userId: string;
  roundId: string;
  predictionData: Record<string, any>;
  submittedAt: string;
  updatedAt: string;
  lockedAt?: string;
}

export interface SessionResult {
  resultId: string;
  roundId: string;
  resultData: Record<string, any>;
  publishedAt: string;
}

export interface ScoreBreakdown {
  p1?: number;
  p2?: number;
  p3?: number;
  fastestLap?: number;
  driverOfTheDay?: number;
  wildCard?: number;
  perfectPodiumBonus?: number;
  [key: string]: number | undefined;
}

export interface RoundScore {
  scoreId: string;
  userId: string;
  roundId: string;
  breakdown: ScoreBreakdown;
  totalScore: number;
  calculatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  rankChange: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  favouriteDriver?: string;
  totalPoints: number;
  racesParticipated: number;
  avgPointsPerRace: number;
  exactP1Count: number;
  perfectPodiumCount: number;
  roundScores?: Record<string, number>;
}

export interface Achievement {
  achievementId: string;
  userId: string;
  achievementType: 'BULLSEYE' | 'STRATEGY_MASTER' | 'ON_FIRE' | 'CONSISTENCY_KING' | 'FERRARI_STRATEGIST' | 'PODIUM_PRO';
  title: string;
  description: string;
  badgeIcon: string;
  earnedAt: string;
}

export interface SyncLog {
  logId: string;
  timestamp: string;
  entityType: 'RACE_WEEKEND' | 'SESSION' | 'PREDICTION_ROUND' | 'CALENDAR';
  entityId: string;
  action: 'CREATED' | 'UPDATED' | 'NO_CHANGE' | 'ERROR';
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

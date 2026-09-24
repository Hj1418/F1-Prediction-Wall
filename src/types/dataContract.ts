/**
 * The Grid — Core Normalized Data Contracts
 * 
 * Defines the foundational entities, provenance metadata, authority tiers,
 * and discipline-specific extensions for all motorsport data on The Grid.
 */

// ============================================================================
// 1. Source Provenance & Authority
// ============================================================================

export type SourceAuthorityLevel =
  | 'OFFICIAL'            // Governing bodies / official commercial rights holders (e.g. FIA, FOM)
  | 'PRIMARY_OPEN_DATA'   // Actively maintained structured datasets with verified APIs (e.g. Jolpica-F1)
  | 'SECONDARY_OPEN_DATA' // Open datasets with open licenses (e.g. F1DB / CC0)
  | 'COMMUNITY'           // Verified community contributions
  | 'REFERENCE_ONLY';     // Editorial citations and educational reference links

export interface SourceDefinition {
  sourceId: string;
  discipline: string;          // e.g. 'f1', 'wec', 'motogp', 'global'
  datasetType: string;         // e.g. 'CALENDAR', 'SESSIONS', 'RESULTS', 'STANDINGS', 'REGULATIONS', 'CIRCUITS'
  sourceName: string;
  sourceUrl: string;
  sourceType: 'API' | 'DATASET' | 'OFFICIAL_DOCUMENT' | 'REGISTRY';
  authorityLevel: SourceAuthorityLevel;
  license: string;             // e.g. 'Proprietary Reference', 'MIT', 'CC0-1.0', 'CC-BY-4.0'
  attributionRequirement: string;
  updateFrequency: 'REAL_TIME' | 'POST_SESSION' | 'WEEKLY' | 'SEASONAL' | 'STATIC';
  lastVerifiedDate: string;    // ISO Date (YYYY-MM-DD)
  fallbackSourceId?: string;
  ingestionMethod: 'AUTOMATED_SYNC' | 'VALIDATED_FIXTURE' | 'REFERENCE_LINK';
  notes: string;
  currentStatus: 'ACTIVE' | 'EXPERIMENTAL' | 'DEPRECATED';
}

export interface SourceProvenanceMetadata {
  sourceId: string;
  authorityLevel: SourceAuthorityLevel;
  license: string;
  attribution: string;
  sourceUrl: string;
  retrievedAt: string;         // ISO 8601 UTC
  version?: string;
}

// ============================================================================
// 2. Normalized Core Entities
// ============================================================================

export interface NormalizedDriver {
  driverId: string;            // Stable internal ID (e.g. 'max-verstappen')
  code: string;                // 3-letter code (e.g. 'VER')
  firstName: string;
  lastName: string;
  fullName: string;
  number: number;
  nationality: string;
  countryFlag: string;
  currentTeamId: string;       // Stable team internal ID (e.g. 'red-bull-racing')
  externalIds: Record<string, string>; // e.g. { jolpica: 'max_verstappen', f1db: 'verstappen' }
  provenance: SourceProvenanceMetadata;
}

export interface NormalizedTeam {
  teamId: string;              // Stable internal ID (e.g. 'red-bull-racing')
  name: string;                // e.g. 'Red Bull Racing'
  shortName: string;           // e.g. 'Red Bull'
  color: string;               // Hex color (e.g. '#1e41ff')
  textColor?: string;
  country: string;
  countryFlag: string;
  powerUnit?: string;
  externalIds: Record<string, string>;
  provenance: SourceProvenanceMetadata;
}

export type NormalizedSessionType =
  | 'FP1'
  | 'FP2'
  | 'FP3'
  | 'SPRINT_QUALIFYING'
  | 'SPRINT'
  | 'QUALIFYING'
  | 'RACE'
  | 'WARMUP'
  | 'SHAKEDOWN';

export interface NormalizedSession {
  sessionId: string;           // Stable ID (e.g. 'f1-2026-r01-fp1')
  eventId: string;             // Parent event ID (e.g. 'f1-2026-r01')
  sessionType: NormalizedSessionType;
  name: string;                // e.g. 'Practice 1', 'Sprint Qualifying'
  startTimeUtc: string;        // ISO 8601 UTC
  endTimeUtc?: string;         // ISO 8601 UTC
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  provenance: SourceProvenanceMetadata;
}

export type NormalizedEventFormat = 'NORMAL' | 'SPRINT' | 'ENDURANCE' | 'DOUBLE_HEADER';

export interface NormalizedEvent {
  eventId: string;             // Stable internal ID (e.g. 'f1-2026-r01')
  championshipId: string;      // e.g. 'f1'
  season: number;              // e.g. 2026
  round: number;               // 1-indexed round number
  officialName: string;        // e.g. 'Formula 1 Australian Grand Prix 2026'
  circuitId: string;           // Normalized circuit ID resolved via circuitRegistry (e.g. 'albert_park')
  circuitName: string;
  country: string;
  countryFlag: string;
  location: string;
  formatType: NormalizedEventFormat;
  startDateUtc: string;        // ISO 8601 UTC
  endDateUtc: string;          // ISO 8601 UTC
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  sessions: NormalizedSession[];
  provenance: SourceProvenanceMetadata;
}

// ============================================================================
// 3. Normalized Results & Versioning
// ============================================================================

export type ResultStatus = 'PROVISIONAL' | 'OFFICIAL' | 'AMENDED';

export type DriverRaceStatus =
  | 'FINISHED'
  | 'DNF'
  | 'DSQ'
  | 'DNS'
  | 'NC'
  | 'PENALIZED';

export interface NormalizedResultEntry {
  position: number;            // 1, 2, 3...
  gridPosition?: number;       // Starting grid spot
  driverId: string;            // Stable internal driver ID
  driverName?: string;
  driverCode?: string;
  teamId: string;              // Stable internal team ID
  teamName?: string;
  status: DriverRaceStatus;
  lapsCompleted: number;
  timeOrDelta?: string;        // e.g. '1:24:12.345' or '+5.421s'
  pointsEarned: number;
  hasFastestLap?: boolean;
  notes?: string;              // e.g. '5-second time penalty for track limits'
}

export interface NormalizedSessionResult {
  resultId: string;            // Stable ID (e.g. 'res-f1-2026-r01-race-v1')
  sessionId: string;           // Associated session ID
  eventId: string;             // Associated event ID
  resultStatus: ResultStatus;  // PROVISIONAL -> OFFICIAL -> AMENDED
  versionNumber: number;       // e.g. 1 (provisional), 2 (official), 3 (amended)
  publishedAtUtc: string;      // ISO 8601 UTC
  stewardNotes?: string;       // Notice summary
  entries: NormalizedResultEntry[];
  provenance: SourceProvenanceMetadata;
}

// ============================================================================
// 4. Normalized Standings
// ============================================================================

export interface NormalizedDriverStanding {
  position: number;
  driverId: string;
  driverName: string;
  driverCode: string;
  teamId: string;
  teamName: string;
  points: number;
  wins: number;
  podiums: number;
  season: number;
  provenance: SourceProvenanceMetadata;
}

export interface NormalizedConstructorStanding {
  position: number;
  teamId: string;
  teamName: string;
  points: number;
  wins: number;
  podiums: number;
  season: number;
  provenance: SourceProvenanceMetadata;
}

// ============================================================================
// 5. Feeder Series & Junior Academy Contracts
// ============================================================================

export type FeederChampionshipId = 'f2' | 'f3';

export type JuniorAcademyId =
  | 'red-bull-junior'
  | 'ferrari-driver-academy'
  | 'mercedes-junior'
  | 'alpine-academy'
  | 'mclaren-driver-development'
  | 'williams-racing-driver-academy'
  | 'sauber-academy'
  | 'aston-martin-driver-development';

export interface JuniorAcademy {
  academyId: JuniorAcademyId;
  name: string;
  f1TeamId: string;
  f1TeamName: string;
  accentColor: string;
  description: string;
  headquarters: string;
}

export interface NormalizedFeederDriver extends NormalizedDriver {
  championshipId: FeederChampionshipId;
  carNumber: number;
  juniorAcademyId?: JuniorAcademyId;
  juniorAcademyName?: string;
  f1Affiliation?: string;
  academyColor?: string;
  superLicenceEligiblePoints?: number;
}

export interface FeederWeekendRules {
  championshipId: FeederChampionshipId;
  sprintReverseGridCount: 10 | 12;      // F2 reverses top 10; F3 reverses top 12
  sprintPointsMatrix: number[];        // F2: [10,8,6,5,4,3,2,1]; F3: [10,9,8,7,6,5,4,3,2,1]
  featurePointsMatrix: number[];       // [25,18,15,12,10,8,6,4,2,1]
  poleBonusPoints: number;             // 2 points
  fastestLapBonusPoints: number;       // 1 point (if inside top 10)
  mandatoryPitStopInFeature: boolean;  // true for F2 (both tyre specs required), false for F3
}

export interface SuperLicenceStandingRule {
  position: string;
  points: number;
}

// ============================================================================
// 6. Multi-Class Endurance Racing Contracts (FIA WEC & 24h Le Mans)
// ============================================================================

export type WecClassId = 'hypercar' | 'lmgt3';

export type DriverRating = 'platinum' | 'gold' | 'silver' | 'bronze';

export type WecDurationType = '6h' | '8h' | '10h' | '1812km' | '24h';

export interface WecDriverLineupMember {
  driverId: string;
  name: string;
  driverCode?: string;
  rating: DriverRating;
  nationality?: string;
}

export interface BoPSnapshot {
  minWeightKg: number;
  maxPowerKw: number;
  maxEnergyPerStintMj?: number;
}

export interface NormalizedWecEntry {
  entryId: string;
  carNumber: number;
  classId: WecClassId;
  teamId: string;
  teamName: string;
  manufacturer: string;
  carModel: string;
  tyreManufacturer: string;
  drivers: WecDriverLineupMember[];
  bop?: BoPSnapshot;
}

export interface NormalizedWecResult {
  position: number;
  classPosition: number;
  carNumber: number;
  teamId: string;
  classId: WecClassId;
  lapsCompleted: number;
  totalTimeOrStatus: string;
  points: number;
  isPole?: boolean;
}

export interface WecPointsScale {
  durationType: WecDurationType;
  multiplier: number;
  matrix: number[];
  poleBonus: number;
}

// ============================================================================
// 7. Premier Two-Wheel Grand Prix Contracts (MotoGP)
// ============================================================================

export type ConcessionTier = 'A' | 'B' | 'C' | 'D';

export interface ConcessionRules {
  tier: ConcessionTier;
  pointsPercentage: string;
  testTires: number;
  privateTesting: string;
  wildcards: number;
  enginesPerSeason: number;
  engineFreeze: boolean;
  aeroUpdates: number;
}

export interface MotoGpPointsScale {
  sprintMatrix: number[];    // Top 9: [12, 9, 7, 6, 5, 4, 3, 2, 1]
  grandPrixMatrix: number[]; // Top 15: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
}

export interface NormalizedMotoGpRider {
  riderId: string;
  name: string;
  riderCode: string;
  bikeNumber: number;
  teamId: string;
  teamName: string;
  manufacturer: string;
  bikeModel: string;
  nationality: string;
  concessionTier: ConcessionTier;
}

export interface NormalizedMotoGpEntry {
  entryId: string;
  bikeNumber: number;
  teamId: string;
  teamName: string;
  manufacturer: string;
  bikeModel: string;
  riders: { riderId: string; name: string; number: number }[];
}

// ============================================================================
// 8. Multi-Motorsport Core Entities, Rosters & Event Entry Contracts
// ============================================================================

export type CompetitorRole =
  | 'ACTIVE'
  | 'RACE_DRIVER'
  | 'RIDER'
  | 'RESERVE'
  | 'SUBSTITUTE'
  | 'TEST_DRIVER'
  | 'DEVELOPMENT_DRIVER'
  | 'CO_DRIVER'
  | 'CREW_MEMBER'
  | 'GUEST'
  | 'WILDCARD'
  | 'WITHDRAWN';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'CONFLICTED';

export type EntrantType =
  | 'TEAM'
  | 'CONSTRUCTOR'
  | 'ENTRANT'
  | 'MANUFACTURER'
  | 'CREW';

export interface NormalizedCompetitor {
  competitorId: string;         // Stable internal ID (e.g. 'verstappen', 'bagnaia', 'neuville')
  code?: string;                // Short code (e.g. 'VER', 'BAG', 'NEU')
  firstName: string;
  lastName: string;
  fullName: string;
  number?: number;
  nationality: string;
  countryFlag: string;
  defaultRole: CompetitorRole;
  discipline: string;          // 'f1', 'motogp', 'wec', 'wrc', 'formula-e', etc.
  externalIds?: Record<string, string>;
  provenance: SourceProvenanceMetadata;
  verificationStatus: VerificationStatus;
}

export interface NormalizedEntrant {
  teamId: string;               // Stable internal ID (e.g. 'red-bull-racing', 'ducati-lenovo')
  name: string;
  shortName: string;
  color: string;
  country: string;
  countryFlag: string;
  manufacturer?: string;
  powerUnit?: string;
  entrantType: EntrantType;
  discipline: string;
  externalIds?: Record<string, string>;
  provenance: SourceProvenanceMetadata;
  verificationStatus: VerificationStatus;
}

export interface SeasonRosterCompetitor {
  competitor: NormalizedCompetitor;
  teamId: string;
  role: CompetitorRole;
  carNumber?: number;
  classId?: string;
  isPrimaryCompetitor: boolean;
  notes?: string;
}

export interface SeasonRoster {
  championshipId: string;
  season: number;
  entrants: NormalizedEntrant[];
  competitors: SeasonRosterCompetitor[];
  provenance: SourceProvenanceMetadata;
  verificationStatus: VerificationStatus;
}

export type EventEntryStatus =
  | 'CONFIRMED'
  | 'SUBSTITUTED'
  | 'WITHDRAWN'
  | 'DNS'
  | 'RESERVE_STANDBY';

export interface OfficialEventEntry {
  eventId: string;              // e.g. 'f1-2026-r15'
  championshipId: string;       // e.g. 'f1'
  season: number;               // 2026
  entryId: string;              // e.g. 'entry-f1-2026-r15-ver'
  competitorId: string;         // e.g. 'verstappen'
  competitorName: string;       // e.g. 'Max Verstappen'
  competitorCode?: string;      // e.g. 'VER'
  teamId: string;               // e.g. 'red_bull'
  teamName: string;             // e.g. 'Red Bull Racing'
  vehicleId?: string;
  role: CompetitorRole;
  status: EventEntryStatus;
  carNumber?: number;
  classId?: string;
  isPredictionEligible: boolean; // Authoritative flag for Prediction Bench
  source: string;
  verifiedAt: string;           // ISO 8601 UTC
  verificationStatus: VerificationStatus;
  substitutionNote?: string;
}

export interface OfficialEventEntryList {
  eventId: string;
  championshipId: string;
  season: number;
  eventName: string;
  circuitId: string;
  entries: OfficialEventEntry[];
  publishedAtUtc: string;
  source: SourceProvenanceMetadata;
  verificationStatus: VerificationStatus;
}

// ============================================================================
// 9. WRC Rally Crew & GT Racing Contracts
// ============================================================================

export interface WrcCrewEntry {
  crewId: string;
  carNumber: number;
  teamId: string;
  teamName: string;
  carModel: string;
  rallyClass: 'Rally1' | 'Rally2' | 'Junior WRC';
  driver: { competitorId: string; name: string; nationality: string; flag: string };
  coDriver: { competitorId: string; name: string; nationality: string; flag: string };
  provenance: SourceProvenanceMetadata;
}

export interface GtEntry {
  entryId: string;
  carNumber: number;
  teamId: string;
  teamName: string;
  carModel: string;
  cupClass: 'Pro' | 'Gold Cup' | 'Silver Cup' | 'Bronze Cup';
  drivers: Array<{ competitorId: string; name: string; rating: 'platinum' | 'gold' | 'silver' | 'bronze' }>;
  provenance: SourceProvenanceMetadata;
}




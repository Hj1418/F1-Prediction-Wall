/**
 * The Grid — Deep Motorsport Domain Models
 * 
 * Architectural Invariant:
 * "Build the reusable experience once:
 *  Championship
 *   ├── Overview
 *   ├── Season
 *   ├── Calendar
 *   ├── Events
 *   ├── Drivers
 *   ├── Teams
 *   ├── Results
 *   └── Standings"
 * 
 * Extensible data contracts used across F2, F3, F4, WEC, Formula E, and future series.
 */

export interface ChampionshipTechnicalSpec {
  chassis: string;
  engine: string;
  displacement: string;
  powerOutput: string;
  gearbox: string;
  weight: string;
  topSpeed: string;
  acceleration: string;
  tyres: string;
  fuelSupplier?: string;
  electronics?: string;
  safetyRating: string;
}

export interface ChampionshipWeekendSession {
  name: string;
  day: string;
  durationMinutes: number;
  description: string;
  formatHighlight?: string;
}

export interface ChampionshipClass {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  color?: string;
  description: string;
}

export interface ChampionshipRound {
  roundNumber: number;
  officialTitle: string;
  circuitName: string;
  location: string;
  country: string;
  countryCode: string;
  flag: string;
  dates: string;
  circuitLengthKm: number;
  duration?: string;
  surface?: 'Gravel' | 'Tarmac' | 'Snow' | 'Mixed';
  totalStages?: number;
  competitiveDistanceKm?: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  sessions: ChampionshipWeekendSession[];
  featureLaps?: number;
  sprintLaps?: number;
}

export interface ChampionshipDriverStanding {
  rank: number;
  driverName: string;
  driverCode: string;
  carNumber: number;
  teamName: string;
  nationality: string;
  points: number;
  wins: number;
  podiums: number;
  polePositions: number;
  fastestLaps: number;
  juniorAcademy?: string;
  academyColor?: string;
  racingClass?: string;
  driverGrade?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  coDrivers?: string[];
}

export interface ChampionshipTeamStanding {
  rank: number;
  teamName: string;
  points: number;
  wins: number;
  podiums: number;
  polePositions: number;
  country: string;
  countryCode: string;
  flag: string;
  primaryColor: string;
  drivers: string[];
  racingClass?: string;
  carModel?: string;
  manufacturer?: string;
}

export interface ChampionshipSuperLicenceTier {
  position: string;
  points: number;
}

export interface ChampionshipNationalSeries {
  name: string;
  region: string;
  flag: string;
  carSpecs: string;
  engine: string;
  keyCircuits: string[];
  superLicencePoints: number;
  notableGraduates: string[];
  description: string;
}

export interface ChampionshipFeatureGuideItem {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  metrics?: Array<{ label: string; value: string }>;
  details?: string[];
}

export interface ChampionshipFeatureGuide {
  tabLabel: string;
  tabTitle: string;
  tabDescription: string;
  sections: ChampionshipFeatureGuideItem[];
}

export interface ChampionshipLadderPyramidTier {
  step: string;
  title: string;
  age?: string;
  desc: string;
  badge: string;
  color: string;
  isCurrent?: boolean;
}

export interface ChampionshipDetailData {
  id: string;
  name: string;
  shortName: string;
  seasonYear: number;
  governingBody: string;
  tagline: string;
  heroBadgeColor: string;
  tier: string;
  officialWebsite: string;
  overviewSummary: string;
  feederLadderRole: string;
  specRegulationsSummary: string;
  pointsSystemDescription: string;
  technicalSpecs: ChampionshipTechnicalSpec;
  rounds: ChampionshipRound[];
  driversStandings: ChampionshipDriverStanding[];
  teamsStandings: ChampionshipTeamStanding[];
  classes?: ChampionshipClass[];
  competitorLabel?: string;
  vehicleLabel?: string;
  superLicencePoints?: ChampionshipSuperLicenceTier[];
  ladderPyramidTiers?: ChampionshipLadderPyramidTier[];
  featureGuide?: ChampionshipFeatureGuide;
  nationalSeries?: ChampionshipNationalSeries[];
  faqs: Array<{ question: string; answer: string }>;
}

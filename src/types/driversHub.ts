export type MotorsportSeriesFilter = 'all' | 'f1' | 'wec' | 'motogp';

export interface DriverCareerStats {
  worldChampionships?: number;
  leMansWins?: number;
  raceWins?: number;
  podiums?: number;
  polePositions?: number;
  fastestLaps?: number;
  sprintWins?: number;
  starts?: number;
  statLabel: string;
}

export interface DriverSeasonStats {
  season: number;
  series: 'f1' | 'wec' | 'motogp';
  // Common
  position: number | string;
  points: number;
  wins: number;
  podiums: number;
  // F1-specific
  polePositions?: number;
  fastestLaps?: number;
  raceStarts?: number;
  raceFinishes?: number;
  dnfs?: number;
  // WEC-specific
  racingClass?: string;
  classWins?: number;
  classPodiums?: number;
  leMansClassFinish?: string;
  // MotoGP-specific
  sprintWins?: number;
  sprintPodiums?: number;
}

export interface DriverSeasonHistoryEntry {
  season: number;
  series: string;
  team: string;
  carOrBike?: string;
  position: number | string;
  points: number;
  wins: number;
  podiums: number;
  poles?: number;
  notes?: string;
}

export interface DriverRecentResult {
  eventName: string;
  season: number;
  round: number;
  circuit: string;
  qualifyingPosition?: number;
  gridPosition?: number;
  finishPosition: number | string;
  points: number;
  status: string; // 'Finished' | 'DNF' | 'DSQ' | 'DNS' | '+1 Lap' etc.
  isOfficial: boolean;
  notes?: string;
}

export interface DriverDnaAttribute {
  id: string;
  name: string;
  level: 'Elite' | 'Very High' | 'High' | 'Balanced';
  type: 'MEASURED_METRIC' | 'EDITORIAL_ANALYSIS';
  calculationMethod?: string;
  description: string;
}

export interface CareerJourneyMilestone {
  period: string; // e.g. "1993–2000" or "2007"
  title: string;
  category: 'KARTING' | 'JUNIOR_CAREER' | 'TOP_FLIGHT' | 'CHAMPIONSHIP' | 'TRANSITION';
  description: string;
}

export interface HistoricalTeamRecord {
  period: string; // e.g. "2007–2012"
  team: string; // e.g. "Vodafone McLaren Mercedes"
  championship: string; // e.g. "Formula 1"
  carOrBike?: string;
  notes?: string; // e.g. "2008 World Champion, 21 Wins"
}

export interface CareerAchievement {
  title: string;
  countOrDetail?: string; // e.g. "7x World Champion" or "105 Grand Prix Victories"
  description: string;
  yearOrEra?: string;
  isRecord?: boolean;
}

export interface DriverInterestingFact {
  fact: string;
  topic?: string; // e.g. "Early Career", "Rivalry", "Motorsport Milestone"
}

export interface DriverProfile {
  id: string;
  slug: string;
  name: string;
  fullName?: string;
  code: string;
  number: number | string;
  nationality: string;
  countryCode: string;
  countryFlag: string;
  team: string;
  series: 'f1' | 'wec' | 'motogp' | 'f2' | 'f3' | 'f4' | 'formula-e' | 'moto2' | 'moto3' | 'gt-world-challenge' | 'wrc' | 'indian-motorsport';
  seriesName: string;
  seriesBadgeColor: string;
  primaryDiscipline?: string;
  racingClass?: string;
  carOrBike?: string;
  status: 'active' | 'historical';
  birthDate?: string;
  birthPlace?: string;
  imageUrl?: string;
  stats: DriverCareerStats;
  currentSeasonStats?: DriverSeasonStats;
  seasonHistory?: DriverSeasonHistoryEntry[];
  recentResults?: DriverRecentResult[];
  dnaAttributes?: DriverDnaAttribute[];
  driverDna: string;
  careerHighlights: string[];
  biography?: string;
  // Evergreen Profile Rich Sections
  shortIntroduction?: string;
  earlyLifeAndBeginnings?: string;
  careerJourney?: CareerJourneyMilestone[];
  teamsHistory?: HistoricalTeamRecord[];
  careerAchievements?: CareerAchievement[];
  interestingFacts?: (string | DriverInterestingFact)[];
  driverLegacy?: string;
  teamWebsite?: string;
  championshipUrl?: string;
}

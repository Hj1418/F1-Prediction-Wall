/**
 * The Grid — Circuit Domain Models & Contracts
 * 
 * Architectural Invariant:
 * Circuits are first-class motorsport entities representing physical venues.
 * A single venue may have multiple layouts and host multiple championships:
 * Circuit ──> Layout ──> Championship / Event
 */

export interface CircuitLocation {
  city: string;
  country: string;
  countryCode?: string;
  flag: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
}

export type CircuitType = 'Permanent' | 'Street' | 'Semi-Permanent' | 'Road Course' | 'Rally Stage';
export type CircuitDirection = 'Clockwise' | 'Anti-Clockwise' | 'Figure-8';

export interface CircuitLapRecord {
  time: string;
  driver: string;
  teamOrCar?: string;
  year: number;
  category: string; // e.g. 'Formula 1', 'MotoGP', 'WEC Hypercar', 'GT3'
}

export interface CircuitLayout {
  layoutId: string;
  name: string; // e.g. 'Grand Prix Circuit', 'Bugatti Circuit', 'Outer Track'
  lengthKm: number;
  turns: number;
  direction: CircuitDirection;
  type: CircuitType;
  mapSvg?: string;
  svgPath?: string;
  viewBox?: string;
  elevationChangeMeters?: number;
  longestStraightMeters?: number;
  drsZones?: number;
  lapRecord?: CircuitLapRecord;
  championshipsHosted?: string[]; // e.g. ['f1', 'motogp', 'wec']
  isPrimary?: boolean;
}

export interface CircuitCharacteristics {
  speed: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  braking: 'Light' | 'Medium' | 'Heavy' | 'Very Heavy';
  overtaking: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  tyreWear: 'Low' | 'Medium' | 'High' | 'Very High';
  downforce?: 'Low' | 'Medium' | 'Medium-High' | 'High' | 'Maximum';
  elevationChangeMeters?: number;
  longestStraightMeters?: number;
  drsZones?: number;
  summary: string;
}

export interface CircuitNotableMoment {
  year: number;
  title: string;
  description: string;
}

export interface CircuitHistory {
  openedYear: number;
  firstMajorEvent?: string;
  historicalOverview: string;
  notableMoments: CircuitNotableMoment[];
}

export interface CircuitChampionshipRelationship {
  championshipId: string;
  championshipName: string;
  badge: string;
  badgeColor: string;
  eventName: string;
  layoutId?: string;
  layoutName?: string;
  url: string;
  datesOrSeason?: string;
  notes?: string;
}

export interface CircuitDidYouKnow {
  category?: 'SPEED' | 'HISTORY' | 'RECORD' | 'CRAZY FACT' | 'TECHNICAL' | 'GENERAL';
  title: string;
  fact: string;
}

export interface CircuitCorner {
  number: number | string;
  name: string;
  description: string;
}

export interface CircuitSourceAttribution {
  source: string;
  license: string;
  licenseUrl?: string;
  author?: string;
}

export interface CircuitEntity {
  circuitId: string;
  id: string;
  name: string;
  shortName: string;
  location: CircuitLocation;
  primaryDiscipline: string; // 'f1' | 'motogp' | 'wec' | 'fe' | 'gt' | 'wrc' | 'india'
  disciplines: string[]; // ['f1', 'wec', 'gt']
  layouts: CircuitLayout[];
  characteristics: CircuitCharacteristics;
  history: CircuitHistory;
  championships: CircuitChampionshipRelationship[];
  didYouKnow: CircuitDidYouKnow[];
  keyCorners?: CircuitCorner[];
  shortDescription: string;
  officialWebsite?: string;
  sourceAttribution?: CircuitSourceAttribution;
}

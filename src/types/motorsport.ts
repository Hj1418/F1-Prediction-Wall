/**
 * The Grid — Generic Motorsport Domain Models
 * 
 * Architectural Invariant:
 * "F1 is the starting point. Motorsport is the vision."
 * 
 * Provides extensible abstractions for diverse racing formats:
 * - Single-seater open-wheel (F1, F2, F3, F4)
 * - Multi-class sports prototype & GT endurance (WEC)
 * - Pure-electric urban formula (Formula E)
 * - Point-to-point off-road stages (WRC Rally)
 * - Two-wheeled prototype racing (MotoGP)
 * - Regional & national motorsport (Indian Racing League / FMSCI)
 */

export type MotorsportCategoryId =
  | 'all'
  | 'open_wheel'
  | 'electric'
  | 'endurance'
  | 'touring_gt'
  | 'rally'
  | 'motorcycle'
  | 'national_indian';

export type EventFormatType =
  | 'grand_prix'          // FP -> Knockout Qualifying -> Grand Prix (e.g. F1, F2)
  | 'endurance'           // Multi-class timed endurance (e.g. 6h, 24h of Le Mans)
  | 'rally_stages'        // Timed special stages on closed gravel/tarmac/snow (e.g. WRC)
  | 'double_header'       // Practice -> Duels -> Race 1 / Race 2 (e.g. Formula E)
  | 'sprint_and_feature'; // Practice -> Qualifying -> Saturday Sprint -> Sunday Grand Prix (e.g. MotoGP)

export interface MotorsportCategory {
  id: MotorsportCategoryId;
  label: string;
  shortDescription: string;
  tagline: string;
}

export interface MotorsportClass {
  classId: string;
  name: string;
  badge: string;
  color: string;
  description: string;
}

export interface Championship {
  id: string;
  name: string;
  shortName: string;
  category: MotorsportCategoryId;
  tier: 'Premier World Championship' | 'Feeder Ladder' | 'Endurance & SportsCar' | 'Electric Innovation' | 'Off-Road Rally' | 'Premier Motorcycle' | 'National Championship';
  governingBody: string;
  tagline: string;
  badgeColor: string;
  vehicleType: string;
  powertrain: string;
  topSpeed: string;
  formatType: EventFormatType;
  formatDescription: string;
  beginnerOverview: string;
  keyFeatures: string[];
  scoringSummary: string;
  officialUrl: string;
  isF1StartingPoint?: boolean;
}

export interface MotorsportSession {
  sessionId: string;
  eventId: string;
  name: string;
  type: 'PRACTICE' | 'QUALIFYING' | 'SUPERPOLE' | 'SPRINT' | 'RACE' | 'STAGE';
  startTime: string; // ISO 8601 UTC
  endTime?: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

export interface MotorsportEvent {
  eventId: string;
  championshipId: string;
  name: string;
  venue: string;
  location: string;
  country: string;
  flag: string;
  formatType: EventFormatType;
  startDate: string;
  endDate: string;
  classes?: string[];
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

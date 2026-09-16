/**
 * The Grid — FIM MotoGP™ World Championship Data Normalizer
 * 
 * Ingests and normalizes premier motorcycle Grand Prix datasets:
 * - Rider → Bike → Team → Manufacturer hierarchy
 * - Saturday Tissot Sprint (top 9) vs Sunday Grand Prix (top 15) dual scoring
 * - Friday Practice (timed for Q2 automatic qualification)
 * - FIM Manufacturer Concession System (Tier A, B, C, D)
 */

import {
  ConcessionTier,
  ConcessionRules,
  MotoGpPointsScale,
  NormalizedMotoGpRider,
  NormalizedEvent,
  NormalizedSession,
  NormalizedDriverStanding,
  NormalizedConstructorStanding,
} from '../../../types/dataContract';
import { createProvenanceMetadata } from '../sourceRegistry';
import {
  resolveDriverId,
  resolveTeamId,
  resolveCircuitId,
  buildEventId,
  buildSessionId,
} from '../identifierRegistry';
import { motogpData } from '../../motorsport/data/motogpData';

export const MOTOGP_POINTS_SCALE: MotoGpPointsScale = {
  sprintMatrix: [12, 9, 7, 6, 5, 4, 3, 2, 1],
  grandPrixMatrix: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
};

export const CONCESSION_TIERS: Record<ConcessionTier, ConcessionRules> = {
  A: {
    tier: 'A',
    pointsPercentage: '≥ 85% of Constructor Points',
    testTires: 170,
    privateTesting: 'Test riders only; 3 nominated GP circuits only',
    wildcards: 0,
    enginesPerSeason: 8,
    engineFreeze: true,
    aeroUpdates: 1,
  },
  B: {
    tier: 'B',
    pointsPercentage: '60% – 85% of Constructor Points',
    testTires: 190,
    privateTesting: 'Test riders only; 3 nominated GP circuits only',
    wildcards: 3,
    enginesPerSeason: 8,
    engineFreeze: true,
    aeroUpdates: 1,
  },
  C: {
    tier: 'C',
    pointsPercentage: '35% – 60% of Constructor Points',
    testTires: 220,
    privateTesting: 'Test riders only; 3 nominated GP circuits only',
    wildcards: 6,
    enginesPerSeason: 8,
    engineFreeze: true,
    aeroUpdates: 1,
  },
  D: {
    tier: 'D',
    pointsPercentage: '< 35% of Constructor Points',
    testTires: 260,
    privateTesting: 'Unrestricted private testing at any GP circuit with contracted race riders',
    wildcards: 6,
    enginesPerSeason: 10,
    engineFreeze: false,
    aeroUpdates: 2,
  },
};

export class MotoGpNormalizer {
  /**
   * Computes Saturday Tissot Sprint points (top 9 riders).
   */
  public static calculateSprintPoints(position: number): number {
    if (position >= 1 && position <= MOTOGP_POINTS_SCALE.sprintMatrix.length) {
      return MOTOGP_POINTS_SCALE.sprintMatrix[position - 1];
    }
    return 0;
  }

  /**
   * Computes Sunday Grand Prix points (top 15 riders).
   */
  public static calculateGrandPrixPoints(position: number): number {
    if (position >= 1 && position <= MOTOGP_POINTS_SCALE.grandPrixMatrix.length) {
      return MOTOGP_POINTS_SCALE.grandPrixMatrix[position - 1];
    }
    return 0;
  }

  /**
   * Computes points for either session type.
   */
  public static calculatePoints(position: number, sessionType: 'SPRINT' | 'GRAND_PRIX'): number {
    return sessionType === 'SPRINT'
      ? this.calculateSprintPoints(position)
      : this.calculateGrandPrixPoints(position);
  }

  /**
   * Evaluates FIM Concession tier from constructor points percentage.
   */
  public static getConcessionTier(pointsPercentage: number): ConcessionTier {
    if (pointsPercentage >= 85) return 'A';
    if (pointsPercentage >= 60) return 'B';
    if (pointsPercentage >= 35) return 'C';
    return 'D';
  }

  /**
   * Gets specific rules for a concession tier.
   */
  public static getConcessionRules(tier: ConcessionTier): ConcessionRules {
    return CONCESSION_TIERS[tier];
  }

  /**
   * Normalizes MotoGP Grand Prix calendar rounds into standard NormalizedEvents.
   */
  public static normalizeCalendar(
    season: number = 2026,
    rawRounds?: any[],
    sourceId: string = 'fim-motogp-official'
  ): NormalizedEvent[] {
    const rounds = Array.isArray(rawRounds) && rawRounds.length > 0 ? rawRounds : motogpData.rounds;
    const provenance = createProvenanceMetadata(sourceId);

    return rounds.map((r: any, idx: number) => {
      const roundNum = Number(r.roundNumber || r.round) || idx + 1;
      const eventId = buildEventId('motogp', season, roundNum);
      const circuitId = resolveCircuitId(r.circuitName || r.circuitId || r.officialTitle);

      const sessions: NormalizedSession[] = [
        {
          sessionId: buildSessionId(eventId, 'fp1'),
          eventId,
          sessionType: 'FP1',
          name: 'Free Practice 1',
          startTimeUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}T08:45:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'practice-q2'),
          eventId,
          sessionType: 'FP2',
          name: 'Practice (Timed for Q2 Cutoff)',
          startTimeUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}T13:00:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'qualifying'),
          eventId,
          sessionType: 'QUALIFYING',
          name: 'Qualifying 1 & 2',
          startTimeUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}T09:50:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'tissot-sprint'),
          eventId,
          sessionType: 'SPRINT',
          name: 'Tissot Sprint (Top 9 Points)',
          startTimeUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}T13:00:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'grand-prix'),
          eventId,
          sessionType: 'RACE',
          name: `${r.officialTitle || 'Grand Prix Race'}`,
          startTimeUtc: r.dates ? `${r.dates.split('–')[1]?.trim()}T12:00:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
      ];

      return {
        eventId,
        championshipId: 'motogp',
        season,
        round: roundNum,
        officialName: r.officialTitle || `MotoGP Round ${roundNum}`,
        circuitId,
        circuitName: r.circuitName || 'Grand Prix Circuit',
        country: r.country || 'International',
        countryFlag: r.flag || '🏁',
        location: r.location || r.country || 'International',
        formatType: 'SPRINT',
        startDateUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}` : new Date().toISOString(),
        endDateUtc: r.dates ? `${r.dates.split('–')[1]?.trim()}` : new Date().toISOString(),
        status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
        sessions,
        provenance,
      };
    });
  }

  /**
   * Normalizes MotoGP riders with bike, manufacturer, and Concession tier metadata.
   */
  public static normalizeRiders(
    rawRiders?: any[],
    rawTeams?: any[],
    sourceId: string = 'fim-motogp-official'
  ): NormalizedMotoGpRider[] {
    const ridersData = Array.isArray(rawRiders) && rawRiders.length > 0 ? rawRiders : motogpData.driversStandings;
    const teamsData = Array.isArray(rawTeams) && rawTeams.length > 0 ? rawTeams : motogpData.teamsStandings;

    return ridersData.map((r: any, idx: number) => {
      const riderId = resolveDriverId(r.driverName || r.riderName);
      const teamId = resolveTeamId(r.teamName);
      const teamMeta = teamsData.find((t: any) => resolveTeamId(t.teamName) === teamId);

      const bikeModel = teamMeta?.carModel || r.bikeModel || 'Desmosedici GP24';
      const manufacturer = teamMeta?.carModel?.split(' ')[0] || r.teamName?.split(' ')[0] || 'Ducati';
      const bikeNumber = Number(r.carNumber || r.bikeNumber) || idx + 1;
      const riderCode = (r.driverCode || riderId.slice(0, 3)).toUpperCase();

      // Resolve concession tier based on manufacturer
      let concessionTier: ConcessionTier = 'A';
      const mLower = manufacturer.toLowerCase();
      if (mLower.includes('ducati')) concessionTier = 'A';
      else if (mLower.includes('ktm') || mLower.includes('aprilia')) concessionTier = 'C';
      else if (mLower.includes('yamaha') || mLower.includes('honda')) concessionTier = 'D';

      return {
        riderId,
        name: r.driverName || r.riderName || riderId,
        riderCode,
        bikeNumber,
        teamId,
        teamName: r.teamName || 'MotoGP Team',
        manufacturer,
        bikeModel,
        nationality: r.nationality || 'ESP',
        concessionTier,
      };
    });
  }

  /**
   * Normalizes MotoGP Rider and Team/Manufacturer standings.
   */
  public static normalizeStandings(
    season: number = 2026,
    rawRiders?: any[],
    rawTeams?: any[],
    sourceId: string = 'fim-motogp-official'
  ): {
    riderStandings: (NormalizedDriverStanding & { bikeModel?: string; sprintWins?: number })[];
    teamStandings: (NormalizedConstructorStanding & { bikeModel?: string; manufacturer?: string })[];
  } {
    const riders = Array.isArray(rawRiders) && rawRiders.length > 0 ? rawRiders : motogpData.driversStandings;
    const teams = Array.isArray(rawTeams) && rawTeams.length > 0 ? rawTeams : motogpData.teamsStandings;
    const provenance = createProvenanceMetadata(sourceId);

    const riderStandings = riders.map((r: any, idx: number) => {
      const riderId = resolveDriverId(r.driverName || r.riderName);
      const teamId = resolveTeamId(r.teamName);
      const riderCode = (r.driverCode || riderId.slice(0, 3)).toUpperCase();

      return {
        standingId: `motogp-${season}-rider-${riderId}`,
        championshipId: 'motogp',
        season,
        position: Number(r.rank) || idx + 1,
        driverId: riderId,
        driverName: r.driverName || r.riderName || riderId,
        driverCode: riderCode,
        teamId,
        teamName: r.teamName || 'MotoGP Team',
        points: Number(r.points) || 0,
        wins: Number(r.wins) || 0,
        podiums: Number(r.podiums) || 0,
        sprintWins: Number(r.sprintWins) || 0,
        provenance,
      };
    });

    const teamStandings = teams.map((t: any, idx: number) => {
      const teamId = resolveTeamId(t.teamName);
      const manufacturer = t.carModel?.split(' ')[0] || t.teamName?.split(' ')[0] || 'Ducati';

      return {
        standingId: `motogp-${season}-team-${teamId}`,
        championshipId: 'motogp',
        season,
        position: Number(t.rank) || idx + 1,
        teamId,
        teamName: t.teamName || teamId,
        points: Number(t.points) || 0,
        wins: Number(t.wins) || 0,
        podiums: Number(t.podiums) || 0,
        bikeModel: t.carModel,
        manufacturer,
        provenance,
      };
    });

    return { riderStandings, teamStandings };
  }
}

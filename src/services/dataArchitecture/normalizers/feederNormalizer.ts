/**
 * The Grid — Feeder Series (FIA F2 & F3) Data Normalizer & Pathway Engine
 * 
 * Ingests junior open-wheel feeder datasets, normalizes reverse-grid session
 * structures, maps F1 Junior Academy affiliations, and computes FIA Super Licence points.
 */

import {
  FeederChampionshipId,
  NormalizedEvent,
  NormalizedSession,
  NormalizedFeederDriver,
  FeederWeekendRules,
  SuperLicenceStandingRule,
  NormalizedDriverStanding,
  NormalizedConstructorStanding,
  JuniorAcademyId,
} from '../../../types/dataContract';
import { createProvenanceMetadata } from '../sourceRegistry';
import {
  resolveDriverId,
  resolveTeamId,
  resolveCircuitId,
  buildEventId,
  buildSessionId,
  JUNIOR_ACADEMIES_REGISTRY,
} from '../identifierRegistry';

export const FEEDER_RULES: Record<FeederChampionshipId, FeederWeekendRules> = {
  f2: {
    championshipId: 'f2',
    sprintReverseGridCount: 10,
    sprintPointsMatrix: [10, 8, 6, 5, 4, 3, 2, 1],
    featurePointsMatrix: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    poleBonusPoints: 2,
    fastestLapBonusPoints: 1,
    mandatoryPitStopInFeature: true,
  },
  f3: {
    championshipId: 'f3',
    sprintReverseGridCount: 12,
    sprintPointsMatrix: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    featurePointsMatrix: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    poleBonusPoints: 2,
    fastestLapBonusPoints: 1,
    mandatoryPitStopInFeature: false,
  },
};

export const SUPER_LICENCE_POINTS_TABLE: Record<FeederChampionshipId, SuperLicenceStandingRule[]> = {
  f2: [
    { position: '1st (Champion)', points: 40 },
    { position: '2nd Place', points: 40 },
    { position: '3rd Place', points: 40 },
    { position: '4th Place', points: 30 },
    { position: '5th Place', points: 20 },
    { position: '6th Place', points: 10 },
    { position: '7th Place', points: 8 },
    { position: '8th Place', points: 6 },
    { position: '9th Place', points: 4 },
    { position: '10th Place', points: 3 },
  ],
  f3: [
    { position: '1st (Champion)', points: 30 },
    { position: '2nd Place', points: 25 },
    { position: '3rd Place', points: 20 },
    { position: '4th Place', points: 15 },
    { position: '5th Place', points: 12 },
    { position: '6th Place', points: 9 },
    { position: '7th Place', points: 7 },
    { position: '8th Place', points: 5 },
    { position: '9th Place', points: 3 },
    { position: '10th Place', points: 2 },
  ],
};

export class FeederNormalizer {
  /**
   * Calculates the Saturday Sprint starting grid order from Friday Qualifying.
   * - F2: Inverts the top 10 (P10 qualifier starts on Pole; P1 qualifier starts 10th).
   * - F3: Inverts the top 12 (P12 qualifier starts on Pole; P1 qualifier starts 12th).
   * - Positions beyond the inverted threshold start in their natural qualifying order.
   */
  public static calculateSprintStartingGrid(
    qualifyingDrivers: string[],
    championship: FeederChampionshipId
  ): string[] {
    if (!Array.isArray(qualifyingDrivers) || qualifyingDrivers.length === 0) {
      return [];
    }

    const rules = FEEDER_RULES[championship];
    const invertCount = Math.min(rules.sprintReverseGridCount, qualifyingDrivers.length);

    const topToInvert = qualifyingDrivers.slice(0, invertCount);
    const remainder = qualifyingDrivers.slice(invertCount);

    const invertedTop = [...topToInvert].reverse();
    return [...invertedTop, ...remainder];
  }

  /**
   * Normalizes an array of feeder championship calendar rounds.
   */
  public static normalizeCalendar(
    championship: FeederChampionshipId,
    rawRaces: any[],
    sourceId?: string
  ): NormalizedEvent[] {
    if (!Array.isArray(rawRaces)) return [];
    const defaultSource = championship === 'f2' ? 'fia-f2-official' : 'fia-f3-official';
    const activeSource = sourceId || defaultSource;
    const provenance = createProvenanceMetadata(activeSource);

    return rawRaces.map((raw, idx) => {
      const season = Number(raw.season) || 2026;
      const round = Number(raw.roundNumber || raw.round) || idx + 1;
      const eventId = buildEventId(championship, season, round);

      const circuitId = resolveCircuitId(raw.circuitName || raw.circuitId);
      const circuitName = raw.circuitName || 'Grand Prix Circuit';
      const officialName = raw.officialTitle || `FIA ${championship.toUpperCase()} Round ${round}`;
      const country = raw.country || 'World';

      // Build standard Feeder sessions: Practice, Qualifying, Sprint Race, Feature Race
      const sessions: NormalizedSession[] = [
        {
          sessionId: buildSessionId(eventId, 'practice'),
          eventId,
          sessionType: 'FP1',
          name: `${championship.toUpperCase()} Free Practice`,
          startTimeUtc: raw.startDate ? `${raw.startDate}T10:00:00Z` : new Date().toISOString(),
          endTimeUtc: raw.startDate ? `${raw.startDate}T10:45:00Z` : new Date().toISOString(),
          status: raw.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'qualifying'),
          eventId,
          sessionType: 'QUALIFYING',
          name: `${championship.toUpperCase()} Qualifying`,
          startTimeUtc: raw.startDate ? `${raw.startDate}T14:00:00Z` : new Date().toISOString(),
          endTimeUtc: raw.startDate ? `${raw.startDate}T14:30:00Z` : new Date().toISOString(),
          status: raw.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'sprint-race'),
          eventId,
          sessionType: 'SPRINT',
          name: `${championship.toUpperCase()} Sprint Race (${championship === 'f2' ? 'Reverse Top 10' : 'Reverse Top 12'})`,
          startTimeUtc: raw.dates ? `${raw.dates.split('–')[0]?.trim()}T13:00:00Z` : new Date().toISOString(),
          status: raw.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'feature-race'),
          eventId,
          sessionType: 'RACE',
          name: `${championship.toUpperCase()} Feature Race`,
          startTimeUtc: raw.dates ? `${raw.dates.split('–')[1]?.trim()}T10:00:00Z` : new Date().toISOString(),
          status: raw.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
      ];

      return {
        eventId,
        championshipId: championship,
        season,
        round,
        officialName,
        circuitId,
        circuitName,
        country,
        countryFlag: raw.flag || '🏁',
        location: raw.location || country,
        formatType: 'DOUBLE_HEADER',
        startDateUtc: raw.startDate || new Date().toISOString(),
        endDateUtc: raw.endDate || new Date().toISOString(),
        status: raw.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
        sessions,
        provenance,
      };
    });
  }

  /**
   * Normalizes Feeder Series drivers, connecting them to Junior Academies and Super Licence points.
   */
  public static normalizeDrivers(
    championship: FeederChampionshipId,
    rawDrivers: any[],
    sourceId?: string
  ): NormalizedFeederDriver[] {
    if (!Array.isArray(rawDrivers)) return [];
    const defaultSource = championship === 'f2' ? 'fia-f2-official' : 'fia-f3-official';
    const provenance = createProvenanceMetadata(sourceId || defaultSource);
    const licenceTable = SUPER_LICENCE_POINTS_TABLE[championship];

    return rawDrivers.map((d, idx) => {
      const driverId = resolveDriverId(d.driverName || d.driverId);
      const fullName = d.driverName || driverId;
      const parts = fullName.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      const code = (d.driverCode || lastName.slice(0, 3)).toUpperCase();
      const carNumber = Number(d.carNumber || d.number) || idx + 1;
      const currentTeamId = resolveTeamId(d.teamName || d.teamId);

      // Resolve Junior Academy
      let juniorAcademyId: JuniorAcademyId | undefined;
      let juniorAcademyName: string | undefined;
      let f1Affiliation: string | undefined;
      let academyColor: string | undefined;

      const rawAcademy = d.juniorAcademy || d.academy;
      if (rawAcademy) {
        const clean = String(rawAcademy).toLowerCase();
        if (clean.includes('red bull')) juniorAcademyId = 'red-bull-junior';
        else if (clean.includes('ferrari')) juniorAcademyId = 'ferrari-driver-academy';
        else if (clean.includes('mercedes')) juniorAcademyId = 'mercedes-junior';
        else if (clean.includes('alpine')) juniorAcademyId = 'alpine-academy';
        else if (clean.includes('mclaren')) juniorAcademyId = 'mclaren-driver-development';
        else if (clean.includes('williams')) juniorAcademyId = 'williams-racing-driver-academy';
        else if (clean.includes('sauber')) juniorAcademyId = 'sauber-academy';
        else if (clean.includes('aston')) juniorAcademyId = 'aston-martin-driver-development';

        if (juniorAcademyId && JUNIOR_ACADEMIES_REGISTRY[juniorAcademyId]) {
          const reg = JUNIOR_ACADEMIES_REGISTRY[juniorAcademyId];
          juniorAcademyName = reg.name;
          f1Affiliation = reg.f1TeamName;
          academyColor = reg.accentColor;
        } else {
          juniorAcademyName = d.juniorAcademy;
          academyColor = d.academyColor;
        }
      }

      // Calculate eligible Super Licence points based on standing rank
      const rankIdx = (Number(d.rank) || idx + 1) - 1;
      const superLicenceEligiblePoints = licenceTable[rankIdx]?.points || 0;

      return {
        driverId,
        code,
        firstName,
        lastName,
        fullName,
        number: carNumber,
        carNumber,
        nationality: d.nationality || 'International',
        countryFlag: '🏁',
        currentTeamId,
        championshipId: championship,
        juniorAcademyId,
        juniorAcademyName,
        f1Affiliation,
        academyColor,
        superLicenceEligiblePoints,
        externalIds: {
          feeder: String(d.driverCode || driverId).toLowerCase(),
        },
        provenance,
      };
    });
  }

  /**
   * Normalizes Feeder Series Standings.
   */
  public static normalizeStandings(
    championship: FeederChampionshipId,
    rawData: any,
    season: number = 2026,
    sourceId?: string
  ): {
    drivers: NormalizedDriverStanding[];
    constructors: NormalizedConstructorStanding[];
  } {
    const defaultSource = championship === 'f2' ? 'fia-f2-official' : 'fia-f3-official';
    const provenance = createProvenanceMetadata(sourceId || defaultSource);

    const rawDrivers = rawData.driversStandings || rawData.drivers || [];
    const drivers: NormalizedDriverStanding[] = rawDrivers.map((d: any, idx: number) => ({
      position: Number(d.rank || d.position) || idx + 1,
      driverId: resolveDriverId(d.driverName || d.driverId),
      driverName: d.driverName || 'Driver',
      driverCode: d.driverCode || 'DRV',
      teamId: resolveTeamId(d.teamName || d.teamId),
      teamName: d.teamName || 'Team',
      points: Number(d.points) || 0,
      wins: Number(d.wins) || 0,
      podiums: Number(d.podiums) || 0,
      season,
      provenance,
    }));

    const rawTeams = rawData.teamsStandings || rawData.teams || [];
    const constructors: NormalizedConstructorStanding[] = rawTeams.map((t: any, idx: number) => ({
      position: Number(t.rank || t.position) || idx + 1,
      teamId: resolveTeamId(t.teamName || t.teamId),
      teamName: t.teamName || 'Team',
      points: Number(t.points) || 0,
      wins: Number(t.wins) || 0,
      podiums: Number(t.podiums) || 0,
      season,
      provenance,
    }));

    return { drivers, constructors };
  }
}

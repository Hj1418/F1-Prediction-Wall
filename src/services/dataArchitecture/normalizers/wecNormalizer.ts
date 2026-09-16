/**
 * The Grid — FIA World Endurance Championship (WEC) Data Normalizer
 * 
 * Normalizes multi-class endurance datasets (Hypercar & LMGT3), duration-based
 * points scaling (6h standard, 8h/1812km 1.5x, 24h Le Mans double points),
 * multi-driver car entries, and FIA driver categorizations (Platinum, Gold, Silver, Bronze).
 */

import {
  WecClassId,
  WecDurationType,
  DriverRating,
  NormalizedWecEntry,
  WecPointsScale,
  NormalizedEvent,
  NormalizedSession,
  NormalizedDriverStanding,
  NormalizedConstructorStanding,
  WecDriverLineupMember,
} from '../../../types/dataContract';
import { createProvenanceMetadata } from '../sourceRegistry';
import {
  resolveDriverId,
  resolveTeamId,
  resolveCircuitId,
  buildEventId,
  buildSessionId,
} from '../identifierRegistry';
import { wecData } from '../../motorsport/data/wecData';

export const WEC_POINTS_SCALES: Record<WecDurationType, WecPointsScale> = {
  '6h': {
    durationType: '6h',
    multiplier: 1.0,
    matrix: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    poleBonus: 1,
  },
  '8h': {
    durationType: '8h',
    multiplier: 1.5,
    matrix: [38, 27, 23, 18, 15, 12, 9, 6, 3, 2],
    poleBonus: 1,
  },
  '10h': {
    durationType: '10h',
    multiplier: 1.5,
    matrix: [38, 27, 23, 18, 15, 12, 9, 6, 3, 2],
    poleBonus: 1,
  },
  '1812km': {
    durationType: '1812km',
    multiplier: 1.5,
    matrix: [38, 27, 23, 18, 15, 12, 9, 6, 3, 2],
    poleBonus: 1,
  },
  '24h': {
    durationType: '24h',
    multiplier: 2.0,
    matrix: [50, 36, 30, 24, 20, 16, 12, 8, 4, 2],
    poleBonus: 1,
  },
};

export class WecNormalizer {
  /**
   * Identifies the duration type from a race title or duration description string.
   */
  public static parseDurationType(durationStr?: string, title?: string): WecDurationType {
    const combined = `${durationStr || ''} ${title || ''}`.toLowerCase();
    if (combined.includes('24h') || combined.includes('24 hours') || combined.includes('le mans')) {
      return '24h';
    }
    if (combined.includes('1812') || combined.includes('qatar')) {
      return '1812km';
    }
    if (combined.includes('8h') || combined.includes('8 hours') || combined.includes('bahrain')) {
      return '8h';
    }
    if (combined.includes('10h') || combined.includes('10 hours')) {
      return '10h';
    }
    return '6h';
  }

  /**
   * Calculates championship points for a finishing position according to WEC duration multipliers.
   */
  public static calculateWecPoints(
    finishPosition: number,
    durationType: WecDurationType = '6h',
    isPole: boolean = false
  ): number {
    const scale = WEC_POINTS_SCALES[durationType] || WEC_POINTS_SCALES['6h'];
    let points = 0;
    if (finishPosition >= 1 && finishPosition <= scale.matrix.length) {
      points = scale.matrix[finishPosition - 1];
    }
    if (isPole) {
      points += scale.poleBonus;
    }
    return points;
  }

  /**
   * Normalizes FIA WEC calendar rounds into standard NormalizedEvents.
   */
  public static normalizeCalendar(
    season: number = 2026,
    rawRounds?: any[],
    sourceId: string = 'fia-wec-official'
  ): NormalizedEvent[] {
    const rounds = Array.isArray(rawRounds) && rawRounds.length > 0 ? rawRounds : wecData.rounds;
    const provenance = createProvenanceMetadata(sourceId);

    return rounds.map((r: any, idx: number) => {
      const roundNum = Number(r.roundNumber || r.round) || idx + 1;
      const eventId = buildEventId('wec', season, roundNum);
      const circuitId = resolveCircuitId(r.circuitName || r.circuitId || r.officialTitle);
      const durationType = WecNormalizer.parseDurationType(r.duration, r.officialTitle);

      const sessions: NormalizedSession[] = [
        {
          sessionId: buildSessionId(eventId, 'fp'),
          eventId,
          sessionType: 'FP1',
          name: 'Free Practice & Multi-Class Testing',
          startTimeUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}T09:00:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'hyperpole'),
          eventId,
          sessionType: 'QUALIFYING',
          name: 'Hyperpole Shootout (Hypercar & LMGT3)',
          startTimeUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}T14:30:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
        {
          sessionId: buildSessionId(eventId, 'race'),
          eventId,
          sessionType: 'RACE',
          name: `${r.officialTitle || 'WEC Race'} (${durationType.toUpperCase()})`,
          startTimeUtc: r.dates ? `${r.dates.split('–')[1]?.trim()}T11:00:00Z` : new Date().toISOString(),
          status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
          provenance,
        },
      ];

      return {
        eventId,
        championshipId: 'wec',
        season,
        round: roundNum,
        officialName: r.officialTitle || `FIA WEC Round ${roundNum}`,
        circuitId,
        circuitName: r.circuitName || 'World Circuit',
        country: r.country || 'International',
        countryFlag: r.flag || '🏁',
        location: r.location || r.country || 'International',
        formatType: 'ENDURANCE',
        startDateUtc: r.dates ? `${r.dates.split('–')[0]?.trim()}` : new Date().toISOString(),
        endDateUtc: r.dates ? `${r.dates.split('–')[1]?.trim()}` : new Date().toISOString(),
        status: r.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
        sessions,
        provenance,
      };
    });
  }

  /**
   * Normalizes car entries, driver rosters, and FIA driver categorizations across Hypercar and LMGT3.
   */
  public static normalizeEntries(
    rawDriversStandings?: any[],
    rawTeamsStandings?: any[],
    sourceId: string = 'fia-wec-official'
  ): NormalizedWecEntry[] {
    const driversData = Array.isArray(rawDriversStandings) && rawDriversStandings.length > 0
      ? rawDriversStandings
      : wecData.driversStandings;

    const teamsData = Array.isArray(rawTeamsStandings) && rawTeamsStandings.length > 0
      ? rawTeamsStandings
      : wecData.teamsStandings;

    const entriesMap = new Map<number, NormalizedWecEntry>();

    for (const d of driversData) {
      const carNumber = Number(d.carNumber) || 1;
      const classId: WecClassId = (d.racingClass || 'Hypercar').toLowerCase() === 'lmgt3' ? 'lmgt3' : 'hypercar';
      const teamId = resolveTeamId(d.teamName);
      const teamName = d.teamName || 'WEC Team';

      // Find team metadata for manufacturer & car model
      const teamMeta = teamsData.find(
        (t: any) => resolveTeamId(t.teamName) === teamId || t.teamName?.toLowerCase() === teamName.toLowerCase()
      );

      const carModel = teamMeta?.carModel || (classId === 'hypercar' ? 'Le Mans Prototype' : 'GT3 Race Car');
      const manufacturer = teamMeta?.carModel?.split(' ')[0] || teamName.split(' ')[0] || 'Manufacturer';
      const tyreManufacturer = classId === 'hypercar' ? 'Michelin' : 'Goodyear';

      // Parse primary driver
      const primaryDriverId = resolveDriverId(d.driverName);
      const primaryRating: DriverRating = (d.driverGrade?.toLowerCase() as DriverRating) || (classId === 'hypercar' ? 'platinum' : 'silver');

      const lineup: WecDriverLineupMember[] = [
        {
          driverId: primaryDriverId,
          name: d.driverName,
          driverCode: d.driverCode,
          rating: primaryRating,
          nationality: d.nationality,
        },
      ];

      // Parse co-drivers
      if (Array.isArray(d.coDrivers)) {
        for (const co of d.coDrivers) {
          const coStr = String(co);
          let rating: DriverRating = classId === 'hypercar' ? 'platinum' : 'bronze';
          if (coStr.toLowerCase().includes('(bronze)') || coStr.toLowerCase().includes('(b)')) rating = 'bronze';
          else if (coStr.toLowerCase().includes('(silver)') || coStr.toLowerCase().includes('(s)')) rating = 'silver';
          else if (coStr.toLowerCase().includes('(gold)') || coStr.toLowerCase().includes('(g)')) rating = 'gold';
          else if (coStr.toLowerCase().includes('(platinum)') || coStr.toLowerCase().includes('(p)')) rating = 'platinum';

          const cleanName = coStr.replace(/\s*\([^)]*\)/g, '').trim();
          const coDriverId = resolveDriverId(cleanName);

          lineup.push({
            driverId: coDriverId,
            name: cleanName,
            rating,
          });
        }
      }

      const bop = classId === 'hypercar'
        ? { minWeightKg: 1045, maxPowerKw: 505, maxEnergyPerStintMj: 900 }
        : { minWeightKg: 1330, maxPowerKw: 400, maxEnergyPerStintMj: 680 };

      entriesMap.set(carNumber, {
        entryId: `wec-${classId}-${carNumber}`,
        carNumber,
        classId,
        teamId,
        teamName,
        manufacturer,
        carModel,
        tyreManufacturer,
        drivers: lineup,
        bop,
      });
    }

    return Array.from(entriesMap.values());
  }

  /**
   * Normalizes FIA WEC Driver and Manufacturer/Team standings.
   */
  public static normalizeStandings(
    season: number = 2026,
    rawDrivers?: any[],
    rawTeams?: any[],
    sourceId: string = 'fia-wec-official'
  ): {
    driverStandings: (NormalizedDriverStanding & { racingClass: WecClassId; driverGrade: DriverRating; coDrivers?: string[] })[];
    constructorStandings: (NormalizedConstructorStanding & { racingClass: WecClassId; carModel?: string })[];
  } {
    const drivers = Array.isArray(rawDrivers) && rawDrivers.length > 0 ? rawDrivers : wecData.driversStandings;
    const teams = Array.isArray(rawTeams) && rawTeams.length > 0 ? rawTeams : wecData.teamsStandings;
    const provenance = createProvenanceMetadata(sourceId);

    const driverStandings = drivers.map((d: any, idx: number) => {
      const driverId = resolveDriverId(d.driverName);
      const teamId = resolveTeamId(d.teamName);
      const racingClass: WecClassId = (d.racingClass || '').toLowerCase() === 'lmgt3' ? 'lmgt3' : 'hypercar';
      const driverGrade: DriverRating = (d.driverGrade?.toLowerCase() as DriverRating) || (racingClass === 'hypercar' ? 'platinum' : 'silver');

      const driverCode = (d.driverCode || driverId.slice(0, 3)).toUpperCase();

      return {
        standingId: `wec-${season}-driver-${driverId}`,
        championshipId: 'wec',
        season,
        position: Number(d.rank) || idx + 1,
        driverId,
        driverName: d.driverName || driverId,
        driverCode,
        teamId,
        teamName: d.teamName || 'WEC Team',
        constructorId: teamId,
        constructorName: d.teamName || 'WEC Team',
        points: Number(d.points) || 0,
        wins: Number(d.wins) || 0,
        podiums: Number(d.podiums) || 0,
        racingClass,
        driverGrade,
        coDrivers: Array.isArray(d.coDrivers) ? d.coDrivers : undefined,
        provenance,
      };
    });

    const constructorStandings = teams.map((t: any, idx: number) => {
      const constructorId = resolveTeamId(t.teamName);
      const racingClass: WecClassId = (t.racingClass || '').toLowerCase() === 'lmgt3' ? 'lmgt3' : 'hypercar';

      return {
        standingId: `wec-${season}-team-${constructorId}`,
        championshipId: 'wec',
        season,
        position: Number(t.rank) || idx + 1,
        teamId: constructorId,
        teamName: t.teamName || constructorId,
        constructorId,
        constructorName: t.teamName || constructorId,
        points: Number(t.points) || 0,
        wins: Number(t.wins) || 0,
        podiums: Number(t.podiums) || 0,
        racingClass,
        carModel: t.carModel,
        provenance,
      };
    });

    return { driverStandings, constructorStandings };
  }
}

/**
 * The Grid — Formula 1 Reference Vertical Normalizer
 * 
 * Ingests external F1 datasets (Jolpica/Ergast format, F1DB, or official feeds)
 * and normalizes them into The Grid's authoritative data contracts with
 * provenance metadata, stable identifiers, and circuit normalization.
 */

import {
  NormalizedEvent,
  NormalizedSession,
  NormalizedDriver,
  NormalizedTeam,
  NormalizedSessionResult,
  NormalizedResultEntry,
  NormalizedDriverStanding,
  NormalizedConstructorStanding,
  ResultStatus,
  DriverRaceStatus,
} from '../../../types/dataContract';
import { createProvenanceMetadata } from '../sourceRegistry';
import {
  resolveDriverId,
  resolveTeamId,
  resolveCircuitId,
  buildEventId,
  buildSessionId,
} from '../identifierRegistry';
import { DataValidator } from '../validation/dataValidator';

const COUNTRY_FLAGS: Record<string, string> = {
  australia: '🇦🇺',
  china: '🇨🇳',
  bahrain: '🇧🇭',
  'saudi arabia': '🇸🇦',
  japan: '🇯🇵',
  usa: '🇺🇸',
  'united states': '🇺🇸',
  italy: '🇮🇹',
  monaco: '🇲🇨',
  canada: '🇨🇦',
  spain: '🇪🇸',
  austria: '🇦🇹',
  uk: '🇬🇧',
  'united kingdom': '🇬🇧',
  hungary: '🇭🇺',
  belgium: '🇧🇪',
  netherlands: '🇳🇱',
  azerbaijan: '🇦🇿',
  singapore: '🇸🇬',
  mexico: '🇲🇽',
  brazil: '🇧🇷',
  qatar: '🇶🇦',
  uae: '🇦🇪',
  'abu dhabi': '🇦🇪',
  india: '🇮🇳',
};

function getCountryFlag(country?: string): string {
  if (!country) return '🏁';
  const c = country.toLowerCase().trim();
  return COUNTRY_FLAGS[c] || '🏁';
}

function parseUtcIso(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  if (timeStr) {
    const cleanTime = timeStr.endsWith('Z') ? timeStr : `${timeStr}Z`;
    return `${dateStr}T${cleanTime}`;
  }
  return `${dateStr}T12:00:00Z`;
}

export class F1Normalizer {
  /**
   * Normalizes a single F1 race weekend into NormalizedEvent.
   */
  public static normalizeEvent(raw: any, sourceId: string = 'jolpica-f1'): NormalizedEvent {
    const season = Number(raw.season) || 2026;
    const round = Number(raw.round) || 1;
    const eventId = buildEventId('f1', season, round);

    const hasSprint = Boolean(raw.Sprint || raw.SprintQualifying || raw.SprintShootout);
    const formatType = hasSprint ? 'SPRINT' : 'NORMAL';

    const sessions = this.normalizeSessions(raw, eventId, sourceId);

    // Determine event bounds
    const sessionTimes = sessions
      .map(s => new Date(s.startTimeUtc).getTime())
      .filter(t => !isNaN(t));

    const startMs = sessionTimes.length > 0 ? Math.min(...sessionTimes) : Date.now();
    const endMs = sessionTimes.length > 0 ? Math.max(...sessionTimes) + 4 * 3600000 : startMs + 3 * 86400000;

    const country = raw.Circuit?.Location?.country || raw.country || 'World Championship';
    const rawCircuit = raw.Circuit || {
      id: raw.circuitId,
      name: raw.circuitName,
      locality: raw.locality,
      country,
    };
    const circuitId = resolveCircuitId(rawCircuit);
    const circuitName = raw.Circuit?.circuitName || raw.circuitName || 'Grand Prix Circuit';
    const officialName = raw.raceName || `Formula 1 Round ${round} Grand Prix`;

    const now = Date.now();
    let status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
    if (now > endMs) {
      status = 'COMPLETED';
    } else if (now >= startMs && now <= endMs) {
      status = 'ONGOING';
    }

    const event: NormalizedEvent = {
      eventId,
      championshipId: 'f1',
      season,
      round,
      officialName,
      circuitId,
      circuitName,
      country,
      countryFlag: getCountryFlag(country),
      location: raw.Circuit?.Location?.locality || raw.location || country,
      formatType,
      startDateUtc: new Date(startMs).toISOString(),
      endDateUtc: new Date(endMs).toISOString(),
      status,
      sessions,
      provenance: createProvenanceMetadata(sourceId),
    };

    // Boundary validation
    const validation = DataValidator.validateEvent(event);
    if (!validation.isValid) {
      console.warn(`[F1Normalizer] Validation warnings for event ${eventId}:`, validation.errors);
    }

    return event;
  }

  /**
   * Normalizes an entire season calendar into an array of NormalizedEvents.
   */
  public static normalizeCalendar(rawRaces: any[], sourceId: string = 'jolpica-f1'): NormalizedEvent[] {
    if (!Array.isArray(rawRaces)) return [];
    return rawRaces.map(race => this.normalizeEvent(race, sourceId));
  }

  /**
   * Normalizes sessions for a given race weekend.
   */
  public static normalizeSessions(
    raw: any,
    eventId: string,
    sourceId: string = 'jolpica-f1'
  ): NormalizedSession[] {
    const sessions: NormalizedSession[] = [];
    const provenance = createProvenanceMetadata(sourceId);
    const hasSprint = Boolean(raw.Sprint || raw.SprintQualifying || raw.SprintShootout);

    // 1. FP1
    if (raw.FirstPractice) {
      const startTimeUtc = parseUtcIso(raw.FirstPractice.date, raw.FirstPractice.time);
      sessions.push({
        sessionId: buildSessionId(eventId, 'fp1'),
        eventId,
        sessionType: 'FP1',
        name: 'Practice 1',
        startTimeUtc,
        endTimeUtc: new Date(new Date(startTimeUtc).getTime() + 60 * 60000).toISOString(),
        status: 'UPCOMING',
        provenance,
      });
    }

    if (hasSprint) {
      // Sprint Format: Sprint Qualifying + Sprint Race
      const sq = raw.SprintQualifying || raw.SprintShootout;
      if (sq) {
        const startTimeUtc = parseUtcIso(sq.date, sq.time);
        sessions.push({
          sessionId: buildSessionId(eventId, 'sprint-qualifying'),
          eventId,
          sessionType: 'SPRINT_QUALIFYING',
          name: 'Sprint Qualifying',
          startTimeUtc,
          endTimeUtc: new Date(new Date(startTimeUtc).getTime() + 45 * 60000).toISOString(),
          status: 'UPCOMING',
          provenance,
        });
      }

      if (raw.Sprint) {
        const startTimeUtc = parseUtcIso(raw.Sprint.date, raw.Sprint.time);
        sessions.push({
          sessionId: buildSessionId(eventId, 'sprint'),
          eventId,
          sessionType: 'SPRINT',
          name: 'Sprint',
          startTimeUtc,
          endTimeUtc: new Date(new Date(startTimeUtc).getTime() + 60 * 60000).toISOString(),
          status: 'UPCOMING',
          provenance,
        });
      }
    } else {
      // Normal Format: FP2 + FP3
      if (raw.SecondPractice) {
        const startTimeUtc = parseUtcIso(raw.SecondPractice.date, raw.SecondPractice.time);
        sessions.push({
          sessionId: buildSessionId(eventId, 'fp2'),
          eventId,
          sessionType: 'FP2',
          name: 'Practice 2',
          startTimeUtc,
          endTimeUtc: new Date(new Date(startTimeUtc).getTime() + 60 * 60000).toISOString(),
          status: 'UPCOMING',
          provenance,
        });
      }

      if (raw.ThirdPractice) {
        const startTimeUtc = parseUtcIso(raw.ThirdPractice.date, raw.ThirdPractice.time);
        sessions.push({
          sessionId: buildSessionId(eventId, 'fp3'),
          eventId,
          sessionType: 'FP3',
          name: 'Practice 3',
          startTimeUtc,
          endTimeUtc: new Date(new Date(startTimeUtc).getTime() + 60 * 60000).toISOString(),
          status: 'UPCOMING',
          provenance,
        });
      }
    }

    // Qualifying
    if (raw.Qualifying) {
      const startTimeUtc = parseUtcIso(raw.Qualifying.date, raw.Qualifying.time);
      sessions.push({
        sessionId: buildSessionId(eventId, 'qualifying'),
        eventId,
        sessionType: 'QUALIFYING',
        name: hasSprint ? 'Grand Prix Qualifying' : 'Qualifying',
        startTimeUtc,
        endTimeUtc: new Date(new Date(startTimeUtc).getTime() + 60 * 60000).toISOString(),
        status: 'UPCOMING',
        provenance,
      });
    }

    // Grand Prix Main Race
    const raceStartTimeUtc = parseUtcIso(raw.date, raw.time);
    sessions.push({
      sessionId: buildSessionId(eventId, 'race'),
      eventId,
      sessionType: 'RACE',
      name: raw.raceName || 'Grand Prix Race',
      startTimeUtc: raceStartTimeUtc,
      endTimeUtc: new Date(new Date(raceStartTimeUtc).getTime() + 120 * 60000).toISOString(),
      status: 'UPCOMING',
      provenance,
    });

    return sessions;
  }

  /**
   * Normalizes driver entries into NormalizedDriver[].
   */
  public static normalizeDrivers(rawDrivers: any[], sourceId: string = 'jolpica-f1'): NormalizedDriver[] {
    if (!Array.isArray(rawDrivers)) return [];
    const provenance = createProvenanceMetadata(sourceId);

    const drivers = rawDrivers.map(d => {
      const rawId = d.driverId || d.id || `${d.givenName}_${d.familyName}`;
      const driverId = resolveDriverId(rawId);
      const firstName = d.givenName || d.firstName || '';
      const lastName = d.familyName || d.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || driverId;
      const code = (d.code || lastName.slice(0, 3)).toUpperCase();
      const number = Number(d.permanentNumber || d.number) || 0;
      const nationality = d.nationality || 'International';
      const countryFlag = getCountryFlag(nationality);
      const currentTeamId = resolveTeamId(d.team || d.Constructor?.constructorId || d.constructorId);

      return {
        driverId,
        code,
        firstName,
        lastName,
        fullName,
        number,
        nationality,
        countryFlag,
        currentTeamId,
        externalIds: {
          jolpica: String(rawId).toLowerCase(),
        },
        provenance,
      };
    });

    const validation = DataValidator.validateDrivers(drivers);
    if (!validation.isValid) {
      console.warn('[F1Normalizer] Drivers validation warnings:', validation.errors);
    }

    return drivers;
  }

  /**
   * Normalizes constructor / team entries into NormalizedTeam[].
   */
  public static normalizeTeams(rawTeams: any[], sourceId: string = 'jolpica-f1'): NormalizedTeam[] {
    if (!Array.isArray(rawTeams)) return [];
    const provenance = createProvenanceMetadata(sourceId);

    const teams = rawTeams.map(t => {
      const rawId = t.constructorId || t.id || t.name;
      const teamId = resolveTeamId(rawId);
      const name = t.name || teamId;
      const shortName = t.shortName || name.split(' ')[0];
      const country = t.nationality || t.country || 'Global';

      return {
        teamId,
        name,
        shortName,
        color: t.color || '#e10600',
        textColor: t.textColor || '#ffffff',
        country,
        countryFlag: getCountryFlag(country),
        powerUnit: t.powerUnit || undefined,
        externalIds: {
          jolpica: String(rawId).toLowerCase(),
        },
        provenance,
      };
    });

    const validation = DataValidator.validateTeams(teams);
    if (!validation.isValid) {
      console.warn('[F1Normalizer] Teams validation warnings:', validation.errors);
    }

    return teams;
  }

  /**
   * Normalizes session results supporting PROVISIONAL -> OFFICIAL -> AMENDED lifecycle.
   */
  public static normalizeSessionResult(
    rawResult: any,
    sessionId: string,
    eventId: string,
    options: {
      resultStatus?: ResultStatus;
      versionNumber?: number;
      stewardNotes?: string;
      sourceId?: string;
    } = {}
  ): NormalizedSessionResult {
    const {
      resultStatus = 'OFFICIAL',
      versionNumber = 1,
      stewardNotes,
      sourceId = 'jolpica-f1',
    } = options;

    const rawEntries = rawResult.Results || rawResult.entries || rawResult.results || [];
    const entries: NormalizedResultEntry[] = rawEntries.map((re: any) => {
      const position = Number(re.position) || Number(re.pos) || 1;
      const gridPosition = Number(re.grid) || undefined;
      const driverId = resolveDriverId(re.Driver?.driverId || re.driverId || re.driver);
      const teamId = resolveTeamId(re.Constructor?.constructorId || re.teamId || re.constructor);
      const lapsCompleted = Number(re.laps) || 0;
      const pointsEarned = Number(re.points) || 0;

      let status: DriverRaceStatus = 'FINISHED';
      const rawStatus = (re.status || '').toUpperCase();
      if (rawStatus.includes('DISQUALIFIED') || rawStatus === 'DSQ') {
        status = 'DSQ';
      } else if (rawStatus.includes('DID NOT START') || rawStatus === 'DNS') {
        status = 'DNS';
      } else if (rawStatus.includes('ACCIDENT') || rawStatus.includes('COLLISION') || rawStatus.includes('RETIRED') || rawStatus.includes('ENGINE') || rawStatus.includes('BRAKES') || rawStatus.includes('GEARBOX')) {
        status = 'DNF';
      } else if (rawStatus && rawStatus !== 'FINISHED' && !rawStatus.startsWith('+')) {
        status = 'NC';
      }

      const timeOrDelta = re.Time?.time || re.time || undefined;
      const hasFastestLap = Boolean(re.FastestLap?.rank === '1' || re.hasFastestLap);

      return {
        position,
        gridPosition,
        driverId,
        driverName: re.Driver ? `${re.Driver.givenName} ${re.Driver.familyName}` : undefined,
        driverCode: re.Driver?.code || undefined,
        teamId,
        teamName: re.Constructor?.name || undefined,
        status,
        lapsCompleted,
        timeOrDelta,
        pointsEarned,
        hasFastestLap,
        notes: re.notes || undefined,
      };
    });

    const resultId = `res-${sessionId}-v${versionNumber}`;
    const sessionResult: NormalizedSessionResult = {
      resultId,
      sessionId,
      eventId,
      resultStatus,
      versionNumber,
      publishedAtUtc: rawResult.publishedAt || new Date().toISOString(),
      stewardNotes,
      entries,
      provenance: createProvenanceMetadata(sourceId, `v${versionNumber}`),
    };

    const validation = DataValidator.validateSessionResult(sessionResult);
    if (!validation.isValid) {
      console.warn(`[F1Normalizer] SessionResult validation warnings for ${resultId}:`, validation.errors);
    }

    return sessionResult;
  }

  /**
   * Normalizes Driver and Constructor standings from API feeds.
   */
  public static normalizeStandings(
    rawStandings: any,
    season: number = 2026,
    sourceId: string = 'jolpica-f1'
  ): {
    drivers: NormalizedDriverStanding[];
    constructors: NormalizedConstructorStanding[];
  } {
    const provenance = createProvenanceMetadata(sourceId);

    const rawDriverList =
      rawStandings?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ||
      rawStandings?.drivers ||
      [];

    const drivers: NormalizedDriverStanding[] = rawDriverList.map((ds: any) => {
      const position = Number(ds.position) || 1;
      const driverId = resolveDriverId(ds.Driver?.driverId || ds.driverId);
      const driverName = ds.Driver ? `${ds.Driver.givenName} ${ds.Driver.familyName}` : ds.driverName || driverId;
      const driverCode = ds.Driver?.code || ds.driverCode || 'DRV';
      const teamId = resolveTeamId(ds.Constructors?.[0]?.constructorId || ds.teamId);
      const teamName = ds.Constructors?.[0]?.name || ds.teamName || teamId;
      const points = Number(ds.points) || 0;
      const wins = Number(ds.wins) || 0;
      const podiums = Number(ds.podiums) || 0;

      return {
        position,
        driverId,
        driverName,
        driverCode,
        teamId,
        teamName,
        points,
        wins,
        podiums,
        season,
        provenance,
      };
    });

    const rawConstructorList =
      rawStandings?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ||
      rawStandings?.constructors ||
      [];

    const constructors: NormalizedConstructorStanding[] = rawConstructorList.map((cs: any) => {
      const position = Number(cs.position) || 1;
      const teamId = resolveTeamId(cs.Constructor?.constructorId || cs.teamId);
      const teamName = cs.Constructor?.name || cs.teamName || teamId;
      const points = Number(cs.points) || 0;
      const wins = Number(cs.wins) || 0;
      const podiums = Number(cs.podiums) || 0;

      return {
        position,
        teamId,
        teamName,
        points,
        wins,
        podiums,
        season,
        provenance,
      };
    });

    return { drivers, constructors };
  }
}

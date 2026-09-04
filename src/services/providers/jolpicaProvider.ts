import { RaceWeekend, Session, WeekendType } from '../../types';
import { F1DataProvider } from './f1DataProvider';

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
};

function getFlag(country: string): string {
  if (!country) return '🏁';
  const c = country.toLowerCase().trim();
  return COUNTRY_FLAGS[c] || '🏁';
}

function parseUtcTimestamp(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  if (timeStr) {
    // Standardize e.g. "15:00:00Z" or "15:00:00"
    const cleanTime = timeStr.endsWith('Z') ? timeStr : `${timeStr}Z`;
    return `${dateStr}T${cleanTime}`;
  }
  return `${dateStr}T12:00:00Z`;
}

export class JolpicaF1Provider implements F1DataProvider {
  public readonly providerName = 'JOLPICA_F1';
  private readonly baseUrls = [
    'https://api.jolpi.ca/ergast/f1',
    'https://api.jolpica.net/ergast/f1',
  ];

  private async fetchWithFallback(endpoint: string): Promise<any> {
    let lastError: any = null;
    for (const base of this.baseUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${base}${endpoint}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        lastError = err;
      }
    }
    throw new Error(`Jolpica F1 API failed across all mirrors for endpoint "${endpoint}": ${lastError?.message || 'Unknown network error'}`);
  }

  public async getSeasonCalendar(season: number): Promise<RaceWeekend[]> {
    const data = await this.fetchWithFallback(`/${season}.json?limit=100`);
    const races = data?.MRData?.RaceTable?.Races || [];
    return races.map((rawRace: any) => this.normalizeRaceWeekend(rawRace));
  }

  public async getRaceWeekend(season: number, round: number): Promise<RaceWeekend> {
    const data = await this.fetchWithFallback(`/${season}/${round}.json`);
    const races = data?.MRData?.RaceTable?.Races || [];
    if (!races[0]) {
      throw new Error(`Race weekend not found for season ${season}, round ${round}`);
    }
    return this.normalizeRaceWeekend(races[0]);
  }

  /**
   * Transforms raw Jolpica/Ergast race structure into normalized internal model
   */
  public normalizeRaceWeekend(raw: any): RaceWeekend {
    const season = Number(raw.season) || 2026;
    const round = Number(raw.round) || 1;
    const weekendId = `${season}_${round}`;

    const sessions: Session[] = [];

    // Check for Sprint sessions
    const hasSprint = Boolean(raw.Sprint || raw.SprintQualifying || raw.SprintShootout);
    const weekendType: WeekendType = hasSprint ? 'SPRINT' : 'NORMAL';

    // 1. Practice 1
    if (raw.FirstPractice) {
      sessions.push({
        id: `${weekendId}_FP1`,
        sessionId: `${weekendId}_FP1`,
        raceWeekendId: weekendId,
        type: 'FP1',
        sessionType: 'FP1',
        name: 'Practice 1',
        startTime: parseUtcTimestamp(raw.FirstPractice.date, raw.FirstPractice.time),
        status: 'UPCOMING',
        externalProvider: this.providerName,
        externalId: `${raw.season}_${raw.round}_FP1`,
      });
    }

    if (hasSprint) {
      // Sprint Weekend Format
      const sq = raw.SprintQualifying || raw.SprintShootout;
      if (sq) {
        sessions.push({
          id: `${weekendId}_SPRINT_QUALIFYING`,
          sessionId: `${weekendId}_SPRINT_QUALIFYING`,
          raceWeekendId: weekendId,
          type: 'SPRINT_QUALIFYING',
          sessionType: 'SPRINT_QUALIFYING',
          name: 'Sprint Qualifying',
          startTime: parseUtcTimestamp(sq.date, sq.time),
          status: 'UPCOMING',
          externalProvider: this.providerName,
          externalId: `${raw.season}_${raw.round}_SQ`,
        });
      }

      if (raw.Sprint) {
        sessions.push({
          id: `${weekendId}_SPRINT`,
          sessionId: `${weekendId}_SPRINT`,
          raceWeekendId: weekendId,
          type: 'SPRINT',
          sessionType: 'SPRINT',
          name: 'Sprint Race',
          startTime: parseUtcTimestamp(raw.Sprint.date, raw.Sprint.time),
          status: 'UPCOMING',
          externalProvider: this.providerName,
          externalId: `${raw.season}_${raw.round}_SPRINT`,
        });
      }
    } else {
      // Normal Weekend Format (FP2, FP3)
      if (raw.SecondPractice) {
        sessions.push({
          id: `${weekendId}_FP2`,
          sessionId: `${weekendId}_FP2`,
          raceWeekendId: weekendId,
          type: 'FP2',
          sessionType: 'FP2',
          name: 'Practice 2',
          startTime: parseUtcTimestamp(raw.SecondPractice.date, raw.SecondPractice.time),
          status: 'UPCOMING',
          externalProvider: this.providerName,
          externalId: `${raw.season}_${raw.round}_FP2`,
        });
      }

      if (raw.ThirdPractice) {
        sessions.push({
          id: `${weekendId}_FP3`,
          sessionId: `${weekendId}_FP3`,
          raceWeekendId: weekendId,
          type: 'FP3',
          sessionType: 'FP3',
          name: 'Practice 3',
          startTime: parseUtcTimestamp(raw.ThirdPractice.date, raw.ThirdPractice.time),
          status: 'UPCOMING',
          externalProvider: this.providerName,
          externalId: `${raw.season}_${raw.round}_FP3`,
        });
      }
    }

    // Qualifying
    if (raw.Qualifying) {
      sessions.push({
        id: `${weekendId}_QUALIFYING`,
        sessionId: `${weekendId}_QUALIFYING`,
        raceWeekendId: weekendId,
        type: 'QUALIFYING',
        sessionType: 'QUALIFYING',
        name: hasSprint ? 'Grand Prix Qualifying' : 'Qualifying',
        startTime: parseUtcTimestamp(raw.Qualifying.date, raw.Qualifying.time),
        status: 'UPCOMING',
        externalProvider: this.providerName,
        externalId: `${raw.season}_${raw.round}_QUALIFYING`,
      });
    }

    // Main Grand Prix Race
    const raceStartTime = parseUtcTimestamp(raw.date, raw.time);
    sessions.push({
      id: `${weekendId}_RACE`,
      sessionId: `${weekendId}_RACE`,
      raceWeekendId: weekendId,
      type: 'RACE',
      sessionType: 'RACE',
      name: raw.raceName || 'Grand Prix',
      startTime: raceStartTime,
      status: 'UPCOMING',
      externalProvider: this.providerName,
      externalId: `${raw.season}_${raw.round}_RACE`,
    });

    // Determine start and end dates of weekend
    const sessionTimes = sessions.map(s => new Date(s.startTime).getTime()).filter(t => !isNaN(t));
    const startMs = sessionTimes.length > 0 ? Math.min(...sessionTimes) : new Date().getTime();
    const endMs = sessionTimes.length > 0 ? Math.max(...sessionTimes) + 4 * 3600000 : startMs + 3 * 86400000;

    const country = raw.Circuit?.Location?.country || 'Global';
    const circuitName = raw.Circuit?.circuitName || 'Grand Prix Circuit';
    const circuitId = raw.Circuit?.circuitId || 'circuit';

    const now = Date.now();
    let status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
    if (now > endMs) {
      status = 'COMPLETED';
    } else if (now >= startMs && now <= endMs) {
      status = 'ONGOING';
    }

    return {
      id: weekendId,
      raceWeekendId: weekendId,
      season,
      round,
      roundNumber: round,
      name: raw.raceName || `Round ${round} Grand Prix`,
      raceName: raw.raceName || `Round ${round} Grand Prix`,
      country,
      circuit: {
        id: circuitId,
        name: circuitName,
        locality: raw.Circuit?.Location?.locality,
        country: raw.Circuit?.Location?.country,
        latitude: Number(raw.Circuit?.Location?.lat) || undefined,
        longitude: Number(raw.Circuit?.Location?.long) || undefined,
      },
      flag: getFlag(country),
      weekendType,
      startDate: new Date(startMs).toISOString(),
      endDate: new Date(endMs).toISOString(),
      status,
      sessions,
      externalProvider: this.providerName,
      externalId: `${season}_${round}`,
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

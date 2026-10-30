/**
 * The Grid — Formula 1 Authoritative Championship Service
 * 
 * Fetches, normalizes, and caches real-time / periodic official F1 championship data:
 * 1. World Drivers' Championship Standings
 * 2. World Constructors' Championship Standings
 * 3. Latest Completed Grand Prix Classification
 * 4. Multi-season archive support (2026 active, 2025, 2024, etc.)
 * 
 * Source: Official FIA Formula 1 records via Jolpica-F1 (Ergast Compatible API)
 * Mirrors: api.jolpi.ca / api.jolpica.net with offline cache fallback.
 */

import { ChampionshipDriverStanding, ChampionshipTeamStanding } from '../../types/motorsportDetail';
import { clientCache, CACHE_TTL } from '../cache/clientCache';

export interface F1RaceResultEntry {
  position: number;
  gridPosition?: number;
  driverName: string;
  driverCode?: string;
  driverNumber?: number | string;
  teamName: string;
  status: string; // 'Finished' | 'DNF' | 'DSQ' | 'DNS' | '+1 Lap' etc.
  points: number;
  timeOrDelta?: string;
  hasFastestLap?: boolean;
}

export interface F1RaceResultData {
  season: number;
  round: number;
  raceName: string;
  circuitName: string;
  country: string;
  date: string;
  isOfficial: boolean;
  entries: F1RaceResultEntry[];
}

export interface F1SeasonSnapshot {
  season: number;
  round: number;
  driversStandings: ChampionshipDriverStanding[];
  teamsStandings: ChampionshipTeamStanding[];
  latestRaceResult: F1RaceResultData | null;
  lastUpdated: string;
  isLive: boolean;
  source: string;
}

const JOLPICA_BASE_URLS = [
  'https://api.jolpi.ca/ergast/f1',
  'https://api.jolpica.net/ergast/f1',
];

const TEAM_COLOR_MAP: Record<string, string> = {
  mercedes: '#00d2be',
  ferrari: '#dc2626',
  'red bull': '#1e40af',
  mclaren: '#ff8000',
  'rb f1 team': '#6692ff',
  'racing bulls': '#6692ff',
  'alpine f1 team': '#0093cc',
  alpine: '#0093cc',
  'haas f1 team': '#b6babd',
  haas: '#b6babd',
  audi: '#52e252',
  'kick sauber': '#52e252',
  williams: '#00a0de',
  'aston martin': '#00594f',
  'cadillac f1 team': '#c5a059',
  cadillac: '#c5a059',
};

const NATIONALITY_FLAG_MAP: Record<string, string> = {
  italian: '🇮🇹',
  british: '🇬🇧',
  dutch: '🇳🇱',
  monegasque: '🇲🇨',
  australian: '🇦🇺',
  french: '🇫🇷',
  spanish: '🇪🇸',
  german: '🇩🇪',
  canadian: '🇨🇦',
  japanese: '🇯🇵',
  chinese: '🇨🇳',
  mexican: '🇲🇽',
  finnish: '🇫🇮',
  brazilian: '🇧🇷',
  argentine: '🇦🇷',
  thai: '🇹🇭',
  'new zealander': '🇳🇿',
  american: '🇺🇸',
  danish: '🇩🇰',
};

function getTeamColor(teamName?: string): string {
  if (!teamName) return '#94a3b8';
  const norm = teamName.toLowerCase();
  for (const [key, color] of Object.entries(TEAM_COLOR_MAP)) {
    if (norm.includes(key)) return color;
  }
  return '#94a3b8';
}

function getFlag(nationality?: string): string {
  if (!nationality) return '🏁';
  const norm = nationality.toLowerCase().trim();
  return NATIONALITY_FLAG_MAP[norm] || '🏁';
}

async function fetchFromJolpica(endpoint: string): Promise<any> {
  let lastError: any = null;
  for (const base of JOLPICA_BASE_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
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
  throw new Error(`Jolpica API mirror fetch failed: ${lastError?.message || 'Network error'}`);
}

/**
 * Normalizes Ergast / Jolpica Driver Standings response into THE GRDX ChampionshipDriverStanding model
 */
function normalizeDriverStandings(rawList: any[]): ChampionshipDriverStanding[] {
  return rawList.map(item => {
    const d = item.Driver || {};
    const team = item.Constructors?.[0] || {};
    const givenName = d.givenName || '';
    const familyName = d.familyName || '';
    const driverName = `${givenName} ${familyName}`.trim() || d.driverId || 'Driver';
    const nationality = d.nationality || 'Global';

    return {
      rank: Number(item.position) || 1,
      driverName,
      driverCode: d.code || familyName.slice(0, 3).toUpperCase(),
      carNumber: Number(d.permanentNumber || d.number) || 0,
      teamName: team.name || 'Constructor',
      nationality,
      points: Number(item.points) || 0,
      wins: Number(item.wins) || 0,
      podiums: Number(item.podiums) || 0,
      polePositions: Number(item.polePositions) || 0,
      fastestLaps: Number(item.fastestLaps) || 0,
    };
  });
}

/**
 * Normalizes Ergast / Jolpica Constructor Standings response
 */
function normalizeConstructorStandings(rawList: any[]): ChampionshipTeamStanding[] {
  return rawList.map(item => {
    const c = item.Constructor || {};
    const teamName = c.name || 'Constructor';
    const primaryColor = getTeamColor(teamName);

    return {
      rank: Number(item.position) || 1,
      teamName,
      points: Number(item.points) || 0,
      wins: Number(item.wins) || 0,
      podiums: Number(item.podiums) || 0,
      polePositions: Number(item.polePositions) || 0,
      country: c.nationality || 'World',
      countryCode: (c.nationality || 'WO').slice(0, 2).toUpperCase(),
      flag: getFlag(c.nationality),
      primaryColor,
      drivers: [],
    };
  });
}

/**
 * Normalizes latest race results response
 */
function normalizeRaceResult(rawRace: any): F1RaceResultData | null {
  if (!rawRace) return null;
  const rawEntries = rawRace.Results || [];

  const entries: F1RaceResultEntry[] = rawEntries.map((re: any) => {
    const d = re.Driver || {};
    const givenName = d.givenName || '';
    const familyName = d.familyName || '';
    const driverName = `${givenName} ${familyName}`.trim() || d.driverId || 'Driver';
    const team = re.Constructor?.name || 'Constructor';

    return {
      position: Number(re.position) || 99,
      gridPosition: Number(re.grid) || undefined,
      driverName,
      driverCode: d.code || familyName.slice(0, 3).toUpperCase(),
      driverNumber: re.number || d.permanentNumber,
      teamName: team,
      status: re.status || 'Finished',
      points: Number(re.points) || 0,
      timeOrDelta: re.Time?.time || undefined,
      hasFastestLap: Boolean(re.FastestLap?.rank === '1'),
    };
  });

  return {
    season: Number(rawRace.season) || 2026,
    round: Number(rawRace.round) || 1,
    raceName: rawRace.raceName || 'Formula 1 Grand Prix',
    circuitName: rawRace.Circuit?.circuitName || 'Grand Prix Circuit',
    country: rawRace.Circuit?.Location?.country || 'World',
    date: rawRace.date || new Date().toISOString().split('T')[0],
    isOfficial: true,
    entries,
  };
}

/**
 * Standings and Results Service
 */
export const f1ChampionshipService = {
  /**
   * Fetches Driver Standings for requested season (defaults to 2026 active)
   */
  async getDriverStandings(season: number = 2026): Promise<ChampionshipDriverStanding[]> {
    const cacheKey = `f1_official_driver_standings_${season}`;
    return clientCache.getOrFetch<ChampionshipDriverStanding[]>(
      cacheKey,
      async () => {
        try {
          const endpoint = season >= 2026 ? '/current/driverStandings.json' : `/${season}/driverStandings.json`;
          const json = await fetchFromJolpica(endpoint);
          const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
          if (Array.isArray(list) && list.length > 0) {
            return normalizeDriverStandings(list);
          }
        } catch (err) {
          console.warn(`[f1ChampionshipService] Remote fetch failed for ${season} driver standings:`, err);
        }
        // Fallback to static snapshot in f1Data
        const { f1Data } = await import('./data/f1Data');
        return f1Data.driversStandings;
      },
      { ttlMs: CACHE_TTL.STANDINGS }
    );
  },

  /**
   * Fetches Constructor Standings for requested season
   */
  async getConstructorStandings(season: number = 2026): Promise<ChampionshipTeamStanding[]> {
    const cacheKey = `f1_official_constructor_standings_${season}`;
    return clientCache.getOrFetch<ChampionshipTeamStanding[]>(
      cacheKey,
      async () => {
        try {
          const endpoint = season >= 2026 ? '/current/constructorStandings.json' : `/${season}/constructorStandings.json`;
          const json = await fetchFromJolpica(endpoint);
          const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
          if (Array.isArray(list) && list.length > 0) {
            return normalizeConstructorStandings(list);
          }
        } catch (err) {
          console.warn(`[f1ChampionshipService] Remote fetch failed for ${season} constructor standings:`, err);
        }
        // Fallback to static snapshot in f1Data
        const { f1Data } = await import('./data/f1Data');
        return f1Data.teamsStandings;
      },
      { ttlMs: CACHE_TTL.STANDINGS }
    );
  },

  /**
   * Fetches the latest completed Grand Prix results
   */
  async getLatestRaceResult(season: number = 2026, round?: number): Promise<F1RaceResultData | null> {
    const cacheKey = round ? `f1_race_result_${season}_${round}` : `f1_latest_race_result_${season}`;
    return clientCache.getOrFetch<F1RaceResultData | null>(
      cacheKey,
      async () => {
        try {
          const endpoint = round
            ? `/${season}/${round}/results.json`
            : season >= 2026
            ? '/current/last/results.json'
            : `/${season}/last/results.json`;
          const json = await fetchFromJolpica(endpoint);
          const rawRace = json?.MRData?.RaceTable?.Races?.[0];
          if (rawRace) {
            return normalizeRaceResult(rawRace);
          }
        } catch (err) {
          console.warn(`[f1ChampionshipService] Remote fetch failed for ${season} race result:`, err);
        }
        return null;
      },
      { ttlMs: CACHE_TTL.STANDINGS }
    );
  },

  /**
   * Returns a complete season snapshot combining driver standings, constructor standings,
   * latest official race classification, and provenance metadata.
   */
  async getSeasonSnapshot(season: number = 2026): Promise<F1SeasonSnapshot> {
    const cacheKey = `f1_season_snapshot_full_${season}`;
    return clientCache.getOrFetch<F1SeasonSnapshot>(
      cacheKey,
      async () => {
        const [drivers, teams, latestResult] = await Promise.all([
          this.getDriverStandings(season),
          this.getConstructorStandings(season),
          this.getLatestRaceResult(season),
        ]);

        const round = latestResult?.round || (drivers.length > 0 ? 18 : 1);
        const isLive = true;

        return {
          season,
          round,
          driversStandings: drivers,
          teamsStandings: teams,
          latestRaceResult: latestResult,
          lastUpdated: new Date().toISOString(),
          isLive,
          source: 'FIA / Formula 1 via Jolpica Open Data',
        };
      },
      { ttlMs: CACHE_TTL.STANDINGS }
    );
  },
};

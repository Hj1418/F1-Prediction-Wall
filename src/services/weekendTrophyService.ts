/**
 * The Grid — Weekend Trophies Service
 * 
 * Manages Gold, Silver, and Bronze permanent trophies awarded to P1, P2, and P3
 * in finalized Weekend Overall competitions.
 * 
 * Invariants:
 * - Trophies are awarded ONLY after a weekend's leaderboard is verified and finalized.
 * - Deterministic tie-breaking rules:
 *   1. Total weekend score
 *   2. Most exact P1 predictions in the weekend
 *   3. Most perfect podiums in the weekend
 *   4. Alphabetical tie-break by username
 * - Trophies are distinct from season rank and idempotent (keyed by `trophy_${weekendId}_${userId}`).
 */

import { WeekendTrophy, TrophyType, RaceWeekend, PredictionRound, LeaderboardEntry } from '../types';

export function evaluateWeekendTrophies(
  weekend: RaceWeekend,
  rounds: PredictionRound[],
  entries: LeaderboardEntry[],
  isFinalized: boolean
): WeekendTrophy[] {
  if (!isFinalized || !weekend || !entries || entries.length === 0) {
    return [];
  }

  // Ensure leaderboard entries are sorted by deterministic tie-breaking rules
  const sorted = [...entries].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if ((b.exactP1Count || 0) !== (a.exactP1Count || 0)) return (b.exactP1Count || 0) - (a.exactP1Count || 0);
    if ((b.perfectPodiumCount || 0) !== (a.perfectPodiumCount || 0)) return (b.perfectPodiumCount || 0) - (a.perfectPodiumCount || 0);
    return (a.username || '').localeCompare(b.username || '');
  });

  const weekendId = weekend.raceWeekendId || weekend.id || '';
  const eventName = weekend.raceName || weekend.name || 'Grand Prix';
  const circuitName = typeof weekend.circuit === 'object' ? weekend.circuit?.name : (weekend.circuit || '');
  const season = weekend.season || 2026;
  const nowIso = new Date().toISOString();

  const trophies: WeekendTrophy[] = [];
  const trophyTypes: TrophyType[] = ['GOLD', 'SILVER', 'BRONZE'];

  // Award top 3 placements provided they earned positive points
  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    const entry = sorted[i];
    if (entry.totalPoints <= 0) continue;

    const rank = i + 1;
    const trophyType = trophyTypes[i];

    trophies.push({
      trophyId: `trophy_${weekendId}_${entry.userId}`,
      userId: entry.userId,
      season,
      raceWeekendId: weekendId,
      eventName,
      circuitName,
      trophyType,
      rank,
      points: entry.totalPoints,
      awardedAt: nowIso,
      resultReference: `res_ref_${weekendId}`,
    });
  }

  return trophies;
}

const STORAGE_KEY_PREFIX = 'thegrid_trophies_';

export const weekendTrophyService = {
  /**
   * Retrieves trophies awarded to a specific user across all finalized weekends.
   */
  async getUserTrophies(
    userId: string,
    weekends: RaceWeekend[],
    rounds: PredictionRound[],
    fetchWeekendLeaderboard: (weekendId: string) => Promise<LeaderboardEntry[]>
  ): Promise<WeekendTrophy[]> {
    if (!userId) return [];

    // Check localStorage cache first
    const cacheKey = `${STORAGE_KEY_PREFIX}${userId}`;
    let cachedTrophies: WeekendTrophy[] = [];
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) cachedTrophies = JSON.parse(raw);
    } catch (_) {}

    // Identify finalized weekends
    const finalizedWeekends = weekends.filter(w => {
      const wId = w.raceWeekendId || w.id;
      const wRounds = rounds.filter(r => r.raceWeekendId === wId || (r as any).weekendId === wId);
      return wRounds.some(r => r.status === 'SCORED');
    });

    const trophyMap = new Map<string, WeekendTrophy>();
    cachedTrophies.forEach(t => trophyMap.set(t.trophyId, t));

    for (const w of finalizedWeekends) {
      const wId = w.raceWeekendId || w.id || '';
      const wRounds = rounds.filter(r => r.raceWeekendId === wId || (r as any).weekendId === wId);
      const isFinalized = wRounds.some(r => r.status === 'SCORED');

      try {
        const lb = await fetchWeekendLeaderboard(wId);
        const awarded = evaluateWeekendTrophies(w, wRounds, lb, isFinalized);
        const userTrophy = awarded.find(t => t.userId === userId);
        if (userTrophy) {
          trophyMap.set(userTrophy.trophyId, userTrophy);
        }
      } catch (err) {
        console.warn(`Could not evaluate trophies for weekend ${wId}:`, err);
      }
    }

    const result = Array.from(trophyMap.values()).sort((a, b) => {
      return new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime();
    });

    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (_) {}

    return result;
  },
};

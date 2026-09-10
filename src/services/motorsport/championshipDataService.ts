/**
 * The Grid — Dynamic Motorsport Championship Data Service
 * 
 * Architectural Invariant:
 * "Each new category should be independently loaded.
 *  Visiting /championships/f2 should not cause F3, F4, Formula E, or WEC data to download.
 *  Only F2's required data should be requested."
 * 
 * Code-split dynamic loader wrapped in clientCache with STATIC TTL.
 */

import { ChampionshipDetailData } from '../../types/motorsportDetail';
import { clientCache, CACHE_TTL } from '../cache/clientCache';

export async function getChampionshipDetail(
  championshipId: string
): Promise<ChampionshipDetailData | null> {
  const normalizedId = championshipId.toLowerCase().trim();
  const cacheKey = `championship_detail_${normalizedId}`;

  return clientCache.getOrFetch<ChampionshipDetailData | null>(
    cacheKey,
    async () => {
      switch (normalizedId) {
        case 'f2': {
          const { f2Data } = await import('./data/f2Data');
          return f2Data;
        }
        case 'f3': {
          const { f3Data } = await import('./data/f3Data');
          return f3Data;
        }
        case 'f4': {
          const { f4Data } = await import('./data/f4Data');
          return f4Data;
        }
        case 'formula-e': {
          const { formulaEData } = await import('./data/formulaEData');
          return formulaEData;
        }
        case 'wec': {
          const { wecData } = await import('./data/wecData');
          return wecData;
        }
        case 'gt-world-challenge': {
          const { gtWorldChallengeData } = await import('./data/gtWorldChallengeData');
          return gtWorldChallengeData;
        }
        case 'wrc': {
          const { wrcData } = await import('./data/wrcData');
          return wrcData;
        }
        case 'motogp': {
          const { motogpData } = await import('./data/motogpData');
          return motogpData;
        }
        default:
          return null;
      }
    },
    { ttlMs: CACHE_TTL.STATIC }
  );
}

/**
 * Returns the Indian Motorsport Ecosystem dataset
 */
export async function getIndianMotorsportEcosystem() {
  const cacheKey = 'indian_motorsport_ecosystem';
  return clientCache.getOrFetch(
    cacheKey,
    async () => {
      const { indianMotorsportData } = await import('./data/indianMotorsportData');
      return indianMotorsportData;
    },
    { ttlMs: CACHE_TTL.STATIC }
  );
}

/**
 * Returns whether a championship has rich deep data ready
 */
export function isChampionshipDataReady(championshipId: string): boolean {
  const readyIds = ['f2', 'f3', 'f4', 'formula-e', 'wec', 'gt-world-challenge', 'wrc', 'motogp', 'indian-motorsport'];
  return readyIds.includes(championshipId.toLowerCase().trim());
}

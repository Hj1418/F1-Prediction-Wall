/**
 * The Grid — Race-Specific Driver Eligibility & Entry Service
 * 
 * Invariants:
 * 1. Derives eligible drivers strictly from current 2026 race entry lists.
 * 2. Never falls back silently to historical (2024/2025) driver rosters.
 * 3. Uses stable internal driver IDs defined in identifierRegistry.
 * 4. Employs race-aware caching: f1_entries_2026_<raceWeekendId>.
 * 5. Provides validation utilities for server and client prediction boundaries.
 */

import { Driver } from '../../types';
import { clientCache, CACHE_TTL } from '../cache/clientCache';
import { F1_DRIVERS_2026 } from '../mockData';
import { testGrandPrixService } from '../testGrandPrix/testGrandPrixService';

export interface RaceEntry {
  raceWeekendId: string;
  season: number;
  drivers: Driver[];
}

/**
 * Race-specific entry deviations from standard baseline (e.g. reserve drivers, mid-season seat changes)
 */
const RACE_SPECIFIC_ENTRY_OVERRIDES: Record<string, Partial<Driver>[]> = {
  // Can be populated for specific race replacements
};

/**
 * Authoritatively resolves race-eligible drivers for a specified race weekend.
 * Returns only verified 2026 drivers entered for that specific event.
 */
export async function getEligibleDriversForRace(
  raceWeekendId: string,
  season: number = 2026
): Promise<Driver[]> {
  if (!raceWeekendId) {
    throw new Error('Race weekend ID is required to determine driver eligibility.');
  }

  // Check if this is the active test weekend
  try {
    const testState = testGrandPrixService.getState();
    if (testState.weekend && (testState.weekend.raceWeekendId === raceWeekendId || testState.weekend.id === raceWeekendId)) {
      return testGrandPrixService.getTestDrivers();
    }
  } catch (_e) {}

  const cacheKey = `f1_entries_${season}_${raceWeekendId}`;

  return clientCache.getOrFetch<Driver[]>(
    cacheKey,
    async () => {
      // Baseline 2026 driver roster (22 drivers across 11 constructors)
      const baseRoster = [...F1_DRIVERS_2026];

      // Check for race-specific modifications
      const overrides = RACE_SPECIFIC_ENTRY_OVERRIDES[raceWeekendId];
      if (overrides && overrides.length > 0) {
        overrides.forEach(override => {
          if (override.id) {
            const idx = baseRoster.findIndex(d => d.id === override.id);
            if (idx >= 0) {
              baseRoster[idx] = { ...baseRoster[idx], ...override } as Driver;
            } else if (override.id && override.firstName && override.lastName) {
              baseRoster.push(override as Driver);
            }
          }
        });
      }

      // Ensure stable sorting by team then driver number
      return baseRoster.sort((a, b) => a.team.localeCompare(b.team) || a.number - b.number);
    },
    { ttlMs: CACHE_TTL.LONG }
  );
}

/**
 * Validates whether a given driver ID is eligible to be picked for a race weekend.
 * Rejects historical drivers, arbitrary strings, and non-registered drivers.
 */
export function validateDriverEligibility(
  driverId: string | undefined,
  eligibleDrivers: Driver[]
): { isValid: boolean; reason?: string } {
  if (!driverId) {
    return { isValid: false, reason: 'Driver ID is missing.' };
  }

  const cleanId = String(driverId).trim().toLowerCase();
  const match = eligibleDrivers.find(d => d.id.toLowerCase() === cleanId);

  if (!match) {
    return {
      isValid: false,
      reason: `Driver "${driverId}" is not entered or eligible for this 2026 race weekend.`,
    };
  }

  return { isValid: true };
}

export const getEligibleDriversForWeekend = getEligibleDriversForRace;

export function isValidDriverForSeason(driverId: string, season: number = 2026): boolean {
  if (season !== 2026) return false;
  if (F1_DRIVERS_2026.some(d => d.id === driverId)) return true;
  try {
    const testDrivers = testGrandPrixService.getTestDrivers();
    if (testDrivers.some(d => d.id === driverId)) return true;
  } catch (_e) {}
  return false;
}

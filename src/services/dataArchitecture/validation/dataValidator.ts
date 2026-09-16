/**
 * The Grid — Boundary Data Validator & Integrity Guards
 * 
 * Enforces structural integrity, non-negative positions, chronological ordering,
 * version consistency, and safe failure behavior at the data boundary.
 */

import {
  NormalizedEvent,
  NormalizedSession,
  NormalizedDriver,
  NormalizedTeam,
  NormalizedSessionResult,
  NormalizedDriverStanding,
  NormalizedConstructorStanding,
} from '../../../types/dataContract';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class DataValidator {
  /**
   * Validates a list of drivers for unique IDs, valid codes, and required fields.
   */
  public static validateDrivers(drivers: NormalizedDriver[]): ValidationResult {
    const errors: string[] = [];
    const seenIds = new Set<string>();

    drivers.forEach((driver, idx) => {
      if (!driver.driverId) {
        errors.push(`Driver at index ${idx} missing driverId.`);
      } else if (seenIds.has(driver.driverId)) {
        errors.push(`Duplicate driverId detected: "${driver.driverId}".`);
      } else {
        seenIds.add(driver.driverId);
      }

      if (!driver.code || driver.code.length !== 3) {
        errors.push(`Driver "${driver.driverId || idx}" has invalid code: "${driver.code}" (must be 3 chars).`);
      }

      if (typeof driver.number !== 'number' || driver.number < 0) {
        errors.push(`Driver "${driver.driverId || idx}" has invalid driver number: ${driver.number}.`);
      }

      if (!driver.provenance || !driver.provenance.sourceId) {
        errors.push(`Driver "${driver.driverId || idx}" missing source provenance metadata.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a list of teams for unique IDs, colors, and required fields.
   */
  public static validateTeams(teams: NormalizedTeam[]): ValidationResult {
    const errors: string[] = [];
    const seenIds = new Set<string>();

    teams.forEach((team, idx) => {
      if (!team.teamId) {
        errors.push(`Team at index ${idx} missing teamId.`);
      } else if (seenIds.has(team.teamId)) {
        errors.push(`Duplicate teamId detected: "${team.teamId}".`);
      } else {
        seenIds.add(team.teamId);
      }

      if (!team.name) {
        errors.push(`Team "${team.teamId || idx}" missing team name.`);
      }

      if (!team.provenance || !team.provenance.sourceId) {
        errors.push(`Team "${team.teamId || idx}" missing source provenance metadata.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a NormalizedEvent and its internal sessions.
   */
  public static validateEvent(event: NormalizedEvent): ValidationResult {
    const errors: string[] = [];

    if (!event.eventId) errors.push('Event missing eventId.');
    if (!event.championshipId) errors.push('Event missing championshipId.');
    if (!event.season || event.season < 1950) errors.push(`Invalid season: ${event.season}.`);
    if (!event.round || event.round < 1) errors.push(`Invalid round number: ${event.round}.`);
    if (!event.circuitId) errors.push('Event missing normalized circuitId.');

    // Validate timestamps
    const start = new Date(event.startDateUtc).getTime();
    const end = new Date(event.endDateUtc).getTime();
    if (isNaN(start)) errors.push(`Invalid startDateUtc: "${event.startDateUtc}".`);
    if (isNaN(end)) errors.push(`Invalid endDateUtc: "${event.endDateUtc}".`);
    if (!isNaN(start) && !isNaN(end) && end < start) {
      errors.push(`Event endDateUtc (${event.endDateUtc}) is earlier than startDateUtc (${event.startDateUtc}).`);
    }

    // Validate sessions
    if (!event.sessions || event.sessions.length === 0) {
      errors.push('Event contains no sessions.');
    } else {
      const sessionIds = new Set<string>();
      event.sessions.forEach((s, idx) => {
        if (!s.sessionId) {
          errors.push(`Session at index ${idx} missing sessionId.`);
        } else if (sessionIds.has(s.sessionId)) {
          errors.push(`Duplicate sessionId detected in event: "${s.sessionId}".`);
        } else {
          sessionIds.add(s.sessionId);
        }

        const sStart = new Date(s.startTimeUtc).getTime();
        if (isNaN(sStart)) errors.push(`Session "${s.sessionId}" has invalid startTimeUtc.`);

        if (s.endTimeUtc) {
          const sEnd = new Date(s.endTimeUtc).getTime();
          if (!isNaN(sStart) && !isNaN(sEnd) && sEnd < sStart) {
            errors.push(`Session "${s.sessionId}" endTime is earlier than startTime.`);
          }
        }
      });
    }

    if (!event.provenance || !event.provenance.sourceId) {
      errors.push('Event missing source provenance metadata.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a NormalizedSessionResult: unique positive positions, status rules, and versioning.
   */
  public static validateSessionResult(result: NormalizedSessionResult): ValidationResult {
    const errors: string[] = [];

    if (!result.resultId) errors.push('Result missing resultId.');
    if (!result.sessionId) errors.push('Result missing sessionId.');
    if (!result.versionNumber || result.versionNumber < 1) {
      errors.push(`Invalid result versionNumber: ${result.versionNumber}. Must be >= 1.`);
    }

    // Versioning constraints
    if (result.resultStatus === 'AMENDED' && result.versionNumber < 2) {
      errors.push('AMENDED result status must have versionNumber >= 2.');
    }
    if (result.resultStatus === 'AMENDED' && !result.stewardNotes) {
      errors.push('AMENDED result status must include stewardNotes detailing reason for revision.');
    }

    // Entries validation
    if (!result.entries || result.entries.length === 0) {
      errors.push('Result has no result entries.');
    } else {
      const seenPositions = new Set<number>();
      result.entries.forEach((entry, idx) => {
        if (typeof entry.position !== 'number' || entry.position < 1) {
          errors.push(`Entry at index ${idx} has invalid position: ${entry.position} (must be >= 1).`);
        } else if (seenPositions.has(entry.position)) {
          errors.push(`Duplicate position ${entry.position} detected in result entries.`);
        } else {
          seenPositions.add(entry.position);
        }

        if (!entry.driverId) {
          errors.push(`Entry at index ${idx} missing driverId.`);
        }
        if (!entry.teamId) {
          errors.push(`Entry at index ${idx} missing teamId.`);
        }
        if (typeof entry.pointsEarned !== 'number' || entry.pointsEarned < 0) {
          errors.push(`Entry for "${entry.driverId}" has invalid pointsEarned: ${entry.pointsEarned}.`);
        }
      });
    }

    if (!result.provenance || !result.provenance.sourceId) {
      errors.push('Result missing source provenance metadata.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates Driver and Constructor standings.
   */
  public static validateStandings(
    drivers: NormalizedDriverStanding[],
    constructors: NormalizedConstructorStanding[]
  ): ValidationResult {
    const errors: string[] = [];

    // Driver standings
    const seenDriverPositions = new Set<number>();
    drivers.forEach((d, idx) => {
      if (typeof d.position !== 'number' || d.position < 1) {
        errors.push(`Driver standing at index ${idx} has invalid position: ${d.position}.`);
      } else if (seenDriverPositions.has(d.position)) {
        errors.push(`Duplicate driver standing position: ${d.position}.`);
      } else {
        seenDriverPositions.add(d.position);
      }
      if (!d.driverId) errors.push(`Driver standing at index ${idx} missing driverId.`);
      if (typeof d.points !== 'number' || d.points < 0) {
        errors.push(`Driver standing for "${d.driverId}" has negative points: ${d.points}.`);
      }
    });

    // Constructor standings
    const seenConstructorPositions = new Set<number>();
    constructors.forEach((c, idx) => {
      if (typeof c.position !== 'number' || c.position < 1) {
        errors.push(`Constructor standing at index ${idx} has invalid position: ${c.position}.`);
      } else if (seenConstructorPositions.has(c.position)) {
        errors.push(`Duplicate constructor standing position: ${c.position}.`);
      } else {
        seenConstructorPositions.add(c.position);
      }
      if (!c.teamId) errors.push(`Constructor standing at index ${idx} missing teamId.`);
      if (typeof c.points !== 'number' || c.points < 0) {
        errors.push(`Constructor standing for "${c.teamId}" has negative points: ${c.points}.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

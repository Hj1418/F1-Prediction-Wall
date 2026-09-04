import { Session, WeekendType } from '../../types';

/**
 * Automatically detects whether a race weekend is NORMAL or SPRINT
 * based purely on session configuration, without hardcoding race names.
 */
export function detectWeekendFormat(sessions?: Session[]): WeekendType {
  if (!sessions || sessions.length === 0) {
    return 'NORMAL';
  }

  const hasSprintSession = sessions.some(
    session => session.type === 'SPRINT' || session.type === 'SPRINT_QUALIFYING'
  );

  return hasSprintSession ? 'SPRINT' : 'NORMAL';
}

import { PredictionRound, RaceWeekend } from '../types';

export interface ResultsTimelineInfo {
  closesAtDate: Date;
  expectedResultsDate: Date;
  formattedClosesAt: string;
  formattedExpectedResults: string;
  formattedExpectedResultsTime: string;
  shortEta: string;
  timelineNotice: string;
  isSprint: boolean;
}

export function getResultsTimeline(
  round: PredictionRound | null | undefined,
  _weekend?: RaceWeekend | null
): ResultsTimelineInfo {
  if (!round || !round.closesAt) {
    const defaultDate = new Date();
    return {
      closesAtDate: defaultDate,
      expectedResultsDate: defaultDate,
      formattedClosesAt: 'TBA',
      formattedExpectedResults: 'TBA',
      formattedExpectedResultsTime: 'TBA',
      shortEta: 'Post-Race (~2h after start)',
      timelineNotice: 'Official results published after race conclusion and FIA steward review.',
      isSprint: false,
    };
  }

  const closesAtDate = new Date(round.closesAt);
  const isSprint =
    round.roundType === 'SPRINT' ||
    Boolean(round.roundId && round.roundId.includes('SPRINT'));

  // Race duration + FIA steward verification buffer:
  // Sprint: ~45 min race + 45 min steward verification = 1.5 hours after start
  // Main Grand Prix: ~90-120 min race + 60 min steward verification = 2.5 hours after start
  const durationBufferMs = isSprint
    ? 90 * 60 * 1000 // 1.5 hours
    : 150 * 60 * 1000; // 2.5 hours

  const expectedResultsDate = new Date(closesAtDate.getTime() + durationBufferMs);

  const formattedClosesAt = closesAtDate.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedExpectedResults = expectedResultsDate.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const shortEta = expectedResultsDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  let timelineNotice = '';
  if (round.status === 'OPEN') {
    timelineNotice = `Official results published approx. ${shortEta} (~${isSprint ? '1.5h' : '2.5h'} after formation lap)`;
  } else if (round.status === 'LOCKED') {
    timelineNotice = `Race in progress / FIA steward review underway. Official scores expected at ~${shortEta}.`;
  } else if (round.status === 'SCORED') {
    timelineNotice = 'Official FIA classification verified & scores finalized on the leaderboard.';
  } else {
    timelineNotice = `Predictions will close on ${formattedClosesAt}. Results published on ${formattedExpectedResults}.`;
  }

  return {
    closesAtDate,
    expectedResultsDate,
    formattedClosesAt,
    formattedExpectedResults,
    formattedExpectedResultsTime: shortEta,
    shortEta: `~${isSprint ? '1.5h' : '2.5h'} post-start (${shortEta})`,
    timelineNotice,
    isSprint,
  };
}

import { useState, useEffect } from 'react';
import { useServerTime } from './useServerTime';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSecondsLeft: number;
}

export function useRaceCountdown(targetDateIso?: string): CountdownState {
  const { currentServerTime } = useServerTime();

  const calculate = (): CountdownState => {
    if (!targetDateIso) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSecondsLeft: 0 };
    }

    const diff = new Date(targetDateIso).getTime() - currentServerTime.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSecondsLeft: 0 };
    }

    const totalSeconds = Math.floor(diff / 1000);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false,
      totalSecondsLeft: totalSeconds,
    };
  };

  const [countdown, setCountdown] = useState<CountdownState>(calculate());

  useEffect(() => {
    setCountdown(calculate());
  }, [targetDateIso, currentServerTime]);

  return countdown;
}

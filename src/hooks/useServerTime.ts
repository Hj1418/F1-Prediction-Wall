import { useState, useEffect } from 'react';
import { raceWeekendApi } from '../api/raceWeekendApi';

export function useServerTime() {
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [currentServerTime, setCurrentServerTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncTime() {
      try {
        const clientBeforeMs = Date.now();
        const serverIso = await raceWeekendApi.getServerTime();
        const clientAfterMs = Date.now();
        const roundTripMs = clientAfterMs - clientBeforeMs;
        const serverMs = new Date(serverIso).getTime() + roundTripMs / 2;

        const offset = serverMs - clientAfterMs;
        setServerOffsetMs(offset);
      } catch (err) {
        console.warn('Could not sync server time, using local clock', err);
      } finally {
        setLoading(false);
      }
    }

    syncTime();

    // Re-sync every 5 minutes
    const syncInterval = setInterval(syncTime, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentServerTime(new Date(Date.now() + serverOffsetMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [serverOffsetMs]);

  return { currentServerTime, serverOffsetMs, loading };
}

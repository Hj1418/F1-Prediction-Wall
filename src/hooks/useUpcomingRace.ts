import { useState, useEffect, useCallback } from 'react';
import { RaceWeekend } from '../types';
import { raceWeekendApi } from '../api/raceWeekendApi';
import { useApp } from '../context/AppContext';

export function useUpcomingRace() {
  const { dataVersion } = useApp();
  const [upcomingRace, setUpcomingRace] = useState<RaceWeekend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const race = await raceWeekendApi.getUpcomingRace();
      setUpcomingRace(race);
    } catch (err: any) {
      setError(err.message || 'Failed to load upcoming race');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, dataVersion]);

  return { upcomingRace, loading, error, refresh };
}

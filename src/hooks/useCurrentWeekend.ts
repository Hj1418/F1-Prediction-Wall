import { useState, useEffect, useCallback } from 'react';
import { RaceWeekend } from '../types';
import { raceWeekendApi } from '../api/raceWeekendApi';
import { useApp } from '../context/AppContext';

export function useCurrentWeekend() {
  const { dataVersion } = useApp();
  const [currentWeekend, setCurrentWeekend] = useState<RaceWeekend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const weekend = await raceWeekendApi.getCurrentWeekend();
      setCurrentWeekend(weekend);
    } catch (err: any) {
      setError(err.message || 'Failed to load active race weekend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, dataVersion]);

  return { currentWeekend, loading, error, refresh };
}

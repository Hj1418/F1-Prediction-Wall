import { useState, useEffect, useCallback } from 'react';
import { PredictionRound } from '../types';
import { predictionApi } from '../api/predictionApi';
import { getPredictionRoundStatus } from '../services/schedule/predictionRoundGenerator';
import { useServerTime } from './useServerTime';
import { useApp } from '../context/AppContext';

export function usePredictionRounds(raceWeekendId?: string) {
  const { dataVersion } = useApp();
  const { currentServerTime } = useServerTime();
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictionApi.getPredictionRounds(raceWeekendId);
      setRounds(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load prediction rounds');
    } finally {
      setLoading(false);
    }
  }, [raceWeekendId]);

  useEffect(() => {
    refresh();
  }, [refresh, dataVersion]);

  // Compute reactive statuses dynamically as currentServerTime ticks
  const dynamicRounds = rounds.map(r => ({
    ...r,
    status: getPredictionRoundStatus(r, currentServerTime),
  }));

  const activeRound = dynamicRounds.find(r => r.status === 'OPEN') ||
    dynamicRounds.find(r => r.status === 'UPCOMING') ||
    dynamicRounds[0] || null;

  return {
    rounds: dynamicRounds,
    activeRound,
    loading,
    error,
    refresh,
  };
}

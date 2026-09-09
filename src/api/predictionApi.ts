import { PredictionRound, Prediction } from '../types';
import { apiClient, isLiveBackend } from './client';
import { mockApi } from '../services/mockApi';

export const predictionApi = {
  async getPredictionRounds(raceWeekendId?: string): Promise<PredictionRound[]> {
    if (isLiveBackend) {
      const q = raceWeekendId ? `action=getPredictionRounds&raceWeekendId=${encodeURIComponent(raceWeekendId)}` : 'action=getCurrentPredictionRounds';
      const res = await apiClient<PredictionRound[]>(q);
      if (res.success && res.data) return res.data;
    }
    return import.meta.env.PROD ? [] : mockApi.getPredictionRounds(raceWeekendId);
  },

  async getPredictionRoundById(roundId: string): Promise<PredictionRound | null> {
    if (isLiveBackend) {
      const res = await apiClient<PredictionRound>(`action=getPredictionRound&roundId=${encodeURIComponent(roundId)}`);
      if (res.success && res.data) return res.data;
    }
    return import.meta.env.PROD ? null : mockApi.getPredictionRoundById(roundId);
  },

  async submitPrediction(payload: {
    userId: string;
    roundId: string;
    predictionData: Record<string, any>;
  }): Promise<Prediction> {
    if (isLiveBackend) {
      const res = await apiClient<Prediction>('', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submitPrediction', ...payload }),
      });
      if (res.success && res.data) return res.data;
      throw new Error(res.message || 'Live submission failed');
    }
    if (import.meta.env.PROD) {
      throw new Error('Live database required for predictions.');
    }
    return mockApi.submitPrediction(payload);
  },

  async getUserPrediction(roundId: string, userId: string): Promise<Prediction | null> {
    if (isLiveBackend) {
      const res = await apiClient<Prediction>(`action=getUserPrediction&roundId=${encodeURIComponent(roundId)}&userId=${encodeURIComponent(userId)}`);
      if (res.success && res.data) return res.data;
    }
    return import.meta.env.PROD ? null : mockApi.getUserPrediction(roundId, userId);
  },
};

import { api } from '../src/services/apiClient';

async function main() {
  const roundId = '2026_16_RACE_PREDICTION';
  console.log('Testing getPredictionRoundById:', roundId);
  try {
    const round = await api.getPredictionRoundById(roundId);
    console.log('Round result:', round ? { roundId: round.roundId, status: round.status, raceWeekendId: round.raceWeekendId } : null);
    if (round) {
      const weekend = await api.getWeekendById(round.raceWeekendId);
      console.log('Weekend result:', weekend ? { raceWeekendId: weekend.raceWeekendId, name: weekend.raceName, circuit: weekend.circuit } : null);
      const drivers = await api.getEligibleDrivers(round.raceWeekendId, 2026);
      console.log('Eligible drivers count:', drivers?.length);
    }
  } catch (e) {
    console.error('ERROR in test:', e);
  }
}

main();

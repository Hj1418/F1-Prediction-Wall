import { RaceWeekend } from '../../types';
import { JolpicaF1Provider } from './jolpicaProvider';

export interface RaceResult {
  season: number;
  round: number;
  results: any[];
}

export interface QualifyingResult {
  season: number;
  round: number;
  results: any[];
}

export interface SprintResult {
  season: number;
  round: number;
  results: any[];
}

export interface F1DataProvider {
  readonly providerName: string;
  getSeasonCalendar(season: number): Promise<RaceWeekend[]>;
  getRaceWeekend(season: number, round: number): Promise<RaceWeekend>;
  getRaceResults?(season: number, round: number): Promise<RaceResult>;
  getQualifyingResults?(season: number, round: number): Promise<QualifyingResult>;
  getSprintResults?(season: number, round: number): Promise<SprintResult>;
}

export function getF1DataProvider(providerName: string = 'JOLPICA'): F1DataProvider {
  switch (providerName.toUpperCase()) {
    case 'JOLPICA':
    case 'JOLPICA_F1':
      return new JolpicaF1Provider();
    case 'OPENF1':
      // OpenF1 provider hook for future expansion
      throw new Error('OpenF1 provider integration is planned for future release. Please use JOLPICA.');
    default:
      return new JolpicaF1Provider();
  }
}

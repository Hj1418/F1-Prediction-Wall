/**
 * Cross-Championship Venue Hosting Registry
 * Maps famous world circuits to all the championships and events they host across The Grid.
 * Demonstrates platform-wide interconnectedness (F1, F2, F3, FE, WEC, GT, MotoGP, Indian Motorsport).
 */

export interface VenueHosting {
  championshipId: string;
  championshipName: string;
  eventName: string;
  badge: string;
  badgeColor: string;
  url: string;
  notes?: string;
}

export const CROSS_CHAMPIONSHIP_VENUES: Record<string, VenueHosting[]> = {
  spa: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Belgian Grand Prix', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: 'TotalEnergies 6 Hours of Spa-Francorchamps', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec' },
    { championshipId: 'gt-world-challenge', championshipName: 'GT World Challenge', eventName: 'CrowdStrike 24 Hours of Spa', badge: 'GT3', badgeColor: '#d97706', url: '/championships/gt-world-challenge', notes: 'World premier 24-hour GT3 endurance race' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Spa-Francorchamps Feeder Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Spa-Francorchamps Junior Round', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  silverstone: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'British Grand Prix', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Monster Energy British Grand Prix', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Silverstone Feature Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Silverstone Sprint Round', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  monza: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Gran Premio d’Italia (Temple of Speed)', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'gt-world-challenge', championshipName: 'GT World Challenge', eventName: 'Monza 3-Hour Endurance Cup', badge: 'GT3', badgeColor: '#d97706', url: '/championships/gt-world-challenge' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Monza Temple of Speed Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Monza Season Finale', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  losail: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Qatar Grand Prix', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Qatar Airways Grand Prix of Qatar (Night Race)', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: 'Qatar 1812 km (Season Opener)', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Lusail Feeder Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
  ],
  cota: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'United States Grand Prix', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Red Bull Grand Prix of the Americas', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: 'Lone Star Le Mans (6 Hours of COTA)', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec' },
  ],
  barcelona: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Gran Premio de España', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Gran Premi Monster Energy de Catalunya', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'gt-world-challenge', championshipName: 'GT World Challenge', eventName: 'Circuit de Barcelona-Catalunya Endurance Round', badge: 'GT3', badgeColor: '#d97706', url: '/championships/gt-world-challenge' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Barcelona Feeder Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Barcelona Junior Round', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  red_bull_ring: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Großer Preis von Österreich', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Motorrad Grand Prix von Österreich', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Red Bull Ring Sprint & Feature', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Red Bull Ring Junior Round', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  monaco: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Grand Prix de Monaco', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'formula-e', championshipName: 'Formula E', eventName: 'Monaco E-Prix (Full GP Layout)', badge: 'FE', badgeColor: '#00d2be', url: '/championships/formula-e' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Monaco Feeder Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Monaco Junior Round', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  bahrain: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Bahrain Grand Prix', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: 'Bapco Energies 8 Hours of Bahrain (Finale)', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Sakhir Season Opener', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Sakhir Season Opener', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  buddh: [
    { championshipId: 'f1', championshipName: 'Formula 1 (Historical)', eventName: 'Indian Grand Prix (2011–2013)', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1', notes: 'Hosted 3 F1 GPs with Sebastian Vettel winning all 3' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Grand Prix of India (MotoGP Bharat)', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp', notes: 'Features the famous 1.06 km back straight' },
    { championshipId: 'indian-motorsport', championshipName: 'Indian Motorsport', eventName: 'Indian Racing Festival & F4 India Rounds', badge: 'INDIA', badgeColor: '#ff9933', url: '/indian-motorsport', notes: 'Premier FIA Grade 1 / FIM Grade A circuit in India' },
  ],
};

/**
 * Returns cross-championship hostings for a given circuit ID.
 */
export function getCrossChampionshipHostings(circuitId: string): VenueHosting[] {
  const normId = circuitId.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  return CROSS_CHAMPIONSHIP_VENUES[normId] || CROSS_CHAMPIONSHIP_VENUES[circuitId] || [];
}

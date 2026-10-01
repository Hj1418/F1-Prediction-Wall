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
    { championshipId: 'f4', championshipName: 'FIA Formula 4', eventName: 'ROKiT British F4 Trophy Round', badge: 'F4', badgeColor: '#10b981', url: '/championships/f4' },
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
  lusail: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Qatar Grand Prix', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Qatar Airways Grand Prix of Qatar (Night Race)', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: 'Qatar 1812 km (Season Opener)', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Lusail Feeder Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
  ],
  lemans: [
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: '24 Heures du Mans (Triple Crown)', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec', notes: '13.6 km Circuit de la Sarthe with Mulsanne Straight' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Shark Grand Prix de France', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp', notes: 'Historic 4.18 km Bugatti Circuit layout' },
  ],
  le_mans: [
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: '24 Heures du Mans (Triple Crown)', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec', notes: '13.6 km Circuit de la Sarthe with Mulsanne Straight' },
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Shark Grand Prix de France', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp', notes: 'Historic 4.18 km Bugatti Circuit layout' },
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
    { championshipId: 'f4', championshipName: 'FIA Formula 4', eventName: 'F4 Indian Championship Certified by FIA', badge: 'F4', badgeColor: '#10b981', url: '/championships/f4' },
  ],
  imola: [
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: '6 Hours of Imola (Season Opener)', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec' },
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Emilia Romagna Grand Prix', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Imola Feeder Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Imola Junior Round', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
  ],
  interlagos: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Formula 1 Lenovo Grande Prêmio de São Paulo', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1' },
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: 'Rolex 6 Hours of São Paulo', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec' },
  ],
  fuji: [
    { championshipId: 'wec', championshipName: 'FIA WEC', eventName: '6 Hours of Fuji', badge: 'WEC', badgeColor: '#002b49', url: '/championships/wec', notes: 'Iconic 1.475 km main straight under Mount Fuji' },
  ],
  madrid: [
    { championshipId: 'f1', championshipName: 'Formula 1', eventName: 'Formula 1 Gran Premio de España (Madrid)', badge: 'F1', badgeColor: '#e10600', url: '/championships/f1', notes: '2026 IFEMA semi-urban debut' },
    { championshipId: 'f2', championshipName: 'Formula 2', eventName: 'Madrid Feeder Round', badge: 'F2', badgeColor: '#0090d0', url: '/championships/f2' },
    { championshipId: 'f3', championshipName: 'Formula 3', eventName: 'Madrid Junior Season Finale', badge: 'F3', badgeColor: '#e10600', url: '/championships/f3' },
    { championshipId: 'formula-e', championshipName: 'Formula E', eventName: 'Madrid E-Prix', badge: 'FE', badgeColor: '#00d2be', url: '/championships/formula-e' },
  ],
  daytona: [
    { championshipId: 'imsa', championshipName: 'IMSA WeatherTech', eventName: 'Rolex 24 At Daytona', badge: 'IMSA', badgeColor: '#002b49', url: '/championships/imsa', notes: 'Legendary 24-hour North American endurance classic' },
    { championshipId: 'nascar', championshipName: 'NASCAR Cup Series', eventName: 'Daytona 500 (The Great American Race)', badge: 'NASCAR', badgeColor: '#ffd100', url: '/championships/nascar' },
  ],
  sebring: [
    { championshipId: 'imsa', championshipName: 'IMSA WeatherTech', eventName: 'Mobil 1 Twelve Hours of Sebring', badge: 'IMSA', badgeColor: '#002b49', url: '/championships/imsa', notes: 'Brutal bumpy concrete airfield test of mechanical endurance' },
  ],
  indianapolis: [
    { championshipId: 'indycar', championshipName: 'NTT INDYCAR SERIES', eventName: '110th Running of the Indianapolis 500', badge: 'INDY', badgeColor: '#005596', url: '/championships/indycar', notes: 'The Greatest Spectacle in Racing' },
    { championshipId: 'indycar', championshipName: 'NTT INDYCAR SERIES', eventName: 'Sonsio Grand Prix (Road Course)', badge: 'INDY', badgeColor: '#005596', url: '/championships/indycar' },
    { championshipId: 'nascar', championshipName: 'NASCAR Cup Series', eventName: 'Brickyard 400', badge: 'NASCAR', badgeColor: '#ffd100', url: '/championships/nascar' },
    { championshipId: 'imsa', championshipName: 'IMSA WeatherTech', eventName: 'Battle on the Bricks', badge: 'IMSA', badgeColor: '#002b49', url: '/championships/imsa' },
  ],
  laguna_seca: [
    { championshipId: 'indycar', championshipName: 'NTT INDYCAR SERIES', eventName: 'Firestone Grand Prix of Monterey', badge: 'INDY', badgeColor: '#005596', url: '/championships/indycar' },
    { championshipId: 'imsa', championshipName: 'IMSA WeatherTech', eventName: 'Motul Course de Monterey', badge: 'IMSA', badgeColor: '#002b49', url: '/championships/imsa', notes: 'Features the dramatic five-story Corkscrew drop' },
  ],
  road_america: [
    { championshipId: 'indycar', championshipName: 'NTT INDYCAR SERIES', eventName: 'XPEL Grand Prix at Road America', badge: 'INDY', badgeColor: '#005596', url: '/championships/indycar' },
    { championshipId: 'imsa', championshipName: 'IMSA WeatherTech', eventName: 'IMSA SportsCar Weekend at Road America', badge: 'IMSA', badgeColor: '#002b49', url: '/championships/imsa' },
  ],
  long_beach: [
    { championshipId: 'indycar', championshipName: 'NTT INDYCAR SERIES', eventName: 'Acura Grand Prix of Long Beach', badge: 'INDY', badgeColor: '#005596', url: '/championships/indycar' },
    { championshipId: 'imsa', championshipName: 'IMSA WeatherTech', eventName: 'Acura Grand Prix of Long Beach (Sprint)', badge: 'IMSA', badgeColor: '#002b49', url: '/championships/imsa' },
  ],
  watkins_glen: [
    { championshipId: 'imsa', championshipName: 'IMSA WeatherTech', eventName: 'Sahlen’s Six Hours of The Glen', badge: 'IMSA', badgeColor: '#002b49', url: '/championships/imsa' },
    { championshipId: 'nascar', championshipName: 'NASCAR Cup Series', eventName: 'Go Bowling at The Glen', badge: 'NASCAR', badgeColor: '#ffd100', url: '/championships/nascar' },
  ],
  charlotte: [
    { championshipId: 'nascar', championshipName: 'NASCAR Cup Series', eventName: 'Coca-Cola 600', badge: 'NASCAR', badgeColor: '#ffd100', url: '/championships/nascar', notes: 'Longest 600-mile endurance test in NASCAR' },
  ],
  talladega: [
    { championshipId: 'nascar', championshipName: 'NASCAR Cup Series', eventName: 'GEICO 500 & YellaWood 500', badge: 'NASCAR', badgeColor: '#ffd100', url: '/championships/nascar', notes: '33-degree banking pack racing' },
  ],
  st_petersburg: [
    { championshipId: 'indycar', championshipName: 'NTT INDYCAR SERIES', eventName: 'Firestone Grand Prix of St. Petersburg', badge: 'INDY', badgeColor: '#005596', url: '/championships/indycar', notes: 'Traditional waterfront season opener' },
  ],
  jerez: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Gran Premio de España', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
  ],
  mugello: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Gran Premio d’Italia', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp', notes: 'Fast downhill Casanova-Savelli sweeps' },
  ],
  misano: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Gran Premio Red Bull di San Marino e della Riviera di Rimini', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'gt-world-challenge', championshipName: 'GT World Challenge', eventName: 'Misano Sprint Cup', badge: 'GT3', badgeColor: '#d97706', url: '/championships/gt-world-challenge' },
  ],
  sachsenring: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Liqui Moly Motorrad Grand Prix Deutschland', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
  ],
  chang: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'PT Grand Prix of Thailand (Season Opener)', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
  ],
  motegi: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Motul Grand Prix of Japan', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
  ],
  phillip_island: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Australian Motorcycle Grand Prix', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp', notes: 'Ocean cliffside high-speed sweeping paradise' },
  ],
  algarve: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Grande Prémio de Portugal', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
    { championshipId: 'gt-world-challenge', championshipName: 'GT World Challenge', eventName: 'Portimão GT Endurance', badge: 'GT3', badgeColor: '#d97706', url: '/championships/gt-world-challenge' },
  ],
  valencia: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Gran Premio Motul de la Comunitat Valenciana (Season Finale)', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
  ],
  brno: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Grand Prix České republiky', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
  ],
  mandalika: [
    { championshipId: 'motogp', championshipName: 'MotoGP', eventName: 'Pertamina Grand Prix of Indonesia', badge: 'MotoGP', badgeColor: '#dc2626', url: '/championships/motogp' },
  ],
};

/**
 * Returns cross-championship hostings for a given circuit ID.
 */
export function getCrossChampionshipHostings(circuitId: string): VenueHosting[] {
  const normId = circuitId.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  return CROSS_CHAMPIONSHIP_VENUES[normId] || CROSS_CHAMPIONSHIP_VENUES[circuitId] || [];
}

export const getVenueHostings = getCrossChampionshipHostings;

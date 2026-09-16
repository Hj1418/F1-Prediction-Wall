import { ChampionshipDetailData } from '../../../types/motorsportDetail';

export const f1Data: ChampionshipDetailData = {
  id: 'f1',
  name: 'FIA Formula One World Championship®',
  shortName: 'Formula 1',
  seasonYear: 2026,
  governingBody: 'Fédération Internationale de l’Automobile (FIA)',
  tagline: 'The Pinnacle of Global Motorsport — Active Aerodynamics, 1,000+ bhp Hybrid Power & 100% Sustainable Fuel.',
  heroBadgeColor: '#e10600',
  tier: 'PREMIER WORLD CHAMPIONSHIP',
  officialWebsite: 'https://www.formula1.com',
  overviewSummary:
    'Formula 1 is the highest class of international single-seater auto racing sanctioned by the FIA. The 2026 season introduces revolutionary technical regulations featuring active aerodynamics (Z-mode for high-downforce cornering and X-mode for low-drag straights), a 50/50 internal combustion and electrical power split delivering 350 kW from the MGU-K, 100% advanced sustainable fuels, and the manual override push-to-pass overtake mode.',
  feederLadderRole:
    'The ultimate destination of the FIA single-seater ladder. Drivers earn their seats by achieving 40 points in the FIA Super Licence qualification system through stellar campaigns in Formula 2, Formula 3, and national Formula 4 championships.',
  specRegulationsSummary:
    'Open-wheel design with spec ground-effect tunnels, active movable front and rear wings, 18-inch Pirelli tyres, and next-generation hybrid power units without the MGU-H.',
  pointsSystemDescription:
    'Standard Grand Prix scoring awards points to the top 10 finishers (25-18-15-12-10-8-6-4-2-1). Sprint weekends award points to the top 8 finishers (8-7-6-5-4-3-2-1). Separate Drivers’ and Constructors’ World Championships.',
  classes: [
    {
      id: 'f1',
      name: 'Formula 1',
      badge: 'F1',
      badgeColor: '#e10600',
      description: 'The pinnacle of open-wheel single-seater prototypes competing for world championship glory.',
    },
  ],
  technicalSpecs: {
    chassis: 'Bespoke Carbon-Fibre Monocoque with Titanium Halo Cockpit Protection',
    engine: '1.6L 90° V6 Turbocharged Internal Combustion Engine + 350 kW MGU-K Hybrid Motor Generator',
    displacement: '1,600 cc',
    powerOutput: '1,000+ bhp combined (approx. 535 bhp ICE + 470 bhp / 350 kW Electric MGU-K)',
    gearbox: '8-speed quick-shift longitudinal sequential gearbox with reverse',
    weight: '768 kg minimum dry weight (reduced agile 2026 regulations)',
    topSpeed: '360+ km/h (Monza, Las Vegas, Baku)',
    acceleration: '0–100 km/h in 2.2 seconds | 0–200 km/h in 4.4 seconds',
    tyres: 'Pirelli 18-inch bespoke radial slicks (C1 to C5 compounds) + Intermediate & Full Wet',
    fuelSupplier: '100% Advanced Certified Sustainable Drop-in Fuel (Zero net fossil carbon emissions)',
    electronics: 'Standard Electronic Control Unit (SECU) supplied by McLaren Applied',
    safetyRating: 'FIA Formula One Safety Standards (Halo 125 kN crush test, crash structures, zylon anti-intrusion panels)',
  },
  rounds: [
    {
      roundNumber: 1,
      officialTitle: 'Formula 1 Australian Grand Prix 2026',
      circuitName: 'Albert Park Circuit',
      location: 'Melbourne',
      country: 'Australia',
      countryCode: 'AU',
      flag: '🇦🇺',
      dates: 'Mar 13 – Mar 15',
      circuitLengthKm: 5.278,
      duration: '58 Laps',
      status: 'UPCOMING',
      sessions: [
        { name: 'Practice 1 & 2', day: 'Friday', durationMinutes: 120, description: 'Track acclimatization and 2026 active aero validation.' },
        { name: 'Practice 3 & Qualifying', day: 'Saturday', durationMinutes: 120, description: 'Three-stage knockout qualifying (Q1, Q2, Q3).' },
        { name: 'Australian Grand Prix', day: 'Sunday', durationMinutes: 90, description: '58-lap season opener around the Albert Park lake.' },
      ],
    },
    {
      roundNumber: 2,
      officialTitle: 'Formula 1 Chinese Grand Prix 2026',
      circuitName: 'Shanghai International Circuit',
      location: 'Shanghai',
      country: 'China',
      countryCode: 'CN',
      flag: '🇨🇳',
      dates: 'Mar 20 – Mar 22',
      circuitLengthKm: 5.451,
      duration: '56 Laps',
      status: 'UPCOMING',
      sessions: [
        { name: 'Practice 1 & Sprint Qualifying', day: 'Friday', durationMinutes: 105, description: 'Sprint weekend schedule.' },
        { name: 'Sprint Race & Grand Prix Qualifying', day: 'Saturday', durationMinutes: 100, description: '19-lap flat-out Sprint battle.' },
        { name: 'Chinese Grand Prix', day: 'Sunday', durationMinutes: 90, description: 'Full Grand Prix featuring the iconic 1.2 km back straight.' },
      ],
    },
    {
      roundNumber: 3,
      officialTitle: 'Formula 1 Japanese Grand Prix 2026',
      circuitName: 'Suzuka International Racing Course',
      location: 'Suzuka',
      country: 'Japan',
      countryCode: 'JP',
      flag: '🇯🇵',
      dates: 'Apr 03 – Apr 05',
      circuitLengthKm: 5.807,
      duration: '53 Laps',
      status: 'UPCOMING',
      sessions: [
        { name: 'Free Practice 1 & 2', day: 'Friday', durationMinutes: 120, description: 'High-speed Esse sweeps setup.' },
        { name: 'Practice 3 & Qualifying', day: 'Saturday', durationMinutes: 120, description: 'Deciding pole position at the legendary figure-8 circuit.' },
        { name: 'Japanese Grand Prix', day: 'Sunday', durationMinutes: 90, description: '53-lap technical masterpiece race.' },
      ],
    },
    {
      roundNumber: 4,
      officialTitle: 'Formula 1 Bahrain Grand Prix 2026',
      circuitName: 'Bahrain International Circuit',
      location: 'Sakhir',
      country: 'Bahrain',
      countryCode: 'BH',
      flag: '🇧🇭',
      dates: 'Apr 10 – Apr 12',
      circuitLengthKm: 5.412,
      duration: '57 Laps',
      status: 'UPCOMING',
      sessions: [
        { name: 'Free Practice 1 & 2', day: 'Friday', durationMinutes: 120, description: 'Day-to-night desert temperature transition testing.' },
        { name: 'Practice 3 & Qualifying', day: 'Saturday', durationMinutes: 120, description: 'Qualifying under 495 floodlights.' },
        { name: 'Bahrain Grand Prix', day: 'Sunday', durationMinutes: 90, description: 'Desert night race with heavy rear tyre thermal degradation.' },
      ],
    },
  ],
  driversStandings: [
    { rank: 1, driverName: 'Max Verstappen', driverCode: 'VER', carNumber: 1, teamName: 'Red Bull Racing', nationality: 'NED', points: 437, wins: 9, podiums: 14, polePositions: 8, fastestLaps: 5 },
    { rank: 2, driverName: 'Lando Norris', driverCode: 'NOR', carNumber: 4, teamName: 'McLaren F1 Team', nationality: 'GBR', points: 374, wins: 4, podiums: 12, polePositions: 7, fastestLaps: 4 },
    { rank: 3, driverName: 'Charles Leclerc', driverCode: 'LEC', carNumber: 16, teamName: 'Scuderia Ferrari', nationality: 'MON', points: 356, wins: 3, podiums: 13, polePositions: 4, fastestLaps: 3 },
    { rank: 4, driverName: 'Oscar Piastri', driverCode: 'PIA', carNumber: 81, teamName: 'McLaren F1 Team', nationality: 'AUS', points: 292, wins: 2, podiums: 8, polePositions: 1, fastestLaps: 2 },
    { rank: 5, driverName: 'Carlos Sainz', driverCode: 'SAI', carNumber: 55, teamName: 'Williams Racing', nationality: 'ESP', points: 290, wins: 2, podiums: 7, polePositions: 1, fastestLaps: 1 },
    { rank: 6, driverName: 'George Russell', driverCode: 'RUS', carNumber: 63, teamName: 'Mercedes-AMG PETRONAS', nationality: 'GBR', points: 245, wins: 2, podiums: 4, polePositions: 3, fastestLaps: 2 },
    { rank: 7, driverName: 'Lewis Hamilton', driverCode: 'HAM', carNumber: 44, teamName: 'Scuderia Ferrari', nationality: 'GBR', points: 223, wins: 2, podiums: 5, polePositions: 1, fastestLaps: 2 },
    { rank: 8, driverName: 'Fernando Alonso', driverCode: 'ALO', carNumber: 14, teamName: 'Aston Martin Aramco', nationality: 'ESP', points: 92, wins: 0, podiums: 2, polePositions: 0, fastestLaps: 2 },
  ],
  teamsStandings: [
    { rank: 1, teamName: 'McLaren F1 Team', points: 666, wins: 6, podiums: 20, polePositions: 8, country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', primaryColor: '#ff8000', carModel: 'MCL39 Mercedes', drivers: ['Lando Norris', 'Oscar Piastri'] },
    { rank: 2, teamName: 'Scuderia Ferrari', points: 652, wins: 5, podiums: 20, polePositions: 5, country: 'Italy', countryCode: 'IT', flag: '🇮🇹', primaryColor: '#dc2626', carModel: 'SF-26 Ferrari', drivers: ['Charles Leclerc', 'Lewis Hamilton'] },
    { rank: 3, teamName: 'Red Bull Racing', points: 589, wins: 9, podiums: 15, polePositions: 8, country: 'Austria', countryCode: 'AT', flag: '🇦🇹', primaryColor: '#1e40af', carModel: 'RB22 Red Bull Powertrains-Ford', drivers: ['Max Verstappen', 'Liam Lawson'] },
    { rank: 4, teamName: 'Mercedes-AMG PETRONAS', points: 468, wins: 3, podiums: 8, polePositions: 4, country: 'Germany', countryCode: 'DE', flag: '🇩🇪', primaryColor: '#00d2be', carModel: 'W17 Mercedes', drivers: ['George Russell', 'Andrea Kimi Antonelli'] },
    { rank: 5, teamName: 'Aston Martin Aramco', points: 94, wins: 0, podiums: 2, polePositions: 0, country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', primaryColor: '#00594f', carModel: 'AMR26 Honda', drivers: ['Fernando Alonso', 'Lance Stroll'] },
    { rank: 6, teamName: 'Williams Racing', points: 74, wins: 0, podiums: 1, polePositions: 0, country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', primaryColor: '#00a0de', carModel: 'FW48 Mercedes', drivers: ['Alex Albon', 'Carlos Sainz'] },
  ],
  featureGuide: {
    tabLabel: '2026 Technical Regulations',
    tabTitle: 'Active Aerodynamics, Agile Cars & 50/50 Hybrid Power',
    tabDescription:
      'The 2026 Formula 1 technical revolution fundamentally transforms racing dynamics, eliminating drag reduction rear flaps in favor of full active aerodynamics and tripling electrical battery deployment.',
    sections: [
      {
        title: 'Active Aerodynamics: Z-Mode & X-Mode',
        subtitle: 'Movable front and rear wings dynamically controlled across every lap',
        badge: 'NEW AERO PARADIGM',
        badgeColor: '#e10600',
        description:
          '2026 cars feature two state aero configurations: Z-mode (standard high-downforce cornering trim) and X-mode (low-drag high-efficiency straight-line trim that opens both the front wing and rear wing to boost top speed).',
        metrics: [
          { label: 'Downforce Reduction', value: '-30% overall' },
          { label: 'Drag Reduction in X-Mode', value: '-55% drag' },
          { label: 'Car Width', value: '1,900 mm (100 mm narrower)' },
          { label: 'Weight Reduction', value: '-30 kg lighter' },
        ],
        details: [
          'Driver toggles X-mode along designated straight-line zones without needing a 1-second gap to cars ahead.',
          'Wings immediately revert to Z-mode under initial brake pedal application for maximum stopping downforce.',
          'Narrower chassis and shorter wheelbase dramatically reduce wake turbulence, enabling closer wheel-to-wheel racing.',
        ],
      },
      {
        title: 'Manual Override Mode (MOM)',
        subtitle: 'Driver-activated on-demand electrical power burst for overtaking',
        badge: 'OVERTAKING SYSTEM',
        badgeColor: '#10b981',
        description:
          'Replacing the traditional DRS speed delta, Manual Override Mode grants trailing cars within 1 second an additional electrical power deployment window at speeds up to 337 km/h, creating tactical overtaking showdowns.',
        metrics: [
          { label: 'MGU-K Output', value: '350 kW (approx. 470 bhp)' },
          { label: 'Deployment Ceiling', value: '337 km/h' },
          { label: 'Activation Delta', value: '< 1.0 second behind' },
        ],
        details: [
          'Standard power curve tapers electrical output above 290 km/h down to zero at 355 km/h.',
          'MOM allows the chasing driver to sustain 350 kW up to 337 km/h and 0.5 MJ of bonus energy.',
          'Forces drivers to manage energy depletion versus tactical attack across full stint lengths.',
        ],
      },
    ],
  },
  faqs: [
    {
      question: 'What are the biggest changes in the 2026 Formula 1 regulations?',
      answer:
        'The 2026 regulations introduce an equal 50/50 power split between internal combustion (400 kW) and electrical battery energy (350 kW MGU-K), active aerodynamics with X-mode and Z-mode, and 100% advanced sustainable drop-in e-fuels.',
    },
    {
      question: 'How does Manual Override Mode replace DRS in 2026?',
      answer:
        'Instead of opening a drag reduction flap, a chasing driver within 1.0 second gains access to extended 350 kW electrical boost sustained up to 337 km/h and bonus energy to overtake into heavy braking zones.',
    },
    {
      question: 'Why are the 2026 cars narrower and lighter?',
      answer:
        'Cars are 100 mm narrower (1,900 mm) with a 200 mm shorter wheelbase and 30 kg weight drop to promote agility, reduce turbulent wake, and allow closer wheel-to-wheel battling on tight circuits.',
    },
  ],
};

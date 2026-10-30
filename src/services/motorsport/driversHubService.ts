import {
  DriverProfile,
  MotorsportSeriesFilter,
  CareerJourneyMilestone,
  HistoricalTeamRecord,
  CareerAchievement,
  DriverInterestingFact,
} from '../../types/driversHub';

export const DRIVER_PROFILES: DriverProfile[] = [
  // =========================================================================
  // ── FORMULA RACING ──
  // =========================================================================
  {
    id: 'f1-hamilton',
    slug: 'lewis-hamilton',
    name: 'Lewis Hamilton',
    fullName: 'Sir Lewis Carl Davidson Hamilton',
    code: 'HAM',
    number: 44,
    nationality: 'British',
    countryCode: 'GBR',
    countryFlag: '🇬🇧',
    team: 'Scuderia Ferrari',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Single-Seater Racing',
    carOrBike: 'Ferrari SF-26 Hybrid',
    status: 'active',
    birthDate: '1985-01-07',
    birthPlace: 'Stevenage, Hertfordshire, England',
    shortIntroduction:
      'Seven-time Formula 1 World Drivers’ Champion and statistical record holder for the most Grand Prix victories (105+) and pole positions (104). In 2025, Hamilton made the historic transfer to Scuderia Ferrari in scarlet red for the sport’s active-aerodynamics and sustainable-fuel regulations era.',
    earlyLifeAndBeginnings:
      'Born on 7 January 1985 and raised in Stevenage, Hertfordshire. Hamilton discovered racing at age five with a radio-controlled car before starting karting at Rye House at age six. His father, Anthony, worked multiple jobs to fund his early karting career. At age ten, Hamilton approached McLaren boss Ron Dennis at the Autosport Awards, famously stating: "One day I want to be racing your cars." Dennis wrote in his autograph book: "Phone me in nine years, we\'ll sort something out." Less than three years later, McLaren signed him to their Champions of the Future driver development programme.',
    careerJourney: [
      {
        period: '1993–2000',
        title: 'British & European Karting Dominance',
        category: 'KARTING',
        description: 'Swept British cadet championships and won the European Junior karting championship with 100% podium conversion rate.',
      },
      {
        period: '2001–2003',
        title: 'Formula Renault UK Champion',
        category: 'JUNIOR_CAREER',
        description: 'Dominated the 2003 championship with 10 race victories and 11 fastest laps for Manor Motorsport.',
      },
      {
        period: '2004–2005',
        title: 'Formula 3 Euro Series Champion',
        category: 'JUNIOR_CAREER',
        description: 'Took a record 15 race victories in 20 races with ASM Formule 3 and won the prestigious Pau Grand Prix.',
      },
      {
        period: '2006',
        title: 'GP2 Series Rookie Champion',
        category: 'JUNIOR_CAREER',
        description: 'Sensational rookie title with ART Grand Prix, earning immediate promotion into Formula 1 with McLaren.',
      },
      {
        period: '2007',
        title: 'Sensational Formula 1 Rookie Season',
        category: 'TOP_FLIGHT',
        description: 'Scored 9 consecutive podium finishes from his first race, won 4 Grands Prix, and finished championship runner-up by 1 point.',
      },
      {
        period: '2008',
        title: 'Maiden Formula 1 World Championship',
        category: 'CHAMPIONSHIP',
        description: 'Clinched his first World Drivers’ Championship with McLaren at Interlagos in dramatic final-corner pass.',
      },
      {
        period: '2013',
        title: 'Move to Mercedes-AMG PETRONAS',
        category: 'TRANSITION',
        description: 'Made bold career-defining switch to Mercedes ahead of the 1.6-litre V6 turbo-hybrid engine revolution.',
      },
      {
        period: '2014–2020',
        title: 'Six World Championships & Historic Records',
        category: 'CHAMPIONSHIP',
        description: 'Secured 6 World Titles (2014, 2015, 2017, 2018, 2019, 2020), equalling Michael Schumacher’s all-time record of 7 titles.',
      },
      {
        period: '2021–2024',
        title: 'Century of Wins & Record 9th British GP Victory',
        category: 'TOP_FLIGHT',
        description: 'Became the first driver in F1 history to surpass 100 wins and 100 poles; won record 9th British GP at Silverstone in 2024.',
      },
      {
        period: '2025–Present',
        title: 'Historic Transfer to Scuderia Ferrari',
        category: 'TRANSITION',
        description: 'Joined Scuderia Ferrari in scarlet red alongside Charles Leclerc, spearheading Ferrari into the active-aerodynamics era.',
      },
    ],
    teamsHistory: [
      {
        period: '2007–2012',
        team: 'Vodafone McLaren Mercedes',
        championship: 'Formula 1',
        carOrBike: 'McLaren MP4-22 through MP4-27',
        notes: '2008 World Champion, 21 Wins, 26 Pole Positions, 49 Podiums',
      },
      {
        period: '2013–2024',
        team: 'Mercedes-AMG PETRONAS Formula One Team',
        championship: 'Formula 1',
        carOrBike: 'Mercedes F1 W04 through W15',
        notes: '6 World Championships (2014, 2015, 2017, 2018, 2019, 2020), 84 Wins, 78 Poles',
      },
      {
        period: '2025–2026',
        team: 'Scuderia Ferrari',
        championship: 'Formula 1',
        carOrBike: 'Ferrari SF-25 / SF-26',
        notes: 'Piloting the scarlet Ferrari in the new active-aerodynamics sustainable-fuel regulations era',
      },
    ],
    careerAchievements: [
      {
        title: '7x FIA Formula One World Drivers’ Champion',
        countOrDetail: '7 Titles (2008, 2014, 2015, 2017, 2018, 2019, 2020)',
        description: 'Joint all-time record with Michael Schumacher.',
        isRecord: true,
      },
      {
        title: 'Most Formula 1 Grand Prix Victories',
        countOrDetail: '105+ Wins',
        description: 'The highest win total in the history of Grand Prix motor racing.',
        isRecord: true,
      },
      {
        title: 'Most Formula 1 Pole Positions',
        countOrDetail: '104 Poles',
        description: 'The first and only driver in history to achieve over 100 pole positions.',
        isRecord: true,
      },
      {
        title: 'Most Podium Finishes in Formula 1 History',
        countOrDetail: '201 Podiums',
        description: 'Only driver in Formula 1 history to surpass 200 podium appearances.',
        isRecord: true,
      },
      {
        title: 'Most Grand Prix Wins at a Single Circuit',
        countOrDetail: '9 Wins at Silverstone',
        description: 'Won the British Grand Prix 9 times (2008, 2014, 2015, 2016, 2017, 2019, 2020, 2021, 2024).',
        isRecord: true,
      },
    ],
    interestingFacts: [
      {
        topic: 'Early Career',
        fact: 'Encountered McLaren team principal Ron Dennis at age 10 at the Autosport Awards, initiating a legendary partnership.',
      },
      {
        topic: 'Royal Honor',
        fact: 'Knighted by King Charles III (then Prince of Wales) at Windsor Castle in December 2021 for services to motorsport.',
      },
      {
        topic: 'Racing Identity',
        fact: 'Has chosen to race with car #44 throughout his championship career rather than the #1 champion’s plate, honoring his first cadet kart license.',
      },
      {
        topic: 'Film & Media',
        fact: 'Produced and served as technical advisor for major Hollywood feature films documenting authentic motorsport.',
      },
    ],
    driverLegacy:
      'Lewis Hamilton has transcended motorsport to become a global sporting and cultural icon. Beyond his peerless statistical achievements in the cockpit, he has redefined the modern athlete by pioneering diversity initiatives through Mission 44 and the Hamilton Commission, advocating for environmental sustainability, and using his global platform to inspire future generations across sport, fashion, and society.',
    stats: {
      worldChampionships: 7,
      raceWins: 105,
      podiums: 201,
      polePositions: 104,
      fastestLaps: 67,
      starts: 356,
      statLabel: 'Formula 1 Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 3,
      points: 199,
      wins: 1,
      podiums: 8,
      polePositions: 3,
      fastestLaps: 3,
      raceStarts: 18,
      raceFinishes: 17,
      dnfs: 1,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'Scuderia Ferrari', carOrBike: 'Ferrari SF-26', position: 3, points: 199, wins: 1, podiums: 8, poles: 3, notes: 'Debut scarlet season in new active-aero era' },
      { season: 2025, series: 'Formula 1', team: 'Scuderia Ferrari', carOrBike: 'Ferrari SF-25', position: 6, points: 190, wins: 0, podiums: 3, poles: 1, notes: 'Maiden season in scarlet red with Scuderia Ferrari' },
      { season: 2024, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W15', position: 7, points: 223, wins: 2, podiums: 4, poles: 0, notes: 'Final Mercedes season; 9th British GP victory at Silverstone & Spa win' },
      { season: 2023, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W14', position: 3, points: 234, wins: 0, podiums: 6, poles: 1, notes: 'P3 in WDC with Hungarian GP pole position' },
      { season: 2020, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W11', position: 1, points: 347, wins: 11, podiums: 14, poles: 10, notes: 'Equalled Michael Schumacher with 7th World Title' },
      { season: 2008, series: 'Formula 1', team: 'Vodafone McLaren Mercedes', carOrBike: 'McLaren MP4-23', position: 1, points: 98, wins: 5, podiums: 10, poles: 7, notes: 'First World Championship at dramatic Interlagos finale' },
    ],
    driverDna: 'Master of long stint tire conservation, tactical late-race pace progression, and supreme wet-weather spatial precision.',
    careerHighlights: [
      '7x FIA Formula One World Drivers’ Champion (Joint all-time record)',
      'Most Grand Prix race victories in Formula One history (105+)',
      'Most pole positions in Formula One history (104)',
      'Historic move to Scuderia Ferrari for the active-aero 2026 regulations era',
    ],
    biography:
      'Lewis Hamilton is the most decorated driver in Formula One history. Entering 2026 representing Scuderia Ferrari in scarlet red, his racecraft combines surgical tire preservation with unmatched race management under high-degradation conditions.',
    teamWebsite: 'https://www.ferrari.com/en-EN/formula1',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-verstappen',
    slug: 'max-verstappen',
    name: 'Max Verstappen',
    fullName: 'Max Emilian Verstappen',
    code: 'VER',
    number: 3,
    nationality: 'Dutch',
    countryCode: 'NED',
    countryFlag: '🇳🇱',
    team: 'Red Bull Racing',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Single-Seater Racing',
    carOrBike: 'Red Bull RB22 (Ford Powertrains)',
    status: 'active',
    birthDate: '1997-09-30',
    birthPlace: 'Hasselt, Belgium',
    shortIntroduction:
      'Four-time Formula 1 World Drivers’ Champion (2021, 2022, 2023, 2024) driving for Red Bull Racing. Renowned for uncompromising wheel-to-wheel racecraft, extreme car control, and record-breaking single-season dominance.',
    earlyLifeAndBeginnings:
      'Born on 30 September 1997 in Hasselt, Belgium, to former Formula 1 driver Jos Verstappen and champion karting racer Sophie Kumpen. Raised in Maaseik on the Belgian-Dutch border, Verstappen began karting at age four. Mentored with legendary intensity by his father, who traveled across European kart circuits in a van, Max developed an innate feel for tire slip angles and wet asphalt, sweeping international championships before ever sitting in a single-seater racing car.',
    careerJourney: [
      {
        period: '2005–2013',
        title: 'Karting World Champion',
        category: 'KARTING',
        description: 'Won the CIK-FIA European and World KZ1 Championships in 2013, the highest echelon of international karting.',
      },
      {
        period: '2014',
        title: 'FIA European Formula 3 Breakthrough',
        category: 'JUNIOR_CAREER',
        description: 'Took 10 race victories with Van Amersfoort Racing (including six consecutive wins) in his maiden car racing season.',
      },
      {
        period: '2015',
        title: 'Historic Formula 1 Debut at Age 17',
        category: 'TOP_FLIGHT',
        description: 'Made his F1 debut with Scuderia Toro Rosso at 17 years, 166 days old, becoming the youngest driver in F1 history.',
      },
      {
        period: '2016',
        title: 'Youngest Grand Prix Winner in History',
        category: 'TOP_FLIGHT',
        description: 'Promoted to Red Bull Racing; won the Spanish Grand Prix on his team debut at age 18 years, 228 days.',
      },
      {
        period: '2021',
        title: 'First World Championship Title',
        category: 'CHAMPIONSHIP',
        description: 'Won the 2021 World Drivers’ Championship after a legendary season-long duel at the Abu Dhabi Grand Prix.',
      },
      {
        period: '2022–2023',
        title: 'Record-Breaking Consecutive Dominance',
        category: 'CHAMPIONSHIP',
        description: 'Broke all-time records for consecutive wins (10) and single-season victories (19 out of 22 Grands Prix in 2023).',
      },
      {
        period: '2024',
        title: '4th Consecutive World Title',
        category: 'CHAMPIONSHIP',
        description: 'Clinched his 4th World Championship with a masterclass drive from 17th to 1st in torrential rain at São Paulo.',
      },
    ],
    teamsHistory: [
      {
        period: '2015–2016',
        team: 'Scuderia Toro Rosso',
        championship: 'Formula 1',
        carOrBike: 'Toro Rosso STR10 / STR11',
        notes: 'Youngest starter and points-scorer in Formula 1 history; 49 points',
      },
      {
        period: '2016–Present',
        team: 'Red Bull Racing',
        championship: 'Formula 1',
        carOrBike: 'Red Bull RB12 through RB22',
        notes: '4 World Championships (2021, 2022, 2023, 2024), 65+ Wins, 42+ Poles',
      },
    ],
    careerAchievements: [
      {
        title: '4x FIA Formula One World Drivers’ Champion',
        countOrDetail: '4 Titles (2021, 2022, 2023, 2024)',
        description: 'Achieved four consecutive World Championships with Red Bull Racing.',
      },
      {
        title: 'Most Wins in a Single Formula 1 Season',
        countOrDetail: '19 Victories (2023)',
        description: 'Won 19 of 22 Grands Prix in 2023, the highest win percentage in sport history (86.36%).',
        isRecord: true,
      },
      {
        title: 'Most Consecutive Grand Prix Victories',
        countOrDetail: '10 Consecutive Wins (2023)',
        description: 'Set all-time record from the Miami Grand Prix to the Italian Grand Prix at Monza.',
        isRecord: true,
      },
      {
        title: 'Youngest Grand Prix Race Winner in History',
        countOrDetail: '18 Years, 228 Days',
        description: 'Won the 2016 Spanish Grand Prix on his debut for Red Bull Racing.',
        isRecord: true,
      },
    ],
    interestingFacts: [
      {
        topic: 'Early Career',
        fact: 'Participated in his first official Formula 1 practice session at Suzuka in 2014 before obtaining a civilian road driving license.',
      },
      {
        topic: 'Sim Racing',
        fact: 'Competes regularly in professional online 24-hour endurance sim races with Team Redline during Grand Prix race weekends.',
      },
      {
        topic: 'Family Pedigree',
        fact: 'His mother Sophie Kumpen was an elite international karting champion who defeated Christian Horner and Jarno Trulli.',
      },
    ],
    driverLegacy:
      'Max Verstappen has fundamentally reshaped expectations of youthful precocity and uncompromising racing conviction in modern Grand Prix racing. His aggressive precision in wet and variable conditions established statistical standards that define the ground-effect era.',
    stats: {
      worldChampionships: 4,
      raceWins: 65,
      podiums: 119,
      polePositions: 42,
      fastestLaps: 36,
      starts: 216,
      statLabel: 'Formula 1 Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 4,
      points: 236,
      wins: 2,
      podiums: 8,
      polePositions: 2,
      fastestLaps: 3,
      raceStarts: 18,
      raceFinishes: 18,
      dnfs: 0,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'Red Bull Racing', carOrBike: 'Red Bull RB22', position: 4, points: 236, wins: 2, podiums: 8, poles: 2, notes: 'Leading Red Bull in maiden Ford Powertrains campaign' },
      { season: 2025, series: 'Formula 1', team: 'Red Bull Racing', carOrBike: 'Red Bull RB21', position: 2, points: 395, wins: 8, podiums: 14, poles: 7, notes: 'Narrow title fight with Lando Norris' },
      { season: 2024, series: 'Formula 1', team: 'Red Bull Racing', carOrBike: 'Red Bull RB20', position: 1, points: 429, wins: 9, podiums: 14, poles: 8, notes: 'Clinched 4th consecutive World Championship' },
      { season: 2023, series: 'Formula 1', team: 'Red Bull Racing', carOrBike: 'Red Bull RB19', position: 1, points: 575, wins: 19, podiums: 21, poles: 12, notes: 'All-time record 19 wins in a single season' },
      { season: 2022, series: 'Formula 1', team: 'Red Bull Racing', carOrBike: 'Red Bull RB18', position: 1, points: 454, wins: 15, podiums: 17, poles: 7, notes: 'Dominant 2nd World Championship title' },
      { season: 2021, series: 'Formula 1', team: 'Red Bull Racing', carOrBike: 'Red Bull RB16B', position: 1, points: 395.5, wins: 10, podiums: 18, poles: 10, notes: 'Maiden World Drivers’ Championship' },
    ],
    driverDna: 'Fierce corner-entry commitment, instant steering micro-corrections, and supreme wet-weather spatial vision.',
    careerHighlights: [
      '4x FIA Formula One World Drivers’ Champion (2021, 2022, 2023, 2024)',
      'Most wins in a single F1 season (19 victories in 2023)',
      'All-time record 10 consecutive Grand Prix victories',
      'Youngest race winner in Formula One history (18y 228d)',
    ],
    biography:
      'Max Verstappen is the benchmark of modern Formula One precision. Driving for Red Bull Racing, his razor-sharp reflexes and aggressive throttle delivery have delivered four consecutive World Championships.',
    teamWebsite: 'https://www.redbullracing.com',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-antonelli',
    slug: 'kimi-antonelli',
    name: 'Andrea Kimi Antonelli',
    fullName: 'Andrea Kimi Antonelli',
    code: 'ANT',
    number: 12,
    nationality: 'Italian',
    countryCode: 'ITA',
    countryFlag: '🇮🇹',
    team: 'Mercedes-AMG PETRONAS',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Single-Seater Racing',
    carOrBike: 'Mercedes-AMG F1 W17 E Performance',
    status: 'active',
    birthDate: '2006-08-25',
    birthPlace: 'Bologna, Emilia-Romagna, Italy',
    shortIntroduction:
      'Italian racing prodigy driving for Mercedes-AMG PETRONAS Formula One Team alongside George Russell. Signed to the Mercedes Junior Team at age 12, Antonelli achieved one of the most decorated junior ladder records in modern motorsport.',
    earlyLifeAndBeginnings:
      'Born on 25 August 2006 in Bologna to former touring car racer and team owner Marco Antonelli. Given the middle name "Kimi" in tribute to 2007 Ferrari World Champion Kimi Räikkönen. Began karting at age seven at the South Garda Karting circuit in Lonato. Under the management of Minardi and Mercedes, he swept the European CIK-FIA Karting Championships in back-to-back seasons (2020, 2021).',
    careerJourney: [
      {
        period: '2014–2021',
        title: 'European Karting Champion',
        category: 'KARTING',
        description: 'Won the CIK-FIA European Championship in OK-Junior and OK Senior classes back-to-back.',
      },
      {
        period: '2022',
        title: 'Italian F4 & ADAC F4 Double Champion',
        category: 'JUNIOR_CAREER',
        description: 'Dominated with Prema Racing, taking 22 race victories across both championships.',
      },
      {
        period: '2023',
        title: 'Formula Regional European Champion (FRECA)',
        category: 'JUNIOR_CAREER',
        description: 'Captured the FRECA and Formula Regional Middle East titles in his rookie campaign.',
      },
      {
        period: '2024',
        title: 'FIA Formula 2 Race Winner',
        category: 'JUNIOR_CAREER',
        description: 'Bypassed FIA F3 to contest FIA F2 with Prema, winning the Silverstone Sprint and Budapest Feature race.',
      },
      {
        period: '2025–Present',
        title: 'Mercedes-AMG PETRONAS Formula One Seat',
        category: 'TOP_FLIGHT',
        description: 'Promoted directly to Lewis Hamilton’s vacant race seat, becoming a Grand Prix winner in his rookie season.',
      },
    ],
    teamsHistory: [
      {
        period: '2021–2023',
        team: 'Prema Racing',
        championship: 'Formula 4 & FRECA',
        carOrBike: 'Tatuus F4-T421 / T-318',
        notes: '2022 Italian F4 Champion, 2022 ADAC F4 Champion, 2023 FRECA Champion',
      },
      {
        period: '2024',
        team: 'Prema Racing',
        championship: 'FIA Formula 2',
        carOrBike: 'Dallara F2 2024',
        notes: '2 Race Victories (Silverstone Sprint, Budapest Feature Race)',
      },
      {
        period: '2025–Present',
        team: 'Mercedes-AMG PETRONAS Formula One Team',
        championship: 'Formula 1',
        carOrBike: 'Mercedes F1 W16 / W17',
        notes: 'Grand Prix race winner and championship leader in maiden campaign',
      },
    ],
    careerAchievements: [
      {
        title: '2022 Italian F4 & ADAC F4 Champion',
        countOrDetail: '22 Combined Victories',
        description: 'Record-setting single-season dominance in junior single-seaters.',
      },
      {
        title: '2023 Formula Regional European Champion (FRECA)',
        countOrDetail: 'Maiden Title',
        description: 'Clinched European title before advancing directly into FIA Formula 2.',
      },
      {
        title: 'Multiple FIA Formula 2 Race Winner',
        countOrDetail: '2 Victories',
        description: 'Mastered damp conditions at Silverstone and strategic tyre-saving at Budapest.',
      },
      {
        title: 'Youngest Italian Grand Prix Race Winner',
        countOrDetail: 'Formula 1',
        description: 'First Italian Grand Prix race winner in modern Formula 1 era.',
        isRecord: true,
      },
    ],
    interestingFacts: [
      {
        topic: 'Origin Story',
        fact: 'His father Marco Antonelli named him "Kimi" as an affectionate tribute to friend and racing peer Kimi Räikkönen.',
      },
      {
        topic: 'Private Testing',
        fact: 'Completed private Testing of Previous Cars (TPC) programmes at Imola, Red Bull Ring, and Spa in 2021/2022 Mercedes F1 machinery.',
      },
    ],
    driverLegacy:
      'Antonelli represents the pinnacle of modern junior formula progression, demonstrating that relentless talent, psychological fortitude, and comprehensive factory simulator preparation can conquer Formula 1 as a teenager.',
    stats: {
      worldChampionships: 0,
      raceWins: 5,
      podiums: 13,
      polePositions: 4,
      fastestLaps: 5,
      starts: 24,
      statLabel: 'Formula 1 Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 1,
      points: 302,
      wins: 5,
      podiums: 13,
      polePositions: 4,
      fastestLaps: 5,
      raceStarts: 18,
      raceFinishes: 18,
      dnfs: 0,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W17', position: 1, points: 302, wins: 5, podiums: 13, poles: 4, notes: 'Sensational championship leader in sophomore F1 year' },
      { season: 2025, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W16', position: 4, points: 205, wins: 1, podiums: 5, poles: 1, notes: 'Maiden F1 win in rookie campaign' },
      { season: 2024, series: 'FIA Formula 2', team: 'Prema Racing', carOrBike: 'Dallara F2 2024', position: 4, points: 113, wins: 2, podiums: 3, poles: 0, notes: 'Silverstone & Budapest feature race victories' },
    ],
    driverDna: 'Instantaneous telemetry assimilation, active-aero threshold precision, and cool composure under championship pressure.',
    careerHighlights: [
      'Mercedes-AMG PETRONAS Formula One Team works driver',
      '2022 Italian F4 & ADAC F4 Champion (22 wins)',
      '2023 Formula Regional European Champion (FRECA)',
      'Multiple FIA Formula 2 feature and sprint race winner',
    ],
    biography:
      'Andrea Kimi Antonelli is Italian motorsport’s brightest hope. Promoted to Mercedes-AMG PETRONAS alongside George Russell, Antonelli blends raw speed with supernatural adaptability.',
    teamWebsite: 'https://www.mercedesamgf1.com',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-leclerc',
    slug: 'charles-leclerc',
    name: 'Charles Leclerc',
    fullName: 'Charles Marc Hervé Perceval Leclerc',
    code: 'LEC',
    number: 16,
    nationality: 'Monégasque',
    countryCode: 'MON',
    countryFlag: '🇲🇨',
    team: 'Scuderia Ferrari',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Single-Seater Racing',
    carOrBike: 'Ferrari SF-26 Hybrid',
    status: 'active',
    birthDate: '1997-10-16',
    birthPlace: 'Monte Carlo, Monaco',
    shortIntroduction:
      'Monégasque racing driver for Scuderia Ferrari, 2024 Monaco Grand Prix and Italian Grand Prix winner, and one of the finest one-lap qualifying talents in Formula 1 history.',
    earlyLifeAndBeginnings:
      'Born on 16 October 1997 in Monte Carlo, Monaco. Son of former Formula 3 driver Hervé Leclerc. Began karting at age seven at the track in Brignoles managed by Philippe Bianchi, father of Jules Bianchi. Jules became Charles’s godfather, mentor, and closest confidant, guiding him through his early career and introducing him to Nicolas Todt and the Ferrari Driver Academy.',
    careerJourney: [
      {
        period: '2005–2013',
        title: 'CIK-FIA World Cup Karting Star',
        category: 'KARTING',
        description: 'Won the 2011 CIK-FIA KF3 World Cup and finished runner-up to Max Verstappen in the 2013 World KZ Championship.',
      },
      {
        period: '2016',
        title: 'GP3 Series Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the GP3 Series title with ART Grand Prix in his rookie season as a Ferrari Driver Academy member.',
      },
      {
        period: '2017',
        title: 'Dominant FIA Formula 2 Champion',
        category: 'JUNIOR_CAREER',
        description: 'Took 7 wins and 8 poles with Prema Racing in an emotionally charged rookie season following the passing of his father Hervé.',
      },
      {
        period: '2018',
        title: 'Formula 1 Debut with Alfa Romeo Sauber',
        category: 'TOP_FLIGHT',
        description: 'Scored 39 points with Sauber, earning immediate promotion to Scuderia Ferrari.',
      },
      {
        period: '2019',
        title: 'Ferrari Breakthrough & Monza Victory',
        category: 'TOP_FLIGHT',
        description: 'Won maiden Grands Prix at Spa and Monza before the Tifosi, taking the most pole positions (7) of any driver that year.',
      },
      {
        period: '2024',
        title: 'Historic Monaco & Monza Triumphs',
        category: 'CHAMPIONSHIP',
        description: 'Achieved lifelong dream winning his home Monaco Grand Prix from pole, followed by tactical masterclass victory at Monza.',
      },
    ],
    teamsHistory: [
      {
        period: '2018',
        team: 'Alfa Romeo Sauber F1 Team',
        championship: 'Formula 1',
        carOrBike: 'Sauber C37',
        notes: '39 points scored, Rookie of the Year award',
      },
      {
        period: '2019–Present',
        team: 'Scuderia Ferrari',
        championship: 'Formula 1',
        carOrBike: 'Ferrari SF90 through SF-26',
        notes: '8+ Grand Prix Victories, 26+ Pole Positions, 2024 Monaco GP Winner',
      },
    ],
    careerAchievements: [
      {
        title: '2024 Monaco Grand Prix Winner',
        countOrDetail: 'Maiden Home Win',
        description: 'First native Monégasque driver to win the Monaco Grand Prix in 93 years.',
        isRecord: true,
      },
      {
        title: 'Two-Time Italian Grand Prix Winner at Monza',
        countOrDetail: '2 Victories (2019, 2024)',
        description: 'Drove Ferrari to historic victories before hundreds of thousands of Tifosi.',
      },
      {
        title: '2017 FIA Formula 2 Champion',
        countOrDetail: 'Rookie Title',
        description: 'Swept 8 pole positions and 7 race victories with Prema Racing.',
      },
      {
        title: 'Over 26 Formula 1 Pole Positions',
        countOrDetail: '26+ Poles',
        description: 'Celebrated as one of the fastest Saturday qualifiers in Grand Prix history.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Mentorship',
        fact: 'Godson of the late Formula 1 driver Jules Bianchi, whose memory he honors on his racing helmets.',
      },
      {
        topic: 'Music',
        fact: 'An accomplished classical pianist who has composed and published original piano singles that entered global streaming charts.',
      },
    ],
    driverLegacy:
      'Charles Leclerc embodies Ferrari’s beating heart. Loved worldwide for his humility, devastating one-lap qualifying commitment, and passionate devotion to the scarlet red prancing horse, Leclerc is Monaco’s greatest motorsport son.',
    stats: {
      worldChampionships: 0,
      raceWins: 8,
      podiums: 42,
      polePositions: 26,
      fastestLaps: 10,
      starts: 154,
      statLabel: 'Formula 1 Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 5,
      points: 233,
      wins: 2,
      podiums: 8,
      polePositions: 4,
      fastestLaps: 2,
      raceStarts: 18,
      raceFinishes: 17,
      dnfs: 1,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'Scuderia Ferrari', carOrBike: 'Ferrari SF-26', position: 5, points: 233, wins: 2, podiums: 8, poles: 4, notes: 'Victories at Monaco and Baku' },
      { season: 2024, series: 'Formula 1', team: 'Scuderia Ferrari', carOrBike: 'Ferrari SF-24', position: 3, points: 356, wins: 2, podiums: 13, poles: 3, notes: 'Historic Monaco GP home win & Italian GP Monza triumph' },
      { season: 2022, series: 'Formula 1', team: 'Scuderia Ferrari', carOrBike: 'Ferrari F1-75', position: 2, points: 308, wins: 3, podiums: 11, poles: 9, notes: 'World Championship runner-up with 9 poles' },
      { season: 2019, series: 'Formula 1', team: 'Scuderia Ferrari', carOrBike: 'Ferrari SF90', position: 4, points: 264, wins: 2, podiums: 10, poles: 7, notes: 'Maiden wins at Spa & Monza; most poles of 2019 season' },
    ],
    driverDna: 'Peerless Saturday qualifying commitment, wall-brushing street circuit bravery, and supreme tyre feel in qualifying trim.',
    careerHighlights: [
      '2024 Monaco Grand Prix Winner (First native Monégasque win in 93 years)',
      '2x Italian Grand Prix Winner at Monza for Scuderia Ferrari (2019, 2024)',
      '26+ Career Formula One Pole Positions',
      '2017 FIA Formula 2 Champion & 2016 GP3 Champion',
    ],
    biography:
      'Charles Leclerc is Scuderia Ferrari’s qualifying talisman. The Monégasque driver’s lightning reflex speeds through narrow barriers make him one of the most exciting pilots on the grid.',
    teamWebsite: 'https://www.ferrari.com/en-EN/formula1',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-norris',
    slug: 'lando-norris',
    name: 'Lando Norris',
    fullName: 'Lando Norris',
    code: 'NOR',
    number: 4,
    nationality: 'British',
    countryCode: 'GBR',
    countryFlag: '🇬🇧',
    team: 'McLaren F1 Team',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Single-Seater Racing',
    carOrBike: 'McLaren MCL39 Mercedes',
    status: 'active',
    birthDate: '1999-11-13',
    birthPlace: 'Bristol, England',
    shortIntroduction:
      'British racing driver leading McLaren F1 Team, Grand Prix winner, and central protagonist in Formula 1 World Championship battles.',
    earlyLifeAndBeginnings:
      'Born on 13 November 1999 in Bristol to Adam and Cisca Norris. Grew up in Glastonbury, Somerset. Initially interested in horse riding and motorcycle racing before trying a kart at age seven. Won the 2014 CIK-FIA World Championship in the KF class at age 14, becoming the youngest karting world champion in history, eclipsing Lewis Hamilton\'s record.',
    careerJourney: [
      {
        period: '2014',
        title: 'Youngest CIK-FIA World Karting Champion',
        category: 'KARTING',
        description: 'Won the CIK-FIA World KF Championship at age 14 years, 11 months.',
      },
      {
        period: '2015–2017',
        title: 'Junior Formula Title Sweep',
        category: 'JUNIOR_CAREER',
        description: 'Won MSA Formula (2015), Toyota Racing Series (2016), Eurocup Formula Renault 2.0 (2016), and FIA F3 European Championship (2017).',
      },
      {
        period: '2018',
        title: 'FIA Formula 2 Runner-Up & McLaren Reserve',
        category: 'JUNIOR_CAREER',
        description: 'Finished runner-up in FIA F2 with Carlin, securing full-time F1 promotion.',
      },
      {
        period: '2019',
        title: 'Formula 1 Debut with McLaren',
        category: 'TOP_FLIGHT',
        description: 'Debuted alongside Carlos Sainz, helping revive McLaren into competitive midfield contention.',
      },
      {
        period: '2024',
        title: 'Maiden Victory & World Title Fight',
        category: 'CHAMPIONSHIP',
        description: 'Scored maiden F1 victory at the Miami Grand Prix, followed by dominant wins in Zandvoort and Singapore.',
      },
    ],
    teamsHistory: [
      {
        period: '2019–Present',
        team: 'McLaren F1 Team',
        championship: 'Formula 1',
        carOrBike: 'McLaren MCL34 through MCL39',
        notes: '4+ Grand Prix Wins, 25+ Podiums, 2024 Miami, Dutch & Singapore GP Winner',
      },
    ],
    careerAchievements: [
      {
        title: '2024 Miami Grand Prix Winner',
        countOrDetail: 'Maiden Victory',
        description: 'Claimed his first career Formula 1 Grand Prix victory with McLaren.',
      },
      {
        title: '2014 CIK-FIA World Karting Champion',
        countOrDetail: 'Youngest in History',
        description: 'Won the world karting crown at age 14, eclipsing previous benchmarks.',
        isRecord: true,
      },
      {
        title: '2017 FIA Formula 3 European Champion',
        countOrDetail: 'Rookie Champion',
        description: 'Claimed 9 race wins in his rookie season with Carlin.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Dual Nationality',
        fact: 'Holds dual British and Belgian citizenship through his Flemish mother Cisca.',
      },
      {
        topic: 'Esports & Lifestyle',
        fact: 'Founded the gaming, content creation, and apparel brand Quadrant in 2020.',
      },
    ],
    driverLegacy:
      'Norris embodies the modern digital-era racing hero: transparent, candid, and possessing devastating aerodynamic flow-corner speed that propelled McLaren back to the pinnacle of Formula 1.',
    stats: {
      worldChampionships: 0,
      raceWins: 4,
      podiums: 26,
      polePositions: 8,
      fastestLaps: 11,
      starts: 136,
      statLabel: 'Formula 1 Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 6,
      points: 211,
      wins: 1,
      podiums: 7,
      polePositions: 2,
      fastestLaps: 2,
      raceStarts: 18,
      raceFinishes: 18,
      dnfs: 0,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'McLaren F1 Team', carOrBike: 'McLaren MCL39', position: 6, points: 211, wins: 1, podiums: 7, poles: 2, notes: 'Winner of the Dutch Grand Prix' },
      { season: 2024, series: 'Formula 1', team: 'McLaren F1 Team', carOrBike: 'McLaren MCL38', position: 2, points: 374, wins: 3, podiums: 12, poles: 8, notes: 'Maiden victory in Miami; World Championship runner-up' },
    ],
    driverDna: 'Flow-corner apex speed carrying, clean air tyre preservation, and devastating qualifying precision.',
    careerHighlights: [
      '2024 Miami Grand Prix Winner (Maiden F1 Victory)',
      'Multiple Grand Prix victories at Zandvoort and Singapore',
      'Youngest CIK-FIA World Karting Champion in history (age 14)',
      'Led McLaren to its first Constructors’ Championship challenge in a decade',
    ],
    biography:
      'Lando Norris is the spearhead of McLaren’s racing resurgence. Known for his staggering high-speed cornering speed and engaging personality, Norris has cemented himself as an elite Grand Prix winner.',
    teamWebsite: 'https://www.mclaren.com/racing/formula-1',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-russell',
    slug: 'george-russell',
    name: 'George Russell',
    fullName: 'George William Russell',
    code: 'RUS',
    number: 63,
    nationality: 'British',
    countryCode: 'GBR',
    countryFlag: '🇬🇧',
    team: 'Mercedes-AMG PETRONAS',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Single-Seater Racing',
    carOrBike: 'Mercedes-AMG F1 W17 E Performance',
    status: 'active',
    birthDate: '1998-02-15',
    birthPlace: 'King\'s Lynn, Norfolk, England',
    shortIntroduction:
      'British Formula 1 Grand Prix winner driving for Mercedes-AMG PETRONAS Formula One Team, Director of the Grand Prix Drivers’ Association (GPDA), and former FIA Formula 2 Champion.',
    earlyLifeAndBeginnings:
      'Born on 15 February 1998 in King’s Lynn, Norfolk. Started karting at age eight, encouraged by his father and elder brother Benjy. After sweeping national Super One karting titles, Russell famously prepared a PowerPoint presentation for Mercedes team boss Toto Wolff explaining why he should be signed to the junior programme.',
    careerJourney: [
      {
        period: '2014',
        title: 'BRDC Formula 4 Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the championship by 3 points and received the prestigious McLaren Autosport BRDC Award.',
      },
      {
        period: '2017',
        title: 'GP3 Series Champion',
        category: 'JUNIOR_CAREER',
        description: 'Clinched the GP3 title with ART Grand Prix as a Mercedes junior.',
      },
      {
        period: '2018',
        title: 'FIA Formula 2 Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the FIA F2 championship with 7 wins, defeating Lando Norris and Alexander Albon.',
      },
      {
        period: '2019–2021',
        title: 'Williams Racing & "Mr. Saturday"',
        category: 'TOP_FLIGHT',
        description: 'Outqualified teammates in 57 consecutive races and scored a famous front-row qualifying podium at Spa 2021.',
      },
      {
        period: '2022–Present',
        title: 'Mercedes-AMG PETRONAS Race Winner',
        category: 'TOP_FLIGHT',
        description: 'Claimed maiden Grand Prix victory at São Paulo 2022, followed by wins in Austria and Las Vegas in 2024.',
      },
    ],
    teamsHistory: [
      {
        period: '2019–2021',
        team: 'Williams Racing',
        championship: 'Formula 1',
        carOrBike: 'Williams FW42 / FW43 / FW43B',
        notes: 'Earned "Mr. Saturday" nickname, P2 qualifying and podium at Spa 2021',
      },
      {
        period: '2020',
        team: 'Mercedes-AMG PETRONAS Formula One Team',
        championship: 'Formula 1',
        carOrBike: 'Mercedes W11',
        notes: 'Substitute appearance at Sakhir Grand Prix; led race and set fastest lap',
      },
      {
        period: '2022–Present',
        team: 'Mercedes-AMG PETRONAS Formula One Team',
        championship: 'Formula 1',
        carOrBike: 'Mercedes W13 through W17',
        notes: 'Multi-time Grand Prix Winner (São Paulo 2022, Austria 2024, Las Vegas 2024)',
      },
    ],
    careerAchievements: [
      {
        title: '2018 FIA Formula 2 Champion',
        countOrDetail: '7 Victories',
        description: 'Dominant rookie championship campaign against elite modern peers.',
      },
      {
        title: '2022 São Paulo Grand Prix Winner',
        countOrDetail: 'Maiden Victory',
        description: 'Delivered dominant Sprint and Grand Prix victory sweep at Interlagos.',
      },
      {
        title: 'Director of the Grand Prix Drivers’ Association (GPDA)',
        countOrDetail: 'Appointed 2021',
        description: 'Elected by his fellow drivers to lead safety, regulatory, and sporting representation.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Career Initiation',
        fact: 'Prepared an actual PowerPoint presentation in 2014 to present to Toto Wolff outlining his statistical trajectory and potential.',
      },
      {
        topic: 'Saturday Dominance',
        fact: 'Maintained an unbroken 57-race qualifying clean-sweep against teammates at Williams from 2019 to mid-2021.',
      },
    ],
    driverLegacy:
      'Russell represents the archetype of analytical modern professionalism: disciplined, technically articulate, and fiercely quick when maximum grip is available on Saturday afternoons.',
    stats: {
      worldChampionships: 0,
      raceWins: 3,
      podiums: 17,
      polePositions: 5,
      fastestLaps: 8,
      starts: 136,
      statLabel: 'Formula 1 Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 2,
      points: 236,
      wins: 3,
      podiums: 10,
      polePositions: 3,
      fastestLaps: 2,
      raceStarts: 18,
      raceFinishes: 18,
      dnfs: 0,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W17', position: 2, points: 236, wins: 3, podiums: 10, poles: 3, notes: 'Leading Mercedes title charge' },
      { season: 2024, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W15', position: 6, points: 245, wins: 2, podiums: 4, poles: 3, notes: 'Victories at Austrian GP and Las Vegas GP' },
      { season: 2022, series: 'Formula 1', team: 'Mercedes-AMG PETRONAS', carOrBike: 'Mercedes W13', position: 4, points: 275, wins: 1, podiums: 8, poles: 1, notes: 'Maiden F1 victory at São Paulo Grand Prix' },
    ],
    driverDna: 'Exceptional Saturday qualifying execution, acute strategic radio vision, and precise aerodynamic vehicle positioning.',
    careerHighlights: [
      'Multi-time Formula One Grand Prix Winner (São Paulo 2022, Austria 2024, Las Vegas 2024)',
      '2018 FIA Formula 2 Champion',
      'Director of the Grand Prix Drivers’ Association (GPDA)',
    ],
    biography:
      'George Russell combines calculating intellect with supreme wheel-to-wheel tenacity. Known as "Mr. Saturday" for his qualifying heroics, Russell is a core cornerstone of Mercedes’ long-term championship ambitions.',
    teamWebsite: 'https://www.mercedesamgf1.com',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-piastri',
    slug: 'oscar-piastri',
    name: 'Oscar Piastri',
    fullName: 'Oscar Jack Piastri',
    code: 'PIA',
    number: 81,
    nationality: 'Australian',
    countryCode: 'AUS',
    countryFlag: '🇦🇺',
    team: 'McLaren F1 Team',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Single-Seater Racing',
    carOrBike: 'McLaren MCL39 Mercedes',
    status: 'active',
    birthDate: '2001-04-06',
    birthPlace: 'Melbourne, Victoria, Australia',
    shortIntroduction:
      'Australian Formula 1 Grand Prix winner driving for McLaren F1 Team, 2024 Hungarian and Azerbaijan Grand Prix winner, and historic back-to-back rookie champion of Formula Renault, FIA F3, and FIA F2.',
    earlyLifeAndBeginnings:
      'Born on 6 April 2001 in Melbourne, Victoria, Australia. Began racing remote-controlled cars before taking up karting at age nine. At age 14, Piastri moved to the United Kingdom to pursue single-seater racing in Europe, attending Haileybury College while climbing the British junior ranks.',
    careerJourney: [
      {
        period: '2019',
        title: 'Formula Renault Eurocup Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the championship with R-ace GP taking 7 race wins.',
      },
      {
        period: '2020',
        title: 'FIA Formula 3 Rookie Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the FIA F3 championship in his debut season with Prema Racing.',
      },
      {
        period: '2021',
        title: 'FIA Formula 2 Rookie Champion',
        category: 'JUNIOR_CAREER',
        description: 'Completed historic junior formula treble by winning FIA F2 as a rookie with 6 wins and 5 consecutive poles.',
      },
      {
        period: '2023',
        title: 'Formula 1 Debut & Qatar Sprint Victory',
        category: 'TOP_FLIGHT',
        description: 'Signed with McLaren; took Qatar Sprint race victory and multiple Grand Prix podiums in rookie season.',
      },
      {
        period: '2024',
        title: 'Grand Prix Victories in Hungary & Baku',
        category: 'TOP_FLIGHT',
        description: 'Took maiden F1 win at Hungaroring and produced defensive masterclass holding off Leclerc in Baku.',
      },
    ],
    teamsHistory: [
      {
        period: '2019',
        team: 'R-ace GP',
        championship: 'Formula Renault Eurocup',
        carOrBike: 'Tatuus F.3 T-318',
        notes: '2019 Formula Renault Eurocup Champion',
      },
      {
        period: '2020',
        team: 'Prema Racing',
        championship: 'FIA Formula 3',
        carOrBike: 'Dallara F3 2019',
        notes: '2020 FIA Formula 3 Champion (Rookie season)',
      },
      {
        period: '2021',
        team: 'Prema Racing',
        championship: 'FIA Formula 2',
        carOrBike: 'Dallara F2 2018',
        notes: '2021 FIA Formula 2 Champion (Rookie season, 6 wins)',
      },
      {
        period: '2023–Present',
        team: 'McLaren F1 Team',
        championship: 'Formula 1',
        carOrBike: 'McLaren MCL60 through MCL39',
        notes: '2 Grand Prix Victories (Hungary, Azerbaijan 2024), 2023 Qatar Sprint Winner',
      },
    ],
    careerAchievements: [
      {
        title: 'Historic Junior Treble in Consecutive Seasons',
        countOrDetail: 'Formula Renault, F3, F2 (2019, 2020, 2021)',
        description: 'Only driver in history to win Formula Renault, FIA F3, and FIA F2 in back-to-back rookie campaigns.',
        isRecord: true,
      },
      {
        title: '2024 Hungarian Grand Prix Winner',
        countOrDetail: 'Maiden Grand Prix Win',
        description: 'First Australian Grand Prix winner since Daniel Ricciardo.',
      },
      {
        title: '2024 Azerbaijan Grand Prix Winner',
        countOrDetail: 'Street Victory',
        description: 'Produced defensive masterclass against Charles Leclerc through Baku’s narrow street sections.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Mentorship',
        fact: 'Managed and mentored by nine-time Formula 1 Grand Prix winner Mark Webber.',
      },
      {
        topic: 'Pulse Composure',
        fact: 'Celebrated for having the lowest recorded heart rate and most unperturbed radio demeanor on the grid.',
      },
    ],
    driverLegacy:
      'Oscar Piastri has proven that mathematical junior ladder domination translates directly to Grand Prix excellence. His composure under extreme race pressure marks him as a perennial future World Championship contender.',
    stats: {
      worldChampionships: 0,
      raceWins: 2,
      podiums: 12,
      polePositions: 0,
      sprintWins: 1,
      fastestLaps: 3,
      starts: 55,
      statLabel: 'Formula 1 Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 7,
      points: 178,
      wins: 1,
      podiums: 5,
      polePositions: 1,
      fastestLaps: 1,
      raceStarts: 18,
      raceFinishes: 18,
      dnfs: 0,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'McLaren F1 Team', carOrBike: 'McLaren MCL39', position: 7, points: 178, wins: 1, podiums: 5, poles: 1, notes: 'Grand Prix victory in Bahrain' },
      { season: 2024, series: 'Formula 1', team: 'McLaren F1 Team', carOrBike: 'McLaren MCL38', position: 4, points: 292, wins: 2, podiums: 7, poles: 0, notes: 'Victories at Hungaroring & Baku City Circuit' },
    ],
    driverDna: 'Imperturbable radio calm, calculated late-braking defense, and ruthless race execution.',
    careerHighlights: [
      '2x Formula One Grand Prix Winner (Hungary & Azerbaijan 2024)',
      'Only driver in history to win Formula Renault, FIA F3, and FIA F2 in consecutive rookie seasons',
      '2023 Qatar Sprint Race Winner as a rookie',
    ],
    biography:
      'Oscar Piastri is one of Formula One’s most ice-cool competitors. Managed by Mark Webber, Piastri’s composed racecraft and calculated late-braking defense have earned him immense respect across the paddock.',
    teamWebsite: 'https://www.mclaren.com/racing/formula-1',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-alonso',
    slug: 'fernando-alonso',
    name: 'Fernando Alonso',
    fullName: 'Fernando Alonso Díaz',
    code: 'ALO',
    number: 14,
    nationality: 'Spanish',
    countryCode: 'ESP',
    countryFlag: '🇪🇸',
    team: 'Aston Martin Aramco',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 & World Endurance Racing',
    carOrBike: 'Aston Martin AMR26 (Honda Works)',
    status: 'active',
    birthDate: '1981-07-29',
    birthPlace: 'Oviedo, Asturias, Spain',
    shortIntroduction:
      'Two-time Formula 1 World Drivers’ Champion (2005, 2006), two-time 24 Hours of Le Mans Winner (2018, 2019), FIA World Endurance Champion, and all-time record holder for the most Grand Prix race starts in history (400+).',
    earlyLifeAndBeginnings:
      'Born on 29 July 1981 in Oviedo, Asturias, Spain. His father, an amateur kart builder, built a kart for Fernando’s elder sister, but three-year-old Fernando took it instead. Supported by his parents, Alonso dominated Spanish national karting before catching the eye of former Minardi driver Adrián Campos, who launched his single-seater career in 1999.',
    careerJourney: [
      {
        period: '1999',
        title: 'Euro Open by Nissan Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the championship in his debut single-seater season with Adrián Campos.',
      },
      {
        period: '2001',
        title: 'Formula 1 Debut with Minardi',
        category: 'TOP_FLIGHT',
        description: 'Debuted at age 19, demonstrating blistering pace in underfunded machinery.',
      },
      {
        period: '2005–2006',
        title: 'Back-to-Back Formula 1 World Championships',
        category: 'CHAMPIONSHIP',
        description: 'Dethroned Michael Schumacher and Ferrari to claim consecutive World Drivers’ Championships with Renault.',
      },
      {
        period: '2010–2014',
        title: 'Scuderia Ferrari Era',
        category: 'TOP_FLIGHT',
        description: 'Took 11 wins and finished championship runner-up three times in heroic underdog campaigns.',
      },
      {
        period: '2018–2019',
        title: '24 Hours of Le Mans & WEC World Champion',
        category: 'CHAMPIONSHIP',
        description: 'Won the 24 Hours of Le Mans twice with Toyota Gazoo Racing and claimed the World Endurance Championship.',
      },
      {
        period: '2023–Present',
        title: 'Aston Martin Podium Renaissance',
        category: 'TOP_FLIGHT',
        description: 'Claimed 8 podiums in 2023, surpassing 400 Grand Prix starts and leading Aston Martin into the Honda era.',
      },
    ],
    teamsHistory: [
      {
        period: '2001',
        team: 'European Minardi F1',
        championship: 'Formula 1',
        carOrBike: 'Minardi PS01',
        notes: 'Formula 1 debut season',
      },
      {
        period: '2003–2006',
        team: 'Mild Seven Renault F1 Team',
        championship: 'Formula 1',
        carOrBike: 'Renault R23 through R26',
        notes: '2x World Champion (2005, 2006), 15 Wins, 15 Poles',
      },
      {
        period: '2007',
        team: 'Vodafone McLaren Mercedes',
        championship: 'Formula 1',
        carOrBike: 'McLaren MP4-22',
        notes: '4 Wins, 109 Points, tied for runner-up in championship',
      },
      {
        period: '2008–2009',
        team: 'ING Renault F1 Team',
        championship: 'Formula 1',
        carOrBike: 'Renault R28 / R29',
        notes: '2 Wins (Singapore, Fuji 2008)',
      },
      {
        period: '2010–2014',
        team: 'Scuderia Ferrari',
        championship: 'Formula 1',
        carOrBike: 'Ferrari F10 through F14 T',
        notes: '11 Wins, 3x WDC Runner-Up (2010, 2012, 2013)',
      },
      {
        period: '2015–2018',
        team: 'McLaren Honda / Renault',
        championship: 'Formula 1',
        carOrBike: 'McLaren MP4-30 through MCL33',
        notes: 'Endured challenging hybrid development years',
      },
      {
        period: '2018–2019',
        team: 'Toyota Gazoo Racing',
        championship: 'FIA World Endurance Championship',
        carOrBike: 'Toyota TS050 Hybrid',
        notes: '2x 24 Hours of Le Mans Winner, FIA World Endurance Champion',
      },
      {
        period: '2021–2022',
        team: 'Alpine F1 Team',
        championship: 'Formula 1',
        carOrBike: 'Alpine A521 / A522',
        notes: 'Podium in Qatar 2021',
      },
      {
        period: '2023–Present',
        team: 'Aston Martin Aramco Formula One Team',
        championship: 'Formula 1',
        carOrBike: 'Aston Martin AMR23 through AMR26',
        notes: '8 Podiums in 2023, piloting works Honda partnership',
      },
    ],
    careerAchievements: [
      {
        title: '2x FIA Formula One World Drivers’ Champion',
        countOrDetail: '2005, 2006',
        description: 'Broke Schumacher’s dynasty to become Spain’s first Formula 1 World Champion.',
      },
      {
        title: '2x 24 Hours of Le Mans Overall Winner',
        countOrDetail: '2018, 2019',
        description: 'Won the world’s most prestigious endurance race twice with Toyota Gazoo Racing.',
      },
      {
        title: 'FIA World Endurance Champion',
        countOrDetail: '2018–19 Super Season',
        description: 'Clinched the LMP1 World Endurance Drivers’ Championship.',
      },
      {
        title: 'Most Formula 1 Grand Prix Starts in History',
        countOrDetail: '400+ Starts',
        description: 'First driver in history to contest over 400 Formula 1 Grands Prix.',
        isRecord: true,
      },
    ],
    interestingFacts: [
      {
        topic: 'Triple Crown',
        fact: 'Has won two legs of the Triple Crown of Motorsport (Monaco Grand Prix and 24 Hours of Le Mans).',
      },
      {
        topic: 'Museum & Circuit',
        fact: 'Constructed the Circuito y Museo Fernando Alonso in Asturias, displaying every racing chassis of his career.',
      },
    ],
    driverLegacy:
      'Fernando Alonso is celebrated as the consummate racer: relentless, tactically omnipresent, and possessing supernatural longevity that defies generations of motorsport evolution.',
    stats: {
      worldChampionships: 2,
      leMansWins: 2,
      raceWins: 32,
      podiums: 106,
      polePositions: 22,
      fastestLaps: 26,
      starts: 402,
      statLabel: 'Formula 1 & Le Mans Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'f1',
      position: 16,
      points: 7,
      wins: 0,
      podiums: 0,
      polePositions: 0,
      fastestLaps: 0,
      raceStarts: 18,
      raceFinishes: 16,
      dnfs: 2,
    },
    seasonHistory: [
      { season: 2026, series: 'Formula 1', team: 'Aston Martin Aramco', carOrBike: 'Aston Martin AMR26', position: 16, points: 7, wins: 0, podiums: 0, poles: 0, notes: 'Piloting first works Honda-powered Aston Martin' },
      { season: 2023, series: 'Formula 1', team: 'Aston Martin Aramco', carOrBike: 'Aston Martin AMR23', position: 4, points: 206, wins: 0, podiums: 8, poles: 0, notes: 'Sensational podium surge in green' },
      { season: 2018, series: 'FIA WEC', team: 'Toyota Gazoo Racing', carOrBike: 'Toyota TS050 Hybrid', position: 1, points: 198, wins: 5, podiums: 7, poles: 4, notes: 'World Endurance Champion & 2x Le Mans 24h Winner' },
      { season: 2006, series: 'Formula 1', team: 'Mild Seven Renault F1 Team', carOrBike: 'Renault R26', position: 1, points: 134, wins: 7, podiums: 14, poles: 6, notes: '2nd FIA Formula One World Drivers’ Championship' },
      { season: 2005, series: 'Formula 1', team: 'Mild Seven Renault F1 Team', carOrBike: 'Renault R25', position: 1, points: 133, wins: 7, podiums: 15, poles: 6, notes: '1st FIA Formula One World Drivers’ Championship' },
    ],
    driverDna: 'Omnipresent strategic vision, aggressive throttle commitment on corner exits, and unmatched longevity in top-flight motorsport.',
    careerHighlights: [
      '2x FIA Formula One World Drivers’ Champion (2005, 2006)',
      '2x 24 Hours of Le Mans Winner (2018, 2019 with Toyota Gazoo Racing)',
      'FIA World Endurance Champion (2018–19 Super Season)',
      'Over 400 Grand Prix race starts, the most in motorsport history',
    ],
    biography:
      'Fernando Alonso is an icon of modern racing. The Spanish double World Champion and double Le Mans victor continues to demonstrate unmatched tactical acuity and relentless speed well past 400 race starts.',
    teamWebsite: 'https://www.astonmartinf1.com',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-senna',
    slug: 'ayrton-senna',
    name: 'Ayrton Senna',
    fullName: 'Ayrton Senna da Silva',
    code: 'SEN',
    number: 12,
    nationality: 'Brazilian',
    countryCode: 'BRA',
    countryFlag: '🇧🇷',
    team: 'McLaren Honda (Historical Legend)',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Historical Legend',
    carOrBike: 'McLaren MP4/4 Honda Turbo',
    status: 'historical',
    birthDate: '1960-03-21',
    birthPlace: 'São Paulo, Brazil',
    shortIntroduction:
      'Three-time Formula 1 World Drivers’ Champion (1988, 1990, 1991), master of the Monaco Grand Prix with six victories, and widely revered as one of the fastest and most charismatic icons in human sporting history.',
    earlyLifeAndBeginnings:
      'Born on 21 March 1960 in São Paulo, Brazil, to wealthy landowner Milton da Silva and Neide Senna. Built his first go-kart with a lawnmower engine at age four. Entered his first kart competition at age 13 at the Interlagos kart track, starting on pole and demonstrating uncanny spatial awareness in the rain. Moved to England in 1981 to compete in Formula Ford, living in Norfolk and conquering the British junior ranks.',
    careerJourney: [
      {
        period: '1973–1981',
        title: 'South American Kart Champion',
        category: 'KARTING',
        description: 'Dominated South American karting and finished runner-up in the World Karting Championship twice.',
      },
      {
        period: '1981–1983',
        title: 'British Junior Formula Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won Formula Ford 1600 & 2000, and won the 1983 British F3 Championship with West Surrey Racing.',
      },
      {
        period: '1984',
        title: 'Sensational Monaco Debut in the Rain',
        category: 'TOP_FLIGHT',
        description: 'Formula 1 debut with Toleman; drove from 13th to 2nd in torrential rain at Monaco.',
      },
      {
        period: '1985–1987',
        title: 'Maiden Wins & Pole Master with Lotus',
        category: 'TOP_FLIGHT',
        description: 'Took maiden victory in pouring rain at Estoril in 1985; earned 16 pole positions with Team Lotus.',
      },
      {
        period: '1988–1991',
        title: 'Three World Championships with McLaren Honda',
        category: 'CHAMPIONSHIP',
        description: 'Won 3 World Drivers’ Championships (1988, 1990, 1991) and formed legendary rivalry with Alain Prost.',
      },
      {
        period: '1993',
        title: 'The Lap of the Gods',
        category: 'TOP_FLIGHT',
        description: 'Produced iconic opening lap at Donington Park in the wet, overtaking 4 cars on lap one.',
      },
    ],
    teamsHistory: [
      {
        period: '1984',
        team: 'Toleman Motorsport',
        championship: 'Formula 1',
        carOrBike: 'Toleman TG184',
        notes: 'Historic Monaco GP podium in pouring rain',
      },
      {
        period: '1985–1987',
        team: 'John Player Special / Camel Team Lotus',
        championship: 'Formula 1',
        carOrBike: 'Lotus 97T / 98T / 99T',
        notes: '6 Wins, 16 Pole Positions, maiden win at Estoril in torrential rain',
      },
      {
        period: '1988–1993',
        team: 'Honda Marlboro McLaren',
        championship: 'Formula 1',
        carOrBike: 'McLaren MP4/4 through MP4/8',
        notes: '3 World Championships (1988, 1990, 1991), 35 Wins, 46 Poles',
      },
      {
        period: '1994',
        team: 'Rothmans Williams Renault',
        championship: 'Formula 1',
        carOrBike: 'Williams FW16',
        notes: '3 Pole Positions in 3 races; tragic passing at Imola',
      },
    ],
    careerAchievements: [
      {
        title: '3x FIA Formula One World Drivers’ Champion',
        countOrDetail: '1988, 1990, 1991',
        description: 'Won three World Championships with McLaren Honda.',
      },
      {
        title: '6-Time Monaco Grand Prix Winner',
        countOrDetail: '6 Wins (1987, 1989, 1990, 1991, 1992, 1993)',
        description: 'All-time record for the most victories at the Monaco Grand Prix, including 5 consecutive.',
        isRecord: true,
      },
      {
        title: '65 Career Formula 1 Pole Positions',
        countOrDetail: '65 Poles',
        description: 'Historic 40.4% pole position conversion rate across his career.',
      },
      {
        title: 'The Lap of the Gods (Donington 1993)',
        countOrDetail: 'Historic Wet Lap',
        description: 'Widely celebrated as the greatest opening lap in Formula 1 history.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Monaco 1988',
        fact: 'Qualified 1.427 seconds faster than teammate Alain Prost at Monaco in 1988, describing it as an out-of-body spiritual state.',
      },
      {
        topic: 'Philanthropy',
        fact: 'Quietly donated an estimated $400 million during his lifetime to Brazilian educational and children\'s charities, formalized by the Instituto Ayrton Senna.',
      },
    ],
    driverLegacy:
      'Senna’s legacy transcends racing. His philosophical devotion to perfection, raw emotional honesty, and transcendent wet-weather mastery made him a national deity in Brazil and an eternal inspiration for racers worldwide.',
    stats: {
      worldChampionships: 3,
      raceWins: 41,
      podiums: 80,
      polePositions: 65,
      fastestLaps: 19,
      starts: 161,
      statLabel: 'Formula 1 Historical Legacy',
    },
    seasonHistory: [
      { season: 1991, series: 'Formula 1', team: 'Honda Marlboro McLaren', carOrBike: 'McLaren MP4/6', position: 1, points: 96, wins: 7, podiums: 12, poles: 8, notes: '3rd World Drivers’ Championship' },
      { season: 1990, series: 'Formula 1', team: 'Honda Marlboro McLaren', carOrBike: 'McLaren MP4/5B', position: 1, points: 78, wins: 6, podiums: 11, poles: 10, notes: '2nd World Drivers’ Championship' },
      { season: 1988, series: 'Formula 1', team: 'Honda Marlboro McLaren', carOrBike: 'McLaren MP4/4', position: 1, points: 90, wins: 8, podiums: 11, poles: 13, notes: '1st World Drivers’ Championship' },
    ],
    driverDna: 'Transcendental one-lap commitment, mystical connection with car limits in the rain, and unyielding psychological conviction.',
    careerHighlights: [
      '3x FIA Formula One World Drivers’ Champion (1988, 1990, 1991)',
      '65 Career pole positions (historic 40.4% pole conversion rate)',
      '6-time Monaco Grand Prix winner, an enduring all-time record',
    ],
    biography:
      'Ayrton Senna da Silva was more than a racing driver; he was a cultural phenomenon whose transcendental speed and relentless pursuit of perfection redefined motorsport philosophy.',
    championshipUrl: '/explore/f1',
  },

  {
    id: 'f1-schumacher',
    slug: 'michael-schumacher',
    name: 'Michael Schumacher',
    fullName: 'Michael Schumacher',
    code: 'MSC',
    number: 1,
    nationality: 'German',
    countryCode: 'GER',
    countryFlag: '🇩🇪',
    team: 'Scuderia Ferrari (Historical Legend)',
    series: 'f1',
    seriesName: 'Formula 1',
    seriesBadgeColor: '#e10600',
    primaryDiscipline: 'Formula 1 Historical Legend',
    carOrBike: 'Ferrari F2004 V10',
    status: 'historical',
    birthDate: '1969-01-03',
    birthPlace: 'Hürth, North Rhine-Westphalia, Germany',
    shortIntroduction:
      'Seven-time Formula 1 World Drivers’ Champion (1994, 1995, 2000, 2001, 2002, 2003, 2004), winner of 91 Grands Prix, and the architect of Scuderia Ferrari\'s golden dynasty.',
    earlyLifeAndBeginnings:
      'Born on 3 January 1969 in Hürth, North Rhine-Westphalia, Germany. His father Rolf modified his pedal kart with a four-horsepower motorcycle engine when Michael was four. Michael became the youngest member of the karting club at Kerpen-Horrem, where his parents managed the track and scavenged used tires from discarded piles. Supported by local patrons Adolf Neubert and Jürgen Dilk, Schumacher won the German and European Kart Championships.',
    careerJourney: [
      {
        period: '1984–1988',
        title: 'German Junior Kart Champion',
        category: 'KARTING',
        description: 'Won the German Junior Kart Championship and European Kart Championship.',
      },
      {
        period: '1989–1990',
        title: 'German F3 Champion & Mercedes Junior',
        category: 'JUNIOR_CAREER',
        description: 'Won the 1990 German F3 Championship and contested World Sportscars with the Mercedes Junior Team.',
      },
      {
        period: '1991',
        title: 'Sensational Spa Debut with Jordan',
        category: 'TOP_FLIGHT',
        description: 'Qualified 7th at Spa on his debut; snapped up by Flavio Briatore’s Benetton team immediately afterwards.',
      },
      {
        period: '1994–1995',
        title: 'Back-to-Back Benetton World Titles',
        category: 'CHAMPIONSHIP',
        description: 'Won his first two World Championships with Benetton Ford and Renault.',
      },
      {
        period: '1996–2004',
        title: 'Ferrari Dynasty: 5 Consecutive World Titles',
        category: 'CHAMPIONSHIP',
        description: 'Joined Ferrari and built an unstoppable team with Todt and Brawn, winning 5 consecutive World Titles (2000–2004).',
      },
      {
        period: '2010–2012',
        title: 'Mercedes GP Comeback',
        category: 'TRANSITION',
        description: 'Returned to F1 with Mercedes GP, playing a foundational role in building their championship infrastructure.',
      },
    ],
    teamsHistory: [
      {
        period: '1991',
        team: 'Team 7UP Jordan',
        championship: 'Formula 1',
        carOrBike: 'Jordan 191',
        notes: 'Stunning Spa debut qualifying 7th',
      },
      {
        period: '1991–1995',
        team: 'Camel / Mild Seven Benetton Ford / Renault',
        championship: 'Formula 1',
        carOrBike: 'Benetton B191 through B195',
        notes: '1994 & 1995 World Champion, 19 Wins, 10 Poles',
      },
      {
        period: '1996–2006',
        team: 'Scuderia Ferrari Marlboro',
        championship: 'Formula 1',
        carOrBike: 'Ferrari F310 through 248 F1',
        notes: '5 Consecutive World Titles (2000–2004), 72 Wins, 58 Poles',
      },
      {
        period: '2010–2012',
        team: 'Mercedes GP Petronas Formula One Team',
        championship: 'Formula 1',
        carOrBike: 'Mercedes W01 / W02 / W03',
        notes: 'Valencia 2012 podium, Monaco 2012 pole time',
      },
    ],
    careerAchievements: [
      {
        title: '7x FIA Formula One World Drivers’ Champion',
        countOrDetail: '7 Titles (1994, 1995, 2000, 2001, 2002, 2003, 2004)',
        description: 'Joint all-time record with Lewis Hamilton.',
        isRecord: true,
      },
      {
        title: '5 Consecutive World Championships with Ferrari',
        countOrDetail: '2000–2004',
        description: 'All-time record for the most consecutive World Drivers’ Championships.',
        isRecord: true,
      },
      {
        title: '91 Grand Prix Victories & 77 Fastest Laps',
        countOrDetail: '91 Wins, 77 Fastest Laps',
        description: 'Held the all-time victory and fastest lap records for nearly two decades.',
      },
      {
        title: '100% Podium Finish Season (2002)',
        countOrDetail: '17 Podiums in 17 Races',
        description: 'The only driver in Formula 1 history to finish on the podium in every single race of a season.',
        isRecord: true,
      },
    ],
    interestingFacts: [
      {
        topic: 'Fitness Pioneer',
        fact: 'Pioneered physical conditioning, heart-rate telemetry, and gym routines in Formula 1.',
      },
      {
        topic: 'Magny-Cours 2004',
        fact: 'Famously executed an unprecedented four-stop strategy at the French Grand Prix to beat Fernando Alonso through raw sprint laps.',
      },
    ],
    driverLegacy:
      'Michael Schumacher built the modern blueprint for the elite professional racing driver. His relentless work ethic, physical conditioning, and partnership with Jean Todt and Ross Brawn transformed Scuderia Ferrari into an unstoppable dynasty.',
    stats: {
      worldChampionships: 7,
      raceWins: 91,
      podiums: 155,
      polePositions: 68,
      fastestLaps: 77,
      starts: 306,
      statLabel: 'Formula 1 Historical Legacy',
    },
    seasonHistory: [
      { season: 2004, series: 'Formula 1', team: 'Scuderia Ferrari Marlboro', carOrBike: 'Ferrari F2004', position: 1, points: 148, wins: 13, podiums: 15, poles: 8, notes: '7th World Drivers’ Championship title' },
      { season: 2000, series: 'Formula 1', team: 'Scuderia Ferrari Marlboro', carOrBike: 'Ferrari F1-2000', position: 1, points: 108, wins: 9, podiums: 12, poles: 9, notes: 'Ended Ferrari’s 21-year drivers’ title drought at Suzuka' },
      { season: 1994, series: 'Formula 1', team: 'Mild Seven Benetton Ford', carOrBike: 'Benetton B194', position: 1, points: 92, wins: 8, podiums: 10, poles: 6, notes: '1st World Drivers’ Championship' },
    ],
    driverDna: 'Relentless physical endurance, revolutionary telemetry preparation, and mathematical execution over multi-stop sprint stints.',
    careerHighlights: [
      '7x FIA Formula One World Drivers’ Champion (1994, 1995, 2000, 2001, 2002, 2003, 2004)',
      '5 consecutive World Championships with Scuderia Ferrari',
      '91 Grand Prix victories and 77 fastest laps',
    ],
    biography:
      'Michael Schumacher built the modern blueprint for the elite professional racing driver. His relentless work ethic, physical conditioning, and partnership with Jean Todt and Ross Brawn transformed Scuderia Ferrari into an unstoppable dynasty.',
    championshipUrl: '/explore/f1',
  },

  // =========================================================================
  // ── MOTORCYCLE RACING ──
  // =========================================================================
  {
    id: 'motogp-marquez',
    slug: 'marc-marquez',
    name: 'Marc Márquez',
    fullName: 'Marc Márquez Alentà',
    code: 'MM93',
    number: 93,
    nationality: 'Spanish',
    countryCode: 'ESP',
    countryFlag: '🇪🇸',
    team: 'Ducati Lenovo Team',
    series: 'motogp',
    seriesName: 'MotoGP',
    seriesBadgeColor: '#dc2626',
    primaryDiscipline: 'MotoGP Premier Class Prototype Racing',
    carOrBike: 'Ducati Desmosedici GP26',
    status: 'active',
    birthDate: '1993-02-17',
    birthPlace: 'Cervera, Catalonia, Spain',
    shortIntroduction:
      'Eight-time Grand Prix Motorcycle World Champion (six in the MotoGP premier class), winner of 88 Grands Prix, and factory rider for Ducati Lenovo Team.',
    earlyLifeAndBeginnings:
      'Born on 17 February 1993 in Cervera, Spain. Received his first motorcycle at age four and began competing in enduro and motocross before switching to road racing. Mentored by former 125cc World Champion Emilio Alzamora, Márquez demonstrated otherworldly front-end balance and an aggressive riding style that defied existing two-wheel dynamics.',
    careerJourney: [
      {
        period: '2008–2010',
        title: '125cc World Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the 2010 125cc World Championship with Red Bull Ajo Motorsport taking 10 victories.',
      },
      {
        period: '2011–2012',
        title: 'Moto2 World Champion',
        category: 'JUNIOR_CAREER',
        description: 'Clinched the 2012 Moto2 title with 9 wins after recovering from serious vision injuries.',
      },
      {
        period: '2013',
        title: 'Rookie Premier Class World Champion',
        category: 'TOP_FLIGHT',
        description: 'Became the youngest premier-class World Champion in history at age 20 years, 266 days with Repsol Honda.',
      },
      {
        period: '2014–2019',
        title: 'Six MotoGP World Championships',
        category: 'CHAMPIONSHIP',
        description: 'Dominated the premier class, winning 10 consecutive races in 2014 and setting modern scoring records in 2019.',
      },
      {
        period: '2024–Present',
        title: 'Gresini Resurgence to Factory Ducati',
        category: 'TRANSITION',
        description: 'Revived his career on the satellite Gresini Ducati, winning races at Aragon and Misano before joining the factory Ducati Lenovo team.',
      },
    ],
    teamsHistory: [
      {
        period: '2008–2010',
        team: 'Repsol KTM / Red Bull Ajo Motorsport',
        championship: '125cc World Championship',
        carOrBike: 'KTM 125 FRR / Derbi RSA 125',
        notes: '2010 125cc World Champion, 10 Wins',
      },
      {
        period: '2011–2012',
        team: 'Team CatalunyaCaixa Repsol',
        championship: 'Moto2 World Championship',
        carOrBike: 'Suter MMXI / MMXII',
        notes: '2012 Moto2 World Champion, 16 Wins, 14 Poles',
      },
      {
        period: '2013–2023',
        team: 'Repsol Honda Team',
        championship: 'MotoGP World Championship',
        carOrBike: 'Honda RC213V',
        notes: '6x MotoGP World Champion (2013, 2014, 2016, 2017, 2018, 2019), 59 premier class wins',
      },
      {
        period: '2024',
        team: 'Gresini Racing MotoGP',
        championship: 'MotoGP World Championship',
        carOrBike: 'Ducati Desmosedici GP23',
        notes: '3 Grand Prix Wins (Aragon, Misano, Phillip Island), P3 in World Championship',
      },
      {
        period: '2025–Present',
        team: 'Ducati Lenovo Team',
        championship: 'MotoGP World Championship',
        carOrBike: 'Ducati Desmosedici GP25 / GP26',
        notes: 'Factory Ducati red lineup with Francesco Bagnaia',
      },
    ],
    careerAchievements: [
      {
        title: '8x Grand Prix Motorcycle World Champion',
        countOrDetail: '6x MotoGP, 1x Moto2, 1x 125cc',
        description: 'One of the most successful motorcycle racers in history.',
      },
      {
        title: 'Youngest Premier Class World Champion',
        countOrDetail: '20 Years, 266 Days',
        description: 'Won the MotoGP World Championship in his rookie season in 2013.',
        isRecord: true,
      },
      {
        title: '88 Grand Prix Victories & 94 Pole Positions',
        countOrDetail: '88 Wins, 94 Poles',
        description: 'Statistical titan of modern two-wheeled Grand Prix racing.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Elbow-Down Saves',
        fact: 'Invented the modern elbow-down front-tire crash save at extreme 68-degree lean angles.',
      },
      {
        topic: 'Anti-Clockwise Mastery',
        fact: 'Maintains an over 80% win rate at anti-clockwise circuits (Sachsenring, COTA, Aragon) honed from dirt-track childhood training.',
      },
    ],
    driverLegacy:
      'Marc Márquez revolutionized motorcycle racing technique with his radical elbow-dragging lean angles and miraculous front-end crash saves. His resilience in returning from career-threatening arm surgeries to win again with Ducati cemented his status as a racing immortal.',
    stats: {
      worldChampionships: 8,
      raceWins: 88,
      podiums: 144,
      polePositions: 94,
      sprintWins: 5,
      statLabel: 'Grand Prix World Championship Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'motogp',
      position: 3,
      points: 392,
      wins: 3,
      podiums: 10,
      polePositions: 2,
      sprintWins: 3,
    },
    seasonHistory: [
      { season: 2026, series: 'MotoGP', team: 'Ducati Lenovo Team', carOrBike: 'Ducati Desmosedici GP26', position: 3, points: 392, wins: 3, podiums: 10, poles: 2, notes: 'Factory Ducati red lineup with Bagnaia' },
      { season: 2024, series: 'MotoGP', team: 'Gresini Racing MotoGP', carOrBike: 'Ducati Desmosedici GP23', position: 3, points: 392, wins: 3, podiums: 10, poles: 2, notes: 'Sensational comeback season winning Aragon & Misano' },
      { season: 2019, series: 'MotoGP', team: 'Repsol Honda Team', carOrBike: 'Honda RC213V', position: 1, points: 420, wins: 12, podiums: 18, poles: 10, notes: '8th World Championship in record-breaking season' },
    ],
    driverDna: 'Legendary front-end slide saves with elbow and knee sliders, astonishing aggression in anti-clockwise corners, and fearless bravery.',
    careerHighlights: [
      '8x Grand Prix Motorcycle World Champion (6x MotoGP Premier Class)',
      '88 Grand Prix victories and 94 pole positions',
      'Factory Ducati Lenovo Team rider following historic Gresini resurgence',
    ],
    biography:
      'Marc Márquez is one of the most breathtaking motorcycle racers in history. Renowned for pushing two-wheeled physics beyond known limits, his recovery from career-threatening arm injuries to return to the front with Ducati has captivated the world of racing.',
    championshipUrl: '/explore/motogp',
  },

  {
    id: 'motogp-bagnaia',
    slug: 'francesco-bagnaia',
    name: 'Francesco Bagnaia',
    fullName: 'Francesco "Pecco" Bagnaia',
    code: 'BAG',
    number: 63,
    nationality: 'Italian',
    countryCode: 'ITA',
    countryFlag: '🇮🇹',
    team: 'Ducati Lenovo Team',
    series: 'motogp',
    seriesName: 'MotoGP',
    seriesBadgeColor: '#dc2626',
    primaryDiscipline: 'MotoGP Premier Class Prototype Racing',
    carOrBike: 'Ducati Desmosedici GP26',
    status: 'active',
    birthDate: '1997-01-14',
    birthPlace: 'Turin, Italy',
    shortIntroduction:
      'Two-time consecutive MotoGP Premier Class World Champion (2022, 2023), 2018 Moto2 World Champion, and factory rider for Ducati Lenovo Team.',
    earlyLifeAndBeginnings:
      'Born on 14 January 1997 in Turin, Piedmont, Italy. Nicknamed "Pecco" by his sister Carola, who could not pronounce Francesco as a toddler. Progressed through MiniGP and the CEV championship before joining Valentino Rossi’s VR46 Riders Academy, where he honed his smooth, mathematical trail-braking style.',
    careerJourney: [
      {
        period: '2013–2016',
        title: 'Mahindra Moto3 Development',
        category: 'JUNIOR_CAREER',
        description: 'Scored maiden victories for Mahindra Racing in Moto3 against dominant Honda and KTM machinery.',
      },
      {
        period: '2017–2018',
        title: 'Moto2 World Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the 2018 Moto2 World Championship with the SKY Racing Team VR46 with 8 race wins.',
      },
      {
        period: '2019–2020',
        title: 'Pramac Racing MotoGP Debut',
        category: 'TOP_FLIGHT',
        description: 'Scored maiden podium at Misano, earning promotion to the factory Ducati Lenovo team.',
      },
      {
        period: '2022',
        title: 'Historic MotoGP World Championship',
        category: 'CHAMPIONSHIP',
        description: 'Overcame a 91-point deficit to win Ducati’s first premier-class riders’ title in 15 years.',
      },
      {
        period: '2023',
        title: 'Title Defense with the #1 Plate',
        category: 'CHAMPIONSHIP',
        description: 'Successfully defended his crown at the Valencia finale to become back-to-back World Champion.',
      },
      {
        period: '2024',
        title: '11 Sunday Grand Prix Victories',
        category: 'TOP_FLIGHT',
        description: 'Set a modern milestone winning 11 Sunday Grand Prix races in a single season.',
      },
    ],
    teamsHistory: [
      {
        period: '2013–2016',
        team: 'San Carlo Team Italia / Aspar Mahindra',
        championship: 'Moto3 World Championship',
        carOrBike: 'FTR Honda / Mahindra MGP3O',
        notes: '2 Wins (Assen, Sepang 2016), Mahindra’s first GP victories',
      },
      {
        period: '2017–2018',
        team: 'SKY Racing Team VR46',
        championship: 'Moto2 World Championship',
        carOrBike: 'Kalex Moto2',
        notes: '2018 Moto2 World Champion, 8 Wins, 12 Podiums',
      },
      {
        period: '2019–2020',
        team: 'Pramac Racing',
        championship: 'MotoGP World Championship',
        carOrBike: 'Ducati Desmosedici GP19 / GP20',
        notes: 'Maiden podium at Misano',
      },
      {
        period: '2021–Present',
        team: 'Ducati Lenovo Team',
        championship: 'MotoGP World Championship',
        carOrBike: 'Ducati Desmosedici GP21 through GP26',
        notes: '2x MotoGP World Champion (2022, 2023), 32+ Grand Prix Wins',
      },
    ],
    careerAchievements: [
      {
        title: '2x Consecutive MotoGP Premier Class World Champion',
        countOrDetail: '2022, 2023',
        description: 'First Italian to win on an Italian bike since Giacomo Agostini in 1972.',
      },
      {
        title: '11 Sunday Grand Prix Wins in a Single Season (2024)',
        countOrDetail: '11 Victories',
        description: 'Joined Rossi, Doohan, and Márquez as the only riders to achieve 11+ GP wins in a season.',
      },
      {
        title: '2018 Moto2 World Champion',
        countOrDetail: '8 Victories',
        description: 'VR46 Academy flagship junior championship triumph.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Moniker',
        fact: 'His famous nickname "Pecco" originated because his older sister Carola could not pronounce Francesco when they were infants.',
      },
      {
        topic: 'VR46 Academy',
        fact: 'First premier-class World Champion to emerge from Valentino Rossi’s VR46 Riders Academy in Tavullia.',
      },
    ],
    driverLegacy:
      'Bagnaia is the tactical master of Ducati’s modern golden era. His laser-smooth riding cadence and unmatched hydraulic front-brake pressure redefined what is possible on the Desmosedici.',
    stats: {
      worldChampionships: 3,
      raceWins: 32,
      podiums: 56,
      polePositions: 26,
      sprintWins: 11,
      statLabel: 'Grand Prix World Championship Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'motogp',
      position: 2,
      points: 498,
      wins: 11,
      podiums: 16,
      polePositions: 6,
      sprintWins: 7,
    },
    seasonHistory: [
      { season: 2026, series: 'MotoGP', team: 'Ducati Lenovo Team', carOrBike: 'Ducati Desmosedici GP26', position: 2, points: 498, wins: 11, podiums: 16, poles: 6, notes: 'Remarkable 11 Sunday Grand Prix victories' },
      { season: 2023, series: 'MotoGP', team: 'Ducati Lenovo Team', carOrBike: 'Ducati Desmosedici GP23', position: 1, points: 467, wins: 7, podiums: 15, poles: 7, notes: 'Defended MotoGP World Championship #1 plate' },
      { season: 2022, series: 'MotoGP', team: 'Ducati Lenovo Team', carOrBike: 'Ducati Desmosedici GP22', position: 1, points: 265, wins: 7, podiums: 10, poles: 5, notes: 'First MotoGP World Title, 91-point comeback deficit' },
    ],
    driverDna: 'Impeccable front-tire trail-braking feel, laser-smooth riding cadence, and exceptional race pacing on the Ducati Desmosedici.',
    careerHighlights: [
      '2x Consecutive MotoGP Premier Class World Champion (2022, 2023)',
      '11 Sunday Grand Prix victories in a single MotoGP season',
      'First Italian to win premier-class title on an Italian motorcycle since Agostini (1972)',
    ],
    biography:
      '"Pecco" Bagnaia is Ducati’s premier class maestro. A graduate of Valentino Rossi’s VR46 Riders Academy, Bagnaia combines mathematical front-tire braking with blistering race consistency.',
    championshipUrl: '/explore/motogp',
  },

  {
    id: 'motogp-martin',
    slug: 'jorge-martin',
    name: 'Jorge Martín',
    fullName: 'Jorge Martín Almoguera',
    code: 'MAR',
    number: 89,
    nationality: 'Spanish',
    countryCode: 'ESP',
    countryFlag: '🇪🇸',
    team: 'Aprilia Racing',
    series: 'motogp',
    seriesName: 'MotoGP',
    seriesBadgeColor: '#dc2626',
    primaryDiscipline: 'MotoGP Premier Class Prototype Racing',
    carOrBike: 'Aprilia RS-GP26',
    status: 'active',
    birthDate: '1998-01-29',
    birthPlace: 'Madrid, Spain',
    shortIntroduction:
      '2024 MotoGP World Champion (the first independent satellite champion of the modern four-stroke era), 2018 Moto3 World Champion, and factory rider for Aprilia Racing.',
    earlyLifeAndBeginnings:
      'Born on 29 January 1998 in Madrid, Spain. Grew up in San Sebastián de los Reyes. His family made significant financial sacrifices, mortgaging their home to fund his early minibike racing. Won the Red Bull MotoGP Rookies Cup in 2014, securing his pathway into the Grand Prix paddock.',
    careerJourney: [
      {
        period: '2014',
        title: 'Red Bull MotoGP Rookies Cup Champion',
        category: 'JUNIOR_CAREER',
        description: 'Swept the championship to earn a permanent Moto3 World Championship seat.',
      },
      {
        period: '2015–2018',
        title: 'Moto3 World Champion',
        category: 'JUNIOR_CAREER',
        description: 'Captured the 2018 Moto3 World Championship with Del Conca Gresini, scoring 7 wins and 11 poles.',
      },
      {
        period: '2019–2020',
        title: 'Moto2 Contender with KTM Ajo',
        category: 'JUNIOR_CAREER',
        description: 'Took two race wins with Red Bull KTM Ajo, securing promotion into MotoGP.',
      },
      {
        period: '2021–2024',
        title: 'Independent Pramac Ducati World Title',
        category: 'CHAMPIONSHIP',
        description: 'Took maiden win in rookie season; crowned 2024 MotoGP World Champion with Prima Pramac Racing.',
      },
      {
        period: '2025–Present',
        title: 'Aprilia Racing Factory Leader',
        category: 'TRANSITION',
        description: 'Joined Aprilia Racing to lead their factory MotoGP campaign carrying the world champion’s badge.',
      },
    ],
    teamsHistory: [
      {
        period: '2015–2018',
        team: 'Mapfre Mahindra / Del Conca Gresini',
        championship: 'Moto3 World Championship',
        carOrBike: 'Mahindra MGP3O / Honda NSF250RW',
        notes: '2018 Moto3 World Champion, 8 Wins, 20 Poles',
      },
      {
        period: '2019–2020',
        team: 'Red Bull KTM Ajo',
        championship: 'Moto2 World Championship',
        carOrBike: 'KTM Moto2 / Kalex Moto2',
        notes: '2 Wins (Austria, Valencia 2020), 8 Podiums',
      },
      {
        period: '2021–2024',
        team: 'Prima Pramac Racing',
        championship: 'MotoGP World Championship',
        carOrBike: 'Ducati Desmosedici GP21 through GP24',
        notes: '2024 MotoGP World Champion (First Independent Team Champion of modern era)',
      },
      {
        period: '2025–Present',
        team: 'Aprilia Racing',
        championship: 'MotoGP World Championship',
        carOrBike: 'Aprilia RS-GP25 / RS-GP26',
        notes: 'Leading Aprilia Racing’s factory MotoGP program',
      },
    ],
    careerAchievements: [
      {
        title: '2024 MotoGP World Champion',
        countOrDetail: 'Historical Independent Champion',
        description: 'First rider from an independent satellite team to win the premier-class title in the modern MotoGP era.',
        isRecord: true,
      },
      {
        title: '2018 Moto3 World Champion',
        countOrDetail: '7 Victories, 11 Poles',
        description: 'Dominant lightweight class championship campaign.',
      },
      {
        title: 'Over 16 Saturday Sprint Victories',
        countOrDetail: 'Sprint Master',
        description: 'The most prolific Saturday Sprint race winner in MotoGP history.',
        isRecord: true,
      },
    ],
    interestingFacts: [
      {
        topic: 'Nickname',
        fact: 'Known as the "Martinator" for his relentless, explosive starting reaction times and physical riding style.',
      },
      {
        topic: 'Sacrifice',
        fact: 'His parents mortgaged their family home to keep him racing in the CEV championship before his Red Bull Rookies Cup breakthrough.',
      },
    ],
    driverLegacy:
      'Jorge Martín proved that satellite independent teams could conquer the factory giants in modern MotoGP. His explosive start reflexes and Saturday Sprint dominance established a blueprint for modern sprint racing.',
    stats: {
      worldChampionships: 2,
      raceWins: 18,
      podiums: 44,
      polePositions: 22,
      sprintWins: 16,
      statLabel: 'Grand Prix World Championship Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'motogp',
      position: 1,
      points: 508,
      wins: 3,
      podiums: 16,
      polePositions: 7,
      sprintWins: 8,
    },
    seasonHistory: [
      { season: 2026, series: 'MotoGP', team: 'Aprilia Racing', carOrBike: 'Aprilia RS-GP26', position: 1, points: 508, wins: 3, podiums: 16, poles: 7, notes: '2024–2026 MotoGP World Champion' },
      { season: 2024, series: 'MotoGP', team: 'Prima Pramac Racing', carOrBike: 'Ducati Desmosedici GP24', position: 1, points: 508, wins: 3, podiums: 16, poles: 7, notes: 'Historical independent team MotoGP World Champion' },
    ],
    driverDna: 'Explosive start reaction times, blistering Saturday Sprint race conversions, and aggressive shoulder-down corner speed.',
    careerHighlights: [
      '2024 MotoGP World Champion (First independent satellite champion of modern four-stroke era)',
      '2018 Moto3 World Champion',
      'Leading Aprilia Racing’s factory charge with the #1 plate',
    ],
    biography:
      '"Martinator", Jorge Martín is celebrated for his sheer raw speed and electric starts. Crowned 2024 MotoGP World Champion after an epic duel, Martín brings his explosive racing style to Aprilia Racing.',
    championshipUrl: '/explore/motogp',
  },

  // =========================================================================
  // ── ENDURANCE / GT RACING ──
  // =========================================================================
  {
    id: 'wec-estre',
    slug: 'kevin-estre',
    name: 'Kévin Estre',
    fullName: 'Kévin Estre',
    code: 'EST',
    number: 6,
    nationality: 'French',
    countryCode: 'FRA',
    countryFlag: '🇫🇷',
    team: 'Porsche Penske Motorsport',
    series: 'wec',
    seriesName: 'FIA WEC',
    seriesBadgeColor: '#2563eb',
    racingClass: 'Hypercar',
    carOrBike: 'Porsche 963 LMDh',
    primaryDiscipline: 'FIA World Endurance Championship (Hypercar)',
    status: 'active',
    birthDate: '1988-10-28',
    birthPlace: 'Lyon, France',
    shortIntroduction:
      '2024 FIA World Endurance Drivers’ Champion, 2018 24 Hours of Le Mans GTE Pro winner, and Porsche Penske Motorsport factory Hypercar pilot.',
    earlyLifeAndBeginnings:
      'Born on 28 October 1988 in Lyon, France. Son of Jean-Claude Estre, a racing driver and team manager. Grew up around race paddocks and began karting at age ten. After graduating to Formula Renault Campus in France, Estre transitioned to Porsche Carrera Cup competitions, where his aggressive car control made him one of Porsche’s premier factory drivers.',
    careerJourney: [
      {
        period: '2008–2013',
        title: 'Porsche Carrera Cup Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the 2011 Porsche Carrera Cup France and 2013 Porsche Carrera Cup Germany championships.',
      },
      {
        period: '2016',
        title: 'Porsche Works Factory Contract',
        category: 'TOP_FLIGHT',
        description: 'Signed as an official Porsche Motorsport factory driver in GT and endurance racing.',
      },
      {
        period: '2018–2019',
        title: '24 Hours of Le Mans Win & World GT Champion',
        category: 'CHAMPIONSHIP',
        description: 'Won the 24 Hours of Le Mans in GTE Pro (Pink Pig livery) and the 2018–19 FIA World GT Championship.',
      },
      {
        period: '2023–Present',
        title: 'Porsche 963 Hypercar World Title',
        category: 'CHAMPIONSHIP',
        description: 'Piloted the Porsche 963 LMDh with Porsche Penske Motorsport to win the 2024 FIA World Endurance Championship.',
      },
    ],
    teamsHistory: [
      {
        period: '2011–2013',
        team: 'Attempto Racing',
        championship: 'Porsche Carrera Cup / Supercup',
        carOrBike: 'Porsche 911 GT3 Cup',
        notes: '2011 French Champion, 2013 German Champion',
      },
      {
        period: '2016–2022',
        team: 'Porsche GT Team',
        championship: 'FIA World Endurance Championship (GTE Pro)',
        carOrBike: 'Porsche 911 RSR / RSR-19',
        notes: '2018 Le Mans 24h Winner, 2018–19 FIA World Endurance GT Champion',
      },
      {
        period: '2023–Present',
        team: 'Porsche Penske Motorsport',
        championship: 'FIA World Endurance Championship (Hypercar)',
        carOrBike: 'Porsche 963 LMDh',
        notes: '2024 FIA World Endurance Drivers’ Champion with Laurens Vanthoor and André Lotterer',
      },
    ],
    careerAchievements: [
      {
        title: '2024 FIA World Endurance Drivers’ Champion',
        countOrDetail: 'Hypercar World Title',
        description: 'Clinched the premier Hypercar World Championship for Porsche Penske Motorsport.',
      },
      {
        title: '2018 24 Hours of Le Mans GTE Pro Winner',
        countOrDetail: 'Iconic "Pink Pig" 911 RSR',
        description: 'Dominated the GTE Pro class at Le Mans alongside Michael Christensen and Laurens Vanthoor.',
      },
      {
        title: '2019 24 Hours of Spa Overall Winner',
        countOrDetail: 'GPX Racing Porsche 911 GT3 R',
        description: 'Produced famous wet-weather overtaking display on the grass at Blanchimont.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Grass Pass at Nürburgring',
        fact: 'Executed one of the most famous passes in endurance racing history, overtaking a Mercedes on the grass at 270 km/h during the 2019 Nürburgring 24 Hours.',
      },
    ],
    driverLegacy:
      'Kévin Estre is revered as one of the most daring and relentless GT and prototype racers of his generation. His multi-class traffic negotiation in the Porsche 963 set the benchmark for modern endurance competition.',
    stats: {
      worldChampionships: 2,
      leMansWins: 1,
      raceWins: 14,
      podiums: 32,
      polePositions: 8,
      statLabel: 'FIA World Endurance Championship Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'wec',
      position: 1,
      points: 152,
      wins: 2,
      podiums: 6,
      racingClass: 'Hypercar',
    },
    seasonHistory: [
      { season: 2026, series: 'FIA WEC', team: 'Porsche Penske Motorsport', carOrBike: 'Porsche 963', position: 1, points: 152, wins: 2, podiums: 6, notes: 'Defending FIA World Endurance Drivers’ Champions' },
      { season: 2024, series: 'FIA WEC', team: 'Porsche Penske Motorsport', carOrBike: 'Porsche 963', position: 1, points: 152, wins: 2, podiums: 6, notes: 'World Endurance Drivers’ Champions' },
      { season: 2018, series: 'FIA WEC', team: 'Porsche GT Team', carOrBike: 'Porsche 911 RSR', position: 1, points: 155, wins: 2, podiums: 6, notes: '24 Hours of Le Mans GTE Pro winners' },
    ],
    driverDna: 'Flawless multi-class traffic negotiation, cold-tyre night stint pace, and fearless overtaking commitment through high-speed sweeps.',
    careerHighlights: [
      '2024 FIA World Endurance Drivers’ Champion (Hypercar)',
      '2018 24 Hours of Le Mans Winner (GTE Pro with the iconic "Pink Pig" Porsche 911 RSR)',
      '2018–19 FIA World Endurance GT Champion',
      '24 Hours of Spa and Nürburgring 24 Hours Overall Winner',
    ],
    biography:
      'Kévin Estre is Porsche Penske Motorsport’s Hypercar talisman. Renowned for his aggressive traffic negotiation and sensational passes on two wheels at the Nürburgring, Estre claimed the 2024 World Endurance Championship.',
    championshipUrl: '/explore/wec',
  },

  {
    id: 'wec-fuoco',
    slug: 'antonio-fuoco',
    name: 'Antonio Fuoco',
    fullName: 'Antonio Fuoco',
    code: 'FUO',
    number: 50,
    nationality: 'Italian',
    countryCode: 'ITA',
    countryFlag: '🇮🇹',
    team: 'Ferrari AF Corse',
    series: 'wec',
    seriesName: 'FIA WEC',
    seriesBadgeColor: '#2563eb',
    racingClass: 'Hypercar',
    carOrBike: 'Ferrari 499P Hypercar',
    primaryDiscipline: 'FIA World Endurance Championship (Hypercar)',
    status: 'active',
    birthDate: '1996-05-20',
    birthPlace: 'Cariati, Calabria, Italy',
    shortIntroduction:
      '2024 24 Hours of Le Mans Overall Winner with Ferrari AF Corse (#50 Ferrari 499P Hypercar), Hyperpole pole-sitter, and Scuderia Ferrari simulator development driver.',
    earlyLifeAndBeginnings:
      'Born on 20 May 1996 in Cariati, Calabria, Italy. Began karting at age four, rising through European ranks to join the Ferrari Driver Academy in 2013 alongside Charles Leclerc. Transitioned through GP3 and FIA Formula 2 before becoming Ferrari’s core development and simulator driver for Formula 1 and the 499P Hypercar project.',
    careerJourney: [
      {
        period: '2013–2018',
        title: 'Ferrari Driver Academy & F2 Winner',
        category: 'JUNIOR_CAREER',
        description: 'Won Formula Renault 2.0 Alps (2013) and won FIA Formula 2 feature races with Charouz.',
      },
      {
        period: '2019–Present',
        title: 'Scuderia Ferrari F1 Simulator Driver',
        category: 'TOP_FLIGHT',
        description: 'Core simulation and test driver contributing directly to Scuderia Ferrari Grand Prix victories.',
      },
      {
        period: '2023',
        title: 'Ferrari 499P Debut & Le Mans Hyperpole',
        category: 'TOP_FLIGHT',
        description: 'Took historic pole position on Ferrari’s prototype return at Sebring and took Hyperpole at Le Mans.',
      },
      {
        period: '2024',
        title: '24 Hours of Le Mans Overall Winner',
        category: 'CHAMPIONSHIP',
        description: 'Captured outright victory at the 24 Hours of Le Mans in the #50 Ferrari 499P alongside Miguel Molina and Nicklas Nielsen.',
      },
    ],
    teamsHistory: [
      {
        period: '2017–2018',
        team: 'Prema Racing / Charouz Racing System',
        championship: 'FIA Formula 2',
        carOrBike: 'Dallara F2 2018',
        notes: '3 Race Victories (Monza, Monaco, Abu Dhabi)',
      },
      {
        period: '2019–Present',
        team: 'Scuderia Ferrari',
        championship: 'Formula 1',
        carOrBike: 'Ferrari SF90 through SF-26',
        notes: 'Official Development & Simulator Driver',
      },
      {
        period: '2023–Present',
        team: 'Ferrari AF Corse',
        championship: 'FIA World Endurance Championship (Hypercar)',
        carOrBike: 'Ferrari 499P',
        notes: '2024 24 Hours of Le Mans Overall Winner (#50 entry), multiple Hyperpole positions',
      },
    ],
    careerAchievements: [
      {
        title: '2024 24 Hours of Le Mans Overall Winner',
        countOrDetail: '#50 Ferrari 499P',
        description: 'Achieved outright victory at Circuit de la Sarthe for Ferrari AF Corse.',
      },
      {
        title: '2023 24 Hours of Le Mans Hyperpole Winner',
        countOrDetail: 'Historic Ferrari Pole',
        description: 'Set the fastest lap in qualifying on Ferrari’s return to top-flight prototype racing after 50 years.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Dual Duty',
        fact: 'Spends hundreds of hours each season in the Scuderia Ferrari F1 simulator in Maranello while leading the WEC Hypercar championship on track.',
      },
    ],
    driverLegacy:
      'Antonio Fuoco delivered one of Ferrari’s greatest modern sports car moments, steering the scarlet #50 499P through torrential rain and door malfunctions to claim outright victory at the 2024 24 Hours of Le Mans.',
    stats: {
      worldChampionships: 1,
      leMansWins: 1,
      raceWins: 6,
      podiums: 18,
      polePositions: 7,
      statLabel: 'FIA World Endurance Championship Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'wec',
      position: 2,
      points: 115,
      wins: 1,
      podiums: 4,
      racingClass: 'Hypercar',
    },
    seasonHistory: [
      { season: 2026, series: 'FIA WEC', team: 'Ferrari AF Corse', carOrBike: 'Ferrari 499P', position: 2, points: 115, wins: 1, podiums: 4, notes: 'Driving #50 Ferrari 499P' },
      { season: 2024, series: 'FIA WEC', team: 'Ferrari AF Corse', carOrBike: 'Ferrari 499P', position: 2, points: 115, wins: 1, podiums: 4, notes: '24 Hours of Le Mans overall victory with Molina & Nielsen' },
    ],
    driverDna: 'Surgical Hyperpole qualifying execution, simulator telemetry correlation, and cold-tyre endurance stint pacing.',
    careerHighlights: [
      '2024 24 Hours of Le Mans Overall Winner (#50 Ferrari 499P)',
      '2023 24 Hours of Le Mans Hyperpole Pole Sitter',
      'Long-term Scuderia Ferrari F1 Simulator and Development Driver',
    ],
    biography:
      'Antonio Fuoco is Ferrari’s qualifying magician in sports cars. The Italian ace took pole at Sebring and Le Mans on Ferrari’s prototype return before steering the #50 499P to outright Le Mans victory in 2024.',
    championshipUrl: '/explore/wec',
  },

  {
    id: 'wec-kobayashi',
    slug: 'kamui-kobayashi',
    name: 'Kamui Kobayashi',
    fullName: 'Kamui Kobayashi',
    code: 'KOB',
    number: 7,
    nationality: 'Japanese',
    countryCode: 'JPN',
    countryFlag: '🇯🇵',
    team: 'Toyota Gazoo Racing',
    series: 'wec',
    seriesName: 'FIA WEC',
    seriesBadgeColor: '#2563eb',
    racingClass: 'Hypercar',
    carOrBike: 'Toyota GR010 Hybrid',
    primaryDiscipline: 'FIA World Endurance Championship (Hypercar)',
    status: 'active',
    birthDate: '1986-09-13',
    birthPlace: 'Amagasaki, Hyogo, Japan',
    shortIntroduction:
      '2021 24 Hours of Le Mans Winner, two-time FIA World Endurance Champion (2019–20, 2021), all-time Le Mans lap record holder, and Team Principal of Toyota Gazoo Racing.',
    earlyLifeAndBeginnings:
      'Born on 13 September 1986 in Amagasaki, Hyogo, Japan. Began karting at age nine. Enrolled in the Toyota Young Drivers Program (TDP), moving to Europe in 2004 to conquer Formula Renault Italia and Eurocup before advancing to GP2 and Formula 1.',
    careerJourney: [
      {
        period: '2008–2009',
        title: 'GP2 Asia Champion & F1 Debut',
        category: 'JUNIOR_CAREER',
        description: 'Won the GP2 Asia Series and made sensational Formula 1 debut with Toyota in Brazil and Abu Dhabi.',
      },
      {
        period: '2010–2012',
        title: 'Formula 1 & Suzuka Podium',
        category: 'TOP_FLIGHT',
        description: 'Drove for Sauber F1 Team, taking a legendary podium finish at the 2012 Japanese Grand Prix before home fans.',
      },
      {
        period: '2016–Present',
        title: 'Toyota Gazoo Racing Prototype Dynasty',
        category: 'CHAMPIONSHIP',
        description: 'Set all-time Le Mans qualifying record (3:14.791) in 2017; won the 2021 24 Hours of Le Mans and 2 World Championships.',
      },
      {
        period: '2022–Present',
        title: 'Team Principal & Lead Driver',
        category: 'TRANSITION',
        description: 'Appointed Team Principal of Toyota Gazoo Racing WEC while continuing to race in the #7 GR010 Hybrid.',
      },
    ],
    teamsHistory: [
      {
        period: '2009',
        team: 'Panasonic Toyota Racing',
        championship: 'Formula 1',
        carOrBike: 'Toyota TF109',
        notes: 'Sensational debut scoring points in Abu Dhabi',
      },
      {
        period: '2010–2012',
        team: 'Sauber F1 Team',
        championship: 'Formula 1',
        carOrBike: 'Sauber C29 / C30 / C31',
        notes: 'P3 podium at the 2012 Japanese Grand Prix at Suzuka',
      },
      {
        period: '2014',
        team: 'Caterham F1 Team',
        championship: 'Formula 1',
        carOrBike: 'Caterham CT05',
        notes: 'Final full-time Formula 1 campaign',
      },
      {
        period: '2016–Present',
        team: 'Toyota Gazoo Racing',
        championship: 'FIA World Endurance Championship (LMP1 & Hypercar)',
        carOrBike: 'Toyota TS050 Hybrid / GR010 Hybrid',
        notes: '2x World Champion (2019–20, 2021), 2021 24 Hours of Le Mans Winner, Team Principal since 2022',
      },
    ],
    careerAchievements: [
      {
        title: '2021 24 Hours of Le Mans Overall Winner',
        countOrDetail: '#7 Toyota GR010 Hybrid',
        description: 'Claimed outright victory alongside Mike Conway and José María López.',
      },
      {
        title: 'All-Time Le Mans Lap Record Holder',
        countOrDetail: '3:14.791 (156.47 mph / 251.81 km/h average)',
        description: 'Set fastest qualifying lap in Circuit de la Sarthe history during 2017 qualifying in the TS050 Hybrid.',
        isRecord: true,
      },
      {
        title: '2x FIA World Endurance Champion',
        countOrDetail: '2019–20, 2021',
        description: 'Two-time LMP1 World Endurance Drivers’ Champion.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Dual Role',
        fact: 'One of the only active team principals in world motorsport who also competes as a full-time lead factory racing driver.',
      },
    ],
    driverLegacy:
      'Kamui Kobayashi is a Japanese motorsport icon. His breathtaking overtakes in Formula 1 and record-shattering pole lap at Le Mans cemented his status among the elite endurance drivers of all time.',
    stats: {
      worldChampionships: 2,
      leMansWins: 1,
      raceWins: 16,
      podiums: 38,
      polePositions: 17,
      statLabel: 'FIA World Endurance Championship Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'wec',
      position: 3,
      points: 109,
      wins: 2,
      podiums: 5,
      racingClass: 'Hypercar',
    },
    seasonHistory: [
      { season: 2026, series: 'FIA WEC', team: 'Toyota Gazoo Racing', carOrBike: 'Toyota GR010 Hybrid', position: 3, points: 109, wins: 2, podiums: 5, notes: 'Piloting #7 GR010 Hybrid & Team Principal' },
      { season: 2021, series: 'FIA WEC', team: 'Toyota Gazoo Racing', carOrBike: 'Toyota GR010 Hybrid', position: 1, points: 173, wins: 3, podiums: 6, notes: '24 Hours of Le Mans winner & World Champion' },
    ],
    driverDna: 'Breathtaking late-braking passes, all-time record qualifying speed at Le Mans, and dual driver-principal leadership.',
    careerHighlights: [
      'All-time Le Mans Qualifying Lap Record Holder (3:14.791 in 2017)',
      '2x FIA World Endurance Champion (2019–20, 2021)',
      '2021 24 Hours of Le Mans Winner with Toyota Gazoo Racing',
    ],
    biography:
      'Kamui Kobayashi is a unique figure in international racing: simultaneously an outright Le Mans winner, all-time Circuit de la Sarthe lap record holder, and Team Principal of Toyota Gazoo Racing.',
    championshipUrl: '/explore/wec',
  },

  {
    id: 'wec-rossi',
    slug: 'valentino-rossi',
    name: 'Valentino Rossi',
    fullName: 'Valentino Rossi',
    code: 'ROS',
    number: 46,
    nationality: 'Italian',
    countryCode: 'ITA',
    countryFlag: '🇮🇹',
    team: 'Team WRT',
    series: 'wec',
    seriesName: 'FIA WEC',
    seriesBadgeColor: '#2563eb',
    racingClass: 'LMGT3',
    carOrBike: 'BMW M4 GT3 LMGT3',
    primaryDiscipline: 'Grand Prix Motorcycle Legend & FIA WEC LMGT3',
    status: 'active',
    birthDate: '1979-02-16',
    birthPlace: 'Urbino, Italy',
    shortIntroduction:
      'Nine-time Motorcycle Grand Prix World Champion (115 GP wins), motorsport icon, owner of the VR46 Riders Academy and Racing Team, and FIA WEC LMGT3 podium finisher driving the BMW M4 GT3 for Team WRT.',
    earlyLifeAndBeginnings:
      'Born on 16 February 1979 in Urbino, Italy. Son of former Grand Prix motorcycle racer Graziano Rossi. Grew up in Tavullia, riding go-karts and minibikes from childhood. Adopted the iconic fluorescent yellow #46 in tribute to his father’s victory in the 1979 250cc Yugoslavian Grand Prix.',
    careerJourney: [
      {
        period: '1996–1999',
        title: '125cc & 250cc World Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the 1997 125cc and 1999 250cc World Championships with Aprilia.',
      },
      {
        period: '2000–2005',
        title: '500cc & MotoGP Premier Class Dominance',
        category: 'CHAMPIONSHIP',
        description: 'Captured 5 consecutive premier-class titles with Honda and Yamaha (2001–2005).',
      },
      {
        period: '2008–2009',
        title: '8th & 9th Grand Prix World Championships',
        category: 'CHAMPIONSHIP',
        description: 'Reclaimed the MotoGP World Championship with Yamaha in 2008 and 2009.',
      },
      {
        period: '2014–Present',
        title: 'VR46 Academy & MotoGP Team Ownership',
        category: 'TRANSITION',
        description: 'Founded the VR46 Riders Academy, developing world champions Pecco Bagnaia and Franco Morbidelli.',
      },
      {
        period: '2022–Present',
        title: 'GT3 & FIA World Endurance Championship',
        category: 'TOP_FLIGHT',
        description: 'Switched to four wheels with Team WRT; scored FIA WEC LMGT3 podium at Imola and Road to Le Mans victory.',
      },
    ],
    teamsHistory: [
      {
        period: '1996–1999',
        team: 'Scuderia AGV / Nastro Azzurro Aprilia',
        championship: '125cc & 250cc World Championships',
        carOrBike: 'Aprilia RS125 / RS250',
        notes: '2x World Champion (1997 125cc, 1999 250cc), 26 Wins',
      },
      {
        period: '2000–2003',
        team: 'Nastro Azzurro / Repsol Honda Team',
        championship: '500cc & MotoGP',
        carOrBike: 'Honda NSR500 / RC211V',
        notes: '3x World Champion (2001 500cc, 2002, 2003 MotoGP), 33 Wins',
      },
      {
        period: '2004–2010',
        team: 'Gauloises / Fiat Yamaha Team',
        championship: 'MotoGP',
        carOrBike: 'Yamaha YZR-M1',
        notes: '4x World Champion (2004, 2005, 2008, 2009), 46 Wins',
      },
      {
        period: '2011–2012',
        team: 'Ducati Team',
        championship: 'MotoGP',
        carOrBike: 'Ducati Desmosedici GP11 / GP12',
        notes: '3 Podiums',
      },
      {
        period: '2013–2020',
        team: 'Yamaha Factory Racing',
        championship: 'MotoGP',
        carOrBike: 'Yamaha YZR-M1',
        notes: '3x MotoGP World Championship runner-up (2014, 2015, 2016)',
      },
      {
        period: '2022–Present',
        team: 'Team WRT',
        championship: 'FIA World Endurance Championship (LMGT3)',
        carOrBike: 'BMW M4 GT3',
        notes: 'Podium finisher at 6 Hours of Imola & Road to Le Mans winner',
      },
    ],
    careerAchievements: [
      {
        title: '9x Grand Prix Motorcycle World Champion',
        countOrDetail: '7x Premier Class Titles',
        description: 'Only rider in history to win World Championships in 125cc, 250cc, 500cc, and MotoGP.',
        isRecord: true,
      },
      {
        title: '115 Grand Prix Victories & 235 Podiums',
        countOrDetail: '89 Premier Class Wins',
        description: 'Statistical titan of modern two-wheeled Grand Prix racing.',
      },
      {
        title: 'FIA WEC LMGT3 Podium Finisher',
        countOrDetail: '6 Hours of Imola 2024',
        description: 'Proved his world-class car racecraft across international sports car endurance competition.',
      },
    ],
    interestingFacts: [
      {
        topic: 'The #46',
        fact: 'Raced with the fluorescent yellow #46 across his entire motorcycle and endurance car career, honoring his father Graziano.',
      },
      {
        topic: 'Formula 1 Tests',
        fact: 'Conducted extensive private Formula 1 tests for Scuderia Ferrari in 2004 and 2006, lapping within half a second of Michael Schumacher at Fiorano.',
      },
    ],
    driverLegacy:
      '"The Doctor" is arguably the most beloved and influential figure in motorsport history. His charisma, humor, and track battles turned motorcycle Grand Prix racing into a worldwide phenomenon, while his VR46 Academy continues to nurture the next generation of Italian champions.',
    stats: {
      worldChampionships: 9,
      raceWins: 115,
      podiums: 239,
      polePositions: 65,
      statLabel: 'Two-Wheel & GT Endurance Career Records',
    },
    currentSeasonStats: {
      season: 2026,
      series: 'wec',
      position: 3,
      points: 102,
      wins: 1,
      podiums: 4,
      racingClass: 'LMGT3',
      classWins: 1,
      classPodiums: 4,
    },
    seasonHistory: [
      { season: 2026, series: 'FIA WEC', team: 'Team WRT', carOrBike: 'BMW M4 GT3', position: 3, points: 102, wins: 1, podiums: 4, notes: 'Podiums at Imola & Le Mans in LMGT3' },
      { season: 2024, series: 'FIA WEC', team: 'Team WRT', carOrBike: 'BMW M4 GT3', position: 6, points: 61, wins: 0, podiums: 2, notes: 'First FIA WEC podium at 6 Hours of Imola' },
      { season: 2009, series: 'MotoGP', team: 'Yamaha Factory Racing', carOrBike: 'Yamaha YZR-M1', position: 1, points: 306, wins: 6, podiums: 13, notes: '9th Grand Prix World Championship' },
    ],
    driverDna: 'Instinctive spatial racing lines, peerless throttle modulation, and charismatic endurance racecraft carrying the iconic fluorescent yellow #46.',
    careerHighlights: [
      '9x Motorcycle Grand Prix World Champion (7x Premier Class)',
      '115 Motorcycle Grand Prix Victories and 235 Podiums',
      'Podium finisher at 24 Hours of Le Mans Road to Le Mans and FIA WEC 6 Hours of Imola',
    ],
    biography:
      '"The Doctor", Valentino Rossi is arguably the most beloved figure in motorsport history. Carrying the iconic yellow #46 into the FIA World Endurance Championship with BMW Team WRT, Rossi has proven his world-class car racecraft across endurance racing.',
    championshipUrl: '/explore/wec',
  },

  // =========================================================================
  // ── OTHER DISCIPLINES (WRC & INDIAN MOTORSPORT) ──
  // =========================================================================
  {
    id: 'wrc-ogier',
    slug: 'sebastien-ogier',
    name: 'Sébastien Ogier',
    fullName: 'Sébastien Ogier',
    code: 'OGI',
    number: 17,
    nationality: 'French',
    countryCode: 'FRA',
    countryFlag: '🇫🇷',
    team: 'Toyota Gazoo Racing WRT',
    series: 'wrc',
    seriesName: 'WRC Rally',
    seriesBadgeColor: '#f97316',
    primaryDiscipline: 'World Rally Championship (WRC)',
    carOrBike: 'Toyota GR Yaris Rally1 Hybrid',
    status: 'active',
    birthDate: '1983-12-17',
    birthPlace: 'Gap, Hautes-Alpes, France',
    shortIntroduction:
      'Eight-time World Rally Champion, 60+ WRC rally victories, record 9-time winner of Rallye Monte-Carlo, and one of the greatest rally drivers in motorsport history.',
    earlyLifeAndBeginnings:
      'Born on 17 December 1983 in Gap, Hautes-Alpes, France. Grew up in the French Alps around winter rally stages. Worked as a ski instructor before winning the FFSA Rallye Jeunes talent search in 2005. Mentored by the French motorsport federation, Ogier progressed rapidly to win the Junior World Rally Championship (JWRC) in 2008.',
    careerJourney: [
      {
        period: '2008',
        title: 'Junior WRC Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the Junior World Rally Championship with the Citroën C2 S1600.',
      },
      {
        period: '2013–2016',
        title: 'Four Consecutive Titles with Volkswagen',
        category: 'CHAMPIONSHIP',
        description: 'Dominated the WRC with the Volkswagen Polo R WRC, winning four consecutive World Rally Championships.',
      },
      {
        period: '2017–2018',
        title: 'Two Titles with M-Sport Ford',
        category: 'CHAMPIONSHIP',
        description: 'Moved to privateer M-Sport Ford, guiding the team to back-to-back WRC World Championships.',
      },
      {
        period: '2020–2021',
        title: 'Toyota Gazoo Racing Championships',
        category: 'CHAMPIONSHIP',
        description: 'Won two additional World Championships with Toyota, cementing 8 total world titles across three different manufacturers.',
      },
    ],
    teamsHistory: [
      {
        period: '2008–2011',
        team: 'Citroën Total World Rally Team',
        championship: 'WRC',
        carOrBike: 'Citroën C4 WRC / DS3 WRC',
        notes: '7 WRC Victories, 2008 JWRC Champion',
      },
      {
        period: '2012–2016',
        team: 'Volkswagen Motorsport',
        championship: 'WRC',
        carOrBike: 'Volkswagen Polo R WRC',
        notes: '4 Consecutive World Championships (2013, 2014, 2015, 2016), 31 Wins',
      },
      {
        period: '2017–2018',
        team: 'M-Sport Ford World Rally Team',
        championship: 'WRC',
        carOrBike: 'Ford Fiesta WRC',
        notes: '2 Consecutive World Championships (2017, 2018), 6 Wins',
      },
      {
        period: '2020–Present',
        team: 'Toyota Gazoo Racing WRT',
        championship: 'WRC',
        carOrBike: 'Toyota Yaris WRC / GR Yaris Rally1',
        notes: '2 World Championships (2020, 2021), record 9th Monte Carlo victory',
      },
    ],
    careerAchievements: [
      {
        title: '8x FIA World Rally Champion',
        countOrDetail: '8 Titles (2013, 2014, 2015, 2016, 2017, 2018, 2020, 2021)',
        description: 'Won world championships across three different manufacturers (Volkswagen, Ford, Toyota).',
      },
      {
        title: 'Record 9-Time Winner of Rallye Monte-Carlo',
        countOrDetail: '9 Monte Carlo Victories',
        description: 'The most successful driver in the century-long history of Rallye Monte-Carlo.',
        isRecord: true,
      },
      {
        title: 'Over 60 WRC Rally Victories',
        countOrDetail: '60+ Wins',
        description: 'Second on the all-time WRC rally victory list behind Sébastien Loeb.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Three Manufacturers',
        fact: 'One of only two drivers in WRC history (alongside Juha Kankkunen) to win World Championships with three different manufacturers.',
      },
    ],
    driverLegacy:
      'Sébastien Ogier’s mastery across snow, gravel, and asphalt redefined modern rally stage management. His calm strategic precision in adverse alpine conditions makes him a legend of the World Rally Championship.',
    stats: {
      worldChampionships: 8,
      raceWins: 61,
      podiums: 102,
      statLabel: 'World Rally Championship Career Records',
    },
    driverDna: 'Peerless surface grip intuition, surgical Alpine road positioning, and calm mental composure across variable rally stages.',
    careerHighlights: [
      '8x FIA World Rally Champion across three manufacturers',
      'Record 9-time winner of Rallye Monte-Carlo',
      'Over 60 career WRC rally victories',
    ],
    biography:
      'Sébastien Ogier is one of the most decorated rally drivers in motorsport history. An eight-time World Rally Champion, Ogier’s adaptability across three manufacturers proved his sublime talent.',
    championshipUrl: '/explore/wrc',
  },

  {
    id: 'india-karthikeyan',
    slug: 'narain-karthikeyan',
    name: 'Narain Karthikeyan',
    fullName: 'Kumar Ram Narain Karthikeyan',
    code: 'KAR',
    number: 19,
    nationality: 'Indian',
    countryCode: 'IND',
    countryFlag: '🇮🇳',
    team: 'NK Racing / Indian Motorsport Ambassador',
    series: 'indian-motorsport',
    seriesName: 'Indian Motorsport',
    seriesBadgeColor: '#ff9933',
    primaryDiscipline: 'Formula 1 & Indian Motorsport Pioneer',
    carOrBike: 'Jordan EJ15 / HRT F112',
    status: 'historical',
    birthDate: '1977-01-14',
    birthPlace: 'Coimbatore, Tamil Nadu, India',
    shortIntroduction:
      'India’s first Formula 1 driver in history, Grand Prix point-scorer, and the pioneering figure who opened the global motorsport stage for an entire nation.',
    earlyLifeAndBeginnings:
      'Born on 14 January 1977 in Coimbatore, Tamil Nadu, India. Son of former Indian national rally champion G.R. Karthikeyan. Grew up around the motorsport culture of Coimbatore. After attending the Winfield Racing School in France, Karthikeyan moved to the UK to contest British Formula Ford and Formula 3 with Carlin Motorsport.',
    careerJourney: [
      {
        period: '1999–2000',
        title: 'British F3 Historic Victories',
        category: 'JUNIOR_CAREER',
        description: 'First Indian to win international F3 races, taking victories at Brands Hatch and Spa-Francorchamps for Carlin.',
      },
      {
        period: '2005',
        title: 'India’s First Formula 1 Driver',
        category: 'TOP_FLIGHT',
        description: 'Debuted with Jordan Grand Prix in Australia; scored maiden points finishing P4 at the United States Grand Prix.',
      },
      {
        period: '2006–2007',
        title: 'Williams F1 Official Test Driver',
        category: 'TOP_FLIGHT',
        description: 'Served as test and reserve driver for Williams F1 Team.',
      },
      {
        period: '2011–2012',
        title: 'Indian Grand Prix at Buddh International Circuit',
        category: 'TOP_FLIGHT',
        description: 'Raced for HRT F1 Team in the inaugural 2011 Indian Grand Prix before 95,000 home fans at Buddh International Circuit.',
      },
      {
        period: '2019',
        title: 'Super GT Fuji Dream Race Victory',
        category: 'TOP_FLIGHT',
        description: 'Won the historic Super GT / DTM Dream Race at Fuji Speedway in Nakajima Racing Honda NSX-GT.',
      },
    ],
    teamsHistory: [
      {
        period: '1999–2000',
        team: 'Carlin Motorsport',
        championship: 'British Formula 3',
        carOrBike: 'Dallara F399 / F300 Mugen-Honda',
        notes: 'Historical race victories at Brands Hatch and Spa',
      },
      {
        period: '2005',
        team: 'Jordan Grand Prix',
        championship: 'Formula 1',
        carOrBike: 'Jordan EJ15 Toyota',
        notes: 'First Indian F1 driver, 4th place finish at US Grand Prix (5 championship points)',
      },
      {
        period: '2006–2007',
        team: 'Williams F1 Team',
        championship: 'Formula 1',
        carOrBike: 'Williams FW28 / FW29',
        notes: 'Official Test and Development Driver',
      },
      {
        period: '2011–2012',
        team: 'HRT F1 Team',
        championship: 'Formula 1',
        carOrBike: 'HRT F111 / F112 Cosworth',
        notes: 'Competed in inaugural 2011 Formula 1 Indian Grand Prix at Buddh',
      },
      {
        period: '2019',
        team: 'Modulo Nakajima Racing',
        championship: 'Super GT Japan (GT500)',
        carOrBike: 'Honda NSX-GT',
        notes: 'Historic outright victory at the Super GT x DTM Dream Race at Fuji',
      },
    ],
    careerAchievements: [
      {
        title: 'First Indian Formula 1 Driver in History',
        countOrDetail: '2005 Australian Grand Prix',
        description: 'Pioneered India’s presence on the Formula 1 grid.',
        isRecord: true,
      },
      {
        title: 'Formula 1 Championship Points Scorer',
        countOrDetail: 'P4 at 2005 US Grand Prix',
        description: 'First Indian driver to score official World Championship points.',
        isRecord: true,
      },
      {
        title: '2019 Super GT Fuji Dream Race Winner',
        countOrDetail: 'Outright Winner',
        description: 'Defeated top Japanese and European factory GT drivers at Fuji Speedway.',
      },
      {
        title: 'Padma Shri Honoree',
        countOrDetail: 'Awarded 2010',
        description: 'Conferred India’s fourth-highest civilian award for services to sports.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Nicknamed "The Fastest Indian"',
        fact: 'Awarded the Padma Shri in 2010 by the President of India for putting India on the world motorsport map.',
      },
      {
        topic: 'Buddh Grand Prix',
        fact: 'Raced in front of 95,000 cheering fans at the inaugural 2011 Indian Grand Prix at Buddh International Circuit.',
      },
    ],
    driverLegacy:
      'Narain Karthikeyan broke barriers that seemed impassable for Indian drivers. His courage, speed in British F3, and historic Formula 1 points paved the way for every young Indian racer that followed.',
    stats: {
      worldChampionships: 0,
      raceWins: 0,
      podiums: 0,
      starts: 46,
      statLabel: 'Formula 1 & International Career Records',
    },
    driverDna: 'Fearless top-end straightline commitment, high-speed circuit precision, and pioneering determination.',
    careerHighlights: [
      'First Indian Formula One Driver in History (Jordan Grand Prix 2005)',
      'Scored 5 World Championship points (P4 at 2005 United States GP)',
      'Conferred the prestigious Padma Shri by the Government of India',
    ],
    biography:
      'Narain Karthikeyan is "The Fastest Indian in the World". Breaking every barrier to become India’s inaugural Formula 1 pilot, Karthikeyan inspired generations across the subcontinent.',
    championshipUrl: '/explore/indian-motorsport',
  },

  {
    id: 'india-chandhok',
    slug: 'karun-chandhok',
    name: 'Karun Chandhok',
    fullName: 'Karun Chandhok',
    code: 'CHD',
    number: 20,
    nationality: 'Indian',
    countryCode: 'IND',
    countryFlag: '🇮🇳',
    team: 'Sky Sports F1 / FIA Drivers’ Commission',
    series: 'indian-motorsport',
    seriesName: 'Indian Motorsport',
    seriesBadgeColor: '#ff9933',
    primaryDiscipline: 'Formula 1 & International Endurance Racing',
    carOrBike: 'HRT F110 / Lotus T128',
    status: 'historical',
    birthDate: '1984-01-19',
    birthPlace: 'Chennai, Tamil Nadu, India',
    shortIntroduction:
      'India’s second Formula 1 driver, GP2 race winner at Spa and Silverstone, 24 Hours of Le Mans competitor, and internationally acclaimed motorsport broadcaster and analyst.',
    earlyLifeAndBeginnings:
      'Born on 19 January 1984 in Chennai, Tamil Nadu, India. Son of former Indian rallying champion Vicky Chandhok. Grew up immersed in the South Indian motorsport heartland. Won the Formula Asia championship in 2001 before traveling to the UK to climb the single-seater ladder.',
    careerJourney: [
      {
        period: '2001',
        title: 'Formula Asia Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won 8 of 14 races to become the youngest Formula Asia Champion at age 17.',
      },
      {
        period: '2006',
        title: 'Formula V6 Asia Champion',
        category: 'JUNIOR_CAREER',
        description: 'Won the inaugural Formula V6 Asia championship with 7 race victories.',
      },
      {
        period: '2007–2009',
        title: 'GP2 Series Race Winner at Spa & Silverstone',
        category: 'JUNIOR_CAREER',
        description: 'Won prestigious GP2 races at Circuit de Spa-Francorchamps and Silverstone with iSport and Ocean.',
      },
      {
        period: '2010–2011',
        title: 'Formula 1 Grand Prix Driver',
        category: 'TOP_FLIGHT',
        description: 'Became India’s second F1 driver with HRT in 2010; drove for Team Lotus in 2011.',
      },
      {
        period: '2012–2015',
        title: '24 Hours of Le Mans Competitor',
        category: 'TOP_FLIGHT',
        description: 'First Indian to compete in the 24 Hours of Le Mans, finishing 6th overall in LMP1 in 2012.',
      },
    ],
    teamsHistory: [
      {
        period: '2007–2009',
        team: 'iSport International / Ocean Racing',
        championship: 'GP2 Series',
        carOrBike: 'Dallara GP2/05 / GP2/08',
        notes: '2 Race Victories (Spa-Francorchamps 2007, Silverstone 2008)',
      },
      {
        period: '2010',
        team: 'Hispania Racing F1 Team',
        championship: 'Formula 1',
        carOrBike: 'HRT F110 Cosworth',
        notes: '10 Grand Prix starts, best finish 14th',
      },
      {
        period: '2011',
        team: 'Team Lotus',
        championship: 'Formula 1',
        carOrBike: 'Lotus T128 Renault',
        notes: 'Contested 2011 German Grand Prix at Nürburgring',
      },
      {
        period: '2012–2015',
        team: 'JRM Racing / Murphy Prototypes',
        championship: 'FIA World Endurance Championship & Le Mans',
        carOrBike: 'HPD ARX-03a / Oreca 03 Nissan',
        notes: '6th overall at 2012 24 Hours of Le Mans',
      },
    ],
    careerAchievements: [
      {
        title: 'Second Indian Formula 1 Driver in History',
        countOrDetail: '2010 Bahrain Grand Prix',
        description: 'Contested 11 Formula 1 Grands Prix.',
      },
      {
        title: 'Two-Time GP2 Series Race Winner',
        countOrDetail: 'Spa 2007 & Silverstone 2008',
        description: 'Historic victories at motorsport’s most demanding circuits.',
      },
      {
        title: 'First Indian to Compete at the 24 Hours of Le Mans',
        countOrDetail: 'P6 Overall in 2012',
        description: 'Top-tier LMP1 finish at the world’s most famous endurance marathon.',
        isRecord: true,
      },
      {
        title: 'FIA Drivers’ Commission Representative',
        countOrDetail: 'Appointed to FIA',
        description: 'Represents driver rights and circuit safety regulations globally.',
      },
    ],
    interestingFacts: [
      {
        topic: 'Spa Mastery',
        fact: 'Took a commanding GP2 victory in the wet at Spa-Francorchamps in 2007, showcasing his technical feel for high-speed corners.',
      },
      {
        topic: 'Broadcasting Acumen',
        fact: 'Regarded as one of the world’s premier Formula 1 technical analysts and television commentators on Sky Sports F1.',
      },
    ],
    driverLegacy:
      'Karun Chandhok is one of motorsport’s most articulate and respected global ambassadors. From pioneering Indian participation at Le Mans to his authoritative technical analysis on Sky Sports, Chandhok remains an indispensable voice in international motorsport.',
    stats: {
      worldChampionships: 0,
      raceWins: 0,
      podiums: 0,
      starts: 11,
      statLabel: 'Formula 1 & Le Mans Career Records',
    },
    driverDna: 'Analytical vehicle dynamics understanding, exceptional technical feedback, and polished international ambassadorial presence.',
    careerHighlights: [
      'Second Indian Formula One Driver in History',
      'GP2 Race Winner at Spa-Francorchamps and Silverstone',
      'First Indian to compete at the 24 Hours of Le Mans (6th overall in 2012)',
    ],
    biography:
      'Karun Chandhok is India’s premier motorsport ambassador. Having competed in Formula 1 and at Le Mans, Chandhok is now recognized worldwide as an authoritative technical commentator.',
    championshipUrl: '/explore/indian-motorsport',
  },

  {
    id: 'india-daruvala',
    slug: 'jehan-daruvala',
    name: 'Jehan Daruvala',
    fullName: 'Jehan Daruvala',
    code: 'DAR',
    number: 18,
    nationality: 'Indian',
    countryCode: 'IND',
    countryFlag: '🇮🇳',
    team: 'Maserati MSG Racing (Formula E)',
    series: 'indian-motorsport',
    seriesName: 'Indian Motorsport',
    seriesBadgeColor: '#ff9933',
    primaryDiscipline: 'FIA Formula 2 & Formula E Single-Seaters',
    carOrBike: 'Maserati Tipo Folgore Gen3',
    status: 'active',
    birthDate: '1998-10-01',
    birthPlace: 'Mumbai, Maharashtra, India',
    shortIntroduction:
      'Multiple FIA Formula 2 race winner, 18-time F2 podium finisher, first Indian to win an FIA Formula 2 race, and ABB FIA Formula E World Championship driver.',
    earlyLifeAndBeginnings:
      'Born on 1 October 1998 in Mumbai, Maharashtra, India. Began karting at age ten. In 2011, won the Sahara Force India "One in a Billion" nationwide driver hunt, earning backing to race in Europe. Trained by Ray Mallock Ltd (RML), Daruvala won the 2014 Super 1 National KF3 Championship in the UK.',
    careerJourney: [
      {
        period: '2011',
        title: '"One in a Billion" Hunt Winner',
        category: 'KARTING',
        description: 'Won the nationwide talent hunt out of thousands of Indian contenders.',
      },
      {
        period: '2017–2018',
        title: 'FIA Formula 3 European Winner',
        category: 'JUNIOR_CAREER',
        description: 'Won at the Norisring with Carlin, becoming the first Indian to win an official FIA F3 European race.',
      },
      {
        period: '2019',
        title: 'FIA Formula 3 Championship P3',
        category: 'JUNIOR_CAREER',
        description: 'Took 2 wins and 7 podiums with Prema Racing, finishing 3rd in the championship.',
      },
      {
        period: '2020–2023',
        title: 'FIA Formula 2 Race Winner & Red Bull Junior',
        category: 'JUNIOR_CAREER',
        description: 'Scored 4 race wins and 18 podiums across 4 seasons in FIA Formula 2.',
      },
      {
        period: '2023–Present',
        title: 'Maserati MSG Racing in Formula E',
        category: 'TOP_FLIGHT',
        description: 'Represented Maserati in the ABB FIA Formula E World Championship.',
      },
    ],
    teamsHistory: [
      {
        period: '2017–2018',
        team: 'Carlin',
        championship: 'FIA Formula 3 European Championship',
        carOrBike: 'Dallara F317 Volkswagen',
        notes: 'Race winner at Norisring, 6 podiums',
      },
      {
        period: '2019',
        team: 'Prema Racing',
        championship: 'FIA Formula 3 Championship',
        carOrBike: 'Dallara F3 2019',
        notes: 'P3 in championship, 2 Wins (Barcelona, Paul Ricard)',
      },
      {
        period: '2020–2023',
        team: 'Carlin / Prema / MP Motorsport',
        championship: 'FIA Formula 2',
        carOrBike: 'Dallara F2 2018',
        notes: '4 Wins (Sakhir 2020, Monza 2021, Abu Dhabi 2021, Monza 2022), 18 Podiums',
      },
      {
        period: '2023–2024',
        team: 'Maserati MSG Racing',
        championship: 'ABB FIA Formula E World Championship',
        carOrBike: 'Maserati Tipo Folgore Gen3',
        notes: 'Full-time Formula E works driver',
      },
    ],
    careerAchievements: [
      {
        title: 'First Indian to Win an FIA Formula 2 Race',
        countOrDetail: 'Sakhir 2020',
        description: 'Historic breakthrough win holding off Mick Schumacher and Yuki Tsunoda.',
        isRecord: true,
      },
      {
        title: '4x FIA Formula 2 Race Winner & 18 Podiums',
        countOrDetail: '4 Wins, 18 Podiums',
        description: 'Most successful Indian driver in junior single-seater history.',
        isRecord: true,
      },
      {
        title: 'Formula E World Championship Works Driver',
        countOrDetail: 'Maserati MSG Racing',
        description: 'Competed at the pinnacle of electric single-seater racing.',
      },
    ],
    interestingFacts: [
      {
        topic: 'One in a Billion',
        fact: 'Won the nationwide talent hunt organized by Force India F1 in 2011, which launched his international single-seater career.',
      },
      {
        topic: 'Monza Double',
        fact: 'Won the FIA Formula 2 Feature Race at Monza twice (2021 and 2022) with masterclass tyre conservation.',
      },
    ],
    driverLegacy:
      'Jehan Daruvala proved that an Indian driver could compete and win on merit in the premier feeder category to Formula 1. His 18 Formula 2 podiums and FIA F2 race victories stand as historic milestones for Asian single-seater motorsport.',
    stats: {
      worldChampionships: 0,
      raceWins: 4,
      podiums: 18,
      polePositions: 1,
      fastestLaps: 5,
      starts: 98,
      statLabel: 'FIA Formula 2 & Formula E Career Records',
    },
    driverDna: 'High-speed DRS straightline defense, tyre thermal conservation over 30-lap feature stints, and calculated starts.',
    careerHighlights: [
      'First Indian to win an FIA Formula 2 race (Sakhir 2020)',
      '4x FIA Formula 2 Race Winner and 18-time F2 podium finisher',
      'Full-time ABB FIA Formula E World Championship driver for Maserati MSG Racing',
    ],
    biography:
      'Jehan Daruvala is Mumbai’s single-seater ace. A four-time FIA Formula 2 race winner and Formula E pilot, Daruvala holds the most decorated feeder-series record of any Indian driver in modern racing.',
    championshipUrl: '/explore/indian-motorsport',
  },
];

/**
 * Filter driver profiles by series ('all' | 'f1' | 'wec' | 'motogp')
 * and optional keyword search.
 */
export function getDriversBySeries(
  series: MotorsportSeriesFilter = 'all',
  searchQuery: string = ''
): DriverProfile[] {
  return DRIVER_PROFILES.filter(driver => {
    const matchesSeries = series === 'all' || driver.series === series;
    if (!matchesSeries) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      driver.name.toLowerCase().includes(q) ||
      (driver.fullName && driver.fullName.toLowerCase().includes(q)) ||
      driver.team.toLowerCase().includes(q) ||
      driver.nationality.toLowerCase().includes(q) ||
      driver.seriesName.toLowerCase().includes(q) ||
      (driver.slug && driver.slug.toLowerCase().includes(q)) ||
      (driver.racingClass && driver.racingClass.toLowerCase().includes(q))
    );
  });
}

/**
 * Retrieve drivers filtered by broad discipline ('formula' | 'motorcycle' | 'endurance' | 'other' | 'all')
 * with sub-series filtering ('f1', 'f2', 'motogp', 'wec', 'hypercar', 'lmgt3', etc.) and keyword search.
 */
export function getDriversByDiscipline(
  discipline: string = 'all',
  subSeries: string = 'all',
  searchQuery: string = ''
): DriverProfile[] {
  return DRIVER_PROFILES.filter(driver => {
    // 1. Discipline check
    if (discipline !== 'all') {
      if (discipline === 'formula') {
        const isFormula = ['f1', 'f2', 'f3', 'f4', 'formula-e'].includes(driver.series);
        if (!isFormula) return false;
      } else if (discipline === 'motorcycle') {
        const isMotorcycle = ['motogp', 'moto2', 'moto3'].includes(driver.series);
        if (!isMotorcycle) return false;
      } else if (discipline === 'endurance' || discipline === 'endurance_gt') {
        const isEndurance = ['wec', 'gt-world-challenge'].includes(driver.series);
        if (!isEndurance) return false;
      } else if (discipline === 'other') {
        const isOther = ['wrc', 'indian-motorsport'].includes(driver.series);
        if (!isOther) return false;
      }
    }

    // 2. Sub-series / category check
    if (subSeries && subSeries !== 'all') {
      const subLower = subSeries.toLowerCase().trim();
      if (subLower === 'hypercar') {
        if (driver.racingClass !== 'Hypercar') return false;
      } else if (subLower === 'lmgt3') {
        if (driver.racingClass !== 'LMGT3') return false;
      } else if (driver.series !== subLower) {
        return false;
      }
    }

    // 3. Search query check
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      driver.name.toLowerCase().includes(q) ||
      (driver.fullName && driver.fullName.toLowerCase().includes(q)) ||
      driver.team.toLowerCase().includes(q) ||
      driver.nationality.toLowerCase().includes(q) ||
      driver.seriesName.toLowerCase().includes(q) ||
      (driver.slug && driver.slug.toLowerCase().includes(q)) ||
      (driver.racingClass && driver.racingClass.toLowerCase().includes(q)) ||
      String(driver.number).includes(q)
    );
  });
}

/**
 * Get single driver by slug or ID with robust fuzzy matching
 */
export function getDriverProfileBySlug(slugOrId?: string): DriverProfile | undefined {
  if (!slugOrId) return undefined;
  const clean = slugOrId.toLowerCase().trim();

  // 1. Direct match on slug
  let match = DRIVER_PROFILES.find(d => d.slug.toLowerCase() === clean);
  if (match) return match;

  // 2. Direct match on id
  match = DRIVER_PROFILES.find(d => d.id.toLowerCase() === clean);
  if (match) return match;

  // 3. Match on code
  match = DRIVER_PROFILES.find(d => d.code.toLowerCase() === clean);
  if (match) return match;

  // 4. Match on name or surname
  match = DRIVER_PROFILES.find(d => {
    const nameNorm = d.name.toLowerCase();
    const parts = nameNorm.split(' ');
    const surname = parts[parts.length - 1];
    return nameNorm === clean || surname === clean || d.slug.includes(clean);
  });
  if (match) return match;

  return undefined;
}

/**
 * Alias for getDriverProfileBySlug
 */
export function getDriverProfileById(id: string): DriverProfile | undefined {
  return getDriverProfileBySlug(id);
}

/**
 * Summary counts for Drivers Hub series filters
 */
export function getSeriesDriverCounts(): Record<MotorsportSeriesFilter, number> {
  return {
    all: DRIVER_PROFILES.length,
    f1: DRIVER_PROFILES.filter(d => d.series === 'f1').length,
    wec: DRIVER_PROFILES.filter(d => d.series === 'wec').length,
    motogp: DRIVER_PROFILES.filter(d => d.series === 'motogp').length,
  };
}

/**
 * Summary counts for discipline-based navigation
 */
export function getDisciplineDriverCounts(): Record<string, number> {
  return {
    all: DRIVER_PROFILES.length,
    formula: DRIVER_PROFILES.filter(d => ['f1', 'f2', 'f3', 'f4', 'formula-e'].includes(d.series)).length,
    motorcycle: DRIVER_PROFILES.filter(d => ['motogp', 'moto2', 'moto3'].includes(d.series)).length,
    endurance: DRIVER_PROFILES.filter(d => ['wec', 'gt-world-challenge'].includes(d.series)).length,
    other: DRIVER_PROFILES.filter(d => ['wrc', 'indian-motorsport'].includes(d.series)).length,
  };
}

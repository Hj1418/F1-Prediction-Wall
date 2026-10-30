/**
 * The Grid — Motorsport Shared Data Registry & Service
 * 
 * Architectural Invariant:
 * Single authoritative access layer unifying:
 * - Series identity & taxonomy
 * - Overview & regulations (sporting, technical, points)
 * - Weekend structure (standard & sprint/special formats)
 * - Participating teams & constructors
 * - Drivers & riders (scoped to championship)
 * - Circuits & tracks (verified specifications & SVG layouts)
 */

import { Championship } from '../../types/motorsport';
import { ChampionshipDetailData, ChampionshipRound, ChampionshipDriverStanding, ChampionshipTeamStanding } from '../../types/motorsportDetail';
import { CHAMPIONSHIPS_REGISTRY } from './motorsportRegistry';
import { getChampionshipDetail } from './championshipDataService';
import { getMotorsportBasics, MotorsportBasicsGuide } from './motorsportBasicsService';
import { getCircuitsByChampionship } from '../circuits/globalCircuitsService';
import { CircuitEntity } from '../../types/circuit';
import { DRIVER_PROFILES, getDriversByDiscipline } from './driversHubService';
import { DriverProfile } from '../../types/driversHub';

export interface SeriesWeekendSession {
  name: string;
  day: string;
  durationMinutes?: number;
  description: string;
  purpose: string;
  rulesHighlight?: string;
}

export interface SeriesWeekendFormatConfig {
  id: 'standard' | 'sprint' | 'endurance' | 'rally';
  label: string;
  badge: string;
  description: string;
  gridDecider: string;
  sessions: SeriesWeekendSession[];
}

export interface UnifiedSportConfig {
  slug: string;
  championship: Championship;
  basics: MotorsportBasicsGuide | null;
  detail: ChampionshipDetailData | null;
  teams: ChampionshipTeamStanding[];
  drivers: DriverProfile[];
  circuits: CircuitEntity[];
  weekendFormats: SeriesWeekendFormatConfig[];
}

/**
 * Returns structured weekend formats for a specific championship,
 * highlighting session sequences, purpose, and how grid positions are determined.
 */
export function getSeriesWeekendFormats(slug: string, detail?: ChampionshipDetailData | null): SeriesWeekendFormatConfig[] {
  const norm = slug.toLowerCase().trim();

  // Formula 1: Standard Grand Prix Weekend vs Sprint Weekend
  if (norm === 'f1') {
    return [
      {
        id: 'standard',
        label: 'Standard Grand Prix Weekend',
        badge: 'STANDARD FORMAT (18 ROUNDS)',
        description: 'The traditional three-day format featuring three practice sessions, three-stage knockout qualifying, and the Sunday ~305 km Grand Prix.',
        gridDecider: 'Saturday Qualifying (Q1, Q2, Q3) sets the starting grid for Sunday’s Grand Prix.',
        sessions: [
          {
            name: 'Free Practice 1 (FP1)',
            day: 'Friday Afternoon',
            durationMinutes: 60,
            description: 'Teams evaluate baseline aerodynamics, active aero trim (X/Z Mode), mechanical setups, and conduct initial tyre evaluations.',
            purpose: 'Setup optimization & aero calibration',
            rulesHighlight: 'Teams may run test components; fuel loads and engine modes are unrestricted.',
          },
          {
            name: 'Free Practice 2 (FP2)',
            day: 'Friday Evening',
            durationMinutes: 60,
            description: 'Crucial race simulation long runs with high fuel loads to analyze Pirelli tyre degradation rates.',
            purpose: 'Race pace simulation & tyre degradation analysis',
            rulesHighlight: 'Usually run under twilight conditions matching race start time.',
          },
          {
            name: 'Free Practice 3 (FP3)',
            day: 'Saturday Morning',
            durationMinutes: 60,
            description: 'Low-fuel, lightweight single-lap qualifying simulations on the Soft compound tyres.',
            purpose: 'Qualifying trim dial-in & single-lap threshold runs',
            rulesHighlight: 'Final opportunity to adjust car setup before Parc Fermé conditions lock.',
          },
          {
            name: 'Knockout Qualifying',
            day: 'Saturday Afternoon',
            durationMinutes: 60,
            description: 'Three-part knockout shootout: Q1 (18 mins, bottom 5 eliminated), Q2 (15 mins, bottom 5 eliminated), Q3 (12 mins, top 10 pole position showdown).',
            purpose: 'Determines the Grand Prix starting grid & Julius Baer Pole Position',
            rulesHighlight: 'Cars enter Parc Fermé upon leaving pit lane in Q1; setups cannot be altered without penalty.',
          },
          {
            name: 'Formula 1 Grand Prix',
            day: 'Sunday Afternoon',
            durationMinutes: 90,
            description: 'Standing start race covering at least 305 km (except Monaco ~260 km) with a 2-hour maximum racing window.',
            purpose: 'The main event awarding 25-18-15-12-10-8-6-4-2-1 points to top 10 finishers',
            rulesHighlight: 'Mandatory pit stop using at least two different dry-weather slick compounds in dry conditions.',
          },
        ],
      },
      {
        id: 'sprint',
        label: 'Sprint Weekend Format',
        badge: 'SPRINT FORMAT (6 ROUNDS)',
        description: 'An action-packed alternative weekend featuring an independent 100 km Sprint race on Saturday morning and Sprint Qualifying on Friday.',
        gridDecider: 'Sprint Qualifying sets Saturday Sprint grid; Saturday afternoon Grand Prix Qualifying sets Sunday Grand Prix grid.',
        sessions: [
          {
            name: 'Free Practice 1 (FP1)',
            day: 'Friday Afternoon',
            durationMinutes: 60,
            description: 'The only 60-minute practice session of the entire weekend before entering competitive sessions.',
            purpose: 'Immediate setup verification under severe time pressure',
            rulesHighlight: 'Teams must lock baseline configurations in just 60 minutes.',
          },
          {
            name: 'Sprint Qualifying (SQ)',
            day: 'Friday Evening',
            durationMinutes: 44,
            description: 'Compressed knockout format: SQ1 (12 mins, Medium tyre mandatory), SQ2 (10 mins, Medium tyre mandatory), SQ3 (8 mins, Soft tyre mandatory).',
            purpose: 'Sets the starting grid exclusively for Saturday’s Sprint race',
            rulesHighlight: 'Mandatory tyre compound rules strictly enforced per stage.',
          },
          {
            name: 'F1 Sprint Race',
            day: 'Saturday Morning',
            durationMinutes: 30,
            description: '100 km flat-out dash with no mandatory pit stops. Points awarded to the top 8 finishers (8-7-6-5-4-3-2-1).',
            purpose: 'Fast-paced standalone sprint battle awarding championship points',
            rulesHighlight: 'No tyre changes required; drivers race flat out from start to checkered flag.',
          },
          {
            name: 'Grand Prix Qualifying',
            day: 'Saturday Afternoon',
            durationMinutes: 60,
            description: 'Standard Q1, Q2, and Q3 knockout shootout setting the starting order for Sunday’s main Grand Prix.',
            purpose: 'Determines the Grand Prix starting grid & official Pole Position award',
            rulesHighlight: 'Parc Fermé opens briefly after the Sprint and re-locks for Grand Prix qualifying.',
          },
          {
            name: 'Formula 1 Grand Prix',
            day: 'Sunday Afternoon',
            durationMinutes: 90,
            description: 'Full-distance 305 km Grand Prix with full championship points and mandatory two-compound pit stop rules.',
            purpose: 'The premier championship race',
            rulesHighlight: 'Standard Grand Prix sporting rules apply in full.',
          },
        ],
      },
    ];
  }

  // FIA WEC: Standard 6h/8h Endurance vs 24 Hours of Le Mans
  if (norm === 'wec') {
    return [
      {
        id: 'standard',
        label: '6-Hour & 8-Hour WEC Weekend',
        badge: 'REGULAR ENDURANCE FORMAT',
        description: 'Multi-class endurance racing across Hypercar and LMGT3, with rotating 2 to 3-driver lineups and Hyperpole qualifying.',
        gridDecider: 'Qualifying (12 mins) followed by Hyperpole (10 mins, top 10 cars in each class battle for Pole).',
        sessions: [
          {
            name: 'Free Practice 1 & 2',
            day: 'Thursday / Friday',
            durationMinutes: 180,
            description: 'Day and night balance testing, driver stint rotations, and tyre wear telemetry across traffic.',
            purpose: 'Multiclass traffic management and stint consistency validation',
            rulesHighlight: 'All nominated drivers must complete mandatory minimum laps to qualify for the race.',
          },
          {
            name: 'Free Practice 3',
            day: 'Friday Morning',
            durationMinutes: 60,
            description: 'Final qualifying simulation and pit stop practice for driver changes and refuelling.',
            purpose: 'Refuelling nozzle and wheel gun drill rehearsals',
            rulesHighlight: 'Last session before Balance of Performance engine power envelopes lock.',
          },
          {
            name: 'Qualifying & Hyperpole',
            day: 'Friday Afternoon',
            durationMinutes: 45,
            description: 'Split sessions: 12-minute LMGT3 & Hypercar qualifying, followed by the top 10 cars in each class advancing to the 10-minute Hyperpole shootout.',
            purpose: 'Sets class-specific grids for the endurance start',
            rulesHighlight: 'Hyperpole cars run on low fuel and fresh Michelin/Goodyear rubber.',
          },
          {
            name: 'Endurance Race (6 Hours or 8 Hours)',
            day: 'Saturday / Sunday',
            durationMinutes: 360,
            description: 'Multi-class marathon where Hypercars constantly overtake LMGT3 sportscars. Cars share 3 drivers rotating in 45-60 min stints.',
            purpose: 'Main championship race awarding 25 (6h) or 38 (8h) points',
            rulesHighlight: 'Strict driver stint limits: no single driver may exceed maximum driving hours.',
          },
        ],
      },
      {
        id: 'endurance',
        label: '24 Hours of Le Mans Format',
        badge: 'THE CROWN JEWEL (DOUBLE POINTS)',
        description: 'Twice around the clock at Circuit de la Sarthe: 62 cars, public road sections, night racing, and double championship points (50 pts).',
        gridDecider: 'Wednesday Qualifying sends top 8 cars per class into Thursday evening’s prestigious Hyperpole shootout.',
        sessions: [
          {
            name: 'Scrutineering & Test Day',
            day: 'Sunday Prior',
            durationMinutes: 360,
            description: 'Public scrutineering in Le Mans city center followed by official test day on the 13.6 km circuit.',
            purpose: 'Full aerodynamic low-drag Le Mans aero kit validation',
            rulesHighlight: 'Mandatory technical verification by ACO & FIA stewards.',
          },
          {
            name: 'Practice & Night Practice',
            day: 'Wednesday & Thursday',
            durationMinutes: 300,
            description: 'Essential night sessions through the pitch-black Porsche Curves and Mulsanne Straight.',
            purpose: 'Night vision adaptation and headlight beam alignment',
            rulesHighlight: 'All rookie drivers must complete night laps to be permitted to race.',
          },
          {
            name: 'Le Mans Hyperpole',
            day: 'Thursday Evening',
            durationMinutes: 30,
            description: 'Top 8 cars from each class duel on an empty 13.6 km track for legendary Le Mans pole positions.',
            purpose: 'Crowns the official Le Mans Pole Winners',
            rulesHighlight: 'Clean air and low fuel: the fastest lap times of the entire event.',
          },
          {
            name: '24 Hours of Le Mans Race',
            day: 'Saturday 16:00 to Sunday 16:00',
            durationMinutes: 1440,
            description: '24 continuous hours of racing through dusk, night, dawn, and afternoon. Winning car covers over 5,000 kilometers.',
            purpose: 'The greatest endurance race in the world awarding 50 championship points',
            rulesHighlight: 'Safety cars operate with Pass-Around and Drop-Back procedures to manage the 13.6 km circuit.',
          },
        ],
      },
    ];
  }

  // MotoGP: Practice -> Q1/Q2 -> Tissot Sprint -> Grand Prix
  if (norm === 'motogp' || norm === 'moto2' || norm === 'moto3') {
    const isMotoGP = norm === 'motogp';
    return [
      {
        id: 'standard',
        label: isMotoGP ? 'MotoGP Grand Prix Weekend' : 'FIM Grand Prix Weekend',
        badge: 'STANDARD 2-RACE WEEKEND',
        description: isMotoGP
          ? 'High-intensity two-wheel battleground featuring Friday practice ranking, Saturday morning Qualifying, Saturday afternoon Sprint, and Sunday Grand Prix.'
          : 'Feeder championship format: Practice, Qualifying 1 & 2, and Sunday morning Grand Prix.',
        gridDecider: 'Saturday Qualifying 2 (Q2) sets the starting grid for BOTH the Saturday Sprint and the Sunday Grand Prix.',
        sessions: [
          {
            name: 'Free Practice 1 (FP1)',
            day: 'Friday Morning',
            durationMinutes: 45,
            description: '45-minute untimed session allowing riders to dial in bike geometry, electronics, and tyre allocations.',
            purpose: 'Baseline bike balance & gearbox ratio checks',
            rulesHighlight: 'Times do NOT count towards Qualifying selection.',
          },
          {
            name: 'Timed Practice (PR)',
            day: 'Friday Afternoon',
            durationMinutes: 60,
            description: '60 minutes of flat-out time attacks. The top 10 riders automatically bypass Q1 and advance directly into Q2.',
            purpose: 'Determines the top 10 riders automatically qualified for Q2',
            rulesHighlight: 'Riders throw fresh soft rear tyres in the final 10 minutes for extreme flying laps.',
          },
          {
            name: 'Free Practice 2 (FP2)',
            day: 'Saturday Morning',
            durationMinutes: 30,
            description: '30-minute warm-up focused purely on race pace with used tyres before Qualifying.',
            purpose: 'Sprint and Grand Prix race simulation',
            rulesHighlight: 'No pressure of qualifying cutoffs.',
          },
          {
            name: 'Qualifying 1 & 2 (Q1 & Q2)',
            day: 'Saturday Morning',
            durationMinutes: 40,
            description: 'Q1 (15 mins): Remaining riders fight for top 2 spots to advance. Q2 (15 mins): 12 elite riders battle for Pole Position.',
            purpose: 'Sets the starting grid for BOTH the Saturday Sprint and Sunday Grand Prix',
            rulesHighlight: 'Pole position holder starts P1 in both races.',
          },
          ...(isMotoGP
            ? [
                {
                  name: 'Tissot Sprint Race',
                  day: 'Saturday Afternoon',
                  durationMinutes: 20,
                  description: 'Half-distance flat-out sprint race (~10–13 laps). No tyre management or fuel conservation required.',
                  purpose: 'Awards half championship points to top 9 finishers (12-9-7-6-5-4-3-2-1)',
                  rulesHighlight: 'Pure aggression from lights to flag; no pit stops allowed unless red-flagged.',
                },
              ]
            : []),
          {
            name: 'Grand Prix Race',
            day: 'Sunday Afternoon',
            durationMinutes: 45,
            description: 'Full-distance premier championship race (~20–27 laps). Requires extreme tyre preservation and physical endurance.',
            purpose: 'Full 25-20-16-13-11-10-9-8-7-6-5-4-3-2-1 points awarded down to 15th place',
            rulesHighlight: 'Flag-to-Flag rule: if rain begins, riders may dive into pit lane and jump onto wet-setup bikes.',
          },
        ],
      },
    ];
  }

  // Default / Other: Use sessions from detail dataset or generate structured format
  const rounds = detail?.rounds || [];
  const sampleRound = rounds[0];
  const sessions: SeriesWeekendSession[] = sampleRound?.sessions.map((s, idx) => ({
    name: s.name,
    day: s.day,
    durationMinutes: s.durationMinutes,
    description: s.description,
    purpose: idx === 0 ? 'Practice & Setup' : (idx === sampleRound.sessions.length - 1 ? 'Championship Race' : 'Qualifying / Heats'),
    rulesHighlight: s.formatHighlight,
  })) || [
    { name: 'Practice', day: 'Day 1', durationMinutes: 60, description: 'Track acclimation and machine setup tuning.', purpose: 'Setup optimization' },
    { name: 'Qualifying', day: 'Day 2', durationMinutes: 60, description: 'Time attack session setting the grid.', purpose: 'Starting grid determination' },
    { name: 'Championship Race', day: 'Day 3', durationMinutes: 90, description: 'Full race awarding championship points.', purpose: 'Race victory & championship standings' },
  ];

  return [
    {
      id: 'standard',
      label: 'Championship Weekend Format',
      badge: 'OFFICIAL FORMAT',
      description: detail?.overviewSummary?.slice(0, 160) || 'Official structured format sanctioned by the governing body.',
      gridDecider: 'Determined through official timed qualifying sessions.',
      sessions,
    },
  ];
}

/**
 * Returns complete unified sport configuration for the reusable SportDetailView.
 */
export async function getUnifiedSportConfig(slug: string): Promise<UnifiedSportConfig | null> {
  const norm = slug.toLowerCase().trim();
  const championship = CHAMPIONSHIPS_REGISTRY.find(c => c.id.toLowerCase() === norm);
  if (!championship) return null;

  // Load code-split detail data & basics guide in parallel
  const [detail, basics] = await Promise.all([
    getChampionshipDetail(norm),
    Promise.resolve(getMotorsportBasics(norm)),
  ]);

  // Retrieve scoped teams
  const teams = detail?.teamsStandings || [];

  // Retrieve scoped drivers:
  // 1. Evergreen Driver Profiles belonging to this championship
  const evergreenDrivers = DRIVER_PROFILES.filter(d => d.series.toLowerCase() === norm);

  // Retrieve scoped circuits
  const circuits = getCircuitsByChampionship(norm, detail?.rounds);

  // Weekend format architecture
  const weekendFormats = getSeriesWeekendFormats(norm, detail);

  return {
    slug: norm,
    championship,
    basics,
    detail,
    teams,
    drivers: evergreenDrivers,
    circuits,
    weekendFormats,
  };
}

/**
 * Supported championships list grouped into discovery categories.
 */
export interface SupportedCategoryGroup {
  id: string;
  disciplineKey: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  championshipIds: string[];
}

export const SUPPORTED_MOTORSPORT_GROUPS: SupportedCategoryGroup[] = [
  {
    id: 'formula',
    disciplineKey: 'formula',
    title: 'Formula Racing',
    badge: 'PINNACLE SINGLE-SEATER LADDER',
    badgeColor: '#e10600',
    description: 'High-downforce open-wheel competition from grassroots junior formulas to the pinnacle of Formula 1 and all-electric street circuits.',
    championshipIds: ['f1', 'f2', 'f3', 'f4', 'formula-e'],
  },
  {
    id: 'motorcycle',
    disciplineKey: 'motorcycle',
    title: 'Motorcycle Racing',
    badge: 'TWO-WHEEL PROTOTYPES',
    badgeColor: '#dc2626',
    description: 'Bespoke racing motorcycles reaching 360+ km/h with 65° lean angles, from Moto3 and Moto2 through to the MotoGP premier class.',
    championshipIds: ['motogp', 'moto2', 'moto3'],
  },
  {
    id: 'endurance',
    disciplineKey: 'endurance',
    title: 'Endurance / GT',
    badge: 'MULTI-CLASS & SPORTSCARS',
    badgeColor: '#2563eb',
    description: 'Multi-hour endurance marathons, driver rotations, and production-derived GT3 competition including the 24 Hours of Le Mans, Daytona, and Spa.',
    championshipIds: ['wec', 'gt-world-challenge', 'imsa'],
  },
  {
    id: 'other',
    disciplineKey: 'other',
    title: 'Other Disciplines',
    badge: 'RALLY, INDYCAR & NATIONAL COMPETITION',
    badgeColor: '#f97316',
    description: 'Man and machine against the elements in WRC stages, the high-speed diversity of IndyCar and NASCAR, and the Indian Motorsport ecosystem.',
    championshipIds: ['wrc', 'indycar', 'nascar', 'indian-motorsport'],
  },
];

/**
 * THE GRDX — Pre-Race Strategy Master Scenario Registry
 * 
 * Curated dummy races with deterministic simulation parameters,
 * authentic circuit telemetry, reproducible baseline outcomes,
 * distinct reference plans A, B, and C, and competitor field benchmarks.
 * 
 * All race data is clearly identified as simulated.
 */

import { PreRaceScenario } from '../../types/strategy';

export const PRE_RACE_SCENARIOS: PreRaceScenario[] = [
  // =========================================================================
  // 1. MONZA SPEED TEMPLE (53 Laps, Low Deg, Starting P4)
  // =========================================================================
  {
    id: 'monza-gp-speed',
    version: 1,
    title: 'Monza Speed Temple (Simulated)',
    circuitName: 'Autodromo Nazionale Monza',
    circuitCharacteristics: 'Ultra-low downforce, long straights exceeding 340 km/h, heavy braking chicanes. Low tire degradation with high top-speed importance.',
    totalLaps: 53,
    baseLapTimeSeconds: 83.0,
    startingPosition: 4,
    availableCompounds: ['soft', 'medium', 'hard'],
    tireDegradationSecondsPerLap: {
      soft: 0.12,
      medium: 0.07,
      hard: 0.035,
      intermediate: 0.18,
      wet: 0.25
    },
    tireCliffLap: {
      soft: 16,
      medium: 26,
      hard: 40,
      intermediate: 20,
      wet: 22
    },
    pitLossSeconds: 23.5,
    pitStopDurationSeconds: 2.5,
    trackCondition: 'dry',
    trackTempCelsius: 32,
    weatherDescription: 'Sunny, clear skies. 0% chance of rain. Ambient: 27°C, Track: 32°C.',
    specialConditions: 'Low pit loss favors undercut if traffic window is clean. Dirty air impact is low due to DRS zones.',
    rivalBehaviorNotes: 'P1-P3 starting on Mediums targeting a 1-stop. Midfield runners (P7-P12) likely to bunch up around lap 18-25.',
    rules: {
      minPitStops: 1,
      mandatoryDifferentCompounds: true
    },
    baselineOutcome: {
      startingPosition: 4,
      finishingPosition: 4,
      totalRaceTimeSeconds: 4498.2, // 1h 14m 58.2s
      formattedTime: '1h 14m 58.2s',
      pitStopCount: 1,
      strategyDescription: 'Medium (L1-22) → Hard (L23-53)',
      stints: [
        { stintNumber: 1, compound: 'medium', startLap: 1, endLap: 22, laps: 22 },
        { stintNumber: 2, compound: 'hard', startLap: 23, endLap: 53, laps: 31 }
      ],
      competitorAssumptions: [
        'Leader Verstappen maintains clean air pace of ~83.2s on Stint 1.',
        'Norris and Leclerc pit on laps 23 and 24 respectively.',
        'No mid-race safety car; standard green flag conditions throughout.'
      ]
    },
    referencePlans: [
      {
        id: 'plan_a',
        name: 'Plan A — Balanced',
        label: 'Medium → Hard (1-Stop)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'medium', startLap: 1, endLap: 23, laps: 23 },
          { stintNumber: 2, compound: 'hard', startLap: 24, endLap: 53, laps: 30 }
        ],
        mainAdvantage: 'High track position security and steady delta with zero risk of falling into midfield traffic.',
        mainRisk: 'Vulnerable to aggressive 2-stoppers if tire degradation drops faster than expected.',
        idealConditions: 'Standard track temperatures with uninterrupted green-flag running.'
      },
      {
        id: 'plan_b',
        name: 'Plan B — Alternative',
        label: 'Soft → Hard (1-Stop Undercut)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 16, laps: 16 },
          { stintNumber: 2, compound: 'hard', startLap: 17, endLap: 53, laps: 37 }
        ],
        mainAdvantage: 'Holeshot off the grid to gain 1-2 positions into Turn 1, triggering an early undercut.',
        mainRisk: 'Hard compound must survive 37 laps, risking pace drop-off in the final 5 laps.',
        idealConditions: 'Strong start desired to leapfrog front-row rivals before DRS becomes active.'
      },
      {
        id: 'plan_c',
        name: 'Plan C — Aggressive Sprint',
        label: 'Soft → Medium → Soft (2-Stop)',
        pitStopCount: 2,
        stints: [
          { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 14, laps: 14 },
          { stintNumber: 2, compound: 'medium', startLap: 15, endLap: 35, laps: 21 },
          { stintNumber: 3, compound: 'soft', startLap: 36, endLap: 53, laps: 18 }
        ],
        mainAdvantage: 'Maximum lap-by-lap pace on soft tires to attack rivals on heavily worn hards.',
        mainRisk: 'Incurs an extra 23.5s pit loss that must be recovered through aggressive on-track overtakes.',
        idealConditions: 'Safety Car or VSC neutralization during the mid-race window reduces pit stop loss.'
      }
    ],
    competitors: [
      {
        driver: 'Max Verstappen (Red Bull)',
        team: 'Red Bull Racing',
        startingPosition: 1,
        strategyDescription: 'Medium (L1-24) → Hard (L25-53)',
        pitLaps: [24],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 4478.0,
        baselineFinishingPosition: 1
      },
      {
        driver: 'Lando Norris (McLaren)',
        team: 'McLaren',
        startingPosition: 2,
        strategyDescription: 'Medium (L1-23) → Hard (L24-53)',
        pitLaps: [23],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 4485.5,
        baselineFinishingPosition: 2
      },
      {
        driver: 'Charles Leclerc (Ferrari)',
        team: 'Ferrari',
        startingPosition: 3,
        strategyDescription: 'Soft (L1-17) → Hard (L18-53)',
        pitLaps: [17],
        compounds: ['soft', 'hard'],
        estimatedTotalRaceTimeSeconds: 4492.0,
        baselineFinishingPosition: 3
      },
      {
        driver: 'Oscar Piastri (McLaren)',
        team: 'McLaren',
        startingPosition: 5,
        strategyDescription: 'Medium (L1-22) → Hard (L23-53)',
        pitLaps: [22],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 4504.0,
        baselineFinishingPosition: 5
      },
      {
        driver: 'Lewis Hamilton (Ferrari)',
        team: 'Ferrari',
        startingPosition: 6,
        strategyDescription: 'Medium (L1-21) → Hard (L22-53)',
        pitLaps: [21],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 4510.5,
        baselineFinishingPosition: 6
      },
      {
        driver: 'George Russell (Mercedes)',
        team: 'Mercedes',
        startingPosition: 7,
        strategyDescription: 'Hard (L1-32) → Medium (L33-53)',
        pitLaps: [32],
        compounds: ['hard', 'medium'],
        estimatedTotalRaceTimeSeconds: 4518.0,
        baselineFinishingPosition: 7
      }
    ],
    status: 'approved'
  },

  // =========================================================================
  // 2. SAKHIR NIGHT CRUCIBLE (57 Laps, High Deg, Starting P5)
  // =========================================================================
  {
    id: 'bahrain-gp-crucible',
    version: 1,
    title: 'Sakhir Night Crucible (Simulated)',
    circuitName: 'Bahrain International Circuit',
    circuitCharacteristics: 'Highly abrasive rough tarmac, high-traction exits that shred rear tires, rapid thermal degradation. Undercut power is among the strongest of the season.',
    totalLaps: 57,
    baseLapTimeSeconds: 92.5,
    startingPosition: 5,
    availableCompounds: ['soft', 'medium', 'hard'],
    tireDegradationSecondsPerLap: {
      soft: 0.18,
      medium: 0.11,
      hard: 0.065,
      intermediate: 0.20,
      wet: 0.30
    },
    tireCliffLap: {
      soft: 14,
      medium: 23,
      hard: 35,
      intermediate: 18,
      wet: 20
    },
    pitLossSeconds: 22.0,
    pitStopDurationSeconds: 2.4,
    trackCondition: 'dry',
    trackTempCelsius: 28,
    weatherDescription: 'Dry desert night. Ambient temp: 24°C, Track falling from 30°C to 26°C.',
    specialConditions: 'Severe rear degradation. A 1-stop strategy requires extreme pace sacrifice and risks hitting the tire cliff.',
    rivalBehaviorNotes: 'Front runners are committed to a 2-stop. The undercut gains up to 2.4s per lap on fresh rubber.',
    rules: {
      minPitStops: 1,
      mandatoryDifferentCompounds: true
    },
    baselineOutcome: {
      startingPosition: 5,
      finishingPosition: 5,
      totalRaceTimeSeconds: 5484.0, // 1h 31m 24.0s
      formattedTime: '1h 31m 24.0s',
      pitStopCount: 2,
      strategyDescription: 'Soft (L1-14) → Hard (L15-36) → Hard (L37-57)',
      stints: [
        { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 14, laps: 14 },
        { stintNumber: 2, compound: 'hard', startLap: 15, endLap: 36, laps: 22 },
        { stintNumber: 3, compound: 'hard', startLap: 37, endLap: 57, laps: 21 }
      ],
      competitorAssumptions: [
        'Top 4 drivers execute clean 2-stops with pit windows around laps 13-16 and 35-38.',
        'Midfield cars on 1-stop suffer heavy thermal degradation past lap 42.'
      ]
    },
    referencePlans: [
      {
        id: 'plan_a',
        name: 'Plan A — Balanced',
        label: 'Soft → Hard → Medium (2-Stop)',
        pitStopCount: 2,
        stints: [
          { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 15, laps: 15 },
          { stintNumber: 2, compound: 'hard', startLap: 16, endLap: 37, laps: 22 },
          { stintNumber: 3, compound: 'medium', startLap: 38, endLap: 57, laps: 20 }
        ],
        mainAdvantage: 'Strong launch on Softs followed by a fast final charging stint on fresh Mediums against worn Hards.',
        mainRisk: 'Requires managing Soft wear in traffic during the opening 10 laps.',
        idealConditions: 'Track temperatures cooling gradually under the floodlights.'
      },
      {
        id: 'plan_b',
        name: 'Plan B — Conservative 1-Stop',
        label: 'Medium → Hard (1-Stop Stretch)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'medium', startLap: 1, endLap: 22, laps: 22 },
          { stintNumber: 2, compound: 'hard', startLap: 23, endLap: 57, laps: 35 }
        ],
        mainAdvantage: 'Saves 22.0s pit lane time loss, elevating track position while rivals stop twice.',
        mainRisk: 'Extreme tire degradation in the final 10 laps makes defending against 2-stoppers nearly impossible.',
        idealConditions: 'Tire management maestro who can preserve rear tire traction without locking up.'
      },
      {
        id: 'plan_c',
        name: 'Plan C — High-Variance Sprint',
        label: 'Soft → Soft → Medium (2-Stop Aggressive)',
        pitStopCount: 2,
        stints: [
          { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 14, laps: 14 },
          { stintNumber: 2, compound: 'soft', startLap: 15, endLap: 29, laps: 15 },
          { stintNumber: 3, compound: 'medium', startLap: 30, endLap: 57, laps: 28 }
        ],
        mainAdvantage: 'Exploits maximum compound grip in the first half of the race to open a commanding lead.',
        mainRisk: 'The final 28-lap Medium stint exceeds the 23-lap cliff threshold, causing severe pace loss.',
        idealConditions: 'A Safety Car deployment around lap 30 to bunch the field and freeze deltas.'
      }
    ],
    competitors: [
      {
        driver: 'Max Verstappen (Red Bull)',
        team: 'Red Bull Racing',
        startingPosition: 1,
        strategyDescription: 'Soft (L1-15) → Hard (L16-36) → Soft (L37-57)',
        pitLaps: [15, 36],
        compounds: ['soft', 'hard', 'soft'],
        estimatedTotalRaceTimeSeconds: 5450.0,
        baselineFinishingPosition: 1
      },
      {
        driver: 'Charles Leclerc (Ferrari)',
        team: 'Ferrari',
        startingPosition: 2,
        strategyDescription: 'Soft (L1-14) → Hard (L15-35) → Medium (L36-57)',
        pitLaps: [14, 35],
        compounds: ['soft', 'hard', 'medium'],
        estimatedTotalRaceTimeSeconds: 5462.5,
        baselineFinishingPosition: 2
      },
      {
        driver: 'Lando Norris (McLaren)',
        team: 'McLaren',
        startingPosition: 3,
        strategyDescription: 'Soft (L1-15) → Hard (L16-37) → Medium (L38-57)',
        pitLaps: [15, 37],
        compounds: ['soft', 'hard', 'medium'],
        estimatedTotalRaceTimeSeconds: 5470.0,
        baselineFinishingPosition: 3
      },
      {
        driver: 'George Russell (Mercedes)',
        team: 'Mercedes',
        startingPosition: 4,
        strategyDescription: 'Soft (L1-13) → Hard (L14-34) → Hard (L35-57)',
        pitLaps: [13, 34],
        compounds: ['soft', 'hard', 'hard'],
        estimatedTotalRaceTimeSeconds: 5478.0,
        baselineFinishingPosition: 4
      },
      {
        driver: 'Lewis Hamilton (Ferrari)',
        team: 'Ferrari',
        startingPosition: 6,
        strategyDescription: 'Medium (L1-18) → Hard (L19-38) → Soft (L39-57)',
        pitLaps: [18, 38],
        compounds: ['medium', 'hard', 'soft'],
        estimatedTotalRaceTimeSeconds: 5492.0,
        baselineFinishingPosition: 6
      }
    ],
    status: 'approved'
  },

  // =========================================================================
  // 3. SILVERSTONE WINGED CLASSIC (52 Laps, High Lateral Aero, Starting P3)
  // =========================================================================
  {
    id: 'silverstone-gp-aero',
    version: 1,
    title: 'Silverstone Winged Classic (Simulated)',
    circuitName: 'Silverstone Circuit',
    circuitCharacteristics: 'High-speed directional changes through Maggotts, Becketts, and Chapel punishing the front-left tire. Pit stop delta is low (20.5s) thanks to the pit straight shortcut.',
    totalLaps: 52,
    baseLapTimeSeconds: 89.0,
    startingPosition: 3,
    availableCompounds: ['soft', 'medium', 'hard'],
    tireDegradationSecondsPerLap: {
      soft: 0.16,
      medium: 0.09,
      hard: 0.05,
      intermediate: 0.19,
      wet: 0.28
    },
    tireCliffLap: {
      soft: 15,
      medium: 25,
      hard: 38,
      intermediate: 19,
      wet: 21
    },
    pitLossSeconds: 20.5,
    pitStopDurationSeconds: 2.3,
    trackCondition: 'dry',
    trackTempCelsius: 24,
    weatherDescription: 'Overcast, gusty British summer afternoon. Track temp 24°C, 15% rain risk late in race.',
    specialConditions: 'Short pit lane delta favors multi-stop strategies if front-left blister forms early.',
    rivalBehaviorNotes: 'Front runners are on split strategies. Mercedes likely to pit early for undercuts.',
    rules: {
      minPitStops: 1,
      mandatoryDifferentCompounds: true
    },
    baselineOutcome: {
      startingPosition: 3,
      finishingPosition: 3,
      totalRaceTimeSeconds: 4812.0, // 1h 20m 12.0s
      formattedTime: '1h 20m 12.0s',
      pitStopCount: 1,
      strategyDescription: 'Medium (L1-22) → Hard (L23-52)',
      stints: [
        { stintNumber: 1, compound: 'medium', startLap: 1, endLap: 22, laps: 22 },
        { stintNumber: 2, compound: 'hard', startLap: 23, endLap: 52, laps: 30 }
      ],
      competitorAssumptions: [
        'Norris and Verstappen maintain steady 1-stop pace ahead in P1-P2.',
        'Front-left degradation remains predictable under 24°C track conditions.'
      ]
    },
    referencePlans: [
      {
        id: 'plan_a',
        name: 'Plan A — Balanced',
        label: 'Medium → Hard (1-Stop)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'medium', startLap: 1, endLap: 24, laps: 24 },
          { stintNumber: 2, compound: 'hard', startLap: 25, endLap: 52, laps: 28 }
        ],
        mainAdvantage: 'Clean execution with minimal pit loss exposure and solid front-left tire preservation.',
        mainRisk: 'Can be vulnerable to high-grip 2-stop undercut if front-left wear escalates.',
        idealConditions: 'Steady overcast conditions without unexpected thermal track spikes.'
      },
      {
        id: 'plan_b',
        name: 'Plan B — Undercut Sprint',
        label: 'Medium → Hard → Soft (2-Stop)',
        pitStopCount: 2,
        stints: [
          { stintNumber: 1, compound: 'medium', startLap: 1, endLap: 18, laps: 18 },
          { stintNumber: 2, compound: 'hard', startLap: 19, endLap: 38, laps: 20 },
          { stintNumber: 3, compound: 'soft', startLap: 39, endLap: 52, laps: 14 }
        ],
        mainAdvantage: 'Exploits the short 20.5s pit loss to attack with a blistering 14-lap soft tire charge at the finish.',
        mainRisk: 'Must overtake cars on track through Woodcote and Stowe to make the math work.',
        idealConditions: 'Clean air out-laps and good tire warmup.'
      },
      {
        id: 'plan_c',
        name: 'Plan C — Aggressive Launch',
        label: 'Soft → Hard (1-Stop Early Attack)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 15, laps: 15 },
          { stintNumber: 2, compound: 'hard', startLap: 16, endLap: 52, laps: 37 }
        ],
        mainAdvantage: 'Sprint off the start line to challenge for P1 into Abbey and Village on Lap 1.',
        mainRisk: '37 laps on the Hard compound approaches the 38-lap cliff, risking severe degradation.',
        idealConditions: 'Track position is paramount and overtaking is anticipated to be difficult.'
      }
    ],
    competitors: [
      {
        driver: 'Lando Norris (McLaren)',
        team: 'McLaren',
        startingPosition: 1,
        strategyDescription: 'Medium (L1-23) → Hard (L24-52)',
        pitLaps: [23],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 4795.0,
        baselineFinishingPosition: 1
      },
      {
        driver: 'Max Verstappen (Red Bull)',
        team: 'Red Bull Racing',
        startingPosition: 2,
        strategyDescription: 'Medium (L1-22) → Hard (L23-52)',
        pitLaps: [22],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 4802.5,
        baselineFinishingPosition: 2
      },
      {
        driver: 'Lewis Hamilton (Ferrari)',
        team: 'Ferrari',
        startingPosition: 4,
        strategyDescription: 'Medium (L1-20) → Hard (L21-52)',
        pitLaps: [20],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 4819.0,
        baselineFinishingPosition: 4
      },
      {
        driver: 'Oscar Piastri (McLaren)',
        team: 'McLaren',
        startingPosition: 5,
        strategyDescription: 'Soft (L1-16) → Hard (L17-52)',
        pitLaps: [16],
        compounds: ['soft', 'hard'],
        estimatedTotalRaceTimeSeconds: 4825.0,
        baselineFinishingPosition: 5
      }
    ],
    status: 'approved'
  },

  // =========================================================================
  // 4. MONACO TRACK-POSITION CITADEL (78 Laps, Zero Deg, Starting P2)
  // =========================================================================
  {
    id: 'monaco-gp-citadel',
    version: 1,
    title: 'Monaco Track-Position Citadel (Simulated)',
    circuitName: 'Circuit de Monaco',
    circuitCharacteristics: 'Tight narrow street circuit where on-track overtaking is nearly impossible. Minimal tire degradation. Track position is 95% of race outcome. Long pit loss of 25.0s.',
    totalLaps: 78,
    baseLapTimeSeconds: 74.0,
    startingPosition: 2,
    availableCompounds: ['soft', 'medium', 'hard'],
    tireDegradationSecondsPerLap: {
      soft: 0.05,
      medium: 0.025,
      hard: 0.012,
      intermediate: 0.15,
      wet: 0.22
    },
    tireCliffLap: {
      soft: 30,
      medium: 48,
      hard: 65,
      intermediate: 25,
      wet: 25
    },
    pitLossSeconds: 25.0,
    pitStopDurationSeconds: 2.6,
    trackCondition: 'dry',
    trackTempCelsius: 38,
    weatherDescription: 'Warm Mediterranean sunshine. Track temp 38°C. Low tire wear, high track rubbering.',
    specialConditions: 'Pitting into traffic means being trapped behind slower cars for 10+ laps. Overcut is exceptionally potent if the car ahead pits into backmarker traffic.',
    rivalBehaviorNotes: 'Pole-sitter Leclerc will aim to control the pace from the front and dictate the pit stop timing.',
    rules: {
      minPitStops: 1,
      mandatoryDifferentCompounds: true
    },
    baselineOutcome: {
      startingPosition: 2,
      finishingPosition: 2,
      totalRaceTimeSeconds: 5910.0, // 1h 38m 30.0s
      formattedTime: '1h 38m 30.0s',
      pitStopCount: 1,
      strategyDescription: 'Soft (L1-28) → Hard (L29-78)',
      stints: [
        { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 28, laps: 28 },
        { stintNumber: 2, compound: 'hard', startLap: 29, endLap: 78, laps: 50 }
      ],
      competitorAssumptions: [
        'Leclerc covers your pit stop within 1 lap and retains track position.',
        'Midfield pack is spaced such that pitting before lap 25 drops you into traffic.'
      ]
    },
    referencePlans: [
      {
        id: 'plan_a',
        name: 'Plan A — Balanced Shadow',
        label: 'Soft → Hard (1-Stop Direct Cover)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 28, laps: 28 },
          { stintNumber: 2, compound: 'hard', startLap: 29, endLap: 78, laps: 50 }
        ],
        mainAdvantage: 'Guarantees P2 podium with low risk of being undercut by P3.',
        mainRisk: 'Does not create a strategic offset to pass the race leader.',
        idealConditions: 'Protecting Championship points and avoiding unnecessary risks.'
      },
      {
        id: 'plan_b',
        name: 'Plan B — The Overcut Masterclass',
        label: 'Medium → Hard (1-Stop Extended Overcut)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'medium', startLap: 1, endLap: 45, laps: 45 },
          { stintNumber: 2, compound: 'hard', startLap: 46, endLap: 78, laps: 33 }
        ],
        mainAdvantage: 'Stays out when leader pits on Lap 28; unleashes qualifying laps in clean air to jump leader via overcut.',
        mainRisk: 'Risk of getting stuck behind slower cars or being vulnerable to a Safety Car deployment.',
        idealConditions: 'Leader gets stuck behind backmarkers after pitting on Lap 28.'
      },
      {
        id: 'plan_c',
        name: 'Plan C — Hyper Undercut Gamble',
        label: 'Soft → Medium (1-Stop Early Strike)',
        pitStopCount: 1,
        stints: [
          { stintNumber: 1, compound: 'soft', startLap: 1, endLap: 22, laps: 22 },
          { stintNumber: 2, compound: 'medium', startLap: 23, endLap: 78, laps: 56 }
        ],
        mainAdvantage: 'Pits 6 laps earlier than the leader to catch them completely off-guard with a fresh out-lap.',
        mainRisk: '56 laps on Mediums exceeds the 48-lap cliff, and exiting into midfield traffic is fatal.',
        idealConditions: 'A clear 4-second gap in the midfield traffic window opens up at lap 22.'
      }
    ],
    competitors: [
      {
        driver: 'Charles Leclerc (Ferrari)',
        team: 'Ferrari',
        startingPosition: 1,
        strategyDescription: 'Soft (L1-28) → Hard (L29-78)',
        pitLaps: [28],
        compounds: ['soft', 'hard'],
        estimatedTotalRaceTimeSeconds: 5904.0,
        baselineFinishingPosition: 1
      },
      {
        driver: 'Max Verstappen (Red Bull)',
        team: 'Red Bull Racing',
        startingPosition: 3,
        strategyDescription: 'Medium (L1-32) → Hard (L33-78)',
        pitLaps: [32],
        compounds: ['medium', 'hard'],
        estimatedTotalRaceTimeSeconds: 5916.0,
        baselineFinishingPosition: 3
      },
      {
        driver: 'Lando Norris (McLaren)',
        team: 'McLaren',
        startingPosition: 4,
        strategyDescription: 'Soft (L1-26) → Hard (L27-78)',
        pitLaps: [26],
        compounds: ['soft', 'hard'],
        estimatedTotalRaceTimeSeconds: 5922.5,
        baselineFinishingPosition: 4
      }
    ],
    status: 'approved'
  }
];

export function getPreRaceScenarios(): PreRaceScenario[] {
  return PRE_RACE_SCENARIOS.filter(s => s.status === 'approved');
}

export function getPreRaceScenarioById(id: string): PreRaceScenario | null {
  return PRE_RACE_SCENARIOS.find(s => s.id === id) || null;
}

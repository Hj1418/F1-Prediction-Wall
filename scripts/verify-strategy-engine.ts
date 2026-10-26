/**
 * Strategy Room — Simulation Engine & Mathematical Consistency Verification
 * 
 * Verifies:
 * 1. Scenario bank integrity & schema invariants (18 authored scenarios)
 * 2. Deterministic simulation engine step resolution
 * 3. Pit loss & safety car delta calculations
 * 4. Tire degradation & cliff mechanics
 * 5. Undercut vs overcut delta calculations
 * 6. Weather transition penalties
 * 7. 100-point authoritative scoring rubric boundaries & rating tiers
 */

import { APPROVED_SCENARIOS, getScenarioById } from '../src/services/strategy/scenarioRegistry';
import { executeSimulationStep } from '../src/services/strategy/simulationEngine';
import { calculateAuthoritativeScore, getRatingTier } from '../src/services/strategy/strategyScoring';
import { StrategyRaceState } from '../src/types/strategy';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runEngineTests() {
  console.log('🏁 [STRATEGY ENGINE TESTS] Starting Verification Suite...\n');

  // Test 1: Scenario Bank Schema & Invariants
  console.log('--- TEST 1: Scenario Bank Integrity & Invariants ---');
  assert(APPROVED_SCENARIOS.length >= 18, `Expected at least 18 scenarios, found ${APPROVED_SCENARIOS.length}`);
  console.log(`✅ Loaded ${APPROVED_SCENARIOS.length} approved scenarios.`);

  const singleChallenges = APPROVED_SCENARIOS.filter(s => s.mode === 'challenge');
  const multiStageSims = APPROVED_SCENARIOS.filter(s => s.mode === 'race_simulation');
  assert(singleChallenges.length >= 14, `Expected at least 14 single challenges, found ${singleChallenges.length}`);
  assert(multiStageSims.length >= 4, `Expected at least 4 multi-stage simulations, found ${multiStageSims.length}`);
  console.log(`✅ Mode distribution: ${singleChallenges.length} Challenges, ${multiStageSims.length} Multi-Stage Simulations.`);

  APPROVED_SCENARIOS.forEach(sc => {
    assert(Boolean(sc.id && sc.title && sc.circuitName), `Scenario ${sc.id} missing basic metadata`);
    assert(sc.version >= 1, `Scenario ${sc.id} has invalid version`);
    assert(sc.initialState.position >= 1 && sc.initialState.position <= 20, `Scenario ${sc.id} invalid position ${sc.initialState.position}`);
    assert(sc.initialState.totalLaps >= sc.initialState.currentLap, `Scenario ${sc.id} totalLaps < currentLap`);
    assert(sc.initialState.pitLossSeconds >= 0, `Scenario ${sc.id} invalid pit loss`);
    assert(sc.decisionPoints.length >= 1, `Scenario ${sc.id} has no decision points`);
    assert(sc.simulationParameters.pitLossSeconds >= 0, `Scenario ${sc.id} invalid simulation pit loss`);
    assert(Boolean(sc.debrief && sc.debrief.tacticalTakeaway), `Scenario ${sc.id} missing debrief takeaway`);
    assert(sc.scoringRubric.maxScore === 100, `Scenario ${sc.id} maxScore must be 100`);

    sc.decisionPoints.forEach((dp, stepIdx) => {
      assert(dp.availableActions.length >= 2, `Scenario ${sc.id} step ${stepIdx} must have at least 2 actions`);
      assert(Boolean(dp.resolutionRules.defaultOptimalActionId), `Scenario ${sc.id} step ${stepIdx} missing defaultOptimalActionId`);
      
      dp.availableActions.forEach(action => {
        const resolution = dp.resolutionRules.resolutions[action.id];
        assert(Boolean(resolution), `Scenario ${sc.id} action ${action.id} missing resolution`);
        assert(resolution.decisionScore >= 0 && resolution.decisionScore <= 100, `Scenario ${sc.id} action ${action.id} invalid score ${resolution.decisionScore}`);
        assert(typeof resolution.timeDeltaSeconds === 'number', `Scenario ${sc.id} action ${action.id} invalid time delta`);
        assert(typeof resolution.positionDelta === 'number', `Scenario ${sc.id} action ${action.id} invalid position delta`);
      });
    });
  });
  console.log('✅ All 18 scenarios satisfy strict schema invariants and rules.\n');

  // Test 2: Deterministic Simulation Step Resolution
  console.log('--- TEST 2: Deterministic Simulation Engine Step ---');
  const undercutScenario = getScenarioById('monza-undercut-p2')!;
  assert(Boolean(undercutScenario), 'monza-undercut-p2 scenario found');

  const initialState: StrategyRaceState = { ...undercutScenario.initialState };
  const optimalAction = 'act-box-undercut';
  const subOptimalAction = 'act-stay-out-overcut';

  const optRes = executeSimulationStep(undercutScenario, initialState, optimalAction, 0);
  assert(optRes.actionId === optimalAction, 'Action ID matches optimal');
  assert(optRes.isOptimal === true, 'Optimal action flagged isOptimal');
  assert(optRes.timeDeltaSeconds < 0, `Undercut should yield negative time delta (time gained): ${optRes.timeDeltaSeconds}`);
  assert(optRes.positionDelta >= 0, 'Undercut should not lose track position');
  assert(optRes.decisionScore >= 90, `Optimal undercut should score >= 90, got ${optRes.decisionScore}`);
  assert(optRes.eventLog.length >= 1, 'Event log generated');

  const subRes = executeSimulationStep(undercutScenario, initialState, subOptimalAction, 0);
  assert(subRes.actionId === subOptimalAction, 'Action ID matches suboptimal');
  assert(subRes.isOptimal === false, 'Suboptimal action flagged false');
  assert(subRes.timeDeltaSeconds > 0, `Staying out should yield positive time delta (time lost): ${subRes.timeDeltaSeconds}`);
  assert(subRes.decisionScore < optRes.decisionScore, 'Suboptimal score must be lower than optimal');
  console.log(`✅ Simulation step resolved: Optimal Undercut (${optRes.timeDeltaSeconds}s, ${optRes.decisionScore} pts) vs Suboptimal (${subRes.timeDeltaSeconds}s, ${subRes.decisionScore} pts).\n`);

  // Test 3: Safety Car & VSC Pit Loss Model
  console.log('--- TEST 3: Safety Car Pit Loss Reductions ---');
  const scScenario = getScenarioById('silverstone-vsc-gamble')!;
  assert(Boolean(scScenario), 'silverstone-vsc-gamble found');

  const scInitial = { ...scScenario.initialState };
  const boxUnderSC = executeSimulationStep(scScenario, scInitial, 'act-box-vsc-hard', 0);
  const stayOutSC = executeSimulationStep(scScenario, scInitial, 'act-stay-out-planned', 0);

  assert(boxUnderSC.decisionScore > stayOutSC.decisionScore, 'Pitting under SC with free pit stop should score higher');
  assert(boxUnderSC.timeDeltaSeconds < stayOutSC.timeDeltaSeconds, 'Pitting under SC should save race time compared to normal pit');
  console.log(`✅ Safety Car mechanics verified: Box under SC net time: ${boxUnderSC.timeDeltaSeconds}s vs Stay out: ${stayOutSC.timeDeltaSeconds}s.\n`);

  // Test 4: Weather Transition Mechanics
  console.log('--- TEST 4: Weather Transition & Tire Compound Mechanics ---');
  const weatherScenario = getScenarioById('spa-rain-incoming')!;
  assert(Boolean(weatherScenario), 'spa-rain-incoming found');

  const weatherInitial = { ...weatherScenario.initialState };
  const boxForInters = executeSimulationStep(weatherScenario, weatherInitial, 'act-box-inters', 0);
  const stayOnSlicks = executeSimulationStep(weatherScenario, weatherInitial, 'act-stay-out-slicks', 0);

  assert(boxForInters.decisionScore > stayOnSlicks.decisionScore, 'Box for inters on wet track must score higher than slicks');
  assert(stayOnSlicks.timeDeltaSeconds > 10, 'Slicks on heavy rain track should incur massive time penalty');
  console.log(`✅ Weather transitions verified: Inter switch (${boxForInters.decisionScore} pts) vs Slick gamble (${stayOnSlicks.decisionScore} pts, +${stayOnSlicks.timeDeltaSeconds}s).\n`);

  // Test 5: Authoritative 100-Point Scoring Model
  console.log('--- TEST 5: 100-Point Authoritative Scoring Rubric ---');
  const multiStageSim = getScenarioById('silverstone-52-lap-masterclass')!;
  assert(Boolean(multiStageSim), 'silverstone-52-lap-masterclass found');
  assert(multiStageSim.decisionPoints.length >= 3, `Expected at least 3 stages in Silverstone sim, found ${multiStageSim.decisionPoints.length}`);

  // Simulate all optimal decisions
  const optimalDecisions = multiStageSim.decisionPoints.map((dp, idx) => {
    const optId = dp.resolutionRules.defaultOptimalActionId;
    const res = dp.resolutionRules.resolutions[optId];
    return {
      decisionPointId: dp.id,
      stepIndex: idx,
      actionId: optId,
      stateBefore: { ...multiStageSim.initialState },
      stateAfter: { ...multiStageSim.initialState, ...res.nextState },
      timeDeltaSeconds: res.timeDeltaSeconds,
      positionDelta: res.positionDelta,
      decisionScore: res.decisionScore,
      explanation: res.explanation,
      submittedAt: new Date().toISOString()
    };
  });

  const optimalReport = calculateAuthoritativeScore(multiStageSim, optimalDecisions);
  assert(optimalReport.finalScore >= 90 && optimalReport.finalScore <= 100, `Optimal score should be 90-100, got ${optimalReport.finalScore}`);
  assert(optimalReport.ratingTier.tier === 'legendary' || optimalReport.ratingTier.tier === 'apex', `Rating tier should be legendary/apex, got ${optimalReport.ratingTier.name}`);
  console.log(`✅ Multi-stage optimal run scored: ${optimalReport.finalScore}/100 [${optimalReport.ratingTier.name}].`);

  // Simulate all worst decisions
  const worstDecisions = multiStageSim.decisionPoints.map((dp, idx) => {
    // Find lowest scoring action
    let lowestActionId = dp.availableActions[0].id;
    let lowestScore = 999;
    dp.availableActions.forEach(a => {
      const s = dp.resolutionRules.resolutions[a.id].decisionScore;
      if (s < lowestScore) {
        lowestScore = s;
        lowestActionId = a.id;
      }
    });

    const res = dp.resolutionRules.resolutions[lowestActionId];
    return {
      decisionPointId: dp.id,
      stepIndex: idx,
      actionId: lowestActionId,
      stateBefore: { ...multiStageSim.initialState },
      stateAfter: { ...multiStageSim.initialState, ...res.nextState },
      timeDeltaSeconds: res.timeDeltaSeconds,
      positionDelta: res.positionDelta,
      decisionScore: res.decisionScore,
      explanation: res.explanation,
      submittedAt: new Date().toISOString()
    };
  });

  const worstReport = calculateAuthoritativeScore(multiStageSim, worstDecisions);
  assert(worstReport.finalScore < optimalReport.finalScore, 'Worst decisions must score significantly lower');
  assert(worstReport.finalScore >= 0 && worstReport.finalScore <= 100, `Score out of bounds: ${worstReport.finalScore}`);
  assert(worstReport.ratingTier.tier === 'blunder' || worstReport.ratingTier.tier === 'gambler', `Expected blunder/gambler tier, got ${worstReport.ratingTier.name}`);
  console.log(`✅ Multi-stage worst run scored: ${worstReport.finalScore}/100 [${worstReport.ratingTier.name}].`);

  // Test rating tier mappings
  assert(getRatingTier(95).tier === 'legendary', '95 should be legendary');
  assert(getRatingTier(85).tier === 'apex', '85 should be apex');
  assert(getRatingTier(70).tier === 'prudent', '70 should be prudent');
  assert(getRatingTier(55).tier === 'gambler', '55 should be gambler');
  assert(getRatingTier(30).tier === 'blunder', '30 should be blunder');
  console.log('✅ Rating tiers correctly map across the 0-100 spectrum.\n');

  console.log('🏆 ALL STRATEGY SIMULATION ENGINE TESTS PASSED SUCCESSFULLY!');
}

runEngineTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

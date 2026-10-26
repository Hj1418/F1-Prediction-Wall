import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PreRaceScenario,
  PreRaceStrategyPlan,
  PreRaceSimulatedOutcome,
  PreRaceAttempt,
  PlanIdentifier,
  TireCompound,
  PreRaceRound,
  PreRaceDiscussionComment
} from '../../types/strategy';
import {
  getPreRaceRoundStatus,
  startPreRaceDiscussionRound,
  getOrCreatePreRaceRound,
  isRoundLocked,
  getPreRaceDraft,
  savePreRaceDraft,
  getPreRaceDiscussionComments,
  postPreRaceDiscussionComment,
  getPreRaceVotes,
  castPreRaceVote,
  commitPreRaceStrategy,
  generateShareableStrategySummary,
  getUserPreRaceAttempts
} from '../../services/strategy/preRaceStrategyService';
import { validatePreRaceStrategy } from '../../services/strategy/preRaceSimulationEngine';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Flag,
  Trophy,
  ArrowLeft,
  Share2,
  Check,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Sliders,
  Flame,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Lock,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  ShieldAlert,
  Award,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PreRaceCockpitProps {
  scenario: PreRaceScenario;
}

const TIRE_COLORS: Record<TireCompound, { bg: string; text: string; label: string }> = {
  soft: { bg: '#FF3025', text: '#FFFFFF', label: 'SOFT' },
  medium: { bg: '#FFB000', text: '#000000', label: 'MEDIUM' },
  hard: { bg: '#E5E7EB', text: '#000000', label: 'HARD' },
  intermediate: { bg: '#00E5FF', text: '#000000', label: 'INTER' },
  wet: { bg: '#1E41FF', text: '#FFFFFF', label: 'WET' }
};

export const PreRaceCockpit: React.FC<PreRaceCockpitProps> = ({ scenario }) => {
  const { currentUser } = useAuth();
  const user = currentUser;

  // Customizer and Results section refs for smooth navigation
  const customizerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Active round status: does NOT start countdown automatically
  const [round, setRound] = useState<PreRaceRound>(() => {
    return getPreRaceRoundStatus(scenario.id) || getOrCreatePreRaceRound(scenario.id);
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Strategy Selection: Plan A, B, C, or Custom
  const [selectedPlanId, setSelectedPlanId] = useState<PlanIdentifier>('plan_a');
  const [customPlan, setCustomPlan] = useState<PreRaceStrategyPlan>(() => {
    const planA = scenario.referencePlans[0];
    return {
      id: 'custom',
      name: 'Custom User Strategy',
      label: 'Tailored Pit Windows & Stints',
      pitStopCount: planA.pitStopCount,
      stints: JSON.parse(JSON.stringify(planA.stints)),
      mainAdvantage: 'User tailored stint lengths and tire compound selection.',
      mainRisk: 'Must balance tire degradation and avoid hitting the thermal cliff.',
      idealConditions: 'Customized to your race execution preference.',
      contingency: 'Box for fresh tires if Safety Car deploys before Lap 30.'
    };
  });

  // Section 3: Rationale (500 char max)
  const [rationale, setRationale] = useState<string>('');

  // UI Panels and Modals
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCommitDecisionModal, setShowCommitDecisionModal] = useState(false);
  const [discussionDuration, setDiscussionDuration] = useState<10 | 15>(15);

  // Mode: Competitive vs Practice
  const [isCompetitive, setIsCompetitive] = useState(true);

  // Submission & Simulation state
  const [outcome, setOutcome] = useState<PreRaceSimulatedOutcome | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<PreRaceAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  // Discussion & Voting state
  const [comments, setComments] = useState<PreRaceDiscussionComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [votePercentages, setVotePercentages] = useState<Record<PlanIdentifier, number>>({
    plan_a: 48,
    plan_b: 32,
    plan_c: 15,
    custom: 5
  });

  // UI accordion toggles
  const [showCircuitDetails, setShowCircuitDetails] = useState(false);

  // 1. Restore saved draft on mount
  useEffect(() => {
    const savedDraft = getPreRaceDraft(scenario.id);
    if (savedDraft) {
      if (savedDraft.strategy) setCustomPlan(savedDraft.strategy);
      if (savedDraft.selectedPlanId) setSelectedPlanId(savedDraft.selectedPlanId);
      if (savedDraft.rationale) setRationale(savedDraft.rationale);
    }
  }, [scenario.id]);

  // 2. Initialize round and previous user attempts
  useEffect(() => {
    const currentRound = getPreRaceRoundStatus(scenario.id) || getOrCreatePreRaceRound(scenario.id);
    setRound(currentRound);

    // Check if user has an existing attempt for this scenario
    if (user?.userId) {
      const existing = getUserPreRaceAttempts(user.userId, scenario.id);
      if (existing.length > 0) {
        const latest = existing[0];
        setActiveAttempt(latest);
        setOutcome(latest.outcome);
        setSelectedPlanId(latest.selectedPlanId);
        if (latest.rationale) setRationale(latest.rationale);
        if (latest.selectedPlanId === 'custom') {
          setCustomPlan(latest.strategy);
        }
      }
    }

    // Load discussions & votes
    setComments(getPreRaceDiscussionComments(currentRound.roundId));
    const votes = getPreRaceVotes(currentRound.roundId);
    const total = votes.length;
    if (total > 0) {
      const counts: Record<PlanIdentifier, number> = { plan_a: 0, plan_b: 0, plan_c: 0, custom: 0 };
      votes.forEach(v => { if (counts[v.planId] !== undefined) counts[v.planId]++; });
      setVotePercentages({
        plan_a: Math.round((counts.plan_a / total) * 100),
        plan_b: Math.round((counts.plan_b / total) * 100),
        plan_c: Math.round((counts.plan_c / total) * 100),
        custom: Math.round((counts.custom / total) * 100)
      });
    }
  }, [scenario.id, user?.userId]);

  // 3. Countdown Timer — Active ONLY if user explicitly started discussion
  useEffect(() => {
    if (!round.hasExplicitlyStartedDiscussion || !round.deadlineTime) {
      setSecondsRemaining(0);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const deadline = new Date(round.deadlineTime).getTime();
      const diffSecs = Math.max(0, Math.floor((deadline - now) / 1000));
      setSecondsRemaining(diffSecs);

      if (diffSecs === 0 && round.status === 'active') {
        setRound(prev => ({ ...prev, status: 'locked' }));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [round.deadlineTime, round.status, round.hasExplicitlyStartedDiscussion]);

  // 4. Auto-save user draft on strategy or rationale changes
  useEffect(() => {
    // Save draft locally to recover seamlessly upon returning
    savePreRaceDraft({
      scenarioId: scenario.id,
      selectedPlanId,
      strategy: customPlan,
      rationale,
      savedAt: new Date().toISOString()
    });
  }, [scenario.id, selectedPlanId, customPlan, rationale]);

  // Determine if round is locked
  const isLocked = isRoundLocked(round) || (activeAttempt?.isCompetitive && activeAttempt.status === 'locked');
  const isDiscussionActive = round.hasExplicitlyStartedDiscussion && round.status === 'active' && secondsRemaining > 0;
  const isDiscussionExpired = round.hasExplicitlyStartedDiscussion && (round.status === 'locked' || secondsRemaining === 0) && !activeAttempt;

  // Active strategy plan being inspected or customized
  const currentPlan: PreRaceStrategyPlan = useMemo(() => {
    if (selectedPlanId === 'custom') return customPlan;
    return scenario.referencePlans.find(p => p.id === selectedPlanId) || scenario.referencePlans[0];
  }, [selectedPlanId, customPlan, scenario.referencePlans]);

  // Validation status of current strategy
  const validation = useMemo(() => {
    return validatePreRaceStrategy(scenario, currentPlan);
  }, [scenario, currentPlan]);

  // Handle Plan Selection ("Use This Plan")
  const handleSelectPlan = (planId: PlanIdentifier) => {
    if (isLocked && activeAttempt) return;
    setSelectedPlanId(planId);
  };

  // Section 1: "Customize Plan" action — Clones reference plan into custom builder, preserving reference plan untouched!
  const handleCustomizePlan = (plan: PreRaceStrategyPlan) => {
    if (isLocked && activeAttempt) return;

    const clonedPlan: PreRaceStrategyPlan = {
      id: 'custom',
      name: `Customized ${plan.name}`,
      label: `${plan.label} (Custom)`,
      pitStopCount: plan.pitStopCount,
      stints: JSON.parse(JSON.stringify(plan.stints)),
      mainAdvantage: plan.mainAdvantage,
      mainRisk: plan.mainRisk,
      idealConditions: plan.idealConditions,
      contingency: plan.contingency || 'Box for fresh tires if Safety Car deploys before Lap 30.'
    };

    setCustomPlan(clonedPlan);
    setSelectedPlanId('custom');
    setShowCustomizer(true);

    setTimeout(() => {
      customizerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Custom Stint Modifiers
  const handleUpdateCustomStintCompound = (stintIdx: number, compound: TireCompound) => {
    setCustomPlan(prev => {
      const updatedStints = [...prev.stints];
      updatedStints[stintIdx] = { ...updatedStints[stintIdx], compound };
      return { ...prev, stints: updatedStints };
    });
  };

  const handleUpdateCustomStintLaps = (stintIdx: number, newLaps: number) => {
    setCustomPlan(prev => {
      const updatedStints = [...prev.stints];
      const boundedLaps = Math.max(1, newLaps);
      updatedStints[stintIdx] = { ...updatedStints[stintIdx], laps: boundedLaps };

      // Recompute startLap and endLap
      let lapPtr = 1;
      for (let i = 0; i < updatedStints.length; i++) {
        updatedStints[i].startLap = lapPtr;
        updatedStints[i].endLap = lapPtr + updatedStints[i].laps - 1;
        lapPtr = updatedStints[i].endLap + 1;
      }

      return { ...prev, stints: updatedStints };
    });
  };

  const handleSetCustomPitStops = (stopCount: number) => {
    setCustomPlan(prev => {
      const numStints = stopCount + 1;
      const baseLapsPerStint = Math.floor(scenario.totalLaps / numStints);
      const remainder = scenario.totalLaps % numStints;

      const newStints: typeof prev.stints = [];
      let lapPtr = 1;

      for (let i = 0; i < numStints; i++) {
        const stintLaps = baseLapsPerStint + (i === numStints - 1 ? remainder : 0);
        const compound = i === 0 ? 'medium' : i === 1 ? 'hard' : 'soft';
        newStints.push({
          stintNumber: i + 1,
          compound: scenario.availableCompounds.includes(compound) ? compound : scenario.availableCompounds[0],
          startLap: lapPtr,
          endLap: lapPtr + stintLaps - 1,
          laps: stintLaps
        });
        lapPtr += stintLaps;
      }

      return {
        ...prev,
        pitStopCount: stopCount,
        stints: newStints,
        label: `${newStints.map(s => s.compound.toUpperCase()).join(' → ')} (${stopCount}-Stop)`
      };
    });
  };

  // Handle Community Vote
  const handleVote = (planId: PlanIdentifier) => {
    const res = castPreRaceVote({
      roundId: round.roundId,
      userId: user?.userId || 'guest_voter',
      planId
    });
    setVotePercentages(res.percentages);
  };

  // Handle Discussion Comment Post
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComm = postPreRaceDiscussionComment({
      roundId: round.roundId,
      userId: user?.userId || 'guest_user',
      username: user?.username || 'PitWallStrategist',
      displayName: user?.displayName || user?.username || 'Strategist',
      avatarUrl: user?.avatarUrl,
      comment: commentInput,
      planPreference: selectedPlanId
    });

    setComments(prev => [newComm, ...prev]);
    setCommentInput('');
  };

  // Option A: Lock My Strategy
  const handleLockMyStrategy = async (competitive: boolean) => {
    if (!validation.isValid) {
      setErrorMessage(validation.errors[0] || 'Please fix invalid strategy settings.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setShowCommitDecisionModal(false);

    try {
      const planToCommit: PreRaceStrategyPlan = {
        ...currentPlan,
        rationale: rationale.trim() || undefined
      };

      const result = await commitPreRaceStrategy({
        scenarioId: scenario.id,
        roundId: round.roundId,
        userId: user?.userId || 'guest_user',
        username: user?.username || 'GuestStrategist',
        displayName: user?.displayName || user?.username || 'Strategist',
        isCompetitive: competitive,
        selectedPlanId,
        strategy: planToCommit,
        rationale: rationale.trim(),
        userProfile: {
          avatarUrl: user?.avatarUrl,
          favouriteConstructor: user?.favouriteConstructor
        }
      });

      setActiveAttempt(result.attempt);
      setOutcome(result.outcome);

      // Scroll smoothly down to simulation outcome
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error simulating strategy.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option B: Discuss with Friends
  const handleStartDiscussionFlow = () => {
    // Explicitly create/start timed discussion round
    const newRound = startPreRaceDiscussionRound(scenario.id, discussionDuration);
    setRound(newRound);
    setShowCommitDecisionModal(false);

    // Persist current strategy draft & rationale
    savePreRaceDraft({
      scenarioId: scenario.id,
      selectedPlanId,
      strategy: customPlan,
      rationale,
      savedAt: new Date().toISOString()
    });

    // Open shareable strategy card
    setShowPreviewModal(true);
  };

  // Sharing Actions
  const handleCopySummary = () => {
    const summary = generateShareableStrategySummary(scenario, currentPlan, rationale.trim(), outcome || undefined);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setShareSuccessMessage('Strategy summary copied to clipboard!');
      setTimeout(() => setShareSuccessMessage(null), 3000);
    }
  };

  const handleNativeShare = async () => {
    const summary = generateShareableStrategySummary(scenario, currentPlan, rationale.trim(), outcome || undefined);
    const shareData = {
      title: `THE GRDX Strategy — ${scenario.title}`,
      text: summary,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or fallback
      }
    } else {
      handleCopySummary();
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccessMessage('Scenario link copied to clipboard!');
      setTimeout(() => setShareSuccessMessage(null), 3000);
    }
  };

  // Format countdown string MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="cockpit-page" style={{ minHeight: '100vh', backgroundColor: 'var(--background, #08090C)' }}>
      {/* =========================================================================
          TOP COCKPIT HEADER BAR
          ========================================================================= */}
      <div className="cockpit-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', backgroundColor: 'var(--surface, #11131A)', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/strategy" className="cockpit-back-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted, #848B96)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
            <ArrowLeft size={14} />
            <span>Strategy Hub</span>
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: 'rgba(255, 85, 0, 0.15)', color: 'var(--flame-orange, #FF5500)', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.08em', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
              SIMULATED RACE
            </span>
            <span style={{ fontFamily: "var(--font-brand, 'Orbitron', sans-serif)", fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>
              {scenario.title}
            </span>
            <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.8rem' }}>
              ({scenario.circuitName})
            </span>
          </div>
        </div>

        {/* Right: Discussion Countdown & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Discussion Countdown Indicator (Shown ONLY if explicitly started) */}
          {round.hasExplicitlyStartedDiscussion ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: isLocked ? 'rgba(255, 48, 37, 0.15)' : 'rgba(0, 230, 118, 0.12)',
              border: `1px solid ${isLocked ? 'rgba(255, 48, 37, 0.35)' : 'rgba(0, 230, 118, 0.35)'}`
            }}>
              <Clock size={13} style={{ color: isLocked ? '#FF3025' : '#00e676' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: isLocked ? '#FF3025' : '#00e676', fontWeight: 700, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
                  {isLocked ? 'Discussion Closed' : 'Discussion Countdown'}
                </span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {isLocked ? '00:00 (LOCKED)' : timeFormatted}
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted, #848B96)',
              fontSize: '0.7rem'
            }}>
              <Clock size={12} />
              <span>Discussion Timer: Inactive</span>
            </div>
          )}

          {/* Mode Switcher */}
          {!activeAttempt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.2rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setIsCompetitive(true)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isCompetitive ? 'var(--flame-orange, #FF5500)' : 'transparent',
                  color: isCompetitive ? '#FFFFFF' : 'var(--text-muted, #848B96)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
                }}
              >
                <Trophy size={11} />
                <span>Competitive</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCompetitive(false)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: !isCompetitive ? '#00e5ff' : 'transparent',
                  color: !isCompetitive ? '#000000' : 'var(--text-muted, #848B96)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
                }}
              >
                <Sliders size={11} />
                <span>Practice</span>
              </button>
            </div>
          )}

          {/* Preview & Share Strategy Button */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="cockpit-preview-share-btn"
            title="Preview & Share Strategy Card"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              backgroundColor: 'rgba(0, 229, 255, 0.1)',
              color: '#00e5ff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
            }}
          >
            <Share2 size={13} />
            <span>Preview & Share</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* =========================================================================
            SECTION 1: SIMULATED RACE BRIEFING & BASELINE BENCHMARK
            ========================================================================= */}
        <div style={{ backgroundColor: 'var(--surface, #11131A)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Flag size={18} style={{ color: 'var(--flame-orange, #FF5500)' }} />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Simulated Race Briefing: {scenario.circuitName}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCircuitDetails(!showCircuitDetails)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted, #848B96)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
            >
              <span>{showCircuitDetails ? 'Hide Telemetry' : 'Show Full Telemetry'}</span>
              {showCircuitDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting Grid</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00e5ff', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)" }}>
                P{scenario.startingPosition}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Race Distance</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)" }}>
                {scenario.totalLaps} Laps
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pit Lane Loss</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFB000', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)" }}>
                {scenario.pitLossSeconds}s
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weather & Track</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                {scenario.trackCondition.toUpperCase()} ({scenario.trackTempCelsius}°C)
              </div>
            </div>
          </div>

          {/* Expandable Telemetry Details */}
          {showCircuitDetails && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--flame-orange, #FF5500)', textTransform: 'uppercase' }}>Circuit Dynamics</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', margin: '0.3rem 0 0 0', lineHeight: 1.4 }}>
                  {scenario.circuitCharacteristics}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', margin: '0.4rem 0 0 0' }}>
                  <strong>Special Conditions:</strong> {scenario.specialConditions}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase' }}>Tire Degradation Curves</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                  {scenario.availableCompounds.map(comp => (
                    <div key={comp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ textTransform: 'uppercase', color: TIRE_COLORS[comp].bg, fontWeight: 700 }}>
                        {comp}:
                      </span>
                      <span style={{ color: 'var(--text-muted, #848B96)' }}>
                        +{scenario.tireDegradationSecondsPerLap[comp]}s/lap | Cliff at Lap {scenario.tireCliffLap[comp]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFB000', textTransform: 'uppercase' }}>Rival & Competitor Intel</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', margin: '0.3rem 0 0 0', lineHeight: 1.4 }}>
                  {scenario.rivalBehaviorNotes}
                </p>
              </div>
            </div>
          )}

          {/* Reproducible Baseline Reference Card */}
          <div style={{
            backgroundColor: 'rgba(255, 85, 0, 0.05)',
            border: '1px solid rgba(255, 85, 0, 0.3)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255, 85, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--flame-orange, #FF5500)' }}>
                <Info size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--flame-orange, #FF5500)', letterSpacing: '0.05em' }}>
                  Baseline Reference Benchmark (Immutable Benchmark)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>
                  Baseline Strategy: {scenario.baselineOutcome.strategyDescription}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Baseline Finish</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)" }}>
                  P{scenario.baselineOutcome.finishingPosition}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Baseline Race Time</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "var(--font-mono, monospace)" }}>
                  {scenario.baselineOutcome.formattedTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: IMPROVED PLANS A, B, C CARDS
            ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: '#00e5ff' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, textTransform: 'uppercase' }}>
                Tactical Plans A, B, and C
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
              Select a reference plan or click "Customize Plan" to adapt it as your personal strategy
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {scenario.referencePlans.map(plan => {
              const isSelected = selectedPlanId === plan.id;
              const voteShare = votePercentages[plan.id] || 0;
              const startingTire = plan.stints[0]?.compound || 'medium';
              const pitWindow = plan.pitStopCount > 0 ? `Lap ${plan.stints[0].endLap}` : 'None';

              return (
                <div
                  key={plan.id}
                  style={{
                    backgroundColor: isSelected ? 'var(--surface-raised, #171A24)' : 'var(--surface, #11131A)',
                    border: `2px solid ${isSelected ? 'var(--flame-orange, #FF5500)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                    borderRadius: '12px',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 15px rgba(255, 85, 0, 0.2)' : 'none'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                        fontWeight: 700,
                        color: isSelected ? 'var(--flame-orange, #FF5500)' : '#FFFFFF',
                        textTransform: 'uppercase'
                      }}>
                        {plan.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      color: 'var(--text-muted, #848B96)',
                      fontWeight: 700
                    }}>
                      {plan.pitStopCount}-Stop ({plan.stints.length} Stints)
                    </span>
                  </div>

                  {/* Starting Tire Badge & Pit Window */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ color: 'var(--text-muted, #848B96)' }}>Start:</span>
                      <span style={{ fontWeight: 800, color: TIRE_COLORS[startingTire].bg }}>
                        {startingTire.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span style={{ color: 'var(--text-muted, #848B96)' }}>Pit Window:</span>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{pitWindow}</span>
                    </div>
                  </div>

                  {/* Stint Sequence Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {plan.stints.map((stint, sIdx) => (
                      <React.Fragment key={sIdx}>
                        {sIdx > 0 && <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.75rem' }}>➔</span>}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          border: `1px solid ${TIRE_COLORS[stint.compound].bg}`,
                          padding: '0.2rem 0.45rem',
                          borderRadius: '6px'
                        }}>
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: TIRE_COLORS[stint.compound].bg
                          }} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {stint.compound.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)' }}>
                            ({stint.laps}L)
                          </span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Advantage, Risk & Suitable Conditions */}
                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', lineHeight: 1.35, backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '0.65rem', borderRadius: '6px' }}>
                    <div style={{ color: '#00e676' }}>
                      <strong>Advantage:</strong> {plan.mainAdvantage}
                    </div>
                    <div style={{ color: '#FF7A00' }}>
                      <strong>Risk:</strong> {plan.mainRisk}
                    </div>
                    <div style={{ color: 'var(--text-secondary, #D1D5DB)' }}>
                      <strong>Suitable for:</strong> {plan.idealConditions}
                    </div>
                  </div>

                  {/* Community Preference Bar */}
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted, #848B96)' }}>Community Preference:</span>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{voteShare}%</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${voteShare}%`, height: '100%', backgroundColor: isSelected ? 'var(--flame-orange, #FF5500)' : '#00e5ff' }} />
                    </div>
                  </div>

                  {/* Action Buttons: "Use This Plan" AND "Customize Plan" */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan.id)}
                      style={{
                        padding: '0.45rem 0.5rem',
                        borderRadius: '6px',
                        border: isSelected ? '1px solid var(--flame-orange, #FF5500)' : '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: isSelected ? 'var(--flame-orange, #FF5500)' : 'var(--surface-raised, #171A24)',
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{isSelected ? 'Active Plan' : 'Use This Plan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCustomizePlan(plan)}
                      style={{
                        padding: '0.45rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        backgroundColor: 'rgba(0, 229, 255, 0.08)',
                        color: '#00e5ff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Sliders size={12} />
                      <span>Customize Plan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: STRATEGY CUSTOMIZATION PANEL (Expandable / Inline)
            ========================================================================= */}
        <div
          ref={customizerRef}
          style={{
            backgroundColor: 'var(--surface, #11131A)',
            border: `2px solid ${selectedPlanId === 'custom' ? '#00e5ff' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
            borderRadius: '12px',
            padding: '1.25rem',
            transition: 'border-color 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sliders size={18} style={{ color: '#00e5ff' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, textTransform: 'uppercase' }}>
                  Strategy Customization
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                  Modify your starting tire, pit stop lap, and stint lengths without altering the reference plans.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanId('custom');
                  setShowCustomizer(true);
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedPlanId === 'custom' ? '#00e5ff' : 'var(--surface-raised, #171A24)',
                  color: selectedPlanId === 'custom' ? '#000000' : '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
                }}
              >
                {selectedPlanId === 'custom' ? '✓ Custom Plan Selected' : 'Select Custom Plan'}
              </button>
            </div>
          </div>

          {/* Custom Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Pit Stop Target Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #848B96)', fontWeight: 600 }}>
                Pit Stop Strategy:
              </span>
              {[1, 2, 3].map(stops => (
                <button
                  key={stops}
                  type="button"
                  onClick={() => handleSetCustomPitStops(stops)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${customPlan.pitStopCount === stops ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: customPlan.pitStopCount === stops ? 'rgba(0, 229, 255, 0.15)' : 'var(--surface-raised, #171A24)',
                    color: customPlan.pitStopCount === stops ? '#00e5ff' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {stops}-Stop ({stops + 1} Stints)
                </button>
              ))}

              <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: customPlan.stints.reduce((s, st) => s + st.laps, 0) === scenario.totalLaps ? '#00e676' : '#FF3025', fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                Stint Laps Total: {customPlan.stints.reduce((s, st) => s + st.laps, 0)} / {scenario.totalLaps} Laps
              </div>
            </div>

            {/* Stint-by-Stint Editors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {customPlan.stints.map((stint, idx) => (
                <div key={idx} style={{ backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>
                      Stint {idx + 1} (Laps {stint.startLap} - {stint.endLap})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: TIRE_COLORS[stint.compound].bg, fontWeight: 700 }}>
                      {stint.compound.toUpperCase()}
                    </span>
                  </div>

                  {/* Compound Selection */}
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {scenario.availableCompounds.map(comp => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => handleUpdateCustomStintCompound(idx, comp)}
                        style={{
                          flex: 1,
                          padding: '0.25rem 0',
                          borderRadius: '4px',
                          border: `1px solid ${stint.compound === comp ? TIRE_COLORS[comp].bg : 'rgba(255, 255, 255, 0.1)'}`,
                          backgroundColor: stint.compound === comp ? TIRE_COLORS[comp].bg : 'transparent',
                          color: stint.compound === comp ? TIRE_COLORS[comp].text : '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {comp.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Lap Adjuster */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateCustomStintLaps(idx, stint.laps - 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'transparent', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={stint.laps}
                      onChange={(e) => handleUpdateCustomStintLaps(idx, parseInt(e.target.value) || 1)}
                      style={{ flex: 1, textAlign: 'center', backgroundColor: '#000000', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '4px', color: '#FFFFFF', padding: '0.25rem', fontFamily: "var(--font-mono, monospace)", fontWeight: 700 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateCustomStintLaps(idx, stint.laps + 1)}
                      style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'transparent', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Contingency Choice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontWeight: 600 }}>
                Contingency Trigger:
              </span>
              <select
                value={customPlan.contingency || ''}
                onChange={(e) => setCustomPlan(prev => ({ ...prev, contingency: e.target.value }))}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.65rem',
                  backgroundColor: 'var(--surface-raised, #171A24)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '0.75rem'
                }}
              >
                <option value="Box for fresh tires if Safety Car deploys before Lap 30.">
                  Box for fresh tires if Safety Car deploys before Lap 30
                </option>
                <option value="Extend stint by 4 laps if track temperatures drop below 28°C.">
                  Extend stint by 4 laps if track temperatures drop below 28°C
                </option>
                <option value="Switch to 2-stop aggressive undercut if stuck in DRS train behind P5.">
                  Switch to 2-stop aggressive undercut if stuck in DRS train behind P5
                </option>
                <option value="Commit strictly to planned pit window regardless of competitor pit calls.">
                  Commit strictly to planned pit window regardless of competitor pit calls
                </option>
              </select>
            </div>

            {/* Validation Error Alert */}
            {!validation.isValid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 48, 37, 0.12)', border: '1px solid rgba(255, 48, 37, 0.35)', padding: '0.6rem 0.85rem', borderRadius: '6px', color: '#FF3025', fontSize: '0.75rem' }}>
                <AlertTriangle size={14} />
                <span>{validation.errors[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: STRATEGY RATIONALE TEXT AREA (500-Character Limit)
            ========================================================================= */}
        <div style={{ backgroundColor: 'var(--surface, #11131A)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={16} style={{ color: 'var(--flame-orange, #FF5500)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, textTransform: 'uppercase', color: '#FFFFFF' }}>
                Why did you choose this strategy?
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: "var(--font-mono, monospace)", color: rationale.length > 450 ? '#FF3025' : 'var(--text-muted, #848B96)' }}>
              {rationale.length} / 500
            </span>
          </div>

          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
            Explain what influenced your decision, what you expect to happen, and which risks you are willing to take.
          </p>

          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value.slice(0, 500))}
            placeholder="I'm choosing this strategy because the starting tire should give me an early advantage. I'm accepting the risk of higher degradation to gain track position before the first pit stop…"
            rows={3}
            disabled={isLocked && Boolean(activeAttempt)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--surface-raised, #171A24)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              lineHeight: 1.45,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* =========================================================================
            SECTION 5: PRIMARY ACTION BAR / COMMITMENT GATEWAY
            ========================================================================= */}
        <div style={{ backgroundColor: 'var(--surface, #11131A)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
              Selected Strategy: {currentPlan.name} ({currentPlan.label})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
              {isCompetitive
                ? 'Competitive Run: Once locked, simulation calculates authoritative points.'
                : 'Practice Run: Test variations freely without locking competitive points.'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {errorMessage && (
              <span style={{ fontSize: '0.75rem', color: '#FF3025' }}>{errorMessage}</span>
            )}

            {isLocked && activeAttempt ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(0, 230, 118, 0.12)', border: '1px solid rgba(0, 230, 118, 0.35)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#00e676', fontSize: '0.8rem', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>Strategy Locked & Completed</span>
              </div>
            ) : isDiscussionExpired ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 48, 37, 0.12)', border: '1px solid rgba(255, 48, 37, 0.35)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#FF3025', fontSize: '0.8rem', fontWeight: 700 }}>
                <AlertTriangle size={16} />
                <span>Discussion Expired — Run Practice Mode</span>
              </div>
            ) : (
              <>
                {/* Preview & Share Button */}
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'var(--surface-raised, #171A24)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
                  }}
                >
                  <Share2 size={14} />
                  <span>Preview & Share Card</span>
                </button>

                {/* Open Decision Modal: "Lock My Strategy" or "Discuss with Friends" */}
                <button
                  type="button"
                  onClick={() => setShowCommitDecisionModal(true)}
                  disabled={isSubmitting || !validation.isValid}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--flame-orange, #FF5500)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: validation.isValid ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <Flame size={15} />
                  <span>{isDiscussionActive ? 'Lock In Strategy' : 'Lock or Discuss...'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 6: PEER DISCUSSION EXCHANGE (Active when user enters discussion)
            ========================================================================= */}
        {round.hasExplicitlyStartedDiscussion && (
          <div style={{ backgroundColor: 'var(--surface, #11131A)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} style={{ color: '#00e5ff' }} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, textTransform: 'uppercase' }}>
                  Live Discussion Round ({comments.length} Strategist Notes)
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: isDiscussionActive ? '#00e676' : '#FF3025', fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                {isDiscussionActive ? `Time Remaining: ${timeFormatted}` : 'Discussion Expired'}
              </span>
            </div>

            {/* Comment submission form */}
            {isDiscussionActive && (
              <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder={`Share tactical feedback on ${currentPlan.name}...`}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    backgroundColor: 'var(--surface-raised, #171A24)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: 'var(--flame-orange, #FF5500)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: commentInput.trim() ? 'pointer' : 'not-allowed',
                    opacity: commentInput.trim() ? 1 : 0.6,
                    fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
                  }}
                >
                  Post Note
                </button>
              </form>
            )}

            {/* Comment list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto' }}>
              {comments.map(c => (
                <div key={c.commentId} style={{ backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{c.displayName}</span>
                      {c.planPreference && (
                        <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255, 85, 0, 0.15)', color: 'var(--flame-orange, #FF5500)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                          {c.planPreference.toUpperCase().replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)' }}>
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.35 }}>
                    {c.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 8: SIMULATION RESULTS & RISK ANALYSIS (Post-Commitment)
            ========================================================================= */}
        {outcome && (
          <div ref={resultsRef} style={{ backgroundColor: 'var(--surface, #11131A)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={22} style={{ color: outcome.ratingTier.color }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)", fontWeight: 800, color: '#FFFFFF' }}>
                    Simulated Race Outcome & Risk Analysis
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                    Strategy: {currentPlan.name} ({currentPlan.pitStopCount}-Stop)
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '4px', fontFamily: "var(--font-mono, monospace)" }}>
                  Deterministic Engine v1.0
                </span>
              </div>
            </div>

            {/* 8.A: Race Outcome Head-to-Head Comparison Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', backgroundColor: 'var(--surface-raised, #171A24)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Finishing Position</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)", marginTop: '0.2rem' }}>
                  Baseline P{outcome.baselineFinishingPosition} → <span style={{ color: outcome.positionDelta >= 0 ? '#00e676' : '#FF3025' }}>P{outcome.simulatedFinishingPosition}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: outcome.positionDelta >= 0 ? '#00e676' : '#FF3025', fontWeight: 700 }}>
                  {outcome.positionDelta > 0 ? `+${outcome.positionDelta} Positions Gained` : outcome.positionDelta < 0 ? `${outcome.positionDelta} Positions Lost` : 'Maintained Baseline Position'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Total Race Time Delta</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', fontFamily: "var(--font-mono, monospace)", marginTop: '0.2rem' }}>
                  {outcome.timeDeltaSeconds <= 0 ? `${outcome.timeDeltaSeconds}s` : `+${outcome.timeDeltaSeconds}s`}
                </div>
                <span style={{ fontSize: '0.75rem', color: outcome.timeDeltaSeconds <= 0 ? '#00e676' : '#FF3025', fontWeight: 700 }}>
                  Simulated: {outcome.formattedSimulatedTime} (vs Baseline: {scenario.baselineOutcome.formattedTime})
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Strategy Room Score</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: outcome.ratingTier.color, fontFamily: "var(--font-brand, 'Orbitron', sans-serif)", marginTop: '0.2rem' }}>
                  {outcome.scoreBreakdown.finalScore} / 100
                </div>
                <span style={{ fontSize: '0.75rem', color: outcome.ratingTier.color, fontWeight: 700 }}>
                  {outcome.ratingTier.name} ({currentPlan.pitStopCount} Pit Stop{currentPlan.pitStopCount !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Score Breakdown (50% Quality, 30% Outcome, 20% Efficiency) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)' }}>Decision Quality (50%)</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {outcome.scoreBreakdown.decisionQualityScore} / 50 pts
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)' }}>Race Outcome (30%)</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {outcome.scoreBreakdown.raceOutcomeScore} / 30 pts
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)' }}>Strategy Efficiency (20%)</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {outcome.scoreBreakdown.strategyEfficiencyScore} / 20 pts
                </div>
              </div>
            </div>

            {/* 8.B: What Influenced Your Result? (Modeled Factors Only) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sliders size={16} style={{ color: '#00e5ff' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, textTransform: 'uppercase', color: '#FFFFFF' }}>
                  What Influenced Your Result? (Modeled Physical Factors)
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {(outcome.influencingFactors || []).map((factor, fIdx) => {
                  const isHelped = factor.impact === 'helped';
                  const isHurt = factor.impact === 'hurt';
                  const badgeColor = isHelped ? '#00e676' : isHurt ? '#FF3025' : '#848B96';
                  const badgeBg = isHelped ? 'rgba(0, 230, 118, 0.15)' : isHurt ? 'rgba(255, 48, 37, 0.15)' : 'rgba(255, 255, 255, 0.08)';

                  return (
                    <div
                      key={fIdx}
                      style={{
                        backgroundColor: 'var(--surface-raised, #171A24)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {factor.factorName}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: badgeColor,
                          backgroundColor: badgeBg,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {factor.impact}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #D1D5DB)' }}>
                        <strong>Decision:</strong> {factor.decisionMade}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                        <strong>Trade-off:</strong> {factor.expectedTradeoff}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: badgeColor, fontWeight: 600 }}>
                        <strong>Calculated Effect:</strong> {factor.calculatedEffect}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 8.C: Risk Assessment Card */}
            {outcome.riskAssessment && (
              <div style={{
                backgroundColor: 'rgba(255, 85, 0, 0.05)',
                border: '1px solid rgba(255, 85, 0, 0.25)',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--flame-orange, #FF5500)' }} />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, textTransform: 'uppercase', color: 'var(--flame-orange, #FF5500)' }}>
                      Risk Assessment
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: outcome.riskAssessment.didRiskMaterialize ? 'rgba(255, 48, 37, 0.2)' : 'rgba(0, 230, 118, 0.2)',
                    color: outcome.riskAssessment.didRiskMaterialize ? '#FF3025' : '#00e676'
                  }}>
                    {outcome.riskAssessment.didRiskMaterialize ? 'Risk Materialized in Simulation' : 'Risk Successfully Mitigated'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#FFFFFF', lineHeight: 1.4 }}>
                  <strong>Main Risk Accepted:</strong> {outcome.riskAssessment.mainRiskAccepted}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
                  <strong>Scenario Context:</strong> {outcome.riskAssessment.riskContext}
                </div>
                <div style={{ fontSize: '0.75rem', color: outcome.riskAssessment.didRiskMaterialize ? '#FF3025' : '#00e676', fontWeight: 600 }}>
                  <strong>Consequence:</strong> {outcome.riskAssessment.calculatedConsequence}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#00e5ff', marginTop: '0.25rem' }}>
                  <strong>Mitigating Alternative:</strong> {outcome.riskAssessment.alternativeDecision}
                </div>
              </div>
            )}

            {/* 8.D: Strategy Debrief (What Worked / What Did Not Work) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.05)', border: '1px solid rgba(0, 230, 118, 0.2)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00e676', textTransform: 'uppercase' }}>
                  What Worked
                </span>
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
                  {(outcome.whatWorked || outcome.keyAdvantages || []).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: 'rgba(255, 48, 37, 0.05)', border: '1px solid rgba(255, 48, 37, 0.2)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF3025', textTransform: 'uppercase' }}>
                  What Did Not Work
                </span>
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
                  {(outcome.whatDidNotWork || outcome.keyDisadvantages || []).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Motorsport Lessons */}
            <div style={{ backgroundColor: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase' }}>
                Actionable Motorsport Lessons
              </span>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#FFFFFF', lineHeight: 1.4 }}>
                {outcome.actionableLessons.join(' ')}
              </p>
            </div>

            {/* 8.E: Next Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'var(--surface-raised, #171A24)',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Share2 size={13} />
                <span>Review & Share Strategy Card</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAttempt(null);
                    setOutcome(null);
                    setIsCompetitive(false); // Practice mode for re-tries
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    color: '#00e5ff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Try Another Strategy (Practice Mode)</span>
                </button>

                <Link
                  to="/strategy"
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-raised, #171A24)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span>Strategy Room Hub</span>
                </Link>

                <Link
                  to="/strategy"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--flame-orange, #FF5500)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                    textTransform: 'uppercase'
                  }}
                >
                  <Trophy size={13} />
                  <span>View Leaderboard</span>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: POLISHED SHAREABLE STRATEGY DATA CARD
          ========================================================================= */}
      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--surface, #11131A)',
            border: '2px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
            borderRadius: '16px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} style={{ color: 'var(--flame-orange, #FF5500)' }} />
                <span style={{ fontFamily: "var(--font-brand, 'Orbitron', sans-serif)", fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', color: '#FFFFFF' }}>
                  THE GRDX
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
                <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255, 85, 0, 0.15)', color: 'var(--flame-orange, #FF5500)', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px', letterSpacing: '0.06em' }}>
                  SIMULATED RACE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted, #848B96)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Strategy Card Body */}
            <div style={{ backgroundColor: 'var(--surface-raised, #171A24)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scenario & Circuit
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
                  {scenario.title} — {scenario.circuitName}
                </div>
              </div>

              {/* Strategy Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Strategy Name</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#00e5ff' }}>
                    {currentPlan.name}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Pit Stops</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {currentPlan.pitStopCount}-Stop ({currentPlan.stints.length} Stints)
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Starting Tire</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: TIRE_COLORS[currentPlan.stints[0]?.compound || 'medium'].bg }}>
                    {(currentPlan.stints[0]?.compound || 'medium').toUpperCase()}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Planned Pit Window</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {currentPlan.pitStopCount > 0 ? `Lap ${currentPlan.stints[0].endLap}` : 'None'}
                  </div>
                </div>
              </div>

              {/* Stint Sequence */}
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase' }}>Tire Compound Plan</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                  {currentPlan.stints.map((stint, sIdx) => (
                    <React.Fragment key={sIdx}>
                      {sIdx > 0 && <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.75rem' }}>➔</span>}
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: TIRE_COLORS[stint.compound].bg,
                        color: TIRE_COLORS[stint.compound].text
                      }}>
                        {stint.compound.toUpperCase()} ({stint.laps}L: L{stint.startLap}-L{stint.endLap})
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Strategic Reasoning */}
              <div style={{ backgroundColor: 'rgba(255, 85, 0, 0.05)', border: '1px solid rgba(255, 85, 0, 0.2)', padding: '0.85rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
                <div>
                  <strong style={{ color: 'var(--flame-orange, #FF5500)' }}>Why I Chose It:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#FFFFFF', lineHeight: 1.4, fontStyle: rationale ? 'normal' : 'italic' }}>
                    {rationale.trim() || 'Focusing on clean air pace and optimal tire degradation management.'}
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#00e676' }}>Expected Advantage:</strong>
                  <span style={{ color: 'var(--text-secondary, #D1D5DB)', marginLeft: '0.3rem' }}>{currentPlan.mainAdvantage}</span>
                </div>
                <div>
                  <strong style={{ color: '#FF7A00' }}>Main Risk:</strong>
                  <span style={{ color: 'var(--text-secondary, #D1D5DB)', marginLeft: '0.3rem' }}>{currentPlan.mainRisk}</span>
                </div>
                {currentPlan.contingency && (
                  <div>
                    <strong style={{ color: '#00e5ff' }}>Contingency:</strong>
                    <span style={{ color: 'var(--text-secondary, #D1D5DB)', marginLeft: '0.3rem' }}>{currentPlan.contingency}</span>
                  </div>
                )}
              </div>

              {/* Baseline Reference Benchmark */}
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                <strong>Baseline Reference (Benchmark, not guaranteed prediction):</strong>
                <div style={{ color: 'var(--text-secondary, #D1D5DB)', marginTop: '0.2rem' }}>
                  {scenario.baselineOutcome.strategyDescription} | Baseline Finish: P{scenario.baselineOutcome.finishingPosition} ({scenario.baselineOutcome.formattedTime})
                </div>
              </div>

              {/* If outcome is available */}
              {outcome && (
                <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.25)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#00e676' }}>Simulated Outcome:</strong>
                  <div style={{ color: '#FFFFFF', marginTop: '0.2rem', fontWeight: 700 }}>
                    Baseline P{outcome.baselineFinishingPosition} ➔ Simulated P{outcome.simulatedFinishingPosition} ({outcome.timeDeltaSeconds <= 0 ? `${outcome.timeDeltaSeconds}s` : `+${outcome.timeDeltaSeconds}s`})
                  </div>
                  <div style={{ color: outcome.ratingTier.color, fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    Score: {outcome.scoreBreakdown.finalScore}/100 [{outcome.ratingTier.name}]
                  </div>
                </div>
              )}

              {/* Card Footer Statement */}
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                THE GRDX Simulated Motorsport Strategy Challenge. The final outcome depends on the scenario's simulation rules.
              </div>
            </div>

            {/* Sharing Feedback Banner */}
            {shareSuccessMessage && (
              <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.35)', color: '#00e676', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                {shareSuccessMessage}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'var(--surface-raised, #171A24)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Copy size={13} />
                  <span>Copy Summary</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    color: '#00e5ff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'var(--surface-raised, #171A24)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Copy Link</span>
                </button>
              </div>

              {!activeAttempt && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setShowCommitDecisionModal(true);
                  }}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--flame-orange, #FF5500)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                    textTransform: 'uppercase'
                  }}
                >
                  Proceed to Lock or Discuss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: COMMITMENT DECISION GATEWAY ("Lock My Strategy" vs "Discuss with Friends")
          ========================================================================= */}
      {showCommitDecisionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--surface, #11131A)',
            border: '2px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} style={{ color: 'var(--flame-orange, #FF5500)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)", fontWeight: 800, color: '#FFFFFF' }}>
                  Commitment Choice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCommitDecisionModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted, #848B96)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.4 }}>
              Choose whether to lock in your strategy immediately and run the simulation, or start a timed discussion round to gather feedback from friends before committing.
            </p>

            {/* Two Distinct Decision Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {/* Option A: Lock My Strategy */}
              <div style={{
                backgroundColor: 'var(--surface-raised, #171A24)',
                border: '1px solid rgba(255, 85, 0, 0.3)',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--flame-orange, #FF5500)' }}>
                  <Lock size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", textTransform: 'uppercase' }}>
                    Option A — Lock My Strategy
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', lineHeight: 1.4 }}>
                  Commit to this strategy and run the simulated race using your current decisions.
                </p>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #D1D5DB)' }}>
                  • Locks competitive submission<br />
                  • Runs deterministic physics simulation<br />
                  • Reveals position delta and risk breakdown
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleLockMyStrategy(isCompetitive)}
                    disabled={isSubmitting || !validation.isValid}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'var(--flame-orange, #FF5500)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {isSubmitting ? 'Simulating...' : 'Lock My Strategy'}
                  </button>
                </div>
              </div>

              {/* Option B: Discuss with Friends */}
              <div style={{
                backgroundColor: 'var(--surface-raised, #171A24)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00e5ff' }}>
                  <Users size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", textTransform: 'uppercase' }}>
                    Option B — Discuss with Friends
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', lineHeight: 1.4 }}>
                  Share your strategy, get feedback, and return before the timer expires to lock in your final choice.
                </p>

                {/* Duration Picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted, #848B96)' }}>Timer Duration:</span>
                  <button
                    type="button"
                    onClick={() => setDiscussionDuration(15)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: `1px solid ${discussionDuration === 15 ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)'}`,
                      backgroundColor: discussionDuration === 15 ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                      color: discussionDuration === 15 ? '#00e5ff' : '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    15 Min (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscussionDuration(10)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: `1px solid ${discussionDuration === 10 ? '#00e5ff' : 'rgba(255, 255, 255, 0.1)'}`,
                      backgroundColor: discussionDuration === 10 ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                      color: discussionDuration === 10 ? '#00e5ff' : '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    10 Min
                  </button>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #D1D5DB)' }}>
                  • Starts timer only after this click<br />
                  • Saves uncommitted draft & rationale<br />
                  • Return anytime before deadline to lock
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleStartDiscussionFlow}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 229, 255, 0.5)',
                      backgroundColor: 'rgba(0, 229, 255, 0.15)',
                      color: '#00e5ff',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Discuss with Friends
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

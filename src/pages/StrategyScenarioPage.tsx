import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  StrategyScenario,
  StrategyAttempt,
  StrategyScoreReport
} from '../types/strategy';
import {
  getStrategyScenario,
  startStrategyAttempt,
  submitStrategyDecision,
  completeStrategyAttempt
} from '../services/strategy/strategyService';
import { useAuth } from '../context/AuthContext';
import { RaceStatePanel } from '../components/strategy/RaceStatePanel';
import { TireStatusPanel } from '../components/strategy/TireStatusPanel';
import { DecisionPanel } from '../components/strategy/DecisionPanel';
import { StrategyDebriefModal } from '../components/strategy/StrategyDebriefModal';
import { Sliders, ArrowLeft, RotateCcw, Shield, Trophy } from 'lucide-react';
import { getPreRaceScenarioById } from '../services/strategy/preRaceScenarioRegistry';
import { PreRaceCockpit } from '../components/strategy/PreRaceCockpit';

export const StrategyScenarioPage: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const user = currentUser;

  // Check if scenarioId corresponds to a Pre-Race Strategy Scenario
  const preRaceScenario = scenarioId ? getPreRaceScenarioById(scenarioId) : null;
  if (preRaceScenario) {
    return <PreRaceCockpit scenario={preRaceScenario} />;
  }

  const [scenario, setScenario] = useState<StrategyScenario | null>(null);
  const [attempt, setAttempt] = useState<StrategyAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompetitive, setIsCompetitive] = useState(true);
  const [scoreReport, setScoreReport] = useState<StrategyScoreReport | null>(null);
  const [leaderboardRankings, setLeaderboardRankings] = useState<{ weeklyRank: number; overallRank: number; pointsEarned: number } | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize scenario & attempt
  const initAttempt = useCallback(async (competitiveMode = true) => {
    if (!scenarioId) return;
    setLoading(true);
    setError(null);
    setScoreReport(null);

    const sc = getStrategyScenario(scenarioId);
    if (!sc) {
      setError(`Strategy scenario "${scenarioId}" could not be found.`);
      setLoading(false);
      return;
    }
    setScenario(sc);

    try {
      const newAttempt = await startStrategyAttempt({
        scenarioId: sc.id,
        userId: user?.userId || 'guest_user',
        username: user?.username || 'GuestStrategist',
        userDisplayName: user?.displayName || user?.username || 'Strategist',
        isCompetitive: competitiveMode
      });
      setAttempt(newAttempt);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize strategy attempt.');
    } finally {
      setLoading(false);
    }
  }, [scenarioId, user]);

  useEffect(() => {
    initAttempt(isCompetitive);
  }, [initAttempt]);

  // Handle tactical decision submission
  const handleCommitAction = async (actionId: string) => {
    if (!attempt || !scenario || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitStrategyDecision({
        attemptId: attempt.attemptId,
        actionId
      });

      setAttempt({ ...result.attempt });

      if (result.isCompleted) {
        // Complete attempt authoritatively
        const completion = await completeStrategyAttempt(attempt.attemptId, {
          username: user?.username,
          displayName: user?.displayName,
          avatarUrl: user?.avatarUrl,
          favouriteConstructor: user?.favouriteConstructor
        });

        setAttempt({ ...completion.attempt });
        setScoreReport(completion.scoreReport);
        setLeaderboardRankings(completion.leaderboardRankings);
      }
    } catch (err: any) {
      setError(err?.message || 'Error processing tactical call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    initAttempt(false); // practice mode on retry
  };

  if (loading) {
    return (
      <div className="cockpit-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #FF5500',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{
            fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.75rem',
            color: 'var(--text-muted, #848B96)'
          }}>
            Initializing Pit Wall Telemetry...
          </span>
        </div>
      </div>
    );
  }

  if (error || !scenario || !attempt) {
    return (
      <div className="cockpit-page" style={{ alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{
          backgroundColor: 'var(--surface, #11131A)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Sliders size={32} style={{ color: 'var(--flame-orange, #FF5500)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>Telemetry Error</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #848B96)', margin: 0 }}>{error || 'Unable to load scenario.'}</p>
          <button
            onClick={() => navigate('/strategy')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-raised, #171A24)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer'
            }}
          >
            Return to Strategy Room
          </button>
        </div>
      </div>
    );
  }

  const currentDecisionPoint = scenario.decisionPoints[attempt.currentStepIndex];

  return (
    <div className="cockpit-page">
      {/* Top Cockpit Command Bar */}
      <div className="cockpit-top-bar">
        {/* Left: Back & Circuit */}
        <div className="cockpit-top-left">
          <Link to="/strategy" className="cockpit-back-link">
            <ArrowLeft size={14} />
            <span>Pit Wall Hub</span>
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
          <div className="cockpit-title-group">
            <span className="cockpit-scenario-title">
              {scenario.title}
            </span>
            <span className="cockpit-circuit-badge">
              ({scenario.circuitName})
            </span>
          </div>
        </div>

        {/* Right: Mode & Restart Controls */}
        <div className="cockpit-top-right">
          {/* Competitive / Practice Indicator */}
          {attempt.currentStepIndex === 0 && (
            <button
              type="button"
              onClick={() => {
                const nextMode = !isCompetitive;
                setIsCompetitive(nextMode);
                initAttempt(nextMode);
              }}
              className={`cockpit-mode-toggle ${
                isCompetitive
                  ? 'cockpit-mode-toggle--competitive'
                  : 'cockpit-mode-toggle--practice'
              }`}
            >
              <Trophy size={12} />
              <span>{isCompetitive ? 'Competitive Run' : 'Practice Mode'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRetry}
            className="cockpit-icon-btn"
            title="Restart Scenario"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Responsive 3-Panel Strategy Cockpit */}
      <div className="cockpit-container">
        <div className="cockpit-3col-grid">
          {/* Left Panel: Race Telemetry */}
          <div className="cockpit-col-race">
            <RaceStatePanel
              state={attempt.currentState}
              circuitName={scenario.circuitName}
            />
          </div>

          {/* Center Panel: Active Decision Cockpit */}
          <div className="cockpit-col-decision">
            {currentDecisionPoint ? (
              <DecisionPanel
                decisionPoint={currentDecisionPoint}
                totalSteps={scenario.decisionPoints.length}
                currentStepIndex={attempt.currentStepIndex}
                isSubmitting={isSubmitting}
                onCommitAction={handleCommitAction}
              />
            ) : (
              <div style={{
                backgroundColor: 'var(--surface, #11131A)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '16px',
                padding: '2.5rem',
                textAlign: 'center',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid #00e676',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <h3 style={{
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  margin: 0
                }}>
                  Calculating Chequered Flag Telemetry...
                </h3>
              </div>
            )}
          </div>

          {/* Right Panel: Tire & Pit Parameters */}
          <div className="cockpit-col-tire">
            <TireStatusPanel
              state={attempt.currentState}
              simulationParams={scenario.simulationParameters}
            />
          </div>
        </div>
      </div>

      {/* Post-Race Strategic Debrief Modal */}
      {scoreReport && (
        <StrategyDebriefModal
          scenario={scenario}
          attempt={attempt}
          scoreReport={scoreReport}
          leaderboardRankings={leaderboardRankings}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

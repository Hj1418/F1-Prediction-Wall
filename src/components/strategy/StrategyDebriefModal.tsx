import React from 'react';
import {
  StrategyScenario,
  StrategyAttempt,
  StrategyScoreReport
} from '../../types/strategy';
import {
  Trophy,
  Award,
  Clock,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Flag,
  Share2,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StrategyDebriefModalProps {
  scenario: StrategyScenario;
  attempt: StrategyAttempt;
  scoreReport: StrategyScoreReport;
  leaderboardRankings?: { weeklyRank: number; overallRank: number; pointsEarned: number };
  onRetry: () => void;
  onClose?: () => void;
}

export const StrategyDebriefModal: React.FC<StrategyDebriefModalProps> = ({
  scenario,
  attempt,
  scoreReport,
  leaderboardRankings,
  onRetry,
  onClose
}) => {
  const { ratingTier } = scoreReport;
  const isOptimalAttempt = scoreReport.finalScore >= 90;

  return (
    <div className="debrief-overlay">
      <div className="debrief-modal-box">
        {/* Glow Header */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '75%',
            height: '3px',
            borderTopLeftRadius: '18px',
            borderTopRightRadius: '18px',
            backgroundColor: ratingTier.color,
            boxShadow: `0 0 16px ${ratingTier.color}`
          }}
        />

        {/* Top Bar: Title & Exit */}
        <div className="debrief-header">
          <div className="debrief-header-title">
            <Trophy size={24} style={{ color: ratingTier.color }} />
            <div>
              <span style={{
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted, #848B96)',
                display: 'block'
              }}>
                Post-Race Strategic Debrief
              </span>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                color: '#FFFFFF',
                margin: 0
              }}>
                {scenario.title}
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                color: 'var(--text-muted, #848B96)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-raised, #171A24)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          )}
        </div>

        {/* Hero Score & Rating Tier Box */}
        <div className="debrief-metrics-grid">
          {/* Main 100-pt Score */}
          <div className="debrief-metric-card debrief-metric-card--center">
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted, #848B96)',
              textTransform: 'uppercase',
              fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
              letterSpacing: '0.08em',
              marginBottom: '0.25rem'
            }}>
              Authoritative Score
            </div>
            <div className="debrief-hero-score" style={{ color: ratingTier.color }}>
              {scoreReport.finalScore}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.25rem' }}>
              / 100 Points Modelled
            </div>

            {/* Score category badge */}
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                border: `1px solid ${ratingTier.color}`,
                color: ratingTier.color,
                backgroundColor: 'rgba(0,0,0,0.4)'
              }}
            >
              {ratingTier.name}
            </div>
          </div>

          {/* Race Delta Telemetry */}
          <div className="debrief-metric-card">
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted, #848B96)',
              textTransform: 'uppercase',
              fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
              letterSpacing: '0.08em'
            }}>
              Simulated Race Outcome
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '0.6rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary, #D1D5DB)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={13} style={{ color: '#00e5ff' }} />
                  Net Race Delta:
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: attempt.finalTimeDeltaSeconds <= 0 ? '#00e676' : '#FF4D4D'
                }}>
                  {attempt.finalTimeDeltaSeconds <= 0
                    ? `${attempt.finalTimeDeltaSeconds.toFixed(2)}s (Gained)`
                    : `+${attempt.finalTimeDeltaSeconds.toFixed(2)}s (Lost)`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary, #D1D5DB)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Flag size={13} style={{ color: '#FF5500' }} />
                  Final Finish:
                </span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>
                  P{attempt.finalPosition}
                  {attempt.finalPosition < scenario.initialState.position && (
                    <span style={{ color: '#00e676', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                      (+{scenario.initialState.position - attempt.finalPosition})
                    </span>
                  )}
                  {attempt.finalPosition > scenario.initialState.position && (
                    <span style={{ color: '#FF4D4D', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                      (-{attempt.finalPosition - scenario.initialState.position})
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted, #848B96)',
              fontFamily: 'var(--font-mono, monospace)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '0.5rem'
            }}>
              Mode: <span style={{ textTransform: 'capitalize', color: '#FFFFFF' }}>{attempt.mode.replace('_', ' ')}</span> ({attempt.isCompetitive ? 'Competitive' : 'Practice'})
            </div>
          </div>

          {/* Competitive Points & Standing */}
          <div className="debrief-metric-card">
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted, #848B96)',
              textTransform: 'uppercase',
              fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Award size={13} style={{ color: '#FFB000' }} />
              Competitive Ledger
            </span>

            <div style={{ margin: '0.6rem 0' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFB000' }}>
                +{attempt.pointsAwarded || (attempt.isCompetitive ? scoreReport.finalScore : 0)} pts
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', marginTop: '0.2rem' }}>
                {attempt.isCompetitive
                  ? 'Authoritatively verified & synced to weekly ledger'
                  : 'Practice mode (Leaderboard unaffected)'}
              </div>
            </div>

            {leaderboardRankings && leaderboardRankings.weeklyRank > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--text-secondary, #D1D5DB)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '0.5rem',
                fontFamily: 'var(--font-mono, monospace)'
              }}>
                <span>Weekly Rank: #{leaderboardRankings.weeklyRank}</span>
                <span>Overall: #{leaderboardRankings.overallRank}</span>
              </div>
            )}
          </div>
        </div>

        {/* Score Rubric Breakdown */}
        <div className="debrief-rubric-box">
          <span style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 700,
            color: 'var(--text-muted, #848B96)',
            fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
          }}>
            Scoring Rubric Breakdown
          </span>
          <div className="debrief-rubric-grid">
            <div className="debrief-rubric-item">
              <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.68rem' }}>Decision Quality:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF' }}>
                {scoreReport.decisionQualityScore.toFixed(1)} / {Math.round(scenario.scoringRubric.decisionQualityWeight * 100)}
              </span>
            </div>
            <div className="debrief-rubric-item">
              <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.68rem' }}>Time Outcome:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF' }}>
                {scoreReport.timeOutcomeScore.toFixed(1)} / {Math.round(scenario.scoringRubric.timeOutcomeWeight * 100)}
              </span>
            </div>
            <div className="debrief-rubric-item">
              <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.68rem' }}>Position Retention:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF' }}>
                {scoreReport.positionOutcomeScore.toFixed(1)} / {Math.round(scenario.scoringRubric.positionOutcomeWeight * 100)}
              </span>
            </div>
            <div className="debrief-rubric-item">
              <span style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.68rem' }}>Consistency Factor:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#FFFFFF' }}>
                {scoreReport.consistencyScore.toFixed(1)} / {Math.round(scenario.scoringRubric.consistencyWeight * 100)}
              </span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Decision Telemetry & Event Log */}
        <div className="debrief-timeline-box">
          <span style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 700,
            color: 'var(--text-muted, #848B96)',
            fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
          }}>
            Decision Execution Timeline
          </span>

          <div className="debrief-timeline-list">
            {attempt.decisions.map((dec, idx) => {
              const dp = scenario.decisionPoints[idx];
              const chosenAction = dp?.availableActions.find(a => a.id === dec.actionId);
              const isOpt = dec.decisionScore >= 85;

              return (
                <div key={dec.decisionPointId || idx} className="debrief-timeline-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isOpt ? (
                        <CheckCircle2 size={15} style={{ color: '#00e676' }} />
                      ) : (
                        <AlertCircle size={15} style={{ color: '#FF8A00' }} />
                      )}
                      <span style={{
                        fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#FFFFFF'
                      }}>
                        Stage {idx + 1}: {chosenAction?.label || dec.actionId}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      backgroundColor: '#08090C',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {dec.decisionScore} / 100
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary, #D1D5DB)',
                    paddingLeft: '1.5rem',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {dec.explanation}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    paddingLeft: '1.5rem',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--text-muted, #848B96)'
                  }}>
                    <span>Delta: {dec.timeDeltaSeconds <= 0 ? `${dec.timeDeltaSeconds.toFixed(2)}s gained` : `+${dec.timeDeltaSeconds.toFixed(2)}s lost`}</span>
                    <span>Position: P{dec.stateAfter.position}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chief Strategist Debrief & Lessons */}
        <div className="debrief-tactical-takeaway">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FF7A00' }}>
            <BookOpen size={16} />
            <span style={{
              fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              Chief Strategist Tactical Takeaway
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #D1D5DB)', lineHeight: 1.6, margin: 0 }}>
            {scenario.debrief.tacticalTakeaway}
          </p>

          <div style={{
            backgroundColor: '#08090C',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.78rem',
            color: 'var(--text-muted, #848B96)',
            marginTop: '0.25rem'
          }}>
            <span style={{ color: '#FFFFFF', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Reference Benchmark:</span>
            {scenario.debrief.referenceStrategy}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="debrief-action-bar">
          <button
            type="button"
            onClick={onRetry}
            className="debrief-btn-secondary"
          >
            <RotateCcw size={14} />
            <span>Retry Scenario (Practice)</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/strategy/leaderboard"
              className="debrief-btn-secondary"
              style={{ color: '#FFB000', borderColor: 'rgba(255, 176, 0, 0.3)' }}
            >
              <Trophy size={14} />
              <span>Leaderboard</span>
            </Link>

            <Link
              to="/strategy"
              className="debrief-btn-primary"
            >
              <span>Strategy Room Hub</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

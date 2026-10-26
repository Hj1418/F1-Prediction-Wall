import React, { useState, useEffect } from 'react';
import { StrategyUserPerformance, StrategyAttempt, StrategyCategory } from '../types/strategy';
import { getUserStrategyAttempts, getStrategyScenario } from '../services/strategy/strategyService';
import { getUserStrategyPerformance } from '../services/strategy/strategyLeaderboardService';
import { calculateAuthoritativeScore } from '../services/strategy/strategyScoring';
import { StrategyDebriefModal } from '../components/strategy/StrategyDebriefModal';
import { useAuth } from '../context/AuthContext';
import { User, Trophy, Award, Sliders, ArrowLeft, Clock, Flag, CheckCircle2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_LABELS: Record<StrategyCategory, string> = {
  pit_window: 'Pit Windows',
  undercut_overcut: 'Undercut / Overcut',
  safety_car: 'Safety Car & VSC',
  weather_tires: 'Weather & Wet Tires',
  pace_management: 'Tire Degradation',
  race_management: 'Grand Prix Strategy'
};

export const StrategyPerformancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const user = currentUser;
  const [performance, setPerformance] = useState<StrategyUserPerformance | null>(null);
  const [attempts, setAttempts] = useState<StrategyAttempt[]>([]);
  const [selectedReviewAttempt, setSelectedReviewAttempt] = useState<StrategyAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUserPerformance() {
      const userId = user?.userId || 'guest_user';
      try {
        const userAttempts = await getUserStrategyAttempts(userId);
        if (mounted) {
          setAttempts(userAttempts);
          const perf = getUserStrategyPerformance(userId, userAttempts);
          setPerformance(perf);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUserPerformance();
    return () => { mounted = false; };
  }, [user?.userId]);

  return (
    <div className="strategy-page">
      {/* Top Banner */}
      <div className="strategy-page-banner">
        <div className="strategy-page-banner-inner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              to="/strategy"
              className="cockpit-back-link"
            >
              <ArrowLeft size={14} />
              <span>Back to Strategy Room</span>
            </Link>
            <h1 className="strategy-banner-title">
              STRATEGIST <span style={{ color: '#00e5ff' }}>TELEMETRY</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #848B96)', margin: 0 }}>
              Personal pit wall metrics, category mastery ratings, and race attempt history.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/strategy/leaderboard"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'var(--surface, #11131A)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                fontSize: '0.75rem',
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#FFB000',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none'
              }}
            >
              <Trophy size={14} />
              <span>Global Standings</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="strategy-container">
        {/* Core KPI Cards */}
        {performance && (
          <div className="strategy-kpi-grid">
            <div className="strategy-kpi-card">
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", letterSpacing: '0.08em' }}>
                Weekly Rank
              </span>
              <span className="strategy-kpi-value" style={{ color: '#FFB000' }}>
                {performance.weeklyRank > 0 ? `#${performance.weeklyRank}` : '—'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                {performance.weeklyPoints} pts this week
              </span>
            </div>

            <div className="strategy-kpi-card">
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", letterSpacing: '0.08em' }}>
                Overall Points
              </span>
              <span className="strategy-kpi-value" style={{ color: 'var(--flame-orange, #FF5500)' }}>
                {performance.totalPoints}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                {performance.completedScenariosCount} completed runs
              </span>
            </div>

            <div className="strategy-kpi-card">
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", letterSpacing: '0.08em' }}>
                Average Score
              </span>
              <span className="strategy-kpi-value" style={{ color: '#FFFFFF' }}>
                {performance.averageScore}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                Out of 100 max
              </span>
            </div>

            <div className="strategy-kpi-card">
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", letterSpacing: '0.08em' }}>
                Personal Best
              </span>
              <span className="strategy-kpi-value" style={{ color: '#00e676' }}>
                {performance.bestScore}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                Highest single run
              </span>
            </div>
          </div>
        )}

        {/* Category Mastery Breakdown */}
        {performance && (
          <div style={{
            backgroundColor: 'var(--surface, #11131A)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              paddingBottom: '0.75rem'
            }}>
              <span style={{ fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                Tactical Category Breakdown
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
                6 Core Disciplines
              </span>
            </div>

            <div className="strategy-radar-grid">
              {(Object.keys(performance.categoryStats) as StrategyCategory[]).map(cat => {
                const stat = performance.categoryStats[cat];

                return (
                  <div
                    key={cat}
                    style={{
                      backgroundColor: 'var(--surface-raised, #171A24)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#FFFFFF' }}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#FFB000' }}>
                        {stat.completed > 0 ? `${stat.avgScore}/100` : 'Not Attempted'}
                      </span>
                    </div>

                    <div style={{ width: '100%', backgroundColor: '#08090C', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          background: 'linear-gradient(90deg, #FFB000, #FF5500)',
                          height: '100%',
                          borderRadius: '999px',
                          width: `${Math.min(100, Math.max(0, stat.avgScore))}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
                      <span>{stat.completed} attempt{stat.completed === 1 ? '' : 's'}</span>
                      <span>{stat.completed > 0 ? 'Calibrated' : 'Pending'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attempt History Table */}
        <div style={{
          backgroundColor: 'var(--surface, #11131A)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
              Recent Pit Wall Attempt History
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
              {attempts.length} Total Runs
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="strategy-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th style={{ textAlign: 'center' }}>Finish</th>
                  <th style={{ textAlign: 'center' }}>Net Delta</th>
                  <th>Completed</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted, #848B96)', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
                      No attempts recorded yet. Head over to the Strategy Room to begin your first race simulation!
                    </td>
                  </tr>
                ) : (
                  attempts.map((att) => {
                    const sc = getStrategyScenario(att.scenarioId);

                    return (
                      <tr key={att.attemptId}>
                        <td style={{ color: '#FFFFFF', fontWeight: 600 }}>
                          {sc?.title || att.scenarioId}
                        </td>
                        <td style={{ textTransform: 'capitalize', color: 'var(--text-muted, #848B96)' }}>
                          {att.mode.replace('_', ' ')}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          <span style={{ color: att.score >= 80 ? '#00e676' : att.score >= 60 ? '#FFB000' : '#FF4D4D' }}>
                            {att.score}/100
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', color: '#FFFFFF' }}>
                          P{att.finalPosition}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                          {att.finalTimeDeltaSeconds <= 0 ? (
                            <span style={{ color: '#00e676' }}>{att.finalTimeDeltaSeconds.toFixed(2)}s</span>
                          ) : (
                            <span style={{ color: '#FF4D4D' }}>+{att.finalTimeDeltaSeconds.toFixed(2)}s</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted, #848B96)', fontSize: '0.75rem' }}>
                          {new Date(att.completedAt || att.startedAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedReviewAttempt(att)}
                            style={{
                              color: 'var(--flame-orange, #FF5500)',
                              fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal if clicked */}
      {selectedReviewAttempt && (() => {
        const sc = getStrategyScenario(selectedReviewAttempt.scenarioId);
        if (!sc) return null;
        const report = calculateAuthoritativeScore(sc, selectedReviewAttempt.decisions);

        return (
          <StrategyDebriefModal
            scenario={sc}
            attempt={selectedReviewAttempt}
            scoreReport={report}
            onRetry={() => setSelectedReviewAttempt(null)}
            onClose={() => setSelectedReviewAttempt(null)}
          />
        );
      })()}
    </div>
  );
};

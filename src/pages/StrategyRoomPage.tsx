import React, { useState, useEffect, useMemo } from 'react';
import { StrategyScenario, StrategyMode, StrategyCategory, StrategyDifficulty, PreRaceScenario } from '../types/strategy';
import { getStrategyScenarios, getFeaturedScenario, getUserStrategyAttempts } from '../services/strategy/strategyService';
import { getWeeklyStrategyLeaderboard } from '../services/strategy/strategyLeaderboardService';
import { getPreRaceScenarios } from '../services/strategy/preRaceScenarioRegistry';
import { getUserPreRaceAttempts, getOrCreatePreRaceRound } from '../services/strategy/preRaceStrategyService';
import { useAuth } from '../context/AuthContext';
import { StrategyHero } from '../components/strategy/StrategyHero';
import { ScenarioCard } from '../components/strategy/ScenarioCard';
import { LiveRaceStrategyPreview } from '../components/strategy/LiveRaceStrategyPreview';
import { Trophy, Filter, Sliders, Shield, ArrowRight, Flag, Clock, Flame, Radio, Layers, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type StrategyTabMode = 'pre_race' | 'live_race' | 'tactical_bank';

const CATEGORIES: Array<{ id: StrategyCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Tactical Topics' },
  { id: 'pit_window', label: 'Pit Windows' },
  { id: 'undercut_overcut', label: 'Undercut / Overcut' },
  { id: 'safety_car', label: 'Safety Car & VSC' },
  { id: 'weather_tires', label: 'Weather & Wets' },
  { id: 'pace_management', label: 'Tire Degradation' },
  { id: 'race_management', label: 'GP Management' }
];

export const StrategyRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const user = currentUser;

  // Primary Feature Tab Mode: Pre-Race Strategy is default & primary action!
  const [activeTab, setActiveTab] = useState<StrategyTabMode>('pre_race');

  // Pre-Race Scenario Bank
  const preRaceScenarios = useMemo(() => getPreRaceScenarios(), []);
  const [userPreRaceBestScores, setUserPreRaceBestScores] = useState<Record<string, number>>({});

  // Classic Scenario Bank
  const [scenarios, setScenarios] = useState<StrategyScenario[]>([]);
  const [selectedMode, setSelectedMode] = useState<StrategyMode | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<StrategyCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<StrategyDifficulty | 'all'>('all');
  const [userBestScores, setUserBestScores] = useState<Record<string, number>>({});
  const [weeklyLeaders, setWeeklyLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const featured = useMemo(() => getFeaturedScenario(), []);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const list = await getStrategyScenarios();
        if (mounted) setScenarios(list);

        const leaders = await getWeeklyStrategyLeaderboard();
        if (mounted) setWeeklyLeaders(leaders.slice(0, 5));

        if (user?.userId) {
          // Classic attempts
          const attempts = await getUserStrategyAttempts(user.userId);
          const scoreMap: Record<string, number> = {};
          attempts.forEach(a => {
            if (a.status === 'completed') {
              scoreMap[a.scenarioId] = Math.max(scoreMap[a.scenarioId] || 0, a.score);
            }
          });
          if (mounted) setUserBestScores(scoreMap);

          // Pre-race attempts
          const preRaceAttempts = getUserPreRaceAttempts(user.userId);
          const preScoreMap: Record<string, number> = {};
          preRaceAttempts.forEach(a => {
            preScoreMap[a.scenarioId] = Math.max(preScoreMap[a.scenarioId] || 0, a.score);
          });
          if (mounted) setUserPreRaceBestScores(preScoreMap);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [user?.userId]);

  // Filtered Classic Scenarios
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      if (selectedMode !== 'all' && s.mode !== selectedMode) return false;
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && s.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [scenarios, selectedMode, selectedCategory, selectedDifficulty]);

  return (
    <div className="strategy-page">
      {/* Strategy Hero Banner */}
      <StrategyHero featuredScenario={featured} totalScenarios={preRaceScenarios.length + scenarios.length} />

      {/* Main Content Area */}
      <div className="strategy-container">
        {/* Primary Strategy Mode Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--surface, #11131A)',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Tab 1: Pre-Race Strategy (Primary MVP) */}
            <button
              type="button"
              onClick={() => setActiveTab('pre_race')}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'pre_race' ? 'var(--flame-orange, #FF5500)' : 'transparent',
                color: activeTab === 'pre_race' ? '#FFFFFF' : 'var(--text-muted, #848B96)',
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Flag size={14} />
              <span>Pre-Race Strategy ({preRaceScenarios.length})</span>
            </button>

            {/* Tab 2: Live Race Strategy (Phase 2 - Coming Soon) */}
            <button
              type="button"
              onClick={() => setActiveTab('live_race')}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'live_race' ? 'rgba(255, 85, 0, 0.15)' : 'transparent',
                color: activeTab === 'live_race' ? 'var(--flame-orange, #FF5500)' : 'var(--text-muted, #848B96)',
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Radio size={14} />
              <span>Live Race Strategy (Coming Soon)</span>
            </button>

            {/* Tab 3: Tactical Bank */}
            <button
              type="button"
              onClick={() => setActiveTab('tactical_bank')}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'tactical_bank' ? 'var(--surface-raised, #171A24)' : 'transparent',
                color: activeTab === 'tactical_bank' ? '#FFFFFF' : 'var(--text-muted, #848B96)',
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Layers size={14} />
              <span>Tactical Challenges ({scenarios.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              to="/strategy/leaderboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--flame-yellow, #FFB000)',
                textDecoration: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                textTransform: 'uppercase'
              }}
            >
              <Trophy size={14} />
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: PRE-RACE STRATEGY (PRIMARY MVP)
            ========================================================================= */}
        {activeTab === 'pre_race' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)", fontWeight: 800, color: '#FFFFFF' }}>
                  Pre-Race Strategy Room: Grand Prix Scenarios
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #848B96)' }}>
                  Inspect circuit characteristics, evaluate reference plans A/B/C, engage in timed 15-minute community discussions, and commit your strategy against reproducible baselines.
                </p>
              </div>
            </div>

            {/* Pre-Race Scenarios Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {preRaceScenarios.map(sc => {
                const round = getOrCreatePreRaceRound(sc.id);
                const bestScore = userPreRaceBestScores[sc.id];

                return (
                  <div
                    key={sc.id}
                    style={{
                      backgroundColor: 'var(--surface, #11131A)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Top Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        backgroundColor: 'rgba(255, 85, 0, 0.15)',
                        color: 'var(--flame-orange, #FF5500)',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        letterSpacing: '0.06em',
                        fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)"
                      }}>
                        SIMULATED GRAND PRIX
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#00e676', fontSize: '0.7rem', fontWeight: 700 }}>
                        <Clock size={12} />
                        <span>15m Timed Window</span>
                      </div>
                    </div>

                    {/* Circuit & Title */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {sc.circuitName}
                      </div>
                      <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', fontWeight: 800, fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)", color: '#FFFFFF' }}>
                        {sc.title}
                      </h4>
                    </div>

                    {/* Quick Specs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', backgroundColor: 'var(--surface-raised, #171A24)', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', display: 'block' }}>Starting Grid</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00e5ff', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)" }}>
                          P{sc.startingPosition}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', display: 'block' }}>Distance</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)" }}>
                          {sc.totalLaps}L
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #848B96)', display: 'block' }}>Pit Loss</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFB000', fontFamily: "var(--font-brand, 'Orbitron', sans-serif)" }}>
                          {sc.pitLossSeconds}s
                        </span>
                      </div>
                    </div>

                    {/* Baseline Reference Teaser */}
                    <div style={{ fontSize: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span style={{ color: 'var(--text-muted, #848B96)' }}>Baseline Target: </span>
                      <strong style={{ color: '#FFFFFF' }}>{sc.baselineOutcome.strategyDescription}</strong>
                      <span style={{ color: 'var(--text-muted, #848B96)' }}> (Finishes P{sc.baselineOutcome.finishingPosition})</span>
                    </div>

                    {/* Footer with CTA and personal best */}
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {bestScore !== undefined ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#00e676', fontSize: '0.75rem', fontWeight: 700 }}>
                          <CheckCircle2 size={13} />
                          <span>Best: {bestScore}/100</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)' }}>
                          Not Yet Attempted
                        </span>
                      )}

                      <Link
                        to={`/strategy/scenario/${sc.id}`}
                        style={{
                          backgroundColor: 'var(--flame-orange, #FF5500)',
                          color: '#FFFFFF',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        <span>Enter Strategy Room</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: LIVE RACE STRATEGY (PHASE 2 - COMING SOON)
            ========================================================================= */}
        {activeTab === 'live_race' && (
          <LiveRaceStrategyPreview />
        )}

        {/* =========================================================================
            TAB 3: TACTICAL CHALLENGE BANK (CLASSIC SCENARIOS)
            ========================================================================= */}
        {activeTab === 'tactical_bank' && (
          <div>
            {/* Navigation & Controls Bar */}
            <div className="strategy-controls-bar">
              {/* Mode Tabs */}
              <div className="strategy-mode-tabs">
                <button
                  type="button"
                  onClick={() => setSelectedMode('all')}
                  className={`strategy-mode-tab ${selectedMode === 'all' ? 'strategy-mode-tab--active' : ''}`}
                >
                  All Scenarios ({scenarios.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('challenge')}
                  className={`strategy-mode-tab ${selectedMode === 'challenge' ? 'strategy-mode-tab--active' : ''}`}
                >
                  Single Challenges (14)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('race_simulation')}
                  className={`strategy-mode-tab ${selectedMode === 'race_simulation' ? 'strategy-mode-tab--active' : ''}`}
                >
                  Race Simulations (4)
                </button>
              </div>

              {/* Difficulty Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                  <Filter size={13} />
                  <span>Difficulty:</span>
                </div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="strategy-difficulty-select"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Category Pills Slider / Filter */}
            <div className="strategy-categories-row">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`strategy-cat-pill ${selectedCategory === cat.id ? 'strategy-cat-pill--active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Main Grid + Mini Leaderboard Sidebar */}
            <div className="strategy-layout-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display, sans-serif)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #848B96)', letterSpacing: '0.05em' }}>
                    Tactical Scenario Bank ({filteredScenarios.length} Found)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
                    Click a card to enter live cockpit
                  </span>
                </div>

                {loading ? (
                  <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-display, sans-serif)' }}>
                    Loading telemetry and scenarios...
                  </div>
                ) : filteredScenarios.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: 'var(--surface, #11131A)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      borderRadius: '14px',
                      padding: '3rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'var(--text-muted, #848B96)'
                    }}
                  >
                    <Sliders size={32} />
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>No scenarios match your active filters.</p>
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory('all'); setSelectedDifficulty('all'); setSelectedMode('all'); }}
                      style={{ background: 'none', border: 'none', color: 'var(--flame-orange, #FF5500)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="strategy-cards-grid">
                    {filteredScenarios.map(sc => (
                      <ScenarioCard
                        key={sc.id}
                        scenario={sc}
                        userBestScore={userBestScores[sc.id]}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: Weekly Leaderboard Preview & Strategy Rules */}
              <div className="strategy-sidebar">
                <div className="strategy-widget-box">
                  <div className="strategy-widget-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Trophy size={16} style={{ color: 'var(--flame-yellow, #FFB000)' }} />
                      <span style={{ fontFamily: 'var(--font-display, sans-serif)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Weekly Top Tacticians
                      </span>
                    </div>
                    <Link
                      to="/strategy/leaderboard"
                      style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: '0.7rem', color: 'var(--flame-orange, #FF5500)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      Full Board
                      <ArrowRight size={11} />
                    </Link>
                  </div>

                  {weeklyLeaders.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', padding: '1rem 0', textAlign: 'center', margin: 0 }}>
                      No competitive scores yet this week. Be the first on the board!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {weeklyLeaders.map((entry, idx) => (
                        <div key={entry.userId || idx} className="strategy-leader-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-mono, monospace)',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                backgroundColor: idx === 0 ? '#FFB000' : idx === 1 ? '#D1D5DB' : idx === 2 ? '#B45309' : '#08090C',
                                color: idx === 0 || idx === 1 ? '#000000' : '#FFFFFF'
                              }}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.8rem', display: 'block' }}>
                                {entry.displayName || entry.username}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted, #848B96)' }}>
                                {entry.favouriteConstructor || 'Independent'}
                              </span>
                            </div>
                          </div>

                          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--flame-yellow, #FFB000)' }}>
                            {entry.totalPoints} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="strategy-widget-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00e5ff' }}>
                    <Shield size={16} />
                    <span style={{ fontFamily: 'var(--font-display, sans-serif)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                      Strategy Room Regulations
                    </span>
                  </div>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', display: 'flex', flexDirection: 'column', gap: '0.65rem', lineHeight: 1.5, margin: 0, paddingLeft: '1.1rem' }}>
                    <li>
                      <strong style={{ color: '#FFFFFF' }}>100-Point Model:</strong> Decisions evaluated on quality (50%), race time delta (30%), and efficiency (20%).
                    </li>
                    <li>
                      <strong style={{ color: '#FFFFFF' }}>One Eligible Score:</strong> Only your first validated competitive attempt per scenario per week counts toward rankings.
                    </li>
                    <li>
                      <strong style={{ color: '#FFFFFF' }}>Unlimited Practice:</strong> Retrying any scenario is permitted for tactical training without penalty.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

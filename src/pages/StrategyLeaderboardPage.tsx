import React, { useState, useEffect } from 'react';
import { StrategyLeaderboardEntry } from '../types/strategy';
import {
  getWeeklyStrategyLeaderboard,
  getOverallStrategyLeaderboard,
  getStrategyPeriodKey
} from '../services/strategy/strategyLeaderboardService';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Award, Sliders, ArrowLeft, ShieldCheck, Flame, Disc } from 'lucide-react';
import { Link } from 'react-router-dom';

type LeaderboardTab = 'weekly' | 'overall';

export const StrategyLeaderboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const user = currentUser;
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('weekly');
  const [entries, setEntries] = useState<StrategyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentPeriod = getStrategyPeriodKey();

  useEffect(() => {
    let mounted = true;
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const data = activeTab === 'weekly'
          ? await getWeeklyStrategyLeaderboard()
          : await getOverallStrategyLeaderboard();

        if (mounted) setEntries(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchLeaderboard();
    return () => { mounted = false; };
  }, [activeTab]);

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

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
              TACTICIAN <span style={{ color: 'var(--flame-orange, #FF5500)' }}>STANDINGS</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #848B96)', margin: 0 }}>
              Authoritative competitive points earned across single challenges and Grand Prix race simulations.
            </p>
          </div>

          {/* Period Pill */}
          <div style={{
            backgroundColor: 'var(--surface, #11131A)',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', textTransform: 'uppercase', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
              Active Cycle:
            </span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#FFB000' }}>
              {currentPeriod}
            </span>
          </div>
        </div>
      </div>

      <div className="strategy-container">
        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '1rem'
        }}>
          <div className="strategy-tab-group">
            <button
              type="button"
              onClick={() => setActiveTab('weekly')}
              className={`strategy-tab-btn ${activeTab === 'weekly' ? 'strategy-tab-btn--active' : ''}`}
            >
              Weekly Leaderboard ({currentPeriod})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overall')}
              className={`strategy-tab-btn ${activeTab === 'overall' ? 'strategy-tab-btn--active' : ''}`}
            >
              All-Time Standings
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
            <ShieldCheck size={14} style={{ color: '#00e676' }} />
            <span>Server Verified</span>
          </div>
        </div>

        {/* Podium Display (Top 3) */}
        {top3.length > 0 && (
          <div className="strategy-podium-grid">
            {/* P2: Silver */}
            {top3[1] && (
              <div className="strategy-podium-card strategy-podium-card--2">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#D1D5DB',
                  color: '#000000',
                  fontWeight: 900,
                  fontFamily: "var(--font-brand, 'Orbitron', sans-serif)",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  marginBottom: '0.25rem'
                }}>
                  2
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#FFFFFF',
                  margin: 0
                }}>
                  {top3[1].displayName || top3[1].username}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                  {top3[1].favouriteConstructor || 'Independent'}
                </span>
                <div style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: '#E2E8F0' }}>
                  {top3[1].totalPoints} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontWeight: 400 }}>pts</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Avg: {top3[1].averageScore} • Best: {top3[1].bestScore}
                </div>
              </div>
            )}

            {/* P1: Gold Hero */}
            {top3[0] && (
              <div className="strategy-podium-card strategy-podium-card--1">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFE066, #FFB000)',
                  color: '#000000',
                  fontWeight: 900,
                  fontFamily: "var(--font-brand, 'Orbitron', sans-serif)",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '0.25rem',
                  boxShadow: '0 0 16px rgba(255, 176, 0, 0.4)'
                }}>
                  1
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  color: '#FFB000',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                  letterSpacing: '0.08em'
                }}>
                  Chief Race Strategist
                </span>
                <h3 style={{
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: '#FFFFFF',
                  margin: 0
                }}>
                  {top3[0].displayName || top3[0].username}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                  {top3[0].favouriteConstructor || 'Independent'}
                </span>
                <div style={{ marginTop: '0.5rem', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: '#FFB000' }}>
                  {top3[0].totalPoints} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontWeight: 400 }}>pts</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Avg: {top3[0].averageScore} • Best: {top3[0].bestScore}
                </div>
              </div>
            )}

            {/* P3: Bronze */}
            {top3[2] && (
              <div className="strategy-podium-card strategy-podium-card--3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#CD7F32',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontFamily: "var(--font-brand, 'Orbitron', sans-serif)",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  marginBottom: '0.25rem'
                }}>
                  3
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#FFFFFF',
                  margin: 0
                }}>
                  {top3[2].displayName || top3[2].username}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)' }}>
                  {top3[2].favouriteConstructor || 'Independent'}
                </span>
                <div style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: '#CD7F32' }}>
                  {top3[2].totalPoints} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #848B96)', fontWeight: 400 }}>pts</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #848B96)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Avg: {top3[2].averageScore} • Best: {top3[2].bestScore}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Standings Table */}
        <div style={{
          backgroundColor: 'var(--surface, #11131A)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="strategy-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Strategist</th>
                  <th style={{ textAlign: 'center' }}>Challenges</th>
                  <th style={{ textAlign: 'center' }}>Simulations</th>
                  <th style={{ textAlign: 'right' }}>Avg Score</th>
                  <th style={{ textAlign: 'right' }}>Best Score</th>
                  <th style={{ textAlign: 'right' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted, #848B96)', fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)" }}>
                      No competitive records available yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const isCurrentUser = user?.userId && entry.userId === user.userId;

                    return (
                      <tr
                        key={entry.userId}
                        className={isCurrentUser ? 'strategy-table-row--user' : ''}
                      >
                        <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          #{entry.rank}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                              {entry.displayName || entry.username}
                            </span>
                            {entry.favouriteConstructor && (
                              <span style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted, #848B96)',
                                fontFamily: 'var(--font-mono, monospace)',
                                backgroundColor: '#08090C',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.04)'
                              }}>
                                {entry.favouriteConstructor}
                              </span>
                            )}
                            {isCurrentUser && (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                backgroundColor: 'var(--flame-orange, #FF5500)',
                                color: '#000000',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px'
                              }}>
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted, #848B96)' }}>
                          {entry.challengesCompleted}
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted, #848B96)' }}>
                          {entry.simulationsCompleted}
                        </td>
                        <td style={{ textAlign: 'right', color: '#FFFFFF' }}>
                          {entry.averageScore.toFixed(1)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#00e676', fontWeight: 700 }}>
                          {entry.bestScore}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '1rem', fontWeight: 700, color: '#FFB000' }}>
                          {entry.totalPoints}
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
    </div>
  );
};

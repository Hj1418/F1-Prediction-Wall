import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Award,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Shield,
  Layers,
  Flag,
  Info,
} from 'lucide-react';
import { UnifiedUserCompetitionProfile } from '../../types/competitionAnalytics';
import { UserInitialsAvatar } from '../common/UserInitialsAvatar';

interface UnifiedUserCompetitionModalProps {
  profile: UnifiedUserCompetitionProfile;
  onClose: () => void;
}

export const UnifiedUserCompetitionModal: React.FC<UnifiedUserCompetitionModalProps> = ({
  profile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'racing_tag' | 'strategy' | 'predictions'>('overview');

  const { account, combined, racingTag, strategyRoom, predictions } = profile;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0c0e14',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <UserInitialsAvatar
              name={account.displayName || account.username}
              imageUrl={account.avatarUrl}
              size={48}
              showBorder={true}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  {account.displayName || account.username}
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: account.role === 'admin' ? 'rgba(225, 6, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: account.role === 'admin' ? 'var(--f1-red)' : 'var(--text-secondary)',
                    border: account.role === 'admin' ? '1px solid var(--f1-red)' : '1px solid rgba(255, 255, 255, 0.1)',
                    textTransform: 'uppercase',
                  }}
                >
                  {account.role || 'USER'}
                </span>
                {racingTag.earnedTier && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 176, 0, 0.15)',
                      color: '#FFB000',
                      border: '1px solid rgba(255, 176, 0, 0.3)',
                    }}
                  >
                    {racingTag.earnedTier}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>@{account.username}</span>
                <span>•</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {account.userId}</span>
                {account.email && (
                  <>
                    <span>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{account.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          {[
            { id: 'overview', label: 'OVERVIEW & TIMELINE', icon: Layers },
            { id: 'racing_tag', label: `RACING TAG (${racingTag.attemptsCount})`, icon: Award },
            { id: 'strategy', label: `STRATEGY ROOM (${strategyRoom.attemptsCount})`, icon: Target },
            { id: 'predictions', label: `PREDICTIONS (${predictions.submissionsCount})`, icon: Flag },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.85rem 1.15rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--f1-red)' : '2px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isActive ? 'var(--f1-red)' : 'currentColor'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* TAB 1: OVERVIEW & TIMELINE */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Top Quick Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    TOTAL ATTEMPTS
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                    {combined.totalAttempts}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--telemetry-green)', marginTop: '0.25rem' }}>
                    {combined.totalCompletedActivities} completed
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    ACTIVE FEATURES
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                    {combined.activeFeaturesCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 3</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Compete modules tried
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    REGISTERED
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                    {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '—'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Account creation date
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    LATEST ACTIVITY
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                    {account.lastCompetitionActivity ? new Date(account.lastCompetitionActivity).toLocaleDateString() : 'No activity'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {account.lastCompetitionActivity ? new Date(account.lastCompetitionActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never participated'}
                  </div>
                </div>
              </div>

              {/* Feature-Level Status Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Racing Tag Quick Card */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem', color: '#ffffff' }}>
                      <Award size={15} color="#FFB000" /> RACING TAG
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {combined.lastActivityPerFeature.racingTag ? new Date(combined.lastActivityPerFeature.racingTag).toLocaleDateString() : 'No attempts'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Attempts / Completed:</span>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {racingTag.attemptsCount} / {racingTag.completedCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Best Score:</span>
                    <span style={{ fontWeight: 800, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)' }}>
                      {racingTag.bestScore > 0 ? `${racingTag.bestScore} pts (${racingTag.bestPercentage}%)` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Earned Tier:</span>
                    <span style={{ fontWeight: 800, color: '#FFB000', fontFamily: 'var(--font-mono)' }}>
                      {racingTag.earnedTier || 'None'}
                    </span>
                  </div>
                </div>

                {/* Strategy Room Quick Card */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem', color: '#ffffff' }}>
                      <Target size={15} color="var(--telemetry-cyan)" /> STRATEGY ROOM
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {combined.lastActivityPerFeature.strategyRoom ? new Date(combined.lastActivityPerFeature.strategyRoom).toLocaleDateString() : 'No attempts'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Attempts / Completed:</span>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {strategyRoom.attemptsCount} / {strategyRoom.completedCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Best / Avg Score:</span>
                    <span style={{ fontWeight: 800, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {strategyRoom.bestScore > 0 ? `${strategyRoom.bestScore} / ${strategyRoom.averageScore}` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Scenarios Played:</span>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {strategyRoom.scenariosPlayedCount}
                    </span>
                  </div>
                </div>

                {/* Predictions Quick Card */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '1.1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem', color: '#ffffff' }}>
                      <Flag size={15} color="var(--f1-red)" /> F1 PREDICTIONS
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {combined.lastActivityPerFeature.predictions ? new Date(combined.lastActivityPerFeature.predictions).toLocaleDateString() : 'No submissions'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Submissions:</span>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {predictions.submissionsCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Points:</span>
                    <span style={{ fontWeight: 800, color: 'var(--f1-red)', fontFamily: 'var(--font-mono)' }}>
                      {predictions.totalPoints} pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Leaderboard Rank:</span>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {(predictions.leaderboardRank ?? predictions.seasonRank) ? `#${predictions.leaderboardRank ?? predictions.seasonRank}` : 'Unranked'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chronological Activity Timeline */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  RECENT ACTIVITY TIMELINE ACROSS COMPETE
                </div>
                {combined.activityTimeline.length === 0 ? (
                  <div
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    No competition activity recorded for this user yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {combined.activityTimeline.map(ev => {
                      const isRt = ev.type === 'RACING_TAG';
                      const isSt = ev.type === 'STRATEGY_ROOM';
                      const badgeBg = isRt ? 'rgba(255, 176, 0, 0.15)' : isSt ? 'rgba(0, 210, 255, 0.15)' : 'rgba(225, 6, 0, 0.15)';
                      const badgeColor = isRt ? '#FFB000' : isSt ? 'var(--telemetry-cyan)' : 'var(--f1-red)';
                      return (
                        <div
                          key={ev.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: badgeBg,
                                color: badgeColor,
                                border: `1px solid ${badgeColor}33`,
                              }}
                            >
                              {ev.badgeText || ev.type}
                            </span>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>{ev.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.detail}</div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            {ev.score !== undefined && (
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: badgeColor, fontFamily: 'var(--font-mono)' }}>
                                {typeof ev.score === 'number' ? `${ev.score} pts` : ev.score}
                              </div>
                            )}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {ev.timestamp ? new Date(ev.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RACING TAG */}
          {activeTab === 'racing_tag' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ATTEMPTS / COMPLETED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {racingTag.attemptsCount} / {racingTag.completedCount}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BEST SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {racingTag.bestScore > 0 ? `${racingTag.bestScore} pts (${racingTag.bestPercentage}%)` : '—'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AVERAGE SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {racingTag.averageScore > 0 ? `${racingTag.averageScore} pts (${racingTag.averagePercentage}%)` : '—'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CURRENT EARNED TIER</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFB000', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
                    {racingTag.earnedTier || 'Unranked'}
                  </div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  ATTEMPTS BY DIFFICULTY
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>ROOKIE</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {racingTag.difficultyBreakdown.rookie}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 800 }}>APEX</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {racingTag.difficultyBreakdown.apex}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>RACE ANALYST</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {racingTag.difficultyBreakdown.race_analyst}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Attempt History Table */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  ATTEMPT HISTORY ({racingTag.recentAttempts.length})
                </div>
                {racingTag.recentAttempts.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No Racing Tag attempts found for this user.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                    <table className="timing-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>DATE</th>
                          <th>DIFFICULTY</th>
                          <th style={{ textAlign: 'center' }}>SCORE</th>
                          <th style={{ textAlign: 'center' }}>ACCURACY</th>
                          <th>EARNED TIER</th>
                          <th style={{ textAlign: 'right' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {racingTag.recentAttempts.map(att => (
                          <tr key={att.attemptId}>
                            <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                              {att.completedAt ? new Date(att.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                            </td>
                            <td style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                              {(att.difficultyLevel || 'Apex').toUpperCase()}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-green)' }}>
                              {att.score} / {att.totalQuestions}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                              {att.percentage}%
                            </td>
                            <td>
                              <span style={{ fontSize: '0.72rem', color: '#FFB000', fontWeight: 800 }}>
                                {att.fanIdentityTier}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {att.status || 'COMPLETED'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STRATEGY ROOM */}
          {activeTab === 'strategy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ATTEMPTS / COMPLETED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {strategyRoom.attemptsCount} / {strategyRoom.completedCount}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BEST / AVG SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {strategyRoom.bestScore > 0 ? `${strategyRoom.bestScore} / ${strategyRoom.averageScore}` : '—'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>POSITIONS GAINED / LOST</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: strategyRoom.averagePositionDelta >= 0 ? 'var(--telemetry-green)' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {strategyRoom.averagePositionDelta > 0 ? `+${strategyRoom.averagePositionDelta}` : strategyRoom.averagePositionDelta} avg
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TIME DELTA VS BASELINE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: strategyRoom.averageTimeDeltaSeconds <= 0 ? 'var(--telemetry-green)' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {strategyRoom.averageTimeDeltaSeconds <= 0 ? `${strategyRoom.averageTimeDeltaSeconds.toFixed(1)}s` : `+${strategyRoom.averageTimeDeltaSeconds.toFixed(1)}s`}
                  </div>
                </div>
              </div>

              {/* Mode breakdown */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px', background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TACTICAL CHALLENGES</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {strategyRoom.tacticalChallengesCount}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '180px', background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MULTI-STAGE SIMULATIONS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {strategyRoom.multiStageSimulationsCount}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '180px', background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PRE-RACE STRATEGY</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {strategyRoom.preRaceCount}
                  </div>
                </div>
              </div>

              {/* Simulation tracking gap note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 210, 255, 0.06)', border: '1px solid rgba(0, 210, 255, 0.2)', padding: '0.65rem 0.9rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <Info size={14} color="var(--telemetry-cyan)" />
                <span>Live in-session race radio strategy telemetry is marked unrecorded (feature scheduled for upcoming release).</span>
              </div>

              {/* Recent Strategy Attempts Table */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  RECENT STRATEGY RUNS ({strategyRoom.recentAttempts.length})
                </div>
                {strategyRoom.recentAttempts.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No Strategy Room attempts recorded for this user.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                    <table className="timing-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>SCENARIO</th>
                          <th>MODE</th>
                          <th style={{ textAlign: 'center' }}>SCORE</th>
                          <th style={{ textAlign: 'center' }}>POS DELTA</th>
                          <th style={{ textAlign: 'center' }}>TIME DELTA</th>
                          <th>DATE</th>
                          <th style={{ textAlign: 'right' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {strategyRoom.recentAttempts.map(att => (
                          <tr key={att.attemptId}>
                            <td style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>
                              {att.scenarioTitle || att.scenarioId}
                            </td>
                            <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                              {(att.mode || 'Tactical').toUpperCase()}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--telemetry-cyan)' }}>
                              {att.score}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)', color: att.positionDelta >= 0 ? 'var(--telemetry-green)' : '#f87171' }}>
                              {att.positionDelta > 0 ? `+${att.positionDelta}` : att.positionDelta}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)', color: att.timeDeltaSeconds <= 0 ? 'var(--telemetry-green)' : '#f87171' }}>
                              {att.timeDeltaSeconds ? (att.timeDeltaSeconds <= 0 ? `${att.timeDeltaSeconds.toFixed(1)}s` : `+${att.timeDeltaSeconds.toFixed(1)}s`) : '—'}
                            </td>
                            <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {att.completedAt ? new Date(att.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {att.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PREDICTIONS */}
          {activeTab === 'predictions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SUBMISSIONS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {predictions.submissionsCount}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL POINTS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--f1-red)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {predictions.totalPoints} pts
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BEST / AVG SCORE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {predictions.bestScore > 0 ? `${predictions.bestScore} / ${predictions.averageScore}` : '—'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LEADERBOARD STANDING</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {(predictions.leaderboardRank ?? predictions.seasonRank) ? `#${predictions.leaderboardRank ?? predictions.seasonRank}` : 'Unranked'}
                  </div>
                </div>
              </div>

              {/* Predictions History Table */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  SUBMISSION HISTORY ({(predictions.recentSubmissions || predictions.recentPredictions || []).length})
                </div>
                {(predictions.recentSubmissions || predictions.recentPredictions || []).length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No predictions submitted by this user yet.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                    <table className="timing-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>GRAND PRIX / ROUND</th>
                          <th>SUBMITTED AT</th>
                          <th style={{ textAlign: 'center' }}>PICKS</th>
                          <th style={{ textAlign: 'right' }}>SCORE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(predictions.recentSubmissions || predictions.recentPredictions || []).map((sub: any) => (
                          <tr key={sub.predictionId}>
                            <td>
                              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem' }}>
                                {sub.grandPrixName || sub.roundId}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {sub.roundId}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                            </td>
                            <td style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {sub.picksSummary || (sub.p1Driver ? `P1: ${sub.p1Driver}, P2: ${sub.p2Driver || '—'}, P3: ${sub.p3Driver || '—'}` : 'Full Grid Picks')}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: sub.isScored ? 'var(--f1-red)' : 'var(--text-muted)' }}>
                              {sub.isScored ? `${sub.score ?? 0} pts` : 'Pending'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

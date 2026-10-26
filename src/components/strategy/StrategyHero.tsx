import React from 'react';
import { StrategyScenario } from '../../types/strategy';
import { Sliders, Zap, Trophy, User, ArrowRight, Clock, Flag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StrategyHeroProps {
  featuredScenario: StrategyScenario;
  totalScenarios: number;
}

export const StrategyHero: React.FC<StrategyHeroProps> = ({
  featuredScenario,
  totalScenarios
}) => {
  return (
    <div className="strategy-hero-wrapper">
      <div className="strategy-hero-glow-1" />
      <div className="strategy-hero-glow-2" />

      <div className="strategy-hero-inner">
        {/* Left Column: Mission Briefing */}
        <div className="strategy-hero-left">
          <div className="strategy-hero-badge">
            <Sliders size={13} style={{ color: 'var(--flame-orange, #FF5500)' }} />
            <span>THE GRDX // PIT WALL STRATEGY ROOM</span>
          </div>

          <h1 className="strategy-hero-title">
            BE THE CHIEF <br />
            <span className="strategy-hero-title-accent">
              RACE STRATEGIST
            </span>
          </h1>

          <p className="strategy-hero-desc">
            Take command of the team radio. Analyze tire wear degradation, pit lane loss, undercut windows, and changing weather conditions. Every decision alters race telemetry and finishes.
          </p>

          {/* Quick Stats Pill Row */}
          <div className="strategy-hero-stats">
            <div className="strategy-stat-pill">
              <Zap size={14} style={{ color: 'var(--flame-yellow, #FFB000)' }} />
              <span><strong>{totalScenarios}</strong> Authored Scenarios</span>
            </div>

            <div className="strategy-stat-pill">
              <Trophy size={14} style={{ color: '#00e676' }} />
              <span>Weekly &amp; Overall Ranks</span>
            </div>

            <div className="strategy-stat-pill">
              <Flag size={14} style={{ color: '#00e5ff' }} />
              <span>Deterministic Physics</span>
            </div>
          </div>

          {/* Nav Quick Links */}
          <div className="strategy-hero-nav">
            <Link to="/strategy/leaderboard" className="strategy-hero-link">
              <Trophy size={14} />
              <span>View Leaderboard</span>
            </Link>

            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>

            <Link
              to="/strategy/performance"
              className="strategy-hero-link"
              style={{ color: 'var(--text-secondary, #D1D5DB)' }}
            >
              <User size={14} />
              <span>My Strategy Telemetry</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Scenario of the Day Feature Card */}
        <div className="strategy-featured-card">
          <div className="strategy-featured-header">
            <span className="strategy-featured-tag">
              <Sparkles size={14} />
              Featured Scenario of the Day
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--text-muted, #848B96)',
                backgroundColor: '#08090C',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              Daily Rotation
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted, #848B96)',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              <span>{featuredScenario.circuitName}</span>
              <span>•</span>
              <span style={{ textTransform: 'capitalize' }}>
                {featuredScenario.mode.replace('_', ' ')}
              </span>
            </div>

            <h3 className="strategy-featured-title">
              {featuredScenario.title}
            </h3>

            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #D1D5DB)',
                lineHeight: 1.5,
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {featuredScenario.description}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-muted, #848B96)',
              fontFamily: 'var(--font-mono, monospace)',
              paddingTop: '0.25rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={12} />
              ~{featuredScenario.estimatedDurationMinutes} mins
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Flag size={12} />
              Lap {featuredScenario.initialState.currentLap}/{featuredScenario.initialState.totalLaps}
            </span>
            <span style={{ color: 'var(--flame-orange, #FF5500)', fontWeight: 700 }}>
              P{featuredScenario.initialState.position}
            </span>
          </div>

          <Link
            to={`/strategy/scenario/${featuredScenario.id}`}
            className="strategy-featured-btn"
          >
            <span>Launch Featured Strategy Call</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

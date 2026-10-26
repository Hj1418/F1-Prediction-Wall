import React from 'react';
import { StrategyScenario } from '../../types/strategy';
import { Clock, Flag, Trophy, ArrowRight, ShieldAlert, CloudRain, Disc, GitFork, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScenarioCardProps {
  scenario: StrategyScenario;
  userBestScore?: number;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  pit_window: Clock,
  undercut_overcut: GitFork,
  safety_car: ShieldAlert,
  weather_tires: CloudRain,
  pace_management: Disc,
  race_management: Gauge
};

const CATEGORY_NAMES: Record<string, string> = {
  pit_window: 'Pit Window',
  undercut_overcut: 'Undercut / Overcut',
  safety_car: 'Safety Car / VSC',
  weather_tires: 'Weather & Wet Tires',
  pace_management: 'Tire & Pace Management',
  race_management: 'Grand Prix Strategy'
};

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, userBestScore }) => {
  const IconComponent = CATEGORY_ICONS[scenario.category] || Gauge;
  const isSimulation = scenario.mode === 'race_simulation';

  return (
    <div className="strategy-card">
      {/* Top Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div className="strategy-card-top-row">
          {/* Mode Pill */}
          <span
            className={`strategy-badge-mode ${
              isSimulation
                ? 'strategy-badge-mode--simulation'
                : 'strategy-badge-mode--challenge'
            }`}
          >
            {isSimulation ? 'Race Simulation' : 'Single Challenge'}
          </span>

          {/* Difficulty Pill */}
          <span
            className={`strategy-badge-diff strategy-badge-diff--${scenario.difficulty}`}
          >
            {scenario.difficulty}
          </span>
        </div>

        {/* Category Header */}
        <div className="strategy-card-category">
          <span style={{ color: 'var(--flame-orange, #FF5500)', display: 'inline-flex' }}>
            <IconComponent size={13} />
          </span>
          <span>{CATEGORY_NAMES[scenario.category] || scenario.category}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
          <span style={{ color: 'var(--text-secondary, #D1D5DB)' }}>{scenario.circuitName}</span>
        </div>

        {/* Title */}
        <h3 className="strategy-card-title">
          {scenario.title}
        </h3>

        {/* Short description */}
        <p className="strategy-card-desc">
          {scenario.description}
        </p>
      </div>

      {/* Footer Info & CTA */}
      <div className="strategy-card-footer">
        <div className="strategy-card-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={12} />
            <span>~{scenario.estimatedDurationMinutes} min</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Flag size={12} />
            <span>Lap {scenario.initialState.currentLap} / {scenario.initialState.totalLaps}</span>
          </div>

          {userBestScore !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#00e676', fontWeight: 700 }}>
              <Trophy size={11} />
              <span>{userBestScore}/100</span>
            </div>
          )}
        </div>

        <Link
          to={`/strategy/scenario/${scenario.id}`}
          className="strategy-card-btn"
        >
          <span>Enter Strategy Cockpit</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

import React from 'react';
import {
  BookOpen,
  Calendar,
  Shield,
  Users,
  MapPin,
} from 'lucide-react';

export type SportHubTabKey = 'overview' | 'weekend' | 'teams' | 'drivers' | 'circuits';

export interface SportTabItem {
  key: SportHubTabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  count?: number;
}

export interface SportTabNavigationProps {
  activeTab: SportHubTabKey;
  onTabChange: (tab: SportHubTabKey) => void;
  badgeColor: string;
  teamsCount?: number;
  driversCount?: number;
  circuitsCount?: number;
  competitorLabel?: string;
}

export const SportTabNavigation: React.FC<SportTabNavigationProps> = ({
  activeTab,
  onTabChange,
  badgeColor,
  teamsCount,
  driversCount,
  circuitsCount,
  competitorLabel = 'Drivers',
}) => {
  const tabs: SportTabItem[] = [
    {
      key: 'overview',
      label: 'Overview & Rules',
      icon: BookOpen,
    },
    {
      key: 'weekend',
      label: 'Weekend Structure',
      icon: Calendar,
    },
    {
      key: 'teams',
      label: 'Teams',
      icon: Shield,
      count: teamsCount,
    },
    {
      key: 'drivers',
      label: competitorLabel === 'Rider' ? 'Riders' : 'Drivers',
      icon: Users,
      count: driversCount,
    },
    {
      key: 'circuits',
      label: 'Circuits',
      icon: MapPin,
      count: circuitsCount,
    },
  ];

  return (
    <nav
      aria-label="Championship Pillars Navigation"
      style={{
        backgroundColor: 'var(--bg-surface, #131722)',
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        position: 'sticky',
        top: 0,
        zIndex: 25,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem' }}>
        <div
          role="tablist"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            padding: '0.65rem 0',
          }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                role="tab"
                id={`sport-tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`sport-panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                type="button"
                onClick={() => onTabChange(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: '0.03em',
                  color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                  backgroundColor: isActive ? `${badgeColor}22` : 'transparent',
                  border: isActive ? `1px solid ${badgeColor}55` : '1px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={15} style={{ color: isActive ? badgeColor : 'inherit' }} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      backgroundColor: isActive ? `${badgeColor}40` : 'rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#ffffff' : 'var(--text-muted, #64748b)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

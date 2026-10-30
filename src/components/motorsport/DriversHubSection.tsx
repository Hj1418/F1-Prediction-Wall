import React, { useState, useMemo } from 'react';
import { MotorsportSeriesFilter, DriverProfile } from '../../types/driversHub';
import {
  getDriversBySeries,
  getSeriesDriverCounts,
} from '../../services/motorsport/driversHubService';
import { DriverProfileCard } from './DriverProfileCard';
import { DriverDetailModal } from './DriverDetailModal';
import { Search, Compass, Users, Sparkles, Filter } from 'lucide-react';

export const DriversHubSection: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<MotorsportSeriesFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDriverModal, setActiveDriverModal] = useState<DriverProfile | null>(null);

  const seriesCounts = useMemo(() => getSeriesDriverCounts(), []);

  const drivers = useMemo(() => {
    return getDriversBySeries(selectedSeries, searchQuery);
  }, [selectedSeries, searchQuery]);

  const FILTER_TABS: Array<{ id: MotorsportSeriesFilter; label: string; badgeColor: string }> = [
    { id: 'all', label: 'All Series', badgeColor: '#FF7A00' },
    { id: 'f1', label: 'Formula 1', badgeColor: '#e10600' },
    { id: 'wec', label: 'FIA WEC', badgeColor: '#2563eb' },
    { id: 'motogp', label: 'MotoGP', badgeColor: '#dc2626' },
  ];

  return (
    <section className="paddock-intelligence-section" style={{ padding: '3.5rem 0 2rem' }}>
      <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'var(--telemetry-cyan, #00e5ff)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              backgroundColor: 'rgba(0, 229, 255, 0.08)',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid rgba(0, 229, 255, 0.25)',
            }}
          >
            <Compass size={14} />
            <span>DRIVERS HUB • MOTORSPORT DISCOVERY</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 900,
              margin: '0.35rem 0 0.65rem 0',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            PADDOCK <span style={{ color: '#FF7A00' }}>INTELLIGENCE</span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
              color: 'var(--text-secondary, #9CA3AF)',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.55,
            }}
          >
            Explore the drivers, teams, achievements, and personalities that shape motorsport.
          </p>
        </div>

        {/* Filter Controls: Series Tabs & Keyword Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          }}
        >
          {/* Series Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              maxWidth: '100%',
              paddingBottom: '0.25rem',
            }}
            role="tablist"
            aria-label="Filter drivers by motorsport discipline"
          >
            {FILTER_TABS.map(tab => {
              const isSelected = selectedSeries === tab.id;
              const count = seriesCounts[tab.id];

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedSeries(tab.id)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isSelected ? 800 : 600,
                    letterSpacing: '0.04em',
                    border: isSelected
                      ? `1px solid ${tab.badgeColor}`
                      : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                    backgroundColor: isSelected ? `${tab.badgeColor}22` : 'var(--bg-surface-card, #12151C)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary, #9CA3AF)',
                    boxShadow: isSelected ? `0 0 14px ${tab.badgeColor}33` : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? tab.badgeColor : 'rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted, #94A3B8)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div
            style={{
              position: 'relative',
              minWidth: 'min(100%, 240px)',
              flexGrow: 1,
              maxWidth: '340px',
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #94A3B8)',
              }}
            />
            <input
              type="text"
              placeholder="Search driver, team, or number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Filter drivers"
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                fontSize: '0.84rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                backgroundColor: 'var(--bg-base, #0D0F14)',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Drivers Grid */}
        {drivers.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {drivers.map(driver => (
              <DriverProfileCard
                key={driver.id}
                driver={driver}
                onSelect={selected => setActiveDriverModal(selected)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: 'var(--bg-surface-elevated, #13171F)',
              borderRadius: '12px',
              border: '1px dashed var(--border-subtle, rgba(255, 255, 255, 0.1))',
            }}
          >
            <Users size={32} style={{ color: 'var(--text-muted, #94A3B8)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              No Drivers Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #9CA3AF)', margin: '0 0 1.25rem 0' }}>
              No driver matches your search query &ldquo;{searchQuery}&rdquo; in {selectedSeries.toUpperCase()}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSeries('all');
              }}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 122, 0, 0.15)',
                border: '1px solid rgba(255, 122, 0, 0.35)',
                color: '#FF7A00',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Driver Detail Inspection Modal */}
      <DriverDetailModal
        driver={activeDriverModal}
        onClose={() => setActiveDriverModal(null)}
      />
    </section>
  );
};

export default DriversHubSection;

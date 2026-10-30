import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Users,
  Shield,
  Layers,
} from 'lucide-react';
import {
  getDriversByDiscipline,
  getDisciplineDriverCounts,
  DRIVER_PROFILES,
} from '../services/motorsport/driversHubService';
import { DriverProfileCard } from '../components/motorsport/DriverProfileCard';
import { DriverProfile } from '../types/driversHub';

interface DisciplineTabOption {
  id: string;
  label: string;
  badge: string;
  color: string;
  term: string; // 'Drivers' | 'Riders' | 'Competitors'
  subFilters: Array<{ id: string; label: string }>;
}

const DISCIPLINE_CONFIGS: DisciplineTabOption[] = [
  {
    id: 'all',
    label: 'All Disciplines',
    badge: 'GLOBAL ROSTER',
    color: '#FF4B33',
    term: 'Drivers & Riders',
    subFilters: [{ id: 'all', label: 'All Series' }],
  },
  {
    id: 'formula',
    label: 'Formula Racing',
    badge: 'SINGLE-SEATER PYRAMID',
    color: '#e10600',
    term: 'Drivers',
    subFilters: [
      { id: 'all', label: 'All Formula' },
      { id: 'f1', label: 'Formula 1' },
      { id: 'f2', label: 'Formula 2' },
      { id: 'f3', label: 'Formula 3' },
      { id: 'f4', label: 'Formula 4' },
      { id: 'formula-e', label: 'Formula E' },
    ],
  },
  {
    id: 'motorcycle',
    label: 'Motorcycle Racing',
    badge: 'TWO-WHEEL PROTOTYPES',
    color: '#dc2626',
    term: 'Riders',
    subFilters: [
      { id: 'all', label: 'All Motorcycles' },
      { id: 'motogp', label: 'MotoGP' },
      { id: 'moto2', label: 'Moto2' },
      { id: 'moto3', label: 'Moto3' },
    ],
  },
  {
    id: 'endurance',
    label: 'Endurance / GT',
    badge: 'MULTI-CLASS SPORTSCARS',
    color: '#2563eb',
    term: 'Drivers',
    subFilters: [
      { id: 'all', label: 'All Endurance' },
      { id: 'hypercar', label: 'FIA WEC Hypercar' },
      { id: 'lmgt3', label: 'FIA WEC LMGT3' },
      { id: 'gt-world-challenge', label: 'GT World Challenge' },
    ],
  },
  {
    id: 'other',
    label: 'Other Disciplines',
    badge: 'RALLY & NATIONAL COMPETITION',
    color: '#f97316',
    term: 'Competitors',
    subFilters: [
      { id: 'all', label: 'All Other' },
      { id: 'wrc', label: 'WRC Rally' },
      { id: 'indian-motorsport', label: 'Indian Motorsport' },
    ],
  },
];

export const DriversHubPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const disciplineParam = searchParams.get('discipline') || 'all';
  const seriesParam = searchParams.get('series') || 'all';

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(disciplineParam);
  const [selectedSubSeries, setSelectedSubSeries] = useState<string>(seriesParam);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize state when URL query parameters change
  useEffect(() => {
    if (disciplineParam && disciplineParam !== selectedDiscipline) {
      setSelectedDiscipline(disciplineParam);
      setSelectedSubSeries('all');
    }
  }, [disciplineParam]);

  useEffect(() => {
    document.title = 'Motorsport Drivers Hub • THE GRDX';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const counts = useMemo(() => getDisciplineDriverCounts(), []);

  // Update query parameter when tab changes
  const handleSelectDiscipline = (discId: string) => {
    setSelectedDiscipline(discId);
    setSelectedSubSeries('all');
    const newParams = new URLSearchParams(searchParams);
    if (discId === 'all') {
      newParams.delete('discipline');
    } else {
      newParams.set('discipline', discId);
    }
    newParams.delete('series');
    setSearchParams(newParams);
  };

  const handleSelectSubSeries = (subId: string) => {
    setSelectedSubSeries(subId);
    const newParams = new URLSearchParams(searchParams);
    if (subId === 'all') {
      newParams.delete('series');
    } else {
      newParams.set('series', subId);
    }
    setSearchParams(newParams);
  };

  const activeConfig = useMemo(() => {
    return DISCIPLINE_CONFIGS.find(d => d.id === selectedDiscipline) || DISCIPLINE_CONFIGS[0];
  }, [selectedDiscipline]);

  // Retrieve filtered drivers list
  const filteredDrivers: DriverProfile[] = useMemo(() => {
    return getDriversByDiscipline(selectedDiscipline, selectedSubSeries, searchQuery);
  }, [selectedDiscipline, selectedSubSeries, searchQuery]);

  return (
    <div className="drivers-hub-page" style={{ paddingBottom: '6rem' }}>
      {/* 1. TOP BREADCRUMB NAVIGATION */}
      <section style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '0.85rem 0' }}>
        <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <Link
              to="/explore"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={14} />
              <span>EXPLORE MOTORSPORT</span>
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: activeConfig.color, fontWeight: 800 }}>
              {activeConfig.label.toUpperCase()} — {activeConfig.term.toUpperCase()} HUB
            </span>
          </div>
        </div>
      </section>

      {/* 2. HERO HEADER SECTION */}
      <section className="explore-hero-section" style={{ padding: '3.5rem 0 2.5rem' }}>
        <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: activeConfig.color,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              backgroundColor: `${activeConfig.color}15`,
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              border: `1px solid ${activeConfig.color}33`,
            }}
          >
            <Compass size={14} />
            <span>{activeConfig.badge}</span>
          </div>

          <h1 className="explore-hero-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', marginBottom: '0.75rem' }}>
            {selectedDiscipline === 'all'
              ? 'MOTORSPORT DRIVERS & RIDERS HUB'
              : `${activeConfig.label.toUpperCase()} — ${activeConfig.term.toUpperCase()} HUB`}
          </h1>

          <p className="explore-hero-description" style={{ maxWidth: '780px', margin: '0 auto 2rem' }}>
            Discover drivers, riders, and competitors across the world’s premier racing championships.
            Explore biographical journeys, early beginnings, historical teams, verified achievements, and racing legacies.
          </p>

          {/* Search Bar Input */}
          <div style={{ maxWidth: '580px', margin: '0 auto', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: activeConfig.color,
              }}
            />
            <input
              type="text"
              placeholder={`Search by name, racing number, team, or nationality...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.85rem',
                fontSize: '0.92rem',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated, #14171E)',
                color: '#ffffff',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '0.2rem 0.5rem',
                }}
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. DISCIPLINE SELECTOR TABS & SUB-SERIES FILTERS */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
          {/* Main Discipline Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {DISCIPLINE_CONFIGS.map(tab => {
              const isSelected = selectedDiscipline === tab.id;
              const countVal = counts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectDiscipline(tab.id)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isSelected ? 800 : 600,
                    border: isSelected ? `1px solid ${tab.color}` : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? `${tab.color}22` : 'var(--bg-surface-elevated, #14171E)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: isSelected ? `0 0 14px ${tab.color}33` : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? `${tab.color}44` : 'rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    }}
                  >
                    {countVal}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-series Filter Pills (If active discipline has sub-options) */}
          {activeConfig.subFilters.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                overflowX: 'auto',
                paddingTop: '0.65rem',
                marginTop: '0.4rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                scrollbarWidth: 'none',
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginRight: '0.35rem',
                  whiteSpace: 'nowrap',
                }}
              >
                SERIES FILTER:
              </span>
              {activeConfig.subFilters.map(sub => {
                const isSubSelected = selectedSubSeries === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelectSubSeries(sub.id)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isSubSelected ? 800 : 500,
                      border: isSubSelected ? `1px solid ${activeConfig.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSubSelected ? `${activeConfig.color}25` : 'rgba(255, 255, 255, 0.03)',
                      color: isSubSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. DRIVER PROFILES GRID */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
          {/* Section Summary Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
                {activeConfig.label} {activeConfig.term} ({filteredDrivers.length})
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing verified competitor records with dedicated evergreen profiles
              </span>
            </div>

            {(selectedDiscipline !== 'all' || selectedSubSeries !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDiscipline('all');
                  setSelectedSubSeries('all');
                  setSearchQuery('');
                  setSearchParams({});
                }}
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent, #FF4B33)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 700,
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Competitor Cards Grid */}
          {filteredDrivers.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredDrivers.map(driver => (
                <DriverProfileCard key={driver.id} driver={driver} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 1.5rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                }}
              >
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                No Competitors Found
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                No driver or rider records matched the filter &ldquo;<strong>{searchQuery || selectedSubSeries}</strong>&rdquo;. Try searching by name, team, or clear active filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDiscipline('all');
                  setSelectedSubSeries('all');
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="btn btn-primary btn-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DriversHubPage;

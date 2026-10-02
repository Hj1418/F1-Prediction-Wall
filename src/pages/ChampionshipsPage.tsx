import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Zap,
  Clock,
  Flag,
  Shield,
  Layers,
  ExternalLink,
  ChevronRight,
  Info,
  Award,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  MOTORSPORT_CATEGORIES,
  CHAMPIONSHIPS_REGISTRY,
  FORMAT_COMPARISONS,
} from '../services/motorsport/motorsportRegistry';
import { Championship, MotorsportCategoryId } from '../types/motorsport';
import { isChampionshipDataReady } from '../services/motorsport/championshipDataService';
import { useApp } from '../context/AppContext';

export const ChampionshipsPage: React.FC = () => {
  const { openSearch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChampionship, setActiveChampionship] = useState<Championship | null>(null);

  // Filter championships purely client-side from static lightweight registry
  const filteredChampionships = useMemo(() => {
    return CHAMPIONSHIPS_REGISTRY.filter(champ => {
      const matchesCategory =
        selectedCategory === 'all' || champ.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        champ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        champ.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        champ.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        champ.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="championships-page" style={{ paddingBottom: '5rem' }}>
      {/* 1. HERO HEADER */}
      <section className="explore-hero-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="explore-hero-title">
            THE WORLD OF <span className="explore-hero-title-accent">MOTORSPORT</span>
          </h1>

          <p className="explore-hero-description">
            From open-wheel to endurance, from two wheels to rally — discover championships, teams, circuits and stories from across motorsport.
          </p>

          {/* Universal Search CTA */}
          <div className="explore-hero-search-wrapper">
            <button
              type="button"
              onClick={openSearch}
              className="explore-search-trigger"
            >
              <Search size={16} style={{ color: 'var(--f1-red)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
                Search drivers, teams, circuits, championships...
              </span>
              <kbd className="hero-search-kbd" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>⌘K</kbd>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILL SELECTOR & SEARCH */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Category Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                overflowX: 'auto',
                paddingBottom: '0.25rem',
                maxWidth: '100%',
              }}
            >
              {MOTORSPORT_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isSelected ? 800 : 600,
                      letterSpacing: '0.04em',
                      border: isSelected ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(225, 6, 0, 0.15)' : 'var(--bg-surface-elevated)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div
              style={{
                position: 'relative',
                minWidth: 'min(100%, 200px)',
                flexGrow: 1,
                maxWidth: '300px',
              }}
            >
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Filter championships..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-base)',
                  color: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHAMPIONSHIPS GRID */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div className="explore-section-header">
            <h2 className="explore-section-title">BROWSE BY MOTORSPORT</h2>
            <span className="explore-section-subtitle">Select a championship to enter its dedicated hub</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredChampionships.map(champ => {
              const isF1 = champ.isF1StartingPoint;
              const hasHub = isF1 || isChampionshipDataReady(champ.id);
              const destinationUrl = isF1
                ? '/explore/f1'
                : hasHub
                ? `/explore/${champ.id}`
                : champ.officialUrl;

              return (
                <div
                  key={champ.id}
                  className="explore-card"
                  style={{
                    '--card-accent': champ.badgeColor,
                    '--card-glow': `${champ.badgeColor}33`,
                  } as React.CSSProperties}
                >
                  <div className="explore-card-body">
                    {/* Top: Short identifier badge & vehicle/discipline */}
                    <div className="explore-card-top">
                      <span
                        className="explore-card-badge"
                        style={{
                          backgroundColor: `${champ.badgeColor}18`,
                          color: champ.badgeColor,
                          border: `1px solid ${champ.badgeColor}40`,
                        }}
                      >
                        {champ.shortName}
                      </span>
                      <span className="explore-card-discipline">
                        {champ.vehicleType.split('(')[0].trim()}
                      </span>
                    </div>

                    {/* Motorsport Name */}
                    <h3 className="explore-card-name" style={{ marginTop: '0.85rem' }}>
                      {champ.name}
                    </h3>

                    {/* Tagline */}
                    <p className="explore-card-tagline">
                      {champ.tagline}
                    </p>
                  </div>

                  {/* Footer: Overview action & Enter Hub affordance */}
                  <div className="explore-card-footer">
                    <button
                      type="button"
                      onClick={() => setActiveChampionship(champ)}
                      className="explore-card-info-btn"
                    >
                      <Info size={13} />
                      <span>Overview</span>
                    </button>

                    {hasHub ? (
                      <Link
                        to={destinationUrl}
                        className="explore-card-action"
                      >
                        <span>ENTER HUB</span>
                        <ChevronRight size={13} />
                      </Link>
                    ) : (
                      <a
                        href={champ.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explore-card-action"
                        style={{ background: 'transparent', borderColor: 'var(--border-subtle)' }}
                      >
                        <span>OFFICIAL SITE</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredChampionships.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              No championships match your filter. Try selecting "All Motorsport".
            </div>
          )}
        </div>
      </section>

      {/* 4. FORMAT COMPARISON ARCHITECTURE SECTION */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '3.5rem 0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: 'var(--telemetry-cyan, #00e5ff)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              MOTORSPORT ARCHITECTURE
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 900,
                margin: '0 0 0.5rem 0',
                color: '#ffffff',
              }}
            >
              HOW DIFFERENT MOTORSPORTS WORK
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: 1.5,
              }}
            >
              Not every motorsport follows Formula 1's Grand Prix weekend format. Here is how
              major event structures compare across disciplines.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {FORMAT_COMPARISONS.map(fmt => (
              <div
                key={fmt.formatType}
                style={{
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={16} style={{ color: 'var(--f1-red)' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {fmt.title}
                  </h3>
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--telemetry-cyan, #00e5ff)',
                    backgroundColor: 'rgba(0, 229, 255, 0.08)',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '4px',
                    lineHeight: 1.4,
                  }}
                >
                  {fmt.structure}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  {fmt.focus}
                </p>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <strong>Examples:</strong> {fmt.championshipExample}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MODAL FOR DETAILED CHAMPIONSHIP VIEW */}
      {activeChampionship && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setActiveChampionship(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: activeChampionship.badgeColor }}>
                  {activeChampionship.tier}
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0.25rem 0 0 0', color: '#fff' }}>
                  {activeChampionship.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveChampionship(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {activeChampionship.beginnerOverview}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Format Architecture
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fff' }}>
                  {activeChampionship.formatDescription}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Vehicle & Powertrain
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fff' }}>
                  {activeChampionship.vehicleType} • {activeChampionship.powertrain}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Key Regulations & Features
                </div>
                <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeChampionship.keyFeatures.map((feat, idx) => (
                    <li key={idx} style={{ marginBottom: '0.3rem' }}>{feat}</li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Points & Scoring
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fff' }}>
                  {activeChampionship.scoringSummary}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveChampionship(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Close
              </button>

              <a
                href={activeChampionship.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--f1-red)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                Visit Official Source <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChampionshipsPage;

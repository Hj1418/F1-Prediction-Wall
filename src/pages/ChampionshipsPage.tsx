import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  ChevronRight,
  Info,
  Flag,
  Gauge,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CHAMPIONSHIPS_REGISTRY } from '../services/motorsport/motorsportRegistry';
import { Championship } from '../types/motorsport';
import { SUPPORTED_MOTORSPORT_GROUPS, SupportedCategoryGroup } from '../services/motorsport/motorsportData';
import { useApp } from '../context/AppContext';

export const ChampionshipsPage: React.FC = () => {
  const { openSearch } = useApp();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalChampionship, setActiveModalChampionship] = useState<Championship | null>(null);

  useEffect(() => {
    document.title = 'Explore Motorsport • THE GRDX';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter groups and championships based on selected pill & search query
  const filteredGroups = useMemo(() => {
    return SUPPORTED_MOTORSPORT_GROUPS.map(group => {
      const championships = CHAMPIONSHIPS_REGISTRY.filter(champ => {
        const inGroup = group.championshipIds.includes(champ.id);
        if (!inGroup) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase().trim();
        const gov = (champ as any)['governingBody'] || '';
        return (
          champ.name.toLowerCase().includes(q) ||
          champ.shortName.toLowerCase().includes(q) ||
          champ.tagline.toLowerCase().includes(q) ||
          champ.vehicleType.toLowerCase().includes(q) ||
          gov.toLowerCase().includes(q)
        );
      });

      return {
        ...group,
        championships,
      };
    }).filter(group => {
      const matchesPill = selectedDiscipline === 'all' || group.id === selectedDiscipline;
      return matchesPill && group.championships.length > 0;
    });
  }, [selectedDiscipline, searchQuery]);

  const totalMatchingChampionships = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.championships.length, 0);
  }, [filteredGroups]);

  return (
    <div className="explore-landing-hub" style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* 1. MOTORSPORT DISCOVERY HERO */}
      <section
        style={{
          padding: '4.5rem 1.5rem 3.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(225, 6, 0, 0.12), transparent)',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          {/* Tagline Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--f1-red, #e10600)',
              backgroundColor: 'rgba(225, 6, 0, 0.08)',
              border: '1px solid rgba(225, 6, 0, 0.25)',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Compass size={13} />
            <span>DISCOVERY & KNOWLEDGE PLATFORM</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              margin: '0 0 1rem 0',
              lineHeight: 1.1,
            }}
          >
            THE WORLD OF <span className="explore-hero-title-accent">MOTORSPORT</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary, #94a3b8)',
              maxWidth: '680px',
              margin: '0 auto 2.25rem auto',
              lineHeight: 1.6,
            }}
          >
            From open-wheel racing to endurance and two-wheel championships, discover the series,
            teams, drivers, and circuits that shape motorsport.
          </p>

          {/* Quick Universal Search Trigger */}
          <div style={{ maxWidth: '460px', margin: '0 auto' }}>
            <button
              type="button"
              onClick={openSearch}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                backgroundColor: 'var(--bg-surface, #131722)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                borderRadius: '10px',
                color: 'var(--text-secondary, #94a3b8)',
                cursor: 'pointer',
                fontSize: '0.86rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.12))';
              }}
            >
              <Search size={16} style={{ color: 'var(--f1-red, #e10600)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
                Search drivers, teams, circuits, championships...
              </span>
              <kbd
                style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-muted, #64748b)',
                  fontFamily: 'var(--font-mono, monospace)',
                  flexShrink: 0,
                }}
              >
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </section>

      {/* 2. DISCIPLINE SELECTOR & QUICK FILTER BAR */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          backgroundColor: 'var(--bg-surface, #131722)',
          padding: '1rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Discipline Navigation Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                overflowX: 'auto',
                paddingBottom: '0.15rem',
                maxWidth: '100%',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedDiscipline('all')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: selectedDiscipline === 'all' ? 800 : 600,
                  letterSpacing: '0.04em',
                  border: selectedDiscipline === 'all' ? '1px solid var(--f1-red, #e10600)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  backgroundColor: selectedDiscipline === 'all' ? 'rgba(225, 6, 0, 0.15)' : 'var(--bg-surface-elevated, #1a202c)',
                  color: selectedDiscipline === 'all' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                  boxShadow: selectedDiscipline === 'all' ? '0 0 12px rgba(225, 6, 0, 0.25)' : 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                All Disciplines ({CHAMPIONSHIPS_REGISTRY.length})
              </button>

              {SUPPORTED_MOTORSPORT_GROUPS.map(group => {
                const isSelected = selectedDiscipline === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedDiscipline(group.id)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: isSelected ? 800 : 600,
                      letterSpacing: '0.04em',
                      border: isSelected ? `1px solid ${group.badgeColor}` : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      backgroundColor: isSelected ? `${group.badgeColor}22` : 'var(--bg-surface-elevated, #1a202c)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                      boxShadow: isSelected ? `0 0 12px ${group.badgeColor}33` : 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {group.title}
                  </button>
                );
              })}
            </div>

            {/* In-page filter search */}
            <div
              style={{
                position: 'relative',
                minWidth: 'min(100%, 220px)',
                flexGrow: 1,
                maxWidth: '320px',
              }}
            >
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)',
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
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                  backgroundColor: 'var(--bg-base, #0d0f14)',
                  color: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLEAN SERIES-CARD GRID */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.25rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: 'var(--telemetry-cyan, #00e5ff)',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              <span>BROWSE BY MOTORSPORT</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 0.35rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              SELECT A MOTORSPORT TO ENTER ITS HUB
            </h2>
            <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem', margin: 0 }}>
              Each championship contains dedicated rules, weekend formats, active teams, official drivers, and circuit profiles.
            </p>
          </div>

          {/* Discipline Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            {filteredGroups.map(group => (
              <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Group Heading */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: group.badgeColor,
                        boxShadow: `0 0 8px ${group.badgeColor}`,
                      }}
                    />
                    <h3
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: 0,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {group.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: group.badgeColor,
                        backgroundColor: `${group.badgeColor}15`,
                        border: `1px solid ${group.badgeColor}33`,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      {group.badge}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                    {group.championships.length} Championship{group.championships.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Series Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {group.championships.map(champ => {
                    const destinationUrl = `/explore/${champ.id}`;

                    return (
                      <div
                        key={champ.id}
                        className="series-card explore-card"
                        style={{
                          backgroundColor: 'var(--bg-surface, #131722)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        {/* Top Category Accent Line */}
                        <div
                          style={{
                            height: '3px',
                            width: '100%',
                            backgroundColor: champ.badgeColor,
                          }}
                        />

                        {/* Card Content Body */}
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          {/* Top Identity Meta */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              marginBottom: '0.85rem',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono, monospace)',
                                fontWeight: 800,
                                color: champ.badgeColor,
                                backgroundColor: `${champ.badgeColor}18`,
                                border: `1px solid ${champ.badgeColor}35`,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {champ.shortName}
                            </span>

                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-muted, #64748b)',
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              {champ.vehicleType}
                            </span>
                          </div>

                          {/* Official Championship Name */}
                          <h4
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 900,
                              color: '#ffffff',
                              margin: '0 0 0.5rem 0',
                              letterSpacing: '-0.02em',
                              lineHeight: 1.25,
                            }}
                          >
                            {champ.name}
                          </h4>

                          {/* Tagline / Short Description */}
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: 'var(--text-secondary, #94a3b8)',
                              margin: '0 0 1.25rem 0',
                              lineHeight: 1.5,
                              flex: 1,
                            }}
                          >
                            {champ.tagline}
                          </p>

                          {/* Specification Highlights */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: '0.5rem',
                              padding: '0.75rem',
                              backgroundColor: 'rgba(0, 0, 0, 0.25)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.04)',
                              marginBottom: '1.25rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            <div>
                              <span style={{ color: 'var(--text-muted, #64748b)', display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                                TOP SPEED
                              </span>
                              <strong style={{ color: '#ffffff' }}>{champ.topSpeed}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted, #64748b)', display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                                CATEGORY
                              </span>
                              <strong style={{ color: '#ffffff' }}>{champ.tier}</strong>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                              paddingTop: '1rem',
                              marginTop: 'auto',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveModalChampionship(champ)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: 'transparent',
                                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                                borderRadius: '6px',
                                padding: '0.45rem 0.75rem',
                                color: 'var(--text-secondary, #94a3b8)',
                                fontSize: '0.76rem',
                                fontFamily: 'var(--font-mono, monospace)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
                                e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255, 255, 255, 0.12))';
                              }}
                            >
                              <Info size={13} />
                              <span>Overview</span>
                            </button>

                            <Link
                              to={destinationUrl}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                padding: '0.45rem 0.95rem',
                                borderRadius: '6px',
                                backgroundColor: `${champ.badgeColor}22`,
                                border: `1px solid ${champ.badgeColor}55`,
                                color: '#ffffff',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono, monospace)',
                                letterSpacing: '0.04em',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = champ.badgeColor;
                                e.currentTarget.style.boxShadow = `0 0 16px ${champ.badgeColor}55`;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = `${champ.badgeColor}22`;
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <span>ENTER HUB</span>
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Discipline Drivers Gateway Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    padding: '0.85rem 1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted, #64748b)',
                    }}
                  >
                    {group.id === 'formula' && 'FORMULA RACING — DRIVERS HUB'}
                    {group.id === 'motorcycle' && 'MOTORCYCLE RACING — RIDERS HUB'}
                    {group.id === 'endurance' && 'ENDURANCE / GT — DRIVERS HUB'}
                    {group.id === 'other' && 'OTHER DISCIPLINES — COMPETITORS HUB'}
                  </span>

                  {group.id === 'formula' && (
                    <Link
                      to="/explore/drivers?discipline=formula"
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--telemetry-cyan, #00e5ff)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      View All Formula Racing Drivers <ChevronRight size={13} />
                    </Link>
                  )}
                  {group.id === 'motorcycle' && (
                    <Link
                      to="/explore/drivers?discipline=motorcycle"
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--telemetry-cyan, #00e5ff)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      View All Motorcycle Racing Riders <ChevronRight size={13} />
                    </Link>
                  )}
                  {group.id === 'endurance' && (
                    <Link
                      to="/explore/drivers?discipline=endurance"
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--telemetry-cyan, #00e5ff)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      View All Endurance / GT Drivers <ChevronRight size={13} />
                    </Link>
                  )}
                  {group.id === 'other' && (
                    <Link
                      to="/explore/drivers?discipline=other"
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--telemetry-cyan, #00e5ff)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      View All Other Disciplines Competitors <ChevronRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalMatchingChampionships === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                color: 'var(--text-secondary, #94a3b8)',
                backgroundColor: 'var(--bg-surface, #131722)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              }}
            >
              <p style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
                No motorsport championships matched &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDiscipline('all');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. QUICK OVERVIEW MODAL */}
      {activeModalChampionship && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setActiveModalChampionship(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #131722)',
              border: `1px solid ${activeModalChampionship.badgeColor}40`,
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: `0 24px 48px rgba(0, 0, 0, 0.8), 0 0 32px ${activeModalChampionship.badgeColor}25`,
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: activeModalChampionship.badgeColor,
                    textTransform: 'uppercase',
                  }}
                >
                  {activeModalChampionship.tier} • {activeModalChampionship.governingBody}
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0.25rem 0 0 0', color: '#fff' }}>
                  {activeModalChampionship.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalChampionship(null)}
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

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {activeModalChampionship.beginnerOverview}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>POWERTRAIN</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                  {activeModalChampionship.powertrain}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TOP SPEED</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                  {activeModalChampionship.topSpeed}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-base)', padding: '0.85rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                WEEKEND FORMAT ARCHITECTURE
              </span>
              <p style={{ fontSize: '0.84rem', color: '#fff', margin: '0.35rem 0 0 0', lineHeight: 1.45 }}>
                {activeModalChampionship.formatDescription}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <Link
                to={`/explore/${activeModalChampionship.id}`}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  justifyContent: 'center',
                  backgroundColor: activeModalChampionship.badgeColor,
                  borderColor: activeModalChampionship.badgeColor,
                  fontWeight: 800,
                }}
                onClick={() => setActiveModalChampionship(null)}
              >
                ENTER CHAMPIONSHIP HUB
              </Link>
              <button
                type="button"
                onClick={() => setActiveModalChampionship(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChampionshipsPage;

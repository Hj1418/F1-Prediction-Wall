import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Compass,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Flag,
  Trophy,
  Zap,
  Sparkles,
  Layers,
  Clock,
  Gauge,
  RotateCw,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getAllGlobalCircuits,
  getGlobalCircuitById,
  searchGlobalCircuits,
} from '../services/circuits/globalCircuitsService';
import { CircuitEntity, CircuitLayout } from '../types/circuit';
import { CircuitCard } from '../components/circuits/CircuitCard';
import { CircuitVector } from '../components/circuits/CircuitVector';

type ChampionshipFilter = 'all' | 'f1' | 'motogp' | 'wec' | 'gt' | 'fe' | 'india' | 'wrc';

interface FilterOption {
  id: ChampionshipFilter;
  label: string;
  badgeColor?: string;
}

const CHAMPIONSHIP_FILTERS: FilterOption[] = [
  { id: 'all', label: 'All Disciplines' },
  { id: 'f1', label: 'Formula 1', badgeColor: '#e10600' },
  { id: 'motogp', label: 'MotoGP™', badgeColor: '#dc2626' },
  { id: 'wec', label: 'FIA WEC', badgeColor: '#002b49' },
  { id: 'gt', label: 'GT World Challenge', badgeColor: '#d97706' },
  { id: 'fe', label: 'Formula E', badgeColor: '#00d2be' },
  { id: 'india', label: 'Indian Motorsport 🇮🇳', badgeColor: '#ff9933' },
  { id: 'wrc', label: 'FIA WRC', badgeColor: '#1e3a8a' },
];

export const CircuitsPage: React.FC = () => {
  const { circuitId, championshipId } = useParams<{ circuitId?: string; championshipId?: string }>();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [championshipFilter, setChampionshipFilter] = useState<ChampionshipFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');

  // Resolve active circuit if circuitId param is present
  const activeCircuit: CircuitEntity | undefined = useMemo(() => {
    if (!circuitId) return undefined;
    return getGlobalCircuitById(circuitId);
  }, [circuitId]);

  // Reset or initialize selected layout when active circuit changes
  useEffect(() => {
    if (activeCircuit) {
      const primary = activeCircuit.layouts.find(l => l.isPrimary) || activeCircuit.layouts[0];
      setSelectedLayoutId(primary?.layoutId || '');
      document.title = `${activeCircuit.name} | Circuit Guide • The Grid`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.title = 'Global Motorsport Circuits Library • The Grid';
    }
  }, [activeCircuit]);

  // Active layout for detail view
  const currentLayout: CircuitLayout | undefined = useMemo(() => {
    if (!activeCircuit) return undefined;
    return (
      activeCircuit.layouts.find(l => l.layoutId === selectedLayoutId) ||
      activeCircuit.layouts.find(l => l.isPrimary) ||
      activeCircuit.layouts[0]
    );
  }, [activeCircuit, selectedLayoutId]);

  // Filtered circuits list for library browse view
  const filteredCircuits = useMemo(() => {
    return searchGlobalCircuits(searchTerm, championshipFilter, typeFilter);
  }, [searchTerm, championshipFilter, typeFilter]);

  // All circuits for quick carousel/switcher
  const allCircuits = useMemo(() => getAllGlobalCircuits(), []);

  // =========================================================================
  // VIEW 1: DEDICATED CIRCUIT DETAIL EXPERIENCE
  // =========================================================================
  if (activeCircuit && currentLayout) {
    const isAntiClockwise = currentLayout.direction === 'Anti-Clockwise';
    const crossHostings = activeCircuit.championships;

    return (
      <div className="circuit-detail-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 5rem' }}>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.75rem',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (championshipId) {
                navigate(`/explore/${championshipId}`);
              } else {
                navigate('/circuits');
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #cbd5e1)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={14} />
            <span>{championshipId ? `BACK TO ${championshipId.toUpperCase()} HUB` : 'ALL CIRCUITS'}</span>
          </button>
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>/</span>
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{activeCircuit.location.country}</span>
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>/</span>
          <span style={{ color: '#ffffff', fontWeight: 800 }}>{activeCircuit.name}</span>
        </nav>

        {/* 1. CIRCUIT HERO */}
        <section
          style={{
            background: 'linear-gradient(180deg, var(--bg-surface, #131722) 0%, var(--bg-surface-elevated, #1a1f2e) 100%)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: 'clamp(1.25rem, 3vw, 2.25rem)',
            marginBottom: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '2rem',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Track Visualization with Direction & Multi-Layout Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CircuitVector
              mapSvg={currentLayout.mapSvg || `${activeCircuit.circuitId}.svg`}
              name={`${activeCircuit.name} - ${currentLayout.name}`}
              direction={currentLayout.direction}
              lengthKm={currentLayout.lengthKm}
              turns={currentLayout.turns}
              variant="hero"
            />

            {/* Layout Configuration Switcher (if multiple layouts exist) */}
            {activeCircuit.layouts.length > 1 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-base, #0d0f17)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '10px',
                  padding: '0.4rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--text-muted, #94a3b8)',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                    paddingLeft: '0.4rem',
                  }}
                >
                  Circuit Configurations ({activeCircuit.layouts.length}):
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {activeCircuit.layouts.map(l => {
                    const isSelected = l.layoutId === currentLayout.layoutId;
                    return (
                      <button
                        key={l.layoutId}
                        type="button"
                        onClick={() => setSelectedLayoutId(l.layoutId)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: isSelected
                            ? '1px solid var(--f1-red, #e10600)'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          backgroundColor: isSelected ? 'rgba(225, 6, 0, 0.15)' : 'transparent',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        {isSelected && <CheckCircle2 size={12} color="var(--f1-red, #e10600)" />}
                        <span>{l.name}</span>
                        <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>({l.lengthKm} km)</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Hero Metadata & Key Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--f1-red, #e10600)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                <span>{activeCircuit.location.flag}</span>
                <span>{activeCircuit.location.city}, {activeCircuit.location.country}</span>
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.85rem, 3.8vw, 2.75rem)',
                  fontWeight: 900,
                  margin: 0,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                }}
              >
                {activeCircuit.name}
              </h1>
              {activeCircuit.shortName && activeCircuit.shortName !== activeCircuit.name && (
                <div
                  style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary, #cbd5e1)',
                    marginTop: '0.25rem',
                    fontWeight: 600,
                  }}
                >
                  "{activeCircuit.shortName}"
                </div>
              )}
            </div>

            {/* Selected Layout Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono, monospace)',
                width: 'fit-content',
              }}
            >
              <Layers size={14} color="var(--f1-red, #e10600)" />
              <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Active Layout:</span>
              <strong style={{ color: '#fff' }}>{currentLayout.name}</strong>
            </div>

            {/* High-Impact Stat Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '0.65rem',
                backgroundColor: 'var(--bg-base, #0d0f17)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Track Length</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>{currentLayout.lengthKm} km</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Total Turns</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--f1-red, #e10600)' }}>{currentLayout.turns}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Direction</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isAntiClockwise ? '#00e676' : '#3b82f6', marginTop: '4px' }}>
                  {currentLayout.direction}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Circuit Type</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#eab308', marginTop: '4px' }}>
                  {currentLayout.type}
                </div>
              </div>
            </div>

            {/* Official Lap Record Badge */}
            {currentLayout.lapRecord && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <Clock size={20} color="var(--f1-red, #e10600)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}>
                    Official Race Lap Record ({currentLayout.lapRecord.category})
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)' }}>
                    {currentLayout.lapRecord.time}
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary, #cbd5e1)', marginLeft: '0.5rem' }}>
                      • {currentLayout.lapRecord.driver} ({currentLayout.lapRecord.year})
                    </span>
                  </div>
                  {currentLayout.lapRecord.teamOrCar && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
                      Vehicle: {currentLayout.lapRecord.teamOrCar}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. MAIN DETAIL GRID: TECHNICAL FACTS, CHARACTERISTICS, CHAMPIONSHIPS, HISTORY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '2rem' }}>
          {/* Column A: Characteristics & Technical Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Track Characteristics Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #131722)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '14px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--f1-red, #e10600)', marginBottom: '0.5rem' }}>
                <Gauge size={16} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                  Track Characteristics & Driving Profile
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: '#ffffff' }}>
                Distinctive Dynamics
              </h2>
              <p style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                {activeCircuit.characteristics.summary}
              </p>

              {/* Verified Metrics Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>
                {[
                  { label: 'Speed Profile', value: activeCircuit.characteristics.speed, color: '#3b82f6' },
                  { label: 'Braking Severity', value: activeCircuit.characteristics.braking, color: '#ef4444' },
                  { label: 'Overtaking Potential', value: activeCircuit.characteristics.overtaking, color: '#10b981' },
                  { label: 'Tyre Degradation', value: activeCircuit.characteristics.tyreWear, color: '#f59e0b' },
                ].map(metric => (
                  <div
                    key={metric.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.75rem',
                      backgroundColor: 'var(--bg-base, #0d0f17)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{metric.label}</span>
                    <strong style={{ color: metric.color }}>{metric.value}</strong>
                  </div>
                ))}

                {currentLayout.longestStraightMeters && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.75rem',
                      backgroundColor: 'var(--bg-base, #0d0f17)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Longest Straight</span>
                    <strong style={{ color: '#ffffff' }}>{currentLayout.longestStraightMeters} metres</strong>
                  </div>
                )}

                {currentLayout.elevationChangeMeters && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.75rem',
                      backgroundColor: 'var(--bg-base, #0d0f17)',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Elevation Variance</span>
                    <strong style={{ color: '#ffffff' }}>{currentLayout.elevationChangeMeters} metres</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Corners */}
            {activeCircuit.keyCorners && activeCircuit.keyCorners.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface, #131722)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff9933', marginBottom: '0.5rem' }}>
                  <Compass size={16} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                    Signature Corners
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#ffffff' }}>
                  Iconic Turning Points
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activeCircuit.keyCorners.map(corner => (
                    <div
                      key={String(corner.number)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-base, #0d0f17)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--f1-red, #e10600)',
                            backgroundColor: 'rgba(225, 6, 0, 0.15)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          T{corner.number}
                        </span>
                        <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>{corner.name}</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.5 }}>
                        {corner.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column B: Championships, History, Did You Know */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Championships & Series Hosted */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #131722)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '14px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
                <Trophy size={16} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                  GLOBAL MOTORSPORT HOSTING
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#ffffff' }}>
                Hosted Series & Rounds
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {crossHostings.map((ch, idx) => (
                  <Link
                    key={`${ch.championshipId}-${idx}`}
                    to={ch.url}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--bg-base, #0d0f17)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s ease, transform 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono, monospace)',
                            color: ch.badgeColor,
                            backgroundColor: `${ch.badgeColor}20`,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          {ch.badge}
                        </span>
                        <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>{ch.championshipName}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #cbd5e1)' }}>
                        {ch.eventName}
                      </div>
                      {ch.notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
                          {ch.notes}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={16} color="var(--text-muted, #94a3b8)" />
                  </Link>
                ))}
              </div>
            </div>

            {/* History & Notable Moments */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #131722)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '14px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--telemetry-green, #00e676)', marginBottom: '0.5rem' }}>
                <Calendar size={16} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                  Heritage & First Major Event ({activeCircuit.history.openedYear})
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.85rem 0', color: '#ffffff' }}>
                Historical Milestones
              </h2>
              <p style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                {activeCircuit.history.historicalOverview}
              </p>

              {activeCircuit.history.notableMoments && activeCircuit.history.notableMoments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeCircuit.history.notableMoments.map((moment, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-base, #0d0f17)',
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--f1-red, #e10600)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: 'var(--f1-red, #e10600)' }}>
                          {moment.year}
                        </span>
                        <strong style={{ fontSize: '0.86rem', color: '#ffffff' }}>{moment.title}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.45 }}>
                        {moment.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Did You Know? / Quick Facts */}
            {activeCircuit.didYouKnow && activeCircuit.didYouKnow.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface, #131722)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', marginBottom: '0.5rem' }}>
                  <Sparkles size={16} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                    Did You Know?
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#ffffff' }}>
                  Fascinating Paddock Facts
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeCircuit.didYouKnow.map((dyk, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-base, #0d0f17)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                        {dyk.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.5 }}>
                        {dyk.fact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. SOURCE & ATTRIBUTION FOOTER */}
        <div
          style={{
            marginTop: '3.5rem',
            padding: '1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted, #94a3b8)',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--f1-red, #e10600)" />
            <span>
              Source & Geometry Attribution:{' '}
              <strong style={{ color: '#ffffff' }}>
                {activeCircuit.sourceAttribution?.source || 'F1DB / Official Federations'}
              </strong>{' '}
              ({activeCircuit.sourceAttribution?.license || 'CC BY 4.0 by ROY Jules'})
            </span>
          </div>
          {activeCircuit.officialWebsite && (
            <a
              href={activeCircuit.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--f1-red, #e10600)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 700,
              }}
            >
              <span>Official Circuit Site</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GLOBAL MOTORSPORT CIRCUIT DISCOVERY & BROWSE LIBRARY (/circuits)
  // =========================================================================
  return (
    <div className="circuits-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', paddingBottom: '1.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--f1-red, #e10600)',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <Compass size={15} />
          <span>GLOBAL MOTORSPORT CIRCUITS DIRECTORY</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 2.75rem)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--text-primary, #ffffff)',
          }}
        >
          Motorsport Circuits Directory
        </h1>
        <p style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '840px', lineHeight: 1.55 }}>
          Explore iconic racing venues across Formula 1, MotoGP, FIA WEC, GT World Challenge, Formula E, WRC, and Indian Motorsport. Inspect high-precision track geometry, direction indicators, multi-layout configurations, and multi-championship hostings.
        </p>

        {/* Championship Discipline Filter Bar */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          {CHAMPIONSHIP_FILTERS.map(cat => {
            const active = championshipFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setChampionshipFilter(cat.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: active
                    ? `1px solid ${cat.badgeColor || 'var(--f1-red, #e10600)'}`
                    : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  background: active
                    ? `${cat.badgeColor || 'var(--f1-red, #e10600)'}22`
                    : 'rgba(255, 255, 255, 0.04)',
                  color: active ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                {cat.badgeColor && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: cat.badgeColor,
                    }}
                  />
                )}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Search & Secondary Type Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}
      >
        {/* Instant Search Bar */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '480px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted, #94a3b8)',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search circuit, city, country, or event..."
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              backgroundColor: 'var(--bg-surface, #131722)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Circuit Type Filter Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
            Type:
          </span>
          {['all', 'Permanent', 'Street', 'Road Course', 'Rally Stage'].map(t => {
            const active = typeFilter.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  border: active ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.06)',
                  backgroundColor: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-mono, monospace)',
          color: 'var(--text-muted, #94a3b8)',
        }}
      >
        <span>
          Showing <strong style={{ color: '#fff' }}>{filteredCircuits.length}</strong> motorsport venues
        </span>
        {championshipFilter !== 'all' && (
          <span style={{ color: 'var(--f1-red, #e10600)' }}>
            Filter: {CHAMPIONSHIP_FILTERS.find(f => f.id === championshipFilter)?.label}
          </span>
        )}
      </div>

      {/* 4. HIGH-DENSITY VISUAL CIRCUIT CARDS GRID */}
      {filteredCircuits.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredCircuits.map(circuit => (
            <CircuitCard key={circuit.circuitId} circuit={circuit} />
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-surface, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted, #94a3b8)',
          }}
        >
          <Compass size={36} style={{ opacity: 0.3, marginBottom: '0.75rem', color: 'var(--f1-red, #e10600)' }} />
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>No Circuits Found</h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            No motorsport venues match your active search and discipline filters. Try clearing your search term.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setChampionshipFilter('all');
              setTypeFilter('all');
            }}
            style={{
              marginTop: '1rem',
              padding: '0.45rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

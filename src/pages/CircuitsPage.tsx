import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  Timer,
  Compass,
  ArrowRight,
  Info,
  CalendarDays,
  ExternalLink,
  Flag,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  F1_CIRCUITS_REGISTRY,
  getCircuitAssetUrl,
  CIRCUIT_SOURCE_MAPPING,
} from '../services/circuits/circuitRegistry';
import { getCrossChampionshipHostings, VenueHosting } from '../services/circuits/crossChampionshipVenues';
import { CircuitMetadata } from '../types';

type ChampionshipFilter = 'all' | 'f1' | 'motogp' | 'wec' | 'gt' | 'fe' | 'india';

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
];

export const CircuitsPage: React.FC = () => {
  const { circuitId } = useParams<{ circuitId?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [characterFilter, setCharacterFilter] = useState<string>('all');
  const [championshipFilter, setChampionshipFilter] = useState<ChampionshipFilter>('all');
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(circuitId || 'monza');

  // Handle URL route changes
  useEffect(() => {
    if (circuitId && F1_CIRCUITS_REGISTRY[circuitId]) {
      setSelectedCircuitId(circuitId);
    }
  }, [circuitId]);

  const circuitsList = useMemo(() => {
    return Object.values(F1_CIRCUITS_REGISTRY);
  }, []);

  const filteredCircuits = useMemo(() => {
    return circuitsList.filter(circuit => {
      // 1. Text Search Filter
      const matchesSearch =
        searchTerm.trim() === '' ||
        circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circuit.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circuit.locality.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Track Character Speed Filter
      const speedMatch =
        characterFilter === 'all' ||
        circuit.trackCharacter?.speed?.toLowerCase() === characterFilter.toLowerCase();

      // 3. Championship Category Filter
      let champMatch = true;
      if (championshipFilter !== 'all') {
        const hostings = getCrossChampionshipHostings(circuit.circuitId);
        if (championshipFilter === 'f1') {
          champMatch = circuit.firstGrandPrix !== undefined || hostings.some(h => h.championshipId.includes('f1'));
        } else if (championshipFilter === 'motogp') {
          champMatch = hostings.some(h => h.championshipId === 'motogp');
        } else if (championshipFilter === 'wec') {
          champMatch = hostings.some(h => h.championshipId === 'wec');
        } else if (championshipFilter === 'gt') {
          champMatch = hostings.some(h => h.championshipId === 'gt-world-challenge');
        } else if (championshipFilter === 'fe') {
          champMatch = hostings.some(h => h.championshipId === 'formula-e');
        } else if (championshipFilter === 'india') {
          champMatch = circuit.country.toLowerCase() === 'india' || hostings.some(h => h.championshipId === 'indian-motorsport');
        }
      }

      return matchesSearch && speedMatch && champMatch;
    });
  }, [circuitsList, searchTerm, characterFilter, championshipFilter]);

  const activeCircuit: CircuitMetadata = useMemo(() => {
    return F1_CIRCUITS_REGISTRY[selectedCircuitId] || F1_CIRCUITS_REGISTRY.monza;
  }, [selectedCircuitId]);

  const activeAssetUrl = useMemo(() => {
    const mapping = CIRCUIT_SOURCE_MAPPING[activeCircuit.circuitId];
    return getCircuitAssetUrl(mapping ? mapping.assetFile : `${activeCircuit.circuitId}.svg`);
  }, [activeCircuit]);

  const crossHostings: VenueHosting[] = useMemo(() => {
    return getCrossChampionshipHostings(activeCircuit.circuitId);
  }, [activeCircuit.circuitId]);

  useEffect(() => {
    document.title = `${activeCircuit.name} | Circuits Directory • The Grid`;
  }, [activeCircuit.name]);

  return (
    <div className="circuits-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--f1-red)',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Compass size={15} />
          <span>GLOBAL MOTORSPORT CIRCUITS DIRECTORY</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.025em', margin: 0, color: 'var(--text-primary)' }}>
          Motorsport Circuits Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '840px', lineHeight: 1.55 }}>
          Explore iconic racing venues across Formula 1, MotoGP, FIA WEC, GT World Challenge, Formula E, and Indian Motorsport. Inspect high-precision track geometry, DRS/speed zones, braking demand, and multi-championship hostings.
        </p>

        {/* Championship Filter Bar */}
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
                    ? `1px solid ${cat.badgeColor || 'var(--f1-red)'}`
                    : '1px solid var(--border-subtle)',
                  background: active
                    ? `${cat.badgeColor || 'var(--f1-red)'}22`
                    : 'rgba(255, 255, 255, 0.04)',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
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

      {/* Hero Circuit Spotlight */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: 'clamp(1rem, 3vw, 1.75rem)',
          marginBottom: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Track Vector Visualization */}
        <div
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px',
            position: 'relative',
          }}
        >
          <img
            src={activeAssetUrl}
            alt={`${activeCircuit.name} track layout`}
            style={{
              maxWidth: '100%',
              maxHeight: '260px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.08))',
            }}
            onError={e => {
              // Graceful fallback if vector is missing
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(8, 10, 15, 0.85)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}
          >
            {activeCircuit.locality}, {activeCircuit.country}
          </div>
        </div>

        {/* Detailed Circuit Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{activeCircuit.flag || '🏁'}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeCircuit.country}
              </span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 0.35rem', lineHeight: 1.2 }}>
              {activeCircuit.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Grand Prix debut: {activeCircuit.firstGrandPrix} • {activeCircuit.laps} Laps • Race distance: {activeCircuit.raceDistance}
            </p>
          </div>

          {/* Key telemetry pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 80px), 1fr))', gap: '0.65rem' }}>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Track Length</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {activeCircuit.lengthKm} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>KM</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Corners</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {activeCircuit.turns} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>TURNS</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DRS / Speed</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--f1-red)' }}>
                {activeCircuit.drsZones} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>ZONES</span>
              </div>
            </div>
          </div>

          {/* Lap Record Callout */}
          {activeCircuit.lapRecord && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Timer size={20} style={{ color: 'var(--telemetry-purple, #9d4edd)' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Official Race Lap Record
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                    {activeCircuit.lapRecord.driver} ({activeCircuit.lapRecord.year})
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                {activeCircuit.lapRecord.time}
              </div>
            </div>
          )}

          {/* Track Character Summary */}
          {activeCircuit.trackCharacter && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                Speed: <strong style={{ color: '#fff' }}>{activeCircuit.trackCharacter.speed}</strong>
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                Braking: <strong style={{ color: '#fff' }}>{activeCircuit.trackCharacter.braking}</strong>
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                Overtaking: <strong style={{ color: '#fff' }}>{activeCircuit.trackCharacter.overtaking}</strong>
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                Tyre Wear: <strong style={{ color: '#fff' }}>{activeCircuit.trackCharacter.tyreWear}</strong>
              </span>
            </div>
          )}

          {/* Cross-Championship Global Hosting */}
          {crossHostings.length > 0 && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  GLOBAL MOTORSPORT HOSTING • {crossHostings.length} CHAMPIONSHIPS
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Shared World Venue</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.6rem' }}>
                {crossHostings.map((h, i) => (
                  <Link
                    key={i}
                    to={h.url}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          background: `${h.badgeColor}22`,
                          color: h.badgeColor,
                          border: `1px solid ${h.badgeColor}44`,
                          flexShrink: 0,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {h.badge}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {h.championshipName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {h.eventName}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Key Facts */}
          {activeCircuit.facts && activeCircuit.facts.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                VENUE FACTS & PROFILE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.5rem' }}>
                {activeCircuit.facts.map((fact, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.6rem 0.8rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                      {fact.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {fact.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catalog Search & Filtering */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              Circuits Catalog ({filteredCircuits.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Select any venue to inspect track telemetry, technical characteristics, and multi-series hostings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search circuit or country..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
              {['all', 'Very High', 'High', 'Medium'].map(spd => (
                <button
                  key={spd}
                  onClick={() => setCharacterFilter(spd)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    border: characterFilter === spd ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                    background: characterFilter === spd ? 'rgba(225, 6, 0, 0.15)' : 'var(--bg-surface)',
                    color: characterFilter === spd ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {spd === 'all' ? 'ALL SPEEDS' : `${spd.toUpperCase()} SPEED`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Circuits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
          {filteredCircuits.map(circuit => {
            const isSelected = circuit.circuitId === selectedCircuitId;
            const mapping = CIRCUIT_SOURCE_MAPPING[circuit.circuitId];
            const assetUrl = getCircuitAssetUrl(mapping ? mapping.assetFile : `${circuit.circuitId}.svg`);
            const hostings = getCrossChampionshipHostings(circuit.circuitId);

            return (
              <div
                key={circuit.circuitId}
                onClick={() => {
                  setSelectedCircuitId(circuit.circuitId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: isSelected ? 'rgba(225, 6, 0, 0.08)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', borderRadius: '8px', padding: '0.75rem' }}>
                  <img
                    src={assetUrl}
                    alt={circuit.name}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      opacity: isSelected ? 1 : 0.85,
                    }}
                    onError={e => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{circuit.flag || '🏁'}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {circuit.country}
                      </span>
                    </div>

                    {/* Miniature Hosting Badges */}
                    {hostings.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {hostings.slice(0, 3).map((h, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              padding: '0.1rem 0.3rem',
                              borderRadius: '3px',
                              backgroundColor: `${h.badgeColor}22`,
                              color: h.badgeColor,
                              border: `1px solid ${h.badgeColor}44`,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {h.badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#fff', lineHeight: 1.25 }}>
                    {circuit.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: 'auto' }}>
                  <span>{circuit.lengthKm} KM</span>
                  <span>{circuit.turns} TURNS</span>
                  <span style={{ color: isSelected ? 'var(--f1-red)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {isSelected ? 'VIEWING' : 'INSPECT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CircuitsPage;

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
} from 'lucide-react';
import {
  F1_CIRCUITS_REGISTRY,
  getCircuitAssetUrl,
  CIRCUIT_SOURCE_MAPPING,
} from '../services/circuits/circuitRegistry';
import { CircuitMetadata } from '../types';

export const CircuitsPage: React.FC = () => {
  const { circuitId } = useParams<{ circuitId?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [characterFilter, setCharacterFilter] = useState<string>('all');
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(circuitId || 'monza');

  const circuitsList = useMemo(() => {
    return Object.values(F1_CIRCUITS_REGISTRY);
  }, []);

  const filteredCircuits = useMemo(() => {
    return circuitsList.filter(circuit => {
      const matchesSearch =
        circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circuit.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circuit.locality.toLowerCase().includes(searchTerm.toLowerCase());

      const speedMatch =
        characterFilter === 'all' ||
        circuit.trackCharacter?.speed?.toLowerCase() === characterFilter.toLowerCase();

      return matchesSearch && speedMatch;
    });
  }, [circuitsList, searchTerm, characterFilter]);

  const activeCircuit: CircuitMetadata = useMemo(() => {
    return F1_CIRCUITS_REGISTRY[selectedCircuitId] || F1_CIRCUITS_REGISTRY.monza;
  }, [selectedCircuitId]);

  const activeAssetUrl = useMemo(() => {
    const mapping = CIRCUIT_SOURCE_MAPPING[activeCircuit.circuitId];
    return getCircuitAssetUrl(mapping ? mapping.assetFile : `${activeCircuit.circuitId}.svg`);
  }, [activeCircuit]);

  useEffect(() => {
    document.title = `${activeCircuit.name} | Circuits Directory • The Grid`;
  }, [activeCircuit.name]);

  return (
    <div className="circuits-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--f1-red)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <Compass size={16} />
          <span>F1 WORLD CHAMPIONSHIP CALENDAR</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
          Championship Circuits
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '800px', lineHeight: 1.5 }}>
          Explore all 24 official Formula 1 Grand Prix circuits. Inspect high-precision track geometry, DRS zones, braking demand, and all-time lap records.
        </p>
      </header>

      {/* Hero Circuit Spotlight */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
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
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DRS Zones</div>
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

          {/* Track DNA Summary */}
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

          {/* Why is this track different? */}
          {activeCircuit.whySpecial && (
            <div style={{ background: 'rgba(225, 6, 0, 0.06)', border: '1px solid rgba(225, 6, 0, 0.2)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                WHY IS THIS TRACK DIFFERENT?
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                {activeCircuit.whySpecial}
              </p>
            </div>
          )}

          {/* Key Corners */}
          {activeCircuit.keyCorners && activeCircuit.keyCorners.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                ICONIC CORNERS & OVERTAKING ZONES
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                {activeCircuit.keyCorners.map(corner => (
                  <div key={corner.name} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.6rem 0.8rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                      Turn {corner.number}: {corner.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {corner.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Circuit Guide External Link */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: Formula1.com Official Circuit Guide
            </span>
            <a
              href={activeCircuit.officialCircuitUrl || 'https://www.formula1.com/en/racing/2026.html'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--f1-red)',
                fontSize: '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              <span>Read Official F1 Track Guide</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* Catalog Search & Filtering */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              All 24 Circuits ({filteredCircuits.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Select any venue to inspect track telemetry and technical details.
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

        {/* 24 Circuits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filteredCircuits.map(circuit => {
            const isSelected = circuit.circuitId === selectedCircuitId;
            const mapping = CIRCUIT_SOURCE_MAPPING[circuit.circuitId];
            const assetUrl = getCircuitAssetUrl(mapping ? mapping.assetFile : `${circuit.circuitId}.svg`);

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
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{circuit.flag || '🏁'}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {circuit.country}
                    </span>
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

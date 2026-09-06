import React, { useState } from 'react';
import { CircuitInfo, CircuitMetadata } from '../../types';
import { getCircuitMetadata } from '../../services/circuits/circuitRegistry';
import { MapPinOff } from 'lucide-react';

export interface CircuitMapProps {
  /** Circuit metadata, CircuitInfo object, or circuit ID string */
  circuit?: CircuitInfo | string;
  /** Direct circuit ID (e.g. 'monza', 'silverstone', 'spa') */
  circuitId?: string;
  /** Explicit source path or filename */
  src?: string;
  /** Accessible alt text for screen readers */
  alt?: string;
  /** Visual presentation mode */
  variant?: 'hero' | 'dashboard' | 'compact' | 'card' | 'standalone';
  /** Extra CSS classes */
  className?: string;
  /** Whether to render technical specs */
  showStats?: boolean;
}

/**
 * Constructs a fully qualified public asset URL for a circuit SVG,
 * ensuring compatibility with both local Vite development and GitHub Pages base paths.
 */
export function getCircuitAssetUrl(assetRef?: string | { asset: string }): string {
  if (!assetRef) return '';

  let raw = typeof assetRef === 'object' && assetRef !== null && 'asset' in assetRef
    ? assetRef.asset
    : String(assetRef);

  // Strip any leading slashes or existing 'circuits/' prefixes
  raw = raw.replace(/^\/?(circuits\/)?/, '');

  if (!raw.endsWith('.svg')) {
    raw = `${raw}.svg`;
  }

  // Construct URL with Vite's BASE_URL for GitHub Pages compatibility
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${baseUrl}/circuits/${raw}`;
}

export const CircuitMap: React.FC<CircuitMapProps> = ({
  circuit,
  circuitId,
  src,
  alt,
  variant = 'dashboard',
  className = '',
  showStats = true,
}) => {
  const [hasError, setHasError] = useState(false);

  // Resolve metadata
  const targetCircuit = circuitId || circuit;
  const meta: CircuitMetadata = getCircuitMetadata(targetCircuit);

  // Determine asset URL
  const rawMapRef = src || meta.map || (meta as any).circuitId || 'monza';
  const assetUrl = getCircuitAssetUrl(rawMapRef);
  const altText = alt || `Official circuit map layout for ${meta.name}`;

  const handleError = () => {
    setHasError(true);
    if (import.meta.env.DEV) {
      console.warn(`[CircuitMap] Failed to load circuit map asset: "${assetUrl}" for ${meta.name}`);
    }
  };

  // 1. STANDALONE VARIANT: Pure vector map container with responsive centering
  if (variant === 'standalone') {
    return (
      <div
        className={`circuit-map-standalone ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '220px',
          maxHeight: '220px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {hasError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            <MapPinOff size={24} style={{ opacity: 0.5, marginBottom: '0.4rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Circuit map unavailable</span>
          </div>
        ) : (
          <img
            src={assetUrl}
            alt={altText}
            onError={handleError}
            style={{
              maxWidth: '100%',
              maxHeight: '190px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
              filter: 'drop-shadow(0 0 16px rgba(225, 6, 0, 0.35))',
            }}
          />
        )}
      </div>
    );
  }

  // 2. COMPACT VARIANT: Mini card for lists, selectors, or widgets
  if (variant === 'compact') {
    return (
      <div
        className={`circuit-map-compact ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.75rem',
          background: 'var(--bg-surface-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          height: '110px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {hasError ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <MapPinOff size={16} />
            <span>Map unavailable</span>
          </div>
        ) : (
          <img
            src={assetUrl}
            alt={altText}
            onError={handleError}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(225, 6, 0, 0.25))',
            }}
          />
        )}
      </div>
    );
  }

  // 3. HERO / DASHBOARD / CARD VARIANT: Full community spotlight card
  return (
    <div
      className={`circuit-map-card ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface-card) 0%, var(--bg-surface-elevated) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: variant === 'hero' ? '2rem' : '1.75rem',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: variant === 'card' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        {/* Left: Circuit Stats & Editorial Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{meta.flag}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--f1-red)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              ABOUT THE CIRCUIT
            </span>
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '0.5rem' }}>
            {meta.name}
          </h3>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {meta.locality}, {meta.country}
          </div>

          {/* Quick Key Specs */}
          {showStats && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  TRACK LENGTH
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {meta.lengthKm || meta.length} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KM</span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  TURNS
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {meta.turns} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CORNERS</span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  RACE LAPS
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {meta.laps || 53} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LAPS</span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  DRS ZONES
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--telemetry-green)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {meta.drsZones} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ZONES</span>
                </div>
              </div>
            </div>
          )}

          {/* Editorial description */}
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {meta.facts?.[0]?.description ||
              `${meta.name} is a cornerstone of the Formula 1 calendar, offering challenging overtaking zones, intense braking, and world-class Grand Prix racing.`}
          </p>
        </div>

        {/* Right: Accurately Proportioned Circuit Vector Map */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'radial-gradient(circle at center, rgba(225, 6, 0, 0.08) 0%, rgba(8, 10, 15, 0.85) 75%)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            minHeight: '220px',
            maxHeight: '320px',
            position: 'relative',
          }}
        >
          {hasError ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              <MapPinOff size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Circuit map unavailable</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '0.2rem' }}>{meta.name}</span>
            </div>
          ) : (
            <>
              <img
                src={assetUrl}
                alt={altText}
                onError={handleError}
                style={{
                  maxWidth: '100%',
                  maxHeight: '260px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  filter: 'drop-shadow(0 0 16px rgba(225, 6, 0, 0.35))',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(8, 10, 15, 0.6)',
                  padding: '0.2rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00e676', display: 'inline-block' }} />
                START / FINISH LINE
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

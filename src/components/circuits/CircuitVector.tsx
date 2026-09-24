import React, { useState } from 'react';
import { Compass, RotateCw, RotateCcw } from 'lucide-react';
import { CircuitDirection } from '../../types/circuit';
import { getCircuitAssetUrl } from '../../services/circuits/circuitRegistry';

export interface CircuitVectorProps {
  mapSvg?: string;
  name: string;
  direction?: CircuitDirection;
  lengthKm?: number;
  turns?: number;
  variant?: 'hero' | 'card' | 'compact';
  className?: string;
}

export const CircuitVector: React.FC<CircuitVectorProps> = ({
  mapSvg,
  name,
  direction = 'Clockwise',
  lengthKm,
  turns,
  variant = 'hero',
  className = '',
}) => {
  const [loadError, setLoadError] = useState(false);

  const assetUrl = mapSvg ? getCircuitAssetUrl(mapSvg) : '';
  const isAntiClockwise = direction === 'Anti-Clockwise';

  const containerHeight =
    variant === 'hero' ? 'clamp(240px, 32vw, 360px)' : variant === 'compact' ? '120px' : '180px';

  return (
    <div
      className={`circuit-vector-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: containerHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-base, #0d0f17)',
        borderRadius: variant === 'hero' ? '14px' : '10px',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        padding: variant === 'hero' ? '1.5rem' : '0.75rem',
        overflow: 'hidden',
      }}
    >
      {/* Background Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Track SVG Layout */}
      {!loadError && assetUrl ? (
        <img
          src={assetUrl}
          alt={`${name} track layout`}
          onError={() => setLoadError(true)}
          className="track-svg-animated"
          style={{
            maxWidth: '90%',
            maxHeight: '85%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.25)) drop-shadow(0 0 4px rgba(225, 6, 0, 0.2))',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted, #94a3b8)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <Compass size={24} style={{ opacity: 0.4 }} />
          <span>Vector layout preview</span>
        </div>
      )}

      {/* Floating Direction & Lap Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: variant === 'hero' ? '12px' : '8px',
          right: variant === 'hero' ? '12px' : '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(8, 10, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
          borderRadius: '9999px',
          padding: '0.2rem 0.55rem',
          fontSize: '0.68rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          color: 'var(--text-secondary, #cbd5e1)',
          letterSpacing: '0.04em',
        }}
      >
        {isAntiClockwise ? (
          <RotateCcw size={12} color="#00e676" />
        ) : (
          <RotateCw size={12} color="#3b82f6" />
        )}
        <span>{direction.toUpperCase()}</span>
      </div>

      {/* Stats pill for hero variant */}
      {variant === 'hero' && (lengthKm || turns) && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '0.4rem',
          }}
        >
          {lengthKm && (
            <span
              style={{
                backgroundColor: 'rgba(8, 10, 15, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                borderRadius: '6px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {lengthKm} KM
            </span>
          )}
          {turns && (
            <span
              style={{
                backgroundColor: 'rgba(8, 10, 15, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                borderRadius: '6px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: 'var(--f1-red, #e10600)',
              }}
            >
              {turns} TURNS
            </span>
          )}
        </div>
      )}
    </div>
  );
};

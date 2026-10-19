import React from 'react';
import { FlameX } from './FlameX';
export { GrdxLogo } from './GrdxLogo';

export interface GrdxWordmarkProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  variant?: 'hero' | 'navbar';
}

export const GrdxWordmark: React.FC<GrdxWordmarkProps> = ({
  size,
  className = '',
  style = {},
  ariaLabel = 'GRDX',
  variant = 'hero',
}) => {
  const isNavbar = variant === 'navbar';
  // Hero scales relative to its font-size clamp; navbar defaults to compact 18px
  const xSize = size !== undefined ? size : (isNavbar ? 18 : '0.94em');

  return (
    <span
      className={`grdx-brand-wordmark ${isNavbar ? 'grdx-wordmark--navbar' : 'grdx-wordmark--hero'} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: isNavbar ? 'center' : 'baseline',
        lineHeight: 1,
        ...style,
      }}
      aria-label={ariaLabel}
      role="img"
    >
      <span
        className="grdx-wordmark-grd"
        style={{
          fontFamily: "var(--font-brand, 'Orbitron', sans-serif)",
          fontWeight: 900,
          letterSpacing: '-0.03em',
          transform: 'skewX(-12deg)',
          display: 'inline-block',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #D1D5DB 45%, #9CA3AF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          paddingRight: '0.04em',
        }}
      >
        GRD
      </span>
      <span
        className="grdx-wordmark-x"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          lineHeight: 1,
          marginLeft: '-0.02em',
          transform: isNavbar ? 'none' : 'translateY(0.04em)',
        }}
      >
        <FlameX size={xSize} ariaLabel="X" />
      </span>
    </span>
  );
};

export default GrdxWordmark;

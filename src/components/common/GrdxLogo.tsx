import React from 'react';
import { FlameX } from './FlameX';

export interface GrdxLogoProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  variant?: 'hero' | 'navbar' | 'compact';
}

/**
 * Bespoke GRDX Wordmark Component
 * 
 * Specifications:
 * - "GRD" Text: Rendered using Orbitron 900 (--font-brand), skewed at -12deg,
 *   letter-spacing -0.03em, metallic vertical gradient (linear-gradient(180deg, #FFFFFF 0%, #9CA3AF 100%)).
 * - "X" Emblem: Custom Fire-Checker SVG slanted at -12deg, with Yellow-Orange and Deep Red flame checkerboard pattern,
 *   volcanic glowing border (#FF3300 to #FF8800), outer drop-shadow, and micro speed embers trailing from right-hand tips.
 */
export const GrdxLogo: React.FC<GrdxLogoProps> = ({
  size,
  className = '',
  style = {},
  ariaLabel = 'GRDX',
  variant = 'hero',
}) => {
  const isNavbar = variant === 'navbar';
  const isCompact = variant === 'compact';

  // Sizing configuration
  let fontSizeStyle: string | number | undefined;
  let xHeightStyle: string | number;

  if (size !== undefined) {
    fontSizeStyle = typeof size === 'number' ? `${size}px` : size;
    xHeightStyle = typeof size === 'number' ? `${size * 0.94}px` : '0.94em';
  } else if (isNavbar) {
    fontSizeStyle = '1.3rem';
    xHeightStyle = '1.18rem';
  } else if (isCompact) {
    fontSizeStyle = '1.1rem';
    xHeightStyle = '1rem';
  } else {
    // Hero default
    fontSizeStyle = undefined; // Controlled by hero parent or clamp
    xHeightStyle = '0.94em';
  }

  return (
    <span
      className={`grdx-logo-root grdx-logo--${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: isNavbar ? 'center' : 'baseline',
        lineHeight: 1,
        userSelect: 'none',
        ...(fontSizeStyle ? { fontSize: fontSizeStyle } : {}),
        ...style,
      }}
      aria-label={ariaLabel}
      role="img"
    >
      {/* "GRD" Racing Wordmark Text */}
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
          filter: isNavbar ? 'none' : 'drop-shadow(0 2px 14px rgba(0, 0, 0, 0.75))',
        }}
      >
        GRD
      </span>

      {/* "X" Emblem: Fire-Checker Racing X */}
      <span
        className="grdx-wordmark-x"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          lineHeight: 1,
          marginLeft: '-0.02em',
          transform: isNavbar ? 'none' : 'translateY(0.04em)',
          verticalAlign: isNavbar ? 'middle' : 'baseline',
        }}
      >
        <FlameX size={xHeightStyle} ariaLabel="X" />
      </span>
    </span>
  );
};

export default GrdxLogo;

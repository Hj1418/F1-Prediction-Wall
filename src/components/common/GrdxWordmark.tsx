import React from 'react';
import { FlameX } from './FlameX';

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
  // Hero scales relative to its font-size clamp; navbar defaults to compact 15px
  const xSize = size !== undefined ? size : (isNavbar ? 15 : '0.92em');

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
      <span className="grdx-wordmark-grd">GRD</span>
      <span className="grdx-wordmark-x">
        <FlameX size={xSize} ariaLabel="X" />
      </span>
    </span>
  );
};

export default GrdxWordmark;


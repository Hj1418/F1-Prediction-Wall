import React from 'react';
import grdxFlameXImg from '../../assets/grdx-flame-x.png';

export interface FlameXProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export const FlameX: React.FC<FlameXProps> = ({
  size,
  className = '',
  style = {},
  ariaLabel = 'X',
}) => {
  const heightStyle = size !== undefined ? (typeof size === 'number' ? `${size}px` : size) : undefined;

  return (
    <img
      src={grdxFlameXImg}
      alt={ariaLabel}
      className={`grdx-flame-x-img ${className}`}
      style={{
        ...(heightStyle ? { height: heightStyle } : {}),
        width: 'auto',
        display: 'inline-block',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
};

export default FlameX;


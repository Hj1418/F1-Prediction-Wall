import React, { useId } from 'react';

export interface FlameXProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/**
 * Bespoke Racing "X" Wordmark with "Fire-Checker" Effect
 * 
 * Specifications:
 * - Custom inline SVG slanted at transform: skew(-12deg)
 * - Checkered Fill: SVG <pattern> with Yellow-Orange (#FFCC00 -> #FF6600) and Deep Red-Orange (#E60000 -> #800000)
 * - Volcanic Outlines: Glowing border with linear gradient #FF3300 -> #FF8800 + outer drop-shadow(0 0 16px rgba(255, 68, 0, 0.45))
 * - Micro Speed Elements: Trailing embers & angled sparks trailing from right-hand tips
 */
export const FlameX: React.FC<FlameXProps> = ({
  size = '0.94em',
  className = '',
  style = {},
  ariaLabel = 'X',
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9-_]/g, '');
  const patternId = `fire-checker-pattern-${uid}`;
  const yellowOrangeGradId = `fire-yo-grad-${uid}`;
  const deepRedGradId = `fire-dr-grad-${uid}`;
  const volcanicGradId = `fire-volcanic-grad-${uid}`;
  const flameSheenGradId = `fire-sheen-grad-${uid}`;
  const glowFilterId = `fire-glow-${uid}`;

  const heightStyle = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      viewBox="0 0 118 100"
      className={`grdx-flame-x-svg ${className}`}
      style={{
        height: heightStyle,
        width: 'auto',
        display: 'inline-block',
        overflow: 'visible',
        transform: 'skewX(-12deg)',
        filter: 'drop-shadow(0 0 16px rgba(255, 68, 0, 0.45))',
        ...style,
      }}
      aria-label={ariaLabel}
      role="img"
    >
      <defs>
        {/* Yellow-Orange Flame Gradient */}
        <linearGradient id={yellowOrangeGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFCC00" />
          <stop offset="100%" stopColor="#FF6600" />
        </linearGradient>

        {/* Deep Red-Orange Flame Gradient */}
        <linearGradient id={deepRedGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E60000" />
          <stop offset="100%" stopColor="#800000" />
        </linearGradient>

        {/* Volcanic Glowing Border Gradient */}
        <linearGradient id={volcanicGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF8800" />
          <stop offset="50%" stopColor="#FF5500" />
          <stop offset="100%" stopColor="#FF3300" />
        </linearGradient>

        {/* Fiery Sheen Overlay for Volcanic Depth */}
        <linearGradient id={flameSheenGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFCC00" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FF4400" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#660000" stopOpacity="0.65" />
        </linearGradient>

        {/* Racing Checkered Pattern with Yellow-Red Flame Squares */}
        <pattern
          id={patternId}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="8" fill={`url(#${yellowOrangeGradId})`} />
          <rect x="8" width="8" height="8" fill={`url(#${deepRedGradId})`} />
          <rect y="8" width="8" height="8" fill={`url(#${deepRedGradId})`} />
          <rect x="8" y="8" width="8" height="8" fill={`url(#${yellowOrangeGradId})`} />
        </pattern>

        {/* Outer Volcanic Glow Filter */}
        <filter id={glowFilterId} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FF4400" floodOpacity="0.85" />
        </filter>
      </defs>

      {/* Main Fire-Checker X Strokes */}
      <g>
        {/* Stroke 1: Top-Left to Bottom-Right Diagonal */}
        <path
          d="M 12 10 L 36 10 L 84 90 L 60 90 Z"
          fill={`url(#${patternId})`}
        />
        <path
          d="M 12 10 L 36 10 L 84 90 L 60 90 Z"
          fill={`url(#${flameSheenGradId})`}
        />
        <path
          d="M 12 10 L 36 10 L 84 90 L 60 90 Z"
          fill="none"
          stroke={`url(#${volcanicGradId})`}
          strokeWidth="2"
        />

        {/* Stroke 2: Top-Right to Bottom-Left Diagonal */}
        <path
          d="M 84 10 L 60 10 L 12 90 L 36 90 Z"
          fill={`url(#${patternId})`}
        />
        <path
          d="M 84 10 L 60 10 L 12 90 L 36 90 Z"
          fill={`url(#${flameSheenGradId})`}
        />
        <path
          d="M 84 10 L 60 10 L 12 90 L 36 90 Z"
          fill="none"
          stroke={`url(#${volcanicGradId})`}
          strokeWidth="2"
        />

        {/* Center Intersection Fiery Accent */}
        <polygon
          points="48,40 56,50 48,60 40,50"
          fill="#FFCC00"
          opacity="0.6"
          filter={`url(#${glowFilterId})`}
        />
      </g>

      {/* Micro Speed Elements: Trailing Embers & Angled Sparks from Right-Hand Tips */}
      <g className="grdx-x-micro-speed-elements">
        {/* Top-Right Tip Sparks & Embers (Around x: 84-114, y: 8-32) */}
        <line x1="86" y1="12" x2="104" y2="15" stroke="#FFCC00" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
        <line x1="88" y1="20" x2="108" y2="23" stroke="#FF8800" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <line x1="84" y1="26" x2="98" y2="28" stroke="#FF4400" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        {/* Top-Right Embers */}
        <polygon points="106,12 110,14 107,17 103,15" fill="#FFCC00" opacity="0.9" filter={`url(#${glowFilterId})`} />
        <polygon points="112,21 115,22 113,24 110,23" fill="#FF8800" opacity="0.8" />
        <circle cx="102" cy="8" r="1.5" fill="#FFE066" opacity="0.85" />

        {/* Bottom-Right Tip Sparks & Embers (Around x: 84-114, y: 70-94) */}
        <line x1="86" y1="88" x2="106" y2="85" stroke="#FFCC00" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
        <line x1="88" y1="80" x2="108" y2="78" stroke="#FF8800" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <line x1="84" y1="74" x2="98" y2="73" stroke="#FF4400" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        {/* Bottom-Right Embers */}
        <polygon points="108,87 112,85 110,88 106,90" fill="#FFCC00" opacity="0.9" filter={`url(#${glowFilterId})`} />
        <polygon points="112,77 115,76 114,79 111,79" fill="#FF8800" opacity="0.8" />
        <circle cx="103" cy="93" r="1.5" fill="#FFE066" opacity="0.85" />
      </g>
    </svg>
  );
};

export default FlameX;

import React from 'react';
import grdxLogoAsset from '../assets/grdx-logo.svg';

export interface GrdxLogoProps extends React.SVGProps<SVGSVGElement> {
  showTagline?: boolean;
  className?: string;
  variant?: 'hero' | 'navbar' | 'compact' | 'full';
  size?: number | string;
  ariaLabel?: string;
}

/**
 * Official GRDX Brand Logo Component
 * Strictly preserves the authentic site logo (GRD + GT race car silhouette + checkered-flame X).
 * Supports compact (navbar) and full (with tagline) display.
 */
export default function GrdxLogo({
  showTagline = false,
  className = "h-10 w-auto",
  viewBox,
  variant,
  size,
  ariaLabel,
  style,
  ...props
}: GrdxLogoProps) {
  const isHero = variant === 'hero';
  const shouldShowTagline = showTagline || variant === 'full';

  // Authentic bounding box framing GRD + GT Race Car Silhouette + Flame X
  // 340 180 2260 750 for compact logo, 340 180 2260 920 with tagline
  const computedViewBox =
    viewBox || (shouldShowTagline ? "340 180 2260 920" : "340 180 2260 750");

  const computedStyle: React.CSSProperties = {
    display: 'block',
    overflow: 'hidden',
    mixBlendMode: 'screen',
    ...(isHero
      ? {
          filter: 'drop-shadow(0 0 28px rgba(235, 87, 34, 0.4))',
        }
      : {}),
    ...(size ? { width: size, height: 'auto' } : {}),
    ...style,
  };

  const logoHref = grdxLogoAsset || `${(import.meta.env.BASE_URL || './').replace(/\/$/, '')}/grdx-logo.svg`;

  return (
    <svg 
      viewBox={computedViewBox} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      role="img"
      aria-label={ariaLabel || "GRDX"}
      style={computedStyle}
      {...props}
    >
      {/* Official site logo asset */}
      <image
        href={logoHref}
        xlinkHref={logoHref}
        x="0"
        y="0"
        width="2838"
        height="1472"
      />

      {/* Optional tagline variant: "YOUR MOTORSPORT STARTING POINT" */}
      {shouldShowTagline && (
        <g className="grdx-logo__tagline-group">
          {/* Subtle racing speed lines flanking tagline */}
          <line
            x1="520"
            y1="860"
            x2="840"
            y2="860"
            stroke="#FF7A00"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <line
            x1="2100"
            y1="860"
            x2="2420"
            y2="860"
            stroke="#FF7A00"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <text
            x="1470"
            y="876"
            textAnchor="middle"
            fontFamily="'Orbitron', 'Barlow Condensed', 'Rajdhani', -apple-system, sans-serif"
            fontWeight="700"
            fontSize="52"
            letterSpacing="0.32em"
            fill="#CBD5E1"
            opacity="0.95"
          >
            YOUR MOTORSPORT STARTING POINT
          </text>
        </g>
      )}
    </svg>
  );
}

export { GrdxLogo };

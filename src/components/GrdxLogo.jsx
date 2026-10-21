import React from 'react';
import grdxLogoAsset from '../assets/grdx-logo.svg';

export default function GrdxLogo({
  showTagline = false,
  className = "h-10 w-auto",
  viewBox,
  variant,
  size,
  ariaLabel,
  style,
  ...props
}) {
  const isHero = variant === 'hero';
  const computedViewBox = viewBox || "340 180 2260 750";

  const computedStyle = {
    display: 'block',
    overflow: 'hidden',
    mixBlendMode: 'screen',
    ...(isHero ? {
      filter: 'drop-shadow(0 0 28px rgba(235, 87, 34, 0.4))',
    } : {}),
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
      <image
        href={logoHref}
        xlinkHref={logoHref}
        x="0"
        y="0"
        width="2838"
        height="1472"
      />
    </svg>
  );
}

export { GrdxLogo };


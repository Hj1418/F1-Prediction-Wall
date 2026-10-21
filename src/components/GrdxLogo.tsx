import React from 'react';

export interface GrdxLogoProps extends React.SVGProps<SVGSVGElement> {
  showTagline?: boolean;
  className?: string;
  variant?: 'hero' | 'navbar' | 'compact';
  size?: number | string;
  ariaLabel?: string;
}

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
  
  // Clean bounding box framing GRD + GT Race Car Silhouette + Flame X (tagline removed)
  const computedViewBox = viewBox || "340 180 2260 750";

  const computedStyle: React.CSSProperties = {
    display: 'block',
    overflow: 'hidden',
    mixBlendMode: 'screen',
    ...(isHero ? {
      filter: 'drop-shadow(0 0 28px rgba(235, 87, 34, 0.4))',
    } : {}),
    ...style,
  };

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
        href="/Gemini_Generated_Image_9w9vec9w9vec9w9v.svg"
        xlinkHref="/Gemini_Generated_Image_9w9vec9w9vec9w9v.svg"
        x="0"
        y="0"
        width="2838"
        height="1472"
      />
    </svg>
  );
}

export { GrdxLogo };

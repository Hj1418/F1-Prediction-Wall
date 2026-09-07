import React from 'react';
import { getInitials } from '../../utils/getInitials';

export interface UserInitialsAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  style?: React.CSSProperties;
  showBorder?: boolean;
}

const SIZE_MAP: Record<string, { dimension: number; fontSize: string }> = {
  xs: { dimension: 24, fontSize: '0.65rem' },
  sm: { dimension: 32, fontSize: '0.75rem' },
  md: { dimension: 40, fontSize: '0.875rem' },
  lg: { dimension: 52, fontSize: '1.15rem' },
  xl: { dimension: 72, fontSize: '1.5rem' },
};

export const UserInitialsAvatar: React.FC<UserInitialsAvatarProps> = ({
  name,
  size = 'md',
  className = '',
  style = {},
  showBorder = true,
}) => {
  const initials = getInitials(name || 'Anonymous User');

  let dimension = 40;
  let fontSize = '0.875rem';

  if (typeof size === 'number') {
    dimension = size;
    fontSize = `${Math.max(10, Math.round(size * 0.38))}px`;
  } else if (SIZE_MAP[size]) {
    dimension = SIZE_MAP[size].dimension;
    fontSize = SIZE_MAP[size].fontSize;
  }

  return (
    <div
      className={`user-initials-avatar inline-flex items-center justify-center select-none font-bold tracking-wider shrink-0 transition-transform ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        fontSize,
        background: 'linear-gradient(135deg, #e10600 0%, #8f0000 65%, #3d0000 100%)',
        color: '#ffffff',
        borderRadius: '50%',
        boxShadow: showBorder
          ? '0 0 0 2px rgba(225, 6, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)'
          : '0 2px 8px rgba(0, 0, 0, 0.4)',
        border: showBorder ? '1.5px solid rgba(255, 255, 255, 0.25)' : 'none',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
        fontFamily: "'Titillium Web', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        ...style,
      }}
      title={name}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
};

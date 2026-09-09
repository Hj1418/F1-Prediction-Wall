import React, { useState, useEffect } from 'react';
import { getAvatarInitial } from '../../utils/getInitials';

export interface UserInitialsAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  style?: React.CSSProperties;
  showBorder?: boolean;
}

const SIZE_MAP: Record<string, { dimension: number; fontSize: string }> = {
  xs: { dimension: 24, fontSize: '0.7rem' },
  sm: { dimension: 32, fontSize: '0.875rem' },
  md: { dimension: 40, fontSize: '1.05rem' },
  lg: { dimension: 52, fontSize: '1.4rem' },
  xl: { dimension: 72, fontSize: '1.95rem' },
};

export const UserInitialsAvatar: React.FC<UserInitialsAvatarProps> = ({
  name,
  imageUrl,
  avatarUrl,
  size = 'md',
  className = '',
  style = {},
  showBorder = true,
}) => {
  const effectiveImageUrl = (imageUrl || avatarUrl || '').trim();
  const [hasImageError, setHasImageError] = useState(false);

  // Reset image error state whenever the URL changes
  useEffect(() => {
    setHasImageError(false);
  }, [effectiveImageUrl]);

  const initial = getAvatarInitial(name);
  const displayName = (name || '').trim() || 'Racer';

  let dimension = 40;
  let fontSize = '1.05rem';

  if (typeof size === 'number') {
    dimension = size;
    fontSize = `${Math.max(10, Math.round(size * 0.42))}px`;
  } else if (SIZE_MAP[size]) {
    dimension = SIZE_MAP[size].dimension;
    fontSize = SIZE_MAP[size].fontSize;
  }

  const shouldShowImage = Boolean(effectiveImageUrl) && !hasImageError;

  return (
    <div
      className={`user-initials-avatar select-none shrink-0 transition-transform ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: 'normal',
        background: 'linear-gradient(135deg, #e10600 0%, #8f0000 65%, #3d0000 100%)',
        color: '#ffffff',
        boxShadow: showBorder
          ? '0 0 0 2px rgba(225, 6, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)'
          : '0 2px 8px rgba(0, 0, 0, 0.4)',
        border: showBorder ? '1.5px solid rgba(255, 255, 255, 0.25)' : 'none',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
        fontFamily: "'Titillium Web', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        ...style,
      }}
      title={displayName}
      aria-label={`Avatar for ${displayName}`}
      data-testid="user-avatar"
    >
      {shouldShowImage ? (
        <img
          src={effectiveImageUrl}
          alt={displayName}
          onError={() => setHasImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            borderRadius: '50%',
          }}
        />
      ) : (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
};

export const UserAvatar = UserInitialsAvatar;


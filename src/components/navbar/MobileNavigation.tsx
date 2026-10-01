import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  CircleDot,
  Trophy,
  User as UserIcon,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
  Flag,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserInitialsAvatar } from '../common/UserInitialsAvatar';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoundLink?: string;
}

const MOTORSPORT_HUBS = [
  { name: 'All Motorsports', path: '/explore', badge: 'ALL', color: '#e10600' },
  { name: 'Formula 1', path: '/explore/f1', badge: 'F1', color: '#e10600' },
  { name: 'Formula 2', path: '/explore/f2', badge: 'F2', color: '#0090d0' },
  { name: 'Formula 3', path: '/explore/f3', badge: 'F3', color: '#e03a3e' },
  { name: 'Formula 4', path: '/explore/f4', badge: 'F4', color: '#10b981' },
  { name: 'Formula E', path: '/explore/formula-e', badge: 'FE', color: '#00d2be' },
  { name: 'MotoGP', path: '/explore/motogp', badge: 'MotoGP', color: '#dc2626' },
  { name: 'FIA WEC', path: '/explore/wec', badge: 'WEC', color: '#2563eb' },
  { name: 'GT World Challenge', path: '/explore/gt-world-challenge', badge: 'GT3', color: '#f59e0b' },
  { name: 'WRC Rally', path: '/explore/wrc', badge: 'WRC', color: '#f97316' },
  { name: 'Indian Motorsport', path: '/indian-motorsport', badge: 'IN', color: '#ff9933' },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  activeRoundLink = '/predictions',
}) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [exploreExpanded, setExploreExpanded] = useState(false);

  if (!isOpen) return null;

  const userDisplayName = currentUser?.displayName || currentUser?.username || 'Racer';

  const isItemActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="mobile-nav-drawer" style={{ maxHeight: 'calc(100vh - 94px)', overflowY: 'auto' }}>
      {/* 1. Header Area: Logged In vs Logged Out */}
      {isAuthenticated ? (
        <div className="mobile-nav-drawer__profile">
          <UserInitialsAvatar
            name={userDisplayName}
            imageUrl={currentUser?.avatarUrl}
            size="md"
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {userDisplayName}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              @{currentUser?.username}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-yellow)', fontWeight: 700 }}>
                {currentUser?.totalPoints ?? 0} PTS
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Rank P{currentUser?.seasonRank || 1}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(225, 6, 0, 0.12) 0%, rgba(13, 15, 18, 0.6) 100%)',
            border: '1px solid rgba(225, 6, 0, 0.25)',
            borderRadius: '10px',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff4d4d', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Flag size={14} />
            <span>The Grid • The Motorsport Community Hub</span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.35 }}>
            Sign in with Google to explore motorsport hubs, follow race weekends, and compete on Prediction Bench.
          </p>
        </div>
      )}

      {/* 2. Predict Now CTA */}
      <Link
        to={activeRoundLink}
        onClick={onClose}
        className="mobile-nav-drawer__cta"
        style={{ minHeight: '44px' }}
      >
        <Zap size={16} />
        <span>PREDICTION BENCH</span>
      </Link>

      {/* 3. Primary Nav Links (Strictly: Home, Explore, Predictions, Leaderboard) */}
      <div className="mobile-nav-drawer__links">
        {/* HOME */}
        <Link
          to="/"
          onClick={onClose}
          className={`mobile-nav-drawer__link ${isItemActive('/') ? 'mobile-nav-drawer__link--active' : ''}`}
          style={{ minHeight: '44px' }}
        >
          <Home size={18} style={{ color: isItemActive('/') ? 'var(--f1-red)' : 'var(--text-secondary)' }} />
          <span>Home</span>
        </Link>

        {/* EXPLORE MOTORSPORT (Accordion) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: '0.5rem',
            }}
          >
            <Link
              to="/explore"
              onClick={onClose}
              className={`mobile-nav-drawer__link ${isItemActive('/explore') || isItemActive('/indian-motorsport') ? 'mobile-nav-drawer__link--active' : ''}`}
              style={{ flex: 1, minHeight: '44px' }}
            >
              <Compass size={18} style={{ color: isItemActive('/explore') ? 'var(--f1-red)' : 'var(--text-secondary)' }} />
              <span>Explore Motorsport</span>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExploreExpanded(prev => !prev);
              }}
              aria-label="Toggle motorsport categories"
              aria-expanded={exploreExpanded}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronDown
                size={16}
                style={{
                  transform: exploreExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>
          </div>

          {/* Expanded Motorsport Sub-list */}
          {exploreExpanded && (
            <div
              style={{
                marginLeft: '1.25rem',
                paddingLeft: '0.75rem',
                borderLeft: '2px solid rgba(225, 6, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                margin: '0.25rem 0 0.5rem 1.25rem',
              }}
            >
              {MOTORSPORT_HUBS.map(hub => (
                <Link
                  key={hub.path}
                  to={hub.path}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.5rem',
                    color: location.pathname === hub.path ? '#ffffff' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: location.pathname === hub.path ? 700 : 500,
                    borderRadius: '6px',
                    minHeight: '40px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: `${hub.color}22`,
                        color: hub.color,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {hub.badge}
                    </span>
                    <span>{hub.name}</span>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* PREDICTIONS */}
        <Link
          to="/predictions"
          onClick={onClose}
          className={`mobile-nav-drawer__link ${isItemActive('/predictions') ? 'mobile-nav-drawer__link--active' : ''}`}
          style={{ minHeight: '44px' }}
        >
          <CircleDot size={18} style={{ color: isItemActive('/predictions') ? 'var(--f1-red)' : 'var(--text-secondary)' }} />
          <span>Predictions</span>
        </Link>

        {/* LEADERBOARD */}
        <Link
          to="/leaderboard"
          onClick={onClose}
          className={`mobile-nav-drawer__link ${isItemActive('/leaderboard') ? 'mobile-nav-drawer__link--active' : ''}`}
          style={{ minHeight: '44px' }}
        >
          <Trophy size={18} style={{ color: isItemActive('/leaderboard') ? 'var(--f1-red)' : 'var(--text-secondary)' }} />
          <span>Leaderboard</span>
        </Link>
      </div>

      <div className="mobile-nav-drawer__divider" />

      {/* 4. Authenticated-only links or Logged-out buttons */}
      {isAuthenticated ? (
        <>
          <Link
            to={`/profile/${currentUser?.username}`}
            onClick={onClose}
            className="mobile-nav-drawer__link"
            style={{ minHeight: '44px' }}
          >
            <UserIcon size={18} style={{ color: 'var(--text-secondary)' }} />
            <span>My Profile</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="mobile-nav-drawer__link"
              style={{ color: 'var(--f1-red)', minHeight: '44px' }}
            >
              <Shield size={18} style={{ color: 'var(--f1-red)' }} />
              <span>Race Control (Admin)</span>
            </Link>
          )}

          <div className="mobile-nav-drawer__divider" />

          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="mobile-nav-drawer__link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              marginTop: '0.25rem',
              minHeight: '44px',
              width: '100%',
              justifyContent: 'flex-start',
            }}
          >
            <LogOut size={18} style={{ color: '#ef4444' }} />
            <span>Sign Out</span>
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
          <Link
            to="/login"
            onClick={onClose}
            className="auth-btn auth-btn--signin"
            style={{ justifyContent: 'center', height: '44px', fontSize: '0.85rem' }}
          >
            <LogIn size={16} />
            <span>SIGN IN</span>
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="auth-btn auth-btn--register"
            style={{ justifyContent: 'center', height: '44px', fontSize: '0.85rem' }}
          >
            <UserPlus size={16} />
            <span>JOIN THE LEAGUE</span>
          </Link>
        </div>
      )}
    </div>
  );
};

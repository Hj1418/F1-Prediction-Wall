import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  CalendarDays,
  MapPin,
  CircleDot,
  Trophy,
  User as UserIcon,
  Users,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
  Flag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserInitialsAvatar } from '../common/UserInitialsAvatar';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoundLink?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  activeRoundLink = '/predictions',
}) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  const userDisplayName = currentUser?.displayName || currentUser?.username || 'Racer';

  const navItems = [
    { label: 'Home', path: '/', icon: Home, matchPrefix: '/' },
    { label: 'Learn F1', path: '/learn', icon: BookOpen, matchPrefix: '/learn' },
    { label: 'Race Weekends', path: '/races', icon: CalendarDays, matchPrefix: '/races' },
    { label: 'Circuits', path: '/circuits', icon: MapPin, matchPrefix: '/circuits' },
    { label: 'Predictions', path: '/predictions', icon: CircleDot, matchPrefix: '/predictions' },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, matchPrefix: '/leaderboard' },
  ];

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
            <span>The Grid • The F1 Community Hub</span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.35 }}>
            Sign in with Google to explore circuits, follow race weekends, and compete on Prediction Bench.
          </p>
        </div>
      )}

      {/* 2. Predict Now CTA */}
      <Link
        to={activeRoundLink}
        onClick={onClose}
        className="mobile-nav-drawer__cta"
      >
        <Zap size={16} />
        <span>PREDICTION BENCH</span>
      </Link>

      {/* 3. Primary Nav Links */}
      {navItems.map(item => {
        const active = isItemActive(item.path);
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`mobile-nav-drawer__link ${active ? 'mobile-nav-drawer__link--active' : ''}`}
          >
            <Icon size={18} style={{ color: active ? 'var(--f1-red)' : 'var(--text-secondary)' }} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="mobile-nav-drawer__divider" />

      {/* 4. Authenticated-only links or Logged-out buttons */}
      {isAuthenticated ? (
        <>
          <Link
            to={`/profile/${currentUser?.username}`}
            onClick={onClose}
            className="mobile-nav-drawer__link"
          >
            <UserIcon size={18} style={{ color: 'var(--text-secondary)' }} />
            <span>My Profile</span>
          </Link>



          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="mobile-nav-drawer__link"
              style={{ color: 'var(--f1-red)' }}
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
            style={{ justifyContent: 'center', height: '42px', fontSize: '0.85rem' }}
          >
            <LogIn size={16} />
            <span>SIGN IN</span>
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="auth-btn auth-btn--register"
            style={{ justifyContent: 'center', height: '42px', fontSize: '0.85rem' }}
          >
            <UserPlus size={16} />
            <span>JOIN THE LEAGUE</span>
          </Link>
        </div>
      )}
    </div>
  );
};

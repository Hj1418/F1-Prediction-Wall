import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  CircleDot,
  Trophy,
  User as UserIcon,
  Users,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/getInitials';

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
  const { currentUser, isAdmin, setSwitcherOpen, openLoginModal, openRegisterModal, logout } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  const userInitials = getInitials(currentUser.displayName || currentUser.username || 'User');
  const userDisplayName = currentUser.displayName || currentUser.username || 'Racer';

  const navItems = [
    { label: 'Home', path: '/', icon: Home, matchPrefix: '/' },
    { label: 'Race Weekends', path: '/races', icon: CalendarDays, matchPrefix: '/races' },
    { label: 'Predictions', path: '/predictions', icon: CircleDot, matchPrefix: '/predictions' },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, matchPrefix: '/leaderboard' },
  ];

  const isItemActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="mobile-nav-drawer" style={{ maxHeight: 'calc(100vh - 94px)', overflowY: 'auto' }}>
      {/* 1. User Profile Strip */}
      <div className="mobile-nav-drawer__profile">
        <div className="mobile-nav-drawer__avatar">
          {userInitials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            {userDisplayName}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            @{currentUser.username}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-yellow)', fontWeight: 700 }}>
              {currentUser.totalPoints ?? 0} PTS
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Rank P{currentUser.seasonRank || 1}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Predict Now CTA */}
      <Link
        to={activeRoundLink}
        onClick={onClose}
        className="mobile-nav-drawer__cta"
      >
        <Zap size={16} />
        <span>PREDICT NOW</span>
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

      {/* 4. Secondary Actions */}
      <Link
        to={`/profile/${currentUser.username}`}
        onClick={onClose}
        className="mobile-nav-drawer__link"
      >
        <UserIcon size={18} style={{ color: 'var(--text-secondary)' }} />
        <span>My Profile</span>
      </Link>

      <button
        type="button"
        onClick={() => {
          onClose();
          setSwitcherOpen(true);
        }}
        className="mobile-nav-drawer__link"
        style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
      >
        <Users size={18} style={{ color: 'var(--text-secondary)' }} />
        <span>Switch Account (Demo)</span>
      </button>

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

      {/* 5. Auth Actions Row */}
      <div className="mobile-nav-drawer__auth-row">
        <button
          type="button"
          onClick={() => {
            onClose();
            openLoginModal();
          }}
          className="mobile-nav-drawer__auth-btn"
        >
          <LogIn size={15} />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            openRegisterModal();
          }}
          className="mobile-nav-drawer__auth-btn"
        >
          <UserPlus size={15} />
          <span>Register</span>
        </button>
      </div>

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
    </div>
  );
};

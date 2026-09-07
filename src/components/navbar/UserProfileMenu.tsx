import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  ChevronDown,
  User as UserIcon,
  Target,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/getInitials';
import { UserInitialsAvatar } from '../common/UserInitialsAvatar';

interface UserProfileMenuProps {
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  mobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const userDisplayName = currentUser?.displayName || currentUser?.username || 'Racer';

  return (
    <div className="navbar-actions">
      {!isAuthenticated ? (
        <>
          <Link
            to="/login"
            className="auth-btn auth-btn--signin"
            title="Sign in to your racer account"
            aria-label="Sign in"
          >
            <LogIn size={13} className="auth-btn__icon" />
            <span>SIGN IN</span>
          </Link>

          <Link
            to="/register"
            className="auth-btn auth-btn--register"
            title="Join the F1 Community Prediction League"
            aria-label="Join the F1 Community Prediction League"
          >
            <UserPlus size={13} className="auth-btn__icon" />
            <span className="auth-btn__text-full">JOIN THE LEAGUE</span>
            <span className="auth-btn__text-short">JOIN</span>
          </Link>
        </>
      ) : (
        /* User Profile Avatar & Dropdown */
        <div className="user-profile-wrapper" ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className={`user-profile-trigger ${isOpen ? 'user-profile-trigger--open' : ''}`}
            aria-label="Open profile menu"
            aria-expanded={isOpen}
            type="button"
          >
            {/* Circular Initials Avatar */}
            <UserInitialsAvatar
              name={userDisplayName}
              size="sm"
              className="shrink-0"
              showBorder={false}
            />

            {/* User Info (Name + Points) */}
            <div className="user-profile-trigger__info">
              <span className="user-profile-trigger__name">{userDisplayName}</span>
              <span className="user-profile-trigger__points">
                {currentUser?.totalPoints ?? 0} PTS
              </span>
            </div>

            {/* Chevron indicator */}
            <ChevronDown
              size={14}
              className={`user-profile-trigger__chevron ${isOpen ? 'user-profile-trigger__chevron--open' : ''}`}
            />
          </button>

        {/* Profile Dropdown Menu */}
        {isOpen && (
          <div className="user-dropdown" role="menu">
            {/* Header with name, handle and stats */}
            <div className="user-dropdown__header">
              <div className="user-dropdown__header-name">{currentUser?.displayName}</div>
              <div className="user-dropdown__header-handle">@{currentUser?.username}</div>
              <div className="user-dropdown__header-stats">
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-yellow)', fontWeight: 700 }}>
                  {currentUser?.totalPoints ?? 0} PTS
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Rank P{currentUser?.seasonRank || 1}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <Link
              to={`/profile/${currentUser?.username || ''}`}
              onClick={() => setIsOpen(false)}
              className="user-dropdown__item"
              role="menuitem"
            >
              <UserIcon size={14} style={{ color: 'var(--text-secondary)' }} />
              <span>My Profile</span>
            </Link>

            <Link
              to="/predictions"
              onClick={() => setIsOpen(false)}
              className="user-dropdown__item"
              role="menuitem"
            >
              <Target size={14} style={{ color: 'var(--text-secondary)' }} />
              <span>My Predictions</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="user-dropdown__item user-dropdown__item--admin"
                role="menuitem"
              >
                <Shield size={14} />
                <span>Race Control (Admin)</span>
              </Link>
            )}

            <div className="user-dropdown__divider" />

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="user-dropdown__item user-dropdown__item--danger"
              role="menuitem"
              type="button"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    )}

      {/* Mobile Hamburger Menu Toggle */}
      {onToggleMobileMenu && (
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileMenuOpen}
          type="button"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
    </div>
  );
};

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
import { UserInitialsAvatar } from '../common/UserInitialsAvatar';
import { NotificationCenter } from '../notifications/NotificationCenter';

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

  const userDisplayName = currentUser?.username || 'Grid User';

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
            title="Join The GRDX"
            aria-label="Join The GRDX"
          >
            <UserPlus size={13} className="auth-btn__icon" />
            <span className="auth-btn__text-full">JOIN THE GRDX</span>
            <span className="auth-btn__text-short">JOIN</span>
          </Link>
        </>
      ) : (
        <>
          <NotificationCenter />
          {/* User Profile Avatar & Dropdown */}
          <div className="user-profile-wrapper" ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsOpen(prev => !prev)}
              className={`user-profile-trigger ${isOpen ? 'user-profile-trigger--open' : ''}`}
              aria-label="Open profile menu"
              aria-expanded={isOpen}
              type="button"
            >
              {/* Circular Initials / Profile Avatar (32px × 32px) */}
              <UserInitialsAvatar
                name={userDisplayName}
                imageUrl={currentUser?.avatarUrl}
                size="sm"
                className="shrink-0 user-profile-trigger__avatar"
                showBorder={false}
              />

              {/* Dropdown Arrow: Subtle chevron icon */}
              <ChevronDown
                size={12}
                className={`user-profile-trigger__chevron ${isOpen ? 'user-profile-trigger__chevron--open' : ''}`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isOpen && (
              <div className="user-dropdown" role="menu">
                {/* Top User Info Header (Avatar side-by-side with username & points) */}
                <div className="user-dropdown__header">
                  <UserInitialsAvatar
                    name={userDisplayName}
                    imageUrl={currentUser?.avatarUrl}
                    size={42}
                    showBorder={false}
                  />
                  <div className="user-dropdown__details">
                    <div className="user-dropdown__header-name">{currentUser?.username || 'Grid User'}</div>
                    <div className="user-dropdown__header-points">
                      ⚡ {currentUser?.totalPoints ?? 0} PTS
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="user-dropdown__divider" />

                {/* Menu Links */}
                <Link
                  to={`/profile/${currentUser?.username || ''}`}
                  onClick={() => setIsOpen(false)}
                  className="user-dropdown__item"
                  role="menuitem"
                >
                  <UserIcon size={14} className="user-dropdown__icon" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  to="/quiz"
                  onClick={() => setIsOpen(false)}
                  className="user-dropdown__item"
                  role="menuitem"
                >
                  <Users size={14} className="user-dropdown__icon" />
                  <span>My Racing Tag</span>
                </Link>

                <Link
                  to="/predictions"
                  onClick={() => setIsOpen(false)}
                  className="user-dropdown__item"
                  role="menuitem"
                >
                  <Target size={14} className="user-dropdown__icon" />
                  <span>Prediction History</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="user-dropdown__item user-dropdown__item--admin"
                    role="menuitem"
                  >
                    <Shield size={14} className="user-dropdown__icon" />
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
                  <LogOut size={14} className="user-dropdown__icon" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </>
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

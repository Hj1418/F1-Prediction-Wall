import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Calendar,
  Target,
  Trophy,
  LogIn,
  UserPlus,
  ChevronDown,
  User as UserIcon,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { getInitials } from '../../utils/getInitials';

export const Navbar: React.FC = () => {
  const { currentUser, isAdmin, setSwitcherOpen, openLoginModal, openRegisterModal, logout } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeRoundLink, setActiveRoundLink] = useState<string>('/weekends');

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Dynamic active prediction round detection
  useEffect(() => {
    let mounted = true;
    const fetchActiveRound = async () => {
      try {
        const rounds = await api.getPredictionRounds();
        if (!mounted) return;
        const openRound =
          rounds.find(r => r.status === 'OPEN') ||
          rounds.find(r => r.status === 'UPCOMING') ||
          rounds[0];

        if (openRound) {
          setActiveRoundLink(`/predict/${openRound.roundId}`);
        } else {
          setActiveRoundLink('/predictions');
        }
      } catch (e) {
        console.warn('Failed to load active round in navbar', e);
      }
    };
    fetchActiveRound();
    return () => {
      mounted = false;
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'HOME', path: '/', icon: Home },
    { label: 'RACE WEEKENDS', path: '/races', icon: Calendar },
    { label: 'PREDICTIONS', path: '/predictions', icon: Target },
    { label: 'LEADERBOARD', path: '/leaderboard', icon: Trophy },
  ];

  const userInitials = getInitials(currentUser.displayName || currentUser.username || 'User');
  const userDisplayName = currentUser.displayName || currentUser.username || 'Racer';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(8, 10, 15, 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="navbar-container">
        {/* 1. BRAND SECTION */}
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {/* F1 Logo Tile */}
            <div
              className="brand-logo"
              style={{
                backgroundColor: 'var(--f1-red)',
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(225, 6, 0, 0.45)',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}
              >
                F1
              </span>
            </div>

            {/* Brand Title Row + Subtitle */}
            <div className="brand-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div className="brand-title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  className="brand-title"
                  style={{
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    letterSpacing: '0.04em',
                    color: '#fff',
                    lineHeight: 1,
                  }}
                >
                  PREDICTION
                </span>
                <span
                  className="season-badge"
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(225, 6, 0, 0.15)',
                    border: '1px solid rgba(225, 6, 0, 0.35)',
                    padding: '0.12rem 0.45rem',
                    borderRadius: '4px',
                    color: 'var(--f1-red)',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1,
                    letterSpacing: '0.04em',
                  }}
                >
                  PRO 2026
                </span>
              </div>

              <span
                className="brand-subtitle"
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                F1 COMMUNITY PREDICTION LEAGUE
              </span>
            </div>
          </Link>
        </div>

        {/* Divider 1: Brand | Navigation */}
        <div
          className="nav-divider desktop-only"
          style={{
            width: '1px',
            height: '26px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            margin: '0 1.25rem',
            flexShrink: 0,
          }}
        />

        {/* 2. NAVIGATION LINKS */}
        <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(link => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  textDecoration: 'none',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.84rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  borderBottom: active ? '2px solid var(--f1-red)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                  height: '42px',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon
                  size={15}
                  style={{
                    color: active ? 'var(--f1-red)' : 'currentColor',
                    transition: 'color 0.15s ease',
                  }}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. ACTIONS + USER SECTION */}
        <div
          className="nav-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginLeft: 'auto',
          }}
        >
          {/* Primary Action: MAKE PREDICTION CTA */}
          <Link
            to={activeRoundLink}
            id="desktop-predict-cta"
            style={{
              display: 'none',
              backgroundColor: 'var(--f1-red)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.78rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '0 1rem',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 0 16px rgba(225, 6, 0, 0.35)',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--f1-red-hover)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(225, 6, 0, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--f1-red)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(225, 6, 0, 0.35)';
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'inline-block',
              }}
              className="live-pulse"
            />
            <span>MAKE PREDICTION</span>
          </Link>

          {/* Secondary Auth Actions: SIGN IN & REGISTER */}
          <div className="desktop-auth-btns" style={{ display: 'none', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={openLoginModal}
              title="Sign in with racer credentials"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0 0.85rem',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <LogIn size={13} style={{ color: 'var(--text-secondary)' }} />
              <span>SIGN IN</span>
            </button>

            <button
              onClick={openRegisterModal}
              title="Register new prediction profile"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0 0.85rem',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <UserPlus size={13} style={{ color: 'var(--text-secondary)' }} />
              <span>REGISTER</span>
            </button>
          </div>

          {/* Divider 2: Actions | User Profile */}
          <div
            className="nav-divider desktop-only"
            style={{
              width: '1px',
              height: '26px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              margin: '0 0.25rem',
              flexShrink: 0,
            }}
          />

          {/* USER PROFILE SECTION (Initials avatar + Name + Points + Dropdown) */}
          <div className="user-profile-wrapper" ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(prev => !prev)}
              aria-label="Open profile menu"
              aria-expanded={userMenuOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: userMenuOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: userMenuOpen ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-full)',
                padding: '0.2rem 0.75rem 0.2rem 0.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                color: 'inherit',
                height: '38px',
              }}
              onMouseEnter={e => {
                if (!userMenuOpen) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={e => {
                if (!userMenuOpen) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }
              }}
            >
              {/* Circular Initials Avatar */}
              <div
                className="initials-avatar"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e10600 0%, #8b0000 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  color: '#ffffff',
                  boxShadow: '0 0 10px rgba(225, 6, 0, 0.35)',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {userInitials}
              </div>

              {/* User Info (Name + Points) */}
              <div
                className="user-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  lineHeight: 1.15,
                  textAlign: 'left',
                }}
              >
                <span
                  className="user-name"
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px',
                    display: 'block',
                  }}
                >
                  {userDisplayName}
                </span>
                <span
                  className="user-points"
                  style={{
                    fontSize: '0.64rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--telemetry-yellow)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {currentUser.totalPoints ?? 0} PTS
                </span>
              </div>

              {/* Chevron indicator */}
              <ChevronDown
                size={13}
                style={{
                  color: 'var(--text-secondary)',
                  transition: 'transform 0.2s ease',
                  transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  marginLeft: '0.1rem',
                }}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {userMenuOpen && (
              <div
                className="user-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 14px 34px rgba(0, 0, 0, 0.65)',
                  padding: '0.5rem',
                  zIndex: 110,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* User Header in Dropdown */}
                <div
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '0.35rem',
                  }}
                >
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff' }}>
                    {currentUser.displayName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    @{currentUser.username}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginTop: '0.45rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--telemetry-yellow)',
                        fontWeight: 700,
                      }}
                    >
                      {currentUser.totalPoints ?? 0} PTS
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Rank P{currentUser.seasonRank || 1}
                    </span>
                  </div>
                </div>

                {/* Dropdown Items */}
                <Link
                  to={`/profile/${currentUser.username}`}
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <UserIcon size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/leaderboard"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Trophy size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span>Leaderboard Standings</span>
                </Link>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setSwitcherOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                  <span>Switch Account (Demo)</span>
                </button>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--f1-red)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(225, 6, 0, 0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Shield size={14} style={{ color: 'var(--f1-red)' }} />
                    <span>Race Control (Admin)</span>
                  </Link>
                )}

                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--border-subtle)',
                    margin: '0.25rem 0',
                  }}
                />

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#ef4444',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} style={{ color: '#ef4444' }} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle mobile menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Mobile User Profile Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e10600 0%, #8b0000 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                {userDisplayName}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--telemetry-yellow)',
                  fontWeight: 700,
                }}
              >
                {currentUser.totalPoints ?? 0} PTS • P{currentUser.seasonRank || 1}
              </span>
            </div>
          </div>

          {/* Primary CTA in Mobile Menu */}
          <Link
            to={activeRoundLink}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              backgroundColor: 'var(--f1-red)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.84rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'inline-block',
              }}
              className="live-pulse"
            />
            <span>MAKE PREDICTION</span>
          </Link>

          {/* Mobile Nav Links */}
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  textDecoration: 'none',
                  color: active ? 'var(--f1-red)' : 'var(--text-primary)',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.95rem',
                  padding: '0.5rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Icon size={17} style={{ color: active ? 'var(--f1-red)' : 'var(--text-secondary)' }} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                textDecoration: 'none',
                color: 'var(--f1-red)',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Shield size={16} />
              <span>Race Control (Admin)</span>
            </Link>
          )}

          {/* Mobile Auth Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openLoginModal();
              }}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '0.65rem 0',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openRegisterModal();
              }}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '0.65rem 0',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <UserPlus size={14} />
              <span>Register</span>
            </button>
          </div>
        </div>
      )}

      {/* Responsive Media Queries */}
      <style>{`
        .navbar-container {
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          height: 70px;
          box-sizing: border-box;
        }

        @media (min-width: 1160px) {
          .desktop-nav { display: flex !important; }
          #desktop-predict-cta { display: inline-flex !important; }
          .desktop-auth-btns { display: flex !important; }
          .desktop-only { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }

        @media (min-width: 860px) and (max-width: 1159px) {
          .desktop-nav { display: flex !important; gap: 0.15rem !important; }
          #desktop-predict-cta { display: inline-flex !important; }
          .desktop-auth-btns { display: none !important; }
          .desktop-only { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }

        @media (max-width: 859px) {
          .desktop-nav { display: none !important; }
          #desktop-predict-cta { display: none !important; }
          .desktop-auth-btns { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

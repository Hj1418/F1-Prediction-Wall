import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Calendar, Shield, Users, Menu, X, ChevronDown, CheckCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isAdmin, setSwitcherOpen } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'Calendar', path: '/weekends', icon: Calendar },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(8, 10, 15, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: 'var(--f1-red)',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--f1-red-glow)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.15rem', color: '#fff' }}>
              F1
            </span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.05em', color: '#fff' }}>
                COMMUNITY
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px',
                  color: 'var(--telemetry-green)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                2026
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Prediction League
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          {navLinks.map(link => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  textDecoration: 'none',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  borderBottom: active ? '2px solid var(--f1-red)' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {link.icon && <link.icon size={14} />}
                {link.label}
              </Link>
            );
          })}

          {/* Admin Link */}
          <Link
            to="/admin"
            style={{
              textDecoration: 'none',
              color: isActive('/admin') ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isActive('/admin') ? 'rgba(225, 6, 0, 0.12)' : 'transparent',
              borderBottom: isActive('/admin') ? '2px solid var(--f1-red)' : '2px solid transparent',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Shield size={14} color={isAdmin ? 'var(--f1-red)' : undefined} />
            Admin {isAdmin && <span style={{ fontSize: '0.65rem', color: 'var(--f1-red)' }}>●</span>}
          </Link>
        </nav>

        {/* User Profile & Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Active Round Pulse CTA (Desktop) */}
          <Link
            to="/predict/round_chn_gp"
            className="btn btn-primary btn-sm"
            style={{
              display: 'none',
              animation: 'none',
            }}
            id="desktop-predict-cta"
          >
            <span className="live-pulse" />
            PREDICT CHINESE GP
          </Link>

          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.6rem 0.25rem 0.35rem',
            }}
          >
            <Link
              to={`/profile/${currentUser.username}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'inherit',
              }}
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid var(--border-medium)',
                }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{currentUser.displayName.split(' ')[0]}</div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--telemetry-yellow)' }}>
                  {currentUser.totalPoints} PTS
                </div>
              </div>
            </Link>

            {/* Quick Switcher Button */}
            <button
              onClick={() => setSwitcherOpen(true)}
              title="Switch user account (Demo)"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.7rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <Users size={12} />
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? 'var(--f1-red)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.6rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              {link.icon && <link.icon size={16} />}
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              textDecoration: 'none',
              color: isActive('/admin') ? 'var(--f1-red)' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '0.6rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Shield size={16} /> Admin Control Center
          </Link>
          <Link
            to="/predict/round_chn_gp"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '0.5rem' }}
          >
            <span className="live-pulse" /> PREDICT CHINESE GP
          </Link>
        </div>
      )}

      {/* CSS rules for responsive layout */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          #desktop-predict-cta { display: inline-flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};

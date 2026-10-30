import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Calendar, CircleDot, Trophy, ChevronDown, Brain, Sliders } from 'lucide-react';
import { ExploreMegaMenu } from './ExploreMegaMenu';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  matchPrefixes?: string[];
  isMegaMenu?: boolean;
}

interface CompeteSubItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description: string;
  pillText: string;
  colorType: 'flame' | 'gold' | 'cyan';
  matchPrefixes: string[];
  requiresAuth?: boolean;
}

const COMPETE_ITEMS: CompeteSubItem[] = [
  {
    label: 'PREDICTIONS',
    path: '/predictions',
    icon: CircleDot,
    title: 'PREDICTIONS',
    description: 'Predict podiums, poles & safety cars to earn GP points.',
    pillText: 'PREDICT & SCORE',
    colorType: 'flame',
    matchPrefixes: ['/predictions', '/predict'],
    requiresAuth: true,
  },
  {
    label: 'STRATEGY ROOM',
    path: '/strategy',
    icon: Sliders,
    title: 'STRATEGY ROOM',
    description: 'Make pit window, undercut & safety car calls in live race simulations.',
    pillText: 'RACE STRATEGIST',
    colorType: 'cyan',
    matchPrefixes: ['/strategy'],
    requiresAuth: true,
  },
  {
    label: 'RACING TAG',
    path: '/quiz',
    icon: Brain,
    title: 'RACING TAG & QUIZ',
    description: 'Test motorsport IQ across 120 verified regulation questions.',
    pillText: 'QUIZ',
    colorType: 'cyan',
    matchPrefixes: ['/quiz'],
    requiresAuth: true,
  },
  {
    label: 'LEADERBOARD',
    path: '/leaderboard',
    icon: Trophy,
    title: 'LEADERBOARD',
    description: 'Global community standings, user tiers & season ranks.',
    pillText: 'STANDINGS',
    colorType: 'gold',
    matchPrefixes: ['/leaderboard'],
    requiresAuth: false,
  },
];

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: 'HOME', path: '/', icon: Home },
  {
    label: 'EXPLORE',
    path: '/explore',
    icon: Compass,
    matchPrefixes: ['/explore', '/championships', '/circuits', '/indian-motorsport'],
    isMegaMenu: true,
  },
  {
    label: 'CALENDAR',
    path: '/calendar',
    icon: Calendar,
    matchPrefixes: ['/calendar', '/schedule', '/races', '/weekends'],
  },
];

export const NavbarLinks: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, openLoginModal } = useAuth();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isCompeteOpen, setIsCompeteOpen] = useState(false);
  const exploreCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const competeCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exploreTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const competeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const competeWrapperRef = useRef<HTMLDivElement | null>(null);

  const isPrimaryActive = (item: NavItem): boolean => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    if (item.matchPrefixes) {
      return item.matchPrefixes.some(prefix => location.pathname.startsWith(prefix));
    }
    return location.pathname.startsWith(item.path);
  };

  const isCompeteActive = COMPETE_ITEMS.some(item =>
    item.matchPrefixes.some(prefix => location.pathname.startsWith(prefix))
  );

  const competeOpenTimeRef = useRef<number>(0);

  // Explore hover handlers
  const handleMouseEnterExplore = useCallback(() => {
    if (exploreCloseTimeoutRef.current) {
      clearTimeout(exploreCloseTimeoutRef.current);
      exploreCloseTimeoutRef.current = null;
    }
    setIsCompeteOpen(false);
    setIsExploreOpen(true);
  }, []);

  const handleMouseLeaveExplore = useCallback(() => {
    exploreCloseTimeoutRef.current = setTimeout(() => {
      setIsExploreOpen(false);
    }, 200);
  }, []);

  const handleCloseMegaMenu = useCallback(() => {
    if (exploreCloseTimeoutRef.current) {
      clearTimeout(exploreCloseTimeoutRef.current);
      exploreCloseTimeoutRef.current = null;
    }
    setIsExploreOpen(false);
  }, []);

  // Compete hover handlers - robust continuous hover area with 250ms grace delay
  const handleMouseEnterCompete = useCallback(() => {
    if (competeCloseTimeoutRef.current) {
      clearTimeout(competeCloseTimeoutRef.current);
      competeCloseTimeoutRef.current = null;
    }
    competeOpenTimeRef.current = Date.now();
    setIsExploreOpen(false);
    setIsCompeteOpen(true);
  }, []);

  const handleMouseLeaveCompete = useCallback(() => {
    if (competeCloseTimeoutRef.current) {
      clearTimeout(competeCloseTimeoutRef.current);
    }
    competeCloseTimeoutRef.current = setTimeout(() => {
      setIsCompeteOpen(false);
      competeCloseTimeoutRef.current = null;
    }, 250);
  }, []);

  const handleCloseCompete = useCallback(() => {
    if (competeCloseTimeoutRef.current) {
      clearTimeout(competeCloseTimeoutRef.current);
      competeCloseTimeoutRef.current = null;
    }
    setIsCompeteOpen(false);
  }, []);

  // Handle click on the Compete button: toggle menu, but prevent accidental closing if just opened via hover
  const handleCompeteTriggerClick = useCallback(() => {
    const timeSinceOpen = Date.now() - competeOpenTimeRef.current;
    if (isCompeteOpen && timeSinceOpen < 350) {
      return;
    }
    setIsCompeteOpen(prev => {
      if (!prev) {
        competeOpenTimeRef.current = Date.now();
      }
      return !prev;
    });
  }, [isCompeteOpen]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (competeWrapperRef.current && !competeWrapperRef.current.contains(e.target as Node)) {
        setIsCompeteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard navigation & accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isExploreOpen) {
          setIsExploreOpen(false);
          exploreTriggerRef.current?.focus();
        }
        if (isCompeteOpen) {
          setIsCompeteOpen(false);
          competeTriggerRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExploreOpen, isCompeteOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsExploreOpen(false);
    setIsCompeteOpen(false);
  }, [location.pathname]);

  return (
    <nav className="navbar-links" aria-label="Main Navigation">
      {/* Primary Links: HOME, EXPLORE (MegaMenu), CALENDAR */}
      {PRIMARY_NAV_ITEMS.map(item => {
        const active = isPrimaryActive(item);
        const Icon = item.icon;

        if (item.isMegaMenu) {
          return (
            <div
              key={item.path}
              className="navbar-mega-wrapper"
              onMouseEnter={handleMouseEnterExplore}
              onMouseLeave={handleMouseLeaveExplore}
            >
              <Link
                ref={exploreTriggerRef}
                to={item.path}
                className={`nav-link ${active ? 'nav-link--active' : ''} ${isExploreOpen ? 'nav-link--menu-open' : ''}`}
                aria-current={active ? 'page' : undefined}
                aria-haspopup="true"
                aria-expanded={isExploreOpen}
                onFocus={handleMouseEnterExplore}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    setIsExploreOpen(true);
                  }
                }}
              >
                <Icon size={14} className="nav-link__icon" />
                <span>{item.label}</span>
                <ChevronDown
                  size={12}
                  className={`nav-link__chevron ${isExploreOpen ? 'nav-link__chevron--open' : ''}`}
                />
              </Link>

              {/* Desktop Hover Mega-Menu */}
              <ExploreMegaMenu
                isOpen={isExploreOpen}
                onClose={handleCloseMegaMenu}
                onMouseEnter={handleMouseEnterExplore}
                onMouseLeave={handleMouseLeaveExplore}
              />
            </div>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${active ? 'nav-link--active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={14} className="nav-link__icon" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Gamification Hub: COMPETE Dropdown */}
      <div
        ref={competeWrapperRef}
        className="navbar-compete-wrapper"
        onMouseEnter={handleMouseEnterCompete}
        onMouseLeave={handleMouseLeaveCompete}
      >
        <button
          ref={competeTriggerRef}
          type="button"
          className={`nav-link ${isCompeteActive ? 'nav-link--active' : ''} ${isCompeteOpen ? 'nav-link--menu-open' : ''}`}
          aria-haspopup="true"
          aria-expanded={isCompeteOpen}
          aria-label="Compete menu"
          onClick={handleCompeteTriggerClick}
          onFocus={handleMouseEnterCompete}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsCompeteOpen(true);
            }
          }}
        >
          <Trophy size={14} className="nav-link__icon" />
          <span>COMPETE</span>
          <ChevronDown
            size={12}
            className={`nav-link__chevron ${isCompeteOpen ? 'nav-link__chevron--open' : ''}`}
          />
        </button>

        {/* Dropdown Menu for Gamification Features */}
        {isCompeteOpen && (
          <div
            className="compete-dropdown-menu"
            role="menu"
            aria-label="Compete and Gamification"
            onMouseEnter={handleMouseEnterCompete}
            onMouseLeave={handleMouseLeaveCompete}
          >
            <div className="compete-dropdown__header">
              <span className="compete-dropdown__label">GAMIFICATION &amp; CHALLENGES</span>
              <span className="compete-dropdown__badge">2026 SEASON</span>
            </div>
            <div className="compete-dropdown__items">
              {COMPETE_ITEMS.map(item => {
                const ItemIcon = item.icon;
                const itemActive = item.matchPrefixes.some(prefix => location.pathname.startsWith(prefix));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`compete-dropdown__item ${itemActive ? 'compete-dropdown__item--active' : ''}`}
                    role="menuitem"
                    onClick={(e) => {
                      handleCloseCompete();
                      if (item.requiresAuth && !isAuthenticated) {
                        e.preventDefault();
                        openLoginModal(item.path);
                      }
                    }}
                  >
                    <div className={`compete-dropdown__icon-box compete-dropdown__icon-box--${item.colorType}`}>
                      <ItemIcon size={18} />
                    </div>
                    <div className="compete-dropdown__item-content">
                      <div className="compete-dropdown__item-header">
                        <span className="compete-dropdown__item-title">{item.title}</span>
                        <span className={`compete-dropdown__item-pill compete-dropdown__item-pill--${item.colorType}`}>
                          {item.pillText}
                        </span>
                      </div>
                      <p className="compete-dropdown__item-desc">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarLinks;

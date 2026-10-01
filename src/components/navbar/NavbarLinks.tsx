import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Calendar, CircleDot, Trophy, ChevronDown } from 'lucide-react';
import { ExploreMegaMenu } from './ExploreMegaMenu';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  matchPrefixes?: string[];
  isMegaMenu?: boolean;
}

const NAV_ITEMS: NavItem[] = [
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
  { label: 'PREDICTIONS', path: '/predictions', icon: CircleDot, matchPrefixes: ['/predictions', '/predict'] },
  { label: 'LEADERBOARD', path: '/leaderboard', icon: Trophy, matchPrefixes: ['/leaderboard'] },
];

export const NavbarLinks: React.FC = () => {
  const location = useLocation();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exploreTriggerRef = useRef<HTMLAnchorElement | null>(null);

  const isItemActive = (item: NavItem): boolean => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    if (item.matchPrefixes) {
      return item.matchPrefixes.some(prefix => location.pathname.startsWith(prefix));
    }
    return location.pathname.startsWith(item.path);
  };

  const handleMouseEnterExplore = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsExploreOpen(true);
  }, []);

  const handleMouseLeaveExplore = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExploreOpen(false);
    }, 150);
  }, []);

  const handleCloseMegaMenu = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsExploreOpen(false);
  }, []);

  // Keyboard navigation & accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExploreOpen) {
        setIsExploreOpen(false);
        exploreTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExploreOpen]);

  // Close on route change
  useEffect(() => {
    setIsExploreOpen(false);
  }, [location.pathname]);

  return (
    <nav className="navbar-links" aria-label="Main Navigation">
      {NAV_ITEMS.map(item => {
        const active = isItemActive(item);
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
    </nav>
  );
};

export default NavbarLinks;

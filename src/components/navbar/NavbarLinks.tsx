import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, CalendarDays, Compass, MapPin, CircleDot, Trophy } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  matchPrefixes?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'HOME', path: '/', icon: Home },
  { label: 'LEARN', path: '/learn', icon: BookOpen, matchPrefixes: ['/learn'] },
  { label: 'RACES', path: '/races', icon: CalendarDays, matchPrefixes: ['/races', '/weekends', '/schedule'] },
  { label: 'EXPLORE', path: '/championships', icon: Compass, matchPrefixes: ['/championships', '/explore', '/circuits'] },
  { label: 'PREDICTIONS', path: '/predictions', icon: CircleDot, matchPrefixes: ['/predictions', '/predict'] },
  { label: 'LEADERBOARD', path: '/leaderboard', icon: Trophy, matchPrefixes: ['/leaderboard'] },
];

export const NavbarLinks: React.FC = () => {
  const location = useLocation();

  const isItemActive = (item: NavItem): boolean => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    if (item.matchPrefixes) {
      return item.matchPrefixes.some(prefix => location.pathname.startsWith(prefix));
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="navbar-links" aria-label="Main Navigation">
      {NAV_ITEMS.map(item => {
        const active = isItemActive(item);
        const Icon = item.icon;

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

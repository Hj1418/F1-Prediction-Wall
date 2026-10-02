import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, ChevronRight } from 'lucide-react';

export interface ExploreMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface MotorsportNavItem {
  id: string;
  name: string;
  shortName: string;
  path: string;
  badgeColor: string;
}

const FORMULA_RACING: MotorsportNavItem[] = [
  { id: 'f1', name: 'Formula 1', shortName: 'F1', path: '/explore/f1', badgeColor: '#e10600' },
  { id: 'f2', name: 'Formula 2', shortName: 'F2', path: '/explore/f2', badgeColor: '#0090d0' },
  { id: 'f3', name: 'Formula 3', shortName: 'F3', path: '/explore/f3', badgeColor: '#e03a3e' },
  { id: 'f4', name: 'Formula 4', shortName: 'F4', path: '/explore/f4', badgeColor: '#10b981' },
  { id: 'formula-e', name: 'Formula E', shortName: 'FE', path: '/explore/formula-e', badgeColor: '#00d2be' },
];

const MOTORCYCLE_RACING: MotorsportNavItem[] = [
  { id: 'motogp', name: 'MotoGP', shortName: 'MotoGP', path: '/explore/motogp', badgeColor: '#dc2626' },
  { id: 'moto2', name: 'Moto2', shortName: 'Moto2', path: '/explore/moto2', badgeColor: '#3b82f6' },
  { id: 'moto3', name: 'Moto3', shortName: 'Moto3', path: '/explore/moto3', badgeColor: '#10b981' },
];

const ENDURANCE_GT: MotorsportNavItem[] = [
  { id: 'wec', name: 'FIA WEC', shortName: 'WEC', path: '/explore/wec', badgeColor: '#2563eb' },
  { id: 'gt-world-challenge', name: 'GT World Challenge', shortName: 'GT3', path: '/explore/gt-world-challenge', badgeColor: '#f59e0b' },
];

const OTHER_DISCIPLINES: MotorsportNavItem[] = [
  { id: 'wrc', name: 'WRC Rally', shortName: 'WRC', path: '/explore/wrc', badgeColor: '#f97316' },
  { id: 'indian-motorsport', name: 'Indian Motorsport', shortName: 'IN', path: '/indian-motorsport', badgeColor: '#ff9933' },
];

export const ExploreMegaMenu: React.FC<ExploreMegaMenuProps> = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="explore-mega-menu"
      role="region"
      aria-label="Explore Motorsport Hubs"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="explore-mega-menu__container">
        {/* Header Bar */}
        <div className="explore-mega-menu__header">
          <div className="explore-mega-menu__title-group">
            <div className="explore-mega-menu__icon-box">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="explore-mega-menu__title">EXPLORE MOTORSPORT</h2>
            </div>
          </div>
          <Link
            to="/explore"
            onClick={onClose}
            className="explore-mega-menu__view-all-link"
          >
            <span>VIEW ALL MOTORSPORTS</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 4 Column Compact Motorsport Grid */}
        <div className="explore-mega-menu__grid">
          {/* Column 1: Formula Racing */}
          <div className="explore-mega-menu__column">
            <div className="explore-mega-menu__col-header">
              <span className="explore-mega-menu__col-dot" />
              <span>FORMULA RACING</span>
            </div>
            <div className="explore-mega-menu__items">
              {FORMULA_RACING.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className="explore-mega-menu__item"
                >
                  <span
                    className="explore-mega-menu__badge"
                    style={{
                      backgroundColor: `${item.badgeColor}22`,
                      color: item.badgeColor,
                      borderColor: `${item.badgeColor}44`,
                    }}
                  >
                    {item.shortName}
                  </span>
                  <span className="explore-mega-menu__item-name">{item.name}</span>
                  <ChevronRight size={14} className="explore-mega-menu__chevron" />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Motorcycle Racing */}
          <div className="explore-mega-menu__column">
            <div className="explore-mega-menu__col-header">
              <span className="explore-mega-menu__col-dot" style={{ backgroundColor: '#dc2626' }} />
              <span>MOTORCYCLE RACING</span>
            </div>
            <div className="explore-mega-menu__items">
              {MOTORCYCLE_RACING.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className="explore-mega-menu__item"
                >
                  <span
                    className="explore-mega-menu__badge"
                    style={{
                      backgroundColor: `${item.badgeColor}22`,
                      color: item.badgeColor,
                      borderColor: `${item.badgeColor}44`,
                    }}
                  >
                    {item.shortName}
                  </span>
                  <span className="explore-mega-menu__item-name">{item.name}</span>
                  <ChevronRight size={14} className="explore-mega-menu__chevron" />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Endurance / GT */}
          <div className="explore-mega-menu__column">
            <div className="explore-mega-menu__col-header">
              <span className="explore-mega-menu__col-dot" style={{ backgroundColor: '#2563eb' }} />
              <span>ENDURANCE / GT</span>
            </div>
            <div className="explore-mega-menu__items">
              {ENDURANCE_GT.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className="explore-mega-menu__item"
                >
                  <span
                    className="explore-mega-menu__badge"
                    style={{
                      backgroundColor: `${item.badgeColor}22`,
                      color: item.badgeColor,
                      borderColor: `${item.badgeColor}44`,
                    }}
                  >
                    {item.shortName}
                  </span>
                  <span className="explore-mega-menu__item-name">{item.name}</span>
                  <ChevronRight size={14} className="explore-mega-menu__chevron" />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Other Disciplines */}
          <div className="explore-mega-menu__column">
            <div className="explore-mega-menu__col-header">
              <span className="explore-mega-menu__col-dot" style={{ backgroundColor: '#ff9933' }} />
              <span>OTHER DISCIPLINES</span>
            </div>
            <div className="explore-mega-menu__items">
              {OTHER_DISCIPLINES.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className="explore-mega-menu__item"
                >
                  <span
                    className="explore-mega-menu__badge"
                    style={{
                      backgroundColor: `${item.badgeColor}22`,
                      color: item.badgeColor,
                      borderColor: `${item.badgeColor}44`,
                    }}
                  >
                    {item.shortName}
                  </span>
                  <span className="explore-mega-menu__item-name">{item.name}</span>
                  <ChevronRight size={14} className="explore-mega-menu__chevron" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

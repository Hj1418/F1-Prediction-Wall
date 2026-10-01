import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Zap,
  Layers,
  Flag,
  ChevronRight,
} from 'lucide-react';

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
  description: string;
  tag?: string;
}

const FORMULA_RACING: MotorsportNavItem[] = [
  {
    id: 'f1',
    name: 'Formula 1',
    shortName: 'F1',
    path: '/explore/f1',
    badgeColor: '#e10600',
    description: 'Pinnacle of open-wheel racing and automotive technology',
  },
  {
    id: 'f2',
    name: 'Formula 2',
    shortName: 'F2',
    path: '/explore/f2',
    badgeColor: '#0090d0',
    description: 'Primary feeder ladder to Formula 1 with spec machinery',
  },
  {
    id: 'f3',
    name: 'Formula 3',
    shortName: 'F3',
    path: '/explore/f3',
    badgeColor: '#e03a3e',
    description: '30-car junior open-wheel warfare & reverse grids',
  },
  {
    id: 'f4',
    name: 'Formula 4',
    shortName: 'F4',
    path: '/explore/f4',
    badgeColor: '#10b981',
    description: 'First global step from karting into carbon-fibre single-seaters',
  },
  {
    id: 'formula-e',
    name: 'Formula E',
    shortName: 'FE',
    path: '/explore/formula-e',
    badgeColor: '#00d2be',
    description: 'Gen3 Evo all-electric street racing & strategic regeneration',
  },
];

const MOTORCYCLE_RACING: MotorsportNavItem[] = [
  {
    id: 'motogp',
    name: 'MotoGP',
    shortName: 'MotoGP',
    path: '/explore/motogp',
    badgeColor: '#dc2626',
    description: '360+ km/h two-wheeled prototype racing with 65° lean angles',
    tag: 'PREMIER',
  },
  {
    id: 'moto2',
    name: 'Moto2',
    shortName: 'Moto2',
    path: '/explore/moto2',
    badgeColor: '#3b82f6',
    description: 'Intermediate prototype class powered by Triumph 765cc spec triples',
    tag: 'FEEDER',
  },
  {
    id: 'moto3',
    name: 'Moto3',
    shortName: 'Moto3',
    path: '/explore/moto3',
    badgeColor: '#10b981',
    description: 'Lightweight junior class featuring 250cc single-cylinder battles',
    tag: 'JUNIOR',
  },
];

const ENDURANCE_GT: MotorsportNavItem[] = [
  {
    id: 'wec',
    name: 'FIA WEC',
    shortName: 'WEC',
    path: '/explore/wec',
    badgeColor: '#2563eb',
    description: 'Hypercar prototypes, multi-class marathons & 24h Le Mans',
  },
  {
    id: 'gt-world-challenge',
    name: 'GT World Challenge',
    shortName: 'GT3',
    path: '/explore/gt-world-challenge',
    badgeColor: '#f59e0b',
    description: 'Global benchmark for customer GT3 sportscars & 24h Spa',
  },
];

const OTHER_DISCIPLINES: MotorsportNavItem[] = [
  {
    id: 'wrc',
    name: 'WRC Rally',
    shortName: 'WRC',
    path: '/explore/wrc',
    badgeColor: '#f97316',
    description: 'Full-throttle courage against the clock across snow, gravel & asphalt',
  },
  {
    id: 'indian-motorsport',
    name: 'Indian Motorsport',
    shortName: 'IN',
    path: '/indian-motorsport',
    badgeColor: '#ff9933',
    description: 'FMSCI, Indian Racing League, F4 India & iconic domestic circuits',
    tag: 'NATIONAL',
  },
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
        {/* Header Header */}
        <div className="explore-mega-menu__header">
          <div className="explore-mega-menu__title-group">
            <div className="explore-mega-menu__icon-box">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="explore-mega-menu__title">EXPLORE MOTORSPORT</h2>
              <p className="explore-mega-menu__subtitle">
                Discover a world beyond F1 — technical machinery, feeder pathways, and global grids.
              </p>
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

        {/* 4 Column Motorsport Grid */}
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
                    style={{ backgroundColor: `${item.badgeColor}22`, color: item.badgeColor, borderColor: `${item.badgeColor}44` }}
                  >
                    {item.shortName}
                  </span>
                  <div className="explore-mega-menu__item-text">
                    <span className="explore-mega-menu__item-name">{item.name}</span>
                    <span className="explore-mega-menu__item-desc">{item.description}</span>
                  </div>
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
                    style={{ backgroundColor: `${item.badgeColor}22`, color: item.badgeColor, borderColor: `${item.badgeColor}44` }}
                  >
                    {item.shortName}
                  </span>
                  <div className="explore-mega-menu__item-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="explore-mega-menu__item-name">{item.name}</span>
                      {item.tag && (
                        <span className="explore-mega-menu__tag">{item.tag}</span>
                      )}
                    </div>
                    <span className="explore-mega-menu__item-desc">{item.description}</span>
                  </div>
                  <ChevronRight size={14} className="explore-mega-menu__chevron" />
                </Link>
              ))}
            </div>
            <div className="explore-mega-menu__column-callout">
              <div className="explore-mega-menu__callout-box">
                <span className="explore-mega-menu__callout-title" style={{ color: '#dc2626' }}>PROTOTYPE LADDER</span>
                <span className="explore-mega-menu__callout-desc">Moto3 250cc → Moto2 765cc → MotoGP 1000cc (360+ km/h)</span>
              </div>
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
                    style={{ backgroundColor: `${item.badgeColor}22`, color: item.badgeColor, borderColor: `${item.badgeColor}44` }}
                  >
                    {item.shortName}
                  </span>
                  <div className="explore-mega-menu__item-text">
                    <span className="explore-mega-menu__item-name">{item.name}</span>
                    <span className="explore-mega-menu__item-desc">{item.description}</span>
                  </div>
                  <ChevronRight size={14} className="explore-mega-menu__chevron" />
                </Link>
              ))}
            </div>
            <div className="explore-mega-menu__column-callout">
              <div className="explore-mega-menu__callout-box">
                <span className="explore-mega-menu__callout-title" style={{ color: '#3b82f6' }}>ENDURANCE MAJORS</span>
                <span className="explore-mega-menu__callout-desc">24 Hours of Le Mans & 24 Hours of Spa multi-class marathons</span>
              </div>
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
                    style={{ backgroundColor: `${item.badgeColor}22`, color: item.badgeColor, borderColor: `${item.badgeColor}44` }}
                  >
                    {item.shortName}
                  </span>
                  <div className="explore-mega-menu__item-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="explore-mega-menu__item-name">{item.name}</span>
                      {item.tag && (
                        <span className="explore-mega-menu__tag" style={{ backgroundColor: 'rgba(255, 153, 51, 0.15)', color: '#ff9933' }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <span className="explore-mega-menu__item-desc">{item.description}</span>
                  </div>
                  <ChevronRight size={14} className="explore-mega-menu__chevron" />
                </Link>
              ))}
            </div>
            <div className="explore-mega-menu__column-callout">
              <div className="explore-mega-menu__callout-box">
                <span className="explore-mega-menu__callout-title" style={{ color: '#ff9933' }}>RALLY & NATIONAL</span>
                <span className="explore-mega-menu__callout-desc">Point-to-point gravel stages & Indian street racing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quick Bar */}
        <div className="explore-mega-menu__footer">
          <div className="explore-mega-menu__footer-tagline">
            <span>THE GRID MOTORSPORT REGISTRY • 10 DISCIPLINES COVERED</span>
          </div>
          <Link
            to="/explore"
            onClick={onClose}
            className="explore-mega-menu__footer-cta"
          >
            <span>Explore All Categories, Vehicle Specs & Circuits</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

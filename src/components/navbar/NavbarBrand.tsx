import React from 'react';
import { Link } from 'react-router-dom';

export const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="navbar-brand" aria-label="The Grid - F1 Community Hub">
      {/* F1 Logo Tile */}
      <div className="navbar-brand__logo">
        <span className="navbar-brand__logo-text">F1</span>
      </div>

      {/* Brand Title Row + Subtitle */}
      <div className="navbar-brand__text">
        <span className="navbar-brand__title">THE GRID</span>
        <span className="navbar-brand__subtitle">THE F1 COMMUNITY HUB</span>
      </div>
    </Link>
  );
};

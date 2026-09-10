import React from 'react';
import { Link } from 'react-router-dom';

export const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="navbar-brand" aria-label="The Grid - Motorsport Knowledge & Community Platform">
      {/* Brand Icon Tile */}
      <div className="navbar-brand__logo">
        <span className="navbar-brand__logo-text">TG</span>
      </div>

      {/* Brand Title Row + Subtitle */}
      <div className="navbar-brand__text">
        <span className="navbar-brand__title">THE GRID</span>
        <span className="navbar-brand__subtitle">MOTORSPORT PLATFORM</span>
      </div>
    </Link>
  );
};

export default NavbarBrand;

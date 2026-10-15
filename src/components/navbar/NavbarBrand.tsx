import React from 'react';
import { Link } from 'react-router-dom';

export const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="navbar-brand" aria-label="GRDX - Motorsport Knowledge & Community Platform">
      {/* Brand Icon Tile */}
      <div className="navbar-brand__logo" style={{ minWidth: '40px', height: '32px', padding: '0 4px' }}>
        <span className="navbar-brand__logo-text" style={{ fontSize: '0.78rem', letterSpacing: '0.02em' }}>GRDX</span>
      </div>

      {/* Brand Title Row + Subtitle */}
      <div className="navbar-brand__text">
        <span className="navbar-brand__title">THE GRDX</span>
        <span className="navbar-brand__subtitle">MOTORSPORT PLATFORM</span>
      </div>
    </Link>
  );
};

export default NavbarBrand;

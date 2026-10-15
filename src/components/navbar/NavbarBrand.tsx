import React from 'react';
import { Link } from 'react-router-dom';

export const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="navbar-brand" aria-label="GRDX - Motorsport Knowledge & Community Platform">
      {/* Brand Icon Tile: Compact racing badge with signature red X */}
      <div className="navbar-brand__logo grdx-nav-badge" title="GRDX">
        <span className="navbar-brand__logo-text grdx-badge-text">
          <span className="grdx-badge-grd">GRD</span>
          <span className="grdx-badge-x">X</span>
        </span>
      </div>

      {/* Brand Title Row + Subtitle: THE GRDX | MOTORSPORT PLATFORM */}
      <div className="navbar-brand__text">
        <span className="navbar-brand__title" aria-label="THE GRDX">
          <span className="navbar-brand__title-the">THE</span>{' '}
          <span className="navbar-brand__title-grd">GRD</span>
          <span className="navbar-brand__title-x">X</span>
        </span>
        <span className="navbar-brand__subtitle">MOTORSPORT PLATFORM</span>
      </div>
    </Link>
  );
};

export default NavbarBrand;

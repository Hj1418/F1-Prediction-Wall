import React from 'react';
import { Link } from 'react-router-dom';
import { GrdxWordmark } from '../common/GrdxWordmark';

export const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="navbar-brand" aria-label="GRDX - Motorsport Knowledge & Community Platform">
      {/* Brand Icon Tile: Compact racing badge with signature flame X */}
      <div className="navbar-brand__logo grdx-nav-badge" title="GRDX">
        <GrdxWordmark variant="navbar" className="grdx-badge-text" />
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

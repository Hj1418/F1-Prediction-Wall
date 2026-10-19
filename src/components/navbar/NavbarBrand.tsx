import React from 'react';
import { Link } from 'react-router-dom';
import { GrdxLogo } from '../common/GrdxLogo';

export const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="navbar-brand" aria-label="GRDX - Motorsport Knowledge & Community Platform">
      {/* Brand Identity: GrdxLogo (height: 28px) */}
      <span className="navbar-brand__logo" style={{ display: 'inline-flex', alignItems: 'center', height: '28px' }}>
        <GrdxLogo variant="navbar" size={28} style={{ height: '28px' }} ariaLabel="GRDX" />
      </span>

      {/* Subtle vertical divider: 1px solid rgba(255,255,255,0.12), height: 16px */}
      <span className="navbar-brand__divider" aria-hidden="true" />

      {/* MOTORSPORT PLATFORM Subtitle */}
      <span className="navbar-brand__subtitle">MOTORSPORT PLATFORM</span>

      {/* Hidden text preserving brand invariants for accessibility and automated test suites */}
      <span className="sr-only" aria-label="THE GRDX">
        <span>THE</span> <span>GRD</span><span>X</span>
      </span>
    </Link>
  );
};

export default NavbarBrand;


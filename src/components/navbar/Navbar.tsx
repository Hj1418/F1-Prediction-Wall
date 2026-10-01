import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { RaceStatusStrip } from './RaceStatusStrip';
import { NavbarBrand } from './NavbarBrand';
import { NavbarLinks } from './NavbarLinks';
import { PredictionCTA } from './PredictionCTA';
import { UserProfileMenu } from './UserProfileMenu';
import { MobileNavigation } from './MobileNavigation';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoundLink, setActiveRoundLink] = useState<string>('/predictions');
  const location = useLocation();

  const handleToggleMobile = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar-header">
      {/* Level 1: Race Status Strip */}
      <RaceStatusStrip />

      {/* Level 2: Main Navigation Bar */}
      <div className="navbar-main">
        <div className="navbar-main__inner">
          <NavbarBrand />
          <NavbarLinks />
          <div className="navbar-right">
            <PredictionCTA onActiveRoundChange={setActiveRoundLink} />
            <UserProfileMenu
              mobileMenuOpen={mobileMenuOpen}
              onToggleMobileMenu={handleToggleMobile}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={handleCloseMobile}
        activeRoundLink={activeRoundLink}
      />
    </header>
  );
};

export default Navbar;

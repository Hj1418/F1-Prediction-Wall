import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiClient';
import { RaceStatusStrip } from './RaceStatusStrip';
import { NavbarBrand } from './NavbarBrand';
import { NavbarLinks } from './NavbarLinks';
import { PredictionCTA } from './PredictionCTA';
import { UserProfileMenu } from './UserProfileMenu';
import { MobileNavigation } from './MobileNavigation';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { openSearch } = useApp();
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

  // Fetch active prediction round for mobile drawer CTA
  useEffect(() => {
    let mounted = true;
    const fetchActiveRound = async () => {
      try {
        const rounds = await api.getPredictionRounds();
        if (!mounted || !rounds || rounds.length === 0) return;
        const targetRound =
          rounds.find(r => r.status === 'OPEN') ||
          rounds.find(r => r.status === 'UPCOMING') ||
          rounds[0];

        if (targetRound) {
          setActiveRoundLink(`/predict/${targetRound.roundId}`);
        } else {
          setActiveRoundLink('/predictions');
        }
      } catch (e) {
        console.warn('Navbar: Failed to load active round', e);
      }
    };
    fetchActiveRound();
    return () => {
      mounted = false;
    };
  }, []);

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
            <button
              type="button"
              className="navbar-search-btn"
              onClick={openSearch}
              aria-label="Search motorsport"
              title="Search The Grid (Cmd+K / Ctrl+K)"
            >
              <Search size={14} className="navbar-search-btn__icon" />
              <span className="navbar-search-btn__text">Search</span>
              <kbd className="navbar-search-btn__kbd">⌘K</kbd>
            </button>
            <PredictionCTA />
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

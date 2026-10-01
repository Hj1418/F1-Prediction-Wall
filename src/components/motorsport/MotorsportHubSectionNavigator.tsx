import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Flame,
  BookOpen,
  Users,
  Shield,
  Award,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface HubSectionItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export interface MotorsportHubSectionNavigatorProps {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  competitorPlural?: string;
  teamsLabel?: string;
  circuitsLabel?: string;
  calendarLabel?: string;
  accentColor?: string;
}

export const MotorsportHubSectionNavigator: React.FC<MotorsportHubSectionNavigatorProps> = ({
  activeSection,
  onSectionSelect,
  competitorPlural = 'DRIVERS',
  teamsLabel = 'TEAMS',
  circuitsLabel = 'CIRCUITS',
  calendarLabel = 'CALENDAR',
  accentColor = 'var(--f1-red, #e10600)',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sections: HubSectionItem[] = [
    { id: 'learn', label: 'LEARN', shortLabel: 'Learn', icon: <BookOpen size={14} /> },
    { id: 'season', label: 'CURRENT SEASON', shortLabel: 'Current Season', icon: <Flame size={14} /> },
    { id: 'drivers', label: competitorPlural.toUpperCase(), shortLabel: competitorPlural, icon: <Users size={14} /> },
    { id: 'teams', label: teamsLabel.toUpperCase(), shortLabel: teamsLabel, icon: <Shield size={14} /> },
    { id: 'championships', label: 'CHAMPIONSHIPS', shortLabel: 'Championships', icon: <Award size={14} /> },
    { id: 'circuits', label: circuitsLabel.toUpperCase(), shortLabel: 'Circuits', icon: <MapPin size={14} /> },
    { id: 'calendar', label: calendarLabel.toUpperCase(), shortLabel: 'Calendar', icon: <Calendar size={14} /> },
    { id: 'rules', label: 'RULES & REGULATIONS', shortLabel: 'Rules & Regs', icon: <CheckCircle2 size={14} /> },
  ];

  const isSectionActive = (secId: string) => {
    if (activeSection === secId) return true;
    if (secId === 'learn' && (activeSection === 'overview' || activeSection === 'basics')) return true;
    if (secId === 'championships' && (activeSection === 'series' || activeSection === 'ladder')) return true;
    if (secId === 'drivers' && (activeSection === 'standings' || activeSection === 'riders' || activeSection === 'crews')) return true;
    return false;
  };

  const currentSectionItem = sections.find(s => isSectionActive(s.id)) || sections[0];

  // Close mobile dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const handleSelect = (id: string) => {
    setMobileOpen(false);
    onSectionSelect(id);
  };

  return (
    <nav
      aria-label="Motorsport Hub Section Navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 25,
        backgroundColor: '#090a0d',
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        transition: 'all 0.15s ease',
      }}
    >
      <div className="container" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        {/* DESKTOP VIEW: Sleek horizontal editorial navigation bar */}
        <div
          className="hub-nav-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '0.2rem 1.1rem',
            flexWrap: 'wrap',
            minHeight: '44px',
          }}
        >
          {sections.map(sec => {
            const isActive = isSectionActive(sec.id);
            return (
              <button
                key={sec.id}
                id={`tab-${sec.id}`}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => handleSelect(sec.id)}
                aria-current={isActive ? 'true' : undefined}
                className="hub-nav-tab-btn"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 0.25rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--f1-red, #e10600)' : '2px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  fontFamily: 'var(--font-mono, monospace)',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 150ms ease, border-color 150ms ease',
                  marginBottom: '-1px',
                }}
              >
                <span style={{ display: 'inline-flex', color: isActive ? 'var(--f1-red, #e10600)' : 'inherit' }}>
                  {sec.icon}
                </span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* MOBILE VIEW: Compact Dropdown Selector with >= 44px Touch Targets */}
        <div className="hub-nav-mobile" ref={dropdownRef} style={{ position: 'relative', padding: '0.45rem 0' }}>
          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={mobileOpen}
            aria-label="Select Motorsport Hub section"
            style={{
              width: '100%',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.9rem',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: 'var(--f1-red, #e10600)' }}>{currentSectionItem.icon}</span>
              <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                SECTION:
              </span>
              <span style={{ color: '#ffffff', letterSpacing: '0.03em' }}>
                {currentSectionItem.label}
              </span>
            </div>
            {mobileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Dropdown Menu */}
          {mobileOpen && (
            <div
              role="listbox"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-surface, #11141c)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                borderRadius: '8px',
                padding: '0.35rem',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75)',
                zIndex: 35,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                maxHeight: '65vh',
                overflowY: 'auto',
              }}
            >
              {sections.map(sec => {
                const isActive = isSectionActive(sec.id);
                return (
                  <button
                    key={sec.id}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(sec.id)}
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      border: 'none',
                      borderLeft: isActive ? '3px solid var(--f1-red, #e10600)' : '3px solid transparent',
                      backgroundColor: isActive ? 'rgba(225, 6, 0, 0.12)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: isActive ? 'var(--f1-red, #e10600)' : accentColor }}>
                        {sec.icon}
                      </span>
                      <span>{sec.label}</span>
                    </div>
                    {isActive && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--f1-red, #e10600)' }}>
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

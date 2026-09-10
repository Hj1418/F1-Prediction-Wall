import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Compass,
  User,
  Users,
  MapPin,
  BookOpen,
  Calendar,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
} from 'lucide-react';
import {
  searchMotorsport,
  SearchCategory,
  SearchResultItem,
} from '../../services/motorsport/searchService';
import './UniversalSearchModal.css';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: Array<{ id: SearchCategory; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'championship', label: 'Series', icon: Compass },
  { id: 'driver', label: 'Drivers & Riders', icon: User },
  { id: 'team', label: 'Teams', icon: Users },
  { id: 'circuit', label: 'Circuits', icon: MapPin },
  { id: 'concept', label: 'Concepts', icon: BookOpen },
  { id: 'event', label: 'Events', icon: Calendar },
];

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Execute search
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchMotorsport(query, activeCategory, 20);
        if (!cancelled) {
          setResults(res);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 80);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, activeCategory, isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector('.search-result--active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectResult = useCallback((item: SearchResultItem) => {
    onClose();
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.url);
    }
  }, [navigate, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Motorsport Search">
      <div className="search-modal-card" onClick={e => e.stopPropagation()}>
        {/* Search input header */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder="Search drivers, circuits, teams, rules, or championships..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
          />
          {query ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="search-kbd-hint">ESC</kbd>
          )}
        </div>

        {/* Category filter pills */}
        <div className="search-categories-bar" role="tablist">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`search-cat-pill ${active ? 'search-cat-pill--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon size={12} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results list */}
        <div className="search-results-list" ref={resultsContainerRef} role="listbox">
          {loading && results.length === 0 ? (
            <div className="search-state-message">
              <div className="search-spinner" />
              <span>Scanning The Grid across 10 championships...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`search-result-item ${isSelected ? 'search-result--active' : ''}`}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="search-result-left">
                    <span
                      className="search-result-badge"
                      style={{
                        backgroundColor: `${item.badgeColor || 'var(--f1-red)'}22`,
                        color: item.badgeColor || 'var(--f1-red)',
                        borderColor: `${item.badgeColor || 'var(--f1-red)'}44`,
                      }}
                    >
                      {item.badge || item.category.toUpperCase()}
                    </span>
                    <div className="search-result-info">
                      <div className="search-result-title">{item.title}</div>
                      <div className="search-result-subtitle">{item.subtitle}</div>
                    </div>
                  </div>
                  <div className="search-result-action">
                    {isSelected ? (
                      <CornerDownLeft size={14} className="search-enter-icon" />
                    ) : (
                      <ArrowRight size={14} className="search-arrow-icon" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="search-empty-state">
              <Compass size={32} className="search-empty-icon" />
              <div className="search-empty-title">No matching motorsport entities found</div>
              <p className="search-empty-desc">
                Try searching for <button type="button" onClick={() => setQuery('Spa')}>Spa</button>,{' '}
                <button type="button" onClick={() => setQuery('Attack Mode')}>Attack Mode</button>,{' '}
                <button type="button" onClick={() => setQuery('Bagnaia')}>Bagnaia</button>, or{' '}
                <button type="button" onClick={() => setQuery('Buddh')}>Buddh</button>.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="search-modal-footer">
          <div className="search-footer-hint">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <div className="search-footer-brand">
            THE GRID <span>SEARCH ENGINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearchModal;

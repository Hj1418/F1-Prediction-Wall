import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface F1SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
  color?: string;
  flag?: string;
}

interface F1SelectProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: F1SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}

export const F1Select: React.FC<F1SelectProps> = ({
  id,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select option...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(opt => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, options]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`f1-custom-select-container ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        className="f1-custom-select-trigger"
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      >
        <div className="f1-select-selection">
          {selectedOption?.color && (
            <span
              className="f1-select-color-indicator"
              style={{ backgroundColor: selectedOption.color }}
              aria-hidden="true"
            />
          )}
          {selectedOption?.flag && (
            <span className="f1-select-flag" aria-hidden="true">
              {selectedOption.flag}
            </span>
          )}
          <span className="f1-select-label-text">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="f1-select-badge">{selectedOption.badge}</span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`f1-select-chevron ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          id={`${id}-listbox`}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="f1-custom-select-dropdown"
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`f1-select-option ${isSelected ? 'is-selected' : ''} ${
                  isHighlighted ? 'is-highlighted' : ''
                }`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <div className="f1-select-option-content">
                  {option.color && (
                    <span
                      className="f1-select-color-indicator"
                      style={{ backgroundColor: option.color }}
                      aria-hidden="true"
                    />
                  )}
                  {option.flag && (
                    <span className="f1-select-flag" aria-hidden="true">
                      {option.flag}
                    </span>
                  )}
                  <span className="f1-select-option-label">{option.label}</span>
                  {option.badge && (
                    <span className="f1-select-badge">{option.badge}</span>
                  )}
                </div>

                {isSelected && (
                  <Check size={14} className="f1-select-check-icon" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

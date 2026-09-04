import React, { useState, useMemo } from 'react';
import { Driver } from '../../types';
import { DriverCard } from './DriverCard';
import { X, Search } from 'lucide-react';

interface DriverSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  drivers: Driver[];
  selectedDriverId?: string;
  disabledDriverIds?: Record<string, string>; // driverId -> reason (e.g. 'Already P1')
  onSelect: (driverId: string) => void;
}

export const DriverSelectModal: React.FC<DriverSelectModalProps> = ({
  isOpen,
  onClose,
  title,
  drivers,
  selectedDriverId,
  disabledDriverIds = {},
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  const filteredDrivers = useMemo(() => {
    if (!search.trim()) return drivers;
    const q = search.toLowerCase().trim();
    return drivers.filter(
      d =>
        d.firstName.toLowerCase().includes(q) ||
        d.lastName.toLowerCase().includes(q) ||
        d.team.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        String(d.number) === q
    );
  }, [drivers, search]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="race-card"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Driver: <span style={{ color: 'var(--f1-red)' }}>{title}</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Choose a Formula 1 driver for this prediction slot.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search driver, team, number (e.g. Norris, Ferrari, 44)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Drivers Grid */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {filteredDrivers.map(driver => {
            const isSelected = driver.id === selectedDriverId;
            const disabledReason = disabledDriverIds[driver.id];
            const isDisabled = Boolean(disabledReason);

            return (
              <DriverCard
                key={driver.id}
                driver={driver}
                isSelected={isSelected}
                isDisabled={isDisabled}
                disabledReason={disabledReason}
                onClick={() => {
                  onSelect(driver.id);
                  onClose();
                }}
              />
            );
          })}
          {filteredDrivers.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
              No drivers found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  ShieldCheck,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { Championship } from '../../../types/motorsport';
import { ChampionshipDetailData } from '../../../types/motorsportDetail';
import { CircuitEntity, CircuitVerificationStatus } from '../../../types/circuit';
import { CircuitCard } from '../../circuits/CircuitCard';

export interface SportCircuitsTabProps {
  championship: Championship;
  detail: ChampionshipDetailData | null;
  circuits: CircuitEntity[];
}

export const SportCircuitsTab: React.FC<SportCircuitsTabProps> = ({
  championship,
  detail,
  circuits,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // Filter circuits by search query and verification status
  const filteredCircuits = useMemo(() => {
    return circuits.filter(c => {
      // 1. Verification status
      if (verificationFilter === 'verified' && c.verificationStatus !== 'VERIFIED') {
        return false;
      }
      if (verificationFilter === 'pending' && c.verificationStatus === 'VERIFIED') {
        return false;
      }

      // 2. Search query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.location.city.toLowerCase().includes(q) ||
        c.location.country.toLowerCase().includes(q) ||
        c.championships.some(ch => ch.eventName.toLowerCase().includes(q))
      );
    });
  }, [circuits, verificationFilter, searchQuery]);

  // Statistics
  const verifiedCount = useMemo(() => {
    return circuits.filter(c => c.verificationStatus === 'VERIFIED').length;
  }, [circuits]);

  const pendingCount = useMemo(() => {
    return circuits.filter(c => c.verificationStatus !== 'VERIFIED').length;
  }, [circuits]);

  return (
    <div
      role="tabpanel"
      id="sport-panel-circuits"
      aria-labelledby="sport-tab-circuits"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}
    >
      {/* 1. DISCOVERY & VERIFICATION AUDIT TOOLBAR */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-surface, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 0.25rem 0',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '-0.01em',
            }}
          >
            {championship.shortName.toUpperCase()} CIRCUITS & VENUES
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              {circuits.length} Host Track{circuits.length > 1 ? 's' : ''} on Calendar
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <ShieldCheck size={13} /> {verifiedCount} Verified Geometry
            </span>
            {pendingCount > 0 && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                  <AlertCircle size={13} /> {pendingCount} Pending Verification
                </span>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Verification Status Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '8px',
              padding: '0.25rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setVerificationFilter('all')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: verificationFilter === 'all' ? 800 : 600,
                color: verificationFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: verificationFilter === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              All ({circuits.length})
            </button>
            <button
              type="button"
              onClick={() => setVerificationFilter('verified')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: verificationFilter === 'verified' ? 800 : 600,
                color: verificationFilter === 'verified' ? '#22c55e' : 'var(--text-secondary)',
                backgroundColor: verificationFilter === 'verified' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Verified ({verifiedCount})
            </button>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setVerificationFilter('pending')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: verificationFilter === 'pending' ? 800 : 600,
                  color: verificationFilter === 'pending' ? '#fbbf24' : 'var(--text-secondary)',
                  backgroundColor: verificationFilter === 'pending' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Pending ({pendingCount})
              </button>
            )}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #64748b)',
              }}
            />
            <input
              type="text"
              placeholder="Search circuit or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                backgroundColor: 'var(--bg-base, #0d0f14)',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. CIRCUITS GRID */}
      {filteredCircuits.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredCircuits.map(circuit => (
            <CircuitCard key={circuit.circuitId} circuit={circuit} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: 'var(--bg-surface, #131722)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ margin: '0 0 1rem 0' }}>No circuits found matching &ldquo;{searchQuery}&rdquo;.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setVerificationFilter('all');
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset Circuit Filters
          </button>
        </div>
      )}
    </div>
  );
};

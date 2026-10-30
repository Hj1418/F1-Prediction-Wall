import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  RotateCcw,
} from 'lucide-react';
import {
  getCircuitVerificationAuditStats,
} from '../../services/circuits/globalCircuitsService';

export const CircuitVerificationAdminTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'VERIFIED' | 'MISSING_ASSETS' | 'PENDING_VERIFICATION'>('all');

  const stats = useMemo(() => getCircuitVerificationAuditStats(), []);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return stats.records.filter(r => {
      const matchesSearch =
        !q ||
        r.circuitId.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.series.some(s => s.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || r.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stats.records, searchQuery, statusFilter]);

  return (
    <div className="circuit-verification-admin-tab">
      {/* Overview Banner */}
      <div
        className="race-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 29, 0.95) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <ShieldCheck size={20} style={{ color: '#00e676' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.08em', color: '#00e676', textTransform: 'uppercase' }}>
            CIRCUIT DATABASE & SPECIFICATION VERIFICATION REGISTRY
          </span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.5rem 0', color: '#ffffff' }}>
          Global Circuit Verification Overview
        </h2>
        <p style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.9rem', margin: 0, maxWidth: '800px', lineHeight: 1.6 }}>
          Comprehensive multi-series circuit audit across Formula 1, MotoGP, FIA WEC, IMSA, IndyCar, and Indian Motorsport.
          Tracks certified length, corner counts, direction of travel, SVG track layout availability, and official regulatory citations.
        </p>

        {/* Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.75rem',
          }}
        >
          <div className="race-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
              TOTAL CIRCUITS
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', fontFamily: 'var(--font-mono, monospace)' }}>
              {stats.totalRegistered}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #cbd5e1)', marginTop: '0.2rem' }}>
              Across 8 motorsport disciplines
            </div>
          </div>

          <div className="race-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00e676', textTransform: 'uppercase' }}>
              VERIFIED WITH SVG
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#00e676', marginTop: '0.2rem', fontFamily: 'var(--font-mono, monospace)' }}>
              {stats.totalVerified}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #cbd5e1)', marginTop: '0.2rem' }}>
              Active geometry verified
            </div>
          </div>

          <div className="race-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
              SPECS OK • SVG IN AUDIT
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.2rem', fontFamily: 'var(--font-mono, monospace)' }}>
              {stats.totalMissingAssets}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #cbd5e1)', marginTop: '0.2rem' }}>
              Official specs verified
            </div>
          </div>

          <div className="race-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
              PENDING VERIFICATION
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#cbd5e1', marginTop: '0.2rem', fontFamily: 'var(--font-mono, monospace)' }}>
              {stats.totalPendingVerification}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #cbd5e1)', marginTop: '0.2rem' }}>
              Calendar rounds under review
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '420px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search circuit ID, name, country, or series..."
            className="input-field"
            style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Circuits (${stats.totalRegistered})` },
            { id: 'VERIFIED', label: `Verified (${stats.totalVerified})` },
            { id: 'MISSING_ASSETS', label: `Specs Verified (${stats.totalMissingAssets})` },
            { id: 'PENDING_VERIFICATION', label: `Pending (${stats.totalPendingVerification})` },
          ].map(opt => {
            const active = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id as any)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: active ? '1px solid #00e676' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: active ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: active ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Circuit Audit Table */}
      <div
        className="race-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-muted, #94a3b8)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '0.85rem 1rem' }}>Circuit ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Circuit Name & Location</th>
                <th style={{ padding: '0.85rem 1rem' }}>Championships</th>
                <th style={{ padding: '0.85rem 1rem' }}>Length</th>
                <th style={{ padding: '0.85rem 1rem' }}>Turns</th>
                <th style={{ padding: '0.85rem 1rem' }}>Direction</th>
                <th style={{ padding: '0.85rem 1rem' }}>SVG Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Verification State</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(rec => (
                <tr
                  key={rec.circuitId}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: 'var(--f1-red, #e10600)' }}>
                    {rec.circuitId}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: '#ffffff' }}>
                      {rec.flag ? `${rec.flag} ` : ''}{rec.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.15rem' }}>
                      {rec.country}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {rec.series.slice(0, 3).map(s => (
                        <span
                          key={s}
                          style={{
                            fontSize: '0.65rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 800,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: '#ffffff',
                            textTransform: 'uppercase',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {rec.series.length > 3 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)' }}>
                          +{rec.series.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}>
                    {rec.lengthKm > 0 ? `${rec.lengthKm} km` : 'Pending'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}>
                    {rec.turns > 0 ? `${rec.turns}` : '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono, monospace)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: rec.direction === 'Anti-Clockwise' ? '#00e676' : '#cbd5e1' }}>
                      {rec.direction === 'Anti-Clockwise' ? <RotateCcw size={11} /> : <RotateCw size={11} />}
                      <span>{rec.direction === 'Anti-Clockwise' ? 'Anti-CW' : 'CW'}</span>
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {rec.hasSvg ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#00e676', fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800 }}>
                        <CheckCircle2 size={12} /> Ready
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)' }}>
                        <Clock size={12} /> Pending Ingestion
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {rec.verificationStatus === 'VERIFIED' ? (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0, 230, 118, 0.12)',
                          border: '1px solid rgba(0, 230, 118, 0.3)',
                          color: '#00e676',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <CheckCircle2 size={11} />
                        VERIFIED
                      </span>
                    ) : rec.verificationStatus === 'MISSING_ASSETS' ? (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#f59e0b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <AlertCircle size={11} />
                        SPECS VERIFIED
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(148, 163, 184, 0.1)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          color: '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Clock size={11} />
                        PENDING AUDIT
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Link
                        to={`/circuits/${rec.circuitId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.74rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 800,
                          color: '#3b82f6',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <span>Profile</span>
                        <ExternalLink size={11} />
                      </Link>
                      {rec.officialWebsite && (
                        <a
                          href={rec.officialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.74rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--text-muted, #94a3b8)',
                            textDecoration: 'none',
                          }}
                          title="Official Circuit Website"
                        >
                          <Compass size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted, #94a3b8)' }}>
                    No circuits found matching current query or status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

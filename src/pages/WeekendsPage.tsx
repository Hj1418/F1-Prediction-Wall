import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { RaceWeekend, getCircuitName } from '../types';
import { Calendar, Zap, Flag, Gauge, ChevronRight } from 'lucide-react';

export const WeekendsPage: React.FC = () => {
  const [weekends, setWeekends] = useState<RaceWeekend[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'SPRINT'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = '2026 Race Calendar & Weekends | The Grid';
  }, []);

  useEffect(() => {
    async function loadWeekends() {
      try {
        setLoading(true);
        const data = await api.getRaceWeekends();
        setWeekends(data);
      } finally {
        setLoading(false);
      }
    }
    loadWeekends();
  }, []);

  const filtered = weekends.filter(w => {
    if (filter === 'ALL') return true;
    if (filter === 'SPRINT') return w.weekendType === 'SPRINT';
    return w.status === filter;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {weekends[0]?.season || 2026} FIA FORMULA ONE CALENDAR
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
            Race Weekends
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            Explore prediction rounds, session schedules, and weekend standings across all Grands Prix.
          </p>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {(['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'SPRINT'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn btn-sm"
              style={{
                backgroundColor: filter === f ? 'var(--f1-red)' : 'var(--bg-surface-elevated)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                borderColor: filter === f ? 'var(--f1-red)' : 'var(--border-subtle)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {f === 'SPRINT' ? (
                <>
                  <Zap size={12} /> SPRINT WEEKENDS
                </>
              ) : (
                f
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Weekends */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filtered.map(w => {
          const startDateStr = new Date(w.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const endDateStr = new Date(w.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <div
              key={w.raceWeekendId}
              className="race-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: w.status === 'ACTIVE' ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid var(--border-subtle)',
              }}
            >
              <div>
                {/* Top Row: Round # & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ROUND {w.roundNumber}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {w.weekendType === 'SPRINT' && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          backgroundColor: 'rgba(255, 128, 0, 0.15)',
                          color: '#ff9500',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Zap size={10} /> SPRINT
                      </span>
                    )}
                    <span
                      className={`status-pill ${
                        w.status === 'ACTIVE' ? 'status-open' : w.status === 'COMPLETED' ? 'status-scored' : 'status-upcoming'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {w.status === 'ACTIVE' && <span className="live-pulse" />}
                      {w.status}
                    </span>
                  </div>
                </div>

                {/* Flag + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{w.flag}</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {w.raceName}
                  </h3>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {getCircuitName(w.circuit)}, {w.country}
                </div>

                {/* Circuit Specs & Dates */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} color="var(--text-muted)" />
                    <span>{startDateStr} - {endDateStr}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Gauge size={13} color="var(--text-muted)" />
                    <span>{w.circuitLengthKm} km • {w.laps} Laps</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <Link
                  to={`/races/${w.roundNumber || w.raceWeekendId}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  RACE INFO
                </Link>
                <Link
                  to={`/races/${w.roundNumber || w.raceWeekendId}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  PREDICT
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

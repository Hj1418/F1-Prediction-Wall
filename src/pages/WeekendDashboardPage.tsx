import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { RaceWeekend, PredictionRound, getCircuitName } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { SessionTimeline } from '../components/common/SessionTimeline';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  Zap,
  Gauge,
  Trophy,
  ArrowRight,
  Lock,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

export const WeekendDashboardPage: React.FC = () => {
  const { raceWeekendId } = useParams<{ raceWeekendId: string }>();
  const { dataVersion } = useApp();
  const [weekend, setWeekend] = useState<RaceWeekend | null>(null);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!raceWeekendId) return;
      try {
        setLoading(true);
        const [w, rList] = await Promise.all([
          api.getWeekendById(raceWeekendId),
          api.getPredictionRounds(raceWeekendId),
        ]);
        setWeekend(w);
        setRounds(rList);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [raceWeekendId, dataVersion]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="live-pulse" style={{ width: '12px', height: '12px', backgroundColor: 'var(--f1-red)', marginBottom: '1rem' }} />
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          LOADING RACE WEEKEND TELEMETRY...
        </div>
      </div>
    );
  }

  if (!weekend) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Race Weekend Not Found</h2>
        <Link to="/weekends" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Calendar
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-base) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '2.5rem 0 2rem 0',
        }}
      >
        <div className="container">
          <Link
            to="/weekends"
            style={{
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginBottom: '1rem',
            }}
          >
            <ChevronLeft size={14} /> Back to All Weekends
          </Link>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{weekend.flag}</span>
                <div>
                  <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {weekend.raceName}
                  </h1>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {getCircuitName(weekend.circuit)}, {weekend.country} • Round {weekend.roundNumber || (weekend as any).round} of {weekend.season || 2026}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                <span
                  style={{
                    background: weekend.weekendType === 'SPRINT' ? 'rgba(255, 128, 0, 0.15)' : 'rgba(0, 210, 190, 0.15)',
                    color: weekend.weekendType === 'SPRINT' ? '#ff9500' : 'var(--telemetry-cyan)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Zap size={12} /> {weekend.weekendType} WEEKEND
                </span>

                <span
                  style={{
                    background: 'var(--bg-input)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Gauge size={12} /> {weekend.circuitLengthKm} km • {weekend.laps} Laps
                </span>
              </div>
            </div>

            {/* Weekend Standings Quick Link */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                to={`/leaderboard?type=weekend&id=${weekend.raceWeekendId}`}
                className="btn btn-secondary"
                style={{ gap: '0.5rem' }}
              >
                <Trophy size={16} color="var(--telemetry-yellow)" /> Weekend Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              CHRONOLOGICAL PIT WALL SCHEDULE
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
              Weekend Sessions & Prediction Timeline
            </h2>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-input)',
              color: 'var(--text-secondary)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {weekend.weekendType} FORMAT
          </span>
        </div>

        {/* Interactive Chronological Session Timeline */}
        <SessionTimeline
          sessions={weekend.sessions}
          predictionRounds={rounds}
          weekendType={weekend.weekendType}
        />
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import { RaceWeekend, PredictionRound, getCircuitName } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { CircuitMap } from '../components/common/CircuitMap';
import { PaddockFacts } from '../components/race/PaddockFacts';
import { TrackCharacter } from '../components/race/TrackCharacter';
import { InfoTooltip } from '../components/common/InfoTooltip';
import { getCircuitMetadata } from '../services/circuits/circuitRegistry';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  Zap,
  Gauge,
  Trophy,
  ArrowRight,
  Lock,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const WeekendDashboardPage: React.FC = () => {
  const { raceWeekendId, round } = useParams<{ raceWeekendId?: string; round?: string }>();
  const routeParam = round || raceWeekendId;
  const { dataVersion } = useApp();
  const [weekend, setWeekend] = useState<RaceWeekend | null>(null);
  const [rounds, setRounds] = useState<PredictionRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!routeParam) return;
      try {
        setLoading(true);
        const weekends = await api.getRaceWeekends();
        const found = weekends.find(
          w =>
            w.raceWeekendId === routeParam ||
            String(w.roundNumber) === routeParam ||
            String((w as any).round) === routeParam
        );

        if (found) {
          setWeekend(found);
          document.title = `${found.raceName} Weekend Hub | The Grid`;
          const rList = await api.getPredictionRounds(found.raceWeekendId);
          setRounds(rList);
        } else {
          try {
            const w = await api.getWeekendById(routeParam);
            setWeekend(w);
            if (w) document.title = `${w.raceName} Weekend Hub | The Grid`;
            const rList = await api.getPredictionRounds(routeParam);
            setRounds(rList);
          } catch (e) {
            setWeekend(null);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [routeParam, dataVersion]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="live-pulse" style={{ width: '12px', height: '12px', backgroundColor: 'var(--f1-red)', marginBottom: '1rem' }} />
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
          LOADING RACE WEEKEND...
        </div>
      </div>
    );
  }

  if (!weekend) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ textTransform: 'uppercase', fontWeight: 900 }}>Race Weekend Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem 0' }}>
          The requested Grand Prix weekend could not be located in the championship calendar.
        </p>
        <Link to="/races" className="btn btn-secondary">
          Back to Calendar
        </Link>
      </div>
    );
  }

  const circuitMeta = getCircuitMetadata(weekend.circuit);
  const openRound = rounds.find(r => r.status === 'OPEN') || rounds[0];

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* SECTION 1: HERO & CIRCUIT PROFILE */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-base) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '2.5rem 0 2rem 0',
        }}
      >
        <div className="container">
          <Link
            to="/races"
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
            <ChevronLeft size={14} /> Back to Race Calendar
          </Link>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left: Race Information */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{weekend.flag}</span>
                <div>
                  <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {weekend.raceName}
                  </h1>
                  <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {getCircuitName(weekend.circuit)}, {weekend.country} • Round {weekend.roundNumber || (weekend as any).round} of {weekend.season || 2026}
                  </div>
                </div>
              </div>

              {/* Essential specs chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
                <span
                  style={{
                    background: weekend.weekendType === 'SPRINT' ? 'rgba(255, 128, 0, 0.15)' : 'rgba(0, 210, 190, 0.15)',
                    color: weekend.weekendType === 'SPRINT' ? '#ff9500' : 'var(--telemetry-cyan)',
                    padding: '0.3rem 0.65rem',
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
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Gauge size={12} /> {weekend.circuitLengthKm} KM • {weekend.laps} LAPS
                </span>
              </div>
            </div>

            {/* Right: Accurate Circuit Map Visual */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem',
                background: 'radial-gradient(circle at center, rgba(225, 6, 0, 0.08) 0%, rgba(8, 10, 15, 0.85) 75%)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                height: '240px',
                maxHeight: '240px',
                overflow: 'hidden',
              }}
            >
              <CircuitMap circuit={weekend.circuit} variant="standalone" />
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* SECTION 2: PREDICTION CALLOUT (Most Important Interaction) */}
        {rounds.length > 0 && (
          <div
            className="race-card"
            style={{
              padding: '2rem',
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, rgba(22, 28, 40, 0.95), rgba(18, 23, 34, 0.95))',
              border: openRound?.status === 'OPEN' ? '1px solid rgba(0, 230, 118, 0.45)' : '1px solid var(--border-medium)',
              boxShadow: openRound?.status === 'OPEN' ? '0 10px 30px -5px rgba(0, 230, 118, 0.12)' : 'none',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  MAKE YOUR PREDICTION
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Predict Session Outcomes
                </h2>
              </div>
              <Link to="/predictions" className="btn btn-outline btn-sm">
                Prediction Hub →
              </Link>
            </div>

            {/* Grid of rounds */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {rounds.map(round => (
                <div
                  key={round.roundId}
                  style={{
                    background: 'var(--bg-input)',
                    border: round.status === 'OPEN' ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {round.roundType.replace('_', ' ')}
                      </span>
                      <StatusBadge status={round.status} size="sm" />
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      {round.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                      {round.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      {round.status === 'OPEN' ? (
                        <CountdownTimer targetDate={round.closesAt} prefix="Closes in" />
                      ) : (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Lock size={13} /> {round.status === 'LOCKED' ? 'Predictions locked for this session' : round.status}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/predict/${round.roundId}`}
                      className={`btn ${round.status === 'OPEN' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      {round.status === 'OPEN' ? (
                        <>
                          <Zap size={14} /> PREDICT NOW
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} /> View Picks & Scores
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: WEEKEND SCHEDULE TIMELINE */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--f1-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                RACE WEEKEND SCHEDULE
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                Weekend Timeline
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

          {/* Simple Clean Timeline Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {(weekend.sessions || []).map((session, idx) => {
              const sessionDate = new Date(session.startTime);
              const dayName = sessionDate.toLocaleDateString([], { weekday: 'long' });
              const timeStr = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isPast = sessionDate.getTime() < Date.now();

              let explanation = 'Official Formula 1 practice and preparation session.';
              if (session.name.toLowerCase().includes('qualifying')) {
                explanation = 'Qualifying determines the starting grid for the race. Fastest driver takes Pole Position.';
              } else if (session.name.toLowerCase().includes('sprint')) {
                explanation = 'A 100km dash with points awarded to the top 8 finishers.';
              } else if (session.name.toLowerCase().includes('race') || session.name.toLowerCase().includes('grand prix')) {
                explanation = 'The main 305km Grand Prix where full World Championship points are awarded.';
              }

              return (
                <div
                  key={session.sessionId || idx}
                  className="race-card"
                  style={{
                    padding: '1.25rem',
                    background: 'var(--bg-surface-card)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--f1-red)', textTransform: 'uppercase' }}>
                      {dayName}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: isPast ? 'var(--text-muted)' : 'var(--telemetry-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {timeStr}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {session.name}
                    <InfoTooltip text={explanation} />
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                    {explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4 & 5: PADDOCK FACTS & TRACK CHARACTER */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <PaddockFacts facts={circuitMeta.facts} circuitName={circuitMeta.name} />
          <TrackCharacter trackCharacter={circuitMeta.trackCharacter} />
        </div>
      </div>
    </div>
  );
};

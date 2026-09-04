import React from 'react';
import { Link } from 'react-router-dom';
import { Session, PredictionRound } from '../../types';
import { StatusBadge } from './StatusBadge';
import { CountdownTimer } from './CountdownTimer';
import {
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  Zap,
  Flag,
  Calendar,
  ArrowRight,
} from 'lucide-react';

interface TimelineItem {
  type: 'SESSION' | 'PREDICTION_ROUND';
  id: string;
  name: string;
  time: string;
  status: string;
  session?: Session;
  round?: PredictionRound;
}

interface SessionTimelineProps {
  sessions?: Session[];
  predictionRounds?: PredictionRound[];
  weekendType?: 'NORMAL' | 'SPRINT';
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  sessions = [],
  predictionRounds = [],
  weekendType = 'NORMAL',
}) => {
  // Combine sessions and prediction rounds into a unified chronological sequence
  const items: TimelineItem[] = [];

  sessions.forEach(sess => {
    items.push({
      type: 'SESSION',
      id: sess.id || sess.sessionId || '',
      name: sess.name,
      time: sess.startTime,
      status: sess.status,
      session: sess,
    });
  });

  predictionRounds.forEach(round => {
    items.push({
      type: 'PREDICTION_ROUND',
      id: round.roundId || round.id || '',
      name: round.title,
      time: round.closesAt, // Positioned right before the session deadline
      status: round.status,
      round: round,
    });
  });

  // Sort chronologically
  items.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const formatLocalTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return iso;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isPrediction = item.type === 'PREDICTION_ROUND';
        const round = item.round;
        const session = item.session;

        const isOpen = round?.status === 'OPEN';
        const isCompleted = item.status === 'COMPLETED' || round?.status === 'SCORED';

        return (
          <div
            key={item.id + '_' + idx}
            style={{
              display: 'flex',
              gap: '1.25rem',
              position: 'relative',
              paddingBottom: isLast ? 0 : '1.75rem',
            }}
          >
            {/* Vertical connector line */}
            {!isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: '19px',
                  top: '38px',
                  bottom: 0,
                  width: '2px',
                  backgroundColor: 'var(--border-subtle)',
                  zIndex: 0,
                }}
              />
            )}

            {/* Icon Node */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isPrediction
                  ? isOpen
                    ? 'rgba(0, 230, 118, 0.15)'
                    : 'var(--bg-surface-elevated)'
                  : 'var(--bg-input)',
                border: `2px solid ${
                  isOpen
                    ? 'var(--telemetry-green)'
                    : isPrediction
                    ? 'var(--f1-red)'
                    : 'var(--border-medium)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                flexShrink: 0,
                boxShadow: isOpen ? '0 0 15px -3px var(--telemetry-green)' : 'none',
              }}
            >
              {isPrediction ? (
                isOpen ? (
                  <Sparkles size={18} color="var(--telemetry-green)" />
                ) : (
                  <Lock size={16} color={round?.status === 'LOCKED' ? '#f87171' : 'var(--f1-red)'} />
                )
              ) : isCompleted ? (
                <CheckCircle2 size={18} color="var(--telemetry-green)" />
              ) : (
                <Clock size={16} color="var(--text-muted)" />
              )}
            </div>

            {/* Content Card */}
            <div
              style={{
                flex: 1,
                background: isPrediction
                  ? isOpen
                    ? 'linear-gradient(90deg, rgba(0, 230, 118, 0.04) 0%, var(--bg-surface-card) 100%)'
                    : 'var(--bg-surface-card)'
                  : 'var(--bg-surface)',
                border: `1px solid ${
                  isOpen ? 'rgba(0, 230, 118, 0.4)' : 'var(--border-subtle)'
                }`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isPrediction ? 'var(--f1-red)' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {isPrediction ? 'PREDICTION ROUND' : `SESSION • ${session?.type}`}
                    </span>
                    {isPrediction && round && <StatusBadge status={round.status} size="sm" />}
                    {!isPrediction && session && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          backgroundColor: isCompleted ? 'rgba(0, 230, 118, 0.15)' : 'var(--bg-input)',
                          color: isCompleted ? 'var(--telemetry-green)' : 'var(--text-secondary)',
                        }}
                      >
                        {session.status}
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {item.name}
                  </h4>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={12} />
                    <span>{formatLocalTime(item.time)}</span>
                  </div>
                </div>

                {/* Actions & Timers */}
                <div>
                  {isPrediction && round && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {isOpen && (
                        <div style={{ textAlign: 'right' }}>
                          <CountdownTimer targetDate={round.closesAt} prefix="Closes in" compact />
                        </div>
                      )}
                      <Link
                        to={`/predict/${round.roundId}`}
                        className={`btn ${isOpen ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        style={{ padding: '0.45rem 0.85rem' }}
                      >
                        {isOpen ? (
                          <>
                            <Sparkles size={13} /> Predict Now
                          </>
                        ) : (
                          <>
                            View Details <ArrowRight size={13} />
                          </>
                        )}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

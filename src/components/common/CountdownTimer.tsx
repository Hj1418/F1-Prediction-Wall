import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  prefix?: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  prefix = 'Closes in',
  onExpire,
  compact = false,
}) => {
  const calculateTimeLeft = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        <Clock size={14} />
        <span>DEADLINE PASSED</span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--telemetry-green)' }}>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {prefix && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {prefix}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {timeLeft.days > 0 && (
          <div style={{ background: 'var(--bg-input)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              {pad(timeLeft.days)}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DAYS</div>
          </div>
        )}
        <div style={{ background: 'var(--bg-input)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            {pad(timeLeft.hours)}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HRS</div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--border-medium)' }}>:</span>
        <div style={{ background: 'var(--bg-input)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            {pad(timeLeft.minutes)}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MIN</div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--border-medium)' }}>:</span>
        <div style={{ background: 'var(--bg-input)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--telemetry-green)' }}>
            {pad(timeLeft.seconds)}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SEC</div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  prefix?: string;
  onExpire?: () => void;
  compact?: boolean;
  size?: 'standard' | 'mini';
  expiredText?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  prefix = 'Closes in',
  onExpire,
  compact = false,
  size = 'standard',
  expiredText = 'DEADLINE PASSED',
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
    const initial = calculateTimeLeft();
    if (initial.isExpired) {
      onExpire?.();
      return;
    }
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: size === 'mini' ? '0.75rem' : '0.85rem' }}>
        <Clock size={size === 'mini' ? 12 : 14} />
        <span>{expiredText}</span>
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

  if (size === 'mini') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {prefix && (
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            {prefix}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <div style={{ width: '38px', height: '40px', background: 'rgba(8, 9, 12, 0.85)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {pad(timeLeft.days)}
            </div>
            <div style={{ fontSize: '9px', color: '#848B96', textTransform: 'uppercase', lineHeight: 1, marginTop: '1px' }}>DAYS</div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.3)' }}>:</span>
          <div style={{ width: '38px', height: '40px', background: 'rgba(8, 9, 12, 0.85)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {pad(timeLeft.hours)}
            </div>
            <div style={{ fontSize: '9px', color: '#848B96', textTransform: 'uppercase', lineHeight: 1, marginTop: '1px' }}>HRS</div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.3)' }}>:</span>
          <div style={{ width: '38px', height: '40px', background: 'rgba(8, 9, 12, 0.85)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {pad(timeLeft.minutes)}
            </div>
            <div style={{ fontSize: '9px', color: '#848B96', textTransform: 'uppercase', lineHeight: 1, marginTop: '1px' }}>MIN</div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.3)' }}>:</span>
          <div style={{ width: '38px', height: '40px', background: 'rgba(8, 9, 12, 0.85)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: 'var(--telemetry-green, #00e676)', lineHeight: 1.1 }}>
              {pad(timeLeft.seconds)}
            </div>
            <div style={{ fontSize: '9px', color: '#848B96', textTransform: 'uppercase', lineHeight: 1, marginTop: '1px' }}>SEC</div>
          </div>
        </div>
      </div>
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

import React from 'react';
import { RoundStatus } from '../../types';
import { Lock, CheckCircle2, Clock, Flame, Award } from 'lucide-react';

interface StatusBadgeProps {
  status: RoundStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'OPEN':
      return (
        <span className={`status-pill status-open ${isSm ? 'text-[0.65rem] py-0.5 px-1.5' : ''}`}>
          <span className="live-pulse" />
          OPEN
        </span>
      );
    case 'LOCKED':
      return (
        <span className={`status-pill status-locked ${isSm ? 'text-[0.65rem] py-0.5 px-1.5' : ''}`}>
          <Lock size={12} />
          LOCKED
        </span>
      );
    case 'SCORED':
      return (
        <span className={`status-pill status-scored ${isSm ? 'text-[0.65rem] py-0.5 px-1.5' : ''}`}>
          <Award size={12} />
          SCORED
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`status-pill status-scored ${isSm ? 'text-[0.65rem] py-0.5 px-1.5' : ''}`}>
          <CheckCircle2 size={12} />
          COMPLETED
        </span>
      );
    case 'UPCOMING':
    default:
      return (
        <span className={`status-pill status-upcoming ${isSm ? 'text-[0.65rem] py-0.5 px-1.5' : ''}`}>
          <Clock size={12} />
          UPCOMING
        </span>
      );
  }
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Lock } from 'lucide-react';
import { api } from '../../services/apiClient';

interface PredictionCTAState {
  label: string;
  link: string;
  mode: 'open' | 'upcoming' | 'locked';
}

export const PredictionCTA: React.FC = () => {
  const [ctaState, setCtaState] = useState<PredictionCTAState>({
    label: 'PREDICT NOW',
    link: '/predictions',
    mode: 'open',
  });

  useEffect(() => {
    let mounted = true;
    const fetchRoundState = async () => {
      try {
        const rounds = await api.getPredictionRounds();
        if (!mounted || !rounds || rounds.length === 0) return;

        const openRound = rounds.find(r => r.status === 'OPEN');
        if (openRound) {
          setCtaState({
            label: 'PREDICT NOW',
            link: `/predict/${openRound.roundId}`,
            mode: 'open',
          });
          return;
        }

        const upcomingRound = rounds.find(r => r.status === 'UPCOMING');
        if (upcomingRound) {
          setCtaState({
            label: 'NEXT PREDICTION',
            link: `/predict/${upcomingRound.roundId}`,
            mode: 'upcoming',
          });
          return;
        }

        // All rounds are locked or closed
        setCtaState({
          label: 'PREDICTIONS LOCKED',
          link: '/predictions',
          mode: 'locked',
        });
      } catch (err) {
        console.warn('PredictionCTA: Failed to load prediction rounds', err);
      }
    };

    fetchRoundState();
    return () => {
      mounted = false;
    };
  }, []);

  const { label, link, mode } = ctaState;

  const renderIcon = () => {
    if (mode === 'open') {
      return (
        <>
          <span className="prediction-cta__pulse" aria-hidden="true" />
          <Zap size={14} />
        </>
      );
    }
    if (mode === 'upcoming') {
      return <ArrowRight size={14} />;
    }
    return <Lock size={14} />;
  };

  return (
    <Link
      to={link}
      id="desktop-predict-cta"
      className={`prediction-cta prediction-cta--${mode}`}
      aria-label={label}
    >
      {renderIcon()}
      <span>{label}</span>
    </Link>
  );
};

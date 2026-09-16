import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Lock } from 'lucide-react';
import { api } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

interface PredictionCTAState {
  label: string;
  link: string;
  mode: 'open' | 'upcoming' | 'locked';
}

interface PredictionCTAProps {
  onActiveRoundChange?: (link: string) => void;
}

export const PredictionCTA: React.FC<PredictionCTAProps> = ({ onActiveRoundChange }) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const navigate = useNavigate();
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
          const targetLink = `/predict/${openRound.roundId}`;
          setCtaState({
            label: 'PREDICT NOW',
            link: targetLink,
            mode: 'open',
          });
          onActiveRoundChange?.(targetLink);
          return;
        }

        const upcomingRound = rounds.find(r => r.status === 'UPCOMING');
        if (upcomingRound) {
          const targetLink = '/predictions';
          setCtaState({
            label: 'PREDICTION BENCH',
            link: targetLink,
            mode: 'upcoming',
          });
          onActiveRoundChange?.(targetLink);
          return;
        }

        // All rounds are locked or closed
        setCtaState({
          label: 'PREDICTIONS LOCKED',
          link: '/predictions',
          mode: 'locked',
        });
        onActiveRoundChange?.('/predictions');
      } catch (err) {
        console.warn('PredictionCTA: Failed to load prediction rounds', err);
      }
    };

    fetchRoundState();
    return () => {
      mounted = false;
    };
  }, [onActiveRoundChange]);

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

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated && mode === 'open') {
      e.preventDefault();
      openLoginModal(link);
    }
  };

  return (
    <Link
      to={link}
      onClick={handleClick}
      id="desktop-predict-cta"
      className={`prediction-cta prediction-cta--${mode}`}
      aria-label={label}
    >
      {renderIcon()}
      <span>{label}</span>
    </Link>
  );
};

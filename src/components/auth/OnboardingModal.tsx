import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Flag, BarChart3, ChevronRight, X } from 'lucide-react';

interface OnboardingModalProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  userName,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoPredictions = () => {
    onClose();
    navigate('/predictions');
  };

  const handleGoSchedule = () => {
    onClose();
    navigate('/schedule');
  };

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="onboarding-card">
        <button
          type="button"
          onClick={onClose}
          className="auth-input-action-btn"
          style={{ top: '1.25rem', right: '1.25rem', position: 'absolute' }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="onboarding-badge">
          <Flag size={13} />
          <span>Driver License Issued</span>
        </div>

        <h2 id="onboarding-title" className="onboarding-title">
          Welcome to the Grid, <span>{userName || 'Racer'}</span>!
        </h2>
        <p className="onboarding-desc">
          Your seat in the 2026 F1 Community Prediction League is officially confirmed. Here is how you score points this weekend:
        </p>

        <div className="onboarding-steps">
          <div className="onboarding-step-item">
            <div className="onboarding-step-num">1</div>
            <div className="onboarding-step-text">
              <h4>Lock In Your Predictions</h4>
              <p>Pick podium finishers, pole position, fastest lap, and race incidents before qualifying begins.</p>
            </div>
          </div>

          <div className="onboarding-step-item">
            <div className="onboarding-step-num">2</div>
            <div className="onboarding-step-text">
              <h4>Follow Live Telemetry & Scores</h4>
              <p>Official race results synchronize automatically with your picks as the chequered flag drops.</p>
            </div>
          </div>

          <div className="onboarding-step-item">
            <div className="onboarding-step-num">3</div>
            <div className="onboarding-step-text">
              <h4>Climb the Global Leaderboard</h4>
              <p>Earn streak bonuses, claim driver badges, and battle for the World Championship crown.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="onboarding-cta-btn"
          onClick={handleGoPredictions}
        >
          <span>Make My First Prediction</span>
          <ChevronRight size={18} />
        </button>

        <div>
          <button
            type="button"
            className="onboarding-secondary-link"
            onClick={handleGoSchedule}
          >
            Explore the 2026 Race Calendar →
          </button>
        </div>
      </div>
    </div>
  );
};

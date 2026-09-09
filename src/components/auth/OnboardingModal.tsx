import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { F1_DRIVERS_2026, F1_CONSTRUCTORS_2026 } from '../../services/mockData';
import { F1Select, F1SelectOption } from './F1Select';
import { Flag, X, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  userName: propUserName,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { onboardingUser, setOnboardingUser, updateProfile } = useAuth();

  const isOpen = propIsOpen !== undefined ? propIsOpen : Boolean(onboardingUser);
  const racerName = onboardingUser?.displayName || propUserName || 'Racer';

  const [favouriteDriver, setFavouriteDriver] = useState<string>('verstappen');
  const [favouriteConstructor, setFavouriteConstructor] = useState<string>('red_bull');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial selections if user already has defaults
  useEffect(() => {
    if (onboardingUser) {
      if (onboardingUser.favouriteDriver) setFavouriteDriver(onboardingUser.favouriteDriver);
      if (onboardingUser.favouriteConstructor) setFavouriteConstructor(onboardingUser.favouriteConstructor);
    }
  }, [onboardingUser]);

  // Format 22 race seats for F1Select
  const driverOptions: F1SelectOption[] = useMemo(
    () =>
      F1_DRIVERS_2026.map(d => ({
        value: d.id,
        label: `${d.firstName} ${d.lastName} #${d.number}`,
        subLabel: d.team,
        badge: `#${d.number}`,
        color: d.teamColor,
        flag: d.countryFlag,
      })),
    []
  );

  // Format 11 constructors for F1Select
  const constructorOptions: F1SelectOption[] = useMemo(
    () =>
      F1_CONSTRUCTORS_2026.map(c => ({
        value: c.id,
        label: c.name,
        subLabel: c.powerUnit ? `Power Unit: ${c.powerUnit}` : undefined,
        color: c.color,
        flag: c.flag,
      })),
    []
  );

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (propOnClose) {
      propOnClose();
    }
    setOnboardingUser(null);
  };

  const handleSaveAndContinue = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        favouriteDriver,
        favouriteConstructor,
      });
    } catch (e) {
      console.warn('Could not save identity preferences during onboarding:', e);
    } finally {
      setIsSubmitting(false);
      handleDismiss();
    }
  };

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={handleDismiss}
    >
      <div
        className="onboarding-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(180deg, #181d24 0%, #101318 100%)',
          border: '1px solid rgba(225, 6, 0, 0.35)',
          borderRadius: '18px',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px rgba(225, 6, 0, 0.2)',
          position: 'relative',
          textAlign: 'left',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Dismiss X button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Badge */}
        <div className="onboarding-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <Sparkles size={14} />
          <span>WELCOME TO THE GRID 🏁</span>
        </div>

        {/* Title */}
        <h2
          id="onboarding-modal-title"
          style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 0.4rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          Build Your Racing Identity
        </h2>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary, #94a3b8)',
            margin: '0 0 1.5rem 0',
            lineHeight: 1.5,
          }}
        >
          Welcome, <strong style={{ color: '#ffffff' }}>{racerName}</strong>! Select your favourite driver and constructor allegiance to personalize your experience across The Grid. You can always edit this later in your profile.
        </p>

        {/* Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div>
            <label
              htmlFor="onboarding-driver"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted, #94a3b8)',
                marginBottom: '0.4rem',
              }}
            >
              Favourite Driver
            </label>
            <F1Select
              id="onboarding-driver"
              value={favouriteDriver}
              onChange={setFavouriteDriver}
              options={driverOptions}
            />
          </div>

          <div>
            <label
              htmlFor="onboarding-constructor"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted, #94a3b8)',
                marginBottom: '0.4rem',
              }}
            >
              Favourite Constructor (11 Teams)
            </label>
            <F1Select
              id="onboarding-constructor"
              value={favouriteConstructor}
              onChange={setFavouriteConstructor}
              options={constructorOptions}
            />
          </div>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          className="onboarding-cta-btn"
          disabled={isSubmitting}
          onClick={handleSaveAndContinue}
          style={{
            width: '100%',
            height: '48px',
            background: 'linear-gradient(135deg, #e10600 0%, #b80500 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 20px rgba(225, 6, 0, 0.45)',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <>
              <span>Continue to The Grid</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Secondary Skip link */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            className="onboarding-secondary-link"
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              textDecoration: 'none',
            }}
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { F1_DRIVERS_2026, F1_CONSTRUCTORS_2026 } from '../../services/mockData';
import { F1Select, F1SelectOption } from './F1Select';
import { api } from '../../services/apiClient';
import { X, ArrowRight, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const hasExistingUsername = Boolean(onboardingUser?.username && onboardingUser.username.trim() !== '');

  const [username, setUsername] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string>('');
  const [favouriteDriver, setFavouriteDriver] = useState<string>('verstappen');
  const [favouriteConstructor, setFavouriteConstructor] = useState<string>('red_bull');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync initial selections
  useEffect(() => {
    if (onboardingUser) {
      if (onboardingUser.username) {
        setUsername(onboardingUser.username);
        setUsernameStatus('available');
        setUsernameMessage('Current username');
      } else {
        setUsername('');
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
      if (onboardingUser.favouriteDriver) setFavouriteDriver(onboardingUser.favouriteDriver);
      if (onboardingUser.favouriteConstructor) setFavouriteConstructor(onboardingUser.favouriteConstructor);
      setSubmitError(null);
    }
  }, [onboardingUser]);

  // Real-time debounced username validation & uniqueness check
  useEffect(() => {
    const raw = username.trim();
    if (!raw) {
      setUsernameStatus('idle');
      setUsernameMessage('Choose a unique username (3–20 characters)');
      return;
    }

    if (raw.length < 3) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username must be at least 3 characters');
      return;
    }

    if (raw.length > 20) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username cannot exceed 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Only letters, numbers, underscores, and hyphens');
      return;
    }

    // If tag matches what the backend already confirmed for this user
    if (hasExistingUsername && raw.toLowerCase() === (onboardingUser?.username || '').toLowerCase()) {
      setUsernameStatus('available');
      setUsernameMessage(`@${raw} is reserved for you`);
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(raw, onboardingUser?.userId);
        if (res.available) {
          setUsernameStatus('available');
          setUsernameMessage('Username available');
        } else {
          setUsernameStatus('unavailable');
          setUsernameMessage(res.reason || 'Username already taken');
        }
      } catch (err) {
        setUsernameStatus('unavailable');
        setUsernameMessage('Could not verify availability');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username, onboardingUser, hasExistingUsername]);

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
    // If the user has NO username, dismissal is disabled — choosing a username is required
    if (!hasExistingUsername) return;

    if (propOnClose) {
      propOnClose();
    }
    setOnboardingUser(null);
  };

  const handleSaveAndContinue = async () => {
    const cleanUser = username.trim();
    if (!cleanUser || usernameStatus !== 'available') {
      setSubmitError(usernameMessage || 'Please choose an available username.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updateProfile({
        username: cleanUser,
        favouriteDriver,
        favouriteConstructor,
      });

      if (propOnClose) {
        propOnClose();
      }
      setOnboardingUser(null);
    } catch (e: any) {
      console.warn('Could not save username during onboarding:', e);
      setSubmitError(e?.message || 'Failed to save username. Please choose another and try again.');
      setUsernameStatus('unavailable');
      setUsernameMessage(e?.message || 'Username already taken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isContinueDisabled =
    isSubmitting ||
    !username.trim() ||
    usernameStatus === 'checking' ||
    usernameStatus === 'invalid' ||
    usernameStatus === 'unavailable';

  return (
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={hasExistingUsername ? handleDismiss : undefined}
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
        {/* Dismiss X button — only visible if user already has an established username */}
        {hasExistingUsername && (
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
        )}

        {/* Badge */}
        <div className="onboarding-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <Sparkles size={14} style={{ color: '#e10600' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: '#e10600' }}>
            WELCOME TO THE GRID
          </span>
        </div>

        {/* Title */}
        <h2
          id="onboarding-modal-title"
          style={{
            fontSize: '1.65rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 0.35rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          Choose your username
        </h2>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary, #94a3b8)',
            margin: '0 0 1.5rem 0',
            lineHeight: 1.5,
          }}
        >
          This is how you'll appear across The Grid. Your real name and email remain strictly private.
        </p>

        {submitError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Username Input Field */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="onboarding-username"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #94a3b8)',
              marginBottom: '0.45rem',
            }}
          >
            Public Identity
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-base, #0d0f17)',
              border: `1px solid ${
                usernameStatus === 'available'
                  ? 'var(--telemetry-green, #10b981)'
                  : usernameStatus === 'unavailable' || usernameStatus === 'invalid'
                  ? 'var(--f1-red, #e10600)'
                  : 'rgba(255, 255, 255, 0.12)'
              }`,
              borderRadius: '8px',
              padding: '0 0.85rem',
              transition: 'border-color 0.15s ease',
            }}
          >
            <span
              style={{
                color: 'var(--text-muted, #64748b)',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                fontSize: '1rem',
                marginRight: '0.35rem',
                userSelect: 'none',
              }}
            >
              @
            </span>
            <input
              id="onboarding-username"
              type="text"
              autoFocus
              autoComplete="off"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))}
              placeholder="username"
              maxLength={20}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '1rem',
                fontWeight: 700,
                padding: '0.75rem 0',
              }}
            />
            {usernameStatus === 'checking' && (
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
            )}
            {usernameStatus === 'available' && (
              <CheckCircle2 size={18} style={{ color: 'var(--telemetry-green, #10b981)', flexShrink: 0 }} />
            )}
            {(usernameStatus === 'unavailable' || usernameStatus === 'invalid') && (
              <AlertCircle size={18} style={{ color: 'var(--f1-red, #e10600)', flexShrink: 0 }} />
            )}
          </div>

          {/* Availability Feedback Message */}
          <div
            style={{
              marginTop: '0.45rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono, monospace)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color:
                usernameStatus === 'available'
                  ? 'var(--telemetry-green, #10b981)'
                  : usernameStatus === 'unavailable' || usernameStatus === 'invalid'
                  ? 'var(--f1-red, #e10600)'
                  : 'var(--text-muted, #64748b)',
            }}
          >
            {usernameStatus === 'available' && '✓ '}
            {usernameMessage || '3–20 characters (letters, numbers, _, -)'}
          </div>
        </div>

        {/* F1 Allegiance Selectors */}
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

        {/* Primary CTA: CONTINUE */}
        <button
          type="button"
          className="onboarding-cta-btn"
          disabled={isContinueDisabled}
          onClick={handleSaveAndContinue}
          style={{
            width: '100%',
            height: '48px',
            background: isContinueDisabled
              ? 'rgba(255, 255, 255, 0.08)'
              : 'linear-gradient(135deg, #e10600 0%, #b80500 100%)',
            color: isContinueDisabled ? 'rgba(255, 255, 255, 0.35)' : '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: isContinueDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: isContinueDisabled ? 'none' : '0 4px 20px rgba(225, 6, 0, 0.45)',
            transition: 'all 0.15s ease',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>SAVING IDENTITY...</span>
            </>
          ) : (
            <>
              <span>CONTINUE</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;

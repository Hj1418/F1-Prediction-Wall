import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { F1_DRIVERS_2026, F1_CONSTRUCTORS_2026 } from '../../services/mockData';
import { api } from '../../services/apiClient';
import { SocialAuthButton } from './SocialAuthButton';
import { F1Select, F1SelectOption } from './F1Select';
import {
  User as UserIcon,
  Flag,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface RegisterFormProps {
  onSuccess: (user: User) => void;
  onStepChange?: (step: 'signup' | 'identity') => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onStepChange }) => {
  const { loginWithGoogle, updateProfile } = useAuth();

  const [signedInUser, setSignedInUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [favouriteDriver, setFavouriteDriver] = useState(F1_DRIVERS_2026[0].id);
  const [favouriteConstructor, setFavouriteConstructor] = useState(F1_CONSTRUCTORS_2026[0].id);

  // Racer Tag validation & debounced availability state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Driver options formatted for dark F1Select
  const driverOptions: F1SelectOption[] = useMemo(
    () =>
      F1_DRIVERS_2026.map(d => ({
        value: d.id,
        label: `${d.firstName} ${d.lastName}`,
        badge: `#${d.number}`,
        color: d.teamColor,
        flag: d.countryFlag,
      })),
    []
  );

  // Constructor options formatted for dark F1Select
  const constructorOptions: F1SelectOption[] = useMemo(
    () =>
      F1_CONSTRUCTORS_2026.map(c => ({
        value: c.id,
        label: c.name,
        color: c.color,
        flag: c.flag,
      })),
    []
  );

  // Inform parent of step change for dynamic header
  useEffect(() => {
    if (onStepChange) {
      onStepChange(signedInUser ? 'identity' : 'signup');
    }
  }, [signedInUser, onStepChange]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        // First-time users trigger the global lightweight "Welcome to The Grid" modal via AuthContext
        onSuccess(user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Debounced Racer Tag validation & server-authoritative uniqueness check
  useEffect(() => {
    if (!signedInUser) return;

    const tag = username.trim().toLowerCase();

    if (!tag) {
      setUsernameStatus('invalid');
      setUsernameMessage('Racer Tag is required');
      return;
    }

    if (tag.length < 3) {
      setUsernameStatus('invalid');
      setUsernameMessage('Racer Tag must be at least 3 characters');
      return;
    }

    if (tag.length > 20) {
      setUsernameStatus('invalid');
      setUsernameMessage('Racer Tag cannot exceed 20 characters');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(tag)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Only lowercase letters, numbers, and underscores');
      return;
    }

    // If tag matches what the backend already confirmed for this user
    if (tag === (signedInUser.username || '').toLowerCase()) {
      setUsernameStatus('available');
      setUsernameMessage(`@${tag} is reserved for you`);
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(tag, signedInUser.userId);
        if (res.available) {
          setUsernameStatus('available');
          setUsernameMessage(`@${tag} is available`);
        } else {
          setUsernameStatus('unavailable');
          setUsernameMessage(res.reason || 'This Racer Tag is already taken');
        }
      } catch (err) {
        setUsernameStatus('unavailable');
        setUsernameMessage('Could not verify availability');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, signedInUser]);

  const handleUsernameChange = (val: string) => {
    // Force lowercase and strip whitespace
    const sanitized = val.toLowerCase().replace(/\s+/g, '');
    setUsername(sanitized);
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedInUser || isUpdatingProfile || isSuccess) return;

    if (usernameStatus === 'checking') return;
    if (usernameStatus === 'invalid' || usernameStatus === 'unavailable') {
      setError(usernameMessage || 'Please choose an available Racer Tag.');
      return;
    }

    setIsUpdatingProfile(true);
    setError(null);

    try {
      const cleanUser = username.trim().toLowerCase();
      const finalDisplayName = displayName.trim() || signedInUser.displayName;

      await updateProfile({
        displayName: finalDisplayName,
        username: cleanUser,
        favouriteDriver,
        favouriteConstructor,
      });

      const updatedUser: User = {
        ...signedInUser,
        displayName: finalDisplayName,
        username: cleanUser,
        favouriteDriver,
        favouriteConstructor,
      };

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(updatedUser);
      }, 400);
    } catch (err: unknown) {
      setIsUpdatingProfile(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update profile preferences.');
      }
    }
  };

  const handleSkip = () => {
    if (signedInUser && !isUpdatingProfile && !isSuccess) {
      // Skipping does NOT destroy auth or log out; user finishes setup later
      onSuccess(signedInUser);
    }
  };

  // =========================================================================
  // STEP 2: Racing Identity Setup Screen (Post-Google Authentication)
  // =========================================================================
  if (signedInUser) {
    const isSubmitDisabled =
      isUpdatingProfile ||
      isSuccess ||
      usernameStatus === 'checking' ||
      usernameStatus === 'invalid' ||
      usernameStatus === 'unavailable';

    return (
      <form className="auth-form" onSubmit={handleCompleteProfile} noValidate>
        {error && (
          <div className="auth-alert-banner auth-alert-error" role="alert">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Subtle Google Confirmation Badge */}
        <div className="auth-google-connected-pill">
          <div className="auth-google-connected-left">
            <CheckCircle2 size={16} />
            <span>✓ Google account connected</span>
          </div>
          <span className="auth-google-connected-email" title={signedInUser.email}>
            {signedInUser.email}
          </span>
        </div>

        {/* SECTION 1: YOUR PROFILE */}
        <div className="auth-section-divider">
          <span className="auth-section-title">Your Profile</span>
          <div className="auth-section-line" />
        </div>

        {/* Display Name */}
        <div className="auth-field-group">
          <label htmlFor="reg-display-name" className="auth-label">
            Display Name
          </label>
          <div className="auth-input-wrapper">
            <UserIcon size={18} className="auth-input-icon" />
            <input
              id="reg-display-name"
              type="text"
              className="auth-input"
              placeholder="e.g. Alex Thorne"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              disabled={isUpdatingProfile || isSuccess}
              autoComplete="name"
              maxLength={50}
            />
          </div>
        </div>

        {/* Racer Tag */}
        <div className="auth-field-group">
          <label htmlFor="reg-username" className="auth-label">
            Racer Tag
          </label>
          <div className="auth-input-wrapper">
            <span className="auth-input-prefix">@</span>
            <input
              id="reg-username"
              type="text"
              className="auth-input auth-input-has-prefix"
              placeholder="racer_handle"
              value={username}
              onChange={e => handleUsernameChange(e.target.value)}
              disabled={isUpdatingProfile || isSuccess}
              autoComplete="username"
              maxLength={20}
            />
            {usernameStatus === 'checking' && (
              <Loader2
                size={16}
                className="auth-input-action-btn animate-spin"
                style={{ color: '#94a3b8', pointerEvents: 'none' }}
              />
            )}
            {usernameStatus === 'available' && (
              <CheckCircle2
                size={16}
                className="auth-input-action-btn"
                style={{ color: '#10b981', pointerEvents: 'none' }}
              />
            )}
            {(usernameStatus === 'unavailable' || usernameStatus === 'invalid') && (
              <AlertCircle
                size={16}
                className="auth-input-action-btn"
                style={{ color: '#f87171', pointerEvents: 'none' }}
              />
            )}
          </div>
          {usernameMessage && (
            <div className={`auth-tag-status ${usernameStatus}`}>
              {usernameStatus === 'available' && <span>✓ {usernameMessage}</span>}
              {usernameStatus === 'checking' && <span>{usernameMessage}</span>}
              {(usernameStatus === 'unavailable' || usernameStatus === 'invalid') && (
                <span>⚠ {usernameMessage}</span>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: YOUR F1 PICKS */}
        <div className="auth-section-divider" style={{ marginTop: '0.4rem' }}>
          <span className="auth-section-title">Your F1 Picks</span>
          <div className="auth-section-line" />
        </div>

        <div className="auth-grid-2">
          <div className="auth-field-group">
            <label htmlFor="reg-fav-driver" className="auth-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flag size={13} style={{ color: '#e10600' }} />
                Favourite Driver
              </span>
            </label>
            <F1Select
              id="reg-fav-driver"
              value={favouriteDriver}
              onChange={setFavouriteDriver}
              options={driverOptions}
              disabled={isUpdatingProfile || isSuccess}
            />
          </div>

          <div className="auth-field-group">
            <label htmlFor="reg-fav-team" className="auth-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={13} style={{ color: '#e10600' }} />
                Favourite Constructor
              </span>
            </label>
            <F1Select
              id="reg-fav-team"
              value={favouriteConstructor}
              onChange={setFavouriteConstructor}
              options={constructorOptions}
              disabled={isUpdatingProfile || isSuccess}
            />
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitDisabled}
          >
            {isUpdatingProfile ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>SAVING PROFILE...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={18} />
                <span>PROFILE CONFIRMED!</span>
              </>
            ) : (
              <>
                <span>COMPLETE PROFILE</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="auth-skip-btn"
            disabled={isUpdatingProfile || isSuccess}
          >
            Skip for now
          </button>
        </div>
      </form>
    );
  }

  // =========================================================================
  // STEP 1: Primary Google Registration
  // =========================================================================
  return (
    <div className="auth-form">
      {error && (
        <div className="auth-alert-banner auth-alert-error" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Beta Welcome Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          background: 'rgba(225, 6, 0, 0.06)',
          border: '1px solid rgba(225, 6, 0, 0.2)',
          marginBottom: '1.25rem',
          color: '#e2e8f0',
          fontSize: '0.82rem',
          lineHeight: '1.4'
        }}
      >
        <ShieldCheck size={20} style={{ color: '#e10600', flexShrink: 0 }} />
        <span>
          <strong>Join the 2026 Prediction Bench:</strong> Authenticate with Google to lock in qualifying and race predictions, earn championship points, and climb the leaderboard.
        </span>
      </div>

      {/* Features List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.82rem',
          color: '#94a3b8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={15} style={{ color: '#10b981' }} />
          <span>100% Free to compete all season</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={15} style={{ color: '#10b981' }} />
          <span>Automatic email confirmations & official results</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={15} style={{ color: '#10b981' }} />
          <span>Live telemetry & dynamic session countdowns</span>
        </div>
      </div>

      {/* Primary Google Auth CTA */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SocialAuthButton
          disabled={isGoogleSubmitting}
          isLoading={isGoogleSubmitting}
          onClick={handleGoogleSignIn}
          label="Join the League with Google"
        />
      </div>

      {/* Footer Navigation */}
      <div className="auth-card-footer">
        Already part of the league?
        <Link to="/login" className="auth-link">
          Sign In
        </Link>
      </div>
    </div>
  );
};

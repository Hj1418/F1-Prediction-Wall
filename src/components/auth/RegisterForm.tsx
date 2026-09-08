import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { F1_DRIVERS_2026, F1_CONSTRUCTORS_2026 } from '../../services/mockData';
import { SocialAuthButton } from './SocialAuthButton';
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
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { loginWithGoogle, updateProfile } = useAuth();

  const [signedInUser, setSignedInUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [favouriteDriver, setFavouriteDriver] = useState(F1_DRIVERS_2026[0].id);
  const [favouriteConstructor, setFavouriteConstructor] = useState(F1_CONSTRUCTORS_2026[0].id);

  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        if (user.isNewUser) {
          // Present optional profile customization
          setSignedInUser(user);
          setDisplayName(user.displayName || '');
          setUsername(user.username || '');
        } else {
          // Returning user goes directly to destination
          onSuccess(user);
        }
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

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedInUser) return;

    setIsUpdatingProfile(true);
    setError(null);

    try {
      const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || signedInUser.username;
      await updateProfile({
        displayName: displayName.trim() || signedInUser.displayName,
        username: cleanUser,
        favouriteDriver,
        favouriteConstructor,
      });

      const updatedUser: User = {
        ...signedInUser,
        displayName: displayName.trim() || signedInUser.displayName,
        username: cleanUser,
        favouriteDriver,
        favouriteConstructor,
      };

      onSuccess(updatedUser);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update profile preferences.');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSkip = () => {
    if (signedInUser) {
      onSuccess(signedInUser);
    }
  };

  // STEP 2: Optional profile personalization after Google authentication
  if (signedInUser) {
    return (
      <form className="auth-form" onSubmit={handleCompleteProfile} noValidate>
        {error && (
          <div className="auth-alert-banner auth-alert-error" role="alert">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '1.25rem',
            color: '#10b981',
            fontSize: '0.84rem'
          }}
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <span>
            Google identity verified! Welcome, <strong>{signedInUser.email}</strong>. Customize your racer telemetry below or skip to start predicting.
          </span>
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
              disabled={isUpdatingProfile}
              autoComplete="name"
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
              onChange={e => setUsername(e.target.value)}
              disabled={isUpdatingProfile}
              autoComplete="username"
            />
          </div>
        </div>

        {/* Favourite Driver & Team */}
        <div className="auth-grid-2">
          <div className="auth-field-group">
            <label htmlFor="reg-fav-driver" className="auth-label">
              <Flag size={14} className="inline mr-1" />
              Allegiance Driver
            </label>
            <select
              id="reg-fav-driver"
              className="auth-select"
              value={favouriteDriver}
              onChange={e => setFavouriteDriver(e.target.value)}
              disabled={isUpdatingProfile}
            >
              {F1_DRIVERS_2026.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.firstName} {driver.lastName} (#{driver.number})
                </option>
              ))}
            </select>
          </div>

          <div className="auth-field-group">
            <label htmlFor="reg-fav-team" className="auth-label">
              <Shield size={14} className="inline mr-1" />
              Constructor Team
            </label>
            <select
              id="reg-fav-team"
              className="auth-select"
              value={favouriteConstructor}
              onChange={e => setFavouriteConstructor(e.target.value)}
              disabled={isUpdatingProfile}
            >
              {F1_CONSTRUCTORS_2026.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>SAVING TELEMETRY...</span>
              </>
            ) : (
              <>
                <span>COMPLETE ONBOARDING</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="btn btn-ghost"
            style={{ width: '100%', fontSize: '0.85rem', color: '#94a3b8' }}
            disabled={isUpdatingProfile}
          >
            Skip to Predictions →
          </button>
        </div>
      </form>
    );
  }

  // STEP 1: Primary Google Registration
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

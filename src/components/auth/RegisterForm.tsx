import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { F1_DRIVERS_2026, F1_CONSTRUCTORS_2026 } from '../../services/mockData';
import { SocialAuthButton } from './SocialAuthButton';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Flag,
  Shield,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface RegisterFormProps {
  onSuccess: (user: User) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [favouriteDriver, setFavouriteDriver] = useState(F1_DRIVERS_2026[0].id);
  const [favouriteConstructor, setFavouriteConstructor] = useState(F1_CONSTRUCTORS_2026[0].id);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Please enter your full racer or display name.');
      return;
    }

    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUser.length < 3) {
      setError('Racer tag must be at least 3 characters (letters, numbers, or underscores).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length > 0 && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await register({
        displayName: displayName.trim(),
        username: cleanUser,
        email: email.trim().toLowerCase(),
        password: password || undefined,
        favouriteDriver,
        favouriteConstructor,
      });
      onSuccess(newUser);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-alert-banner auth-alert-error" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Display Name */}
      <div className="auth-field-group">
        <label htmlFor="reg-display-name" className="auth-label">
          Racer Display Name
        </label>
        <div className="auth-input-wrapper">
          <UserIcon size={18} className="auth-input-icon" />
          <input
            id="reg-display-name"
            type="text"
            className="auth-input"
            placeholder="e.g. Lewis Hamilton or Alex Wong"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            autoFocus
          />
        </div>
      </div>

      {/* Username */}
      <div className="auth-field-group">
        <label htmlFor="reg-username" className="auth-label">
          Racer Tag (Unique Handle)
        </label>
        <div className="auth-input-wrapper">
          <span className="auth-input-icon text-xs font-bold font-mono">@</span>
          <input
            id="reg-username"
            type="text"
            className="auth-input"
            placeholder="e.g. speed_demon44"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="auth-field-group">
        <label htmlFor="reg-email" className="auth-label">
          Email Address
        </label>
        <div className="auth-input-wrapper">
          <Mail size={18} className="auth-input-icon" />
          <input
            id="reg-email"
            type="email"
            className="auth-input"
            placeholder="pitwall@formula1.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="auth-field-group">
        <label htmlFor="reg-password" className="auth-label">
          Password
        </label>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            className="auth-input auth-input-has-action"
            placeholder="Create a secure passkey"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="auth-input-action-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="auth-field-group">
        <label htmlFor="reg-confirm-password" className="auth-label">
          Confirm Password
        </label>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            id="reg-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            className="auth-input auth-input-has-action"
            placeholder="Repeat passkey"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="auth-input-action-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Favorite Driver & Constructor Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="auth-field-group">
          <label htmlFor="reg-fav-driver" className="auth-label">
            Fav Driver
          </label>
          <div className="auth-input-wrapper">
            <Flag size={16} className="auth-input-icon" />
            <select
              id="reg-fav-driver"
              className="auth-input auth-select"
              value={favouriteDriver}
              onChange={e => setFavouriteDriver(e.target.value)}
            >
              {F1_DRIVERS_2026.map(d => (
                <option key={d.id} value={d.id}>
                  {d.firstName} {d.lastName} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="auth-field-group">
          <label htmlFor="reg-fav-team" className="auth-label">
            Fav Team
          </label>
          <div className="auth-input-wrapper">
            <Shield size={16} className="auth-input-icon" />
            <select
              id="reg-fav-team"
              className="auth-input auth-select"
              value={favouriteConstructor}
              onChange={e => setFavouriteConstructor(e.target.value)}
            >
              {F1_CONSTRUCTORS_2026.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Submit CTA */}
      <button
        type="submit"
        className="auth-submit-btn"
        disabled={isSubmitting}
      >
        <span>{isSubmitting ? 'Issuing Superlicense...' : 'Join The League'}</span>
        <ArrowRight size={18} />
      </button>

      {/* Social Auth Separator */}
      <div className="auth-divider">
        <span>or</span>
      </div>

      {/* Social Button (Disabled / Coming soon) */}
      <SocialAuthButton />

      {/* Footer Navigation */}
      <div className="auth-card-footer">
        Already have a superlicense?
        <Link to="/login" className="auth-link">
          Sign In
        </Link>
      </div>
    </form>
  );
};

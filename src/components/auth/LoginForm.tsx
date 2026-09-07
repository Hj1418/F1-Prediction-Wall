import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SocialAuthButton } from './SocialAuthButton';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const { login, loginWithGoogle, intendedRoute, setIntendedRoute } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(identifier, password);
      const destination = intendedRoute || redirectTo;
      setIntendedRoute(null);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(destination);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sign in. Please verify your credentials.');
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

      {/* Username or Email */}
      <div className="auth-field-group">
        <label htmlFor="login-identifier" className="auth-label">
          Racer Tag or Email
        </label>
        <div className="auth-input-wrapper">
          <UserIcon size={18} className="auth-input-icon" />
          <input
            id="login-identifier"
            type="text"
            className="auth-input"
            placeholder="Enter your username or email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </div>
      </div>

      {/* Password */}
      <div className="auth-field-group">
        <div className="auth-label">
          <label htmlFor="login-password">Password</label>
          <Link to="/forgot-password" className="auth-label-link" tabIndex={-1}>
            Forgot Password?
          </Link>
        </div>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className="auth-input auth-input-has-action"
            placeholder="Enter your security passkey"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
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

      {/* Remember Me */}
      <div className="auth-options-row">
        <label className="auth-checkbox-label">
          <input
            type="checkbox"
            className="auth-checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          <span>Keep me signed in on this telemetry hub</span>
        </label>
      </div>

      {/* Primary Submit CTA */}
      <button
        type="submit"
        className="auth-submit-btn"
        disabled={isSubmitting}
      >
        <span>{isSubmitting ? 'Verifying Telemetry...' : 'Enter The Grid'}</span>
        <ArrowRight size={18} />
      </button>

      {/* Social Auth Separator */}
      <div className="auth-divider">
        <span>or</span>
      </div>

      {/* Social Button */}
      <SocialAuthButton
        disabled={false}
        onClick={async () => {
          try {
            await loginWithGoogle();
            const destination = intendedRoute || redirectTo;
            setIntendedRoute(null);
            if (onSuccess) onSuccess();
            else navigate(destination);
          } catch (e: any) {
            setError(e.message || 'Google sign in failed');
          }
        }}
      />

      {/* Footer Navigation */}
      <div className="auth-card-footer">
        New to the grid?
        <Link to="/register" className="auth-link">
          Join the League
        </Link>
      </div>
    </form>
  );
};

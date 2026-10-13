import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SocialAuthButton } from './SocialAuthButton';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { AlertCircle, User as UserIcon, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const { login, loginWithGoogle, intendedRoute, setIntendedRoute } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status State
  const [error, setError] = useState<string | null>(null);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleFinishLogin = () => {
    const destination = intendedRoute || redirectTo;
    setIntendedRoute(null);
    if (onSuccess) {
      onSuccess();
    } else {
      navigate(destination);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      handleFinishLogin();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your Racer Tag (username) or email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsEmailSubmitting(true);
    try {
      await login(cleanId, password);
      handleFinishLogin();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please verify your credentials.');
      }
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      {error && (
        <div className="auth-alert-banner auth-alert-error" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary CTA: Google Sign-In */}
      <div>
        <SocialAuthButton
          disabled={isGoogleSubmitting || isEmailSubmitting}
          isLoading={isGoogleSubmitting}
          onClick={handleGoogleSignIn}
          label="Continue with Google"
        />
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>or sign in with password</span>
      </div>

      {/* Email / Username + Password Form */}
      <form onSubmit={handleEmailPasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="auth-field-group">
          <label className="auth-label" htmlFor="login-identifier">
            Racer Tag or Email
          </label>
          <div className="auth-input-wrapper">
            <UserIcon size={18} className="auth-input-icon" />
            <input
              id="login-identifier"
              type="text"
              className="auth-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. Wickando1418 or racer@domain.com"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isEmailSubmitting || isGoogleSubmitting}
            />
          </div>
        </div>

        <div className="auth-field-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="auth-label-link"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              Forgot password?
            </button>
          </div>
          <div className="auth-input-wrapper">
            <Lock size={18} className="auth-input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input-has-action"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isEmailSubmitting || isGoogleSubmitting}
            />
            <button
              type="button"
              className="auth-input-action-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isEmailSubmitting || isGoogleSubmitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem',
            cursor: (isEmailSubmitting || isGoogleSubmitting) ? 'not-allowed' : 'pointer',
            opacity: (isEmailSubmitting || isGoogleSubmitting) ? 0.7 : 1,
          }}
        >
          {isEmailSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to The Grid</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="auth-card-footer">
        New to the grid?{' '}
        <Link to="/register" className="auth-link">
          Join the League
        </Link>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialIdentifier={identifier}
        onSuccess={() => {
          setIsForgotPasswordOpen(false);
          setError(null);
        }}
      />
    </div>
  );
};

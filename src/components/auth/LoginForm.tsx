import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SocialAuthButton } from './SocialAuthButton';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const { loginWithGoogle, intendedRoute, setIntendedRoute } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
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
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleSubmitting(false);
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

      {/* Beta Security Badge */}
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
          <strong>Beta League Authentication:</strong> Sign in with your Google account to access your predictions, session scoring, and championship standings.
        </span>
      </div>

      {/* Social Button - Primary CTA */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SocialAuthButton
          disabled={isGoogleSubmitting}
          isLoading={isGoogleSubmitting}
          onClick={handleGoogleSignIn}
          label="Continue with Google"
        />
      </div>

      {/* Footer Navigation */}
      <div className="auth-card-footer">
        New to the grid?
        <Link to="/register" className="auth-link">
          Join the League
        </Link>
      </div>
    </div>
  );
};

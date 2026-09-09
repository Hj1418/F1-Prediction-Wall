import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    document.title = 'Reset Password | The Grid';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setError(null);
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <AuthLayout
      badgeText="Account Security"
      title={
        <>
          Reset <span>Password</span>
        </>
      }
      subtitle="Enter the email associated with your racer profile to receive a password reset link."
    >
      <AuthCard>
        {isSubmitted ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Transmission Sent!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              We have dispatched recovery instructions to <strong style={{ color: '#ffffff' }}>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <Link
                to="/login"
                className="auth-submit-btn"
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                <ArrowLeft size={18} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-alert-banner auth-alert-error" role="alert">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-field-group">
              <label htmlFor="reset-email" className="auth-label">
                Registered Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="reset-email"
                  type="email"
                  className="auth-input"
                  placeholder="racer@formula1.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSending}
            >
              <span>{isSending ? 'Transmitting Token...' : 'Send Recovery Token'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="auth-card-footer">
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

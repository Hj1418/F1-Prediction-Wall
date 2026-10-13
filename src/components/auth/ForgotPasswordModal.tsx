import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { X, Mail, KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIdentifier = '',
}) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your Racer Tag (username) or email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.requestPasswordReset(cleanId);
      setSuccessMessage(res.message || 'If an account exists, a 6-digit verification code has been dispatched to your email.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanCode = resetCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword(cleanCode, newPassword, identifier);
      setSuccessMessage(res.message || 'Password has been reset successfully! You can now log in.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#14181F',
          border: '1px solid #282F3C',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(225, 6, 0, 0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #E10600 0%, #FF3B30 60%, rgba(225,6,0,0.3) 100%)' }} />

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1F2532' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#E10600', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <KeyRound size={13} /> The Grid Security
            </div>
            <h2 id="forgot-password-title" style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              {step === 'request' ? 'Reset Account Password' : 'Enter Verification Code'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#8E9BAE', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#FCA5A5', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#86EFAC', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                Enter the email address or Racer Tag associated with your Grid account. We'll send you an expiring single-use 6-digit verification code.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                  Email or Racer Tag
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', color: '#64748B', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="racer@example.com or @Wickando1418"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      backgroundColor: '#0B0D10',
                      border: '1px solid #282F3A',
                      borderRadius: '8px',
                      padding: '0 1rem 0 2.75rem',
                      color: '#F8FAFC',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  height: '46px',
                  backgroundColor: '#E10600',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                  6-Digit Verification Code
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound size={18} style={{ position: 'absolute', left: '1rem', color: '#64748B', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      backgroundColor: '#0B0D10',
                      border: '1px solid #282F3A',
                      borderRadius: '8px',
                      padding: '0 1rem 0 2.75rem',
                      color: '#E10600',
                      fontFamily: 'monospace',
                      fontSize: '1.2rem',
                      letterSpacing: '4px',
                      outline: 'none',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', display: 'block' }}>
                  ⏱️ Code expires in 15 minutes.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', color: '#64748B', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      backgroundColor: '#0B0D10',
                      border: '1px solid #282F3A',
                      borderRadius: '8px',
                      padding: '0 2.75rem 0 2.75rem',
                      color: '#F8FAFC',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', color: '#64748B', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      backgroundColor: '#0B0D10',
                      border: '1px solid #282F3A',
                      borderRadius: '8px',
                      padding: '0 1rem 0 2.75rem',
                      color: '#F8FAFC',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  style={{
                    flex: 1,
                    height: '46px',
                    backgroundColor: 'transparent',
                    border: '1px solid #282F3A',
                    color: '#94A3B8',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Resend Code
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    height: '46px',
                    backgroundColor: '#E10600',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

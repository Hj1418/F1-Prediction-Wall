import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface GooglePasswordSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemindLater: () => void;
  onSuccess?: () => void;
}

export const GooglePasswordSetupModal: React.FC<GooglePasswordSetupModalProps> = ({
  isOpen,
  onClose,
  onRemindLater,
  onSuccess,
}) => {
  const { currentUser, refreshUsers } = useAuth();

  const [isEnteringPassword, setIsEnteringPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleStartSetup = () => {
    setIsEnteringPassword(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.setupPassword(password, {
        userId: currentUser.userId,
        email: currentUser.email,
        authToken: currentUser.authToken,
      });

      setSuccessMessage(res.message || 'Account password configured successfully!');
      currentUser.hasPassword = true;
      currentUser.hasPasswordConfigured = true;
      await refreshUsers();

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to configure account password.');
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
      aria-labelledby="google-password-setup-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#14181F',
          border: '1px solid #282F3C',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(225, 6, 0, 0.15)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #E10600 0%, #FF3B30 60%, rgba(225,6,0,0.3) 100%)' }} />

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1F2532' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#E10600', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <ShieldCheck size={14} /> The Grid Security
            </div>
            <h2 id="google-password-setup-title" style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              Secure your Grid account
            </h2>
          </div>
          <button
            onClick={onRemindLater}
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

          {!isEnteringPassword ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Set an account password to enable password-based sign-in across supported clients.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  id="primary-set-password-btn"
                  onClick={handleStartSetup}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: 'var(--f1-red)',
                    color: '#fff',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    padding: '0.75rem',
                    justifyContent: 'center',
                  }}
                >
                  Set Account Password
                </button>
                <button
                  id="secondary-remind-later-btn"
                  onClick={onRemindLater}
                  className="btn btn-outline"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#94A3B8',
                    fontWeight: 700,
                    padding: '0.75rem',
                    justifyContent: 'center',
                  }}
                >
                  Remind me later
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                  New Account Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', color: '#64748B', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      backgroundColor: '#0B0D10',
                      border: '1px solid #282F3C',
                      borderRadius: '8px',
                      padding: '0 3rem 0 2.75rem',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    placeholder="Re-enter password"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      backgroundColor: '#0B0D10',
                      border: '1px solid #282F3C',
                      borderRadius: '8px',
                      padding: '0 1rem 0 2.75rem',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--f1-red)',
                    color: '#fff',
                    fontWeight: 800,
                    padding: '0.75rem',
                    justifyContent: 'center',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Confirm Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onRemindLater}
                  className="btn btn-outline"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#94A3B8',
                    padding: '0.75rem 1.25rem',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    loginWithGoogle,
    intendedRoute,
    setIntendedRoute,
  } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="race-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 30px -5px rgba(225, 6, 0, 0.3)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Racing Stripe */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'linear-gradient(90deg, var(--f1-red) 0%, #ff9100 50%, var(--f1-red) 100%)',
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="live-pulse" style={{ color: 'var(--f1-red)' }} />
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--f1-red)',
                  fontWeight: 800,
                }}
              >
                THE GRID • F1 COMMUNITY HUB
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
              {authModalMode === 'login' ? 'Sign In to The Grid' : 'Join The Grid'}
            </h3>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Security Notice */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              background: 'rgba(225, 6, 0, 0.06)',
              border: '1px solid rgba(225, 6, 0, 0.2)',
              fontSize: '0.82rem',
              color: '#e2e8f0',
              lineHeight: '1.4',
            }}
          >
            <strong>Beta League Authentication:</strong> Authenticate securely with your Google account. Your telemetry, predictions, and championship points are bound to your permanent racer profile.
          </div>

          {/* Error Notice */}
          {error && (
            <div
              style={{
                padding: '0.6rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            disabled={isGoogleSubmitting}
            onClick={async () => {
              setError(null);
              setIsGoogleSubmitting(true);
              try {
                await loginWithGoogle();
                if (intendedRoute) {
                  const dest = intendedRoute;
                  setIntendedRoute(null);
                  navigate(dest);
                }
              } catch (e: any) {
                setError(e.message || 'Google sign in failed');
              } finally {
                setIsGoogleSubmitting(false);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.85rem 1rem',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: isGoogleSubmitting ? 'not-allowed' : 'pointer',
              opacity: isGoogleSubmitting ? 0.65 : 1,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {isGoogleSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: '#1f2937' }} />
                <span>Authenticating with Google...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{authModalMode === 'login' ? 'Continue with Google' : 'Join The Grid with Google'}</span>
              </>
            )}
          </button>

          {/* Value props */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem 0',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>• 100% FREE</span>
            <span>• REAL-TIME SCORING</span>
            <span>• GLOBAL RANK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

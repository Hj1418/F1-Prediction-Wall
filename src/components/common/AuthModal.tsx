import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { F1_DRIVERS_2026, F1_CONSTRUCTORS_2026 } from '../../services/mockData';
import { X, AlertCircle, LogIn, UserPlus } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    openLoginModal,
    openRegisterModal,
    login,
    loginWithGoogle,
    register,
    intendedRoute,
    setIntendedRoute,
  } = useAuth();

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [favouriteDriver, setFavouriteDriver] = useState(F1_DRIVERS_2026[0].id);
  const [favouriteConstructor, setFavouriteConstructor] = useState(F1_CONSTRUCTORS_2026[0].id);


  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(loginId, loginPassword);
      if (intendedRoute) {
        const dest = intendedRoute;
        setIntendedRoute(null);
        navigate(dest);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        displayName,
        username,
        email,
        password,
        favouriteDriver,
        favouriteConstructor,
      });
      if (intendedRoute) {
        const dest = intendedRoute;
        setIntendedRoute(null);
        navigate(dest);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                F1 COMMUNITY PLATFORM
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
              {authModalMode === 'login' ? 'Sign In to Predict' : 'Create Community Account'}
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

        {/* Google One-Click Sign In */}
        <div style={{ padding: '1.25rem 1.5rem 0.25rem 1.5rem' }}>
          <button
            type="button"
            onClick={async () => {
              try {
                await loginWithGoogle();
                if (intendedRoute) {
                  const dest = intendedRoute;
                  setIntendedRoute(null);
                  navigate(dest);
                }
              } catch (e: any) {
                setError(e.message || 'Google sign in failed');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '0.85rem 0 0.5rem', gap: '0.65rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>OR WITH EMAIL</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>
        </div>

        {/* Tab Toggle */}
        <div style={{ padding: '0.25rem 1.5rem 0.5rem 1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-input)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => openLoginModal()}
              style={{
                padding: '0.5rem 0',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                background: authModalMode === 'login' ? 'var(--f1-red)' : 'transparent',
                color: authModalMode === 'login' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: authModalMode === 'login' ? '0 2px 8px var(--f1-red-glow)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Email Sign In
            </button>
            <button
              onClick={() => openRegisterModal()}
              style={{
                padding: '0.5rem 0',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                background: authModalMode === 'register' ? 'var(--f1-red)' : 'transparent',
                color: authModalMode === 'register' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: authModalMode === 'register' ? '0 2px 8px var(--f1-red-glow)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div style={{ padding: '0 1.5rem', marginTop: '0.5rem' }}>
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
          </div>
        )}

        {/* Modal Body / Scrollable Form */}
        <div style={{ padding: '1rem 1.5rem 1.5rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* LOGIN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Username or Email</label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="Enter your username or email"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <LogIn size={15} />
                {isSubmitting ? 'Authenticating...' : 'Enter Paddock & Pit Wall'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Full Name / Display Name *</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Daniel Ricciardo"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Unique Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="honeybadger"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="racer@f1community.org"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Favourite Driver *</label>
                  <select
                    value={favouriteDriver}
                    onChange={e => setFavouriteDriver(e.target.value)}
                    className="form-select"
                  >
                    {F1_DRIVERS_2026.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.firstName} {d.lastName} ({d.team})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Favourite Constructor *</label>
                  <select
                    value={favouriteConstructor}
                    onChange={e => setFavouriteConstructor(e.target.value)}
                    className="form-select"
                  >
                    {F1_CONSTRUCTORS_2026.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>



              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <UserPlus size={15} />
                {isSubmitting ? 'Creating License...' : 'Register Official Prediction License'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

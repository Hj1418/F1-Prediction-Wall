import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { F1_DRIVERS_2026, F1_CONSTRUCTORS_2026 } from '../../services/mockData';
import { MOTORSPORT_AVATARS } from '../../services/authService';
import { X, AlertCircle, LogIn, UserPlus, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    openLoginModal,
    openRegisterModal,
    login,
    register,
    allUsers,
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
  const [avatarUrl, setAvatarUrl] = useState(MOTORSPORT_AVATARS[0].url);
  const [bio, setBio] = useState('');

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
        avatarUrl,
        bio,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSelectUser = (uid: string) => {
    const user = allUsers.find(u => u.userId === uid);
    if (user) {
      setLoginId(user.username);
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
                FIA PIT WALL TELEMETRY ACCESS
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginTop: '0.2rem' }}>
              {authModalMode === 'login' ? 'Racer Access Portal' : 'Register Prediction License'}
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

        {/* Tab Toggle */}
        <div style={{ padding: '1rem 1.5rem 0.5rem 1.5rem' }}>
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
              onClick={openLoginModal}
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
              Sign In
            </button>
            <button
              onClick={openRegisterModal}
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
              Register License
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
                  placeholder="e.g. harsh_f1 or harsh@community.f1"
                  className="form-input"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Optional for demo accounts)</span>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input"
                />
              </div>

              {/* Quick Demo Switcher */}
              <div style={{ marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Quick Demo Racer Switch:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {allUsers.map(u => (
                    <button
                      key={u.userId}
                      type="button"
                      onClick={() => handleQuickSelectUser(u.userId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.6rem',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={u.avatarUrl} alt={u.username} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                      <span>@{u.username}</span>
                    </button>
                  ))}
                </div>
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

              {/* Avatar Presets Grid */}
              <div>
                <label className="form-label">Select Racer Helmet / Avatar</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '0.5rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {MOTORSPORT_AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      style={{
                        padding: 0,
                        border: avatarUrl === av.url ? '2px solid var(--f1-red)' : '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        aspectRatio: '1',
                        cursor: 'pointer',
                        background: 'transparent',
                        boxShadow: avatarUrl === av.url ? '0 0 10px var(--f1-red-glow)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <img src={av.url} alt={av.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Strategy Statement / Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g. Aiming for 100% podium accuracy in 2026."
                  className="form-input"
                />
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

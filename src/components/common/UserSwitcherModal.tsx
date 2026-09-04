import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiClient';
import { X, ShieldCheck, UserCheck, RotateCcw, Sparkles } from 'lucide-react';

export const UserSwitcherModal: React.FC = () => {
  const { isSwitcherOpen, setSwitcherOpen, currentUser, allUsers, switchUser } = useAuth();
  const { showToast, triggerDataRefresh } = useApp();

  if (!isSwitcherOpen) return null;

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (predictions, scores, rounds) back to default 2026 season initial state?')) {
      api.resetDemoData();
      showToast('Demo data reset to factory state', 'info');
      triggerDataRefresh();
      setSwitcherOpen(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={() => setSwitcherOpen(false)}
    >
      <div
        className="race-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="var(--f1-red)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Switch Community Member
            </h3>
          </div>
          <button
            onClick={() => setSwitcherOpen(false)}
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

        {/* User list */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Switch users instantly to test prediction submissions, leaderboard positions, profile achievements, and admin privileges:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {allUsers.map(u => {
              const isCurrent = u.userId === currentUser.userId;
              const isAdmin = u.role === 'admin';

              return (
                <div
                  key={u.userId}
                  onClick={() => {
                    switchUser(u.userId);
                    showToast(`Logged in as ${u.displayName}`, 'success');
                    setSwitcherOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-card)',
                    border: `1px solid ${isCurrent ? 'var(--f1-red)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isCurrent ? '2px solid var(--f1-red)' : '1px solid var(--border-medium)',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.displayName}</span>
                        {isAdmin && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              background: 'rgba(225, 6, 0, 0.2)',
                              color: 'var(--f1-red)',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <ShieldCheck size={11} /> ADMIN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        @{u.username} • {u.totalPoints} pts • Rank #{u.seasonRank}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--telemetry-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <UserCheck size={14} /> ACTIVE
                      </span>
                    ) : (
                      <span className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}>
                        SELECT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <button
            onClick={handleResetData}
            className="btn btn-outline btn-sm"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <RotateCcw size={13} /> Reset Demo Data
          </button>
          <button onClick={() => setSwitcherOpen(false)} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

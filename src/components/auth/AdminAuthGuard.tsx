import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { PageLoadingFallback } from '../common/PageLoadingFallback';
import { PageContainer } from '../common/PageContainer';

export interface AdminAuthGuardProps {
  children: React.ReactNode;
  featureName?: string;
}

/**
 * AdminAuthGuard
 * Restricts access strictly to authorized platform administrators.
 * Prevents unauthorized users or guests from mounting administrative report pages
 * or executing sensitive analytics queries.
 */
export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  featureName = 'Admin Dashboard & Community Report',
}) => {
  const { isAdmin, isAuthenticated, isLoadingAuth, openLoginModal } = useAuth();
  const location = useLocation();
  const hasTriggeredModalRef = useRef(false);

  const targetPath = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && !hasTriggeredModalRef.current) {
      hasTriggeredModalRef.current = true;
      openLoginModal(targetPath);
    }
  }, [isLoadingAuth, isAuthenticated, openLoginModal, targetPath]);

  if (isLoadingAuth) {
    return <PageLoadingFallback />;
  }

  // If authenticated administrator, render the protected component
  if (isAdmin) {
    return <>{children}</>;
  }

  // Otherwise, block rendering completely and display the restricted barrier
  return (
    <div className="admin-auth-guard-barrier" style={{ padding: '5rem 0 6rem' }}>
      <PageContainer maxWidth="640px">
        <div
          className="race-card"
          style={{
            background: 'var(--bg-surface-elevated, #13171F)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.85), 0 0 24px -6px rgba(239, 68, 68, 0.2)',
            position: 'relative',
          }}
        >
          {/* Top Admin Accent Stripe */}
          <div
            style={{
              height: '4px',
              width: '100%',
              background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #b91c1c 100%)',
            }}
          />

          <div style={{ padding: '2.75rem 2rem', textAlign: 'center' }}>
            {/* Shield Badge */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--f1-red, #dc2626)',
                marginBottom: '1.25rem',
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.2)',
              }}
            >
              <ShieldCheck size={30} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--f1-red, #dc2626)',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              <span>ADMINISTRATOR AUTHORIZATION REQUIRED</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.95rem)',
                fontWeight: 900,
                margin: '0.25rem 0 0.85rem 0',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Restricted Administrative Area
            </h1>

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary, #9CA3AF)',
                lineHeight: 1.55,
                maxWidth: '500px',
                margin: '0 auto 2rem auto',
              }}
            >
              Access to <strong>{featureName}</strong> is restricted to authorized platform administrators.
              Normal users cannot inspect administrative reports or competition analytics data.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                maxWidth: '380px',
                margin: '0 auto',
              }}
            >
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openLoginModal(targetPath)}
                  className="btn btn-primary"
                  style={{
                    height: '46px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 800,
                  }}
                >
                  <Lock size={15} />
                  <span>Sign In as Admin</span>
                </button>
              ) : (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#fca5a5',
                    fontSize: '0.82rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Signed in as standard racer. You lack administrator privileges.
                </div>
              )}

              <Link
                to="/explore"
                className="btn btn-secondary"
                style={{
                  height: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={15} />
                <span>Return to Motorsport Explore</span>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default AdminAuthGuard;

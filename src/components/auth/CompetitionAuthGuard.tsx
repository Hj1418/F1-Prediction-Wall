import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { PageLoadingFallback } from '../common/PageLoadingFallback';
import { PageContainer } from '../common/PageContainer';

export interface CompetitionAuthGuardProps {
  children: React.ReactNode;
  featureName?: string;
  featureDescription?: string;
}

/**
 * CompetitionAuthGuard
 * Smoothly gates protected competition features (Predictions, Strategy Room, Racing Tag).
 * - Preserves requested destination in `intendedRoute`
 * - Automatically triggers the authentication modal
 * - Displays a clear, branded sign-in prompt (avoiding redirect loops)
 * - Restores access immediately upon successful login
 */
export const CompetitionAuthGuard: React.FC<CompetitionAuthGuardProps> = ({
  children,
  featureName = 'GRDX Competition',
  featureDescription = 'Sign in or join with Google to participate in competitive challenges, log live telemetry, and build your permanent racing standing.',
}) => {
  const { isAuthenticated, isLoadingAuth, openLoginModal } = useAuth();
  const location = useLocation();
  const hasTriggeredModalRef = useRef(false);

  const targetPath = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && !hasTriggeredModalRef.current) {
      hasTriggeredModalRef.current = true;
      openLoginModal(targetPath);
    }
  }, [isLoadingAuth, isAuthenticated, openLoginModal, targetPath]);

  // While restoring session from storage or API, show smooth fallback
  if (isLoadingAuth) {
    return <PageLoadingFallback />;
  }

  // If authenticated, render protected feature
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If unauthenticated, render branded gate barrier while auth modal is active
  return (
    <div className="competition-guard-barrier" style={{ padding: '4rem 0 6rem' }}>
      <PageContainer maxWidth="680px">
        <div
          className="race-card"
          style={{
            background: 'var(--bg-surface-elevated, #13171F)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.85), 0 0 24px -6px rgba(255, 122, 0, 0.25)',
            position: 'relative',
          }}
        >
          {/* Top Racing Accent Stripe */}
          <div
            style={{
              height: '4px',
              width: '100%',
              background: 'linear-gradient(90deg, #FF7A00 0%, #FFB000 50%, #FF3D00 100%)',
            }}
          />

          <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            {/* Shield / Lock Badge */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 122, 0, 0.12)',
                border: '1px solid rgba(255, 122, 0, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF7A00',
                marginBottom: '1.25rem',
                boxShadow: '0 0 24px rgba(255, 122, 0, 0.2)',
              }}
            >
              <Lock size={28} />
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
                color: '#FF7A00',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              <Trophy size={14} />
              <span>RACER AUTHENTICATION GATED</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 900,
                margin: '0.25rem 0 0.75rem 0',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Sign In to Access {featureName}
            </h1>

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary, #9CA3AF)',
                lineHeight: 1.55,
                maxWidth: '520px',
                margin: '0 auto 2rem auto',
              }}
            >
              {featureDescription}
            </p>

            {/* Feature highlights checklist */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={16} style={{ color: '#FF7A00', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <strong>Prediction Bench:</strong> Submit Grand Prix podium & safety car predictions to earn official championship points.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <strong>Strategy Room:</strong> Run tactical race simulations and execute pit-window undercuts with verified telemetry.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy size={16} style={{ color: '#FFB000', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
                  <strong>Racing Tag:</strong> Test your regulation knowledge across 120 verified questions to earn your motorsport identity.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                maxWidth: '420px',
                margin: '0 auto',
              }}
            >
              <button
                type="button"
                onClick={() => openLoginModal(targetPath)}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  backgroundColor: '#ffffff',
                  color: '#0A0D14',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <span>Continue with Google to Enter</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/explore"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary, #9CA3AF)',
                  textDecoration: 'none',
                  padding: '0.5rem',
                }}
              >
                <span>Browse Public Content in Drivers Hub</span>
              </Link>
            </div>
          </div>

          {/* Value props footer */}
          <div
            style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted, #94A3B8)',
            }}
          >
            <span>• 100% FREE ACCESS</span>
            <span>• REAL-TIME LEAGUE POINTS</span>
            <span>• ZERO REDIRECT LOOPS</span>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default CompetitionAuthGuard;

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, currentUser, intendedRoute, setIntendedRoute } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    document.title = 'Sign In | The Grid';
    if (isAuthenticated) {
      navigate(intendedRoute || redirectParam || '/');
    }
  }, [isAuthenticated, navigate, intendedRoute, redirectParam]);

  return (
    <AuthLayout
      badgeText="THE GRID • F1 COMMUNITY HUB"
      title={
        <>
          Enter The <span>Grid</span>
        </>
      }
      subtitle="Sign in with Google or your racer credentials to access Prediction Bench, track points, and build your racing identity."
    >
      <AuthCard>
        <LoginForm
          redirectTo={redirectParam || intendedRoute || '/'}
          onSuccess={() => {
            const dest = intendedRoute || redirectParam || '/';
            setIntendedRoute(null);
            navigate(dest);
          }}
        />
      </AuthCard>
    </AuthLayout>
  );
};

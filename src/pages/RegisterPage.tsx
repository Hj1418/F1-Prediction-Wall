import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export const RegisterPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<'signup' | 'identity'>('signup');

  // Existing users who already completed onboarding must not see onboarding again
  useEffect(() => {
    if (isAuthenticated && currentUser && !currentUser.isNewUser) {
      const destination = (location.state as any)?.from?.pathname || '/predictions';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, location]);

  useEffect(() => {
    document.title = step === 'identity'
      ? 'Racing Identity Setup | F1 Prediction Wall'
      : 'Join the League | F1 Community Prediction Wall';
  }, [step]);

  const handleRegistrationSuccess = (user: User) => {
    const destination = (location.state as any)?.from?.pathname || '/predictions';
    navigate(destination, { replace: true, state: { welcomeUser: user.displayName || user.username } });
  };

  return (
    <AuthLayout
      badgeText={step === 'identity' ? 'FIA Superlicense • Step 2 of 2' : 'FIA Superlicense Registration'}
      title={
        step === 'identity' ? (
          <>
            Racing <span>Identity</span>
          </>
        ) : (
          <>
            Join The <span>League</span>
          </>
        )
      }
      subtitle={
        step === 'identity'
          ? 'Customize your paddock callsign and constructor allegiance for the 2026 season.'
          : 'Create your driver profile, pick your constructor allegiance, and compete against Formula 1 fans worldwide.'
      }
    >
      <AuthCard>
        <RegisterForm
          onSuccess={handleRegistrationSuccess}
          onStepChange={setStep}
        />
      </AuthCard>
    </AuthLayout>
  );
};

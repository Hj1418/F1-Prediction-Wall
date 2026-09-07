import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { RegisterForm } from '../components/auth/RegisterForm';
import { OnboardingModal } from '../components/auth/OnboardingModal';
import { User } from '../types';

export const RegisterPage: React.FC = () => {
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    document.title = 'Join the League | F1 Community Prediction Wall';
  }, []);

  const handleRegistrationSuccess = (user: User) => {
    setCreatedUser(user);
    setShowOnboarding(true);
  };

  return (
    <>
      <AuthLayout
        badgeText="FIA Superlicense Registration"
        title={
          <>
            Join The <span>League</span>
          </>
        }
        subtitle="Create your driver profile, pick your constructor allegiance, and compete against Formula 1 fans worldwide."
      >
        <AuthCard>
          <RegisterForm onSuccess={handleRegistrationSuccess} />
        </AuthCard>
      </AuthLayout>

      <OnboardingModal
        userName={createdUser?.displayName || ''}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
};

import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className = '' }) => {
  return <div className={`auth-card ${className}`}>{children}</div>;
};

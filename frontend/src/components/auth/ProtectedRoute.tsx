import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthLoading } from './AuthLoading';
import { LoginScreen } from './LoginScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading, isAuthenticated, error } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (error && !isAuthenticated) {
    return <LoginScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
};
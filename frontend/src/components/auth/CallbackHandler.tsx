import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthLoading } from './AuthLoading';

export const CallbackHandler: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useAuth();

  useEffect(() => {
    // If authentication is successful, redirect to main app
    if (isAuthenticated && !isLoading) {
      window.location.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Authentication Error
          </h2>
          <p className="text-slate-300 mb-6">
            {error.message || 'Something went wrong during authentication'}
          </p>
          <button
            onClick={() => window.location.replace('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <AuthLoading />;
};
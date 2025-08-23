import React from 'react';

export const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Authenticating...
        </h2>
        <p className="text-slate-400">
          Please wait while we verify your identity
        </p>
      </div>
    </div>
  );
};
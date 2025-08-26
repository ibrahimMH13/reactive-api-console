import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onDismiss }) => {
  return (
    <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-400">Command Failed</h4>
          <p className="text-sm text-red-300 mt-1">{error}</p>
          
          <div className="flex items-center space-x-2 mt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs px-3 py-1 bg-red-800/50 text-red-300 rounded hover:bg-red-800/70 transition-colors"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs px-3 py-1 bg-slate-700/50 text-slate-400 rounded hover:bg-slate-700/70 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center">
      <svg 
        className={`${sizeClasses[size]} animate-spin text-blue-400`} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const EmptyState: React.FC<{ 
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-8">
      <div className="text-slate-400 mb-4">
        {icon || (
          <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414A1 1 0 0017 19h-4a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009 16H6.414a1 1 0 01-.707-.293L3.293 13.293A1 1 0 013 12.586V10" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-300 mb-1">{title}</h3>
      <p className="text-xs text-slate-400">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-xs px-3 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
// components/panels/GitHubCard.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { 
  selectApiError, 
  selectApiLoading, 
  selectApiLastCommand,
  clearApiError,
  clearApiResults,
  retryApiCommand,
  setApiFilter,
} from '../../store/slices/apiSlice';
import { websocketService } from '../../services/websocket';

interface GitHubCardProps {
  results: unknown[];
  apiName: string;
}

export const GitHubCard: React.FC<GitHubCardProps> = ({ results, apiName }) => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => selectApiError(state, apiName));
  const isLoading = useSelector((state: RootState) => selectApiLoading(state, apiName));
  const lastCommand = useSelector((state: RootState) => selectApiLastCommand(state, apiName));
  const filter = useSelector((state: RootState) => state.api.filters[apiName] || '');

  const handleRetry = () => {
    if (lastCommand) {
      dispatch(retryApiCommand(apiName));
      websocketService.sendCommand(lastCommand);
    }
  };

  const handleClearError = () => {
    dispatch(clearApiError(apiName));
  };

  const handleClearResults = () => {
    dispatch(clearApiResults(apiName));
  };

  const handleFilterChange = (value: string) => {
    dispatch(setApiFilter({ api: apiName, filter: value }));
  };

  const formatTimestamp = (timestamp: number | string) => new Date(timestamp).toLocaleTimeString();

  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-slate-700 p-6 h-full transition-colors duration-200">
      {/* Header with error/loading indicators */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub API
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="ml-2 w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          
          {/* Error indicator */}
          {error && !isLoading && (
            <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Error occurred"></div>
          )}
        </h3>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-1 text-sm bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-slate-300 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
          />
          
          {/* Clear results button */}
          {results.length > 0 && (
            <button
              onClick={handleClearResults}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              title="Clear all results"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="space-y-3 overflow-y-auto max-h-96">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/30">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-slate-300">
                <p className="text-sm">Searching GitHub users...</p>
                {lastCommand && (
                  <p className="text-xs text-slate-400 mt-1">
                    Command: <code className="bg-slate-800/50 px-1 rounded">{lastCommand}</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-red-400 text-xl">⚠️</div>
              <div className="flex-1">
                <h4 className="text-red-300 font-medium mb-2">GitHub Search Failed</h4>
                <p className="text-red-200 text-sm mb-2">{error.message}</p>
                
                {error.command && (
                  <p className="text-red-300 text-xs mb-2">
                    Failed command: <code className="bg-red-900/30 px-1 rounded">{error.command}</code>
                  </p>
                )}
                
                <p className="text-red-400 text-xs mb-3">
                  Failed at: {formatTimestamp(error.timestamp)}
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-red-300 text-xs transition-colors"
                    disabled={!lastCommand}
                  >
                    🔄 Retry
                  </button>
                  <button
                    onClick={handleClearError}
                    className="px-3 py-1 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/30 rounded text-slate-300 text-xs transition-colors"
                  >
                    ❌ Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && results.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            <div className="text-4xl mb-4">👨‍💻</div>
            <p className="text-sm">No GitHub users yet.</p>
            <p className="text-xs mt-1">Try: "search github john"</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <>
            {results
              .filter((apiResult: any) => apiResult.data && apiResult.data.login && apiResult.data.login.trim())
              .map((apiResult: any) => {
                const user = apiResult.data;
                return (
                <div key={apiResult.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:bg-slate-700/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.avatar || user.avatar_url} 
                      alt={user.login}
                      className="w-12 h-12 rounded-full border-2 border-slate-600"
                      onError={(e) => {
                        // Fallback for broken images
                        e.currentTarget.src = `https://via.placeholder.com/48/475569/9ca3af?text=${user.login.charAt(0).toUpperCase()}`;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-purple-400">@{user.login}</h4>
                          <p className="text-sm text-slate-300">{user.name || 'No name provided'}</p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(apiResult.timestamp || user.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                        <span>👥 {(user.followers || user.followers_count || 0).toLocaleString()} followers</span>
                        <span>📚 {(user.repos || user.public_repos || 0).toLocaleString()} repos</span>
                      </div>
                      
                      <a 
                        href={user.url || user.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block transition-colors"
                      >
                        View Profile →
                      </a>
                    </div>
                  </div>
                </div>
                );
              })}
          </>
        )}
      </div>

      {/* Results counter at bottom */}
      {results.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-600/30">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>{results.length} GitHub user{results.length !== 1 ? 's' : ''}</span>
            {filter && (
              <span>Filtered by: "{filter}"</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
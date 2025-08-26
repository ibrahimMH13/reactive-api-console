// components/panels/CatFactsCard.tsx
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

interface CatFactsCardProps {
  results: unknown[];
  apiName: string;
}

export const CatFactsCard: React.FC<CatFactsCardProps> = ({ results, apiName }) => {
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
      <div className="items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cat Facts API
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="ml-2 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 rounded transition-colors"
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
          <div className="bg-gray-100 dark:bg-slate-700/30 rounded-lg p-6 border border-gray-300 dark:border-slate-600/30 transition-colors duration-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-700 dark:text-slate-300">
                <p className="text-sm">Fetching cat facts...</p>
                {lastCommand && (
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
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
                <h4 className="text-red-300 font-medium mb-2">Cat Facts Request Failed</h4>
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
          <div className="text-center text-gray-600 dark:text-slate-400 py-8">
            <div className="text-4xl mb-4">🐱</div>
            <p className="text-sm">No cat facts yet.</p>
            <p className="text-xs mt-1">Try: "get cat fact"</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <>
            {results
              .map((apiResult: any, index) => {
                // CatFacts API returns a single fact object in apiResult.data
                const fact = apiResult.data;
                return fact && fact.fact && fact.fact.trim() ? (
                  <div key={apiResult.id || index} className="bg-white dark:bg-slate-700/30 rounded-lg p-4 border border-gray-200 dark:border-slate-600/30 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="text-orange-400 text-lg">🐱</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-slate-500">
                          {new Date(apiResult.timestamp || fact.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-500">{fact.length || fact.fact.length} chars</span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{fact.fact}</p>
                  </div>
                ) : null;
              })
              .filter(Boolean)}
          </>
        )}
      </div>

      {/* Results counter at bottom */}
      {results.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600/30">
          <div className="flex justify-between items-center text-xs text-gray-600 dark:text-slate-400">
            <span>{results.length} cat fact{results.length !== 1 ? 's' : ''}</span>
            {filter && (
              <span>Filtered by: "{filter}"</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
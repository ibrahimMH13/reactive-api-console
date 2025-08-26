// components/panels/SearchHistoryCard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../../services/api';

interface SearchEntry {
  id: string;
  query: string;
  api: string;
  timestamp: number;
}

interface SearchHistoryCardProps {
  className?: string;
  globalFilter?: string;
}

const ITEMS_PER_PAGE = 10;

export const SearchHistoryCard: React.FC<SearchHistoryCardProps> = ({ className, globalFilter = '' }) => {
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load search history on component mount with delay to ensure token is set
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSearchHistory();
    }, 500); // Wait for token to be set by Dashboard
    
    return () => clearTimeout(timer);
  }, []);

  const loadSearchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getSearchHistory();
      console.log('Raw search history response:', response);
      
      // Handle response format - could be array or wrapped in object
      let historyData: SearchEntry[] = [];
      if (Array.isArray(response)) {
        historyData = response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        historyData = (response as any).data;
      }

      // Sort by timestamp (latest first)
      const sortedHistory = historyData.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(sortedHistory);
    } catch (error: any) {
      console.error('Failed to load search history:', error);
      setError(error.message || 'Failed to load search history');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter history based on search term and global filter
  const filteredHistory = useMemo(() => {
    let filtered = history;
    
    // Apply local search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.query.toLowerCase().includes(term) ||
        entry.api.toLowerCase().includes(term)
      );
    }
    
    // Apply global filter
    if (globalFilter.trim()) {
      const globalTerm = globalFilter.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.query.toLowerCase().includes(globalTerm) ||
        entry.api.toLowerCase().includes(globalTerm)
      );
    }
    
    return filtered;
  }, [history, searchTerm, globalFilter]);

  // Paginate filtered results
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    loadSearchHistory();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getApiIcon = (api: string) => {
    switch (api.toLowerCase()) {
      case 'weather':
        return '🌤️';
      case 'catfacts':
        return '🐱';
      case 'github':
        return '🔧';
      case 'chucknorris':
        return '😄';
      case 'bored':
        return '🎯';
      case 'custom':
        return '⚙️';
      default:
        return '📝';
    }
  };

  return (
    <div className={`p-4 transition-colors duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Search History
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="ml-2 w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          
          {/* Error indicator */}
          {error && !isLoading && (
            <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Error occurred"></div>
          )}
        </h3>
        
        {/* Refresh button */}
        <button
          onClick={handleRetry}
          className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 rounded transition-colors text-xs"
          title="Refresh history"
        >
          🔄
        </button>
      </div>

      {/* Search Row */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-slate-300 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
        />
      </div>

      {/* Content area */}
      <div className="space-y-2">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-100 dark:bg-slate-700/30 rounded p-3 border border-gray-200 dark:border-slate-600/30">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-600 dark:text-slate-300 text-sm">
                Loading search history...
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-red-500 text-sm">⚠️</div>
                <div className="text-red-600 dark:text-red-300 text-sm">
                  Failed to load history: {error}
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="px-2 py-1 bg-red-100 dark:bg-red-600/20 hover:bg-red-200 dark:hover:bg-red-600/30 border border-red-300 dark:border-red-500/30 rounded text-red-700 dark:text-red-300 text-xs transition-colors"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && history.length === 0 && (
          <div className="text-center text-gray-500 dark:text-slate-400 py-6">
            <div className="text-2xl mb-2">📜</div>
            <p className="text-sm">No search history yet - your API searches will appear here</p>
          </div>
        )}

        {/* No search results */}
        {!isLoading && !error && history.length > 0 && filteredHistory.length === 0 && (
          <div className="text-center text-gray-500 dark:text-slate-400 py-4">
            <div className="text-xl mb-2">🔍</div>
            <p className="text-sm">
              No results found for "{searchTerm || globalFilter}"
            </p>
            <button
              onClick={() => handleSearchChange('')}
              className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 text-xs mt-1 underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* History Results - Horizontal scrollable */}
        {!isLoading && paginatedHistory.length > 0 && (
          <>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {paginatedHistory.map((entry, index) => (
                <div key={entry.id || index} className="flex-shrink-0 bg-gray-50 dark:bg-slate-700/30 rounded p-3 border border-gray-200 dark:border-slate-600/30 hover:bg-gray-100 dark:hover:bg-slate-700/40 transition-colors min-w-[240px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getApiIcon(entry.api)}</span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase">
                        {entry.api}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-slate-500">
                      {formatTimeAgo(entry.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-200 mb-1 truncate" title={entry.query}>
                    {entry.query}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-slate-600/30">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  ← Previous
                </button>
                
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Results counter at bottom */}
      {filteredHistory.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600/30">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-slate-400">
            <span>
              {filteredHistory.length} result{filteredHistory.length !== 1 ? 's' : ''}
              {(searchTerm || globalFilter) && ` (filtered)`}
            </span>
            <span>
              Showing {paginatedHistory.length} of {filteredHistory.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
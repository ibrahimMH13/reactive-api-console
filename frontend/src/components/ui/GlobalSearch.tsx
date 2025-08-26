import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalFilter } from '../../store/slices/apiSlice';
import { debounce } from '../../utils/debounce';
import type { RootState } from '../../store';

export const GlobalSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const globalFilter = useSelector((state: RootState) => state.api.globalFilter);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      dispatch(setGlobalFilter(term));
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    dispatch(setGlobalFilter(''));
  };

  return (
    <div className="mb-6">
      <div className="bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-slate-600 p-4 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search across all API results..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
            />
            
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-slate-400">
            {globalFilter ? `Filtering: "${globalFilter}"` : 'Global Search'}
          </div>
        </div>
        
        {globalFilter && (
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Searching across weather, cat facts, GitHub, Chuck Norris, bored activities, and custom data
          </div>
        )}
      </div>
    </div>
  );
};
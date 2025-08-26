// store/slices/apiSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ApiResult } from '../../types/api.type';

interface ApiError {
  message: string;
  timestamp: number;
  command?: string;
}

interface ApiState {
  results: Record<string, ApiResult[]>; 
  activeApis: string[];
  isProcessing: boolean;
  loadingStates: Record<string, boolean>;
  errors: Record<string, ApiError | null>; 
  filters: Record<string, string>; 
  globalFilter: string;
  lastCommands: Record<string, string>; 
}

// Get initial active APIs from localStorage or use defaults
const getInitialActiveApis = (): string[] => {
  if (typeof window !== 'undefined') {
    const savedApis = localStorage.getItem('activeApis');
    if (savedApis) {
      try {
        const parsed = JSON.parse(savedApis);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to parse activeApis from localStorage:', error);
      }
    }
  }
  
  // Default active APIs
  return ['weather', 'catfacts', 'github', 'chucknorris', 'bored', 'custom'];
};

const initialState: ApiState = {
  results: {},
  activeApis: getInitialActiveApis(),
  isProcessing: false,
  loadingStates: {},
  errors: {},
  filters: {},
  globalFilter: '',
  lastCommands: {},
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    // Set loading state for specific API
    setApiLoading: (state, action: PayloadAction<{ api: string; isLoading: boolean; command?: string }>) => {
      const { api, isLoading, command } = action.payload;
      state.loadingStates[api] = isLoading;
      
      if (command) {
        state.lastCommands[api] = command;
      }
      
      // Clear error when starting new request
      if (isLoading) {
        state.errors[api] = null;
      }
    },

    // Set error state for specific API
    setApiError: (state, action: PayloadAction<{ api: string; error: string; command?: string }>) => {
      const { api, error, command } = action.payload;
      state.errors[api] = {
        message: error,
        timestamp: Date.now(),
        command: command || state.lastCommands[api],
      };
      state.loadingStates[api] = false;
    },

    // Clear error for specific API
    clearApiError: (state, action: PayloadAction<string>) => {
      const api = action.payload;
      state.errors[api] = null;
    },

    // Add successful API result
    addApiResult: (state, action: PayloadAction<{ api: string; result: ApiResult; command?: string }>) => {
      const { api, result, command } = action.payload;
      
      if (!state.results[api]) {
        state.results[api] = [];
      }
      
      state.results[api].unshift(result);
      
      // Keep only last 50 results per API
      if (state.results[api].length > 50) {
        state.results[api] = state.results[api].slice(0, 50);
      }
      
      // Clear loading and error states
      state.loadingStates[api] = false;
      state.errors[api] = null;
      
      if (command) {
        state.lastCommands[api] = command;
      }
    },
    
    toggleApi: (state, action: PayloadAction<string>) => {
      const api = action.payload;
      if (state.activeApis.includes(api)) {
        state.activeApis = state.activeApis.filter(a => a !== api);
        // Clear states when disabling API
        state.loadingStates[api] = false;
        state.errors[api] = null;
      } else {
        state.activeApis.push(api);
      }
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeApis', JSON.stringify(state.activeApis));
      }
    },

    // Set active APIs (for backend sync)
    setActiveApis: (state, action: PayloadAction<string[]>) => {
      state.activeApis = action.payload;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeApis', JSON.stringify(state.activeApis));
      }
    },

    // Set API results (for backend sync)
    setApiResults: (state, action: PayloadAction<{ api: string; results: ApiResult[] }>) => {
      const { api, results } = action.payload;
      state.results[api] = results;
    },
        
    setApiFilter: (state, action: PayloadAction<{ api: string; filter: string }>) => {
      state.filters[action.payload.api] = action.payload.filter;
    },
    
    setGlobalFilter: (state, action: PayloadAction<string>) => {
      state.globalFilter = action.payload;
    },
    
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    
    clearApiResults: (state, action: PayloadAction<string>) => {
      const api = action.payload;
      delete state.results[api];
      state.errors[api] = null;
      state.loadingStates[api] = false;
    },
    
    clearAllResults: (state) => {
      state.results = {};
      state.errors = {};
      state.loadingStates = {};
      state.lastCommands = {};
    },

    // Retry last command for an API
    retryApiCommand: (state, action: PayloadAction<string>) => {
      const api = action.payload;
      state.errors[api] = null;
      state.loadingStates[api] = true;
      // The actual retry logic would be handled in the component/service
    },
  },
});

export const { 
  addApiResult, 
  toggleApi,
  setActiveApis,
  setApiResults, 
  setApiFilter, 
  setGlobalFilter, 
  setProcessing,
  setApiLoading,
  setApiError,
  clearApiError,
  clearApiResults,
  clearAllResults,
  retryApiCommand,
} = apiSlice.actions;

// Selectors
export const selectApiResults = (state: { api: ApiState }, apiName: string) => 
  state.api?.results?.[apiName] || [];

export const selectApiError = (state: { api: ApiState }, apiName: string) => 
  state.api?.errors?.[apiName];

export const selectApiLoading = (state: { api: ApiState }, apiName: string) => 
  state.api?.loadingStates?.[apiName] || false;

export const selectApiLastCommand = (state: { api: ApiState }, apiName: string) => 
  state.api?.lastCommands?.[apiName];

export const selectAllApiErrors = (state: { api: ApiState }) => 
  state.api?.errors || {};

export const selectHasAnyErrors = (state: { api: ApiState }) => 
  Object.values(state.api?.errors || {}).some(error => error !== null);

export const selectActiveApisWithErrors = (state: { api: ApiState }) => 
  (state.api?.activeApis || []).filter(api => state.api?.errors?.[api]);

export default apiSlice.reducer;
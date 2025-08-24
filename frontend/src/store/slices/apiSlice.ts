import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ApiResult } from '../../types/api.type';

interface ApiState {
  results: Record<string, ApiResult[]>; // { weather: [...], github: [...] }
  activeApis: string[];
  isProcessing: boolean;
  filters: Record<string, string>; // { weather: 'search term', github: 'user' }
  globalFilter: string;
}

const initialState: ApiState = {
  results: {},
  activeApis: ['weather', 'catfacts', 'github', 'chucknorris', 'bored', 'custom'],
  isProcessing: false,
  filters: {},
  globalFilter: '',
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    addApiResult: (state, action: PayloadAction<{ api: string; result: ApiResult }>) => {
      const { api, result } = action.payload;
      if (!state.results[api]) {
        state.results[api] = [];
      }
      state.results[api].unshift(result);
      
      // Keep only last 50 results per API
      if (state.results[api].length > 50) {
        state.results[api] = state.results[api].slice(0, 50);
      }
    },
    
    toggleApi: (state, action: PayloadAction<string>) => {
      const api = action.payload;
      if (state.activeApis.includes(api)) {
        state.activeApis = state.activeApis.filter(a => a !== api);
      } else {
        state.activeApis.push(api);
      }
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
      delete state.results[action.payload];
    },
    
    clearAllResults: (state) => {
      state.results = {};
    }
  },
});

export const { 
  addApiResult, 
  toggleApi, 
  setApiFilter, 
  setGlobalFilter, 
  setProcessing,
  clearApiResults,
  clearAllResults 
} = apiSlice.actions;

export default apiSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isTyping: boolean;
  notifications: string[];
  errors: Record<string, string>;
  loadingStates: Record<string, boolean>; 
}

const initialState: UiState = {
  connectionStatus: 'disconnected',
  isTyping: false,
  notifications: [],
  errors: {},
  loadingStates: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<UiState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    
    addNotification: (state, action: PayloadAction<string>) => {
      state.notifications.push(action.payload);
      // Note: Auto-removal should be handled in component via useEffect + dispatch(removeNotification)
      // Cannot use setTimeout in reducer due to Immer proxy limitations
    },
    
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Error handling
    setApiError: (state, action: PayloadAction<{ api: string; error: string }>) => {
      state.errors[action.payload.api] = action.payload.error;
    },

    clearApiError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },

    clearAllErrors: (state) => {
      state.errors = {};
    },

    // Loading states
    setApiLoading: (state, action: PayloadAction<{ api: string; loading: boolean }>) => {
      state.loadingStates[action.payload.api] = action.payload.loading;
    },

    clearApiLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    }
  },
});


export const { 
  setConnectionStatus, 
  setTyping, 
  addNotification, 
  removeNotification,
  clearNotifications,
  setApiError,
  clearApiError,
  clearAllErrors,
  setApiLoading,
  clearApiLoading
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isTyping: boolean;
  notifications: string[];
}

const initialState: UiState = {
  connectionStatus: 'disconnected',
  isTyping: false,
  notifications: [],
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
    },
    
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    }
  },
});

export const { 
  setConnectionStatus, 
  setTyping, 
  addNotification, 
  removeNotification,
  clearNotifications 
} = uiSlice.actions;

export default uiSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '../../types/chat.type';

interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
  currentCommand: string;
}

const initialState: ChatState = {
  messages: [],
  isProcessing: false,
  currentCommand: '',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action: PayloadAction<{ id: string; status: ChatMessage['status']; error?: string }>) => {
      const message = state.messages.find(m => m.id === action.payload.id);
      if (message) {
        message.status = action.payload.status;
        if (action.payload.error) {
          message.error = action.payload.error;
        }
      }
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setCurrentCommand: (state, action: PayloadAction<string>) => {
      state.currentCommand = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  },
});

export const { 
  addMessage, 
  updateMessageStatus, 
  setProcessing, 
  setCurrentCommand, 
  clearMessages 
} = chatSlice.actions;

export default chatSlice.reducer;
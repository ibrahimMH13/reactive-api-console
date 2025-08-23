import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
//import apiReducer from './slices/apiSlice';
//import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
 //   api: apiReducer,
 //   ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";

type ThemeType = 'light' | 'dark';

interface ThemeState {
  theme: ThemeType;
}

// Check for saved theme in localStorage or system preference
const getInitialTheme = (): ThemeType => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  
  return 'dark'; // Default to dark
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('theme', state.theme);
        } catch (error) {
          console.warn('Failed to save theme to localStorage:', error);
        }
      }
    },
    
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.theme = action.payload;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('theme', state.theme);
        } catch (error) {
          console.warn('Failed to save theme to localStorage:', error);
        }
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
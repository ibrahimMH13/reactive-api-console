import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/themeSlice';
import type { RootState } from '../store';

export const useTheme = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Apply theme to document on mount and changes
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Initialize theme on first load
  useEffect(() => {
    // This ensures the initial theme is applied correctly
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  return {
    theme,
    setTheme: (newTheme: 'light' | 'dark') => dispatch(setTheme(newTheme)),
  };
};
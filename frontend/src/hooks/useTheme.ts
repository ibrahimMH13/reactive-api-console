import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/themeSlice';
import type { RootState } from '../store';

export const useTheme = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Apply theme to document on theme changes
    console.log('Applying theme:', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    console.log('DOM classes after applying theme:', Array.from(document.documentElement.classList));
  }, [theme]);

  return {
    theme,
    setTheme: (newTheme: 'light' | 'dark') => dispatch(setTheme(newTheme)),
  };
};
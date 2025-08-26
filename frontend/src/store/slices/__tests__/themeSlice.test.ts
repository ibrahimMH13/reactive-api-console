import { configureStore } from '@reduxjs/toolkit';
import themeSlice, { toggleTheme, setTheme } from '../themeSlice';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('themeSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    
    store = configureStore({
      reducer: {
        theme: themeSlice,
      },
    });
  });

  describe('initial state', () => {
    it('should use saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      const newStore = configureStore({
        reducer: {
          theme: themeSlice,
        },
      });
      
      const state = newStore.getState().theme;
      expect(state.theme).toBe('light');
    });

    it('should use system preference when no saved theme', () => {
      localStorageMock.getItem.mockReturnValue(null);
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      const newStore = configureStore({
        reducer: {
          theme: themeSlice,
        },
      });
      
      const state = newStore.getState().theme;
      expect(state.theme).toBe('dark');
    });

    it('should default to dark when no localStorage and no matchMedia', () => {
      localStorageMock.getItem.mockReturnValue(null);
      delete (window as any).matchMedia;
      
      const newStore = configureStore({
        reducer: {
          theme: themeSlice,
        },
      });
      
      const state = newStore.getState().theme;
      expect(state.theme).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      // Set initial state to light
      store.dispatch(setTheme('light'));
      
      store.dispatch(toggleTheme());
      
      const state = store.getState().theme;
      expect(state.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should toggle from dark to light', () => {
      // Set initial state to dark
      store.dispatch(setTheme('dark'));
      
      store.dispatch(toggleTheme());
      
      const state = store.getState().theme;
      expect(state.theme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('setTheme', () => {
    it('should set theme to light and save to localStorage', () => {
      store.dispatch(setTheme('light'));
      
      const state = store.getState().theme;
      expect(state.theme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should set theme to dark and save to localStorage', () => {
      store.dispatch(setTheme('dark'));
      
      const state = store.getState().theme;
      expect(state.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('localStorage persistence', () => {
    it('should save theme changes to localStorage', () => {
      store.dispatch(setTheme('light'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
      
      store.dispatch(toggleTheme());
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw
      expect(() => {
        store.dispatch(setTheme('light'));
      }).not.toThrow();
    });
  });
});
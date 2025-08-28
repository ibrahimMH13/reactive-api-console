import { configureStore } from '@reduxjs/toolkit';
import apiSlice, { 
  addApiResult, 
  toggleApi, 
  setActiveApis, 
  setApiLoading, 
  setApiError,
  clearApiError,
  clearApiResults,
  setApiFilter,
  setGlobalFilter
} from '../apiSlice';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('apiSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        api: apiSlice,
      },
    });
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('initial state', () => {
    it('should have correct initial state with default APIs', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const state = (store.getState() as any).api;
      
      expect(state.results).toEqual({});
      expect(state.activeApis).toEqual(['weather', 'catfacts', 'github', 'chucknorris', 'bored', 'custom']);
      expect(state.isProcessing).toBe(false);
      expect(state.loadingStates).toEqual({});
      expect(state.errors).toEqual({});
      expect(state.filters).toEqual({});
      expect(state.globalFilter).toBe('');
      expect(state.lastCommands).toEqual({});
    });

    it('should load active APIs from localStorage if available', () => {
      // Mock localStorage before importing the slice
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['weather', 'github']));
      
      // Clear module cache and reimport the slice to pick up the mocked localStorage
      jest.resetModules();
      const apiSliceReloaded = require('../apiSlice').default;
      
      // Create new store to test initialization
      const newStore = configureStore({
        reducer: {
          api: apiSliceReloaded,
        },
      });
      
      const state = (newStore.getState() as any).api;
      expect(state.activeApis).toEqual(['weather', 'github']);
    });
  });

  describe('toggleApi', () => {
    it('should disable an active API', () => {
      store.dispatch(toggleApi('weather'));
      
      const state = (store.getState() as any).api;
      expect(state.activeApis).not.toContain('weather');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'activeApis', 
        JSON.stringify(['catfacts', 'github', 'chucknorris', 'bored', 'custom'])
      );
    });

    it('should enable an inactive API', () => {
      // First disable weather
      store.dispatch(toggleApi('weather'));
      // Then enable it back
      store.dispatch(toggleApi('weather'));
      
      const state = (store.getState() as any).api;
      expect(state.activeApis).toContain('weather');
    });

    it('should clear loading and error states when disabling API', () => {
      // Set up some states
      store.dispatch(setApiLoading({ api: 'weather', isLoading: true }));
      store.dispatch(setApiError({ api: 'weather', error: 'Test error' }));
      
      // Disable the API
      store.dispatch(toggleApi('weather'));
      
      const state = (store.getState() as any).api;
      expect(state.loadingStates.weather).toBe(false);
      expect(state.errors.weather).toBe(null);
    });
  });

  describe('setActiveApis', () => {
    it('should set active APIs and save to localStorage', () => {
      const newApis = ['weather', 'github'];
      store.dispatch(setActiveApis(newApis));
      
      const state = (store.getState() as any).api;
      expect(state.activeApis).toEqual(newApis);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeApis', JSON.stringify(newApis));
    });
  });

  describe('addApiResult', () => {
    it('should add a new API result', () => {
      const mockResult = {
        id: 'test-1',
        api: 'weather',
        command: 'get weather Berlin',
        data: { status: 'success' as const, temperature: '20°C', city: 'Berlin' },
        timestamp: Date.now()
      };

      store.dispatch(addApiResult({
        api: 'weather',
        result: mockResult,
        command: 'get weather Berlin'
      }));

      const state = (store.getState() as any).api;
      expect(state.results.weather).toHaveLength(1);
      expect(state.results.weather[0]).toEqual(mockResult);
      expect(state.loadingStates.weather).toBe(false);
      expect(state.errors.weather).toBe(null);
      expect(state.lastCommands.weather).toBe('get weather Berlin');
    });

    it('should limit results to 50 per API', () => {
      // Add 51 results
      for (let i = 0; i < 51; i++) {
        const mockResult = {
          id: `test-${i}`,
          api: 'weather',
          command: `command ${i}`,
          data: { status: 'success' as const, temperature: `${i}°C` },
          timestamp: Date.now() + i
        };

        store.dispatch(addApiResult({
          api: 'weather',
          result: mockResult
        }));
      }

      const state = (store.getState() as any).api;
      expect(state.results.weather).toHaveLength(50);
      expect(state.results.weather[0].id).toBe('test-50'); // Most recent first
    });
  });

  describe('loading states', () => {
    it('should set API loading state', () => {
      store.dispatch(setApiLoading({ api: 'weather', isLoading: true, command: 'test command' }));
      
      const state = (store.getState() as any).api;
      expect(state.loadingStates.weather).toBe(true);
      expect(state.lastCommands.weather).toBe('test command');
      expect(state.errors.weather).toBe(null);
    });
  });

  describe('error states', () => {
    it('should set API error state', () => {
      store.dispatch(setApiError({ api: 'weather', error: 'Network error', command: 'test command' }));
      
      const state = (store.getState() as any).api;
      expect(state.errors.weather).toEqual({
        message: 'Network error',
        timestamp: expect.any(Number),
        command: 'test command'
      });
      expect(state.loadingStates.weather).toBe(false);
    });

    it('should clear API error', () => {
      // Set error first
      store.dispatch(setApiError({ api: 'weather', error: 'Test error' }));
      // Then clear it
      store.dispatch(clearApiError('weather'));
      
      const state = (store.getState() as any).api;
      expect(state.errors.weather).toBe(null);
    });
  });

  describe('filters', () => {
    it('should set API filter', () => {
      store.dispatch(setApiFilter({ api: 'weather', filter: 'Berlin' }));
      
      const state = (store.getState() as any).api;
      expect(state.filters.weather).toBe('Berlin');
    });

    it('should set global filter', () => {
      store.dispatch(setGlobalFilter('test search'));
      
      const state = (store.getState() as any).api;
      expect(state.globalFilter).toBe('test search');
    });
  });

  describe('clearApiResults', () => {
    it('should clear results for specific API', () => {
      // Add some results and states
      const mockResult = {
        id: 'test-1',
        api: 'weather',
        command: 'test',
        data: { status: 'success' as const },
        timestamp: Date.now()
      };
      
      store.dispatch(addApiResult({ api: 'weather', result: mockResult }));
      store.dispatch(setApiError({ api: 'weather', error: 'Test error' }));
      store.dispatch(setApiLoading({ api: 'weather', isLoading: true }));
      
      // Clear results
      store.dispatch(clearApiResults('weather'));
      
      const state = (store.getState() as any).api;
      expect(state.results.weather).toBeUndefined();
      expect(state.errors.weather).toBe(null);
      expect(state.loadingStates.weather).toBe(false);
    });
  });
});
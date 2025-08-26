// Preference synchronization service
import { apiService } from './api';
import { store } from '../store';
import { setTheme } from '../store/slices/themeSlice';
import { setActiveApis } from '../store/slices/apiSlice';

// Local interface definition to avoid import issues
interface UserPreferences {
  theme: 'light' | 'dark';
  activeAPIs: Record<string, boolean>;
  notifications: boolean;
}

export class PreferenceSyncService {
  private syncInProgress = false;
  private syncTimeout: NodeJS.Timeout | null = null;
  private lastSavedState: string | null = null;

  // Load preferences from backend and apply to Redux store
  async loadPreferencesFromBackend(): Promise<boolean> {
    try {
      console.log('Loading preferences from backend...');
      const preferences = await apiService.getUserPreferences();
      
      if (!preferences) {
        console.warn('No preferences returned from backend');
        return false;
      }
      
      // Safely apply theme preference
      const currentState = store.getState();
      const currentTheme = currentState?.theme?.theme;
      
      if (preferences.theme && preferences.theme !== currentTheme) {
        console.log(`🎨 Applying backend theme preference: ${preferences.theme} (was: ${currentTheme})`);
        store.dispatch(setTheme(preferences.theme));
      } else {
        console.log('✅ Theme preference unchanged, skipping update');
      }
      
      // Apply active APIs with validation - only on initial load
      if (preferences.activeAPIs && typeof preferences.activeAPIs === 'object') {
        // Convert object format {weather: true, catfacts: false} to array format [weather]
        const activeApisArray = Object.entries(preferences.activeAPIs)
          .filter(([, enabled]) => enabled)
          .map(([api]) => api);
          
        const currentState = store.getState();
        const currentActiveApis = currentState?.api?.activeApis || [];
        
        // Only update if significantly different (not just reordering)
        const currentSet = new Set(currentActiveApis);
        const newSet = new Set(activeApisArray);
        const isDifferent = currentSet.size !== newSet.size || 
          [...currentSet].some(api => !newSet.has(api));
        
        if (isDifferent) {
          console.log('🔧 Applying backend API preferences:', activeApisArray);
          console.log('🔧 Previous APIs:', currentActiveApis);
          store.dispatch(setActiveApis(activeApisArray));
        } else {
          console.log('✅ API preferences unchanged, skipping update');
        }
      }
      
      console.log('Preferences loaded successfully:', preferences);
      return true;
    } catch (error) {
      console.warn('Failed to load preferences from backend (non-critical):', error);
      return false;
    }
  }

  // Save current Redux state to backend
  async savePreferencesToBackend(): Promise<boolean> {
    if (this.syncInProgress) return false;

    try {
      this.syncInProgress = true;
      const state = store.getState();
      
      console.log('Full Redux state:', state);
      console.log('Theme state:', state.theme);
      console.log('API state:', state.api);
      
      // Convert array format [weather, github] to object format {weather: true, github: true, catfacts: false}
      const allApis = ['weather', 'catfacts', 'github', 'chucknorris', 'bored', 'custom'];
      const currentActiveApis = state.api?.activeApis || [];
      const activeAPIsObject: Record<string, boolean> = {};
      
      allApis.forEach(api => {
        activeAPIsObject[api] = currentActiveApis.includes(api);
      });

      const preferences: UserPreferences = {
        theme: state.theme?.theme || 'dark',
        activeAPIs: activeAPIsObject,
        notifications: true, // Default for now
      };

      console.log('Saving preferences to backend:', preferences);
      console.log('Current Redux state theme:', state.theme);
      console.log('Current Redux state API:', state.api);
      
      // Validate the data before sending
      if (!preferences.theme || typeof preferences.activeAPIs !== 'object' || preferences.activeAPIs === null) {
        console.error('Invalid preferences data:', preferences);
        console.error('Theme value:', preferences.theme);
        console.error('ActiveAPIs value:', preferences.activeAPIs);
        return false;
      }

      await apiService.saveUserPreferences(preferences);
      console.log('Preferences saved to backend successfully');
      return true;
    } catch (error) {
      console.error('Failed to save preferences to backend:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Debounced save - waits for user to stop making changes
  debouncedSave(delayMs: number = 1000): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.savePreferencesToBackend();
    }, delayMs);
  }

  // Load search history from backend
  async loadSearchHistory(): Promise<boolean> {
    try {
      console.log('Loading search history from backend...');
      const response = await apiService.getSearchHistory();
      console.log('Raw search history response:', response);
      
      // Check if response is an array or wrapped in a response object
      let history: any[] = [];
      if (Array.isArray(response)) {
        history = response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        history = (response as any).data;
      } else if (response && typeof response === 'object') {
        console.warn('Unexpected search history response format:', response);
        history = [];
      }
      
      // Convert search history to a summary display (don't clutter main results)
      // We'll just log the history for now - could create a separate history panel later
      if (history.length > 0) {
        console.log('Search history loaded:', history.map(h => `${h.api}: ${h.query}`));
      } else {
        console.log('No search history found');
      }
      
      console.log(`Loaded ${history.length} search history entries`);
      return true;
    } catch (error) {
      console.error('Failed to load search history:', error);
      return false;
    }
  }

  // Save search entry to backend
  async saveSearchEntry(query: string, api: string): Promise<boolean> {
    try {
      const entry = {
        query,
        api,
        timestamp: Date.now(),
      };

      await apiService.saveSearchEntry(entry);
      console.log('Search entry saved:', entry);
      return true;
    } catch (error) {
      console.error('Failed to save search entry:', error);
      return false;
    }
  }

  // Initialize sync service
  async initialize(accessToken?: string): Promise<void> {
    try {
      console.log('Initializing preference sync service...');
      
      // Set the authentication token
      if (accessToken) {
        apiService.setToken(accessToken);
        console.log('Access token set for API service');
      } else {
        console.warn('No access token provided - API calls may fail');
        return; // Don't proceed without authentication
      }
      
      // Set up store subscription with improved safeguards
      let isInitializing = true;
      console.log('⏳ Setting up store subscription (INACTIVE for 10 seconds)');
      const unsubscribe = store.subscribe(() => {
        // Skip saving during initialization to avoid sync loops
        if (isInitializing) {
          return; // Silent during initialization
        }
        
        // Only save if preferences actually changed
        const state = store.getState();
        const currentStateString = JSON.stringify({
          theme: state.theme?.theme,
          activeApis: state.api?.activeApis
        });
        
        if (currentStateString !== this.lastSavedState) {
          console.log('🔄 State changed, triggering debounced save');
          this.debouncedSave(5000); // Save 5 seconds after last change (longer delay)
          this.lastSavedState = currentStateString;
        }
      });
      
      // Load preferences and history from backend (non-blocking)
      // But ONLY load from backend if localStorage doesn't have preferences
      const hasLocalTheme = localStorage.getItem('theme');
      const hasLocalApis = localStorage.getItem('activeApis');
      
      const loadTasks = [this.loadSearchHistory()];
      
      // Only load preferences from backend if no local preferences exist
      if (!hasLocalTheme || !hasLocalApis) {
        console.log('🔄 Loading preferences from backend (no local preferences found)');
        loadTasks.push(this.loadPreferencesFromBackend());
      } else {
        console.log('✅ Using local preferences, skipping backend load');
      }
      
      Promise.allSettled(loadTasks).then(results => {
        console.log('Backend sync results:', results);
        
        // Initialize lastSavedState with current state
        const state = store.getState();
        this.lastSavedState = JSON.stringify({
          theme: state.theme?.theme,
          activeApis: state.api?.activeApis
        });
        
        // Only start listening for changes after initial load is complete
        setTimeout(() => {
          isInitializing = false;
          console.log('✅ Preference sync is now ACTIVE - user changes will be saved to backend');
        }, 10000); // Wait 10 seconds after backend load
      }).catch(error => {
        console.warn('Some backend operations failed (non-critical):', error);
        
        // Initialize lastSavedState even if backend load fails
        const state = store.getState();
        this.lastSavedState = JSON.stringify({
          theme: state.theme?.theme,
          activeApis: state.api?.activeApis
        });
        
        // Still activate sync even if backend load fails
        setTimeout(() => { 
          isInitializing = false;
          console.log('✅ Preference sync activated after backend error');
        }, 10000);
      });

      console.log('Preference sync service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize preference sync service:', error);
      // Don't throw - this should not break the app
    }
  }
}

export const preferenceSyncService = new PreferenceSyncService();
// components/Dashboard.tsx (Final refactored version)
import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { ChatInput } from "./chat/ChatInput";
import Sidebar from "./ui/Sidebar";
import { websocketService } from "../services/websocket";
import { WeatherCard } from "./panels/WeatherCard";
import { CatFactsCard } from "./panels/CatFactsCard";
import { GitHubCard } from "./panels/GitHubCard";
import CustomBackendCard from "./panels/CustomBackendCard";
import { BoredCard } from "./panels/BoredCard";
import { ChuckNorrisCard } from "./panels/ChuckNorrisCard";
import { SearchHistoryCard } from "./panels/SearchHistoryCard";
import { GlobalSearch } from "./ui/GlobalSearch";
import { 
  addApiResult, 
  setApiLoading, 
  setApiError, 
  selectApiResults,
  selectHasAnyErrors,
  selectActiveApisWithErrors,
} from "../store/slices/apiSlice";
import { toggleTheme } from "../store/slices/themeSlice";
import { useTheme } from "../hooks/useTheme";
import { preferenceSyncService } from "../services/preferenceSync";

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { getUserInfo, signOut, getAccessToken, isAuthenticated } = useAuth();
  const user = getUserInfo();
  
  const { connectionStatus } = useSelector((state: RootState) => state.ui);
  const { activeApis, isProcessing, globalFilter, filters } = useSelector(
    (state: RootState) => state.api
  );
  const { theme } = useTheme();

  // Get filtered results using Redux selectors
  const weatherResults = useSelector((state: RootState) => selectApiResults(state, 'weather'));
  const catFactResults = useSelector((state: RootState) => selectApiResults(state, 'catfacts'));
  const githubResults = useSelector((state: RootState) => selectApiResults(state, 'github'));
  const customResults = useSelector((state: RootState) => selectApiResults(state, 'custom'));
  const chuckResults = useSelector((state: RootState) => selectApiResults(state, 'chucknorris'));
  const boredResults = useSelector((state: RootState) => selectApiResults(state, 'bored'));

  // Error states
  const hasAnyErrors = useSelector((state: RootState) => selectHasAnyErrors(state));
  const apisWithErrors = useSelector((state: RootState) => selectActiveApisWithErrors(state));

  // Enhanced WebSocket event handling
  useEffect(() => {
    const handleApiResponse = (data: any) => {
      console.log("📥 Dashboard received API response:", data);
      
      // Handle array responses (GitHub, Chuck Norris search) vs single responses
      if (Array.isArray(data.result)) {
        // Create individual ApiResult objects for each item in the array
        data.result.forEach((item: any, index: number) => {
          const apiResult: any = {
            id: `${data.api}-${data.timestamp || Date.now()}-${index}`,
            api: data.api,
            command: data.command,
            data: item, // Individual item (user, joke, etc.)
            timestamp: data.timestamp || Date.now()
          };
          
          dispatch(addApiResult({
            api: data.api,
            result: apiResult,
            command: data.command
          }));
        });
      } else {
        // Single result (Weather, CatFacts, Bored, etc.)
        const apiResult: any = {
          id: `${data.api}-${data.timestamp || Date.now()}`,
          api: data.api,
          command: data.command,
          data: data.result, // Single result object
          timestamp: data.timestamp || Date.now()
        };
        
        dispatch(addApiResult({
          api: data.api,
          result: apiResult,
          command: data.command
        }));
      }
    };

    const handleApiError = (data: any) => {
      console.log("❌ Dashboard received API error:", data);
      dispatch(setApiError({
        api: data.api,
        error: data.error,
        command: data.command
      }));
    };

    const handleCommandStatus = (data: any) => {
      console.log("🔄 Command status update:", data);
      
      if (data.status === 'processing') {
        dispatch(setApiLoading({
          api: data.api,
          isLoading: true,
          command: data.command
        }));
      } else if (data.status === 'error') {
        dispatch(setApiError({
          api: data.api,
          error: data.error || 'Unknown error occurred',
          command: data.command
        }));
      }
      // Note: success is handled by handleApiResponse
    };

    // Register all WebSocket event handlers
    websocketService.onApiResponse(handleApiResponse);
    websocketService.onApiError(handleApiError);
    websocketService.onCommandStatus(handleCommandStatus);

    return () => {
      // Clean up specific event handlers
      websocketService.offApiResponse(handleApiResponse);
      websocketService.offApiError(handleApiError);
      websocketService.offCommandStatus(handleCommandStatus);
    };
  }, [dispatch]);

  // Initialize preference sync service
  useEffect(() => {
    if (isAuthenticated && getAccessToken()) {
      const token = getAccessToken();
      if (token) {
        console.log('Initializing preference sync with token...');
        // Use setTimeout to ensure Redux store is fully initialized
        setTimeout(() => {
          preferenceSyncService.initialize(token).catch(error => {
            console.warn('Failed to initialize preference sync (non-critical):', error);
          });
        }, 100); // Small delay to let Redux fully initialize
      }
    }
  }, [isAuthenticated, getAccessToken]);

  // Filter function for global search
  const applyGlobalFilter = (results: any[], searchFields: string[]) => {
    if (!globalFilter) return results;

    return results.filter((apiResult) => {
      // Access the actual data from ApiResult.data
      const data = apiResult.data;
      return searchFields.some((field) => {
        const value = field.split(".").reduce((obj, key) => obj?.[key], data);
        return value
          ?.toString()
          .toLowerCase()
          .includes(globalFilter.toLowerCase());
      });
    });
  };

  const getFilteredResults = (apiName: string, results: any[], searchFields: string[], localFilterField?: string) => {
    const localFilter = filters[apiName] || '';
    
    let filtered = results;
    
    // Apply local filter if specified
    if (localFilter && localFilterField) {
      filtered = filtered.filter((apiResult) => {
        // Access the actual data from ApiResult.data
        const data = apiResult.data;
        return data[localFilterField]?.toLowerCase().includes(localFilter.toLowerCase());
      });
    }
    
    // Apply global filter
    return applyGlobalFilter(filtered, searchFields);
  };

  // Apply filters to all results
  const filteredWeatherResults = getFilteredResults('weather', weatherResults, ["location", "condition", "temperature"], 'location');
  const filteredCatFactResults = getFilteredResults('catfacts', catFactResults, ["fact"], 'fact');
  const filteredGithubResults = getFilteredResults('github', githubResults, ["login", "name"], 'login');
  const filteredChuckResults = getFilteredResults('chucknorris', chuckResults, ["joke", "category"], 'joke');
  const filteredBoredResults = getFilteredResults('bored', boredResults, ["activity", "type"], 'activity');
  const filteredCustomResults = getFilteredResults('custom', customResults, []);

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-400";
      case "connecting":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 relative transition-colors duration-200">
      {/* Fixed background layer */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10 transition-colors duration-200"></div>

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 relative z-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Reactive API Console
              </h1>
              {/* Enhanced error indicator in header */}
              {hasAnyErrors && (
                <div className="ml-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-400">
                    {apisWithErrors.length} API{apisWithErrors.length !== 1 ? 's' : ''} with errors
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700 dark:text-slate-300">
                Welcome, {user?.name || user?.email}
              </div>
              
              {/* Debug: Manual sync test button */}
              <button
                onClick={() => {
                  console.log('Manual sync test clicked');
                  preferenceSyncService.savePreferencesToBackend();
                }}
                className="px-2 py-1 text-xs bg-yellow-500 text-black rounded mr-2"
              >
                Test Sync
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={signOut}
                className="px-3 py-2 text-sm bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Input Area */}
          <div className="lg:col-span-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden transition-colors duration-200">
              <ChatInput />
            </div>
          </div>

          {/* Global Search */}
          <div className="lg:col-span-4">
            <GlobalSearch />
          </div>

          {/* Sidebar - API Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden h-full transition-colors duration-200">
              <Sidebar />
            </div>
          </div>

          {/* Main Content Area - API Panels */}
          <div className="lg:col-span-3">
            {/* Show message when no APIs are active */}
            {activeApis.length === 0 ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 p-8 text-center max-w-md transition-colors duration-200">
                  <div className="text-gray-600 dark:text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414A1 1 0 0017 19h-4a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009 16H6.414a1 1 0 01-.707-.293L3.293 13.293A1 1 0 013 12.586V10" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-slate-300 mb-2">No APIs Active</h3>
                    <p className="text-sm">Enable some APIs from the sidebar to see results here</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Weather Panel */}
              {activeApis.includes('weather') && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden transition-colors duration-200">
                  <WeatherCard
                    results={filteredWeatherResults}
                    apiName="weather"
                  />
                </div>
              )}
              
              {/* Cat Facts Panel */}
              {activeApis.includes('catfacts') && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden transition-colors duration-200">
                  <CatFactsCard
                    results={filteredCatFactResults}
                    apiName="catfacts"
                  />
                </div>
              )}

              {/* GitHub Panel */}
              {activeApis.includes('github') && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden transition-colors duration-200">
                  <GitHubCard
                    results={filteredGithubResults}
                    apiName="github"
                  />
                </div>
              )}

              {/* Bored Panel */}
              {activeApis.includes('bored') && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden transition-colors duration-200">
                  <BoredCard
                    results={filteredBoredResults}
                    apiName="bored"
                  />
                </div>
              )}

              {/* Chuck Norris Panel */}
              {activeApis.includes('chucknorris') && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden transition-colors duration-200">
                  <ChuckNorrisCard
                    results={filteredChuckResults}
                    apiName="chucknorris"
                  />
                </div>
              )}

              {/* Custom Backend Panel */}
              {activeApis.includes('custom') && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden transition-colors duration-200">
                  <CustomBackendCard
                    results={filteredCustomResults}
                    apiName="custom"
                  />
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-4 border border-gray-300 dark:border-slate-600 flex items-center space-x-3 transition-colors duration-200">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-800 dark:text-slate-300">Processing API request...</span>
          </div>
        </div>
      )}


      {/* Enhanced Status Bar */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 border border-gray-300 dark:border-slate-600 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500 animate-pulse"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : connectionStatus === "error"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              ></div>
              <span className={`text-xs ${getConnectionColor()}`}>
                {getConnectionText()}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-slate-500">
              APIs: {activeApis.length}
            </div>
            {hasAnyErrors && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-400">{apisWithErrors.length} Errors</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-400">Processing</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
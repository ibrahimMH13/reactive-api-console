import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleApi } from '../../store/slices/apiSlice';
import type { RootState } from '../../store';

interface ApiConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const apiConfigs: ApiConfig[] = [
  { id: 'weather', name: 'Weather', description: 'Get weather data for cities', icon: '🌤️' },
  { id: 'catfacts', name: 'Cat Facts', description: 'Random cat facts', icon: '🐱' },
  { id: 'github', name: 'GitHub', description: 'Search GitHub users', icon: '👨‍💻' },
  { id: 'chucknorris', name: 'Chuck Norris', description: 'Chuck Norris jokes', icon: '⚡' },
  { id: 'bored', name: 'Bored API', description: 'Activity suggestions', icon: '🎯' },
  { id: 'custom', name: 'Custom Backend', description: 'Your custom data', icon: '🔧' },
];

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { activeApis, results } = useSelector((state: RootState) => state.api);

  const handleToggleApi = (apiId: string) => {
    dispatch(toggleApi(apiId));
  };

  const getResultCount = (apiId: string): number => {
    return results[apiId]?.length || 0;
  };

  return (
    <div className="p-6 h-full bg-gray-50 dark:bg-transparent transition-colors duration-200">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        API Controls
      </h2>

      <div className="space-y-3">
        {apiConfigs.map((api) => {
          const isActive = activeApis.includes(api.id);
          const resultCount = getResultCount(api.id);
          
          return (
            <div
              key={api.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-700/20 border-gray-200 dark:border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{api.icon}</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{api.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400">{api.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggleApi(api.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    isActive ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-500'}`}>
                  {isActive ? 'Active' : 'Disabled'}
                </span>
                <span className="text-gray-600 dark:text-slate-400">
                  {resultCount} results
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="text-center">
          <div className="text-sm text-gray-700 dark:text-slate-400">
            {activeApis.length} of {apiConfigs.length} APIs active
          </div>
          <button
            onClick={() => {
              // Toggle all APIs
              const allActive = activeApis.length === apiConfigs.length;
              if (allActive) {
                // Disable all APIs
                apiConfigs.forEach(api => {
                  if (activeApis.includes(api.id)) {
                    dispatch(toggleApi(api.id));
                  }
                });
              } else {
                // Enable all APIs
                apiConfigs.forEach(api => {
                  if (!activeApis.includes(api.id)) {
                    dispatch(toggleApi(api.id));
                  }
                });
              }
            }}
            className="mt-2 px-3 py-1 text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            {activeApis.length === apiConfigs.length ? 'Disable All' : 'Enable All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
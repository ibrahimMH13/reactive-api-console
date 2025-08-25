import React from 'react';

interface WeatherResult {
  location: string;
  temperature: string;
  condition: string;
  windSpeed: string;
  timestamp: string;
}

interface WeatherPanelProps {
  results: WeatherResult[];
  onFilter: (filter: string) => void;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ results, onFilter }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z" />
          </svg>
          Weather API
        </h3>
        <input
          type="text"
          placeholder="Filter..."
          onChange={(e) => onFilter(e.target.value)}
          className="px-3 py-1 text-sm bg-slate-700/50 border border-slate-600 rounded text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-3 overflow-y-auto max-h-96">
        {results.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p className="text-sm">No weather data yet.</p>
            <p className="text-xs mt-1">Try: "get weather Berlin"</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-blue-400 text-lg">{result.location}</h4>
                <span className="text-xs text-slate-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{result.temperature}</div>
                  <div className="text-xs text-slate-400">Temperature</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-300">{result.condition}</div>
                  <div className="text-xs text-slate-400">Condition</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-600/30">
                <div className="text-sm text-slate-400">
                  💨 Wind: {result.windSpeed}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
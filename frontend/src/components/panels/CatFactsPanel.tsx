import React from 'react';

interface CatFactResult {
  fact: string;
  length: number;
  timestamp: string;
}

interface CatFactsPanelProps {
  results: CatFactResult[];
  onFilter: (filter: string) => void;
}

export const CatFactsPanel: React.FC<CatFactsPanelProps> = ({ results, onFilter }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cat Facts API
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
            <p className="text-sm">No cat facts yet.</p>
            <p className="text-xs mt-1">Try: "get cat fact"</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="text-orange-400 text-lg">🐱</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{result.length} chars</span>
              </div>
              
              <p className="text-slate-300 leading-relaxed">{result.fact}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
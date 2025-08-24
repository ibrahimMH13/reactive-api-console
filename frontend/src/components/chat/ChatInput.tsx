import React, { useState, useCallback } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const ChatInput: React.FC = () => {
  const [command, setCommand] = useState('');
  const { sendCommand, isConnected } = useWebSocket();
  const { isProcessing } = useSelector((state: RootState) => state.api);
  const { isTyping } = useSelector((state: RootState) => state.ui);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim() || isProcessing || !isConnected) return;
    
    sendCommand(command.trim());
    setCommand('');
  }, [command, sendCommand, isProcessing, isConnected]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const getPlaceholder = () => {
    if (!isConnected) return 'Connecting to server...';
    if (isProcessing) return 'Processing command...';
    return 'Type a command... (e.g., "get weather Berlin", "search github john")';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 mb-6">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            disabled={!isConnected || isProcessing}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {isTyping && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!command.trim() || !isConnected || isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isProcessing ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
      
      {/* Example commands */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          'get weather Berlin',
          'get cat fact', 
          'search github john',
          'get activity',
          'get my preferences'
        ].map((example) => (
          <button
            key={example}
            onClick={() => setCommand(example)}
            disabled={isProcessing || !isConnected}
            className="text-xs px-3 py-1 bg-slate-700/30 text-slate-400 rounded-full hover:bg-slate-700/50 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
};
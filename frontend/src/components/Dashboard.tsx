import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { ChatInput } from "./chat/ChatInput";

export const Dashboard: React.FC = () => {
  const { getUserInfo, signOut, getAccessToken } = useAuth();
  const user = getUserInfo();
  const { connectionStatus } = useSelector((state: RootState) => state.ui);
  const { activeApis } = useSelector((state: RootState) => state.api);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
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
              <h1 className="text-xl font-bold text-white">
                Reactive API Console
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-300">
                Welcome, {user?.name || user?.email}
              </div>
              <button
                onClick={signOut}
                className="px-3 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
          {/* Chat Input Area */}
          <div className="lg:col-span-4">
           <ChatInput />
          </div>

          {/* Sidebar - API Controls */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 h-full">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Active APIs
              </h2>

              <div className="space-y-3">
                {[
                  "Weather",
                  "Cat Facts",
                  "GitHub",
                  "Chuck Norris",
                  "Bored API",
                  "Custom Backend",
                ].map((api) => (
                  <div
                    key={api}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <span className="text-slate-300 text-sm">{api}</span>
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area - API Panels */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Weather Panel */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"
                      />
                    </svg>
                    Weather API
                  </h3>
                  <input
                    type="text"
                    placeholder="Filter..."
                    className="px-3 py-1 text-sm bg-slate-700/50 border border-slate-600 rounded text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="text-center text-slate-400 py-8">
                  <p className="text-sm">No weather data yet.</p>
                  <p className="text-xs mt-1">Try: "get weather Berlin"</p>
                </div>
              </div>

              {/* Cat Facts Panel */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Cat Facts API
                  </h3>
                  <input
                    type="text"
                    placeholder="Filter..."
                    className="px-3 py-1 text-sm bg-slate-700/50 border border-slate-600 rounded text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="text-center text-slate-400 py-8">
                  <p className="text-sm">No cat facts yet.</p>
                  <p className="text-xs mt-1">Try: "get cat fact"</p>
                </div>
              </div>

              {/* GitHub Panel */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub API
                  </h3>
                  <input
                    type="text"
                    placeholder="Filter..."
                    className="px-3 py-1 text-sm bg-slate-700/50 border border-slate-600 rounded text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="text-center text-slate-400 py-8">
                  <p className="text-sm">No GitHub users yet.</p>
                  <p className="text-xs mt-1">Try: "search github john"</p>
                </div>
              </div>

              {/* Custom Backend Panel */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Custom Backend
                  </h3>
                  <input
                    type="text"
                    placeholder="Filter..."
                    className="px-3 py-1 text-sm bg-slate-700/50 border border-slate-600 rounded text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="text-center text-slate-400 py-8">
                  <p className="text-sm">No custom data yet.</p>
                  <p className="text-xs mt-1">Try: "get my preferences"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
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
            <div className="text-xs text-slate-500">
              APIs: {activeApis.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

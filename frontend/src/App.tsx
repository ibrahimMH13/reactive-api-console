import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CallbackHandler } from './components/auth/CallbackHandler';
import { Dashboard } from './components/Dashboard';
import { useTheme } from './hooks/useTheme';

function App() {
  // Initialize theme on app startup
  useTheme();
  
  // Initialize preference sync service when user is authenticated
  useEffect(() => {
    // We'll initialize the sync service from the Dashboard component
    // where we have access to the auth context
  }, []);
  
  return (
    <Routes>
      {/* Cognito callback route - handles redirect after login */}
      <Route 
        path="/callback" 
        element={<CallbackHandler />} 
      />
      
      {/* Main app route - protected, requires authentication */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
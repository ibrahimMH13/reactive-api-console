import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CallbackHandler } from './components/auth/CallbackHandler';
import { Dashboard } from './components/Dashboard';

function App() {
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
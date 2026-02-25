import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import StaticData from './pages/StaticData';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  return admin ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  return admin ? <Navigate to="/overview" /> : children;
};

const App = () => (
  <ThemeProvider>
    <AdminAuthProvider>
      <BrowserRouter>
        <div className="noise">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/static-data" element={<ProtectedRoute><StaticData /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/overview" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AdminAuthProvider>
  </ThemeProvider>
);

export default App;

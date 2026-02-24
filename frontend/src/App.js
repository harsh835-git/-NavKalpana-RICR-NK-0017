import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import WorkoutPlan from './pages/WorkoutPlan';
import DietPlan from './pages/DietPlan';
import Progress from './pages/Progress';
import Measurements from './pages/Measurements';
import CheckIn from './pages/CheckIn';
import AICoach from './pages/AICoach';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#070709' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  return user ? children : <Navigate to="/login" />;
};

const ProfileRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!user.profile?.profileComplete) return <Navigate to="/profile-setup" />;
  return children;
};

const App = () => (
  <ThemeProvider>
  <AuthProvider>
    <BrowserRouter>
      <div className="noise">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
          <Route path="/dashboard" element={<ProfileRoute><Dashboard /></ProfileRoute>} />
          <Route path="/workout" element={<ProfileRoute><WorkoutPlan /></ProfileRoute>} />
          <Route path="/diet" element={<ProfileRoute><DietPlan /></ProfileRoute>} />
          <Route path="/progress" element={<ProfileRoute><Progress /></ProfileRoute>} />
          <Route path="/measurements" element={<ProfileRoute><Measurements /></ProfileRoute>} />
          <Route path="/checkin" element={<ProfileRoute><CheckIn /></ProfileRoute>} />
          <Route path="/coach" element={<ProfileRoute><AICoach /></ProfileRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  </AuthProvider>
  </ThemeProvider>
);

export default App;

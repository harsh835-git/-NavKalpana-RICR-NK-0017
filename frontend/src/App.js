import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import WorkoutPlan from './pages/WorkoutPlan';
import DietPlan from './pages/DietPlan';
import Progress from './pages/Progress';
import Measurements from './pages/Measurements';
import CheckIn from './pages/CheckIn';
import AICoach from './pages/AICoach';

const isProfileComplete = (user) =>
  user?.profile?.profileComplete || user?.profileComplete;

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  return user ? children : <Navigate to="/login" />;
};

// Redirects away from /profile-setup if profile is already complete
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (isProfileComplete(user)) return <Navigate to="/dashboard" />;
  return children;
};

const ProfileRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!isProfileComplete(user)) return <Navigate to="/profile-setup" />;
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile-setup" element={<OnboardingRoute><ProfileSetup /></OnboardingRoute>} />
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

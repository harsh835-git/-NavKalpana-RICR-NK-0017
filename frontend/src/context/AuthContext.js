import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Use CRA proxy in development; allow override via REACT_APP_API_URL.
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fitai_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/profile')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('fitai_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem('fitai_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData); // set partial data immediately for fast redirect
    try {
      const res = await axios.get('/api/profile');
      setUser(res.data); // replace with full profile (includes goal, macros, etc.)
    } catch (e) {}
  };

  const logout = () => {
    localStorage.removeItem('fitai_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await axios.get('/api/profile');
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

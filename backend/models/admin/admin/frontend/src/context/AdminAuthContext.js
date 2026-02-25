import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();
export const useAdminAuth = () => useContext(AdminAuthContext);

const setAuthHeader = (token) => {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async (token) => {
    try {
      setAuthHeader(token);
      const { data } = await axios.get('/api/admin/auth/verify');
      if (data.valid) {
        setAdmin(data.admin);
        return true;
      }
    } catch {
      logout();
    }
    return false;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('fitai_admin_token');
    if (token) {
      verify(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [verify]);

  const login = async (username, password) => {
    const { data } = await axios.post('/api/admin/auth/login', { username, password });
    localStorage.setItem('fitai_admin_token', data.token);
    setAuthHeader(data.token);
    setAdmin({ username: data.username, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fitai_admin_token');
    setAuthHeader(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

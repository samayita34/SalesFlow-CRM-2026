import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('salesflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('salesflow_token'));
  const [loading, setLoading] = useState(true);

  const performLogout = () => {
    localStorage.removeItem('salesflow_token');
    localStorage.removeItem('salesflow_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('salesflow_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('salesflow_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Failed to verify session token:', err);
          performLogout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.success && data.token) {
      localStorage.setItem('salesflow_token', data.token);
      localStorage.setItem('salesflow_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (name, email, password, role) => {
    const data = await authApi.register(name, email, password, role);
    if (data.success && data.token) {
      localStorage.setItem('salesflow_token', data.token);
      localStorage.setItem('salesflow_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout: performLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

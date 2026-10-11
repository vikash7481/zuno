import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useNotification } from './NotificationContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('zuno_token') || null);
  const [loading, setLoading] = useState(true);
  const { success, error: notifyError } = useNotification();

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to load user session:', err.message);
        localStorage.removeItem('zuno_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('zuno_token', newToken);
      setToken(newToken);
      setUser(userData);
      success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (err) {
      notifyError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('zuno_token', newToken);
      setToken(newToken);
      setUser(newUser);
      success(`Welcome to Zuno, ${newUser.name}!`);
      return newUser;
    } catch (err) {
      notifyError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('zuno_token');
    setToken(null);
    setUser(null);
    success('Logged out successfully');
  };

  const isRole = (roleToCheck) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true; // Super admin possesses universal permissions
    if (Array.isArray(roleToCheck)) return roleToCheck.includes(user.role);
    return user.role === roleToCheck;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role,
        login,
        register,
        logout,
        isRole,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

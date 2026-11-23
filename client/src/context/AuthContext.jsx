import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staynear_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('staynear_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('staynear_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, clearing credentials');
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('staynear_token', data.token);
      localStorage.setItem('staynear_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('staynear_token', data.token);
      localStorage.setItem('staynear_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('staynear_token');
    localStorage.removeItem('staynear_user');
  };

  const updateProfile = async (formData) => {
    const data = await authService.updateProfile(formData);
    if (data.success) {
      setUser(data.user);
      localStorage.setItem('staynear_user', JSON.stringify(data.user));
    }
    return data;
  };

  const isStudent = user?.role === 'student';
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const isOwnerApproved = isOwner && user?.ownerApplication?.status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isStudent,
        isOwner,
        isAdmin,
        isOwnerApproved,
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

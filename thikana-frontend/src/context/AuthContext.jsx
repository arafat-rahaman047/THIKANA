import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session cache on startup
  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (cachedUser && accessToken) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (err) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  /**
   * Logs in user credentials and stores tokens
   */
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { tokens, user: userData } = res.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    return userData;
  };

  /**
   * Register a new user account
   */
  const register = async (payload) => {
    return await api.post('/auth/register', payload);
  };

  /**
   * Log out session, invalidate tokens and clear caches
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API execution error:', err);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  /**
   * Dynamically update user profile details cached in session
   */
  const updateProfileState = (updatedUserData) => {
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

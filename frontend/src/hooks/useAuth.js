import { useState, useEffect } from 'react';
import { authApi } from '../api';

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        email: data.email,
      }));
      
      setToken(data.access_token);
      setUser({ id: data.user_id, email: data.email });
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signup user
   */
  const signup = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.signup(email, password);
      
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        email: data.email,
      }));
      
      setToken(data.access_token);
      setUser({ id: data.user_id, email: data.email });
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };
};

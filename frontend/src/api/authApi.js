import { publicClient } from './client';

/**
 * Authentication API - Public endpoints
 */

export const authApi = {
  /**
   * User signup
   */
  signup: async (email, password) => {
    const response = await publicClient.post('/api/auth/signup', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * User login
   */
  login: async (email, password) => {
    const response = await publicClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Get current user
   */
  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data) => {
    const response = await apiClient.put('/api/profile', data);
    return response.data;
  },
};

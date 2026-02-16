import { apiClient } from './client';

/**
 * Strategy API - Requires JWT authentication
 */

export const strategyApi = {
  /**
   * Generate a new strategy
   */
  generateStrategy: async (strategyInput) => {
    const response = await apiClient.post('/api/strategy', strategyInput);
    return response.data;
  },

  /**
   * Get user's strategy history
   */
  getHistory: async () => {
    const response = await apiClient.get('/api/history');
    return response.data;
  },

  /**
   * Get a specific strategy by ID
   */
  getStrategyById: async (id) => {
    const response = await apiClient.get(`/api/history/${id}`);
    return response.data;
  },

  /**
   * Delete a strategy by ID
   */
  deleteStrategy: async (id) => {
    const response = await apiClient.delete(`/api/history/${id}`);
    return response.data;
  },

  // Aliases and additional methods for backward compatibility
  generate: async (data) => {
    const response = await apiClient.post('/api/strategy', data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/api/history/${id}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/history/${id}`);
    return response.data;
  },

  submitFeedback: async (strategyId, rating) => {
    const response = await apiClient.post('/feedback', { strategy_id: strategyId, rating });
    return response.data;
  },

  getBlueprint: async (strategyId) => {
    const response = await apiClient.post(`/api/strategies/${strategyId}/blueprint`);
    return response.data;
  },
};

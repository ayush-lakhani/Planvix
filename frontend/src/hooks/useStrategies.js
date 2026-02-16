import { useState, useCallback } from 'react';
import { strategyApi } from '../api';

/**
 * Custom hook for strategy operations
 */
export const useStrategies = () => {
  const [strategies, setStrategies] = useState([]);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate a new strategy
   */
  const generateStrategy = useCallback(async (strategyInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await strategyApi.generateStrategy(strategyInput);
      setCurrentStrategy(data.strategy);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Strategy generation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user's strategy history
   */
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await strategyApi.getHistory();
      setStrategies(data.strategies || []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch history';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a specific strategy by ID
   */
  const getStrategyById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await strategyApi.getStrategyById(id);
      setCurrentStrategy(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch strategy';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a strategy by ID
   */
  const deleteStrategy = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await strategyApi.deleteStrategy(id);
      // Remove from local state
      setStrategies((prev) => prev.filter((s) => s.id !== id));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete strategy';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    strategies,
    currentStrategy,
    loading,
    error,
    generateStrategy,
    fetchHistory,
    getStrategyById,
    deleteStrategy,
  };
};

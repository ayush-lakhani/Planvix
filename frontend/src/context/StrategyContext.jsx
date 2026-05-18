import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const StrategyContext = createContext();

export const StrategyProvider = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);
  const [error, setError] = useState(null);

  // WebSocket reference
  const wsRef = React.useRef(null);

  const connectWebSocket = useCallback((userId) => {
    if (wsRef.current) return;

    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    let wsUrl = "";
    
    try {
      const url = new URL(apiBase);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${url.host}/ws/strategy/${userId}`;
    } catch (e) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws/strategy/${userId}`;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[StrategyWS] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          setGenerationStatus(data.status);
          setProgress(data.progress);
          
          // Add to logs if status changes
          setAgentLogs(prev => [
            ...prev,
            {
              agent: 'AGENT',
              message: data.status,
              type: data.progress === 100 ? 'success' : 'agent',
              timestamp: new Date().toISOString()
            }
          ]);

          if (data.extra?.error) {
            setError(data.extra.error);
            setIsGenerating(false);
          }
        }
      } catch (e) {
        console.error('[StrategyWS] Parse error', e);
      }
    };

    ws.onclose = () => {
      console.log('[StrategyWS] Disconnected');
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error('[StrategyWS] Error', err);
    };
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const startGeneration = (userId) => {
    setIsGenerating(true);
    setGenerationStatus('Initializing Agents...');
    setProgress(5);
    setAgentLogs([{
      agent: 'SYSTEM',
      message: 'Initializing strategy engine...',
      type: 'info'
    }]);
    setError(null);
    connectWebSocket(userId);
  };

  const completeGeneration = (strategy) => {
    setIsGenerating(false);
    setGenerationStatus('Generation Complete!');
    setProgress(100);
    setCurrentStrategy(strategy);
    // disconnectWebSocket(); // Keep it open or close? Let's close for now
  };

  const failGeneration = (errMsg) => {
    setIsGenerating(false);
    setGenerationStatus('Generation Failed');
    setProgress(0);
    setError(errMsg);
    toast.error(errMsg || 'Strategy generation failed');
  };

  const resetGeneration = () => {
    setIsGenerating(false);
    setGenerationStatus('');
    setProgress(0);
    setError(null);
  };

  return (
    <StrategyContext.Provider value={{
      isGenerating,
      generationStatus,
      progress,
      currentStrategy,
      agentLogs,
      error,
      startGeneration,
      completeGeneration,
      failGeneration,
      resetGeneration
    }}>
      {children}
    </StrategyContext.Provider>
  );
};

export const useStrategy = () => {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error('useStrategy must be used within a StrategyProvider');
  }
  return context;
};

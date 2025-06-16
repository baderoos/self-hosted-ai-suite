import { useState, useEffect, useCallback } from 'react';
import { apiService, SystemStatus } from '../services/api';

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const systemStatus = await apiService.getSystemStatus();
      setStatus(systemStatus);
      setIsOnline(systemStatus.api_status === 'operational');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system status');
      setIsOnline(false);
      console.error('Failed to fetch system status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const health = await apiService.healthCheck();
      setIsOnline(health.status === 'operational');
      return health;
    } catch (err) {
      setIsOnline(false);
      throw err;
    }
  }, []);

  // Fetch status on mount and set up polling
  useEffect(() => {
    fetchSystemStatus();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, [fetchSystemStatus]);

  return {
    status,
    isLoading,
    error,
    isOnline,
    refresh: fetchSystemStatus,
    checkHealth,
    clearError: () => setError(null)
  };
}
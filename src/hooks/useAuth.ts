import { useState, useEffect, useCallback } from 'react';
import { apiService, User, LoginCredentials } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tokenResponse = await apiService.login(credentials);
      const userInfo = await apiService.getCurrentUser();
      
      setUser(userInfo);
      
      // Connect WebSocket after successful login
      apiService.connectWebSocket(userInfo.username);
      
      return tokenResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    setError(null);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (!apiService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      const userInfo = await apiService.getCurrentUser();
      setUser(userInfo);
      
      // Connect WebSocket if authenticated
      apiService.connectWebSocket(userInfo.username);
    } catch (err) {
      // Token is invalid, clear it
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const hasScope = useCallback((scope: string): boolean => {
    return user?.scopes.includes(scope) || false;
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    return hasScope('admin');
  }, [hasScope]);

  const canWrite = useCallback((): boolean => {
    return hasScope('write');
  }, [hasScope]);

  const canRead = useCallback((): boolean => {
    return hasScope('read');
  }, [hasScope]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    hasScope,
    isAdmin,
    canWrite,
    canRead,
    clearError: () => setError(null)
  };
}
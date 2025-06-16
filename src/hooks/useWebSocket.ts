import { useState, useEffect, useCallback } from 'react';
import { apiService, WebSocketMessage } from '../services/api';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    setLastMessage(message);
    setConnectionError(null);
    
    // Handle different message types
    switch (message.type) {
      case 'connection_established':
        setIsConnected(true);
        console.log('WebSocket connection established');
        break;
      case 'task_update':
        console.log('Task update received:', message.data);
        break;
      case 'file_uploaded':
        console.log('File uploaded:', message.data);
        break;
      case 'system_alert':
        console.log('System alert:', message.data);
        break;
    }
  }, []);

  const subscribeToMessages = useCallback((
    handler: (message: WebSocketMessage) => void
  ): (() => void) => {
    return apiService.onWebSocketMessage(handler);
  }, []);

  const subscribeToTask = useCallback((taskId: string) => {
    apiService.subscribeToTask(taskId);
  }, []);

  useEffect(() => {
    // Subscribe to WebSocket messages
    const unsubscribe = apiService.onWebSocketMessage(handleMessage);
    
    return unsubscribe;
  }, [handleMessage]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    subscribeToMessages,
    subscribeToTask
  };
}
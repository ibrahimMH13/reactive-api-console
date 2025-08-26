import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { websocketService } from '../services/websocket';
import { useAuth } from './useAuth';
import { addApiResult, setProcessing } from '../store/slices/apiSlice';
import { setConnectionStatus, setTyping, addNotification } from '../store/slices/uiSlice';
import { addMessage, updateMessageStatus } from '../store/slices/chatSlice';
import type { ApiResult } from '../types/api.type';
import type { RootState } from '../store';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const { getAccessToken, isAuthenticated } = useAuth();
  const connectionStatus = useSelector((state: RootState) => state.ui.connectionStatus);
  const listenersSetup = useRef(false);

  const setupEventListeners = useCallback(() => {
    
    if (listenersSetup.current) return;
    // Set up event listeners
    // Note: API response handling moved to Dashboard component to avoid duplicates
    // websocketService.onApiResponse is handled in Dashboard.tsx
    
    // We still need to handle command completion for chat messages
    websocketService.onApiResponse((data) => {
      // Update chat message status
      const messageId = `cmd-${data.timestamp}`;
      dispatch(updateMessageStatus({ 
        id: messageId, 
        status: 'success' 
      }));
      
      dispatch(setProcessing(false));
    });

    websocketService.onCommandStatus((data) => {      
      if (data?.status === 'processing') {
        dispatch(setProcessing(true));
      } else if (data?.status === 'error') {
        dispatch(setProcessing(false));
        dispatch(addNotification(`Error: ${data?.error}`));
      }
    });

    websocketService.onTypingIndicator((data) => {
      dispatch(setTyping(data.isProcessing));
    });

    listenersSetup.current = true;
  }, [dispatch]);

  const connectRef = useRef<() => Promise<void>>(null);
  const disconnectRef = useRef<() => void>(null);

  connectRef.current = async () => {
    if (!isAuthenticated) return;
    
    const token = getAccessToken();
    if (!token) return;

    try {
      dispatch(setConnectionStatus('connecting'));
      
      const socket = await websocketService.connect(token);
      
      setupEventListeners();
      
      dispatch(setConnectionStatus('connected'));
      dispatch(addNotification('Connected to server'));

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      dispatch(setConnectionStatus('error'));
      dispatch(addNotification('Failed to connect to server'));
    }
  };

  disconnectRef.current = () => {
    websocketService.disconnect();
    dispatch(setConnectionStatus('disconnected'));
    listenersSetup.current = false;
  };

  const connect = useCallback(() => connectRef.current?.(), []);
  const disconnect = useCallback(() => disconnectRef.current?.(), []);

  const sendCommand = useCallback((command: string) => {
    if (!websocketService.isConnected()) {
      dispatch(addNotification('Not connected to server'));
      return;
    }

    try {
      // Add message to chat
      const timestamp = Date.now();
      const messageId = `cmd-${timestamp}`;
      
      dispatch(addMessage({
        id: messageId,
        command,
        timestamp,
        status: 'sending'
      }));

      // Send via WebSocket
      websocketService.sendCommand(command);
      
      // Update message status
      dispatch(updateMessageStatus({
        id: messageId,
        status: 'processing'
      }));
      
    } catch (error) {
      console.error('Failed to send command:', error);
      dispatch(addNotification('Failed to send command'));
    }
  }, [dispatch]);

  // Auto-connect when authenticated
  useEffect(() => {
    const token = getAccessToken();
    if (isAuthenticated && token) {
      connect();
    } else if (!isAuthenticated) {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    connect,
    disconnect,
    sendCommand,
    isConnected: connectionStatus === 'connected',
    connectionState: connectionStatus,
  };
};
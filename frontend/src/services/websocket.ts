import { io, Socket } from 'socket.io-client';
import type { WebSocketEvents } from '../types/WebSocket.type';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  connect(accessToken: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.token = accessToken;
      this.connectionState = 'connecting';
      
      const wsUrl = import.meta.env.VITE_WS_URL;
      console.log('🔌 Connecting to WebSocket:', wsUrl, 'with path: /api/v1/socket.io/');
      
      this.socket = io(wsUrl, {
        path: '/api/v1/socket.io/',
        auth: {
          token: accessToken
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
        this.reconnectAttempts = 0;
        this.connectionState = 'connected';
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        this.connectionState = 'disconnected';
      });

      this.socket.on('connectError', (error) => {
        console.error('WebSocket connection error:', error);
        this.connectionState = 'error';
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.connectionState = 'connecting';
          console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        } else {
          reject(error);
        }
      });

      // Handle authentication errors
      this.socket.on('commandStatus', (data) => {
        if (data.status === 'error' && data.error?.includes('Authentication')) {
          console.error('Authentication failed via WebSocket');
          this.disconnect();
          reject(new Error('WebSocket authentication failed'));
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = 'disconnected';
  }

  sendCommand(command: string) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    console.log('Sending command:', command);
    this.socket.emit('chatCommand', {
      command,
      timestamp: Date.now()
    });
  }

  // Event listeners
  onApiResponse(callback: (data: WebSocketEvents['apiResponse']) => void) {
    if (this.socket) {
      this.socket.on('apiResponse', callback);
    }
  }

  onCommandStatus(callback: (data: WebSocketEvents['commandStatus']) => void) {
    if (this.socket) {
      this.socket.on('commandStatus', callback);
    }
  }

  onTypingIndicator(callback: (data: WebSocketEvents['typingIndicator']) => void) {
    if (this.socket) {
      this.socket.on('typingIndicator', callback);
    }
  }

  // Remove listeners
  offApiResponse(callback?: (data: WebSocketEvents['apiResponse']) => void) {
    console.log(callback);
    this.socket?.off('apiResponse', callback);
  }

  offCommandStatus(callback?: (data: WebSocketEvents['commandStatus']) => void) {
    this.socket?.off('commandStatus', callback);
  }

  offTypingIndicator(callback?: (data: WebSocketEvents['typingIndicator']) => void) {
    this.socket?.off('typingIndicator', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getConnectionState(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.connectionState;
  }
}

export const websocketService = new WebSocketService();
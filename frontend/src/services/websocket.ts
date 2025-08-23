import { io, Socket } from 'socket.io-client';
import { WebSocketEvents } from '../types/WebSocket.type';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(accessToken: string) {
    this.token = accessToken;
    
    this.socket = io(import.meta?.env?.VITE_WS_URL, {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendCommand(command: string) {
    if (!this.socket) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('chat_command', {
      command,
      timestamp: Date.now()
    });
  }

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

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const websocketService = new WebSocketService();
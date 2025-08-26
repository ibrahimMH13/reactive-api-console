// services/websocket.ts
import { io, Socket } from 'socket.io-client';

export interface ApiResponseData {
  api: string;
  result: any;
  command?: string;
  timestamp: number;
}

export interface ApiErrorData {
  api: string;
  error: string;
  command?: string;
  timestamp: number;
}

export interface CommandStatusData {
  api: string;
  status: 'processing' | 'success' | 'error';
  command?: string;
  error?: string;
  timestamp: number;
}

export interface ConnectionStatusData {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  reason?: string;
  error?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  
  // Internal event emitter for consistency
  private eventHandlers: Record<string, Function[]> = {};

  connect(accessToken: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.token = accessToken;
      this.connectionState = 'connecting';
      this.emit('connectionStatus', { status: 'connecting' });
      
      const wsUrl = import.meta.env.VITE_WS_URL;
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.socket = io(wsUrl, {
        path: '/api/v1/socket.io/',
        auth: {
          token: accessToken
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // Handle reconnection manually
      });

      this.setupEventListeners();

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.reconnectAttempts = 0;
        this.connectionState = 'connected';
        this.emit('connectionStatus', { status: 'connected' });
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        this.connectionState = 'disconnected';
        this.emit('connectionStatus', { status: 'disconnected', reason });
        
        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.handleReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.connectionState = 'error';
        this.emit('connectionStatus', { status: 'error', error: error.message });
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnect();
        } else {
          reject(error);
        }
      });

      // Timeout the connection attempt
      setTimeout(() => {
        if (this.connectionState === 'connecting') {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 15000);
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // API Response handler
    this.socket.on('apiResponse', (data: ApiResponseData) => {
      console.log('API Response received:', data);
      this.emit('apiResponse', {
        ...data,
        timestamp: data.timestamp || Date.now()
      });
    });

    // Command Status handler
    this.socket.on('commandStatus', (data: CommandStatusData) => {
      console.log('Command Status:', data);
      
      // Emit as commandStatus for consistency with backend
      this.emit('commandStatus', {
        ...data,
        timestamp: data.timestamp || Date.now()
      });

      // Also emit specific error if status is error
      if (data.status === 'error') {
        this.emit('apiError', {
          api: data.api,
          error: data.error || 'Command failed',
          command: data.command,
          timestamp: data.timestamp || Date.now()
        });
      }
    });

    // Typing Indicator handler
    this.socket.on('typingIndicator', (data: { isProcessing: boolean }) => {
      this.emit('typingIndicator', data);
    });

    // Handle authentication errors
    this.socket.on('commandStatus', (data) => {
      if (data.status === 'error' && data.error?.includes('Authentication')) {
        console.error('Authentication failed via WebSocket');
        this.connectionState = 'error';
        this.emit('connectionStatus', { status: 'error', error: 'Authentication failed' });
        this.disconnect();
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.connectionState = 'connecting';
      this.emit('connectionStatus', { status: 'connecting' });
      
      console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token).catch(() => {
            // Reconnect failed, will try again if under limit
          });
        }
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionState = 'error';
      this.emit('connectionStatus', { status: 'error', error: 'Max reconnection attempts reached' });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = 'disconnected';
    this.token = null;
    this.reconnectAttempts = 0;
    this.emit('connectionStatus', { status: 'disconnected' });
  }

  sendCommand(command: string): boolean {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      this.emit('apiError', {
        api: 'system',
        error: 'WebSocket not connected. Please check your connection.',
        command,
        timestamp: Date.now()
      });
      return false;
    }

    console.log('Sending command:', command);
    this.socket.emit('chatCommand', {
      command,
      timestamp: Date.now()
    });

    // Save search entry to backend (async, don't wait for it)
    this.saveSearchEntryAsync(command).catch(error => {
      console.warn('Failed to save search entry:', error);
    });

    return true;
  }

  private async saveSearchEntryAsync(command: string): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { preferenceSyncService } = await import('./preferenceSync');
      
      // Parse command to extract API type - simple parsing
      const lowerCommand = command.toLowerCase();
      let api = 'custom'; // default
      
      if (lowerCommand.includes('weather') || lowerCommand.includes('get weather')) api = 'weather';
      else if (lowerCommand.includes('cat') || lowerCommand.includes('fact')) api = 'catfacts';
      else if (lowerCommand.includes('github') || lowerCommand.includes('search github')) api = 'github';
      else if (lowerCommand.includes('chuck') || lowerCommand.includes('norris') || lowerCommand.includes('joke')) api = 'chucknorris';
      else if (lowerCommand.includes('bored') || lowerCommand.includes('activity')) api = 'bored';
      
      await preferenceSyncService.saveSearchEntry(command, api);
    } catch (error) {
      // Silent fail - this is not critical to the main functionality
      console.debug('Search entry save failed:', error);
    }
  }

  // Internal event system for consistency
  private emit(event: string, data: any) {
    const handlers = this.eventHandlers[event] || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  private subscribe(event: string, handler: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  private unsubscribe(event: string, handler?: Function) {
    if (!handler) {
      // Remove all handlers for this event
      this.eventHandlers[event] = [];
      return;
    }
    
    const handlers = this.eventHandlers[event] || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  // Public event subscription methods (consistent with backend camelCase)
  onApiResponse(handler: (data: ApiResponseData) => void) {
    this.subscribe('apiResponse', handler);
  }

  offApiResponse(handler?: (data: ApiResponseData) => void) {
    this.unsubscribe('apiResponse', handler);
  }

  onApiError(handler: (data: ApiErrorData) => void) {
    this.subscribe('apiError', handler);
  }

  offApiError(handler?: (data: ApiErrorData) => void) {
    this.unsubscribe('apiError', handler);
  }

  onCommandStatus(handler: (data: CommandStatusData) => void) {
    this.subscribe('commandStatus', handler);
  }

  offCommandStatus(handler?: (data: CommandStatusData) => void) {
    this.unsubscribe('commandStatus', handler);
  }

  onConnectionStatus(handler: (data: ConnectionStatusData) => void) {
    this.subscribe('connectionStatus', handler);
  }

  offConnectionStatus(handler?: (data: ConnectionStatusData) => void) {
    this.unsubscribe('connectionStatus', handler);
  }

  onTypingIndicator(handler: (data: { isProcessing: boolean }) => void) {
    this.subscribe('typingIndicator', handler);
  }

  offTypingIndicator(handler?: (data: { isProcessing: boolean }) => void) {
    this.unsubscribe('typingIndicator', handler);
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getConnectionState(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.connectionState;
  }

  // For debugging
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Force reconnect (useful for retry functionality)
  forceReconnect(): Promise<Socket> {
    this.disconnect();
    if (this.token) {
      return this.connect(this.token);
    }
    return Promise.reject(new Error('No token available for reconnection'));
  }
}

export const websocketService = new WebSocketService();
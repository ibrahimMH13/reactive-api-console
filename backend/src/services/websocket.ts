import { Server, Socket } from 'socket.io';
import { verifySocketToken } from '../auth/jwt';
import { commandParser } from '../utils/commandParser';
import { repositoryManager } from '../services/repositoryManager';
import { WebSocketEvents } from '../types';

export class WebSocketService {
  private io: Server;
  private userSockets = new Map<string, Socket>();

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      console.log('New connection attempt:', socket.id);

      try {
        // Authenticate socket connection
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('No authentication token provided');
        }

        const user = await verifySocketToken(token);
        socket.data.user = user;
        this.userSockets.set(user.id, socket);

        console.log('User authenticated:', user.email, socket.id);

        // Send welcome message
        socket.emit('commandStatus', {
          status: 'success',
          message: `Connected as ${user.email}`
        });

        // Handle chat commands
        socket.on('chat_command', async (data: WebSocketEvents['chat_command']) => {
          await this.handleChatCommand(socket, data);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
          console.log('User disconnected:', user.email, socket.id);
          this.userSockets.delete(user.id);
        });
        
        //test socket
        socket.on('ping', () => {
          socket.emit('pong', { message: 'Server is responding!', user: user.email });
        });

      } catch (error: any) {
        console.error('Socket authentication failed:', error.message);
        socket.emit('commandStatus', {
          status: 'error',
          error: 'Authentication failed'
        });
        socket.disconnect();
      }
    });
  }

  private async handleChatCommand(socket: Socket, data: WebSocketEvents['chat_command']) {
    const user = socket.data.user;
    console.log(`Command from ${user.email}:`, data.command);

    try {
      // Send processing status
      socket.emit('command_status', {
        status: 'processing'
      });

      socket.emit('typing_indicator', {
        isProcessing: true
      });

      // Parse and execute command
      const parsedCommand = commandParser.parseCommand(data.command);
      console.log('Parsed command:', parsedCommand);

      const result = await commandParser.executeCommand(parsedCommand, user.id);

      // Save to search history (if it's an external API call)
      if (parsedCommand.api !== 'custom') {
        repositoryManager.addSearchEntry(user.id, {
          query: data.command,
          api: parsedCommand.api,
          timestamp: Date.now()
        });
      }

      // Send successful response
      const response: WebSocketEvents['api_response'] = {
        command: data.command,
        result: result,
        api: parsedCommand.api,
        timestamp: Date.now()
      };

      socket.emit('api_response', response);
      socket.emit('command_status', {
        status: 'success'
      });

    } catch (error: any) {
      console.error('Command execution failed:', error.message);
      
      socket.emit('command_status', {
        status: 'error',
        error: error.message
      });
    } finally {
      socket.emit('typing_indicator', {
        isProcessing: false
      });
    }
  }

  public getUserSocket(userId: string): Socket | undefined {
    return this.userSockets.get(userId);
  }
}
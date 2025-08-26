import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import routes from './routes/index';
import { WebSocketService } from './services/websocket';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: '/api/v1/socket.io/',
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000"
}));
app.use(express.json());

// Health check for API routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API routes are healthy',
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      user: '/api/v1/user/*',
      searches: '/api/v1/search/*',
      providers: '/api/v1/provider/*'
    }
  });
});


// Provider routes for testing external APIs
app.use('/api', routes);

// Initialize WebSocket service
const webSocketService = new WebSocketService(io);

// Start server`
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server ready`);
});

export default app;
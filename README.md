# Reactive API Console

A full-stack TypeScript application that provides a chat-based interface for interacting with multiple APIs in real-time. Built with React frontend, Node.js backend, WebSocket communication, and comprehensive testing.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd reactive-api-console

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (new terminal)
cd ../frontend  
yarn install
yarn dev

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

The Reactive API Console is a modern web application that allows users to interact with multiple external APIs through a conversational interface. Users can send commands like "get weather Berlin" or "chuck norris joke" and receive real-time responses in organized cards.

### Key Capabilities

- **Real-time Communication** - WebSocket-based instant responses
- **Multi-API Support** - Weather, Cat Facts, Chuck Norris, GitHub, Bored API
- **User Management** - Authentication, preferences, search history
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Themes** - User-configurable theming
- **Comprehensive Testing** - Unit tests and E2E testing with Cypress

## ✨ Features

### Frontend Features
- 🎨 **Modern React UI** - Built with React 19, TypeScript, and Tailwind CSS
- 🌓 **Theme Toggle** - Dark/light mode with system preference detection
- 📱 **Responsive Design** - Mobile-first responsive layout
- 🔌 **Real-time Updates** - WebSocket integration with Socket.IO
- 🎛️ **API Management** - Toggle APIs on/off with instant feedback
- 🔍 **Search & Filter** - Global filtering across all API results
- 📜 **Search History** - Persistent command history with pagination
- 🔐 **Authentication** - AWS Cognito OIDC integration
- ⚡ **State Management** - Redux Toolkit for predictable state
- 🧪 **E2E Testing** - Comprehensive Cypress test suite

### Backend Features
- 🚀 **Node.js API** - Express.js with TypeScript
- 🔌 **WebSocket Server** - Socket.IO for real-time communication
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🗄️ **SQLite Database** - Local data persistence
- 🌐 **External APIs** - Integration with 6+ external services
- 📊 **User Preferences** - Theme and API toggle persistence
- 📝 **Search History** - Command history with timestamps
- 🧪 **Unit Testing** - Jest test suite with high coverage
- 📡 **Health Monitoring** - Built-in health check endpoints

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit
- **Real-time:** Socket.IO Client
- **Authentication:** React OIDC Context (AWS Cognito)
- **Routing:** React Router v6
- **Build Tool:** Vite
- **Testing:** Jest, React Testing Library, Cypress
- **Package Manager:** Yarn

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Real-time:** Socket.IO
- **Database:** SQLite3
- **Authentication:** JWT tokens
- **Testing:** Jest
- **API Client:** Axios
- **Development:** Nodemon, ts-node
- **Package Manager:** npm

### External APIs
- **Weather:** OpenWeatherMap API
- **Cat Facts:** Cat Facts API
- **Chuck Norris:** Chuck Norris Jokes API
- **GitHub:** GitHub Users API  
- **Activity:** Bored API
- **Custom:** Internal preferences and history

## 📁 Project Structure

```
reactive-api-console/
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── chat/         # Chat interface
│   │   │   ├── panels/       # API result cards
│   │   │   └── ui/           # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API and WebSocket services
│   │   ├── store/            # Redux store and slices
│   │   ├── types/            # TypeScript definitions
│   │   └── utils/            # Utility functions
│   ├── cypress/              # E2E tests
│   │   ├── e2e/             # Test specifications
│   │   ├── fixtures/        # Test data
│   │   └── support/         # Custom commands
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── auth/            # JWT authentication
│   │   ├── providers/       # External API providers
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── types.ts         # TypeScript definitions
│   ├── tests/               # Unit tests
│   └── package.json
└── README.md               # This file
```

## 🔧 Installation

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** and **yarn** package managers
- **Git** for version control

### Full Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reactive-api-console
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Environment configuration
   cp .env.example .env
   ```
   
   Edit `backend/.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   JWT_SECRET=your-jwt-secret-key-here
   DB_HOST=./db.sqlite
   
   # Optional: External API keys
   OPENWEATHER_API_KEY=your-openweather-key
   GITHUB_TOKEN=your-github-token
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   yarn install
   
   # Environment configuration
   cp .env.example .env.local
   ```
   
   Edit `frontend/.env.local`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_WS_URL=http://localhost:3000
   
   # AWS Cognito Configuration
   VITE_COGNITO_DOMAIN=your-cognito-domain.auth.region.amazoncognito.com
   VITE_COGNITO_CLIENT_ID=your-cognito-client-id
   VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
   ```

4. **Start Development Servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   # Server running on http://localhost:3000
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend  
   yarn dev
   # App running on http://localhost:5173
   ```

5. **Verify Installation**
   - Visit http://localhost:5173 (frontend)
   - Visit http://localhost:3000/health (backend health check)

## ⚙️ Configuration

### Backend Configuration

#### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `CORS_ORIGIN` | Frontend URL | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `DB_HOST` | SQLite database path | No |
| `OPENWEATHER_API_KEY` | Weather API key | No* |
| `GITHUB_TOKEN` | GitHub API token | No* |

*Some APIs work without keys but may have rate limits

#### Database Setup
SQLite tables are automatically created:
- `user_preferences` - User settings and API toggles
- `search_history` - Command history with timestamps

### Frontend Configuration

#### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_WS_URL` | WebSocket URL | Yes |
| `VITE_COGNITO_DOMAIN` | AWS Cognito domain | Yes |
| `VITE_COGNITO_CLIENT_ID` | Cognito client ID | Yes |
| `VITE_COGNITO_REDIRECT_URI` | OAuth redirect URI | Yes |

## 🎮 Usage

### Basic Commands

The application supports natural language commands:

| Command | Description | Example |
|---------|-------------|---------|
| Weather | Get weather for a city | `get weather Berlin` |
| Cat Facts | Random cat fact | `get cat fact` |
| Chuck Norris | Chuck Norris joke | `chuck norris joke` |
| Activity | Bored API activity | `get activity` |
| GitHub | Search GitHub users | `search github john` |
| Preferences | Get user preferences | `get my preferences` |
| History | View search history | `get my history` |

### User Interface

#### Main Components
- **Chat Input** - Enter commands with example suggestions
- **API Cards** - Display results from each API
- **Sidebar** - Toggle APIs on/off and theme switching
- **Search History** - View and filter past commands
- **Global Filter** - Filter results across all cards

#### Features
- **Theme Toggle** - Switch between light and dark modes
- **API Management** - Enable/disable APIs individually
- **Real-time Responses** - Instant feedback via WebSocket
- **Error Handling** - Clear error messages and retry options
- **Responsive Design** - Works on all device sizes

### Authentication Flow

1. **Login** - Click "Sign In with AWS Cognito"
2. **OAuth** - Redirected to Cognito hosted UI
3. **Callback** - Return to app with tokens
4. **WebSocket** - Automatic connection with JWT
5. **Preferences** - Load saved settings and history

## 📡 API Documentation

### WebSocket Events

#### Client → Server
- `chatCommand` - Send API command
- `ping` - Test connection

#### Server → Client
- `apiResponse` - API results
- `commandStatus` - Command status updates
- `typingIndicator` - Processing state

### REST Endpoints

#### Health Check
```http
GET /health
Response: {"status": "OK", "timestamp": "..."}
```

#### User Preferences
```http
GET /api/user/preferences
Authorization: Bearer <jwt-token>

POST /api/user/preferences
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "theme": "dark",
  "activeAPIs": {"weather": true, "catfacts": false},
  "notifications": true
}
```

### External API Integrations

- **OpenWeatherMap** - Current weather data
- **Cat Facts API** - Random cat facts
- **Chuck Norris API** - Random jokes
- **GitHub API** - User search
- **Bored API** - Activity suggestions

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Coverage:**
- Unit tests for all services
- Route testing with supertest
- Command parser validation
- Database operations

### Frontend Testing

#### Unit Tests
```bash
cd frontend

# Run Jest tests
yarn test

# Watch mode  
yarn test:watch

# Coverage report
yarn test:coverage
```

#### E2E Testing with Cypress
```bash
# Interactive mode
yarn cypress:open

# Headless mode
yarn test:e2e

# Specific test
yarn cypress:run --spec "cypress/e2e/00-simple-test.cy.ts"
```

**E2E Test Coverage:**
- ✅ Authentication flow
- ✅ API command testing
- ✅ Theme switching
- ✅ API toggles
- ✅ Search history
- ✅ Responsive design
- ✅ Error handling

### Test Structure

```
backend/tests/          # Backend unit tests
frontend/src/**/__tests__/  # Frontend unit tests  
frontend/cypress/e2e/   # E2E test specifications
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
yarn build
yarn preview
```

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Environment Setup

**Production backend `.env`:**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=your-production-secret
DB_HOST=/data/production.sqlite
```

**Production frontend `.env.production`:**
```env
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=https://api.your-domain.com
VITE_COGNITO_DOMAIN=your-prod-cognito-domain
VITE_COGNITO_CLIENT_ID=your-prod-client-id
VITE_COGNITO_REDIRECT_URI=https://your-domain.com/callback
```

## 📝 Scripts

### Backend Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Production server |
| `npm test` | Run test suite |

### Frontend Scripts  
| Command | Description |
|---------|-------------|
| `yarn dev` | Development server |
| `yarn build` | Production build |
| `yarn preview` | Preview production build |
| `yarn test` | Run unit tests |
| `yarn test:e2e` | Run E2E tests |
| `yarn cypress:open` | Open Cypress UI |

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173  
lsof -ti:5173 | xargs kill -9
```

**WebSocket connection failed:**
- Verify backend is running on correct port
- Check CORS_ORIGIN matches frontend URL
- Ensure JWT token is valid

**Authentication issues:**
- Verify AWS Cognito configuration
- Check redirect URIs match exactly
- Confirm client ID and domain are correct

**Database errors:**
```bash
# Reset database
rm backend/db.sqlite
cd backend && npm run dev
```

### Debug Mode

**Backend debugging:**
```bash
DEBUG=* npm run dev
DEBUG=socket.io:* npm run dev
```

**Frontend debugging:**
- Open browser DevTools
- Check Network tab for API calls
- Monitor Console for errors
- Use Redux DevTools extension

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch:**
   ```bash
   git checkout -b feature/new-api-integration
   ```
3. **Make changes with tests**
4. **Run test suites:**
   ```bash
   # Backend
   cd backend && npm test
   
   # Frontend  
   cd frontend && yarn test && yarn test:e2e
   ```
5. **Submit pull request**

### Code Standards

- **TypeScript** for all new code
- **ESLint** for code style
- **Prettier** for formatting
- **Jest** for unit tests
- **Cypress** for E2E tests
- **Conventional commits** for commit messages

### Adding New APIs

1. **Create provider** in `backend/src/providers/`
2. **Add command parsing** in `commandParser.ts`
3. **Create frontend card** in `frontend/src/components/panels/`
4. **Add Redux slice** for state management
5. **Write tests** for all components
6. **Update documentation**

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Restricted cross-origin requests
- **Input Validation** - Sanitized command processing
- **Environment Secrets** - API keys in environment variables
- **HTTPS Ready** - Production-ready SSL configuration
- **Request Timeouts** - 5-second timeout for external API calls

## 🙋 Support

For support and questions:

- **GitHub Issues:** [Create an issue](https://github.com/ibrahimMH13/reactive-api-console/issues)

---

Built with ❤️ using React, Node.js, and TypeScript
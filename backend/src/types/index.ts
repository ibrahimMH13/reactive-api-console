export type User = {
    id: string;
    email: string;
    name?: string;
    groups?: string[];
  }
  
  export type UserPreferences = {
    theme: 'light' | 'dark';
    activeAPIs: string[];
    notifications: boolean;
  }
  
  export type SearchEntry = {
    id: string;
    query: string;
    api: string;
    timestamp: number;
    userId: string;
  }
  
  export type ChatCommand  = {
    command: string;
    timestamp: number;
  }
  
  export type ApiResponse = {
    command: string;
    result: any;
    api: string;
    timestamp: number;
  }
  
  export type WebSocketEvents  ={
    // Client to Server
    chatCommand: ChatCommand;
    // Server to Client
    apiResponse: ApiResponse;
    commandStatus: {
      status: 'processing' | 'success' | 'error';
      error?: string;
    };
    typingIndicator: {
      isProcessing: boolean;
    };
  }
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
    chat_command: ChatCommand;
    // Server to Client
    api_response: ApiResponse;
    command_status: {
      status: 'processing' | 'success' | 'error';
      error?: string;
    };
    typing_indicator: {
      isProcessing: boolean;
    };
  }
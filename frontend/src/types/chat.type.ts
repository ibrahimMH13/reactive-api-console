export type ChatMessage = {
    id: string;
    command: string;
    timestamp: number;
    status: 'sending' | 'processing' | 'success' | 'error';
    error?: string;
  }
  
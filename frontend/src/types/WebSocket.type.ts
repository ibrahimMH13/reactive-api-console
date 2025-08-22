export type WebSocketEvents = {
  chatCommand: {
    command: string;
    timestamp: number;
  };
  apiResponse: {
    command: string;
    result: unknown;
    api: string;
    timestamp: number;
  };
  commandStatus: {
    status: "processing" | "success" | "error";
    error?: string;
  };
  typingIndicator: {
    isProcessing: boolean;
  };
};

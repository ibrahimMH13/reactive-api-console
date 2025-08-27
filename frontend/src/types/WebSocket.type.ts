export type WebSocketEvents = {
  chat_command: {
    command: string;
    timestamp: number;
  };
  api_response: {
    command: string;
    result: unknown;
    api: string;
    timestamp: number;
  };
  command_status: {
    status: "processing" | "success" | "error";
    error?: string;
  };
  typing_indicator: {
    isProcessing: boolean;
  };
};

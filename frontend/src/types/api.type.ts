export type ApiResult = {
  id: string;
  api: string;
  command: string;
  data: unknown;
  timestamp: number;
};

export type ApiConfig = {
  id: string;
  name: string;
  active: boolean;
  icon: string;
  description: string;
};

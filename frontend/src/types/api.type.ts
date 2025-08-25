type ApiResponseData = {
  status: 'success' | 'error' | 'processing';
  [key: string]: unknown;
}

export type ApiResult = {
  id: string;
  api: string;
  command: string;
  data: ApiResponseData;
  timestamp: number;
};

export type ApiConfig = {
  id: string;
  name: string;
  active: boolean;
  icon: string;
  description: string;
};

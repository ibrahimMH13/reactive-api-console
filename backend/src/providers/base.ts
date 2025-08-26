import axios, { AxiosInstance } from 'axios';

export abstract class BaseProvider {
  protected client: AxiosInstance;
  protected baseURL: string;

  constructor(baseURL: string, timeout: number = 5000) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Reactive-API-Console/1.0'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Provider Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`Provider Response: ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`Provider Error: ${error.config?.url} - ${error.message}`);
        return Promise.reject(new Error(`Provider call failed: ${error.message}`));
      }
    );
  }

  protected addTimestamp(data: any) {
    return {
      ...data,
      timestamp: new Date().toISOString()
    };
  }
}
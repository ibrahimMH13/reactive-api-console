// API service for backend communication
import { getBackendUrl } from '../utils/env';

const API_BASE_URL = `${getBackendUrl()}/api/v1`;

export interface UserPreferences {
  theme: 'light' | 'dark';
  activeAPIs: Record<string, boolean>; // {"weather": true, "catfacts": false, etc.}
  notifications: boolean;
}

export interface SearchEntry {
  id?: string;
  query: string;
  api: string;
  timestamp: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : '',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log('@@@@@@@@@@--API_BASE_URL----------->',API_BASE_URL)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await this.request<ApiResponse<UserPreferences>>('/user/preferences');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get preferences');
    }
    return response.data;
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
    const response = await this.request<ApiResponse<UserPreferences>>('/user/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to save preferences');
    }
    return response.data;
  }

  // Search History
  async getSearchHistory(): Promise<SearchEntry[]> {
    return this.request<SearchEntry[]>('/search/searches/history');
  }

  async saveSearchEntry(entry: Omit<SearchEntry, 'id'>): Promise<SearchEntry> {
    return this.request<SearchEntry>('/search/searches', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async deleteSearchEntry(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/search/searches/${id}`, {
      method: 'DELETE',
    });
  }

  // User Profile
  async getUserProfile(): Promise<{ id: string; email: string; name: string }> {
    const response = await this.request<ApiResponse<{ id: string; email: string; name: string }>>('/user/profile');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get profile');
    }
    return response.data;
  }
}

export const apiService = new ApiService();
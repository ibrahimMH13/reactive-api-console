// import.meta.env is already mocked in setupTests.ts
import { apiService } from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    apiService.setToken(null);
  });

  describe('setToken', () => {
    it('should set authentication token', () => {
      const token = 'test-token';
      apiService.setToken(token);
      
      // Test by making a request and checking headers
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });
      
      apiService.getUserPreferences();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('getUserPreferences', () => {
    it('should fetch user preferences successfully', async () => {
      const mockPreferences = {
        theme: 'dark' as const,
        activeAPIs: { weather: true, catfacts: false },
        notifications: true,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockPreferences,
        }),
      });

      const result = await apiService.getUserPreferences();
      
      expect(result).toEqual(mockPreferences);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/preferences'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw error when API response is not successful', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: 'User not found',
        }),
      });

      await expect(apiService.getUserPreferences()).rejects.toThrow('User not found');
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiService.getUserPreferences()).rejects.toThrow('API Error: 404 Not Found');
    });
  });

  describe('saveUserPreferences', () => {
    it('should save user preferences successfully', async () => {
      const preferences = {
        theme: 'light' as const,
        activeAPIs: { weather: true, catfacts: true },
        notifications: false,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: preferences,
        }),
      });

      const result = await apiService.saveUserPreferences(preferences);
      
      expect(result).toEqual(preferences);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/preferences'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(preferences),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw error when save fails', async () => {
      const preferences = {
        theme: 'light' as const,
        activeAPIs: { weather: true },
        notifications: true,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: 'Invalid data',
        }),
      });

      await expect(apiService.saveUserPreferences(preferences))
        .rejects.toThrow('Invalid data');
    });
  });

  describe('getSearchHistory', () => {
    it('should fetch search history successfully', async () => {
      const mockHistory = [
        {
          id: '1',
          query: 'weather Berlin',
          api: 'weather',
          timestamp: Date.now(),
        },
        {
          id: '2',
          query: 'cat facts',
          api: 'catfacts',
          timestamp: Date.now() - 1000,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHistory),
      });

      const result = await apiService.getSearchHistory();
      
      expect(result).toEqual(mockHistory);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/searches/history'),
        expect.any(Object)
      );
    });

    it('should handle empty search history', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await apiService.getSearchHistory();
      
      expect(result).toEqual([]);
    });
  });

  describe('saveSearchEntry', () => {
    it('should save search entry successfully', async () => {
      const entry = {
        query: 'weather London',
        api: 'weather',
        timestamp: Date.now(),
      };

      const mockResponse = {
        id: '123',
        ...entry,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.saveSearchEntry(entry);
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/searches'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(entry),
        })
      );
    });
  });

  describe('deleteSearchEntry', () => {
    it('should delete search entry successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiService.deleteSearchEntry('123');
      
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/searches/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockProfile,
        }),
      });

      const result = await apiService.getUserProfile();
      
      expect(result).toEqual(mockProfile);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(apiService.getUserPreferences()).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(apiService.getUserPreferences())
        .rejects.toThrow('API Error: 500 Internal Server Error');
    });

    it('should include authorization header when token is set', async () => {
      const token = 'test-token';
      apiService.setToken(token);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await apiService.getUserPreferences();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      );
    });

    it('should not include authorization header when token is null', async () => {
      apiService.setToken(null);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await apiService.getUserPreferences();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': '',
          }),
        })
      );
    });
  });
});
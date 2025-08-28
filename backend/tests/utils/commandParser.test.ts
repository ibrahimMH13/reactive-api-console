import { CommandParser } from '../../src/utils/commandParser';
import { repositoryManager } from '../../src/services/repositoryManager';

// Mock the provider service
jest.mock('../../src/providers/index', () => ({
  providerService: {
    getWeather: jest.fn(),
    getCatFact: jest.fn(),
    searchGitHubUsers: jest.fn(),
    getChuckNorrisJoke: jest.fn(),
    getBoredActivity: jest.fn()
  }
}));

import { providerService } from '../../src/providers/index';

describe('CommandParser', () => {
  let parser: CommandParser;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    parser = new CommandParser();
    jest.clearAllMocks();
  });

  describe('parseCommand', () => {
    it('should parse weather commands', () => {
      const commands = [
        'get weather Berlin',
        'weather in Tokyo',
        'weather for London'
      ];

      commands.forEach(command => {
        const result = parser.parseCommand(command);
        expect(result.api).toBe('weather');
        expect(result.action).toBe('get');
        expect(result.originalCommand).toBe(command);
      });
    });

    it('should extract city from weather commands', () => {
      const testCases = [
        { command: 'get weather Berlin', expectedCity: 'berlin' },
        { command: 'weather in Tokyo', expectedCity: 'tokyo' },
        { command: 'weather for New York', expectedCity: 'new york' },
        { command: 'weather', expectedCity: 'berlin' } // default
      ];

      testCases.forEach(({ command, expectedCity }) => {
        const result = parser.parseCommand(command);
        expect(result.params[0]).toBe(expectedCity);
      });
    });

    it('should parse cat fact commands', () => {
      const commands = ['get cat fact', 'cat fact', 'get cat'];
      
      commands.forEach(command => {
        const result = parser.parseCommand(command);
        expect(result.api).toBe('catfacts');
        expect(result.action).toBe('get');
        expect(result.params).toEqual([]);
      });
    });

    it('should parse GitHub commands', () => {
      const result = parser.parseCommand('search github john');
      expect(result.api).toBe('github');
      expect(result.action).toBe('search');
      expect(result.params[0]).toBe('john');
    });

    it('should parse Chuck Norris commands', () => {
      const testCases = [
        { command: 'get chuck joke', expected: [] },
        { command: 'chuck norris car', expected: ['norris car'] }
      ];

      testCases.forEach(({ command, expected }) => {
        const result = parser.parseCommand(command);
        expect(result.api).toBe('chucknorris');
        expect(result.params).toEqual(expected);
      });
    });

    it('should parse custom backend commands', () => {
      const testCases = [
        { command: 'get my preferences', action: 'preferences' },
        { command: 'get history', action: 'history' }
      ];

      testCases.forEach(({ command, action }) => {
        const result = parser.parseCommand(command);
        expect(result.api).toBe('custom');
        expect(result.action).toBe(action);
      });
    });

    it('should handle unknown commands', () => {
      const result = parser.parseCommand('do something random');
      expect(result.api).toBe('unknown');
      expect(result.action).toBe('unknown');
    });
  });

  describe('executeCommand', () => {
    it('should execute weather command', async () => {
      const mockWeatherData = {
        location: 'Berlin',
        temperature: '15°C',
        condition: 'Sunny'
      };

      (providerService.getWeather as jest.Mock).mockResolvedValue(mockWeatherData);

      const parsed = parser.parseCommand('get weather Berlin');
      const result = await parser.executeCommand(parsed, testUserId);

      expect(providerService.getWeather).toHaveBeenCalledWith('berlin');
      expect(result).toEqual(mockWeatherData);
    });

    it('should execute cat fact command', async () => {
      const mockCatFact = {
        fact: 'Cats are awesome',
        length: 16
      };

      (providerService.getCatFact as jest.Mock).mockResolvedValue(mockCatFact);

      const parsed = parser.parseCommand('get cat fact');
      const result = await parser.executeCommand(parsed, testUserId);

      expect(providerService.getCatFact).toHaveBeenCalled();
      expect(result).toEqual(mockCatFact);
    });

    it('should execute GitHub search command', async () => {
      const mockUsers = [{ login: 'john', name: 'John Doe' }];
      (providerService.searchGitHubUsers as jest.Mock).mockResolvedValue(mockUsers);

      const parsed = parser.parseCommand('search github john');
      const result = await parser.executeCommand(parsed, testUserId);

      expect(providerService.searchGitHubUsers).toHaveBeenCalledWith('john');
      expect(result).toEqual(mockUsers);
    });

    it('should execute custom preferences command', async () => {
      const mockPreferences = { theme: 'dark', activeAPIs: { weather: true, catfacts: false, github: false, chucknorris: false, bored: false, custom: false }, notifications: true };
      
      // Mock repositoryManager
      jest.spyOn(repositoryManager, 'getUserPreferences').mockResolvedValue(mockPreferences);

      const parsed = parser.parseCommand('get my preferences');
      const result = await parser.executeCommand(parsed, testUserId);

      expect(repositoryManager.getUserPreferences).toHaveBeenCalledWith(testUserId);
      expect(result).toEqual(mockPreferences);
    });

    it('should throw error for GitHub command without username', async () => {
      const parsed = { api: 'github', action: 'search', params: [], originalCommand: 'search github' };
      
      await expect(parser.executeCommand(parsed, testUserId)).rejects.toThrow('Please specify a username to search');
    });

    it('should throw error for unknown command', async () => {
      const parsed = parser.parseCommand('do something impossible');
      
      await expect(parser.executeCommand(parsed, testUserId)).rejects.toThrow('Unknown command');
    });

    it('should handle provider errors', async () => {
      (providerService.getWeather as jest.Mock).mockRejectedValue(new Error('Weather API failed'));

      const parsed = parser.parseCommand('get weather Berlin');
      
      await expect(parser.executeCommand(parsed, testUserId)).rejects.toThrow('Failed to execute command: Weather API failed');
    });
  });
});
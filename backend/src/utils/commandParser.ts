import { providerService } from '../providers/index';
import { repositoryManager } from '../services/repositoryManager';

export interface ParsedCommand {
  api: string;
  action: string;
  params: string[];
  originalCommand: string;
}

export class CommandParser {
  
  parseCommand(command: string): ParsedCommand {
    const lowerCommand = command.toLowerCase().trim();
    
    // Weather commands
    if (lowerCommand.includes('weather')) {
      const cityMatch = lowerCommand.match(/weather (?:in |for )?(.+)/);
      const city = cityMatch ? cityMatch[1].trim() : 'berlin';
      console.log('🌤️ Weather command - Original:', command, 'City extracted:', city);
      return {
        api: 'weather',
        action: 'get',
        params: [city],
        originalCommand: command
      };
    }

    // Cat fact commands
    if (lowerCommand.includes('cat fact') || lowerCommand === 'get cat') {
      return {
        api: 'catfacts',
        action: 'get',
        params: [],
        originalCommand: command
      };
    }

    // Chuck Norris commands
    if (lowerCommand.includes('chuck')) {
      const searchMatch = lowerCommand.match(/chuck (.+)/);
      const searchTerm = searchMatch ? searchMatch[1].replace('joke', '').trim() : '';
      return {
        api: 'chucknorris',
        action: 'get',
        params: searchTerm ? [searchTerm] : [],
        originalCommand: command
      };
    }

    // Bored API commands
    if (lowerCommand.includes('activity') || lowerCommand.includes('bored')) {
      return {
        api: 'bored',
        action: 'get',
        params: [],
        originalCommand: command
      };
    }

    // GitHub commands
    if (lowerCommand.includes('github') || lowerCommand.includes('search')) {
      const userMatch = lowerCommand.match(/(?:search\s+github\s+|github\s+|search\s+(?:user\s+|users\s+)?)(.+)/);
      const username = userMatch ? userMatch[1].trim() : '';
      return {
        api: 'github',
        action: 'search',
        params: [username],
        originalCommand: command
      };
    }

    // Custom backend commands
    if (lowerCommand.includes('preferences') || lowerCommand.includes('my')) {
      return {
        api: 'custom',
        action: 'preferences',
        params: [],
        originalCommand: command
      };
    }

    if (lowerCommand.includes('history')) {
      return {
        api: 'custom',
        action: 'history',
        params: [],
        originalCommand: command
      };
    }

    // Default - unknown command
    return {
      api: 'unknown',
      action: 'unknown',
      params: [],
      originalCommand: command
    };
  }

  async executeCommand(parsedCommand: ParsedCommand, userId: string): Promise<any> {
    const { api, action, params } = parsedCommand;

    try {
      switch (api) {
        case 'weather':
          return await providerService.getWeather(params[0] || 'berlin');

        case 'catfacts':
          return await providerService.getCatFact();

        case 'chucknorris':
          return await providerService.getChuckNorrisJoke(params[0]);

        case 'bored':
          return await providerService.getBoredActivity();

        case 'github':
          if (!params[0]) throw new Error('Please specify a username to search');
          return await providerService.searchGitHubUsers(params[0]);

        case 'custom':
          if (action === 'preferences') {
            return repositoryManager.getUserPreferences(userId);
          }
          if (action === 'history') {
            return repositoryManager.getUserSearchHistory(userId);
          }
          break;

        default:
          throw new Error(`Unknown command: ${parsedCommand.originalCommand}. Try: "get weather berlin", "get cat fact", "search github john"`);
      }
    } catch (error: any) {
      throw new Error(`Failed to execute command: ${error.message}`);
    }
  }
}

export const commandParser = new CommandParser();
import { UserService } from './userService';
import { SearchHistoryService } from './searchHistoryService';

export class RepositoryManager {
  public userService: UserService;
  public searchHistoryService: SearchHistoryService;

  constructor(dbPath?: string) {
    this.userService = new UserService(dbPath);
    this.searchHistoryService = new SearchHistoryService(dbPath);
  }

  // Delegate methods for backward compatibility
  async getUserPreferences(userId: string) {
    return this.userService.getUserPreferences(userId);
  }

  async saveUserPreferences(userId: string, preferences: any) {
    return this.userService.saveUserPreferences(userId, preferences);
  }

  async getUserSearchHistory(userId: string) {
    return this.searchHistoryService.getUserSearchHistory(userId);
  }

  async addSearchEntry(userId: string, entry: any) {
    return this.searchHistoryService.addSearchEntry(userId, entry);
  }

  async deleteSearchEntry(userId: string, entryId: string) {
    return this.searchHistoryService.deleteSearchEntry(userId, entryId);
  }
}

export const repositoryManager = new RepositoryManager();
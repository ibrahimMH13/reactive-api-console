import { RepositoryManager } from '../../src/services/repositoryManager';
import { UserService } from '../../src/services/userService';
import { SearchHistoryService } from '../../src/services/searchHistoryService';
import { UserPreferences } from '../../src/types';

describe('RepositoryManager', () => {
  let repositoryManager: RepositoryManager;
  const testUserId = 'test-user-123';
  
  beforeEach(() => {
    // Create new instance with in-memory database for each test
    repositoryManager = new RepositoryManager(':memory:');
    jest.clearAllMocks();
  });

  describe('User Preferences', () => {
    it('should return default preferences for new user', async () => {
      const preferences = await repositoryManager.getUserPreferences(testUserId);
      
      expect(preferences).toEqual({
        theme: 'dark',
        activeAPIs: ['weather', 'catfacts', 'github', 'custom'],
        notifications: true
      });
    });

    it('should save and retrieve user preferences', async () => {
      const newPreferences: UserPreferences = {
        theme: 'light',
        activeAPIs: ['weather', 'github'],
        notifications: false
      };

      await repositoryManager.saveUserPreferences(testUserId, newPreferences);
      const retrieved = await repositoryManager.getUserPreferences(testUserId);

      expect(retrieved).toEqual(newPreferences);
    });

    it('should update existing preferences', async () => {
      const initial: UserPreferences = {
        theme: 'dark',
        activeAPIs: ['weather'],
        notifications: true
      };

      const updated: UserPreferences = {
        theme: 'light',
        activeAPIs: ['weather', 'github'],
        notifications: false
      };

      await repositoryManager.saveUserPreferences(testUserId, initial);
      await repositoryManager.saveUserPreferences(testUserId, updated);
      
      const result = await repositoryManager.getUserPreferences(testUserId);
      expect(result).toEqual(updated);
    });
  });

  describe('Search History', () => {
    it('should return empty array for new user', async () => {
      const history = await repositoryManager.getUserSearchHistory(testUserId);
      expect(history).toEqual([]);
    });

    it('should add search entry', async () => {
      const searchEntry = {
        query: 'weather Berlin',
        api: 'weather',
        timestamp: Date.now()
      };

      const result = await repositoryManager.addSearchEntry(testUserId, searchEntry);

      expect(result).toMatchObject(searchEntry);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('should retrieve search history', async () => {
      const entries = [
        { query: 'weather Berlin', api: 'weather', timestamp: Date.now() },
        { query: 'cat fact', api: 'catfacts', timestamp: Date.now() + 1000 }
      ];

      await Promise.all(entries.map(entry => 
        repositoryManager.addSearchEntry(testUserId, entry)
      ));

      const history = await repositoryManager.getUserSearchHistory(testUserId);
      expect(history).toHaveLength(2);
      
      // Check that history contains entries with correct data (including user_id from DB)
      expect(history).toEqual(expect.arrayContaining([
        expect.objectContaining({ query: 'weather Berlin', api: 'weather', user_id: testUserId }),
        expect.objectContaining({ query: 'cat fact', api: 'catfacts', user_id: testUserId })
      ]));
    });

    it('should delete search entry', async () => {
      const searchEntry = {
        query: 'weather Tokyo',
        api: 'weather',
        timestamp: Date.now()
      };

      const added = await repositoryManager.addSearchEntry(testUserId, searchEntry);
      const deleted = await repositoryManager.deleteSearchEntry(testUserId, added.id);

      expect(deleted).toBe(true);

      const history = await repositoryManager.getUserSearchHistory(testUserId);
      expect(history).toHaveLength(0);
    });

    it('should return false when deleting non-existent entry', async () => {
      const deleted = await repositoryManager.deleteSearchEntry(testUserId, 'non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should not allow user to delete other users entries', async () => {
      const otherUserId = 'other-user-456';
      
      // Add entry for first user
      const entry = await repositoryManager.addSearchEntry(testUserId, {
        query: 'test query',
        api: 'weather',
        timestamp: Date.now()
      });

      // Try to delete from other user
      const deleted = await repositoryManager.deleteSearchEntry(otherUserId, entry.id);
      expect(deleted).toBe(false);

      // Verify entry still exists for original user
      const history = await repositoryManager.getUserSearchHistory(testUserId);
      expect(history).toHaveLength(1);
    });
  });
});
import { DatabaseService } from './database';

interface UserPreferences {
  theme: string;
  activeAPIs: string[];
  notifications: boolean;
}

export class UserService extends DatabaseService {
  constructor(dbPath?: string) {
    super(dbPath);
  }
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const row = await this.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (!row) {
      return {
        theme: 'dark',
        activeAPIs: ['weather', 'catfacts', 'github', 'custom'],
        notifications: true
      };
    }

    return {
      theme: row.theme,
      activeAPIs: JSON.parse(row.active_apis),
      notifications: Boolean(row.notifications)
    };
  }

  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<UserPreferences & { id: string }> {
    await this.run(
      `INSERT OR REPLACE INTO user_preferences 
       (user_id, theme, active_apis, notifications, updated_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, preferences.theme, JSON.stringify(preferences.activeAPIs), preferences.notifications]
    );

    return { id: userId, ...preferences };
  }
}
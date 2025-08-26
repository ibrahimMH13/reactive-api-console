import { DatabaseService } from './database';

interface SearchEntry {
  query: string;
  api: string;
  timestamp: number;
}

interface SearchEntryWithId extends SearchEntry {
  id: string;
}

export class SearchHistoryService extends DatabaseService {
  constructor(dbPath?: string) {
    super(dbPath);
  }
  async getUserSearchHistory(userId: string): Promise<SearchEntryWithId[]> {
    return await this.all(
      'SELECT * FROM search_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50',
      [userId]
    );
  }

  async addSearchEntry(userId: string, entry: SearchEntry): Promise<SearchEntryWithId> {
    const id = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.run(
      `INSERT INTO search_history (id, user_id, query, api, timestamp) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, entry.query, entry.api, entry.timestamp]
    );

    return { id, ...entry };
  }

  async deleteSearchEntry(userId: string, entryId: string): Promise<boolean> {
    const result = await this.run(
      'DELETE FROM search_history WHERE id = ? AND user_id = ?',
      [entryId, userId]
    );

    return result.changes > 0;
  }

  async clearUserSearchHistory(userId: string): Promise<boolean> {
    const result = await this.run(
      'DELETE FROM search_history WHERE user_id = ?',
      [userId]
    );

    return result.changes > 0;
  }
}
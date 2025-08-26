import sqlite3 from 'sqlite3';

export class DatabaseService {
  protected db: sqlite3.Database;

  constructor(dbPath?: string) {
    const finalDbPath = dbPath || process.env.DB_HOST || './db.sqlite';
    this.db = new sqlite3.Database(finalDbPath);
    this.initTables();
  }

  private initTables() {
    this.db.serialize(() => {
      // User preferences table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id TEXT PRIMARY KEY,
          theme TEXT,
          active_apis TEXT,
          notifications BOOLEAN,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Search history table  
      this.db.run(`
        CREATE TABLE IF NOT EXISTS search_history (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          query TEXT,
          api TEXT,
          timestamp INTEGER,
          FOREIGN KEY(user_id) REFERENCES user_preferences(user_id)
        )
      `);
    });
  }

  protected query(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  protected run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  }

  protected all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}
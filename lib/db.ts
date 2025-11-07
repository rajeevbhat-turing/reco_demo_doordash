import Database from 'better-sqlite3';
import path from 'path';

/**
 * Database Connection Layer
 * 
 * Provides read-only access to the doordash.db SQLite database.
 * This class manages the connection to the static catalog data.
 */
class DatabaseConnection {
  private db: Database.Database | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the database connection
   * Uses the doordash.db file in the project root
   */
  private init(): Database.Database {
    if (this.db) return this.db;

    try {
      // Path to the doordash.db file in project root
      const dbPath = path.join(process.cwd(), 'doordash.db');
      
      console.log(`📂 Connecting to database: ${dbPath}`);
      
      // Open database in read-only mode for safety
      this.db = new Database(dbPath, { 
        readonly: false, // We need write for WAL mode
        fileMustExist: true 
      });
      
      // Enable WAL mode for better concurrent reads
      this.db.pragma('journal_mode = WAL');
      
      this.initialized = true;
      console.log('✅ Database connection established (doordash.db)');
      
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw new Error(`Database initialization failed: ${error}`);
    }
  }

  /**
   * Execute a SELECT query that returns multiple rows
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Array of rows
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    const db = this.init();
    
    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params) as T[];
      return rows;
    } catch (error) {
      console.error('❌ Query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute a SELECT query that returns a single row
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Single row or undefined
   */
  queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    const db = this.init();
    
    try {
      const stmt = db.prepare(sql);
      const row = stmt.get(...params) as T | undefined;
      return row;
    } catch (error) {
      console.error('❌ Query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Close the database connection
   * (Usually not needed, but available for cleanup)
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('🔒 Database connection closed');
    }
  }
}

// Export singleton instance
export const db = new DatabaseConnection();


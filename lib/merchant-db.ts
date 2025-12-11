import { createClient, Client } from '@libsql/client';
import { getRequiredEnv } from '@/lib/env';

/**
 * Merchant Database Connection Layer
 *
 * Provides access to the merchant SQLite database.
 * Uses @libsql/client for consistency with main db.
 * Requires MERCHANT_LIBSQL_URL environment variable.
 */
class MerchantDatabaseConnection {
  private client: Client | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the database connection
   * Uses the MERCHANT_LIBSQL_URL from environment variables
   */
  private init(): Client {
    if (this.client) return this.client;

    try {
      const url = getRequiredEnv('MERCHANT_LIBSQL_URL');

      console.log(`📂 Connecting to merchant database: ${url}`);

      this.client = createClient({ url });

      this.initialized = true;
      console.log('✅ Merchant database connection established');

      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize merchant database:', error);
      throw new Error(`Merchant database initialization failed: ${error}`);
    }
  }

  /**
   * Execute a SELECT query that returns multiple rows
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = this.init();
    try {
      const result = await client.execute({
        sql,
        args: params,
      });
      return result.rows as T[];
    } catch (error) {
      console.error('❌ Query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute a SELECT query that returns a single row
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const client = this.init();
    try {
      const result = await client.execute({
        sql,
        args: params,
      });
      return result.rows[0] as T | undefined;
    } catch (error) {
      console.error('❌ Query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute an INSERT/UPDATE/DELETE query
   */
  async run(sql: string, params: any[] = []): Promise<void> {
    const client = this.init();
    try {
      await client.execute({
        sql,
        args: params,
      });
    } catch (error) {
      console.error('❌ Run error:', error);
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
   */
  close(): void {
    if (this.client) {
      this.client.close();
      this.client = null;
      this.initialized = false;
      console.log('🔒 Merchant database connection closed');
    }
  }
}

// Export singleton instance
export const merchantDb = new MerchantDatabaseConnection();

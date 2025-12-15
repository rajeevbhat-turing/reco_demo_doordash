import { createClient, Client } from '@libsql/client';
import { getRequiredEnv } from '@/lib/env';

/**
 * Delivery Database Connection Layer
 *
 * Provides access to the delivery libsql database server.
 * This class manages the connection to the delivery database.
 */
class DeliveryDatabaseConnection {
  private client: Client | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the database connection
   * Uses the DELIVERY_LIBSQL_URL from environment variables
   */
  private init(): Client {
    if (this.client) return this.client;

    try {
      const url = getRequiredEnv('DELIVERY_LIBSQL_URL');

      console.log(`📂 Connecting to delivery libsql server: ${url}`);

      // Create libsql client
      this.client = createClient({
        url: url,
      });

      this.initialized = true;
      console.log('✅ Delivery database connection established (libsql)');

      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize delivery database:', error);
      throw new Error(`Delivery database initialization failed: ${error}`);
    }
  }

  /**
   * Execute a SELECT query that returns multiple rows
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Promise of array of rows
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = this.init();

    try {
      const result = await client.execute({
        sql: sql,
        args: params,
      });

      return result.rows as T[];
    } catch (error) {
      console.error('❌ Delivery query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute a SELECT query that returns a single row
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Promise of single row or undefined
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const client = this.init();

    try {
      const result = await client.execute({
        sql: sql,
        args: params,
      });

      return result.rows[0] as T | undefined;
    } catch (error) {
      console.error('❌ Delivery query error:', error);
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
    if (this.client) {
      this.client.close();
      this.client = null;
      this.initialized = false;
      console.log('🔒 Delivery database connection closed');
    }
  }
}

// Export singleton instance
export const deliveryDb = new DeliveryDatabaseConnection();


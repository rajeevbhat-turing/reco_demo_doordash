import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

class DatabasePOC {
  private db: any = null
  private initialized: boolean = false

  async init() {
    if (this.db) return this.db
    
    this.db = await open({
      filename: path.join(process.cwd(), 'poc-database.sqlite'),
      driver: sqlite3.Database
    })

    // Create tables
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS current_state (
        session_id TEXT PRIMARY KEY,
        state_data TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(session_id) REFERENCES sessions(id)
      );

      CREATE TABLE IF NOT EXISTS runs (
        run_id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        last_updated INTEGER
      );

      CREATE TABLE IF NOT EXISTS kv (
        run_id TEXT NOT NULL,
        k TEXT NOT NULL,
        v TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (run_id, k)
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_activity ON sessions(last_activity);
      CREATE INDEX IF NOT EXISTS idx_kv_run_updated ON kv(run_id, updated_at);
      CREATE INDEX IF NOT EXISTS idx_runs_last_updated ON runs(last_updated);
    `)

    this.initialized = true
    console.log('✅ POC Database initialized')
    return this.db
  }

  // Add method to check if database is ready
  isInitialized(): boolean {
    return this.initialized
  }

  // Ensure database is initialized before operations
  private async ensureInitialized() {
    if (!this.initialized) {
      await this.init()
    }
  }

  async saveState(sessionId: string, state: any) {
    const db = await this.init()
    
    try {
      // Ensure session exists and update activity
      await db.run(`
        INSERT OR REPLACE INTO sessions (id, last_activity) 
        VALUES (?, CURRENT_TIMESTAMP)
      `, [sessionId])

      // Save state
      await db.run(`
        INSERT OR REPLACE INTO current_state (session_id, state_data, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [sessionId, JSON.stringify(state)])

      console.log(`💾 State saved for session: ${sessionId}`)
    } catch (error) {
      console.error('Failed to save state:', error)
      throw error
    }
  }

  async getState(sessionId: string) {
    const db = await this.init()
    
    try {
      const row = await db.get(
        'SELECT state_data, updated_at FROM current_state WHERE session_id = ?',
        [sessionId]
      )
      
      if (row) {
        console.log(`📖 State retrieved for session: ${sessionId}`)
        return JSON.parse(row.state_data)
      }
      
      console.log(`❌ No state found for session: ${sessionId}`)
      return null
    } catch (error) {
      console.error('Failed to get state:', error)
      throw error
    }
  }

  async getAllSessions() {
    const db = await this.init()
    
    try {
      const rows = await db.all(`
        SELECT s.id, s.created_at, s.last_activity, 
               cs.updated_at as state_updated_at,
               json_extract(cs.state_data, '$.items') as cart_items_count,
               json_extract(cs.state_data, '$.currentStore.name') as current_store
        FROM sessions s
        LEFT JOIN current_state cs ON s.id = cs.session_id
        ORDER BY s.last_activity DESC
        LIMIT 20
      `)
      
      return rows
    } catch (error) {
      console.error('Failed to get sessions:', error)
      throw error
    }
  }

  async cleanupOldSessions(olderThanHours: number = 24) {
    const db = await this.init()
    
    try {
      const result = await db.run(`
        DELETE FROM sessions 
        WHERE last_activity < datetime('now', '-${olderThanHours} hours')
      `)
      
      console.log(`🧹 Cleaned up ${result.changes} old sessions`)
      return result.changes
    } catch (error) {
      console.error('Failed to cleanup sessions:', error)
      throw error
    }
  }

  // Run operations
  async initRun(runId: string) {
    await this.ensureInitialized()
    const db = this.db
    const now = Date.now()
    
    try {
      await db.run(`
        INSERT OR IGNORE INTO runs (run_id, created_at, last_updated) 
        VALUES (?, ?, NULL)
      `, [runId, now])
      
      console.log(`✅ Run initialized: ${runId}`)
      return { ok: true, run_id: runId }
    } catch (error) {
      console.error('Failed to init run:', error)
      throw error
    }
  }

  async bulkUpsert(runId: string, items: Array<{key: string, value: any}>) {
    await this.ensureInitialized()
    const db = this.db
    const now = Date.now()

    try {
      // Ensure run exists (idempotent)
      await db.run(`
        INSERT OR IGNORE INTO runs (run_id, created_at, last_updated) 
        VALUES (?, ?, NULL)
      `, [runId, now])

      // Process items one by one
      for (const { key, value } of items) {
        await db.run(`
          INSERT OR REPLACE INTO kv (run_id, k, v, updated_at) VALUES (?, ?, ?, ?)
        `, [runId, key, JSON.stringify(value), now])
      }

      // Update runs.last_updated
      await db.run(`
        UPDATE runs SET last_updated = ? 
        WHERE run_id = ?
      `, [now, runId])

      console.log(`💾 Bulk upserted ${items.length} items for run: ${runId}`)
      return { ok: true, count: items.length }
    } catch (error) {
      console.error('Failed to bulk upsert:', error)
      throw error
    }
  }

  async bulkGet(runId: string, keys: string[]) {
    await this.ensureInitialized()
    const db = this.db
    
    if (keys.length === 0) return { items: [] }

    try {
      const placeholders = keys.map(() => "?").join(",")
      const rows = await db.all(
        `SELECT k, v FROM kv WHERE run_id = ? AND k IN (${placeholders})`,
        [runId, ...keys]
      )

      const items = rows.map((r: any) => ({ 
        key: r.k, 
        value: JSON.parse(r.v) 
      }))

      console.log(`📖 Retrieved ${items.length} items for run: ${runId}`)
      return { items }
    } catch (error) {
      console.error('Failed to bulk get:', error)
      throw error
    }
  }

  async exportRun(runId: string) {
    await this.ensureInitialized()
    const db = this.db
    
    try {
      const rows = await db.all(
        `SELECT k, v, updated_at FROM kv WHERE run_id = ?`,
        [runId]
      )

      const items = rows.map((r: any) => ({ 
        key: r.k, 
        value: JSON.parse(r.v), 
        updated_at: r.updated_at 
      }))

      console.log(`📤 Exported ${items.length} items for run: ${runId}`)
      return { run_id: runId, items }
    } catch (error) {
      console.error('Failed to export run:', error)
      throw error
    }
  }

  async listRuns(limit: number = -1) {
    await this.ensureInitialized()
    const db = this.db
    
    try {
      const stmt = `
        SELECT r.run_id, r.created_at, r.last_updated
        FROM runs r
        ORDER BY r.last_updated IS NULL, r.last_updated DESC
        ${limit > 0 ? `LIMIT ?` : ""}
      `
      
      const rows = limit > 0 
        ? await db.all(stmt, [limit])
        : await db.all(stmt)

      console.log(`📋 Listed ${rows.length} runs`)
      return { limit, runs: rows }
    } catch (error) {
      console.error('Failed to list runs:', error)
      throw error
    }
  }

  async deleteRuns(runIds: string[]) {
    await this.ensureInitialized()
    const db = this.db
    const uniqueIds = [...new Set(runIds.filter(id => typeof id === "string" && id.trim().length > 0))]

    if (uniqueIds.length === 0) {
      return { successfully_deleted_run_ids: [], not_found_run_ids: [] }
    }

    try {
      const placeholders = uniqueIds.map(() => "?").join(",")
      const existing = await db.all(
        `SELECT run_id FROM runs WHERE run_id IN (${placeholders})`,
        uniqueIds
      )

      const existingIds = existing.map((r: any) => r.run_id)
      const existingSet = new Set(existingIds)
      const notFound = uniqueIds.filter(id => !existingSet.has(id))

      if (existingIds.length > 0) {
        // Delete from kv table first
        const kvInClause = existingIds.map(() => "?").join(",")
        await db.run(`DELETE FROM kv WHERE run_id IN (${kvInClause})`, existingIds)
        
        // Delete from runs table
        const runsInClause = existingIds.map(() => "?").join(",")
        await db.run(`DELETE FROM runs WHERE run_id IN (${runsInClause})`, existingIds)
      }

      console.log(`🗑️ Deleted ${existingIds.length} runs`)
      return {
        successfully_deleted_run_ids: existingIds,
        not_found_run_ids: notFound,
      }
    } catch (error) {
      console.error('Failed to delete runs:', error)
      throw error
    }
  }
}

export const dbPOC = new DatabasePOC() 
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

class DatabasePOC {
  private db: any = null

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

      CREATE INDEX IF NOT EXISTS idx_sessions_activity ON sessions(last_activity);
    `)

    console.log('✅ POC Database initialized')
    return this.db
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
}

export const dbPOC = new DatabasePOC() 
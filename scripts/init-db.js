const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')

async function initDatabase() {
  try {
    const db = await open({
      filename: path.join(process.cwd(), 'poc-database.sqlite'),
      driver: sqlite3.Database
    })

    // Create tables
    await db.exec(`
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

    await db.close()
    console.log('✅ Database created on server startup')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
  }
}

initDatabase()

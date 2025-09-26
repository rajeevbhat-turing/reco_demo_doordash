const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);

// Initialize database table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS kv (
      run_id TEXT NOT NULL,
      k TEXT NOT NULL,
      v TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (run_id, k)
    )
  `);
});

// Bulk upsert endpoint
app.post('/api/v1/kv/bulk-upsert', (req, res) => {
  const { run_id, data } = req.body;
  
  if (!run_id || !data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid request: run_id and data required' });
  }

  const timestamp = Date.now();
  const stmt = db.prepare(`
    INSERT INTO kv (run_id, k, v, updated_at) 
    VALUES (?, ?, ?, ?)
    ON CONFLICT (run_id, k) 
    DO UPDATE SET v = excluded.v, updated_at = excluded.updated_at
  `);

  try {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      Object.entries(data).forEach(([key, value]) => {
        stmt.run(run_id, key, JSON.stringify(value), timestamp);
      });
      
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Database error' });
        } else {
          res.json({ success: true, updated: Object.keys(data).length });
        }
      });
    });
  } catch (error) {
    console.error('Error in bulk-upsert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk get endpoint
app.post('/api/v1/kv/bulk-get', (req, res) => {
  const { run_id, keys } = req.body;
  
  if (!run_id || !Array.isArray(keys)) {
    return res.status(400).json({ error: 'Invalid request: run_id and keys array required' });
  }

  const placeholders = keys.map(() => '?').join(',');
  const query = `SELECT k, v FROM kv WHERE run_id = ? AND k IN (${placeholders})`;
  
  db.all(query, [run_id, ...keys], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const result = {};
    rows.forEach(row => {
      try {
        result[row.k] = JSON.parse(row.v);
      } catch (parseError) {
        console.error('JSON parse error for key:', row.k, parseError);
        result[row.k] = row.v; // Return as string if JSON parse fails
      }
    });
    
    res.json(result);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

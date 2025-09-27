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

// Run reset endpoint - DISABLED
// SQLite data should never be deleted, only updated per run_id
// app.post('/api/v1/run/reset', async (req, res) => {
//   const { run_id } = req.body;
//   if (!run_id) {
//     return res.status(400).json({ error: 'run_id is required' });
//   }
//   try {
//     // Delete all records for this run_id
//     await db.run('DELETE FROM kv WHERE run_id = ?', [run_id]);
//     console.log(`🗄️ Reset SQLite state for run_id: ${run_id}`);
//     res.json({ success: true, message: `State reset for run_id: ${run_id}` });
//   } catch (error) {
//     console.error('Reset error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// Verification endpoint
app.get('/api/v1/run/verify', async (req, res) => {
  const { run_id, prompt_id } = req.query;

  if (!run_id || !prompt_id) {
    return res.status(400).json({ error: 'run_id and prompt_id are required' });
  }

  try {
    // Get all data for this run_id using callback-based approach
    db.all('SELECT k, v FROM kv WHERE run_id = ?', [run_id], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      // Simple verification logic - you can extend this based on your needs
      const hasCartItems = Array.isArray(rows) && rows.some(row => row.k === 'cart.items' && JSON.parse(row.v).length > 0);
      const hasUserData = Array.isArray(rows) && rows.some(row => row.k.startsWith('user.'));
      
      // Load flow verifiers from the main config (single source of truth)
      const flowVerifiers = require('../config/flow-verifiers.json');
      
      // Example verification rules
      let result = 'failed';
      
      if (prompt_id === 'cart-verification') {
        result = hasCartItems ? 'passed' : 'failed';
      } else if (prompt_id === 'user-verification') {
        result = hasUserData ? 'passed' : 'failed';
      } else if (prompt_id === 'general-verification') {
        result = rows.length > 0 ? 'passed' : 'failed';
      } else if (flowVerifiers.flows[prompt_id]) {
        // Use the exact same verifier logic as the UI
        const flow = flowVerifiers.flows[prompt_id];
        const verifierCode = flow.verifier;
        
        try {
          // Create mock localStorage from database data
          const mockLocalStorage = {
            getItem: (key) => {
              if (key === 'multicategory-cart') {
                // Reconstruct the cart state from database
                const cartState = {};
                if (Array.isArray(rows)) {
                  rows.forEach(row => {
                  if (row.k === 'cart.items') {
                    cartState.items = JSON.parse(row.v);
                  } else if (row.k === 'cart.category') {
                    cartState.currentCategory = JSON.parse(row.v);
                  } else if (row.k === 'cart.storeId') {
                    cartState.currentStoreId = JSON.parse(row.v);
                  } else if (row.k === 'cart.restaurantId') {
                    cartState.currentRestaurantId = JSON.parse(row.v);
                  } else if (row.k === 'cart.currentStore') {
                    cartState.currentStore = JSON.parse(row.v);
                  } else if (row.k === 'cart.searchResults') {
                    cartState.searchResults = JSON.parse(row.v);
                  } else if (row.k === 'cart.lastClearInfo') {
                    cartState.lastClearInfo = JSON.parse(row.v);
                  } else if (row.k === 'cart.verifierConsumed') {
                    cartState.verifierConsumed = JSON.parse(row.v);
                  } else if (row.k === 'cart.lastSearchInfo') {
                    cartState.lastSearchInfo = JSON.parse(row.v);
                  } else if (row.k === 'cart.searchVerifierConsumed') {
                    cartState.searchVerifierConsumed = JSON.parse(row.v);
                  } else if (row.k === 'cart.lastRemovalInfo') {
                    cartState.lastRemovalInfo = JSON.parse(row.v);
                  } else if (row.k === 'cart.removalVerifierConsumed') {
                    cartState.removalVerifierConsumed = JSON.parse(row.v);
                  } else if (row.k === 'cart.lastQuantityChangeInfo') {
                    cartState.lastQuantityChangeInfo = JSON.parse(row.v);
                  } else if (row.k === 'cart.quantityVerifierConsumed') {
                    cartState.quantityVerifierConsumed = JSON.parse(row.v);
                  } else if (row.k === 'cart.lastOrderInfo') {
                    cartState.lastOrderInfo = JSON.parse(row.v);
                  } else if (row.k === 'cart.orderVerifierConsumed') {
                    cartState.orderVerifierConsumed = JSON.parse(row.v);
                  }
                  });
                }
                
                // If we have items but no currentStore, try to infer from the first item
                if (cartState.items && cartState.items.length > 0 && !cartState.currentStore) {
                  const firstItem = cartState.items[0];
                  if (firstItem.storeName) {
                    cartState.currentStore = { name: firstItem.storeName };
                  }
                }
                
                return JSON.stringify({ state: cartState });
              }
              return null;
            }
          };
          
          // Create mock console for logging
          const consoleOutput = [];
          const mockConsole = {
            log: (...args) => consoleOutput.push(`[LOG] ${args.join(' ')}`),
            error: (...args) => consoleOutput.push(`[ERROR] ${args.join(' ')}`)
          };
          
          // Execute the verifier code with mock context
          const verifierFunction = new Function('localStorage', 'console', verifierCode);
          const verifierResult = verifierFunction(mockLocalStorage, mockConsole);
          
          result = verifierResult === true ? 'passed' : 'failed';
          
        } catch (error) {
          console.error(`❌ Verifier ${prompt_id} execution error:`, error);
          result = 'failed';
        }
      }

      res.json({ prompt_id, result });
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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

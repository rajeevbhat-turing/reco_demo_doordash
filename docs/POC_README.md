# Database-Backed State Verification POC

This POC demonstrates how agents can perform UI actions and have their completion verified through database-stored state, without needing to extract localStorage or make additional API calls.

## 🎯 **Core Concept**

1. **Agent performs UI actions** (search, navigate, add items) normally
2. **State automatically syncs** to SQLite database in background  
3. **External system calls verification API** with just session ID + task ID
4. **Verifier reads current state** from database and validates completion

## 🚀 **Quick Test**

### Step 1: Navigate to Main App
```bash
# Open in browser
http://localhost:3000
```

### Step 2: Perform Some Actions
- Search for "starbucks"
- Click on a Starbucks store result
- Navigate to the store page
- (State will auto-sync in background)

### Step 3: Test Database Verification
```bash
# Open POC test page
http://localhost:3000/poc-test

# Or test via API directly
curl -X POST http://localhost:3000/api/verify-by-session \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "search-starbucks",
    "sessionId": "your-session-id-here"
  }'
```

## 📁 **POC Files Created**

```
lib/
├── database-poc.ts           # SQLite database service
├── auto-sync-middleware.ts   # Zustand middleware (unused in POC)
└── cart-auto-sync.ts        # Auto-sync service (WIP)

app/api/
├── state-auto-sync/route.ts  # Background state sync endpoint
└── verify-by-session/route.ts # Main verification API

app/
└── poc-test/page.tsx         # Test interface

poc-database.sqlite           # SQLite database (auto-created)
```

## 🔧 **API Endpoints**

### 1. Verification API (Main endpoint for agents)
```bash
POST /api/verify-by-session
Content-Type: application/json

{
  "taskId": "search-starbucks",
  "sessionId": "1704123456-abc123"
}
```

**Response:**
```json
{
  "taskId": "search-starbucks",
  "passed": true,
  "error": null,
  "executionTime": 12.34,
  "description": "Search for 'starbucks' and navigate to a Starbucks store",
  "sessionFound": true,
  "stateSnapshot": {
    "cartItems": 0,
    "currentStore": "Starbucks (299 Fremont Street)",
    "hasSearchResults": true,
    "lastSearchTerm": "starbucks"
  }
}
```

### 2. State Sync API (Background)
```bash
POST /api/state-auto-sync
Content-Type: application/json

{
  "sessionId": "1704123456-abc123",
  "state": { /* cart state */ },
  "timestamp": 1704123456789
}
```

### 3. Sync Status Check
```bash
GET /api/state-auto-sync?sessionId=1704123456-abc123
```

## 🧪 **Testing Workflow**

### Manual Testing:
1. **Navigate to:** `http://localhost:3000/poc-test`
2. **Note session ID** (auto-filled from current session)
3. **Go to main app** and perform actions
4. **Return to POC page** and click "Manual State Sync"
5. **Run verification test** to see if task completed

### Automated Testing:
```bash
# Get session ID from browser sessionStorage
sessionId=$(curl -s http://localhost:3000/poc-test | grep -o 'session-[^"]*' | head -1)

# Test verification
curl -X POST http://localhost:3000/api/verify-by-session \
  -H "Content-Type: application/json" \
  -d "{\"taskId\": \"search-starbucks\", \"sessionId\": \"$sessionId\"}"
```

## 📊 **Available Tasks**

| Task ID | Description |
|---------|-------------|
| `search-starbucks` | Search for 'starbucks' and navigate to a Starbucks store |
| `search-target` | Search for 'target' and navigate to Target Store |
| `add-sweet-pretzel` | Add a sweet pretzel from Jamba Juice to the cart |
| `clear-cart` | Add 3 Items and Clear the Cart |
| `find-pizza-restaurants` | Search for 'pizza' to find restaurants that offer pizza |

## 🔍 **Database Schema**

```sql
-- Sessions tracking
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Current state snapshots
CREATE TABLE current_state (
  session_id TEXT PRIMARY KEY,
  state_data TEXT,  -- JSON string
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);
```

## ⚠️ **POC Limitations**

1. **Manual sync required** - Auto-sync service needs cart store integration
2. **SQLite only** - Production would use PostgreSQL
3. **No cleanup** - Old sessions accumulate (can be cleaned manually)
4. **Basic error handling** - Production needs robust error handling

## 🚀 **Next Steps for Full Implementation**

1. **Fix cart store integration** for automatic state sync
2. **Add PostgreSQL** with Docker setup
3. **Implement session cleanup** and monitoring
4. **Add comprehensive logging** and analytics
5. **Create production Docker** configuration

## 🐛 **Troubleshooting**

### No session found:
- Make sure you've navigated to the main app first
- Check browser sessionStorage for `doordash-session-id`

### State sync failed:
- Check if SQLite database was created: `ls -la poc-database.sqlite`
- Check browser console for sync errors
- Try manual sync from POC test page

### Verification failed:
- Ensure you performed the actual UI actions
- Check if state was synced properly
- Verify task ID matches available tasks

---

**Ready to test!** Navigate to `http://localhost:3000/poc-test` to start testing the database-backed verification system. 
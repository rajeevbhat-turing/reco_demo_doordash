
## LocalStorage → SQLite Mirror (React + Node)

This server demonstrates a simple pattern for **persisting React state into SQLite** through a small **Node/Express API**, instead of completely relying only on `localStorage`.

The goal: Keep components simple (`useState` → instant UI), while also having a **durable backend database** that is easy to deploy (SQLite file).  

---

### Why this exists

- `localStorage` is fast but **not durable** (cleared per browser, per user).  
- We needed something as simple as "key → JSON" storage, but stored **on the server**.  
- SQLite is file-based, lightweight, and perfect for this.  
- This setup acts like a **write-through cache**:  
  - UI → localStorage (instant)  
  - localStorage → server (debounced, batched)  
  - server → SQLite (transactional, durable)

---

### Flow

1. **React State**  
   - Components use a custom hook:  
     ```js
     const [value, setValue] = usePersistedState("myKey", initialValue);
     ```

2. **Write path**  
   - On every `setValue`:  
     - Writes to `localStorage` immediately (for fast reloads).  
     - Queues the change in memory.  
     - Debounced flush (~120ms) → `POST /api/v1/kv/bulk-upsert` with all pending keys.  
   - The server uses SQLite `INSERT ... ON CONFLICT UPDATE` to upsert atomically.

3. **Read path (hydration)**  
   - On first mount:  
     - Hook asks the server via `POST /api/v1/kv/bulk-get`.  
     - If server value ≠ local copy → replace local state with server value.  

4. **Unload safety**  
   - Before the tab closes, queued writes are sent with `navigator.sendBeacon()`.

---

### Server

- Runs on **Express + better-sqlite3**.  
- `app.db` is created automatically on first run.
- Maintains one table:  
```sql
  CREATE TABLE kv (
    k TEXT PRIMARY KEY,
    v TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
```

### Endpoints:

* `POST /api/v1/kv/bulk-upsert` — insert/update multiple keys at once.
* `POST /api/v1/kv/bulk-get` — fetch values for a list of keys.

---

### The concept of `run_id`

To support multiple independent application runs (e.g., different users, sessions, or experiments), the setup introduces a **`run_id`**:

* Each client run is assigned a unique `run_id` when bootstrapping recieved via the URL parameter.
* All key–value pairs in the `kv` table are **scoped by run\_id**, so the same key can exist in multiple runs without clashing.
* On the server, the schema becomes:

  ```sql
  CREATE TABLE kv (
    run_id TEXT NOT NULL,
    k TEXT NOT NULL,
    v TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (run_id, k)
  );
  ```
* Clients include their `run_id` in every request (`bulk-upsert`, `bulk-get`), ensuring correct isolation.
* This design makes it possible to analyze and compare different runs side by side, or reset the app without overwriting prior data.

---

### Example lifecycle

* User changes a React state → state & localStorage update instantly.
* Within ~200ms, the new value is flushed to the server.
* If user reloads or uses another browser:
  * Hook pulls value from SQLite and rehydrates state.

### Benefits

* Minimal changes from a localStorage-only app.
* Durable persistence in one SQLite file (app.db).
* Batched writes = efficient (one DB transaction instead of many).
* Safe exit — unsynced changes flushed on tab close.
* Runs fine on localhost or a single AWS server (SQLite handles concurrency well in WAL mode).

### Limitations & Performance Notes

* It’s a simple **KV store**: one row per key. Large arrays/objects work, but consider **normalizing into multiple keys** for better performance.
* **Conflict resolution** is last-write-wins — there’s no merge logic.
* This architecture is best suited for a **single-server setup** (SQLite isn’t distributed).
* **Payloads:** On localhost, latency is negligible (\~0–2ms), therefore, computation dominates. On a remote server, network delay dominates (tens of ms). To optimize, we could:
  * Split large data into smaller localstorage keys.
  * Send diffs (e.g., JSON Patch using `fast-json-patch` library) instead of full JSON blobs.

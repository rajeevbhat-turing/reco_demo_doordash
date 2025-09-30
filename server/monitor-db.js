const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 SQLite Database Monitor');
console.log('📊 Watching for new data...\n');

let lastCount = 0;

function checkForNewData() {
  db.get("SELECT COUNT(*) as count FROM kv", (err, row) => {
    if (err) {
      console.error('❌ Database error:', err);
      return;
    }
    
    const currentCount = row.count;
    
    if (currentCount > lastCount) {
      console.log(`✅ New data detected! Total records: ${currentCount} (${currentCount - lastCount} new)`);
      
      // Show the latest records
      db.all("SELECT run_id, k, substr(v, 1, 100) as value_preview, datetime(updated_at/1000, 'unixepoch') as updated_time FROM kv ORDER BY updated_at DESC LIMIT 3", (err, rows) => {
        if (err) {
          console.error('❌ Error fetching latest records:', err);
          return;
        }
        
        console.log('\n📋 Latest Records:');
        rows.forEach((row, index) => {
          console.log(`${index + 1}. Run: ${row.run_id}`);
          console.log(`   Key: ${row.k}`);
          console.log(`   Value: ${row.value_preview}...`);
          console.log(`   Updated: ${row.updated_time}`);
          console.log('');
        });
      });
      
      lastCount = currentCount;
    }
  });
}

// Check every 2 seconds
setInterval(checkForNewData, 2000);

// Initial check
checkForNewData();

console.log('💡 Make changes in your UI and watch for updates here!');
console.log('🛑 Press Ctrl+C to stop monitoring\n');

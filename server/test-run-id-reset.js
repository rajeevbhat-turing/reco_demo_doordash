const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRunIdReset() {
  console.log('🧪 Testing Run ID Reset Functionality\n');

  const baseUrl = 'http://localhost:3001';
  
  // Test 1: Create data for a run_id
  console.log('1️⃣ Creating data for run_id: test-reset-1');
  await fetch(`${baseUrl}/api/v1/kv/bulk-upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: 'test-reset-1',
      data: {
        'cart.items': JSON.stringify([{id: 1, name: 'Test Item', price: 10.99}]),
        'user.name': JSON.stringify('Test User')
      }
    })
  });
  
  // Verify data exists
  const beforeReset = await fetch(`${baseUrl}/api/v1/kv/bulk-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: 'test-reset-1',
      keys: ['cart.items', 'user.name']
    })
  });
  const beforeData = await beforeReset.json();
  console.log('   Data before reset:', beforeData);
  
  // Test 2: Reset the run_id
  console.log('\n2️⃣ Resetting run_id: test-reset-1');
  const resetResponse = await fetch(`${baseUrl}/api/v1/run/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ run_id: 'test-reset-1' })
  });
  const resetResult = await resetResponse.json();
  console.log('   Reset result:', resetResult);
  
  // Test 3: Verify data is cleared
  console.log('\n3️⃣ Verifying data is cleared');
  const afterReset = await fetch(`${baseUrl}/api/v1/kv/bulk-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: 'test-reset-1',
      keys: ['cart.items', 'user.name']
    })
  });
  const afterData = await afterReset.json();
  console.log('   Data after reset:', afterData);
  
  // Test 4: Test with new run_id (simulating URL change)
  console.log('\n4️⃣ Testing new run_id: test-reset-2');
  const newRunData = await fetch(`${baseUrl}/api/v1/kv/bulk-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: 'test-reset-2',
      keys: ['cart.items', 'user.name']
    })
  });
  const newRunResult = await newRunData.json();
  console.log('   New run_id data (should be empty):', newRunResult);
  
  console.log('\n✅ Run ID Reset Test Results:');
  console.log(`   - Data before reset: ${Object.keys(beforeData).length} items`);
  console.log(`   - Data after reset: ${Object.keys(afterData).length} items`);
  console.log(`   - New run_id data: ${Object.keys(newRunResult).length} items`);
  console.log(`   - Reset working: ${Object.keys(afterData).length === 0 ? '✅ YES' : '❌ NO'}`);
  console.log(`   - New run_id isolated: ${Object.keys(newRunResult).length === 0 ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n🌐 To test in browser:');
  console.log('   http://localhost:3000?run_id=test-reset-1');
  console.log('   http://localhost:3000?run_id=test-reset-2');
  console.log('   http://localhost:3000?run_id=new-test-' + Date.now());
}

// Run the test
testRunIdReset().catch(console.error);

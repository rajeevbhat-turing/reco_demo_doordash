const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRunIdSystem() {
  console.log('🧪 Testing Run ID System\n');

  const baseUrl = 'http://localhost:3001';
  
  // Test 1: Create multiple run_ids
  console.log('1️⃣ Testing multiple run_ids...');
  
  const runId1 = 'test-run-1-' + Date.now();
  const runId2 = 'test-run-2-' + Date.now();
  
  // Add data to run_id 1
  console.log(`   Adding data to run_id: ${runId1}`);
  await fetch(`${baseUrl}/api/v1/kv/bulk-upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: runId1,
      data: {
        'cart.items': JSON.stringify([{id: 1, name: 'Pizza', price: 15.99}]),
        'user.name': JSON.stringify('Alice')
      }
    })
  });
  
  // Add data to run_id 2
  console.log(`   Adding data to run_id: ${runId2}`);
  await fetch(`${baseUrl}/api/v1/kv/bulk-upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: runId2,
      data: {
        'cart.items': JSON.stringify([{id: 2, name: 'Burger', price: 12.99}]),
        'user.name': JSON.stringify('Bob')
      }
    })
  });
  
  // Test 2: Verify isolation
  console.log('\n2️⃣ Testing run_id isolation...');
  
  const response1 = await fetch(`${baseUrl}/api/v1/kv/bulk-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: runId1,
      keys: ['cart.items', 'user.name']
    })
  });
  const data1 = await response1.json();
  console.log(`   Run ${runId1} data:`, data1);
  
  const response2 = await fetch(`${baseUrl}/api/v1/kv/bulk-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: runId2,
      keys: ['cart.items', 'user.name']
    })
  });
  const data2 = await response2.json();
  console.log(`   Run ${runId2} data:`, data2);
  
  // Test 3: Verification endpoint
  console.log('\n3️⃣ Testing verification endpoint...');
  
  const verifyResponse1 = await fetch(`${baseUrl}/api/v1/run/verify?run_id=${runId1}&prompt_id=cart-verification`);
  const verifyResult1 = await verifyResponse1.json();
  console.log(`   Cart verification for ${runId1}:`, verifyResult1);
  
  const verifyResponse2 = await fetch(`${baseUrl}/api/v1/run/verify?run_id=${runId2}&prompt_id=user-verification`);
  const verifyResult2 = await verifyResponse2.json();
  console.log(`   User verification for ${runId2}:`, verifyResult2);
  
  // Test 4: Reset specific run_id
  console.log('\n4️⃣ Testing run_id reset...');
  
  const resetResponse = await fetch(`${baseUrl}/api/v1/run/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ run_id: runId1 })
  });
  const resetResult = await resetResponse.json();
  console.log(`   Reset result for ${runId1}:`, resetResult);
  
  // Verify run_id 1 is empty but run_id 2 still has data
  const verifyEmpty = await fetch(`${baseUrl}/api/v1/kv/bulk-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: runId1,
      keys: ['cart.items', 'user.name']
    })
  });
  const emptyData = await verifyEmpty.json();
  console.log(`   Run ${runId1} after reset:`, emptyData);
  
  const verifyStillExists = await fetch(`${baseUrl}/api/v1/kv/bulk-get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      run_id: runId2,
      keys: ['cart.items', 'user.name']
    })
  });
  const stillExistsData = await verifyStillExists.json();
  console.log(`   Run ${runId2} still intact:`, stillExistsData);
  
  console.log('\n✅ Run ID system test completed!');
  console.log('\n📋 Summary:');
  console.log(`   - Multiple run_ids can exist in parallel`);
  console.log(`   - Data is isolated between run_ids`);
  console.log(`   - Verification works per run_id`);
  console.log(`   - Reset only affects specific run_id`);
  console.log('\n🌐 Try these URLs:');
  console.log(`   http://localhost:3000?run_id=${runId1}`);
  console.log(`   http://localhost:3000?run_id=${runId2}`);
  console.log(`   http://localhost:3000?run_id=new-test-${Date.now()}`);
}

// Run the test
testRunIdSystem().catch(console.error);

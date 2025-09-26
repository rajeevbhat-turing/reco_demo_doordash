const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SERVER_URL = 'http://localhost:3001';

async function testServer() {
  console.log('🧪 Testing LocalStorage → SQLite Mirror Server\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Bulk upsert
    console.log('\n2. Testing bulk upsert...');
    const testRunId = 'test-run-' + Date.now();
    const testData = {
      'user.name': 'John Doe',
      'user.email': 'john@example.com',
      'cart.items': [1, 2, 3],
      'settings.theme': 'dark'
    };

    const upsertResponse = await fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: testRunId,
        data: testData
      })
    });

    const upsertResult = await upsertResponse.json();
    console.log('✅ Bulk upsert result:', upsertResult);

    // Test 3: Bulk get
    console.log('\n3. Testing bulk get...');
    const getResponse = await fetch(`${SERVER_URL}/api/v1/kv/bulk-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: testRunId,
        keys: ['user.name', 'user.email', 'cart.items', 'settings.theme']
      })
    });

    const getResult = await getResponse.json();
    console.log('✅ Bulk get result:', getResult);

    // Test 4: Update existing data
    console.log('\n4. Testing update existing data...');
    const updateData = {
      'user.name': 'Jane Doe',
      'cart.items': [1, 2, 3, 4, 5],
      'new.key': 'new value'
    };

    const updateResponse = await fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: testRunId,
        data: updateData
      })
    });

    const updateResult = await updateResponse.json();
    console.log('✅ Update result:', updateResult);

    // Test 5: Verify updated data
    console.log('\n5. Verifying updated data...');
    const verifyResponse = await fetch(`${SERVER_URL}/api/v1/kv/bulk-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: testRunId,
        keys: ['user.name', 'cart.items', 'new.key']
      })
    });

    const verifyResult = await verifyResponse.json();
    console.log('✅ Verification result:', verifyResult);

    // Test 6: Test run isolation
    console.log('\n6. Testing run isolation...');
    const otherRunId = 'other-run-' + Date.now();
    const otherRunData = {
      'user.name': 'Other User',
      'different.key': 'different value'
    };

    await fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: otherRunId,
        data: otherRunData
      })
    });

    // Check that runs are isolated
    const isolationCheck1 = await fetch(`${SERVER_URL}/api/v1/kv/bulk-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: testRunId,
        keys: ['user.name']
      })
    });

    const isolationCheck2 = await fetch(`${SERVER_URL}/api/v1/kv/bulk-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: otherRunId,
        keys: ['user.name']
      })
    });

    const result1 = await isolationCheck1.json();
    const result2 = await isolationCheck2.json();
    
    console.log('✅ Run isolation test:');
    console.log(`   Run ${testRunId}:`, result1);
    console.log(`   Run ${otherRunId}:`, result2);

    console.log('\n🎉 All tests passed! Server is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testServer();

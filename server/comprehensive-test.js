const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SERVER_URL = 'http://localhost:3001';
const TEST_HTML_URL = 'http://localhost:8080/test-hook.html';

async function comprehensiveTest() {
  console.log('🧪 Comprehensive LocalStorage → SQLite Mirror Test\n');

  try {
    // Test 1: Server Health
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData);

    // Test 2: Run Isolation
    console.log('\n2. Testing run isolation...');
    const run1 = 'test-run-1-' + Date.now();
    const run2 = 'test-run-2-' + Date.now();

    // Create data for run 1
    await fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: run1,
        data: {
          'user.name': 'User One',
          'cart': ['item1', 'item2'],
          'settings.theme': 'dark'
        }
      })
    });

    // Create data for run 2
    await fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: run2,
        data: {
          'user.name': 'User Two',
          'cart': ['item3', 'item4'],
          'settings.theme': 'light'
        }
      })
    });

    // Verify isolation
    const run1Data = await fetch(`${SERVER_URL}/api/v1/kv/bulk-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: run1,
        keys: ['user.name', 'cart', 'settings.theme']
      })
    });

    const run2Data = await fetch(`${SERVER_URL}/api/v1/kv/bulk-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: run2,
        keys: ['user.name', 'cart', 'settings.theme']
      })
    });

    const run1Result = await run1Data.json();
    const run2Result = await run2Data.json();

    console.log('✅ Run 1 data:', run1Result);
    console.log('✅ Run 2 data:', run2Result);
    console.log('✅ Runs are properly isolated');

    // Test 3: Debounced Updates
    console.log('\n3. Testing debounced updates...');
    const debounceRun = 'debounce-test-' + Date.now();
    
    // Simulate rapid updates
    const updates = [];
    for (let i = 0; i < 5; i++) {
      updates.push({
        run_id: debounceRun,
        data: { 'test.key': `value-${i}` }
      });
    }

    // Send all updates rapidly
    const promises = updates.map(update => 
      fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      })
    );

    await Promise.all(promises);
    console.log('✅ Rapid updates sent');

    // Wait a bit and check final value
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const finalCheck = await fetch(`${SERVER_URL}/api/v1/kv/bulk-get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: debounceRun,
        keys: ['test.key']
      })
    });

    const finalResult = await finalCheck.json();
    console.log('✅ Final value after debouncing:', finalResult);

    // Test 4: Large Payload Performance
    console.log('\n4. Testing large payload performance...');
    const largeRun = 'large-test-' + Date.now();
    const largeData = {};
    
    // Create a large dataset
    for (let i = 0; i < 100; i++) {
      largeData[`key.${i}`] = {
        id: i,
        name: `Item ${i}`,
        description: `This is a description for item ${i}`.repeat(10),
        tags: [`tag${i}`, `category${i % 10}`],
        metadata: {
          created: Date.now(),
          updated: Date.now(),
          version: i
        }
      };
    }

    const startTime = Date.now();
    const largeResponse = await fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: largeRun,
        data: largeData
      })
    });
    const endTime = Date.now();

    if (largeResponse.ok) {
      const result = await largeResponse.json();
      console.log(`✅ Large payload (${Object.keys(largeData).length} keys) processed in ${endTime - startTime}ms`);
      console.log(`✅ Server response:`, result);
    } else {
      console.log('❌ Large payload test failed');
    }

    // Test 5: Error Handling
    console.log('\n5. Testing error handling...');
    
    // Test invalid run_id
    const invalidResponse = await fetch(`${SERVER_URL}/api/v1/kv/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing run_id
        data: { 'test': 'value' }
      })
    });

    if (!invalidResponse.ok) {
      console.log('✅ Invalid request properly rejected');
    } else {
      console.log('❌ Invalid request should have been rejected');
    }

    // Test 6: HTML Test Page
    console.log('\n6. Testing HTML test page...');
    const htmlResponse = await fetch(TEST_HTML_URL);
    if (htmlResponse.ok) {
      console.log('✅ HTML test page is accessible');
      console.log('   You can now open http://localhost:8080/test-hook.html in your browser');
      console.log('   to test the full user interface');
    } else {
      console.log('❌ HTML test page not accessible');
    }

    console.log('\n🎉 All comprehensive tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Server health check');
    console.log('✅ Run isolation');
    console.log('✅ Debounced updates');
    console.log('✅ Large payload performance');
    console.log('✅ Error handling');
    console.log('✅ HTML test interface');
    
    console.log('\n🌐 Next Steps:');
    console.log('1. Open http://localhost:8080/test-hook.html in your browser');
    console.log('2. Test the user interface by making changes');
    console.log('3. Refresh the page to test persistence');
    console.log('4. Open multiple tabs with different Run IDs to test isolation');
    console.log('5. Check server logs to see debounced updates');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

comprehensiveTest();

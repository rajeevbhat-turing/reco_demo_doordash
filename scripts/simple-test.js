#!/usr/bin/env node

/**
 * Simple Test Example - Step by Step Walkthrough
 * 
 * This demonstrates how to create and run a single test case
 */

// Step 1: Define the UI state that should make the verifier PASS
const stateThatShouldPass = {
  items: [{
    itemName: 'sweet pretzel',
    quantity: 1,
    price: 3.99,
    storeName: 'Jamba Juice (152 Kearny Street)'
  }],
  currentStore: {
    name: 'Jamba Juice (152 Kearny Street)',
    id: 'jamba-juice-152'
  },
  searchResults: [],
  lastSearchInfo: null,
  lastClearInfo: null,
  lastRemovalInfo: null,
  currentCategory: 'restaurant',
  verifierConsumed: false,
  searchVerifierConsumed: false,
  removalVerifierConsumed: false
}

// Step 2: Define the UI state that should make the verifier FAIL
const stateThatShouldFail = {
  items: [], // Empty cart - should fail
  currentStore: null,
  searchResults: [],
  lastSearchInfo: null,
  lastClearInfo: null,
  lastRemovalInfo: null,
  currentCategory: null,
  verifierConsumed: false,
  searchVerifierConsumed: false,
  removalVerifierConsumed: false
}

// Step 3: Function to run a verifier with a specific state
async function runVerifierWithState(verifierId, state, expectedResult) {
  console.log(`\n🧪 Testing: ${verifierId}`)
  console.log(`📦 State: ${JSON.stringify(state, null, 2)}`)
  console.log(`🎯 Expected: ${expectedResult}`)
  
  try {
    const response = await fetch('http://localhost:3000/api/verify/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        flowId: verifierId,
        cartState: state
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const result = await response.json()
    
    console.log(`📊 Actual Result: ${result.passed}`)
    console.log(`⏱️  Execution Time: ${result.executionTime}ms`)
    
    if (result.passed === expectedResult) {
      console.log(`✅ PASSED - Got ${result.passed} as expected`)
    } else {
      console.log(`❌ FAILED - Expected ${expectedResult}, got ${result.passed}`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    }
    
    return result.passed === expectedResult
    
  } catch (error) {
    console.log(`💥 ERROR - ${error.message}`)
    return false
  }
}

// Step 4: Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/verify?action=getAll')
    return response.ok
  } catch (error) {
    return false
  }
}

// Step 5: Run the tests
async function runTests() {
  console.log('🚀 Simple Test Walkthrough')
  console.log('=' .repeat(50))
  
  // Check if server is running
  console.log('🔍 Checking if development server is running...')
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log('❌ Development server is not running!')
    console.log('📝 Please start your development server first:')
    console.log('   npm run dev')
    console.log('   or')
    console.log('   yarn dev')
    console.log('')
    console.log('Then run this test again in another terminal.')
    process.exit(1)
  }
  
  console.log('✅ Development server is running!')
  
  // Test 1: Should PASS
  console.log('\n📋 Test 1: Verifier should PASS with correct state')
  const test1Passed = await runVerifierWithState('add-sweet-pretzel', stateThatShouldPass, true)
  
  // Test 2: Should FAIL  
  console.log('\n📋 Test 2: Verifier should FAIL with empty cart')
  const test2Passed = await runVerifierWithState('add-sweet-pretzel', stateThatShouldFail, false)
  
  // Summary
  console.log('\n📊 SUMMARY')
  console.log('=' .repeat(50))
  console.log(`Test 1 (Should Pass): ${test1Passed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Test 2 (Should Fail): ${test2Passed ? '✅ PASSED' : '❌ FAILED'}`)
  
  const allPassed = test1Passed && test2Passed
  console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
  
  if (!allPassed) {
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runVerifierWithState, stateThatShouldPass, stateThatShouldFail }

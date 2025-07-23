#!/usr/bin/env node

/**
 * Test script for the programmatic verifier API
 * 
 * Usage:
 *   node scripts/test-verifiers-api.js
 *   node scripts/test-verifiers-api.js <verifier-id>
 *   node scripts/test-verifiers-api.js <verifier-id> --with-cart-state
 */

const API_BASE_URL = 'http://localhost:3000/api/verify/run'

// Sample cart state for testing
const sampleCartState = {
  items: [
    {
      id: 'sweet-pretzel-123',
      itemName: 'sweet pretzel',
      price: 5.99,
      quantity: 1,
      storeName: 'Jamba Juice',
      restaurantId: 'jamba-juice',
      category: 'restaurant'
    }
  ],
  currentStore: {
    name: 'Jamba Juice',
    id: 'jamba-juice'
  },
  searchResults: [],
  lastSearchInfo: null,
  lastClearInfo: null,
  lastRemovalInfo: null,
  currentCategory: 'restaurant',
  verifierConsumed: false,
  searchVerifierConsumed: false,
  removalVerifierConsumed: false,
  quantityVerifierConsumed: false,
  orderVerifierConsumed: false,
  lastQuantityChangeInfo: null,
  lastOrderInfo: null
}

async function runVerifier(flowId, cartState = null) {
  try {
    console.log(`\n🧪 Testing verifier: ${flowId}`)
    console.log('─'.repeat(50))
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flowId,
        cartState
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Display results
    console.log(`📝 Description: ${result.description}`)
    console.log(`📂 Category: ${result.category}`)
    console.log(`⏱️  Execution Time: ${result.executionTime}ms`)
    console.log(`✅ Result: ${getResultEmoji(result.passed)} ${getResultText(result.passed)}`)
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`)
    }
    
    if (result.debugInfo) {
      console.log(`\n🔍 Debug Info:`)
      console.log(`   Cart Items: ${result.debugInfo.actualItems.length}`)
      if (result.debugInfo.actualItems.length > 0) {
        result.debugInfo.actualItems.forEach(item => {
          console.log(`   • ${item}`)
        })
      }
      console.log(`   Current Store: ${result.debugInfo.cartState.currentStore?.name || 'None'}`)
      console.log(`   Expected Items: ${result.debugInfo.expectedItems.join(', ') || 'None detected'}`)
    }
    
    if (result.consoleOutput && result.consoleOutput.length > 0) {
      console.log(`\n📜 Console Output:`)
      result.consoleOutput.forEach(log => {
        console.log(`   ${log}`)
      })
    }
    
    return result
    
  } catch (error) {
    console.error(`❌ Failed to run verifier ${flowId}:`, error.message)
    return null
  }
}

function getResultEmoji(passed) {
  if (passed === true) return '✅'
  if (passed === false) return '❌'
  return '❓'
}

function getResultText(passed) {
  if (passed === true) return 'PASSED'
  if (passed === false) return 'FAILED'
  return 'UNDEFINED'
}

async function getAllVerifiers() {
  try {
    const response = await fetch('http://localhost:3000/api/verify?action=getAll')
    const data = await response.json()
    return data.flows || []
  } catch (error) {
    console.error('Failed to get verifiers:', error.message)
    return []
  }
}

async function main() {
  const args = process.argv.slice(2)
  const specificVerifier = args[0]
  const withCartState = args.includes('--with-cart-state')
  
  console.log('🚀 Verifier API Test Script')
  console.log('=' .repeat(50))
  
  if (specificVerifier) {
    // Test specific verifier
    const cartState = withCartState ? sampleCartState : null
    if (withCartState) {
      console.log('📦 Using sample cart state with sweet pretzel from Jamba Juice')
    } else {
      console.log('📦 Using empty cart state')
    }
    
    await runVerifier(specificVerifier, cartState)
  } else {
    // Test all verifiers
    console.log('📋 Getting all available verifiers...')
    const verifiers = await getAllVerifiers()
    
    if (verifiers.length === 0) {
      console.log('❌ No verifiers found')
      return
    }
    
    console.log(`📊 Found ${verifiers.length} verifiers`)
    console.log('\n🧪 Testing all verifiers with empty cart state...')
    
    const results = []
    
    for (const verifier of verifiers) {
      const result = await runVerifier(verifier.flowId)
      if (result) {
        results.push(result)
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Summary
    console.log('\n📊 SUMMARY')
    console.log('=' .repeat(50))
    const passed = results.filter(r => r && r.passed === true).length
    const failed = results.filter(r => r && r.passed === false).length
    const undefinedResults = results.filter(r => r && r.passed === undefined).length
    
    console.log(`Total Tests: ${results.length}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`❓ Undefined: ${undefinedResults}`)
    
    // Show failed tests
    const failedTests = results.filter(r => r && r.passed === false)
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:')
      failedTests.forEach(test => {
        console.log(`   • ${test.flowId}: ${test.error || 'Verification failed'}`)
      })
    }
  }
}

// Handle command line usage
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { runVerifier, getAllVerifiers } 
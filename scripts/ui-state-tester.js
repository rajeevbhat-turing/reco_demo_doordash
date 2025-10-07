#!/usr/bin/env node

/**
 * UI State Tester - Automated Testing Framework for Verifiers
 * 
 * This script allows you to:
 * 1. Define specific UI states (cart contents, store context, etc.)
 * 2. Run verifiers against those states
 * 3. Assert expected pass/fail results
 * 4. Catch breaking changes in UI or verifiers
 */

const fs = require('fs')
const path = require('path')

// Test case structure
class TestCase {
  constructor(name, description, initialState, verifierId, expectedResult, timeout = 5000) {
    this.name = name
    this.description = description
    this.initialState = initialState
    this.verifierId = verifierId
    this.expectedResult = expectedResult // true, false, or 'error'
    this.timeout = timeout
  }
}

// Test suite configuration
class TestSuite {
  constructor(name) {
    this.name = name
    this.testCases = []
    this.results = []
  }

  addTestCase(testCase) {
    this.testCases.push(testCase)
  }

  async runAll() {
    console.log(`🧪 Running Test Suite: ${this.name}`)
    console.log('=' .repeat(60))
    
    for (const testCase of this.testCases) {
      await this.runTestCase(testCase)
    }
    
    this.printSummary()
  }

  async runTestCase(testCase) {
    console.log(`\n🔍 Testing: ${testCase.name}`)
    console.log(`📝 Description: ${testCase.description}`)
    console.log(`🎯 Expected: ${testCase.expectedResult}`)
    
    try {
      const result = await this.executeVerifier(testCase)
      const passed = this.evaluateResult(result, testCase.expectedResult)
      
      const testResult = {
        name: testCase.name,
        passed,
        expected: testCase.expectedResult,
        actual: result.passed,
        error: result.error,
        executionTime: result.executionTime,
        debugInfo: result.debugInfo
      }
      
      this.results.push(testResult)
      
      if (passed) {
        console.log(`✅ PASSED - Verifier returned ${result.passed} as expected`)
      } else {
        console.log(`❌ FAILED - Expected ${testCase.expectedResult}, got ${result.passed}`)
        if (result.error) {
          console.log(`   Error: ${result.error}`)
        }
      }
      
    } catch (error) {
      console.log(`💥 ERROR - Test execution failed: ${error.message}`)
      this.results.push({
        name: testCase.name,
        passed: false,
        expected: testCase.expectedResult,
        actual: 'error',
        error: error.message
      })
    }
  }

  async executeVerifier(testCase) {
    // Make API call to run verifier with specific state
    const response = await fetch('http://localhost:3000/api/verify/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        flowId: testCase.verifierId,
        cartState: testCase.initialState
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  evaluateResult(result, expected) {
    if (expected === 'error') {
      return result.error !== null
    }
    return result.passed === expected
  }

  printSummary() {
    console.log('\n📊 TEST SUITE SUMMARY')
    console.log('=' .repeat(60))
    
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length
    
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}: Expected ${result.expected}, got ${result.actual}`)
        if (result.error) {
          console.log(`    Error: ${result.error}`)
        }
      })
    }
  }
}

// Predefined UI states for common scenarios
const UIStates = {
  emptyCart: {
    items: [],
    currentStore: null,
    searchResults: [],
    lastSearchInfo: null,
    lastClearInfo: null,
    lastRemovalInfo: null,
    currentCategory: null,
    verifierConsumed: false,
    searchVerifierConsumed: false,
    removalVerifierConsumed: false
  },

  cartWithSweetPretzel: {
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
  },

  cartWithThreeItems: {
    items: [
      { itemName: 'Item 1', quantity: 1, price: 5.99 },
      { itemName: 'Item 2', quantity: 2, price: 3.50 },
      { itemName: 'Item 3', quantity: 1, price: 7.99 }
    ],
    currentStore: {
      name: 'Test Store',
      id: 'test-store'
    },
    searchResults: [],
    lastSearchInfo: null,
    lastClearInfo: {
      itemsBeforeClear: 3,
      timestamp: new Date().toISOString()
    },
    lastRemovalInfo: null,
    currentCategory: 'restaurant',
    verifierConsumed: false,
    searchVerifierConsumed: false,
    removalVerifierConsumed: false
  },

  atSafewayWithMilk: {
    items: [{
      itemName: 'Gallon of Milk',
      quantity: 1,
      price: 4.99
    }],
    currentStore: {
      name: 'Safeway',
      id: 'safeway'
    },
    searchResults: [{
      name: 'Safeway',
      id: 'safeway'
    }],
    lastSearchInfo: {
      query: 'Safeway',
      results: ['Safeway']
    },
    lastClearInfo: null,
    lastRemovalInfo: null,
    currentCategory: 'grocery',
    verifierConsumed: false,
    searchVerifierConsumed: false,
    removalVerifierConsumed: false
  },

  atGusMarketWithFruits: {
    items: [
      { itemName: 'Avocado', quantity: 1, price: 2.99 },
      { itemName: 'Kiwi', quantity: 3, price: 1.50 },
      { itemName: 'Strawberries', quantity: 1, price: 4.99 }
    ],
    currentStore: {
      name: "Gus's Community Market",
      id: 'gus-market'
    },
    searchResults: [],
    lastSearchInfo: null,
    lastClearInfo: null,
    lastRemovalInfo: null,
    currentCategory: 'grocery',
    verifierConsumed: false,
    searchVerifierConsumed: false,
    removalVerifierConsumed: false
  }
}

// Create test suites
function createRegressionTestSuite() {
  const suite = new TestSuite('Regression Tests - UI Changes')
  
  // Test cases that should PASS
  suite.addTestCase(new TestCase(
    'Sweet Pretzel - Should Pass',
    'Verifier should pass when cart contains exactly 1 sweet pretzel from Jamba Juice',
    UIStates.cartWithSweetPretzel,
    'add-sweet-pretzel',
    true
  ))

  suite.addTestCase(new TestCase(
    'Clear Cart - Should Pass',
    'Verifier should pass when cart was cleared with exactly 3 items',
    UIStates.cartWithThreeItems,
    'clear-cart',
    true
  ))

  suite.addTestCase(new TestCase(
    'Safeway Milk - Should Pass',
    'Verifier should pass when at Safeway with 1 milk item',
    UIStates.atSafewayWithMilk,
    'add-milk-from-safeway',
    true
  ))

  suite.addTestCase(new TestCase(
    'Gus Market Fruits - Should Pass',
    'Verifier should pass when at Gus Market with correct fruit quantities',
    UIStates.atGusMarketWithFruits,
    'add-fruits',
    true
  ))

  // Test cases that should FAIL
  suite.addTestCase(new TestCase(
    'Sweet Pretzel - Empty Cart Should Fail',
    'Verifier should fail when cart is empty',
    UIStates.emptyCart,
    'add-sweet-pretzel',
    false
  ))

  suite.addTestCase(new TestCase(
    'Clear Cart - Empty Cart Should Fail',
    'Verifier should fail when no clear action was performed',
    UIStates.emptyCart,
    'clear-cart',
    false
  ))

  suite.addTestCase(new TestCase(
    'Safeway Milk - Wrong Store Should Fail',
    'Verifier should fail when not at Safeway',
    UIStates.cartWithSweetPretzel,
    'add-milk-from-safeway',
    false
  ))

  return suite
}

function createBreakingChangeTestSuite() {
  const suite = new TestSuite('Breaking Change Detection')
  
  // Test verifier consumption flags
  suite.addTestCase(new TestCase(
    'Verifier Already Consumed',
    'Verifier should fail when already consumed',
    {
      ...UIStates.cartWithSweetPretzel,
      verifierConsumed: true
    },
    'add-sweet-pretzel',
    false
  ))

  // Test with malformed state
  suite.addTestCase(new TestCase(
    'Malformed Cart State',
    'Verifier should handle malformed state gracefully',
    {
      items: null,
      currentStore: undefined
    },
    'add-sweet-pretzel',
    'error'
  ))

  return suite
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const suiteType = args[0] || 'regression'
  
  console.log('🚀 UI State Tester - Automated Verifier Testing')
  console.log('=' .repeat(60))
  
  let suite
  switch (suiteType) {
    case 'regression':
      suite = createRegressionTestSuite()
      break
    case 'breaking':
      suite = createBreakingChangeTestSuite()
      break
    case 'all':
      // Run both suites
      const regressionSuite = createRegressionTestSuite()
      const breakingSuite = createBreakingChangeTestSuite()
      
      await regressionSuite.runAll()
      console.log('\n' + '=' .repeat(60))
      await breakingSuite.runAll()
      return
    default:
      console.log('Usage: node ui-state-tester.js [regression|breaking|all]')
      process.exit(1)
  }
  
  await suite.runAll()
}

// Export for use in other scripts
module.exports = {
  TestCase,
  TestSuite,
  UIStates,
  createRegressionTestSuite,
  createBreakingChangeTestSuite
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}


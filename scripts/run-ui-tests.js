#!/usr/bin/env node

/**
 * UI Test Runner - Simple CLI to run UI state tests
 * 
 * Usage:
 *   node run-ui-tests.js                    # Run all tests
 *   node run-ui-tests.js regression         # Run regression tests only
 *   node run-ui-tests.js breaking           # Run breaking change tests only
 *   node run-ui-tests.js ui-changes         # Run UI change impact tests
 *   node run-ui-tests.js --watch            # Watch mode (re-run on file changes)
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

// Load test configuration
const configPath = path.join(__dirname, '..', 'config', 'test-configs', 'ui-tests.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

class UITestRunner {
  constructor() {
    this.results = []
    this.startTime = Date.now()
  }

  async runTestSuite(suiteName) {
    const suite = config.testSuites[suiteName]
    if (!suite) {
      console.log(`❌ Test suite '${suiteName}' not found`)
      return
    }

    console.log(`\n🧪 Running: ${suite.name}`)
    console.log(`📝 ${suite.description}`)
    console.log('=' .repeat(60))

    for (const testCase of suite.testCases) {
      await this.runTestCase(testCase)
    }
  }

  async runTestCase(testCase) {
    console.log(`\n🔍 ${testCase.name}`)
    console.log(`   ${testCase.description}`)
    console.log(`   Expected: ${testCase.expectedResult}`)

    try {
      const result = await this.executeVerifier(testCase)
      const passed = this.evaluateResult(result, testCase.expectedResult)
      
      const testResult = {
        name: testCase.name,
        suite: testCase.suite || 'unknown',
        passed,
        expected: testCase.expectedResult,
        actual: result.passed,
        error: result.error,
        executionTime: result.executionTime
      }
      
      this.results.push(testResult)
      
      if (passed) {
        console.log(`   ✅ PASSED (${result.executionTime}ms)`)
      } else {
        console.log(`   ❌ FAILED - Expected ${testCase.expectedResult}, got ${result.passed}`)
        if (result.error) {
          console.log(`   Error: ${result.error}`)
        }
      }
      
    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`)
      this.results.push({
        name: testCase.name,
        suite: testCase.suite || 'unknown',
        passed: false,
        expected: testCase.expectedResult,
        actual: 'error',
        error: error.message
      })
    }
  }

  async executeVerifier(testCase) {
    const uiState = config.uiStates[testCase.initialState]
    if (!uiState) {
      throw new Error(`UI state '${testCase.initialState}' not found`)
    }

    const response = await fetch('http://localhost:3000/api/verify/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        flowId: testCase.verifierId,
        cartState: uiState
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
    const duration = Date.now() - this.startTime
    console.log('\n📊 TEST SUMMARY')
    console.log('=' .repeat(60))
    
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length
    
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}`)
        console.log(`    Expected: ${result.expected}, Got: ${result.actual}`)
        if (result.error) {
          console.log(`    Error: ${result.error}`)
        }
      })
    }

    // Exit with error code if any tests failed
    if (failed > 0) {
      process.exit(1)
    }
  }

  async runAll() {
    console.log('🚀 UI State Test Runner')
    console.log('=' .repeat(60))
    
    const suites = Object.keys(config.testSuites)
    
    for (const suiteName of suites) {
      await this.runTestSuite(suiteName)
    }
    
    this.printSummary()
  }
}

// Watch mode implementation
class WatchMode {
  constructor(testRunner) {
    this.testRunner = testRunner
    this.watchedFiles = [
      path.join(__dirname, '..', 'app'),
      path.join(__dirname, '..', 'config')
    ]
  }

  async start() {
    console.log('👀 Watch mode enabled - monitoring file changes...')
    console.log('Press Ctrl+C to stop')
    
    // Run initial test
    await this.testRunner.runAll()
    
    // Set up file watching
    this.watchedFiles.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (filename && (filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.json'))) {
            console.log(`\n🔄 File changed: ${filename}`)
            setTimeout(() => this.testRunner.runAll(), 1000) // Debounce
          }
        })
      }
    })
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const suiteName = args[0]
  const watchMode = args.includes('--watch')
  
  const testRunner = new UITestRunner()
  
  if (watchMode) {
    const watcher = new WatchMode(testRunner)
    await watcher.start()
  } else if (suiteName) {
    await testRunner.runTestSuite(suiteName)
    testRunner.printSummary()
  } else {
    await testRunner.runAll()
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...')
  process.exit(0)
})

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { UITestRunner, WatchMode }

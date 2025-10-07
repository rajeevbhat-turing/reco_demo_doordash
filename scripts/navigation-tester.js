#!/usr/bin/env node

/**
 * Navigation Tester - Tests actual user interactions and navigation
 * 
 * This extends the state-based testing to include real browser interactions
 * to catch UI changes that break navigation flows.
 */

const { chromium } = require('playwright') // You'll need to install: npm install playwright

class NavigationTester {
  constructor() {
    this.browser = null
    this.page = null
    this.baseUrl = 'http://localhost:3000'
  }

  async setup() {
    console.log('🌐 Starting browser...')
    this.browser = await chromium.launch({ headless: false }) // Set to true for CI
    this.page = await this.browser.newPage()
    
    // Set viewport
    await this.page.setViewportSize({ width: 1280, height: 720 })
    
    // Navigate to the app
    await this.page.goto(this.baseUrl)
    await this.page.waitForLoadState('networkidle')
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  async clearAppState() {
    console.log('🧹 Clearing application state...')
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')
  }

  async testSweetPretzelFlow() {
    console.log('\n🧪 Testing: Sweet Pretzel Navigation Flow')
    console.log('=' .repeat(50))

    try {
      // Step 1: Navigate to restaurants
      console.log('📍 Step 1: Navigate to restaurants section')
      await this.page.click('text=Restaurants')
      await this.page.waitForLoadState('networkidle')

      // Step 2: Search for Jamba Juice
      console.log('🔍 Step 2: Search for Jamba Juice')
      await this.page.fill('input[placeholder*="search"], input[type="search"]', 'Jamba Juice')
      await this.page.press('input[placeholder*="search"], input[type="search"]', 'Enter')
      await this.page.waitForLoadState('networkidle')

      // Step 3: Click on Jamba Juice store
      console.log('🏪 Step 3: Click on Jamba Juice store')
      await this.page.click('text=Jamba Juice')
      await this.page.waitForLoadState('networkidle')

      // Step 4: Find and click sweet pretzel
      console.log('🥨 Step 4: Find and add sweet pretzel')
      await this.page.click('text=sweet pretzel')
      await this.page.waitForTimeout(1000) // Wait for cart update

      // Step 5: Verify the item was added
      console.log('✅ Step 5: Verify item was added to cart')
      const cartItems = await this.page.evaluate(() => {
        const cartState = JSON.parse(localStorage.getItem('multicategory-cart') || '{}')
        return cartState.state?.items || []
      })

      console.log('📦 Cart items:', cartItems)

      // Step 6: Run the verifier
      console.log('🔍 Step 6: Run the verifier')
      const verifierResult = await this.page.evaluate(async () => {
        const response = await fetch('/api/verify/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flowId: 'add-sweet-pretzel' })
        })
        return await response.json()
      })

      console.log('📊 Verifier result:', verifierResult)

      // Evaluate the test
      const passed = verifierResult.passed === true
      console.log(`🎯 Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
      
      if (!passed) {
        console.log('❌ Verifier failed:', verifierResult.error || 'Unknown error')
      }

      return {
        testName: 'Sweet Pretzel Navigation Flow',
        passed,
        cartItems,
        verifierResult
      }

    } catch (error) {
      console.log(`💥 Navigation test failed: ${error.message}`)
      return {
        testName: 'Sweet Pretzel Navigation Flow',
        passed: false,
        error: error.message
      }
    }
  }

  async testClearCartFlow() {
    console.log('\n🧪 Testing: Clear Cart Navigation Flow')
    console.log('=' .repeat(50))

    try {
      // First, add some items to the cart
      console.log('📦 Step 1: Add items to cart')
      await this.page.evaluate(() => {
        const cartState = {
          state: {
            items: [
              { itemName: 'Item 1', quantity: 1, price: 5.99 },
              { itemName: 'Item 2', quantity: 2, price: 3.50 },
              { itemName: 'Item 3', quantity: 1, price: 7.99 }
            ],
            currentStore: { name: 'Test Store', id: 'test-store' },
            currentCategory: 'restaurant',
            verifierConsumed: false
          }
        }
        localStorage.setItem('multicategory-cart', JSON.stringify(cartState))
      })

      // Navigate to cart
      console.log('🛒 Step 2: Navigate to cart')
      await this.page.click('text=Cart')
      await this.page.waitForLoadState('networkidle')

      // Click clear cart button
      console.log('🗑️ Step 3: Click clear cart button')
      await this.page.click('text=Clear Cart, button[data-testid="clear-cart"]')
      await this.page.waitForTimeout(1000)

      // Run the verifier
      console.log('🔍 Step 4: Run the verifier')
      const verifierResult = await this.page.evaluate(async () => {
        const response = await fetch('/api/verify/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flowId: 'clear-cart' })
        })
        return await response.json()
      })

      console.log('📊 Verifier result:', verifierResult)

      const passed = verifierResult.passed === true
      console.log(`🎯 Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`)

      return {
        testName: 'Clear Cart Navigation Flow',
        passed,
        verifierResult
      }

    } catch (error) {
      console.log(`💥 Navigation test failed: ${error.message}`)
      return {
        testName: 'Clear Cart Navigation Flow',
        passed: false,
        error: error.message
      }
    }
  }

  async runAllNavigationTests() {
    console.log('🚀 Navigation Testing Suite')
    console.log('=' .repeat(60))

    const results = []

    try {
      await this.setup()
      await this.clearAppState()

      // Run navigation tests
      results.push(await this.testSweetPretzelFlow())
      results.push(await this.testClearCartFlow())

      // Print summary
      console.log('\n📊 NAVIGATION TEST SUMMARY')
      console.log('=' .repeat(60))
      
      const passed = results.filter(r => r.passed).length
      const failed = results.filter(r => !r.passed).length
      
      console.log(`Total Tests: ${results.length}`)
      console.log(`✅ Passed: ${passed}`)
      console.log(`❌ Failed: ${failed}`)
      
      if (failed > 0) {
        console.log('\n❌ Failed Tests:')
        results.filter(r => !r.passed).forEach(result => {
          console.log(`  - ${result.testName}: ${result.error || 'Verifier failed'}`)
        })
      }

      return results

    } finally {
      await this.cleanup()
    }
  }
}

// Simple version without Playwright (using existing browser-verifier.js approach)
class SimpleNavigationTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000'
  }

  async testWithBrowserAutomation() {
    console.log('🌐 Simple Navigation Testing')
    console.log('=' .repeat(50))
    console.log('📝 This would use your existing browser-verifier.js approach')
    console.log('📝 Or you could use Puppeteer/Playwright for full automation')
    console.log('')
    console.log('🔧 To implement:')
    console.log('1. Install Playwright: npm install playwright')
    console.log('2. Run: npx playwright install')
    console.log('3. Use the NavigationTester class above')
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const usePlaywright = args.includes('--playwright')
  
  if (usePlaywright) {
    const tester = new NavigationTester()
    await tester.runAllNavigationTests()
  } else {
    const tester = new SimpleNavigationTester()
    await tester.testWithBrowserAutomation()
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { NavigationTester, SimpleNavigationTester }


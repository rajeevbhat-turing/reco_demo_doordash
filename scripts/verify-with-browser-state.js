#!/usr/bin/env node

/**
 * Script to verify with actual browser localStorage state
 * 
 * Usage:
 *   node scripts/verify-with-browser-state.js <verifier-id> <localStorage-json>
 *   
 * Example:
 *   node scripts/verify-with-browser-state.js search-starbucks '{"multicategory-cart":"{\"state\":{...}}"}'
 */

const API_BASE_URL = 'http://localhost:3000/api/verify/run'

async function verifyWithBrowserState(flowId, localStorageData) {
  try {
    console.log(`\n🧪 Testing verifier: ${flowId}`)
    console.log('─'.repeat(50))
    console.log('📦 Using actual browser localStorage data')
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flowId,
        localStorage: localStorageData
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

async function main() {
  const args = process.argv.slice(2)
  const flowId = args[0]
  const localStorageJson = args[1]
  
  if (!flowId) {
    console.error('❌ Usage: node scripts/verify-with-browser-state.js <verifier-id> <localStorage-json>')
    console.error('\nTo get localStorage data, run this in your browser console:')
    console.error('JSON.stringify(localStorage)')
    process.exit(1)
  }
  
  if (!localStorageJson) {
    console.error('❌ localStorage JSON data is required')
    console.error('\nTo get localStorage data, run this in your browser console:')
    console.error('JSON.stringify(localStorage)')
    console.error('\nThen copy the output and pass it as the second argument.')
    process.exit(1)
  }
  
  let localStorageData
  try {
    localStorageData = JSON.parse(localStorageJson)
  } catch (error) {
    console.error('❌ Invalid JSON for localStorage data:', error.message)
    process.exit(1)
  }
  
  console.log('🚀 Browser State Verifier')
  console.log('=' .repeat(50))
  
  await verifyWithBrowserState(flowId, localStorageData)
}

// Handle command line usage
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { verifyWithBrowserState } 
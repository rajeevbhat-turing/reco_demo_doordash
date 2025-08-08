/**
 * Browser-side verifier script
 * 
 * Copy and paste this into your browser console to verify against current UI state
 * 
 * Usage:
 *   verifyCurrentState('search-starbucks')
 */

async function verifyCurrentState(flowId) {
  try {
    console.log(`🧪 Testing verifier: ${flowId}`);
    console.log('─'.repeat(50));
    console.log('📦 Using current browser localStorage state');
    
    // Get current localStorage data
    const localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      localStorageData[key] = localStorage.getItem(key);
    }
    
    const response = await fetch('http://localhost:3000/api/verify/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flowId,
        localStorage: localStorageData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Display results
    console.log(`📝 Description: ${result.description}`);
    console.log(`📂 Category: ${result.category}`);
    console.log(`⏱️  Execution Time: ${result.executionTime}ms`);
    console.log(`✅ Result: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    
    if (result.debugInfo) {
      console.log(`\n🔍 Debug Info:`);
      console.log(`   Cart Items: ${result.debugInfo.actualItems.length}`);
      if (result.debugInfo.actualItems.length > 0) {
        result.debugInfo.actualItems.forEach(item => {
          console.log(`   • ${item}`);
        });
      }
      console.log(`   Current Store: ${result.debugInfo.cartState.currentStore?.name || 'None'}`);
      console.log(`   Expected Items: ${result.debugInfo.expectedItems.join(', ') || 'None detected'}`);
    }
    
    if (result.consoleOutput && result.consoleOutput.length > 0) {
      console.log(`\n📜 Console Output:`);
      result.consoleOutput.forEach(log => {
        console.log(`   ${log}`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to run verifier ${flowId}:`, error.message);
    return null;
  }
}

// Helper function to get all available verifiers
async function getAvailableVerifiers() {
  try {
    const response = await fetch('http://localhost:3000/api/verify?action=getAll');
    const data = await response.json();
    console.log('📋 Available Verifiers:');
    data.flows.forEach(flow => {
      console.log(`   • ${flow.flowId} - ${flow.description}`);
    });
    return data.flows;
  } catch (error) {
    console.error('Failed to get verifiers:', error.message);
    return [];
  }
}

// Helper to show current cart state
function showCurrentCartState() {
  try {
    const cartData = JSON.parse(localStorage.getItem('multicategory-cart') || '{}');
    const state = cartData.state;
    
    console.log('🛒 Current Cart State:');
    console.log(`   Items: ${state?.items?.length || 0}`);
    if (state?.items?.length > 0) {
      state.items.forEach(item => {
        console.log(`   • ${item.itemName || item.name} x${item.quantity} from ${item.storeName}`);
      });
    }
    console.log(`   Current Store: ${state?.currentStore?.name || 'None'}`);
    console.log(`   Category: ${state?.currentCategory || 'None'}`);
    console.log(`   Search Results: ${state?.searchResults?.length || 0}`);
    
    return state;
  } catch (error) {
    console.error('Failed to parse cart state:', error.message);
    return null;
  }
}

console.log('🚀 Browser Verifier Loaded!');
console.log('Usage:');
console.log('  verifyCurrentState("search-starbucks")  - Test a specific verifier');
console.log('  getAvailableVerifiers()                 - List all verifiers');
console.log('  showCurrentCartState()                  - Show current cart state');

// Export functions to global scope
window.verifyCurrentState = verifyCurrentState;
window.getAvailableVerifiers = getAvailableVerifiers;
window.showCurrentCartState = showCurrentCartState; 
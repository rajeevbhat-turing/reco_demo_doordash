/**
 * Agent Verifier - Simple function for computer use agents
 * 
 * Usage:
 *   1. Agent loads this script or injects it into the page
 *   2. Agent calls: await runVerifier('search-starbucks')
 *   3. Gets back a simple result object
 */

window.runVerifier = async function(flowId) {
  try {
    console.log(`🤖 Agent running verifier: ${flowId}`);
    
    // Extract current localStorage data
    const localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      localStorageData[key] = localStorage.getItem(key);
    }
    
    // Call the API
    const response = await fetch('/api/verify/run', {
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
    
    // Log results for debugging
    console.log(`✅ Verifier ${flowId}: ${result.passed ? 'PASSED' : 'FAILED'}`);
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    
    // Return simplified result for agent
    return {
      flowId: result.flowId,
      passed: result.passed,
      success: result.passed === true,
      failed: result.passed === false,
      error: result.error,
      executionTime: result.executionTime,
      description: result.description,
      // Additional debug info if needed
      debug: {
        cartItems: result.debugInfo?.actualItems?.length || 0,
        currentStore: result.debugInfo?.cartState?.currentStore?.name || null,
        expectedItems: result.debugInfo?.expectedItems || []
      }
    };
    
  } catch (error) {
    console.error(`❌ Agent verifier failed for ${flowId}:`, error.message);
    return {
      flowId,
      passed: false,
      success: false,
      failed: true,
      error: error.message,
      executionTime: 0,
      description: null,
      debug: null
    };
  }
};

// Helper function to get all available verifiers
window.getVerifiers = async function() {
  try {
    const response = await fetch('/api/verify?action=getAll');
    const data = await response.json();
    return data.flows.map(flow => ({
      id: flow.flowId,
      description: flow.description,
      category: flow.category
    }));
  } catch (error) {
    console.error('Failed to get verifiers:', error.message);
    return [];
  }
};

// Helper function to show current cart state
window.getCurrentState = function() {
  try {
    const cartData = JSON.parse(localStorage.getItem('multicategory-cart') || '{}');
    const state = cartData.state;
    
    return {
      cartItems: state?.items?.length || 0,
      currentStore: state?.currentStore?.name || null,
      category: state?.currentCategory || null,
      searchResults: state?.searchResults?.length || 0,
      items: state?.items?.map(item => ({
        name: item.itemName || item.name,
        quantity: item.quantity,
        store: item.storeName
      })) || []
    };
  } catch (error) {
    console.error('Failed to get current state:', error.message);
    return null;
  }
};

// Auto-load notification
console.log('🤖 Agent Verifier loaded! Available functions:');
console.log('  runVerifier(flowId) - Run a specific verifier');
console.log('  getVerifiers() - Get all available verifiers');
console.log('  getCurrentState() - Get current cart/UI state');
console.log('');
console.log('Example: await runVerifier("search-starbucks")');

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runVerifier: window.runVerifier, getVerifiers: window.getVerifiers, getCurrentState: window.getCurrentState };
} 
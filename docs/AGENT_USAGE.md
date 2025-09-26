# Agent Verifier Usage Guide

This guide shows computer use agents how to easily run verifiers on the DoorDash UI clone.

## 🚀 Quick Start

### Method 1: Load the Agent Script (Recommended)

**Step 1:** Load the agent script in the browser:
```javascript
// Inject this script into the page
const script = document.createElement('script');
script.src = '/agent-verifier.js';
document.head.appendChild(script);
```

**Step 2:** Wait for it to load, then use:
```javascript
// Run a verifier
const result = await runVerifier('search-starbucks');
console.log(result.success); // true/false
```

### Method 2: One-Liner Injection

Inject this complete function directly into the page:

```javascript
window.runVerifier = async function(flowId) {
  const localStorageData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageData[key] = localStorage.getItem(key);
  }
  const response = await fetch('/api/verify/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flowId, localStorage: localStorageData })
  });
  const result = await response.json();
  return { success: result.passed === true, failed: result.passed === false, ...result };
};

// Then use it
const result = await runVerifier('search-starbucks');
```

## 📋 Available Functions

### `runVerifier(flowId)`
Runs a specific verifier against the current UI state.

**Parameters:**
- `flowId` (string): The verifier ID to run

**Returns:**
```javascript
{
  flowId: "search-starbucks",
  passed: true,           // true, false, or undefined
  success: true,          // true if passed === true
  failed: false,          // true if passed === false
  error: null,            // error message if failed
  executionTime: 1.23,    // milliseconds
  description: "Search for 'starbucks' and navigate to a Starbucks store",
  debug: {
    cartItems: 0,
    currentStore: "Starbucks (299 Fremont Street)",
    expectedItems: []
  }
}
```

### `getVerifiers()`
Gets all available verifiers.

**Returns:**
```javascript
[
  {
    id: "search-starbucks",
    description: "Search for 'starbucks' and navigate to a Starbucks store",
    category: "search"
  },
  // ... more verifiers
]
```

### `getCurrentState()`
Gets the current UI/cart state.

**Returns:**
```javascript
{
  cartItems: 2,
  currentStore: "Starbucks (299 Fremont Street)",
  category: "restaurant",
  searchResults: 0,
  items: [
    { name: "Latte", quantity: 1, store: "Starbucks" }
  ]
}
```

## 🎯 Agent Workflow

Here's the typical workflow for a computer use agent:

```javascript
// 1. Load the verifier functions (one-time setup)
const script = document.createElement('script');
script.src = '/agent-verifier.js';
document.head.appendChild(script);
await new Promise(resolve => script.onload = resolve);

// 2. Perform UI actions (search, navigate, add items, etc.)
// ... agent performs task on the UI ...

// 3. Run the verifier to check if task was completed successfully
const result = await runVerifier('search-starbucks');

// 4. Check the result
if (result.success) {
  console.log('✅ Task completed successfully!');
} else {
  console.log('❌ Task failed:', result.error);
  // Agent can retry or take corrective action
}
```

## 📖 Common Verifier IDs

### Search Verifiers
- `search-starbucks` - Search for 'starbucks' and navigate to a Starbucks store
- `search-target` - Search for 'target' and navigate to Target Store
- `find-pizza-restaurants` - Search for pizza restaurants
- `find-dessert-restaurants` - Search for dessert restaurants

### Cart Verifiers
- `add-sweet-pretzel` - Add a sweet pretzel from Jamba Juice to the cart
- `pick-meal-under-10` - Pick a meal under $10
- `add-cooler-bag` - Add a Blue Cooler Bag from Boichik Bagels
- `add-most-ordered` - Add Mint Mojito Iced Coffee from Philz Coffee
- `add-customized-croissant` - Add customized Ham, Egg and Cheese Croissant
- `add-two-custom-lattes` - Add 2 customized Caffè Lattes from Starbucks

## 🔧 Error Handling

```javascript
const result = await runVerifier('search-starbucks');

if (result.error) {
  console.error('Verifier failed:', result.error);
  // Handle the error - maybe retry the task
} else if (result.success) {
  console.log('Task completed successfully!');
} else {
  console.log('Task conditions not met - need to continue working');
  // Check result.debug for more details about current state
}
```

## 🐛 Debugging

```javascript
// Check current state before running verifier
const state = getCurrentState();
console.log('Current state:', state);

// Run verifier with full debug info
const result = await runVerifier('search-starbucks');
console.log('Debug info:', result.debug);

// Get all available verifiers
const verifiers = await getVerifiers();
console.log('Available verifiers:', verifiers);
```

## 💡 Tips for Agents

1. **Always load the script first** before trying to use the functions
2. **Check `result.success`** for a simple true/false result
3. **Use `result.debug`** to understand why a verifier failed
4. **Call `getCurrentState()`** to see what the UI state looks like
5. **Handle errors gracefully** - network issues can cause API calls to fail
6. **Wait for UI actions to complete** before running verifiers (use appropriate delays)

## 🚨 Common Issues

**Issue:** `runVerifier is not defined`
**Solution:** Make sure you loaded the agent script first

**Issue:** Verifier returns `failed: true` even though task looks complete
**Solution:** Check `result.debug.currentStore` - you might not be on the right page

**Issue:** API returns 404 error
**Solution:** Make sure the development server is running on localhost:3000

**Issue:** Verifier returns `undefined` result
**Solution:** The verifier logic might have an error - check `result.error` for details 
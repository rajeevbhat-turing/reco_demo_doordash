# Verifier API Documentation

This document describes the programmatic API for running DoorDash UI verifiers.

## Overview

The verifier system allows you to programmatically test specific user flows and interactions in the DoorDash clone application. Each verifier checks for specific conditions in the cart state, search results, or UI state.

## API Endpoints

### 1. Run Verifier - POST `/api/verify/run`

Execute a specific verifier with optional cart state.

**Request Body:**
```json
{
  "flowId": "add-sweet-pretzel",
  "cartState": {
    "items": [...],
    "currentStore": {...},
    "searchResults": [...],
    // ... other cart state properties
  }
}
```

**Response:**
```json
{
  "flowId": "add-sweet-pretzel",
  "passed": true,
  "error": null,
  "executionTime": 1.23,
  "consoleOutput": ["[LOG] Verifier output..."],
  "description": "Add a sweet pretzel from Jamba Juice to the cart",
  "category": "restaurant-cart",
  "debugInfo": {
    "cartState": {...},
    "expectedItems": ["sweet pretzel"],
    "actualItems": ["sweet pretzel x1"]
  }
}
```

### 2. Run Verifier - GET `/api/verify/run?flowId=<id>`

Execute a specific verifier with empty cart state (useful for testing verifiers that should fail).

**Response:** Same as POST method.

### 3. Get All Verifiers - GET `/api/verify?action=getAll`

Retrieve a list of all available verifiers.

**Response:**
```json
{
  "flows": [
    {
      "flowId": "add-sweet-pretzel",
      "description": "Add a sweet pretzel from Jamba Juice to the cart",
      "category": "restaurant-cart"
    },
    // ... more verifiers
  ]
}
```

## Available Verifiers

The system includes several categories of verifiers:

### Restaurant Cart Verifiers
- `add-sweet-pretzel` - Add a sweet pretzel from Jamba Juice
- `pick-meal-under-10` - Pick a meal under $10
- `add-cooler-bag` - Add a Blue Cooler Bag from Boichik Bagels
- `add-most-ordered` - Add Mint Mojito Iced Coffee from Philz Coffee
- `add-customized-croissant` - Add customized Ham, Egg and Cheese Croissant
- `add-two-custom-lattes` - Add 2 customized Caffè Lattes from Starbucks

### Search Verifiers
- `search-target` - Search for 'target' and navigate to Target Store
- `search-starbucks` - Search for 'starbucks' and navigate to Starbucks
- `find-pizza-restaurants` - Search for pizza restaurants
- `find-dessert-restaurants` - Search for dessert restaurants with average pricing

## Usage Examples

### Using cURL

```bash
# Test a specific verifier with empty cart
curl -X POST http://localhost:3000/api/verify/run \
  -H "Content-Type: application/json" \
  -d '{"flowId": "add-sweet-pretzel"}'

# Test a verifier with cart state
curl -X POST http://localhost:3000/api/verify/run \
  -H "Content-Type: application/json" \
  -d '{
    "flowId": "add-sweet-pretzel",
    "cartState": {
      "items": [{
        "id": "sweet-pretzel-123",
        "itemName": "sweet pretzel",
        "price": 5.99,
        "quantity": 1,
        "storeName": "Jamba Juice",
        "restaurantId": "jamba-juice",
        "category": "restaurant"
      }],
      "currentStore": {"name": "Jamba Juice", "id": "jamba-juice"},
      "currentCategory": "restaurant"
    }
  }'

# Get all available verifiers
curl http://localhost:3000/api/verify?action=getAll
```

### Using Node.js/JavaScript

```javascript
// Test a specific verifier
async function testVerifier(flowId, cartState = null) {
  const response = await fetch('http://localhost:3000/api/verify/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flowId, cartState })
  })
  
  const result = await response.json()
  console.log(`Verifier ${flowId}: ${result.passed ? 'PASSED' : 'FAILED'}`)
  return result
}

// Example usage
testVerifier('add-sweet-pretzel', {
  items: [{
    itemName: 'sweet pretzel',
    storeName: 'Jamba Juice',
    quantity: 1
  }],
  currentStore: { name: 'Jamba Juice' }
})
```

### Using the Test Script

```bash
# Test all verifiers
node scripts/test-verifiers-api.js

# Test specific verifier with empty cart
node scripts/test-verifiers-api.js add-sweet-pretzel

# Test specific verifier with sample cart state
node scripts/test-verifiers-api.js add-sweet-pretzel --with-cart-state
```

## Cart State Structure

The `cartState` object should include:

```typescript
interface CartState {
  items: Array<{
    id: string | number
    itemName: string
    price: number | string
    quantity: number
    storeName?: string
    restaurantId?: string
    storeId?: string
    category: 'restaurant' | 'grocery' | 'retail' | 'pets' | 'convenience'
    customizations?: string
  }>
  currentStore: {
    name: string
    id: string
  } | null
  searchResults: Array<{
    id: string
    name: string
    type: 'restaurant' | 'menu-item'
    // ... other search result properties
  }>
  lastSearchInfo: {
    searchTerm: string
    timestamp: number
    navigatedFromSearch: boolean
  } | null
  currentCategory: string
  verifierConsumed: boolean
  searchVerifierConsumed: boolean
  removalVerifierConsumed: boolean
  // ... other state properties
}
```

## Response Fields

- `flowId`: The ID of the verifier that was executed
- `passed`: Boolean result (true/false) or undefined
- `error`: Error message if execution failed, null otherwise
- `executionTime`: Time taken to execute the verifier in milliseconds
- `consoleOutput`: Array of console log messages from the verifier
- `description`: Human-readable description of what the verifier tests
- `category`: Category of the verifier (e.g., "restaurant-cart", "search")
- `debugInfo`: Additional debugging information including cart state and expected vs actual items

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success (verifier executed, check `passed` field for result)
- `400`: Bad request (missing flowId)
- `404`: Verifier not found
- `500`: Server error during execution

## Integration with Testing Frameworks

You can integrate this API with testing frameworks like Jest, Mocha, or Playwright:

```javascript
// Jest example
describe('DoorDash Verifiers', () => {
  test('should add sweet pretzel to cart', async () => {
    const result = await testVerifier('add-sweet-pretzel', sampleCartState)
    expect(result.passed).toBe(true)
    expect(result.error).toBeNull()
  })
})

// Playwright example
test('verify cart functionality', async ({ page }) => {
  // Perform UI actions...
  await page.click('[data-testid="add-to-cart"]')
  
  // Get cart state from the page
  const cartState = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('multicategory-cart') || '{}').state
  })
  
  // Verify using API
  const result = await testVerifier('add-sweet-pretzel', cartState)
  expect(result.passed).toBe(true)
})
```

## Notes

- Verifiers run in a sandboxed environment with mocked localStorage and console
- Cart state is optional - verifiers will run with empty state if not provided
- Some verifiers may require specific cart state to pass
- The API is designed to be stateless - each request is independent
- Verifier consumption tracking is mocked in the API environment 
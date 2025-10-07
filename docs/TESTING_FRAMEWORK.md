# UI State Testing Framework

A comprehensive testing framework to ensure UI changes don't break verifiers and to catch regressions early.

## 🎯 Purpose

This framework allows you to:
- **Define specific UI states** (cart contents, store context, etc.)
- **Test verifiers against those states** with expected pass/fail results
- **Catch breaking changes** when you modify UI components or verifiers
- **Run automated regression tests** before deploying changes

## 🚀 Quick Start

### 1. Run All Tests
```bash
node scripts/run-ui-tests.js
```

### 2. Run Specific Test Suites
```bash
# Regression tests (most common)
node scripts/run-ui-tests.js regression

# Breaking change detection
node scripts/run-ui-tests.js breaking

# UI change impact tests
node scripts/run-ui-tests.js ui-changes
```

### 3. Watch Mode (Development)
```bash
# Automatically re-run tests when files change
node scripts/run-ui-tests.js --watch
```

## 📁 File Structure

```
scripts/
├── ui-state-tester.js      # Core testing framework
├── run-ui-tests.js         # CLI test runner
└── test-verifiers.js       # Existing verifier analysis

test-configs/
└── ui-tests.json          # Test case definitions and UI states
```

## 🧪 Test Case Structure

Each test case defines:
- **Name**: Descriptive test name
- **Description**: What the test verifies
- **Initial State**: Predefined UI state to test against
- **Verifier ID**: Which verifier to run
- **Expected Result**: `true`, `false`, or `"error"`

### Example Test Case
```json
{
  "name": "Sweet Pretzel - Should Pass",
  "description": "Verifier should pass when cart contains exactly 1 sweet pretzel from Jamba Juice",
  "initialState": "cartWithSweetPretzel",
  "verifierId": "add-sweet-pretzel",
  "expectedResult": true,
  "timeout": 5000
}
```

## 🎨 Predefined UI States

The framework includes common UI states:

- **`emptyCart`**: Empty cart, no store context
- **`cartWithSweetPretzel`**: Cart with 1 sweet pretzel from Jamba Juice
- **`cartWithThreeItems`**: Cart with 3 items (for clear cart tests)
- **`atSafewayWithMilk`**: At Safeway store with milk in cart
- **`atGusMarketWithFruits`**: At Gus Market with correct fruit quantities
- **`malformedState`**: Invalid state to test error handling

## 🔧 Adding New Tests

### 1. Add New UI State
Edit `test-configs/ui-tests.json`:

```json
{
  "uiStates": {
    "myCustomState": {
      "items": [...],
      "currentStore": {...},
      "verifierConsumed": false
    }
  }
}
```

### 2. Add New Test Case
```json
{
  "testSuites": {
    "regression": {
      "testCases": [
        {
          "name": "My New Test",
          "description": "What this test verifies",
          "initialState": "myCustomState",
          "verifierId": "my-verifier",
          "expectedResult": true
        }
      ]
    }
  }
}
```

## 🎯 Use Cases

### 1. **Before UI Changes**
```bash
# Run regression tests to establish baseline
node scripts/run-ui-tests.js regression
```

### 2. **After UI Changes**
```bash
# Re-run tests to ensure nothing broke
node scripts/run-ui-tests.js regression
```

### 3. **During Development**
```bash
# Watch mode - automatically test on file changes
node scripts/run-ui-tests.js --watch
```

### 4. **Testing New Verifiers**
```bash
# Test specific verifier with different states
node scripts/run-ui-tests.js breaking
```

## 📊 Test Results

The framework provides detailed output:

```
🧪 Running: Regression Tests - UI Changes
============================================================

🔍 Sweet Pretzel - Should Pass
   Verifier should pass when cart contains exactly 1 sweet pretzel from Jamba Juice
   Expected: true
   ✅ PASSED (45ms)

🔍 Clear Cart - Empty Cart Should Fail
   Verifier should fail when no clear action was performed
   Expected: false
   ❌ FAILED - Expected false, got true

📊 TEST SUMMARY
============================================================
Total Tests: 7
✅ Passed: 6
❌ Failed: 1
Success Rate: 85.7%
Duration: 2.34s
```

## 🚨 CI/CD Integration

Add to your GitHub Actions or CI pipeline:

```yaml
- name: Run UI State Tests
  run: |
    npm start &
    sleep 10  # Wait for server to start
    node scripts/run-ui-tests.js regression
```

## 🔍 Debugging Failed Tests

1. **Check the error message** in test output
2. **Verify UI state** matches what verifier expects
3. **Check verifier logic** in `config/flow-verifiers.json`
4. **Use existing debugging tools**:
   ```bash
   node scripts/test-verifiers.js analyze <verifier-id>
   ```

## 🎯 Best Practices

1. **Run tests before making UI changes** to establish baseline
2. **Add tests for new verifiers** immediately
3. **Use watch mode during development** for immediate feedback
4. **Keep UI states realistic** - match actual application behavior
5. **Test both success and failure cases** for comprehensive coverage

## 🚀 Advanced Usage

### Custom Test Suites
Create new test suites for specific scenarios:

```json
{
  "testSuites": {
    "myCustomSuite": {
      "name": "My Custom Tests",
      "description": "Tests for specific scenarios",
      "testCases": [...]
    }
  }
}
```

### Programmatic Usage
```javascript
const { UITestRunner } = require('./scripts/run-ui-tests')

const runner = new UITestRunner()
await runner.runTestSuite('regression')
```

This framework ensures your UI changes don't break verifiers and provides confidence when making modifications to the application! 🎯

# Verifier Testing Strategy

## Overview
This document outlines the comprehensive strategy for testing each verifier individually to ensure they work as intended and fail correctly.

## Current Status Summary
Based on recent test runs, we have 51 total verifiers across 6 categories:
- **restaurant-cart**: 17 verifiers  
- **search**: 19 verifiers
- **grocery-cart**: 9 verifiers
- **cart**: 2 verifiers
- **retail-cart**: 3 verifiers
- **pets-cart**: 1 verifier

### Common Issues Identified
1. **Undefined Results**: Many verifiers returning `undefined` instead of `true`/`false`
2. **State Dependencies**: Verifiers expecting specific application state
3. **Store Context**: Many verifiers require being at specific stores
4. **Verifier Consumption**: Single-use verifiers that can only pass once

## Testing Tools Available

### 1. Enhanced Web Dashboard (`/check`)
- **URL**: `http://localhost:3000/check`
- **Features**:
  - Filter by category and status
  - Individual verifier execution with debugging
  - Detailed state inspection (cart, store, search results)
  - Console output capture
  - Expected vs actual item comparison
  - Execution time tracking

### 2. Command Line Analysis Tool
```bash
# List all verifiers by category
node scripts/test-verifiers.js list

# Analyze specific verifier
node scripts/test-verifiers.js analyze <verifier-id>

# Analyze all verifiers in a category
node scripts/test-verifiers.js category <category-name>
```

## Testing Methodology

### Phase 1: Static Analysis
1. **Analyze verifier code** for each category
2. **Identify dependencies** (store, items, quantities, state)
3. **Check for logical issues** (syntax, null safety, conditions)

### Phase 2: Isolated Testing
1. **Test each category separately** to avoid cross-contamination
2. **Start with fresh application state** for each test
3. **Document expected preconditions** for each verifier

### Phase 3: End-to-End Validation
1. **Perform manual user flows** to satisfy verifier requirements
2. **Test verifier immediately after action**
3. **Verify verifier fails correctly** when conditions not met

## Category-Specific Testing Plans

### Restaurant Cart Verifiers (17 verifiers)
**Key Requirements**: Specific stores, menu items, quantities
**Common Issues**: Store context, item naming consistency

**Test Order**:
1. `add-sweet-pretzel` - Simple single item test
2. `pick-meal-under-10` - Price-based validation
3. `add-most-ordered` - Section-specific item
4. `add-two-custom-lattes` - Multiple customized items
5. Continue with remaining 13...

### Search Verifiers (19 verifiers) 
**Key Requirements**: Search terms, result filtering, consumption tracking
**Common Issues**: Search state persistence, result validation

**Test Order**:
1. `search-starbucks` - Simple store search
2. `find-pizza-restaurants` - Category-based search
3. `find-cheap-fast-delivery` - Multi-criteria search
4. Continue with filter and reset verifiers...

### Grocery Cart Verifiers (9 verifiers)
**Key Requirements**: Grocery stores, specific products, quantities
**Common Issues**: Product name matching, store context

**Test Order**:
1. `add-kiwi-strawberries` - Simple grocery items
2. `add-fruits` - Multiple items with quantities  
3. `add-organic-eggs` - Specific brand/type
4. Continue with remaining 6...

### Cart Verifiers (2 verifiers)
**Key Requirements**: Cart manipulation, state tracking
**Common Issues**: Clear action tracking, item removal

**Test Order**:
1. `clear-cart` - Clear action verification
2. `remove-item-from-cart` - Specific item removal

### Retail Cart Verifiers (3 verifiers)
**Key Requirements**: Retail stores, specific products
**Common Issues**: Store navigation, product availability

### Pet Cart Verifiers (1 verifier)
**Key Requirements**: Pet store, pet products
**Common Issues**: Product search and selection

## Step-by-Step Testing Process

### For Each Verifier:

1. **Preparation**
   - Open fresh browser/incognito window
   - Navigate to `http://localhost:3000`
   - Clear any existing cart state

2. **Pre-Test Analysis**
   ```bash
   node scripts/test-verifiers.js analyze <verifier-id>
   ```
   - Review expected items, quantities, store
   - Note any special requirements

3. **Manual Flow Execution**
   - Perform the user actions described in verifier description
   - Take note of actual items added, store context
   - Verify UI state matches expectations

4. **Verifier Testing**
   - Navigate to `/check` page
   - Run specific verifier
   - Expand debug view to analyze results

5. **Documentation**
   - Record pass/fail status
   - Note any discrepancies between expected/actual
   - Document required fixes if failing

## Common Debugging Patterns

### When Verifier Returns `undefined`:
- Check for JavaScript syntax errors
- Verify all required state properties exist
- Look for missing null safety checks

### When Verifier Returns `false` but should pass:
- Compare expected vs actual cart items
- Check store context (currentStore.name)
- Verify item naming consistency
- Check quantity requirements

### When Verifier Incorrectly Passes:
- Review verifier logic for missing conditions
- Check if verifier is too permissive
- Verify consumption tracking if applicable

## Expected Outcomes

### Success Criteria:
- All verifiers return definitive `true`/`false` (no `undefined`)
- Verifiers pass when user correctly follows instructions
- Verifiers fail when requirements not met
- No JavaScript errors in console
- Consistent behavior across test runs

### Known Challenges:
- **State Management**: Ensuring verifiers work with current state structure
- **Item Naming**: Consistency between menu items and verifier expectations
- **Store Context**: Ensuring verifiers know current store correctly
- **Timing**: Verifiers running at the right moment in user flow

## Next Steps

1. **Start with Enhanced Dashboard Testing**
   - Use `/check` page to quickly identify all `undefined` results
   - Focus on fixing verifiers that error rather than fail gracefully

2. **Category-by-Category Validation**
   - Test `grocery-cart` first (simplest requirements)
   - Move to `restaurant-cart` (most complex)
   - Finish with `search` verifiers (most state dependent)

3. **Fix and Re-test**
   - Address identified issues systematically
   - Re-run full test suite after each category fix
   - Document any changes made to verifier logic

## Monitoring and Maintenance

- **Regular Testing**: Run full verifier suite weekly
- **New Verifier Checklist**: Test new verifiers before deployment
- **Performance Monitoring**: Track execution times for optimization
- **Error Reporting**: Capture and analyze verifier failures in production

This strategy ensures comprehensive, systematic testing of all verifiers while maintaining high quality and reliability of the verification system. 
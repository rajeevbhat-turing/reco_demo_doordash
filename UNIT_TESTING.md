# Unit Testing Guide

This project uses Jest and React Testing Library for unit testing. Unit tests are co-located with their source files using the `.test.ts` or `.test.tsx` extension.

### Uses of Unit Tests

- **Validation**: Test utility functions, validation logic, and business rules
- **API Functions**: Verify API call logic, error handling, and data transformation
- **Hooks**: Test custom React hooks and their state management
- **Components**: Verify component rendering, user interactions, and form validation
- **Store Logic**: Test state management actions and reducers
- **Edge Cases**: Cover boundary conditions and error scenarios

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (single run with coverage, optimized for CI environments)
npm run test:ci
```

## Test Commands Explained

- **`npm test`**: Runs all tests once and exits
- **`npm run test:watch`**: Watches for file changes and re-runs affected tests automatically
- **`npm run test:coverage`**: Generates a coverage report showing which code is tested
- **`npm run test:ci`**: Runs tests in CI-friendly mode with coverage and limited workers

## Running Specific Tests

```bash
# Run tests for a specific file
npm test helperFunctions.test.ts

# Run tests matching a pattern
npm test -- -t "email validation"

# Run tests in a directory
npm test lib/utils/
```

## Test Structure

Tests follow the Arrange-Act-Assert pattern:

```typescript
describe('FunctionName', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something specific', () => {
    // Arrange: Set up test data
    // Act: Execute the function being tested
    // Assert: Verify the results
  })
})
```

## Mocking

External dependencies are mocked to isolate the code being tested:

- **Next.js Router**: Mocked in `jest.setup.js`
- **Zustand Stores**: Mock store state and actions
- **API Calls**: Mock fetch or API functions
- **React Query**: Use QueryClientProvider wrapper

## Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run a specific test file
npm test -- sign-up.test.tsx
```

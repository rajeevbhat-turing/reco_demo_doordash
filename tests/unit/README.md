# Unit Testing Guide

This project uses **Vitest** and **React Testing Library** for unit testing.

## Why Vitest?

- **Fast**: Native ESM support and Vite-powered, significantly faster than Jest
- **Compatible**: Jest-compatible API (`describe`, `it`, `expect`, `vi.mock()`)
- **Built-in**: TypeScript support out of the box
- **Watch mode**: Instant feedback during development

Unit tests are located in the `testing/unit/` folder, mirroring the source file structure:
- `testing/unit/components/` - Component tests
- `testing/unit/lib/` - Utility, hook, and API tests
- `testing/unit/store/` - Zustand store tests

Test files use the `.test.ts` or `.test.tsx` extension.

### Uses of Unit Tests

- **Validation**: Test utility functions, validation logic, and business rules
- **API Functions**: Verify API call logic, error handling, and data transformation
- **Hooks**: Test custom React hooks and their state management
- **Components**: Verify component rendering, user interactions, and form validation
- **Store Logic**: Test state management actions and reducers in zustand store
- **Edge Cases**: Cover boundary conditions and error scenarios

## Running Tests

```bash
# Run all tests
npm run test:unit

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:unit:watch

# Run tests with coverage report
npm run test:unit:coverage

# Run tests in CI mode (single run with coverage, optimized for CI environments)
npm run test:unit:ci
```

## Test Commands Explained

- **`npm run test:unit`**: Runs all unit tests once and exits
- **`npm run test:unit:watch`**: Watches for file changes and re-runs affected tests automatically
- **`npm run test:unit:coverage`**: Generates a coverage report showing which code is tested
- **`npm run test:unit:ci`**: Runs tests in CI-friendly mode with coverage

## Running Specific Tests

```bash
# Run tests for a specific file
npm run test:unit -- testing/unit/lib/utils/helperFunctions.test.ts

# Run tests matching a pattern
npm run test:unit -- -t "email validation"

# Run tests in a directory
npm run test:unit -- testing/unit/lib/utils/
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

- **Next.js Router**: Mocked in `vitest.setup.ts`
- **Zustand Stores**: Mock store state and actions using `vi.mock()`
- **API Calls**: Mock fetch or API functions using `vi.fn()`
- **React Query**: Use QueryClientProvider wrapper

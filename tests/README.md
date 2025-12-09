# Testing

This folder contains all tests for the DashDoor application.

## Structure

```
tests/
├── e2e/                         # End-to-End Tests (Playwright)
│   ├── tests/
│   │   ├── confirmed/           # ✅ WORKING TESTS
│   │   │   └── orders/          # Full order flow
│   │   └── development/         # 🚧 IN PROGRESS
│   │       ├── auth/
│   │       ├── address/
│   │       ├── checkout/
│   │       └── ...
│   ├── page-objects/
│   ├── fixtures/
│   └── playwright.config.ts
│
└── unit/                        # Unit Tests (Vitest + React Testing Library)
    ├── components/              # Component tests
    ├── lib/                     # Utility, hook, and API tests
    │   ├── api/
    │   ├── hooks/
    │   └── utils/
    ├── store/                   # Zustand store tests
    └── README.md                # Detailed unit testing guide
```

## Quick Start

### Unit Tests (No server required)

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode (auto-rerun on changes)
npm run test:unit:watch

# Run with coverage report
npm run test:unit:coverage
```

### E2E Tests (Requires dev server)

```bash
# 1. Install dependencies
npm install
npx playwright install

# 2. Start dev server (Terminal 1)
npm run dev

# 3. Run tests (Terminal 2)
npm run test:e2e:orders
```

## Key Commands

### Unit Tests

| Command | Description |
|---------|-------------|
| `npm run test:unit` | Run all unit tests once |
| `npm run test:unit:watch` | Run tests in watch mode |
| `npm run test:unit:coverage` | Generate coverage report |
| `npm run test:unit:ci` | CI mode with coverage |

### E2E Tests

| Command | Description |
|---------|-------------|
| `npm run test:e2e:confirmed` | Run all working tests |
| `npm run test:e2e:orders` | Run main order flow test |
| `npm run test:e2e:dev` | Run development tests |
| `npm run debug:chromium` | Debug mode |
| `npm run test:e2e:report` | View HTML report |

## Unit Testing

Unit tests use **Vitest** and **React Testing Library** to test components, utilities, hooks, and stores in isolation.

### What's Tested

- ✅ **Components**: Rendering, user interactions, form validation
- ✅ **Utilities**: Helper functions, validators, calculators
- ✅ **Hooks**: Custom React hooks and state management
- ✅ **API Functions**: API call logic, error handling, data transformation
- ✅ **Stores**: Zustand store actions and state management

### Quick Examples

```bash
# Run specific test file
npm run test:unit -- tests/unit/lib/utils/helperFunctions.test.ts

# Run tests matching a pattern
npm run test:unit -- -t "email validation"

# Run tests in a directory
npm run test:unit -- tests/unit/components/
```

For detailed unit testing documentation, see [`tests/unit/README.md`](./unit/README.md).

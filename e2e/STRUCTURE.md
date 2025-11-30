# E2E Test Suite Structure

All E2E testing files are consolidated in the `e2e/` folder for a clean, organized structure.

## 📁 Folder Structure

```
e2e/
├── playwright.config.ts          # Main Playwright configuration
├── test-credentials.ts          # Test user credentials (gitignored)
├── test-credentials.example.ts  # Example credentials template
│
├── fixtures/                    # Custom Playwright fixtures
│   ├── auth.fixtures.ts         # Auth-specific fixtures
│   └── test.fixtures.ts         # General test fixtures
│
├── page-objects/                # Page Object Model classes
│   ├── auth.page.ts
│   ├── auth-modal.page.ts
│   ├── base.page.ts
│   ├── checkout.page.ts
│   ├── home.page.ts
│   ├── orders.page.ts
│   ├── reviews.page.ts
│   ├── store.page.ts
│   └── index.ts
│
├── tests/                       # Test specifications
│   ├── fundamentals/            # Simple, basic tests
│   │   ├── 01-auth.spec.ts
│   │   ├── 02-address.spec.ts
│   │   ├── 03-stores.spec.ts
│   │   ├── 04-reviews.spec.ts
│   │   ├── 05-reorder.spec.ts
│   │   ├── 06-checkout.spec.ts
│   │   └── README.md
│   │
│   ├── auth/                    # Comprehensive auth tests
│   │   ├── login.spec.ts
│   │   └── signup.spec.ts
│   │
│   ├── address/
│   ├── checkout/
│   ├── reorder/
│   ├── reviews/
│   └── store/
│
├── utils/                       # Test utilities
│   └── test-helpers.ts
│
├── playwright-report/           # HTML test reports (gitignored)
│   ├── index.html
│   └── data/
│
└── test-results/                # Test artifacts (gitignored)
    ├── results.json
    ├── junit.xml
    └── [test-run-artifacts]/
```

## 🎯 Key Points

- **All test files** are in `e2e/tests/`
- **All reports** go to `e2e/playwright-report/`
- **All artifacts** go to `e2e/test-results/`
- **No root-level clutter** - everything is self-contained in `e2e/`

## 🚀 Running Tests

All npm scripts are configured to use the `e2e/` folder:

```bash
npm run test:e2e:fundamentals    # Run fundamental tests
npm run test:e2e:auth            # Run auth tests
npm run test:e2e:report          # View HTML report
```

## 📝 Git Ignore

The following are ignored (in `e2e/.gitignore`):
- `test-results/` - Test artifacts
- `playwright-report/` - HTML reports
- `test-credentials.ts` - Real credentials (never commit!)
- `*.png`, `*.webm`, `*.zip` - Screenshots/videos

## ✅ Clean Structure

- ✅ No temporary test files
- ✅ No root-level Playwright artifacts
- ✅ All configuration in one place
- ✅ Easy to find and maintain


# E2E Tests (Playwright)

End-to-end tests using Playwright for the DashDoor application.

## Test Organization

```
tests/
├── confirmed/           # ✅ WORKING - Ready for CI/CD
│   └── orders/
│       ├── orders.spec.ts              # Full order + review (store 83)
│       └── orders-outside-delivery.spec.ts  # Outside delivery test
│
└── development/         # 🚧 IN PROGRESS - Not stable yet
    ├── auth/            # Login & signup
    ├── address/         # Address management
    ├── checkout/        # Checkout flow
    ├── store/           # Store browsing
    ├── reviews/         # Reviews
    ├── reorder/         # Reorder feature
    └── fundamentals/    # Basic templates
```

## Commands

### Confirmed Tests (RECOMMENDED)
```bash
npm run test:e2e:confirmed    # All working tests
npm run test:e2e:orders       # Main order flow
```

### Development Tests
```bash
npm run test:e2e:dev          # All dev tests (may fail)
```

### Debug & Reports
```bash
npm run debug:chromium testing/e2e/tests/confirmed/orders/orders.spec.ts
npm run test:e2e:report
```

## ⚠️ Important
Always start the dev server first: `npm run dev`

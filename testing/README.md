# Testing

This folder contains all tests for the DashDoor application.

## Structure

```
testing/
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
└── unit/                        # Unit Tests (Coming Soon)
    └── README.md
```

## Quick Start

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

| Command | Description |
|---------|-------------|
| `npm run test:e2e:confirmed` | Run all working tests |
| `npm run test:e2e:orders` | Run main order flow test |
| `npm run test:e2e:dev` | Run development tests |
| `npm run debug:chromium` | Debug mode |
| `npm run test:e2e:report` | View HTML report |

# ✅ Confirmed Tests

These tests are **fully working** and validated.

## Tests

### Orders (`orders/`)
- `orders.spec.ts` - Full order flow with delivery & review (store 83 - in range)
- `orders-outside-delivery.spec.ts` - Outside delivery area test (store 1)

## How to Run

```bash
# Run all confirmed tests
npm run test:e2e:confirmed

# Run main order test
npm run test:e2e:orders

# Debug mode
npm run debug:chromium testing/e2e/tests/confirmed/orders/orders.spec.ts
```

## Requirements
- Dev server must be running: `npm run dev`
- Wait for `localhost:3000` to be ready before running tests


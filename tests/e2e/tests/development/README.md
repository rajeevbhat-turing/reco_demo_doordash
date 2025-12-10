# 🚧 Development Tests

These tests are **in progress** and may not be fully working yet.

## Test Folders

| Folder | Description | Status |
|--------|-------------|--------|
| `auth/` | Login & signup flows | 🔄 In Progress |
| `address/` | Address management | 🔄 In Progress |
| `checkout/` | Checkout flow | 🔄 In Progress |
| `store/` | Store browsing | 🔄 In Progress |
| `reviews/` | Review submission | 🔄 In Progress |
| `reorder/` | Reorder functionality | 🔄 In Progress |
| `fundamentals/` | Basic feature templates | 📝 Templates |

## How to Run (at your own risk)

```bash
# Run all development tests
npm run test:e2e:dev

# Run specific test
npm run test:e2e:auth
npm run test:e2e:checkout
npm run test:e2e:address
```

## Moving to Confirmed

Once a test is validated and working:
1. Move the folder from `development/` to `confirmed/`
2. Update `package.json` scripts
3. Update the README files


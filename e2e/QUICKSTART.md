# Quick Start Guide

Get up and running with Playwright E2E tests in 5 minutes!

## Step 1: Install Dependencies (2 min)

```bash
# Install npm packages (including @playwright/test)
npm install

# Install Playwright browsers (~300MB download)
npm run test:e2e:install
```

## Step 2: Verify Setup (30 sec)

```bash
# Run verification script
npm run test:e2e:verify
```

You should see: ✅ All checks passed!

## Step 3: Set Up Test Credentials (1 min)

```bash
# Copy the example credentials file
cp e2e/test-credentials.example.ts e2e/test-credentials.ts
```

Then edit `e2e/test-credentials.ts` with your actual test user:
```typescript
export const testCredentials = {
  validUser: {
    email: 'your-test-user@example.com',  // ← Update this
    password: 'your-test-password',        // ← Update this
  },
  // ...
};
```

**Important**: Never commit `test-credentials.ts` to git!

## Step 4: Update Login Test (1 min)

Edit `e2e/tests/auth/login.spec.ts` and update the credentials:

```typescript
import { testCredentials } from '../../test-credentials';

test('should successfully login with valid credentials', async ({ authPage, page }) => {
  const testEmail = testCredentials.validUser.email;      // ← Use credentials
  const testPassword = testCredentials.validUser.password; // ← Use credentials
  
  // ... rest of test
});
```

## Step 5: Run Your First Test (30 sec)

```bash
# Make sure your dev server is running in another terminal
npm run dev

# In a new terminal, run tests
npm run test:e2e
```

Or run in UI mode (interactive):
```bash
npm run test:e2e:ui
```

## What to Expect

✅ **Success**: Tests run and pass  
⚠️ **If tests fail**: Check that:
- Dev server is running on `http://localhost:3000`
- Test credentials are correct
- Test user exists in your database

## Next Steps

- 📖 Read `README.md` for full documentation
- 📋 Check `NEXT_TESTS.md` for next test flows to implement
- 🐛 See `INSTALL.md` for troubleshooting

## Common Commands

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests with visible browser
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Verify setup
npm run test:e2e:verify
```

## Need Help?

- Check `INSTALL.md` for troubleshooting
- Review test files in `e2e/tests/` for examples
- Check Playwright docs: https://playwright.dev




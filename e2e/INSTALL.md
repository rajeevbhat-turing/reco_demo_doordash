# Playwright Installation Guide

## Quick Installation

### Option 1: Using Setup Scripts (Recommended)

**Windows (PowerShell):**
```powershell
cd e2e
.\setup.ps1
```

**Linux/Mac (Bash):**
```bash
cd e2e
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Installation

1. **Install npm dependencies** (includes @playwright/test):
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install --with-deps
   ```

   This installs:
   - Chromium, Firefox, and WebKit browsers
   - System dependencies required for browsers

3. **Verify installation**:
   ```bash
   npx playwright --version
   ```

## What Gets Installed

- **@playwright/test** (^1.48.0) - Playwright testing framework
- **Browser binaries** (~300MB):
  - Chromium
  - Firefox  
  - WebKit (Safari)
- **System dependencies** (if needed):
  - Required libraries for browser execution

## Post-Installation Steps

1. **Set up test credentials**:
   ```bash
   # Copy the example file
   cp e2e/test-credentials.example.ts e2e/test-credentials.ts
   
   # Edit with your test user credentials
   # Never commit test-credentials.ts to git!
   ```

2. **Update test credentials** in `e2e/test-credentials.ts`:
   ```typescript
   export const testCredentials = {
     validUser: {
       email: 'your-test-user@example.com',
       password: 'your-test-password',
     },
     // ... other credentials
   };
   ```

3. **Update login test** to use credentials:
   Edit `e2e/tests/auth/login.spec.ts` and import/use test credentials:
   ```typescript
   import { testCredentials } from '../../test-credentials';
   
   // Then use:
   const testEmail = testCredentials.validUser.email;
   const testPassword = testCredentials.validUser.password;
   ```

## Running Your First Test

```bash
# Run all tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug
```

## Troubleshooting

### Issue: "playwright: command not found"
**Solution**: Make sure `npm install` completed successfully and `node_modules/.bin` is in your PATH.

### Issue: Browser installation fails
**Solution**: 
- On Linux, you may need: `npx playwright install-deps`
- On Windows, ensure you have admin rights
- Check Playwright docs for system requirements

### Issue: Tests can't connect to localhost:3000
**Solution**: 
- Ensure your dev server is running: `npm run dev`
- Or set `PLAYWRIGHT_TEST_BASE_URL` environment variable
- Check firewall settings

### Issue: TypeScript errors
**Solution**: 
- Ensure TypeScript is installed: `npm install -D typescript`
- Check `tsconfig.json` includes the e2e directory

## Configuration Files

- **playwright.config.ts** - Main Playwright configuration
- **package.json** - npm scripts and dependencies
- **.gitignore** - Excludes test artifacts and credentials

## Next Steps

After installation:
1. ✅ Run setup scripts
2. ✅ Set up test credentials  
3. ✅ Run first test: `npm run test:e2e`
4. 📖 Read `NEXT_TESTS.md` for next test flows to implement




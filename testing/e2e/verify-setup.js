#!/usr/bin/env node

/**
 * Verification script to check if Playwright is properly installed and configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying Playwright E2E test setup...\n');

let allChecksPassed = true;

// Check 1: Verify package.json has @playwright/test
console.log('1️⃣ Checking package.json for @playwright/test...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies['@playwright/test']) {
    console.log('   ✅ @playwright/test found in devDependencies\n');
  } else {
    console.log('   ❌ @playwright/test not found in devDependencies\n');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message, '\n');
  allChecksPassed = false;
}

// Check 2: Verify node_modules exists
console.log('2️⃣ Checking if node_modules exists...');
const nodeModulesPath = path.join(__dirname, '../node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules directory exists\n');
} else {
  console.log('   ⚠️  node_modules not found. Run: npm install\n');
  allChecksPassed = false;
}

// Check 3: Verify Playwright is installed
console.log('3️⃣ Checking if Playwright is installed...');
try {
  const playwrightPath = path.join(__dirname, '../node_modules/@playwright/test');
  if (fs.existsSync(playwrightPath)) {
    console.log('   ✅ @playwright/test package found\n');
  } else {
    console.log('   ⚠️  @playwright/test not found. Run: npm install\n');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('   ❌ Error checking Playwright installation\n');
  allChecksPassed = false;
}

// Check 4: Verify Playwright CLI is available
console.log('4️⃣ Checking Playwright CLI...');
try {
  execSync('npx playwright --version', { stdio: 'pipe' });
  console.log('   ✅ Playwright CLI is available\n');
} catch (error) {
  console.log('   ⚠️  Playwright CLI not available. Run: npm install && npx playwright install\n');
  allChecksPassed = false;
}

// Check 5: Verify config file exists
console.log('5️⃣ Checking Playwright config file...');
const configPath = path.join(__dirname, 'playwright.config.ts');
if (fs.existsSync(configPath)) {
  console.log('   ✅ playwright.config.ts exists\n');
} else {
  console.log('   ❌ playwright.config.ts not found\n');
  allChecksPassed = false;
}

// Check 6: Verify test files exist
console.log('6️⃣ Checking test files...');
const testPath = path.join(__dirname, 'tests/auth/login.spec.ts');
if (fs.existsSync(testPath)) {
  console.log('   ✅ Login test file exists\n');
} else {
  console.log('   ❌ Login test file not found\n');
  allChecksPassed = false;
}

// Check 7: Verify page objects exist
console.log('7️⃣ Checking page objects...');
const pageObjectPath = path.join(__dirname, 'page-objects/auth.page.ts');
if (fs.existsSync(pageObjectPath)) {
  console.log('   ✅ Auth page object exists\n');
} else {
  console.log('   ❌ Auth page object not found\n');
  allChecksPassed = false;
}

// Check 8: Verify fixtures exist
console.log('8️⃣ Checking fixtures...');
const fixturePath = path.join(__dirname, 'fixtures/auth.fixtures.ts');
if (fs.existsSync(fixturePath)) {
  console.log('   ✅ Auth fixtures exist\n');
} else {
  console.log('   ❌ Auth fixtures not found\n');
  allChecksPassed = false;
}

// Final summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
if (allChecksPassed) {
  console.log('✅ All checks passed! Setup looks good.\n');
  console.log('Next steps:');
  console.log('1. Install browsers: npm run test:e2e:install');
  console.log('2. Set up credentials: cp e2e/test-credentials.example.ts e2e/test-credentials.ts');
  console.log('3. Run tests: npm run test:e2e\n');
} else {
  console.log('⚠️  Some checks failed. Please review the issues above.\n');
  console.log('To fix:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run test:e2e:install');
  console.log('3. Run this verification again\n');
}

process.exit(allChecksPassed ? 0 : 1);




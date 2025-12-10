# Playwright E2E Test Setup Script (PowerShell)
# This script installs Playwright and sets up the test environment

Write-Host "🚀 Setting up Playwright E2E tests for DashDoor..." -ForegroundColor Cyan

# Install npm dependencies (including @playwright/test)
Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install

# Install Playwright browsers
Write-Host "🌐 Installing Playwright browsers..." -ForegroundColor Yellow
npx playwright install --with-deps

# Verify installation
Write-Host "✅ Verifying Playwright installation..." -ForegroundColor Yellow
npx playwright --version

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy e2e/test-credentials.example.ts to e2e/test-credentials.ts"
Write-Host "2. Update test credentials with actual test user data"
Write-Host "3. Run tests with: npm run test:e2e"
Write-Host ""




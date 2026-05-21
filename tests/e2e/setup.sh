#!/bin/bash

# Playwright E2E Test Setup Script
# This script installs Playwright and sets up the test environment

echo "🚀 Setting up Playwright E2E tests for DashDoor..."

# Install npm dependencies (including @playwright/test)
echo "📦 Installing npm dependencies..."
npm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps

# Verify installation
echo "✅ Verifying Playwright installation..."
npx playwright --version

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Apply e2e DB seed: sqlite3 data/db/dashdoor.db < data/db/schema/e2e_user_seed.sql"
echo "2. Login email is tests/e2e/constants.ts (john.doe@example.com); optional copy test-credentials.example.ts → test-credentials.ts"
echo "3. Run tests with: npm run test:e2e"
echo ""




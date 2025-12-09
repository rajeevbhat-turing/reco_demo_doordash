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
echo "1. Copy e2e/test-credentials.example.ts to e2e/test-credentials.ts"
echo "2. Update test credentials with actual test user data"
echo "3. Run tests with: npm run test:e2e"
echo ""




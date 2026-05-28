/**
 * Test Credentials Template
 * 
 * Copy this file to test-credentials.ts and fill in actual test user credentials.
 * Add test-credentials.ts to .gitignore to avoid committing real credentials.
 * 
 * IMPORTANT: Never commit actual credentials to version control!
 */

import { E2E_LOGIN_EMAIL } from './constants';

export const testCredentials = {
  // Valid test user for login tests (seeded in dashdoor.db)
  validUser: {
    email: E2E_LOGIN_EMAIL,
    password: 'password',
  },
  
  // Invalid credentials for negative tests
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  
  // Non-existent user
  nonExistentUser: {
    email: 'nonexistent@example.com',
    password: 'anypassword',
  },
};




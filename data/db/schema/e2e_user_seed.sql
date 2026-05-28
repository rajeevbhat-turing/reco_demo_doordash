-- Playwright login fixture (tests/e2e/constants.ts)
INSERT OR IGNORE INTO users (id, name, email, phone_number, password, country_id, avatar, is_restricted)
VALUES (3001, 'John Doe', 'john.doe@example.com', '5551234567', 'password', 2, NULL, 0);

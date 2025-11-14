import { loadEnvConfig } from '@next/env';

let envLoaded = false;

/**
 * Ensure that environment variables from .env files are loaded.
 * Next.js takes care of this automatically when running via `next dev`,
 * `next build`, or `next start`, but standalone scripts (tests, CLI tools)
 * need an explicit load to access the same configuration.
 */
export function ensureEnv() {
  if (envLoaded) return;

  try {
    loadEnvConfig(process.cwd());
  } catch (error) {
    // If the config files are missing, loadEnvConfig will throw.
    // We only surface a warning because some environments rely solely on
    // process-level variables (e.g., production deployments).
    console.warn('[env] Failed to load .env configuration:', error);
  }

  envLoaded = true;
}

/**
 * Retrieve a required environment variable, ensuring it has been loaded.
 * Throws a descriptive error when missing to aid debugging.
 */
export function getRequiredEnv(key: string): string {
  ensureEnv();

  const value = process.env[key];
  if (!value || value.length === 0) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}


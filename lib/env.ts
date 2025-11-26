import { loadEnvConfig } from '@next/env';
import { readFileSync } from 'fs';
import { join } from 'path';

let envLoaded = false;

/**
 * Load .env file manually as fallback
 */
function loadEnvFileManually() {
  try {
    const cwd = process.cwd();
    const envPath = join(cwd, '.env');
    const envLocalPath = join(cwd, '.env.local');
    
    console.log('[env] Attempting manual load from:', cwd);
    console.log('[env] Checking .env.local at:', envLocalPath);
    console.log('[env] Checking .env at:', envPath);
    
    // Try .env.local first, then .env
    let envContent: string | null = null;
    let loadedFrom = '';
    try {
      envContent = readFileSync(envLocalPath, 'utf-8');
      loadedFrom = '.env.local';
      console.log('[env] ✓ Successfully read .env.local');
    } catch (err: any) {
      console.log('[env] .env.local not found:', err.message);
      try {
        envContent = readFileSync(envPath, 'utf-8');
        loadedFrom = '.env';
        console.log('[env] ✓ Successfully read .env');
      } catch (err2: any) {
        console.log('[env] .env not found:', err2.message);
        return;
      }
    }
    
    if (envContent) {
      console.log('[env] Parsing env content from', loadedFrom);
      // Parse env file content - handle both \n and \r\n
      const lines = envContent.split(/\r?\n/);
      let loadedCount = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const keyTrimmed = key.trim();
            const value = valueParts.join('=').trim();
            // Always set it (override if exists)
            process.env[keyTrimmed] = value;
            loadedCount++;
            console.log(`[env] Set ${keyTrimmed} = ${value.substring(0, 50)}...`);
          }
        }
      }
      console.log(`[env] ✓ Manually loaded ${loadedCount} environment variables from ${loadedFrom}`);
    }
  } catch (error: any) {
    console.error('[env] ✗ Failed to manually load .env file:', error.message, error.stack);
  }
}

/**
 * Ensure that environment variables from .env files are loaded.
 * Next.js takes care of this automatically when running via `next dev`,
 * `next build`, or `next start`, but standalone scripts (tests, CLI tools)
 * need an explicit load to access the same configuration.
 */
export function ensureEnv() {
  if (envLoaded) return;

  console.log('[env] ensureEnv() called, cwd:', process.cwd());
  
  // FIRST: Try manual load to ensure variables are available
  loadEnvFileManually();
  
  // THEN: Try Next.js loadEnvConfig (which might override or supplement)
  try {
    const result = loadEnvConfig(process.cwd());
    console.log('[env] Next.js loadEnvConfig completed');
    if (result && result.loadedEnvFiles) {
      console.log('[env] Next.js loaded env files:', result.loadedEnvFiles.map((f: any) => f.path).join(', '));
    }
  } catch (error: any) {
    console.warn('[env] Next.js loadEnvConfig failed:', error.message);
  }
  
  // Verify LIBSQL_URL is set
  if (process.env.LIBSQL_URL) {
    console.log('[env] ✓ LIBSQL_URL is set:', process.env.LIBSQL_URL.substring(0, 50) + '...');
  } else {
    console.error('[env] ✗ LIBSQL_URL is still not set after all loading attempts');
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
    // Debug: log all available env vars that start with LIBSQL
    const libsqlVars = Object.keys(process.env).filter(k => k.includes('LIBSQL'));
    console.error(`[env] Environment variable ${key} is not set. Available LIBSQL vars:`, libsqlVars);
    console.error(`[env] All env vars:`, Object.keys(process.env).slice(0, 20));
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}


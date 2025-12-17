/**
 * Time Utilities - Centralized time management for bootstrap support
 * 
 * This module provides functions to get the current time that respect
 * the bootstrap time offset. Use these functions instead of new Date()
 * or Date.now() throughout the application.
 * 
 * Client-side: Reads from the bootstrap store
 * Server-side: Reads from cookies/headers
 */

// Re-export from bootstrap store for client-side use
export {
  getCurrentTime,
  getCurrentHour,
  getCurrentTimestamp,
  isBootstrapped,
} from '@/store/bootstrap-store';

/**
 * Parse time offset from cookie string (for server-side use in API routes)
 * 
 * @param cookieHeader - The cookie header string from the request
 * @returns The time offset in milliseconds, or null if not set
 */
export function parseTimeOffsetFromCookies(cookieHeader: string | null): number | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'x-bootstrap-time-offset' && value) {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

/**
 * Get current time for server-side use (API routes)
 * Reads the time offset from cookies
 * 
 * @param cookieHeader - The cookie header string from the request
 * @returns The current Date (with offset if bootstrapped)
 */
export function getServerCurrentTime(cookieHeader: string | null): Date {
  const offsetMs = parseTimeOffsetFromCookies(cookieHeader);
  if (offsetMs !== null) {
    return new Date(Date.now() + offsetMs);
  }
  return new Date();
}

/**
 * Get current hour for server-side use (API routes)
 * 
 * @param cookieHeader - The cookie header string from the request
 * @returns The current hour (0-23)
 */
export function getServerCurrentHour(cookieHeader: string | null): number {
  return getServerCurrentTime(cookieHeader).getHours();
}

/**
 * Get current timestamp for server-side use (API routes)
 * 
 * @param cookieHeader - The cookie header string from the request
 * @returns The current timestamp in milliseconds
 */
export function getServerCurrentTimestamp(cookieHeader: string | null): number {
  const offsetMs = parseTimeOffsetFromCookies(cookieHeader);
  if (offsetMs !== null) {
    return Date.now() + offsetMs;
  }
  return Date.now();
}


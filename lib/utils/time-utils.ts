/**
 * Time Utilities - Centralized time management for bootstrap support
 *
 * This module provides functions to get the current time that respect
 * the bootstrap time offset and timezone. Use these functions instead of new Date()
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
  formatInTimezone,
  getSimulatedTimezone,
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
 * Parse timezone from cookie string (for server-side use in API routes)
 *
 * @param cookieHeader - The cookie header string from the request
 * @returns The IANA timezone string, or null if not set
 */
export function parseTimezoneFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'x-bootstrap-timezone' && value) {
      return decodeURIComponent(value);
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
 * Extract hour from a date in a specific timezone using Intl.DateTimeFormat
 */
function getHourInTimezone(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date);

  const hourPart = parts.find(p => p.type === 'hour');
  return parseInt(hourPart?.value ?? '0', 10);
}

/**
 * Get current hour for server-side use (API routes)
 * Uses simulated timezone if set, otherwise server's local timezone
 *
 * @param cookieHeader - The cookie header string from the request
 * @returns The current hour (0-23)
 */
export function getServerCurrentHour(cookieHeader: string | null): number {
  const currentTime = getServerCurrentTime(cookieHeader);
  const timezone = parseTimezoneFromCookies(cookieHeader);

  if (timezone) {
    return getHourInTimezone(currentTime, timezone);
  }
  return currentTime.getHours();
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

/**
 * Get the simulated timezone for server-side use (API routes)
 *
 * @param cookieHeader - The cookie header string from the request
 * @returns The IANA timezone string, or null if not set
 */
export function getServerSimulatedTimezone(cookieHeader: string | null): string | null {
  return parseTimezoneFromCookies(cookieHeader);
}

/**
 * Format a date in the simulated timezone for server-side use (API routes)
 * Falls back to server's local timezone if no simulated timezone is set
 *
 * @param date - The date to format
 * @param cookieHeader - The cookie header string from the request
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatServerTimeInTimezone(
  date: Date,
  cookieHeader: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const timezone = parseTimezoneFromCookies(cookieHeader);
  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: timezone || undefined,
  }).format(date);
}

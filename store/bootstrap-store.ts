'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

/**
 * Bootstrap Store - Manages simulated time, timezone, and user for testing purposes
 *
 * Time Offset Approach:
 * - When bootstrap({ date: "2025-02-14T18:30:00Z" }) is called
 * - We calculate: offsetMs = simulatedTime - realTimeAtBootstrap
 * - When getCurrentTime() is called: return new Date(Date.now() + offsetMs)
 * - This way, time continues to tick normally, just shifted
 *
 * Timezone Approach:
 * - When bootstrap({ timezone: "America/New_York" }) is called
 * - We store the IANA timezone string
 * - getCurrentHour() uses Intl.DateTimeFormat to get hour in that timezone
 * - This allows consistent time display regardless of browser's local timezone
 *
 * Usage:
 *   window.bootstrap({ date: "2025-02-14T18:30:00Z", timezone: "America/New_York", user: "john@example.com" })
 *   window.clearBootstrap()
 */

export interface BootstrapConfig {
  date?: string; // ISO 8601 date string
  timezone?: string; // IANA timezone string (e.g., "America/New_York", "Asia/Tokyo")
  user?: string; // User email to auto-login
}

interface BootstrapState {
  // Time offset in milliseconds (simulated time - real time at bootstrap)
  timeOffsetMs: number | null;

  // The original bootstrap timestamp (for debugging/display)
  bootstrapTimestamp: string | null;

  // Simulated timezone (IANA timezone string)
  simulatedTimezone: string | null;

  // User email for auto-login
  simulatedUser: string | null;

  // Whether bootstrap is active
  isBootstrapped: boolean;

  // Actions
  setBootstrap: (config: BootstrapConfig) => void;
  clearBootstrap: () => void;

  // Time getters - these are the main functions to use throughout the app
  getCurrentTime: () => Date;
  getCurrentHour: () => number; // Returns hour in simulated timezone (or local if not set)
  getCurrentTimestamp: () => number; // Returns Date.now() equivalent
  formatInTimezone: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

// Cookie names for server-side access
const TIME_OFFSET_COOKIE = 'x-bootstrap-time-offset';
const TIMEZONE_COOKIE = 'x-bootstrap-timezone';

/**
 * Set a cookie that can be read by the server
 */
function setTimeOffsetCookie(offsetMs: number | null): void {
  if (typeof document === 'undefined') return;

  if (offsetMs === null) {
    // Clear the cookie
    document.cookie = `${TIME_OFFSET_COOKIE}=; path=/; max-age=0`;
  } else {
    // Set the cookie with the offset (expires in 24 hours)
    document.cookie = `${TIME_OFFSET_COOKIE}=${offsetMs}; path=/; max-age=86400`;
  }
}

/**
 * Set timezone cookie for server-side access
 */
function setTimezoneCookie(timezone: string | null): void {
  if (typeof document === 'undefined') return;

  if (timezone === null) {
    // Clear the cookie
    document.cookie = `${TIMEZONE_COOKIE}=; path=/; max-age=0`;
  } else {
    // Set the cookie with the timezone (expires in 24 hours)
    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timezone)}; path=/; max-age=86400`;
  }
}

/**
 * Get the time offset from cookie (for server-side use)
 */
export function getTimeOffsetFromCookie(): number | null {
  if (typeof document === 'undefined') {
    // Server-side: try to get from headers (will be handled in API routes)
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TIME_OFFSET_COOKIE && value) {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

/**
 * Get the timezone from cookie (for client-side use)
 */
export function getTimezoneFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TIMEZONE_COOKIE && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Validate if a timezone string is a valid IANA timezone
 */
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
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

export const useBootstrapStore = create<BootstrapState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        timeOffsetMs: null,
        bootstrapTimestamp: null,
        simulatedTimezone: null,
        simulatedUser: null,
        isBootstrapped: false,

        // Set bootstrap configuration
        setBootstrap: (config: BootstrapConfig) => {
          const { date, timezone, user } = config;

          let timeOffsetMs: number | null = null;
          let bootstrapTimestamp: string | null = null;
          let simulatedTimezone: string | null = null;

          if (date) {
            const simulatedDate = new Date(date);

            if (isNaN(simulatedDate.getTime())) {
              console.error(
                '❌ Bootstrap: Invalid date format. Use ISO 8601 format (e.g., "2025-02-14T18:30:00Z")'
              );
              return;
            }

            const realNow = Date.now();
            timeOffsetMs = simulatedDate.getTime() - realNow;
            bootstrapTimestamp = date;

            // Set cookie for server-side access
            setTimeOffsetCookie(timeOffsetMs);

            console.log(`✅ Bootstrap: Time set to ${simulatedDate.toISOString()}`);
            console.log(
              `   Offset: ${timeOffsetMs > 0 ? '+' : ''}${Math.round(timeOffsetMs / 1000 / 60)} minutes from real time`
            );
          }

          if (timezone) {
            if (isValidTimezone(timezone)) {
              simulatedTimezone = timezone;
              setTimezoneCookie(timezone);
              console.log(`✅ Bootstrap: Timezone set to ${timezone}`);
            } else {
              console.error(
                `❌ Bootstrap: Invalid timezone "${timezone}". Use IANA timezone (e.g., "America/New_York", "Asia/Tokyo")`
              );
            }
          }

          if (user) {
            console.log(`✅ Bootstrap: User set to ${user}`);
          }

          set({
            timeOffsetMs,
            bootstrapTimestamp,
            simulatedTimezone,
            simulatedUser: user || null,
            isBootstrapped: !!(date || timezone || user),
          });
        },

        // Clear all bootstrap settings
        clearBootstrap: () => {
          setTimeOffsetCookie(null);
          setTimezoneCookie(null);

          set({
            timeOffsetMs: null,
            bootstrapTimestamp: null,
            simulatedTimezone: null,
            simulatedUser: null,
            isBootstrapped: false,
          });

          console.log('✅ Bootstrap: Cleared. Using real system time and timezone.');
        },

        // Get current time (with offset if bootstrapped)
        getCurrentTime: (): Date => {
          const state = get();
          if (state.timeOffsetMs !== null) {
            return new Date(Date.now() + state.timeOffsetMs);
          }
          return new Date();
        },

        // Get current hour (0-23)
        // Uses simulated timezone if set, otherwise browser's local timezone
        getCurrentHour: (): number => {
          const state = get();
          const currentTime = state.getCurrentTime();

          if (state.simulatedTimezone) {
            return getHourInTimezone(currentTime, state.simulatedTimezone);
          }
          return currentTime.getHours();
        },

        // Get current timestamp (Date.now() equivalent with offset)
        getCurrentTimestamp: (): number => {
          const state = get();
          if (state.timeOffsetMs !== null) {
            return Date.now() + state.timeOffsetMs;
          }
          return Date.now();
        },

        // Format a date in the simulated timezone
        formatInTimezone: (date: Date, options?: Intl.DateTimeFormatOptions): string => {
          const state = get();
          return new Intl.DateTimeFormat('en-US', {
            ...options,
            timeZone: state.simulatedTimezone || undefined,
          }).format(date);
        },
      }),
      {
        name: 'bootstrap-store',
        partialize: state => ({
          timeOffsetMs: state.timeOffsetMs,
          bootstrapTimestamp: state.bootstrapTimestamp,
          simulatedTimezone: state.simulatedTimezone,
          simulatedUser: state.simulatedUser,
          isBootstrapped: state.isBootstrapped,
        }),
        // On rehydrate, restore the cookies
        onRehydrateStorage: () => state => {
          if (state?.timeOffsetMs !== null && state?.timeOffsetMs !== undefined) {
            setTimeOffsetCookie(state.timeOffsetMs);
            console.log(
              `✅ Bootstrap: Restored from storage. Time offset: ${Math.round(state.timeOffsetMs / 1000 / 60)} minutes`
            );
          }
          if (state?.simulatedTimezone) {
            setTimezoneCookie(state.simulatedTimezone);
            console.log(
              `✅ Bootstrap: Restored from storage. Timezone: ${state.simulatedTimezone}`
            );
          }
        },
      }
    ),
    {
      name: 'bootstrap-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Non-hook version for use outside React components
 * This reads directly from the store state
 */
export function getCurrentTime(): Date {
  return useBootstrapStore.getState().getCurrentTime();
}

export function getCurrentHour(): number {
  return useBootstrapStore.getState().getCurrentHour();
}

export function getCurrentTimestamp(): number {
  return useBootstrapStore.getState().getCurrentTimestamp();
}

/**
 * Format a date in the simulated timezone
 * Falls back to browser's local timezone if no simulated timezone is set
 */
export function formatInTimezone(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return useBootstrapStore.getState().formatInTimezone(date, options);
}

/**
 * Get the simulated timezone (or null if not set)
 */
export function getSimulatedTimezone(): string | null {
  return useBootstrapStore.getState().simulatedTimezone;
}

/**
 * Check if bootstrap is currently active
 */
export function isBootstrapped(): boolean {
  return useBootstrapStore.getState().isBootstrapped;
}

'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

/**
 * Bootstrap Store - Manages simulated time and user for testing purposes
 * 
 * Time Offset Approach:
 * - When bootstrap({ date: "2025-02-14T18:30:00Z" }) is called
 * - We calculate: offsetMs = simulatedTime - realTimeAtBootstrap
 * - When getCurrentTime() is called: return new Date(Date.now() + offsetMs)
 * - This way, time continues to tick normally, just shifted
 * 
 * Usage:
 *   window.bootstrap({ date: "2025-02-14T18:30:00Z", user: "john@example.com" })
 *   window.clearBootstrap()
 */

export interface BootstrapConfig {
  date?: string; // ISO 8601 date string
  user?: string; // User email to auto-login
}

interface BootstrapState {
  // Time offset in milliseconds (simulated time - real time at bootstrap)
  timeOffsetMs: number | null;
  
  // The original bootstrap timestamp (for debugging/display)
  bootstrapTimestamp: string | null;
  
  // User email for auto-login
  simulatedUser: string | null;
  
  // Whether bootstrap is active
  isBootstrapped: boolean;
  
  // Actions
  setBootstrap: (config: BootstrapConfig) => void;
  clearBootstrap: () => void;
  
  // Time getters - these are the main functions to use throughout the app
  getCurrentTime: () => Date;
  getCurrentHour: () => number;
  getCurrentTimestamp: () => number; // Returns Date.now() equivalent
}

// Cookie name for server-side time offset
const TIME_OFFSET_COOKIE = 'x-bootstrap-time-offset';

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

export const useBootstrapStore = create<BootstrapState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        timeOffsetMs: null,
        bootstrapTimestamp: null,
        simulatedUser: null,
        isBootstrapped: false,

        // Set bootstrap configuration
        setBootstrap: (config: BootstrapConfig) => {
          const { date, user } = config;
          
          let timeOffsetMs: number | null = null;
          let bootstrapTimestamp: string | null = null;
          
          if (date) {
            const simulatedDate = new Date(date);
            
            if (isNaN(simulatedDate.getTime())) {
              console.error('❌ Bootstrap: Invalid date format. Use ISO 8601 format (e.g., "2025-02-14T18:30:00Z")');
              return;
            }
            
            const realNow = Date.now();
            timeOffsetMs = simulatedDate.getTime() - realNow;
            bootstrapTimestamp = date;
            
            // Set cookie for server-side access
            setTimeOffsetCookie(timeOffsetMs);
            
            console.log(`✅ Bootstrap: Time set to ${simulatedDate.toISOString()}`);
            console.log(`   Offset: ${timeOffsetMs > 0 ? '+' : ''}${Math.round(timeOffsetMs / 1000 / 60)} minutes from real time`);
          }
          
          if (user) {
            console.log(`✅ Bootstrap: User set to ${user}`);
          }
          
          set({
            timeOffsetMs,
            bootstrapTimestamp,
            simulatedUser: user || null,
            isBootstrapped: !!(date || user),
          });
        },

        // Clear all bootstrap settings
        clearBootstrap: () => {
          setTimeOffsetCookie(null);
          
          set({
            timeOffsetMs: null,
            bootstrapTimestamp: null,
            simulatedUser: null,
            isBootstrapped: false,
          });
          
          console.log('✅ Bootstrap: Cleared. Using real system time.');
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
        getCurrentHour: (): number => {
          return get().getCurrentTime().getHours();
        },

        // Get current timestamp (Date.now() equivalent with offset)
        getCurrentTimestamp: (): number => {
          const state = get();
          if (state.timeOffsetMs !== null) {
            return Date.now() + state.timeOffsetMs;
          }
          return Date.now();
        },
      }),
      {
        name: 'bootstrap-store',
        partialize: (state) => ({
          timeOffsetMs: state.timeOffsetMs,
          bootstrapTimestamp: state.bootstrapTimestamp,
          simulatedUser: state.simulatedUser,
          isBootstrapped: state.isBootstrapped,
        }),
        // On rehydrate, restore the cookie
        onRehydrateStorage: () => (state) => {
          if (state?.timeOffsetMs !== null && state?.timeOffsetMs !== undefined) {
            setTimeOffsetCookie(state.timeOffsetMs);
            console.log(`✅ Bootstrap: Restored from storage. Time offset: ${Math.round(state.timeOffsetMs / 1000 / 60)} minutes`);
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
 * Check if bootstrap is currently active
 */
export function isBootstrapped(): boolean {
  return useBootstrapStore.getState().isBootstrapped;
}


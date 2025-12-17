'use client';

import { useEffect } from 'react';
import { useBootstrapStore, BootstrapConfig } from '@/store/bootstrap-store';
import { useUserStore } from '@/store/user-store';

/**
 * BootstrapInitializer - Exposes window.bootstrap() and window.clearBootstrap()
 * 
 * This component should be mounted once at the app root level.
 * It provides global access to bootstrap functionality for testing.
 * 
 * Usage from browser console:
 *   window.bootstrap({ date: "2025-02-14T18:30:00Z", user: "john@example.com" })
 *   window.clearBootstrap()
 *   window.getBootstrapStatus()
 */
export function BootstrapInitializer() {
  const { setBootstrap, clearBootstrap, getCurrentTime, isBootstrapped, simulatedUser } = useBootstrapStore();
  const { getUserByEmail, setCurrentUser } = useUserStore();

  useEffect(() => {
    // Expose bootstrap function globally
    window.bootstrap = (config: BootstrapConfig) => {
      setBootstrap(config);
      
      // If user is specified, attempt to auto-login
      if (config.user) {
        const user = getUserByEmail(config.user);
        if (user) {
          setCurrentUser(user);
          console.log(`✅ Bootstrap: Auto-logged in as ${user.name || user.email}`);
        } else {
          console.warn(`⚠️ Bootstrap: User "${config.user}" not found in store. Manual login required.`);
        }
      }
      
      // Auto-refresh to apply changes throughout the app
      console.log('🔄 Refreshing page to apply bootstrap changes...');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    // Expose clear function globally
    window.clearBootstrap = () => {
      clearBootstrap();
      
      // Auto-refresh to apply changes throughout the app
      console.log('🔄 Refreshing page to clear bootstrap...');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    // Expose status function for debugging
    window.getBootstrapStatus = () => {
      const state = useBootstrapStore.getState();
      return {
        isBootstrapped: state.isBootstrapped,
        currentTime: state.getCurrentTime().toISOString(),
        timeOffset: state.timeOffsetMs !== null 
          ? `${Math.round(state.timeOffsetMs / 1000 / 60)} minutes` 
          : null,
        simulatedUser: state.simulatedUser,
        bootstrapTimestamp: state.bootstrapTimestamp,
      };
    };

    // Log instructions on initial load (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '%c🚀 Bootstrap API Available',
        'color: #10b981; font-weight: bold; font-size: 14px;'
      );
      console.log(
        '%cUsage: window.bootstrap({ date: "2025-02-14T18:30:00Z", user: "john@example.com" })',
        'color: #6b7280;'
      );
      console.log(
        '%c       window.clearBootstrap() | window.getBootstrapStatus()',
        'color: #6b7280;'
      );
    }

    // Handle simulated user on mount (for page refreshes when bootstrapped)
    if (simulatedUser) {
      const user = getUserByEmail(simulatedUser);
      if (user) {
        setCurrentUser(user);
      }
    }

    // Cleanup on unmount
    return () => {
      // Don't delete - other components might still need them
      // The functions are idempotent anyway
    };
  }, [setBootstrap, clearBootstrap, getCurrentTime, getUserByEmail, setCurrentUser, isBootstrapped, simulatedUser]);

  // This component doesn't render anything
  return null;
}

export default BootstrapInitializer;


import { useState, useEffect, useCallback, useRef } from 'react';

interface PersistedStateOptions {
  runId?: string;
  serverUrl?: string;
  debounceMs?: number;
}

interface PendingUpdate {
  key: string;
  value: any;
  timestamp: number;
}

class PersistedStateManager {
  private static instance: PersistedStateManager;
  private pendingUpdates: Map<string, PendingUpdate> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private runId: string;
  private serverUrl: string;
  private debounceMs: number;

  constructor(runId: string, serverUrl: string = 'http://localhost:3001', debounceMs: number = 120) {
    this.runId = runId;
    this.serverUrl = serverUrl;
    this.debounceMs = debounceMs;
    this.setupUnloadHandler();
  }

  static getInstance(runId: string, serverUrl?: string, debounceMs?: number): PersistedStateManager {
    if (!PersistedStateManager.instance) {
      PersistedStateManager.instance = new PersistedStateManager(runId, serverUrl, debounceMs);
    }
    return PersistedStateManager.instance;
  }

  private setupUnloadHandler() {
    // Handle page unload with sendBeacon for safety
    window.addEventListener('beforeunload', () => {
      this.flushPendingUpdates(true);
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushPendingUpdates(true);
      }
    });
  }

  async bulkGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.serverUrl}/api/v1/kv/bulk-get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: this.runId,
          keys
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch from server:', error);
      return {};
    }
  }

  async bulkUpsert(data: Record<string, any>): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/v1/kv/bulk-upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: this.runId,
          data
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to sync to server:', error);
      return false;
    }
  }

  queueUpdate(key: string, value: any) {
    this.pendingUpdates.set(key, {
      key,
      value,
      timestamp: Date.now()
    });

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.flushPendingUpdates();
    }, this.debounceMs);
  }

  private async flushPendingUpdates(useSendBeacon: boolean = false) {
    if (this.pendingUpdates.size === 0) return;

    const updates = Object.fromEntries(
      Array.from(this.pendingUpdates.values()).map(update => [update.key, update.value])
    );

    this.pendingUpdates.clear();

    if (useSendBeacon && navigator.sendBeacon) {
      // Use sendBeacon for unload scenarios
      const blob = new Blob([JSON.stringify({
        run_id: this.runId,
        data: updates
      })], { type: 'application/json' });
      
      navigator.sendBeacon(`${this.serverUrl}/api/v1/kv/bulk-upsert`, blob);
    } else {
      // Use regular fetch for normal operations
      await this.bulkUpsert(updates);
    }
  }
}

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options: PersistedStateOptions = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const {
    runId = 'default-run',
    serverUrl = 'http://localhost:3001',
    debounceMs = 120
  } = options;

  const manager = useRef<PersistedStateManager>();
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize manager
  useEffect(() => {
    manager.current = PersistedStateManager.getInstance(runId, serverUrl, debounceMs);
  }, [runId, serverUrl, debounceMs]);

  // Hydration on mount
  useEffect(() => {
    if (!manager.current || isHydrated) return;

    const hydrate = async () => {
      // First, try to get from localStorage
      const localValue = localStorage.getItem(key);
      let localParsedValue: T | null = null;

      if (localValue !== null) {
        try {
          localParsedValue = JSON.parse(localValue);
        } catch (error) {
          console.error('Failed to parse localStorage value:', error);
        }
      }

      // Then, fetch from server
      const serverData = await manager.current!.bulkGet([key]);
      const serverValue = serverData[key];

      // Determine which value to use
      if (serverValue !== undefined) {
        // Server has the value, use it
        setValue(serverValue);
        // Update localStorage to match server
        localStorage.setItem(key, JSON.stringify(serverValue));
      } else if (localParsedValue !== null) {
        // Only local value exists, use it and sync to server
        setValue(localParsedValue);
        manager.current!.queueUpdate(key, localParsedValue);
      } else {
        // No value exists anywhere, use initial value
        setValue(initialValue);
        localStorage.setItem(key, JSON.stringify(initialValue));
        manager.current!.queueUpdate(key, initialValue);
      }

      setIsHydrated(true);
    };

    hydrate();
  }, [key, initialValue, isHydrated]);

  const setPersistedValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const resolvedValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value) 
      : newValue;

    // Update local state immediately
    setValue(resolvedValue);
    
    // Update localStorage immediately
    localStorage.setItem(key, JSON.stringify(resolvedValue));
    
    // Queue server update
    if (manager.current && isHydrated) {
      manager.current.queueUpdate(key, resolvedValue);
    }
  }, [key, value, isHydrated]);

  return [value, setPersistedValue];
}

// Hook for managing multiple persisted states with shared debouncing
export function usePersistedStates(
  keys: string[],
  initialValues: Record<string, any>,
  options: PersistedStateOptions = {}
) {
  const {
    runId = 'default-run',
    serverUrl = 'http://localhost:3001',
    debounceMs = 120
  } = options;

  const manager = useRef<PersistedStateManager>();
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize manager
  useEffect(() => {
    manager.current = PersistedStateManager.getInstance(runId, serverUrl, debounceMs);
  }, [runId, serverUrl, debounceMs]);

  // Hydration on mount
  useEffect(() => {
    if (!manager.current || isHydrated) return;

    const hydrate = async () => {
      // Get local values
      const localValues: Record<string, any> = {};
      const localKeys: string[] = [];

      keys.forEach(key => {
        const localValue = localStorage.getItem(key);
        if (localValue !== null) {
          try {
            localValues[key] = JSON.parse(localValue);
            localKeys.push(key);
          } catch (error) {
            console.error(`Failed to parse localStorage value for ${key}:`, error);
          }
        }
      });

      // Get server values
      const serverData = await manager.current!.bulkGet(keys);
      
      // Merge and resolve conflicts
      const finalValues: Record<string, any> = {};
      const updatesToServer: Record<string, any> = {};

      keys.forEach(key => {
        const serverValue = serverData[key];
        const localValue = localValues[key];
        const initialValue = initialValues[key];

        if (serverValue !== undefined) {
          // Server has the value, use it
          finalValues[key] = serverValue;
          localStorage.setItem(key, JSON.stringify(serverValue));
        } else if (localValue !== undefined) {
          // Only local value exists, use it and sync to server
          finalValues[key] = localValue;
          updatesToServer[key] = localValue;
        } else {
          // No value exists anywhere, use initial value
          finalValues[key] = initialValue;
          localStorage.setItem(key, JSON.stringify(initialValue));
          updatesToServer[key] = initialValue;
        }
      });

      setValues(finalValues);

      // Sync any local-only values to server
      if (Object.keys(updatesToServer).length > 0) {
        manager.current!.bulkUpsert(updatesToServer);
      }

      setIsHydrated(true);
    };

    hydrate();
  }, [keys, initialValues, isHydrated]);

  const setPersistedValue = useCallback((key: string, newValue: any | ((prev: any) => any)) => {
    const resolvedValue = typeof newValue === 'function' 
      ? newValue(values[key]) 
      : newValue;

    // Update local state immediately
    setValues(prev => ({ ...prev, [key]: resolvedValue }));
    
    // Update localStorage immediately
    localStorage.setItem(key, JSON.stringify(resolvedValue));
    
    // Queue server update
    if (manager.current && isHydrated) {
      manager.current.queueUpdate(key, resolvedValue);
    }
  }, [values, isHydrated]);

  return [values, setPersistedValue] as const;
}

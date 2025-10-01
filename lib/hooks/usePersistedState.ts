import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration on mount
  useEffect(() => {
    if (isHydrated) return;

    const hydrate = () => {
      // Get from localStorage
      const localValue = localStorage.getItem(key);
      let localParsedValue: T | null = null;

      if (localValue !== null) {
        try {
          localParsedValue = JSON.parse(localValue);
        } catch (error) {
          console.error('Failed to parse localStorage value:', error);
        }
      }

      if (localParsedValue !== null) {
        // Use localStorage value
        setValue(localParsedValue);
      } else {
        // No value exists, use initial value
        setValue(initialValue);
        localStorage.setItem(key, JSON.stringify(initialValue));
      }

      setIsHydrated(true);
    };

    hydrate();
  }, [key, initialValue, isHydrated]);

  const setPersistedValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const resolvedValue =
        typeof newValue === 'function' ? (newValue as (prev: T) => T)(value) : newValue;

      // Update local state immediately
      setValue(resolvedValue);

      // Update localStorage immediately
      localStorage.setItem(key, JSON.stringify(resolvedValue));
    },
    [key, value]
  );

  return [value, setPersistedValue];
}

// Hook for managing multiple persisted states
export function usePersistedStates(keys: string[], initialValues: Record<string, any>) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration on mount
  useEffect(() => {
    if (isHydrated) return;

    const hydrate = () => {
      // Get local values
      const localValues: Record<string, any> = {};

      keys.forEach(key => {
        const localValue = localStorage.getItem(key);
        if (localValue !== null) {
          try {
            localValues[key] = JSON.parse(localValue);
          } catch (error) {
            console.error(`Failed to parse localStorage value for ${key}:`, error);
          }
        }
      });

      // Merge with initial values
      const finalValues: Record<string, any> = {};

      keys.forEach(key => {
        const localValue = localValues[key];
        const initialValue = initialValues[key];

        if (localValue !== undefined) {
          // Use localStorage value
          finalValues[key] = localValue;
        } else {
          // No localStorage value, use initial value
          finalValues[key] = initialValue;
          localStorage.setItem(key, JSON.stringify(initialValue));
        }
      });

      setValues(finalValues);
      setIsHydrated(true);
    };

    hydrate();
  }, [keys, initialValues, isHydrated]);

  const setPersistedValue = useCallback(
    (key: string, newValue: any | ((prev: any) => any)) => {
      const resolvedValue = typeof newValue === 'function' ? newValue(values[key]) : newValue;

      // Update local state immediately
      setValues(prev => ({ ...prev, [key]: resolvedValue }));

      // Update localStorage immediately
      localStorage.setItem(key, JSON.stringify(resolvedValue));
    },
    [values]
  );

  return [values, setPersistedValue] as const;
}

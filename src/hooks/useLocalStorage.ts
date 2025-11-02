/**
 * useLocalStorage Custom Hook
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   (to be updated as components use this hook)
 *
 * Dependencies (External files that this file imports):
 *   └─ react
 *
 * Related Documentation:
 *   ├─ Spec: ./useLocalStorage.spec.md
 *   ├─ Tests: ./useLocalStorage.test.ts
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_02_common-components-development.md
 *   └─ Prompt: docs/00_prompts/20241102_02_phase2-common-components.md
 */

import { useEffect, useState } from 'react';

/**
 * Custom hook for managing localStorage with React state
 *
 * Provides a useState-like API that automatically persists values to localStorage.
 * Handles JSON serialization, deserialization, and error cases gracefully.
 *
 * @param key - localStorage key
 * @param initialValue - Default value if no stored value exists
 * @returns [storedValue, setValue] - Similar to useState
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage<string>('username', 'Guest');
 * const [count, setCount] = useLocalStorage<number>('count', 0);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);

      // If item exists, parse and return it
      if (item !== null) {
        return JSON.parse(item) as T;
      }

      // If no item exists, store and return initialValue
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch (error) {
      // Handle JSON parse errors or localStorage access errors
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever storedValue changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // Handle QuotaExceededError or other storage errors
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Wrapper function to handle both direct values and updater functions
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function (similar to useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting value for localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Local Storage Utilities
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/utils/templateStorage.ts
 *   └─ src/hooks/useLocalStorage.ts
 *
 * Dependencies (External files that this file imports):
 *   (none - utility functions)
 *
 * Related Documentation:
 *   ├─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 *   └─ Rules: docs/rules/code-quality-standards.md
 */

/**
 * Generic type-safe localStorage getter
 */
export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Generic type-safe localStorage setter
 */
export function saveToLocalStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromLocalStorage(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Clear all localStorage
 */
export function clearLocalStorage(): boolean {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

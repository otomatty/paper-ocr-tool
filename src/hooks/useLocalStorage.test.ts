/**
 * useLocalStorage Hook Tests
 *
 * Related Documentation:
 *   ├─ Spec: ./useLocalStorage.spec.md
 *   ├─ Implementation: ./useLocalStorage.ts
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  // Clean up localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('TC-LOCALSTORAGE-001: 初期値の設定', () => {
    it('should return initial value when no stored value exists', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

      const [value] = result.current;
      expect(value).toBe('initial-value');
    });

    it('should store initial value in localStorage', () => {
      renderHook(() => useLocalStorage('test-key', 'initial-value'));

      const stored = localStorage.getItem('test-key');
      expect(stored).toBe(JSON.stringify('initial-value'));
    });
  });

  describe('TC-LOCALSTORAGE-002: 値の更新', () => {
    it('should update state when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        const [, setValue] = result.current;
        setValue('updated');
      });

      const [value] = result.current;
      expect(value).toBe('updated');
    });

    it('should save updated value to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        const [, setValue] = result.current;
        setValue('updated');
      });

      const stored = localStorage.getItem('test-key');
      expect(stored).toBe(JSON.stringify('updated'));
    });
  });

  describe('TC-LOCALSTORAGE-003: localStorage からの読み込み', () => {
    it('should read existing value from localStorage', () => {
      // Pre-populate localStorage
      localStorage.setItem('existing-key', JSON.stringify('existing-value'));

      const { result } = renderHook(() => useLocalStorage('existing-key', 'initial'));

      const [value] = result.current;
      expect(value).toBe('existing-value');
    });
  });

  describe('TC-LOCALSTORAGE-004: 関数形式の更新', () => {
    it('should support function updater', () => {
      const { result } = renderHook(() => useLocalStorage<number>('count', 0));

      act(() => {
        const [, setValue] = result.current;
        setValue(5);
      });

      act(() => {
        const [, setValue] = result.current;
        setValue((prev) => prev + 1);
      });

      const [value] = result.current;
      expect(value).toBe(6);
    });
  });

  describe('TC-LOCALSTORAGE-005: 型安全性', () => {
    it('should work with number type', () => {
      const { result } = renderHook(() => useLocalStorage<number>('number-key', 42));

      const [value] = result.current;
      expect(typeof value).toBe('number');
      expect(value).toBe(42);
    });

    it('should work with object type', () => {
      interface User {
        name: string;
        age: number;
      }

      const initialUser: User = { name: 'John', age: 30 };
      const { result } = renderHook(() => useLocalStorage<User>('user-key', initialUser));

      const [value] = result.current;
      expect(value).toEqual(initialUser);
    });

    it('should work with array type', () => {
      const { result } = renderHook(() => useLocalStorage<string[]>('array-key', ['a', 'b']));

      const [value] = result.current;
      expect(Array.isArray(value)).toBe(true);
      expect(value).toEqual(['a', 'b']);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in localStorage', () => {
      // Set invalid JSON
      localStorage.setItem('invalid-key', 'not-valid-json{');

      const { result } = renderHook(() => useLocalStorage('invalid-key', 'fallback'));

      const [value] = result.current;
      expect(value).toBe('fallback');
    });

    it('should handle complex objects', () => {
      const complexObject = {
        id: 1,
        nested: {
          value: 'test',
          array: [1, 2, 3],
        },
        date: new Date().toISOString(),
      };

      const { result } = renderHook(() => useLocalStorage('complex', complexObject));

      const [value] = result.current;
      expect(value).toEqual(complexObject);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null initial value', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>('null-key', null));

      const [value] = result.current;
      expect(value).toBe(null);
    });

    it('should handle undefined values by using initial value', () => {
      const { result } = renderHook(() => useLocalStorage('undefined-key', 'default'));

      const [value] = result.current;
      expect(value).toBe('default');
    });

    it('should persist across hook re-renders', () => {
      const { result, rerender } = renderHook(() => useLocalStorage('persist-key', 'initial'));

      act(() => {
        const [, setValue] = result.current;
        setValue('updated');
      });

      rerender();

      const [value] = result.current;
      expect(value).toBe('updated');
    });
  });
});

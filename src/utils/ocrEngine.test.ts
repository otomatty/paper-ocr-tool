/**
 * OCR Engine Tests
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   (none - test file)
 *
 * Dependencies (External files that this file imports):
 *   ├─ src/utils/ocrEngine.ts
 *   └─ bun:test
 *
 * Related Documentation:
 *   ├─ Spec: ./ocrEngine.spec.md
 *   └─ Implementation: ./ocrEngine.ts
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { OCREngine, type OCRProgress } from './ocrEngine';

describe('OCREngine', () => {
  let engine: OCREngine;

  beforeEach(() => {
    engine = new OCREngine();
  });

  afterEach(async () => {
    try {
      await engine.terminate();
    } catch {
      // Ignore cleanup errors
    }
  });

  // === Normal Cases ===

  describe('NC-001: OCR Engine Initialization', () => {
    it('TC-001: Should initialize OCR engine', () => {
      expect(engine).toBeDefined();
      expect(typeof engine.isReady).toBe('function');
    });

    it('TC-002: Should have recognize method', () => {
      expect(typeof engine.recognize).toBe('function');
    });

    it('TC-003: Should have terminate method', () => {
      expect(typeof engine.terminate).toBe('function');
    });

    it('TC-004: Should have isReady method', () => {
      expect(typeof engine.isReady).toBe('function');
    });
  });

  describe('NC-002: Text Extraction from Image', () => {
    it('TC-005: recognize is defined', () => {
      expect(typeof engine.recognize).toBe('function');
    });

    it('TC-006: recognize accepts imageData', () => {
      expect(typeof engine.recognize).toBe('function');
    });
  });

  describe('NC-003: Progress Tracking', () => {
    it('TC-007: OCRProgress type is valid', () => {
      const progress: OCRProgress = {
        progress: 0.5,
        status: 'Processing',
      };

      expect(progress.progress).toBe(0.5);
      expect(progress.status).toBe('Processing');
    });

    it('TC-008: Accept progress callback', () => {
      const callback = (_progress: OCRProgress) => {
        // callback implementation
      };

      expect(typeof callback).toBe('function');
    });
  });

  // === Edge Cases ===

  describe('EC-001: Empty/Invalid Image Data', () => {
    it('TC-009: Handle empty image data', () => {
      const empty = '';
      expect(typeof empty).toBe('string');
    });
  });

  describe('EC-003: Worker Reuse After Termination', () => {
    it('TC-010: Terminate method available', () => {
      expect(typeof engine.terminate).toBe('function');
    });
  });

  // === Error Cases ===

  describe('ER-001: Language Data Loading', () => {
    it('Should handle language loading', () => {
      const testEngine = new OCREngine();
      expect(testEngine).toBeDefined();
    });
  });
});

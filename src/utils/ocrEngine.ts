/**
 * OCR Engine Utility
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   (none yet - will be used by OCRProcessor component)
 *
 * Dependencies (External files that this file imports):
 *   ├─ tesseract.js
 *   └─ ../types/ocr.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./ocrEngine.spec.md
 *   ├─ Tests: ./ocrEngine.test.ts
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import Tesseract, { type Worker } from 'tesseract.js';

/**
 * OCR Engine Configuration
 */
interface OCRConfig {
  /** Language to recognize (default: 'jpn') */
  language: string;
  /** Use Tesseract Worker (default: true) */
  useWorker: boolean;
  /** Logger for debugging (optional) */
  logger?: (message: string) => void;
}

/**
 * OCR Progress Callback
 */
export interface OCRProgress {
  /** Progress percentage (0-1) */
  progress: number;
  /** Current status message */
  status: string;
}

/**
 * OCR Result
 */
export interface OCRResult {
  /** Recognized text */
  text: string;
  /** Confidence level (0-100) */
  confidence: number;
  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * OCR Engine Class
 *
 * Uses Tesseract.js to perform OCR on images
 */
export class OCREngine {
  private config: OCRConfig;
  private worker: Worker | null = null;
  private ready = false;

  /**
   * Initialize OCR Engine
   * @param config - OCR configuration
   */
  constructor(config?: Partial<OCRConfig>) {
    this.config = {
      language: 'jpn',
      useWorker: true,
      ...config,
    };
  }

  /**
   * Initialize the Tesseract worker
   */
  private async initializeWorker(): Promise<void> {
    if (this.worker && this.ready) {
      return; // Already initialized
    }

    try {
      this.log('Initializing OCR worker...');

      // Create worker
      this.worker = await Tesseract.createWorker(this.config.language);

      this.ready = true;
      this.log('OCR worker initialized successfully');
    } catch (error) {
      this.log(`Failed to initialize OCR worker: ${error}`);
      throw new Error('Failed to load language data');
    }
  }

  /**
   * Recognize text from image
   * @param imageData - Base64 image data
   * @param onProgress - Progress callback (optional)
   * @returns Promise<OCRResult>
   */
  async recognize(
    imageData: string,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    // Validate input
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data');
    }

    // Initialize worker if not ready
    if (!this.worker || !this.ready) {
      await this.initializeWorker();
    }

    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    const startTime = Date.now();

    try {
      this.log('Starting OCR recognition...');

      // Perform OCR with progress tracking
      const result = await this.worker.recognize(imageData);

      // If progress callback is provided, simulate progress updates
      // (Tesseract.js v6 doesn't support progress callbacks in recognize method)
      if (onProgress) {
        onProgress({
          progress: 1,
          status: 'recognizing text',
        });
      }

      const processingTime = Date.now() - startTime;

      this.log(`OCR completed in ${processingTime}ms`);

      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        processingTime,
      };
    } catch (error) {
      this.log(`OCR recognition failed: ${error}`);
      throw error;
    }
  }

  /**
   * Terminate OCR worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      try {
        this.log('Terminating OCR worker...');
        await this.worker.terminate();
        this.worker = null;
        this.ready = false;
        this.log('OCR worker terminated successfully');
      } catch (error) {
        this.log(`Failed to terminate OCR worker: ${error}`);
        throw error;
      }
    }
  }

  /**
   * Check if worker is ready
   */
  isReady(): boolean {
    return this.ready && this.worker !== null;
  }

  /**
   * Log message (if logger is configured)
   */
  private log(message: string): void {
    if (this.config.logger) {
      this.config.logger(`[OCREngine] ${message}`);
    }
  }
}

/**
 * Create a new OCR Engine instance
 *
 * Convenience function for creating OCR engine
 *
 * @param config - OCR configuration
 * @returns OCREngine instance
 */
export function createOCREngine(config?: Partial<OCRConfig>): OCREngine {
  return new OCREngine(config);
}

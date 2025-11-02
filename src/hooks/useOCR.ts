/**
 * useOCR Hook
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/DataInput/OCRProcessor.tsx
 *   ├─ src/pages/DataInputPage.tsx
 *   └─ src/hooks/useOCR.test.ts
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/utils/ocrEngine.ts
 *   ├─ src/utils/imageProcessor.ts
 *   └─ src/types/ocr.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./useOCR.spec.md
 *   ├─ Tests: ./useOCR.test.ts
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as ImageProcessor from '../utils/imageProcessor';
import { OCREngine } from '../utils/ocrEngine';

/**
 * Options for useOCR hook
 */
export interface UseOCROptions {
  /** Language for OCR (default: 'jpn') */
  _language?: string;

  /** Apply image preprocessing (default: true) */
  preprocessing?: boolean;

  /** Preprocessing options */
  preprocessingOptions?: {
    width?: number;
    height?: number;
    grayscale?: boolean;
    contrast?: number;
    brightness?: number;
  };
}

/**
 * Result for single region OCR
 */
export interface OCRRegionResult {
  /** Region ID */
  regionId: string;

  /** Region name */
  regionName: string;

  /** Recognized text */
  text: string;

  /** Confidence level (0-100) */
  confidence: number;

  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * State for useOCR hook
 */
export interface UseOCRState {
  /** Whether OCR is currently processing */
  isProcessing: boolean;

  /** Current processing progress (0-1) */
  progress: number;

  /** Current status message */
  status: string;

  /** Results from completed processing */
  results: OCRRegionResult[];

  /** Error message if processing failed */
  error: string | null;
}

/**
 * Actions for useOCR hook
 */
export interface UseOCRActions {
  /** Process image with specified regions */
  processImage(
    imageData: string,
    regions?: Array<{
      id: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  ): Promise<OCRRegionResult[]>;

  /** Cancel ongoing processing */
  cancel(): Promise<void>;

  /** Reset state */
  reset(): void;
}

/**
 * Return type for useOCR hook
 */
export type UseOCRReturn = UseOCRState & UseOCRActions;

/**
 * Custom hook for OCR processing with progress tracking
 *
 * @param options - Configuration options for OCR processing
 * @returns Object with state and actions for OCR processing
 *
 * @example
 * const { isProcessing, progress, results, error, processImage, cancel, reset } = useOCR();
 *
 * // Process image with regions
 * const results = await processImage(imageData, regions);
 *
 * // Cancel processing
 * await cancel();
 *
 * // Reset state
 * reset();
 */
export function useOCR(options: UseOCROptions = {}): UseOCRReturn {
  const { _language = 'jpn', preprocessing = true, preprocessingOptions = {} } = options;

  // State
  const [state, setState] = useState<UseOCRState>({
    isProcessing: false,
    progress: 0,
    status: 'Ready',
    results: [],
    error: null,
  });

  // Refs
  const engineRef = useRef<OCREngine | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize OCR engine
  useEffect(() => {
    const initializeEngine = () => {
      try {
        if (!engineRef.current) {
          engineRef.current = new OCREngine();
        }
      } catch (error) {
        console.error('Failed to initialize OCR engine:', error);
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Failed to initialize OCR engine',
          }));
        }
      }
    };

    initializeEngine();

    return () => {
      // Cleanup on unmount
      if (engineRef.current) {
        engineRef.current.terminate().catch((error) => {
          console.error('Failed to terminate OCR engine:', error);
        });
      }
    };
  }, []);

  /**
   * Update state if component is mounted
   */
  const updateState = useCallback((updates: Partial<UseOCRState>) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Progress callback for OCR processing
   */
  const handleProgress = useCallback(
    (progress: { progress: number; status: string }) => {
      updateState({
        progress: progress.progress,
        status: progress.status,
      });
    },
    [updateState]
  );

  /**
   * Preprocess image if enabled
   */
  const preprocessImage = useCallback(
    async (imageData: string): Promise<string> => {
      if (!preprocessing) {
        return imageData;
      }

      try {
        updateState({ status: 'Preprocessing image...' });

        const processed = await ImageProcessor.processImage(imageData, {
          width: preprocessingOptions.width,
          height: preprocessingOptions.height,
          grayscale: preprocessingOptions.grayscale,
          contrast: preprocessingOptions.contrast,
          brightness: preprocessingOptions.brightness,
        });

        return processed;
      } catch (error) {
        console.error('Image preprocessing failed:', error);
        throw new Error('Failed to preprocess image');
      }
    },
    [preprocessing, preprocessingOptions, updateState]
  );

  /**
   * Process single region with OCR
   */
  const processRegionOCR = useCallback(
    async (
      imageData: string,
      regionId: string,
      regionName: string
    ): Promise<OCRRegionResult | null> => {
      if (!engineRef.current) {
        throw new Error('OCR engine not initialized');
      }

      try {
        const startTime = performance.now();

        updateState({ status: `Processing region: ${regionName}...` });

        const result = await engineRef.current.recognize(imageData, handleProgress);

        if (!result) {
          return null;
        }

        const endTime = performance.now();

        return {
          regionId,
          regionName,
          text: result.text,
          confidence: result.confidence,
          processingTime: Math.round(endTime - startTime),
        };
      } catch (error) {
        console.error(`Failed to process region ${regionName}:`, error);
        throw error;
      }
    },
    [handleProgress, updateState]
  );

  /**
   * Process image with OCR
   */
  const processImage = useCallback(
    async (
      imageData: string,
      regions?: Array<{
        id: string;
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }>
    ): Promise<OCRRegionResult[]> => {
      if (state.isProcessing) {
        throw new Error('OCR processing already in progress');
      }

      if (!imageData) {
        throw new Error('Invalid image data');
      }

      // Create abort controller for this operation
      abortControllerRef.current = new AbortController();

      try {
        updateState({
          isProcessing: true,
          progress: 0,
          status: 'Starting OCR processing...',
          error: null,
          results: [],
        });

        // Preprocess image
        let processedImage = imageData;
        if (preprocessing) {
          processedImage = await preprocessImage(imageData);
        }

        const results: OCRRegionResult[] = [];

        // Process regions
        if (regions && regions.length > 0) {
          // Extract regions from image
          const regionImages = await ImageProcessor.extractRegions(
            processedImage,
            regions.map((r) => ({
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
            }))
          );

          // Process each region
          for (let i = 0; i < regions.length; i++) {
            if (abortControllerRef.current.signal.aborted) {
              throw new Error('Processing cancelled');
            }

            const region = regions[i];
            const regionImage = regionImages[i];

            const result = await processRegionOCR(regionImage, region.id, region.name);

            if (result) {
              results.push(result);
            }

            // Update progress
            const progress = (i + 1) / regions.length;
            updateState({ progress });
          }
        } else {
          // Process entire image as single region
          const result = await processRegionOCR(processedImage, 'full', 'Full Image');

          if (result) {
            results.push(result);
          }

          updateState({ progress: 1 });
        }

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            progress: 1,
            status: 'Processing complete',
            results,
            error: null,
          }));
        }

        return results;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'OCR processing failed';

        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            error: errorMessage,
            status: `Error: ${errorMessage}`,
          }));
        }

        throw error;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [state.isProcessing, preprocessing, preprocessImage, processRegionOCR, updateState]
  );

  /**
   * Cancel ongoing processing
   */
  const cancel = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();

      updateState({
        isProcessing: false,
        error: 'Processing cancelled',
        status: 'Processing cancelled',
      });
    }
  }, [updateState]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    updateState({
      isProcessing: false,
      progress: 0,
      status: 'Ready',
      results: [],
      error: null,
    });
  }, [updateState]);

  // Mark as unmounted when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    processImage,
    cancel,
    reset,
  };
}

/**
 * OCR Type Definitions
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/DataInput/OCRProcessor.tsx
 *   ├─ src/components/DataInput/ResultEditor.tsx
 *   ├─ src/hooks/useOCRProcessing.ts
 *   └─ src/utils/ocrEngine.ts
 *
 * Dependencies (External files that this file imports):
 *   (none - type definition file)
 *
 * Related Documentation:
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

/**
 * OCR result for a single region
 */
export interface OCRResult {
  regionId: string;
  regionName: string;
  text: string;
  confidence: number; // 0-1
  processingTime: number; // milliseconds
}

/**
 * Progress callback information during OCR processing
 */
export interface OCRProgress {
  status: string;
  progress: number; // 0-1
}

/**
 * Status information during OCR processing
 */
export interface OCRProcessingStatus {
  isProcessing: boolean;
  currentRegion?: string;
  progress: number; // 0-100
  completed: OCRResult[];
  error?: string;
}

/**
 * Configuration for OCR engine
 */
export interface OCRConfig {
  language: string;
  confidence_threshold: number;
  preprocessing_enabled: boolean;
}

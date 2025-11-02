/**
 * Application Configuration
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/Camera/Camera.tsx
 *   ├─ src/utils/ocrEngine.ts
 *   ├─ src/utils/templateStorage.ts
 *   └─ src/hooks/useCamera.ts
 *
 * Dependencies (External files that this file imports):
 *   (none - configuration file)
 *
 * Related Documentation:
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

export const APP_CONFIG = {
  CAMERA: {
    DEFAULT_WIDTH: 1920,
    DEFAULT_HEIGHT: 1080,
    FACING_MODE: 'environment' as const,
  },
  OCR: {
    LANGUAGE: 'jpn',
    MAX_PROCESSING_TIME: 20000, // 20 seconds
    CONFIDENCE_THRESHOLD: 0.6,
  },
  STORAGE: {
    TEMPLATE_KEY: 'ocr-app-templates',
    MAX_TEMPLATES: 20,
  },
  UI: {
    TOAST_DURATION: 3000,
    MODAL_ANIMATION_DURATION: 300,
  },
} as const;

// Camera constraints for MediaDevices API
export const CAMERA_CONSTRAINTS = {
  width: { ideal: APP_CONFIG.CAMERA.DEFAULT_WIDTH },
  height: { ideal: APP_CONFIG.CAMERA.DEFAULT_HEIGHT },
  facingMode: APP_CONFIG.CAMERA.FACING_MODE,
} as const;

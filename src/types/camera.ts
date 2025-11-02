/**
 * Camera Type Definitions
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/Camera/Camera.tsx
 *   ├─ src/hooks/useCamera.ts
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   (none - type definition file)
 *
 * Related Documentation:
 *   ├─ Research: docs/02_research/2024_11/20241102_02_react-camera-integration.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

/**
 * Camera constraints for video stream
 */
export interface CameraConstraints {
  width: number;
  height: number;
  facingMode?: 'user' | 'environment';
}

/**
 * Camera state management
 */
export interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  capturedImage: HTMLCanvasElement | null;
}

/**
 * Camera hook return type
 */
export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => HTMLCanvasElement | null;
}

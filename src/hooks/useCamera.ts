/**
 * useCamera Custom Hook
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/components/Camera/Camera.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   └─ src/config/appConfig.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./useCamera.spec.md
 *   ├─ Tests: ./useCamera.test.ts
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Prompt: docs/00_prompts/20241102_03_phase3-template-management.md
 */

import { useCallback, useState } from 'react';
import { CAMERA_CONSTRAINTS } from '../config/appConfig';

interface UseCameraReturn {
  stream: MediaStream | null;
  isActive: boolean;
  capturedImage: string | null; // base64 data URL
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: (videoElement: HTMLVideoElement) => void;
  clearCapturedImage: () => void;
}

/**
 * Custom hook for managing camera access and image capture
 *
 * Provides functionality to:
 * - Start/stop camera stream
 * - Capture images from video element
 * - Handle camera errors with Japanese messages
 *
 * @returns {UseCameraReturn} Camera control functions and state
 *
 * @example
 * ```tsx
 * const { stream, capturedImage, startCamera, captureImage } = useCamera();
 *
 * useEffect(() => {
 *   startCamera();
 *   return () => stopCamera();
 * }, []);
 *
 * const handleCapture = () => {
 *   if (videoRef.current) {
 *     captureImage(videoRef.current);
 *   }
 * };
 * ```
 */
export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start camera stream using MediaDevices API
   */
  const startCamera = useCallback(async () => {
    try {
      // Stop existing stream if any
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: CAMERA_CONSTRAINTS,
      });

      setStream(mediaStream);
      setError(null);
    } catch (err) {
      // Handle different error types with specific messages
      if (err instanceof Error) {
        switch (err.name) {
          case 'NotAllowedError':
            setError(
              'カメラへのアクセスが拒否されました。ブラウザの設定でカメラの使用を許可してください。'
            );
            break;
          case 'NotFoundError':
            setError('カメラが見つかりませんでした。カメラが接続されているか確認してください。');
            break;
          case 'NotReadableError':
            setError('カメラは他のアプリケーションで使用中です。');
            break;
          default:
            setError('カメラの起動に失敗しました。');
        }
      } else {
        setError('カメラの起動に失敗しました。');
      }
      setStream(null);
    }
  }, [stream]);

  /**
   * Stop camera stream and release resources
   */
  const stopCamera = useCallback(() => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      setStream(null);
    }
  }, [stream]);

  /**
   * Capture image from video element using Canvas API
   *
   * @param videoElement - HTMLVideoElement to capture from
   */
  const captureImage = useCallback((videoElement: HTMLVideoElement) => {
    try {
      // Validate video element
      if (!videoElement || videoElement.videoWidth === 0) {
        setError('ビデオが読み込まれていません。');
        return;
      }

      // Create canvas for image capture
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('画像のキャプチャに失敗しました。');
        return;
      }

      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to base64 JPEG with 80% quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      setError(null);
    } catch (err) {
      setError('画像のキャプチャに失敗しました。');
      console.error('Image capture error:', err);
    }
  }, []);

  /**
   * Clear captured image
   */
  const clearCapturedImage = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return {
    stream,
    isActive: stream !== null,
    capturedImage,
    error,
    startCamera,
    stopCamera,
    captureImage,
    clearCapturedImage,
  };
}

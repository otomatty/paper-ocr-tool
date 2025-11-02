/**
 * Camera Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react (useRef, useEffect)
 *   ├─ ../../hooks/useCamera.ts
 *   └─ ../common/Button/Button.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./Camera.spec.md
 *   ├─ Tests: ./Camera.test.tsx
 *   └─ Plan: docs/03_plans/template-management/20241102_01_implementation-plan.md
 */

import type React from 'react';
import { useEffect, useRef } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { Button } from '../common/Button/Button';

interface CameraProps {
  /**
   * Callback function called when image is captured
   * @param imageData - Base64 encoded image data (data:image/jpeg;base64,...)
   */
  onCapture?: (imageData: string) => void;

  /**
   * Optional class name for custom styling
   */
  className?: string;

  /**
   * Show captured image preview after capture
   * @default true
   */
  showCapturedImage?: boolean;
}

export const Camera: React.FC<CameraProps> = ({
  onCapture,
  className = '',
  showCapturedImage = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    stream,
    isActive,
    capturedImage,
    error,
    startCamera,
    stopCamera,
    captureImage,
    clearCapturedImage,
  } = useCamera();

  // Set video stream when camera is active
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error('Video play error:', err);
      });
    }
  }, [stream]);

  // Handle capture button click
  const handleCapture = () => {
    if (videoRef.current) {
      captureImage(videoRef.current);
    }
  };

  // Handle retake button click
  const handleRetake = () => {
    clearCapturedImage();
  };

  // Call onCapture callback when image is captured
  useEffect(() => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Camera Preview Area */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        {/* Video Preview */}
        {isActive && !capturedImage && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            aria-label="カメラプレビュー"
          />
        )}

        {/* Captured Image Preview */}
        {capturedImage && showCapturedImage && (
          <img src={capturedImage} alt="撮影された画像" className="w-full h-full object-contain" />
        )}

        {/* Status Message */}
        {!isActive && !capturedImage && (
          <p className="text-white text-center px-4">カメラを起動してください</p>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white p-3 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Start Camera Button */}
        {!isActive && (
          <Button
            label="カメラ起動"
            onClick={startCamera}
            variant="primary"
            size="medium"
            ariaLabel="カメラを起動"
          />
        )}

        {/* Capture Button */}
        {isActive && !capturedImage && (
          <Button
            label="撮影"
            onClick={handleCapture}
            variant="primary"
            size="medium"
            ariaLabel="写真を撮影"
          />
        )}

        {/* Stop Camera Button */}
        {isActive && !capturedImage && (
          <Button
            label="停止"
            onClick={stopCamera}
            variant="secondary"
            size="medium"
            ariaLabel="カメラを停止"
          />
        )}

        {/* Retake Button */}
        {capturedImage && showCapturedImage && (
          <Button
            label="再撮影"
            onClick={handleRetake}
            variant="primary"
            size="medium"
            ariaLabel="再度撮影"
          />
        )}
      </div>
    </div>
  );
};

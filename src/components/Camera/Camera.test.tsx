/**
 * Camera Component Tests
 *
 * Tests for Camera component using useCamera hook
 * Note: Simplified tests due to limitations with module mocking in Bun
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import { Camera } from './Camera';

// Create mock functions with proper reset
let mockStartCamera = mock(() => Promise.resolve());
let mockStopCamera = mock(() => {});
let mockCaptureImage = mock(() => {});
let mockClearCapturedImage = mock(() => {});

// Mock useCamera hook return value - recreate for each test
let mockUseCameraReturn = {
  stream: null as MediaStream | null,
  isActive: false,
  capturedImage: null as string | null,
  error: null as string | null,
  startCamera: mockStartCamera,
  stopCamera: mockStopCamera,
  captureImage: mockCaptureImage,
  clearCapturedImage: mockClearCapturedImage,
};

// Mock the useCamera module
mock.module('../../hooks/useCamera', () => ({
  useCamera: () => mockUseCameraReturn,
}));

describe('Camera Component', () => {
  beforeEach(() => {
    // Mock HTMLVideoElement.srcObject setter to avoid happy-dom TypeError
    Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
      set: mock(() => {}),
      configurable: true,
    });

    // Recreate mock functions
    mockStartCamera = mock(() => Promise.resolve());
    mockStopCamera = mock(() => {});
    mockCaptureImage = mock(() => {});
    mockClearCapturedImage = mock(() => {});

    // Reset mock return value with new functions
    mockUseCameraReturn = {
      stream: null,
      isActive: false,
      capturedImage: null,
      error: null,
      startCamera: mockStartCamera,
      stopCamera: mockStopCamera,
      captureImage: mockCaptureImage,
      clearCapturedImage: mockClearCapturedImage,
    };
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  describe('TC-CAMERA-UI-001: 初期レンダリング', () => {
    it('should render initial state correctly', () => {
      render(<Camera />);

      // Initial message should be displayed
      expect(screen.getByText('カメラを起動してください')).toBeDefined();

      // Start button should be displayed
      expect(screen.getByRole('button', { name: 'カメラを起動' })).toBeDefined();

      // Video element should not be displayed
      expect(screen.queryByLabelText('カメラプレビュー')).toBeNull();
    });
  });
  describe('TC-CAMERA-UI-002: カメラ起動', () => {
    it('should display video preview when camera is active', () => {
      // Set mock to active state
      mockUseCameraReturn.isActive = true;
      // Create a minimal MediaStream-like object
      mockUseCameraReturn.stream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
      } as unknown as MediaStream;

      render(<Camera />);

      // Video element should be displayed
      const video = screen.getByLabelText('カメラプレビュー');
      expect(video).toBeDefined();

      // Capture button should be visible and enabled
      const captureButton = screen.getByRole('button', {
        name: '写真を撮影',
      });
      expect(captureButton).toBeDefined();
      expect(captureButton.hasAttribute('disabled')).toBe(false);

      // Stop button should be visible
      const stopButton = screen.getByRole('button', {
        name: 'カメラを停止',
      });
      expect(stopButton).toBeDefined();

      // Start button should not be displayed
      expect(screen.queryByRole('button', { name: 'カメラを起動' })).toBeNull();
    });

    it('should call startCamera when start button is clicked', () => {
      render(<Camera />);

      const startButton = screen.getByRole('button', {
        name: 'カメラを起動',
      });
      startButton.click();

      expect(mockStartCamera).toHaveBeenCalledTimes(1);
    });
  });

  describe('TC-CAMERA-UI-003: 画像撮影', () => {
    it('should display captured image and retake button', () => {
      mockUseCameraReturn.capturedImage = 'data:image/jpeg;base64,mockImageData';

      render(<Camera />);

      // Captured image should be displayed
      const capturedImage = screen.getByAltText('撮影された画像');
      expect(capturedImage).toBeDefined();
      expect(capturedImage.getAttribute('src')).toBe('data:image/jpeg;base64,mockImageData');

      // Retake button should be displayed
      const retakeButton = screen.getByRole('button', { name: '再度撮影' });
      expect(retakeButton).toBeDefined();
    });

    it('should call captureImage when capture button is clicked', () => {
      // Set mock to active state
      mockUseCameraReturn.isActive = true;
      mockUseCameraReturn.stream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
      } as unknown as MediaStream;

      render(<Camera />);

      const captureButton = screen.getByRole('button', {
        name: '写真を撮影',
      });
      captureButton.click();

      expect(mockCaptureImage).toHaveBeenCalledTimes(1);
    });

    it('should call onCapture callback when image is captured', () => {
      const mockImageData = 'data:image/jpeg;base64,mockImageData';
      const onCaptureMock = mock(() => {});

      // Set captured image
      mockUseCameraReturn.capturedImage = mockImageData;

      render(<Camera onCapture={onCaptureMock} />);

      // onCapture should be called
      expect(onCaptureMock).toHaveBeenCalledWith(mockImageData);
    });
  });

  describe('TC-CAMERA-UI-004: カメラ停止', () => {
    it('should call stopCamera when stop button is clicked', () => {
      // Set mock to active state
      mockUseCameraReturn.isActive = true;
      mockUseCameraReturn.stream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
      } as unknown as MediaStream;

      render(<Camera />);

      const stopButton = screen.getByRole('button', {
        name: 'カメラを停止',
      });
      stopButton.click();

      expect(mockStopCamera).toHaveBeenCalledTimes(1);
    });
  });

  describe('TC-CAMERA-UI-005: 再撮影', () => {
    it('should call clearCapturedImage when retake button is clicked', () => {
      mockUseCameraReturn.capturedImage = 'data:image/jpeg;base64,mockImageData';

      render(<Camera />);

      const retakeButton = screen.getByRole('button', { name: '再度撮影' });
      retakeButton.click();

      expect(mockClearCapturedImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('TC-CAMERA-UI-006: エラー表示', () => {
    it('should display error message when error exists', () => {
      const errorMessage = 'カメラへのアクセスが拒否されました';

      // Set mock to error state
      mockUseCameraReturn.error = errorMessage;

      render(<Camera />);

      // Error message should be displayed
      expect(screen.getByText(errorMessage)).toBeDefined();

      // Start button should still be clickable
      const startButton = screen.getByRole('button', {
        name: 'カメラを起動',
      });
      expect(startButton).toBeDefined();
      expect(startButton.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('TC-CAMERA-UI-007: onCaptureコールバック', () => {
    it('should not throw error when onCapture is not provided', () => {
      const mockImageData = 'data:image/jpeg;base64,mockImageData';

      // Set captured image
      mockUseCameraReturn.capturedImage = mockImageData;

      // Should not throw error
      expect(() => {
        render(<Camera />);
      }).not.toThrow();
    });
  });

  describe('TC-CAMERA-UI-008: showCapturedImage=false', () => {
    it('should not display captured image when showCapturedImage is false', () => {
      const mockImageData = 'data:image/jpeg;base64,mockImageData';
      const onCaptureMock = mock(() => {});

      // Set captured image
      mockUseCameraReturn.isActive = true;
      mockUseCameraReturn.capturedImage = mockImageData;

      render(<Camera onCapture={onCaptureMock} showCapturedImage={false} />);

      // onCapture should be called
      expect(onCaptureMock).toHaveBeenCalledWith(mockImageData);

      // Image should not be displayed
      expect(screen.queryByAltText('撮影された画像')).toBeNull();

      // Retake button should not be displayed
      expect(screen.queryByRole('button', { name: '再度撮影' })).toBeNull();
    });
  });

  describe('TC-CAMERA-UI-010: アクセシビリティ属性', () => {
    it('should have proper aria-labels on buttons', () => {
      render(<Camera />);

      // Start button should have aria-label
      const startButton = screen.getByRole('button', {
        name: 'カメラを起動',
      });
      expect(startButton.getAttribute('aria-label')).toBe('カメラを起動');
    });

    it('should have proper aria-label on video element', () => {
      // Set mock to active state
      mockUseCameraReturn.isActive = true;
      mockUseCameraReturn.stream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
      } as unknown as MediaStream;

      render(<Camera />);

      const video = screen.getByLabelText('カメラプレビュー');
      expect(video.getAttribute('aria-label')).toBe('カメラプレビュー');
    });
  });

  describe('Edge Cases', () => {
    it('should handle custom className', () => {
      const { container } = render(<Camera className="custom-class" />);

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeDefined();
    });

    it('should not display video when camera is not active', () => {
      render(<Camera />);

      expect(screen.queryByLabelText('カメラプレビュー')).toBeNull();
    });

    it('should display both capture and stop buttons when camera is active', () => {
      // Set mock to active state
      mockUseCameraReturn.isActive = true;
      mockUseCameraReturn.stream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
      } as unknown as MediaStream;

      render(<Camera />);

      expect(screen.getByRole('button', { name: '写真を撮影' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'カメラを停止' })).toBeDefined();
    });
  });
});

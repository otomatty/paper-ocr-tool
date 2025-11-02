/**
 * useCamera Custom Hook Tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { useCamera } from './useCamera';

// Mock MediaDevices API
const mockGetUserMedia = vi.fn();
const createMockMediaStream = () =>
  ({
    getTracks: vi.fn(() => [{ stop: vi.fn() }, { stop: vi.fn() }]),
  }) as unknown as MediaStream;

let mockMediaStream: MediaStream;

describe('useCamera', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockMediaStream = createMockMediaStream();

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      writable: true,
      configurable: true,
    });

    // Mock HTMLCanvasElement and context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mockImageData');

    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        const canvas = originalCreateElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        return canvas;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TC-CAMERA-001: カメラ起動成功', () => {
    it('should start camera successfully', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);

      const { result } = renderHook(() => useCamera());

      // Initial state
      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBeNull();

      // Start camera
      await act(async () => {
        await result.current.startCamera();
      });

      // Verify camera started
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: expect.objectContaining({
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment',
        }),
      });
      expect(result.current.stream).toEqual(mockMediaStream);
      expect(result.current.isActive).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('TC-CAMERA-002: カメラ停止成功', () => {
    it('should stop camera successfully', async () => {
      const mockTrack1 = { stop: vi.fn() };
      const mockTrack2 = { stop: vi.fn() };
      const testStream = {
        getTracks: () => [mockTrack1, mockTrack2],
      } as unknown as MediaStream;

      mockGetUserMedia.mockResolvedValue(testStream);

      const { result } = renderHook(() => useCamera());

      // Start camera first
      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.isActive).toBe(true);

      // Stop camera
      act(() => {
        result.current.stopCamera();
      });

      // Verify camera stopped
      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);

      // Verify tracks were stopped
      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
    });

    it('should handle stop when stream is null', () => {
      const { result } = renderHook(() => useCamera());

      // Stop camera without starting
      act(() => {
        result.current.stopCamera();
      });

      // Should not throw error
      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('TC-CAMERA-003: 画像キャプチャ成功', () => {
    it('should capture image from video element', () => {
      const { result } = renderHook(() => useCamera());

      // Create mock video element
      const mockVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
      } as HTMLVideoElement;

      // Capture image
      act(() => {
        result.current.captureImage(mockVideo);
      });

      // Verify captured image
      expect(result.current.capturedImage).toBe('data:image/jpeg;base64,mockImageData');
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid video element', () => {
      const { result } = renderHook(() => useCamera());

      // Create invalid video element
      const mockVideo = {
        videoWidth: 0,
        videoHeight: 0,
      } as HTMLVideoElement;

      // Capture image
      act(() => {
        result.current.captureImage(mockVideo);
      });

      // Verify error
      expect(result.current.capturedImage).toBeNull();
      expect(result.current.error).toBe('ビデオが読み込まれていません。');
    });

    it('should handle canvas context error', () => {
      const { result } = renderHook(() => useCamera());

      // Mock getContext to return null
      HTMLCanvasElement.prototype.getContext = vi.fn(
        () => null
      ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

      const mockVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
      } as HTMLVideoElement;

      // Capture image
      act(() => {
        result.current.captureImage(mockVideo);
      });

      // Verify error
      expect(result.current.capturedImage).toBeNull();
      expect(result.current.error).toBe('画像のキャプチャに失敗しました。');
    });
  });

  describe('TC-CAMERA-004: キャプチャ画像クリア', () => {
    it('should clear captured image', () => {
      const { result } = renderHook(() => useCamera());

      // Capture image first
      const mockVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
      } as HTMLVideoElement;

      act(() => {
        result.current.captureImage(mockVideo);
      });

      expect(result.current.capturedImage).not.toBeNull();

      // Clear captured image
      act(() => {
        result.current.clearCapturedImage();
      });

      // Verify image cleared
      expect(result.current.capturedImage).toBeNull();
    });
  });

  describe('TC-CAMERA-005: カメラアクセス拒否エラー', () => {
    it('should handle NotAllowedError', async () => {
      const notAllowedError = new Error('Permission denied');
      notAllowedError.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(notAllowedError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBe(
        'カメラへのアクセスが拒否されました。ブラウザの設定でカメラの使用を許可してください。'
      );
    });
  });

  describe('TC-CAMERA-006: カメラ未検出エラー', () => {
    it('should handle NotFoundError', async () => {
      const notFoundError = new Error('Camera not found');
      notFoundError.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBe(
        'カメラが見つかりませんでした。カメラが接続されているか確認してください。'
      );
    });
  });

  describe('TC-CAMERA-007: カメラ使用中エラー', () => {
    it('should handle NotReadableError', async () => {
      const notReadableError = new Error('Camera in use');
      notReadableError.name = 'NotReadableError';
      mockGetUserMedia.mockRejectedValue(notReadableError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBe('カメラは他のアプリケーションで使用中です。');
    });
  });

  describe('TC-CAMERA-008: 一般的なエラー', () => {
    it('should handle generic Error', async () => {
      const genericError = new Error('Unknown error');
      mockGetUserMedia.mockRejectedValue(genericError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBe('カメラの起動に失敗しました。');
    });

    it('should handle non-Error exceptions', async () => {
      mockGetUserMedia.mockRejectedValue('string error');

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBe('カメラの起動に失敗しました。');
    });
  });

  describe('Edge Cases', () => {
    it('should stop existing stream when starting camera again', async () => {
      const mockTrack1 = { stop: vi.fn() };
      const mockTrack2 = { stop: vi.fn() };
      const firstStream = {
        getTracks: () => [mockTrack1, mockTrack2],
      } as unknown as MediaStream;

      mockGetUserMedia.mockResolvedValue(firstStream);

      const { result } = renderHook(() => useCamera());

      // Start camera first time
      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.stream).not.toBeNull();

      // Start camera again
      const newMockStream = createMockMediaStream();
      mockGetUserMedia.mockResolvedValue(newMockStream);

      await act(async () => {
        await result.current.startCamera();
      });

      // Verify old stream was stopped
      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();

      // Verify new stream is set
      expect(result.current.stream).not.toBeNull();
      expect(result.current.isActive).toBe(true);
    });

    it('should clear error on successful camera start', async () => {
      const notFoundError = new Error('Camera not found');
      notFoundError.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValueOnce(notFoundError);

      const { result } = renderHook(() => useCamera());

      // First attempt - error
      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.error).not.toBeNull();

      // Second attempt - success
      mockGetUserMedia.mockResolvedValue(mockMediaStream);

      await act(async () => {
        await result.current.startCamera();
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
      expect(result.current.isActive).toBe(true);
    });

    it('should clear error on successful image capture', () => {
      const { result } = renderHook(() => useCamera());

      // Set error state first
      const invalidVideo = {
        videoWidth: 0,
        videoHeight: 0,
      } as HTMLVideoElement;

      act(() => {
        result.current.captureImage(invalidVideo);
      });

      expect(result.current.error).not.toBeNull();

      // Capture valid image
      const validVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
      } as HTMLVideoElement;

      act(() => {
        result.current.captureImage(validVideo);
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
      expect(result.current.capturedImage).not.toBeNull();
    });
  });

  describe('Memory Management', () => {
    it('should properly cleanup streams', async () => {
      const mockTrack1 = { stop: vi.fn() };
      const mockTrack2 = { stop: vi.fn() };
      const testStream = {
        getTracks: () => [mockTrack1, mockTrack2],
      } as unknown as MediaStream;

      mockGetUserMedia.mockResolvedValue(testStream);

      const { result, unmount } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.isActive).toBe(true);

      // Unmount component (simulating component cleanup)
      // Note: The hook itself doesn't have cleanup, but the component using it should call stopCamera
      act(() => {
        result.current.stopCamera();
      });

      unmount();

      // Verify cleanup
      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
    });
  });
});

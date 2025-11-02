/**
 * Image Processing Utility
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/utils/ocrEngine.ts (画像前処理用)
 *   └─ src/hooks/useOCR.ts (OCR 処理前の画像最適化)
 *
 * Dependencies (External files that this file imports):
 *   (none - pure utility)
 *
 * Related Documentation:
 *   ├─ Spec: ./imageProcessor.spec.md
 *   ├─ Tests: ./imageProcessor.test.ts
 *   └─ Related: ./ocrEngine.ts
 */

/**
 * Image processing options
 */
interface ImageProcessingOptions {
  /** Width to resize to (optional) */
  width?: number;
  /** Height to resize to (optional) */
  height?: number;
  /** Apply grayscale conversion (default: false) */
  grayscale?: boolean;
  /** Apply contrast adjustment (0-2, 1 = normal) */
  contrast?: number;
  /** Apply brightness adjustment (-100 to 100) */
  brightness?: number;
}

/**
 * Region coordinates (normalized 0-1)
 */
export interface RegionCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Load image from Base64 data
 * @param imageData - Base64 image data
 * @returns Promise<HTMLImageElement>
 */
async function loadImage(imageData: string): Promise<HTMLImageElement> {
  if (!imageData || typeof imageData !== 'string') {
    throw new Error('Invalid image data');
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

    // Handle timeout
    const timeoutId = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 5000);

    image.onload = () => {
      clearTimeout(timeoutId);
      resolve(image);
    };

    image.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };

    try {
      image.src = imageData;
    } catch {
      clearTimeout(timeoutId);
      reject(new Error('Invalid image data'));
    }
  });
}

/**
 * Convert canvas to Base64 image data
 * @param image - HTMLImageElement
 * @param width - Target width (or original width if not specified)
 * @param height - Target height (or original height if not specified)
 * @returns Base64 image data
 */
function canvasToBase64(image: HTMLImageElement, width?: number, height?: number): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  const targetWidth = width || image.width;
  const targetHeight = height || image.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL('image/png');
}

/**
 * Resize image
 * @param imageData - Base64 image data
 * @param width - Target width
 * @param height - Target height
 * @returns Base64 resized image data
 */
export async function resizeImage(
  imageData: string,
  width: number,
  height: number
): Promise<string> {
  const image = await loadImage(imageData);
  return canvasToBase64(image, width, height);
}

/**
 * Convert image to grayscale
 * @param imageData - Base64 image data
 * @returns Base64 grayscale image data
 */
export async function toGrayscale(imageData: string): Promise<string> {
  const image = await loadImage(imageData);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  canvas.width = image.width;
  canvas.height = image.height;

  // Draw image
  ctx.drawImage(image, 0, 0);

  // Get image data and apply grayscale
  const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageDataObj.data;

  // Apply luminosity method
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray; // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
    // data[i + 3] is alpha, leave unchanged
  }

  ctx.putImageData(imageDataObj, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Adjust image contrast
 * @param imageData - Base64 image data
 * @param contrast - Contrast value (0-2, 1 = normal)
 * @returns Base64 adjusted image data
 */
export async function adjustContrast(imageData: string, contrast: number): Promise<string> {
  const image = await loadImage(imageData);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  canvas.width = image.width;
  canvas.height = image.height;

  // Draw image
  ctx.drawImage(image, 0, 0);

  // Get image data
  const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageDataObj.data;

  // Clamp contrast value
  const c = Math.max(0, Math.min(3, contrast));

  // Apply contrast adjustment
  // Formula: output = (input - 128) * contrast + 128
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (data[i] - 128) * c + 128; // Red
    data[i + 1] = (data[i + 1] - 128) * c + 128; // Green
    data[i + 2] = (data[i + 2] - 128) * c + 128; // Blue
  }

  ctx.putImageData(imageDataObj, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Adjust image brightness
 * @param imageData - Base64 image data
 * @param brightness - Brightness value (-100 to 100)
 * @returns Base64 adjusted image data
 */
export async function adjustBrightness(imageData: string, brightness: number): Promise<string> {
  const image = await loadImage(imageData);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  canvas.width = image.width;
  canvas.height = image.height;

  // Draw image
  ctx.drawImage(image, 0, 0);

  // Get image data
  const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageDataObj.data;

  // Clamp brightness value
  const b = Math.max(-255, Math.min(255, brightness));

  // Apply brightness adjustment
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + b)); // Red
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + b)); // Green
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + b)); // Blue
  }

  ctx.putImageData(imageDataObj, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Crop region from image (normalized coordinates 0-1)
 * @param imageData - Base64 image data
 * @param region - Region coordinates (0-1)
 * @returns Base64 cropped image data
 */
export async function cropRegion(imageData: string, region: RegionCoordinates): Promise<string> {
  const image = await loadImage(imageData);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  // Convert normalized coordinates to pixels
  const srcX = Math.max(0, Math.min(1, region.x)) * image.width;
  const srcY = Math.max(0, Math.min(1, region.y)) * image.height;
  const srcWidth = Math.max(0, Math.min(1 - region.x, region.width)) * image.width;
  const srcHeight = Math.max(0, Math.min(1 - region.y, region.height)) * image.height;

  canvas.width = srcWidth;
  canvas.height = srcHeight;

  // Draw cropped region
  ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);

  return canvas.toDataURL('image/png');
}

/**
 * Apply multiple processing options
 * @param imageData - Base64 image data
 * @param options - Processing options
 * @returns Base64 processed image data
 */
export async function processImage(
  imageData: string,
  options: ImageProcessingOptions
): Promise<string> {
  let result = imageData;

  // Apply resize
  if (options.width && options.height) {
    result = await resizeImage(result, options.width, options.height);
  }

  // Apply grayscale
  if (options.grayscale) {
    result = await toGrayscale(result);
  }

  // Apply contrast
  if (options.contrast && options.contrast !== 1) {
    result = await adjustContrast(result, options.contrast);
  }

  // Apply brightness
  if (options.brightness && options.brightness !== 0) {
    result = await adjustBrightness(result, options.brightness);
  }

  return result;
}

/**
 * Extract multiple regions from image
 * @param imageData - Base64 image data
 * @param regions - Array of region coordinates
 * @returns Array of Base64 cropped images
 */
export async function extractRegions(
  imageData: string,
  regions: RegionCoordinates[]
): Promise<string[]> {
  const results: string[] = [];

  for (const region of regions) {
    const cropped = await cropRegion(imageData, region);
    results.push(cropped);
  }

  return results;
}

/**
 * Get image dimensions
 * @param imageData - Base64 image data
 * @returns Promise<{width: number, height: number}>
 */
export async function getImageDimensions(
  imageData: string
): Promise<{ width: number; height: number }> {
  const image = await loadImage(imageData);
  return {
    width: image.width,
    height: image.height,
  };
}

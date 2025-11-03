/**
 * OCRProcessor Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/pages/DataInputPage.tsx
 *   └─ src/components/DataInput/OCRProcessor.test.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/hooks/useOCR.ts
 *   ├─ src/components/common/Button/Button.tsx
 *   ├─ src/components/common/Layout/Layout.tsx
 *   └─ src/types/ocr.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./OCRProcessor.spec.md
 *   ├─ Tests: ./OCRProcessor.test.tsx
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import { type ChangeEvent, type FC, type FormEvent, useCallback, useRef, useState } from 'react';
import { type OCRRegionResult, useOCR } from '../../hooks/useOCR';
import type { Template } from '../../types/template';
import { Button } from '../common/Button/Button';
import { Layout } from '../common/Layout/Layout';

/**
 * Props for OCRProcessor component
 */
export interface OCRProcessorProps {
  /** Template with regions to process */
  template?: Template;

  /** Callback when OCR processing completes */
  onComplete?: (results: OCRRegionResult[]) => void;

  /** Callback when error occurs */
  onError?: (error: Error) => void;

  /** Enable/disable component */
  disabled?: boolean;

  /** Custom preprocessing options */
  preprocessingOptions?: {
    width?: number;
    height?: number;
    grayscale?: boolean;
    contrast?: number;
    brightness?: number;
  };
}

/**
 * Helper function to convert Template regions to flat structure
 */
function flattenTemplateRegions(template: Template | undefined) {
  if (!template?.regions) return undefined;

  return template.regions.map((region) => ({
    id: region.id,
    name: region.name,
    x: region.coordinates.x,
    y: region.coordinates.y,
    width: region.coordinates.width,
    height: region.coordinates.height,
  }));
}

/**
 * OCRProcessor Component
 *
 * Manages OCR processing workflow including image input,
 * progress tracking, results display, and editing.
 */
export const OCRProcessor: FC<OCRProcessorProps> = ({
  template,
  onComplete,
  onError,
  disabled = false,
  preprocessingOptions,
}) => {
  // State management
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [showResultEditor, setShowResultEditor] = useState(false);
  const [editResults, setEditResults] = useState<OCRRegionResult[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { isProcessing, progress, status, results, error, processImage, cancel, reset } = useOCR({
    preprocessing: true,
    preprocessingOptions,
  });

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files;

      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageData(null);
        setImageName('');
        onError?.(new Error('Invalid file type. Please select an image.'));
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setImageData(null);
        setImageName('');
        onError?.(new Error('Image size too large. Maximum 5MB.'));
        return;
      }

      // Read file as data URL
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result as string;
        setImageData(data);
        setImageName(file.name);
      };

      reader.onerror = () => {
        setImageData(null);
        setImageName('');
        onError?.(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    },
    [onError]
  );

  /**
   * Handle form submission (process image)
   */
  const handleProcess = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!imageData) {
        onError?.(new Error('No image selected'));
        return;
      }

      try {
        // Process image with or without template regions
        const flattenedRegions = flattenTemplateRegions(template);
        const processedResults = await processImage(imageData, flattenedRegions);

        // Update edit results for potential editing
        setEditResults(processedResults);
        setShowResultEditor(true);

        // Call completion callback
        onComplete?.(processedResults);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Processing failed');
        onError?.(error);
      }
    },
    [imageData, template, processImage, onComplete, onError]
  );

  /**
   * Handle cancel processing
   */
  const handleCancel = useCallback(async () => {
    await cancel();
    setImageData(null);
    setImageName('');
    reset();
  }, [cancel, reset]);

  /**
   * Handle result edit
   */
  const handleEditResult = useCallback((regionId: string, newText: string) => {
    setEditResults((prev) =>
      prev.map((result) => (result.regionId === regionId ? { ...result, text: newText } : result))
    );
  }, []);

  /**
   * Handle save edited results
   */
  const handleSaveResults = useCallback(() => {
    onComplete?.(editResults);
    setShowResultEditor(false);
  }, [editResults, onComplete]);

  /**
   * Handle retry
   */
  const handleRetry = useCallback(() => {
    setImageData(null);
    setImageName('');
    reset();
  }, [reset]);

  /**
   * Trigger file input click
   */
  const handleSelectImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Layout title="OCR データ入力">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Image Input Section */}
        <section className="space-y-6">
          <form onSubmit={handleProcess} className="space-y-4">
            {/* Upload Area */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleSelectImage}
                disabled={isProcessing || disabled}
                aria-label="Click to select image for OCR"
                className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg p-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isProcessing || disabled}
                  className="hidden"
                  aria-label="Select image file"
                />

                {imageData ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={imageData}
                      alt="Selected for OCR"
                      className="max-h-64 max-w-full object-cover rounded-lg shadow-md"
                    />
                    <p className="text-sm font-medium text-slate-700">{imageName}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-12 h-12 text-slate-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20m-14-6l-3 3m0 0l-3-3m3 3v12m6-18l3 3m0 0l3-3m-3 3v12"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-base font-medium text-slate-700">クリックして画像を選択</p>
                    <p className="text-sm text-slate-500">PNG, JPG 5MB まで</p>
                  </div>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700"
                role="alert"
              >
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Progress Display */}
            {isProcessing && (
              <section className="space-y-3 bg-blue-50 p-4 rounded-lg" aria-live="polite">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-700">{status}</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {Math.round(progress * 100)}%
                  </p>
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {isProcessing ? (
                <Button
                  label="キャンセル"
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={disabled}
                />
              ) : (
                <>
                  <Button
                    label="撮影/選択"
                    onClick={handleSelectImage}
                    variant="secondary"
                    disabled={isProcessing || disabled}
                  />
                  <Button
                    label="OCR 実行"
                    type="submit"
                    variant="primary"
                    disabled={!imageData || isProcessing || disabled}
                  />
                </>
              )}
            </div>
          </form>
        </section>

        {/* Results Section */}
        {results.length > 0 && (
          <section className="mt-12 space-y-6 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900">認識結果</h2>

            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.regionId}
                  className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{result.regionName}</h3>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                      信頼度: {Math.round(result.confidence)}%
                    </span>
                  </div>

                  <p className="text-slate-700 text-base break-words mb-3 min-h-[2rem]">
                    {result.text}
                  </p>

                  <div className="text-xs text-slate-500 border-t border-slate-100 pt-2">
                    <small>処理時間: {result.processingTime}ms</small>
                  </div>
                </div>
              ))}
            </div>

            {/* Result Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                label="結果を編集"
                onClick={() => setShowResultEditor(true)}
                variant="secondary"
              />
              <Button label="完了" onClick={handleSaveResults} variant="primary" />
            </div>
          </section>
        )}

        {/* Result Editor Modal */}
        {showResultEditor && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            role="dialog"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">結果を編集</h2>
              </div>

              <div className="p-6 space-y-4">
                {editResults.map((result) => (
                  <div key={result.regionId} className="space-y-2">
                    <label
                      htmlFor={`edit-${result.regionId}`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      {result.regionName}
                    </label>
                    <textarea
                      id={`edit-${result.regionId}`}
                      value={result.text}
                      onChange={(e) => handleEditResult(result.regionId, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 min-h-[6rem] resize-vertical"
                    />
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  label="キャンセル"
                  onClick={() => setShowResultEditor(false)}
                  variant="secondary"
                />
                <Button label="保存" onClick={handleSaveResults} variant="primary" />
              </div>
            </div>
          </div>
        )}

        {/* Retry Button */}
        {error && !isProcessing && imageData && (
          <div className="mt-6 flex justify-center">
            <Button label="再試行" onClick={handleRetry} variant="secondary" disabled={disabled} />
          </div>
        )}
      </div>
    </Layout>
  );
};

OCRProcessor.displayName = 'OCRProcessor';

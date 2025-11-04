/**
 * ResultEditor Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/pages/DataInputPage.tsx (統合予定)
 *   └─ src/components/DataInput/ResultEditor.test.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/components/common/Button/Button.tsx
 *   ├─ src/components/DataInput/components/ResultEditorHeader.tsx
 *   ├─ src/components/DataInput/components/ResultItemsContainer.tsx
 *   ├─ src/components/DataInput/components/ResultEditorFooter.tsx
 *   ├─ src/components/DataInput/components/ResultPreview.tsx
 *   ├─ src/components/DataInput/utils/formatters.ts
 *   ├─ src/types/ocr.ts
 *   ├─ src/types/template.ts
 *   └─ src/lib/utils.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./ResultEditor.spec.md
 *   ├─ Tests: ./ResultEditor.test.tsx
 *   └─ Plan: docs/03_plans/phase4-3-result-editor-implementation-plan.md
 */

import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { OCRRegionResult } from '../../hooks/useOCR';
import { cn } from '../../lib/utils';
import { Button } from '../common/Button/Button';

/**
 * Props for ResultEditor component
 */
export interface ResultEditorProps {
  /** OCR processing results array */
  results: OCRRegionResult[];

  /** Callback when results are saved */
  onSave: (editedResults: OCRRegionResult[]) => void;

  /** Callback when editing is cancelled */
  onCancel: () => void;

  /** Enable/disable editing (read-only mode) */
  readOnly?: boolean;

  /** Custom CSS classes */
  className?: string;
}

/**
 * Editable result with metadata
 */
export interface EditableResult extends OCRRegionResult {
  /** Whether this result has been edited */
  isEdited: boolean;

  /** Original text before editing */
  originalText: string;
}

/**
 * Statistics for result editor footer
 */
export interface ResultEditorStatistics {
  /** Number of edited results */
  editedCount: number;

  /** Total number of results */
  totalCount: number;

  /** Average confidence score */
  averageConfidence: number;

  /** Total character count */
  totalCharacters: number;
}

/**
 * Format types for output
 */
export type OutputFormat = 'text' | 'csv' | 'json';

/**
 * ResultEditor Component
 *
 * Component for viewing, editing, and managing OCR results.
 * Provides text editing, formatting options, and result management.
 *
 * @example
 * ```tsx
 * <ResultEditor
 *   results={ocrResults}
 *   template={template}
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const ResultEditor: React.FC<ResultEditorProps> = ({
  results,
  onSave,
  onCancel,
  readOnly = false,
  className,
}) => {
  // State management
  const [editableResults, setEditableResults] = useState<EditableResult[]>(() =>
    results.map((r) => ({
      ...r,
      isEdited: false,
      originalText: r.text,
    }))
  );

  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('text');
  const [showPreview, setShowPreview] = useState(false);

  // Calculate statistics
  const statistics = useMemo<ResultEditorStatistics>(() => {
    const editedCount = editableResults.filter((r) => r.isEdited).length;
    const totalCount = editableResults.length;
    const averageConfidence =
      totalCount > 0
        ? Math.round(editableResults.reduce((sum, r) => sum + r.confidence, 0) / totalCount)
        : 0;
    const totalCharacters = editableResults.reduce((sum, r) => sum + r.text.length, 0);

    return {
      editedCount,
      totalCount,
      averageConfidence,
      totalCharacters,
    };
  }, [editableResults]);

  // Handlers
  const handleTextChange = useCallback((regionId: string, newText: string) => {
    setEditableResults((prev) =>
      prev.map((r) => (r.regionId === regionId ? { ...r, text: newText, isEdited: true } : r))
    );
  }, []);

  const handleReset = useCallback((regionId: string) => {
    setEditableResults((prev) =>
      prev.map((r) =>
        r.regionId === regionId ? { ...r, text: r.originalText, isEdited: false } : r
      )
    );
  }, []);

  const handleDelete = useCallback((regionId: string) => {
    setEditableResults((prev) => prev.filter((r) => r.regionId !== regionId));
  }, []);

  const handleResetAll = useCallback(() => {
    setEditableResults((prev) =>
      prev.map((r) => ({
        ...r,
        text: r.originalText,
        isEdited: false,
      }))
    );
  }, []);

  const handleSave = useCallback(() => {
    const resultsToSave = editableResults.map((r) => {
      const { isEdited: _, originalText: __, ...result } = r;
      return result as OCRRegionResult;
    });
    onSave(resultsToSave);
  }, [editableResults, onSave]);

  const handlePreview = useCallback(() => {
    setShowPreview((prev) => !prev);
  }, []);

  // CSS classes
  const containerClasses = cn(
    'result-editor',
    'w-full bg-white border border-slate-200 rounded-lg shadow-sm',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">ステップ 3: 結果確認・編集</h2>
            <p className="text-sm text-slate-600 mt-1">
              抽出されたテキストを確認・編集してください
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as OutputFormat)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={readOnly}
            >
              <option value="text">テキスト</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
        {editableResults.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-500">結果がありません</p>
          </div>
        ) : (
          editableResults.map((result) => (
            <div key={result.regionId} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              {/* Result Item Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{result.regionName}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {`処理時間: ${result.processingTime}ms`}
                  </p>
                </div>

                {/* Confidence Badge */}
                <div
                  className={cn(
                    'inline-block px-2.5 py-1 rounded-full text-xs font-medium ml-2',
                    result.confidence >= 85
                      ? 'bg-green-100 text-green-700'
                      : result.confidence >= 70
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  )}
                >
                  信頼度: {Math.round(result.confidence)}%
                </div>

                {/* Edited Indicator */}
                {result.isEdited && (
                  <span className="inline-block ml-2 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    編集済み
                  </span>
                )}
              </div>

              {/* Original Text (for reference) */}
              {result.isEdited && (
                <div className="mb-3 p-2 bg-slate-100 rounded border border-slate-200">
                  <p className="text-xs text-slate-600 font-medium mb-1">元のテキスト:</p>
                  <p className="text-sm text-slate-700 font-mono">{result.originalText}</p>
                </div>
              )}

              {/* Editable Textarea */}
              <textarea
                value={result.text}
                onChange={(e) => handleTextChange(result.regionId, e.target.value)}
                disabled={readOnly}
                className={cn(
                  'w-full px-4 py-2 border rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'text-slate-900 placeholder-slate-400',
                  'min-h-24 resize-vertical font-mono text-sm',
                  readOnly
                    ? 'bg-slate-100 border-slate-300 text-slate-600'
                    : 'bg-white border-slate-300'
                )}
                placeholder="テキストを編集..."
              />

              {/* Result Item Footer */}
              <div className="flex justify-end gap-2 mt-3">
                {result.isEdited && !readOnly && (
                  <Button
                    label="リセット"
                    onClick={() => handleReset(result.regionId)}
                    variant="secondary"
                    size="small"
                  />
                )}
                {!readOnly && (
                  <Button
                    label="削除"
                    onClick={() => handleDelete(result.regionId)}
                    variant="danger"
                    size="small"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview (conditionally rendered) */}
      {showPreview && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="font-semibold text-slate-900 mb-3">プレビュー</h3>
          <pre className="bg-white border border-slate-200 rounded p-4 overflow-auto max-h-48 text-xs text-slate-700 font-mono whitespace-pre-wrap break-words">
            {/* Format preview will be rendered by parent or utility function */}
            {`[プレビュー形式: ${selectedFormat}]`}
          </pre>
        </div>
      )}

      {/* Statistics */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-slate-600">編集済み: </span>
            <span className="font-semibold text-slate-900">
              {statistics.editedCount} / {statistics.totalCount}
            </span>
          </div>
          <div>
            <span className="text-slate-600">平均信頼度: </span>
            <span className="font-semibold text-slate-900">{statistics.averageConfidence}%</span>
          </div>
          <div>
            <span className="text-slate-600">合計文字数: </span>
            <span className="font-semibold text-slate-900">{statistics.totalCharacters}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between bg-white">
        <div className="flex gap-2">
          {!readOnly && (
            <Button
              label="全てリセット"
              onClick={handleResetAll}
              variant="secondary"
              size="small"
            />
          )}
        </div>

        <div className="flex gap-3 flex-col-reverse sm:flex-row">
          <Button label="キャンセル" onClick={onCancel} variant="secondary" />
          <Button
            label={showPreview ? 'プレビュー非表示' : 'プレビュー'}
            onClick={handlePreview}
            variant="secondary"
          />
          {!readOnly && <Button label="保存" onClick={handleSave} variant="primary" />}
        </div>
      </div>
    </div>
  );
};

ResultEditor.displayName = 'ResultEditor';

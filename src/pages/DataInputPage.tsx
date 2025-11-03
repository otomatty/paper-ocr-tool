/**
 * Data Input Page
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/App.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/hooks/useTemplate.ts
 *   ├─ src/components/common/Layout/Layout.tsx
 *   ├─ src/components/common/Button/Button.tsx
 *   ├─ src/components/DataInput/OCRProcessor.tsx
 *   └─ src/types/ocr.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./DataInputPage.spec.md
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import type React from 'react';
import { useCallback, useState } from 'react';
import { Button } from '../components/common/Button/Button';
import { Layout } from '../components/common/Layout/Layout';
import { OCRProcessor } from '../components/DataInput/OCRProcessor';
import type { OCRRegionResult } from '../hooks/useOCR';
import { useTemplate } from '../hooks/useTemplate';

export const DataInputPage: React.FC = () => {
  const { templates, getTemplate } = useTemplate();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [processingResults, setProcessingResults] = useState<OCRRegionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTemplate = selectedTemplateId ? getTemplate(selectedTemplateId) : null;

  const handleSelectTemplate = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setError(null);
  }, []);

  const handleOCRComplete = useCallback((results: OCRRegionResult[]) => {
    setProcessingResults(results);
    setShowResults(true);
    setError(null);
  }, []);

  const handleOCRError = useCallback((err: Error) => {
    setError(err.message || 'OCR処理中にエラーが発生しました');
    setShowResults(false);
  }, []);

  const handleCopyToClipboard = useCallback(() => {
    const textToCopy = processingResults
      .map((result) => `${result.regionName}: ${result.text}`)
      .join('\n');

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        alert('結果をクリップボードにコピーしました');
      },
      () => {
        setError('クリップボードへのコピーに失敗しました');
      }
    );
  }, [processingResults]);

  const handleReset = useCallback(() => {
    setProcessingResults([]);
    setShowResults(false);
    setError(null);
  }, []);

  return (
    <Layout title="OCR データ入力">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">データ入力</h1>
          <p className="text-lg text-slate-600">
            記入済みアンケートを撮影してOCR処理を行い、データを入力します。
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded" role="alert">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Template Selection & OCR Processor */}
        {!showResults ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Templates */}
            <aside className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  ステップ 1: テンプレート選択
                </h2>
                {templates.length === 0 ? (
                  <p className="text-slate-500">テンプレートが登録されていません</p>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <button
                        type="button"
                        key={template.id}
                        onClick={() => handleSelectTemplate(template.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          selectedTemplateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200'
                        }`}
                      >
                        <p className="font-medium text-slate-900">{template.name}</p>
                        <p className="text-sm text-slate-600">
                          {template.regions?.length ?? 0} 領域
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* OCR Processor */}
            <main className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">
                  ステップ 2: アンケート撮影・OCR実行
                </h2>
                {currentTemplate ? (
                  <OCRProcessor
                    template={currentTemplate}
                    onComplete={handleOCRComplete}
                    onError={handleOCRError}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-slate-700 mb-2">テンプレートを選択してください</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">ステップ 3: 結果確認</h2>
            <div className="space-y-4 mb-6">
              {processingResults.map((result) => (
                <div
                  key={result.regionId}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">{result.regionName}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      信頼度: {Math.round(result.confidence)}%
                    </span>
                  </div>
                  <p className="text-slate-700 font-mono text-sm break-words">{result.text}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t border-slate-200">
              <Button label="戻る" onClick={handleReset} variant="secondary" />
              <Button
                label="📋 クリップボードにコピー"
                onClick={handleCopyToClipboard}
                variant="primary"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

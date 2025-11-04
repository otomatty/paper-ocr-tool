/**
 * Data Input Page - Minimal Design
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/App.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ lucide-react
 *   ├─ src/hooks/useTemplate.ts
 *   ├─ src/components/common/Layout/Layout.tsx
 *   ├─ src/components/common/Button/Button.tsx
 *   ├─ src/components/common/Card/Card.tsx
 *   ├─ src/components/common/Badge/Badge.tsx
 *   ├─ src/components/DataInput/OCRProcessor.tsx
 *   ├─ src/components/DataInput/ResultEditor.tsx
 *   └─ src/types/ocr.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./DataInputPage.spec.md
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import { Badge } from "../components/common/Badge/Badge";
import { Card } from "../components/common/Card/Card";
import { Layout } from "../components/common/Layout/Layout";
import { OCRProcessor } from "../components/DataInput/OCRProcessor";
import { ResultEditor } from "../components/DataInput/ResultEditor";
import type { OCRRegionResult } from "../hooks/useOCR";
import { useTemplate } from "../hooks/useTemplate";

export const DataInputPage: React.FC = () => {
  const { templates, getTemplate } = useTemplate();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [processingResults, setProcessingResults] = useState<OCRRegionResult[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTemplate = selectedTemplateId
    ? getTemplate(selectedTemplateId)
    : null;

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
    setError(err.message || "OCR処理中にエラーが発生しました");
    setShowResults(false);
  }, []);

  const handleReset = useCallback(() => {
    setProcessingResults([]);
    setShowResults(false);
    setError(null);
  }, []);

  const handleResultsEditorSave = useCallback(
    (editedResults: OCRRegionResult[]) => {
      // Copy edited results to clipboard
      const textToCopy = editedResults
        .map((result) => `${result.regionName}: ${result.text}`)
        .join("\n");

      navigator.clipboard.writeText(textToCopy).then(
        () => {
          alert("編集結果をクリップボードにコピーしました");
          handleReset();
        },
        () => {
          setError("クリップボードへのコピーに失敗しました");
        }
      );
    },
    [handleReset]
  );

  const handleResultsEditorCancel = useCallback(() => {
    handleReset();
  }, [handleReset]);

  return (
    <Layout title="OCR データ入力">
      <div className="w-full max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
            データ入力
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed">
            記入済みアンケートを撮影してOCR処理を行い、データを入力します。
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Template Selection & OCR Processor */}
        {!showResults ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Templates Sidebar */}
            <aside className="lg:col-span-1">
              <Card>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                    ステップ 1
                  </h2>
                  <p className="text-sm text-neutral-600">テンプレート選択</p>
                </div>
                {templates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">
                      テンプレートが
                      <br />
                      登録されていません
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template) => {
                      const isSelected = selectedTemplateId === template.id;
                      return (
                        <button
                          type="button"
                          key={template.id}
                          onClick={() => handleSelectTemplate(template.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "border-neutral-900 bg-neutral-50 shadow-sm"
                              : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-neutral-900">
                              {template.name}
                            </p>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                            )}
                          </div>
                          <Badge size="small" variant="neutral">
                            {template.regions?.length ?? 0} 領域
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            </aside>

            {/* OCR Processor Main Area */}
            <main className="lg:col-span-2">
              <Card>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                    ステップ 2
                  </h2>
                  <p className="text-sm text-neutral-600">
                    アンケート撮影・OCR実行
                  </p>
                </div>
                {currentTemplate ? (
                  <OCRProcessor
                    template={currentTemplate}
                    onComplete={handleOCRComplete}
                    onError={handleOCRError}
                  />
                ) : (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <p className="text-lg text-neutral-600 mb-2">
                      まずはテンプレートを選択してください
                    </p>
                    <p className="text-sm text-neutral-500">
                      左側のリストからテンプレートを選ぶと、
                      <br />
                      カメラ撮影とOCR処理が開始できます
                    </p>
                  </div>
                )}
              </Card>
            </main>
          </div>
        ) : (
          <ResultEditor
            results={processingResults}
            onSave={handleResultsEditorSave}
            onCancel={handleResultsEditorCancel}
          />
        )}
      </div>
    </Layout>
  );
};

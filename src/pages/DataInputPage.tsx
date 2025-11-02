/**
 * Data Input Page
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/App.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ src/components/common/Layout/Layout.tsx
 *   └─ src/components/common/Button/Button.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./DataInputPage.spec.md
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import type React from 'react';
import { Button } from '../components/common/Button/Button';
import { Layout } from '../components/common/Layout/Layout';

export const DataInputPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">データ入力</h2>
          <p className="text-gray-600">記入済みアンケートを撮影してOCR処理を行います。</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ステップ1: テンプレート選択
            </h3>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-labelledby="select-template-icon"
              >
                <title id="select-template-icon">テンプレート選択</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm text-gray-600 mb-4">テンプレートが選択されていません</p>
              <Button variant="secondary" size="small">
                テンプレートを選択
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ステップ2: アンケート撮影</h3>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-labelledby="camera-icon"
              >
                <title id="camera-icon">カメラアイコン</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm text-gray-600 mb-4">カメラで撮影してください</p>
              <Button variant="primary" size="small" disabled>
                📷 カメラを起動
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 使い方</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>まずテンプレートを選択してください</li>
            <li>カメラで記入済みアンケートを撮影します</li>
            <li>OCR処理が自動的に実行されます</li>
            <li>抽出結果を確認・編集します</li>
            <li>データをクリップボードにコピーして完了です</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
};

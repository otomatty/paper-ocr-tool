/**
 * Home Page - Mode Selection
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/App.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ src/components/common/Layout/Layout.tsx
 *   ├─ src/components/common/Button/Button.tsx
 *   └─ react-router-dom
 *
 * Related Documentation:
 *   ├─ Spec: ./HomePage.spec.md
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button/Button';
import { Layout } from '../components/common/Layout/Layout';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">モード選択</h2>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl">
          紙媒体のアンケートをカメラで撮影し、OCR処理でデータ入力を効率化します。
          <br />
          まずはモードを選択してください。
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">テンプレート管理</h3>
            <p className="text-gray-600 mb-6 min-h-[4rem]">
              空のアンケート用紙を撮影し、
              <br />
              OCR対象領域を登録します。
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/template')}
              className="w-full"
            >
              テンプレート管理
            </Button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">データ入力</h3>
            <p className="text-gray-600 mb-6 min-h-[4rem]">
              記入済みアンケートを撮影し、
              <br />
              OCR処理でデータを抽出します。
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/data-input')}
              className="w-full"
            >
              データ入力
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

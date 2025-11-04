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

import { ArrowRight, FileText, ScanText } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button/Button";
import { Card } from "../components/common/Card/Card";
import { Layout } from "../components/common/Layout/Layout";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
            モード選択
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            紙媒体のアンケートをカメラで撮影し、OCR処理でデータ入力を効率化します。
            <br className="hidden sm:block" />
            まずはモードを選択してください。
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Template Management Card */}
          <Card hoverable className="group">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-900 transition-colors duration-200">
                  <FileText className="w-6 h-6 text-neutral-700 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  テンプレート管理
                </h3>
              </div>
              <p className="text-neutral-600 mb-8 flex-1 leading-relaxed">
                空のアンケート用紙を撮影し、OCR対象領域を登録します。
                テンプレートは保存して繰り返し使用できます。
              </p>
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate("/template")}
                className="w-full"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                テンプレート管理を開始
              </Button>
            </div>
          </Card>

          {/* Data Input Card */}
          <Card hoverable className="group">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-900 transition-colors duration-200">
                  <ScanText className="w-6 h-6 text-neutral-700 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  データ入力
                </h3>
              </div>
              <p className="text-neutral-600 mb-8 flex-1 leading-relaxed">
                記入済みアンケートを撮影し、OCR処理でデータを抽出します。
                結果は編集してクリップボードにコピーできます。
              </p>
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate("/data-input")}
                className="w-full"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                データ入力を開始
              </Button>
            </div>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="text-center">
            <div className="inline-flex p-3 bg-neutral-100 rounded-full mb-3">
              <FileText className="w-6 h-6 text-neutral-700" />
            </div>
            <h4 className="font-semibold text-neutral-900 mb-2">簡単設定</h4>
            <p className="text-sm text-neutral-600">
              直感的な操作でテンプレートを作成
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 bg-neutral-100 rounded-full mb-3">
              <ScanText className="w-6 h-6 text-neutral-700" />
            </div>
            <h4 className="font-semibold text-neutral-900 mb-2">高精度OCR</h4>
            <p className="text-sm text-neutral-600">
              テキストを正確に認識・抽出
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 bg-neutral-100 rounded-full mb-3">
              <ArrowRight className="w-6 h-6 text-neutral-700" />
            </div>
            <h4 className="font-semibold text-neutral-900 mb-2">
              効率的な作業
            </h4>
            <p className="text-sm text-neutral-600">手入力作業を大幅に削減</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

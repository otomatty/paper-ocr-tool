/\*\*

- Phase 4-2 実装ガイド
-
- Tailwind CSS を使用した OCRProcessor コンポーネントの実装手順
- テスト駆動開発 (TDD) ベースのアプローチ
  \*/

# Phase 4-2 実装ガイド (Tailwind CSS ベース)

## 概要

このガイドは、OCRProcessor コンポーネントを **段階的に** 完成させるための具体的な手順を提供します。

### 実装の 3 段階

```
1️⃣ テスト駆動開発 (TDD)
   テスト → 実装 → リファクタリング

2️⃣ Tailwind CSS スタイリング
   セマンティック HTML に Tailwind クラス追加

3️⃣ 統合・最適化
   他コンポーネントとの連携、パフォーマンス調整
```

---

## 段階 1: テスト実装 (2-3h)

### 準備作業 (15 分)

#### 1-1. テストファイル作成

```bash
touch src/components/DataInput/OCRProcessor.test.tsx
```

#### 1-2. 基本的なテスト構造

```typescript
// src/components/DataInput/OCRProcessor.test.tsx

import { describe, it, expect } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OCRProcessor } from "./OCRProcessor";
import { useOCR } from "../../hooks/useOCR";

// Mock useOCR hook
jest.mock("../../hooks/useOCR");

describe("OCRProcessor Component", () => {
  // テストケースをここに追加
});
```

### テストケース 1-1: TC-001 初期化テスト (15 分)

**テスト対象**: コンポーネントが正しく初期化される

```typescript
describe("TC-001: Component Initialization", () => {
  it("should render without errors", () => {
    render(<OCRProcessor />);

    // コンポーネントがレンダリングされることを確認
    expect(screen.getByText(/クリックして画像を選択/i)).toBeInTheDocument();
  });

  it("should have upload button enabled initially", () => {
    render(<OCRProcessor />);

    const selectButton = screen.getByRole("button", { name: /撮影\/選択/i });
    expect(selectButton).not.toBeDisabled();
  });

  it("should have process button disabled when no image", () => {
    render(<OCRProcessor />);

    const processButton = screen.getByRole("button", { name: /OCR 実行/i });
    expect(processButton).toBeDisabled();
  });
});
```

### テストケース 1-2 ～ 1-4: ファイル選択・バリデーション (45 分)

**テスト対象**: ファイル選択処理とバリデーション

```typescript
describe("TC-002~004: File Selection & Validation", () => {
  const mockImageFile = new File(["content"], "image.png", {
    type: "image/png",
  });
  const mockNonImageFile = new File(["content"], "document.pdf", {
    type: "application/pdf",
  });
  const mockLargeFile = new File(["x".repeat(6 * 1024 * 1024)], "large.jpg", {
    type: "image/jpeg",
  });

  it("TC-002: should handle image file selection", async () => {
    render(<OCRProcessor />);

    const fileInput = screen.getByLabelText(/Select image file/i);
    await userEvent.upload(fileInput, mockImageFile);

    // プレビューが表示されることを確認
    await waitFor(() => {
      expect(screen.getByAltText(/Selected for OCR/i)).toBeInTheDocument();
    });
  });

  it("TC-003: should reject non-image files", async () => {
    const onError = jest.fn();
    render(<OCRProcessor onError={onError} />);

    const fileInput = screen.getByLabelText(/Select image file/i);
    await userEvent.upload(fileInput, mockNonImageFile);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Invalid file type/i),
      })
    );
  });

  it("TC-004: should reject files larger than 5MB", async () => {
    const onError = jest.fn();
    render(<OCRProcessor onError={onError} />);

    const fileInput = screen.getByLabelText(/Select image file/i);
    await userEvent.upload(fileInput, mockLargeFile);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Image size too large/i),
      })
    );
  });
});
```

### テストケース 1-5 ～ 1-7: OCR 処理・進捗・結果 (60 分)

**テスト対象**: 処理フロー、進捗表示、結果表示

```typescript
describe("TC-005~007: OCR Processing", () => {
  const mockResults = [
    {
      regionId: "r1",
      regionName: "Name",
      text: "John Doe",
      confidence: 95,
      processingTime: 1200,
    },
  ];

  beforeEach(() => {
    (useOCR as jest.Mock).mockReturnValue({
      isProcessing: false,
      progress: 0,
      status: "Ready",
      results: [],
      error: null,
      processImage: jest.fn().mockResolvedValue(mockResults),
      cancel: jest.fn(),
      reset: jest.fn(),
    });
  });

  it("TC-005: should start OCR processing", async () => {
    const mockProcessImage = jest.fn().mockResolvedValue(mockResults);
    (useOCR as jest.Mock).mockReturnValue({
      isProcessing: false,
      progress: 0,
      status: "Ready",
      results: [],
      error: null,
      processImage: mockProcessImage,
      cancel: jest.fn(),
      reset: jest.fn(),
    });

    render(<OCRProcessor />);

    // ファイルをアップロード
    const fileInput = screen.getByLabelText(/Select image file/i);
    await userEvent.upload(
      fileInput,
      new File(["content"], "image.png", { type: "image/png" })
    );

    // OCR 実行ボタンをクリック
    const processButton = screen.getByRole("button", { name: /OCR 実行/i });
    await userEvent.click(processButton);

    expect(mockProcessImage).toHaveBeenCalled();
  });

  it("TC-006: should display progress bar during processing", () => {
    (useOCR as jest.Mock).mockReturnValue({
      isProcessing: true,
      progress: 0.5,
      status: "Processing regions...",
      results: [],
      error: null,
      processImage: jest.fn(),
      cancel: jest.fn(),
      reset: jest.fn(),
    });

    render(<OCRProcessor />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it("TC-007: should display results after processing", () => {
    (useOCR as jest.Mock).mockReturnValue({
      isProcessing: false,
      progress: 1,
      status: "Ready",
      results: mockResults,
      error: null,
      processImage: jest.fn(),
      cancel: jest.fn(),
      reset: jest.fn(),
    });

    render(<OCRProcessor />);

    expect(screen.getByText(/認識結果/)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/信頼度: 95%/)).toBeInTheDocument();
  });
});
```

### テストケース 1-8 ～ 1-10: エラー・キャンセル・編集 (30 分)

**テスト対象**: エラーハンドリング、キャンセル、編集機能

```typescript
describe("TC-008~010: Error, Cancel & Edit", () => {
  it("TC-008: should display error message", () => {
    (useOCR as jest.Mock).mockReturnValue({
      isProcessing: false,
      progress: 0,
      status: "Ready",
      results: [],
      error: "Failed to load language data",
      processImage: jest.fn(),
      cancel: jest.fn(),
      reset: jest.fn(),
    });

    render(<OCRProcessor />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Failed to load language data/
    );
  });

  it("TC-009: should cancel processing", async () => {
    const mockCancel = jest.fn();
    (useOCR as jest.Mock).mockReturnValue({
      isProcessing: true,
      progress: 0.5,
      status: "Processing...",
      results: [],
      error: null,
      processImage: jest.fn(),
      cancel: mockCancel,
      reset: jest.fn(),
    });

    render(<OCRProcessor />);

    const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
    await userEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalled();
  });

  it("TC-010: should allow editing results", async () => {
    const mockResults = [
      {
        regionId: "r1",
        regionName: "Name",
        text: "John Doe",
        confidence: 95,
        processingTime: 1200,
      },
    ];

    (useOCR as jest.Mock).mockReturnValue({
      isProcessing: false,
      progress: 1,
      status: "Ready",
      results: mockResults,
      error: null,
      processImage: jest.fn(),
      cancel: jest.fn(),
      reset: jest.fn(),
    });

    render(<OCRProcessor />);

    // 結果編集ボタンをクリック
    const editButton = screen.getByRole("button", { name: /結果を編集/i });
    await userEvent.click(editButton);

    // エディタが表示されることを確認
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // テキストを編集
    const textarea = screen.getByDisplayValue(/John Doe/);
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Jane Doe");

    // 保存ボタンをクリック
    const saveButton = screen.getByRole("button", { name: /保存/i });
    await userEvent.click(saveButton);
  });
});
```

### テスト実装チェックリスト

```
テスト構造:
  ✅ インポート + モック設定
  ✅ describe ブロック構成

TC-001 (初期化):
  ✅ コンポーネント レンダリング
  ✅ ボタン状態 確認

TC-002-004 (ファイル選択):
  ✅ 画像ファイル アップロード
  ✅ 無効なファイル型 拒否
  ✅ ファイルサイズ 制限

TC-005-007 (処理):
  ✅ 処理開始 呼び出し
  ✅ 進捗表示 (プログレスバー)
  ✅ 結果表示 レンダリング

TC-008-010 (エラー・操作):
  ✅ エラーメッセージ 表示
  ✅ キャンセル 機能
  ✅ 結果編集 (モーダル)

全般:
  ✅ 10/10 テスト実装完了
  ✅ すべてのテスト 合格
  ✅ 0 Lint エラー
```

---

## 段階 2: Tailwind CSS スタイリング (3-4h)

### 準備作業 (20 分)

#### 2-1. スタイルファイル作成

```bash
touch src/components/DataInput/OCRProcessor.styles.ts
```

#### 2-2. スタイルモジュール実装

```typescript
// src/components/DataInput/OCRProcessor.styles.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * OCRProcessor component styles
 * Uses Tailwind CSS utility classes with responsive design support
 */
export const ocrStyles = {
  // ===== Container =====
  container: cn("space-y-6 w-full max-w-4xl mx-auto"),

  // ===== Upload Area =====
  uploadButton: cn(
    "w-full",
    "bg-slate-50 hover:bg-slate-100",
    "border-2 border-dashed border-slate-300",
    "rounded-lg p-8",
    "cursor-pointer",
    "transition-colors duration-200",
    "flex flex-col items-center justify-center",
    "min-h-64",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  ),

  previewContainer: cn("w-full space-y-3"),
  previewImage: cn(
    "w-full max-h-64",
    "object-cover rounded-lg",
    "border border-slate-200"
  ),
  filename: cn("text-sm text-slate-600", "font-medium truncate"),

  placeholderText: cn("text-slate-900 font-medium text-lg"),
  placeholderHint: cn("text-sm text-slate-500"),

  // ===== Error Alert =====
  errorAlert: cn(
    "bg-red-50 border border-red-200 rounded-lg p-4",
    "flex items-start justify-between gap-4"
  ),
  errorMessage: cn("text-red-700 text-sm font-medium"),

  // ===== Progress Section =====
  progressSection: cn(
    "space-y-3",
    "p-4 bg-slate-50 rounded-lg",
    "border border-slate-200"
  ),
  progressBar: cn("w-full h-2 bg-slate-200 rounded-full overflow-hidden"),
  progressFill: cn(
    "h-full bg-gradient-to-r from-blue-600 to-cyan-600",
    "transition-all duration-300"
  ),
  progressText: cn("flex justify-between items-center text-sm text-slate-600"),
  progressPercent: cn("font-semibold text-slate-900"),

  // ===== Buttons =====
  buttonGroup: cn("flex flex-col sm:flex-row gap-3 justify-end mt-6"),

  buttonBase: cn(
    "px-6 py-2 rounded-lg font-medium",
    "transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  ),

  buttonPrimary: cn(
    "bg-blue-600 text-white",
    "hover:bg-blue-700 active:bg-blue-800",
    "focus:ring-blue-500"
  ),

  buttonSecondary: cn(
    "bg-slate-200 text-slate-900",
    "hover:bg-slate-300 active:bg-slate-400",
    "focus:ring-slate-500"
  ),

  // ===== Results Section =====
  resultsSection: cn(
    "space-y-4",
    "p-4 bg-white border border-slate-200 rounded-lg"
  ),
  resultsTitle: cn("text-xl font-bold text-slate-900 mb-4"),

  resultsList: cn("space-y-3"),

  resultItem: cn(
    "bg-white border border-slate-200 rounded-lg p-4",
    "hover:shadow-md hover:border-slate-300",
    "transition-all duration-200"
  ),

  resultHeader: cn(
    "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3"
  ),

  resultName: cn("font-semibold text-slate-900 text-lg"),

  confidence: cn(
    "inline-flex items-center px-3 py-1",
    "bg-slate-100 text-slate-700 text-sm rounded-full",
    "font-medium"
  ),

  resultText: cn(
    "text-slate-700 font-mono text-sm leading-relaxed",
    "break-words bg-slate-50 p-3 rounded",
    "border border-slate-200"
  ),

  resultMeta: cn("text-xs text-slate-500 mt-2"),

  // ===== Modal =====
  modal: cn(
    "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
    "p-4"
  ),

  modalContent: cn(
    "bg-white rounded-lg shadow-xl",
    "max-w-2xl w-full max-h-[90vh] overflow-y-auto"
  ),

  modalHeader: cn("text-2xl font-bold text-slate-900 mb-6"),

  editorField: cn("space-y-2 mb-6"),

  editorLabel: cn("block text-sm font-medium text-slate-900"),

  editorTextarea: cn(
    "w-full px-4 py-2 border border-slate-300 rounded-lg",
    "font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
    "focus:border-transparent min-h-24 resize-vertical"
  ),

  modalButtons: cn(
    "flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-slate-200"
  ),

  // ===== Retry Section =====
  retrySection: cn("mt-4 flex justify-center"),
};

// ===== Responsive Utilities =====
export const responsiveClasses = {
  container: "max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl",
  grid: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  text: "text-base sm:text-lg md:text-xl lg:text-2xl",
  padding: "p-4 sm:p-6 md:p-8 lg:p-12",
};
```

### スタイリング手順

#### 2-3. OCRProcessor.tsx にスタイルを適用

**更新内容**:

```typescript
import { ocrStyles as styles } from './OCRProcessor.styles';

// OCRProcessor コンポーネント内
export const OCRProcessor: FC<OCRProcessorProps> = ({ ... }) => {
  return (
    <Layout title="OCR データ入力">
      <div className={styles.container}>
        {/* Upload Section */}
        <section className="space-y-4">
          <button
            className={styles.uploadButton}
            onClick={handleSelectImage}
            disabled={isProcessing || disabled}
          >
            {/* upload content */}
          </button>
        </section>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorAlert} role="alert">
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}

        {/* Progress Section */}
        {isProcessing && (
          <section className={styles.progressSection} aria-live="polite">
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className={styles.progressText}>
              <span>{status}</span>
              <span className={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </span>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className={styles.buttonGroup}>
          {/* buttons */}
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <section className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>認識結果</h2>
            <div className={styles.resultsList}>
              {results.map((result) => (
                <div key={result.regionId} className={styles.resultItem}>
                  <div className={styles.resultHeader}>
                    <h3 className={styles.resultName}>
                      {result.regionName}
                    </h3>
                    <span className={styles.confidence}>
                      信頼度: {Math.round(result.confidence)}%
                    </span>
                  </div>
                  <p className={styles.resultText}>{result.text}</p>
                  <div className={styles.resultMeta}>
                    処理時間: {result.processingTime}ms
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Modal */}
        {showResultEditor && (
          <div className={styles.modal} role="dialog">
            <div className={styles.modalContent}>
              <h2 className={styles.modalHeader}>結果を編集</h2>
              {editResults.map((result) => (
                <div key={result.regionId} className={styles.editorField}>
                  <label
                    htmlFor={`edit-${result.regionId}`}
                    className={styles.editorLabel}
                  >
                    {result.regionName}
                  </label>
                  <textarea
                    id={`edit-${result.regionId}`}
                    className={styles.editorTextarea}
                    value={result.text}
                    onChange={(e) =>
                      handleEditResult(result.regionId, e.target.value)
                    }
                  />
                </div>
              ))}
              <div className={styles.modalButtons}>
                <button className={`${styles.buttonBase} ${styles.buttonSecondary}`}>
                  キャンセル
                </button>
                <button className={`${styles.buttonBase} ${styles.buttonPrimary}`}>
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
```

### スタイリングチェックリスト

```
レイアウト:
  ✅ コンテナ幅・中央寄せ
  ✅ セクション間隔 (space-y-6)

アップロード領域:
  ✅ ボーダー (dashed)
  ✅ ホバー効果
  ✅ プレビュー画像表示

エラー表示:
  ✅ 背景色 (red-50)
  ✅ ボーダー色 (red-200)
  ✅ テキスト色 (red-700)

進捗表示:
  ✅ プログレスバー (グラデーション)
  ✅ パーセンテージ表示
  ✅ ステータステキスト

結果表示:
  ✅ 結果カード
  ✅ 信頼度バッジ
  ✅ テキスト (モノスペース)
  ✅ ホバー効果

ボタン:
  ✅ Primary (blue)
  ✅ Secondary (slate)
  ✅ Disabled 状態
  ✅ Focus 状態

モーダル:
  ✅ 背景オーバーレイ
  ✅ テキストエリア
  ✅ ボタングループ

レスポンシブ:
  ✅ Mobile (sm)
  ✅ Tablet (md)
  ✅ Desktop (lg)
```

---

## 段階 3: 統合・最適化 (1-2h)

### 3-1. DataInputPage への統合 (30 分)

```typescript
// src/pages/DataInputPage.tsx

import { OCRProcessor } from "../components/DataInput/OCRProcessor";
import { useTemplate } from "../hooks/useTemplate";
import { type OCRRegionResult } from "../hooks/useOCR";

export const DataInputPage: FC = () => {
  const { currentTemplate } = useTemplate();

  const handleOCRComplete = (results: OCRRegionResult[]) => {
    console.log("OCR completed:", results);
    // 結果を保存または次のステップへ
  };

  const handleOCRError = (error: Error) => {
    console.error("OCR error:", error);
    // エラーをユーザーに通知
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">データ入力</h1>

      <OCRProcessor
        template={currentTemplate}
        onComplete={handleOCRComplete}
        onError={handleOCRError}
      />
    </div>
  );
};
```

### 3-2. E2E テスト・ブラウザ検証 (30-60 分)

```bash
# 開発サーバー起動
bun dev

# http://localhost:3000 で確認
# 1. ファイルアップロード
# 2. OCR 処理
# 3. 結果表示
# 4. 結果編集
# 5. レスポンシブ表示 (モバイル・タブレット・デスクトップ)
```

---

## ✅ 完成チェックリスト

### テスト完成

- [ ] TC-001 ～ TC-010 すべて実装
- [ ] 10/10 テスト合格
- [ ] 総テスト数: 155+ pass
- [ ] Lint: 0 エラー

### Tailwind CSS スタイリング完成

- [ ] styles.ts ファイル作成完了
- [ ] すべての UI 要素にクラス適用
- [ ] レスポンシブデザイン確認
  - [ ] Mobile (sm: 640px)
  - [ ] Tablet (md: 768px)
  - [ ] Desktop (lg: 1024px)

### 統合完成

- [ ] DataInputPage で OCRProcessor 動作確認
- [ ] テンプレート連携確認
- [ ] E2E テスト完了

### 品質確保

- [ ] TypeScript: 0 エラー
- [ ] Lint: 0 エラー
- [ ] アクセシビリティ: ARIA ラベル確認
- [ ] パフォーマンス: 画像処理速度 OK

---

## 参考リンク

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/)
- [ARIA Authoring](https://www.w3.org/WAI/ARIA/apg/)

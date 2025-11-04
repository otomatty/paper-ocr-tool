# Phase 4-4: E2E テスト集中実装計画

## 概要

**目標**: 紙 OCR Web アプリケーションの完全なエンドツーエンド (E2E) テスト実装

**期間**: 2024-11-08 ～ 2024-11-15（約 1 週間）

**重点**: ユーザーシナリオに基づいた統合テスト

**現在の状態**:

- ユニットテスト: 225 pass / 3 skip / 0 fail (98.7% 合格)
- コンポーネント テスト: 全主要コンポーネント対応
- 統合テスト: 基本的なフロー確認のみ
- **E2E テスト: 未実装** ← 本フェーズで集中実装

---

## E2E テスト戦略

### 1. テストレイヤー構成

```
User Interaction
     ↓
UI Components (Button, Input, Select)
     ↓
Pages (HomePage, TemplateManagementPage, DataInputPage)
     ↓
Custom Hooks (useTemplate, useOCR, useCamera)
     ↓
Utils & Services (localStorage, ocrEngine, imageProcessor)
     ↓
External APIs (Tesseract.js, MediaDevices API)
```

### 2. E2E テストの範囲

#### ✅ E2E テスト対象機能

1. **テンプレート管理フロー** (TemplateManagementPage)

   - テンプレート作成 → 領域定義 → 保存 → 読み込み
   - 複数テンプレートの管理
   - テンプレート編集・削除

2. **データ入力フロー** (DataInputPage)

   - テンプレート選択 → 画像撮影 → OCR 実行 → 結果編集 → 保存
   - OCR エラーハンドリング
   - 連続入力（複数アンケート処理）

3. **ホームページ** (HomePage)

   - 機能紹介表示
   - ナビゲーション
   - ページ遷移フロー

4. **全体フロー**
   - アプリ初期化 → テンプレート作成 → データ入力 → 結果出力
   - ローカルストレージの永続性
   - リロード後のデータ保持

#### ⚠️ E2E テスト対象外 (ユニットテストで十分)

- 個別ユーティリティ関数
- 単一フック の詳細ロジック
- UI コンポーネントの内部動作

---

## E2E テスト実装フェーズ

### Phase 4-4-1: テスト基盤構築 (1-2 日)

#### タスク 1-1: Playwright インストール & 設定

```bash
# Playwright インストール
npm install -D @playwright/test

# 設定ファイル作成 (playwright.config.ts)
# - baseURL 設定
# - browser 設定 (chromium, firefox, webkit)
# - screenshot/video 設定
# - timeout 設定
```

**成果物**:

- `playwright.config.ts`
- E2E テスト実行スクリプト (`package.json` の scripts)

#### タスク 1-2: テスト ディレクトリ構造作成

```
e2e/
├── fixtures/
│   ├── test-data.ts          # テストデータ (テンプレート、画像)
│   └── page-helpers.ts       # ページアクション関数
├── specs/
│   ├── 01-template-management.spec.ts
│   ├── 02-data-input.spec.ts
│   ├── 03-home-navigation.spec.ts
│   └── 04-full-workflow.spec.ts
├── utils/
│   ├── assertions.ts         # カスタムアサーション
│   ├── test-helpers.ts       # ヘルパー関数
│   └── mock-data.ts          # モックデータ
└── README.md
```

**成果物**:

- ディレクトリ構造確立
- README (E2E テスト実行方法)

#### タスク 1-3: テスト ヘルパー実装

```typescript
// fixtures/page-helpers.ts
export class AppFixture {
  async navigateToHome() {}
  async navigateToTemplateManagement() {}
  async navigateToDataInput() {}
  async createTemplate(templateData) {}
  async captureScreenshot(name) {}
}

// utils/assertions.ts
export async function assertTemplateExists(page, templateName) {}
export async function assertOCRResultsDisplayed(page, expectedFields) {}
```

**成果物**:

- ページヘルパー クラス
- カスタムアサーション関数群
- 50-100 行のユーティリティコード

---

### Phase 4-4-2: 基本 E2E テスト実装 (2-3 日)

#### タスク 2-1: テンプレート管理 E2E テスト

**ファイル**: `e2e/specs/01-template-management.spec.ts`

**テストシナリオ**:

```typescript
describe("Template Management E2E", () => {
  // TE-01-001: 新規テンプレート作成フロー
  test("should create new template with regions", async () => {
    // 1. ホームページ表示
    // 2. テンプレート管理へ遷移
    // 3. 新規作成ボタン クリック
    // 4. テンプレート名入力 ("アンケート_201805")
    // 5. 空フォーム画像をアップロード
    // 6. 領域定義 (3 領域)
    // 7. 保存ボタン クリック
    // 8. テンプレート一覧に表示されることを確認
    // 9. テンプレートに保存されていることを確認
  });

  // TE-01-002: テンプレート一覧表示
  test("should display all templates in list", async () => {
    // テンプレート一覧ページでテンプレートが表示されることを確認
  });

  // TE-01-003: テンプレート編集
  test("should edit existing template", async () => {
    // テンプレート編集画面で領域を追加・削除
  });

  // TE-01-004: テンプレート削除
  test("should delete template", async () => {
    // テンプレート削除後、一覧から消えることを確認
  });

  // TE-01-005: テンプレート永続性
  test("should persist templates across page reloads", async () => {
    // テンプレート作成 → ページ リロード → 同じテンプレートが存在
  });
});
```

**成果物**:

- `01-template-management.spec.ts` (150-200 行)
- 5 個のテストケース

#### タスク 2-2: データ入力 E2E テスト

**ファイル**: `e2e/specs/02-data-input.spec.ts`

**テストシナリオ**:

```typescript
describe("Data Input E2E", () => {
  // TE-02-001: 完全なデータ入力フロー
  test("should complete full data input workflow", async () => {
    // 1. データ入力ページに移動
    // 2. テンプレート選択
    // 3. 画像ファイルアップロード (またはカメラ撮影代替)
    // 4. OCR 実行
    // 5. 結果を確認
    // 6. テキスト編集
    // 7. 保存 (クリップボードコピー)
    // 8. 成功メッセージ表示確認
  });

  // TE-02-002: テンプレート切り替え
  test("should switch templates and re-process", async () => {
    // 複数テンプレートでの処理フロー
  });

  // TE-02-003: エラーハンドリング
  test("should handle OCR errors gracefully", async () => {
    // 不正な画像アップロード時のエラーメッセージ確認
  });

  // TE-02-004: 連続入力
  test("should handle multiple sequential inputs", async () => {
    // 複数アンケート連続処理
  });
});
```

**成果物**:

- `02-data-input.spec.ts` (150-200 行)
- 4 個のテストケース

#### タスク 2-3: ナビゲーション E2E テスト

**ファイル**: `e2e/specs/03-home-navigation.spec.ts`

**テストシナリオ**:

```typescript
describe("Navigation E2E", () => {
  // TE-03-001: ホームページ表示
  test("should display home page correctly", async () => {
    // 機能紹介、ナビゲーションリンク確認
  });

  // TE-03-002: ページ遷移
  test("should navigate between pages", async () => {
    // ホーム → テンプレート管理 → データ入力 → ホーム
    // 各ページが正しく表示されることを確認
  });

  // TE-03-003: ブラウザバック機能
  test("should handle browser back button", async () => {
    // ページ遷移後、戻るボタンで前のページに戻ること
  });
});
```

**成果物**:

- `03-home-navigation.spec.ts` (100-150 行)
- 3 個のテストケース

---

### Phase 4-4-3: 統合 E2E テスト (2-3 日)

#### タスク 3-1: 完全なアプリケーション フロー E2E テスト

**ファイル**: `e2e/specs/04-full-workflow.spec.ts`

**テストシナリオ**:

```typescript
describe("Full Application Workflow E2E", () => {
  // TE-04-001: 初回利用フロー (新規ユーザー)
  test("should complete full workflow from scratch", async () => {
    // 1. ホームページで機能紹介を表示
    // 2. テンプレート管理に移動
    // 3. テンプレートを作成
    // 4. データ入力ページに移動
    // 5. テンプレートを選択
    // 6. 画像をアップロード
    // 7. OCR 実行
    // 8. 結果を編集
    // 9. クリップボードにコピー
    // 10. 成功メッセージ確認
  });

  // TE-04-002: 複数テンプレート管理フロー
  test("should manage multiple templates", async () => {
    // テンプレート 1 でデータ入力 → テンプレート 2 でデータ入力
    // 各々が独立して動作することを確認
  });

  // TE-04-003: ローカルストレージ永続性
  test("should persist all data across sessions", async () => {
    // テンプレート作成 → ブラウザ リロード → データ確認
  });

  // TE-04-004: エッジケース
  test("should handle edge cases gracefully", async () => {
    // 大量テンプレート、大きな画像ファイル等のテスト
  });
});
```

**成果物**:

- `04-full-workflow.spec.ts` (200-300 行)
- 4 個のテストケース

#### タスク 3-2: クロスブラウザ テスト設定

```typescript
// playwright.config.ts
use: [
  {
    name: "chromium",
    ...devices["Desktop Chrome"],
  },
  {
    name: "firefox",
    ...devices["Desktop Firefox"],
  },
  {
    name: "webkit",
    ...devices["Desktop Safari"],
  },
];
```

**成果物**:

- 複数ブラウザでの自動テスト実行設定

---

### Phase 4-4-4: テスト最適化と CI/CD 統合 (1-2 日)

#### タスク 4-1: パラレル実行設定

```typescript
// playwright.config.ts
fullyParallel: true,
workers: process.env.CI ? 1 : undefined,
```

**成果物**:

- 高速化設定

#### タスク 4-2: CI/CD パイプライン統合

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run build
      - run: npx playwright install
      - run: npm run e2e
```

**成果物**:

- GitHub Actions ワークフロー

#### タスク 4-3: テスト レポート生成

```typescript
// playwright.config.ts
reporter: [
  ["html"],
  ["json", { outputFile: "test-results/results.json" }],
  ["junit", { outputFile: "test-results/junit.xml" }],
];
```

**成果物**:

- HTML レポート自動生成

---

## テストケース マトリックス

| テストシナリオ       | ユニット | コンポーネント | 統合 | E2E |
| -------------------- | -------- | -------------- | ---- | --- |
| テンプレート作成     | ✅       | ✅             | ⏳   | ✅  |
| 領域定義             | ✅       | ✅             | ⏳   | ✅  |
| 画像アップロード     | ✅       | ⏳             | ⏳   | ✅  |
| OCR 実行             | ✅       | ✅             | ⏳   | ✅  |
| 結果編集             | ✅       | ✅             | ✅   | ✅  |
| クリップボードコピー | ✅       | ✅             | ✅   | ✅  |
| エラーハンドリング   | ✅       | ✅             | ⏳   | ✅  |
| ページ遷移           | ❌       | ⏳             | ⏳   | ✅  |
| データ永続性         | ✅       | ❌             | ⏳   | ✅  |

※ ⏳ = Phase 4-4 で追加予定

---

## E2E テスト実行方法

### ローカル実行

```bash
# すべての E2E テスト実行
npm run e2e

# 特定のテストファイルのみ実行
npm run e2e 01-template-management.spec.ts

# UI モードで実行 (デバッグ用)
npx playwright test --ui

# ヘッドレスモード (CI 用)
npm run e2e -- --headed=false
```

### CI/CD パイプライン

```bash
# GitHub Actions で自動実行
# main ブランチへのプッシュ時に自動的に E2E テスト実行
# テスト結果レポート自動生成
```

---

## 成果物チェックリスト

### ✅ Phase 4-4-1: テスト基盤

- [ ] `playwright.config.ts` 作成
- [ ] E2E テストディレクトリ構造作成
- [ ] ページヘルパー実装
- [ ] カスタムアサーション実装
- [ ] E2E テスト README 作成

### ✅ Phase 4-4-2: 基本テスト

- [ ] テンプレート管理 E2E テスト (5 TC)
- [ ] データ入力 E2E テスト (4 TC)
- [ ] ナビゲーション E2E テスト (3 TC)
- [ ] 全テスト実行確認 (12 TC 合格)

### ✅ Phase 4-4-3: 統合テスト

- [ ] 完全フロー E2E テスト (4 TC)
- [ ] クロスブラウザ テスト実行
- [ ] すべての E2E テスト合格 (16 TC)

### ✅ Phase 4-4-4: CI/CD 統合

- [ ] CI/CD パイプライン設定
- [ ] レポート生成設定
- [ ] ドキュメント作成

---

## スケジュール概要

| フェーズ | 期間        | タスク数 | 予定                  |
| -------- | ----------- | -------- | --------------------- |
| 4-4-1    | 1-2 日      | 3        | ✅ テスト基盤         |
| 4-4-2    | 2-3 日      | 3        | ✅ 基本テスト (12 TC) |
| 4-4-3    | 2-3 日      | 2        | ✅ 統合テスト (4 TC)  |
| 4-4-4    | 1-2 日      | 3        | ✅ CI/CD 統合         |
| **合計** | **6-10 日** | **11**   | **✅ 完全実装**       |

---

## 期待される成果

### テストカバレッジ

- **E2E テスト**: 16+ テストケース
- **全テスト**: 225 (ユニット) + 16+ (E2E) = 240+ テストケース
- **合格率**: 99%+

### ドキュメント

- `e2e/README.md`: E2E テスト実行ガイド
- `.github/workflows/e2e-tests.yml`: CI/CD 設定
- テスト結果レポート (HTML)

### 品質指標

| 指標               | 現在  | 目標 |
| ------------------ | ----- | ---- |
| ユニットテスト合格 | 98.7% | 99%+ |
| E2E テストケース   | 0     | 16+  |
| ブラウザ対応       | 1     | 3+   |
| CI/CD 自動化       | ❌    | ✅   |

---

## リスクと対策

### リスク 1: テスト実行時間が長い

**対策**:

- テストをグループ化し、パラレル実行
- CI/CD では本質的なテストのみ実行
- ローカルでは高速テストのみ実行

### リスク 2: ブラウザ互換性問題

**対策**:

- Playwright の公式ブラウザを使用
- 各ブラウザで定期的にテスト実行
- 問題発見時は即座に修正

### リスク 3: テストデータの管理

**対策**:

- テストデータを `fixtures/` に集中管理
- 各テストは独立してデータ生成
- リロード後のクリーンアップ実装

---

## 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev)
- [E2E テストのベストプラクティス](https://playwright.dev/docs/best-practices)
- [テスト戦略設計ガイド](https://www.agilealliance.org/glossary/e2etesting/)

---

## 承認・署名

| 役職               | 名前      | 承認日     |
| ------------------ | --------- | ---------- |
| プロジェクトリード | AI 開発者 | 2024-11-07 |
| テストリード       | AI 開発者 | 2024-11-07 |

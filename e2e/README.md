# E2E テスト ガイド

このディレクトリには、紙 OCR Web アプリケーションのエンドツーエンド (E2E) テストが含まれています。

## 概要

E2E テストは、ユーザーシナリオに基づいた統合テストです。以下のページ・機能をテストします：

- **テンプレート管理**: テンプレート作成、編集、削除、保存・読み込み
- **データ入力**: 画像アップロード、OCR 実行、結果編集、出力
- **ホームページナビゲーション**: ページ遷移、ブラウザ操作
- **全体フロー**: アプリ初期化から結果出力までの完全フロー

## ディレクトリ構造

```
e2e/
├── fixtures/                  # テストデータと ページヘルパー
│   ├── page-helpers.ts       # ページアクション関数群 (AppPage クラス)
│   └── test-data.ts          # テストデータ (テンプレート、フォームデータ)
├── specs/                     # テストケース定義
│   ├── 01-template-management.spec.ts  # テンプレート管理テスト
│   ├── 02-data-input.spec.ts          # データ入力テスト
│   ├── 03-home-navigation.spec.ts     # ナビゲーションテスト
│   └── 04-full-workflow.spec.ts       # 完全フロー統合テスト
├── utils/                     # テスト ユーティリティ
│   ├── assertions.ts         # カスタムアサーション関数
│   ├── test-data.ts          # テストデータ定義
│   └── test-helpers.ts       # テスト ヘルパー関数
└── README.md                 # このファイル
```

## インストール

Playwright は既にインストール済みです。ブラウザをインストールする場合：

```bash
npx playwright install
```

## テスト実行方法

### すべての E2E テストを実行

```bash
npm run e2e
```

### UI モード（デバッグ用）で実行

```bash
npm run e2e:ui
```

### 特定のテストスペックを実行

```bash
npm run e2e -- 01-template-management.spec.ts
npm run e2e -- 02-data-input.spec.ts
```

### デバッグモードで実行

```bash
npm run e2e:debug
```

### 特定のブラウザで実行

```bash
npm run e2e -- --project=chromium
npm run e2e -- --project=firefox
npm run e2e -- --project=webkit
```

### ヘッドレスモード（CI/CD 用）

```bash
npm run e2e -- --headed=false
```

### ビデオ・スクリーンショット付き実行

```bash
npm run e2e -- --headed --video=on
```

## テストケース一覧

### 01-template-management.spec.ts

テンプレート管理ページのテスト

- **TE-01-001**: 新規テンプレート作成フロー
- **TE-01-002**: テンプレート一覧表示
- **TE-01-003**: テンプレート編集
- **TE-01-004**: テンプレート削除
- **TE-01-005**: テンプレート永続性（リロード後の保持）

### 02-data-input.spec.ts

データ入力ページのテスト

- **TE-02-001**: 完全なデータ入力フロー
- **TE-02-002**: テンプレート切り替え
- **TE-02-003**: エラーハンドリング
- **TE-02-004**: 連続入力（複数アンケート処理）

### 03-home-navigation.spec.ts

ホームページとナビゲーションのテスト

- **TE-03-001**: ホームページ表示
- **TE-03-002**: ページ遷移
- **TE-03-003**: ブラウザバック機能

### 04-full-workflow.spec.ts

完全なアプリケーション統合テスト

- **TE-04-001**: 初回利用フロー（新規ユーザー）
- **TE-04-002**: 複数テンプレート管理フロー
- **TE-04-003**: ローカルストレージ永続性
- **TE-04-004**: エッジケース（大量テンプレート、大きい画像など）

## テストレポート

テスト実行後、以下の場所でレポートを確認できます：

```
test-results/
├── results.json           # JSON レポート
├── junit.xml              # JUnit XML レポート
├── index.html             # HTML レポート（ブラウザで開く）
└── screenshots/           # テスト失敗時のスクリーンショット
```

HTML レポートを開く：

```bash
open test-results/index.html
```

## 設定ファイル

### playwright.config.ts

Playwright の設定ファイルです。以下の項目を含みます：

- **baseURL**: `http://localhost:5173`
- **testDir**: `./e2e/specs`
- **retries**: CI で 2 回、ローカルで 0 回
- **workers**: CI で 1 スレッド、ローカルで自動
- **reporters**: HTML, JSON, JUnit レポート生成
- **webServer**: 開発サーバーを自動起動
- **projects**: Chromium, Firefox, WebKit

## ページヘルパー（AppPage クラス）

テスト内で使用する主要なページアクション：

```typescript
import { AppPage } from "./fixtures/page-helpers";
import { test, expect } from "@playwright/test";

test("example", async ({ page }) => {
  const appPage = new AppPage(page);

  // ナビゲーション
  await appPage.navigateToHome();
  await appPage.navigateToTemplateManagement();

  // テンプレート操作
  await appPage.fillTemplateName("新しいテンプレート");
  await appPage.saveTemplate();

  // データ入力
  await appPage.selectTemplateForInput("テンプレート名");
  await appPage.uploadImageForOCR("path/to/image.png");
  await appPage.executeOCR();

  // 結果確認
  const results = await appPage.getOCRResults();
  expect(results).toContain("期待されるテキスト");
});
```

## カスタムアサーション

テスト内で使用するカスタムアサーション関数：

```typescript
import {
  assertTemplateExists,
  assertOCRResultsDisplayed,
  assertSuccessMessage,
  assertPageUrl,
} from "./utils/assertions";

// テンプレート存在確認
await assertTemplateExists(page, "テンプレート名");

// OCR 結果表示確認
await assertOCRResultsDisplayed(page, ["氏名", "Q1回答"]);

// 成功メッセージ確認
await assertSuccessMessage(page);

// ページ URL 確認
await assertPageUrl(page, "/template-management");
```

## テスト ヘルパー関数

汎用的なテスト ヘルパー関数：

```typescript
import {
  generateTemplateName,
  waitForElementByText,
  clickByText,
  getLocalStorageJSON,
  delay,
} from "./utils/test-helpers";

// ユニークなテンプレート名生成
const templateName = generateTemplateName("My Template");

// テキストで要素を待機・クリック
await waitForElementByText(page, "保存");
await clickByText(page, "保存");

// ローカルストレージから JSON 取得
const templates = await getLocalStorageJSON(page, "templates");

// 待機
await delay(1000);
```

## ベストプラクティス

### 1. テストの独立性

各テストは独立して実行できるようにしてください。前のテストの状態に依存しないようにします。

```typescript
test("テンプレート作成", async ({ page }) => {
  const appPage = new AppPage(page);

  // 初期化
  await appPage.clearLocalStorage();
  await appPage.navigateToTemplateManagement();

  // テスト実行
  // ...
});
```

### 2. セレクタの使用

可能な限り、データ属性セレクタを使用してください：

```typescript
// Good
await page.locator('[data-testid="template-item"]').click();

// Acceptable
await page.locator('button:has-text("保存")').click();

// Avoid
await page.locator("div.template-list > li:nth-child(1)").click();
```

### 3. 適切な待機

固定時間の待機ではなく、要素の出現を待つようにしてください：

```typescript
// Good
await page.waitForSelector('text="テンプレート保存完了"', { timeout: 5000 });

// Avoid
await page.waitForTimeout(2000); // 固定待機
```

### 4. スクリーンショット

テスト失敗時に自動的にスクリーンショットが保存されます。手動でスクリーンショットを撮ることもできます：

```typescript
await appPage.takeScreenshot("before-save");
await appPage.saveTemplate();
await appPage.takeScreenshot("after-save");
```

## CI/CD 統合

### GitHub Actions

`.github/workflows/e2e-tests.yml` で CI/CD パイプラインを設定します。プッシュ時に自動的に E2E テストが実行されます。

```bash
# ローカルで CI と同じ環境をテスト
BROWSER=chromium npm run e2e -- --headed=false
```

## トラブルシューティング

### ブラウザが起動しない

```bash
npx playwright install
```

### タイムアウトエラー

テスト実行時間が長い場合、playwright.config.ts でタイムアウト時間を増やしてください：

```typescript
use: {
  timeout: 10000, // デフォルト 5000ms
}
```

### テストが不安定

要素の待機時間を長くしてください：

```typescript
await page.waitForLoadState("networkidle", { timeout: 10000 });
```

## 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev)
- [Playwright API リファレンス](https://playwright.dev/docs/api/class-playwright)
- [E2E テストのベストプラクティス](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

## よくある質問

### Q: E2E テストはどのくらい時間がかかる？

A: 全テストで約 5-10 分程度です。`--workers=4` などでパラレル実行を増やすと高速化できます。

### Q: モバイルのテストもできる？

A: はい。`playwright.config.ts` の projects セクションでモバイルデバイスを設定できます。

### Q: ローカルでテスト開発する際のコツ？

A: UI モード（`npm run e2e:ui`）を使うと、テスト開発が非常に効率的です。

---

**最終更新**: 2024-11-07

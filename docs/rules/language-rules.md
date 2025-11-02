# 言語使用規則

## 概要

紙アンケート OCR 入力効率化 Web アプリにおける言語使用の統一規則を定義します。

## 基本方針

### 国際化対応を意識した使い分け

- **コード部分**: 英語（将来的な国際化に対応）
- **ドキュメント部分**: 日本語（現在のチーム・ユーザー環境に最適化）

## 詳細規則

### 1. コード内のコメント

**規則**: 英語で記述

**理由**:

- 将来的な国際化対応
- ライブラリ・フレームワークとの一貫性
- 技術情報の検索性向上

#### 例

```typescript
// Good: 英語コメント
/**
 * Extract text from specified regions using OCR
 * @param image - Source image for OCR processing
 * @param regions - Array of regions to extract text from
 * @returns Promise containing OCR results for each region
 */
async function extractTextFromRegions(
  image: HTMLImageElement,
  regions: Region[]
): Promise<OCRResult[]> {
  // Process each region sequentially to avoid memory issues
  const results: OCRResult[] = [];

  for (const region of regions) {
    // Crop image to region bounds
    const croppedImage = cropImageToRegion(image, region);

    // Execute OCR on cropped image
    const ocrResult = await tesseract.recognize(croppedImage);
    results.push({
      text: ocrResult.data.text,
      confidence: ocrResult.data.confidence,
      region,
    });
  }

  return results;
}

// Bad: 日本語コメント
/**
 * OCRを使って指定された領域からテキストを抽出する
 */
async function extractTextFromRegions() {
  // 各領域を順次処理してメモリ問題を回避
}
```

### 2. ドキュメントファイル

**規則**: 日本語で記述

**対象ファイル**:

- `docs/` 配下のすべての Markdown ファイル
- `*.spec.md` ファイル（仕様書）
- `README.md` ファイル

**理由**:

- チームメンバーの母語
- 要件・仕様の正確な理解
- ステークホルダーとのコミュニケーション効率

#### 例

```markdown
# テンプレート管理機能仕様書

## 概要

アンケート用紙のテンプレートを作成・管理する機能

## 要件

- 空のアンケート用紙を撮影してベース画像として登録
- OCR 対象領域をマウスドラッグで指定
- 領域に名前を付与し、抽出順序を定義
```

### 3. コミットメッセージ

**規則**: 英語で記述（コンベンショナルコミット形式）

**フォーマット**:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**タイプ**:

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

#### 例

```bash
# Good: 英語のコンベンショナルコミット
feat(template): add region selection functionality

- Implement drag-to-select region creation
- Add region resizing handles
- Support region naming and ordering

Closes #123

fix(ocr): resolve text extraction accuracy issue

The OCR engine was incorrectly processing rotated text.
Updated pre-processing to include auto-rotation detection.

# Bad: 日本語コミット
git commit -m "テンプレート領域選択機能を追加"
```

### 4. 関数・変数名

**規則**: 英語で記述

**命名パターン**:

- **関数**: `動詞 + 名詞` (camelCase)
- **変数**: `形容詞 + 名詞` (camelCase)
- **定数**: `SCREAMING_SNAKE_CASE`
- **型・インターフェース**: `PascalCase`
- **ファイル名**: `kebab-case.tsx` または `PascalCase.tsx`

#### 例

```typescript
// Good: 英語命名
interface TemplateRegion {
  id: string;
  name: string;
  coordinates: RegionCoordinates;
}

const MAX_TEMPLATE_COUNT = 10;
const selectedRegions: TemplateRegion[] = [];

function createNewTemplate(name: string): Template {
  return {
    id: generateUniqueId(),
    name,
    regions: [],
    createdAt: new Date(),
  };
}

function extractTextFromImage(image: HTMLImageElement): Promise<string> {
  // implementation
}

// Bad: 日本語命名
interface テンプレート領域 {
  id: string;
  名前: string;
}

function 新しいテンプレート作成() {
  // implementation
}
```

### 5. エラーメッセージ

#### ユーザー向けメッセージ: 日本語

```typescript
// Good: ユーザー向けは日本語
const USER_MESSAGES = {
  CAMERA_ACCESS_DENIED:
    "カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。",
  OCR_PROCESSING_FAILED: "OCR処理に失敗しました。画像を再撮影してください。",
  TEMPLATE_SAVE_SUCCESS: "テンプレートが正常に保存されました。",
  INVALID_TEMPLATE_NAME:
    "テンプレート名は1文字以上50文字以下で入力してください。",
};

// UI表示例
function showErrorMessage(errorType: keyof typeof USER_MESSAGES) {
  toast.error(USER_MESSAGES[errorType]);
}
```

#### ログ・デバッグ用メッセージ: 英語

```typescript
// Good: ログは英語
const LOG_MESSAGES = {
  CAMERA_INITIALIZATION_STARTED: "Camera initialization started",
  OCR_PROCESSING_COMPLETED: "OCR processing completed successfully",
  TEMPLATE_VALIDATION_FAILED: "Template validation failed",
  REGION_COORDINATES_INVALID: "Invalid region coordinates detected",
};

// ログ出力例
console.log(LOG_MESSAGES.OCR_PROCESSING_COMPLETED, {
  processingTime: 1200,
  regionsProcessed: 5,
});

console.error(LOG_MESSAGES.TEMPLATE_VALIDATION_FAILED, {
  templateId,
  validationErrors,
});
```

### 6. UI 要素のテキスト

**規則**: 日本語で記述

#### ボタン・ラベル・メニュー

```typescript
// Good: UI要素は日本語
const UI_TEXTS = {
  buttons: {
    CREATE_TEMPLATE: "新規テンプレート作成",
    TAKE_PHOTO: "撮影",
    EXECUTE_OCR: "OCR実行",
    COPY_TO_CLIPBOARD: "クリップボードにコピー",
    SAVE_TEMPLATE: "テンプレート保存",
    CANCEL: "キャンセル",
  },
  labels: {
    TEMPLATE_NAME: "テンプレート名",
    REGION_NAME: "領域名",
    EXTRACTION_ORDER: "抽出順序",
  },
  placeholders: {
    ENTER_TEMPLATE_NAME: "テンプレート名を入力",
    ENTER_REGION_NAME: "領域名を入力（例：氏名、Q1回答）",
  },
};
```

## 例外・特殊ケース

### 1. 技術用語・固有名詞

技術的に確立された英語用語は、そのまま使用

```typescript
// OK: 技術用語はそのまま
const ocrEngine = new Tesseract();
const canvasContext = canvas.getContext("2d");
const localStorage = window.localStorage;
```

### 2. 外部ライブラリとの互換性

外部ライブラリの API に合わせる場合は英語を使用

```typescript
// OK: ライブラリのAPIに合わせる
tesseract.recognize(image, "jpn", {
  logger: (m) => console.log(m.status, m.progress),
});
```

### 3. 設定ファイル・環境変数

グローバルな設定は英語

```typescript
// .env
VITE_OCR_LANGUAGE = jpn;
VITE_MAX_IMAGE_SIZE = 5242880;
VITE_CAMERA_CONSTRAINTS = '{"width": 1920, "height": 1080}';

// config.ts
export const CONFIG = {
  OCR_LANGUAGE: "jpn",
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  CAMERA_CONSTRAINTS: {
    width: 1920,
    height: 1080,
  },
};
```

## 統一性チェック

### 開発時

- [ ] コメントは英語で記述されているか
- [ ] 関数・変数名は英語かつ適切な命名規則か
- [ ] ユーザー向けメッセージは日本語か
- [ ] ログメッセージは英語か

### レビュー時

- [ ] 言語使用規則に準拠しているか
- [ ] UI 要素のテキストは日本語で統一されているか
- [ ] コミットメッセージはコンベンショナルコミット形式か

### リリース前

- [ ] 全てのユーザー向けメッセージが日本語で表示されるか
- [ ] エラーメッセージが適切に日本語化されているか

この規則により、コードの保守性とユーザビリティの両方を確保します。

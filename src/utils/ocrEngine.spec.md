# ocrEngine.spec.md

## Related Files

- Implementation: `ocrEngine.ts`
- Tests: `ocrEngine.test.ts`
- Types: `../types/ocr.ts`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-001**: Tesseract.js を使用した OCR 処理の実行
- **FR-002**: 日本語テキストの認識（jpn 言語データ）
- **FR-003**: 画像データ（Base64）からのテキスト抽出
- **FR-004**: 進行状況の追跡とコールバック
- **FR-005**: エラーハンドリングとリトライ機能
- **FR-006**: OCR 結果の信頼度（confidence）の取得

### Non-Functional Requirements

- **NFR-001**: OCR 処理は非同期で実行
- **NFR-002**: Worker を使用してメインスレッドをブロックしない
- **NFR-003**: メモリ使用量の最適化
- **NFR-004**: 処理時間の目標: 1 領域あたり 3-5 秒

## Interface Definition

```typescript
/**
 * OCR Engine Configuration
 */
interface OCRConfig {
  /** Language to recognize (default: 'jpn') */
  language: string;
  /** Use Tesseract Worker (default: true) */
  useWorker: boolean;
  /** Logger for debugging (optional) */
  logger?: (message: string) => void;
}

/**
 * OCR Progress Callback
 */
interface OCRProgress {
  /** Progress percentage (0-1) */
  progress: number;
  /** Current status message */
  status: string;
}

/**
 * OCR Result
 */
interface OCRResult {
  /** Recognized text */
  text: string;
  /** Confidence level (0-100) */
  confidence: number;
  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * OCR Engine Class
 */
class OCREngine {
  /**
   * Initialize OCR Engine
   * @param config - OCR configuration
   */
  constructor(config?: Partial<OCRConfig>);

  /**
   * Recognize text from image
   * @param imageData - Base64 image data
   * @param onProgress - Progress callback (optional)
   * @returns Promise<OCRResult>
   */
  recognize(
    imageData: string,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult>;

  /**
   * Terminate OCR worker
   */
  terminate(): Promise<void>;

  /**
   * Check if worker is ready
   */
  isReady(): boolean;
}
```

## Behavior Specification

### Normal Cases

#### NC-001: OCR エンジンの初期化

**条件**: デフォルト設定で OCR エンジンを初期化

**期待結果**:

- Worker が起動する
- 日本語言語データ（jpn）が読み込まれる
- `isReady()` が `true` を返す

#### NC-002: 画像からテキスト抽出

**条件**: Base64 画像データを渡して OCR 実行

**期待結果**:

- テキストが正常に抽出される
- 信頼度が返される（0-100）
- 処理時間が記録される

#### NC-003: 進行状況のトラッキング

**条件**: `onProgress` コールバックを指定して OCR 実行

**期待結果**:

- 進行状況が定期的にコールバックされる
- `progress` が 0 から 1 まで増加
- `status` メッセージが更新される

### Edge Cases

#### EC-001: 空の画像データ

**条件**: 空文字列または無効な Base64 データを渡す

**期待結果**:

- エラーがスローされる
- エラーメッセージ: "Invalid image data"

#### EC-002: 複数回の recognize 呼び出し

**条件**: 同時に複数の `recognize()` を呼び出す

**期待結果**:

- すべての呼び出しが正常に処理される
- Worker が適切に管理される

#### EC-003: Worker の再利用

**条件**: `terminate()` 後に再度 `recognize()` を呼び出す

**期待結果**:

- エラーまたは自動的に Worker が再起動
- 適切なエラーメッセージ

### Error Cases

#### ER-001: 言語データの読み込み失敗

**条件**: ネットワークエラーで言語データが取得できない

**期待結果**:

- エラーがスローされる
- エラーメッセージ: "Failed to load language data"

#### ER-002: OCR 処理のタイムアウト

**条件**: 処理が 30 秒を超える

**期待結果**:

- タイムアウトエラーがスローされる
- Worker が適切に終了される

## Test Cases

### TC-001: OCR エンジンの初期化テスト

**Purpose**: OCR エンジンが正常に初期化されることを確認

**Input**:

```typescript
const engine = new OCREngine();
```

**Expected**:

- `engine.isReady()` が `true`
- Worker が起動している

**Steps**:

1. OCR エンジンをデフォルト設定で作成
2. `isReady()` を呼び出す
3. `true` が返ることを確認

### TC-002: カスタム設定での初期化テスト

**Purpose**: カスタム設定で初期化できることを確認

**Input**:

```typescript
const engine = new OCREngine({
  language: "eng",
  useWorker: false,
  logger: console.log,
});
```

**Expected**:

- 指定した言語で初期化される
- Worker を使用しない設定が反映される

### TC-003: 画像からテキスト抽出テスト

**Purpose**: Base64 画像からテキストを抽出できることを確認

**Input**:

```typescript
const imageData = "data:image/png;base64,iVBORw0KGgoAAAA...";
const result = await engine.recognize(imageData);
```

**Expected**:

```typescript
{
  text: "抽出されたテキスト",
  confidence: 85.5,
  processingTime: 3200
}
```

### TC-004: 進行状況コールバックテスト

**Purpose**: OCR 処理中に進行状況が通知されることを確認

**Input**:

```typescript
const progressUpdates: OCRProgress[] = [];
const result = await engine.recognize(imageData, (progress) => {
  progressUpdates.push(progress);
});
```

**Expected**:

- `progressUpdates` 配列に複数の進行状況が記録される
- `progress` が 0 から 1 まで増加
- 最後の `progress` が 1

### TC-005: Worker の終了テスト

**Purpose**: Worker が正常に終了することを確認

**Input**:

```typescript
await engine.terminate();
const ready = engine.isReady();
```

**Expected**:

- `ready` が `false`
- Worker が完全に終了している

### TC-006: 空の画像データエラーテスト

**Purpose**: 無効な画像データでエラーが発生することを確認

**Input**:

```typescript
await engine.recognize("");
```

**Expected**:

- エラーがスローされる
- エラーメッセージ: "Invalid image data"

### TC-007: 複数回の recognize 呼び出しテスト

**Purpose**: 連続して OCR を実行できることを確認

**Input**:

```typescript
const result1 = await engine.recognize(imageData1);
const result2 = await engine.recognize(imageData2);
```

**Expected**:

- 両方の結果が正常に返される
- メモリリークが発生しない

### TC-008: 信頼度の取得テスト

**Purpose**: OCR 結果の信頼度が適切な範囲であることを確認

**Input**:

```typescript
const result = await engine.recognize(imageData);
```

**Expected**:

- `result.confidence` が 0 以上 100 以下
- 数値型であること

### TC-009: 処理時間の記録テスト

**Purpose**: OCR 処理時間が正確に記録されることを確認

**Input**:

```typescript
const startTime = Date.now();
const result = await engine.recognize(imageData);
const endTime = Date.now();
```

**Expected**:

- `result.processingTime` が実際の処理時間に近い
- 誤差が ±100ms 以内

### TC-010: 日本語テキスト認識テスト

**Purpose**: 日本語テキストが正常に認識されることを確認

**Input**: 日本語テキストを含む画像

**Expected**:

- 日本語テキストが抽出される
- 漢字、ひらがな、カタカナが認識される

## Acceptance Criteria

- [ ] TC-001 から TC-010 まですべてのテストケースが合格
- [ ] TypeScript の型定義が正確
- [ ] エラーハンドリングが適切
- [ ] メモリリークが発生しない
- [ ] ドキュメントコメント（JSDoc）が完備
- [ ] Tesseract.js のベストプラクティスに従っている

## Performance Requirements

- **処理速度**: 1 領域あたり 3-5 秒以内
- **メモリ使用量**: 100MB 以下
- **Worker 起動時間**: 2 秒以内
- **言語データ読み込み**: 3 秒以内

## Security Considerations

- 画像データは外部送信しない（すべてブラウザ内で処理）
- 個人情報を含むテキストも外部に送信しない
- XSS 対策: テキスト出力時のサニタイズ

## Dependencies

- **tesseract.js**: ^6.0.1
- **React**: ^19.0.0 (型定義のみ)

## Notes

- Tesseract.js の Worker は自動的に CDN から言語データを取得する
- オフライン対応が必要な場合は言語データを事前ダウンロード
- Canvas API を使った画像前処理により精度向上が可能

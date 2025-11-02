# imageProcessor.spec.md

## Related Files

- Implementation: `imageProcessor.ts`
- Tests: `imageProcessor.test.ts`
- Related: `ocrEngine.ts`

## Related Documentation

- OCR Engine: `./ocrEngine.spec.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-001**: 画像のリサイズ機能（指定サイズへの縮小/拡大）
- **FR-002**: 画像をグレースケールに変換
- **FR-003**: 画像のコントラスト調整（明るさ補正）
- **FR-004**: 画像から指定領域を切り出し
- **FR-005**: 切り出した領域を Base64 データに変換
- **FR-006**: 画像の回転補正（自動検出）
- **FR-007**: 複数の前処理を組み合わせたパイプライン処理

### Non-Functional Requirements

- **NFR-001**: すべての処理はブラウザ内で完結（Canvas API 使用）
- **NFR-002**: 処理時間は 500ms 以内
- **NFR-003**: メモリ効率的な実装
- **NFR-004**: 元の画像を破壊しない（不変性）

## Interface Definition

```typescript
/**
 * Image processing options
 */
interface ImageProcessingOptions {
  /** Width to resize to (optional) */
  width?: number;
  /** Height to resize to (optional) */
  height?: number;
  /** Apply grayscale conversion (default: false) */
  grayscale?: boolean;
  /** Apply contrast adjustment (0-2, 1 = normal) */
  contrast?: number;
  /** Apply brightness adjustment (-100 to 100) */
  brightness?: number;
}

/**
 * Region coordinates (normalized 0-1 or absolute pixels)
 */
interface RegionCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Image Processing Utility Class
 */
class ImageProcessor {
  /**
   * Load image from Base64 data
   * @param imageData - Base64 image data
   * @returns Promise<HTMLImageElement>
   */
  static async loadImage(imageData: string): Promise<HTMLImageElement>;

  /**
   * Resize image
   * @param imageData - Base64 image data
   * @param width - Target width
   * @param height - Target height
   * @returns Base64 resized image data
   */
  static resizeImage(
    imageData: string,
    width: number,
    height: number
  ): Promise<string>;

  /**
   * Convert image to grayscale
   * @param imageData - Base64 image data
   * @returns Base64 grayscale image data
   */
  static toGrayscale(imageData: string): Promise<string>;

  /**
   * Adjust image contrast
   * @param imageData - Base64 image data
   * @param contrast - Contrast value (0-2, 1 = normal)
   * @returns Base64 adjusted image data
   */
  static adjustContrast(imageData: string, contrast: number): Promise<string>;

  /**
   * Adjust image brightness
   * @param imageData - Base64 image data
   * @param brightness - Brightness value (-100 to 100)
   * @returns Base64 adjusted image data
   */
  static adjustBrightness(
    imageData: string,
    brightness: number
  ): Promise<string>;

  /**
   * Crop region from image
   * @param imageData - Base64 image data
   * @param region - Region coordinates (normalized 0-1)
   * @returns Base64 cropped image data
   */
  static cropRegion(
    imageData: string,
    region: RegionCoordinates
  ): Promise<string>;

  /**
   * Apply multiple processing options
   * @param imageData - Base64 image data
   * @param options - Processing options
   * @returns Base64 processed image data
   */
  static processImage(
    imageData: string,
    options: ImageProcessingOptions
  ): Promise<string>;

  /**
   * Extract multiple regions from image
   * @param imageData - Base64 image data
   * @param regions - Array of region coordinates
   * @returns Array of Base64 cropped images
   */
  static extractRegions(
    imageData: string,
    regions: RegionCoordinates[]
  ): Promise<string[]>;

  /**
   * Get image dimensions
   * @param imageData - Base64 image data
   * @returns Promise<{width: number, height: number}>
   */
  static getImageDimensions(
    imageData: string
  ): Promise<{ width: number; height: number }>;
}
```

## Behavior Specification

### Normal Cases

#### NC-001: 画像のリサイズ

**条件**: 1920x1080 の画像を 800x600 にリサイズ

**期待結果**:

- 新しい画像サイズが 800x600
- アスペクト比が保たれる（または指定比率）
- Base64 データが返される

#### NC-002: グレースケール変換

**条件**: カラー画像をグレースケールに変換

**期待結果**:

- すべてのピクセルがグレースケール値
- 画像サイズは変わらない

#### NC-003: 領域切り出し

**条件**: 画像から領域座標 (0.2, 0.3, 0.5, 0.4) を切り出し

**期待結果**:

- 切り出された領域だけが返される
- 座標は相対値（0-1）で指定

#### NC-004: 複合処理

**条件**: リサイズ + グレースケール + コントラスト調整

**期待結果**:

- すべての処理が順序通りに適用される
- 最終結果が返される

### Edge Cases

#### EC-001: 無効な画像データ

**条件**: 空文字列またはダメな Base64 データ

**期待結果**:

- エラーがスローされる
- エラーメッセージ: "Invalid image data"

#### EC-002: 領域座標が範囲外

**条件**: 座標が 1.0 を超えている

**期待結果**:

- 自動的にクリップされる
- または警告が発生

#### EC-003: 1:1 アスペクト比でのリサイズ

**条件**: 元は 1920x1080、リサイズ先は 600x600

**期待結果**:

- 歪まずにリサイズされる
- または指定アスペクト比を優先

### Error Cases

#### ER-001: Canvas コンテキスト取得失敗

**条件**: Canvas が利用できない環境

**期待結果**:

- エラーがスローされる
- エラーメッセージ: "Canvas not supported"

#### ER-002: 画像読み込みタイムアウト

**条件**: 画像読み込みが 5 秒以上

**期待結果**:

- タイムアウトエラー
- Promise が reject される

## Test Cases

### TC-001: 画像読み込みテスト

**Purpose**: Base64 画像データが正常に読み込まれることを確認

**Steps**:

1. Base64 画像データを渡す
2. `loadImage()` を呼び出す
3. HTMLImageElement が返されることを確認

### TC-002: 画像リサイズテスト

**Purpose**: 画像が指定サイズにリサイズされることを確認

**Steps**:

1. 1920x1080 の画像を用意
2. `resizeImage(imageData, 800, 600)` を呼び出す
3. 返された画像が 800x600 であることを確認

### TC-003: グレースケール変換テスト

**Purpose**: 画像がグレースケールに正しく変換されることを確認

**Steps**:

1. カラー画像を用意
2. `toGrayscale(imageData)` を呼び出す
3. 画像がグレースケールであることを確認（RGB 値が同じ）

### TC-004: コントラスト調整テスト

**Purpose**: 画像のコントラストが調整されることを確認

**Steps**:

1. 画像を用意
2. `adjustContrast(imageData, 1.5)` を呼び出す
3. コントラストが高くなっていることを確認

### TC-005: 明るさ調整テスト

**Purpose**: 画像の明るさが調整されることを確認

**Steps**:

1. 画像を用意
2. `adjustBrightness(imageData, 30)` を呼び出す
3. 画像が明るくなっていることを確認

### TC-006: 領域切り出しテスト

**Purpose**: 画像から指定領域が正しく切り出されることを確認

**Steps**:

1. 1000x1000 の画像を用意
2. `cropRegion(imageData, {x: 0.2, y: 0.3, width: 0.5, height: 0.4})` を呼び出す
3. 切り出された画像が 500x400 であることを確認

### TC-007: 複合処理テスト

**Purpose**: 複数の処理が順序通りに適用されることを確認

**Steps**:

1. 画像を用意
2. `processImage(imageData, {width: 800, height: 600, grayscale: true, contrast: 1.2})` を呼び出す
3. 返された画像が 800x600 でグレースケールであることを確認

### TC-008: 複数領域抽出テスト

**Purpose**: 複数の領域が同時に抽出されることを確認

**Steps**:

1. 画像を用意
2. 複数の領域座標を指定
3. `extractRegions(imageData, regions)` を呼び出す
4. 指定数の画像配列が返されることを確認

### TC-009: 画像サイズ取得テスト

**Purpose**: 画像のサイズが正しく取得されることを確認

**Steps**:

1. 1920x1080 の画像を用意
2. `getImageDimensions(imageData)` を呼び出す
3. `{width: 1920, height: 1080}` が返されることを確認

### TC-010: エラーハンドリングテスト

**Purpose**: 無効なデータでエラーが発生することを確認

**Steps**:

1. 空文字列をデータとして渡す
2. エラーがスローされることを確認
3. エラーメッセージが正しいことを確認

## Acceptance Criteria

- [ ] TC-001 から TC-010 まですべてのテストケースが合格
- [ ] TypeScript の型定義が正確
- [ ] エラーハンドリングが適切
- [ ] すべての処理が 500ms 以内
- [ ] JSDoc コメント完備
- [ ] Canvas API のベストプラクティス実装

## Performance Targets

- **画像読み込み**: 100ms 以内
- **リサイズ**: 200ms 以内
- **グレースケール変換**: 150ms 以内
- **領域切り出し**: 50ms 以内
- **複合処理**: 500ms 以内

## Implementation Notes

### Canvas API Usage

```typescript
// Canvas を使用した画像処理の例
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas not supported");

canvas.width = targetWidth;
canvas.height = targetHeight;
ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

// グレースケール処理
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;
for (let i = 0; i < data.length; i += 4) {
  const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  data[i] = gray;
  data[i + 1] = gray;
  data[i + 2] = gray;
}
ctx.putImageData(imageData, 0, 0);

// Base64 に変換
const resultData = canvas.toDataURL("image/png");
```

### Coordinate System

- **相対座標（0-1）**: 画像サイズに対する比率
- **絶対座標（ピクセル）**: 実際のピクセル値
  - 内部的には相対座標を使用
  - 入力時に変換

### Memory Management

- Canvas は処理後に破棄
- 大きな画像は段階的に処理
- Worker の使用検討（大きな画像のみ）

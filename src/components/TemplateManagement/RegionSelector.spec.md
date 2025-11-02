# RegionSelector.spec.md

## Related Files

- Implementation: `RegionSelector.tsx`
- Tests: `RegionSelector.test.tsx`
- Styles: (inline styles / Tailwind CSS)

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_03_template-management.md`
- Plan: `docs/03_plans/template-management/20241103_01_next-implementation-plan.md`
- Overall Plan: `docs/03_plans/template-management/20241102_01_phase3-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-001**: 画像を Canvas に表示し、その上に OCR 領域を矩形で表示できること
- **FR-002**: マウスドラッグで新しい矩形領域を作成できること
- **FR-003**: タッチ操作でも矩形領域を作成できること
- **FR-004**: 作成した領域を選択し、ハイライト表示できること
- **FR-005**: 選択した領域をリサイズできること（8 方向のハンドル対応）
- **FR-006**: 領域に名前を付与できること
- **FR-007**: 領域を削除できること
- **FR-008**: 領域の抽出順序を変更できること（ドラッグ&ドロップ or ボタン）
- **FR-009**: 領域の座標を画像サイズに対する相対座標（0-1）で管理すること
- **FR-010**: 最大領域数を制限できること（デフォルト: 20）

### Non-Functional Requirements

- **NFR-001**: レスポンシブ対応（画像サイズに応じて Canvas サイズを調整）
- **NFR-002**: Canvas 操作のパフォーマンス最適化（60fps 維持）
- **NFR-003**: 直感的な操作性（ドラッグ開始位置が明確、ハンドルが視認しやすい）
- **NFR-004**: アクセシビリティ対応（キーボード操作サポート）

## Interface Definition

```typescript
interface RegionSelectorProps {
  /**
   * Base64 encoded image data to display
   */
  imageData: string;

  /**
   * Existing regions for editing mode
   */
  regions?: Region[];

  /**
   * Callback fired when regions are changed
   */
  onRegionsChange: (regions: Region[]) => void;

  /**
   * Maximum number of regions allowed
   * @default 20
   */
  maxRegions?: number;

  /**
   * Whether the selector is in read-only mode
   * @default false
   */
  readOnly?: boolean;
}

interface Region {
  id: string;
  name: string;
  coordinates: {
    x: number; // Relative position (0-1)
    y: number; // Relative position (0-1)
    width: number; // Relative size (0-1)
    height: number; // Relative size (0-1)
  };
  order: number;
}

interface InternalState {
  // Canvas state
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageElement: HTMLImageElement | null;
  canvasScale: number;

  // Region state
  regions: Region[];
  selectedRegionId: string | null;

  // Drag state
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragCurrentX: number;
  dragCurrentY: number;

  // Resize state
  isResizing: boolean;
  resizeHandle: ResizeHandle | null;
  resizeTargetId: string | null;

  // UI state
  hoveredRegionId: string | null;
  hoveredHandle: ResizeHandle | null;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Behavior Specification

### Normal Cases

#### 新規領域作成

- **ケース 1**: 画像内の任意の位置でマウスドラッグ → 矩形が描画され、ドラッグ終了時に新しい領域が作成される
- **ケース 2**: 領域作成後、自動的にその領域が選択状態になる
- **ケース 3**: 作成された領域の order 値は既存領域数+1 となる
- **ケース 4**: 作成された領域のデフォルト名は「領域{order}」となる

#### 領域選択

- **ケース 5**: 既存領域をクリック → その領域が選択され、ハイライト表示される
- **ケース 6**: 選択中の領域以外をクリック → 選択が解除される
- **ケース 7**: 領域一覧から領域をクリック → Canvas 上の対応領域が選択される

#### 領域リサイズ

- **ケース 8**: 選択中の領域の角または辺にマウスホバー → リサイズハンドルが表示される
- **ケース 9**: リサイズハンドルをドラッグ → 対応する方向に領域がリサイズされる
- **ケース 10**: 北西ハンドル: 左上角の位置とサイズが変更される
- **ケース 11**: 南東ハンドル: 右下角の位置とサイズが変更される
- **ケース 12**: 北/南ハンドル: 高さのみ変更される
- **ケース 13**: 東/西ハンドル: 幅のみ変更される

#### 領域名変更

- **ケース 14**: 領域一覧の名前入力フィールドで名前を変更 → onRegionsChange が呼ばれる
- **ケース 15**: 空白のみの名前は許可されない（トリム後チェック）

#### 領域削除

- **ケース 16**: 領域一覧の削除ボタンをクリック → 該当領域が削除され、以降の領域の order が詰められる

#### 順序変更

- **ケース 17**: 領域一覧で「上へ」ボタンをクリック → order 値が 1 減少し、前の領域と入れ替わる
- **ケース 18**: 領域一覧で「下へ」ボタンをクリック → order 値が 1 増加し、次の領域と入れ替わる

### Edge Cases

#### 領域作成の制約

- **エッジケース 1**: 最大領域数に達している → 新規領域作成を無効化し、メッセージ表示
- **エッジケース 2**: 画像境界を超えるドラッグ → 画像内に収まるよう座標を補正
- **エッジケース 3**: 極小サイズ（5px 未満）のドラッグ → 領域として作成しない
- **エッジケース 4**: 逆方向ドラッグ（右から左、下から上） → 正規化して領域作成

#### リサイズの制約

- **エッジケース 5**: 画像境界を超えるリサイズ → 画像内に収まるよう制限
- **エッジケース 6**: 最小サイズ（10px）未満にリサイズ → 最小サイズで制限
- **エッジケース 7**: マイナスサイズになるリサイズ → 座標を正規化して対応

#### 順序変更の制約

- **エッジケース 8**: 最初の領域で「上へ」 → ボタンを無効化
- **エッジケース 9**: 最後の領域で「下へ」 → ボタンを無効化

#### レスポンシブ対応

- **エッジケース 10**: ウィンドウリサイズ → Canvas 表示を再計算し、相対座標を維持
- **エッジケース 11**: 画像アスペクト比が極端 → Canvas サイズを適切に調整

### Error Cases

- **エラーケース 1**: 無効な画像データ（imageData） → エラーメッセージ表示、Canvas 未描画
- **エラーケース 2**: 画像読み込み失敗 → エラーメッセージ表示、リトライオプション提示
- **エラーケース 3**: onRegionsChange 未定義 → コンソール警告、UI 操作は継続

## Test Cases

### TC-001: 初期表示テスト

- **Purpose**: コンポーネントが正しく初期化され、画像と Canvas が表示されること
- **Input**:
  - `imageData`: 有効な Base64 画像データ
  - `regions`: 空配列
- **Expected**:
  - Canvas に画像が描画される
  - 領域一覧が空の状態で表示される
  - 「新規領域を選択してください」のガイドメッセージが表示される
- **Steps**:
  1. RegionSelector をマウント
  2. Canvas 要素の存在を確認
  3. 画像描画完了を確認
  4. 領域一覧の表示を確認

### TC-002: 新規領域作成テスト（マウス操作）

- **Purpose**: マウスドラッグで新しい領域を作成できること
- **Input**:
  - `imageData`: 有効な画像
  - マウスドラッグ: (50, 50) → (150, 150)
- **Expected**:
  - 矩形が描画される
  - onRegionsChange が呼ばれ、新しい領域が追加される
  - 領域の座標が相対座標（0-1）で保存される
- **Steps**:
  1. Canvas 上で mouseDown イベント発火 (50, 50)
  2. mouseMove イベントで (150, 150) まで移動
  3. mouseUp イベント発火
  4. onRegionsChange の呼び出しを確認
  5. 領域の座標値を検証

### TC-003: 新規領域作成テスト（タッチ操作）

- **Purpose**: タッチ操作で新しい領域を作成できること
- **Input**:
  - `imageData`: 有効な画像
  - タッチドラッグ: (50, 50) → (150, 150)
- **Expected**:
  - マウス操作と同様に矩形が作成される
- **Steps**:
  1. touchStart イベント発火
  2. touchMove イベントで移動
  3. touchEnd イベント発火
  4. 領域作成を確認

### TC-004: 領域選択テスト

- **Purpose**: 既存領域をクリックして選択できること
- **Input**:
  - `regions`: 1 つの領域を含む配列
  - クリック位置: 領域内の座標
- **Expected**:
  - 領域がハイライト表示される
  - 選択状態が内部 state に反映される
- **Steps**:
  1. 領域を含む状態でコンポーネントをマウント
  2. 領域内でクリック
  3. ハイライト表示を確認
  4. selectedRegionId state を確認

### TC-005: 領域リサイズテスト（南東ハンドル）

- **Purpose**: 南東ハンドルで領域をリサイズできること
- **Input**:
  - 選択された領域
  - ドラッグ: 南東ハンドルから (50, 50) 移動
- **Expected**:
  - 領域の width と height が増加する
  - onRegionsChange が呼ばれる
- **Steps**:
  1. 領域を選択
  2. 南東ハンドル位置で mouseDown
  3. (50, 50) 移動して mouseUp
  4. 領域サイズの変化を確認

### TC-006: 領域リサイズテスト（北西ハンドル）

- **Purpose**: 北西ハンドルで領域をリサイズできること（位置とサイズが変更）
- **Input**:
  - 選択された領域
  - ドラッグ: 北西ハンドルから (-30, -30) 移動
- **Expected**:
  - 領域の x, y が減少、width, height が増加する
- **Steps**:
  1. 領域を選択
  2. 北西ハンドル位置で mouseDown
  3. (-30, -30) 移動して mouseUp
  4. 座標とサイズの変化を確認

### TC-007: 領域名変更テスト

- **Purpose**: 領域一覧から名前を変更できること
- **Input**:
  - `regions`: 1 つの領域
  - 新しい名前: "氏名"
- **Expected**:
  - onRegionsChange が新しい名前で呼ばれる
- **Steps**:
  1. 領域一覧の名前入力フィールドを取得
  2. 値を"氏名"に変更
  3. onRegionsChange の呼び出しと引数を確認

### TC-008: 領域削除テスト

- **Purpose**: 領域を削除できること
- **Input**:
  - `regions`: 3 つの領域 (order: 1, 2, 3)
  - 削除対象: order 2 の領域
- **Expected**:
  - 領域が削除される
  - 残りの領域の order が詰められる (1, 2)
  - onRegionsChange が呼ばれる
- **Steps**:
  1. 3 つの領域を表示
  2. 2 番目の削除ボタンをクリック
  3. 残りの領域数と order 値を確認

### TC-009: 順序変更テスト（上へ）

- **Purpose**: 領域の順序を上に移動できること
- **Input**:
  - `regions`: 3 つの領域 (order: 1, 2, 3)
  - 操作: order 2 の領域を「上へ」
- **Expected**:
  - order 2 と 1 が入れ替わる
  - onRegionsChange が呼ばれる
- **Steps**:
  1. 3 つの領域を表示
  2. 2 番目の「上へ」ボタンをクリック
  3. 順序の変化を確認

### TC-010: 順序変更テスト（下へ）

- **Purpose**: 領域の順序を下に移動できること
- **Input**:
  - `regions`: 3 つの領域 (order: 1, 2, 3)
  - 操作: order 2 の領域を「下へ」
- **Expected**:
  - order 2 と 3 が入れ替わる
- \*\*onRegionsChange が呼ばれる
- **Steps**:
  1. 3 つの領域を表示
  2. 2 番目の「下へ」ボタンをクリック
  3. 順序の変化を確認

### TC-011: 最大領域数制限テスト

- **Purpose**: 最大領域数に達したら新規作成を無効化すること
- **Input**:
  - `maxRegions`: 3
  - `regions`: 3 つの領域
  - 操作: 新規領域作成を試行
- **Expected**:
  - ドラッグしても新規領域が作成されない
  - 警告メッセージが表示される
- **Steps**:
  1. maxRegions=3 で 3 つの領域を表示
  2. Canvas でドラッグ操作
  3. 領域が増えないことを確認
  4. 警告メッセージの表示を確認

### TC-012: 画像境界制約テスト（新規作成）

- **Purpose**: 画像境界を超えるドラッグを制限すること
- **Input**:
  - ドラッグ: 画像内から画像外へ
- **Expected**:
  - 領域が画像境界内に収まる
- **Steps**:
  1. 画像内でドラッグ開始
  2. 画像外までドラッグ
  3. 作成された領域の座標を確認（0-1 の範囲内）

### TC-013: 画像境界制約テスト（リサイズ）

- **Purpose**: リサイズ時も画像境界を超えないこと
- **Input**:
  - 領域の南東ハンドルを画像外までドラッグ
- **Expected**:
  - 領域が画像境界で停止する
- **Steps**:
  1. 領域を選択
  2. 南東ハンドルを画像外までドラッグ
  3. 最終的な座標が 1.0 を超えないことを確認

### TC-014: 最小サイズ制約テスト

- **Purpose**: 極小サイズの領域を作成しないこと
- **Input**:
  - ドラッグ: 3px x 3px のサイズ
- **Expected**:
  - 領域が作成されない
- **Steps**:
  1. 極小範囲でドラッグ
  2. onRegionsChange が呼ばれないことを確認

### TC-015: 逆方向ドラッグテスト

- **Purpose**: 右 → 左、下 → 上のドラッグでも正しく領域を作成すること
- **Input**:
  - ドラッグ: (150, 150) → (50, 50)
- **Expected**:
  - 座標が正規化され、正しい矩形が作成される
- **Steps**:
  1. 右下から左上へドラッグ
  2. 作成された領域の座標を確認（x, y が小さい値）

### TC-016: 既存領域の編集モードテスト

- **Purpose**: 既存領域を渡した場合、編集モードで表示されること
- **Input**:
  - `regions`: 2 つの領域を含む配列
- **Expected**:
  - Canvas 上に 2 つの領域が描画される
  - 領域一覧に 2 つの領域が表示される
- **Steps**:
  1. regions prop を渡してマウント
  2. Canvas 上の矩形を確認
  3. 領域一覧の表示を確認

### TC-017: 読み取り専用モードテスト

- **Purpose**: readOnly=true の場合、編集操作を無効化すること
- **Input**:
  - `readOnly`: true
  - `regions`: 1 つの領域
- **Expected**:
  - 領域の表示のみ可能
  - ドラッグ、リサイズ、削除ボタンが無効化される
- **Steps**:
  1. readOnly=true でマウント
  2. 各種操作を試行
  3. onRegionsChange が呼ばれないことを確認

### TC-018: 無効な画像データエラーテスト

- **Purpose**: 無効な画像データの場合、エラー表示すること
- **Input**:
  - `imageData`: 無効な Base64 文字列
- **Expected**:
  - エラーメッセージが表示される
  - Canvas は空の状態
- **Steps**:
  1. 無効な imageData でマウント
  2. エラーメッセージの表示を確認
  3. Canvas が空であることを確認

### TC-019: レスポンシブ対応テスト

- **Purpose**: ウィンドウリサイズ時に相対座標を維持すること
- **Input**:
  - `regions`: 1 つの領域
  - 操作: ウィンドウリサイズ
- **Expected**:
  - 領域の相対位置が変わらない
  - Canvas サイズが調整される
- **Steps**:
  1. 領域を作成
  2. ウィンドウをリサイズ
  3. 領域の相対座標が維持されていることを確認

### TC-020: 複数領域の一括管理テスト

- **Purpose**: 複数領域を同時に管理できること
- **Input**:
  - 操作: 5 つの領域を順次作成
- **Expected**:
  - 全ての領域が正しい order 値で管理される
  - 領域一覧が正しい順序で表示される
- **Steps**:
  1. 5 回領域作成操作を実行
  2. regions 配列の長さと各領域の order を確認
  3. 領域一覧の表示順序を確認

### TC-021: キーボード操作テスト（アクセシビリティ）

- **Purpose**: キーボードで領域を削除できること
- **Input**:
  - `regions`: 1 つの領域
  - 操作: 削除ボタンにフォーカス → Enter キー
- **Expected**:
  - 領域が削除される
- **Steps**:
  1. 削除ボタンにフォーカス
  2. Enter キーを押下
  3. 領域削除を確認

### TC-022: 領域一覧からの選択同期テスト

- **Purpose**: 領域一覧のクリックで Canvas 上の領域が選択されること
- **Input**:
  - `regions`: 3 つの領域
  - 操作: 領域一覧の 2 番目をクリック
- **Expected**:
  - Canvas 上の 2 番目の領域がハイライト表示される
- **Steps**:
  1. 3 つの領域を表示
  2. 領域一覧の 2 番目をクリック
  3. Canvas 上のハイライト表示を確認

## Acceptance Criteria

- [ ] 画像の表示と Canvas 描画が正常に動作する
- [ ] マウスとタッチの両方で領域作成ができる
- [ ] 8 方向のリサイズハンドルが正常に機能する
- [ ] 領域の名前変更、削除、順序変更が動作する
- [ ] 座標が相対座標（0-1）で正しく管理される
- [ ] 画像境界と最小サイズの制約が機能する
- [ ] 最大領域数の制限が機能する
- [ ] レスポンシブ対応が動作する
- [ ] エラーハンドリングが適切に実装されている
- [ ] 全テストケース（TC-001〜TC-022）が合格する
- [ ] TypeScript エラーが 0 件
- [ ] コードレビュー完了
- [ ] DEPENDENCY MAP が記載されている

## Performance Considerations

- Canvas 再描画の最適化（useCallback, useMemo 活用）
- ドラッグ中のスムーズな描画（requestAnimationFrame 使用）
- 大量領域の効率的な描画とイベント処理
- 画像読み込みの非同期処理とローディング表示

## Accessibility Considerations

- キーボード操作サポート（Tab, Enter, Delete）
- フォーカス表示の明確化
- ARIA 属性の適切な設定
- スクリーンリーダー対応（領域情報の読み上げ）

## Technical Notes

### 座標変換の計算式

```typescript
// 絶対座標 → 相対座標
const relativeX = absoluteX / imageWidth;
const relativeY = absoluteY / imageHeight;

// 相対座標 → 絶対座標
const absoluteX = relativeX * canvasWidth;
const absoluteY = relativeY * canvasHeight;
```

### ハンドル判定の閾値

```typescript
const HANDLE_SIZE = 8; // px
const HANDLE_HIT_AREA = 12; // px (クリック判定領域)
```

### Canvas 描画の最適化

```typescript
// 毎フレーム全体を再描画せず、変更部分のみ更新
// ドラッグ中: requestAnimationFrameで描画
// 静止時: イベントドリブンで描画
```

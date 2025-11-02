# テンプレート管理機能 - Issue

## 基本情報

- **作成日**: 2024-11-02
- **担当者**: プロジェクトチーム
- **優先度**: High
- **種別**: Feature
- **Phase**: Phase 3

## 問題・要件概要

アンケート用紙のテンプレートを作成・管理する機能を実装する。空のアンケート用紙をカメラで撮影し、OCR 対象領域を指定・保存することで、後のデータ入力作業を効率化する。

## 詳細説明

### 現状

- Phase 1: プロジェクト基盤完了
- Phase 2: 共通コンポーネント（Layout, Button, useLocalStorage）完了
- テンプレート管理ページはプレースホルダーのみ
- カメラ機能、領域選択機能が未実装

### 要求事項

#### 1. Camera コンポーネント

**目的**: Chrome Book のカメラでアンケート用紙を撮影

**機能要件**:

- `navigator.mediaDevices.getUserMedia()` でカメラアクセス
- リアルタイムプレビュー表示
- 撮影ボタン（写真を撮る）
- 撮り直しボタン
- カメラの起動・停止制御

**非機能要件**:

- カメラアクセス権限のエラーハンドリング
- 解像度: 1920x1080 (appConfig.ts で設定済み)
- Chrome Book 最適化（背面カメラ優先）
- アクセシビリティ対応

**受け入れ条件**:

- [ ] カメラプレビューが表示される
- [ ] 撮影ボタンで画像をキャプチャできる
- [ ] 権限拒否時に適切なエラーメッセージを表示
- [ ] カメラストリームを適切にクリーンアップ

#### 2. useCamera カスタムフック

**目的**: カメラ制御ロジックの再利用

**機能要件**:

- カメラの起動・停止
- 撮影（Canvas API で画像キャプチャ）
- エラー状態管理
- ストリーム状態管理

**インターフェース**:

```typescript
interface UseCameraReturn {
  stream: MediaStream | null;
  isActive: boolean;
  capturedImage: string | null; // base64 data URL
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: (videoElement: HTMLVideoElement) => void;
  clearCapturedImage: () => void;
}
```

**非機能要件**:

- メモリリーク防止（適切なクリーンアップ）
- エラーハンドリング（NotAllowedError, NotFoundError など）

**受け入れ条件**:

- [ ] カメラの起動・停止が正常に動作
- [ ] 画像キャプチャが正常に動作
- [ ] エラーが適切にハンドリングされる
- [ ] コンポーネントアンマウント時にストリームが停止

#### 3. TemplateEditor コンポーネント

**目的**: テンプレート作成・編集の統合画面

**機能要件**:

- テンプレート名入力フィールド
- Camera コンポーネントの統合
- RegionSelector コンポーネントの統合
- 領域リスト表示（名前、順序、座標）
- テンプレート保存ボタン
- キャンセルボタン

**画面フロー**:

```
1. テンプレート名入力
2. カメラで空のアンケート用紙を撮影
3. 撮影画像上で領域選択（RegionSelector）
4. 各領域に名前を付与（例: "氏名", "Q1回答"）
5. 領域の順序を設定（抽出順序）
6. 保存ボタンでテンプレート保存
```

**非機能要件**:

- 入力バリデーション（validation.ts を活用）
- 保存時のフィードバック（Toast - Phase 2 で実装予定）
- レスポンシブ対応

**受け入れ条件**:

- [ ] テンプレート名が入力できる
- [ ] カメラで撮影できる
- [ ] 領域選択ができる
- [ ] 各領域に名前を付与できる
- [ ] 領域の順序を変更できる
- [ ] テンプレートが保存される

#### 4. RegionSelector コンポーネント

**目的**: Canvas 上で OCR 対象領域を選択

**機能要件**:

- Canvas API で画像表示
- マウスドラッグで矩形領域を作成
- タッチデバイス対応（Chrome Book）
- 領域のリサイズハンドル（8 方向）
- 領域の移動（ドラッグ）
- 領域の削除
- 領域の選択状態管理
- 領域情報の出力（座標、サイズ）

**技術詳細**:

```typescript
interface Region {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

interface RegionSelectorProps {
  imageDataUrl: string;
  regions: Region[];
  onRegionsChange: (regions: Region[]) => void;
  selectedRegionId: string | null;
  onRegionSelect: (id: string | null) => void;
}
```

**Canvas 描画要件**:

- ベース画像の表示
- 半透明の矩形オーバーレイ（rgba(0, 123, 255, 0.3)）
- 選択中の領域はハイライト（rgba(255, 193, 7, 0.5)）
- リサイズハンドル（小さな正方形、8 方向）
- 領域番号・名前のラベル表示

**非機能要件**:

- パフォーマンス最適化（requestAnimationFrame）
- 座標のバリデーション（validation.ts を活用）
- アンドゥ・リドゥ機能（オプション）

**受け入れ条件**:

- [ ] マウスドラッグで領域を作成できる
- [ ] タッチ操作で領域を作成できる
- [ ] 領域のリサイズができる
- [ ] 領域の移動ができる
- [ ] 領域の削除ができる
- [ ] 領域座標が正確に取得できる

#### 5. useTemplate カスタムフック

**目的**: テンプレートの永続化と CRUD 操作

**機能要件**:

- テンプレートの作成
- テンプレートの読み込み
- テンプレートの更新
- テンプレートの削除
- テンプレート一覧取得

**インターフェース**:

```typescript
interface UseTemplateReturn {
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
  createTemplate: (template: CreateTemplateRequest) => Promise<void>;
  updateTemplate: (
    id: string,
    template: UpdateTemplateRequest
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  loadTemplate: (id: string) => void;
  clearCurrentTemplate: () => void;
}
```

**データ保存**:

- useLocalStorage フックを活用
- キー: `paper-ocr-templates`
- 形式: `Template[]` (JSON 配列)

**非機能要件**:

- localStorage 容量チェック（5MB 制限）
- エラーハンドリング
- バリデーション（validation.ts を活用）

**受け入れ条件**:

- [ ] テンプレートの作成ができる
- [ ] テンプレートの読み込みができる
- [ ] テンプレートの更新ができる
- [ ] テンプレートの削除ができる
- [ ] localStorage 容量エラーをハンドリング

#### 6. TemplateList コンポーネント

**目的**: 保存済みテンプレートの一覧表示

**機能要件**:

- テンプレート一覧表示（カード形式）
- テンプレート選択（編集モード）
- テンプレート削除（確認ダイアログ）
- 新規テンプレート作成ボタン

**表示情報**:

- テンプレート名
- 作成日時
- 領域数
- サムネイル画像（オプション）

**非機能要件**:

- レスポンシブグリッドレイアウト
- 空状態の表示（テンプレートがない場合）

**受け入れ条件**:

- [ ] テンプレート一覧が表示される
- [ ] テンプレートを選択できる
- [ ] テンプレートを削除できる
- [ ] 新規作成ボタンで作成画面に遷移

#### 7. TemplateManagementPage の統合

**目的**: テンプレート管理機能の統合

**機能要件**:

- TemplateList と TemplateEditor の切り替え
- 状態管理（一覧 ⇄ 編集）
- Layout コンポーネントの適用

**画面遷移**:

```
TemplateManagementPage
├─ TemplateList (デフォルト)
│   ├─ 新規作成ボタン → TemplateEditor (新規)
│   └─ 編集ボタン → TemplateEditor (編集)
└─ TemplateEditor
    ├─ 保存 → TemplateList
    └─ キャンセル → TemplateList
```

**受け入れ条件**:

- [ ] 一覧と編集画面が切り替わる
- [ ] 新規作成・編集が正常に動作
- [ ] Layout が適用されている

### 受け入れ条件（全体）

- [ ] Camera コンポーネントが実装され、撮影できる
- [ ] RegionSelector コンポーネントが実装され、領域選択できる
- [ ] TemplateEditor コンポーネントが実装され、テンプレート作成できる
- [ ] TemplateList コンポーネントが実装され、一覧表示できる
- [ ] useCamera フックが実装され、カメラ制御できる
- [ ] useTemplate フックが実装され、CRUD 操作できる
- [ ] すべてのコンポーネントに `.spec.md` が存在する
- [ ] すべてのコンポーネントにテストが実装され、合格する
- [ ] TypeScript エラーがない
- [ ] Biome チェックエラーがない
- [ ] DEPENDENCY MAP が全ファイルに記載されている
- [ ] テンプレートが localStorage に正常に保存される
- [ ] Chrome Book で正常に動作する

## 影響範囲

### ユーザー

- テンプレート作成機能の提供
- データ入力作業の効率化（Phase 4 以降）

### システム

- 新規ファイル: 約 30 ファイル（コンポーネント、フック、テスト、仕様書）
- 修正ファイル: `TemplateManagementPage.tsx`
- localStorage 使用量増加（テンプレート保存）

### 他機能

- Phase 4（OCR 処理）で作成したテンプレートを使用
- Phase 5（データ入力）で作成したテンプレートを使用

## 技術的課題とリスク

### 課題 1: Canvas API のパフォーマンス

- **内容**: 大きな画像（1920x1080）の Canvas 描画パフォーマンス
- **対策**: requestAnimationFrame の活用、描画の最適化
- **リスク**: Medium

### 課題 2: カメラアクセス権限

- **内容**: ユーザーがカメラアクセスを拒否する可能性
- **対策**: 明確なガイダンス、代替手段（ファイルアップロード）の検討
- **リスク**: Low

### 課題 3: タッチ操作の精度

- **内容**: Chrome Book のタッチ操作での領域選択の精度
- **対策**: タッチターゲットのサイズ最適化、ジェスチャー認識
- **リスク**: Medium

### 課題 4: localStorage 容量制限

- **内容**: テンプレート画像の base64 エンコードで localStorage 容量超過
- **対策**: 画像圧縮、座標情報のみ保存（画像は再撮影）
- **リスク**: High → **対策必須**

## 関連ドキュメント

- Prompt: `docs/00_prompts/20241102_03_phase3-template-management.md`（次に作成）
- Plan: `docs/03_plans/template-management/20241102_01_implementation-plan.md`（次に作成）
- Overall Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
- Phase 1 Log: `docs/05_logs/2024_11/20241102/02_phase1-implementation-completed.md`
- Type Definitions: `src/types/template.ts`, `src/types/camera.ts`

## 解決状況

- [ ] 要件分析完了
- [ ] 技術調査完了（カメラ API、Canvas API）
- [ ] 実装計画完了
- [ ] 実装完了
- [ ] テスト完了
- [ ] レビュー完了

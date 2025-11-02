# Phase 3: 今後の実装計画（2024-11-03 以降）

## 計画概要

- **計画日**: 2024-11-02
- **対象期間**: 2024-11-03 〜 2024-11-05（3 日間）
- **目的**: テンプレート管理機能の完成に向けた残りコンポーネントの実装

## 現在の進捗状況

### ✅ 完了済み（2024-11-02 時点）

- **Phase 3-1**: Camera Component - 完全実装、32 テスト合格
- **Phase 3-2a**: useTemplate Hook - 完全実装、16 テスト合格
- **Phase 3-2b**: TemplateList Component - 完全実装、10 テスト合格

### 🎯 次の実装対象

- **Phase 3-3**: RegionSelector Component - 画像上での OCR 領域選択機能
- **Phase 3-4**: TemplateEditor Component - テンプレート作成・編集統合画面
- **Phase 3-5**: TemplateManagementPage 統合 - 全機能を統合したページ

---

## Phase 3-3: RegionSelector Component 実装計画

### 目標

画像上で OCR 対象領域をドラッグ選択し、名前付け・順序管理できるコンポーネント

### 完了予定

2024-11-03（1 日）

### 実装段階

#### Stage 1: 仕様書作成（予定: 1.5 時間）

**タスク**:

- [ ] RegionSelector.spec.md 作成
- [ ] 機能要件定義（領域選択、リサイズ、削除、名前付け、順序変更）
- [ ] 非機能要件定義（レスポンシブ対応、マウス/タッチ操作）
- [ ] インターフェース定義（Props, Region 型）
- [ ] テストケース定義（20+ケース）

**成果物**:

- `src/components/TemplateManagement/RegionSelector.spec.md`

#### Stage 2: コンポーネント実装（予定: 4 時間）

**タスク**:

- [ ] Canvas 上の画像表示
- [ ] マウスドラッグによる矩形領域選択
- [ ] リサイズハンドル実装（8 方向）
- [ ] 選択中領域のハイライト表示
- [ ] 領域一覧サイドパネル表示
- [ ] 領域名入力機能
- [ ] 領域の削除機能
- [ ] ドラッグ&ドロップによる順序変更
- [ ] 座標正規化（画像サイズに対する相対座標）

**成果物**:

- `src/components/TemplateManagement/RegionSelector.tsx`

**技術設計**:

```typescript
interface RegionSelectorProps {
  imageData: string; // Base64画像データ
  regions: Region[]; // 既存領域（編集時）
  onRegionsChange: (regions: Region[]) => void; // 領域変更コールバック
  maxRegions?: number; // 最大領域数（デフォルト: 20）
}

interface Region {
  id: string;
  name: string;
  x: number; // 0-1の相対座標
  y: number; // 0-1の相対座標
  width: number; // 0-1の相対サイズ
  height: number; // 0-1の相対サイズ
  order: number; // 抽出順序
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface ResizeState {
  isResizing: boolean;
  targetRegionId: string | null;
  resizeHandle: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | null;
}
```

**UI レイアウト**:

```
┌─────────────────────────────────────────────────┐
│ RegionSelector                                  │
├────────────────────────────┬────────────────────┤
│                            │ 領域リスト          │
│   Canvas領域               │ ┌────────────────┐│
│   (画像+選択矩形表示)       │ │ 1. 氏名 [削除] ││
│                            │ │ 2. Q1  [削除]  ││
│   ┌──────────┐             │ │ 3. Q2  [削除]  ││
│   │ 選択中   │             │ └────────────────┘│
│   │ の領域   │             │                    │
│   └──────────┘             │ [新規領域を選択]   │
│                            │                    │
│                            │ 領域名:            │
│                            │ [_____________]    │
│                            │                    │
│                            │ [順序を上へ] ↑     │
│                            │ [順序を下へ] ↓     │
└────────────────────────────┴────────────────────┘
```

#### Stage 3: テスト実装（予定: 2.5 時間）

**タスク**:

- [ ] 領域選択動作テスト
- [ ] リサイズ動作テスト
- [ ] 領域削除テスト
- [ ] 名前変更テスト
- [ ] 順序変更テスト
- [ ] 座標正規化テスト
- [ ] エッジケーステスト（領域外ドラッグ、重複領域など）

**成果物**:

- `src/components/TemplateManagement/RegionSelector.test.tsx`

**目標**: 20+テスト、全て合格

#### Stage 4: ドキュメント更新（予定: 0.5 時間）

**タスク**:

- [ ] 実装計画書の進捗更新
- [ ] 作業ログ記録
- [ ] DEPENDENCY MAP 更新

---

## Phase 3-4: TemplateEditor Component 実装計画

### 目標

カメラ撮影から OCR 領域選択、テンプレート保存までを統合した画面コンポーネント

### 完了予定

2024-11-04（1 日）

### 実装段階

#### Stage 1: 仕様書作成（予定: 1.5 時間）

**タスク**:

- [ ] TemplateEditor.spec.md 作成
- [ ] ステップフロー定義（撮影 → 領域選択 → 確認 → 保存）
- [ ] 各ステップの機能要件定義
- [ ] バリデーション要件定義
- [ ] インターフェース定義（Props, State）
- [ ] テストケース定義（25+ケース）

**成果物**:

- `src/components/TemplateManagement/TemplateEditor.spec.md`

#### Stage 2: コンポーネント実装（予定: 4 時間）

**タスク**:

- [ ] ステップ管理ロジック実装
- [ ] Step 1: カメラ撮影画面（Camera 統合）
- [ ] Step 2: 領域選択画面（RegionSelector 統合）
- [ ] Step 3: 確認・保存画面
- [ ] テンプレート名入力フォーム
- [ ] バリデーション実装（必須項目、重複チェック）
- [ ] 編集モード対応（既存テンプレート読み込み）
- [ ] useTemplate 統合（保存・更新処理）
- [ ] ナビゲーションボタン（戻る、次へ、保存、キャンセル）

**成果物**:

- `src/components/TemplateManagement/TemplateEditor.tsx`

**技術設計**:

```typescript
interface TemplateEditorProps {
  templateId?: string; // 編集時のテンプレートID
  onSave?: (template: Template) => void; // 保存完了コールバック
  onCancel?: () => void; // キャンセルコールバック
}

interface EditorState {
  currentStep: 1 | 2 | 3;
  templateName: string;
  baseImageData: string | null;
  regions: Region[];
  validationErrors: ValidationError[];
  isSaving: boolean;
}

type EditorStep =
  | { step: 1; title: "ベース画像撮影" }
  | { step: 2; title: "OCR領域選択" }
  | { step: 3; title: "確認・保存" };
```

**ステップフロー**:

```
Step 1: ベース画像撮影
┌─────────────────────────┐
│ テンプレート名:         │
│ [_______________]       │
│                         │
│ [Camera Component]      │
│                         │
│ [キャンセル] [次へ →]   │
└─────────────────────────┘

Step 2: OCR領域選択
┌─────────────────────────┐
│ [RegionSelector]        │
│                         │
│ [← 戻る] [次へ →]       │
└─────────────────────────┘

Step 3: 確認・保存
┌─────────────────────────┐
│ テンプレート名: XXXX    │
│ 領域数: 5               │
│                         │
│ [サムネイル表示]        │
│                         │
│ 領域一覧:               │
│ 1. 氏名                 │
│ 2. Q1                   │
│ ...                     │
│                         │
│ [← 戻る] [保存]         │
└─────────────────────────┘
```

#### Stage 3: テスト実装（予定: 2.5 時間）

**タスク**:

- [ ] ステップ遷移テスト
- [ ] 各ステップの動作テスト
- [ ] バリデーションテスト
- [ ] 保存処理テスト（新規作成、編集）
- [ ] キャンセル処理テスト
- [ ] 統合テスト（全ステップ通過）

**成果物**:

- `src/components/TemplateManagement/TemplateEditor.test.tsx`

**目標**: 25+テスト、全て合格

#### Stage 4: ドキュメント更新（予定: 0.5 時間）

---

## Phase 3-5: TemplateManagementPage 統合計画

### 目標

テンプレート一覧と作成・編集機能を統合した完全なページコンポーネント

### 完了予定

2024-11-05（0.5 日）

### 実装段階

#### Stage 1: ページ統合実装（予定: 3 時間）

**タスク**:

- [ ] TemplateManagementPage.tsx 実装
- [ ] TemplateList と TemplateEditor の切り替え
- [ ] ルーティング対応（一覧、新規作成、編集）
- [ ] 状態管理（選択中テンプレート）
- [ ] ページレイアウト実装

**成果物**:

- `src/pages/TemplateManagementPage.tsx`（完全版）

**技術設計**:

```typescript
interface PageState {
  mode: 'list' | 'create' | 'edit';
  selectedTemplateId: string | null;
}

// URL構造
/template              → 一覧表示
/template/new          → 新規作成
/template/:id/edit     → 編集
```

#### Stage 2: 統合テスト（予定: 1.5 時間）

**タスク**:

- [ ] ページ全体の統合テスト
- [ ] 一覧 → 作成 → 一覧のフロー確認
- [ ] 一覧 → 編集 → 一覧のフロー確認
- [ ] ナビゲーション動作確認

**成果物**:

- 統合テスト結果ログ

#### Stage 3: ドキュメント完成（予定: 0.5 時間）

**タスク**:

- [ ] Phase 3 完了報告書作成
- [ ] 全体実装計画の進捗更新
- [ ] Issue クローズ

---

## 実装スケジュール

### 2024-11-03（Day 1）

| 時間帯      | タスク                       | 成果物         |
| ----------- | ---------------------------- | -------------- |
| 09:00-10:30 | RegionSelector.spec.md 作成  | 仕様書         |
| 10:30-14:30 | RegionSelector.tsx 実装      | コンポーネント |
| 14:30-17:00 | RegionSelector.test.tsx 作成 | テスト         |
| 17:00-17:30 | ドキュメント更新             | ログ           |

### 2024-11-04（Day 2）

| 時間帯      | タスク                       | 成果物         |
| ----------- | ---------------------------- | -------------- |
| 09:00-10:30 | TemplateEditor.spec.md 作成  | 仕様書         |
| 10:30-14:30 | TemplateEditor.tsx 実装      | コンポーネント |
| 14:30-17:00 | TemplateEditor.test.tsx 作成 | テスト         |
| 17:00-17:30 | ドキュメント更新             | ログ           |

### 2024-11-05（Day 3）

| 時間帯      | タスク                      | 成果物       |
| ----------- | --------------------------- | ------------ |
| 09:00-12:00 | TemplateManagementPage 統合 | ページ完成   |
| 13:00-14:30 | 統合テスト実施              | テスト結果   |
| 14:30-15:00 | Phase 3 完了報告書          | ドキュメント |

---

## 技術的な考慮事項

### RegionSelector 実装の注意点

1. **Canvas 座標と React 座標の変換**

   - Canvas API: 絶対座標（px）
   - 保存データ: 相対座標（0-1 の範囲）
   - レスポンシブ対応のため、必ず相対座標で保存

2. **マウスイベントとタッチイベントの統一**

   - `onMouseDown` + `onTouchStart` の両対応
   - `e.preventDefault()` でデフォルト動作抑制

3. **パフォーマンス最適化**
   - Canvas 再描画の最小化（useCallback, useMemo 活用）
   - ドラッグ中のスムーズな描画（requestAnimationFrame）

### TemplateEditor 実装の注意点

1. **ステップ間のデータ保持**

   - useState でステップ間データ管理
   - 各ステップでのバリデーション実装

2. **編集モードの対応**

   - useEffect で templateId 変更を監視
   - 既存データの読み込みと初期化

3. **エラーハンドリング**
   - 保存失敗時のエラーメッセージ表示
   - ユーザーフレンドリーなバリデーションメッセージ

---

## リスクと対策

### リスク 1: Canvas 操作の複雑性

- **影響**: RegionSelector 実装が予定より遅延
- **対策**:
  - Canvas 専用のユーティリティ関数を先に作成
  - 既存のライブラリ（react-konva 等）の調査・活用検討
  - 最悪の場合、リサイズハンドルを簡易版に変更

### リスク 2: ステップ管理の複雑化

- **影響**: TemplateEditor のバグ増加
- **対策**:
  - 各ステップを独立したコンポーネントに分離
  - ステップ管理ロジックを Custom Hook に切り出し
  - 単体テストで各ステップを個別に検証

### リスク 3: 統合時の不具合

- **影響**: 最終統合で動作不良発覚
- **対策**:
  - 各コンポーネント完成時に単体で動作確認
  - 統合前に Mock データでの動作確認
  - 統合テストケースを事前準備

---

## 成功基準

### Phase 3 完了の定義（Definition of Done）

- [ ] RegionSelector: 20+テスト合格、単体動作確認完了
- [ ] TemplateEditor: 25+テスト合格、単体動作確認完了
- [ ] TemplateManagementPage: 統合動作確認完了
- [ ] 全コンポーネントの Spec.md 作成完了
- [ ] 作業ログ記録完了
- [ ] Issue 状態更新完了

### 品質基準

- TypeScript エラー: 0 件
- テスト合格率: 100%
- コードレビュー: 完了（AI + Developer）
- ドキュメント: 最新状態に更新

---

## 次のアクション（2024-11-03 朝の作業）

### 最優先タスク

1. **RegionSelector.spec.md の作成**

   - 機能要件の詳細化
   - Canvas 操作のインターフェース設計
   - テストケースの網羅的定義

2. **Canvas 操作ユーティリティの設計**
   - 座標変換関数
   - 矩形描画関数
   - 衝突判定関数

### 準備作業

- RegionSelector の UI モックアップ確認
- Canvas API リファレンスの確認
- react-konva 等のライブラリ調査（必要に応じて）

---

## 参照ドキュメント

### 完了済みドキュメント

- Camera Component: `src/components/Camera/Camera.spec.md`
- useTemplate Hook: `src/hooks/useTemplate.spec.md`
- TemplateList: `src/components/TemplateManagement/TemplateList.spec.md`

### 全体計画

- Overall Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
- Phase 3 Plan: `docs/03_plans/template-management/20241102_01_phase3-overall-plan.md`

### Issue

- Template Management: `docs/01_issues/open/2024_11/20241102_03_template-management.md`

---

**計画書作成日**: 2024-11-02  
**次回レビュー**: 2024-11-03（RegionSelector 完成時）  
**最終完了予定**: 2024-11-05

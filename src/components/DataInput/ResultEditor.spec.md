# ResultEditor.spec.md

## Related Files

- Implementation: `src/components/DataInput/ResultEditor.tsx`
- Tests: `src/components/DataInput/ResultEditor.test.tsx`
- Styles: Tailwind CSS (inline)

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/` (phase4-3 related)
- Plan: `docs/03_plans/phase4-3-result-editor-implementation-plan.md`

---

## Overview

ResultEditor コンポーネントは、OCR 処理結果の表示・編集・確認機能を提供します。

ユーザーが以下の操作を実行できます：

- テキスト内容の確認・編集
- 元のテキストとの比較表示
- 領域ごとの信頼度スコア確認
- 信頼度別のビジュアルインジケーター表示
- 個別領域のリセット・削除
- 全体のリセット
- 複数フォーマット（テキスト/CSV/JSON）でのプレビュー・出力
- 統計情報（編集済み件数、平均信頼度、合計文字数）の表示

---

## Requirements

### Functional Requirements

#### FR-001: 結果表示

- 抽出されたテキストを読み取り専用表示できる
- 領域名、信頼度スコア、処理時間を表示できる
- 結果がない場合はメッセージを表示できる

#### FR-002: テキスト編集

- Textarea で直接テキストを編集できる
- 編集内容がリアルタイムで反映される
- 編集フラグ（`isEdited`）で修正状況を追跡できる
- 元のテキストと比較できる（編集時に表示）

#### FR-003: 信頼度表示

- 信頼度スコアを パーセンテージで表示できる
- 信頼度に応じてカラーコード（🟢 / 🟡 / 🔴）で表示できる
  - 85% 以上: 🟢 (green)
  - 70-84%: 🟡 (yellow)
  - 70% 未満: 🔴 (red)

#### FR-004: 操作機能

- **個別リセット**: 編集内容を元のテキストに戻せる
- **個別削除**: 不要な領域を削除できる
- **全体リセット**: すべての編集を一括で戻せる
- **プレビュー**: 出力形式を確認できる
- **保存**: 編集結果を保存できる
- **キャンセル**: 編集を中止できる

#### FR-005: フォーマット選択

- 出力形式を選択できる：
  - テキスト形式：`領域名: テキスト` （1 行あたり 1 領域）
  - CSV 形式：`Region Name,Text,Confidence`
  - JSON 形式：`[{name, text, confidence}]`

#### FR-006: 統計表示

- 編集済み件数 / 全体件数
- 平均信頼度スコア
- 合計文字数

#### FR-007: 読み取り専用モード

- `readOnly` prop で読み取り専用モードに切り替えられる
- 読み取り専用時は編集・削除ボタンが表示されない
- 読み取り専用時は Textarea が無効化される

### Non-Functional Requirements

#### NFR-001: パフォーマンス

- 100 領域以上の場合でも 1 秒以内に描画できる
- テキスト編集時のレスポンスが 50ms 以内

#### NFR-002: アクセシビリティ

- キーボード操作ですべての機能にアクセスできる
- スクリーンリーダーで読み取り可能な構造
- コントラスト比 4.5:1 以上

#### NFR-003: レスポンシブデザイン

- Mobile (sm): フルスクリーン表示
- Tablet (md): フッターボタンをスタックレイアウト
- Desktop (lg): 2 列レイアウト対応

---

## Interface Definition

### Props

```typescript
interface ResultEditorProps {
  /** OCR processing results array */
  results: OCRRegionResult[];

  /** Callback when results are saved */
  onSave: (editedResults: OCRRegionResult[]) => void;

  /** Callback when editing is cancelled */
  onCancel: () => void;

  /** Enable/disable editing (read-only mode) */
  readOnly?: boolean;

  /** Custom CSS classes */
  className?: string;
}
```

### Internal Types

```typescript
// Editable result with metadata
interface EditableResult extends OCRRegionResult {
  /** Whether this result has been edited */
  isEdited: boolean;

  /** Original text before editing */
  originalText: string;
}

// Statistics
interface ResultEditorStatistics {
  editedCount: number;
  totalCount: number;
  averageConfidence: number;
  totalCharacters: number;
}

// Output format
type OutputFormat = "text" | "csv" | "json";
```

### Callbacks

```typescript
// onSave
function onSave(editedResults: OCRRegionResult[]): void {
  // 編集されたOCR結果を保存
  // 返される結果は isEdited, originalText を含まない
}

// onCancel
function onCancel(): void {
  // ユーザーが編集をキャンセル
  // 変更内容は破棄される
}
```

---

## Behavior Specification

### Normal Cases

#### NC-001: コンポーネント初期化

- **条件**: ResultEditor に results, template を渡して描画
- **期待結果**:
  - ヘッダー「ステップ 3: 結果確認・編集」が表示される
  - すべての結果項目が表示される
  - フッターに統計情報が表示される

#### NC-002: テキスト編集

- **条件**: 結果アイテムの Textarea でテキストを変更
- **期待結果**:
  - テキストがリアルタイムで更新される
  - 「編集済み」バッジが表示される
  - 元のテキストが比較エリアに表示される
  - 統計情報の「編集済み件数」が増加する

#### NC-003: 個別リセット

- **条件**: 編集済み項目の「リセット」ボタンをクリック
- **期待結果**:
  - テキストが元の値に戻される
  - 「編集済み」バッジが消える
  - 統計情報が更新される

#### NC-004: 全体リセット

- **条件**: フッターの「全てリセット」ボタンをクリック
- **期待結果**:
  - すべての編集内容が元に戻される
  - すべての「編集済み」バッジが消える
  - 統計情報の「編集済み件数」が 0 になる

#### NC-005: 保存

- **条件**: フッターの「保存」ボタンをクリック
- **期待結果**:
  - `onSave(editedResults)` コールバックが呼ばれる
  - 返される結果から `isEdited`, `originalText` が削除される
  - 親コンポーネントで結果が処理される

#### NC-006: キャンセル

- **条件**: フッターの「キャンセル」ボタンをクリック
- **期待結果**:
  - `onCancel()` コールバックが呼ばれる
  - コンポーネントが閉じられる

#### NC-007: フォーマット変更

- **条件**: ヘッダーの形式選択ドロップダウンで形式を変更
- **期待結果**:
  - 選択された形式が変更される
  - プレビュー表示時に形式が反映される

#### NC-008: プレビュー表示

- **条件**: フッターの「プレビュー」ボタンをクリック
- **期待結果**:
  - プレビューエリアが表示される
  - 選択されたフォーマットで結果が表示される
  - 再クリック時にプレビューが隠される

### Edge Cases

#### EC-001: 空の結果配列

- **条件**: `results` が空配列で描画
- **期待結果**:
  - 「結果がありません」メッセージが表示される
  - 統計情報は表示されない

#### EC-002: 信頼度 100%

- **条件**: 信頼度が 100% の結果
- **期待結果**:
  - 🟢 (green) インジケーターが表示される

#### EC-003: 信頼度 0%

- **条件**: 信頼度が 0% の結果
- **期待結果**:
  - 🔴 (red) インジケーターが表示される

#### EC-004: 極長テキスト

- **条件**: 1000 文字以上のテキスト
- **期待結果**:
  - Textarea にスクロールバーが表示される
  - テキストが正常に表示・編集できる

#### EC-005: 特殊文字を含むテキスト

- **条件**: 改行、タブ、特殊記号を含むテキスト
- **期待結果**:
  - テキストが正常に表示・編集できる
  - CSV/JSON 出力時も正常にエスケープされる

### Error Cases

#### ER-001: テンプレート情報がない

- **条件**: `template` が undefined
- **期待結果**:
  - コンポーネントは エラーなく描画される
  - 結果のみ表示される

#### ER-002: 無効な OnSave コールバック

- **条件**: `onSave` で例外が発生
- **期待結果**:
  - エラーがコンソールに記録される
  - ユーザーに通知される（親で処理）

#### ER-003: 読み取り専用モードでの操作

- **条件**: `readOnly={true}` 時に編集ボタンをクリック
- **期待結果**:
  - 何も起こらない（ボタンが無効）
  - Textarea が無効化されている

---

## Test Cases

### TC-001: 初期化・描画

#### TC-001-001: コンポーネント描画

- **Given**: 有効な results と template
- **When**: コンポーネントを描画
- **Then**: すべての UI 要素が表示される

#### TC-001-002: 結果アイテム表示

- **Given**: 3 つの結果
- **When**: コンポーネントを描画
- **Then**: 3 つの結果アイテムが表示される

#### TC-001-003: 統計情報表示

- **Given**: 編集されていない結果
- **When**: コンポーネントを描画
- **Then**: 統計情報が正しく表示される
  - 編集済み: 0 / 3
  - 平均信頼度: (各スコアの平均)
  - 合計文字数: (各テキストの文字数合計)

### TC-002: テキスト編集

#### TC-002-001: テキスト変更

- **Given**: テキストエリアが表示されている
- **When**: テキストを編集
- **Then**: 編集内容がリアルタイムで反映される

#### TC-002-002: 編集フラグ更新

- **Given**: テキストを編集
- **When**: 編集完了
- **Then**: 「編集済み」バッジが表示される

#### TC-002-003: 元のテキスト比較

- **Given**: テキストを編集
- **When**: 比較エリアを確認
- **Then**: 元のテキストが表示される

#### TC-002-004: 統計情報更新

- **Given**: 1 つの結果を編集
- **When**: 編集完了
- **Then**: 統計情報が更新される
  - 編集済み: 1 / 3

### TC-003: リセット機能

#### TC-003-001: 個別リセット

- **Given**: 編集済みの結果アイテム
- **When**: 「リセット」ボタンをクリック
- **Then**:
  - テキストが元に戻る
  - 「編集済み」バッジが消える

#### TC-003-002: 全体リセット

- **Given**: 複数の結果を編集
- **When**: 「全てリセット」ボタンをクリック
- **Then**:
  - すべてのテキストが元に戻る
  - すべてのバッジが消える
  - 統計情報がリセットされる

### TC-004: 削除機能

#### TC-004-001: 個別削除

- **Given**: 結果アイテムが表示されている
- **When**: 「削除」ボタンをクリック
- **Then**:
  - 該当アイテムが削除される
  - 統計情報が更新される

#### TC-004-002: 複数削除

- **Given**: 複数アイテムを削除
- **When**: すべてのアイテムを削除
- **Then**: 「結果がありません」メッセージが表示される

### TC-005: 保存・キャンセル

#### TC-005-001: 保存処理

- **Given**: テキストを編集
- **When**: 「保存」ボタンをクリック
- **Then**:
  - `onSave()` が呼ばれる
  - `isEdited`, `originalText` が含まれない結果が渡される

#### TC-005-002: キャンセル処理

- **Given**: テキストを編集
- **When**: 「キャンセル」ボタンをクリック
- **Then**: `onCancel()` が呼ばれる

### TC-006: フォーマット・プレビュー

#### TC-006-001: フォーマット選択

- **Given**: ドロップダウンが表示されている
- **When**: 別の形式を選択
- **Then**: 選択された形式が変更される

#### TC-006-002: テキスト形式プレビュー

- **Given**: 形式を「テキスト」で選択、プレビューを表示
- **When**: プレビューエリアを確認
- **Then**: `領域名: テキスト` 形式で表示される

#### TC-006-003: CSV 形式プレビュー

- **Given**: 形式を「CSV」で選択、プレビューを表示
- **When**: プレビューエリアを確認
- **Then**: CSV ヘッダーと行が表示される

#### TC-006-004: JSON 形式プレビュー

- **Given**: 形式を「JSON」で選択、プレビューを表示
- **When**: プレビューエリアを確認
- **Then**: JSON 形式で表示される

### TC-007: 信頼度表示

#### TC-007-001: 高信頼度インジケーター

- **Given**: 信頼度 85% 以上の結果
- **When**: 結果アイテムを表示
- **Then**: 🟢 インジケーターが表示される

#### TC-007-002: 中信頼度インジケーター

- **Given**: 信頼度 70-84% の結果
- **When**: 結果アイテムを表示
- **Then**: 🟡 インジケーターが表示される

#### TC-007-003: 低信頼度インジケーター

- **Given**: 信頼度 70% 未満の結果
- **When**: 結果アイテムを表示
- **Then**: 🔴 インジケーターが表示される

### TC-008: 読み取り専用モード

#### TC-008-001: 編集ボタン非表示

- **Given**: `readOnly={true}` で描画
- **When**: UI を確認
- **Then**: 編集・削除ボタンが表示されない

#### TC-008-002: Textarea 無効

- **Given**: `readOnly={true}` で描画
- **When**: Textarea を確認
- **Then**: disabled 属性が付与されている

### TC-009: レスポンシブデザイン

#### TC-009-001: Mobile 表示

- **Given**: 画面幅 320px
- **When**: コンポーネントを表示
- **Then**: フルスクリーン表示される

#### TC-009-002: Tablet 表示

- **Given**: 画面幅 768px
- **When**: コンポーネントを表示
- **Then**: フッターボタンがスタックレイアウト

#### TC-009-003: Desktop 表示

- **Given**: 画面幅 1024px
- **When**: コンポーネントを表示
- **Then**: フッターボタンが横並び表示

---

## Acceptance Criteria

- [ ] すべてのテストケースが合格する
- [ ] Lint エラーが 0
- [ ] TypeScript 型チェックが 0 エラー
- [ ] 仕様書と実装が一致している
- [ ] DEPENDENCY MAP が記載されている
- [ ] アクセシビリティ基準を満たしている
- [ ] レスポンシブデザインが確認されている
- [ ] パフォーマンステストが合格（100+ 領域で 1 秒以内）

---

## Implementation Notes

### Component Structure

```
ResultEditor
├─ Header
│  └─ Format Selector
├─ Results Container
│  └─ Result Item (×N)
│     ├─ Header (Region Name, Confidence, Edit Indicator)
│     ├─ Original Text (conditional)
│     ├─ Textarea (editable)
│     └─ Actions (Reset, Delete)
├─ Preview (conditional)
├─ Statistics
└─ Footer
   ├─ Left: Reset All
   └─ Right: Cancel, Preview, Save
```

### State Management

```typescript
editableResults: EditableResult[]
selectedFormat: 'text' | 'csv' | 'json'
showPreview: boolean
```

### Key Functions

- `handleTextChange()`: テキスト編集時
- `handleReset()`: 個別リセット
- `handleDelete()`: 領域削除
- `handleResetAll()`: 全体リセット
- `handleSave()`: 保存処理
- `handleCancel()`: キャンセル処理
- `handlePreview()`: プレビュー表示切り替え

### Styling Approach

- Tailwind CSS（inline）でスタイリング
- 既存の Button コンポーネントを再利用
- カラースキーム統一（slate, blue, green, yellow, red）

---

**最終更新**: 2025-11-04  
**ステータス**: 仕様書作成完了  
**次のステップ**: テスト実装

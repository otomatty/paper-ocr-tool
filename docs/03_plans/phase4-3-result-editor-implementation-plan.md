# Phase 4-3: ResultEditor 実装計画

## 計画概要

- **計画日**: 2025-11-04
- **担当者**: Development Team
- **完了予定**: 2025-11-11（1 週間）
- **依存関係**: Phase 4-2 完成（完了済み）

---

## フェーズ概要

### 目的

OCR 処理結果の詳細編集・確認機能を実装し、ユーザーが抽出されたテキストを簡単に修正・確認できるコンポーネントを提供する。

### 成果物

- **ResultEditor コンポーネント** (`src/components/DataInput/ResultEditor.tsx`)
- **仕様書** (`src/components/DataInput/ResultEditor.spec.md`)
- **テストファイル** (`src/components/DataInput/ResultEditor.test.tsx`)
- **更新ファイル**: DataInputPage.tsx に ResultEditor を統合

### 完了条件（DoD）

- [ ] ResultEditor コンポーネント実装（全機能）
- [ ] 仕様書作成（詳細設計ドキュメント）
- [ ] テスト実装・全合格（20+ テストケース）
- [ ] DEPENDENCY MAP 記載
- [ ] コード品質基準クリア（Lint 0、Type Safe）
- [ ] 作業ログ記録

---

## 実装段階

### Phase 4-3-1: コンポーネント設計（1 日）

#### タスク 1-1: インターフェース設計

**目標**: ResultEditor のデータ構造を定義

**内容**:

```typescript
// Props インターフェース
interface ResultEditorProps {
  /** OCR 処理結果の配列 */
  results: OCRRegionResult[];

  /** テンプレート情報 */
  template: Template;

  /** 結果保存時のコールバック */
  onSave: (editedResults: OCRRegionResult[]) => void;

  /** キャンセル時のコールバック */
  onCancel: () => void;

  /** 読み取り専用モード（オプション） */
  readOnly?: boolean;

  /** カスタムスタイルクラス */
  className?: string;
}

// 内部状態型
interface EditableResult extends OCRRegionResult {
  isEdited: boolean;
  originalText: string;
}
```

**チェックリスト**:

- [ ] Props インターフェース定義
- [ ] 内部状態型定義
- [ ] イベントハンドラー型定義
- [ ] Spec.md 相当ドキュメント作成

#### タスク 1-2: UI/UX 設計

**目標**: UI フロー・レイアウト設計

**UI コンポーネント構成**:

```
┌─ ResultEditor
│
├─ Header
│  ├─ Title: "ステップ 3: 結果確認・編集"
│  └─ Action Bar (上部右)
│     ├─ [全選択] [全解除]
│     └─ [出力形式切り替え]
│
├─ Result Items Container
│  │
│  └─ ResultItem (×N)
│     ├─ Header
│     │  ├─ Region Name (読み取り専用)
│     │  ├─ Confidence Badge
│     │  └─ Status Indicator (編集済み / 信頼度低 など)
│     │
│     ├─ Content
│     │  ├─ Original Text (薄灰色、比較用)
│     │  └─ Editable Textarea
│     │
│     └─ Footer
│        ├─ Processing Time
│        └─ Action Buttons
│           ├─ [リセット]
│           └─ [削除]
│
└─ Footer
   ├─ Statistics
   │  ├─ 編集数 / 全体
   │  ├─ 平均信頼度
   │  └─ 合計文字数
   │
   └─ Action Buttons
      ├─ [キャンセル] (Secondary)
      ├─ [プレビュー] (Secondary)
      └─ [保存] (Primary)
```

**レスポンシブ対応**:

- Desktop (lg): 全機能表示
- Tablet (md): フッターボタンをスタックレイアウト
- Mobile (sm): フルスクリーン表示

**チェックリスト**:

- [ ] UI フローダイアグラム作成
- [ ] レイアウト設計完了
- [ ] レスポンシブブレークポイント定義
- [ ] Figma/設計ドキュメント作成

#### タスク 1-3: 機能要件定義

**目標**: 詳細な機能要件を定義

**コア機能**:

1. **テキスト編集**

   - Textarea による直接編集
   - リアルタイム保存検知
   - 元のテキストとの比較表示

2. **領域順序管理**

   - ドラッグ&ドロップで順序変更
   - キーボード操作対応（↑↓ キー）
   - 順序変更時の即座な UI 更新

3. **信頼度表示**

   - カラーコード表示（高: 🟢 / 中: 🟡 / 低: 🔴）
   - 信頼度による自動ハイライト

4. **出力フォーマット選択**

   - CSV 形式
   - JSON 形式
   - プレーンテキスト形式
   - カスタム区切り文字

5. **操作機能**
   - 全選択 / 全解除（テキスト選択）
   - 個別リセット（元のテキストに戻す）
   - 個別削除（領域から削除）
   - プレビュー（出力形式確認）

**チェックリスト**:

- [ ] 各機能の詳細仕様作成
- [ ] ユーザーシナリオ定義
- [ ] 例外・エラーケース定義

---

### Phase 4-3-2: 実装（3 日）

#### タスク 2-1: 基本コンポーネント実装（1 日）

**目標**: 基本的な UI 構造と状態管理の実装

**実装内容**:

```typescript
export const ResultEditor: React.FC<ResultEditorProps> = ({
  results,
  template,
  onSave,
  onCancel,
  readOnly = false,
  className,
}) => {
  // 状態管理
  const [editableResults, setEditableResults] = useState<EditableResult[]>([
    ...results.map((r) => ({
      ...r,
      isEdited: false,
      originalText: r.text,
    })),
  ]);

  const [selectedFormat, setSelectedFormat] = useState<"text" | "csv" | "json">(
    "text"
  );
  const [showPreview, setShowPreview] = useState(false);

  // ハンドラー
  const handleTextChange = (regionId: string, newText: string) => {
    setEditableResults((prev) =>
      prev.map((r) =>
        r.regionId === regionId ? { ...r, text: newText, isEdited: true } : r
      )
    );
  };

  const handleReset = (regionId: string) => {
    setEditableResults((prev) =>
      prev.map((r) =>
        r.regionId === regionId
          ? { ...r, text: r.originalText, isEdited: false }
          : r
      )
    );
  };

  const handleSave = () => {
    const resultsToSave = editableResults.map(
      (r) =>
        ({
          ...r,
          isEdited: undefined,
          originalText: undefined,
        } as OCRRegionResult)
    );
    onSave(resultsToSave);
  };

  // 返却内容
  return (
    <div className={classNames("result-editor", className)}>
      {/* Header */}
      <ResultEditorHeader onFormatChange={setSelectedFormat} />

      {/* Result Items */}
      <ResultItemsContainer
        results={editableResults}
        readOnly={readOnly}
        onTextChange={handleTextChange}
        onReset={handleReset}
      />

      {/* Footer */}
      <ResultEditorFooter
        onCancel={onCancel}
        onPreview={() => setShowPreview(!showPreview)}
        onSave={handleSave}
        statistics={{
          editedCount: editableResults.filter((r) => r.isEdited).length,
          totalCount: editableResults.length,
          averageConfidence:
            editableResults.reduce((sum, r) => sum + r.confidence, 0) /
            editableResults.length,
        }}
      />

      {/* Preview (conditionally rendered) */}
      {showPreview && (
        <ResultPreview results={editableResults} format={selectedFormat} />
      )}
    </div>
  );
};
```

**ファイル構成**:

- `ResultEditor.tsx` - メインコンポーネント
- `components/ResultEditorHeader.tsx` - ヘッダーコンポーネント
- `components/ResultItem.tsx` - 個別結果アイテム
- `components/ResultItemsContainer.tsx` - 結果一覧コンテナ
- `components/ResultEditorFooter.tsx` - フッターコンポーネント
- `components/ResultPreview.tsx` - プレビューコンポーネント
- `utils/formatters.ts` - フォーマット変換ユーティリティ

**チェックリスト**:

- [ ] メインコンポーネント実装
- [ ] 子コンポーネント実装
- [ ] 状態管理実装
- [ ] 基本的なスタイル適用

#### タスク 2-2: 高度な機能実装（1.5 日）

**目標**: ドラッグ&ドロップ、フォーマット変換などの高度な機能を実装

**実装内容**:

1. **ドラッグ&ドロップ順序変更**

```typescript
// dnd-kit ライブラリを使用
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// ResultItemsContainer で実装
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (active.id !== over?.id) {
    setEditableResults((items) => {
      // 順序を入れ替え
      const oldIndex = items.findIndex((r) => r.regionId === active.id);
      const newIndex = items.findIndex((r) => r.regionId === over?.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  }
};
```

2. **フォーマット変換**

```typescript
// utils/formatters.ts
export function formatResults(
  results: OCRRegionResult[],
  format: "text" | "csv" | "json"
): string {
  switch (format) {
    case "text":
      return formatAsText(results);
    case "csv":
      return formatAsCSV(results);
    case "json":
      return formatAsJSON(results);
  }
}

function formatAsText(results: OCRRegionResult[]): string {
  return results.map((r) => `${r.regionName}: ${r.text}`).join("\n");
}

function formatAsCSV(results: OCRRegionResult[]): string {
  const header = ["Region Name", "Text", "Confidence"].join(",");
  const rows = results.map((r) =>
    [r.regionName, `"${r.text}"`, r.confidence].join(",")
  );
  return [header, ...rows].join("\n");
}

function formatAsJSON(results: OCRRegionResult[]): string {
  return JSON.stringify(
    results.map((r) => ({
      name: r.regionName,
      text: r.text,
      confidence: r.confidence,
    })),
    null,
    2
  );
}
```

3. **信頼度カラーコード**

```typescript
export function getConfidenceBadgeClass(confidence: number): string {
  if (confidence >= 85) return "bg-green-100 text-green-700";
  if (confidence >= 70) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export function getConfidenceIndicator(confidence: number): string {
  if (confidence >= 85) return "🟢";
  if (confidence >= 70) return "🟡";
  return "🔴";
}
```

**チェックリスト**:

- [ ] ドラッグ&ドロップ実装
- [ ] フォーマット変換実装
- [ ] 信頼度インジケーター実装
- [ ] プレビュー表示実装

#### タスク 2-3: Tailwind CSS スタイリング（0.5 日）

**目標**: 統一感のあるスタイリングを完成

**スタイリング対象**:

- ヘッダー: `bg-slate-50 border-b border-slate-200 p-6`
- 結果アイテム: `border border-slate-200 rounded-lg p-4 mb-4`
- 信頼度バッジ: カラーコード + 背景色
- テキストエリア: フォーカススタイル + ダークモード対応
- ボタン: 既存の Button コンポーネント統一

**チェックリスト**:

- [ ] ヘッダー・フッタースタイリング
- [ ] 結果アイテムスタイリング
- [ ] レスポンシブスタイル
- [ ] ダークモード対応確認

---

### Phase 4-3-3: テスト実装（1.5 日）

#### タスク 3-1: ユニットテスト実装

**目標**: 20+ のテストケースを実装

**テストカテゴリ**:

1. **初期化テスト** (TC-RESULT-001 ~ TC-RESULT-003)

   - コンポーネント描画確認
   - Props 受け取り確認
   - 初期状態の検証

2. **テキスト編集テスト** (TC-RESULT-004 ~ TC-RESULT-008)

   - テキスト入力
   - 編集フラグの管理
   - リセット機能
   - 複数領域の編集

3. **順序変更テスト** (TC-RESULT-009 ~ TC-RESULT-012)

   - ドラッグ&ドロップ
   - キーボード操作
   - 順序の永続化

4. **フォーマット変換テスト** (TC-RESULT-013 ~ TC-RESULT-017)

   - テキスト形式
   - CSV 形式
   - JSON 形式
   - カスタム区切り文字

5. **操作機能テスト** (TC-RESULT-018 ~ TC-RESULT-022)
   - 全選択 / 全解除
   - プレビュー表示
   - 保存処理
   - キャンセル処理

**テスト実装例**:

```typescript
describe("ResultEditor Component", () => {
  describe("TC-RESULT-001: Rendering", () => {
    it("should render with results", () => {
      render(
        <ResultEditor
          results={mockResults}
          template={mockTemplate}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("ステップ 3: 結果確認・編集")).toBeDefined();
      mockResults.forEach((result) => {
        expect(screen.getByText(result.regionName)).toBeDefined();
      });
    });
  });

  describe("TC-RESULT-004: Text Editing", () => {
    it("should update text when input changes", async () => {
      const user = userEvent.setup();
      render(
        <ResultEditor
          results={mockResults}
          template={mockTemplate}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByDisplayValue(mockResults[0].text);
      await user.clear(textarea);
      await user.type(textarea, "New text");

      expect(textarea).toHaveValue("New text");
    });
  });

  // ... その他のテストケース
});
```

**チェックリスト**:

- [ ] 20+ のテストケース実装
- [ ] 全テスト合格確認
- [ ] エッジケースのカバー

#### タスク 3-2: 統合テスト

**目標**: DataInputPage との統合テスト

**テスト項目**:

- OCRProcessor → ResultEditor の遷移
- 編集結果の保存と確認
- キャンセルのハンドリング

**チェックリスト**:

- [ ] 統合テスト実装
- [ ] データフロー検証
- [ ] エラーハンドリング確認

---

### Phase 4-3-4: ドキュメント・品質チェック（0.5 日）

#### タスク 4-1: 仕様書作成

**目標**: ResultEditor.spec.md を作成

**内容**:

- 要件定義（機能要件・非機能要件）
- インターフェース定義
- 仕様詳細
- テストケース定義

#### タスク 4-2: 品質チェック

**チェック項目**:

- [ ] Lint 実行: 0 エラー目標
- [ ] TypeScript 型チェック: 0 エラー
- [ ] テスト実行: 全合格
- [ ] DEPENDENCY MAP 記載
- [ ] コード内コメント確認

---

## ファイル構造設計

### 新規作成ファイル

```
src/components/DataInput/
├── ResultEditor.tsx                    # メインコンポーネント (300+ 行)
├── ResultEditor.spec.md                # 仕様書 (250+ 行)
├── ResultEditor.test.tsx               # テスト (400+ 行)
│
├── components/
│   ├── ResultEditorHeader.tsx          # ヘッダー (100 行)
│   ├── ResultItem.tsx                  # 結果アイテム (200+ 行)
│   ├── ResultItemsContainer.tsx        # 結果コンテナ (150 行)
│   ├── ResultEditorFooter.tsx          # フッター (150 行)
│   └── ResultPreview.tsx               # プレビュー (150 行)
│
├── utils/
│   ├── formatters.ts                   # フォーマット変換 (100+ 行)
│   └── resultValidator.ts              # バリデーション (50+ 行)
│
└── styles/
    └── ResultEditor.module.css         # スタイル (100+ 行、Tailwind 補助)
```

### 修正ファイル

```
src/pages/
├── DataInputPage.tsx                   # ResultEditor を統合
└── DataInputPage.test.tsx              # 統合テスト追加

src/types/
└── ocr.ts                              # 型定義拡張（必要に応じて）
```

---

## 技術設計

### コンポーネント設計

```
ResultEditor (親)
├─ ResultEditorHeader
│  └─ Format Selector
├─ ResultItemsContainer (DndContext)
│  └─ ResultItem (×N)
│     ├─ ResultItemHeader
│     ├─ ResultItemContent
│     └─ ResultItemFooter
├─ ResultPreview (条件付き表示)
└─ ResultEditorFooter
   ├─ Statistics
   └─ ActionButtons
```

### データフロー

```
DataInputPage
  ├─ OCRProcessor (結果取得)
  │  └─ onComplete(results)
  │
  └─ ResultEditor (結果編集)
     ├─ onSave(editedResults)
     │  └─ 次フェーズ: DataOutput へ
     │
     └─ onCancel()
        └─ OCR 実行やり直し
```

### 状態管理

```typescript
// ResultEditor 内部状態
type ResultEditorState = {
  editableResults: EditableResult[];
  selectedFormat: "text" | "csv" | "json";
  showPreview: boolean;
  isDirty: boolean; // 編集フラグ
};

// イベント
type ResultEditorEvents = {
  onSave: (results: OCRRegionResult[]) => void;
  onCancel: () => void;
};
```

---

## テスト戦略

### 単体テスト

- **コンポーネント初期化**: 5 テストケース
- **テキスト編集機能**: 8 テストケース
- **順序変更機能**: 4 テストケース
- **フォーマット変換**: 5 テストケース
- **操作機能**: 5 テストケース

### 統合テスト

- **DataInputPage との連携**: 3 テストケース
- **エラーハンドリング**: 2 テストケース

**合計**: 32 テストケース

---

## リスクと対策

### リスク 1: ドラッグ&ドロップの複雑性

**内容**: dnd-kit の導入が予定より時間がかかる可能性

**対策**:

1. **段階的実装**

   - 最初は順序変更なし、フェーズ 4-4 で追加も可能
   - キーボード操作のみの簡易版で対応

2. **代替案**
   - React Beautiful DnD の使用検討
   - 移動ボタン（↑↓）による順序変更

**優先度**: 低（オプション機能）

### リスク 2: フォーマット変換の複雑性

**内容**: CSV エスケープなどの処理が複雑

**対策**:

1. **ライブラリ活用**

   - Papa Parse（CSV 処理）
   - json2csv（JSON→CSV）

2. **段階的実装**
   - テキスト形式のみで出発
   - CSV・JSON は v2 で実装

**優先度**: 中

### リスク 3: パフォーマンス

**内容**: 領域数が多い場合（100+）の処理が遅延

**対策**:

1. **最適化**

   - 仮想スクロール（react-window）の導入検討
   - useMemo / useCallback の活用

2. **制限**
   - 段階表示（最初 20 件 → スクロールで追加読み込み）

**優先度**: 低（初期段階では不要）

---

## 推奨スケジュール（1 週間）

### 週 1（実装週）

| 日時 | 作業項目                   | 成果物                     |
| ---- | -------------------------- | -------------------------- |
| 月   | 設計・インターフェース定義 | インターフェース定義書     |
| 火   | 基本コンポーネント実装     | 基本的な UI・状態管理      |
| 水   | 高度な機能実装             | 順序変更・フォーマット変換 |
| 木   | テスト実装                 | テストスイート完成・全合格 |
| 金   | ドキュメント・品質チェック | 仕様書・品質チェック完了   |

---

## 次フェーズ（Phase 4-4）の予告

### 概要

統合テスト・UX 検証・パフォーマンス最適化

### 実装項目

- [ ] エンドツーエンドテスト（e2e）
- [ ] ユーザーシナリオテスト
- [ ] パフォーマンステスト・最適化
- [ ] アクセシビリティ監査（WCAG）
- [ ] UX 改善（ユーザーフィードバック反映）

### 実装期間

1 週間

---

## 参考資料

### 関連ドキュメント

- [Phase 4 改定計画書](../../03_plans/phase4-revised-implementation-plan.md)
- [OCRProcessor 仕様書](../OCRProcessor.spec.md)
- [DataInputPage 仕様書](../../pages/DataInputPage.spec.md)

### 外部リソース

- [Tailwind CSS ドキュメント](https://tailwindcss.com/)
- [React Testing Library](https://testing-library.com/)
- [dnd-kit ドキュメント](https://docs.dndkit.com/)
- [Papa Parse](https://www.papaparse.com/) (CSV 処理)

---

## 承認・確認

| 項目         | 状態    | 確認者  | 日時       |
| ------------ | ------- | ------- | ---------- |
| 計画書作成   | ✅ 完了 | DevTeam | 2025-11-04 |
| 設計レビュー | ⏳ 予定 | -       | -          |
| 実装開始     | ⏳ 予定 | -       | 2025-11-05 |

---

**最終更新**: 2025-11-04  
**ステータス**: 計画書作成完了・実装開始待ち  
**次のアクション**: インターフェース定義 → 基本コンポーネント実装

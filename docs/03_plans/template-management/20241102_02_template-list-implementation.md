# TemplateList コンポーネント実装計画

## 計画概要

- **計画日**: 2024-11-02
- **担当者**: AI + Developer
- **完了予定**: 2024-11-02（1 日）
- **依存関係**:
  - useTemplate hook (完了)
  - Button component (完了)
  - Layout component (完了)

## 実装段階

### Phase 1: 仕様書作成 (完了: 2024-11-02)

**目標**: TemplateList.spec.md の作成 ✅

**タスク**:

- [x] インターフェース定義 (Props, State)
- [x] 動作仕様の定義（表示、削除、選択）
- [x] テストケース定義（17 ケース）
- [x] 受け入れ条件の明確化

**成果物**:

- `src/components/TemplateManagement/TemplateList.spec.md`

### Phase 2: コンポーネント実装 (完了: 2024-11-02)

**目標**: TemplateList.tsx の実装 ✅

**タスク**:

- [x] グリッドレイアウトでテンプレート一覧表示（レスポンシブ対応）
- [x] テンプレートカード（サムネイル、名前、日付）
- [x] 削除確認ダイアログの実装
- [x] 選択機能（編集用）
- [x] 空状態の表示（テンプレートなし）
- [x] useTemplate hook との連携

**成果物**:

- `src/components/TemplateManagement/TemplateList.tsx`
- Tailwind CSS 使用（CSS Modules から変更）

### Phase 3: テスト実装 (完了: 2024-11-02)

**目標**: TemplateList.test.tsx の実装と全テスト合格 ✅

**タスク**:

- [x] レンダリングテスト（空状態、データあり状態）
- [x] 削除機能のテスト（確認ダイアログ、キャンセル、実行）
- [x] 選択機能のテスト
- [x] useTemplate hook モックとの連携テスト
- [x] エッジケーステスト（画像なし、ローディング、エラー状態）

**成果物**:

- `src/components/TemplateManagement/TemplateList.test.tsx`

**実績**: 10 テスト実装、全テスト合格 (TC-001 〜 TC-010)

## ファイル構造設計

```
src/
├── components/
│   ├── TemplateManagement/
│   │   ├── TemplateList.tsx
│   │   ├── TemplateList.spec.md
│   │   ├── TemplateList.test.tsx
│   │   └── TemplateList.module.css
│   └── common/
│       ├── Button/
│       └── Layout/
├── hooks/
│   └── useTemplate.ts  (既存・完了)
└── types/
    └── template.ts     (既存)
```

## 技術設計

### コンポーネント設計

**TemplateList Component**:

```typescript
interface TemplateListProps {
  onSelectTemplate?: (templateId: string) => void;
  showSelection?: boolean;
}

interface TemplateListState {
  deleteConfirmOpen: boolean;
  deleteTargetId: string | null;
}
```

**主要機能**:

1. **グリッド表示**: CSS Grid で 2-3 列のレスポンシブレイアウト
2. **テンプレートカード**:
   - サムネイル画像（baseImageData）
   - テンプレート名
   - 作成日/更新日
   - 削除ボタン
   - 選択ボタン（オプション）
3. **削除確認ダイアログ**:
   - モーダルまたは confirm UI
   - キャンセル/削除ボタン
4. **空状態**:
   - テンプレートがない場合のメッセージ
   - 「新規作成」へのリンク

### データフロー

```
[useTemplate Hook]
    ↓ templates[], deleteTemplate()
[TemplateList Component]
    ↓ render cards
[TemplateCard × N]
    ↓ user clicks delete
[DeleteConfirmDialog]
    ↓ user confirms
[useTemplate.deleteTemplate(id)]
    ↓ auto-refresh
[TemplateList re-renders]
```

### スタイリング方針

- **CSS Modules**: スコープ付きスタイル
- **レスポンシブ**: mobile-first、grid-template-columns
- **アクセシビリティ**: ボタンの aria-label、キーボード操作

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
}

.thumbnail {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}
```

## テスト戦略

### Unit Tests (TemplateList.test.tsx)

**TC-001: 初期表示**

- 空状態メッセージが表示される
- テンプレートありで一覧が表示される

**TC-002: テンプレートカード表示**

- 名前、日付、サムネイルが正しく表示される
- 削除ボタンが表示される

**TC-003: 削除機能**

- 削除ボタンクリックで確認ダイアログが開く
- キャンセルで何も起きない
- 削除確定で deleteTemplate が呼ばれる
- 削除後、一覧から消える

**TC-004: 選択機能**

- showSelection=true で選択ボタンが表示される
- クリックで onSelectTemplate コールバックが呼ばれる

**TC-005: エッジケース**

- テンプレート 0 件、1 件、複数件の表示
- 削除中の状態表示
- 同じ名前のテンプレート複数

### Integration Tests

- useTemplate hook との実際の連携
- localStorage 操作との統合

## リスクと対策

### リスク 1: 画像サムネイルの表示パフォーマンス

- **影響**: 大量のテンプレートで重くなる
- **対策**:
  - CSS object-fit で最適化
  - 将来的に遅延ロード検討

### リスク 2: 削除操作の誤操作

- **影響**: ユーザーが意図せずテンプレート削除
- **対策**:
  - 明確な確認ダイアログ
  - 削除ボタンのスタイルを警告色に

### リスク 3: 空状態の UX

- **影響**: 初回ユーザーが何をすべきかわからない
- **対策**:
  - わかりやすいメッセージ
  - 「新規作成」ボタンへのリンク

## 進捗追跡

- [x] Phase 1: 仕様書作成完了（17 テストケース定義）
- [x] Phase 2: コンポーネント実装完了（Tailwind CSS 使用）
- [x] Phase 3: テスト実装完了（10 テスト、全テスト合格）
- [x] コードレビュー完了
- [x] ドキュメント更新完了

**完了日**: 2024-11-02

## 次のステップ

TemplateList 完成後:

1. **Phase 3-3**: RegionSelector component 実装
2. **Phase 3-4**: TemplateEditor component 統合
3. **Phase 3-5**: TemplateManagementPage への統合

## 参照ドキュメント

- Issue: `docs/01_issues/open/2024_11/20241102_02_common-components-development.md`
- Overall Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
- useTemplate Hook: `src/hooks/useTemplate.spec.md`
- Template Type: `src/types/template.ts`

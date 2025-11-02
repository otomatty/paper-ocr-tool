# AI 駆動ドキュメント開発規則

## 概要

紙アンケート OCR 入力効率化 Web アプリにおけるドキュメント駆動開発のワークフローと規則を定義します。

## ドキュメント駆動開発の基本原則

### 1. ファイルとドキュメントの同期原則

**重要**: ファイルを修正したら、必ず関連ドキュメントも更新してください。

この原則により：

- コードとドキュメントの整合性を保つ
- 軽量な AI モデルでも正確な情報を参照可能
- 開発効率とコード品質の両立を実現

### 2. ドキュメント 5 種類 + 実装フロー

```
PROMPT → ISSUE → RESEARCH → PLAN → SPEC+TEST → IMPLEMENTATION → LOG
```

## ドキュメント種類と役割

### 1. PROMPT（プロンプト）: `docs/00_prompts/`

**目的**: AI・開発者への具体的な指示書

**作成タイミング**: 新しいタスク・機能の実装開始前

**内容**:

- 具体的な実装タスクの指示
- 技術的制約・要件
- 参照すべきドキュメント
- 期待する成果物

#### テンプレート

```markdown
# [機能名] 実装プロンプト

## タスク概要

- **目的**: [何を実現するか]
- **スコープ**: [実装範囲]
- **期限**: [完了予定日]

## 技術要件

- **使用技術**: [React, TypeScript, etc.]
- **制約条件**: [パフォーマンス、セキュリティ要件]
- **依存関係**: [他機能との関連]

## 実装指示

1. [具体的な実装手順 1]
2. [具体的な実装手順 2]
3. [具体的な実装手順 3]

## 参照ドキュメント

- Issue: [関連する Issue へのリンク]
- Research: [技術調査結果へのリンク]
- Plan: [実装計画へのリンク]

## 成果物

- [ ] [ファイル名 1]
- [ ] [ファイル名 2]
- [ ] [テストファイル]
- [ ] [ドキュメント更新]

## 定義完了（DoD）

- [ ] [受け入れ条件 1]
- [ ] [受け入れ条件 2]
- [ ] [テスト合格]
```

### 2. ISSUE（問題・要件）: `docs/01_issues/`

**目的**: 問題・要件定義の詳細化

**ディレクトリ構造**:

```
01_issues/
├── open/YYYY_MM/           # 未解決の問題
└── resolved/YYYY_MM/       # 解決済みの問題
```

**作成タイミング**:

- 新機能の要件が明確になった時
- バグ・問題が発見された時
- 改善提案が上がった時

#### テンプレート

```markdown
# [機能名/問題名] - Issue

## 基本情報

- **作成日**: YYYY-MM-DD
- **担当者**: [担当者名]
- **優先度**: High/Medium/Low
- **種別**: Feature/Bug/Enhancement

## 問題・要件概要

[何が問題か、何を実現したいかを簡潔に]

## 詳細説明

### 現状

[現在の状況、問題の詳細]

### 要求事項

[解決すべき課題、実現したい機能]

### 受け入れ条件

- [ ] [条件 1]
- [ ] [条件 2]
- [ ] [条件 3]

## 影響範囲

- **ユーザー**: [ユーザーへの影響]
- **システム**: [システムへの影響]
- **他機能**: [他機能との関連]

## 関連ドキュメント

- Research: [技術調査へのリンク]
- Plan: [実装計画へのリンク]

## 解決状況

- [ ] 要件分析完了
- [ ] 技術調査完了
- [ ] 実装計画完了
- [ ] 実装完了
- [ ] テスト完了
- [ ] レビュー完了
```

### 3. RESEARCH（技術調査）: `docs/02_research/YYYY_MM/`

**目的**: 技術選定・実装可能性の検証

**作成タイミング**:

- 新しい技術・ライブラリの導入検討時
- 実装方法の比較検討時
- パフォーマンス・制約の調査時

#### テンプレート

```markdown
# [調査対象] 技術調査

## 調査概要

- **調査日**: YYYY-MM-DD
- **調査者**: [調査者名]
- **目的**: [何を明らかにしたいか]

## 調査対象

### 候補 1: [技術・手法名]

- **概要**: [技術の説明]
- **メリット**: [採用する利点]
- **デメリット**: [懸念点・制約]
- **実装コスト**: [開発工数・学習コスト]

### 候補 2: [技術・手法名]

- **概要**: [技術の説明]
- **メリット**: [採用する利点]
- **デメリット**: [懸念点・制約]
- **実装コスト**: [開発工数・学習コスト]

## 比較結果

| 項目           | 候補 1 | 候補 2 | 重要度 |
| -------------- | ------ | ------ | ------ |
| 実装の容易さ   | ○      | △      | High   |
| パフォーマンス | △      | ○      | High   |
| 学習コスト     | ○      | △      | Medium |

## 推奨案

**選択**: [候補名]

**理由**:

- [選択理由 1]
- [選択理由 2]
- [選択理由 3]

**リスク**:

- [リスク 1 とその対策]
- [リスク 2 とその対策]

## 次のアクション

- [ ] [アクション 1]
- [ ] [アクション 2]

## 参照資料

- [公式ドキュメント URL]
- [サンプルコード URL]
- [ベンチマーク結果 URL]
```

### 4. PLAN（実装計画）: `docs/03_plans/{機能名}/`

**目的**: 段階的な実装手順の定義

**ディレクトリ構造**:

```
03_plans/
├── template-management/    # テンプレート管理機能
├── ocr-processing/         # OCR処理機能
├── data-input/            # データ入力機能
└── overall/               # 全体計画
```

**作成タイミング**: Issue と技術調査が完了し、実装を開始する前

#### テンプレート

```markdown
# [機能名] 実装計画

## 計画概要

- **計画日**: YYYY-MM-DD
- **担当者**: [担当者名]
- **完了予定**: YYYY-MM-DD
- **依存関係**: [他機能との依存関係]

## 実装段階

### Phase 1: [段階名] (予定: X 日)

**目標**: [この段階で実現すること]

**タスク**:

- [ ] [タスク 1] (X 時間)
- [ ] [タスク 2] (X 時間)
- [ ] [タスク 3] (X 時間)

**成果物**:

- `src/components/[Component].tsx`
- `src/components/[Component].spec.md`
- `src/components/[Component].test.tsx`

### Phase 2: [段階名] (予定: X 日)

**目標**: [この段階で実現すること]

**タスク**:

- [ ] [タスク 1] (X 時間)
- [ ] [タスク 2] (X 時間)

**成果物**:

- [ファイルリスト]

## ファイル構造設計
```

src/
├── components/
│ ├── [Component]/
│ │ ├── [Component].tsx
│ │ ├── [Component].spec.md
│ │ └── [Component].test.tsx
├── hooks/
│ └── use[Hook].ts
└── utils/
└── [utility].ts

```

## 技術設計
### コンポーネント設計
- **[Component1]**: [役割・責任]
- **[Component2]**: [役割・責任]

### データフロー
```

[User Action] → [Component] → [Hook] → [Utility] → [Storage]

````

### API設計
```typescript
interface [Interface] {
  [property]: [type];
}

function [functionName]([params]): [returnType] {
  // implementation
}
````

## テスト戦略

- **Unit Test**: [テスト対象]
- **Integration Test**: [テスト範囲]
- **E2E Test**: [シナリオ]

## リスクと対策

- **リスク 1**: [内容] → 対策: [対策内容]
- **リスク 2**: [内容] → 対策: [対策内容]

## 進捗追跡

- [ ] Phase 1 完了
- [ ] Phase 2 完了
- [ ] テスト完了
- [ ] レビュー完了
- [ ] ドキュメント更新完了

````

### 5. SPEC+TEST（仕様書+テスト）: `src/{path}/{FileName}.spec.md`

**目的**: 詳細仕様とテストケースの定義

**作成タイミング**: 実装開始直前

**配置**: 実装ファイルと同じディレクトリ

#### テンプレート
```markdown
# [Component/Function].spec.md

## Related Files
- Implementation: `[FileName].tsx`
- Tests: `[FileName].test.tsx`
- Styles: `[FileName].module.css`

## Related Documentation
- Issue: `docs/01_issues/[link]`
- Plan: `docs/03_plans/[link]`

## Requirements
### Functional Requirements
- **FR-001**: [要件1の詳細]
- **FR-002**: [要件2の詳細]

### Non-Functional Requirements
- **NFR-001**: [パフォーマンス要件]
- **NFR-002**: [ユーザビリティ要件]

## Interface Definition
```typescript
interface [Props] {
  [property]: [type]; // [説明]
}

interface [State] {
  [property]: [type]; // [説明]
}
````

## Behavior Specification

### Normal Cases

- **ケース 1**: [条件] → [期待結果]
- **ケース 2**: [条件] → [期待結果]

### Edge Cases

- **エッジケース 1**: [条件] → [期待結果]
- **エッジケース 2**: [条件] → [期待結果]

### Error Cases

- **エラーケース 1**: [条件] → [エラーハンドリング]

## Test Cases

### TC-001: [テストケース名]

- **Purpose**: [テストの目的]
- **Input**: [入力データ]
- **Expected**: [期待結果]
- **Steps**:
  1. [手順 1]
  2. [手順 2]
  3. [手順 3]

### TC-002: [テストケース名]

[同様の形式]

## Acceptance Criteria

- [ ] [受け入れ条件 1]
- [ ] [受け入れ条件 2]
- [ ] [受け入れ条件 3]

````

### 6. LOG（作業ログ）: `docs/05_logs/YYYY_MM/YYYYMMDD/`

**目的**: 作業記録・振り返り・決定事項の保存

**作成タイミング**: 作業完了後、日次または週次

#### テンプレート
```markdown
# [作業内容] - 作業ログ

## 基本情報
- **作業日**: YYYY-MM-DD
- **作業者**: [作業者名]
- **作業時間**: [開始時間] - [終了時間] ([X時間])

## 実施内容
### 完了したタスク
- [x] [タスク1] - [詳細・メモ]
- [x] [タスク2] - [詳細・メモ]

### 進行中のタスク
- [ ] [タスク3] - [進捗状況・次のステップ]

## 発見した問題・課題
### 問題1: [問題名]
- **内容**: [問題の詳細]
- **影響**: [システム・スケジュールへの影響]
- **対応策**: [取った/取る予定の対応]
- **ステータス**: 解決済み/対応中/未着手

## 技術的な学び・発見
- **学び1**: [技術的な発見や改善点]
- **学び2**: [効率化のヒントや新しい知識]

## 決定事項・変更点
- **決定1**: [設計・仕様の決定内容] - 理由: [決定理由]
- **変更1**: [変更内容] - 理由: [変更理由]

## 次のアクション
- [ ] [明日/次回実施予定のタスク1]
- [ ] [明日/次回実施予定のタスク2]

## 更新したファイル
### 新規作成
- `[filePath1]` - [目的・内容]
- `[filePath2]` - [目的・内容]

### 修正
- `[filePath3]` - [修正内容・理由]
- `[filePath4]` - [修正内容・理由]

### 更新したドキュメント
- `[docPath1]` - [更新内容]
- `[docPath2]` - [更新内容]

## メモ・その他
[その他の気づき・メモ]
````

## 実装フロー詳細

### 1. 新機能開発フロー

```
1. PROMPT作成 → 2. ISSUE作成 → 3. RESEARCH実施 → 4. PLAN策定
→ 5. SPEC+TEST作成 → 6. IMPLEMENTATION → 7. LOG記録
```

**各段階のチェックポイント**:

- PROMPT → ISSUE: 要件が具体化されているか
- ISSUE → RESEARCH: 技術的課題が明確になっているか
- RESEARCH → PLAN: 実装方法が決定されているか
- PLAN → SPEC: 詳細仕様が定義されているか
- SPEC → IMPLEMENTATION: テストケースが準備されているか
- IMPLEMENTATION → LOG: 作業内容が記録されているか

### 2. バグ修正フロー

```
1. ISSUE作成（バグ報告） → 2. RESEARCH（原因調査） → 3. PLAN（修正計画）
→ 4. SPEC更新（再発防止テスト） → 5. IMPLEMENTATION → 6. LOG記録
```

### 3. 改善・リファクタリングフロー

```
1. ISSUE作成（改善提案） → 2. RESEARCH（効果検証） → 3. PLAN（改善計画）
→ 4. SPEC更新 → 5. IMPLEMENTATION → 6. LOG記録
```

## ファイル命名規則

### Issue・Research・Log

```
YYYYMMDD_NN_機能名-概要.md
```

**例**:

- `20241102_01_template-management.md`
- `20241102_02_ocr-processing-performance.md`

### Plan

```
機能名/YYYYMMDD_NN_計画概要.md
```

**例**:

- `template-management/20241102_01_implementation-plan.md`
- `ocr-processing/20241102_01_optimization-plan.md`

### Spec

```
src/{path}/{FileName}.spec.md
```

**例**:

- `src/components/TemplateEditor/TemplateEditor.spec.md`
- `src/utils/ocrEngine/ocrEngine.spec.md`

## ドキュメント更新ルール

### 実装ファイル修正時の更新対象

#### 1. コンポーネント・ロジックファイル修正

```
修正ファイル: src/components/Button/Button.tsx
↓ 必ず更新
- src/components/Button/Button.spec.md（仕様書）
- src/components/Button/Button.test.tsx（テストケース）
- docs/03_plans/button-component/（実装計画の進捗）
- docs/05_logs/YYYY_MM/YYYYMMDD/（作業ログ）
```

#### 2. 新機能追加時

```
新規ファイル: src/features/NewFeature/NewFeature.tsx
↓ 必ず作成
- src/features/NewFeature/NewFeature.spec.md（新規作成）
- docs/01_issues/open/YYYY_MM/YYYYMMDD_01_new-feature.md
- docs/03_plans/new-feature/（新規作成）
- docs/05_logs/YYYY_MM/YYYYMMDD/01_new-feature-implementation.md
```

#### 3. バグ修正時

```
修正ファイル: src/utils/helper.ts
↓ 必ず更新
- src/utils/helper.spec.md（バグ再現テストケース追加）
- docs/01_issues/open/ → docs/01_issues/resolved/ へ移動
- docs/05_logs/YYYY_MM/YYYYMMDD/XX_bugfix-helper.md
```

### 更新チェックリスト

ファイル修正時の必須確認項目:

- [ ] `.spec.md` の「Requirements」は最新か？
- [ ] `.spec.md` の「Test Cases」に新しいケースを追加したか？
- [ ] `.test.tsx` は `.spec.md` と一致しているか？
- [ ] 実装計画の進捗状況を更新したか？
- [ ] 作業ログを記録したか？
- [ ] Issue の状態を更新したか？（open → resolved など）

## AI 協働最適化

### 軽量モデル向けの配慮

#### 1. 明確な関連付け

```typescript
/**
 * Button Component
 *
 * Related Documentation:
 * - Spec: src/components/Button/Button.spec.md
 * - Test: src/components/Button/Button.test.tsx
 * - Plan: docs/03_plans/button-component/20241102_01_implementation-plan.md
 * - Issue: docs/01_issues/resolved/2024_11/20241102_01_button-component.md
 */
```

#### 2. 構造化された指示

```markdown
【タスク】Button コンポーネントに size プロパティを追加

【更新するファイル】

1. src/components/Button/Button.tsx - size プロパティ実装
2. src/components/Button/Button.spec.md - Requirements に size 要件追加
3. src/components/Button/Button.test.tsx - TC-006 として size テスト追加

【参照ドキュメント】

- 仕様書: src/components/Button/Button.spec.md
- 実装計画: docs/03_plans/button-component/20241102_01_implementation-plan.md
```

### 継続的改善

ドキュメント駆動開発の効果測定:

- **開発効率**: 機能実装にかかる時間
- **バグ率**: リリース後の不具合発生率
- **ドキュメント品質**: 実装とドキュメントの整合性
- **AI 協働効率**: AI との対話回数・精度

定期的にフロー・テンプレートを見直し、最適化していきます。

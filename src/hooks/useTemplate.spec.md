# useTemplate.spec.md

## Related Files

- Implementation: `useTemplate.ts`
- Tests: `useTemplate.test.ts`
- Types: `../types/template.ts`
- Storage: `../utils/localStorage.ts`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-001**: テンプレート一覧取得 - localStorage から全テンプレートを読み込み
- **FR-002**: テンプレート作成 - 新規テンプレートを localStorage に保存
- **FR-003**: テンプレート更新 - 既存テンプレートを更新
- **FR-004**: テンプレート削除 - 指定 ID のテンプレートを削除
- **FR-005**: テンプレート取得 - 指定 ID の単一テンプレートを取得
- **FR-006**: 自動保存 - テンプレート変更時に自動的に localStorage に保存

### Non-Functional Requirements

- **NFR-001**: パフォーマンス - 全操作が 100ms 以内に完了
- **NFR-002**: データ整合性 - localStorage 操作失敗時の適切なエラーハンドリング
- **NFR-003**: 型安全性 - TypeScript の型チェックに完全準拠

## Interface Definition

### Input

```typescript
interface UseTemplateReturn {
  templates: Template[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  createTemplate: (
    template: Omit<Template, "id" | "createdAt" | "updatedAt">
  ) => Promise<Template>;
  updateTemplate: (
    id: string,
    updates: Partial<Omit<Template, "id" | "createdAt">>
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => Template | undefined;
}

// Template型定義（参照）
interface Template {
  id: string;
  name: string;
  description?: string;
  baseImageData: string; // Base64 encoded image
  regions: TemplateRegion[];
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}
```

### Output

```typescript
const {
  templates,
  loading,
  error,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
} = useTemplate();
```

## Behavior Specification

### Normal Cases

#### NC-001: フック初期化

- **条件**: useTemplate() 呼び出し
- **期待結果**:
  - localStorage からテンプレート一覧を読み込む
  - loading が true → false に変化
  - templates に読み込んだデータがセット
  - error は null

#### NC-002: テンプレート作成

- **条件**: createTemplate(newTemplate) 呼び出し
- **期待結果**:
  - 一意な ID が自動生成される
  - createdAt, updatedAt が現在時刻でセット
  - localStorage に保存される
  - templates 配列に新規テンプレートが追加
  - 作成した Template オブジェクトが返る

#### NC-003: テンプレート更新

- **条件**: updateTemplate(id, updates) 呼び出し
- **期待結果**:
  - 指定 ID のテンプレートが更新される
  - updatedAt が現在時刻で更新
  - localStorage に保存される
  - templates 配列が更新される

#### NC-004: テンプレート削除

- **条件**: deleteTemplate(id) 呼び出し
- **期待結果**:
  - 指定 ID のテンプレートが削除される
  - localStorage から削除される
  - templates 配列から削除される

#### NC-005: テンプレート取得

- **条件**: getTemplate(id) 呼び出し
- **期待結果**:
  - 指定 ID のテンプレートが返る
  - 存在しない場合は undefined が返る

### Edge Cases

#### EC-001: localStorage が空の場合

- **条件**: 初回利用（localStorage にデータなし）
- **期待結果**:
  - templates が空配列 []
  - error は null
  - loading が false

#### EC-002: 同名テンプレートの作成

- **条件**: 既存と同じ name で createTemplate()
- **期待結果**:
  - 正常に作成される（名前の重複は許可）
  - 異なる ID が割り当てられる

#### EC-003: 存在しない ID での更新・削除

- **条件**: updateTemplate() / deleteTemplate() で存在しない ID を指定
- **期待結果**:
  - 更新・削除は何も行わない
  - エラーを throw せず、silent に無視
  - error 状態は null のまま

### Error Cases

#### ER-001: localStorage 読み込みエラー

- **条件**: localStorage.getItem() が例外を throw
- **期待結果**:
  - error に "テンプレートの読み込みに失敗しました" をセット
  - templates は空配列
  - loading は false

#### ER-002: localStorage 書き込みエラー

- **条件**: localStorage.setItem() が例外を throw（容量超過など）
- **期待結果**:
  - error に "テンプレートの保存に失敗しました" をセット
  - 操作はロールバック（state 変更を元に戻す）
  - Promise が reject される

#### ER-003: 不正な JSON 形式

- **条件**: localStorage に不正な JSON 文字列が保存されている
- **期待結果**:
  - error に "テンプレートデータが破損しています" をセット
  - templates は空配列
  - loading は false

## Test Cases

### TC-001: 初期化とデータ読み込み

- **Purpose**: フック初期化時に localStorage からデータを読み込む
- **Input**:
  - localStorage に 2 件のテンプレートが保存済み
- **Expected**:
  - templates.length === 2
  - loading === false
  - error === null
- **Steps**:
  1. localStorage に 2 件のテンプレートをセット
  2. useTemplate() を呼び出し
  3. templates, loading, error を検証

### TC-002: テンプレート作成成功

- **Purpose**: 新規テンプレート作成が正常に動作する
- **Input**:
  ```typescript
  {
    name: "アンケート用紙A",
    description: "基本アンケート",
    baseImageData: "data:image/jpeg;base64,mock",
    regions: []
  }
  ```
- **Expected**:
  - 作成されたテンプレートの id が存在
  - templates.length が 1 増加
  - localStorage に保存される
  - createdAt, updatedAt が設定される
- **Steps**:
  1. createTemplate() を呼び出し
  2. 返り値のテンプレートを検証
  3. templates 配列を検証
  4. localStorage の内容を検証

### TC-003: テンプレート更新成功

- **Purpose**: 既存テンプレートの更新が正常に動作する
- **Input**:
  - 既存テンプレート ID: "template-1"
  - 更新内容: { name: "更新後の名前" }
- **Expected**:
  - templates 内の該当テンプレートが更新される
  - updatedAt が更新される
  - localStorage に保存される
- **Steps**:
  1. テンプレートを 1 件作成
  2. updateTemplate() で名前を更新
  3. templates 配列を検証
  4. localStorage の内容を検証

### TC-004: テンプレート削除成功

- **Purpose**: テンプレート削除が正常に動作する
- **Input**: 削除対象のテンプレート ID
- **Expected**:
  - templates.length が 1 減少
  - localStorage から削除される
- **Steps**:
  1. テンプレートを 2 件作成
  2. deleteTemplate() で 1 件削除
  3. templates 配列を検証
  4. localStorage の内容を検証

### TC-005: テンプレート取得成功

- **Purpose**: ID によるテンプレート取得が正常に動作する
- **Input**: 取得対象のテンプレート ID
- **Expected**:
  - 正しいテンプレートが返る
- **Steps**:
  1. テンプレートを 1 件作成
  2. getTemplate(id) を呼び出し
  3. 返り値を検証

### TC-006: 存在しないテンプレート取得

- **Purpose**: 存在しない ID で取得した場合の動作
- **Input**: 存在しない ID "non-existent-id"
- **Expected**:
  - undefined が返る
  - error は null のまま
- **Steps**:
  1. getTemplate("non-existent-id") を呼び出し
  2. 返り値が undefined であることを検証

### TC-007: localStorage 読み込みエラー

- **Purpose**: localStorage 読み込み失敗時のエラーハンドリング
- **Input**: localStorage.getItem() が例外を throw
- **Expected**:
  - error に エラーメッセージがセット
  - templates は空配列
  - loading は false
- **Steps**:
  1. localStorage.getItem をモックして例外を throw
  2. useTemplate() を呼び出し
  3. error, templates, loading を検証

### TC-008: localStorage 書き込みエラー

- **Purpose**: localStorage 書き込み失敗時のエラーハンドリング
- **Input**: localStorage.setItem() が例外を throw
- **Expected**:
  - error にエラーメッセージがセット
  - Promise が reject される
  - templates 配列は変更されない（ロールバック）
- **Steps**:
  1. localStorage.setItem をモックして例外を throw
  2. createTemplate() を呼び出し
  3. エラーが throw されることを検証
  4. templates 配列が変更されていないことを検証

### TC-009: 不正な JSON 形式

- **Purpose**: localStorage に不正な JSON がある場合の処理
- **Input**: localStorage に不正な JSON 文字列 "{ invalid json"
- **Expected**:
  - error に エラーメッセージがセット
  - templates は空配列
  - loading は false
- **Steps**:
  1. localStorage に不正な JSON をセット
  2. useTemplate() を呼び出し
  3. error, templates を検証

### TC-010: 複数操作の連続実行

- **Purpose**: CRUD 操作を連続で実行した場合の動作
- **Input**:
  1. createTemplate() × 2
  2. updateTemplate()
  3. deleteTemplate()
- **Expected**:
  - 全操作が正常に完了
  - templates.length === 1
  - localStorage に最終状態が保存される
- **Steps**:
  1. 2 件のテンプレートを作成
  2. 1 件を更新
  3. 1 件を削除
  4. templates 配列を検証
  5. localStorage の内容を検証

## Acceptance Criteria

- [ ] 全ての CRUD 操作が正常に動作する
- [ ] localStorage への永続化が正常に動作する
- [ ] エラーハンドリングが適切に実装されている
- [ ] 10 件のテストケースが全て合格する
- [ ] TypeScript の型エラーが 0 件
- [ ] コードカバレッジが 90%以上

## Notes

### localStorage のキー名

- `paper-ocr-templates`: テンプレート一覧を保存するキー

### ID 生成方法

- `crypto.randomUUID()` または `Date.now() + Math.random()` を使用
- ユニークであることを保証

### Date の扱い

- localStorage に保存する際は ISO 8601 形式の文字列に変換
- 読み込み時に Date オブジェクトに復元

### パフォーマンス最適化

- templates 配列の変更時のみ localStorage に保存
- 大量のテンプレート（100 件以上）でも快適に動作すること

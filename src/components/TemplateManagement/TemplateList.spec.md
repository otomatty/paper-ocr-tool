# TemplateList.spec.md

## Related Files

- Implementation: `TemplateList.tsx`
- Tests: `TemplateList.test.tsx`
- Styles: Tailwind CSS (inline classes)

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_03_template-management.md`
- Plan: `docs/03_plans/template-management/20241102_02_template-list-implementation.md`
- Overall Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-001**: テンプレート一覧をグリッドレイアウトで表示する

  - 各テンプレートカードにサムネイル画像、名前、作成日を表示
  - レスポンシブ対応（モバイル: 1 列、タブレット: 2 列、デスクトップ: 3 列）

- **FR-002**: テンプレートの削除機能を提供する

  - 削除ボタンクリックで確認ダイアログを表示
  - ユーザーが確認した場合のみ削除を実行
  - 削除後、一覧を自動更新

- **FR-003**: テンプレートの選択機能を提供する（オプション）

  - `showSelection` プロパティが true の場合のみ選択ボタンを表示
  - 選択時に `onSelectTemplate` コールバックを呼び出す

- **FR-004**: 空状態の表示
  - テンプレートが 0 件の場合、わかりやすいメッセージを表示
  - 新規作成へのリンクまたはボタンを提供

### Non-Functional Requirements

- **NFR-001**: パフォーマンス

  - 100 件のテンプレートを 1 秒以内に描画
  - 画像サムネイルの最適化（object-fit: cover）

- **NFR-002**: ユーザビリティ

  - 削除操作は明確な確認ステップを含む
  - キーボード操作に対応（Tab、Enter、Escape）
  - スクリーンリーダー対応（適切な aria 属性）

- **NFR-003**: 保守性
  - Tailwind CSS によるユーティリティファーストスタイル
  - コンポーネントの責務を明確に分離
  - useTemplate hook との疎結合

## Interface Definition

```typescript
interface TemplateListProps {
  /**
   * テンプレート選択時のコールバック
   * showSelection が true の場合に使用される
   */
  onSelectTemplate?: (templateId: string) => void;

  /**
   * 選択ボタンを表示するかどうか
   * @default false
   */
  showSelection?: boolean;
}

interface TemplateListState {
  /**
   * 削除確認ダイアログの表示状態
   */
  deleteConfirmOpen: boolean;

  /**
   * 削除対象のテンプレートID
   */
  deleteTargetId: string | null;
}

interface TemplateCardData {
  id: string;
  name: string;
  baseImageData?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Behavior Specification

### Normal Cases

#### ケース 1: 初期表示（テンプレートあり）

- **条件**: useTemplate から複数のテンプレートが返される
- **期待結果**:
  - グリッドレイアウトでテンプレートカードが表示される
  - 各カードにサムネイル、名前、作成日が表示される
  - 各カードに削除ボタンが表示される

#### ケース 2: 初期表示（テンプレートなし）

- **条件**: useTemplate から空の配列が返される
- **期待結果**:
  - 「テンプレートがありません」メッセージが表示される
  - 「新規作成」ボタンまたはリンクが表示される

#### ケース 3: テンプレート削除（正常フロー）

- **条件**: ユーザーが削除ボタンをクリック → 確認ダイアログで「削除」を選択
- **期待結果**:
  1. 削除確認ダイアログが表示される
  2. ダイアログにテンプレート名が表示される
  3. 「削除」ボタンクリックで useTemplate.deleteTemplate が呼ばれる
  4. 削除後、一覧から該当テンプレートが消える

#### ケース 4: テンプレート削除（キャンセル）

- **条件**: ユーザーが削除ボタンをクリック → 確認ダイアログで「キャンセル」を選択
- **期待結果**:
  - ダイアログが閉じる
  - テンプレートは削除されない
  - deleteTemplate が呼ばれない

#### ケース 5: テンプレート選択

- **条件**: `showSelection={true}` かつ選択ボタンをクリック
- **期待結果**:
  - `onSelectTemplate(templateId)` が呼ばれる
  - 選択されたテンプレート ID が渡される

### Edge Cases

#### エッジケース 1: 画像データなしテンプレート

- **条件**: baseImageData が undefined のテンプレート
- **期待結果**:
  - デフォルトのプレースホルダー画像を表示
  - または「画像なし」テキストを表示

#### エッジケース 2: 非常に長いテンプレート名

- **条件**: テンプレート名が 50 文字以上
- **期待結果**:
  - テキストが省略される（text-overflow: ellipsis）
  - ホバーで全文がツールチップ表示される

#### エッジケース 3: テンプレート 1 件のみ

- **条件**: テンプレートが 1 件だけ
- **期待結果**:
  - グリッドレイアウトでカードが 1 つ表示される
  - レイアウトが崩れない

#### エッジケース 4: 削除中の状態

- **条件**: deleteTemplate の Promise が pending 中
- **期待結果**:
  - 削除ボタンが無効化される
  - ローディングインジケーターが表示される（オプション）

### Error Cases

#### エラーケース 1: テンプレート読み込みエラー

- **条件**: useTemplate が error を返す
- **期待結果**:
  - エラーメッセージが表示される
  - 「再試行」ボタンが表示される

#### エラーケース 2: 削除失敗

- **条件**: deleteTemplate が reject される
- **期待結果**:
  - エラーメッセージが表示される
  - テンプレートは一覧に残る
  - ユーザーに再試行の機会を提供

## Component Structure

```tsx
<div className="template-list">
  {loading && <div>読み込み中...</div>}

  {error && (
    <div className="error">
      <p>{error}</p>
      <Button onClick={retry}>再試行</Button>
    </div>
  )}

  {!loading && !error && templates.length === 0 && (
    <div className="empty-state">
      <p>テンプレートがありません</p>
      <Button onClick={goToCreate}>新規作成</Button>
    </div>
  )}

  {!loading && !error && templates.length > 0 && (
    <div className="grid">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onDelete={handleDeleteClick}
          onSelect={showSelection ? handleSelect : undefined}
        />
      ))}
    </div>
  )}

  {deleteConfirmOpen && (
    <DeleteConfirmDialog
      templateName={targetTemplate?.name}
      onConfirm={handleDeleteConfirm}
      onCancel={handleDeleteCancel}
    />
  )}
</div>
```

## Test Cases

### TC-001: 初期表示 - テンプレートあり

- **Purpose**: テンプレートが存在する場合、正しく一覧表示されることを確認
- **Input**:
  - useTemplate が 3 件のテンプレートを返す
- **Expected**:
  - 3 つのテンプレートカードが表示される
  - 各カードにサムネイル、名前、作成日が表示される
- **Steps**:
  1. useTemplate を 3 件のテンプレートでモック
  2. TemplateList をレンダリング
  3. 3 つのカードが存在することを確認
  4. 各カードの内容を確認

### TC-002: 初期表示 - テンプレートなし

- **Purpose**: テンプレートが 0 件の場合、空状態メッセージが表示されることを確認
- **Input**:
  - useTemplate が空の配列を返す
- **Expected**:
  - 「テンプレートがありません」メッセージが表示される
  - 新規作成ボタンが表示される
- **Steps**:
  1. useTemplate を空の配列でモック
  2. TemplateList をレンダリング
  3. 空状態メッセージを確認
  4. 新規作成ボタンを確認

### TC-003: テンプレートカードの内容表示

- **Purpose**: テンプレートカードに必要な情報が全て表示されることを確認
- **Input**:
  - テンプレート: { id: '1', name: 'テスト', createdAt: new Date('2024-11-02') }
- **Expected**:
  - テンプレート名「テスト」が表示される
  - 作成日「2024-11-02」が表示される
  - サムネイル画像が表示される
  - 削除ボタンが表示される
- **Steps**:
  1. 特定のテンプレートでレンダリング
  2. 各要素の表示を確認

### TC-004: 削除ボタンクリック - 確認ダイアログ表示

- **Purpose**: 削除ボタンクリック時に確認ダイアログが表示されることを確認
- **Input**:
  - 削除ボタンをクリック
- **Expected**:
  - 削除確認ダイアログが表示される
  - テンプレート名が表示される
  - 「削除」「キャンセル」ボタンが表示される
- **Steps**:
  1. TemplateList をレンダリング
  2. 削除ボタンをクリック
  3. ダイアログの表示を確認
  4. ダイアログの内容を確認

### TC-005: 削除確認 - キャンセル

- **Purpose**: キャンセルボタンで削除がキャンセルされることを確認
- **Input**:
  - 削除ボタンクリック → キャンセルボタンクリック
- **Expected**:
  - ダイアログが閉じる
  - deleteTemplate が呼ばれない
  - テンプレートは一覧に残る
- **Steps**:
  1. 削除ボタンをクリック
  2. キャンセルボタンをクリック
  3. ダイアログが閉じることを確認
  4. deleteTemplate が呼ばれていないことを確認

### TC-006: 削除確認 - 削除実行

- **Purpose**: 削除ボタンで実際に削除が実行されることを確認
- **Input**:
  - 削除ボタンクリック → 削除ボタンクリック
- **Expected**:
  - deleteTemplate(templateId) が呼ばれる
  - ダイアログが閉じる
  - 一覧からテンプレートが消える
- **Steps**:
  1. 削除ボタンをクリック
  2. 確認ダイアログの削除ボタンをクリック
  3. deleteTemplate が正しい ID で呼ばれることを確認
  4. 一覧が更新されることを確認

### TC-007: 選択機能 - showSelection が false

- **Purpose**: showSelection が false の場合、選択ボタンが表示されないことを確認
- **Input**:
  - showSelection={false} または undefined
- **Expected**:
  - 選択ボタンが表示されない
- **Steps**:
  1. showSelection を false でレンダリング
  2. 選択ボタンが存在しないことを確認

### TC-008: 選択機能 - showSelection が true

- **Purpose**: showSelection が true の場合、選択ボタンが表示されることを確認
- **Input**:
  - showSelection={true}
- **Expected**:
  - 各テンプレートカードに選択ボタンが表示される
- **Steps**:
  1. showSelection を true でレンダリング
  2. 選択ボタンの存在を確認

### TC-009: 選択機能 - 選択ボタンクリック

- **Purpose**: 選択ボタンクリックで onSelectTemplate が呼ばれることを確認
- **Input**:
  - showSelection={true}, onSelectTemplate=mockFn
  - 選択ボタンをクリック
- **Expected**:
  - onSelectTemplate(templateId) が呼ばれる
- **Steps**:
  1. onSelectTemplate をモック関数でレンダリング
  2. 選択ボタンをクリック
  3. モック関数が正しい ID で呼ばれることを確認

### TC-010: 画像なしテンプレート

- **Purpose**: baseImageData が undefined の場合、プレースホルダーが表示されることを確認
- **Input**:
  - テンプレート: { baseImageData: undefined }
- **Expected**:
  - プレースホルダー画像またはテキストが表示される
- **Steps**:
  1. baseImageData なしのテンプレートでレンダリング
  2. プレースホルダーの表示を確認

### TC-011: 長いテンプレート名の省略

- **Purpose**: 長いテンプレート名が適切に省略されることを確認
- **Input**:
  - テンプレート名: 50 文字以上の文字列
- **Expected**:
  - テキストが省略される（...）
  - title 属性に全文が設定される
- **Steps**:
  1. 長い名前のテンプレートでレンダリング
  2. 省略表示を確認
  3. title 属性を確認

### TC-012: ローディング状態

- **Purpose**: ローディング中、適切な表示がされることを確認
- **Input**:
  - useTemplate が loading: true を返す
- **Expected**:
  - 「読み込み中...」メッセージが表示される
- **Steps**:
  1. loading を true でモック
  2. ローディング表示を確認

### TC-013: エラー状態

- **Purpose**: エラー発生時、エラーメッセージと再試行ボタンが表示されることを確認
- **Input**:
  - useTemplate が error: "エラーメッセージ" を返す
- **Expected**:
  - エラーメッセージが表示される
  - 再試行ボタンが表示される
- **Steps**:
  1. error を設定してモック
  2. エラーメッセージを確認
  3. 再試行ボタンを確認

### TC-014: レスポンシブグリッドレイアウト

- **Purpose**: 画面サイズに応じてグリッドのカラム数が変わることを確認
- **Input**:
  - 異なるビューポートサイズ
- **Expected**:
  - モバイル: 1 列
  - タブレット: 2 列
  - デスクトップ: 3 列
- **Steps**:
  1. 異なる画面サイズでレンダリング
  2. グリッドのカラム数を確認

### TC-015: 削除失敗時のエラーハンドリング

- **Purpose**: 削除が失敗した場合、エラーメッセージが表示されることを確認
- **Input**:
  - deleteTemplate が reject される
- **Expected**:
  - エラーメッセージが表示される
  - テンプレートは一覧に残る
- **Steps**:
  1. deleteTemplate をエラーでモック
  2. 削除を実行
  3. エラーメッセージを確認
  4. テンプレートが残っていることを確認

### TC-016: テンプレート 1 件のみ

- **Purpose**: テンプレートが 1 件のみの場合、正常に表示されることを確認
- **Input**:
  - useTemplate が 1 件のテンプレートを返す
- **Expected**:
  - 1 つのテンプレートカードが表示される
  - レイアウトが崩れない
- **Steps**:
  1. 1 件のテンプレートでレンダリング
  2. カードの表示を確認
  3. レイアウトを確認

### TC-017: 複数テンプレートの削除

- **Purpose**: 異なるテンプレートを連続して削除できることを確認
- **Input**:
  - 3 件のテンプレート
  - 1 件目を削除 → 2 件目を削除
- **Expected**:
  - 各削除が独立して実行される
  - 正しい ID で deleteTemplate が呼ばれる
- **Steps**:
  1. 3 件のテンプレートでレンダリング
  2. 1 件目を削除
  3. 2 件目を削除
  4. 各削除が正しく実行されることを確認

## Acceptance Criteria

- [ ] テンプレート一覧がグリッドレイアウトで表示される
- [ ] 各テンプレートカードにサムネイル、名前、作成日が表示される
- [ ] 削除ボタンクリックで確認ダイアログが表示される
- [ ] 削除確認後、テンプレートが削除される
- [ ] キャンセル時、削除がキャンセルされる
- [ ] showSelection が true の場合、選択ボタンが表示される
- [ ] 選択ボタンクリックで onSelectTemplate が呼ばれる
- [ ] テンプレートが 0 件の場合、空状態メッセージが表示される
- [ ] レスポンシブデザイン（モバイル、タブレット、デスクトップ）
- [ ] 画像なしテンプレートでプレースホルダーが表示される
- [ ] 長いテンプレート名が適切に省略される
- [ ] ローディング状態が表示される
- [ ] エラー状態が表示され、再試行できる
- [ ] キーボード操作に対応（Tab、Enter、Escape）
- [ ] スクリーンリーダー対応（適切な aria 属性）
- [ ] 全テストケース（17 件）が合格する
- [ ] テストカバレッジが 80%以上

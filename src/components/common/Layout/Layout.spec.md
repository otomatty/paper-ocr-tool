# Layout.spec.md

## Related Files

- Implementation: `Layout.tsx`
- Tests: `Layout.test.tsx`
- Styles: `Layout.module.css`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_02_common-components-development.md`
- Prompt: `docs/00_prompts/20241102_02_phase2-common-components.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-LAYOUT-001**: ヘッダー領域を表示する
  - アプリケーションタイトルを表示
  - ナビゲーションリンク（Home, Template Management, Data Input）を表示
- **FR-LAYOUT-002**: メインコンテンツ領域を表示する
  - children プロパティで受け取ったコンテンツを表示
  - 適切なパディング・マージンを設定
- **FR-LAYOUT-003**: ナビゲーション機能を提供する
  - React Router の Link コンポーネントでルーティング
  - 現在のページをビジュアルで示す（アクティブ状態）

### Non-Functional Requirements

- **NFR-LAYOUT-001**: レスポンシブ対応
  - モバイル（320px〜）: ハンバーガーメニュー
  - タブレット（768px〜）: 横並びナビゲーション
  - デスクトップ（1024px〜）: フルサイズレイアウト
- **NFR-LAYOUT-002**: アクセシビリティ対応
  - semantic HTML（header, main, nav 要素）
  - ARIA ラベル
  - キーボードナビゲーション対応
- **NFR-LAYOUT-003**: パフォーマンス
  - 再レンダリングの最適化（React.memo）
  - CSS Modules でスタイルのスコープ化

## Interface Definition

```typescript
interface LayoutProps {
  children: React.ReactNode;
  title?: string; // optional: default to "紙アンケートOCR入力効率化アプリ"
}
```

## Behavior Specification

### Normal Cases

- **ケース 1**: children を渡すと、メインコンテンツエリアに表示される
- **ケース 2**: ナビゲーションリンクをクリックすると、対応するページに遷移する
- **ケース 3**: 現在のページに対応するナビゲーションリンクがハイライトされる

### Edge Cases

- **エッジケース 1**: children が空でも、ヘッダーとフッターは正常に表示される
- **エッジケース 2**: 長いコンテンツの場合、スクロール可能

### Error Cases

- **エラーケース 1**: children が undefined → 空のメインエリアを表示（エラーなし）

## Test Cases

### TC-LAYOUT-001: 基本的なレンダリング

- **Purpose**: Layout コンポーネントが正常にレンダリングされることを確認
- **Input**: `<Layout><div>Test Content</div></Layout>`
- **Expected**:
  - ヘッダーが表示される
  - "Test Content" がメインエリアに表示される
  - ナビゲーションリンクが 3 つ表示される
- **Steps**:
  1. Layout コンポーネントをレンダリング
  2. ヘッダー要素の存在を確認
  3. メインコンテンツの存在を確認

### TC-LAYOUT-002: ナビゲーションリンク

- **Purpose**: ナビゲーションリンクが正しく動作することを確認
- **Input**: Layout コンポーネントをレンダリング
- **Expected**:
  - "ホーム", "テンプレート管理", "データ入力" の 3 つのリンクが存在
  - 各リンクに正しい href 属性（/, /template, /data-input）が設定されている
- **Steps**:
  1. Layout コンポーネントをレンダリング
  2. 各ナビゲーションリンクの存在を確認
  3. href 属性を確認

### TC-LAYOUT-003: タイトルのカスタマイズ

- **Purpose**: title プロパティでタイトルをカスタマイズできることを確認
- **Input**: `<Layout title="カスタムタイトル">content</Layout>`
- **Expected**: ヘッダーに "カスタムタイトル" が表示される
- **Steps**:
  1. カスタムタイトルでレンダリング
  2. ヘッダー内のタイトル要素を確認

### TC-LAYOUT-004: デフォルトタイトル

- **Purpose**: title プロパティを省略した場合にデフォルトタイトルが表示されることを確認
- **Input**: `<Layout>content</Layout>`
- **Expected**: ヘッダーに "紙アンケート OCR 入力効率化アプリ" が表示される
- **Steps**:
  1. title なしでレンダリング
  2. デフォルトタイトルの存在を確認

### TC-LAYOUT-005: Semantic HTML

- **Purpose**: 適切な HTML 要素が使用されていることを確認
- **Input**: Layout コンポーネントをレンダリング
- **Expected**:
  - header 要素が存在
  - nav 要素が存在
  - main 要素が存在
- **Steps**:
  1. Layout コンポーネントをレンダリング
  2. 各 semantic HTML 要素の存在を確認

## Acceptance Criteria

- [ ] Layout コンポーネントが実装され、children を正しく表示する
- [ ] ヘッダーにアプリタイトルとナビゲーションが表示される
- [ ] ナビゲーションリンクが動作する
- [ ] CSS Modules でスタイリングされている
- [ ] レスポンシブデザインが実装されている
- [ ] semantic HTML が使用されている
- [ ] すべてのテストが合格する
- [ ] TypeScript エラーがない
- [ ] DEPENDENCY MAP が記載されている

# HomePage.spec.md

## Related Files

- Implementation: `./HomePage.tsx`
- Tests: `./HomePage.test.tsx` (未作成)
- Styles: (共通スタイルのみ使用)

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-HOME-001**: アプリケーションのホームページとして、2 つのメインモード選択を提供
- **FR-HOME-002**: テンプレート管理モードへのナビゲーション機能
- **FR-HOME-003**: データ入力モードへのナビゲーション機能
- **FR-HOME-004**: 各モードの説明を表示

### Non-Functional Requirements

- **NFR-HOME-001**: ページ読み込み時間は 1 秒未満
- **NFR-HOME-002**: シンプルで直感的な UI 構成
- **NFR-HOME-003**: レスポンシブデザイン（Chrome Book 対応）

## Interface Definition

```typescript
// Props定義（現時点ではpropsなし）
interface HomePageProps {}

// State定義（React Routerを使用するため、内部stateなし）
```

## Behavior Specification

### Normal Cases

- **ケース 1**: ページ表示時 → タイトル「紙アンケート OCR 入力システム」を表示
- **ケース 2**: 「テンプレート管理」ボタンクリック → `/template`ページへ遷移
- **ケース 3**: 「データ入力」ボタンクリック → `/data-input`ページへ遷移

### Edge Cases

- **エッジケース 1**: 同じボタンを連続クリック → 多重遷移を防止（React Router が自動処理）

### Error Cases

- **エラーケース 1**: 無効なルートへのアクセス → React Router が 404 処理（将来実装）

## Test Cases

### TC-HOME-001: ページ表示確認

- **Purpose**: ホームページが正しく表示されることを確認
- **Input**: `/`パスへアクセス
- **Expected**:
  - タイトル「紙アンケート OCR 入力システム」が表示される
  - 2 つのボタン（テンプレート管理、データ入力）が表示される
  - 各ボタンの説明テキストが表示される
- **Steps**:
  1. ブラウザで`http://localhost:3000/`へアクセス
  2. ページのレンダリングを確認
  3. 各要素の表示を確認

### TC-HOME-002: テンプレート管理モードへのナビゲーション

- **Purpose**: テンプレート管理ページへの遷移が正しく動作することを確認
- **Input**: 「テンプレート管理」ボタンをクリック
- **Expected**:
  - URL が`/template`に変更される
  - テンプレート管理ページが表示される
- **Steps**:
  1. ホームページを表示
  2. 「テンプレート管理」ボタンをクリック
  3. URL 変更を確認
  4. ページ遷移を確認

### TC-HOME-003: データ入力モードへのナビゲーション

- **Purpose**: データ入力ページへの遷移が正しく動作することを確認
- **Input**: 「データ入力」ボタンをクリック
- **Expected**:
  - URL が`/data-input`に変更される
  - データ入力ページが表示される
- **Steps**:
  1. ホームページを表示
  2. 「データ入力」ボタンをクリック
  3. URL 変更を確認
  4. ページ遷移を確認

## Acceptance Criteria

- [ ] ホームページが正しく表示される（TC-HOME-001 合格）
- [ ] テンプレート管理モードへのナビゲーションが動作する（TC-HOME-002 合格）
- [ ] データ入力モードへのナビゲーションが動作する（TC-HOME-003 合格）
- [ ] ページ読み込み時間が 1 秒未満（NFR-HOME-001）
- [ ] Chrome Book での表示確認完了

## Implementation Notes

### Phase 1 (現在)

- 基本的なレイアウトとナビゲーション機能を実装
- React Router DOM の`Link`コンポーネントを使用

### Phase 2 以降（予定）

- UI デザインの改善（共通 Layout コンポーネント適用）
- ローディング状態の表示
- エラーページ（404）の追加
- アクセシビリティ対応（ARIA 属性追加）

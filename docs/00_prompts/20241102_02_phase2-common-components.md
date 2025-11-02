# Phase 2: 共通コンポーネント開発 - 実装プロンプト

## タスク概要

- **目的**: プロジェクト全体で使用する基本コンポーネントとカスタムフックの実装
- **スコープ**: Layout, Button, Modal, Toast コンポーネント + useLocalStorage, useNotification フック
- **期限**: 2024-11-06 完了予定

## 技術要件

- **使用技術**: React 19, TypeScript, CSS Modules
- **制約条件**:
  - Tailwind CSS は使用せず、CSS Modules で実装
  - テスト駆動開発（TDD）を実践
  - 全コンポーネントに DEPENDENCY MAP を記載
- **依存関係**: Phase 1 で作成した型定義・ユーティリティを活用

## 実装指示

### 1. レガシーファイルのクリーンアップ

以下のファイルを削除し、`.biomeignore` から対応する行を削除：

- `src/APITester.tsx`
- `src/frontend.tsx`
- `src/index.tsx`

### 2. Layout コンポーネント実装

**ファイル**:

- `src/components/common/Layout/Layout.tsx`
- `src/components/common/Layout/Layout.spec.md`
- `src/components/common/Layout/Layout.test.tsx`
- `src/components/common/Layout/Layout.module.css`

**要件**:

- ヘッダー（アプリタイトル、ナビゲーション）
- メインコンテンツエリア
- レスポンシブ対応
- children プロパティでコンテンツを受け取る

### 3. Button コンポーネント実装

**ファイル**:

- `src/components/common/Button/Button.tsx`
- `src/components/common/Button/Button.spec.md`
- `src/components/common/Button/Button.test.tsx`
- `src/components/common/Button/Button.module.css`

**要件**:

- variant プロパティ（primary, secondary, danger）
- size プロパティ（small, medium, large）
- disabled 状態のサポート
- onClick ハンドラー
- アクセシビリティ対応（ARIA 属性）

### 4. useLocalStorage カスタムフック実装

**ファイル**:

- `src/hooks/useLocalStorage.ts`
- `src/hooks/useLocalStorage.spec.md`
- `src/hooks/useLocalStorage.test.ts`

**要件**:

- 型安全な localStorage 操作
- 初期値のサポート
- 自動的な JSON シリアライズ/デシリアライズ
- エラーハンドリング
- React の useState と同様の API

### 5. Modal コンポーネント実装

**ファイル**:

- `src/components/common/Modal/Modal.tsx`
- `src/components/common/Modal/Modal.spec.md`
- `src/components/common/Modal/Modal.test.tsx`
- `src/components/common/Modal/Modal.module.css`

**要件**:

- isOpen プロパティで表示制御
- onClose コールバック
- タイトルとコンテンツ表示
- オーバーレイクリックで閉じる
- ESC キーで閉じる
- フォーカストラップ

### 6. Toast コンポーネント実装

**ファイル**:

- `src/components/common/Toast/Toast.tsx`
- `src/components/common/Toast/Toast.spec.md`
- `src/components/common/Toast/Toast.test.tsx`
- `src/components/common/Toast/Toast.module.css`
- `src/hooks/useNotification.ts`
- `src/hooks/useNotification.spec.md`
- `src/hooks/useNotification.test.ts`

**要件**:

- type プロパティ（success, error, warning, info）
- 自動的に消える（デフォルト 3 秒）
- 手動で閉じる機能
- 複数のトーストを表示できる
- useNotification フックで簡単に使用可能

### 7. 既存ページコンポーネントへの Layout 適用

**修正対象**:

- `src/pages/HomePage.tsx`
- `src/pages/TemplateManagementPage.tsx`
- `src/pages/DataInputPage.tsx`

**要件**:

- 各ページを Layout コンポーネントでラップ
- インラインスタイルを削除し、CSS Modules に移行

## 参照ドキュメント

- Issue: `docs/01_issues/open/2024_11/20241102_02_common-components-development.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
- Code Quality: `docs/rules/code-quality-standards.md`
- Language Rules: `docs/rules/language-rules.md`

## 成果物

- [ ] `src/components/common/Layout/` - Layout コンポーネント一式
- [ ] `src/components/common/Button/` - Button コンポーネント一式
- [ ] `src/components/common/Modal/` - Modal コンポーネント一式
- [ ] `src/components/common/Toast/` - Toast コンポーネント一式
- [ ] `src/hooks/useLocalStorage.ts` - useLocalStorage フック
- [ ] `src/hooks/useNotification.ts` - useNotification フック
- [ ] 各コンポーネント・フックの `.spec.md` ファイル
- [ ] 各コンポーネント・フックの `.test.tsx/.ts` ファイル
- [ ] 既存ページへの Layout 適用
- [ ] レガシーファイル削除

## 定義完了（DoD）

- [ ] すべてのコンポーネントが実装され、動作する
- [ ] すべてのコンポーネントに `.spec.md` が存在する
- [ ] すべてのテストが合格する（`bun run test`）
- [ ] TypeScript のコンパイルエラーがない
- [ ] Biome のチェックエラーがない（`bun run lint`）
- [ ] すべてのファイルに DEPENDENCY MAP が記載されている
- [ ] 既存ページに Layout が適用され、正常に表示される
- [ ] レガシーファイルが削除されている
- [ ] 作業ログが記録されている

## 実装順序

1. レガシーファイル削除（15 分）
2. Layout コンポーネント（2 時間）
3. Button コンポーネント（1 時間）
4. useLocalStorage フック（1 時間）
5. Modal コンポーネント（1.5 時間）
6. Toast + useNotification（1.5 時間）
7. 既存ページへの適用（1 時間）
8. テスト実装・修正（1 時間）
9. ドキュメント更新（30 分）

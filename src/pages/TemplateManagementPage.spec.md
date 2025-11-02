# TemplateManagementPage.spec.md

## Related Files

- Implementation: `./TemplateManagementPage.tsx`
- Tests: `./TemplateManagementPage.test.tsx` (未作成)
- Styles: (共通スタイルのみ使用)

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
- Research: `docs/02_research/2024_11/20241102_01_ocr-technology-comparison.md`

## Requirements

### Functional Requirements

- **FR-TEMPLATE-001**: 空のアンケート用紙を撮影してベース画像として登録
- **FR-TEMPLATE-002**: OCR 対象領域をマウスドラッグで指定
- **FR-TEMPLATE-003**: 領域に名前を付与（例：氏名、Q1 回答）
- **FR-TEMPLATE-004**: 領域の抽出順序を定義
- **FR-TEMPLATE-005**: テンプレートの保存・読み込み機能
- **FR-TEMPLATE-006**: テンプレート一覧表示
- **FR-TEMPLATE-007**: テンプレートの編集・削除機能

### Non-Functional Requirements

- **NFR-TEMPLATE-001**: テンプレートはブラウザローカルストレージに保存
- **NFR-TEMPLATE-002**: 画像はテンプレート定義に含めない（プライバシー保護）
- **NFR-TEMPLATE-003**: 操作はマウス/タッチ両対応
- **NFR-TEMPLATE-004**: Chrome Book カメラとの連携

## Interface Definition

```typescript
// Props定義（現時点ではpropsなし）
interface TemplateManagementPageProps {}

// State定義（Phase 2以降で実装）
interface TemplateManagementState {
  templates: Template[]; // テンプレート一覧
  selectedTemplate: Template | null; // 選択中のテンプレート
  isEditing: boolean; // 編集モード
  cameraStream: MediaStream | null; // カメラストリーム
}

// 使用する型（src/types/template.tsから）
interface Template {
  id: string;
  name: string;
  regions: Region[];
  createdAt: Date;
  updatedAt: Date;
}

interface Region {
  id: string;
  name: string;
  coordinates: RegionCoordinates;
  order: number;
}
```

## Behavior Specification

### Normal Cases

- **ケース 1**: ページ表示時 → テンプレート一覧を表示（Phase 2 実装予定）
- **ケース 2**: 新規作成ボタンクリック → カメラ起動、撮影 UI 表示（Phase 3 実装予定）
- **ケース 3**: 領域選択モード → マウスドラッグで矩形選択（Phase 3 実装予定）
- **ケース 4**: テンプレート保存 → localStorage に保存（Phase 2 実装予定）

### Edge Cases

- **エッジケース 1**: カメラアクセス拒否 → エラーメッセージ表示
- **エッジケース 2**: localStorage 容量不足 → 警告表示
- **エッジケース 3**: 重複テンプレート名 → バリデーションエラー

### Error Cases

- **エラーケース 1**: カメラ初期化失敗 → エラーメッセージとリトライボタン表示
- **エラーケース 2**: テンプレート保存失敗 → エラー通知と再試行提案

## Test Cases

### TC-TEMPLATE-001: ページ表示確認

- **Purpose**: テンプレート管理ページが正しく表示されることを確認
- **Input**: `/template`パスへアクセス
- **Expected**:
  - タイトル「テンプレート管理」が表示される
  - プレースホルダーメッセージが表示される（Phase 1）
  - ホームへ戻るリンクが表示される
- **Steps**:
  1. ブラウザで`http://localhost:3000/template`へアクセス
  2. ページのレンダリングを確認
  3. 各要素の表示を確認

### TC-TEMPLATE-002: テンプレート一覧表示（Phase 2）

- **Purpose**: 保存済みテンプレート一覧が正しく表示されることを確認
- **Input**: localStorage にテンプレートが存在する状態でページアクセス
- **Expected**:
  - テンプレート一覧が表示される
  - 各テンプレートに名前、作成日時、編集・削除ボタンが表示される
- **Steps**:
  1. テストデータを localStorage に保存
  2. ページにアクセス
  3. テンプレート一覧の表示を確認

### TC-TEMPLATE-003: 新規テンプレート作成開始（Phase 3）

- **Purpose**: 新規テンプレート作成フローが正しく開始されることを確認
- **Input**: 「新規作成」ボタンをクリック
- **Expected**:
  - カメラアクセス許可ダイアログが表示される
  - 許可後、カメラプレビューが表示される
  - 撮影ボタンが表示される
- **Steps**:
  1. 新規作成ボタンをクリック
  2. カメラ許可を承認
  3. カメラプレビューの表示を確認

### TC-TEMPLATE-004: 領域選択機能（Phase 3）

- **Purpose**: マウスドラッグによる領域選択が正しく動作することを確認
- **Input**:
  - アンケート画像が表示されている状態
  - マウスでドラッグ操作
- **Expected**:
  - ドラッグ開始点から現在位置まで矩形が描画される
  - ドラッグ終了時に領域が確定される
  - 領域に名前を入力するダイアログが表示される
- **Steps**:
  1. テンプレート画像を表示
  2. 画像上でマウスをドラッグ
  3. 矩形の描画を確認
  4. ドラッグ終了
  5. 名前入力ダイアログの表示を確認

### TC-TEMPLATE-005: テンプレート保存（Phase 3）

- **Purpose**: テンプレートが localStorage に正しく保存されることを確認
- **Input**:
  - テンプレート名: "アンケート A"
  - 領域: 3 つ定義済み
  - 保存ボタンクリック
- **Expected**:
  - localStorage にテンプレートが保存される
  - 成功メッセージが表示される
  - テンプレート一覧ページに遷移する
- **Steps**:
  1. テンプレートを作成
  2. 保存ボタンをクリック
  3. localStorage の内容を確認
  4. 成功メッセージの表示を確認
  5. ページ遷移を確認

## Acceptance Criteria

### Phase 1 (現在)

- [ ] ページが正しく表示される（TC-TEMPLATE-001 合格）
- [ ] ホームへ戻るリンクが動作する
- [ ] Biome のエラーがない

### Phase 2 (11/6-11/10 予定)

- [ ] テンプレート一覧表示機能（TC-TEMPLATE-002 合格）
- [ ] テンプレート削除機能
- [ ] localStorage の正常動作確認

### Phase 3 (11/11-11/15 予定)

- [ ] カメラ撮影機能（TC-TEMPLATE-003 合格）
- [ ] 領域選択機能（TC-TEMPLATE-004 合格）
- [ ] テンプレート保存機能（TC-TEMPLATE-005 合格）
- [ ] バリデーション機能
- [ ] エラーハンドリング

## Implementation Notes

### Phase 1 (現在)

- プレースホルダーページとして実装
- React Router でのルーティング設定のみ

### Phase 2 実装予定

- `useLocalStorage`カスタムフック利用
- `Template`型を使用したテンプレート一覧管理
- CRUD 操作 UI（作成・読み込み・更新・削除）

### Phase 3 実装予定

- `useCamera`カスタムフックでカメラ制御
- Canvas API で領域選択 UI 実装
- ドラッグ＆ドロップによる順序変更

### 技術的制約

- **画像保存なし**: テンプレート定義（領域座標と名前）のみ保存
- **クライアントサイド完結**: サーバー通信なし、プライバシー重視
- **Chrome Book 対応**: タッチ操作とマウス操作の両対応

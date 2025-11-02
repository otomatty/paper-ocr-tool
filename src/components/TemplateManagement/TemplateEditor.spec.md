# TemplateEditor.spec.md

## Related Files

- Implementation: `TemplateEditor.tsx`
- Tests: `TemplateEditor.test.tsx`
- Styles: (inline styles / Tailwind CSS)

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_03_template-management.md`
- Plan: `docs/03_plans/template-management/20241103_01_next-implementation-plan.md`
- Overall Plan: `docs/03_plans/template-management/20241102_01_phase3-overall-plan.md`

## Requirements

### Functional Requirements

- **FR-001**: 3 ステップのウィザード形式でテンプレート作成・編集ができること
  - Step 1: ベース画像撮影（Camera コンポーネント統合）
  - Step 2: OCR 領域選択（RegionSelector コンポーネント統合）
  - Step 3: 確認・保存
- **FR-002**: テンプレート名を入力できること
- **FR-003**: 各ステップ間を自由に遷移できること（戻る/次へボタン）
- **FR-004**: ステップ 1 で撮影した画像をステップ 2 で使用できること
- **FR-005**: ステップ 2 で選択した領域をステップ 3 で確認できること
- **FR-006**: テンプレートを LocalStorage に保存できること
- **FR-007**: 既存テンプレートの編集モードに対応すること
- **FR-008**: バリデーションエラーを表示できること
- **FR-009**: キャンセル機能（編集破棄）を提供すること
- **FR-010**: 保存完了後にコールバックを実行できること

### Non-Functional Requirements

- **NFR-001**: 各ステップの状態を保持し、行き来しても入力内容が失われないこと
- **NFR-002**: バリデーションエラーは即座にフィードバックすること
- **NFR-003**: ローディング状態を明確に表示すること
- **NFR-004**: レスポンシブ対応（モバイル・タブレットでも使用可能）

## Interface Definition

```typescript
interface TemplateEditorProps {
  /**
   * Template ID for edit mode (undefined for create mode)
   */
  templateId?: string;

  /**
   * Callback fired when template is successfully saved
   */
  onSave?: (template: Template) => void;

  /**
   * Callback fired when user cancels editing
   */
  onCancel?: () => void;
}

interface EditorState {
  /**
   * Current step (1: Capture, 2: Region Selection, 3: Confirmation)
   */
  currentStep: 1 | 2 | 3;

  /**
   * Template name input
   */
  templateName: string;

  /**
   * Captured base image data (Base64)
   */
  baseImageData: string | null;

  /**
   * Selected OCR regions
   */
  regions: Region[];

  /**
   * Validation errors
   */
  validationErrors: ValidationError[];

  /**
   * Whether save operation is in progress
   */
  isSaving: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

type EditorStep = 1 | 2 | 3;

interface StepConfig {
  step: EditorStep;
  title: string;
  description: string;
  canGoNext: boolean;
  canGoBack: boolean;
}
```

## Behavior Specification

### Normal Cases

#### ステップ遷移

- **ケース 1**: 初期状態は Step 1（ベース画像撮影）が表示される
- **ケース 2**: Step 1 で画像撮影後、「次へ」ボタンが有効化される
- **ケース 3**: 「次へ」ボタンをクリック → Step 2（領域選択）に遷移する
- **ケース 4**: Step 2 で「戻る」ボタンをクリック → Step 1 に戻る（撮影済み画像は保持）
- **ケース 5**: Step 2 で領域を 1 つ以上選択 → 「次へ」ボタンが有効化される
- **ケース 6**: Step 3 で「戻る」ボタンをクリック → Step 2 に戻る（領域選択は保持）
- **ケース 7**: Step 3 で「保存」ボタンをクリック → テンプレートが保存され、onSave コールバックが呼ばれる

#### テンプレート名入力

- **ケース 8**: テンプレート名入力フィールドは全ステップで表示される
- **ケース 9**: テンプレート名が空の場合、保存ボタンは無効化される
- **ケース 10**: テンプレート名が 1 文字以上入力されている → バリデーション OK

#### 画像撮影（Step 1）

- **ケース 11**: Camera コンポーネントが表示される
- **ケース 12**: 撮影完了 → baseImageData に Base64 データが保存される
- **ケース 13**: 再撮影 → 前の画像が上書きされる

#### 領域選択（Step 2）

- **ケース 14**: RegionSelector に Step 1 で撮影した画像が渡される
- **ケース 15**: 領域を追加・編集・削除できる
- **ケース 16**: 領域の変更内容は即座に state に反映される

#### 確認・保存（Step 3）

- **ケース 17**: テンプレート名、領域数、サムネイル画像が表示される
- **ケース 18**: 領域一覧が順序付きで表示される
- **ケース 19**: 「保存」ボタンをクリック → useTemplate の createTemplate または updateTemplate が呼ばれる
- **ケース 20**: 保存成功 → onSave コールバックが呼ばれる

#### 編集モード

- **ケース 21**: templateId が渡された場合、既存テンプレートを読み込む
- **ケース 22**: 既存のテンプレート名、画像、領域が state に設定される
- **ケース 23**: Step 1 は編集モードでは画像確認のみ（再撮影も可能）
- **ケース 24**: Step 2 で領域を編集できる
- **ケース 25**: 保存時は updateTemplate が呼ばれる

### Edge Cases

#### バリデーション

- **エッジケース 1**: テンプレート名が空 → エラーメッセージ表示、保存ボタン無効化
- **エッジケース 2**: テンプレート名が 50 文字超 → エラーメッセージ表示
- **エッジケース 3**: 画像未撮影で Step 2 に進もうとする → エラーメッセージ表示、遷移不可
- **エッジケース 4**: 領域未選択で Step 3 に進もうとする → エラーメッセージ表示、遷移不可
- **エッジケース 5**: 同名のテンプレートが既に存在 → 警告表示（新規作成時のみ）

#### キャンセル処理

- **エッジケース 6**: 各ステップでキャンセルボタンをクリック → 確認ダイアログ表示
- **エッジケース 7**: 確認ダイアログで OK → onCancel コールバック実行、入力内容破棄
- **エッジケース 8**: 確認ダイアログで Cancel → ダイアログを閉じて編集継続

#### 編集モード特有

- **エッジケース 9**: 無効な templateId が渡された → エラーメッセージ表示
- **エッジケース 10**: テンプレート読み込み中 → ローディング表示

### Error Cases

- **エラーケース 1**: テンプレート保存失敗 → エラーメッセージ表示、リトライ可能
- **エラーケース 2**: テンプレート読み込み失敗 → エラーメッセージ表示、キャンセルを促す
- **エラーケース 3**: カメラアクセス拒否 → Camera 内でエラー表示、Step 1 から進めない

## Test Cases

### TC-001: 初期表示テスト（新規作成モード）

- **Purpose**: 新規作成モードで初期化されること
- **Input**: `templateId` なし
- **Expected**:
  - Step 1 が表示される
  - テンプレート名入力フィールドが空
  - Camera コンポーネントが表示される
  - 「次へ」ボタンが無効
- **Steps**:
  1. TemplateEditor をマウント
  2. 初期表示を確認
  3. ステップインジケーターを確認

### TC-002: 画像撮影フローテスト

- **Purpose**: 画像を撮影して Step 2 に進めること
- **Input**: Camera 経由で画像撮影
- **Expected**:
  - 画像撮影後、「次へ」ボタンが有効化
  - 「次へ」クリックで Step 2 に遷移
  - RegionSelector に画像が渡される
- **Steps**:
  1. Step 1 で画像撮影
  2. 「次へ」ボタンの有効化を確認
  3. 「次へ」をクリック
  4. Step 2 の表示を確認

### TC-003: 領域選択フローテスト

- **Purpose**: 領域を選択して Step 3 に進めること
- **Input**: RegionSelector で領域選択
- **Expected**:
  - 領域選択後、「次へ」ボタンが有効化
  - 「次へ」クリックで Step 3 に遷移
- **Steps**:
  1. Step 2 で領域を 1 つ追加
  2. 「次へ」ボタンの有効化を確認
  3. 「次へ」をクリック
  4. Step 3 の表示を確認

### TC-004: 保存フローテスト

- **Purpose**: テンプレートを保存できること
- **Input**:
  - テンプレート名: "テストテンプレート"
  - 画像データ: 有効な Base64
  - 領域: 1 つ以上
- **Expected**:
  - 「保存」ボタンが有効
  - クリックで createTemplate が呼ばれる
  - onSave コールバックが呼ばれる
- **Steps**:
  1. 全ステップ完了
  2. Step 3 で「保存」をクリック
  3. 保存処理の実行を確認

### TC-005: ステップ戻るテスト

- **Purpose**: 各ステップから前のステップに戻れること
- **Input**: Step 2 または Step 3 から「戻る」をクリック
- **Expected**:
  - 前のステップに遷移する
  - 入力内容が保持される
- **Steps**:
  1. Step 3 まで進む
  2. 「戻る」をクリック
  3. Step 2 に戻ることを確認
  4. 領域選択が保持されていることを確認

### TC-006: テンプレート名バリデーションテスト

- **Purpose**: テンプレート名の入力検証が動作すること
- **Input**:
  - 空文字
  - 51 文字以上の文字列
- **Expected**:
  - エラーメッセージが表示される
  - 保存ボタンが無効化される
- **Steps**:
  1. テンプレート名を空にする
  2. エラーメッセージ確認
  3. 51 文字入力
  4. エラーメッセージ確認

### TC-007: 画像未撮影時の遷移制限テスト

- **Purpose**: 画像未撮影で Step 2 に進めないこと
- **Input**: 画像未撮影の状態で「次へ」をクリック
- **Expected**:
  - エラーメッセージ表示
  - Step 2 に遷移しない
- **Steps**:
  1. Step 1 で画像未撮影
  2. 「次へ」ボタンが無効であることを確認

### TC-008: 領域未選択時の遷移制限テスト

- **Purpose**: 領域未選択で Step 3 に進めないこと
- **Input**: 領域未選択の状態で「次へ」をクリック
- **Expected**:
  - エラーメッセージ表示
  - Step 3 に遷移しない
- **Steps**:
  1. Step 2 で領域未選択
  2. 「次へ」ボタンが無効であることを確認

### TC-009: キャンセル処理テスト

- **Purpose**: キャンセルボタンで編集を破棄できること
- **Input**: 任意のステップで「キャンセル」をクリック
- **Expected**:
  - 確認ダイアログが表示される
  - OK → onCancel コールバック実行
- **Steps**:
  1. Step 1 で「キャンセル」をクリック
  2. 確認ダイアログ表示を確認
  3. OK をクリック
  4. onCancel の呼び出しを確認

### TC-010: 編集モード初期化テスト

- **Purpose**: 既存テンプレートを読み込んで編集できること
- **Input**: `templateId="template-123"`
- **Expected**:
  - テンプレートデータが読み込まれる
  - Step 1 に既存画像が表示される
  - テンプレート名が設定される
- **Steps**:
  1. templateId を指定してマウント
  2. ローディング表示を確認
  3. データ読み込み完了を確認
  4. 既存データの表示を確認

### TC-011: 編集モード保存テスト

- **Purpose**: 編集モードで updateTemplate が呼ばれること
- **Input**:
  - `templateId="template-123"`
  - テンプレート名を変更
- **Expected**:
  - updateTemplate が呼ばれる（createTemplate ではない）
  - 既存 ID が保持される
- **Steps**:
  1. 編集モードで起動
  2. テンプレート名を変更
  3. 保存をクリック
  4. updateTemplate の呼び出しを確認

### TC-012: ステップインジケーター表示テスト

- **Purpose**: 現在のステップが視覚的に分かること
- **Input**: 各ステップに遷移
- **Expected**:
  - アクティブなステップがハイライト表示
  - 完了したステップにチェックマーク
- **Steps**:
  1. Step 1 でインジケーター確認
  2. Step 2 に遷移してインジケーター確認
  3. Step 3 に遷移してインジケーター確認

### TC-013: 保存中ローディング表示テスト

- **Purpose**: 保存処理中にローディング表示されること
- **Input**: 保存ボタンをクリック
- **Expected**:
  - ボタンが無効化される
  - ローディングスピナーが表示される
- **Steps**:
  1. Step 3 で保存をクリック
  2. ローディング状態を確認
  3. 保存完了後の状態を確認

### TC-014: 複数領域の確認表示テスト

- **Purpose**: Step 3 で全領域が表示されること
- **Input**: 3 つの領域を選択
- **Expected**:
  - 領域一覧に 3 つ表示される
  - 順序が正しく表示される
- **Steps**:
  1. Step 2 で 3 つの領域を作成
  2. Step 3 に進む
  3. 領域一覧の表示を確認

### TC-015: 画像再撮影テスト

- **Purpose**: Step 1 で画像を再撮影できること
- **Input**:
  - 1 回目の撮影
  - 2 回目の撮影
- **Expected**:
  - 2 回目の画像で上書きされる
  - Step 2 に前の画像が渡されない
- **Steps**:
  1. 画像を撮影
  2. 再度撮影
  3. Step 2 に進む
  4. 最新の画像が使用されていることを確認

### TC-016: エラーメッセージ表示テスト

- **Purpose**: バリデーションエラーが適切に表示されること
- **Input**: 各種バリデーションエラー
- **Expected**:
  - フィールドごとにエラーメッセージ表示
  - エラー解消で自動的に消える
- **Steps**:
  1. テンプレート名を空にする
  2. エラーメッセージ表示を確認
  3. 名前を入力
  4. エラーメッセージが消えることを確認

### TC-017: レスポンシブ表示テスト

- **Purpose**: モバイル・タブレットでも動作すること
- **Input**: 画面幅を変更
- **Expected**:
  - レイアウトが適切に調整される
  - 機能は変わらず動作する
- **Steps**:
  1. デスクトップサイズで表示確認
  2. タブレットサイズで表示確認
  3. モバイルサイズで表示確認

### TC-018: 保存失敗時のエラーハンドリングテスト

- **Purpose**: 保存失敗時に適切なエラー表示とリトライができること
- **Input**: 保存処理がエラーを返す
- **Expected**:
  - エラーメッセージが表示される
  - リトライボタンが表示される
- **Steps**:
  1. 保存処理をモックしてエラーを返す
  2. 保存をクリック
  3. エラーメッセージ表示を確認
  4. リトライボタンの動作を確認

### TC-019: ステップ間のデータ永続性テスト

- **Purpose**: ステップを行き来してもデータが失われないこと
- **Input**:
  - Step 1: 画像撮影
  - Step 2: 領域選択
  - Step 1 に戻る
  - Step 2 に戻る
- **Expected**:
  - 画像データが保持される
  - 領域選択が保持される
- **Steps**:
  1. Step 2 まで進む
  2. Step 1 に戻る
  3. Step 2 に戻る
  4. データが保持されていることを確認

### TC-020: 同名テンプレート警告テスト

- **Purpose**: 同名テンプレートが存在する場合に警告すること
- **Input**: 既存テンプレートと同じ名前
- **Expected**:
  - 警告メッセージが表示される
  - 保存は可能（上書き確認）
- **Steps**:
  1. 既存テンプレート名を入力
  2. 警告メッセージ表示を確認
  3. 保存時に確認ダイアログ表示を確認

## Acceptance Criteria

- [ ] 3 ステップのウィザードが正常に動作する
- [ ] 各ステップ間を自由に遷移でき、データが保持される
- [ ] テンプレート名のバリデーションが動作する
- [ ] 画像撮影と領域選択が正常に機能する
- [ ] テンプレートの新規作成と編集が動作する
- [ ] 保存処理が正常に完了し、コールバックが実行される
- [ ] キャンセル処理が正常に動作する
- [ ] エラーハンドリングが適切に実装されている
- [ ] ローディング状態が適切に表示される
- [ ] 全テストケース（TC-001〜TC-020）が合格する
- [ ] TypeScript エラーが 0 件
- [ ] コードレビュー完了
- [ ] DEPENDENCY MAP が記載されている

## Technical Notes

### ステップ管理の実装

```typescript
const STEP_CONFIG: Record<EditorStep, StepConfig> = {
  1: {
    step: 1,
    title: "ベース画像撮影",
    description: "空のアンケート用紙を撮影してください",
    canGoNext: false, // baseImageDataがあればtrue
    canGoBack: false,
  },
  2: {
    step: 2,
    title: "OCR領域選択",
    description: "抽出したい領域をドラッグで選択してください",
    canGoNext: false, // regions.length > 0ならtrue
    canGoBack: true,
  },
  3: {
    step: 3,
    title: "確認・保存",
    description: "内容を確認して保存してください",
    canGoNext: false,
    canGoBack: true,
  },
};
```

### バリデーションルール

```typescript
const validateTemplateName = (name: string): ValidationError | null => {
  if (!name.trim()) {
    return {
      field: "templateName",
      message: "テンプレート名を入力してください",
    };
  }
  if (name.length > 50) {
    return {
      field: "templateName",
      message: "テンプレート名は50文字以内で入力してください",
    };
  }
  return null;
};

const validateStep = (
  step: EditorStep,
  state: EditorState
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (step === 1 && !state.baseImageData) {
    errors.push({ field: "image", message: "画像を撮影してください" });
  }

  if (step === 2 && state.regions.length === 0) {
    errors.push({ field: "regions", message: "領域を1つ以上選択してください" });
  }

  const nameError = validateTemplateName(state.templateName);
  if (nameError) {
    errors.push(nameError);
  }

  return errors;
};
```

### カスタムフックの活用

```typescript
// ステップ管理用カスタムフック
const useStepManager = (initialStep: EditorStep = 1) => {
  const [currentStep, setCurrentStep] = useState<EditorStep>(initialStep);

  const goNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as EditorStep);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as EditorStep);
    }
  }, [currentStep]);

  return { currentStep, goNext, goBack, setCurrentStep };
};
```

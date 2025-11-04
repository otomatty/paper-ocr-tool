# DataInputPage.spec.md

## Related Files

- Implementation: `./DataInputPage.tsx`
- Tests: `./DataInputPage.test.tsx`
- Styles: (共通スタイルのみ使用)

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
- Research:
  - `docs/02_research/2024_11/20241102_01_ocr-technology-comparison.md`
  - `docs/02_research/2024_11/20241102_02_react-camera-integration.md`
- Components Used:
  - `src/components/DataInput/OCRProcessor.tsx`
  - `src/components/DataInput/ResultEditor.tsx`
  - `src/components/common/Layout/Layout.tsx`

## Requirements

### Functional Requirements

- **FR-DATA-001**: テンプレート選択機能
- **FR-DATA-002**: 記入済みアンケート用紙の撮影機能
- **FR-DATA-003**: 撮影画像のプレビュー表示
- **FR-DATA-004**: OCR 実行機能（テンプレート定義に基づく領域抽出）
- **FR-DATA-005**: 抽出結果の表示と編集機能
- **FR-DATA-006**: 結果の並べ替え機能（ドラッグ＆ドロップ）
- **FR-DATA-007**: 整形済みテキストのクリップボードコピー機能
- **FR-DATA-008**: 次のアンケート撮影への連続処理対応

### Non-Functional Requirements

- **NFR-DATA-001**: OCR 処理時間は 20 秒以内
- **NFR-DATA-002**: カメラプレビューのフレームレートは 15fps 以上
- **NFR-DATA-003**: 撮影画像は保存せず、メモリ内のみで処理
- **NFR-DATA-004**: OCR エンジン（Tesseract.js）の言語は日本語（jpn）
- **NFR-DATA-005**: ユーザーフィードバック（進捗表示、エラー通知）

## Interface Definition

```typescript
// Props定義（現時点ではpropsなし）
interface DataInputPageProps {}

// State定義（Phase 4以降で実装）
interface DataInputState {
  selectedTemplate: Template | null; // 選択中のテンプレート
  cameraStream: MediaStream | null; // カメラストリーム
  capturedImage: HTMLImageElement | null; // 撮影画像
  ocrResults: OCRResult[]; // OCR結果
  processingStatus: OCRProcessingStatus; // 処理状態
  editableResults: string[]; // 編集可能な結果配列
}

// 使用する型
interface OCRResult {
  regionId: string;
  regionName: string;
  text: string;
  confidence: number;
  order: number;
}

enum OCRProcessingStatus {
  IDLE = "idle",
  LOADING_ENGINE = "loading_engine",
  PROCESSING = "processing",
  COMPLETED = "completed",
  ERROR = "error",
}
```

## Behavior Specification

### Normal Cases

- **ケース 1**: ページ表示時 → テンプレート選択 UI を表示（Phase 4 実装予定）
- **ケース 2**: テンプレート選択 → カメラ起動、撮影準備完了
- **ケース 3**: 撮影実行 → 画像キャプチャ、プレビュー表示
- **ケース 4**: OCR 実行 → 進捗表示、結果取得、編集 UI 表示
- **ケース 5**: 結果編集 → リアルタイム反映、並べ替え対応
- **ケース 6**: クリップボードコピー → 整形済みテキストをコピー、成功通知
- **ケース 7**: 連続撮影 → 結果クリア、カメラに戻る

### Edge Cases

- **エッジケース 1**: テンプレート未選択でページアクセス → 選択 UI へ誘導
- **エッジケース 2**: カメラアクセス拒否 → エラーメッセージ、テンプレート選択に戻る
- **エッジケース 3**: OCR 信頼度が低い（50%未満） → 警告マーク表示
- **エッジケース 4**: 撮影画像のフォーカスが不明瞭 → 再撮影推奨メッセージ
- **エッジケース 5**: ブラウザがクリップボード API をサポートしない → 代替コピー方法提示

### Error Cases

- **エラーケース 1**: Tesseract.js 読み込み失敗 → エラー通知、リトライボタン
- **エラーケース 2**: OCR 処理タイムアウト（20 秒超過） → エラー通知、再試行提案
- **エラーケース 3**: メモリ不足 → エラー通知、ページリロード推奨

## Test Cases

### TC-DATA-001: ページ表示確認

- **Purpose**: データ入力ページが正しく表示されることを確認
- **Input**: `/data-input`パスへアクセス
- **Expected**:
  - タイトル「データ入力」が表示される
  - プレースホルダーメッセージが表示される（Phase 1）
  - ホームへ戻るリンクが表示される
- **Steps**:
  1. ブラウザで`http://localhost:3000/data-input`へアクセス
  2. ページのレンダリングを確認
  3. 各要素の表示を確認

### TC-DATA-002: テンプレート選択（Phase 4）

- **Purpose**: テンプレート選択 UI が正しく動作することを確認
- **Input**: localStorage に 2 つのテンプレートが存在する状態
- **Expected**:
  - テンプレート一覧が表示される
  - 各テンプレートに名前、作成日時、選択ボタンが表示される
  - 選択後、カメラが起動する
- **Steps**:
  1. テストデータを localStorage に保存
  2. ページにアクセス
  3. テンプレート一覧を確認
  4. テンプレートを選択
  5. カメラ起動を確認

### TC-DATA-003: アンケート撮影（Phase 4）

- **Purpose**: カメラ撮影機能が正しく動作することを確認
- **Input**:
  - テンプレート選択済み
  - カメラ起動済み
  - 撮影ボタンクリック
- **Expected**:
  - 撮影時にシャッター音（オプション）
  - 撮影画像がプレビュー表示される
  - OCR 実行ボタンが表示される
  - 再撮影ボタンが表示される
- **Steps**:
  1. カメラプレビューを表示
  2. 撮影ボタンをクリック
  3. 撮影画像のプレビューを確認
  4. UI の変化を確認

### TC-DATA-004: OCR 実行（Phase 5）

- **Purpose**: OCR 処理が正しく実行され、結果が表示されることを確認
- **Input**:
  - 撮影画像: 記入済みアンケート
  - テンプレート: 3 領域定義（氏名、Q1、Q2）
  - OCR 実行ボタンクリック
- **Expected**:
  - ローディング表示（進捗バー）
  - 処理完了後、3 つの結果が順序通りに表示される
  - 各結果に編集ボタン、信頼度表示
  - 処理時間が 20 秒以内
- **Steps**:
  1. OCR 実行ボタンをクリック
  2. ローディング表示を確認
  3. 処理完了を待つ
  4. 結果表示を確認
  5. 処理時間を計測

### TC-DATA-005: 結果編集（Phase 5）

- **Purpose**: OCR 結果の編集機能が正しく動作することを確認
- **Input**:
  - OCR 結果: 「田中太郎」（誤認識）
  - 正しい値: 「田中太朗」
  - 編集ボタンクリック、修正、保存
- **Expected**:
  - テキストボックスが編集可能になる
  - 修正内容がリアルタイムで反映される
  - 保存後、クリップボードコピー対象に反映される
- **Steps**:
  1. OCR 結果を表示
  2. 編集ボタンをクリック
  3. テキストを修正
  4. 保存ボタンをクリック
  5. 結果の更新を確認

### TC-DATA-006: 結果並べ替え（Phase 5）

- **Purpose**: ドラッグ＆ドロップによる結果並べ替えが正しく動作することを確認
- **Input**:
  - OCR 結果: [氏名, Q1, Q2]
  - ドラッグ操作: Q1 を最下部へ移動
- **Expected**:
  - ドラッグ中にプレビューが表示される
  - ドロップ後、順序が [氏名, Q2, Q1] に変更される
  - クリップボードコピー時の順序も変更される
- **Steps**:
  1. OCR 結果を表示
  2. Q1 の項目をドラッグ
  3. 最下部へドロップ
  4. 順序変更を確認

### TC-DATA-007: クリップボードコピー（Phase 5）

- **Purpose**: 整形済みテキストがクリップボードに正しくコピーされることを確認
- **Input**:
  - OCR 結果（編集後）: [氏名: 田中太朗, Q1: 満足, Q2: 良い]
  - コピーボタンクリック
- **Expected**:
  - クリップボードに以下の形式でコピーされる:
    ```
    田中太朗
    満足
    良い
    ```
  - 成功通知（トースト）が表示される
  - 次の撮影へ進むボタンが表示される
- **Steps**:
  1. OCR 結果を編集
  2. コピーボタンをクリック
  3. クリップボードの内容を確認（navigator.clipboard.readText()）
  4. 成功通知の表示を確認

### TC-DATA-008: 連続処理（Phase 5）

- **Purpose**: 連続してアンケートを処理できることを確認
- **Input**:
  - 1 枚目のアンケート処理完了
  - 「次へ」ボタンクリック
- **Expected**:
  - 結果がクリアされる
  - カメラプレビューに戻る
  - 同じテンプレートが選択状態のまま
  - 撮影可能状態
- **Steps**:
  1. 1 枚目のアンケート処理を完了
  2. 「次へ」ボタンをクリック
  3. 結果のクリアを確認
  4. カメラプレビューの再表示を確認

## Acceptance Criteria

### Phase 1 (現在)

- [ ] ページが正しく表示される（TC-DATA-001 合格）
- [ ] ホームへ戻るリンクが動作する
- [ ] Biome のエラーがない

### Phase 4 (11/16-11/20 予定)

- [ ] テンプレート選択機能（TC-DATA-002 合格）
- [ ] カメラ撮影機能（TC-DATA-003 合格）
- [ ] 撮影画像のプレビュー表示

### Phase 5 (11/21-11/25 予定)

- [ ] OCR 実行機能（TC-DATA-004 合格、20 秒以内）
- [ ] 結果編集機能（TC-DATA-005 合格）
- [ ] 結果並べ替え機能（TC-DATA-006 合格）
- [ ] クリップボードコピー機能（TC-DATA-007 合格）
- [ ] 連続処理対応（TC-DATA-008 合格）
- [ ] エラーハンドリング（タイムアウト、メモリ不足）
- [ ] ユーザーフィードバック（進捗表示、通知）

## Implementation Notes

### Phase 1 (現在)

- プレースホルダーページとして実装
- React Router でのルーティング設定のみ

### Phase 4 実装予定（11/16-11/20）

- `useLocalStorage`でテンプレート読み込み
- `useCamera`でカメラ制御
- Canvas API で撮影画像をキャプチャ
- 撮影 → プレビュー → 確認のフロー実装

### Phase 5 実装予定（11/21-11/25）

- Tesseract.js 統合
  - Worker 初期化（メモリ効率重視）
  - 日本語言語データ読み込み
  - 領域ごとに OCR 実行
- OCR 進捗表示（Tesseract.js の logger を利用）
- 結果編集 UI（`contentEditable`またはテキストボックス）
- react-beautiful-dnd で並べ替え実装
- Clipboard API 統合（`navigator.clipboard.writeText()`）
- Toast 通知コンポーネント利用

### 技術的制約

- **画像非保存**: 撮影画像はメモリ内のみ、localStorage 保存なし
- **OCR 処理時間**: Tesseract.js はシングルスレッドのため、大きな画像は時間がかかる
  - 対策: 画像リサイズ（最大 1920x1080）
  - 対策: 領域のみを切り出して OCR 実行
- **信頼度の可視化**: 信頼度 50%未満は警告マーク表示
- **ブラウザ互換性**: Chrome Book（Chrome）を主ターゲット

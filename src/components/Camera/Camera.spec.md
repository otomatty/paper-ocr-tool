# Camera.spec.md

## Related Files

- Implementation: `Camera.tsx`
- Tests: `Camera.test.tsx`
- Hook: `../../hooks/useCamera.ts`
- Styles: `Camera.module.css`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_03_template-management.md`
- Plan: `docs/03_plans/template-management/20241102_01_implementation-plan.md`
- Prompt: `docs/00_prompts/20241102_03_phase3-template-management.md`

## Requirements

### Functional Requirements

- **FR-CAMERA-UI-001**: カメラプレビューの表示

  - `<video>`要素でカメラのリアルタイムプレビューを表示
  - カメラ起動前は「カメラを起動してください」メッセージを表示
  - レスポンシブデザイン（モバイル・タブレット対応）

- **FR-CAMERA-UI-002**: カメラ操作ボタン

  - 「カメラ起動」ボタン - カメラが停止中に表示
  - 「撮影」ボタン - カメラ起動中のみ有効化
  - 「停止」ボタン - カメラ起動中に表示
  - ボタンの状態に応じたスタイル変更（disabled 時はグレーアウト）

- **FR-CAMERA-UI-003**: 撮影画像のプレビュー

  - 撮影後、キャプチャした画像を表示
  - 画像表示中は「再撮影」ボタンを表示
  - 画像サイズは最大幅を制限（レスポンシブ対応）

- **FR-CAMERA-UI-004**: エラー表示

  - カメラアクセスエラーを赤色で表示
  - エラーメッセージは日本語で分かりやすく
  - エラー状態でも操作を継続可能

- **FR-CAMERA-UI-005**: onCapture コールバック
  - 画像キャプチャ時に親コンポーネントへ通知
  - base64 エンコードされた画像データを渡す

### Non-Functional Requirements

- **NFR-CAMERA-UI-001**: アクセシビリティ

  - ボタンに適切な`aria-label`属性
  - ビデオ要素に適切な`aria-live`属性
  - キーボード操作対応

- **NFR-CAMERA-UI-002**: パフォーマンス

  - ビデオストリームの遅延を最小化
  - 画像キャプチャ時の UI 遅延なし

- **NFR-CAMERA-UI-003**: ユーザビリティ
  - 直感的なボタン配置
  - 明確な状態フィードバック
  - エラーメッセージの分かりやすさ

## Interface Definition

```typescript
interface CameraProps {
  /**
   * Callback function called when image is captured
   * @param imageData - Base64 encoded image data (data:image/jpeg;base64,...)
   */
  onCapture?: (imageData: string) => void;

  /**
   * Optional class name for custom styling
   */
  className?: string;

  /**
   * Show captured image preview after capture
   * @default true
   */
  showCapturedImage?: boolean;
}
```

## Component Structure

```
<Camera>
  ├─ <div> (Container)
  │   ├─ <div> (Camera Preview Area)
  │   │   ├─ <video> (Live preview when camera is active)
  │   │   ├─ <img> (Captured image preview)
  │   │   └─ <p> (Status message / Error message)
  │   │
  │   └─ <div> (Control Buttons)
  │       ├─ <Button> (Start Camera)
  │       ├─ <Button> (Capture)
  │       ├─ <Button> (Stop Camera)
  │       └─ <Button> (Retake)
```

## Behavior Specification

### Normal Cases

#### Case 1: 初期表示

- **条件**: コンポーネントマウント直後
- **表示**:
  - 「カメラを起動してください」メッセージ
  - 「カメラ起動」ボタン（有効）
  - 「撮影」「停止」ボタン（非表示または無効）

#### Case 2: カメラ起動成功

- **条件**: 「カメラ起動」ボタンをクリック
- **動作**:
  1. `useCamera.startCamera()`を呼び出し
  2. カメラストリームを`<video>`要素に設定
  3. ビデオ再生開始
- **表示**:
  - リアルタイムカメラプレビュー
  - 「撮影」ボタン（有効）
  - 「停止」ボタン（有効）
  - 「カメラ起動」ボタン（非表示）

#### Case 3: 画像撮影成功

- **条件**: カメラ起動中に「撮影」ボタンをクリック
- **動作**:
  1. `useCamera.captureImage(videoRef.current)`を呼び出し
  2. 撮影画像を取得
  3. `onCapture`コールバックを実行
- **表示**:
  - 撮影画像のプレビュー
  - 「再撮影」ボタン（有効）
  - ビデオプレビューは継続（ストリームは停止しない）

#### Case 4: カメラ停止

- **条件**: 「停止」ボタンをクリック
- **動作**:
  1. `useCamera.stopCamera()`を呼び出し
  2. ビデオストリーム停止
- **表示**: 初期状態に戻る

#### Case 5: 再撮影

- **条件**: 画像表示中に「再撮影」ボタンをクリック
- **動作**:
  1. `useCamera.clearCapturedImage()`を呼び出し
  2. キャプチャ画像をクリア
- **表示**: カメラプレビューに戻る

### Edge Cases

#### Edge Case 1: カメラアクセス拒否

- **条件**: ユーザーがカメラアクセスを拒否
- **動作**: `useCamera`が`NotAllowedError`を設定
- **表示**:
  - エラーメッセージ「カメラへのアクセスが拒否されました...」
  - 「カメラ起動」ボタン（再試行可能）

#### Edge Case 2: カメラが見つからない

- **条件**: デバイスにカメラが存在しない
- **動作**: `useCamera`が`NotFoundError`を設定
- **表示**:
  - エラーメッセージ「カメラが見つかりませんでした...」

#### Edge Case 3: カメラ使用中

- **条件**: 他のアプリがカメラを使用中
- **動作**: `useCamera`が`NotReadableError`を設定
- **表示**:
  - エラーメッセージ「カメラは他のアプリケーションで使用中です」

#### Edge Case 4: onCapture が未定義

- **条件**: `onCapture`プロップが渡されていない
- **動作**: 画像キャプチャは実行されるが、コールバックは呼ばれない
- **表示**: 正常に画像プレビュー表示

### Error Cases

#### Error Case 1: ビデオ要素の参照失敗

- **条件**: `videoRef.current`が`null`
- **動作**: `captureImage`が「ビデオが読み込まれていません」エラーを設定
- **表示**: エラーメッセージ表示

#### Error Case 2: Canvas 取得失敗

- **条件**: Canvas 2D context の取得に失敗
- **動作**: `captureImage`が「画像のキャプチャに失敗しました」エラーを設定
- **表示**: エラーメッセージ表示

## State Management

### Local State

```typescript
const videoRef = useRef<HTMLVideoElement>(null);
```

### Hook State (from useCamera)

```typescript
const {
  stream, // MediaStream | null
  isActive, // boolean
  capturedImage, // string | null (base64)
  error, // string | null
  startCamera, // () => Promise<void>
  stopCamera, // () => void
  captureImage, // (videoElement: HTMLVideoElement) => void
  clearCapturedImage, // () => void
} = useCamera();
```

### State Transitions

```
[Initial] → startCamera() → [Camera Active] → captureImage() → [Image Captured]
                ↓                                                      ↓
            stopCamera()                                      clearCapturedImage()
                ↓                                                      ↓
            [Initial] ←──────────────────────────────────────── [Camera Active]
```

## Test Cases

### TC-CAMERA-UI-001: 初期レンダリング

- **Purpose**: コンポーネントが正しくマウントされ、初期状態が表示されることを確認
- **Input**: なし
- **Expected**:
  - 「カメラを起動してください」メッセージが表示される
  - 「カメラ起動」ボタンが表示され、有効である
  - 「撮影」ボタンは非表示または無効
  - 「停止」ボタンは非表示
  - ビデオ要素は存在するが表示されていない

### TC-CAMERA-UI-002: カメラ起動

- **Purpose**: カメラ起動ボタンをクリックすると、カメラが起動することを確認
- **Steps**:
  1. 「カメラ起動」ボタンをクリック
  2. `useCamera.startCamera()`がモック呼び出しされる
  3. モックで`stream`と`isActive`を設定
- **Expected**:
  - ビデオ要素が表示される
  - 「撮影」ボタンが有効になる
  - 「停止」ボタンが表示される
  - 「カメラ起動」ボタンが非表示になる

### TC-CAMERA-UI-003: 画像撮影

- **Purpose**: 撮影ボタンをクリックすると、画像がキャプチャされることを確認
- **Steps**:
  1. カメラを起動（`isActive = true`）
  2. 「撮影」ボタンをクリック
  3. `useCamera.captureImage()`がモック呼び出しされる
  4. モックで`capturedImage`を設定
- **Expected**:
  - `onCapture`コールバックが呼ばれる（base64 データ付き）
  - キャプチャ画像が表示される
  - 「再撮影」ボタンが表示される

### TC-CAMERA-UI-004: カメラ停止

- **Purpose**: 停止ボタンをクリックすると、カメラが停止することを確認
- **Steps**:
  1. カメラを起動
  2. 「停止」ボタンをクリック
  3. `useCamera.stopCamera()`がモック呼び出しされる
- **Expected**:
  - ビデオプレビューが非表示になる
  - 初期状態に戻る
  - 「カメラ起動」ボタンが再表示される

### TC-CAMERA-UI-005: 再撮影

- **Purpose**: 再撮影ボタンをクリックすると、画像がクリアされることを確認
- **Steps**:
  1. カメラを起動し、画像をキャプチャ
  2. 「再撮影」ボタンをクリック
  3. `useCamera.clearCapturedImage()`がモック呼び出しされる
- **Expected**:
  - キャプチャ画像が非表示になる
  - カメラプレビューに戻る
  - 「撮影」ボタンが再度有効になる

### TC-CAMERA-UI-006: エラー表示

- **Purpose**: カメラエラーが発生した場合、適切にエラーメッセージが表示されることを確認
- **Input**: `useCamera`が`error`を返す
- **Expected**:
  - エラーメッセージが赤色で表示される
  - エラー内容が正しく表示される
  - 「カメラ起動」ボタンは引き続き操作可能

### TC-CAMERA-UI-007: onCapture コールバック

- **Purpose**: `onCapture`プロップが正しく呼び出されることを確認
- **Steps**:
  1. `onCapture`モック関数を渡す
  2. カメラを起動し、画像をキャプチャ
- **Expected**:
  - `onCapture`が 1 回呼ばれる
  - base64 画像データが引数として渡される

### TC-CAMERA-UI-008: showCapturedImage=false

- **Purpose**: `showCapturedImage={false}`の場合、画像プレビューが表示されないことを確認
- **Input**: `showCapturedImage={false}`
- **Steps**: 画像をキャプチャ
- **Expected**:
  - `onCapture`は呼ばれる
  - 画像プレビューは表示されない

### TC-CAMERA-UI-009: ビデオストリーム設定

- **Purpose**: `stream`が変化したときに、video 要素の srcObject が更新されることを確認
- **Steps**:
  1. カメラを起動（`stream`が設定される）
  2. `videoRef.current.srcObject`を確認
- **Expected**:
  - `videoRef.current.srcObject`が`stream`と同じ
  - `videoRef.current.play()`が呼ばれる

### TC-CAMERA-UI-010: アクセシビリティ属性

- **Purpose**: アクセシビリティ属性が適切に設定されることを確認
- **Expected**:
  - ボタンに`aria-label`属性が設定されている
  - ビデオ要素に適切な属性が設定されている

## Acceptance Criteria

- [ ] カメラプレビューが正しく表示される
- [ ] カメラ起動・停止・撮影・再撮影の全操作が動作する
- [ ] エラーメッセージが適切に表示される
- [ ] `onCapture`コールバックが正しく呼ばれる
- [ ] レスポンシブデザインが機能する
- [ ] 全テストケースが合格する（10/10）
- [ ] アクセシビリティ属性が設定されている
- [ ] TypeScript の型エラーがない
- [ ] Lint エラーがない

## Dependencies

- `useCamera` hook (../../hooks/useCamera.ts)
- `Button` component (../common/Button/Button.tsx)
- React (`useRef`, `useEffect`)

## Notes

- ビデオストリームの設定は`useEffect`で行う
- コンポーネントのアンマウント時にカメラを停止する必要はない（親コンポーネントの責任）
- モバイル環境では`facingMode: 'environment'`（背面カメラ）を優先

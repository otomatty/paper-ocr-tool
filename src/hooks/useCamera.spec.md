# useCamera.spec.md

## Related Files

- Implementation: `useCamera.ts`
- Tests: `useCamera.test.ts`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_03_template-management.md`
- Plan: `docs/03_plans/template-management/20241102_01_implementation-plan.md`
- Prompt: `docs/00_prompts/20241102_03_phase3-template-management.md`

## Requirements

### Functional Requirements

- **FR-CAMERA-001**: カメラストリームの起動

  - `navigator.mediaDevices.getUserMedia()` でカメラアクセス
  - カメラ制約: 1920x1080、背面カメラ優先
  - 起動成功時に`stream`状態を更新

- **FR-CAMERA-002**: カメラストリームの停止

  - MediaStream の全トラックを停止
  - `stream`状態を null に更新

- **FR-CAMERA-003**: 画像キャプチャ

  - video 要素から Canvas API で画像を抽出
  - JPEG 形式、80%品質で base64 data URL を生成
  - `capturedImage`状態を更新

- **FR-CAMERA-004**: キャプチャ画像のクリア

  - `capturedImage`を null に戻す

- **FR-CAMERA-005**: エラーハンドリング
  - NotAllowedError: 権限拒否
  - NotFoundError: カメラ未検出
  - NotReadableError: カメラ使用中
  - その他エラー: 一般的なエラーメッセージ

### Non-Functional Requirements

- **NFR-CAMERA-001**: メモリリーク防止

  - コンポーネントアンマウント時にストリーム停止
  - イベントリスナーのクリーンアップ

- **NFR-CAMERA-002**: パフォーマンス

  - 画像キャプチャは 300ms 以内
  - カメラ起動は 2 秒以内

- **NFR-CAMERA-003**: エラーメッセージは日本語

## Interface Definition

```typescript
interface UseCameraReturn {
  stream: MediaStream | null;
  isActive: boolean;
  capturedImage: string | null; // base64 data URL
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: (videoElement: HTMLVideoElement) => void;
  clearCapturedImage: () => void;
}

export function useCamera(): UseCameraReturn;
```

## Behavior Specification

### Normal Cases

- **ケース 1**: カメラ起動

  - 条件: `startCamera()`呼び出し
  - 期待結果: `stream`が設定され、`isActive`が`true`、`error`が`null`

- **ケース 2**: カメラ停止

  - 条件: `stopCamera()`呼び出し
  - 期待結果: `stream`が`null`、`isActive`が`false`

- **ケース 3**: 画像キャプチャ

  - 条件: `captureImage(videoElement)`呼び出し
  - 期待結果: `capturedImage`に`data:image/jpeg;base64,`から始まる文字列が設定

- **ケース 4**: キャプチャ画像クリア
  - 条件: `clearCapturedImage()`呼び出し
  - 期待結果: `capturedImage`が`null`

### Edge Cases

- **エッジケース 1**: カメラが既に起動中

  - 条件: `stream`が存在する状態で`startCamera()`呼び出し
  - 期待結果: 既存ストリームを停止してから新規起動

- **エッジケース 2**: ストリームがない状態で停止

  - 条件: `stream`が`null`の状態で`stopCamera()`呼び出し
  - 期待結果: エラーなし（何もしない）

- **エッジケース 3**: video 要素が無効
  - 条件: `videoElement.videoWidth === 0`で`captureImage()`呼び出し
  - 期待結果: エラーメッセージを設定、`capturedImage`は`null`のまま

### Error Cases

- **エラーケース 1**: カメラアクセス拒否

  - 条件: ユーザーが権限を拒否（NotAllowedError）
  - 期待結果: `error`に「カメラへのアクセスが拒否されました。ブラウザの設定でカメラの使用を許可してください。」

- **エラーケース 2**: カメラ未検出

  - 条件: カメラデバイスが存在しない（NotFoundError）
  - 期待結果: `error`に「カメラが見つかりませんでした。カメラが接続されているか確認してください。」

- **エラーケース 3**: カメラ使用中

  - 条件: 他のアプリがカメラを使用中（NotReadableError）
  - 期待結果: `error`に「カメラは他のアプリケーションで使用中です。」

- **エラーケース 4**: その他のエラー
  - 条件: 予期しないエラー
  - 期待結果: `error`に「カメラの起動に失敗しました。」

## Test Cases

### TC-CAMERA-001: カメラ起動成功

- **Purpose**: カメラが正常に起動できることを確認
- **Input**: `startCamera()`呼び出し
- **Expected**:
  - `stream`が MediaStream オブジェクト
  - `isActive`が`true`
  - `error`が`null`
- **Steps**:
  1. useCamera フックをレンダリング
  2. `startCamera()`を呼び出し
  3. Promise 解決を待つ
  4. 状態を検証

### TC-CAMERA-002: カメラ停止成功

- **Purpose**: カメラが正常に停止できることを確認
- **Input**: カメラ起動後に`stopCamera()`呼び出し
- **Expected**:
  - `stream`が`null`
  - `isActive`が`false`
- **Steps**:
  1. カメラを起動
  2. `stopCamera()`を呼び出し
  3. 状態を検証

### TC-CAMERA-003: 画像キャプチャ成功

- **Purpose**: video 要素から画像をキャプチャできることを確認
- **Input**: 有効な video 要素で`captureImage()`呼び出し
- **Expected**:
  - `capturedImage`が`data:image/jpeg;base64,`で始まる
  - エラーがない
- **Steps**:
  1. モック video 要素を作成
  2. `captureImage(video)`を呼び出し
  3. `capturedImage`を検証

### TC-CAMERA-004: キャプチャ画像クリア

- **Purpose**: キャプチャした画像をクリアできることを確認
- **Input**: 画像キャプチャ後に`clearCapturedImage()`呼び出し
- **Expected**: `capturedImage`が`null`
- **Steps**:
  1. 画像をキャプチャ
  2. `clearCapturedImage()`を呼び出し
  3. `capturedImage`を検証

### TC-CAMERA-005: カメラアクセス拒否エラー

- **Purpose**: 権限拒否時のエラーハンドリングを確認
- **Input**: getUserMedia が NotAllowedError をスロー
- **Expected**: `error`に適切なメッセージ
- **Steps**:
  1. getUserMedia をモックして NotAllowedError をスロー
  2. `startCamera()`を呼び出し
  3. `error`を検証

### TC-CAMERA-006: カメラ未検出エラー

- **Purpose**: カメラ未検出時のエラーハンドリングを確認
- **Input**: getUserMedia が NotFoundError をスロー
- **Expected**: `error`に適切なメッセージ
- **Steps**:
  1. getUserMedia をモックして NotFoundError をスロー
  2. `startCamera()`を呼び出し
  3. `error`を検証

### TC-CAMERA-007: カメラ使用中エラー

- **Purpose**: カメラ使用中エラーのハンドリングを確認
- **Input**: getUserMedia が NotReadableError をスロー
- **Expected**: `error`に適切なメッセージ
- **Steps**:
  1. getUserMedia をモックして NotReadableError をスロー
  2. `startCamera()`を呼び出し
  3. `error`を検証

### TC-CAMERA-008: 一般的なエラー

- **Purpose**: 予期しないエラーのハンドリングを確認
- **Input**: getUserMedia が一般的な Error をスロー
- **Expected**: `error`に一般的なメッセージ
- **Steps**:
  1. getUserMedia をモックして一般的な Error をスロー
  2. `startCamera()`を呼び出し
  3. `error`を検証

## Acceptance Criteria

- [ ] TC-CAMERA-001〜008 が全て合格
- [ ] TypeScript エラーがない
- [ ] Biome チェックエラーがない
- [ ] DEPENDENCY MAP が記載されている
- [ ] エラーメッセージが日本語
- [ ] メモリリークがない（ストリーム停止確認）

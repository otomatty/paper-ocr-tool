# React カメラ統合技術調査

## 調査概要

- **調査日**: 2024-11-02
- **調査者**: プロジェクトチーム
- **目的**: React.js アプリでカメラ機能を統合する最適な手法を選定する

## 調査対象

### 候補 1: MediaDevices getUserMedia API (ネイティブ)

- **概要**: ブラウザ標準のカメラアクセス API
- **メリット**:
  - 外部ライブラリ不要、軽量
  - ブラウザ標準 API、安定性が高い
  - 細かい制御が可能（解像度、フレームレートなど）
  - React hooks との親和性が良い
- **デメリット**:
  - 低レベル API、実装コードが多い
  - ブラウザ差異の対応が必要
  - エラーハンドリングが複雑
- **実装コスト**: 中（標準 API の学習コスト）

### 候補 2: react-webcam ライブラリ

- **概要**: React 専用の Web カメラコンポーネントライブラリ
- **メリット**:
  - React 用に最適化されたコンポーネント
  - 簡単な実装で基本機能を実現
  - TypeScript サポート
  - 豊富な設定オプション
- **デメリット**:
  - 外部依存の追加
  - カスタマイズの制約
  - ライブラリのメンテナンス依存
- **実装コスト**: 低（すぐに使える）

### 候補 3: HTML5 input[type="file"] capture

- **概要**: HTML5 のファイル入力でカメラを直接呼び出し
- **メリット**:
  - 最もシンプルな実装
  - モバイルデバイスでのネイティブカメラアプリ起動
  - ライブラリ不要
- **デメリット**:
  - ライブ映像表示ができない
  - テンプレートオーバーレイ表示不可
  - カメラ設定の制御不可
- **実装コスト**: 最低（基本 HTML）

## 技術的検証

### getUserMedia の実装例

```typescript
// Custom Hook for Camera
import { useState, useRef, useCallback } from "react";

interface CameraConstraints {
  width: number;
  height: number;
}

export const useCamera = (constraints: CameraConstraints) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: constraints.width,
          height: constraints.height,
          facingMode: "environment", // 背面カメラを優先
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("カメラへのアクセスに失敗しました");
      console.error("Camera access error:", err);
    }
  }, [constraints]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback((): HTMLCanvasElement | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
    }

    return canvas;
  }, []);

  return {
    videoRef,
    stream,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
  };
};
```

### react-webcam の実装例

```tsx
import Webcam from "react-webcam";

const CameraComponent: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    return imageSrc;
  }, []);

  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      videoConstraints={{
        width: 1920,
        height: 1080,
        facingMode: "environment",
      }}
    />
  );
};
```

## 比較結果

| 項目             | getUserMedia | react-webcam | input capture | 重要度   |
| ---------------- | ------------ | ------------ | ------------- | -------- |
| 実装の容易さ     | △            | ◎            | ◎             | 高       |
| カスタマイズ性   | ◎            | ○            | ×             | **最高** |
| ライブ映像表示   | ◎            | ◎            | ×             | **最高** |
| オーバーレイ対応 | ◎            | ◎            | ×             | **最高** |
| バンドルサイズ   | ◎            | ○            | ◎             | 中       |
| TypeScript 対応  | ○            | ◎            | ◎             | 高       |
| メンテナンス性   | ◎            | ○            | ◎             | 高       |

## 要件との適合性チェック

### 必須要件

1. **ライブ映像表示**: テンプレート枠線をオーバーレイ表示するため必須
2. **高解像度撮影**: OCR 精度向上のため 1920x1080 以上
3. **Chrome Book 対応**: 内蔵・外付けカメラの両方に対応
4. **React 統合**: 既存の React アプリに統合

### 評価結果

- **getUserMedia**: ✅ 全要件を満たし、最大の柔軟性
- **react-webcam**: ✅ 全要件を満たし、実装が簡単
- **input capture**: ❌ ライブ映像・オーバーレイ表示不可

## 推奨案

**選択**: **getUserMedia API (ネイティブ実装) + カスタムフック**

**理由**:

1. **要件への完全適合**: ライブ映像、オーバーレイ、高解像度すべてに対応
2. **将来性**: ブラウザ標準 API、長期的な安定性
3. **カスタマイズ性**: テンプレートオーバーレイ等の独自機能実装が容易
4. **パフォーマンス**: 外部ライブラリなし、軽量
5. **学習価値**: Web 標準技術の習得

**実装戦略**:

1. **カスタムフック**: `useCamera` でカメラ機能をカプセル化
2. **エラーハンドリング**: 権限拒否、デバイスなし等の適切な処理
3. **レスポンシブ対応**: 画面サイズに応じたカメラ表示
4. **オーバーレイシステム**: SVG または Canvas でテンプレート枠線表示

**開発段階での考慮事項**:

- **プロトタイプ段階**: react-webcam で素早く検証
- **本格実装段階**: getUserMedia で要件に最適化

## 実装詳細設計

### コンポーネント構造

```
src/components/Camera/
├── Camera.tsx              # メインカメラコンポーネント
├── Camera.spec.md          # 仕様書
├── Camera.test.tsx         # テスト
├── CameraOverlay.tsx       # テンプレート枠線オーバーレイ
├── hooks/
│   └── useCamera.ts        # カメラフック
└── utils/
    └── cameraUtils.ts      # カメラ関連ユーティリティ
```

### テンプレートオーバーレイ実装

```tsx
interface CameraOverlayProps {
  templateRegions: Region[];
  videoSize: { width: number; height: number };
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({
  templateRegions,
  videoSize,
}) => {
  return (
    <svg
      className="camera-overlay"
      width={videoSize.width}
      height={videoSize.height}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {templateRegions.map((region) => (
        <rect
          key={region.id}
          x={region.x}
          y={region.y}
          width={region.width}
          height={region.height}
          fill="none"
          stroke="#00ff00"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      ))}
    </svg>
  );
};
```

## リスクと対策

### リスク 1: ブラウザ権限拒否

- **対策**: 明確な説明とユーザーガイド、代替手段（ファイルアップロード）の提供

### リスク 2: カメラデバイスの差異

- **対策**: 複数の制約設定でのフォールバック処理

### リスク 3: 実装の複雑さ

- **対策**: 段階的実装（まずは基本機能、その後オーバーレイ等）

## 次のアクション

- [ ] getUserMedia の詳細実装設計
- [ ] Chrome Book 実機での動作検証
- [ ] オーバーレイ機能の技術検証
- [ ] エラーハンドリング戦略の詳細化

## 参照資料

- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia)
- [react-webcam GitHub](https://github.com/mozmorris/react-webcam)
- [WebRTC Samples](https://webrtc.github.io/samples/)
- [Camera API Best Practices](https://developer.chrome.com/docs/capabilities/web-apis/)

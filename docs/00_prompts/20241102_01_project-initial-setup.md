# プロジェクト初期セットアップ実装プロンプト

## タスク概要

- **目的**: 紙アンケート OCR 入力効率化 Web アプリの初期プロジェクト構造を構築する
- **スコープ**: Phase 1 - プロジェクト基盤構築の実装
- **期限**: 2024-11-05

## 技術要件

- **使用技術**: Bun, Vite, React.js, TypeScript
- **対応ブラウザ**: Google Chrome 最新版（Chrome Book 対応）
- **制約条件**:
  - 全処理はクライアントサイドで完結
  - テンプレート情報のみローカルストレージに保存
  - 個人情報は一切永続化しない

## 実装指示

### 1. プロジェクト基盤の確認・拡張

現在のプロジェクトは Bun + Vite + React + TypeScript が既に初期化済み。以下を追加実装：

#### 1-1. ディレクトリ構造の整備

```
src/
├── components/
│   ├── common/          # 共通コンポーネント
│   ├── Camera/          # カメラ機能
│   ├── TemplateManagement/  # テンプレート管理
│   └── DataInput/       # データ入力・OCR
├── hooks/               # カスタムフック
├── utils/               # ユーティリティ関数
├── types/               # TypeScript型定義
├── config/              # 設定ファイル
├── pages/               # ページコンポーネント
└── styles/              # グローバルスタイル
```

#### 1-2. 基本的なルーティング設定

React Router を使用してテンプレート管理モードとデータ入力モードの切り替えを実装

#### 1-3. 開発環境設定

- Biome 設定（TypeScript, React 対応の統合リンター・フォーマッター）
- Vite プラグインの最適化

### 2. 型定義ファイルの作成

#### 2-1. `src/types/template.ts`

```typescript
export interface Region {
  id: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  order: number;
}

export interface Template {
  id: string;
  name: string;
  baseImageData?: string; // Base64 encoded
  regions: Region[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateRequest {
  name: string;
  baseImageData: string;
  regions: Omit<Region, "id">[];
}
```

#### 2-2. `src/types/ocr.ts`

```typescript
export interface OCRResult {
  regionId: string;
  regionName: string;
  text: string;
  confidence: number;
  processingTime: number;
}

export interface OCRProcessingStatus {
  isProcessing: boolean;
  currentRegion?: string;
  progress: number; // 0-100
  completed: OCRResult[];
  error?: string;
}
```

#### 2-3. `src/types/camera.ts`

```typescript
export interface CameraConstraints {
  width: number;
  height: number;
  facingMode?: "user" | "environment";
}

export interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  capturedImage: HTMLCanvasElement | null;
}
```

### 3. 設定ファイルの作成

#### 3-1. `src/config/appConfig.ts`

```typescript
export const APP_CONFIG = {
  CAMERA: {
    DEFAULT_WIDTH: 1920,
    DEFAULT_HEIGHT: 1080,
    FACING_MODE: "environment" as const,
  },
  OCR: {
    LANGUAGE: "jpn",
    MAX_PROCESSING_TIME: 20000, // 20秒
    CONFIDENCE_THRESHOLD: 0.6,
  },
  STORAGE: {
    TEMPLATE_KEY: "ocr-app-templates",
    MAX_TEMPLATES: 20,
  },
  UI: {
    TOAST_DURATION: 3000,
    MODAL_ANIMATION_DURATION: 300,
  },
} as const;
```

### 4. 基本レイアウトコンポーネントの実装

#### 4-1. `src/components/common/Layout/Layout.tsx`

アプリケーション全体のレイアウト（ヘッダー、メイン、ナビゲーション）

#### 4-2. `src/pages/TemplateManagementPage.tsx`

テンプレート管理モードのメインページ

#### 4-3. `src/pages/DataInputPage.tsx`

データ入力モードのメインページ

### 5. ルーティング設定

#### 5-1. `src/App.tsx` の更新

React Router を使用してモード切り替えを実装：

- `/` - ランディング/モード選択
- `/template` - テンプレート管理モード
- `/data-input` - データ入力モード

### 6. ユーティリティ関数の基盤

#### 6-1. `src/utils/localStorage.ts`

ローカルストレージ操作の統一インターフェース

#### 6-2. `src/utils/validation.ts`

入力値検証関数

### 7. 開発・品質管理設定

#### 7-1. `biome.json` 設定

TypeScript + React + アクセシビリティルールの設定

- リンター・フォーマッター統合ツール
- `bun run lint` - コードチェック
- `bun run lint:fix` - 自動修正
- `bun run format` - フォーマット

#### 7-2. `vite.config.ts` 最適化

- PWA プラグインの設定（オフライン対応）
- バンドル最適化設定

## 参照ドキュメント

- **Issue**: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- **Research**:
  - `docs/02_research/2024_11/20241102_01_ocr-technology-comparison.md`
  - `docs/02_research/2024_11/20241102_02_react-camera-integration.md`
- **Plan**: `docs/03_plans/overall/20241102_01_project-overall-plan.md`

## 成果物

- [ ] `src/` 配下の完全なディレクトリ構造
- [ ] 基本的な型定義ファイル (`types/`)
- [ ] アプリケーション設定ファイル (`config/`)
- [ ] レイアウト・ページコンポーネント
- [ ] ルーティング設定
- [ ] 基本的なユーティリティ関数
- [x] Biome 設定ファイル
- [ ] 各コンポーネントの `.spec.md` ファイル作成

## 定義完了（DoD）

- [ ] `bun run dev` でアプリケーションが正常に起動する
- [ ] `/template` と `/data-input` ページが表示される
- [ ] TypeScript エラーがない
- [ ] Biome のチェックエラーがない
- [ ] 基本的なナビゲーションが動作する
- [ ] Chrome Book の Chrome ブラウザで動作確認完了
- [ ] 各ファイルの DEPENDENCY MAP が正しく記載されている
- [ ] `.spec.md` ファイルが対応する実装ファイルと関連付けられている

## 実装時の注意事項

1. **依存関係の明示**: 全ファイルに DEPENDENCY MAP を記載
2. **型安全性**: any 型の使用を避け、適切な型定義を実装
3. **アクセシビリティ**: WAI-ARIA ガイドラインに準拠
4. **パフォーマンス**: 不要な再レンダリングを避ける実装
5. **エラーハンドリング**: 適切なエラー境界とユーザーフィードバック

この基盤が完成次第、Phase 2 の共通コンポーネント開発に進行します。

# 紙アンケート OCR 入力効率化 Web アプリ - 全体実装計画

## 計画概要

- **計画日**: 2024-11-02
- **担当者**: プロジェクトチーム
- **完了予定**: 2024-11-30
- **プロジェクト種別**: 新規 Web アプリケーション開発

## プロジェクト全体構造

### 技術スタック

- **フロントエンド**: React.js + TypeScript + Vite
- **OCR エンジン**: Tesseract.js
- **状態管理**: React Hooks (useState, useContext)
- **データ保存**: ブラウザローカルストレージ
- **スタイリング**: CSS Modules
- **テスト**: Vitest (Bun に内蔵)
- **開発環境**: Bun

### アプリケーション構成

```
紙アンケートOCRアプリ
├── テンプレート管理モード
│   ├── テンプレート一覧画面
│   ├── テンプレート作成・編集画面
│   └── テンプレート削除機能
└── データ入力モード
    ├── カメラ撮影画面
    ├── OCR処理画面
    ├── 結果編集画面
    └── データ出力機能
```

## 開発段階

### Phase 1: プロジェクト基盤構築 (11/2-11/5, 4 日)

**目標**: 開発環境の整備とプロジェクト骨格の構築

**ステータス**: ✅ **完了** (2024-11-02)

**タスク**:

- [x] プロジェクト初期化（Bun + Vite + React + TypeScript） (2 時間)
- [x] 基本的なディレクトリ構造の構築 (2 時間)
- [x] Biome の設定 (1 時間)
- [x] 基本的なルーティング設定（React Router DOM 7.9.5） (2 時間)
- [x] ドキュメント体系の整備 (3 時間)
- [x] 型定義ファイル作成（template.ts, ocr.ts, camera.ts） (2 時間)
- [x] 設定ファイル作成（appConfig.ts） (1 時間)
- [x] ユーティリティ関数作成（localStorage.ts, validation.ts） (2 時間)
- [x] ページコンポーネント作成（Home, Template, DataInput） (2 時間)
- [x] 仕様書作成（各ページの.spec.md） (2 時間)

**成果物**:

- ✅ `src/` ディレクトリの基本構造（types, config, utils, pages）
- ✅ `docs/` ディレクトリの完全なドキュメント体系（PROMPT, ISSUE, RESEARCH, PLAN, LOG）
- ✅ 開発環境の設定ファイル群（biome.json, .biomeignore）
- ✅ React Router DOM 設定完了（/, /template, /data-input）
- ✅ 型定義ファイル（Template, OCRResult, CameraState）
- ✅ ユーティリティ関数（localStorage 操作, バリデーション）
- ✅ 各ページの仕様書（HomePage.spec.md, TemplateManagementPage.spec.md, DataInputPage.spec.md）

**作業ログ**: `docs/05_logs/2024_11/20241102/02_phase1-implementation-completed.md`

### Phase 2: 共通コンポーネント開発 (11/6-11/10, 5 日)

**目標**: プロジェクト全体で使用する基本コンポーネントの実装

**タスク**:

- [ ] Layout コンポーネント（ヘッダー、メイン、ナビゲーション） (4 時間)
- [ ] Button コンポーネント (2 時間)
- [ ] Modal コンポーネント (3 時間)
- [ ] Toast/Notification コンポーネント (2 時間)
- [ ] ローカルストレージ操作ユーティリティ (3 時間)
- [ ] 型定義ファイルの整備 (2 時間)

**成果物**:

- `src/components/common/` 配下の共通コンポーネント
- `src/types/` 配下の型定義ファイル
- `src/utils/` 配下のユーティリティ関数

### Phase 3: テンプレート管理機能 (11/11-11/17, 7 日)

**目標**: アンケートテンプレートの作成・管理機能の実装

**サブフェーズ 3-1**: カメラ機能とテンプレート作成 (3 日)

- [ ] Camera コンポーネント実装 (6 時間)
- [ ] useCamera カスタムフック実装 (4 時間)
- [ ] 画像撮影・表示機能 (3 時間)
- [ ] テンプレート作成画面の基本レイアウト (3 時間)

**サブフェーズ 3-2**: 領域選択とテンプレート保存 (4 日)

- [ ] 領域選択機能（ドラッグ＆ドロップ） (8 時間)
- [ ] 領域サイズ変更機能 (4 時間)
- [ ] 領域名付与機能 (2 時間)
- [ ] 領域順序管理機能 (3 時間)
- [ ] テンプレート保存機能 (3 時間)
- [ ] テンプレート一覧表示機能 (2 時間)

**成果物**:

- `src/components/TemplateManagement/` 配下のコンポーネント群
- `src/hooks/useTemplate.ts` カスタムフック
- `src/utils/templateStorage.ts` ストレージユーティリティ

### Phase 4: OCR 処理機能 (11/18-11/22, 5 日)

**目標**: Tesseract.js を使用した OCR 処理機能の実装

**タスク**:

- [ ] Tesseract.js 統合とセットアップ (4 時間)
- [ ] OCR 処理ユーティリティ実装 (6 時間)
- [ ] 画像前処理機能（リサイズ、コントラスト調整） (4 時間)
- [ ] 領域切り出し機能 (4 時間)
- [ ] 一括 OCR 処理機能 (4 時間)
- [ ] 進行状況表示機能 (2 時間)

**成果物**:

- `src/utils/ocrEngine.ts` OCR エンジンユーティリティ
- `src/utils/imageProcessor.ts` 画像処理ユーティリティ
- `src/hooks/useOCR.ts` OCR カスタムフック

### Phase 5: データ入力・編集機能 (11/23-11/26, 4 日)

**目標**: 撮影から OCR、結果編集までの統合機能実装

**タスク**:

- [ ] データ入力モードの画面実装 (4 時間)
- [ ] テンプレートオーバーレイ表示機能 (4 時間)
- [ ] OCR 結果表示・編集機能 (4 時間)
- [ ] 結果の並べ替え機能（ドラッグ＆ドロップ） (4 時間)
- [ ] クリップボードコピー機能 (2 時間)
- [ ] 対話型 OCR 機能（オプション） (2 時間)

**成果物**:

- `src/components/DataInput/` 配下のコンポーネント群
- `src/hooks/useOCRProcessing.ts` OCR 処理統合フック

### Phase 6: 統合・テスト・最適化 (11/27-11/30, 4 日)

**目標**: 全機能の統合、テスト、パフォーマンス最適化

**タスク**:

- [ ] 統合テストの実装と実行 (6 時間)
- [ ] Chrome Book 実機での動作確認 (4 時間)
- [ ] パフォーマンス最適化（処理時間短縮） (4 時間)
- [ ] UI/UX 改善 (3 時間)
- [ ] エラーハンドリングの強化 (3 時間)

**成果物**:

- 完成版 Web アプリケーション
- テストスイート
- デプロイ可能なビルド

## ファイル構造設計

```
src/
├── components/
│   ├── common/                    # 共通コンポーネント
│   │   ├── Layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Layout.spec.md
│   │   │   └── Layout.test.tsx
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Toast/
│   ├── Camera/                    # カメラ機能
│   │   ├── Camera.tsx
│   │   ├── Camera.spec.md
│   │   ├── Camera.test.tsx
│   │   ├── CameraOverlay.tsx
│   │   └── hooks/
│   │       └── useCamera.ts
│   ├── TemplateManagement/        # テンプレート管理
│   │   ├── TemplateList.tsx
│   │   ├── TemplateEditor.tsx
│   │   ├── RegionSelector.tsx
│   │   └── hooks/
│   │       └── useTemplate.ts
│   └── DataInput/                 # データ入力・OCR
│       ├── OCRProcessor.tsx
│       ├── ResultEditor.tsx
│       ├── ResultList.tsx
│       └── hooks/
│           └── useOCRProcessing.ts
├── hooks/                         # 共通カスタムフック
│   ├── useLocalStorage.ts
│   └── useNotification.ts
├── utils/                         # ユーティリティ
│   ├── templateStorage.ts
│   ├── ocrEngine.ts
│   ├── imageProcessor.ts
│   └── clipboard.ts
├── types/                         # 型定義
│   ├── template.ts
│   ├── ocr.ts
│   └── camera.ts
├── config/                        # 設定
│   ├── ocrConfig.ts
│   └── appConfig.ts
└── pages/                         # ページコンポーネント
    ├── TemplateManagementPage.tsx
    └── DataInputPage.tsx
```

## 技術設計の詳細

### 状態管理設計

```typescript
// アプリケーション全体の状態
interface AppState {
  currentMode: "template" | "data-input";
  selectedTemplate: Template | null;
  ocrResults: OCRResult[];
  isProcessing: boolean;
}

// テンプレート状態
interface TemplateState {
  templates: Template[];
  currentTemplate: Template | null;
  isEditing: boolean;
}

// カメラ状態
interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  capturedImage: HTMLCanvasElement | null;
  error: string | null;
}
```

### データフロー設計

```
[User Action] → [Component] → [Custom Hook] → [Utility Function] → [Local Storage]
     ↓              ↑              ↑               ↑                    ↓
[UI Update] ← [State Update] ← [Data Process] ← [Result] ← [Storage Operation]
```

### API 設計

```typescript
// テンプレート管理API
interface TemplateAPI {
  createTemplate(template: CreateTemplateRequest): Promise<Template>;
  updateTemplate(
    id: string,
    template: UpdateTemplateRequest
  ): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  getTemplates(): Promise<Template[]>;
}

// OCR処理API
interface OCRAPI {
  processRegions(
    image: HTMLImageElement,
    regions: Region[]
  ): Promise<OCRResult[]>;
  processRegion(image: HTMLImageElement, region: Region): Promise<OCRResult>;
  preprocessImage(image: HTMLImageElement): Promise<HTMLImageElement>;
}
```

## テスト戦略

### Unit Test (Vitest)

- **対象**: Utils, Hooks, Pure Functions
- **カバレッジ目標**: 80%以上
- **重点テスト**: OCR 処理、テンプレート管理、データ変換

### Component Test

- **対象**: 個別コンポーネントの動作
- **ツール**: React Testing Library
- **重点テスト**: Props 変化、User Interaction

### Integration Test

- **対象**: カメラ → OCR → 結果表示の統合フロー
- **重点テスト**: データフロー全体の整合性

### E2E Test (手動)

- **対象**: 実際の Chrome Book 上での動作
- **テスト内容**: 実際のアンケート用紙での一連の処理

## パフォーマンス目標

### 処理時間目標

- **テンプレート作成**: 操作開始から保存まで 2 分以内
- **OCR 処理**: A4・10 領域で 20 秒以内
- **結果編集**: リアルタイム応答（100ms 以内）

### メモリ使用量目標

- **アプリ起動時**: 50MB 以下
- **OCR 処理中**: 150MB 以下
- **大量テンプレート保存時**: 100MB 以下

## リスクと対策

### 技術リスク

**リスク 1**: OCR 処理時間が目標を超過

- **対策**: Web Worker 活用、処理の並列化、画像最適化

**リスク 2**: カメラアクセス権限問題

- **対策**: 明確なガイダンス、代替手段（ファイルアップロード）

**リスク 3**: ブラウザ互換性問題

- **対策**: Chrome 最新版の動作確認、ポリフィル導入

### 進行リスク

**リスク 4**: 開発期間の延長

- **対策**: MVP 機能に絞った段階的リリース、オプション機能の後回し

## 進捗追跡

### マイルストーン

- [ ] Phase 1: プロジェクト基盤完了 (11/5)
- [ ] Phase 2: 共通コンポーネント完了 (11/10)
- [ ] Phase 3: テンプレート管理完了 (11/17)
- [ ] Phase 4: OCR 処理完了 (11/22)
- [ ] Phase 5: データ入力完了 (11/26)
- [ ] Phase 6: 統合・テスト完了 (11/30)

### 品質ゲート

各 Phase 完了時の必須条件:

- [ ] 全 Spec.md ファイルの作成・更新
- [ ] 対応するテストの作成・実行
- [ ] 作業ログの記録
- [ ] Issue 状況の更新

## 成果物定義

### 最終成果物

- **Web アプリケーション**: Chrome Book で動作する完全な OCR アプリ
- **ドキュメント**: 完全な spec.md、plan、research、log
- **テストスイート**: 80%以上のカバレッジ
- **利用マニュアル**: エンドユーザー向け操作ガイド

### デプロイ要件

- **静的ファイル**: HTML, CSS, JS のみ
- **ホスティング**: GitHub Pages または同等の static hosting
- **HTTPS**: カメラアクセスのため必須

この全体計画に従い、段階的かつ確実にプロジェクトを進行します。

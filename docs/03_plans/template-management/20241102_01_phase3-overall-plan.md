# Phase 3: テンプレート管理機能 - 全体実装計画

## 計画概要

- **計画日**: 2024-11-02
- **フェーズ**: Phase 3 - Template Management
- **完了予定**: 2024-11-04（3 日間）
- **目的**: アンケート用紙のテンプレート作成・管理機能の実装

## Phase 3 の構成要素

### ✅ Phase 3-1: Camera Component (完了)

- **状態**: 完了
- **成果物**: Camera.tsx, Camera.spec.md, Camera.test.tsx
- **テスト**: 32/32 合格
- **完了日**: 2024-11-02

### ✅ Phase 3-2: useTemplate Hook (完了)

- **状態**: 完了
- **成果物**: useTemplate.ts, useTemplate.spec.md, useTemplate.test.ts
- **テスト**: 16/16 合格（2 skip）
- **完了日**: 2024-11-02

### 🔄 Phase 3-2: TemplateList Component (進行中)

- **状態**: 計画中
- **予定**: 2024-11-02（本日）
- **成果物**: TemplateList.tsx, TemplateList.spec.md, TemplateList.test.tsx
- **目標**: 15+テスト、全て合格

### ⏳ Phase 3-3: RegionSelector Component (未着手)

- **状態**: 未着手
- **予定**: 2024-11-03
- **成果物**: RegionSelector.tsx, RegionSelector.spec.md, RegionSelector.test.tsx
- **目標**: 20+テスト、全て合格

### ⏳ Phase 3-4: TemplateEditor Component (未着手)

- **状態**: 未着手
- **予定**: 2024-11-04
- **成果物**: TemplateEditor.tsx, TemplateEditor.spec.md, TemplateEditor.test.tsx
- **目標**: 統合テスト含む 25+テスト

## 実装順序と依存関係

```
Phase 3-1: Camera Component ✅
    ↓
Phase 3-2a: useTemplate Hook ✅
    ↓
Phase 3-2b: TemplateList Component 🔄
    ↓
Phase 3-3: RegionSelector Component ⏳
    ↓
Phase 3-4: TemplateEditor Component ⏳
    ↓
Phase 3-5: TemplateManagementPage 統合 ⏳
```

## 各コンポーネントの責務

### Camera Component ✅

- **責務**: カメラ映像の取得、撮影、カメラ切替
- **使用箇所**: TemplateEditor（ベース画像撮影）、DataInput（記入済み撮影）
- **状態**: 独立動作可能、再利用可能

### useTemplate Hook ✅

- **責務**: テンプレートの CRUD 操作、localStorage 永続化
- **使用箇所**: TemplateList, TemplateEditor, TemplateManagementPage
- **状態**: 完全なテスト済み、本番利用可能

### TemplateList Component 🔄

- **責務**: テンプレート一覧表示、削除、選択
- **使用箇所**: TemplateManagementPage
- **依存**: useTemplate hook
- **UI**: グリッドレイアウト、削除確認ダイアログ

### RegionSelector Component ⏳

- **責務**: 画像上での OCR 領域選択、リサイズ、並び替え
- **使用箇所**: TemplateEditor
- **依存**: なし（独立コンポーネント）
- **UI**: ドラッグ選択、リサイズハンドル、領域リスト

### TemplateEditor Component ⏳

- **責務**: テンプレート作成・編集の統合フロー
- **使用箇所**: TemplateManagementPage
- **依存**: Camera, RegionSelector, useTemplate
- **UI**: ステップ形式（撮影 → 領域選択 → 保存）

## データフロー全体像

```
[User] → [TemplateManagementPage]
    ↓
    ├─ [TemplateList]
    │   ├─ useTemplate.templates[] → 一覧表示
    │   ├─ 削除 → useTemplate.deleteTemplate()
    │   └─ 選択 → onSelectTemplate(id)
    │
    └─ [TemplateEditor] ← 新規作成 or 編集
        ↓
        ├─ Step 1: [Camera] → 撮影 → baseImageData
        ↓
        ├─ Step 2: [RegionSelector] → 領域選択 → regions[]
        ↓
        └─ Step 3: Save → useTemplate.createTemplate() or updateTemplate()
            ↓
            └─ localStorage に保存
                ↓
                [TemplateList] 自動更新
```

## ファイル構造（Phase 3 完成時）

```
src/
├── components/
│   ├── Camera/
│   │   ├── Camera.tsx ✅
│   │   ├── Camera.spec.md ✅
│   │   └── Camera.test.tsx ✅
│   │
│   └── TemplateManagement/
│       ├── TemplateList.tsx 🔄
│       ├── TemplateList.spec.md 🔄
│       ├── TemplateList.test.tsx 🔄
│       ├── RegionSelector.tsx ⏳
│       ├── RegionSelector.spec.md ⏳
│       ├── RegionSelector.test.tsx ⏳
│       ├── TemplateEditor.tsx ⏳
│       ├── TemplateEditor.spec.md ⏳
│       └── TemplateEditor.test.tsx ⏳
│
├── hooks/
│   ├── useTemplate.ts ✅
│   ├── useTemplate.spec.md ✅
│   └── useTemplate.test.ts ✅
│
├── pages/
│   ├── TemplateManagementPage.tsx ⏳
│   └── TemplateManagementPage.spec.md ⏳
│
└── types/
    ├── template.ts ✅
    └── camera.ts ✅
```

## テスト戦略（Phase 3 全体）

### Unit Tests

- **Camera**: 32 tests ✅
- **useTemplate**: 16 tests ✅
- **TemplateList**: 15+ tests 🔄
- **RegionSelector**: 20+ tests ⏳
- **TemplateEditor**: 25+ tests ⏳

**合計目標**: 108+ tests

### Integration Tests

- TemplateEditor + Camera + RegionSelector + useTemplate
- TemplateManagementPage + TemplateList + TemplateEditor
- localStorage 連携の統合テスト

### E2E Tests（Phase 4 以降）

- テンプレート作成から削除までの一連のフロー

## 技術的課題と対策

### 課題 1: 画像上の領域選択 UI

- **難易度**: 高
- **技術**: Canvas API または SVG overlay
- **対策**:
  - まず基本的なドラッグ選択を実装
  - リサイズハンドルは後から追加
  - タッチデバイス対応も考慮

### 課題 2: テンプレートデータのサイズ

- **問題**: base64 画像が localStorage を圧迫
- **対策**:
  - 画像を適度に圧縮（quality: 0.8）
  - 将来的に IndexedDB 移行を検討
  - テンプレート数の上限設定

### 課題 3: コンポーネント間の状態管理

- **問題**: TemplateEditor での複数ステップ管理
- **対策**:
  - useReducer または useState でステップ管理
  - 各ステップのバリデーション
  - 戻る/進むボタンの実装

### 課題 4: テスト環境での Canvas/Camera

- **問題**: happy-dom では Canvas API が不完全
- **対策**:
  - モック中心のテスト
  - 必要に応じて jsdom 検討
  - 実機テストも並行

## スケジュール詳細

### 2024-11-02（本日） - Day 1

- ✅ Camera Component 完了
- ✅ useTemplate Hook 完了
- 🔄 TemplateList Component 実装中
  - [ ] 午前: 仕様書作成
  - [ ] 午後: 実装 + テスト
  - [ ] 夕方: レビュー + 修正

### 2024-11-03 - Day 2

- ⏳ RegionSelector Component
  - [ ] 午前: 仕様書作成
  - [ ] 午後: ドラッグ選択実装
  - [ ] 夕方: リサイズ + テスト

### 2024-11-04 - Day 3

- ⏳ TemplateEditor Component
  - [ ] 午前: 仕様書 + ステップ管理実装
  - [ ] 午後: 統合テスト
  - [ ] 夕方: TemplateManagementPage 統合

## 定義完了（DoD）- Phase 3 全体

### 機能要件

- [x] カメラで写真撮影可能
- [x] テンプレートの CRUD 操作可能
- [ ] テンプレート一覧表示・削除可能
- [ ] 画像上で領域をドラッグ選択可能
- [ ] 領域にリサイズハンドル、並び替え可能
- [ ] テンプレート作成フロー完成
- [ ] localStorage に永続化

### 品質要件

- [x] Camera: 32/32 tests
- [x] useTemplate: 16/16 tests
- [ ] TemplateList: 15+/15+ tests
- [ ] RegionSelector: 20+/20+ tests
- [ ] TemplateEditor: 25+/25+ tests
- [ ] **合計**: 108+ tests 全て合格

### ドキュメント要件

- [x] Camera.spec.md
- [x] useTemplate.spec.md
- [ ] TemplateList.spec.md
- [ ] RegionSelector.spec.md
- [ ] TemplateEditor.spec.md
- [ ] 実装計画ドキュメント
- [ ] 作業ログ

### コード品質要件

- [ ] TypeScript 型エラーなし
- [ ] Biome lint/format 合格
- [ ] DEPENDENCY MAP 記載
- [ ] コメント（英語）充実

## リスク管理

### 高リスク

1. **RegionSelector の複雑性**

   - ドラッグ&ドロップ、リサイズの実装難易度高
   - 対策: 段階的実装、十分なテスト

2. **画像データのサイズ**
   - localStorage 5MB の制限
   - 対策: 画像圧縮、テンプレート数制限

### 中リスク

3. **テスト環境の制約**

   - Canvas/Camera API のモック問題
   - 対策: 実機テスト併用

4. **レスポンシブ対応**
   - ChromeBook だけでなくスマホも想定
   - 対策: mobile-first CSS

### 低リスク

5. **既存コンポーネントとの統合**
   - Button, Layout は既に完成
   - 対策: 標準的な Props 設計

## 次のアクション

### 即座に実施

1. ✅ Phase 3 全体計画作成（このドキュメント）
2. 🔄 TemplateList.spec.md 作成開始

### 今日中に実施

3. TemplateList.tsx 実装
4. TemplateList.test.tsx 実装
5. 15+テスト合格確認

### 明日以降

6. RegionSelector 実装開始
7. TemplateEditor 統合

## 参照ドキュメント

- **Overall Plan**: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
- **Issue**: `docs/01_issues/open/2024_11/20241102_02_common-components-development.md`
- **Research**: `docs/02_research/2024_11/20241102_02_react-camera-integration.md`
- **Log**: `docs/05_logs/2024_11/20241102/03_camera-component-implementation-completed.md`

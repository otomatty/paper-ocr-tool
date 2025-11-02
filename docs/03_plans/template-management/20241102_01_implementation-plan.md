# テンプレート管理機能 - 実装計画

## 計画概要

- **計画日**: 2024-11-02
- **担当者**: プロジェクトチーム
- **完了予定**: 2024-11-17
- **Phase**: Phase 3
- **依存関係**: Phase 1（型定義、ユーティリティ）、Phase 2（共通コンポーネント）

## 実装段階

### Phase 3-1: カメラ機能実装（予定: 2 日、11/3-11/4）

**目標**: カメラアクセスと画像キャプチャ機能の実装

**タスク**:

- [ ] useCamera カスタムフック実装（4 時間）
  - MediaDevices API 統合
  - カメラ起動・停止
  - 画像キャプチャ（Canvas API）
  - エラーハンドリング
- [ ] Camera コンポーネント実装（3 時間）
  - video 要素でプレビュー表示
  - 撮影ボタン
  - 撮り直し機能
  - エラー表示
- [ ] 仕様書作成（2 時間）
  - useCamera.spec.md
  - Camera.spec.md
- [ ] テスト実装（3 時間）
  - useCamera.test.ts
  - Camera.test.tsx
- [ ] CSS 実装（1 時間）
  - Camera.module.css
  - レスポンシブ対応

**成果物**:

```
src/
├── hooks/
│   ├── useCamera.ts
│   ├── useCamera.spec.md
│   └── useCamera.test.ts
└── components/
    └── Camera/
        ├── Camera.tsx
        ├── Camera.spec.md
        ├── Camera.test.tsx
        └── Camera.module.css
```

**定義完了（DoD）**:

- [ ] カメラプレビューが表示される
- [ ] 撮影ボタンで画像をキャプチャできる
- [ ] base64 data URL が正常に生成される
- [ ] 権限拒否時にエラーメッセージが表示される
- [ ] コンポーネントアンマウント時にカメラストリームが停止される
- [ ] テストが全て合格する
- [ ] TypeScript エラーがない
- [ ] Biome チェックエラーがない
- [ ] DEPENDENCY MAP が記載されている

---

### Phase 3-2: テンプレート永続化実装（予定: 1.5 日、11/5-11/6 午前）

**目標**: テンプレートの localStorage 永続化と CRUD 操作

**タスク**:

- [ ] useTemplate カスタムフック実装（4 時間）
  - useLocalStorage 統合
  - CRUD 操作（create, read, update, delete）
  - バリデーション統合
  - エラーハンドリング
- [ ] TemplateList コンポーネント実装（3 時間）
  - テンプレート一覧表示
  - カード形式 UI
  - 編集・削除ボタン
  - 空状態表示
- [ ] 仕様書作成（1.5 時間）
  - useTemplate.spec.md
  - TemplateList.spec.md
- [ ] テスト実装（2.5 時間）
  - useTemplate.test.ts
  - TemplateList.test.tsx
- [ ] CSS 実装（1 時間）
  - TemplateList.module.css
  - グリッドレイアウト

**成果物**:

```
src/
├── hooks/
│   ├── useTemplate.ts
│   ├── useTemplate.spec.md
│   └── useTemplate.test.ts
└── components/
    └── TemplateManagement/
        ├── TemplateList.tsx
        ├── TemplateList.spec.md
        ├── TemplateList.test.tsx
        └── TemplateList.module.css
```

**定義完了（DoD）**:

- [ ] テンプレートの作成・読み込み・更新・削除ができる
- [ ] localStorage に正常に保存される
- [ ] バリデーションが正常に動作する
- [ ] TemplateList でテンプレート一覧が表示される
- [ ] テンプレート選択・削除が動作する
- [ ] テストが全て合格する
- [ ] TypeScript エラーがない
- [ ] Biome チェックエラーがない
- [ ] DEPENDENCY MAP が記載されている

---

### Phase 3-3: 領域選択機能実装（予定: 3 日、11/6 午後-11/9）

**目標**: Canvas API で領域選択・編集機能を実装

**タスク**:

- [ ] RegionSelector コンポーネント基礎実装（4 時間）
  - Canvas 初期化
  - 画像表示
  - マウスイベントハンドリング
- [ ] 領域作成機能（4 時間）
  - マウスドラッグで矩形描画
  - 領域座標計算
  - 領域リストへの追加
- [ ] 領域編集機能（4 時間）
  - 領域選択
  - リサイズハンドル（8 方向）
  - ドラッグ移動
- [ ] 領域削除機能（2 時間）
  - 選択中領域の削除
  - Delete キー対応
- [ ] タッチ操作対応（3 時間）
  - touchstart/touchmove/touchend
  - Chrome Book 最適化
- [ ] Canvas 描画最適化（3 時間）
  - requestAnimationFrame
  - レイヤー管理
  - パフォーマンスチューニング
- [ ] 仕様書作成（2 時間）
  - RegionSelector.spec.md
- [ ] テスト実装（4 時間）
  - RegionSelector.test.tsx
- [ ] CSS 実装（1 時間）
  - RegionSelector.module.css

**成果物**:

```
src/components/TemplateManagement/
├── RegionSelector.tsx
├── RegionSelector.spec.md
├── RegionSelector.test.tsx
└── RegionSelector.module.css
```

**技術詳細**:

#### Canvas 描画ロジック

```typescript
const drawCanvas = () => {
  const ctx = canvasRef.current?.getContext("2d");
  if (!ctx || !image) return;

  // クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ベース画像描画
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // 領域描画
  regions.forEach((region) => {
    const isSelected = region.id === selectedRegionId;

    // 半透明矩形
    ctx.fillStyle = isSelected
      ? "rgba(255, 193, 7, 0.5)"
      : "rgba(0, 123, 255, 0.3)";
    ctx.fillRect(region.x, region.y, region.width, region.height);

    // 境界線
    ctx.strokeStyle = isSelected ? "#ffc107" : "#007bff";
    ctx.lineWidth = 2;
    ctx.strokeRect(region.x, region.y, region.width, region.height);

    // ラベル
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(
      `${region.order}: ${region.name}`,
      region.x + 5,
      region.y + 20
    );

    // リサイズハンドル（選択中のみ）
    if (isSelected) {
      drawResizeHandles(ctx, region);
    }
  });
};
```

#### リサイズハンドル描画

```typescript
const drawResizeHandles = (ctx: CanvasRenderingContext2D, region: Region) => {
  const handleSize = 8;
  const handles = [
    { x: region.x, y: region.y }, // 左上
    { x: region.x + region.width / 2, y: region.y }, // 上中央
    { x: region.x + region.width, y: region.y }, // 右上
    { x: region.x + region.width, y: region.y + region.height / 2 }, // 右中央
    { x: region.x + region.width, y: region.y + region.height }, // 右下
    { x: region.x + region.width / 2, y: region.y + region.height }, // 下中央
    { x: region.x, y: region.y + region.height }, // 左下
    { x: region.x, y: region.y + region.height / 2 }, // 左中央
  ];

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;

  handles.forEach((handle) => {
    ctx.fillRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.strokeRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
  });
};
```

**定義完了（DoD）**:

- [ ] マウスドラッグで領域を作成できる
- [ ] タッチ操作で領域を作成できる
- [ ] 領域のリサイズができる（8 方向）
- [ ] 領域の移動ができる
- [ ] 領域の削除ができる
- [ ] 領域座標が正確に取得できる
- [ ] Canvas 描画がスムーズ（60fps）
- [ ] テストが全て合格する
- [ ] TypeScript エラーがない
- [ ] Biome チェックエラーがない
- [ ] DEPENDENCY MAP が記載されている

---

### Phase 3-4: TemplateEditor 統合実装（予定: 2 日、11/10-11/11）

**目標**: Camera、RegionSelector、TemplateList を統合

**タスク**:

- [ ] TemplateEditor コンポーネント実装（5 時間）
  - テンプレート名入力
  - Camera 統合
  - RegionSelector 統合
  - 領域リスト表示・編集
  - 保存・キャンセル処理
- [ ] 領域編集機能（3 時間）
  - 領域名編集（インライン）
  - 領域順序変更（↑↓ ボタン）
  - 領域削除確認
- [ ] バリデーション統合（2 時間）
  - テンプレート名検証
  - 領域名検証
  - 座標検証
  - エラー表示
- [ ] 仕様書作成（1.5 時間）
  - TemplateEditor.spec.md
- [ ] テスト実装（3 時間）
  - TemplateEditor.test.tsx
- [ ] CSS 実装（1.5 時間）
  - TemplateEditor.module.css
  - レスポンシブレイアウト

**成果物**:

```
src/components/TemplateManagement/
├── TemplateEditor.tsx
├── TemplateEditor.spec.md
├── TemplateEditor.test.tsx
└── TemplateEditor.module.css
```

**UI 構成**:

```
┌─ TemplateEditor ─────────────────────────────────┐
│ ┌─ Header ──────────────────────────────────────┐│
│ │ テンプレート名: [__________] (必須)          ││
│ └───────────────────────────────────────────────┘│
│                                                   │
│ ┌─ Step 1: 撮影 ───────────────────────────────┐│
│ │ Camera Component                              ││
│ │ [カメラプレビュー or 撮影済み画像]           ││
│ │ [撮影ボタン] [撮り直しボタン]                ││
│ └───────────────────────────────────────────────┘│
│                                                   │
│ ┌─ Step 2: 領域選択 ───────────────────────────┐│
│ │ RegionSelector Component                      ││
│ │ [Canvas: 画像 + 領域オーバーレイ]            ││
│ │ ※ ドラッグで領域を作成してください           ││
│ └───────────────────────────────────────────────┘│
│                                                   │
│ ┌─ Step 3: 領域設定 ───────────────────────────┐│
│ │ 選択領域一覧:                                 ││
│ │ ┌─────────────────────────────────────────┐  ││
│ │ │ 1. [氏名_______] [編集] [削除] [↑] [↓] │  ││
│ │ │ 2. [Q1回答_____] [編集] [削除] [↑] [↓] │  ││
│ │ │ 3. [Q2回答_____] [編集] [削除] [↑] [↓] │  ││
│ │ └─────────────────────────────────────────┘  ││
│ └───────────────────────────────────────────────┘│
│                                                   │
│ ┌─ Actions ────────────────────────────────────┐│
│ │ [保存] [キャンセル]                           ││
│ └───────────────────────────────────────────────┘│
└───────────────────────────────────────────────────┘
```

**定義完了（DoD）**:

- [ ] テンプレート名が入力できる
- [ ] カメラで撮影できる
- [ ] 領域選択ができる
- [ ] 各領域に名前を付与できる
- [ ] 領域の順序を変更できる
- [ ] バリデーションエラーが表示される
- [ ] テンプレートが保存される
- [ ] テストが全て合格する
- [ ] TypeScript エラーがない
- [ ] Biome チェックエラーがない
- [ ] DEPENDENCY MAP が記載されている

---

### Phase 3-5: TemplateManagementPage 統合とテスト（予定: 1.5 日、11/12-11/13 午前）

**目標**: 全コンポーネントの統合と総合テスト

**タスク**:

- [ ] TemplateManagementPage 更新（3 時間）
  - viewMode 状態管理（list ⇄ edit）
  - TemplateList 統合
  - TemplateEditor 統合
  - useTemplate 統合
- [ ] DEPENDENCY MAP 全更新（2 時間）
  - 全コンポーネントの Parents/Dependencies 更新
  - 親ファイルの DEPENDENCY MAP 更新
- [ ] 統合テスト実装（3 時間）
  - エンドツーエンドシナリオ
  - テンプレート作成 → 保存 → 読み込み → 編集 → 削除
- [ ] バグ修正・調整（3 時間）
  - 統合テストで発見された問題対応
- [ ] Chrome Book 実機テスト（1 時間）
  - カメラ動作確認
  - タッチ操作確認
  - パフォーマンス確認

**成果物**:

- 更新された `TemplateManagementPage.tsx`
- 全ファイルの最新 DEPENDENCY MAP
- 統合テストスイート

**定義完了（DoD）**:

- [ ] 一覧と編集画面が切り替わる
- [ ] 新規作成・編集が正常に動作
- [ ] テンプレートが localStorage に保存される
- [ ] 全 DEPENDENCY MAP が最新
- [ ] 全テストが合格する
- [ ] TypeScript エラーがない
- [ ] Biome チェックエラーがない
- [ ] Chrome Book で正常に動作する

---

### Phase 3-6: ドキュメント整備とレビュー（予定: 0.5 日、11/13 午後）

**目標**: Phase 3 完了の記録と次 Phase 準備

**タスク**:

- [ ] 作業ログ作成（1 時間）
  - `docs/05_logs/2024_11/20241113/01_phase3-completed.md`
  - 実施内容、発見した問題、技術的学び
- [ ] Issue 状態更新（0.5 時間）
  - `20241102_03_template-management.md` を resolved へ移動
  - 受け入れ条件の確認
- [ ] Phase 4 準備（1 時間）
  - Phase 4 Issue 作成の準備
  - OCR 処理機能の要件整理
- [ ] README 更新（0.5 時間）
  - プロジェクト進捗状況の更新

**成果物**:

- `docs/05_logs/2024_11/20241113/01_phase3-completed.md`
- `docs/01_issues/resolved/2024_11/20241102_03_template-management.md`
- 更新された README.md

**定義完了（DoD）**:

- [ ] 作業ログが記録されている
- [ ] Issue が resolved に移動
- [ ] Phase 4 の準備が整っている

---

## ファイル構造設計

### 最終的なディレクトリ構造

```
src/
├── hooks/
│   ├── useCamera.ts
│   ├── useCamera.spec.md
│   ├── useCamera.test.ts
│   ├── useTemplate.ts
│   ├── useTemplate.spec.md
│   ├── useTemplate.test.ts
│   ├── useLocalStorage.ts (Phase 2で実装済み)
│   ├── useLocalStorage.spec.md
│   └── useLocalStorage.test.ts
├── components/
│   ├── Camera/
│   │   ├── Camera.tsx
│   │   ├── Camera.spec.md
│   │   ├── Camera.test.tsx
│   │   └── Camera.module.css
│   └── TemplateManagement/
│       ├── RegionSelector.tsx
│       ├── RegionSelector.spec.md
│       ├── RegionSelector.test.tsx
│       ├── RegionSelector.module.css
│       ├── TemplateList.tsx
│       ├── TemplateList.spec.md
│       ├── TemplateList.test.tsx
│       ├── TemplateList.module.css
│       ├── TemplateEditor.tsx
│       ├── TemplateEditor.spec.md
│       ├── TemplateEditor.test.tsx
│       └── TemplateEditor.module.css
├── pages/
│   └── TemplateManagementPage.tsx (更新)
├── types/
│   ├── template.ts (Phase 1で作成済み)
│   └── camera.ts (Phase 1で作成済み)
├── config/
│   └── appConfig.ts (Phase 1で作成済み)
└── utils/
    └── validation.ts (Phase 1で作成済み)
```

---

## 技術設計の詳細

### データフロー

```
User Action (撮影・領域選択・保存)
    ↓
TemplateEditor Component
    ↓
├─ Camera Component → useCamera Hook → MediaDevices API
│       ↓
│   [画像データ取得]
│       ↓
├─ RegionSelector Component → Canvas API
│       ↓
│   [領域座標取得]
│       ↓
└─ useTemplate Hook → useLocalStorage Hook → localStorage
        ↓
    [永続化]
```

### localStorage データ構造

```typescript
// キー: 'paper-ocr-templates'
// 値:
[
  {
    id: "uuid-1",
    name: "アンケート2024年度版",
    baseImage: "", // 空文字列（容量対策）
    regions: [
      {
        id: "uuid-region-1",
        name: "氏名",
        x: 100,
        y: 50,
        width: 300,
        height: 50,
        order: 1,
      },
      {
        id: "uuid-region-2",
        name: "Q1回答",
        x: 100,
        y: 150,
        width: 400,
        height: 100,
        order: 2,
      },
    ],
    createdAt: "2024-11-02T12:00:00.000Z",
  },
];
```

---

## リスクと対策

### リスク 1: localStorage 容量制限

**問題**: テンプレート画像（base64）を保存すると容量超過

**対策**:

- ✅ **画像を保存しない**（座標のみ保存）
- データ入力時にテンプレート用紙を再撮影
- または最小限の圧縮画像（JPEG 60%、リサイズ）

**実装**:

```typescript
const createTemplate = async (template: CreateTemplateRequest) => {
  const newTemplate: Template = {
    ...template,
    baseImage: "", // 空文字列に上書き
  };
  // 保存処理
};
```

### リスク 2: Canvas 描画パフォーマンス

**問題**: 大きな画像（1920x1080）のリアルタイム描画

**対策**:

- `requestAnimationFrame()` 使用
- 描画回数の最適化（状態変更時のみ再描画）
- オフスクリーン Canvas 活用

**実装**:

```typescript
useEffect(() => {
  let animationFrameId: number;

  const draw = () => {
    drawCanvas();
    // 次フレームは手動で要求しない（状態変更時のみ）
  };

  animationFrameId = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}, [regions, selectedRegionId, image]);
```

### リスク 3: カメラアクセス権限拒否

**問題**: ユーザーがカメラアクセスを拒否

**対策**:

- 明確なエラーメッセージ（日本語）
- 権限設定へのガイダンス
- 代替手段の提示（Phase 4 以降で検討）

**実装**:

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  setStream(stream);
} catch (err) {
  if (err.name === "NotAllowedError") {
    setError(
      "カメラへのアクセスが拒否されました。ブラウザの設定でカメラの使用を許可してください。"
    );
  } else if (err.name === "NotFoundError") {
    setError(
      "カメラが見つかりませんでした。カメラが接続されているか確認してください。"
    );
  } else {
    setError("カメラの起動に失敗しました。");
  }
}
```

---

## テスト戦略

### Unit Test

**対象**:

- useCamera: カメラ起動・停止・キャプチャ
- useTemplate: CRUD 操作、バリデーション

**ツール**: Vitest + React Testing Library

**例**:

```typescript
describe("useTemplate", () => {
  it("should create a new template", async () => {
    const { result } = renderHook(() => useTemplate());

    await act(async () => {
      await result.current.createTemplate({
        name: "テストテンプレート",
        baseImage: "",
        regions: [],
      });
    });

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].name).toBe("テストテンプレート");
  });
});
```

### Component Test

**対象**:

- Camera: 撮影・撮り直し
- RegionSelector: 領域作成・編集・削除
- TemplateEditor: 統合フロー

**例**:

```typescript
describe("Camera", () => {
  it("should capture image on button click", async () => {
    const onCapture = vi.fn();
    render(<Camera onCapture={onCapture} />);

    const button = screen.getByText("撮影");
    await userEvent.click(button);

    expect(onCapture).toHaveBeenCalledWith(
      expect.stringContaining("data:image")
    );
  });
});
```

### Integration Test

**対象**: テンプレート作成 → 保存 → 読み込み → 編集 → 削除の一連のフロー

**例**:

```typescript
describe("Template Management Integration", () => {
  it("should complete full template lifecycle", async () => {
    render(<TemplateManagementPage />);

    // 新規作成
    await userEvent.click(screen.getByText("新規テンプレート作成"));

    // テンプレート名入力
    await userEvent.type(screen.getByLabelText("テンプレート名"), "テスト");

    // 撮影（モック）
    // ...

    // 領域選択（モック）
    // ...

    // 保存
    await userEvent.click(screen.getByText("保存"));

    // 一覧に表示されることを確認
    expect(screen.getByText("テスト")).toBeInTheDocument();
  });
});
```

---

## 進捗追跡

### マイルストーン

- [ ] Phase 3-1: カメラ機能完了（11/4）
- [ ] Phase 3-2: テンプレート永続化完了（11/6 午前）
- [ ] Phase 3-3: 領域選択機能完了（11/9）
- [ ] Phase 3-4: TemplateEditor 統合完了（11/11）
- [ ] Phase 3-5: 統合テスト完了（11/13 午前）
- [ ] Phase 3-6: ドキュメント整備完了（11/13 午後）

### 品質ゲート

各サブフェーズ完了時の必須条件:

- [ ] 全仕様書（.spec.md）作成完了
- [ ] 全テスト作成・実行・合格
- [ ] TypeScript エラーなし
- [ ] Biome チェックエラーなし
- [ ] DEPENDENCY MAP 記載完了
- [ ] 動作確認完了

---

この実装計画に従い、Phase 3 を段階的に進めてください。

# Phase 3: テンプレート管理機能 - 実装プロンプト

## タスク概要

- **目的**: アンケートテンプレートの作成・管理機能の実装
- **スコープ**: Camera, RegionSelector, TemplateEditor, TemplateList コンポーネント + useCamera, useTemplate フック
- **期限**: 2024-11-17 完了予定
- **Phase**: Phase 3

## 技術要件

- **使用技術**: React 19, TypeScript, Canvas API, MediaDevices API, CSS Modules
- **制約条件**:
  - テスト駆動開発（TDD）を実践
  - 全コンポーネントに DEPENDENCY MAP を記載
  - Chrome Book での動作確認必須
  - localStorage 容量制限対策（画像圧縮または座標のみ保存）
- **依存関係**: Phase 1 の型定義、Phase 2 の共通コンポーネント（Layout, Button, useLocalStorage）

## 実装指示

### 実装順序（推奨）

```
1. useCamera フック → Camera コンポーネント
2. useTemplate フック → TemplateList コンポーネント
3. RegionSelector コンポーネント
4. TemplateEditor コンポーネント（統合）
5. TemplateManagementPage の更新
```

---

## 1. useCamera カスタムフック実装

**ファイル**:

- `src/hooks/useCamera.ts`
- `src/hooks/useCamera.spec.md`
- `src/hooks/useCamera.test.ts`

**要件**:

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

**機能**:

- `startCamera()`: `navigator.mediaDevices.getUserMedia()` でカメラ起動
- `stopCamera()`: MediaStream のトラックを停止
- `captureImage()`: Canvas API で video 要素から画像をキャプチャ
- `clearCapturedImage()`: キャプチャ画像をクリア
- エラーハンドリング: NotAllowedError, NotFoundError, NotReadableError

**カメラ設定**:

```typescript
const constraints = {
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "environment", // 背面カメラ優先
  },
};
```

**画像キャプチャロジック**:

```typescript
const canvas = document.createElement("canvas");
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext("2d");
ctx?.drawImage(video, 0, 0);
const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // 80%品質
```

**DEPENDENCY MAP**:

```typescript
/**
 * useCamera Custom Hook
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/components/Camera/Camera.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   └─ src/config/appConfig.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./useCamera.spec.md
 *   ├─ Tests: ./useCamera.test.ts
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Prompt: docs/00_prompts/20241102_03_phase3-template-management.md
 */
```

---

## 2. Camera コンポーネント実装

**ファイル**:

- `src/components/Camera/Camera.tsx`
- `src/components/Camera/Camera.spec.md`
- `src/components/Camera/Camera.test.tsx`
- `src/components/Camera/Camera.module.css`

**要件**:

```typescript
interface CameraProps {
  onCapture: (imageDataUrl: string) => void;
  onError?: (error: string) => void;
}

export const Camera: React.FC<CameraProps>;
```

**UI 要素**:

- `<video>` 要素: カメラストリームのプレビュー
- 撮影ボタン: 画像をキャプチャして `onCapture` コールバック実行
- 撮り直しボタン: `capturedImage` をクリア
- カメラ起動ボタン: 初回またはエラー後にカメラを起動
- エラーメッセージ表示エリア

**状態管理**:

- `useCamera` フックで状態管理
- `useEffect` でコンポーネントマウント時にカメラ起動
- `useEffect` でアンマウント時にカメラ停止（クリーンアップ）

**CSS 要件** (`Camera.module.css`):

- video 要素: 16:9 アスペクト比、max-width: 100%
- ボタン配置: 下部中央
- レスポンシブ対応

**DEPENDENCY MAP**:

```typescript
/**
 * Camera Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/hooks/useCamera.ts
 *   ├─ src/components/common/Button/Button.tsx
 *   └─ ./Camera.module.css
 *
 * Related Documentation:
 *   ├─ Spec: ./Camera.spec.md
 *   ├─ Tests: ./Camera.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Prompt: docs/00_prompts/20241102_03_phase3-template-management.md
 */
```

---

## 3. useTemplate カスタムフック実装

**ファイル**:

- `src/hooks/useTemplate.ts`
- `src/hooks/useTemplate.spec.md`
- `src/hooks/useTemplate.test.ts`

**要件**:

```typescript
interface UseTemplateReturn {
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
  createTemplate: (template: CreateTemplateRequest) => Promise<void>;
  updateTemplate: (
    id: string,
    template: UpdateTemplateRequest
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  loadTemplate: (id: string) => void;
  clearCurrentTemplate: () => void;
}

export function useTemplate(): UseTemplateReturn;
```

**データ保存**:

- `useLocalStorage<Template[]>('paper-ocr-templates', [])` を活用
- **重要**: テンプレート画像（baseImage）は保存しない（localStorage 容量制限対策）
- 保存データ: id, name, regions, createdAt のみ

**CRUD 操作**:

```typescript
// Create
const createTemplate = async (template: CreateTemplateRequest) => {
  const newTemplate: Template = {
    id: crypto.randomUUID(),
    name: template.name,
    baseImage: "", // 空文字列（保存しない）
    regions: template.regions,
    createdAt: new Date().toISOString(),
  };
  setTemplates([...templates, newTemplate]);
};

// Update
const updateTemplate = async (id: string, template: UpdateTemplateRequest) => {
  setTemplates(
    templates.map((t) =>
      t.id === id ? { ...t, ...template, baseImage: "" } : t
    )
  );
};

// Delete
const deleteTemplate = async (id: string) => {
  setTemplates(templates.filter((t) => t.id !== id));
};
```

**バリデーション**:

- `validateTemplateName()` (validation.ts)
- `validateRegionName()` (validation.ts)
- `validateRegionCoordinates()` (validation.ts)

**DEPENDENCY MAP**:

```typescript
/**
 * useTemplate Custom Hook
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/TemplateManagement/TemplateEditor.tsx
 *   ├─ src/components/TemplateManagement/TemplateList.tsx
 *   └─ src/pages/TemplateManagementPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/hooks/useLocalStorage.ts
 *   ├─ src/types/template.ts
 *   └─ src/utils/validation.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./useTemplate.spec.md
 *   ├─ Tests: ./useTemplate.test.ts
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Prompt: docs/00_prompts/20241102_03_phase3-template-management.md
 */
```

---

## 4. RegionSelector コンポーネント実装

**ファイル**:

- `src/components/TemplateManagement/RegionSelector.tsx`
- `src/components/TemplateManagement/RegionSelector.spec.md`
- `src/components/TemplateManagement/RegionSelector.test.tsx`
- `src/components/TemplateManagement/RegionSelector.module.css`

**要件**:

```typescript
interface RegionSelectorProps {
  imageDataUrl: string;
  regions: Region[];
  onRegionsChange: (regions: Region[]) => void;
  selectedRegionId: string | null;
  onRegionSelect: (id: string | null) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps>;
```

**Canvas 描画ロジック**:

```typescript
// 1. ベース画像を描画
const image = new Image();
image.src = imageDataUrl;
image.onload = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawRegions();
};

// 2. 全領域を描画
const drawRegions = () => {
  regions.forEach((region) => {
    ctx.fillStyle =
      region.id === selectedRegionId
        ? "rgba(255, 193, 7, 0.5)" // 選択中: 黄色
        : "rgba(0, 123, 255, 0.3)"; // 通常: 青色
    ctx.fillRect(region.x, region.y, region.width, region.height);

    // 境界線
    ctx.strokeStyle = region.id === selectedRegionId ? "#ffc107" : "#007bff";
    ctx.lineWidth = 2;
    ctx.strokeRect(region.x, region.y, region.width, region.height);

    // ラベル（領域番号・名前）
    ctx.fillStyle = "#000";
    ctx.font = "14px sans-serif";
    ctx.fillText(
      `${region.order}: ${region.name}`,
      region.x + 5,
      region.y + 20
    );

    // リサイズハンドル（8方向）
    if (region.id === selectedRegionId) {
      drawResizeHandles(region);
    }
  });
};
```

**マウス操作**:

```typescript
// 新規領域作成（ドラッグ）
const handleMouseDown = (e: React.MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // クリック位置が既存領域内かチェック
  const clickedRegion = regions.find(
    (r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
  );

  if (clickedRegion) {
    onRegionSelect(clickedRegion.id);
  } else {
    // 新規領域作成開始
    setIsDragging(true);
    setDragStart({ x, y });
  }
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 矩形を描画（リアルタイムプレビュー）
  drawTempRegion(dragStart.x, dragStart.y, x - dragStart.x, y - dragStart.y);
};

const handleMouseUp = (e: React.MouseEvent) => {
  if (!isDragging) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 新規領域を作成
  const newRegion: Region = {
    id: crypto.randomUUID(),
    name: `領域${regions.length + 1}`,
    x: Math.min(dragStart.x, x),
    y: Math.min(dragStart.y, y),
    width: Math.abs(x - dragStart.x),
    height: Math.abs(y - dragStart.y),
    order: regions.length + 1,
  };

  onRegionsChange([...regions, newRegion]);
  setIsDragging(false);
};
```

**タッチ操作対応**:

```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  // マウス操作と同様の処理
};
```

**キーボード操作**:

- Delete キー: 選択中の領域を削除

**DEPENDENCY MAP**:

```typescript
/**
 * RegionSelector Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/types/template.ts
 *   ├─ src/utils/validation.ts
 *   └─ ./RegionSelector.module.css
 *
 * Related Documentation:
 *   ├─ Spec: ./RegionSelector.spec.md
 *   ├─ Tests: ./RegionSelector.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Prompt: docs/00_prompts/20241102_03_phase3-template-management.md
 */
```

---

## 5. TemplateList コンポーネント実装

**ファイル**:

- `src/components/TemplateManagement/TemplateList.tsx`
- `src/components/TemplateManagement/TemplateList.spec.md`
- `src/components/TemplateManagement/TemplateList.test.tsx`
- `src/components/TemplateManagement/TemplateList.module.css`

**要件**:

```typescript
interface TemplateListProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export const TemplateList: React.FC<TemplateListProps>;
```

**UI 要素**:

- 新規作成ボタン（上部）
- テンプレートカードのグリッド表示
  - テンプレート名
  - 作成日時
  - 領域数
  - 編集ボタン
  - 削除ボタン
- 空状態（テンプレートがない場合）

**削除確認**:

- 削除ボタンクリック → `window.confirm()` で確認（Modal 実装後に置き換え）

**CSS 要件**:

- グリッドレイアウト（2-3 列、レスポンシブ）
- カードスタイル（border, shadow）

**DEPENDENCY MAP**:

```typescript
/**
 * TemplateList Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/pages/TemplateManagementPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/types/template.ts
 *   ├─ src/components/common/Button/Button.tsx
 *   └─ ./TemplateList.module.css
 *
 * Related Documentation:
 *   ├─ Spec: ./TemplateList.spec.md
 *   ├─ Tests: ./TemplateList.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Prompt: docs/00_prompts/20241102_03_phase3-template-management.md
 */
```

---

## 6. TemplateEditor コンポーネント実装

**ファイル**:

- `src/components/TemplateManagement/TemplateEditor.tsx`
- `src/components/TemplateManagement/TemplateEditor.spec.md`
- `src/components/TemplateManagement/TemplateEditor.test.tsx`
- `src/components/TemplateManagement/TemplateEditor.module.css`

**要件**:

```typescript
interface TemplateEditorProps {
  template?: Template | null; // 編集モード時に渡される
  onSave: (template: CreateTemplateRequest | UpdateTemplateRequest) => void;
  onCancel: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps>;
```

**UI 構成**:

```
┌─ TemplateEditor ─────────────────────┐
│ テンプレート名: [入力フィールド]      │
│                                       │
│ ┌─ Camera ────────────┐              │
│ │ [カメラプレビュー]  │              │
│ │ [撮影ボタン]        │              │
│ └─────────────────────┘              │
│                                       │
│ ┌─ RegionSelector ────────────────┐  │
│ │ [撮影画像 + 領域選択Canvas]     │  │
│ └─────────────────────────────────┘  │
│                                       │
│ ┌─ 領域リスト ────────────────────┐  │
│ │ 1. 氏名 [編集] [削除] [↑] [↓]   │  │
│ │ 2. Q1回答 [編集] [削除] [↑] [↓] │  │
│ └─────────────────────────────────┘  │
│                                       │
│ [保存] [キャンセル]                   │
└───────────────────────────────────────┘
```

**状態管理**:

```typescript
const [templateName, setTemplateName] = useState("");
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const [regions, setRegions] = useState<Region[]>([]);
const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
const [errors, setErrors] = useState<Record<string, string>>({});
```

**保存処理**:

```typescript
const handleSave = () => {
  // バリデーション
  const nameValidation = validateTemplateName(templateName);
  if (!nameValidation.isValid) {
    setErrors({ name: nameValidation.error });
    return;
  }

  // 領域バリデーション
  for (const region of regions) {
    const nameValidation = validateRegionName(region.name);
    if (!nameValidation.isValid) {
      setErrors({ [`region-${region.id}`]: nameValidation.error });
      return;
    }
  }

  // テンプレート作成
  const templateData: CreateTemplateRequest = {
    name: templateName,
    baseImage: "", // 保存しない（localStorage容量対策）
    regions: regions,
  };

  onSave(templateData);
};
```

**領域編集機能**:

- 領域名編集: インライン編集または Prompt/Modal
- 領域削除: 確認後削除
- 領域順序変更: ↑↓ ボタンで並び替え

**DEPENDENCY MAP**:

```typescript
/**
 * TemplateEditor Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/pages/TemplateManagementPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/components/Camera/Camera.tsx
 *   ├─ src/components/TemplateManagement/RegionSelector.tsx
 *   ├─ src/components/common/Button/Button.tsx
 *   ├─ src/types/template.ts
 *   ├─ src/utils/validation.ts
 *   └─ ./TemplateEditor.module.css
 *
 * Related Documentation:
 *   ├─ Spec: ./TemplateEditor.spec.md
 *   ├─ Tests: ./TemplateEditor.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Prompt: docs/00_prompts/20241102_03_phase3-template-management.md
 */
```

---

## 7. TemplateManagementPage の更新

**ファイル**:

- `src/pages/TemplateManagementPage.tsx`

**要件**:

```typescript
type ViewMode = "list" | "edit";

export const TemplateManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { templates, createTemplate, updateTemplate, deleteTemplate } =
    useTemplate();

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setViewMode("edit");
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setViewMode("edit");
  };

  const handleSave = async (
    data: CreateTemplateRequest | UpdateTemplateRequest
  ) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data as UpdateTemplateRequest);
    } else {
      await createTemplate(data as CreateTemplateRequest);
    }
    setViewMode("list");
  };

  const handleCancel = () => {
    setViewMode("list");
  };

  return (
    <Layout title="テンプレート管理">
      {viewMode === "list" ? (
        <TemplateList
          templates={templates}
          onSelect={handleEdit}
          onDelete={deleteTemplate}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </Layout>
  );
};
```

**DEPENDENCY MAP 更新**:

- Parents: App.tsx (React Router)
- Dependencies: Layout, TemplateList, TemplateEditor, useTemplate

---

## 成果物チェックリスト

### ドキュメント

- [ ] useCamera.spec.md
- [ ] Camera.spec.md
- [ ] useTemplate.spec.md
- [ ] RegionSelector.spec.md
- [ ] TemplateList.spec.md
- [ ] TemplateEditor.spec.md

### 実装ファイル

- [ ] src/hooks/useCamera.ts
- [ ] src/components/Camera/Camera.tsx
- [ ] src/hooks/useTemplate.ts
- [ ] src/components/TemplateManagement/RegionSelector.tsx
- [ ] src/components/TemplateManagement/TemplateList.tsx
- [ ] src/components/TemplateManagement/TemplateEditor.tsx
- [ ] src/pages/TemplateManagementPage.tsx (更新)

### CSS ファイル

- [ ] Camera.module.css
- [ ] RegionSelector.module.css
- [ ] TemplateList.module.css
- [ ] TemplateEditor.module.css

### テストファイル

- [ ] useCamera.test.ts
- [ ] Camera.test.tsx
- [ ] useTemplate.test.ts
- [ ] RegionSelector.test.tsx
- [ ] TemplateList.test.tsx
- [ ] TemplateEditor.test.tsx

### 品質チェック

- [ ] TypeScript エラーなし
- [ ] Biome チェックエラーなし
- [ ] 全テスト合格
- [ ] DEPENDENCY MAP 記載完了
- [ ] Chrome Book 実機動作確認

### 作業ログ

- [ ] `docs/05_logs/2024_11/20241103/01_phase3-implementation.md` 作成

---

## 重要な注意事項

### localStorage 容量制限対策

**問題**: テンプレート画像（base64）を保存すると容量超過の可能性

**対策**:

1. **画像を保存しない** - 座標情報のみ保存（推奨）
2. データ入力時にテンプレート用紙を再撮影
3. または画像圧縮（JPEG 60-70%品質）

### カメラ権限エラー

**対応**:

- 明確なエラーメッセージ（日本語）
- 権限設定へのガイダンス
- 代替手段（ファイルアップロード）の検討（Phase 4 以降）

### パフォーマンス

- Canvas 描画: `requestAnimationFrame()` 使用
- 大きな画像: リサイズ・圧縮を検討
- リサイズハンドル: クリック領域を十分に確保（タッチ対応）

---

この実装プロンプトに従い、Phase 3 の開発を進めてください。

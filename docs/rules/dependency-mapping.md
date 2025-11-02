# 依存関係マッピング規則

## 概要

紙アンケート OCR 入力効率化 Web アプリにおける、ファイル間の依存関係を明示的に管理するための規則を定義します。

## 基本原則

### 1. DEPENDENCY MAP の必須記載

すべてのコンポーネント・ロジックファイルの先頭に、以下のフォーマットで依存関係マップを記載してください：

```typescript
/**
 * [Component/Function Name]
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ [親ファイル1のパス]
 *   ├─ [親ファイル2のパス]
 *   └─ [親ファイル3のパス]
 *
 * Dependencies (External files that this file imports):
 *   ├─ [依存ファイル1のパス]
 *   ├─ [依存ファイル2のパス]
 *   └─ [依存ファイル3のパス]
 *
 * Related Documentation:
 *   ├─ Spec: [仕様書のパス]
 *   ├─ Tests: [テストファイルのパス]
 *   └─ Plan: [実装計画のパス]
 */
```

### 2. 双方向の依存関係管理

#### 更新時の原則

ファイル A がファイル B を import する場合：

- **ファイル A**: Dependencies にファイル B を記載
- **ファイル B**: Parents にファイル A を記載

**両方のファイルを同時に更新する**ことが必須です。

## 具体例

### 例 1: Button コンポーネント

```typescript
/**
 * Button Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/Form/SubmitButton.tsx
 *   ├─ src/components/Modal/ConfirmDialog.tsx
 *   ├─ src/pages/TemplateManagement.tsx
 *   └─ src/pages/DataInput.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ src/hooks/useClickHandler.ts
 *   ├─ src/utils/classNameBuilder.ts
 *   └─ ./Button.module.css
 *
 * Related Documentation:
 *   ├─ Spec: ./Button.spec.md
 *   ├─ Tests: ./Button.test.tsx
 *   └─ Plan: docs/03_plans/button-component/20241102_01_implementation-plan.md
 */
import React from "react";
import { useClickHandler } from "../hooks/useClickHandler";
import { buildClassName } from "../utils/classNameBuilder";
import styles from "./Button.module.css";

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
}) => {
  // implementation
};
```

### 例 2: OCR エンジンユーティリティ

```typescript
/**
 * OCR Engine Utility
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/DataInput/OCRProcessor.tsx
 *   ├─ src/hooks/useOCRProcessing.ts
 *   └─ src/services/ocrService.ts
 *
 * Dependencies (External files that this file imports):
 *   ├─ tesseract.js
 *   ├─ src/utils/imageProcessor.ts
 *   ├─ src/types/ocr.ts
 *   └─ src/config/ocrConfig.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./ocrEngine.spec.md
 *   ├─ Tests: ./ocrEngine.test.ts
 *   └─ Plan: docs/03_plans/ocr-processing/20241102_01_implementation-plan.md
 */
import Tesseract from "tesseract.js";
import { processImage } from "./imageProcessor";
import { OCRResult, Region } from "../types/ocr";
import { OCR_CONFIG } from "../config/ocrConfig";
```

## 依存関係の種類

### 1. Parents（親ファイル）

このファイルを import して使用するファイル

**特定方法**:

- IDE の "Find References" 機能を使用
- `grep -r "import.*FileName" src/` でプロジェクト全体を検索
- 定期的に依存関係ツールで確認

### 2. Dependencies（依存ファイル）

このファイルが import して使用するファイル

**含むべきもの**:

- 自作のコンポーネント・フック・ユーティリティ
- 相対パスで import するファイル（CSS、型定義など）

**含まないもの**:

- React, React DOM などの基本ライブラリ
- node_modules の外部ライブラリ（Tesseract.js は例外として記載）

### 3. Related Documentation（関連ドキュメント）

このファイルに関連するドキュメントファイル

## 更新フロー

### 新規ファイル作成時

#### 1. 新しいファイルを作成

```typescript
// src/components/NewComponent/NewComponent.tsx
/**
 * New Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   (none - new component)
 *
 * Dependencies (External files that this file imports):
 *   ├─ src/components/Button/Button.tsx
 *   └─ ./NewComponent.module.css
 *
 * Related Documentation:
 *   ├─ Spec: ./NewComponent.spec.md
 *   ├─ Tests: ./NewComponent.test.tsx
 *   └─ Plan: docs/03_plans/new-component/20241102_01_implementation-plan.md
 */
import { Button } from "../Button/Button";
```

#### 2. 依存ファイルの Parents を更新

```typescript
// src/components/Button/Button.tsx
/**
 * Button Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/Form/SubmitButton.tsx
 *   ├─ src/components/Modal/ConfirmDialog.tsx
 *   ├─ src/components/NewComponent/NewComponent.tsx  // 追加
 *   ├─ src/pages/TemplateManagement.tsx
 *   └─ src/pages/DataInput.tsx
```

### 既存ファイル修正時

#### 1. import 文を追加した場合

```typescript
// Before
import { Button } from "../Button/Button";

// After
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal"; // 新規追加
```

**更新手順**:

1. 自ファイルの Dependencies に `Modal` を追加
2. `Modal.tsx` の Parents に自ファイルを追加

#### 2. import 文を削除した場合

```typescript
// Before
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";

// After
import { Button } from "../Button/Button";
// Modal import を削除
```

**更新手順**:

1. 自ファイルの Dependencies から `Modal` を削除
2. `Modal.tsx` の Parents から自ファイルを削除

### ファイル削除時

#### 削除するファイルがある場合

1. **Dependencies**: 依存先ファイルから自ファイルを Parents から削除
2. **Parents**: 自ファイルを使用している親ファイルを修正

## 依存関係分析の活用

### 1. 影響範囲分析

ファイル修正前に DEPENDENCY MAP を確認することで：

- **Parents** → このファイルを修正した場合の影響範囲
- **Dependencies** → このファイルが依存している外部要因

```typescript
/**
 * Button Component
 *
 * 修正時の影響分析:
 * - Parents (4ファイル) → Button の修正は4箇所に影響
 * - Dependencies (3ファイル) → 3つの依存に変更があればButtonも影響
 */
```

### 2. リファクタリング計画

#### 依存関係が複雑なファイルの特定

```
Parents が多い（5以上） → 再利用性が高い。慎重な修正が必要
Dependencies が多い（10以上） → 複雑すぎる。分割を検討
```

#### 循環依存の検出

DEPENDENCY MAP を追跡することで循環依存を発見：

```
A imports B → B imports C → C imports A (循環依存)
```

### 3. テスト範囲の決定

修正時にテストすべき範囲の特定：

```typescript
// Button.tsx を修正した場合
// → Parents の4ファイルでのButtonの動作をテスト
// → Dependencies の3ファイルに変更がないかチェック
```

## 自動化・ツール支援

### 1. 依存関係チェックスクリプト

```bash
#!/bin/bash
# check-dependencies.sh
echo "Checking dependency consistency..."

# Find all TypeScript files with DEPENDENCY MAP
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "Checking $file..."
  # Check if DEPENDENCY MAP exists
  if ! grep -q "DEPENDENCY MAP:" "$file"; then
    echo "WARNING: $file missing DEPENDENCY MAP"
  fi
done
```

### 2. 依存関係生成ツール

```javascript
// generate-dependency-map.js
const fs = require("fs");
const path = require("path");

function generateDependencyMap(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const imports = extractImports(content);
  const parents = findParentFiles(filePath);

  return {
    dependencies: imports.filter(
      (imp) => imp.startsWith("./") || imp.startsWith("../")
    ),
    parents: parents,
  };
}
```

### 3. IDE 拡張

VS Code 拡張で DEPENDENCY MAP の自動更新：

- import 文の変更を検知
- 自動的に DEPENDENCY MAP を更新
- 循環依存を警告

## チェックリスト

### ファイル作成時

- [ ] DEPENDENCY MAP が記載されているか
- [ ] Dependencies が正確に記載されているか
- [ ] 依存先ファイルの Parents を更新したか
- [ ] Related Documentation が設定されているか

### ファイル修正時

- [ ] import 文の変更に応じて Dependencies を更新したか
- [ ] 関連ファイルの Parents を更新したか
- [ ] 影響範囲（Parents）を確認したか
- [ ] 必要なテストを実行したか

### レビュー時

- [ ] DEPENDENCY MAP が最新か
- [ ] 循環依存が発生していないか
- [ ] 複雑すぎる依存関係がないか
- [ ] 不要な依存関係がないか

この規則により、ファイル間の関係を明確に管理し、保守性の高いコードベースを維持します。

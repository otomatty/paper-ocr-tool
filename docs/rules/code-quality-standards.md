# コード品質・保守性基準

## 概要

紙アンケート OCR 入力効率化 Web アプリにおけるコード品質と保守性に関する基準を定義します。

## 基本原則

### 1. テスト駆動開発（TDD）

**テストコマンド**: `bun run test`

#### テスト作成の流れ

```
1. Red: 失敗するテストを書く
2. Green: テストを通す最小限のコードを書く
3. Refactor: コードを改善・整理する
```

#### テストカバレッジ目標

- **関数・メソッド**: 80%以上
- **重要ロジック**: 100%（OCR 処理、テンプレート管理、データ変換）
- **UI コンポーネント**: 主要な動作と props の変化をテスト

#### テストファイル構造

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.spec.md      # 仕様書
│   │   └── Button.test.tsx     # テストコード
│   └── ...
├── utils/
│   ├── ocrEngine.ts
│   ├── ocrEngine.spec.md
│   └── ocrEngine.test.ts
```

### 2. 品質・保守性・安全性の意識

#### コード品質指標

- **複雑度**: 単一関数の Cyclomatic Complexity 10 以下
- **関数サイズ**: 50 行以下を目標
- **ファイルサイズ**: 300 行以下を目標
- **依存関係**: 循環依存の排除

#### 保守性向上のプラクティス

- **明確な命名**: 関数・変数名から役割が理解できる
- **単一責任原則**: 一つの関数・クラスは一つの責任のみ
- **DRY 原則**: 同じロジックの重複を避ける
- **YAGNI 原則**: 必要になるまで複雑な機能は実装しない

#### 安全性の考慮

- **入力検証**: ユーザー入力は必ず検証
- **エラーハンドリング**: 適切な例外処理とユーザーフィードバック
- **データ保護**: ローカルストレージの適切な利用（個人情報は保存しない）

### 3. プロジェクト段階別の品質バランス

#### プロトタイプ段階（現在）

- **重視**: 動作確認、概念実証
- **品質レベル**: 基本的な動作とエラーハンドリング
- **テスト**: 主要機能のみ（OCR、テンプレート保存・読み込み）

#### MVP 段階

- **重視**: ユーザビリティ、基本品質
- **品質レベル**: 80%のテストカバレッジ、基本的なリファクタリング
- **テスト**: 全主要機能とエラーケース

#### 本番環境段階

- **重視**: 信頼性、パフォーマンス、保守性
- **品質レベル**: 90%以上のテストカバレッジ、全面的リファクタリング
- **テスト**: 全機能、エッジケース、パフォーマンステスト

### 4. 問題対処の原則

#### ボーイスカウトルール

**「コードを見つけた時よりも良い状態で残す」**

実装例:

```typescript
// Before: 改善前
function processOCR(image: any): any {
  // 複雑で理解困難なロジック
  return result;
}

// After: 改善後
interface OCRInput {
  image: HTMLImageElement;
  regions: Region[];
}

interface OCRResult {
  text: string;
  confidence: number;
  region: Region;
}

function processOCR(input: OCRInput): Promise<OCRResult[]> {
  // 明確で理解しやすいロジック
  return extractTextFromRegions(input);
}
```

#### 問題発見時の対処

1. **即座に対処**: 簡単に修正できる問題
2. **Issue 記録**: 時間がかかる問題は`docs/01_issues/open/`に記録
3. **TODO/FIXME**: コード内にコメントで記録し、Issue と紐付け

```typescript
// TODO: Issue #123 - OCR処理のパフォーマンス改善が必要
// 現在平均20秒 → 目標10秒以内
function processOCRRegions(regions: Region[]): Promise<OCRResult[]> {
  // 暫定実装
}
```

## 具体的な品質基準

### TypeScript 利用規則

#### 型定義

```typescript
// Good: 明確な型定義
interface TemplateRegion {
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

// Bad: any型の使用
interface TemplateRegion {
  id: any;
  coordinates: any;
}
```

#### エラーハンドリング

```typescript
// Good: 適切なエラーハンドリング
async function saveTemplate(template: Template): Promise<Result<void, Error>> {
  try {
    await localStorage.setItem("template", JSON.stringify(template));
    return { success: true };
  } catch (error) {
    console.error("Template save failed:", error);
    return {
      success: false,
      error: new Error("テンプレートの保存に失敗しました"),
    };
  }
}

// Bad: エラーを無視
async function saveTemplate(template: Template): Promise<void> {
  localStorage.setItem("template", JSON.stringify(template)); // エラー処理なし
}
```

### React コンポーネント規則

#### 関数コンポーネント

```typescript
// Good: 明確なProps型定義
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

#### カスタムフック

```typescript
// Good: 再利用可能なロジックをフック化
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      setError("カメラへのアクセスに失敗しました");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  return { stream, error, startCamera, stopCamera };
}
```

## 品質チェック手順

### 開発時

1. **コード作成前**: 対応する`.spec.md`ファイルを確認
2. **実装中**: 複雑度・関数サイズをチェック
3. **実装後**: テストを作成・実行
4. **コミット前**: `bun run test`でテスト確認

### レビュー時

1. **型安全性**: TypeScript エラーがないか
2. **テストカバレッジ**: 主要ロジックがテストされているか
3. **命名規則**: 意図が明確に伝わるか
4. **依存関係**: DEPENDENCY MAP が正確か

### リリース前

1. **統合テスト**: 全機能の動作確認
2. **パフォーマンステスト**: OCR 処理時間の測定
3. **ユーザビリティテスト**: 実際の使用シナリオでの確認

## ツールとライブラリ

### 開発支援ツール

- **テスト**: Vitest (Bun に内蔵)
- **型チェック**: TypeScript
- **リンター・フォーマッター**: Biome（高速な統合ツール）
  - `bun run lint` - コードチェック実行
  - `bun run lint:fix` - 自動修正付きチェック
  - `bun run format` - コードフォーマット実行

### 品質測定ツール

- **テストカバレッジ**: `bun run test:coverage`
- **バンドルサイズ**: Vite bundle analyzer
- **パフォーマンス**: Browser DevTools

品質基準は、プロジェクトの進行に合わせて段階的に強化していきます。

# UI ミニマルデザイン改善 実装計画

## 計画概要

- **計画日**: 2024-11-04
- **担当者**: AI Assistant
- **完了予定**: 2024-11-04
- **依存関係**: 既存のコンポーネント構造

## 実装段階

### Phase 1: 基盤整備 (予定: 30 分)

**目標**: デザインシステムとアイコンライブラリの導入

**タスク**:

- [x] lucide-react のインストール
- [x] デザイントークン定義ファイルの作成
- [x] グローバルスタイルの更新

**成果物**:

- `src/config/designTokens.ts`
- `src/styles/globals.css` (更新)

### Phase 2: 共通コンポーネント拡張 (予定: 1 時間)

**目標**: 新しい共通コンポーネントの実装

**タスク**:

- [x] Card コンポーネントの作成
- [x] Badge コンポーネントの作成
- [x] Spinner コンポーネントの作成
- [x] 既存 Button コンポーネントの改善

**成果物**:

- `src/components/common/Card/Card.tsx`
- `src/components/common/Card/Card.spec.md`
- `src/components/common/Badge/Badge.tsx`
- `src/components/common/Badge/Badge.spec.md`
- `src/components/common/Spinner/Spinner.tsx`
- `src/components/common/Spinner/Spinner.spec.md`

### Phase 3: レイアウト改善 (予定: 30 分)

**目標**: Layout コンポーネントのミニマルデザイン化

**タスク**:

- [x] ヘッダーデザインの改善
- [x] ナビゲーションの改善
- [x] アイコン追加

**成果物**:

- `src/components/common/Layout/Layout.tsx` (更新)

### Phase 4: ページデザイン改善 (予定: 1.5 時間)

**目標**: 各ページのミニマルデザイン化

**タスク**:

- [x] HomePage の改善
- [x] TemplateManagementPage の改善
- [x] DataInputPage の改善

**成果物**:

- `src/pages/HomePage.tsx` (更新)
- `src/pages/TemplateManagementPage.tsx` (更新)
- `src/pages/DataInputPage.tsx` (更新)

## デザイン原則

### ミニマルデザインの特徴

1. **余白の活用**: 十分なホワイトスペース
2. **シンプルなカラーパレット**: グレースケール中心
3. **クリーンなタイポグラフィ**: システムフォント使用
4. **控えめなアニメーション**: スムーズだが目立たない
5. **明確な階層**: サイズとウェイトで区別

### カラーパレット

- **Primary**: ダークグレー (#1f2937)
- **Accent**: 控えめなブルー (#3b82f6)
- **Background**: ホワイト/ライトグレー
- **Text**: ダークグレー階調

## 技術設計

### デザイントークン構造

```typescript
{
  colors: { neutral, primary, accent, status },
  spacing: { xs, sm, md, lg, xl, 2xl },
  typography: { fontSize, fontWeight, lineHeight },
  borderRadius: { sm, md, lg },
  shadows: { sm, md, lg }
}
```

### コンポーネント設計

- **Card**: シンプルな枠線、控えめな影
- **Badge**: 小さく控えめなステータス表示
- **Spinner**: ミニマルなローディングアニメーション
- **Button**: フラットでクリーンなボタン

## リスクと対策

- **リスク 1**: 既存機能への影響 → 対策: 段階的な適用、既存クラス名の保持
- **リスク 2**: レスポンシブ対応の崩れ → 対策: モバイルファーストで確認

## 進捗追跡

- [x] Phase 1 完了
- [x] Phase 2 完了
- [x] Phase 3 完了
- [x] Phase 4 完了
- [ ] テスト完了
- [ ] ドキュメント更新完了

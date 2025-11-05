# Logo.spec.md

## Related Files

- Implementation: `Logo.tsx`
- Tests: `Logo.test.tsx`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/`
- Plan: `docs/03_plans/ui-minimal-design/`

## Requirements

### Functional Requirements

- **FR-001**: ロゴは PaperScan アプリケーションのブランドアイデンティティを表現する
- **FR-002**: 紙のアイコンとスキャンラインを組み合わせたデザイン
- **FR-003**: サイズ調整可能（size props で制御）
- **FR-004**: テキストラベルの表示/非表示を切り替え可能
- **FR-005**: レスポンシブデザインに対応

### Non-Functional Requirements

- **NFR-001**: SVG ベースでスケーラブル（どのサイズでも鮮明）
- **NFR-002**: アクセシビリティ対応（aria-label, title 要素）
- **NFR-003**: ミニマルデザイン原則に準拠
- **NFR-004**: パフォーマンス：軽量な SVG 実装

## Interface Definition

```typescript
interface LogoProps {
  /** Size of the logo in pixels (width) */
  size?: number;
  /** Whether to show the text label */
  showText?: boolean;
  /** Custom class name */
  className?: string;
}
```

## Behavior Specification

### Normal Cases

- **ケース 1**: デフォルト状態 → アイコン + "PaperScan"テキストを表示
- **ケース 2**: `showText={false}` → アイコンのみ表示
- **ケース 3**: `size={60}` → 小サイズで表示
- **ケース 4**: `size={200}` → 大サイズで表示

### Edge Cases

- **エッジケース 1**: `size={0}` → 0px で表示（実用的ではないが処理可能）
- **エッジケース 2**: 極端に大きな size 値 → スケーリングは維持される

### Design Specifications

#### アイコンデザイン

- 紙のシルエット（長方形）
- 右上に折り返し角（ドキュメント感）
- 3 本のスキャンライン（中央が強調）
- カラー：ニュートラル（紙）+ ブルー（スキャン）

#### テキストデザイ

- フォント：`font-semibold`（中太）
- トラッキング：`tracking-tight`（文字間狭め）
- カラー：`text-neutral-900`

## Test Cases

### TC-001: デフォルトレンダリング

- **Purpose**: デフォルト props でロゴが正しく表示される
- **Input**: `<Logo />`
- **Expected**:
  - SVG アイコンが表示される
  - "PaperScan"テキストが表示される
  - 幅 120px で表示される

### TC-002: アイコンのみ表示

- **Purpose**: テキストなしでアイコンのみ表示
- **Input**: `<Logo showText={false} />`
- **Expected**:
  - SVG アイコンが表示される
  - テキストが表示されない

### TC-003: カスタムサイズ

- **Purpose**: size props で表示サイズが変更される
- **Input**: `<Logo size={60} />`
- **Expected**:
  - 幅 60px で表示される
  - アイコンとテキストのサイズ比率が維持される

### TC-004: カスタム className

- **Purpose**: 追加の CSS クラスを適用可能
- **Input**: `<Logo className="custom-class" />`
- **Expected**:
  - `custom-class`が適用される
  - デフォルトのスタイルが保持される

### TC-005: アクセシビリティ

- **Purpose**: スクリーンリーダー対応
- **Input**: `<Logo />`
- **Expected**:
  - SVG に`role="img"`属性
  - `aria-label="PaperScan logo"`属性
  - `<title>`要素が存在

## Acceptance Criteria

- [ ] すべての props が正しく動作する
- [ ] SVG がどのサイズでも鮮明に表示される
- [ ] アクセシビリティ基準を満たす
- [ ] ミニマルデザインの美観を保つ
- [ ] すべてのテストケースが合格する

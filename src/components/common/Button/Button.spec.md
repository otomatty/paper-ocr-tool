# Button.spec.md

## Related Files

- Implementation: `Button.tsx`
- Tests: `Button.test.tsx`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_02_common-components-development.md`
- Prompt: `docs/00_prompts/20241102_02_phase2-common-components.md`

## Requirements

### Functional Requirements

- **FR-BUTTON-001**: variant プロパティでスタイルを変更できる
  - 'primary': 青系の主要ボタン
  - 'secondary': グレー系のセカンダリボタン
  - 'danger': 赤系の危険操作ボタン
- **FR-BUTTON-002**: size プロパティでサイズを変更できる
  - 'small': コンパクトなサイズ
  - 'medium': 標準サイズ（デフォルト）
  - 'large': 大きめのサイズ
- **FR-BUTTON-003**: disabled 状態をサポートする
  - disabled 時はクリック不可
  - 視覚的に無効状態を示す
- **FR-BUTTON-004**: onClick ハンドラーを実行する

  - クリック時に onClick プロパティの関数を実行
  - disabled 時は実行しない

- **FR-BUTTON-005**: children または label でテキストを表示する
  - children が優先される
  - children がない場合は label を表示

### Non-Functional Requirements

- **NFR-BUTTON-001**: アクセシビリティ対応
  - type 属性を明示的に設定
  - disabled 属性を設定
  - aria-label のサポート
- **NFR-BUTTON-002**: ユーザビリティ
  - ホバー時に視覚フィードバック
  - フォーカス時にアウトライン表示
  - タッチデバイスでも操作しやすいサイズ

## Interface Definition

```typescript
interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  className?: string; // for additional custom styles
}
```

## Behavior Specification

### Normal Cases

- **ケース 1**: onClick が呼ばれる → クリック時に関数が実行される
- **ケース 2**: variant='primary' → 青系のスタイルで表示される
- **ケース 3**: size='large' → 大きいサイズで表示される

### Edge Cases

- **エッジケース 1**: children と label の両方が指定 → children が優先
- **エッジケース 2**: children も label もない → 空のボタンを表示
- **エッジケース 3**: onClick がない → ボタンは表示されるが、クリックしても何も起こらない

### Error Cases

- **エラーケース 1**: disabled=true でクリック → onClick は実行されない

## Test Cases

### TC-BUTTON-001: 基本的なレンダリング

- **Purpose**: Button が正常にレンダリングされることを確認
- **Input**: `<Button label="クリック" />`
- **Expected**: "クリック" というテキストのボタンが表示される

### TC-BUTTON-002: variant プロパティ

- **Purpose**: variant でスタイルが変わることを確認
- **Input**: 各 variant でレンダリング
- **Expected**:
  - primary: bg-blue クラスが含まれる
  - secondary: bg-gray クラスが含まれる
  - danger: bg-red クラスが含まれる

### TC-BUTTON-003: size プロパティ

- **Purpose**: size でサイズが変わることを確認
- **Input**: 各 size でレンダリング
- **Expected**: 適切なサイズのクラスが適用される

### TC-BUTTON-004: onClick ハンドラー

- **Purpose**: クリック時に onClick が呼ばれることを確認
- **Input**: onClick 付きでレンダリング、クリック
- **Expected**: onClick が 1 回呼ばれる

### TC-BUTTON-005: disabled 状態

- **Purpose**: disabled 時にクリック不可になることを確認
- **Input**: disabled=true でレンダリング、クリック
- **Expected**: onClick が呼ばれない、disabled 属性がある

### TC-BUTTON-006: children vs label

- **Purpose**: children が優先されることを確認
- **Input**: `<Button label="Label">Children</Button>`
- **Expected**: "Children" が表示される

## Acceptance Criteria

- [ ] Button コンポーネントが実装され、基本的なレンダリングができる
- [ ] variant プロパティで 3 種類のスタイルを切り替えられる
- [ ] size プロパティで 3 種類のサイズを切り替えられる
- [ ] disabled 状態が正しく動作する
- [ ] onClick ハンドラーが正しく実行される
- [ ] Tailwind CSS でスタイリングされている
- [ ] すべてのテストが合格する
- [ ] DEPENDENCY MAP が記載されている

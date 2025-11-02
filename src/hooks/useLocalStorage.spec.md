# useLocalStorage.spec.md

## Related Files

- Implementation: `useLocalStorage.ts`
- Tests: `useLocalStorage.test.ts`

## Related Documentation

- Issue: `docs/01_issues/open/2024_11/20241102_02_common-components-development.md`
- Prompt: `docs/00_prompts/20241102_02_phase2-common-components.md`

## Requirements

### Functional Requirements

- **FR-LOCALSTORAGE-001**: useState と同様の API を提供する
  - [value, setValue] の配列を返す
  - setValue で値を更新できる
- **FR-LOCALSTORAGE-002**: localStorage に値を自動保存する
  - setValue 実行時に localStorage.setItem を呼ぶ
  - JSON.stringify で自動シリアライズ
- **FR-LOCALSTORAGE-003**: 初期値をサポートする
  - localStorage に値がない場合、初期値を使用
  - 初期値も localStorage に保存
- **FR-LOCALSTORAGE-004**: 型安全性を提供する
  - ジェネリック型パラメータで型を指定
  - 取得・設定時に型チェック

### Non-Functional Requirements

- **NFR-LOCALSTORAGE-001**: エラーハンドリング
  - localStorage が使用できない場合に fallback
  - QuotaExceededError のハンドリング
  - JSON パースエラーのハンドリング
- **NFR-LOCALSTORAGE-002**: パフォーマンス
  - 不要な再レンダリングを防ぐ
  - localStorage アクセスの最適化

## Interface Definition

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void];
```

## Behavior Specification

### Normal Cases

- **ケース 1**: 初回使用時 → 初期値を返し、localStorage に保存
- **ケース 2**: setValue 実行 → state 更新 + localStorage 保存
- **ケース 3**: localStorage に既存値がある → 既存値を返す

### Edge Cases

- **エッジケース 1**: localStorage が無効 → メモリ内でのみ動作（useState と同じ）
- **エッジケース 2**: 関数形式の更新 → 前の値を受け取って新しい値を返す
- **エッジケース 3**: 複雑なオブジェクト → JSON シリアライズ/デシリアライズ

### Error Cases

- **エラーケース 1**: JSON パースエラー → 初期値を使用
- **エラーケース 2**: QuotaExceededError → コンソールエラー、state は更新

## Test Cases

### TC-LOCALSTORAGE-001: 初期値の設定

- **Purpose**: 初期値が正しく設定されることを確認
- **Input**: `useLocalStorage('test-key', 'initial-value')`
- **Expected**: 'initial-value' が返される

### TC-LOCALSTORAGE-002: 値の更新

- **Purpose**: setValue で値が更新されることを確認
- **Input**: setValue('new-value') を実行
- **Expected**:
  - 新しい値が state に反映される
  - localStorage に保存される

### TC-LOCALSTORAGE-003: localStorage からの読み込み

- **Purpose**: 既存の localStorage 値を読み込むことを確認
- **Input**: localStorage に既存値がある状態で hook を使用
- **Expected**: 既存値が返される

### TC-LOCALSTORAGE-004\*\*: 関数形式の更新

- **Purpose**: setState のような関数形式の更新ができることを確認
- **Input**: setValue(prev => prev + 1)
- **Expected**: 前の値に基づいて更新される

### TC-LOCALSTORAGE-005: 型安全性

- **Purpose**: ジェネリック型が正しく機能することを確認
- **Input**: `useLocalStorage<number>('count', 0)`
- **Expected**: number 型として扱われる

## Acceptance Criteria

- [ ] useLocalStorage フックが実装されている
- [ ] useState と同様の API で動作する
- [ ] localStorage への保存・読み込みが正常に動作する
- [ ] エラーハンドリングが実装されている
- [ ] 型安全性が確保されている
- [ ] すべてのテストが合格する
- [ ] DEPENDENCY MAP が記載されている

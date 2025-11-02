# プロジェクトドキュメント構造

このディレクトリには、紙アンケート OCR 入力効率化 Web アプリのドキュメントファイルが、ソフトウェア開発ライフサイクルに沿って整理されています。

## ドキュメント構造

```
docs/
├── README.md                     # このファイル - ドキュメント構造の説明
├── rules/                        # 開発規則・ガイドライン
│   ├── README.md
│   ├── code-quality-standards.md
│   ├── language-rules.md
│   ├── ai-documentation.md
│   └── dependency-mapping.md
├── 00_prompts/                   # AI・開発者への指示書
├── 01_issues/                    # 問題・要件定義
│   ├── open/YYYY_MM/            # 未解決の問題
│   └── resolved/                 # 解決済みの問題
├── 02_research/YYYY_MM/         # 技術調査・選定
├── 03_plans/                    # 実装計画
│   ├── {機能名}/               # 機能別の段階的実装計画
│   └── overall/                 # 全体計画
└── 05_logs/YYYY_MM/YYYYMMDD/   # 作業記録・振り返り
```

## ドキュメント駆動開発フロー

```
PROMPT → ISSUE → RESEARCH → PLAN → SPEC+TEST → IMPLEMENTATION → LOG
```

### 各段階の説明

1. **PROMPT（00_prompts/）**: AI・開発者への指示書

   - 具体的なタスクの指示
   - 実装方針の明確化

2. **ISSUE（01_issues/）**: 問題・要件定義

   - 機能要件・非機能要件の詳細化
   - 受け入れ条件の定義

3. **RESEARCH（02_research/）**: 技術調査

   - ライブラリ・フレームワークの選定
   - 実装可能性の検証

4. **PLAN（03_plans/）**: 実装計画

   - 段階的な実装手順
   - ファイル構造・コンポーネント設計

5. **SPEC+TEST（src/）**: 仕様書+テスト

   - `*.spec.md`: 詳細仕様とテストケース
   - `*.test.tsx`: 実際のテストコード

6. **LOG（05_logs/）**: 作業記録
   - 実装中の課題・解決方法
   - 決定事項・変更点の記録

## ファイル命名規則

### Issue・Research・Log

- `YYYYMMDD_NN_機能名-概要.md`
- 例: `20241102_01_template-management.md`

### Plan

- `機能名/YYYYMMDD_NN_計画概要.md`
- 例: `template-management/20241102_01_implementation-plan.md`

## 更新ルール

**重要**: ファイルを修正したら、必ず関連ドキュメントも更新してください。

### 更新対象

- 実装ファイル修正 → `.spec.md`、テストファイル、実装計画
- 新機能追加 → Issue、Plan、Log の作成
- バグ修正 → Issue の状態更新、Log の記録

詳細は [`../github/copilot-instructions.md`](../.github/copilot-instructions.md) を参照してください。

## プロジェクト概要

紙媒体で回収したアンケートを、Chrome Book のカメラを用いて OCR 認識し、社内システムへ転記する業務を効率化する Web アプリケーション。

### 主要機能

- **テンプレート管理**: 空のアンケート様式を登録し、抽出領域を定義
- **データ入力**: 記入済みアンケートをカメラで撮影し、OCR 実行
- **結果編集**: 抽出結果の確認・修正・並べ替え
- **データ出力**: 整形したテキストをクリップボードにコピー

### 技術スタック

- **フロントエンド**: React.js, TypeScript
- **OCR エンジン**: Tesseract.js
- **データ保存**: ブラウザローカルストレージ
- **開発環境**: Bun, Vite

### セキュリティ方針

- 全処理はブラウザ内で完結
- テンプレート定義のみローカルストレージに保存
- アンケート画像・個人情報は外部送信なし

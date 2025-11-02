# OCR 技術比較調査

## 調査概要

- **調査日**: 2024-11-02
- **調査者**: プロジェクトチーム
- **目的**: 紙アンケート OCR アプリに最適な OCR エンジンを選定する

## 調査対象

### 候補 1: Tesseract.js

- **概要**: Google の Tesseract OCR エンジンの JavaScript 移植版
- **メリット**:
  - クライアントサイド完結（プライバシー保護）
  - 無料・オープンソース
  - 日本語サポート
  - React.js との統合が容易
  - ローカル処理のため外部 API の制約なし
- **デメリット**:
  - 処理速度がクラウド API より遅い
  - 精度がクラウドサービスより劣る場合がある
  - ブラウザのメモリ消費が大きい
- **実装コスト**: 低（学習コストも低）

### 候補 2: Google Cloud Vision API

- **概要**: Google のクラウドベース OCR サービス
- **メリット**:
  - 高精度な文字認識
  - 高速処理
  - 手書き文字の認識精度が高い
  - 豊富な言語サポート
- **デメリット**:
  - 利用料金が発生
  - インターネット接続必須
  - 画像データを外部送信（プライバシーリスク）
  - API キーの管理が必要
- **実装コスト**: 中（API 統合の学習コスト）

### 候補 3: Azure Computer Vision

- **概要**: Microsoft のクラウドベース OCR サービス
- **メリット**:
  - 高精度な文字認識
  - Office 製品との親和性
  - 企業向けセキュリティ機能
- **デメリット**:
  - 利用料金が発生
  - 画像データを外部送信
  - Azure 環境のセットアップが必要
- **実装コスト**: 高（Azure 学習コスト）

## 比較結果

| 項目             | Tesseract.js | Google Cloud Vision | Azure Computer Vision | 重要度   |
| ---------------- | ------------ | ------------------- | --------------------- | -------- |
| プライバシー保護 | ◎            | ×                   | ×                     | **最高** |
| 実装の容易さ     | ◎            | ○                   | △                     | 高       |
| 処理速度         | △            | ◎                   | ◎                     | 中       |
| 認識精度         | ○            | ◎                   | ◎                     | 高       |
| コスト           | ◎            | △                   | △                     | 高       |
| オフライン動作   | ◎            | ×                   | ×                     | 高       |
| 日本語サポート   | ○            | ◎                   | ◎                     | 高       |

## 技術的検証

### Tesseract.js の性能テスト

```javascript
// 基本的な実装例
import Tesseract from "tesseract.js";

const recognizeText = async (imageElement) => {
  const result = await Tesseract.recognize(imageElement, "jpn", {
    logger: (m) => console.log(m.status, m.progress),
  });
  return result.data.text;
};
```

**予想パフォーマンス**:

- A4 アンケート 1 枚（10 領域）: 15-25 秒
- 精度: 印刷文字 85-95%、手書き文字 60-80%
- メモリ使用量: 50-100MB

### プライバシー要件への適合性

**重要な制約**: アンケートには個人情報が含まれる可能性があり、外部サーバーへの送信は避けるべき

- **Tesseract.js**: ✅ 完全にローカル処理
- **Cloud APIs**: ❌ 画像データを外部送信

## 推奨案

**選択**: Tesseract.js

**理由**:

1. **プライバシー保護が最優先**: 個人情報を含むアンケート画像を外部送信しない
2. **コスト効率**: 無料で利用でき、継続的なコストが発生しない
3. **実装の容易さ**: React.js との統合が簡単、学習コストが低い
4. **オフライン動作**: インターネット接続に依存しない安定性
5. **要件への適合**: 20 秒以内の OCR 処理要件を満たす可能性が高い

**採用時の最適化戦略**:

1. **前処理の活用**: 画像のコントラスト調整、ノイズ除去で精度向上
2. **並列処理**: Web Worker を活用した非同期処理で UI 応答性向上
3. **領域分割**: 小さな領域単位での処理でメモリ効率化
4. **プログレス表示**: 処理時間の長さをユーザビリティでカバー

**リスク**:

- **精度問題**: 手書き文字や画質不良時の認識精度低下
  - 対策: ユーザーによる結果確認・修正機能を充実
- **処理時間**: クラウド API より処理が遅い
  - 対策: 段階的処理、プログレス表示で UX 改善

## 次のアクション

- [ ] Tesseract.js の詳細実装検証
- [ ] 実際のアンケート画像での精度テスト
- [ ] パフォーマンス最適化手法の調査
- [ ] UI/UX での処理時間カバー方法の検討

## 参照資料

- [Tesseract.js 公式ドキュメント](https://tesseract.projectnaptha.com/)
- [Tesseract.js GitHub](https://github.com/naptha/tesseract.js)
- [Google Cloud Vision API](https://cloud.google.com/vision)
- [Azure Computer Vision](https://azure.microsoft.com/services/cognitive-services/computer-vision/)
- [OCR 精度比較ベンチマーク](https://github.com/evaluation/ocr-benchmark)

# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: 高精度翻訳アプリ
開始日: 2026-01-22
技術スタック:
  frontend: React 18 + TypeScript 5 + MUI v6 + Vite 5
  backend: なし（フロントエンドのみ）
  database: なし（localStorage使用）
```

## 開発環境
```yaml
ポート設定:
  frontend: 3247

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - VITE_GOOGLE_TRANSLATE_API_KEY: Google Cloud Translation APIキー
```

## テスト認証情報
```yaml
開発用アカウント:
  認証なし（デモアプリのため）

外部サービス:
  Google Cloud Translation API: APIキーを.env.localに設定
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: TranslationPage.tsx)
  - ユーティリティ: camelCase.ts (例: translateText.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: LANGUAGES.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止
  - エラーハンドリング必須
  - 関数行数: 100行以下
  - ファイル行数: 700行以下
  - 複雑度: 10以下
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
外部API:
  - Google Cloud Translation API: https://translation.googleapis.com/language/translate/v2
  - Web Speech API: ブラウザ標準（window.SpeechRecognition）
  - Tesseract.js: npm パッケージ
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts

主要な型:
  - Language: 言語情報
  - TranslationRequest: 翻訳リクエスト
  - TranslationResponse: 翻訳レスポンス
```

## ブラウザ対応
```yaml
推奨ブラウザ:
  - Chrome 90+（音声認識フル対応）
  - Edge 90+（音声認識フル対応）

制限あり:
  - Firefox: 音声認識非対応
  - Safari: 音声認識一部対応
```

## 最新技術情報
```yaml
# Web検索で解決した破壊的変更を記録
注意事項:
  - Web Speech API: Chrome/Edgeのみフル対応
  - Tesseract.js v5: WebWorker必須
  - MUI v6: emotion依存（styled-components非対応）
```

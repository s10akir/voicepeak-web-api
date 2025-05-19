# Voicepeak WebAPI

VoicepeakのCLIを利用した音声合成Web APIサーバーです。  
Elysia（Bun用Webフレームワーク）とSwaggerドキュメントを利用しています。

## 特徴

- Voicepeak CLIをラップしたREST API
- 話者・感情・話速・ピッチなどVoicepeakの主要オプションに対応
- ナレーター一覧・感情一覧取得APIも提供
- Swagger UIによるAPIドキュメント自動生成

---

## 必要要件

- [Bun](https://bun.sh/) v1.0以上
- [Voicepeak](https://www.ai-j.jp/voicepeak/)（CLIが利用可能な環境）

---

## セットアップ

1. **リポジトリをクローン**
    ```sh
    git clone <このリポジトリのURL>
    cd voicepeak-api
    ```

2. **依存パッケージのインストール**
    ```sh
    bun install
    ```

3. **サーバー起動**
    ```sh
    bun run src/index.ts
    ```
    デフォルトで `http://localhost:3000` で起動します。

---

## APIエンドポイント

### 1. 音声合成

- **POST** `/synthesize`
- **説明**: 指定したテキスト・話者・感情などで音声合成し、WAVファイルを返します。

#### リクエストボディ（JSON）

| パラメータ | 型     | 必須 | 説明                         |
|:-----------|:------:|:----:|:-----------------------------|
| text       | string | 必須 | 読み上げるテキスト           |
| narrator   | string | 任意 | 話者名（例: 女声1）          |
| emotion    | string | 任意 | 感情表現（例: happy=80,sad=20）|
| speed      | number | 任意 | 話速（50-200）               |
| pitch      | number | 任意 | ピッチ（-300～300）          |

#### レスポンス

- 成功時: `audio/wav` バイナリ（ダウンロード）
- 失敗時:  
  ```json
  { "error": "エラーメッセージ" }
  ```

#### サンプル

```sh
curl -X POST http://localhost:3000/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "こんにちは、世界！",
    "narrator": "女声1",
    "emotion": "happy=80,sad=20",
    "speed": 120,
    "pitch": 50
  }' \
  --output output.wav
```

---

### 2. ナレーター一覧取得

- **GET** `/list-narrator`
- **説明**: 利用可能なナレーター（話者）の一覧をテキストで返します。

#### レスポンス

- 成功時: 改行区切りのテキスト

---

### 3. 感情一覧取得

- **GET** `/list-emotion?narrator=<話者名>`
- **説明**: 指定したナレーターの感情一覧をテキストで返します。

#### クエリパラメータ

| パラメータ | 型     | 必須 | 説明           |
|:-----------|:------:|:----:|:---------------|
| narrator   | string | 必須 | ナレーター名   |

#### レスポンス

- 成功時: 感情一覧テキスト
- 失敗時:  
  ```json
  { "error": "narratorパラメータが必要です" }
  ```

---

## Swagger UI

- `http://localhost:3000/swagger` でAPI仕様をGUIで確認できます。

---

## ライセンス

MIT

---

## 補足

- Voicepeak CLIがインストールされている必要があります。
- 本APIはVoicepeakのライセンス・利用規約に従ってご利用ください。

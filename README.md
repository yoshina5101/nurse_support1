# ナースキャリア — 新卒看護師 就活支援アプリ

新卒看護師の就職活動を支援する Web アプリです。学生（就活生）は自己分析・履歴書・小論文を **AI添削** を受けながら準備でき、チャットルームで情報交換ができます。教育担当者（管理者）は学生アカウント・通報・有料コンテンツを管理できます。

## 主な機能

### 学生画面
- **自己分析ツール** — 設問に回答すると、AIが強み・課題・向いている職場の傾向を分析
- **履歴書作成・AI添削** — 各項目を入力し、採用担当者目線のAI添削を取得
- **小論文練習・AI添削** — お題を選んで執筆し、AIの添削＋100点満点の評価
- **チャットルーム** — 就活仲間と交流（不適切な投稿は通報可能）
- **お役立ち記事** — 就活情報の閲覧（有料記事はプレミアム会員限定）

### 管理画面
- **ユーザー管理** — 学生アカウントの登録・確認・プラン変更・停止・削除
- **通報管理** — 通報されたメッセージの確認・削除・対応／却下
- **コンテンツ管理** — 記事の追加・削除、無料／有料の切り替え

## 技術スタック
- Next.js 15（App Router / TypeScript）
- PostgreSQL 16 + Prisma
- Auth.js (NextAuth v5) — ロールベース認証（STUDENT / ADMIN）
- Anthropic Claude API（AI添削）
- Tailwind CSS

## セットアップ

### 1. 依存をインストール
```bash
npm install
```

### 2. 環境変数を設定
```bash
cp .env.example .env
```
`.env` を編集します。
- `DATABASE_URL` — PostgreSQL 接続文字列（下記 docker-compose を使う場合はそのままでOK）
- `AUTH_SECRET` — `openssl rand -base64 32` などで生成した値を設定
- `ANTHROPIC_API_KEY` — **任意**。未設定の場合、AI添削はダミー応答になります（画面の動作確認は可能）

### 3. データベースを起動
docker を使う場合:
```bash
docker compose up -d
```
※ ホストの PostgreSQL を使う場合は `DATABASE_URL` を合わせて変更してください。

### 4. マイグレーションとシード投入
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. 開発サーバーを起動
```bash
npm run dev
```
http://localhost:3000 を開きます。

## デモ用アカウント（パスワードはすべて `password123`）
| 役割 | メールアドレス | 備考 |
| --- | --- | --- |
| 管理者 | admin@example.com | 管理画面 |
| 学生（無料） | student@example.com | 有料コンテンツは閲覧不可 |
| 学生（有料） | premium@example.com | すべて閲覧可能 |

## ディレクトリ構成
```
prisma/
  schema.prisma        # DBスキーマ
  seed.ts              # 初期データ
src/
  lib/                 # db / auth / ai / session など
  app/
    login, register    # 認証
    (student)/...       # 学生画面
    (admin)/...         # 管理画面
    api/...             # Route Handler（AI添削・チャット・通報）
  components/           # 共通UI
  middleware.ts        # 認証・ロールによるルート保護
```

## 補足・今後の拡張余地
- 本アプリはプロトタイプです。決済連携（Stripe 等）、面接練習（録音・文字起こし）、本番デプロイは今回スコープ外です（拡張しやすい設計にしています）。
- AIによる添削・分析は参考情報です。内容の正確性は保証されません。

# 本番デプロイ手順（Vercel + Neon）

「あかり」を本番公開するための手順です。**Vercel**（ホスティング）と **Neon**（本番PostgreSQL）を使います。どちらも無料枠から始められます。

---

## 全体の流れ

```
1. Neon で本番DBを用意 → 接続文字列を取得
2. 各種シークレットを準備（AUTH_SECRET など）
3. Vercel にリポジトリを接続し、環境変数を設定してデプロイ
4. 本番DBにマイグレーション + シードを流す
5. 動作確認（独自ドメインは任意）
```

---

## 1. Neon で本番DBを用意

1. https://neon.tech にサインアップ（GitHubログイン可）
2. 新しいプロジェクトを作成（リージョンは `Tokyo (ap-northeast-1)` 推奨）
3. ダッシュボードの **Connection string** をコピー
   - 形式例：`postgresql://user:password@ep-xxx.ap-northeast-1.aws.neon.tech/neondb?sslmode=require`
   - この値が本番の `DATABASE_URL` になります（`sslmode=require` が付いていることを確認）

---

## 2. シークレットを準備

ローカルのターミナルで本番用の `AUTH_SECRET` を生成：

```bash
openssl rand -base64 32
```

出力をメモしておきます（手順3で使用）。

---

## 3. Vercel にデプロイ

1. https://vercel.com にサインアップ（GitHubログイン）
2. **Add New → Project** → リポジトリ `yoshina5101/nurse_support1` をインポート
3. **Branch** を `claude/nurse-support-app-KIDA8`（または本番用にmainへマージしたブランチ）に設定
4. **Environment Variables** に以下を設定：

| 変数名 | 値 | 必須 |
|---|---|---|
| `DATABASE_URL` | Neonの接続文字列 | ✅ |
| `AUTH_SECRET` | 手順2で生成した値 | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://<本番URL>`（後でドメイン確定後に更新可） | ✅ |
| `ANTHROPIC_API_KEY` | Claude APIキー（無ければ空＝ダミー応答） | 任意 |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | 任意 |
| `STRIPE_SECRET_KEY` | Stripeキー（無ければ空＝ダミー決済） | 任意 |
| `STRIPE_PRICE_ID` | 月額プランのPrice ID | 任意 |
| `STRIPE_PRICE_ID_6MO` | 6ヶ月パックのPrice ID | 任意 |
| `STRIPE_WEBHOOK_SECRET` | Webhook署名シークレット | 任意 |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | メール送信設定（無ければ空＝リンクをログ表示） | 任意 |

5. **Deploy** を押す
   - `postinstall` で Prisma Client が生成され、`build` でビルドされます
   - 初回ビルドが成功すれば `https://nurse-support1-xxx.vercel.app` のようなURLが発行されます

---

## 4. 本番DBにテーブル作成 + 初期データ投入

ビルドは通っても、**まだ本番DBは空**です。一度だけマイグレーション＋シードを流します。

ローカルのターミナルで、Neonの接続文字列を使って実行します：

```bash
# プロジェクトディレクトリで
export DATABASE_URL="（Neonの接続文字列）"
npx prisma migrate deploy   # テーブル作成
npx prisma db seed          # 初期データ（お題・質問・設定・デモアカウント）
```

> 💡 シードには `admin@example.com` 等のデモアカウントが含まれます。**本番ではパスワードを変更するか、デモアカウントを削除**してください（管理画面のユーザー管理から削除可能）。

---

## 5. 動作確認

1. 発行されたURLにアクセス → ランディングページが表示される
2. 新規登録 → メール確認（SMTP未設定なら画面にリンク表示）
3. ログイン → ダッシュボード
4. 管理者でログイン → `/admin/dashboard`

---

## 独自ドメイン（任意・スマホアプリ化の前提）

1. Vercelの **Settings → Domains** で独自ドメインを追加（例 `akari-nurse.jp`）
2. ドメインのDNSにVercelが指定するレコードを設定
3. ドメイン確定後、`NEXT_PUBLIC_APP_URL` をそのドメインに更新して再デプロイ
   - メール内リンク・各種URLが正しいドメインになります

---

## 注意点

- **マイグレーションはビルドに含めていません**（自動実行はDB接続が不安定になりがちなため）。スキーマを変更したら、手順4の `prisma migrate deploy` を都度実行してください。
- **本番の `AUTH_SECRET` はローカルと別の値**にしてください。
- Stripe を本番で使う場合は、テストキーではなく**本番キー**＋本番Webhookエンドポイント（`https://<本番URL>/api/billing/webhook`）の登録が必要です。
- AIキー（Anthropic）を設定すると従量課金が発生します。管理画面の「利用上限」で1日あたりの回数を絞れます。

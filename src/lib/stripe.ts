import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// Stripeキーが設定されているときだけ実クライアントを生成する。
// 未設定時はダミー決済（即時アップグレード）にフォールバックし、キー無しでも
// 課金フローのUI/挙動を確認できるようにする。
export const stripe = secretKey ? new Stripe(secretKey) : null;
export const stripeEnabled = Boolean(stripe);

// 月額サブスクに使う Stripe Price ID（本番のみ必要）。
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

// 6ヶ月パック（買い切り・1回払い）に使う Stripe Price ID（本番のみ必要）。
export const STRIPE_PRICE_ID_6MO = process.env.STRIPE_PRICE_ID_6MO || "";

// Webhook 署名シークレット（本番のみ必要）。
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

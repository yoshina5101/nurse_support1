import { cookies } from "next/headers";

// アプリ（Google Play / TWA）経由のアクセスかどうかを判定する。
// TWAの起動URLに ?mode=app を付けておき、middleware が app_mode Cookie を
// 立てる。本ヘルパーはその Cookie を読む。
// アプリ内ではGoogle Playの課金ルールに抵触しないよう、価格・購入導線を隠す。
export async function isAppMode(): Promise<boolean> {
  const store = await cookies();
  return store.get("app_mode")?.value === "1";
}

export const APP_MODE_COOKIE = "app_mode";

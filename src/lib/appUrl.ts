import { headers } from "next/headers";

// リクエストヘッダ（またはNEXT_PUBLIC_APP_URL）からアプリのベースURLを得る。
// メール内リンクの生成に使う。
export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

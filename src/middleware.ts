import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Edge 安全な設定のみで NextAuth を初期化（Prisma / bcrypt を含まない）
const { auth } = NextAuth(authConfig);

// ログイン済みならダッシュボードへ飛ばす「認証ページ」
const AUTH_PAGES = ["/login", "/register"];
// 誰でもアクセスできる「公開ページ」（法務・メール確認・パスワード再設定・Webhook 等）
const PUBLIC_PREFIXES = [
  "/legal",
  "/api/billing/webhook",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  // アプリ（TWA）判定：?mode=app で app_mode Cookie を立て、?mode=web で消す。
  // どの応答を返す場合でもこのCookie操作を反映できるよう、ヘルパーで包む。
  const modeParam = req.nextUrl.searchParams.get("mode");
  const applyMode = (res: ReturnType<typeof NextResponse.next>) => {
    if (modeParam === "app") {
      res.cookies.set("app_mode", "1", {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      });
    } else if (modeParam === "web") {
      res.cookies.delete("app_mode");
    }
    return res;
  };

  // PWA・SEO・静的アセット（マニフェスト/アイコン/SW/OGP/robots/sitemap 等）は
  // 誰でもアクセス可（クローラ・SNSがアクセスできるように）。
  const isStaticAsset =
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/opengraph-image" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(png|ico|svg|jpg|jpeg|webp|txt|xml)$/.test(pathname);

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isPublic =
    pathname === "/" ||
    isStaticAsset ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  // 公開ページは常に許可（トップのランディングページ含む）
  if (isPublic) return applyMode(NextResponse.next());

  // 未ログインで保護ページにアクセス → ログインへ
  if (!isLoggedIn && !isAuthPage) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return applyMode(NextResponse.redirect(url));
  }

  // ログイン済みでログイン/登録ページ → ダッシュボードへ
  if (isLoggedIn && isAuthPage) {
    const dest = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    return applyMode(NextResponse.redirect(new URL(dest, req.nextUrl.origin)));
  }

  // 管理画面は ADMIN のみ
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return applyMode(NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin)));
  }

  return applyMode(NextResponse.next());
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

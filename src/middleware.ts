import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Edge 安全な設定のみで NextAuth を初期化（Prisma / bcrypt を含まない）
const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // 未ログインで保護ページにアクセス → ログインへ
  if (!isLoggedIn && !isPublic) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // ログイン済みでログイン/登録ページ → ダッシュボードへ
  if (isLoggedIn && isPublic) {
    const dest = role === "ADMIN" ? "/admin/users" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  // 管理画面は ADMIN のみ
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

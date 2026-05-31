import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// クローラ向け設定。公開ページは許可し、ログイン後・API・管理画面は除外。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard",
        "/applications",
        "/self-analysis",
        "/resume",
        "/essay",
        "/interview",
        "/chat",
        "/contents",
        "/billing",
        "/verify-email",
        "/reset-password",
        "/forgot-password",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
